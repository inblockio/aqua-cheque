// SPDX-License-Identifier: MIT
pragma solidity 0.8.22;

import {ChequeTrigger} from "contracts/ChequeWavsTrigger.sol";
import {IWavsServiceManager} from "@wavs/interfaces/IWavsServiceManager.sol";
import {ChequeContract} from "contracts/Cheque.sol";
import {ICheque} from "interfaces/ICheque.sol";
import {Common} from "script/Common.s.sol";
import {console} from "forge-std/console.sol";

/// @dev Script to show the result of a trigger
contract ShowResult is Common {
    function run(
        string calldata serviceTriggerAddr,
        string calldata serviceHandlerAddr
    ) public {
        vm.startBroadcast(_privateKey);

        ChequeContract submit = new ChequeContract(
            IWavsServiceManager(vm.parseAddress(serviceHandlerAddr))
        );
        ChequeTrigger trigger = new ChequeTrigger();

        ICheque.ChequeId triggerId = trigger.nextChequeId();
        console.log(
            "Fetching data for cheque TriggerId",
            ICheque.ChequeId.unwrap(triggerId)
        );
        ICheque.ChequeInfo memory _checkInfo = submit.getCheque(triggerId);
        bytes memory data = abi.encode(_checkInfo);
        console.log("Data:", string(_checkInfo.data));
        console.log("Cheque ID:", ICheque.ChequeId.unwrap(_checkInfo.chequeId));

        vm.stopBroadcast();
    }
}
