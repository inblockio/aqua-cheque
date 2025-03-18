use crate::bindings::wavs::worker::layer_types::{TriggerData, TriggerDataEthContractEvent};
use alloy_sol_types::{sol_data::Bytes, SolValue};
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
            println!("WE SHOULD SEE LOGS");
            let event: solidity::ChequeDeposited = decode_event_log_data!(log)?;
            // let trigger_info = solidity::Cheque::abi_decode(&event.data, false)?;
            let trigger_info = event.data;
            let info = ChequeInfo::abi_decode(&trigger_info, false)?;
            let data = Cheque::abi_decode(&info.data, false)?;

            println!("sending {} from {} to {}", data.amount, data.sender, data.receiver);

            Ok((event.chequeId, Cheque::abi_encode(&data).to_vec(), Destination::Ethereum))
        }
        TriggerData::Raw(data) => Ok((0.try_into().unwrap(), data.clone(), Destination::CliOutput)),
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
