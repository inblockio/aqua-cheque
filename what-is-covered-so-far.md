# What we have built so far

This document outlines the key components, contracts, and functionality implemented in the Aqua Cheque project.

## Smart Contracts

### Core Contracts

1. **ChequeTrigger (`ChequeWavsTrigger.sol`)**
   - Manages digital cheques on the blockchain
   - Stores cheque data including sender, receiver, amount, note, payment status
   - Emits events when cheques are deposited
   - Key functions:
     - `addTrigger`: Creates a new cheque with sender, receiver, amount, note, and other data
     - `chequesById`: Maps cheque IDs to cheque data
     - `getChequeInfo`: Retrieves information about a specific cheque
     - `nextChequeId`: Tracks the next available cheque ID

2. **Verification Trigger (`VerificationTrigger.sol`)**
   - Handles verification of cheques
   - Ensures cheques are valid before processing

3. **Payout Trigger (`PayoutTrigger.sol`)**
   - Manages the payment process for cheques
   - Handles the transfer of funds when a cheque is cashed

4. **Cheque Contract (`Cheque.sol`)**
   - Main contract that coordinates the entire cheque system
   - Integrates with the trigger contracts

### Interfaces

1. **ICheque (`ICheque.sol`)**
   - Defines the data structures and events used across the system
   - Includes definitions for:
     - `ChequeId`: Unique identifier for cheques
     - `Cheque`: Structure containing all cheque data
     - `ChequeInfo`: Structure for passing cheque information
     - `ChequeDeposited`: Event emitted when a new cheque is created

## Frontend Components

### Core Components

1. **ChequeManager (`chequeManager.ts`)**
   - Central class that manages all interactions with the smart contracts
   - Provides methods for:
     - Creating new cheques
     - Retrieving cheque information
     - Verifying cheques
     - Processing payments
     - Managing wallet connections

2. **Bank Cheque (`bankCheque.ts`)**
   - Handles the creation and management of bank cheques
   - Interfaces with the blockchain to store cheque data

3. **Cheque Cashout (`chequeCashout.ts`)**
   - Manages the process of cashing out cheques
   - Verifies the cheque and processes the payment

4. **CLI Interface (`cheque-cli.ts`)**
   - Command-line interface for interacting with the cheque system
   - Allows users to create, view, and cash cheques from the terminal

### Contract ABIs

1. **Trigger ABI (`triggerAbi.ts`)**
   - Contains the Application Binary Interface for the ChequeTrigger contract
   - Enables the frontend to interact with the trigger contract

2. **Contracts ABI (`contractsAbi.ts`)**
   - Contains ABIs for all other contracts in the system
   - Includes contract addresses for easy reference

## Example Usage

### Creating a New Cheque

```typescript
// Initialize the ChequeManager with a provider
const provider = new ethers.JsonRpcProvider('http://localhost:8545');
const chequeManager = new ChequeManager(provider);

// Connect a wallet
chequeManager.connectWallet('private_key_here');

// Create a new cheque
await chequeManager.createCheque(
  'Sender Address',
  'Receiver Address',
  ethers.parseEther('1.0'),  // 1 ETH
  'Payment for services',
  'aqua_tree_data',
  'form_content_data'
);
```

### Retrieving Cheque Information

```typescript
// Get information about a specific cheque
const chequeInfo = await chequeManager.getChequeInfo(chequeId);
console.log('Cheque Details:', chequeInfo);

// Get all cheques for the current user
const myCheques = await chequeManager.getMyCheques();
console.log('My Cheques:', myCheques);
```

### Cashing a Cheque

```typescript
// Verify and cash a cheque
await chequeManager.verifyCheque(chequeId);
await chequeManager.cashCheque(chequeId);
```

## Deployment Information

The contracts are deployed on a local blockchain for development and testing purposes. The deployment addresses are stored in the contract ABI files for easy reference.

## Next Steps

1. Add missing submission contracts
2. Implement additional security features
3. Add support for multiple currencies
4. Develop a user-friendly web interface
5. Deploy to a test network for broader testing


## Project Summary

### Smart Contract Capabilities
- Digital cheque creation and management on the blockchain
- Secure storage of cheque data (sender, receiver, amount, notes)
- Payment status tracking for all cheques
- Verification system to ensure cheque validity
- Payment processing mechanism for cashing cheques

### Technical Implementation
- Modular contract architecture with specialized components for different functions
- Well-defined interfaces for consistent data handling across the system
- Event-driven system for tracking cheque deposits and status changes
- Comprehensive TypeScript frontend for interacting with the blockchain

### User Functionality
- Create digital cheques with custom amounts and notes
- View all cheques associated with a user's account
- Verify cheque authenticity before processing
- Cash cheques to receive funds
- Command-line interface for all operations

### Current Development Status
- Core contracts implemented and functional
- CLI interface available for testing
- Local blockchain deployment for development

