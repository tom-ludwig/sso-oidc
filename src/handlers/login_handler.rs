use crate::models::{login::LoginRequest, services_config::ServicesConfig};
use axum::{Json, http::StatusCode, response::IntoResponse};
use std::sync::Arc;

pub async fn authenticate_user(
    services: Arc<ServicesConfig>,
    Json(login_request): Json<LoginRequest>,
) -> impl IntoResponse {
    let user_has_right_credentials = services.user_service.auth_user(&login_request);
    if user_has_right_credentials.await.is_some_and(|x| x) {
        // TODO: send the cookie / session token
        return StatusCode::OK;
    }
    StatusCode::UNAUTHORIZED
}
