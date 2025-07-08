#!/bin/bash

set -e

echo "🧪 Testing Docker-based Makefile commands..."

# Load environment variables from .env.dev if it exists
if [ -f .env.dev ]; then
    set -a
    source .env.dev
    set +a
else
    echo "⚠️  .env.dev not found. Using default local env vars."
fi

# Override DATABASE_URL to use localhost for testing
export DATABASE_URL="postgres://postgres:password@localhost:5432/sso-oidc-dev"

# Test 1: Build SQLx CLI Docker image
echo "1. Building SQLx CLI Docker image..."
make build-sqlx

# Test 2: Start PostgreSQL container
echo "2. Starting PostgreSQL..."
make start-db
if make db-status | grep -q "Up"; then
    echo "✅ PostgreSQL is running"
else
    echo "❌ PostgreSQL failed to start"
    exit 1
fi

# Test 3: Run migrations
echo "3. Running migrations..."
make migrate

# Test 4: Show migration info
echo "4. Getting migration info..."
make migrate-info

# Test 5: Reset the database (drop/create/migrate)
echo "5. Resetting the database..."
make db-reset

# Test 6: Prepare SQLx offline data
echo "6. Preparing SQLx offline data..."
make prepare

# Test 7: Test psql shell inside DB container (non-interactive)
echo "7. Checking psql shell access..."
echo "\dt" | make db-shell > /dev/null && echo "✅ db-shell works"

echo "🎉 All Makefile Docker-based commands passed!"
