// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {stdJson} from "forge-std/StdJson.sol";
import {Strings} from "@openzeppelin-contracts/utils/Strings.sol";
import {IWavsServiceManager} from "@wavs/interfaces/IWavsServiceManager.sol";
import {ChequeContract} from "contracts/Cheque.sol";
import {ChequeTrigger} from "contracts/ChequeWavsTrigger.sol";
import {VerificationTrigger} from "contracts/VerificationTrigger.sol";
import {PayoutTrigger} from "contracts/PayoutTrigger.sol";
import {Common, EigenContracts} from "script/Common.s.sol";
// solhint-disable-next-line no-console
import {console} from "forge-std/console.sol";

/// @dev Deployment script for all contracts in the Aqua Cheque system
contract Deploy is Common {
    using stdJson for string;

    string public root = vm.projectRoot();
    string public deployments_path = string.concat(root, "/.docker/deployments.json");
    string public script_output_path = string.concat(root, "/.docker/script_deploy.json");

    /**
     * @dev Deploys all contracts and writes the results to a JSON file
     * @param _serviceManagerAddr The address of the service manager
     */
    function run(string calldata _serviceManagerAddr) public {
        vm.startBroadcast(_privateKey);
        
        // Deploy main contract
        ChequeContract chequeContract = new ChequeContract(IWavsServiceManager(vm.parseAddress(_serviceManagerAddr)));
        
        // Deploy all trigger contracts
        ChequeTrigger chequeTrigger = new ChequeTrigger();
        VerificationTrigger verificationTrigger = new VerificationTrigger(
            IWavsServiceManager(vm.parseAddress(_serviceManagerAddr)),
            address(chequeContract)
        );
        PayoutTrigger payoutTrigger = new PayoutTrigger(
            IWavsServiceManager(vm.parseAddress(_serviceManagerAddr)),
            address(chequeContract)
        );
        
        vm.stopBroadcast();

        string memory _json = "json";
        _json.serialize("service_handler", Strings.toHexString(address(chequeContract)));
        _json.serialize("cheque_trigger", Strings.toHexString(address(chequeTrigger)));
        _json.serialize("verification_trigger", Strings.toHexString(address(verificationTrigger)));
        _json.serialize("payout_trigger", Strings.toHexString(address(payoutTrigger)));
        
        // For backward compatibility
        _json.serialize("trigger", Strings.toHexString(address(chequeTrigger)));
        
        string memory _finalJson = _json.serialize("service_manager", _serviceManagerAddr);
        vm.writeFile(script_output_path, _finalJson);
        
        // solhint-disable-next-line no-console
        console.log("ChequeContract deployed at:", address(chequeContract));
        console.log("ChequeTrigger deployed at:", address(chequeTrigger));
        console.log("VerificationTrigger deployed at:", address(verificationTrigger));
        console.log("PayoutTrigger deployed at:", address(payoutTrigger));
    }

    /**
     * @dev Loads the Eigen contracts from the deployments.json file
     * @return _fixture The Eigen contracts
     */
    function loadEigenContractsFromFS() public view returns (EigenContracts memory _fixture) {
        address _dm = _jsonBytesToAddress(".eigen_core.local.delegation_manager");
        address _rc = _jsonBytesToAddress(".eigen_core.local.rewards_coordinator");
        address _avs = _jsonBytesToAddress(".eigen_core.local.avs_directory");

        _fixture = EigenContracts({delegation_manager: _dm, rewards_coordinator: _rc, avs_directory: _avs});
    }

    /**
     * @dev Loads the service managers from the deployments.json file
     * @return _service_managers The list of service managers
     */
    function loadServiceManagersFromFS() public view returns (address[] memory _service_managers) {
        _service_managers = vm.readFile(deployments_path).readAddressArray(".eigen_service_managers.local");
    }

    // --- Internal Utils ---

    /**
     * @dev Converts a string to an address
     * @param _byteString The string to convert
     * @return _address The address
     */
    function _jsonBytesToAddress(string memory _byteString) internal view returns (address _address) {
        _address = address(uint160(bytes20(vm.readFile(deployments_path).readBytes(_byteString))));
    }
}
