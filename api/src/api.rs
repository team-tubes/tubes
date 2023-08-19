use crate::{
    data::{Complaint, Location, Person},
    database::ComplaintsRepository,
    templates, ApiTags,
};
use poem::{error::ResponseError, http::StatusCode, web::Accept, Error, Result};
use poem_openapi::{
    param::Query,
    payload::{Form, Html, Json},
    types::ToJSON,
    ApiResponse, Object, OpenApi, ResponseContent,
};
use serde::{Deserialize, Serialize};
use serde_with::{serde_as, NoneAsEmptyString};
use tracing::error;

#[serde_as]
#[derive(Deserialize, Serialize, Debug, Object)]
pub struct PostComplaintParams {
    fname: String,
    lname: String,
    email: String,
    lat: f64,
    lng: f64,
    description: String,

    #[serde_as(as = "NoneAsEmptyString")]
    #[serde(default)]
    address: Option<String>,

    #[serde_as(as = "NoneAsEmptyString")]
    #[serde(default)]
    phone_country: Option<i32>,

    #[serde_as(as = "NoneAsEmptyString")]
    #[serde(default)]
    phone: Option<i32>,
}

impl From<PostComplaintParams> for Complaint {
    fn from(value: PostComplaintParams) -> Self {
        Complaint {
            id: 0,
            description: value.description,
            location: Location {
                address: value.address,
                lat: value.lat,
                lng: value.lng,
            },
            person: Person {
                first_name: value.fname,
                last_name: value.lname,
                email: value.email,
                phone: value.phone.map(move |number| {
                    if let Some(country_code) = value.phone_country {
                        format!("+{country_code} {number}")
                    } else {
                        number.to_string()
                    }
                }),
            },
        }
    }
}

#[derive(Debug, ApiResponse)]
enum GetComplaint {
    #[oai(status = 200)]
    /// When a complaint has been successfully submitted
    Success(Html<String>),
}

impl ResponseError for GetComplaint {
    fn status(&self) -> StatusCode {
        StatusCode::NOT_IMPLEMENTED
    }
}

#[derive(ResponseContent)]
pub enum HtmlPossibleResponse<T: ToJSON + Send + Sync + Serialize> {
    Json(Json<T>),
    Html(Html<String>),
}

#[derive(ApiResponse)]
enum GetResponseResult {
    #[oai(status = 200)]
    Ok(HtmlPossibleResponse<Vec<Complaint>>),
}

pub struct Api;

#[OpenApi(tag = "ApiTags::ComplaintsApi")]
impl Api {
    #[oai(path = "/complaints", method = "post")]
    async fn create_complaint(
        &self,
        data: Form<PostComplaintParams>,
        complaint_repo: ComplaintsRepository,
    ) -> Result<GetComplaint> {
        complaint_repo
            .create_complaint(data.0.into())
            .await
            .map_err(|err| {
                error!("Error creating complaint {}", err);
                Error::from_status(StatusCode::INTERNAL_SERVER_ERROR)
            })?;

        Ok(GetComplaint::Success(Html(
            "<p>Successfully submitted complaint</p>".into(),
        )))
    }

    #[oai(path = "/complaints", method = "get")]
    async fn get_complaints(
        &self,
        #[oai(default = "default_limit")] limit: Query<u32>,
        #[oai(default = "default_offset")] offset: Query<u32>,
        complaint_repo: ComplaintsRepository,
        accept: Accept,
    ) -> Result<GetResponseResult> {
        let complaints = complaint_repo
            .get_complaints(offset.0, limit.0)
            .await
            .map_err(|err| {
                error!("Error getting complaints: {err}");
                Error::from_status(StatusCode::INTERNAL_SERVER_ERROR)
            })?;

        match accept.0.first().map(|l| l.as_ref()) {
            Some("text/html") => Ok(GetResponseResult::Ok(HtmlPossibleResponse::Html(Html(
                templates::render_complaints(complaints).map_err(|err| {
                    error!("Error rendering complaints template: {err:?}");
                    Error::from_status(StatusCode::INTERNAL_SERVER_ERROR)
                })?,
            )))),
            Some("application/json") | _ => Ok(GetResponseResult::Ok(HtmlPossibleResponse::Json(
                Json(complaints),
            ))),
        }
    }
}

fn default_limit() -> u32 {
    25
}

fn default_offset() -> u32 {
    0
}
