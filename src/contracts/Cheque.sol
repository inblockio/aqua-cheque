// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {IWavsServiceManager} from "@wavs/interfaces/IWavsServiceManager.sol";
import {IWavsServiceHandler} from "@wavs/interfaces/IWavsServiceHandler.sol";
import {ICheque} from "interfaces/ICheque.sol";

contract ChequeContract is IWavsServiceHandler {
    address public owner;

    /// @notice Service manager instance
    IWavsServiceManager private _serviceManager;

    /// @notice Mapping of cheques
    mapping(ICheque.ChequeId _chequeId => ICheque.Cheque _trigger)
        public chequesById;

    /// @notice Mapping of trigger signatures
    mapping(ICheque.ChequeId _chequeId => bytes _signature)
        internal _signatures;

    mapping(uint256 => ICheque.Cheque) public cheques;
    uint256 public chequeCounter;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    // constructor(address _owner) {
    //     require(_owner != address(0), "Owner cannot be zero address");
    //     owner = _owner;
    // }

    constructor(IWavsServiceManager serviceManager) {
        _serviceManager = serviceManager;
    }

    // Function to deposit a cheque
    function depositCheque(
        address sender,
        address _receiver,
        string memory _note,
        uint256 amount,
        bool isPaid
    ) external {
        // require(msg.value > 0, "Cheque amount must be greater than zero");
        ICheque.Cheque memory _cheque = ICheque.Cheque({
            sender: sender,
            receiver: _receiver,
            amount: amount,
            note: _note,
            isPaid: isPaid
        });

        cheques[chequeCounter] = _cheque;

        ICheque.ChequeId counter = ICheque.ChequeId.wrap(chequeCounter);
        emit ICheque.ChequeDeposited(counter, abi.encode(_cheque));
        chequeCounter++;
    }

    /// @inheritdoc IWavsServiceHandler
    function handleSignedData(
        bytes calldata _data,
        bytes calldata _signature
    ) external {
        _serviceManager.validate(_data, _signature);

        ICheque.DataWithId memory dataWithId = abi.decode(
            _data,
            (ICheque.DataWithId)
        );

        _signatures[dataWithId.chequeId] = _signature;
        // We decode the data to get a 'cheque' because it was encoded by the trigger
        ICheque.Cheque memory _cheque = abi.decode(
            dataWithId.data,
            (ICheque.Cheque)
        );
        this.depositCheque(_cheque.sender, _cheque.receiver, _cheque.note,  _cheque.amount, false);
        _signatures[dataWithId.chequeId] = _signature;
    }

    // Function for the owner to pay a cheque
    function payCheque(uint256 _chequeId) external onlyOwner {
        ICheque.Cheque storage cheque = cheques[_chequeId];
        require(!cheque.isPaid, "Cheque already paid");
        require(address(this).balance >= cheque.amount, "Insufficient balance");

        cheque.isPaid = true;
        payable(cheque.receiver).transfer(cheque.amount);

        emit ICheque.ChequePaid(_chequeId, cheque.receiver, cheque.amount);
    }

    function getCheque(
        ICheque.ChequeId chequeId
    ) external view returns (ICheque.ChequeInfo memory _chequeInfo) {
        ICheque.Cheque storage _cheque = chequesById[chequeId];
        _chequeInfo = ICheque.ChequeInfo({
            chequeId: chequeId,
            data: abi.encode(_cheque)
        });
    }

    // Function to get contract balance
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    // Function to allow anyone to send ETH directly to the contract
    receive() external payable {
        emit ICheque.FundsReceived(msg.sender, msg.value);
    }

    // Fallback function (in case non-matching calls are made)
    // Disabled this because its a global fallback payable function that cause chaos
    // fallback() external payable {
    //     emit ICheque.FundsReceived(msg.sender, msg.value);
    // }
}
