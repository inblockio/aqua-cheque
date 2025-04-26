mod trigger;
use trigger::{decode_trigger_event, encode_trigger_output, Destination};
use wavs_wasi_chain::ethereum::alloy_primitives::U256;
pub mod bindings; // This will be auto-generated
use crate::bindings::{export, Guest, TriggerAction};
use serde::{Deserialize, Serialize};
use wstd::runtime::block_on;

pub mod models;
pub mod payout_service;

struct Component;
export!(Component with_types_in bindings);

impl Guest for Component {
    fn run(action: TriggerAction) -> std::result::Result<Option<Vec<u8>>, String> {
        println!("==================================================");
        println!("🟣 PAYOUT-CHEQUE COMPONENT STARTED");
        println!("==================================================");
        println!("Received trigger action");

        // Decode the trigger event to get payout request details
        let (trigger_id, payout_req, dest) =
            decode_trigger_event(action.data).map_err(|e| e.to_string())?;

        println!("💰 Processing payout request");
        println!("➡️ Request ID: {}", payout_req.request_id);
        println!("➡️ Cheque ID: {}", payout_req.cheque_id);
        println!("➡️ Recipient: {}", payout_req.recipient);

        // Process the payout request
        let payout_result = block_on(async { process_payout_request(&payout_req).await })
            .map_err(|e| e.to_string())?;

        println!(
            "✅ Payout processing completed: {}",
            if payout_result.success { "SUCCESS" } else { "FAILED" }
        );
        println!("➡️ Message: {}", payout_result.message);

        // Encode the result to be sent back to the blockchain
        let output = match dest {
            Destination::Ethereum => {
                println!("📡 Sending payout result back to Ethereum");
                println!("➡️ Success: {}", payout_result.success);
                Some(encode_trigger_output(trigger_id, payout_result.success))
            }
            Destination::CliOutput => {
                println!("📟 Preparing CLI output");
                serde_json::to_vec(&payout_result).map_err(|e| e.to_string()).ok()
            }
        };

        println!("==================================================");
        println!("🟣 PAYOUT-CHEQUE COMPONENT FINISHED");
        println!("==================================================");
        Ok(output)
    }
}

/// Process a payout request
async fn process_payout_request(
    req: &models::PayoutRequest,
) -> Result<models::PayoutResult, String> {
    use crate::models::PayoutResult;
    use crate::payout_service::{fetch_cheque_data, process_payout, verify_payout_request};

    println!("Verifying cheque status before payout");

    // Fetch the cheque data from the blockchain
    let cheque_data = fetch_cheque_data(req.cheque_id)
        .await
        .map_err(|e| format!("Failed to fetch cheque data: {}", e))?;

    // Verify the payout request
    let is_valid = verify_payout_request(req, &cheque_data)
        .await
        .map_err(|e| format!("Failed to verify payout: {}", e))?;

    if !is_valid {
        println!("❌ Payout verification failed");
        return Ok(PayoutResult {
            request_id: req.request_id.clone(),
            cheque_id: req.cheque_id,
            recipient: req.recipient.clone(),
            success: false,
            message: "Payout verification failed".to_string(),
            amount: None,
        });
    }

    println!("✅ Verification passed - proceeding with payout");

    // Execute the payout
    println!("Executing payout to recipient: {}", req.recipient);
    match process_payout(req, &cheque_data).await {
        Ok(tx_confirmation) => {
            println!("✅ Payout successful! Transaction hash: {}", tx_confirmation.tx_hash);
            Ok(PayoutResult {
                request_id: req.request_id.clone(),
                cheque_id: req.cheque_id,
                recipient: req.recipient.clone(),
                success: true,
                message: format!(
                    "Payout successful. Transaction hash: {}",
                    tx_confirmation.tx_hash
                ),
                amount: Some(cheque_data.amount),
            })
        }
        Err(e) => {
            println!("❌ Payout failed: {}", e);
            Ok(PayoutResult {
                request_id: req.request_id.clone(),
                cheque_id: req.cheque_id,
                recipient: req.recipient.clone(),
                success: false,
                message: format!("Payout failed: {}", e),
                amount: None,
            })
        }
    }
}
