// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {ChequeTrigger} from "contracts/ChequeWavsTrigger.sol";
import {IWavsServiceManager} from "@wavs/interfaces/IWavsServiceManager.sol";
import {ChequeContract} from "contracts/Cheque.sol";
import {ICheque} from "interfaces/ICheque.sol";
import {Common} from "script/Common.s.sol";
// solhint-disable-next-line no-console
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

        // solhint-disable-next-line no-console
        console.log(
            "Fetching data for cheque TriggerId",
            ICheque.ChequeId.unwrap(triggerId)
        );

        // ICheque.ChequeId counter = ICheque.ChequeId.wrap(10);

        // ICheque.ChequeInfo memory _checkInfo = trigger.getChequeInfo(triggerId);
        ICheque.ChequeInfo memory _checkInfo = submit.getCheque(triggerId);
        bytes memory _recoveredSignature = submit.getSignature(triggerId);
        bytes memory _chequeData = submit.getChequeData(triggerId);

        ICheque.Cheque memory _oldDecodedData = abi.decode(
            _chequeData,
            (ICheque.Cheque)
        );

        // bytes memory data = abi.encode(_checkInfo);
        // console.log("Data:", string(_checkInfo.data));
        // ICheque.Cheque memory decodedData = abi.decode(
        //     _checkInfo.data,
        //     (ICheque.Cheque)
        // );

        // solhint-disable-next-line no-console
        console.log("Recovered signature is: ");

        logBytes(_recoveredSignature);
        // solhint-disable-next-line no-console
        console.log("Cheque data: ");

        // solhint-disable-next-line no-console
        logBytes(_chequeData);

        // solhint-disable-next-line no-console
        console.log("Cheque ID:", ICheque.ChequeId.unwrap(_checkInfo.chequeId));

        // solhint-disable-next-line no-console
        console.log("Cheque Sender:", _oldDecodedData.sender);

        // solhint-disable-next-line no-console
        console.log("Cheque Receiver:", _oldDecodedData.receiver);

        // solhint-disable-next-line no-console
        console.log("Cheque Amount:", _oldDecodedData.amount);

        // solhint-disable-next-line no-console
        console.log("Cheque Note:", _oldDecodedData.note);

        // solhint-disable-next-line no-console
        console.log("Cheque isPaid:", _oldDecodedData.isPaid);

        vm.stopBroadcast();
    }

    function logBytes(bytes memory data) internal pure {
        uint256 len = data.length;
        // solhint-disable-next-line no-console
        console.log("Bytes length:", len);
        for (uint256 i = 0; i < len; i += 32) {
            bytes32 chunk;
            assembly {
                chunk := mload(add(data, add(32, i)))
            }
            // solhint-disable-next-line no-console
            console.logBytes32(chunk);
        }
    }
}
