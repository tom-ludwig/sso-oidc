use axum::response::Redirect;
use std::sync::Arc;

use axum::{Extension, extract::Query, http::StatusCode, response::IntoResponse};
use axum_extra::{TypedHeader, headers::Cookie};
use uuid::Uuid;

use crate::models::{
    auth_code_data::AuthCodeData, authorize_request::AuthorizeRequest,
    services_config::ServicesConfig,
};

pub async fn authorize(
    Query(params): Query<AuthorizeRequest>,
    TypedHeader(cookies): TypedHeader<Cookie>,
    Extension(services): Extension<Arc<ServicesConfig>>,
) -> impl IntoResponse {
    // Only "code" is supported
    if params.response_type != "code" {
        return (
            StatusCode::BAD_REQUEST,
            "Only 'code' response_type is supported".to_string(),
        )
            .into_response();
    }

    // Validate client_id and redirect_uri
    let application_info = match services
        .application_service
        .get_client_information(&params.client_id)
        .await
    {
        Ok(application_info) => application_info,
        Err(_) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                "An error occurred during client id checking".to_string(),
            )
                .into_response();
        }
    };

    // if params.redirect_uri != "https://my-frontend.com/callback" {

    if !application_info
        .redirect_uris
        .iter()
        .any(|s| s == &params.redirect_uri)
    {
        return (
            StatusCode::BAD_REQUEST,
            "Invalid client_id or redirect_uri".to_string(),
        )
            .into_response();
    }

    // Check for user session
    let user_id = match cookies.get("session_id") {
        Some(session_cookie) => {
            match services
                .session_service
                .validate_session(session_cookie)
                .await
            {
                Ok(Some(user_id)) => Some(user_id),
                Ok(None) => None, // session not found or expired
                Err(_) => {
                    return (
                        StatusCode::INTERNAL_SERVER_ERROR,
                        "Could not validate session".to_string(),
                    )
                        .into_response();
                }
            }
        }
        None => None,
    };

    // If not logged in, redirect to login UI
    if user_id.is_none() {
        let return_to = format!(
            "/authorize?{}",
            serde_urlencoded::to_string(&params).unwrap()
        );
        let login_url = format!(
            "https://my-frontend.com/login?return_to={}",
            urlencoding::encode(&return_to)
        );
        return Redirect::temporary(&login_url).into_response();
    }

    let user_id = user_id.unwrap();
    let code = Uuid::new_v4().to_string();

    let auth_data = AuthCodeData {
        user_id: user_id.clone(),
        client_id: params.client_id.clone(),
        redirect_uri: params.redirect_uri.clone(),
        scope: params.scope.clone(),
        nonce: params.nonce.clone(),
        expires_in: 600,
    };

    if let Err(err) = services
        .auth_code_service
        .store_code(&code, auth_data, 600)
        .await
    {
        eprintln!("Failed to store auth code: {err:?}");
        return (
            StatusCode::INTERNAL_SERVER_ERROR,
            "Could not issue code".to_string(),
        )
            .into_response();
    }

    // Redirect back with code and optional state
    let mut redirect_url = format!("{}?code={}", params.redirect_uri, code);
    if let Some(state) = params.state {
        redirect_url.push_str("&state=");
        redirect_url.push_str(&urlencoding::encode(&state));
    }

    return Redirect::temporary(&redirect_url).into_response();
}
