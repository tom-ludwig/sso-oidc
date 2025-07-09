use std::{fs, io};

use chrono::{Duration, Utc};
use jsonwebtoken::{Algorithm, EncodingKey, Header};

use crate::models::claims::{AccessTokenClaims, IdTokenClaims, RefreshTokenClaims};

pub struct TokenIssuer {
    pub issuer: String,
    pub encoding_key: EncodingKey,
}

impl TokenIssuer {
    pub fn new_rsa_pem(private_key_pem: &[u8], issuer: &str) -> Self {
        let encoding_key =
            EncodingKey::from_rsa_pem(private_key_pem).expect("Invalid RSA private key PEM");
        Self {
            issuer: issuer.to_owned(),
            encoding_key,
        }
    }

    pub fn from_pem_file(path: &str, issuer: &str) -> io::Result<Self> {
        let pem_bytes = fs::read(path)?;
        Ok(Self::new_rsa_pem(&pem_bytes, issuer))
    }

    pub fn create_id_token(
        &self,
        subject: &str,
        audience: &str,
        nonce: Option<String>,
        email: Option<String>,
        name: Option<String>,
        expiry_seconds: i64,
    ) -> Result<String, jsonwebtoken::errors::Error> {
        let now = Utc::now();
        let claims = IdTokenClaims {
            iss: self.issuer.clone(),
            sub: subject.to_owned(),
            aud: audience.to_owned(),
            exp: (now + Duration::seconds(expiry_seconds)).timestamp() as usize,
            iat: now.timestamp() as usize,
            nonce,
            email,
            name,
        };

        jsonwebtoken::encode(&Header::new(Algorithm::RS256), &claims, &self.encoding_key)
    }

    pub fn create_access_token(
        &self,
        subject: &str,
        audience: &str,
        scope: Option<String>,
        expiry_seconds: i64,
    ) -> Result<String, jsonwebtoken::errors::Error> {
        let now = Utc::now();
        let claims = AccessTokenClaims {
            iss: self.issuer.clone(),
            sub: subject.to_owned(),
            aud: audience.to_owned(),
            exp: (now + Duration::seconds(expiry_seconds)).timestamp() as usize,
            iat: now.timestamp() as usize,
            scope,
        };

        jsonwebtoken::encode(&Header::new(Algorithm::RS256), &claims, &self.encoding_key)
    }

    pub fn create_refresh_token(
        &self,
        subject: &str,
        expiry_seconds: i64,
    ) -> Result<String, jsonwebtoken::errors::Error> {
        let now = Utc::now();
        let claims = RefreshTokenClaims {
            sub: subject.to_owned(),
            exp: (now + Duration::seconds(expiry_seconds)).timestamp() as usize,
            iat: now.timestamp() as usize,
        };

        jsonwebtoken::encode(&Header::new(Algorithm::RS256), &claims, &self.encoding_key)
    }
}

#[cfg(test)]
mod tests {
    use crate::utils::token_verifier::TokenVerifier;

    use super::*;
    use lazy_static::lazy_static;
    use rand::rngs::OsRng;
    use rsa::{RsaPrivateKey, pkcs8::EncodePrivateKey, pkcs8::EncodePublicKey};

    lazy_static! {
        static ref TEST_KEYS: (Vec<u8>, Vec<u8>) = generate_test_keys();
    }

    // Helper to generate RSA keys for tests
    fn generate_test_keys() -> (Vec<u8>, Vec<u8>) {
        let mut rng = OsRng;
        let private_key = RsaPrivateKey::new(&mut rng, 2048).expect("Failed to generate key");

        // Encode private key as PKCS8 PEM
        let private_pem = private_key
            .to_pkcs8_pem(Default::default())
            .expect("Failed to encode private key PEM")
            .to_string();

        // Encode public key as PKCS8 PEM
        let public_pem = private_key
            .to_public_key()
            .to_public_key_pem(Default::default())
            .expect("Failed to encode public key PEM")
            .to_string();

        (private_pem.into_bytes(), public_pem.into_bytes())
    }

    #[tokio::test]
    async fn test_generate_keys() {
        let (ref private_pem, ref public_pem) = *TEST_KEYS;
        assert!(!private_pem.is_empty(), "Private key generation failed");
        assert!(!public_pem.is_empty(), "Public key generation failed");
    }

