use poem_openapi::Object;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Object)]
pub struct Location {
    pub lng: f64,
    pub lat: f64,
    pub address: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Object)]
pub struct Person {
    pub first_name: String,
    pub last_name: String,
    pub email: String,
    pub phone: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Object)]
pub struct Complaint {
    pub id: i32,
    pub location: Location,
    pub person: Person,
    pub description: String,
}
