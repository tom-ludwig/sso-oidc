COMPOSE_FILE=docker-compose.dev.yaml

DB_NAME=sso-oidc-dev
DB_USER=postgres
DB_PASS=password
DB_HOST=localhost
DB_PORT=5432

# Final DATABASE_URL used by sqlx
DATABASE_URL=postgres://$(DB_USER):$(DB_PASS)@$(DB_HOST):$(DB_PORT)/$(DB_NAME)
# Export DB URL for all commands
export DATABASE_URL

build:
	cargo build

# Build the project in release mode
release:
	cargo build --release

# Run the project
run:
	cargo run

# Test the project
test:
	cargo test

# Clean the project
clean:
	cargo clean

# Format the code
format:
	cargo fmt

# Check for common issues/linting
check:
	cargo check
	cargo clippy

# Start Dockerized DB
start-db:
	docker-compose -f $(COMPOSE_FILE) up -d db
	@echo "🚀 PostgreSQL started on port 5432"

stop-db:
	docker-compose -f $(COMPOSE_FILE) stop db
	@echo "🛑 PostgreSQL stopped"

restart-db: 
	docker-compose -f $(COMPOSE_FILE) restart db


# Setup command to create DB and run migrations
setup-db:
	@echo "🔧 Setting up local database..."
	sqlx db create
	sqlx migrate run
	@echo "✅ Database setup complete."

# Optional: reset everything
reset-db:
	@echo "⚠️  Dropping and recreating database..."
	sqlx db drop -y
	sqlx db create
	sqlx migrate run
	@echo "✅ Database reset complete."

# Optional: prepare sqlx offline cache
sqlx-prepare:
	sqlx prepare -- --lib
	@echo "📦 sqlx offline data prepared."
	
# ALL-IN-ONE SETUP
setup: start-db setup-db sqlx-prepare
	@echo "🎉 Local dev environment ready!"

.PHONY: build release run run-release test clean format check setup-db reset-db sqlx-prepare start-db stop-db restart-db setup
