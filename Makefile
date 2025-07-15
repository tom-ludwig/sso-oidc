
COMPOSE_FILE=docker-compose.dev.yaml

include .env.dev
include .env
export

# =============================================================================
# Container Runtime Detection
# =============================================================================

# TODO: ENTER YOUR CORRECT CONTAINER RUNTIME COMMANDS HERE
CONTAINER_CMD := docker
COMPOSE_CMD := docker compose

# =============================================================================
# Local Development Commands
# =============================================================================

build:
	cargo build

release:
	cargo build --release

run:
	cargo run

test:
	cargo test

clean:
	cargo clean

format:
	cargo fmt

check:
	cargo check
	cargo clippy

build-swagger-docs:
	$(CONTAINER_CMD) run -p 8000:8080 -e SWAGGER_JSON=/docs/openapi.yaml -v $(shell pwd)/docs:/docs swaggerapi/swagger-ui

# =============================================================================
# Key Generation for JWT Signing
# =============================================================================

# Generate RSA private and public keys for JWT signing
generate-keys:
	@mkdir -p keys
	@echo "🔑 Generating RSA 2048-bit private key at keys/private.pem"
	@openssl genrsa -out keys/private.pem 2048
	@echo "🔑 Generating public key at keys/public.pem"
	@openssl rsa -in keys/private.pem -pubout -out keys/public.pem
	@echo "✅ Keys generated!"

# =============================================================================
# Container Database Commands
# =============================================================================

start-db:
	@echo "🚀 Starting PostgreSQL and Redis"
	$(COMPOSE_CMD) -f $(COMPOSE_FILE) up -d db redis
	@echo "🚀 PostgreSQL started on port 5432 and Redis on port 6379"

stop-db:
	@echo "🛑 Stopping PostgreSQL and Redis"
	$(COMPOSE_CMD) -f $(COMPOSE_FILE) stop db redis
	@echo "🛑 PostgreSQL and Redis stopped"

restart-db:
	@echo "🔄 Restarting PostgreSQL"
	$(COMPOSE_CMD) -f $(COMPOSE_FILE) restart db redis

reset-db:
	@echo "🗑️ Resetting PostgreSQL and Redis"
	$(COMPOSE_CMD) -f $(COMPOSE_FILE) down -v db redis
	$(MAKE) start-db

# =============================================================================
# SQLx via Container (uses Dockerfile.sqlx-cli)
# =============================================================================

build-sqlx:
	@echo "🏗️  Building SQLx image using $(CONTAINER_RUNTIME)..."
	$(COMPOSE_CMD) -f $(COMPOSE_FILE) build sqlx-cli
	@echo "🐳 SQLx container image built"

migrate:
	@echo "📦 Running migrations using $(CONTAINER_RUNTIME)..."
	$(COMPOSE_CMD) -f $(COMPOSE_FILE) --profile tools run --rm sqlx-cli migrate run
	@echo "✅ Migrations completed"

migrate-add:
	@read -p "Enter migration name: " name; \
	echo "📝 Adding migration using $(CONTAINER_RUNTIME)..."; \
	$(COMPOSE_CMD) -f $(COMPOSE_FILE) --profile tools run --rm sqlx-cli migrate add "$$name"
	@echo "📝 Migration added"

migrate-revert:
	@echo "⏪ Reverting migration using $(CONTAINER_RUNTIME)..."
	$(COMPOSE_CMD) -f $(COMPOSE_FILE) --profile tools run --rm sqlx-cli migrate revert
	@echo "⏪ Migration reverted"

migrate-info:
	@echo "📊 Getting migration info using $(CONTAINER_RUNTIME)..."
	$(COMPOSE_CMD) -f $(COMPOSE_FILE) --profile tools run --rm sqlx-cli migrate info

# For prepare, we need to run it locally since it needs access to Cargo.toml and source code
prepare:
	@export DATABASE_URL=postgresql://postgres:password@localhost:5432/sso-oidc-dev; \
	echo "Running cargo sqlx prepare locally (requires local sqlx-cli installation)..."; \
	if cargo sqlx --help >/dev/null 2>&1; then \
		cargo sqlx prepare; \
		echo "📦 sqlx offline data prepared"; \
	else \
		echo "❌ cargo sqlx not found. Please install it with 'cargo install sqlx-cli'."; \
	fi

db-create:
	@echo "🗄️  Creating database using $(CONTAINER_RUNTIME)..."
	$(COMPOSE_CMD) -f $(COMPOSE_FILE) --profile tools run --rm sqlx-cli db create
	@echo "🗄️ Database created"

db-drop:
	@echo "🗑️  Dropping database using $(CONTAINER_RUNTIME)..."
	$(COMPOSE_CMD) -f $(COMPOSE_FILE) --profile tools run --rm sqlx-cli db drop -y
	@echo "🗑️ Database dropped"

db-reset:
	@echo "🔄 Resetting database using $(CONTAINER_RUNTIME)..."
	$(COMPOSE_CMD) -f $(COMPOSE_FILE) --profile tools run --rm sqlx-cli db drop -y
	$(COMPOSE_CMD) -f $(COMPOSE_FILE) --profile tools run --rm sqlx-cli db create
	$(COMPOSE_CMD) -f $(COMPOSE_FILE) --profile tools run --rm sqlx-cli migrate run
	@echo "🔄 Database reset"

