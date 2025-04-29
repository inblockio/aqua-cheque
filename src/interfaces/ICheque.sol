// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ICheque {
    /// @notice ChequeId is a unique identifier for a cheque trigger
    type ChequeId is uint256;

    struct DataWithId {
        ChequeId chequeId;
        bytes data;
    }

    struct Cheque {
        address sender;
        address receiver;
        uint256 amount;
        string note;
        bool isPaid;
        string aquaTree;
        string formContent;
        string level;
        bool levelOneVerified;
        bool levelTwoVerified;
        bool isCancelled;
    }

    struct ChequeInfo {
        ChequeId chequeId;
        bytes data;
    }

    event ChequeDeposited(ChequeId chequeId, bytes data);
    event ChequePaid(uint256 chequeId, address indexed receiver, uint256 amount);
    event FundsReceived(address indexed sender, uint256 amount);
    event LevelOneVerified(uint256 indexed chequeId);
    event LevelTwoVerified(uint256 indexed chequeId);
    event ChequeCancelled(uint256 indexed chequeId);
    event ChequeReceiverUpdated(uint256 indexed chequeId, string newReceiver);

    function depositCheque(
        string memory sender,
        string memory receiver,
        uint256 amount,
        string memory note,
        string memory aquaTree,
        string memory formContent,
        string memory level
    ) external;

    function updateChequeReceiver(uint256 _chequeId, string memory _receiver) external;
    function verifyLevelOne(uint256 _chequeId) external;
    function verifyLevelTwo(uint256 _chequeId) external;
    function cancelCheque(uint256 _chequeId) external;
    function payCheque(uint256 _chequeId, address payable recipientAddress) external;
    function getBalance() external view returns (uint256);
    function owner() external view returns (address);
    function chequeCounter() external view returns (uint256);

    function cheques(uint256 _chequeId) external view returns (
        string memory sender,
        string memory receiver,
        uint256 amount,
        string memory note,
        bool isPaid,
        string memory aquaTree,
        string memory formContent,
        string memory level,
        bool levelOneVerified,
        bool levelTwoVerified,
        bool isCancelled
    );
}
