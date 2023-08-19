use std::env;

use api::Api;
use poem::{
    endpoint::{EmbeddedFileEndpoint, EmbeddedFilesEndpoint},
    listener::TcpListener,
    EndpointExt, Route, Server,
};
use poem_openapi::OpenApiService;
use rust_embed::RustEmbed;
use sqlx::{postgres::PgPoolOptions, Connection};

mod api;
mod data;
mod database;
mod templates;

#[derive(RustEmbed)]
#[folder = "static"]
struct Files;

#[tokio::main]
async fn main() -> Result<(), std::io::Error> {
    _ = dotenv::dotenv();

    if std::env::var_os("RUST_LOG").is_none() {
        std::env::set_var("RUST_LOG", "debug");
    }

    let conn_str = env::var("DATABASE_URL").expect("Please set DATABASE_URL");
    let conn = PgPoolOptions::new()
        .connect(&conn_str)
        .await
        .expect("Could not connect to database");

    tracing_subscriber::fmt::init();

    let api_service =
        OpenApiService::new(Api, "Infra.nz", "1.0").server("http://localhost:3000/api");

    let ui = api_service.swagger_ui();
    let spec = api_service.spec_endpoint();
    let app = Route::new()
        .at("/", EmbeddedFileEndpoint::<Files>::new("index.html"))
        .at(
            "/view_complaints",
            EmbeddedFileEndpoint::<Files>::new("view_complaints.html"),
        )
        .nest("/static", EmbeddedFilesEndpoint::<Files>::new())
        .nest("/api", api_service)
        .nest("/docs", ui)
        .nest("/spec.json", spec)
        .data(conn);

    Server::new(TcpListener::bind("127.0.0.1:3000"))
        .run(app)
        .await
}
