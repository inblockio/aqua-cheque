// Contract addresses - replace with actual deployed addresses
export const CHEQUE_CONTRACT_ADDRESS = "0x36c02da8a0983159322a80ffe9f24b1acff8b570";
export const VERIFICATION_TRIGGER_ADDRESS = "0x0000000000000000000000000000000000000001"; // Replace with actual address
export const PAYOUT_TRIGGER_ADDRESS = "0x0000000000000000000000000000000000000002"; // Replace with actual address

// ChequeContract ABI
export const CHEQUE_ABI = [
  {
    "inputs": [
      {
        "internalType": "contract IWavsServiceManager",
        "name": "serviceManager",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "chequeId",
        "type": "uint256"
      }
    ],
    "name": "ChequeRecalled",
    "type": "event"
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
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "chequeId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "receiver",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "ChequePaid",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "sender",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "FundsReceived",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "chequeId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "success",
        "type": "bool"
      }
    ],
    "name": "VerificationResult",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_account",
        "type": "address"
      }
    ],
    "name": "addAuthorizedRegistrar",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "authorizedRegistrars",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "chequeCounter",
    "outputs": [
      {
        "internalType": "uint256",
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
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "cheques",
    "outputs": [
      {
        "internalType": "string",
        "name": "sender",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "receiver",
        "type": "string"
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
        "internalType": "bool",
        "name": "isPaid",
        "type": "bool"
      },
      {
        "internalType": "string",
        "name": "aquaTree",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "formContent",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "ICheque.ChequeId",
        "name": "_chequeId",
        "type": "uint256"
      },
      {
        "internalType": "ICheque.Cheque",
        "name": "_trigger",
        "type": "tuple",
        "components": [
          {
            "internalType": "string",
            "name": "sender",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "receiver",
            "type": "string"
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
            "internalType": "bool",
            "name": "isPaid",
            "type": "bool"
          },
          {
            "internalType": "string",
            "name": "aquaTree",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "formContent",
            "type": "string"
          }
        ]
      }
    ],
    "name": "chequesById",
    "outputs": [
      {
        "internalType": "ICheque.Cheque",
        "name": "",
        "type": "tuple",
        "components": [
          {
            "internalType": "string",
            "name": "sender",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "receiver",
            "type": "string"
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
            "internalType": "bool",
            "name": "isPaid",
            "type": "bool"
          },
          {
            "internalType": "string",
            "name": "aquaTree",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "formContent",
            "type": "string"
          }
        ]
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "sender",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_receiver",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "_note",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "aquaTree",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "formContent",
        "type": "string"
      }
    ],
    "name": "depositCheque",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getBalance",
    "outputs": [
      {
        "internalType": "uint256",
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
    "name": "getCheque",
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
        "internalType": "struct ICheque.ChequeInfo",
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
        "internalType": "ICheque.ChequeId",
        "name": "chequeId",
        "type": "uint256"
      }
    ],
    "name": "getChequeData",
    "outputs": [
      {
        "internalType": "bytes",
        "name": "_data",
        "type": "bytes"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getChequesCount",
    "outputs": [
      {
        "internalType": "uint256",
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
    "name": "getSignature",
    "outputs": [
      {
        "internalType": "bytes",
        "name": "_signature",
        "type": "bytes"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes",
        "name": "_data",
        "type": "bytes"
      },
      {
        "internalType": "bytes",
        "name": "_signature",
        "type": "bytes"
      }
    ],
    "name": "handleSignedData",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_chequeId",
        "type": "uint256"
      }
    ],
    "name": "isVerified",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_chequeId",
        "type": "uint256"
      },
      {
        "internalType": "address payable",
        "name": "recipientAddress",
        "type": "address"
      }
    ],
    "name": "payCheque",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_chequeId",
        "type": "uint256"
      }
    ],
    "name": "recallCheque",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_account",
        "type": "address"
      }
    ],
    "name": "removeAuthorizedRegistrar",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "verifiedCheques",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "stateMutability": "payable",
    "type": "receive"
  }
];

