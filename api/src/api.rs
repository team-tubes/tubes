use crate::{
    data::{Complaint, Location, Person},
    database::ComplaintsRepository,
};
use poem::{error::ResponseError, http::StatusCode, Error, Result};
use poem_openapi::{
    payload::{Form, Html},
    ApiResponse, Object, OpenApi,
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

    #[oai(status = 501)]
    /// I forgor to do it 💀
    Todo,
}

impl ResponseError for GetComplaint {
    fn status(&self) -> StatusCode {
        StatusCode::NOT_IMPLEMENTED
    }
}
pub struct Api;

#[OpenApi]
impl Api {
    #[oai(path = "/complaint", method = "post")]
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
}
