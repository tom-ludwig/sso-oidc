use crate::models::{login::LoginRequest, services_config::ServicesConfig};
use crate::models::session::SessionData;
use axum::{Json, http::{StatusCode, Response as HttpResponse}, response::IntoResponse};
use cookie::Cookie;
use http::header::SET_COOKIE;
use uuid::Uuid;
use std::sync::Arc;

pub async fn authenticate_user(
    services: Arc<ServicesConfig>,
    Json(login_request): Json<LoginRequest>,
) -> impl IntoResponse {
    let user_has_right_credentials = services.user_service.auth_user(&login_request);
    if user_has_right_credentials.await.is_some_and(|x| x) {
        let session_id = Uuid::new_v4().to_string();
        let dummy_user = SessionData { user_id: "Tom".to_string() };
        let ttl_session = 900u64;
        let ttl_cookie = 900i64;

        if let Err(_) = services.session_service.set_session(&session_id, &dummy_user, ttl_session).await {
            return StatusCode::INTERNAL_SERVER_ERROR.into_response();
        }

        let cookie = Cookie::build(("Session ID", &session_id))
            .path("/authorize")
            .max_age(cookie::time::Duration::seconds(ttl_cookie))
            .http_only(true)
            .secure(false)
            .finish();

        let json = match serde_json::to_string(&dummy_user) {
            Ok(json) => {json},
            Err(_) => {return StatusCode::INTERNAL_SERVER_ERROR.into_response()},
        };

        let response = HttpResponse::builder()
            .status(StatusCode::OK)
            .header(SET_COOKIE, cookie.to_string())
            .body(json.into())
            .unwrap();
        // TODO: Maybe add error-handling here later on

        response
    } else {
        StatusCode::UNAUTHORIZED.into_response()
    }
}
