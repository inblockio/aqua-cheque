// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {IWavsServiceManager} from "@wavs/interfaces/IWavsServiceManager.sol";
import {ICheque} from "interfaces/ICheque.sol";

/**
 * @title VerificationTrigger
 * @notice This contract handles verification of Aqua form data for cheques
 * @dev It serves as Trigger 2 in the Aqua Cheque Protocol flow
 */
contract VerificationTrigger {
    address public owner;
    IWavsServiceManager private _serviceManager;
    address public chequeContract;

    // Mapping to track verification requests
    mapping(bytes32 => bool) public pendingVerifications;
    mapping(bytes32 => VerificationRequest) public verificationRequests;

    struct VerificationRequest {
        ICheque.ChequeId chequeId;
        string aquaTreeHash;
        string formRevisionHash;
        address requester;
        bool isProcessed;
    }

    // Events
    event VerificationRequested(
        bytes32 indexed requestId,
        ICheque.ChequeId chequeId, 
        string aquaTreeHash,
        string formRevisionHash
    );
    
    event VerificationProcessed(
        bytes32 indexed requestId,
        ICheque.ChequeId chequeId,
        bool success
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    modifier onlyChequeContract() {
        require(msg.sender == chequeContract, "Only cheque contract can call");
        _;
    }

    constructor(IWavsServiceManager serviceManager, address _chequeContract) {
        _serviceManager = serviceManager;
        chequeContract = _chequeContract;
        owner = msg.sender;
    }

    /**
     * @notice Update the cheque contract address
     * @param _chequeContract New address of the cheque contract
     */
    function setChequeContract(address _chequeContract) external onlyOwner {
        require(_chequeContract != address(0), "Invalid address");
        chequeContract = _chequeContract;
    }

    /**
     * @notice Request verification of cheque data
     * @param chequeId The ID of the cheque to verify
     * @param aquaTreeHash Hash of the Aqua tree structure
     * @param formRevisionHash Hash of the form revision
     * @return requestId Unique ID for this verification request
     */
    function requestVerification(
        ICheque.ChequeId chequeId,
        string calldata aquaTreeHash,
        string calldata formRevisionHash
    ) external returns (bytes32 requestId) {
        // Generate a unique requestId using keccak256
        requestId = keccak256(abi.encodePacked(
            chequeId,
            aquaTreeHash,
            formRevisionHash,
            block.timestamp,
            msg.sender
        ));
        
        // Make sure this request ID is unique
        require(!pendingVerifications[requestId], "Request already exists");
        
        // Store verification request
        pendingVerifications[requestId] = true;
        verificationRequests[requestId] = VerificationRequest({
            chequeId: chequeId,
            aquaTreeHash: aquaTreeHash,
            formRevisionHash: formRevisionHash,
            requester: msg.sender,
            isProcessed: false
        });
        
        // Emit event that WAVS will listen for
        emit VerificationRequested(requestId, chequeId, aquaTreeHash, formRevisionHash);
        
        return requestId;
    }
    
    /**
     * @notice Process verification result from WAVS
     * @param requestId The ID of the verification request
     * @param success Whether verification was successful
     * @param signature WAVS signature proving verification
     */
    function processVerificationResult(
        bytes32 requestId, 
        bool success,
        bytes calldata signature
    ) external {
        // Check that the request exists and is pending
        require(pendingVerifications[requestId], "Request not found");
        VerificationRequest storage request = verificationRequests[requestId];
        require(!request.isProcessed, "Request already processed");
        
        // Validate the signature from WAVS service
        bytes memory data = abi.encode(requestId, success);
        _serviceManager.validate(data, signature);
        
        // Mark as processed
        request.isProcessed = true;
        pendingVerifications[requestId] = false;
        
        // Emit processed event
        emit VerificationProcessed(requestId, request.chequeId, success);
    }
    
    /**
     * @notice Get verification request details
     * @param requestId The ID of the verification request
     * @return Request details
     */
    function getVerificationRequest(bytes32 requestId) 
        external 
        view 
        returns (VerificationRequest memory) 
    {
        return verificationRequests[requestId];
    }
    
    /**
     * @notice Check if a verification request exists and is pending
     * @param requestId The ID of the verification request
     * @return True if pending, false otherwise
     */
    function isVerificationPending(bytes32 requestId) external view returns (bool) {
        return pendingVerifications[requestId];
    }
} 