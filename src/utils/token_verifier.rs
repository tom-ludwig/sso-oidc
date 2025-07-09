use std::{fs, io};

use jsonwebtoken::{Algorithm, DecodingKey, TokenData, Validation, decode};

use crate::models::claims::{AccessTokenClaims, IdTokenClaims, RefreshTokenClaims};

pub struct TokenVerifier {
    decoding_key: DecodingKey,
    issuer: String,
    audience: String,
}

impl TokenVerifier {
    pub fn new_rsa_pem(public_key_pem: &[u8], issuer: &str, audience: &str) -> Self {
        let decoding_key =
            DecodingKey::from_rsa_pem(public_key_pem).expect("Invalid RSA public key PEM");
        Self {
            decoding_key,
            issuer: issuer.to_string(),
            audience: audience.to_string(),
        }
    }

    pub fn from_pem_file(path: &str, issuer: &str, audience: &str) -> io::Result<Self> {
        let pem_bytes = fs::read(path)?;
        Ok(Self::new_rsa_pem(&pem_bytes, issuer, audience))
    }

    pub fn verify_id_token(
        &self,
        token: &str,
    ) -> Result<TokenData<IdTokenClaims>, jsonwebtoken::errors::Error> {
        let mut validation = Validation::new(Algorithm::RS256);
        validation.set_audience(&[self.audience.as_str()]);
        validation.set_issuer(&[self.issuer.as_str()]);

        decode::<IdTokenClaims>(token, &self.decoding_key, &validation)
    }

    pub fn verify_access_token(
        &self,
        token: &str,
    ) -> Result<TokenData<AccessTokenClaims>, jsonwebtoken::errors::Error> {
        let mut validation = Validation::new(Algorithm::RS256);
        validation.set_audience(&[self.audience.as_str()]);
        validation.set_issuer(&[self.issuer.as_str()]);

        decode::<AccessTokenClaims>(token, &self.decoding_key, &validation)
    }

    pub fn verify_refresh_token(
        &self,
        token: &str,
    ) -> Result<TokenData<RefreshTokenClaims>, jsonwebtoken::errors::Error> {
        // TODO: Adjust validation to use HS256 or opaque tokens for refresh tokens
        let mut validation = Validation::new(Algorithm::RS256);
        // Typically audience is optional or different for refresh tokens
        validation.set_issuer(&[self.issuer.as_str()]);

        decode::<RefreshTokenClaims>(token, &self.decoding_key, &validation)
    }
}
