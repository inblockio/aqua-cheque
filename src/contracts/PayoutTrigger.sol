// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {IWavsServiceManager} from "@wavs/interfaces/IWavsServiceManager.sol";
import {ICheque} from "interfaces/ICheque.sol";
import {ChequeContract} from "./Cheque.sol";

/**
 * @title PayoutTrigger
 * @notice This contract handles the payout process for verified cheques
 * @dev It serves as Trigger 3 in the Aqua Cheque Protocol flow
 */
contract PayoutTrigger {
    address public owner;
    IWavsServiceManager private _serviceManager;
    ChequeContract public chequeContract;

    // Track payout requests
    mapping(bytes32 => bool) public pendingPayouts;
    mapping(bytes32 => PayoutRequest) public payoutRequests;

    struct PayoutRequest {
        ICheque.ChequeId chequeId;
        address payable recipient;
        bool isProcessed;
        bool wasSuccessful;
    }

    // Events
    event PayoutRequested(
        bytes32 indexed requestId,
        ICheque.ChequeId chequeId,
        address recipient
    );
    
    event PayoutProcessed(
        bytes32 indexed requestId,
        ICheque.ChequeId chequeId,
        address recipient,
        bool success
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    constructor(IWavsServiceManager serviceManager, address _chequeContract) {
        _serviceManager = serviceManager;
        chequeContract = ChequeContract(payable(_chequeContract));
        owner = msg.sender;
    }

    /**
     * @notice Update the cheque contract address
     * @param _chequeContract New address of the cheque contract
     */
    function setChequeContract(address _chequeContract) external onlyOwner {
        require(_chequeContract != address(0), "Invalid address");
        chequeContract = ChequeContract(payable(_chequeContract));
    }

    /**
     * @notice Request payout for a verified cheque
     * @param chequeId The ID of the cheque to pay out
     * @param recipient Address to receive payment
     * @return requestId Unique ID for this payout request
     */
    function requestPayout(
        ICheque.ChequeId chequeId,
        address payable recipient
    ) external returns (bytes32 requestId) {
        // Convert ChequeId to uint256
        uint256 chequeIdValue = ICheque.ChequeId.unwrap(chequeId);
        
        // Verify that the cheque exists and is verified
        require(chequeIdValue <= chequeContract.getChequesCount(), "Cheque doesn't exist");
        require(chequeContract.isVerified(chequeIdValue), "Cheque not verified");
        
        // Generate a unique requestId
        requestId = keccak256(abi.encodePacked(
            chequeId,
            recipient,
            block.timestamp,
            msg.sender
        ));
        
        // Ensure uniqueness
        require(!pendingPayouts[requestId], "Request already exists");
        
        // Store payout request
        pendingPayouts[requestId] = true;
        payoutRequests[requestId] = PayoutRequest({
            chequeId: chequeId,
            recipient: recipient,
            isProcessed: false,
            wasSuccessful: false
        });
        
        // Emit event that WAVS will listen for
        emit PayoutRequested(requestId, chequeId, recipient);
        
        return requestId;
    }
    
    /**
     * @notice Process payout result from WAVS
     * @param requestId The ID of the payout request
     * @param signature WAVS signature proving the request is valid
     */
    function processPayout(
        bytes32 requestId,
        bytes calldata signature
    ) external returns (bool success) {
        // Check that the request exists and is pending
        require(pendingPayouts[requestId], "Request not found");
        PayoutRequest storage request = payoutRequests[requestId];
        require(!request.isProcessed, "Request already processed");
        
        // Validate the signature from WAVS service
        bytes memory data = abi.encode(requestId);
        _serviceManager.validate(data, signature);
        
        // Process the payout
        uint256 chequeIdValue = ICheque.ChequeId.unwrap(request.chequeId);
        
        try chequeContract.payCheque(chequeIdValue, request.recipient) {
            success = true;
        } catch {
            success = false;
        }
        
        // Update request status
        request.isProcessed = true;
        request.wasSuccessful = success;
        pendingPayouts[requestId] = false;
        
        // Emit event for payout result
        emit PayoutProcessed(requestId, request.chequeId, request.recipient, success);
        
        return success;
    }
    
    /**
     * @notice Get payout request details
     * @param requestId The ID of the payout request
     * @return Request details
     */
    function getPayoutRequest(bytes32 requestId) 
        external 
        view 
        returns (PayoutRequest memory) 
    {
        return payoutRequests[requestId];
    }
    
    /**
     * @notice Check if a payout request is pending
     * @param requestId The ID of the payout request
     * @return True if pending, false otherwise
     */
    function isPayoutPending(bytes32 requestId) external view returns (bool) {
        return pendingPayouts[requestId];
    }
} 