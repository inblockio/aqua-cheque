use alloy_sol_types::SolValue;
use anyhow::{anyhow, Result};
use serde::{Deserialize, Serialize};
use wavs_wasi_chain::ethereum::alloy_primitives::{hex, U256};

use crate::bindings::wavs::worker::layer_types::TriggerData;

pub enum Destination {
    Ethereum,
    CliOutput,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct VerificationRequest {
    pub request_id: String,
    pub cheque_id: u64,
    pub aqua_tree_hash: String,
    pub form_revision_hash: String,
}

/// Decode the trigger event data from the blockchain
pub fn decode_trigger_event(data: TriggerData) -> Result<(U256, VerificationRequest, Destination)> {
    let trigger_id = U256::from(0);
    let destination = Destination::Ethereum; // Default to Ethereum

    // In a real implementation, this would decode the actual event data
    // from the VerificationRequested event

    // Decode the VerificationRequested event from our VerificationTrigger contract
    // Format is: event VerificationRequested(bytes32 indexed requestId, ICheque.ChequeId chequeId, string aquaTreeHash, string formRevisionHash)

    // For now, we'll simulate with example data
    let request = VerificationRequest {
        request_id: format!("0x{}", hex::encode([1u8; 32])),
        cheque_id: 1,
        aqua_tree_hash: "0xf9d2dae2993d89104aae9a86d4cdc91322b979db4abd97ecfe38b4cfbf107449"
            .to_string(),
        form_revision_hash: "0xa9041193cecffad533b8eaee36f419a1f2406fc8e6a01c2014d4ee7002723c42"
            .to_string(),
    };

    Ok((trigger_id, request, destination))
}

/// Encode the trigger output data for submission back to the blockchain
pub fn encode_trigger_output(trigger_id: U256, success: bool) -> Vec<u8> {
    // In a real implementation, this would encode the data for the
    // processVerificationResult function in the VerificationTrigger contract

    // For this example, we'll create a simple encoding that includes:
    // 1. The trigger ID
    // 2. The success boolean

    let mut output = Vec::new();

    // Append the trigger ID (32 bytes)
    let trigger_id_bytes = trigger_id.to_be_bytes::<32>();
    output.extend_from_slice(&trigger_id_bytes);

    // Append the success boolean (1 byte)
    output.push(if success { 1 } else { 0 });

    output
}
