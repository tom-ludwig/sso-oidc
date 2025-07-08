use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
pub struct IdTokenClaims {
    pub iss: String,
    pub sub: String,
    pub aud: String,
    pub exp: usize,
    pub iat: usize,
    pub nonce: Option<String>,
    pub email: Option<String>,
    pub name: Option<String>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct AccessTokenClaims {
    pub iss: String,
    pub sub: String,
    pub aud: String,
    pub exp: usize,
    pub iat: usize,
    pub scope: Option<String>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct RefreshTokenClaims {
    pub sub: String,
    pub exp: usize,
    pub iat: usize,
}
