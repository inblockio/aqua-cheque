# Deploying All WAVS Components for Aqua Cheque Protocol

This guide provides the commands to deploy all necessary contracts and WAVS components for the Aqua Cheque protocol.

## 1. Deploy All Smart Contracts

First, deploy all the smart contracts using the updated deploy script:

```bash
# Get the service manager address
export SERVICE_MANAGER_ADDR=$(make get-eigen-service-manager-from-deploy)

# Deploy all contracts: ChequeContract, ChequeTrigger, VerificationTrigger, PayoutTrigger
forge script ./script/Deploy.s.sol ${SERVICE_MANAGER_ADDR} --sig "run(string)" --rpc-url http://localhost:8545 --broadcast
```

This script will deploy all four contracts and save their addresses in the `.docker/script_deploy.json` file.

## 2. Get Contract Addresses

After deployment, you can retrieve the contract addresses with these commands:

```bash
# Main ChequeContract address
export CHEQUE_CONTRACT_ADDR=$(jq -r '.service_handler' "./.docker/script_deploy.json")
echo "Cheque Contract: $CHEQUE_CONTRACT_ADDR"

# Trigger contract addresses
export CHEQUE_TRIGGER_ADDR=$(jq -r '.cheque_trigger' "./.docker/script_deploy.json")
export VERIFICATION_TRIGGER_ADDR=$(jq -r '.verification_trigger' "./.docker/script_deploy.json")
export PAYOUT_TRIGGER_ADDR=$(jq -r '.payout_trigger' "./.docker/script_deploy.json")

echo "Cheque Trigger: $CHEQUE_TRIGGER_ADDR"
echo "Verification Trigger: $VERIFICATION_TRIGGER_ADDR"
echo "Payout Trigger: $PAYOUT_TRIGGER_ADDR"
```

## 3. Building the WAVS Components

Build all WASM components:

```bash
# Build all WASM components (aqua-cheque, verify-cheque, payout-cheque)
make wasi-build
```

This will compile all components in the `components/` directory and copy the resulting WASM files to the `compiled/` directory.

## 4. Deploy All WAVS Components

### 4.1 Deploy Cheque Registration Component

```bash
# Set the ChequeContract address as trigger
export SERVICE_TRIGGER_ADDR=$CHEQUE_CONTRACT_ADDR
export SERVICE_SUBMISSION_ADDR=$CHEQUE_CONTRACT_ADDR

# Deploy the aqua-cheque component
export COMPONENT_FILENAME=aqua_cheque.wasm
export TRIGGER_EVENT="ChequeDeposited(uint256,bytes)"
make deploy-service
```

### 4.2 Deploy Verification Component

```bash
# Set the VerificationTrigger address as trigger
export SERVICE_TRIGGER_ADDR=$VERIFICATION_TRIGGER_ADDR
export SERVICE_SUBMISSION_ADDR=$CHEQUE_CONTRACT_ADDR

# Deploy the verify-cheque component
export COMPONENT_FILENAME=verify_cheque.wasm
export TRIGGER_EVENT="VerificationRequested(bytes32,uint256,string,string)"
make deploy-service
```

### 4.3 Deploy Payout Component

```bash
# Set the PayoutTrigger address as trigger
export SERVICE_TRIGGER_ADDR=$PAYOUT_TRIGGER_ADDR
export SERVICE_SUBMISSION_ADDR=$CHEQUE_CONTRACT_ADDR

# Deploy the payout-cheque component
export COMPONENT_FILENAME=payout_cheque.wasm
export TRIGGER_EVENT="PayoutRequested(bytes32,uint256,address)"
make deploy-service
```

## 5. Verify Deployments

To check if all components are deployed and running correctly:

```bash
# Check the list of registered services
make wavs-cli list-services

# Monitor the logs for any execution events
make logs-service
```

## 6. Test the Complete System

You can test the entire system using the CLI tool:

```bash
# Register authorized cheque creators
./cheque-app/dist/cheque-cli register-creator <privateKey> <creatorAddress>

# Deposit a new cheque
./cheque-app/dist/cheque-cli deposit-cheque <privateKey> --sender "Alice" --receiver "Bob" --amount 0.1 --note "Payment for services" --aqua "0x789...fed" --form "{}"

# Request verification of the cheque
./cheque-app/dist/cheque-cli verify-cheque <privateKey> 1 0xabc...123 0xdef...456

# Request payout
./cheque-app/dist/cheque-cli pay-cheque <privateKey> 1 0x456...def
```

## Important Notes

1. The `COMPONENT_FILENAME` variable must match the actual filename of the compiled WASM file. The names above (`aqua_cheque.wasm`, `verify_cheque.wasm`, `payout_cheque.wasm`) are based on the standard Rust output format for the component names we created.

2. The `SERVICE_SUBMISSION_ADDR` should be the ChequeContract address for all components since they all need to update the main contract's state.

3. Each component is deployed separately and listens for a specific event from a specific contract address:
   - aqua-cheque listens for `ChequeDeposited` from ChequeContract
   - verify-cheque listens for `VerificationRequested` from VerificationTrigger
   - payout-cheque listens for `PayoutRequested` from PayoutTrigger

4. All three contract triggers are connected to the same ChequeContract, which is the central contract that stores all cheque data.

5. To customize the service configuration, you can set the `SERVICE_CONFIG` environment variable before running `make deploy-service`. 