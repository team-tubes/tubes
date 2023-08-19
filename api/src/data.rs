use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Location {
    pub lng: f64,
    pub lat: f64,
    pub address: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Person {
    pub first_name: String,
    pub last_name: String,
    pub email: String,
    pub phone: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Complaint {
    pub id: i32,
    pub location: Location,
    pub person: Person,
    pub description: String,
}
