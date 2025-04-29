import { ethers } from 'ethers';
import {
  CHEQUE_CONTRACT_ADDRESS,
  CHEQUE_ABI,
  VERIFICATION_TRIGGER_ADDRESS,
  VERIFICATION_TRIGGER_ABI,
  PAYOUT_TRIGGER_ADDRESS,
  PAYOUT_TRIGGER_ABI
} from './contractsAbi.js';
import { TRIGGER_ABI, TRIGGER_CONTRACT_ADDRESS } from './triggerAbi.js';

/**
 * ChequeManager - A class that provides comprehensive management of the Aqua Cheque system
 * Handles all interactions with the smart contracts
 */
export class ChequeManager {
  private provider: ethers.Provider;
  private chequeContract: ethers.Contract;
  private chequeTriggereContract: ethers.Contract;
  private verificationTrigger: ethers.Contract;
  private payoutTrigger: ethers.Contract;
  private senderWallet: ethers.Wallet | null = null;

  /**
   * Constructor initializes the contracts with a provider
   * @param provider An ethers.js provider
   */
  constructor(provider: ethers.Provider) {
    this.provider = provider;
    this.chequeContract = new ethers.Contract(CHEQUE_CONTRACT_ADDRESS, CHEQUE_ABI, provider);
    this.chequeTriggereContract = new ethers.Contract(TRIGGER_CONTRACT_ADDRESS, TRIGGER_ABI, provider);
    this.verificationTrigger = new ethers.Contract(VERIFICATION_TRIGGER_ADDRESS, VERIFICATION_TRIGGER_ABI, provider);
    this.payoutTrigger = new ethers.Contract(PAYOUT_TRIGGER_ADDRESS, PAYOUT_TRIGGER_ABI, provider);
  }

  /**
   * Connect the manager with a sender's private key
   * @param privateKey The private key of the sender
   */
  connectWallet(privateKey: string): void {
    this.senderWallet = new ethers.Wallet(privateKey, this.provider);
    this.chequeContract = new ethers.Contract(CHEQUE_CONTRACT_ADDRESS, CHEQUE_ABI, this.senderWallet);
    this.chequeTriggereContract = new ethers.Contract(TRIGGER_CONTRACT_ADDRESS, TRIGGER_ABI, this.senderWallet);
    this.verificationTrigger = new ethers.Contract(VERIFICATION_TRIGGER_ADDRESS, VERIFICATION_TRIGGER_ABI, this.senderWallet);
    this.payoutTrigger = new ethers.Contract(PAYOUT_TRIGGER_ADDRESS, PAYOUT_TRIGGER_ABI, this.senderWallet);
    console.log(`Connected wallet: ${this.senderWallet.address}`);
  }

  /**
   * Check if the manager is connected to a wallet
   */
  isConnected(): boolean {
    return this.senderWallet !== null;
  }

  /**
   * Get the connected wallet address
   */
  getWalletAddress(): string {
    if (!this.senderWallet) {
      throw new Error('Wallet not connected');
    }
    return this.senderWallet.address;
  }

  /**
   * Check if the current wallet is the contract owner
   */
  async isContractOwner(): Promise<boolean> {
    if (!this.senderWallet) {
      throw new Error('Wallet not connected');
    }
    const owner = await this.chequeContract.owner();
    console.log(`Owner: ${owner}`);
    return owner.toLowerCase() === this.senderWallet.address.toLowerCase();
  }

  /**
   * Check if an account is an authorized registrar
   * @param address The address to check
   */
  async isAuthorizedRegistrar(address: string): Promise<boolean> {
    return await this.chequeContract.authorizedRegistrars(address);
  }

  /**
   * Add an authorized registrar (only owner can call this)
   * @param address The address to authorize
   */
  async addAuthorizedRegistrar(address: string): Promise<ethers.TransactionResponse> {
    if (!this.senderWallet) {
      throw new Error('Wallet not connected');
    }
    
    const isOwner = await this.isContractOwner();
    if (!isOwner) {
      throw new Error('Only the contract owner can add authorized registrars');
    }
    
    const tx = await this.chequeContract.addAuthorizedRegistrar(address);
    console.log(`Added authorized registrar ${address}, tx: ${tx.hash}`);
    return tx;
  }

