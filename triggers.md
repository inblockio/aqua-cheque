# Deploying Aqua Cheque Triggers with WAVS

This document outlines how to deploy the Aqua Cheque system's three triggers to WAVS (WebAssembly AVS).

## Prerequisites

- WAVS environment set up as per README.md
- Smart contracts deployed (ChequeContract, VerificationTrigger, PayoutTrigger)
- WASM components built (`make wasi-build`)

## Trigger 1: Cheque Registration

The registration trigger handles the initial creation and registration of cheques.

```bash
# Set the trigger contract address (ChequeContract)
export SERVICE_TRIGGER_ADDR="0x36c02da8a0983159322a80ffe9f24b1acff8b570"

# Deploy the service to watch for ChequeDeposited events
TRIGGER_EVENT="ChequeDeposited(uint256,bytes)" make deploy-service
```

This will register the `aqua-cheque` component to process cheque registration events. The WAVS system will:
1. Watch for `ChequeDeposited` events from the ChequeContract
2. Execute the `aqua-cheque` component when a cheque is registered
3. Return signed verification data to the contract

## Trigger 2: Verification

The verification trigger handles validation of Aqua form data and cheque authenticity.

```bash
# Set the trigger contract address (VerificationTrigger)
export SERVICE_TRIGGER_ADDR="0x0000000000000000000000000000000000000001" # Replace with actual deployment address

# Deploy the service to watch for VerificationRequested events
TRIGGER_EVENT="VerificationRequested(bytes32,uint256,string,string)" make deploy-service
```

This will register the `verify-cheque` component to process verification requests. The WAVS system will:
1. Watch for `VerificationRequested` events from the VerificationTrigger contract
2. Execute the `verify-cheque` component when verification is requested
3. Validate the Aqua tree and form data off-chain
4. Return signed verification results to update the contract state

## Trigger 3: Payout

The payout trigger handles the payment process for verified cheques.

```bash
# Set the trigger contract address (PayoutTrigger)
export SERVICE_TRIGGER_ADDR="0x0000000000000000000000000000000000000002" # Replace with actual deployment address

# Deploy the service to watch for PayoutRequested events
TRIGGER_EVENT="PayoutRequested(bytes32,uint256,address)" make deploy-service
```

This will register the `payout-cheque` component to process payout requests. The WAVS system will:
1. Watch for `PayoutRequested` events from the PayoutTrigger contract
2. Execute the `payout-cheque` component when a payout is requested
3. Verify the cheque status and recipient details off-chain
4. Return signed payout authorization to trigger the on-chain payment

## Testing the Triggers

Once all triggers are deployed, you can test them using the CLI tool:

```bash
# Register a cheque (triggers ChequeDeposited event)
./cheque-cli deposit-cheque <privateKey> --sender "Alice" --receiver "Bob" --amount 0.1 --note "Payment for services" --aqua "0x789...fed" --form "{}"

# Request verification (triggers VerificationRequested event)
./cheque-cli verify-cheque <privateKey> 1 0xabc...123 0xdef...456

# Request payout (triggers PayoutRequested event)
./cheque-cli pay-cheque <privateKey> 1 0x456...def
```

## Monitoring Trigger Execution

You can monitor the WAVS logs to see triggers being processed:

```bash
make logs-service
```

This will show the execution of your WASM components and any errors that might occur.

## Event Flow Diagram

```
User -> CLI -> Smart Contract -> Event -> WAVS -> WASM Component -> Verification/Processing -> Smart Contract Update
```

## Important Notes

1. Make sure to build the WASM components before deploying the services
2. Use the correct contract addresses when setting the `SERVICE_TRIGGER_ADDR`
3. The event signatures must exactly match the ones defined in the contracts
4. Each trigger requires its own deployment command 