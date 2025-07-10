use base64::{Engine, engine::general_purpose};
use openssl::rsa::Rsa;
use serde_json::{Value, json};
use std::fs;

pub fn generate_jwk_set_from_cert(cert_path: &str) -> Result<Value, anyhow::Error> {
    // Read the PEM file
    let pem_data = fs::read(cert_path)?;

    // Parse the PEM file to extract the RSA public key
    let rsa = Rsa::public_key_from_pem(&pem_data)?;

    // Extract components of the RSA public key
    let n_bytes = rsa.n().to_vec(); // Convert modulus to bytes
    let e_bytes = rsa.e().to_vec(); // Convert exponent to bytes

    // Base64 URL encode components
    let n_base64 = general_purpose::URL_SAFE_NO_PAD.encode(n_bytes);
    let e_base64 = general_purpose::URL_SAFE_NO_PAD.encode(e_bytes);

    // Create JWK
    let jwk = json!({
        "kty": "RSA",
        "alg": "RS256",
        "use": "sig",
        "n": n_base64,
        "e": e_base64
    });

    // Create JWK Set
    let jwk_set = json!({
        "keys": [jwk]
    });

    Ok(jwk_set)
}
