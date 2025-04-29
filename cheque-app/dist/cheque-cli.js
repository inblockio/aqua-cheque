#!/usr/bin/env node
import { ethers } from 'ethers';
import { ChequeManager } from './chequeManager.js';
// Command line arguments parser
const args = process.argv.slice(2);
const command = args[0];
// RPC URL - replace with your Ethereum node
const RPC_URL = process.env.RPC_URL || 'http://localhost:8545';
// Initialize provider
const provider = new ethers.JsonRpcProvider(RPC_URL);
const chequeManager = new ChequeManager(provider);
// Display help information
function showHelp() {
    console.log(`
Aqua Cheque CLI - Manage digital cheques on the blockchain

Usage:
  cheque-cli [command] [options]

Available Commands:
  register-creator [privateKey] [creatorAddress]  - Register a new cheque creator
  remove-creator [privateKey] [creatorAddress]    - Remove a cheque creator
  deposit-cheque [privateKey] [options]           - Create a new cheque
  update-receiver [privateKey] [chequeId] [receiver] - Update the receiver of a cheque
  verify-cheque [privateKey] [chequeId]           - Request verification for a cheque
  pay-cheque [privateKey] [chequeId] [recipient]  - Request payout for a cheque
  recall-cheque [privateKey] [chequeId]           - Recall/cancel a cheque
  get-cheque [chequeId]                           - Get cheque details
  is-authorized [address]                          - Check if address is authorized
  balance                                         - Get contract balance
  fund [privateKey] [amount]                      - Fund the contract

Examples:
  cheque-cli register-creator 0x123...abc 0x456...def
  cheque-cli deposit-cheque 0x123...abc --sender "Alice" --receiver "Bob" --amount 0.1 --note "Payment for services" --aqua "0x789...fed" --form "{}"
  cheque-cli update-receiver 0x123...abc 1 "Charlie"
  cheque-cli verify-cheque 0x123...abc 1 0xabc...123 0xdef...456
  cheque-cli pay-cheque 0x123...abc 1 0x456...def
  `);
}
// Process commands
async function processCommand() {
    try {
        if (!command || command === 'help') {
            showHelp();
            return;
        }
        switch (command) {
            case 'register-creator': {
                const privateKey = args[1];
                const creatorAddress = args[2];
                if (!privateKey || !creatorAddress) {
                    console.error('Error: Missing privateKey or creatorAddress');
                    return;
                }
                chequeManager.connectWallet(privateKey);
                const tx = await chequeManager.addAuthorizedRegistrar(creatorAddress);
                console.log(`Transaction sent: ${tx.hash}`);
                await tx.wait();
                console.log(`Creator ${creatorAddress} registered successfully`);
                break;
            }
            case 'remove-creator': {
                const privateKey = args[1];
                const creatorAddress = args[2];
                if (!privateKey || !creatorAddress) {
                    console.error('Error: Missing privateKey or creatorAddress');
                    return;
                }
                chequeManager.connectWallet(privateKey);
                const tx = await chequeManager.removeAuthorizedRegistrar(creatorAddress);
                console.log(`Transaction sent: ${tx.hash}`);
                await tx.wait();
                console.log(`Creator ${creatorAddress} removed successfully`);
                break;
            }
            case 'deposit-cheque': {
                const privateKey = args[1];
                if (!privateKey) {
                    console.error('Error: Missing privateKey');
                    return;
                }
                // Parse options
                const options = {};
                for (let i = 2; i < args.length; i += 2) {
                    if (args[i].startsWith('--')) {
                        options[args[i].substring(2)] = args[i + 1];
                    }
                }
                // Validate required fields (receiver is now optional)
                const requiredFields = ['sender', 'amount', 'note', 'aqua', 'form'];
                const missing = requiredFields.filter(field => !options[field]);
                if (missing.length > 0) {
                    console.error(`Error: Missing required fields: ${missing.join(', ')}`);
                    return;
                }
                chequeManager.connectWallet(privateKey);
                const amount = ethers.parseEther(options.amount);
                const tx = await chequeManager.depositCheque(options.sender, options.receiver || "", // Receiver is now optional
                amount, options.note, options.aqua, options.form);
                console.log(`Transaction sent: ${tx.hash}`);
                await tx.wait();
                console.log('Cheque deposited successfully');
                break;
            }
            case 'update-receiver': {
                const privateKey = args[1];
                const chequeId = parseInt(args[2]);
                const receiver = args[3];
                if (!privateKey || isNaN(chequeId) || !receiver) {
                    console.error('Error: Missing privateKey, chequeId, or receiver');
                    return;
                }
                chequeManager.connectWallet(privateKey);
                const tx = await chequeManager.updateChequeReceiver(chequeId, receiver);
                console.log(`Transaction sent: ${tx.hash}`);
                await tx.wait();
                console.log(`Cheque ${chequeId} receiver updated to ${receiver}`);
                break;
            }
            case 'verify-cheque': {
                const privateKey = args[1];
                const chequeId = parseInt(args[2]);
                const aquaTreeHash = args[3];
                const formRevisionHash = args[4];
                if (!privateKey || isNaN(chequeId) || !aquaTreeHash || !formRevisionHash) {
                    console.error('Error: Missing privateKey, chequeId, aquaTreeHash, or formRevisionHash');
                    return;
                }
                chequeManager.connectWallet(privateKey);
                const result = await chequeManager.requestVerification(chequeId, aquaTreeHash, formRevisionHash);
                console.log(`Transaction sent: ${result.txHash}`);
                console.log(`Verification requested with ID: ${result.requestId}`);
                break;
            }
            case 'pay-cheque': {
                const privateKey = args[1];
                const chequeId = parseInt(args[2]);
                const recipient = args[3];
                if (!privateKey || isNaN(chequeId) || !recipient) {
                    console.error('Error: Missing privateKey, chequeId, or recipient');
                    return;
                }
                chequeManager.connectWallet(privateKey);
                const result = await chequeManager.requestPayout(chequeId, recipient);
                console.log(`Transaction sent: ${result.txHash}`);
                console.log(`Payout requested with ID: ${result.requestId}`);
                break;
            }
            case 'recall-cheque': {
                const privateKey = args[1];
                const chequeId = parseInt(args[2]);
                if (!privateKey || isNaN(chequeId)) {
                    console.error('Error: Missing privateKey or chequeId');
                    return;
                }
                chequeManager.connectWallet(privateKey);
                const tx = await chequeManager.recallCheque(chequeId);
                console.log(`Transaction sent: ${tx.hash}`);
                await tx.wait();
                console.log(`Cheque ${chequeId} recalled successfully`);
                break;
            }
            case 'get-cheque': {
                const chequeId = parseInt(args[1]);
                if (isNaN(chequeId)) {
                    console.error('Error: Missing or invalid chequeId');
                    return;
                }
                const details = await chequeManager.getChequeDetails(chequeId);
                console.log('Cheque Details:');
                // console.log(JSON.stringify(details, null, 2));
                console.log("Cheque Amount: ", details.amount);
                console.log("Cheque Sender: ", details.sender);
                console.log("Cheque Receiver: ", details.receiver);
                console.log("Cheque Note: ", details.note);
                break;
            }
            case 'is-authorized': {
                const address = args[1];
                if (!address) {
                    console.error('Error: Missing address');
                    return;
                }
                const isAuthorized = await chequeManager.isAuthorizedRegistrar(address);
                console.log(`Address ${address} is ${isAuthorized ? 'authorized' : 'not authorized'} to create cheques`);
                break;
            }
            case 'balance': {
                const balance = await chequeManager.getContractBalance();
                console.log(`Contract balance: ${ethers.formatEther(balance)} ETH`);
                break;
            }
            case 'fund': {
                const privateKey = args[1];
                const amount = args[2];
                if (!privateKey || !amount) {
                    console.error('Error: Missing privateKey or amount');
                    return;
                }
                chequeManager.connectWallet(privateKey);
                const tx = await chequeManager.fundContract(ethers.parseEther(amount));
                console.log(`Transaction sent: ${tx.hash}`);
                await tx.wait();
                console.log(`Contract funded with ${amount} ETH`);
                break;
            }
            default:
                console.error(`Unknown command: ${command}`);
                showHelp();
        }
    }
    catch (error) {
        console.error('Error executing command:');
        console.error(error);
    }
}
// Execute the command
processCommand().catch(console.error);