  /**
   * Remove an authorized registrar (only owner can call this)
   * @param address The address to remove authorization from
   */
  async removeAuthorizedRegistrar(address: string): Promise<ethers.TransactionResponse> {
    if (!this.senderWallet) {
      throw new Error('Wallet not connected');
    }
    
    const isOwner = await this.isContractOwner();
    if (!isOwner) {
      throw new Error('Only the contract owner can remove authorized registrars');
    }
    
    const tx = await this.chequeContract.removeAuthorizedRegistrar(address);
    console.log(`Removed authorized registrar ${address}, tx: ${tx.hash}`);
    return tx;
  }

  /**
   * Get the current cheque count from the contract
   */
  async getChequesCount(): Promise<number> {
    const count = await this.chequeContract.getChequesCount();
    return count.toNumber();
  }

  /**
   * Create and deposit a new cheque with or without a receiver
   * @param sender Sender identifier (address or name)
   * @param receiver Receiver identifier (address or name) - can be empty for blank cheques
   * @param amount Amount in wei
   * @param note Additional note for the cheque
   * @param aquaTree Aqua tree hash/data
   * @param formContent Form content hash/data
   */
  async depositCheque(
    sender: string,
    receiver: string,
    amount: ethers.BigNumberish,
    note: string,
    aquaTree: string,
    formContent: string
  ): Promise<ethers.TransactionResponse> {
    if (!this.senderWallet) {
      throw new Error('Wallet not connected');
    }
    
    // Check if sender is authorized
    const isAuthorized = await this.isAuthorizedRegistrar(this.senderWallet.address);
    if (!isAuthorized) {
      throw new Error('Sender is not authorized to deposit cheques');
    }
    
    // If receiver is not provided, use an empty string
    const receiverValue = receiver || "";
    
    const tx = await this.chequeTriggereContract.addTrigger(
      sender,
      receiverValue, 
      amount,
      note,
      aquaTree,
      formContent
    );
    
    console.log(`Deposited cheque, tx: ${tx.hash}`);
    return tx;
  }

  /**
   * Get detailed information about a cheque
   * @param chequeId The ID of the cheque
   */
  async getChequeDetails(chequeId: number): Promise<{
    sender: string;
    receiver: string;
    amount: ethers.BigNumberish;
    note: string;
    isPaid: boolean;
    aquaTree: string;
    formContent: string;
    isVerified: boolean;
  }> {
    const cheque = await this.chequeContract.cheques(chequeId);
    const isVerified = await this.chequeContract.isVerified(chequeId);
    
    return {
      sender: cheque.sender,
      receiver: cheque.receiver,
      amount: cheque.amount,
      note: cheque.note,
      isPaid: cheque.isPaid,
      aquaTree: cheque.aquaTree,
      formContent: cheque.formContent,
      isVerified
    };
  }

  /**
   * Request verification for a cheque
   * @param chequeId The ID of the cheque to verify
   * @param aquaTreeHash The hash of the Aqua tree
   * @param formRevisionHash The hash of the form revision
   */
  async requestVerification(
    chequeId: number,
    aquaTreeHash: string,
    formRevisionHash: string
  ): Promise<{txHash: string, requestId: string}> {
    if (!this.senderWallet) {
      throw new Error('Wallet not connected');
    }
    
    const tx = await this.verificationTrigger.requestVerification(
      chequeId,
      aquaTreeHash,
      formRevisionHash
    );
    
    // Wait for the transaction to be mined to get the requestId from the event
    const receipt = await tx.wait();
    const event = receipt.events?.find((e: any) => e.event === 'VerificationRequested');
    console.log("Event: ", receipt)
    const requestId = event?.args?.requestId;
    
    console.log(`Requested verification for cheque ${chequeId}, requestId: ${requestId}, tx: ${tx.hash}`);
    return { txHash: tx.hash, requestId };
  }

  /**
   * Check the status of a verification request
   * @param requestId The ID of the verification request
   */
  async checkVerificationStatus(requestId: string): Promise<{
    chequeId: number;
    aquaTreeHash: string;
    formRevisionHash: string;
    requester: string;
    isProcessed: boolean;
  }> {
    const request = await this.verificationTrigger.getVerificationRequest(requestId);
    
    return {
      chequeId: request.chequeId.toNumber(),
      aquaTreeHash: request.aquaTreeHash,
      formRevisionHash: request.formRevisionHash,
      requester: request.requester,
      isProcessed: request.isProcessed
    };
  }

