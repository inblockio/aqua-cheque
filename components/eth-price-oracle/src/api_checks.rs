// mod models;
use std::time::SystemTime;

use crate::models::{ApiResponse, AquaPayload, AquaTree, FileObject, Revision, Tree, TreeMapping};
use wavs_wasi_chain::http::{fetch_json, http_request_get, http_request_post_json};
use wstd::http::{HeaderValue, Request};

// Function to post the JSON payload using the WAVS Ethereum AVS HTTP implementation
pub async fn file_object_to_aqua_tree(url: &str, payload: &FileObject) -> Result<String, String> {
    let current_time = SystemTime::now().duration_since(SystemTime::UNIX_EPOCH).unwrap().as_secs();

    // Use the existing http_request_post_json function instead of http_request_post
    let mut req = http_request_post_json(url, payload).map_err(|e| e.to_string())?;

    // Set additional headers
    req.headers_mut().insert("Accept", HeaderValue::from_static("application/json"));
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
pub async fn verify_aqua_data(url: &str, payload: &AquaPayload) -> Result<String, String> {
    let current_time = SystemTime::now().duration_since(SystemTime::UNIX_EPOCH).unwrap().as_secs();

    // Use the existing http_request_post_json function instead of http_request_post
    let mut req = http_request_post_json(url, payload).map_err(|e| e.to_string())?;

    // Set additional headers
    req.headers_mut().insert("Accept", HeaderValue::from_static("application/json"));
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
