-- Add a migration script here

DROP TABLE IF EXISTS RolePermissions;
DROP TABLE IF EXISTS Permissions;
DROP TABLE IF EXISTS UserRoles;
DROP TABLE IF EXISTS Roles;
DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS Applications;
DROP TABLE IF EXISTS Tenants;

CREATE TABLE Tenants
(
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Applications
(
    id                        UUID PRIMARY KEY,
    tenant_id                 UUID         NOT NULL REFERENCES Tenants (id) ON DELETE CASCADE,
    name                      VARCHAR(255) NOT NULL,
    client_id                 VARCHAR(255) NOT NULL UNIQUE,
    client_secret             VARCHAR(255) NOT NULL,
    uri                       TEXT         NOT NULL,
    redirect_uris             TEXT[]       NOT NULL,
    post_logout_redirect_uris TEXT[]       NOT NULL,
    created_at                TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at                TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Users
(
    id            UUID PRIMARY KEY,
    tenant_id     UUID         NOT NULL REFERENCES Tenants (id) ON DELETE CASCADE,
    username      VARCHAR(255) NOT NULL,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT         NOT NULL,
    is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP             DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP             DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (tenant_id, username),
    UNIQUE (tenant_id, email)
);

CREATE TABLE Roles
(
    id        UUID PRIMARY KEY,
    tenant_id UUID         NOT NULL REFERENCES Tenants (id) ON DELETE CASCADE,
    name      VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE UserRoles
(
    user_id UUID NOT NULL REFERENCES Users (id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES Roles (id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE Permissions
(
    id        UUID PRIMARY KEY,
    tenant_id UUID         NOT NULL REFERENCES Tenants (id) ON DELETE CASCADE,
    name      VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE RolePermissions
(
    role_id       UUID NOT NULL REFERENCES Roles (id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES Permissions (id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);
