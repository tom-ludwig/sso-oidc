use crate::models::session::SessionData;
use crate::models::{login::LoginRequest, services_config::ServicesConfig};
use axum::{
    Json,
    http::{Response as HttpResponse, StatusCode},
    response::IntoResponse,
};
use cookie::Cookie;
use http::header::SET_COOKIE;
use std::sync::Arc;
use uuid::Uuid;

pub async fn authenticate_user(
    services: Arc<ServicesConfig>,
    Json(login_request): Json<LoginRequest>,
) -> impl IntoResponse {
    let user_has_right_credentials = services.user_service.auth_user(&login_request);
    if user_has_right_credentials.await.is_some_and(|x| x) {
        let user = services.user_service.get_user(&login_request.email);
        let session_id = Uuid::new_v4().to_string();
        let ttl: u64 = 900;

        if let Err(_) = services
            .session_service
            .set_session(&session_id, &user, ttl)
            .await
        {
            return StatusCode::INTERNAL_SERVER_ERROR.into_response();
        }

        let cookie = Cookie::build(("Session ID", &session_id))
            .path("/")
            .max_age(cookie::time::Duration::seconds(ttl as i64))
            .http_only(true)
            .secure(false);

        let json = match serde_json::to_string(&user) {
            Ok(json) => json,
            Err(_) => return StatusCode::INTERNAL_SERVER_ERROR.into_response(),
        };

        let response = HttpResponse::builder()
            .status(StatusCode::OK)
            .header(SET_COOKIE, cookie.to_string())
            .body(json.into())
            .unwrap_or_else(|_| return StatusCode::INTERNAL_SERVER_ERROR.into_response());

        response
    } else {
        StatusCode::UNAUTHORIZED.into_response()
    }
}
