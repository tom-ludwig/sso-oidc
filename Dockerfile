# Stage 1: Building
FROM rust:alpine3.19 as builder
WORKDIR /usr/src

# Install dependencies
RUN apk add --no-cache gcc musl-dev

# Copy over your MANIFEST.in (i.e., Cargo.toml & Cargo.lock)
COPY ./Cargo.toml ./Cargo.toml
COPY ./Cargo.lock ./Cargo.lock

# Copy your source code
COPY ./src ./src

# Build for release.
# Your final executable will be placed in target/release/my_project
RUN cargo build --release

# Stage 2: Running
FROM alpine:latest

WORKDIR /app

# Copy the binary from the builder stage
COPY --from=builder /usr/src/target/release/ /app/

EXPOSE 8080

# Set the startup command to run your binary
CMD ["./sso-oidc"]
