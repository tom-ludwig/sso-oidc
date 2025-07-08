use argon2::password_hash::{
    Error as PasswordHashError, PasswordHash, SaltString, rand_core::OsRng,
};
use argon2::{Argon2, PasswordHasher, PasswordVerifier};
use base64::{Engine, engine::general_purpose};

/// Hashes a password with a new random salt.
/// Returns (salt, password_hash)
pub fn hash_password(password: &str) -> Result<(String, String), PasswordHashError> {
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();

    let hash = argon2
        .hash_password(password.as_bytes(), &salt)?
        .to_string();

    Ok((salt.to_string(), hash))
}

/// Verifies a password against its hash and salt
pub fn verify_password(password: &str, password_hash: &str) -> Result<bool, PasswordHashError> {
    let parsed_hash = PasswordHash::new(password_hash)?;
    let argon2 = Argon2::default();

    Ok(argon2
        .verify_password(password.as_bytes(), &parsed_hash)
        .is_ok())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_hash_and_verify_success() {
        let password = "original-password";
        let (_salt, hash) = hash_password(password).expect("hashing failed");

        let is_valid = verify_password(password, &hash).expect("verification failed");
        assert!(is_valid, "Password should validate successfully");
    }

    #[test]
    fn test_verify_fails_on_wrong_password() {
        let password = "original-password";
        let wrong_password = "wrong-password";

        let (_salt, hash) = hash_password(password).expect("hashing failed");

        let is_valid = verify_password(wrong_password, &hash).expect("verification failed");
        assert!(!is_valid, "Wrong password should not validate");
    }

    #[test]
    fn test_verify_fails_on_tampered_hash() {
        let password = "password123";
        let (_salt, mut hash) = hash_password(password).expect("hashing failed");

        // Tamper the hash string (e.g., change one character)
        hash.replace_range(10..11, "x");

        let result = verify_password(password, &hash);
        assert!(
            result.is_err() || !result.unwrap(),
            "Tampered hash should not verify"
        );
    }

    #[test]
    fn test_multiple_hashes_are_different() {
        let password = "same-password";

        let (_, hash1) = hash_password(password).expect("hashing failed");
        let (_, hash2) = hash_password(password).expect("hashing failed");

        assert_ne!(
            hash1, hash2,
            "Hashes for same password should differ due to random salt"
        );
    }
}
