classDiagram
direction BT
class _sqlx_migrations {
text description
timestamp with time zone installed_on
boolean success
bytea checksum
bigint execution_time
bigint version
}
class applications {
uuid tenant_id
varchar(255) name
varchar(255) client_id
varchar(255) client_secret
text uri
text[] redirect_uris
text[] post_logout_redirect_uris
timestamp created_at
timestamp updated_at
uuid id
}
class permissions {
uuid tenant_id
varchar(255) name
timestamp created_at
timestamp updated_at
uuid id
}
class rolepermissions {
uuid role_id
uuid permission_id
}
class roles {
uuid tenant_id
varchar(255) name
timestamp created_at
timestamp updated_at
uuid id
}
class tenants {
varchar(255) name
timestamp created_at
timestamp updated_at
uuid id
}
class userroles {
uuid user_id
uuid role_id
}
class users {
uuid tenant_id
varchar(255) username
varchar(255) email
text password_hash
boolean is_active
timestamp created_at
timestamp updated_at
uuid id
}

applications -->  tenants : tenant_id:id
permissions -->  tenants : tenant_id:id
rolepermissions -->  permissions : permission_id:id
rolepermissions -->  roles : role_id:id
roles -->  tenants : tenant_id:id
userroles -->  roles : role_id:id
userroles -->  users : user_id:id
users -->  tenants : tenant_id:id
