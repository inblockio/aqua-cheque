// SPDX-License-Identifier: MIT
pragma solidity 0.8.22;

import {ICheque} from "interfaces/ICheque.sol";

contract ChequeTrigger {
    ICheque.ChequeId public nextChequeId;

    mapping(ICheque.ChequeId _chequeId => ICheque.Cheque _trigger)
        public chequesById;
    // @notice See ISimpleTrigger.triggerIdsByCreator
    mapping(address _creator => ICheque.ChequeId[] _triggerIds)
        internal _triggerIdsByCreator;

    // @inheritdoc ISimpleTrigger
    function addTrigger(
        address sender,
        address receiver,
        uint256 amount,
        string memory note
    ) external {
        // Get the next trigger id
        nextChequeId = ICheque.ChequeId.wrap(
            ICheque.ChequeId.unwrap(nextChequeId) + 1
        );
        ICheque.ChequeId _chequeId = nextChequeId;

        // Create the trigger
        ICheque.Cheque memory _trigger = ICheque.Cheque({
            sender: sender,
            receiver: receiver,
            amount: amount,
            note: note,
            isPaid: false
        });

        // Update storages
        chequesById[_chequeId] = _trigger;
        _triggerIdsByCreator[msg.sender].push(_chequeId);

        // ICheque.ChequeInfo memory _triggerInfo = ICheque.ChequeInfo({
        //     chequeId: _chequeId,
        //     sender: sender,
        //     receiver: receiver,
        //     amount: amount,
        //     note: note,
        //     isPaid: false
        // });
        
        // uint256 chequeId = uint256(_chequeId);
        // emit NewTrigger(abi.encode(_triggerInfo));
        emit ICheque.ChequeDeposited(
             ICheque.ChequeId.unwrap(_chequeId),
            sender,
            receiver,
            amount,
            note
        );
    }

    function getChequeInfo(
        ICheque.ChequeId chequeId
    ) external view returns (ICheque.ChequeInfo memory _chequeInfo) {
        ICheque.Cheque storage _cheque = chequesById[chequeId];
        _chequeInfo = ICheque.ChequeInfo({
            chequeId: chequeId,
            sender: _cheque.sender,
            receiver: _cheque.receiver,
            amount: _cheque.amount,
            note: _cheque.note,
            isPaid: _cheque.isPaid
        });
    }

    // @inheritdoc ISimpleTrigger
    function triggerIdsByCreator(
        address _creator
    ) external view returns (ICheque.ChequeId[] memory _triggerIds) {
        _triggerIds = _triggerIdsByCreator[_creator];
    }
}
