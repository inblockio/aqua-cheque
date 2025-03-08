import * as fs from "fs";
import Aquafier from "aqua-js-sdk";
import { ethers, hexlify, toUtf8Bytes } from 'ethers';
import { TRIGGER_ABI, TRIGGER_CONTRACT_ADDRESS } from "./triggerAbi.js";
import { dirname } from 'path';
import { fileURLToPath } from 'url';
async function signCheque() {
    let dummyCredential = {
        alchemy_key: "",
        did_key: "",
        mnemonic: "",
        nostr_sk: "",
        witness_eth_network: "",
        witness_method: ""
    };
    // const __dirname = dirname(__filename);
    // let filePath = `${__dirname}/cheque.json`;
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    let _filePath = `${__dirname}/cheque.json`;
    let filePath = _filePath.replace("dist", "src");
    try {
        if (!fs.existsSync(filePath)) {
            console.log("please create a  cheque.json file");
            return;
        }
        let chequeContent = fs.readFileSync(filePath, 'utf8');
        let chequeData = JSON.parse(chequeContent);
        if (!chequeData.sender) {
            console.error("Sender in cheque is required ");
            return;
        }
        if (!chequeData.receiver) {
            console.error("Receiveer in cheque is required ");
            return;
        }
        if (!chequeData.amount) {
            console.error("Amount in cheque is required ");
            return;
        }
        //create an aqua form 
        let aquafier = new Aquafier();
        let fileObject = {
            fileContent: chequeContent,
            fileName: "cheque.json",
            path: "./"
        };
        let genesisRevision = await aquafier.createGenesisRevision(fileObject, true);
        if (genesisRevision.isErr()) {
            console.error("Error creating cheque  ");
            return;
        }
        let aquaTree = genesisRevision.data.aquaTree;
        if (aquaTree == null) {
            console.error("Aqua tree, has error.");
            return;
        }
        console.log(`Genesis ${JSON.stringify(aquaTree, null, 4)} `);
        // the creator of the cheque need to sign in 
        let signedChequeAquaTree = await aquafier.signAquaTree({
            aquaTree: aquaTree,
            revision: "",
            fileObject: fileObject
        }, "metamask", dummyCredential, false);
        if (signedChequeAquaTree.isErr()) {
            console.error("Error signing cheque  ");
            return;
        }
        let signedChequeData = signedChequeAquaTree.data;
        // check if sign wallet address is the one sepecified in the cheque
        let revisions = Object.values(signedChequeData.aquaTree.revisions);
        let signRevision = revisions[1];
        if (signRevision == null) {
            console.error("Error validating cheque signature");
            return;
        }
        // if (chequeData.sender != signRevision.signature_wallet_address) {
        //     console.error("Error signer of  cheque should be the sender")
        //     return
        // }
        saveInSmartContract(signedChequeData.aquaTree, chequeData, chequeContent);
    }
    catch (error) {
        console.error(`Error reading or parsing the file at ${filePath}:`, error);
        return null;
    }
}
async function saveInSmartContract(signedCheque, chequeData, chequeContent) {
    console.log("Contract abi: ", TRIGGER_ABI);
    try {
        // Connect to a local Ethereum node
        // Common local provider URLs:
        // - Hardhat: http://127.0.0.1:8545
        // - Ganache: http://127.0.0.1:7545
        // - Geth/Parity in dev mode: http://127.0.0.1:8545
        const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
        // For local development, you might have predefined accounts
        // You can either use private key or connect to an unlocked account
        // Option 1: Using a private key (common with Hardhat/Ganache)
        const privateKey = '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d'; // Example Hardhat first account private key
        const wallet = new ethers.Wallet(privateKey, provider);
        // Option 2: Using an unlocked account (if your local node has unlocked accounts)
        // const signer = provider.getSigner(0); // Get the first account
        // Smart contract details
        const contractAddress = TRIGGER_CONTRACT_ADDRESS; // Example contract address (often the first deployed contract in Hardhat)
        const contractABI = TRIGGER_ABI;
        // Create a contract instance
        const contract = new ethers.Contract(contractAddress, contractABI, wallet);
        // Get some basic info from the contract
        // const name = await contract.name();
        // const symbol = await contract.symbol();
        // console.log(`Contract: ${name} (${symbol})`);
        // Read from the contract
        // const balance = await contract.balanceOf(wallet.address);
        let _chequeData = JSON.stringify(signCheque);
        let aquaTree = hexlify(toUtf8Bytes("")); // hexlify(toUtf8Bytes(_chequeData));
        let formContent = hexlify(toUtf8Bytes(chequeContent));
        const res = await contract.addTrigger(chequeData.sender, chequeData.receiver, chequeData.amount, chequeData.note, aquaTree, formContent);
        // console.log(`Balance: ${ethers.utils.formatEther(balance)} ${symbol}`);
        // Execute a transaction (write to the contract)
        // const recipientAddress = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'; // Example second account in Hardhat
        // const amount = ethers.utils.parseEther('1.0');
        // console.log(`Sending ${ethers.utils.formatEther(amount)} ${symbol} to ${recipientAddress}`);
        // const tx = await contract.transfer(recipientAddress, amount);
        // console.log(`Transaction hash: ${tx.hash}`);
        // Wait for transaction to be mined
        // const receipt = await tx.wait();
        // console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
        // console.log(`Gas used: ${receipt.gasUsed.toString()}`);
        // Verify the transfer worked
        // const newBalance = await contract.balanceOf(wallet.address);
        // console.log(`New balance: ${ethers.utils.formatEther(newBalance)} ${symbol}`);
    }
    catch (error) {
        console.error('Error:', error);
    }
}
signCheque();
