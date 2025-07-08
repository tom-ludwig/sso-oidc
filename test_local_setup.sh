#!/bin/bash

echo "🧪 Testing Docker-based Makefile setup..."

# Load environment variables from .env.shared and override for local testing
if [ -f .env.dev ]; then
    set -a
    source .env.dev
    set +a
    export DATABASE_URL=postgresql://postgres:password@localhost:5432/sso-oidc-dev
else
    echo "⚠️  .env.dev file not found"
    export DATABASE_URL=postgresql://postgres:password@localhost:5432/sso-oidc-dev
fi

# Test 1: Database connectivity
echo "1. Testing database connectivity..."
if make db-status | grep -q "Up"; then
    echo "✅ Database is running"
else
    echo "❌ Database is not running"
    exit 1
fi

# Test 2: Docker SQLx CLI migration info
echo "2. Testing Docker-based SQLx CLI..."
if make migrate-info > /dev/null 2>&1; then
    echo "✅ Docker SQLx CLI is working"
else
    echo "❌ Docker SQLx CLI failed"
    exit 1
fi

# Test 3: Rust compilation
echo "3. Testing Rust compilation..."
if cargo check > /dev/null 2>&1; then
    echo "✅ Rust code compiles"
else
    echo "❌ Rust compilation failed"
    exit 1
fi

# Test 4: Running the app (assumes DB access)
echo "4. Testing database queries via app run..."
if cargo run > /dev/null 2>&1; then
    echo "✅ App runs and queries DB"
else
    echo "❌ App failed to run with DB"
    exit 1
fi

echo "🎉 All tests passed! Docker dev environment is working correctly."
