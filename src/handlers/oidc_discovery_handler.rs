use axum::{
    http::StatusCode,
    response::{IntoResponse, Json},
};

use crate::models::oidc_discovery_document::OidcDiscoveryDocument;

pub async fn discovery_handler() -> impl IntoResponse {
    // let issuer = config.issuer_url.clone(); // e.g., "https://sso.example.com"
    let issuer = "https://sso.example.com";

    println!("Returned");
    return (
        StatusCode::OK,
        Json(OidcDiscoveryDocument {
            issuer: issuer.to_string(),
            authorization_endpoint: format!("{}/oauth/authorize", issuer),
            token_endpoint: format!("{}/oauth/token", issuer),
            userinfo_endpoint: None, // Optional: Implement if supporting it
            jwks_uri: format!("{}/.well-known/jwks.json", issuer),
            response_types_supported: vec!["code".to_string()],
            subject_types_supported: vec!["public".to_string()],
            id_token_signing_alg_values_supported: vec!["RS256".to_string()],
            scopes_supported: vec![
                "openid".to_string(),
                "profile".to_string(),
                "email".to_string(),
            ],
            token_endpoint_auth_methods_supported: vec!["client_secret_post".to_string()],
            claims_supported: vec![
                "sub".to_string(),
                "iss".to_string(),
                "aud".to_string(),
                "exp".to_string(),
                "iat".to_string(),
                "email".to_string(),
                "name".to_string(),
            ],
        }),
    )
        .into_response();
}
