#![allow(non_upper_case_globals)]

use api::Api;
use poem::{
    endpoint::{EmbeddedFileEndpoint, EmbeddedFilesEndpoint},
    listener::{Listener, RustlsCertificate, RustlsConfig, TcpListener},
    middleware::Cors,
    EndpointExt, Route, Server,
};
use poem_openapi::{OpenApiService, Tags};
use proxy::Proxy;
use reqwest::Method;
use rust_embed::RustEmbed;
use sqlx::postgres::{PgConnectOptions, PgPoolOptions};
use std::{env, fs};

mod api;
mod data;
mod database;
mod proxy;
mod templates;

#[derive(Tags)]
enum ApiTags {
    #[oai(rename = "Complaints API")]
    ComplaintsApi,
    Proxise,
}

#[cfg(debug_assertions)]
const SERVER: &str = "http://localhost:3000/api";

#[cfg(not(debug_assertions))]
const SERVER: &str = "https://api.infra.nz/api";

#[derive(RustEmbed)]
#[folder = "static"]
struct Files;

#[tokio::main]
async fn main() -> Result<(), std::io::Error> {
    _ = dotenv::dotenv();

    if std::env::var_os("RUST_LOG").is_none() {
        std::env::set_var("RUST_LOG", "debug");
    }

    tracing_subscriber::fmt::init();

    let conn = if let Ok(conn_str) = env::var("DATABASE_URL") {
        PgPoolOptions::new()
            .connect(&conn_str)
            .await
            .expect("Could not connect to database")
    } else if let Ok(socket) = env::var("DATABASE_URL") {
        let database = env::var("DATABASE_URL").expect("Set database");
        let options = PgConnectOptions::new().socket(socket).database(&database);

        PgPoolOptions::new()
            .connect_with(options)
            .await
            .expect("Could not connect to database")
    } else {
        panic!("Get good scrub");
    };

    sqlx::migrate!()
        .run(&conn)
        .await
        .expect("Could not run migrations");

    let api_service = OpenApiService::new((Api, Proxy::new()), "Infra.nz", "1.0").server(SERVER);

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
        .with(
            Cors::new()
                .allow_methods([Method::GET, Method::POST])
                .allow_origins_fn(|_| true),
        )
        .data(conn);

    match (env::var("PUBLIC_KEY"), env::var("PRIVATE_KEY")) {
        (Ok(public_key), Ok(private_key)) => {
            Server::new(
                TcpListener::bind("0.0.0.0:443")
                    .rustls(
                        RustlsConfig::new().fallback(
                            RustlsCertificate::new()
                                .key(
                                    fs::read_to_string(private_key)
                                        .expect("Could not read private key file"),
                                )
                                .cert(
                                    fs::read_to_string(public_key)
                                        .expect("Could not read public key file"),
                                ),
                        ),
                    )
                    .combine(TcpListener::bind("0.0.0.0:80")),
            )
            .run(app)
            .await
        }

        _ => {
            Server::new(TcpListener::bind("0.0.0.0:3000"))
                .run(app)
                .await
        }
    }
}
