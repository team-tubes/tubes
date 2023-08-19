use crate::ApiTags;
use chrono::{DateTime, Utc};
use poem::{http::StatusCode, Error, Result};
use poem_openapi::{payload::Json, Object, OpenApi};
use reqwest::{Client, ClientBuilder};
use serde::{Deserialize, Serialize};
use tracing::error;

#[derive(Object, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OutageSummary {
    #[oai(rename = "outageId")]
    outage_id: u32,
    location: String,
    latitude: f64,
    longitude: f64,
    #[oai(rename = "startDate")]
    start_date: Option<DateTime<Utc>>,
    #[oai(rename = "endDate")]
    end_date: Option<DateTime<Utc>>,
    #[oai(rename = "outageType")]
    outage_type: String,
    #[oai(rename = "tbcStart")]
    tbc_start: bool,
    #[oai(rename = "tbcEnd")]
    tbc_end: bool,
}

pub struct Proxy {
    client: Client,
}

impl Proxy {
    pub fn new() -> Self {
        Self {
            client: ClientBuilder::new()
                .user_agent("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36")
                .build()
                .expect("Could not create HTTP client"),
        }
    }
}

async fn reqwest_to_poem(request: reqwest::Response) -> poem::Response {
    let mut response = poem::Response::default();
    let headers = response.headers_mut();

    for (header, value) in request.headers() {
        headers.insert(header, value.clone());
    }

    if let Ok(body) = request.bytes().await {
        response.set_body(body);
    }

    response
}

#[OpenApi(tag = "ApiTags::Proxise")]
impl Proxy {
    #[oai(path = "/watercare/all", method = "get")]
    /// Proxies [https://api.watercare.co.nz/outages/all](https://api.watercare.co.nz/outages/all) to avoid cors issues to
    async fn get_watercare(&self) -> Result<Json<Vec<OutageSummary>>> {
        let result = self
            .client
            .get("https://api.watercare.co.nz/outages/all")
            .send()
            .await
            .map_err(|ex| {
                error!("Could not get all watercare outages {ex}");
                Error::from_status(StatusCode::INTERNAL_SERVER_ERROR)
            })?;

        if result.status() != StatusCode::OK {
            return Err(Error::from_response(reqwest_to_poem(result).await));
        }

        Ok(Json(result.json().await.map_err(|ex| {
            error!("Could not get all watercare outages {ex}");
            Error::from_status(StatusCode::INTERNAL_SERVER_ERROR)
        })?))
    }
}
