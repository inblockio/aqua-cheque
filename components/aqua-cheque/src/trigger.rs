use crate::bindings::wavs::worker::layer_types::{TriggerData, TriggerDataEthContractEvent};
use alloy_sol_types::SolValue;
use anyhow::Result;
use solidity::{Cheque, ChequeInfo};
use wavs_wasi_chain::{decode_event_log_data, ethereum::alloy_primitives::ruint::aliases::U256};

pub enum Destination {
    Ethereum,
    CliOutput,
}

pub fn decode_trigger_event(trigger_data: TriggerData) -> Result<(U256, Vec<u8>, Destination)> {
    match trigger_data {
        TriggerData::EthContractEvent(TriggerDataEthContractEvent { log, .. }) => {
            println!("Processing contract event from blockchain");

            // Decode the event data from the log
            let event: solidity::ChequeDeposited = decode_event_log_data!(log)?;
            let trigger_info = event.data;
            let info = ChequeInfo::abi_decode(&trigger_info, false)?;
            let data = Cheque::abi_decode(&info.data, false)?;

            // Log the cheque details for debugging
            println!(
                "Cheque details: ID={}, Amount={}, Sender={}, Receiver={}",
                event.chequeId, data.amount, data.sender, data.receiver
            );
            println!("AquaTree hash: {}", data.aquaTree);

            // Validate that required fields are present
            if data.sender.is_empty() || data.receiver.is_empty() || data.amount == U256::ZERO {
                return Err(anyhow::anyhow!("Invalid cheque data: missing required fields"));
            }

            // Check if the aquaTree is present
            if data.aquaTree.is_empty() {
                println!("Warning: AquaTree is empty, verification may fail");
            }

            // Check if the formContent is present
            if data.formContent.is_empty() {
                println!("Warning: FormContent is empty, verification may fail");
            }

            // Return the decoded data for further processing
            Ok((event.chequeId, Cheque::abi_encode(&data).to_vec(), Destination::Ethereum))
        }
        TriggerData::Raw(data) => {
            println!("Processing raw trigger data");
            Ok((0.try_into().unwrap(), data.clone(), Destination::CliOutput))
        }
        _ => Err(anyhow::anyhow!("Unsupported trigger data type")),
    }
}

pub fn encode_trigger_output(cheque_id: U256, output: impl AsRef<[u8]>) -> Vec<u8> {
    solidity::DataWithId { chequeId: cheque_id, data: output.as_ref().to_vec().into() }.abi_encode()
}

mod solidity {
    use alloy_sol_macro::sol;
    pub use ICheque::*;

    sol!("../../src/interfaces/ICheque.sol");
}