// VerificationTrigger ABI
export const VERIFICATION_TRIGGER_ABI = [
  {
    "inputs": [
      {
        "internalType": "contract IWavsServiceManager",
        "name": "serviceManager",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_chequeContract",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "requestId",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "ICheque.ChequeId",
        "name": "chequeId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "success",
        "type": "bool"
      }
    ],
    "name": "VerificationProcessed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "requestId",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "ICheque.ChequeId",
        "name": "chequeId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "aquaTreeHash",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "formRevisionHash",
        "type": "string"
      }
    ],
    "name": "VerificationRequested",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "chequeContract",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "requestId",
        "type": "bytes32"
      }
    ],
    "name": "getVerificationRequest",
    "outputs": [
      {
        "components": [
          {
            "internalType": "ICheque.ChequeId",
            "name": "chequeId",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "aquaTreeHash",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "formRevisionHash",
            "type": "string"
          },
          {
            "internalType": "address",
            "name": "requester",
            "type": "address"
          },
          {
            "internalType": "bool",
            "name": "isProcessed",
            "type": "bool"
          }
        ],
        "internalType": "struct VerificationTrigger.VerificationRequest",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "requestId",
        "type": "bytes32"
      }
    ],
    "name": "isVerificationPending",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "pendingVerifications",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "requestId",
        "type": "bytes32"
      },
      {
        "internalType": "bool",
        "name": "success",
        "type": "bool"
      },
      {
        "internalType": "bytes",
        "name": "signature",
        "type": "bytes"
      }
    ],
    "name": "processVerificationResult",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "ICheque.ChequeId",
        "name": "chequeId",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "aquaTreeHash",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "formRevisionHash",
        "type": "string"
      }
    ],
    "name": "requestVerification",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "requestId",
        "type": "bytes32"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_chequeContract",
        "type": "address"
      }
    ],
    "name": "setChequeContract",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "verificationRequests",
    "outputs": [
      {
        "internalType": "ICheque.ChequeId",
        "name": "chequeId",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "aquaTreeHash",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "formRevisionHash",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "requester",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "isProcessed",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// PayoutTrigger ABI
export const PAYOUT_TRIGGER_ABI = [
  {
    "inputs": [
      {
        "internalType": "contract IWavsServiceManager",
        "name": "serviceManager",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_chequeContract",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "requestId",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "ICheque.ChequeId",
        "name": "chequeId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "recipient",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "success",
        "type": "bool"
      }
    ],
    "name": "PayoutProcessed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "requestId",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "ICheque.ChequeId",
        "name": "chequeId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "recipient",
        "type": "address"
      }
    ],
    "name": "PayoutRequested",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "chequeContract",
    "outputs": [
      {
        "internalType": "contract ChequeContract",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "requestId",
        "type": "bytes32"
      }
    ],
    "name": "getPayoutRequest",
    "outputs": [
      {
        "components": [
          {
            "internalType": "ICheque.ChequeId",
            "name": "chequeId",
            "type": "uint256"
          },
          {
            "internalType": "address payable",
            "name": "recipient",
            "type": "address"
          },
          {
            "internalType": "bool",
            "name": "isProcessed",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "wasSuccessful",
            "type": "bool"
          }
        ],
        "internalType": "struct PayoutTrigger.PayoutRequest",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "requestId",
        "type": "bytes32"
      }
    ],
    "name": "isPayoutPending",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "payoutRequests",
    "outputs": [
      {
        "internalType": "ICheque.ChequeId",
        "name": "chequeId",
        "type": "uint256"
      },
      {
        "internalType": "address payable",
        "name": "recipient",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "isProcessed",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "wasSuccessful",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "pendingPayouts",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "requestId",
        "type": "bytes32"
      },
      {
        "internalType": "bytes",
        "name": "signature",
        "type": "bytes"
      }
    ],
    "name": "processPayout",
    "outputs": [
      {
        "internalType": "bool",
        "name": "success",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "ICheque.ChequeId",
        "name": "chequeId",
        "type": "uint256"
      },
      {
        "internalType": "address payable",
        "name": "recipient",
        "type": "address"
      }
    ],
    "name": "requestPayout",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "requestId",
        "type": "bytes32"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_chequeContract",
        "type": "address"
      }
    ],
    "name": "setChequeContract",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]; 