# =============================================================================
# Setup
# =============================================================================

setup: runtime-info generate-keys start-db db-create migrate
	@echo "🎉 Local dev environment ready with $(CONTAINER_RUNTIME)!"

# =============================================================================
# Utility Commands
# =============================================================================

runtime-info:
	@echo "📦 Using compose command: $(COMPOSE_CMD)"
	@echo "🐳 Using container command: $(CONTAINER_CMD)"
	@if [ "$(CONTAINER_RUNTIME)" = "none" ]; then \
		echo "⚠️  Warning: Neither Docker nor Podman detected. Commands may fail."; \
	fi

db-status:
	@echo "Database Status (using $(CONTAINER_RUNTIME)):"
	@$(COMPOSE_CMD) -f $(COMPOSE_FILE) ps db

logs-db:
	@echo "📋 Showing database logs using $(CONTAINER_RUNTIME)..."
	$(COMPOSE_CMD) -f $(COMPOSE_FILE) logs -f db

db-shell:
	@echo "🐚 Opening database shell using $(CONTAINER_RUNTIME)..."
	$(COMPOSE_CMD) -f $(COMPOSE_FILE) exec db psql -U $(POSTGRES_USER) -d $(POSTGRES_DB)

health-check:
	@echo "🏥 Running health checks using $(CONTAINER_RUNTIME)..."
	@$(COMPOSE_CMD) -f $(COMPOSE_FILE) ps db
	@$(COMPOSE_CMD) -f $(COMPOSE_FILE) --profile tools run --rm sqlx-cli migrate info
	@cargo check
	@echo "✅ Health check complete!"

# =============================================================================
# Help
# =============================================================================

help:
	@echo "Available commands:"
	@echo ""
	@echo "Container Runtime:"
	@echo "  make runtime-info     - Show detected container runtime"
	@echo ""
	@echo "Local Development:"
	@echo "  make build            - Build the project"
	@echo "  make release          - Build in release mode"
	@echo "  make run              - Run the project"
	@echo "  make test             - Run tests"
	@echo "  make check            - Check and lint code"
	@echo "  make format           - Format code"
	@echo "  make clean            - Clean build artifacts"
	@echo "  make build-swagger-docs - Build Swagger API Documentation"
	@echo ""
	@echo "Keys:"
	@echo "  make generate-keys    - Generate RSA keys for JWT signing"
	@echo ""
	@echo "Database Management:"
	@echo "  make start-db         - Start PostgreSQL container"
	@echo "  make stop-db          - Stop PostgreSQL container"
	@echo "  make restart-db       - Restart PostgreSQL container"
	@echo "  make reset-db         - Delete all Data from Redis and PostgreSQL containers and start them again"
	@echo "  make db-status        - Show PostgreSQL container status"
	@echo "  make logs-db          - Show PostgreSQL logs"
	@echo "  make db-shell         - Open psql shell inside container"
	@echo ""
	@echo "SQLx (via Container):"
	@echo "  make build-sqlx       - Build sqlx container image"
	@echo "  make migrate          - Run migrations"
	@echo "  make migrate-add      - Add new migration"
	@echo "  make migrate-revert   - Revert last migration"
	@echo "  make migrate-info     - Show migration info"
	@echo "  make prepare          - Prepare sqlx offline cache"
	@echo "  make db-create        - Create database"
	@echo "  make db-drop          - Drop database"
	@echo "  make db-reset         - Drop, create, and migrate database"
	@echo ""
	@echo "Setup:"
	@echo "  make setup            - Full setup (keys + db + migrations)"
	@echo ""
	@echo "Other:"
	@echo "  make health-check     - Run dev environment health checks"
	@echo "  make help             - Show this help menu"

.PHONY: \
build release run test clean format check generate-keys \
start-db stop-db restart-db db-status logs-db db-shell \
build-sqlx migrate migrate-add migrate-revert migrate-info prepare db-create db-drop db-reset \
setup health-check help runtime-info reset-db build-swagger-docs

insert-test-users:
	@echo "🧪 Inserting test tenant and users..."
	@$(COMPOSE_CMD) -f $(COMPOSE_FILE) exec -T db psql -U $(POSTGRES_USER) -d $(POSTGRES_DB) -c "\
	DO $$ \
	DECLARE \
		tenant_id UUID := '00000000-0000-0000-0000-000000000001'; \
		user1_id UUID := '11111111-1111-1111-1111-111111111111'; \
		user2_id UUID := '22222222-2222-2222-2222-222222222222'; \
	BEGIN \
		-- Insert tenant \
		INSERT INTO Tenants (id, name) \
		VALUES (tenant_id, 'Test Tenant') \
		ON CONFLICT (id) DO NOTHING; \
		-- Insert users \
		INSERT INTO Users (id, tenant_id, username, email, password_hash) VALUES \
			(user1_id, tenant_id, 'testuser1', 'testuser1@example.com', '$$2b$$12$$abcdefghijk1234567890lmnopqrstuv'), \
			(user2_id, tenant_id, 'testuser2', 'testuser2@example.com', '$$2b$$12$$zyxwvutsrqp0987654321nmlkjihgfedcba') \
		ON CONFLICT (id) DO NOTHING; \
	END $$ LANGUAGE plpgsql;"
	@echo "✅ Test users created or already exist"
