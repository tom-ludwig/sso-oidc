use std::sync::Arc;

use axum::{Extension, Form, Json, http::StatusCode, response::IntoResponse};
use axum_macros::debug_handler;

use crate::{
    models::{
        services_config::ServicesConfig, token_request::TokenRequest, token_response::TokenResponse,
    },
    utils::token_issuer::TokenIssuer,
};

#[debug_handler]
pub async fn token(
    Extension(services): Extension<Arc<ServicesConfig>>,
    Extension(token_issuer): Extension<Arc<TokenIssuer>>,
    Form(params): Form<TokenRequest>,
) -> impl IntoResponse {
    if params.grant_type != "authorization_code" {
        return (StatusCode::BAD_REQUEST, "unsupported grant").into_response();
    }

    let auth_code = match services.auth_code_service.consume_code(&params.code).await {
        Ok(Some(data)) => data,
        Ok(None) | Err(_) => {
            return (StatusCode::BAD_REQUEST, "Code invalid or expired").into_response();
        }
    };

    if auth_code.redirect_uri != params.redirect_uri {
        return (StatusCode::BAD_REQUEST, "Redirect URI mismatch").into_response();
    }

    if auth_code.client_id != params.client_id {
        return (StatusCode::BAD_REQUEST, "Client ID mismatch").into_response();
    }

    let application_informantion = match services
        .application_service
        .get_client_information(&params.client_id)
        .await
    {
        Ok(application_informantion) => application_informantion,
        Err(_) => return (StatusCode::BAD_REQUEST, "Invalid Client").into_response(),
    };

    if application_informantion.client_secret != params.client_secret {
        return (StatusCode::UNAUTHORIZED, "Invalid client id").into_response();
    }

    let user_informantion = match services
        .user_service
        .get_user_information(&auth_code.user_id)
        .await
    {
        Ok(user_information) => user_information,
        Err(_) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                "Error while retriving user information",
            )
                .into_response();
        }
    };

    let id_token = match token_issuer.create_id_token(
        "user identifier",
        &params.client_id,
        auth_code.nonce,
        Some(user_informantion.email),
        Some(user_informantion.username),
        3600,
    ) {
        Ok(id_token) => id_token,
        Err(_) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                "Failed to issue ID token",
            )
                .into_response();
        }
    };

    // TODO: Get roles, permissions from database for user
    let access_token = match token_issuer.create_access_token(
        &auth_code.user_id.to_string(),
        &params.client_id,
        Some("scope".to_string()),
        3600,
    ) {
        Ok(access_token) => access_token,
        Err(_) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                "Failed to issue access token",
            )
                .into_response();
        }
    };

    (
        StatusCode::OK,
        Json(TokenResponse {
            access_token,
            token_type: "Bearer".into(),
            expires_in: 3600,
            id_token,
            refresh_token: None,
        }),
    )
        .into_response()
}
