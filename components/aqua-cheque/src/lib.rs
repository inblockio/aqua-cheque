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
        let (trigger_id, req, dest) =
            decode_trigger_event(action.data).map_err(|e| e.to_string())?;

        // let res = block_on(async move {
        //     let cheque = get_price_feed(1).await?;
        //     cheque
        // })?;

        let res = block_on(async { get_price_feed(1).await })?;

        println!("We are heading forward");
        let output = match dest {
            Destination::Ethereum => {
                // Convert CCheque to solidity::ICheque::Cheque
                let solidity_cheque = solidity::ICheque::Cheque {
                    sender: res.sender,
                    receiver: res.receiver,
                    amount: U256::from(res.amount),
                    note: res.note,
                    isPaid: res.isPaid,
                    aquaTree: res.aquaTree,
                    formContent: res.formContent,
                };
                let encoded_cheque = solidity::ICheque::Cheque::abi_encode(&solidity_cheque);
                Some(encode_trigger_output(trigger_id, solidity_cheque.abi_encode()))
            }
            Destination::CliOutput => serde_json::to_vec(&res).map_err(|e| e.to_string()).ok(),
        };
        println!("We are about to send the trigger");
        Ok(output)
    }
}

async fn get_price_feed(_id: u64) -> Result<CCheque, String> {
    Ok(CCheque {
        sender: "0x254B0D7b63342Fcb8955DB82e95C21d72EFdB6f7".to_string(),
        receiver: "0x2EDf2536e4Df3f6e1BFd94054c3E91baf34E10d8".to_string(),
        amount: 10,
        note: "First Test".to_string(),
        isPaid: false,
        aquaTree: "{}".to_string(),
        formContent: "{}".to_string(),
    })
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

// ... (rest of your code, including Root, Data, Statistics, etc.)

mod solidity {
    use alloy_sol_macro::sol;
    pub use ICheque::*;

    sol!("../../src/interfaces/ICheque.sol");
}
