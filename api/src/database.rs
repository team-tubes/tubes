use poem::{http::StatusCode, Error, FromRequest, Request, RequestBody, Result};
use sqlx::PgPool;
use tracing::error;

use crate::data::Complaint;

pub struct ComplaintsRepository(PgPool);

impl ComplaintsRepository {
    pub async fn create_complaint(&self, complaint: Complaint) -> Result<(), sqlx::Error> {
        let mut transaction = self.0.begin().await?;

        sqlx::query!(
            "insert into complaints (first_name, last_name, email, phone, lng, lat, address, complaint) values ($1, $2, $3, $4, $5, $6, $7, $8)", 
            complaint.person.first_name,
            complaint.person.last_name,
            complaint.person.email,
            complaint.person.phone,
            complaint.location.lng,
            complaint.location.lat,
            complaint.location.address,
            complaint.description
        ).execute(&mut *transaction).await?;

        transaction.commit().await?;

        Ok(())
    }
}

#[poem::async_trait]
impl<'a> FromRequest<'a> for ComplaintsRepository {
    async fn from_request(req: &'a Request, _: &mut RequestBody) -> Result<Self> {
        let pool = req
            .data::<PgPool>()
            .ok_or_else(|| {error!("No postgres database connection found, please make sure there is one in the application"); Error::from_status(StatusCode::INTERNAL_SERVER_ERROR)})?;

        Ok(Self(pool.to_owned()))
    }
}
