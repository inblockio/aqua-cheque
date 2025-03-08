// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Cheques {
    address public owner;

    struct Cheque {
        address sender;
        address receiver;
        uint256 amount;
        string note;
        bool isPaid;
    }

    mapping(uint256 => Cheque) public cheques;
    uint256 public chequeCounter;

    event ChequeDeposited(
        uint256 chequeId,
        address indexed sender,
        address indexed receiver,
        uint256 amount,
        string note
    );
    event ChequePaid(
        uint256 chequeId,
        address indexed receiver,
        uint256 amount
    );
    event FundsReceived(address indexed sender, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    constructor(address _owner) {
        require(_owner != address(0), "Owner cannot be zero address");
        owner = _owner;
    }

    // Function to deposit a cheque
    function depositCheque(
        address _receiver,
        string memory _note
    ) external payable {
        require(msg.value > 0, "Cheque amount must be greater than zero");

        cheques[chequeCounter] = Cheque({
            sender: msg.sender,
            receiver: _receiver,
            amount: msg.value,
            note: _note,
            isPaid: false
        });

        emit ChequeDeposited(
            chequeCounter,
            msg.sender,
            _receiver,
            msg.value,
            _note
        );
        chequeCounter++;
    }

    // Function for the owner to pay a cheque
    function payCheque(uint256 _chequeId) external onlyOwner {
        Cheque storage cheque = cheques[_chequeId];
        require(!cheque.isPaid, "Cheque already paid");
        require(address(this).balance >= cheque.amount, "Insufficient balance");

        cheque.isPaid = true;
        payable(cheque.receiver).transfer(cheque.amount);

        emit ChequePaid(_chequeId, cheque.receiver, cheque.amount);
    }

    // Function to get contract balance
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    // Function to allow anyone to send ETH directly to the contract
    receive() external payable {
        emit FundsReceived(msg.sender, msg.value);
    }

    // Fallback function (in case non-matching calls are made)
    fallback() external payable {
        emit FundsReceived(msg.sender, msg.value);
    }
}