  /**
   * Request payout for a verified cheque
   * @param chequeId The ID of the cheque to pay out
   * @param recipient The recipient's address
   */
  async requestPayout(
    chequeId: number,
    recipient: string
  ): Promise<{txHash: string, requestId: string}> {
    if (!this.senderWallet) {
      throw new Error('Wallet not connected');
    }
    
    // Check if the cheque is verified
    const isVerified = await this.chequeContract.isVerified(chequeId);
    if (!isVerified) {
      throw new Error('Cheque is not verified');
    }
    
    const tx = await this.payoutTrigger.requestPayout(
      chequeId,
      recipient
    );
    
    // Wait for the transaction to be mined to get the requestId from the event
    const receipt = await tx.wait();
    const event = receipt.events?.find((e: any) => e.event === 'PayoutRequested');
    const requestId = event?.args?.requestId;
    
    console.log(`Requested payout for cheque ${chequeId}, requestId: ${requestId}, tx: ${tx.hash}`);
    return { txHash: tx.hash, requestId };
  }

  /**
   * Check the status of a payout request
   * @param requestId The ID of the payout request
   */
  async checkPayoutStatus(requestId: string): Promise<{
    chequeId: number;
    recipient: string;
    isProcessed: boolean;
    wasSuccessful: boolean;
  }> {
    const request = await this.payoutTrigger.getPayoutRequest(requestId);
    
    return {
      chequeId: request.chequeId.toNumber(),
      recipient: request.recipient,
      isProcessed: request.isProcessed,
      wasSuccessful: request.wasSuccessful
    };
  }

  /**
   * Recall/cancel a cheque (must be authorized and cheque must not be paid)
   * @param chequeId The ID of the cheque to recall
   */
  async recallCheque(chequeId: number): Promise<ethers.TransactionResponse> {
    if (!this.senderWallet) {
      throw new Error('Wallet not connected');
    }
    
    // Check if sender is authorized
    const isAuthorized = await this.isAuthorizedRegistrar(this.senderWallet.address);
    if (!isAuthorized) {
      throw new Error('Sender is not authorized to recall cheques');
    }
    
    const tx = await this.chequeContract.recallCheque(chequeId);
    console.log(`Recalled cheque ${chequeId}, tx: ${tx.hash}`);
    return tx;
  }

  /**
   * Pay a cheque directly (this is usually handled by the PayoutTrigger)
   * @param chequeId The ID of the cheque to pay
   * @param recipientAddress The address to receive the payment
   */
  async payCheque(chequeId: number, recipientAddress: string): Promise<ethers.TransactionResponse> {
    if (!this.senderWallet) {
      throw new Error('Wallet not connected');
    }
    
    const tx = await this.chequeContract.payCheque(chequeId, recipientAddress);
    console.log(`Paid cheque ${chequeId} to ${recipientAddress}, tx: ${tx.hash}`);
    return tx;
  }

  /**
   * Get the contract's ETH balance
   */
  async getContractBalance(): Promise<ethers.BigNumberish> {
    return await this.chequeContract.getBalance();
  }

  /**
   * Fund the contract with ETH
   * @param amount Amount in wei to send to the contract
   */
  async fundContract(amount: ethers.BigNumberish): Promise<ethers.TransactionResponse> {
    if (!this.senderWallet) {
      throw new Error('Wallet not connected');
    }
    
    const tx = await this.senderWallet.sendTransaction({
      to: CHEQUE_CONTRACT_ADDRESS,
      value: amount
    });
    
    console.log(`Funded contract with ${ethers.formatEther(amount)} ETH, tx: ${tx.hash}`);
    return tx as ethers.TransactionResponse;
  }

  /**
   * Update the receiver of an existing cheque
   * @param chequeId The ID of the cheque to update
   * @param receiver The new receiver identifier (address or name)
   */
  async updateChequeReceiver(
    chequeId: number,
    receiver: string
  ): Promise<ethers.TransactionResponse> {
    if (!this.senderWallet) {
      throw new Error('Wallet not connected');
    }
    
    // Check if sender is authorized
    const isAuthorized = await this.isAuthorizedRegistrar(this.senderWallet.address);
    if (!isAuthorized) {
      throw new Error('Sender is not authorized to update cheques');
    }
    
    // Check if the cheque exists and is not paid yet
    const cheque = await this.getChequeDetails(chequeId);
    if (cheque.isPaid) {
      throw new Error('Cannot update a paid cheque');
    }
    
    const tx = await this.chequeContract.updateChequeReceiver(chequeId, receiver);
    console.log(`Updated receiver for cheque ${chequeId} to ${receiver}, tx: ${tx.hash}`);
    return tx;
  }
} 