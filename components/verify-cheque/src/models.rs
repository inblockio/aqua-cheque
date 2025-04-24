use serde::{Deserialize, Serialize};
use std::collections::HashMap;

// Structures for Aqua tree representation
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AquaTree {
    pub revisions: HashMap<String, Revision>,
    pub file_index: HashMap<String, String>,
    pub tree: TreeNode,
    pub treeMapping: TreeMapping,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Revision {
    pub previous_verification_hash: String,
    pub local_timestamp: String,
    pub revision_type: String,
    pub file_hash: String,
    pub file_nonce: String,
    pub version: String,
    pub forms_sender: String,
    pub forms_receiver: String,
    pub forms_amount: String,
    pub forms_currency: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TreeNode {
    pub hash: String,
    pub children: Vec<TreeNode>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TreeMapping {
    pub paths: HashMap<String, Vec<String>>,
    pub latestHash: String,
}

// Structures for file objects and verification payload
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FileObject {
    pub fileName: String,
    pub fileContent: String,
    pub path: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AquaPayload {
    pub fileObjects: Vec<FileObject>,
    pub aquaTree: AquaTree,
}

// Verification response structures
#[derive(Debug, Serialize, Deserialize)]
pub struct VerificationResponse {
    pub success: bool,
    pub message: String,
    pub verification_hash: Option<String>,
}

// Verification request structure matching the VerificationRequest in the smart contract
#[derive(Debug, Serialize, Deserialize)]
pub struct VerificationRequest {
    pub request_id: String,
    pub cheque_id: u64,
    pub aqua_tree_hash: String,
    pub form_revision_hash: String,
    pub requester: String,
}

// Verification result to be sent back
#[derive(Debug, Serialize, Deserialize)]
pub struct VerificationResult {
    pub request_id: String,
    pub cheque_id: u64,
    pub success: bool,
    pub message: String,
}
