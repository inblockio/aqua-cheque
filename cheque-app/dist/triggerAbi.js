export const TRIGGER_CONTRACT_ADDRESS = "0x809d550fca64d94bd9f66e60752a544199cfac3d";
export const TRIGGER_ABI = [
    {
        "type": "function",
        "name": "addTrigger",
        "inputs": [
            {
                "name": "sender",
                "type": "string",
                "internalType": "string"
            },
            {
                "name": "receiver",
                "type": "string",
                "internalType": "string"
            },
            {
                "name": "amount",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "note",
                "type": "string",
                "internalType": "string"
            },
            {
                "name": "aquaTree",
                "type": "string",
                "internalType": "string"
            },
            {
                "name": "formContent",
                "type": "string",
                "internalType": "string"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "chequesById",
        "inputs": [
            {
                "name": "_chequeId",
                "type": "uint256",
                "internalType": "ICheque.ChequeId"
            }
        ],
        "outputs": [
            {
                "name": "sender",
                "type": "string",
                "internalType": "string"
            },
            {
                "name": "receiver",
                "type": "string",
                "internalType": "string"
            },
            {
                "name": "amount",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "note",
                "type": "string",
                "internalType": "string"
            },
            {
                "name": "isPaid",
                "type": "bool",
                "internalType": "bool"
            },
            {
                "name": "aquaTree",
                "type": "string",
                "internalType": "string"
            },
            {
                "name": "formContent",
                "type": "string",
                "internalType": "string"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "getChequeInfo",
        "inputs": [
            {
                "name": "chequeId",
                "type": "uint256",
                "internalType": "ICheque.ChequeId"
            }
        ],
        "outputs": [
            {
                "name": "_chequeInfo",
                "type": "tuple",
                "internalType": "struct ICheque.ChequeInfo",
                "components": [
                    {
                        "name": "chequeId",
                        "type": "uint256",
                        "internalType": "ICheque.ChequeId"
                    },
                    {
                        "name": "data",
                        "type": "bytes",
                        "internalType": "bytes"
                    }
                ]
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "nextChequeId",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "ICheque.ChequeId"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "nextTriggerId",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "ICheque.ChequeId"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "event",
        "name": "ChequeDeposited",
        "inputs": [
            {
                "name": "chequeId",
                "type": "uint256",
                "indexed": false,
                "internalType": "ICheque.ChequeId"
            },
            {
                "name": "data",
                "type": "bytes",
                "indexed": false,
                "internalType": "bytes"
            }
        ],
        "anonymous": false
    }
];
