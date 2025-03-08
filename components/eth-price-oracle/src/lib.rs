mod api_checks;
mod models;
mod trigger;
use models::{AquaPayload, AquaTree, FileObject};
use trigger::{decode_trigger_event, encode_trigger_output, Destination};
use wavs_wasi_chain::http::{fetch_json, http_request_get};
pub mod bindings;
use crate::api_checks::verify_aqua_data;
use crate::bindings::{export, Guest, TriggerAction};
use serde::{Deserialize, Serialize};
use wstd::{http::HeaderValue, runtime::block_on};

struct Component;
export!(Component with_types_in bindings);

impl Guest for Component {
    fn run(action: TriggerAction) -> std::result::Result<Option<Vec<u8>>, String> {
        let (trigger_id, req, dest) =
            decode_trigger_event(action.data).map_err(|e| e.to_string())?;

        // Convert bytes to string and parse first char as u64
        let input = std::str::from_utf8(&req).map_err(|e| e.to_string())?;
        println!("====================================================");
        println!("input data : {}", input);

        // let id = input.chars().next().ok_or("Empty input")?;
        // let id = id.to_digit(16).ok_or("Invalid hex digit")? as u64;

        // Deserialize the input string to AquaTree structure
        let aqua_tree = serde_json::from_str::<AquaTree>(input)
            .map_err(|e| format!("Failed to parse AquaTree: {}", e))?;

        // let aqua_tree_result: Result<AquaTree> = serde_json::from_str(input);
        let payload: AquaPayload = AquaPayload { fileObjects: Vec::new(), aquaTree: aqua_tree };

        let res = block_on(async move {
            let resp_data = verify_aqua_data(
                "http://164.92.183.228:3600/file/object/".to_string().as_str(),
                &payload,
            )
            .await?;
            println!("====================================================");
            println!("API resp_data: {:?}", resp_data);
            serde_json::to_vec(&resp_data).map_err(|e| e.to_string())
        })?;

        let output = match dest {
            Destination::Ethereum => Some(encode_trigger_output(trigger_id, &res)),
            Destination::CliOutput => Some(res),
        };
        Ok(output)
    }
}

async fn get_price_feed(id: u64) -> Result<PriceFeedData, String> {
    let url: String = format!(
        "https://api.coinmarketcap.com/data-api/v3/cryptocurrency/detail?id={}&range=1h",
        id
    );

    let current_time = std::time::SystemTime::now().elapsed().unwrap().as_secs();

    let mut req = http_request_get(&url).map_err(|e| e.to_string())?;
    req.headers_mut().insert("Accept", HeaderValue::from_static("application/json"));
    req.headers_mut().insert("Content-Type", HeaderValue::from_static("application/json"));
    req.headers_mut()
        .insert("User-Agent", HeaderValue::from_static("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36"));
    req.headers_mut().insert(
        "Cookie",
        HeaderValue::from_str(&format!("myrandom_cookie={}", current_time)).unwrap(),
    );

    let json: Root = fetch_json(req).await.map_err(|e| e.to_string())?;

    Ok(PriceFeedData {
        symbol: json.data.symbol,
        price: json.data.statistics.price,
        timestamp: json.status.timestamp,
    })
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PriceFeedData {
    symbol: String,
    timestamp: String,
    price: f64,
}

/// -----
/// <https://transform.tools/json-to-rust-serde>
/// Generated from <https://api.coinmarketcap.com/data-api/v3/cryptocurrency/detail?id=1&range=1h>
/// -----
///
#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Root {
    pub data: Data,
    pub status: Status,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Data {
    pub id: f64,
    pub name: String,
    pub symbol: String,
    pub statistics: Statistics,
    pub description: String,
    pub category: String,
    pub slug: String,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Statistics {
    pub price: f64,
    #[serde(rename = "totalSupply")]
    pub total_supply: f64,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct CoinBitesVideo {
    pub id: String,
    pub category: String,
    #[serde(rename = "videoUrl")]
    pub video_url: String,
    pub title: String,
    pub description: String,
    #[serde(rename = "previewImage")]
    pub preview_image: String,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Status {
    pub timestamp: String,
    pub error_code: String,
    pub error_message: String,
    pub elapsed: String,
    pub credit_count: f64,
}
