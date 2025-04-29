# Aqua Cheque Application

This guide explains how to build and run the Aqua Cheque application.

## Prerequisites

- Node.js and npm installed
- Ethereum private key and access to an Ethereum node/RPC

## Setup

1. Install dependencies:
```bash
cd cheque-app
npm install
```

2. Build the TypeScript code:
```bash
npm run build
```

This will compile the TypeScript files in the `src` directory to JavaScript in the `dist` directory.

## Fixing Import Issues (Node.js ESM)

If you encounter errors like `ERR_MODULE_NOT_FOUND`, ensure your TypeScript files use proper ES module imports with file extensions:

1. In source files, use `.js` extension in imports:
```typescript
// Correct:
import { ChequeManager } from './chequeManager.js';
// Not:
import { ChequeManager } from './chequeManager';
```

2. Make sure your tsconfig.json has the right module settings:
```json
{
  "compilerOptions": {
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    // other settings...
  }
}
```

3. Ensure package.json has `"type": "module"`:
```json
{
  "type": "module",
  // other settings...
}
```

## Environment Configuration

Set the RPC URL for your Ethereum node:

```bash
export RPC_URL=https://your-ethereum-node-url
```

If not set, the application will default to `http://localhost:8545`.

## Using the CLI Tool

The `cheque-cli` provides a command-line interface for interacting with the Aqua Cheque smart contracts.
 
### Available Commands

#### Register a Cheque Creator
```bash
node dist/cheque-cli.js register-creator <privateKey> <creatorAddress>
```

#### Remove a Cheque Creator
```bash
node dist/cheque-cli.js remove-creator <privateKey> <creatorAddress>
```

#### Deposit a Cheque
```bash
node dist/cheque-cli.js deposit-cheque <privateKey> --sender "<sender>" --amount <amount> --note "<note>" --aqua "<aquaHash>" --form "{}" [--receiver "<receiver>"]
```

```bash
node dist/cheque-cli.js deposit-cheque "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80" --sender "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" --amount 10 --note "Some note" --aqua "0x10" --form "{}" --receiver "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
```

Note: The `--receiver` parameter is now optional. If omitted, an empty receiver will be used.

#### Update a Cheque Receiver
```bash
node dist/cheque-cli.js update-receiver <privateKey> <chequeId> "<receiver>"
```

#### Verify a Cheque
```bash
node dist/cheque-cli.js verify-cheque <privateKey> <chequeId> <aquaTreeHash> <formRevisionHash>
```

#### Request Payout for a Cheque
```bash
node dist/cheque-cli.js pay-cheque <privateKey> <chequeId> <recipient>
```

#### Recall/Cancel a Cheque
```bash
node dist/cheque-cli.js recall-cheque <privateKey> <chequeId>
```

#### Get Cheque Details
```bash
node dist/cheque-cli.js get-cheque <chequeId>
```

#### Check if Address is Authorized
```bash
node dist/cheque-cli.js is-authorized <address>
```

#### Get Contract Balance
```bash
node dist/cheque-cli.js balance
```

#### Fund the Contract
```bash
node dist/cheque-cli.js fund <privateKey> <amount>
```

#### Display Help
```bash
node dist/cheque-cli.js help
```

## Complete Cheque Workflow

The Aqua Cheque system now supports the following workflow:

1. **Initial Creation** - Create a cheque without a specified receiver:
   ```bash
   node dist/cheque-cli.js deposit-cheque <privateKey> --sender "Alice" --amount 0.1 --note "Payment for services" --aqua "0x789...fed" --form "{}"
   ```

2. **Update Receiver** - Later assign a receiver to the cheque:
   ```bash
   node dist/cheque-cli.js update-receiver <privateKey> 1 "Bob"
   ```

3. **Verification** - Request verification of the cheque:
   ```bash
   node dist/cheque-cli.js verify-cheque <privateKey> 1 <aquaTreeHash> <formRevisionHash>
   ```

4. **Payout** - After verification, request payout to the receiver:
   ```bash
   node dist/cheque-cli.js pay-cheque <privateKey> 1 <recipientAddress>
   ```

This workflow allows for creating blank cheques that can be assigned to receivers later, similar to how paper cheques can be written without initially specifying a payee.

## Creating a Cheque JSON File

To create a cheque, you need to prepare a JSON file with the required details. Example `cheque.json`:

```json
{
  "sender": "Alice",
  "amount": "0.1",
  "note": "Payment for services"
}
```

The receiver can be left out initially and updated later.

## Running the Bank Cheque Script

To process a cheque from a JSON file:

```bash
npm run dev
```
or
```bash
npm run start
```

This will execute the `bankCheque.js` script, which reads the `cheque.json` file, creates an Aqua form, and processes the cheque.

## Custom Integration

If you want to integrate the cheque functionality into your own application, you can use the `ChequeManager` class directly:

```javascript
import { ethers } from 'ethers';
import { ChequeManager } from './dist/chequeManager.js';

// Initialize
const provider = new ethers.JsonRpcProvider('YOUR_RPC_URL');
const chequeManager = new ChequeManager(provider);

// Connect wallet
chequeManager.connectWallet('YOUR_PRIVATE_KEY');

// Use the functions
async function example() {
  // Create a blank cheque (no receiver)
  const tx1 = await chequeManager.depositCheque(
    'Alice',
    '', // Empty receiver
    ethers.parseEther('0.1'),
    'Payment note',
    'aquaHash',
    '{}'
  );
  
  // Later, update the receiver
  const tx2 = await chequeManager.updateChequeReceiver(1, 'Bob');
  
  // Request verification
  const verification = await chequeManager.requestVerification(1, 'aquaTreeHash', 'formRevisionHash');
  
  // Request payout after verification
  const payout = await chequeManager.requestPayout(1, '0xRecipientAddress');
}

example();
```

## Troubleshooting

- Ensure your Ethereum node is accessible and that your private key has sufficient funds
- Check contract addresses in the `contractsAbi.ts` file if you're working with a custom deployment
- For verification issues, ensure the WAVS component is properly configured
- If you face module import issues, make sure all import statements include the file extension (e.g., `.js`) in TypeScript source files 