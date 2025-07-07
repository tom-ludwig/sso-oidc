use sqlx::{Pool, Postgres};

pub struct UserService {
    db_pool: Pool<Postgres>,
}

impl UserService {
    pub fn new(db_pool: Pool<Postgres>) -> Self {
        Self { db_pool }
    }

    pub async fn test_create_user(&self) {
        let rows = sqlx::query("SELECT * FROM users")
            .fetch_all(&self.db_pool)
            .await
            .unwrap();

        // println!("Rows: {}", rows.pop())
    }
}
