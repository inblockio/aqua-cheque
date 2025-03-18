// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {Test} from "forge-std/Test.sol";
import {ChequeTrigger} from "contracts/ChequeWavsTrigger.sol";
import {ICheque} from "interfaces/ICheque.sol";

contract TriggerTest is Test {
    ChequeTrigger public chequeTrigger;

    string public sender;
    string public receiver;

    function setUp() public {
        chequeTrigger = new ChequeTrigger();

        sender = "0x254B0D7b63342Fcb89555DB82e95C21d72EFdB6f"; // vm.addr(1);
        receiver = "0x2EDf2536e4Df3f6e1BFd94054c3E91baf34E10d8"; // vm.addr(2);
    }

    function testChequeTrigger() public {
        string memory aquaTree = "{}";
        string memory formContent = "{}";
        chequeTrigger.addTrigger(
            sender,
            receiver,
            1,
            "Rug the contract",
            aquaTree,
            formContent
        );

        ICheque.ChequeId chequeId = ICheque.ChequeId.wrap(1);
        ICheque.ChequeInfo memory chequeInfo = chequeTrigger.getChequeInfo(
            chequeId
        );

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
