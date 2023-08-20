use crate::ApiTags;
use chrono::{DateTime, Utc};
use poem::{http::StatusCode, Error, Result};
use poem_openapi::{param::Path, payload::Json, Object, OpenApi};
use reqwest::{
    header::{self, HeaderMap},
    Client, ClientBuilder,
};
use serde::{Deserialize, Serialize};
use tracing::error;

#[derive(Object, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OutageCommon {
    location: String,
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

#[derive(Object, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OutageSummary {
    #[oai(rename = "outageId")]
    outage_id: u32,
    latitude: f64,
    longitude: f64,
    #[serde(flatten)]
    #[oai(flatten)]
    common: OutageCommon,
}

#[derive(Object, Serialize, Deserialize)]
pub struct OutageDetailed {
    id: u32,
    duration: u32,
    #[oai(rename = "propertiesAffected")]
    #[serde(rename = "propertiesAffected")]
    properties_affected: u32,
    description: String,
    #[serde(flatten)]
    #[oai(flatten)]
    common: OutageCommon,
}

#[derive(Object, Serialize, Deserialize)]
pub struct Site {
    role: String,
    impact: u32,
    poly: Option<String>,
    point: Option<String>,
}

#[derive(Object, Serialize, Deserialize)]
pub struct CloudflareOutages {
    start_time: f64,
    rest_time: f64,
    description: Option<String>,
    status: String,
    sites: Vec<Site>,
}

pub struct Proxy {
    client: Client,
    chorus_map: HeaderMap,
}

impl Proxy {
    pub fn new() -> Self {
        Self {
            client: ClientBuilder::new()
                .user_agent("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36")
                .gzip(true)
                .build()
                .expect("Could not create HTTP client"),
            chorus_map: HeaderMap::from_iter([
                (header::ACCEPT, header::HeaderValue::from_static("application/json, text/plain, */*")),
                (header::ACCEPT_LANGUAGE, header::HeaderValue::from_static("en-US,en;q=0.9")),
                (header::AUTHORIZATION, header::HeaderValue::from_static("Basic NDlkY2Q3ZDU5OGM2NGRiNzk4YTA1OTg3OWFhMDAxOTE6M2Q0YTUyM2ZiNjc4NGU2NzhBOTU2M0QyOEUyNTUyRDY=")),
                (header::REFERER, header::HeaderValue::from_static("https://www.chorus.co.nz/")),
                (header::REFERRER_POLICY, header::HeaderValue::from_static("strict-origin-when-cross-origin")),
                (header::ACCEPT_ENCODING, header::HeaderValue::from_static("gzip"))
            ])
        }
    }
}

async fn reqwest_to_poem(request: reqwest::Response) -> poem::Response {
    let mut response = poem::Response::default();
    response.set_status(request.status());
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

    #[oai(path = "/watercare/:id", method = "get")]
    /// Proxies [https://api.watercare.co.nz/outages/all/:id/details](https://api.watercare.co.nz/outages/:id/details) to avoid cors issues to
    async fn get_watercare_detailed(&self, id: Path<u32>) -> Result<Json<OutageDetailed>> {
        let result = self
            .client
            .get(format!(
                "https://api.watercare.co.nz/outages/outage/{}/details",
                id.0
            ))
            .send()
            .await
            .map_err(|ex| {
                error!("Could not get watercare outage {ex}");
                Error::from_status(StatusCode::INTERNAL_SERVER_ERROR)
            })?;

        if result.status() != StatusCode::OK {
            return Err(Error::from_response(reqwest_to_poem(result).await));
        }

        // println!("{}", result.text().await.unwrap());

        // return Err(Error::from_status(StatusCode::NOT_IMPLEMENTED));

        Ok(Json(result.json().await.map_err(|ex| {
            error!("Could not get all watercare outages {ex}");
            Error::from_status(StatusCode::INTERNAL_SERVER_ERROR)
        })?))
    }

    #[oai(path = "/chorus", method = "get")]
    async fn chorus(&self) -> Result<Json<Vec<CloudflareOutages>>> {
        let result = self
            .client
            .get("https://api.chorus.co.nz/events/v3/incidents")
            .headers(self.chorus_map.clone())
            .fetch_mode_no_cors()
            .send()
            .await
            .map_err(|ex| {
                error!("Could not get chorus outages {ex}");
                Error::from_status(StatusCode::INTERNAL_SERVER_ERROR)
            })?;

        if result.status() != StatusCode::OK {
            return Err(Error::from_response(reqwest_to_poem(result).await));
        }

        // println!("{}", result.text().await.unwrap());

        // return Err(Error::from_status(StatusCode::NOT_IMPLEMENTED));

        Ok(Json(result.json().await.map_err(|ex| {
            error!("Could not get all watercare outages {ex}");
            Error::from_status(StatusCode::INTERNAL_SERVER_ERROR)
        })?))
    }
}
