# Stage 1: Build
FROM rust:bullseye AS builder

WORKDIR /usr/src/app

# Install required packages for linking OpenSSL
RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    build-essential \
    curl

# Copy manifest and source
COPY Cargo.toml Cargo.lock ./
COPY src ./src

# Build release binary
RUN cargo build --release

# Stage 2: Run
FROM debian:bullseye-slim

WORKDIR /app

# Install shared libraries needed for runtime
RUN apt-get update && apt-get install -y \
    libssl1.1 && \
    rm -rf /var/lib/apt/lists/*

COPY --from=builder /usr/src/app/target/release/sso-oidc .

EXPOSE 8080

CMD ["./sso-oidc"]
