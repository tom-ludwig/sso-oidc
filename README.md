# SSO Provider

This is a Single Sign-On (SSO) provider written in Rust.
This project is mainly for learning about authentication, authorization, and secure identity systems.

## Getting Started

### Requirements

- Docker
- Make
- Rust
- sqlx-cli: install with

```bash
cargo install sqlx-cli --no-default-features --features postgres
```

### Start Everything

```bash
cp .env.example .env
```

```bash
make setup
```

This will:

- Start PostgreSQL in Docker
- Create the database
- Run all SQL migrations
- Prepare sqlx offline cache

You can now start your local development, use `make run` to execute your code.
