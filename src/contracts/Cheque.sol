// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {IWavsServiceManager} from "@wavs/interfaces/IWavsServiceManager.sol";
import {IWavsServiceHandler} from "@wavs/interfaces/IWavsServiceHandler.sol";
import {ICheque} from "interfaces/ICheque.sol";

contract ChequeContract is IWavsServiceHandler {
    address public owner;

    /// @notice Service manager instance
    IWavsServiceManager private _serviceManager;

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
        address _receiver,
        string memory _note,
        uint256 amount
    ) external payable {
        // require(msg.value > 0, "Cheque amount must be greater than zero");

        cheques[chequeCounter] = ICheque.Cheque({
            sender: msg.sender,
            receiver: _receiver,
            // amount: msg.value,
            amount: amount,
            note: _note,
            isPaid: false
        });

        emit ICheque.ChequeDeposited(
            chequeCounter,
            msg.sender,
            _receiver,
            // msg.value,
            amount,
            _note
        );
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

        // _signatures[dataWithId.triggerId] = _signature;
        // _datas[dataWithId.triggerId] = dataWithId.data;
        // _validTriggers[dataWithId.triggerId] = true;
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

    // Function to get contract balance
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    // Function to allow anyone to send ETH directly to the contract
    receive() external payable {
        emit ICheque.FundsReceived(msg.sender, msg.value);
    }

    // Fallback function (in case non-matching calls are made)
    fallback() external payable {
        emit ICheque.FundsReceived(msg.sender, msg.value);
    }
}
