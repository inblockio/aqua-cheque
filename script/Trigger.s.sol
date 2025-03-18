// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {ChequeTrigger} from "contracts/ChequeWavsTrigger.sol";
import {ICheque} from "interfaces/ICheque.sol";
import {Common} from "script/Common.s.sol";
// solhint-disable-next-line no-console
import {console} from "forge-std/console.sol";

/// @dev Script to add a new trigger
contract Trigger is Common {
    function run(
        string calldata serviceTriggerAddr,
        string calldata coinMarketCapID
    ) public {
        vm.startBroadcast(_privateKey);

        string memory sender = "0x254B0D7b63342Fcb89555DB82e95C21d72EFdB6f"; // vm.addr(1);
        string memory receiver = "0x2EDf2536e4Df3f6e1BFd94054c3E91baf34E10d8"; // vm.addr(2);

        ChequeTrigger trigger = ChequeTrigger(
            vm.parseAddress(serviceTriggerAddr)
        );
        string memory aquaTree = "{}";
        string memory formContent = "{}";
        // TODO: Update this to the right information
        // trigger.addTrigger(abi.encodePacked(coinMarketCapID));
        trigger.addTrigger(
            sender,
            receiver,
            10,
            "Rug the contract 2=====",
            aquaTree,
            formContent
        );

        ICheque.ChequeId triggerId = trigger.nextChequeId();
        // solhint-disable-next-line no-console
        console.log("Cheque TriggerId", ICheque.ChequeId.unwrap(triggerId));
        vm.stopBroadcast();
    }
}
