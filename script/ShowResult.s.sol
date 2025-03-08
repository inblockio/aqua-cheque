// // SPDX-License-Identifier: MIT
// pragma solidity 0.8.22;

// import {ChequeTrigger} from "contracts/ChequeWavsTrigger.sol";
// import {ChequeContract} from "contracts/Cheque.sol";
// import {ICheque} from "interfaces/ICheque.sol";
// import {Common} from "script/Common.s.sol";
// import {console} from "forge-std/console.sol";

// /// @dev Script to show the result of a trigger
// contract ShowResult is Common {
//     function run(string calldata serviceTriggerAddr, string calldata serviceHandlerAddr) public {
//         vm.startBroadcast(_privateKey);
//         ChequeTrigger trigger = ChequeTrigger(vm.parseAddress(serviceTriggerAddr));
//         ChequeContract submit = ChequeContract(vm.parseAddress(serviceHandlerAddr));

//         ICheque.ChequeId triggerId = trigger.nextChequeId();
//         console.log("Fetching data for cheque TriggerId", ICheque.ChequeId.unwrap(triggerId));

//         bytes memory data = submit.getCheque(triggerId);
//         console.log("Data:", string(data));

//         vm.stopBroadcast();
//     }
// }
