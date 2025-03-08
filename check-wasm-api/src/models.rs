
use serde::{Deserialize, Serialize};

// Define the file objects structure
#[derive(Serialize, Deserialize, Debug)]
pub struct FileObject {
    pub fileName: String,
    pub fileContent: String,
    pub path: String,
}

// Define the revision structure
#[derive(Serialize, Deserialize, Debug)]
pub struct Revision {
    pub previous_verification_hash: String,
    pub local_timestamp: String,
    pub revision_type: String,
    pub  file_hash: String,
    pub  file_nonce: String,
    pub  version: String,
}

// Define the tree structure
#[derive(Serialize, Deserialize, Debug)]
pub struct Tree {
    pub hash: String,
    pub  children: Vec<String>,
}

// Define the paths structure
#[derive(Serialize, Deserialize, Debug)]
pub struct TreeMapping {
    pub paths: std::collections::HashMap<String, Vec<String>>,
    pub latestHash: String,
}

// Define the aqua tree structure
#[derive(Serialize, Deserialize, Debug)]
pub struct AquaTree {
    pub revisions: std::collections::HashMap<String, Revision>,
    pub file_index: std::collections::HashMap<String, String>,
    pub tree: Tree,
    pub treeMapping: TreeMapping,
}

// Define the main payload structure
#[derive(Serialize, Deserialize, Debug)]
pub struct AquaPayload {
    pub  fileObjects: Vec<FileObject>,
    pub  aquaTree: AquaTree,
}

#[derive(Deserialize, Debug, Serialize)]
pub struct ApiResponse {
    pub data: ApiResponseData,
}

#[derive(Deserialize, Debug, Serialize)]
pub struct ApiResponseData {
    pub aquaTree: AquaTree,
    pub aquaTrees: Vec<AquaTree>, // Empty array in your example
    pub logData: Vec<LogData>,
}

#[derive(Deserialize, Debug, Serialize)]
pub struct LogData {
    pub logType: String,
    pub log: String,
    pub ident: String,
}
