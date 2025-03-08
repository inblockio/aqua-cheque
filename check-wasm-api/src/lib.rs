// module models;
mod models;
use std::time::SystemTime;

use models::{ApiResponse, AquaPayload, AquaTree, FileObject, Revision, Tree, TreeMapping};
use wavs_wasi_chain::http::{fetch_json, http_request_get, http_request_post_json};
use wstd::http::{HeaderValue, Request};

// Add this if it's not already in your library
use tokio::runtime::Runtime;

// Create a public function that users of your library can call
pub fn verify_aqua_data_to_server(url: &str) -> Result<String, String> {
    // Create a runtime for the async code
    let rt = Runtime::new().map_err(|e| e.to_string())?;
    
    // Create the sample payload
    let payload = create_sample_payload();
    
    // Execute the async function in the runtime
    rt.block_on(verify_aqua_data(url, &payload))
}

// Function to post the JSON payload using the WAVS Ethereum AVS HTTP implementation
async fn file_object_to_aqua_tree(url: &str, payload: &FileObject) -> Result<String, String> {
    let current_time = SystemTime::now()
        .duration_since(SystemTime::UNIX_EPOCH)
        .unwrap()
        .as_secs();

    // Use the existing http_request_post_json function instead of http_request_post
    let mut req = http_request_post_json(url, payload).map_err(|e| e.to_string())?;

    // Set additional headers
    req.headers_mut()
        .insert("Accept", HeaderValue::from_static("application/json"));
    // Content-Type is already set by http_request_post_json
    req.headers_mut().insert(
    "User-Agent", 
    HeaderValue::from_static("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36")
);
    req.headers_mut().insert(
        "Cookie",
        HeaderValue::from_str(&format!("myrandom_cookie={}", current_time)).unwrap(),
    );

    // Use the fetch_json function to send the request and get the response
    let response: ApiResponse = fetch_json(req).await.map_err(|e| e.to_string())?;

    // Convert the response to a string
    let response_str = serde_json::to_string(&response).map_err(|e| e.to_string())?;

    Ok(response_str)
}
 

// Function to post the JSON payload using the WAVS Ethereum AVS HTTP implementation
async fn verify_aqua_data(url: &str, payload: &AquaPayload) -> Result<String, String> {
    let current_time = SystemTime::now()
        .duration_since(SystemTime::UNIX_EPOCH)
        .unwrap()
        .as_secs();

    // Use the existing http_request_post_json function instead of http_request_post
    let mut req = http_request_post_json(url, payload).map_err(|e| e.to_string())?;

    // Set additional headers
    req.headers_mut()
        .insert("Accept", HeaderValue::from_static("application/json"));
    // Content-Type is already set by http_request_post_json
    req.headers_mut().insert(
    "User-Agent", 
    HeaderValue::from_static("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36")
);
    req.headers_mut().insert(
        "Cookie",
        HeaderValue::from_str(&format!("myrandom_cookie={}", current_time)).unwrap(),
    );

    // Use the fetch_json function to send the request and get the response
    let response: ApiResponse = fetch_json(req).await.map_err(|e| e.to_string())?;

    // Convert the response to a string
    let response_str = serde_json::to_string(&response).map_err(|e| e.to_string())?;

    Ok(response_str)
}

// Create a sample payload for testing
fn create_sample_payload() -> AquaPayload {
    let file_hash =
        "0x5fb68ab0139c9fb2a6da884304a76efe08f2501a7cb8df44169c477212239bdf".to_string();

    // Create FileObject
    let file_object = FileObject {
        fileName: "sample.txt".to_string(),
        fileContent: "hi am kenn.".to_string(),
        path: "".to_string(),
    };

    // Create Revision
    let revision = Revision {
        previous_verification_hash: "".to_string(),
        local_timestamp: "20250307191542".to_string(),
        revision_type: "file".to_string(),
        file_hash: "31f2f715138fd28a45d0e567d952f98516d216ec135cf28ca9a07a49db487db0".to_string(),
        file_nonce: "206625be637053d5c881fc1b6a9b22755e6374c233cfa333474b212c8fea41b6".to_string(),
        version: "https://aqua-protocol.org/docs/v3/schema_2 | SHA256 | Method: scalar".to_string(),
    };

    // Create revisions map
    let mut revisions = std::collections::HashMap::new();
    revisions.insert(file_hash.clone(), revision);

    // Create file_index map
    let mut file_index = std::collections::HashMap::new();
    file_index.insert(file_hash.clone(), "sample.txt".to_string());

    // Create tree
    let tree = Tree {
        hash: file_hash.clone(),
        children: vec![],
    };

    // Create treeMapping
    let mut paths = std::collections::HashMap::new();
    paths.insert(file_hash.clone(), vec![file_hash.clone()]);

    let tree_mapping = TreeMapping {
        paths,
        latestHash: file_hash.clone(),
    };

    // Create AquaTree
    let aqua_tree = AquaTree {
        revisions,
        file_index,
        tree,
        treeMapping: tree_mapping,
    };

    // Create full payload
    AquaPayload {
        fileObjects: vec![file_object],
        aquaTree: aqua_tree,
    }
}

// We need to define the http_request_post function since it's not in the example
// This is a placeholder that you would replace with the actual implementation
// fn http_request_post(url: &str, body: &[u8]) -> Result<Request<Vec<u8>>, anyhow::Error> {
//     // This is where you would implement the HTTP POST request creation
//     // based on the available HTTP utilities in your WAVS environment
//     let req = Request::builder()
//         .method("POST")
//         .uri(url)
//         .body(body.to_vec())?;

//     Ok(req)
// }

pub fn add(left: u64, right: u64) -> u64 {
    left + right
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_works() {
        let result = add(2, 2);
        assert_eq!(result, 4);
    }

    #[test]
    fn test_verify_aqua_data() {
        // let test_url = "http://164.92.183.228:3600/verify/tree";
        // let result = verify_aqua_data_to_server(test_url);
        
        // // Print the result for debugging
        // println!("API Response: {:?}", result);
        
        // // Assert that we got a successful result
        // assert!(result.is_ok());
    }
}
