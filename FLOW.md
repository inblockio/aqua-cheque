# Aqua-Cheque Flow

## 1. Deposit Cheque Process

### Client-Side
- User fills out cheque form with sender, receiver, amount, and note
- System creates a new revision in the Aqua tree structure
- Form data is hashed and added to the tree
- The complete Aqua tree is prepared for upload

### Server Verification
- Client sends the Aqua tree to the server via `file_object_to_aqua_tree` API call
- Server validates the tree structure and form data
- Server returns a validated Aqua tree with verification hash

### Blockchain Integration
- The validated Aqua tree hash and form content are passed to the `ChequeTrigger` contract
- `ChequeTrigger.addTrigger()` is called with sender, receiver, amount, note, aquaTree, and formContent
- Contract creates a new cheque with a unique ChequeId
- Contract emits `ChequeDeposited` event with cheque data

### WAVS Trigger Activation
- WAVS system detects the `ChequeDeposited` event
- Event data is passed to the Aqua-Cheque WASM component
- Component's `run()` function is called with the trigger data
- Component decodes the trigger event using `decode_trigger_event()`

## 2. Cheque Verification Process

### WAVS Component Processing
- Component extracts cheque data from the trigger
- Component calls `verify_aqua_data()` to verify the Aqua tree with the server
- Server confirms that the revision is valid and matches the blockchain data
- Component prepares the verified cheque data

### Response Preparation
- Component converts the verified cheque to Solidity format
- Component encodes the response using `encode_trigger_output()`
- Response is returned to the WAVS system

## 3. Pay Cheque Process

### Contract Handling
- `ChequeContract.handleSignedData()` receives the verified data from WAVS
- Contract decodes the data to extract the cheque information
- Contract stores the cheque in its state

### Payment Execution
- User or system calls `payCheque()` with the chequeId
- Contract checks if the cheque is already paid
- Contract verifies the cheque details against the stored Aqua tree data
- If valid and not paid, contract marks the cheque as paid
- Contract transfers funds to the receiver's address
- Contract emits `ChequePaid` event

## Data Flow Diagram

```
User -> Form Data -> Aqua Tree -> Server Verification -> Blockchain
                                                            |
                                                            v
Receiver <- Payment <- Contract <- WAVS Component <- Trigger Event
```

## Integration Points

1. **Client-Server**: API calls for tree validation
2. **Server-Blockchain**: Validated tree data to smart contracts
3. **Blockchain-WAVS**: Event triggers to WASM components
4. **WAVS-Contract**: Verified data back to contracts for payment
