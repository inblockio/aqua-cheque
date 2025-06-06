mod trigger;
use trigger::{decode_trigger_event, encode_trigger_output, Destination};
use wavs_wasi_chain::ethereum::alloy_primitives::U256;
pub mod bindings;
use crate::bindings::{export, Guest, TriggerAction};
use alloy_sol_types::SolValue;
use serde::{Deserialize, Serialize};
use wstd::runtime::block_on;

pub mod api_check;
pub mod models;

struct Component;
export!(Component with_types_in bindings);

impl Guest for Component {
    fn run(action: TriggerAction) -> std::result::Result<Option<Vec<u8>>, String> {
        println!("==================================================");
        println!("🔵 AQUA-CHEQUE COMPONENT STARTED");
        println!("==================================================");
        println!("Received trigger action");

        // Decode the trigger event to get cheque info
        let (trigger_id, cheque_info, dest) =
            decode_trigger_event(action.data).map_err(|e| e.to_string())?;

        println!("📝 Processing ChequeDeposited event");
        println!("➡️ Trigger ID: {}", trigger_id);

        // Get the CCheque object from processing
        let cheque_result = block_on(async { process_cheque_data(cheque_info).await })
            .map_err(|e| e.to_string())?;

        println!("✅ Cheque processing completed successfully");
        println!("➡️ Sender: {}", cheque_result.sender);
        println!("➡️ Receiver: {}", cheque_result.receiver);
        println!("➡️ Amount: {}", cheque_result.amount);

        // Encode the result to be sent back to the blockchain
        let output = match dest {
            Destination::Ethereum => {
                println!("📡 Sending result back to Ethereum");
                // Create the solidity representation
                let solidity_cheque = solidity::ICheque::Cheque {
                    sender: cheque_result.sender,
                    receiver: cheque_result.receiver,
                    amount: U256::from(cheque_result.amount),
                    note: cheque_result.note,
                    isPaid: cheque_result.isPaid,
                    aquaTree: cheque_result.aquaTree,
                    formContent: cheque_result.formContent,
                };
                Some(encode_trigger_output(trigger_id, solidity_cheque.abi_encode()))
            }
            Destination::CliOutput => {
                println!("📟 Preparing CLI output");
                serde_json::to_vec(&cheque_result).map_err(|e| e.to_string()).ok()
            }
        };

        println!("==================================================");
        println!("🔵 AQUA-CHEQUE COMPONENT FINISHED");
        println!("==================================================");
        Ok(output)
    }
}

/// Process the cheque data from the trigger event
async fn process_cheque_data(cheque_data: Vec<u8>) -> Result<CCheque, String> {
    // Here we'll process the raw binary data
    // For now, we'll call the existing get_price_feed function to simulate
    println!("Processing cheque data...");

    // Use the existing function which we'll assume works with a cheque ID
    // In a real implementation, we'd parse cheque_data to get the ID
    let cheque_id = 1; // Default for testing
    get_price_feed(cheque_id).await
}

async fn get_price_feed(cheque_id: u64) -> Result<CCheque, String> {
    use crate::api_check::verify_aqua_data;
    use crate::models::{AquaPayload, AquaTree, FileObject};
    use serde_json::Value;

    // In a real implementation, we would fetch the cheque data from the blockchain
    // using the cheque_id, then extract the aquaTree and formContent from it.
    // For now, we'll simulate this with some hardcoded data

    // 1. Parse the aquaTree JSON from the blockchain (simulated here)
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

    // 2. Parse the form content (simulated here)
    let form_content = r#"{
        "sender": "0xbdc64c49bf736cfe1b8233b083d3d632f26feb27",
        "receiver": "0x4a79b0d4b8feda7af5902da2d15d73a7e5fdefd4",
        "amount": 0.3,
        "currency": "ETH",
        "note": "Payment for services"
    }"#;

    // 3. Prepare the payload for server verification
    let aqua_tree: AquaTree = serde_json::from_str(aqua_tree_json)
        .map_err(|e| format!("Failed to parse aqua tree: {}", e))?;

    let file_object = FileObject {
        fileName: "cheque.json".to_string(),
        fileContent: form_content.to_string(),
        path: "/".to_string(),
    };

    let payload = AquaPayload { fileObjects: vec![file_object], aquaTree: aqua_tree.clone() };

    // 4. Verify the data with the server
    println!("Verifying cheque data with server...");
    let verification_url = "https://api.aqua-protocol.org/verify";
    let verification_result = verify_aqua_data(verification_url, &payload).await;

    match verification_result {
        Ok(response) => {
            println!("Server verification successful");
            // Parse the form data to extract sender, receiver, amount, etc.
            let form_data: Value = serde_json::from_str(form_content)
                .map_err(|e| format!("Failed to parse form content: {}", e))?;

            // Extract values from the form data
            let sender = form_data["sender"].as_str().unwrap_or_default().to_string();
            let receiver = form_data["receiver"].as_str().unwrap_or_default().to_string();
            let amount = form_data["amount"].as_f64().unwrap_or_default() as u64;
            let note = form_data["note"].as_str().unwrap_or_default().to_string();

            // Create the cheque with verified data
            Ok(CCheque {
                sender,
                receiver,
                amount,
                note,
                isPaid: false,
                aquaTree: aqua_tree_json.to_string(),
                formContent: form_content.to_string(),
            })
        }
        Err(e) => {
            println!("Server verification failed: {}", e);
            // For demo purposes, return a fallback cheque if verification fails
            // In production, you would want to return an error instead
            Ok(CCheque {
                sender: "0x254B0D7b63342Fcb8955DB82e95C21d72EFdB6f7".to_string(),
                receiver: "0x2EDf2536e4Df3f6e1BFd94054c3E91baf34E10d8".to_string(),
                amount: 10,
                note: "Fallback Test".to_string(),
                isPaid: false,
                aquaTree: "{}".to_string(),
                formContent: "{}".to_string(),
            })
        }
    }
}

#[allow(non_snake_case)]
#[derive(Debug, Serialize, Deserialize)]
pub struct CCheque {
    pub sender: String,
    pub receiver: String,
    pub amount: u64,
    pub note: String,
    pub isPaid: bool,
    pub aquaTree: String,
    pub formContent: String,
}

/// Results structure to be returned from component processing
#[derive(Debug, Serialize, Deserialize)]
pub struct ChequeResult {
    pub cheque_id: u64,
    pub result_hash: String,
}

mod solidity {
    use alloy_sol_macro::sol;
    pub use ICheque::*;

    sol!("../../src/interfaces/ICheque.sol");
}
