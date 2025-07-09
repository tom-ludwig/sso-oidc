use std::sync::Arc;

use models::services_config::ServicesConfig;
use routes::routes::setup_routes;
use services::authorize_code_service::AuthorizeCodeService;
use services::session_service::SessionService;
use services::user_service::UserService;
use utils::database::init_db_pool;
use utils::redis_utils::create_redis_pool;

use tower_http::cors::{CorsLayer, Any};
use std::net::SocketAddr;
use http::HeaderValue;

mod handlers;
mod models;
mod routes;
mod services;
mod utils;

#[tokio::main]
async fn main() {
    // println!("{:?}", utils::password_hash_utils::hash_password("password123"));
    // println!("{:?}", utils::password_hash_utils::hash_password("supersecure!"));

    // Newly added CorsLayer to prevent Chrome error
    let cors = CorsLayer::new()
        .allow_origin("http://localhost:5173".parse::<HeaderValue>().unwrap())
        .allow_methods(Any)
        .allow_headers(Any);
    //

    let db_pool = init_db_pool()
        .await
        .expect("Failed to connect to the database.");

    println!("Successfully connected to postgres");

    let redis_pool = create_redis_pool()
        .await
        .expect("Failed to create Redis Connection Pool");

    let user_service = UserService::new(db_pool.clone());
    let auth_code_service = AuthorizeCodeService::new(db_pool.clone(), redis_pool.clone());
    let session_service = SessionService::new(db_pool.clone(), redis_pool);
    let services = Arc::new(ServicesConfig {
        user_service,
        auth_code_service,
        session_service,
    });

    let main_router = setup_routes(services).layer(cors);

    let port = 8080;
    // let address = format!("0.0.0.0:{port}");
    let addr = SocketAddr::from(([0,0,0,0], port));
    println!("Server running on: {port}");

    axum_server::bind(addr)
        .serve(main_router.into_make_service())
        .await
        .unwrap();

    // axum::serve(listener, main_router).await.unwrap();
}
