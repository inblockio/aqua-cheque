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
        println!("PayoutCheque component running...");

        // Decode the trigger event to get payout request details
        let (trigger_id, req, dest) =
            decode_trigger_event(action.data).map_err(|e| e.to_string())?;

        println!("Processing payout request ID: {}", req.request_id);
        println!("Cheque ID: {}", req.cheque_id);
        println!("Recipient: {}", req.recipient);

        // Process the payout request
        let payout_result =
            block_on(async { process_payout_request(&req).await }).map_err(|e| e.to_string())?;

        // Encode the result to be sent back to the blockchain
        let output = match dest {
            Destination::Ethereum => {
                // Encode the payout result for the smart contract
                Some(encode_trigger_output(trigger_id, payout_result.success))
            }
            Destination::CliOutput => {
                // Output for CLI testing
                serde_json::to_vec(&payout_result).map_err(|e| e.to_string()).ok()
            }
        };

        println!(
            "Payout processing completed: {}",
            if payout_result.success { "SUCCESS" } else { "FAILED" }
        );
        Ok(output)
    }
}

/// Processes a payout request by validating and executing the payment
async fn process_payout_request(
    req: &models::PayoutRequest,
) -> Result<models::PayoutResult, String> {
    use crate::models::PayoutResult;
    use crate::payout_service::{
        fetch_cheque_data, process_payout, record_payout_status, verify_payout_request,
    };

    println!("Starting payout process flow...");

    // Step 1: Fetch the cheque data from the blockchain
    let cheque_data = fetch_cheque_data(req.cheque_id)
        .await
        .map_err(|e| format!("Failed to fetch cheque data: {}", e))?;

    println!("Cheque data retrieved, amount: {}", cheque_data.amount);

    // Step 2: Verify the payout request
    let verification_result = verify_payout_request(req, &cheque_data)
        .await
        .map_err(|e| format!("Payout verification error: {}", e))?;

    if !verification_result {
        let result = PayoutResult {
            request_id: req.request_id.clone(),
            cheque_id: req.cheque_id,
            recipient: req.recipient.clone(),
            success: false,
            message: "Payout verification failed".to_string(),
            amount: None,
        };

        // Record the failed status
        let _ = record_payout_status(req, &result).await;

        return Ok(result);
    }

    // Step 3: Process the actual payout
    match process_payout(req, &cheque_data).await {
        Ok(confirmation) => {
            let result = PayoutResult {
                request_id: req.request_id.clone(),
                cheque_id: req.cheque_id,
                recipient: req.recipient.clone(),
                success: true,
                message: format!("Payment successful, tx hash: {}", confirmation.tx_hash),
                amount: Some(cheque_data.amount),
            };

            // Record the successful status
            let _ = record_payout_status(req, &result).await;

            Ok(result)
        }
        Err(e) => {
            let error_msg = format!("Payment processing failed: {}", e);
            println!("{}", error_msg);

            let result = PayoutResult {
                request_id: req.request_id.clone(),
                cheque_id: req.cheque_id,
                recipient: req.recipient.clone(),
                success: false,
                message: error_msg,
                amount: None,
            };

            // Record the failed status
            let _ = record_payout_status(req, &result).await;

            Ok(result)
        }
    }
}
