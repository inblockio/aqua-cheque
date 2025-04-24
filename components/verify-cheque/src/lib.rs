mod trigger;
use trigger::{decode_trigger_event, encode_trigger_output, Destination};
use wavs_wasi_chain::ethereum::alloy_primitives::U256;
pub mod bindings; // This will be auto-generated
use crate::bindings::{export, Guest, TriggerAction};
use serde::{Deserialize, Serialize};
use wstd::runtime::block_on;

pub mod api_client;
pub mod models;

struct Component;
export!(Component with_types_in bindings);

impl Guest for Component {
    fn run(action: TriggerAction) -> std::result::Result<Option<Vec<u8>>, String> {
        println!("VerifyCheque component running...");

        // Decode the trigger event to get verification request details
        let (trigger_id, req, dest) =
            decode_trigger_event(action.data).map_err(|e| e.to_string())?;

        println!("Processing verification request ID: {}", req.request_id);
        println!("Cheque ID: {}", req.cheque_id);

        // Process the verification request
        let verification_result =
            block_on(async { verify_cheque_data(&req).await }).map_err(|e| e.to_string())?;

        // Encode the result to be sent back to the blockchain
        let output = match dest {
            Destination::Ethereum => {
                // Encode the verification result for the smart contract
                Some(encode_trigger_output(trigger_id, verification_result.success))
            }
            Destination::CliOutput => {
                // Output for CLI testing
                serde_json::to_vec(&verification_result).map_err(|e| e.to_string()).ok()
            }
        };

        println!(
            "Verification completed: {}",
            if verification_result.success { "SUCCESS" } else { "FAILED" }
        );
        Ok(output)
    }
}

/// Verifies the cheque data by checking the Aqua tree structure
async fn verify_cheque_data(
    req: &trigger::VerificationRequest,
) -> Result<models::VerificationResult, String> {
    use crate::api_client::verify_aqua_data;
    use crate::models::{AquaPayload, AquaTree, FileObject};

    println!("Extracting Aqua tree data...");

    // In a real implementation, we would fetch the Aqua tree data from somewhere
    // For now, we'll use a simulated Aqua tree
    let aqua_tree_json = r#"{
        "revisions": {
          "0xf9d2dae2993d89104aae9a86d4cdc91322b979db4abd97ecfe38b4cfbf107449": {
            "previous_verification_hash": "",
            "local_timestamp": "20250326141433",
            "revision_type": "form",
            "file_hash": "a9041193cecffad533b8eaee36f419a1f2406fc8e6a01c2014d4ee7002723c42",
            "file_nonce": "c3a5f1737420c3b16b4e0fbce5c6125860d37c798973dd10800814479c7c05cb",
            "version": "https://aqua-protocol.org/docs/v3/schema_2 | SHA256 | Method: tree",
            "forms_sender": "0xbdc64c49bf736cfe1b8233b083d3d632f26feb27",
            "forms_receiver": "0x4a79b0d4b8feda7af5902da2d15d73a7e5fdefd4",
            "forms_amount": "0.3",
            "forms_currency": "ETH"
          }
        },
        "file_index": {
          "0xf9d2dae2993d89104aae9a86d4cdc91322b979db4abd97ecfe38b4cfbf107449": "cheque.json"
        },
        "tree": {
          "hash": "0xf9d2dae2993d89104aae9a86d4cdc91322b979db4abd97ecfe38b4cfbf107449",
          "children": []
        },
        "treeMapping": {
          "paths": {
            "0xf9d2dae2993d89104aae9a86d4cdc91322b979db4abd97ecfe38b4cfbf107449": [
              "0xf9d2dae2993d89104aae9a86d4cdc91322b979db4abd97ecfe38b4cfbf107449"
            ]
          },
          "latestHash": "0xf9d2dae2993d89104aae9a86d4cdc91322b979db4abd97ecfe38b4cfbf107449"
        }
    }"#;

    // Mock form content
    let form_content = r#"{
        "sender": "0xbdc64c49bf736cfe1b8233b083d3d632f26feb27",
        "receiver": "0x4a79b0d4b8feda7af5902da2d15d73a7e5fdefd4",
        "amount": 0.3,
        "currency": "ETH",
        "note": "Payment for services"
    }"#;

    // Parse the Aqua tree
    let aqua_tree: AquaTree = serde_json::from_str(aqua_tree_json)
        .map_err(|e| format!("Failed to parse Aqua tree: {}", e))?;

    // Check if the tree hash matches what was in the request
    let actual_tree_hash = aqua_tree.treeMapping.latestHash.clone();
    let expected_tree_hash = req.aqua_tree_hash.clone();

    println!("Comparing tree hashes:");
    println!("  Expected: {}", expected_tree_hash);
    println!("  Actual:   {}", actual_tree_hash);

    let hash_match = actual_tree_hash == expected_tree_hash;
    if !hash_match {
        return Ok(models::VerificationResult {
            request_id: req.request_id.clone(),
            cheque_id: req.cheque_id,
            success: false,
            message: "Aqua tree hash mismatch".to_string(),
        });
    }

    // Prepare for API verification
    let file_object = FileObject {
        fileName: "cheque.json".to_string(),
        fileContent: form_content.to_string(),
        path: "/".to_string(),
    };

    let payload = AquaPayload { fileObjects: vec![file_object], aquaTree: aqua_tree };

    // Verify with the Aqua Protocol API
    println!("Sending for external verification...");
    let verification_url = "https://api.aqua-protocol.org/verify";

    match verify_aqua_data(verification_url, &payload).await {
        Ok(response) => {
            // Report the result
            api_client::report_verification_result(
                "https://api.aqua-protocol.org/report",
                &req.request_id,
                req.cheque_id,
                response.success,
            )
            .await
            .map_err(|e| format!("Failed to report result: {}", e))?;

            Ok(models::VerificationResult {
                request_id: req.request_id.clone(),
                cheque_id: req.cheque_id,
                success: response.success,
                message: response.message,
            })
        }
        Err(e) => {
            let error_msg = format!("Verification API error: {}", e);
            println!("{}", error_msg);

            Ok(models::VerificationResult {
                request_id: req.request_id.clone(),
                cheque_id: req.cheque_id,
                success: false,
                message: error_msg,
            })
        }
    }
}
