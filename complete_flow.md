# Aqua Cheque Protocol - Complete Flow

## Overview

The Aqua Cheque Protocol is a blockchain-based system that allows users to create, verify, and cash digital cheques using the WAVS (WebAssembly AVS) infrastructure built on Eigenlayer. This system enables the creation of digital financial instruments that can be verified and processed on-chain with off-chain data verification.

## Architecture Components

1. **Frontend Application**: Interface for users to create and manage cheques
2. **WAVS Infrastructure**: Middleware that processes triggers and verifies data
3. **Smart Contracts**: On-chain logic for registering and cashing cheques
4. **Aqua Form System**: Data structure for storing cheque information securely

## Complete Flow

### Phase 1: Cheque Creation and Registration

1. **Interface with Cheque Creation**
   - User accesses the client application
   - Fills out a form with cheque details (amount, recipient, note, etc.)
   - Client creates a local representation of the cheque

2. **Create the Aqua Form Revision**
   - Client-side code generates a unique revision of the cheque data
   - Data is structured in the Aqua tree format
   - A hash of the cheque data is generated

3. **Sign it from the Creator's Wallet**
   - The creator digitally signs the cheque with their wallet
   - Signature proves the authenticity of the cheque creation
   - The signed data is prepared for on-chain registration

4. **Verify Aqua Chain + Register Cheque with WAVS on Chain**
   - The signed cheque data is submitted to the blockchain via a transaction
   - WAVS system verifies the Aqua Chain data structure
   - The cheque is registered in the smart contract's storage (`ChequeContract`)
   - Smart contract generates a unique ID for the cheque
   - Verification returns OK if successful or FAILED if there are issues
   - Only authorized accounts can register cheques (authorization checked in smart contract)

### Phase 2: Cheque Delivery and Recipient Processing

1. **Send Cheque to Receiver**
   - Creator sends the cheque information to the recipient
   - This can be done off-chain (email, messaging app, etc.)

2. **Receiver Opens Interface to Add Their Wallet Address**
   - Recipient accesses the cheque application
   - Inputs the cheque information they received
   - Adds their wallet address as the destination for funds

3. **Create Aqua Form Revision WITH Receiver Address**
   - Application creates a new revision of the Aqua form
   - This revision includes the recipient's wallet address
   - A new hash is generated that includes this information

4. **Sign Aqua Form with Receiver Address**
   - Recipient signs this revised form with their wallet
   - This confirms their acceptance of the cheque
   - The signature authorizes the future payout to their address

### Phase 3: Cashing the Cheque

1. **Send Cheque to WAVS for PAYOUT**
   - The signed cheque is submitted to the WAVS infrastructure
   - This initiates the payout process

2. **WAVS Verifies Aqua-Chain and Triggers On-chain Smart Contract for Payout**
   - WAVS system validates all signatures and data
   - Verifies the cheque hasn't been previously cashed
   - Confirms that the cheque is properly registered
   - Triggers the on-chain smart contract function for payout

3. **On-Chain Payout**
   - Smart contract processes the payout request
   - Transfers funds from the contract to the recipient's address
   - Records the cheque as cashed to prevent double-spending

## Required WAVS Triggers

The Aqua Cheque Protocol requires three main triggers to handle the different phases of the cheque lifecycle:

### 1. Cheque Registration Trigger

**Purpose**: Handles the initial creation and registration of a cheque on the blockchain.

**Structure**:
```solidity
event ChequeDeposited(ICheque.ChequeId chequeId, bytes data);
```

**Workflow**:
- Activated when a user creates a new cheque through the frontend
- Captures the cheque details (sender, receiver, amount, note, Aqua tree hash)
- Emits an event containing the cheque ID and encoded cheque data
- WAVS component listens for this event and processes the registration
- Performs authorization checks to ensure only permitted accounts can register cheques
- Stores the cheque data in the contract's state (mapping)

**Implementation**:
- Triggered through the `depositCheque()` function in the ChequeContract
- Increments the chequeCounter to assign a unique ID
- Adds the cheque to the `cheques` mapping in the contract

### 2. Verification Trigger

**Purpose**: Verifies the Aqua form data and validates the cheque's authenticity.

**Structure**:
```solidity
function handleSignedData(bytes calldata _data, bytes calldata _signature) external;
```

**Workflow**:
- Activated when the Aqua form data needs verification
- Receives the signed data and signature as parameters
- Verifies the signature matches the claimed sender
- Decodes the data to extract the cheque details
- Checks the Aqua tree structure for validity
- Returns OK/FAILED status based on verification results
- Updates the contract state with verification status

**Implementation**:
- Used by the WAVS middleware to validate cheque data
- Ensures only properly formatted and signed cheques are processed
- Prevents unauthorized entities from tampering with cheque data

### 3. Payout Trigger

**Purpose**: Processes the payout request when a cheque is cashed.

**Structure**:
```solidity
event ChequePaid(uint256 chequeId, address indexed receiver, uint256 amount);
```

**Workflow**:
- Activated when a recipient requests to cash a cheque
- Verifies the cheque exists and hasn't been previously cashed
- Confirms the recipient address matches the one in the cheque
- Transfers funds from the contract to the recipient's wallet
- Marks the cheque as paid in the contract state
- Emits an event confirming the successful payment

**Implementation**:
- Triggered through a payout function in the smart contract
- Updates the `isPaid` status of the cheque to prevent double-spending
- Handles the actual fund transfer on-chain

## Smart Contract Functions

The ChequeContract implements several key functions:

1. **registerCheque()**: Authorizes and registers a new cheque on-chain
   - Stores cheque details including sender, receiver, amount, and form data
   - Creates a unique ID for each cheque

2. **cashoutCheque()**: Processes payment of a registered cheque
   - Verifies the cheque is valid and not previously cashed
   - Transfers funds to the specified account

3. **recallCheque()**: Allows creator to cancel a cheque before it's cashed
   - Uses the revision hash to identify the cheque
   - Removes the cheque from the active registry

## WAVS Integration

WAVS serves as a middleware layer that enables:

1. **Off-chain Verification**: Validates Aqua tree data structures without requiring all data on-chain
2. **Automated Triggers**: Monitors for on-chain events and executes the verification process
3. **Secure Data Submission**: Ensures only valid, verified data is used to trigger smart contract functions
4. **Authorization Control**: Enforces that only permitted accounts can register and cash cheques

## Security Considerations

1. **Authorization**: Only designated accounts can register cheques
2. **Double-spend Prevention**: Cheques can only be cashed once
3. **Signature Verification**: All operations require proper cryptographic signatures
4. **Recall Functionality**: Allows creators to cancel cheques if needed

## Implementation Notes

- The project uses WebAssembly components for off-chain processing
- Relies on Eigenlayer infrastructure for security and decentralization
- Smart contracts are written in Solidity
- Client application handles the user interface and local data management

## Deployment & Execution

To deploy and run this system:

1. Deploy the smart contracts to the target blockchain
2. Deploy the WAVS service with the appropriate trigger configurations
3. Configure and deploy the client application
4. Register authorized accounts in the smart contract

Once deployed, users can create, deliver, and cash cheques through the provided interface, with the WAVS infrastructure handling the verification and processing behind the scenes.