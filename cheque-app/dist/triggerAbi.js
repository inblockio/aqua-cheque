export const TRIGGER_CONTRACT_ADDRESS = "0x809d550fca64d94bd9f66e60752a544199cfac3d";
export const TRIGGER_ABI = [
    {
        "inputs": [],
        "name": "nextTriggerId",
        "outputs": [
            {
                "internalType": "ICheque.ChequeId",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "ICheque.ChequeId",
                "name": "chequeId",
                "type": "uint256"
            }
        ],
        "name": "getChequeInfo",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "ICheque.ChequeId",
                        "name": "chequeId",
                        "type": "uint256"
                    },
                    {
                        "internalType": "bytes",
                        "name": "data",
                        "type": "bytes"
                    }
                ],
                "internalType": "ICheque.ChequeInfo",
                "name": "_chequeInfo",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "sender",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "receiver",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "note",
                "type": "string"
            },
            {
                "internalType": "bytes",
                "name": "aquaTree",
                "type": "bytes"
            },
            {
                "internalType": "bytes",
                "name": "formContent",
                "type": "bytes"
            }
        ],
        "name": "addTrigger",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "ICheque.ChequeId",
                "name": "chequeId",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "bytes",
                "name": "data",
                "type": "bytes"
            }
        ],
        "name": "ChequeDeposited",
        "type": "event"
    }
];
