// SPDX-License-Identifier: MIT
pragma solidity 0.8.22;

import {Test} from "forge-std/Test.sol";
import {ChequeTrigger} from "contracts/ChequeWavsTrigger.sol";
import {ICheque} from "interfaces/ICheque.sol";

contract TriggerTest is Test {
    ChequeTrigger public chequeTrigger;

    address public sender;
    address public receiver;

    function setUp() public {
        chequeTrigger = new ChequeTrigger();

        sender = vm.addr(1);
        receiver = vm.addr(2);
    }

    function testChequeTrigger() public {
        chequeTrigger.addTrigger(sender, receiver, 1, "Rug the contract");

        ICheque.ChequeId chequeId = ICheque.ChequeId.wrap(1);
        ICheque.ChequeInfo memory chequeInfo = chequeTrigger.getChequeInfo(
            chequeId
        );

        // ✅ Fix: Change `storage` to `memory`
        ICheque.Cheque memory _cheque = abi.decode(
            chequeInfo.data,
            (ICheque.Cheque) // Ensure the struct type matches exactly
        );

        assertEq(_cheque.sender, sender);
        assertEq(_cheque.note, "Rug the contract");
        assertEq(
            ICheque.ChequeId.unwrap(chequeInfo.chequeId),
            ICheque.ChequeId.unwrap(chequeId)
        );
    }
}
