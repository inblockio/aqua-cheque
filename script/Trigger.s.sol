// SPDX-License-Identifier: MIT
pragma solidity 0.8.22;

import {ChequeTrigger} from "contracts/ChequeWavsTrigger.sol";
import {ICheque} from "interfaces/ICheque.sol";
import {Common} from "script/Common.s.sol";
import {console} from "forge-std/console.sol";

/// @dev Script to add a new trigger
contract Trigger is Common {
    function run(
        string calldata serviceTriggerAddr,
        string calldata coinMarketCapID
    ) public {
        vm.startBroadcast(_privateKey);

        address sender = vm.addr(1);
        address receiver = vm.addr(2);

        ChequeTrigger trigger = ChequeTrigger(
            vm.parseAddress(serviceTriggerAddr)
        );

        // TODO: Update this to the right information
        // trigger.addTrigger(abi.encodePacked(coinMarketCapID));
        trigger.addTrigger(sender, receiver, 1, "Rug the contract 2=====");

        ICheque.ChequeId triggerId = trigger.nextChequeId();
        console.log("Cheque TriggerId", ICheque.ChequeId.unwrap(triggerId));
        vm.stopBroadcast();
    }
}
