use poem::{http::StatusCode, Error, FromRequest, Request, RequestBody, Result};
use sqlx::PgPool;
use tracing::error;

use crate::data::{Complaint, Location, Person};

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

    pub async fn get_complaints(
        &self,
        offset: u32,
        limit: u32,
    ) -> Result<Vec<Complaint>, sqlx::Error> {
        let mut transaction = self.0.begin().await?;

        let result = sqlx::query!(
            "select * from complaints offset $1 limit $2",
            offset as i64,
            limit as i64
        )
        .fetch_all(&mut *transaction)
        .await?;

        transaction.commit().await?;
        Ok(result
            .into_iter()
            .map(|x| Complaint {
                id: x.id,
                description: x.complaint,
                location: Location {
                    lat: x.lat,
                    lng: x.lng,
                    address: x.address,
                },
                person: Person {
                    email: x.email,
                    first_name: x.first_name,
                    last_name: x.last_name,
                    phone: x.phone,
                },
            })
            .collect())
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
