// OAuth Configuration
// Update these values to match your auth server setup

export const AUTH_CONFIG = {
  // Your auth server base URL
  authServerUrl: "http://localhost:8080",

  // OAuth client configuration
  clientId: "sap_concur_client_001",

  // OAuth endpoints
  endpoints: {
    authorize: "/oauth/authorize",
    token: "/oauth/token",
  },

  // OAuth scopes
  scopes: ["openid", "profile", "email"],

  // Redirect URI (will be set to current origin)
  get redirectUri() {
    return "http://localhost:5555/dashboard";
    // return typeof window !== "undefined" ? window.location.origin : "";
  },
};

// Helper function to build the authorization URL
export function buildAuthUrl(): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: AUTH_CONFIG.clientId,
    redirect_uri: AUTH_CONFIG.redirectUri,
    scope: AUTH_CONFIG.scopes.join(" "),
    state: generateRandomState(), // Add CSRF protection
  });

  return `${AUTH_CONFIG.authServerUrl}${AUTH_CONFIG.endpoints.authorize}?${params.toString()}`;
}

// Generate a random state for CSRF protection
function generateRandomState(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

