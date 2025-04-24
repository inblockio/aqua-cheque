use crate::{bindings::wavs::worker::layer_types::TriggerData, models::PayoutRequest};
use alloy_sol_types::SolValue;
use anyhow::{anyhow, Result};
use serde::{Deserialize, Serialize};
use wavs_wasi_chain::ethereum::alloy_primitives::{hex, U256};

pub enum Destination {
    Ethereum,
    CliOutput,
}

/// Decode the trigger event data from the blockchain
pub fn decode_trigger_event(data: TriggerData) -> Result<(U256, PayoutRequest, Destination)> {
    let trigger_id = U256::from(0);
    let destination = Destination::Ethereum; // Default to Ethereum

    // In a real implementation, this would decode the actual event data
    // from the PayoutRequested event in PayoutTrigger.sol

    // Format: event PayoutRequested(bytes32 indexed requestId, ICheque.ChequeId chequeId, address recipient)

    // For now, simulate the data
    let request = PayoutRequest {
        request_id: format!("0x{}", hex::encode([2u8; 32])),
        cheque_id: 1,
        recipient: "0x4a79b0d4b8feda7af5902da2d15d73a7e5fdefd4".to_string(),
    };

    Ok((trigger_id, request, destination))
}

/// Encode the trigger output data for submission back to the blockchain
pub fn encode_trigger_output(trigger_id: U256, success: bool) -> Vec<u8> {
    // In a real implementation, this would encode the data for the
    // processPayout function in the PayoutTrigger contract

    // For this example, we'll create a simple encoding that includes:
    // 1. The trigger ID (request_id as bytes32)
    // 2. The success status (boolean)

    let mut output = Vec::new();

    // Append the trigger ID (32 bytes)
    let trigger_id_bytes = trigger_id.to_be_bytes::<32>();
    output.extend_from_slice(&trigger_id_bytes);

    // Append the success boolean (1 byte)
    output.push(if success { 1 } else { 0 });

    output
}
