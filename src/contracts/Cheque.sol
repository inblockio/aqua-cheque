// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {IWavsServiceManager} from "@wavs/interfaces/IWavsServiceManager.sol";
import {IWavsServiceHandler} from "@wavs/interfaces/IWavsServiceHandler.sol";
import {ICheque} from "../interfaces/ICheque.sol";

contract ChequeContract is IWavsServiceHandler {
    address public owner;
    
    /// @notice Authorized accounts that can register cheques
    mapping(address => bool) public authorizedRegistrars;

    /// @notice Service manager instance
    IWavsServiceManager private _serviceManager;

    /// @notice Mapping of cheques
    mapping(ICheque.ChequeId _chequeId => ICheque.Cheque _trigger)
        public chequesById;

    /// @notice Mapping of trigger signatures
    mapping(ICheque.ChequeId _chequeId => bytes _signature)
        internal _signatures;

    mapping(ICheque.ChequeId _chequeId => bytes _chequeData)
        internal _chequesData;

    mapping(uint256 => ICheque.Cheque) public cheques;

    uint256 public chequeCounter;

    // Status tracking for verification results
    mapping(uint256 => bool) public verifiedCheques;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    modifier onlyAuthorized() {
        require(authorizedRegistrars[msg.sender] || msg.sender == owner, "Not authorized to register cheques");
        _;
    }

    constructor(IWavsServiceManager serviceManager) {
        _serviceManager = serviceManager;
        owner = msg.sender;
        // Auto-authorize the deployer
        authorizedRegistrars[msg.sender] = true;
    }

    /**
     * @notice Add an authorized account that can register cheques
     * @param _account Address to authorize
     */
    function addAuthorizedRegistrar(address _account) external onlyOwner {
        authorizedRegistrars[_account] = true;
    }

    /**
     * @notice Remove an authorized account
     * @param _account Address to remove authorization from
     */
    function removeAuthorizedRegistrar(address _account) external onlyOwner {
        require(_account != owner, "Cannot remove owner");
        authorizedRegistrars[_account] = false;
    }

    /**
     * @notice Function to deposit a cheque - Trigger 1: Registration
     * @param sender The sender's identifier
     * @param _receiver The receiver's identifier
     * @param amount The amount of the cheque
     * @param _note Additional note for the cheque
     * @param aquaTree The Aqua tree hash
     * @param formContent The form content hash
     * @param level The level of verification
     */
    function depositCheque(
        string memory sender,
        string memory _receiver,
        uint256 amount,
        string memory _note,
        string memory aquaTree,
        string memory formContent,
        string memory level
    ) external onlyAuthorized {
        ICheque.Cheque memory _cheque = ICheque.Cheque({
            sender: sender,
            receiver: _receiver,
            amount: amount,
            note: _note,
            isPaid: false,
            aquaTree: aquaTree,
            formContent: formContent,
            level: level,
            levelOneVerified: false,
            levelTwoVerified: false,
            isCancelled: false
        });

        chequeCounter++;
        cheques[chequeCounter] = _cheque;
        
        // Convert to ChequeId type
        ICheque.ChequeId chequeId = ICheque.ChequeId.wrap(chequeCounter);
        chequesById[chequeId] = _cheque;
        
        // Emit event for the registration trigger
        emit ICheque.ChequeDeposited(chequeId, abi.encode(_cheque));
    }

    /**
     * @notice Update the receiver of an existing cheque
     * @param _chequeId The ID of the cheque to update
     * @param _receiver The new receiver's identifier
     */
    function updateChequeReceiver(
        uint256 _chequeId,
        string memory _receiver
    ) external onlyAuthorized {
        require(_chequeId > 0 && _chequeId <= chequeCounter, "Invalid cheque ID");
        
        // Get the cheque
        ICheque.Cheque storage cheque = cheques[_chequeId];
        
        // Ensure the cheque is not paid yet
        require(!cheque.isPaid, "Cannot update a paid cheque");
        
        // Update the receiver
        cheque.receiver = _receiver;
        
        // Also update in the chequesById mapping
        ICheque.ChequeId chequeId = ICheque.ChequeId.wrap(_chequeId);
        chequesById[chequeId].receiver = _receiver;
        
        // Emit an event for the update
        emit ChequeReceiverUpdated(_chequeId, _receiver);
    }

    /**
     * @notice Handle signed data from WAVS - Trigger 2: Verification
     * @param _data The cheque data 
     * @param _signature The signature of the data
     */
    function handleSignedData(
        bytes calldata _data,
        bytes calldata _signature
    ) external {
        // Validate the data and signature with service manager
        _serviceManager.validate(_data, _signature);

        ICheque.DataWithId memory dataWithId = abi.decode(
            _data,
            (ICheque.DataWithId)
        );

        _signatures[dataWithId.chequeId] = _signature;
        _chequesData[dataWithId.chequeId] = dataWithId.data;
        
        // Decode the cheque data
        ICheque.Cheque memory _cheque = abi.decode(
            dataWithId.data,
            (ICheque.Cheque)
        );
        
        // Get the uint value from ChequeId type
        uint256 chequeIdValue = ICheque.ChequeId.unwrap(dataWithId.chequeId);
        
        // Mark as verified
        verifiedCheques[chequeIdValue] = true;
        
        // Log verification result
        emit VerificationResult(chequeIdValue, true);
    }

    /**
     * @notice Process payment for a verified cheque - Trigger 3: Payout
     * @param _chequeId The ID of the cheque to pay
     * @param recipientAddress The address to receive payment
     */
    function payCheque(uint256 _chequeId, address payable recipientAddress) external {
        require(_chequeId > 0 && _chequeId <= chequeCounter, "Invalid cheque ID");
        ICheque.Cheque storage cheque = cheques[_chequeId];
        
        require(verifiedCheques[_chequeId], "Cheque not verified");
        require(!cheque.isPaid, "Cheque already paid");
        require(address(this).balance >= cheque.amount, "Insufficient balance");

        // Mark as paid
        cheque.isPaid = true;
        
        // Transfer funds
        recipientAddress.transfer(cheque.amount);

        // Emit payout event
        emit ICheque.ChequePaid(_chequeId, recipientAddress, cheque.amount);
    }

    /**
     * @notice Recall/cancel a cheque - Can only be done if not paid
     * @param _chequeId The ID of the cheque to recall
     */
    function recallCheque(uint256 _chequeId) external onlyAuthorized {
        require(_chequeId > 0 && _chequeId <= chequeCounter, "Invalid cheque ID");
        ICheque.Cheque storage cheque = cheques[_chequeId];
        require(!cheque.isPaid, "Cannot recall paid cheque");
        
        // Mark as paid to prevent further use
        cheque.isPaid = true;
        
        // Emit recall event
        emit ChequeRecalled(_chequeId);
    }

    /**
     * @notice Verify a cheque at level one
     * @param _chequeId The ID of the cheque to verify
     */
    function verifyLevelOne(uint256 _chequeId) external onlyAuthorized {
        require(_chequeId > 0 && _chequeId <= chequeCounter, "Invalid cheque ID");
        ICheque.Cheque storage cheque = cheques[_chequeId];
        require(!cheque.levelOneVerified, "Level one already verified");
        require(!cheque.isCancelled, "Cheque is cancelled");

        cheque.levelOneVerified = true;
        emit LevelOneVerified(_chequeId);
    }

    /**
     * @notice Verify a cheque at level two
     * @param _chequeId The ID of the cheque to verify
     */
    function verifyLevelTwo(uint256 _chequeId) external onlyAuthorized {
        require(_chequeId > 0 && _chequeId <= chequeCounter, "Invalid cheque ID");
        ICheque.Cheque storage cheque = cheques[_chequeId];
        require(cheque.levelOneVerified, "Level one not verified");
        require(!cheque.levelTwoVerified, "Level two already verified");
        require(!cheque.isCancelled, "Cheque is cancelled");

        cheque.levelTwoVerified = true;
        emit LevelTwoVerified(_chequeId);
    }

    /**
     * @notice Cancel a cheque
     * @param _chequeId The ID of the cheque to cancel
     */
    function cancelCheque(uint256 _chequeId) external onlyAuthorized {
        require(_chequeId > 0 && _chequeId <= chequeCounter, "Invalid cheque ID");
        ICheque.Cheque storage cheque = cheques[_chequeId];
        require(!cheque.isPaid, "Cannot cancel paid cheque");
        require(!cheque.isCancelled, "Cheque already cancelled");

        cheque.isCancelled = true;
        emit ChequeCancelled(_chequeId);
    }

    // View functions
    function getCheque(
        ICheque.ChequeId chequeId
    ) external view returns (ICheque.ChequeInfo memory _chequeInfo) {
        ICheque.Cheque storage _cheque = chequesById[chequeId];
        _chequeInfo = ICheque.ChequeInfo({
            chequeId: chequeId,
            data: abi.encode(_cheque)
        });
    }

    function getSignature(
        ICheque.ChequeId chequeId
    ) external view returns (bytes memory _signature) {
        bytes memory _sig = _signatures[chequeId];
        return _sig;
    }

    function getChequeData(
        ICheque.ChequeId chequeId
    ) external view returns (bytes memory _data) {
        _data = _chequesData[chequeId];
        return _data;
    }

    function isVerified(uint256 _chequeId) external view returns (bool) {
        return verifiedCheques[_chequeId];
    }

    function getChequesCount() external view returns (uint256) {
        return chequeCounter;
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    // Custom events
    event VerificationResult(uint256 indexed chequeId, bool success);
    event ChequeRecalled(uint256 indexed chequeId);
    event ChequeReceiverUpdated(uint256 indexed chequeId, string receiver);
    event LevelOneVerified(uint256 indexed chequeId);
    event LevelTwoVerified(uint256 indexed chequeId);
    event ChequeCancelled(uint256 indexed chequeId);

    // Function to allow anyone to send ETH directly to the contract
    receive() external payable {
        emit ICheque.FundsReceived(msg.sender, msg.value);
    }
}
