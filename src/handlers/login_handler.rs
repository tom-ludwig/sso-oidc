use crate::models::{login::LoginRequest, services_config::ServicesConfig};
use axum::{Extension, http::StatusCode, response::IntoResponse};
use std::sync::Arc;

pub async fn authenticate_user(
    Extension(services): Extension<Arc<ServicesConfig>>,
) -> impl IntoResponse {
    let login_request: LoginRequest = LoginRequest {
        username: "testuser".to_string(),
        password_unhashed: "123".to_string(),
    };
    services.user_service.auth_user(&login_request).await;

    StatusCode::OK
}
