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
        // bytes aquaTree;
    }

    struct ChequeInfo {
        ChequeId chequeId;
        bytes data;
    }

    event ChequeDeposited(
        ChequeId chequeId,
        bytes data
    );

    event ChequePaid(
        uint256 chequeId,
        address indexed receiver,
        uint256 amount
    );

    event FundsReceived(address indexed sender, uint256 amount);

    function depositCheque(
        address _receiver,
        string memory _note
    ) external payable;

    function payCheque(uint256 _chequeId) external;

    function getBalance() external view returns (uint256);

    function owner() external view returns (address);

    function cheques(
        uint256 _chequeId
    )
        external
        view
        returns (
            address sender,
            address receiver,
            uint256 amount,
            string memory note,
            bool isPaid
        );

    function chequeCounter() external view returns (uint256);
}
