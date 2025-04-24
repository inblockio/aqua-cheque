use serde::{Deserialize, Serialize};

// Payout request from the smart contract
#[derive(Debug, Serialize, Deserialize)]
pub struct PayoutRequest {
    pub request_id: String,
    pub cheque_id: u64,
    pub recipient: String,
}

// Payout response to be sent back
#[derive(Debug, Serialize, Deserialize)]
pub struct PayoutResult {
    pub request_id: String,
    pub cheque_id: u64,
    pub recipient: String,
    pub success: bool,
    pub message: String,
    pub amount: Option<u64>,
}

// Cheque data from the smart contract
#[derive(Debug, Serialize, Deserialize)]
pub struct ChequeData {
    pub sender: String,
    pub receiver: String,
    pub amount: u64,
    pub note: String,
    pub is_paid: bool,
    pub aqua_tree: String,
    pub form_content: String,
}

// Blockchain confirmation details
#[derive(Debug, Serialize, Deserialize)]
pub struct TransactionConfirmation {
    pub tx_hash: String,
    pub block_number: u64,
    pub timestamp: u64,
    pub sender: String,
    pub receiver: String,
    pub amount: u64,
}