    #[tokio::test]
    async fn test_create_id_token() {
        let (ref private_pem, _) = *TEST_KEYS;
        let issuer_url = "https://test-issuer.example";
        let token_issuer = TokenIssuer::new_rsa_pem(&private_pem, issuer_url);

        let id_token_result = token_issuer.create_id_token(
            "user123",
            "client123",
            Some("nonce123".to_string()),
            Some("user@example.com".to_string()),
            Some("Test User".to_string()),
            3600,
        );

        assert!(id_token_result.is_ok(), "Failed to create ID token");
    }

    #[tokio::test]
    async fn test_verify_id_token() {
        let (ref private_pem, ref public_pem) = *TEST_KEYS;
        let issuer_url = "https://test-issuer.example";
        let token_issuer = TokenIssuer::new_rsa_pem(&private_pem, issuer_url);

        let id_token = token_issuer
            .create_id_token(
                "user123",
                "client123",
                Some("nonce123".to_string()),
                Some("user@example.com".to_string()),
                Some("Test User".to_string()),
                3600,
            )
            .expect("Failed to create ID token");

        let verifier = TokenVerifier::new_rsa_pem(&public_pem, issuer_url, "client123");
        let id_claims = verifier
            .verify_id_token(&id_token)
            .expect("Failed to verify ID token")
            .claims;

        assert_eq!(id_claims.sub, "user123");
        assert_eq!(id_claims.aud, "client123");
        assert_eq!(id_claims.nonce.unwrap(), "nonce123");
        assert_eq!(id_claims.email.unwrap(), "user@example.com");
        assert_eq!(id_claims.name.unwrap(), "Test User");
    }

    #[tokio::test]
    async fn test_create_access_token() {
        let (ref private_pem, _) = *TEST_KEYS;
        let issuer_url = "https://test-issuer.example";
        let token_issuer = TokenIssuer::new_rsa_pem(&private_pem, issuer_url);

        let access_token_result = token_issuer.create_access_token(
            "user123",
            "api123",
            Some("openid profile email".to_string()),
            900,
        );

        assert!(access_token_result.is_ok(), "Failed to create access token");
    }

    #[tokio::test]
    async fn test_verify_access_token() {
        let (ref private_pem, ref public_pem) = *TEST_KEYS;
        let issuer_url = "https://test-issuer.example";
        let token_issuer = TokenIssuer::new_rsa_pem(&private_pem, issuer_url);

        let access_token = token_issuer
            .create_access_token(
                "user123",
                "api123",
                Some("openid profile email".to_string()),
                900,
            )
            .expect("Failed to create access token");

        let verifier_access = TokenVerifier::new_rsa_pem(&public_pem, issuer_url, "api123");
        let access_claims = verifier_access
            .verify_access_token(&access_token)
            .expect("Failed to verify access token")
            .claims;

        assert_eq!(access_claims.sub, "user123");
        assert_eq!(access_claims.aud, "api123");
        assert_eq!(access_claims.scope.unwrap(), "openid profile email");
    }

    #[tokio::test]
    async fn test_create_refresh_token() {
        let (ref private_pem, _) = *TEST_KEYS;
        let issuer_url = "https://test-issuer.example";
        let token_issuer = TokenIssuer::new_rsa_pem(&private_pem, issuer_url);

        let refresh_token_result = token_issuer.create_refresh_token("user123", 86400);

        assert!(
            refresh_token_result.is_ok(),
            "Failed to create refresh token"
        );
    }

    #[tokio::test]
    async fn test_verify_refresh_token() {
        let (ref private_pem, ref public_pem) = *TEST_KEYS;
        let issuer_url = "https://test-issuer.example";
        let token_issuer = TokenIssuer::new_rsa_pem(&private_pem, issuer_url);

        let refresh_token = token_issuer
            .create_refresh_token("user123", 86400)
            .expect("Failed to create refresh token");

        let verifier_refresh = TokenVerifier::new_rsa_pem(&public_pem, issuer_url, "");
        let refresh_claims = verifier_refresh
            .verify_refresh_token(&refresh_token)
            .expect("Failed to verify refresh token")
            .claims;

        assert_eq!(refresh_claims.sub, "user123");
    }
}
