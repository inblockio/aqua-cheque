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

        // ChequeContract submit = ChequeContract(
        //     vm.parseAddress(serviceHandlerAddr)
        // );

        ChequeContract submit = ChequeContract(
            payable(vm.parseAddress(serviceHandlerAddr))
        );

        ChequeTrigger trigger = ChequeTrigger(
            vm.parseAddress(serviceTriggerAddr)
        );

        ICheque.ChequeId triggerId = trigger.nextChequeId();

        console.log(
            "Fetching data for cheque TriggerId",
            ICheque.ChequeId.unwrap(triggerId)
        );

        ICheque.ChequeId counter = ICheque.ChequeId.wrap(1);

        ICheque.ChequeInfo memory _checkInfo = trigger.getChequeInfo(triggerId);
        // ICheque.ChequeInfo memory _checkInfo = submit.getCheque(counter);
        bytes memory data = abi.encode(_checkInfo);
        // console.log("Data:", string(_checkInfo.data));
        ICheque.Cheque memory decodedData = abi.decode(
            _checkInfo.data,
            (ICheque.Cheque)
        );

        console.log("Cheque ID:", ICheque.ChequeId.unwrap(_checkInfo.chequeId));
        console.log("Cheque Sender:", decodedData.sender);
        console.log("Cheque Receiver:", decodedData.receiver);
        console.log("Cheque Amount:", decodedData.amount);
        console.log("Cheque Note:", decodedData.note);
        console.log("Cheque isPaid:", decodedData.isPaid);

        vm.stopBroadcast();
    }
}
