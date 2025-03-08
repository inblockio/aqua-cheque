// SPDX-License-Identifier: MIT
pragma solidity 0.8.22;

import {ICheque} from "interfaces/ICheque.sol";

contract ChequeTrigger {
    ICheque.ChequeId public nextChequeId;

    /// @notice Mapping of cheques
    mapping(ICheque.ChequeId _chequeId => ICheque.Cheque _trigger)
        public chequesById;

    // @inheritdoc ISimpleTrigger
    function addTrigger(
        address sender,
        address receiver,
        uint256 amount,
        string memory note,
        bytes memory aquaTree,
        bytes memory formContent
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
            isPaid: false,
            aquaTree: aquaTree,
            formContent: formContent
        });

        // Update storages
        chequesById[_chequeId] = _trigger;
        // _triggerIdsByCreator[msg.sender].push(_chequeId);

        ICheque.ChequeInfo memory _triggerInfo = ICheque.ChequeInfo({
            chequeId: _chequeId,
            data: abi.encode(_trigger)
        });

        // emit NewTrigger(abi.encode(_triggerInfo));
        emit ICheque.ChequeDeposited(_chequeId, abi.encode(_triggerInfo));
    }

    // function nextTriggerId() external view returns (ICheque.ChequeId memory _chequeId){
    //     return this.nextChequeId;
    // }

    function nextTriggerId() external view returns (ICheque.ChequeId) {
        return nextChequeId; // Correct function call
    }

    function getChequeInfo(
        ICheque.ChequeId chequeId
    ) external view returns (ICheque.ChequeInfo memory _chequeInfo) {
        ICheque.Cheque storage _cheque = chequesById[chequeId];
        _chequeInfo = ICheque.ChequeInfo({
            chequeId: chequeId,
            data: abi.encode(_cheque)
        });
    }

    // @inheritdoc ISimpleTrigger
    // function triggerIdsByCreator(
    //     address _creator
    // ) external view returns (ICheque.ChequeId[] memory _triggerIds) {
    //     _triggerIds = _triggerIdsByCreator[_creator];
    // }
}
