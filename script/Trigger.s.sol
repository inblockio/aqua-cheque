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
        ChequeTrigger trigger = ChequeTrigger(
            vm.parseAddress(serviceTriggerAddr)
        );

        // TODO: Update this to the right information
        trigger.addTrigger(abi.encodePacked(coinMarketCapID));

        ICheque.ChequeId triggerId = trigger.nextChequeId();
        console.log("Cheque TriggerId", ITypes.TriggerId.unwrap(triggerId));
        vm.stopBroadcast();
    }
}
