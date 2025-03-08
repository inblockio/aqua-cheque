import Aquafier, { CredentialsData } from 'aqua-js-sdk';
import { ethers } from 'ethers';

const receiptWalletAddress = ""

async function bankCheque() {

    let dummyCredential: CredentialsData = {
        alchemy_key: "",
        did_key: "",
        mnemonic: "",
        nostr_sk: "",
        witness_eth_network: "",
        witness_method: ""
    }

    const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');

    // For local development, you might have predefined accounts
    // You can either use private key or connect to an unlocked account

    // Option 1: Using a private key (common with Hardhat/Ganache)
    const privateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'; // Example Hardhat first account private key
    const wallet = new ethers.Wallet(privateKey, provider);

    // Option 2: Using an unlocked account (if your local node has unlocked accounts)
    // const signer = provider.getSigner(0); // Get the first account

    // Smart contract details
    const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'; // Example contract address (often the first deployed contract in Hardhat)
    const contractABI = [
        // This is an example ABI - replace with your contract's actual ABI
        "function balanceOf(address owner) view returns (uint256)",
        "function transfer(address to, uint256 amount) returns (bool)",
        "function name() view returns (string)",
        "function symbol() view returns (string)"
    ];

    // Create a contract instance
    const contract = new ethers.Contract(contractAddress, contractABI, wallet);


    const chequeData = await contract.getCheques(receiptWalletAddress);

    let aquafier = new Aquafier();

    let signResult = await aquafier.signAquaTree(chequeData, 'metamask', dummyCredential);

    if (signResult.isErr()) {
        console.error("recepient of cheque error signing");
        return;
    }

    let chequeDataSigned = JSON.stringify(signResult.data)
    const balance = await contract.bankCheque(chequeDataSigned);

}

bankCheque()