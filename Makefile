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

# Declare phony targets
.PHONY: build release run run-release test clean format check help
