import { AUTH_CONFIG, buildAuthUrl } from '../config/auth';

export interface TokenResponse {
  access_token: string;
  id_token: string;
  token_type: string;
  expires_in: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  idToken: string | null;
}

// Storage keys
const ACCESS_TOKEN_KEY = 'access_token';
const ID_TOKEN_KEY = 'id_token';
const TOKEN_EXPIRY_KEY = 'token_expiry';
const OAUTH_STATE_KEY = 'oauth_state';

// Utility functions for cookie management
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(';').shift();
    return cookieValue || null;
  }
  return null;
}

// Token management
export function getStoredTokens(): { accessToken: string | null; idToken: string | null } {
  if (typeof window === 'undefined') return { accessToken: null, idToken: null };
  
  const accessToken = sessionStorage.getItem(ACCESS_TOKEN_KEY);
  const idToken = sessionStorage.getItem(ID_TOKEN_KEY);
  const expiry = sessionStorage.getItem(TOKEN_EXPIRY_KEY);
  
  // Check if tokens are expired
  if (expiry && new Date().getTime() > parseInt(expiry)) {
    clearTokens();
    return { accessToken: null, idToken: null };
  }
  
  return { accessToken, idToken };
}

export function storeTokens(tokenResponse: TokenResponse): void {
  if (typeof window === 'undefined') return;
  
  sessionStorage.setItem(ACCESS_TOKEN_KEY, tokenResponse.access_token);
  sessionStorage.setItem(ID_TOKEN_KEY, tokenResponse.id_token);
  
  // Calculate expiry time (current time + expires_in seconds)
  const expiryTime = new Date().getTime() + (tokenResponse.expires_in * 1000);
  sessionStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
}

export function clearTokens(): void {
  if (typeof window === 'undefined') return;
  
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(ID_TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_EXPIRY_KEY);
  sessionStorage.removeItem(OAUTH_STATE_KEY);
}

// OAuth state management for CSRF protection
export function storeOAuthState(state: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(OAUTH_STATE_KEY, state);
}

export function getStoredOAuthState(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(OAUTH_STATE_KEY);
}

export function clearOAuthState(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(OAUTH_STATE_KEY);
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  const { accessToken, idToken } = getStoredTokens();
  return !!(accessToken && idToken);
}

// URL parameter utilities
export function getUrlParameter(name: string): string | null {
  if (typeof window === 'undefined') return null;
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

export function clearUrlParameters(): void {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  url.search = '';
  window.history.replaceState({}, document.title, url.toString());
}

// OAuth flow functions
export async function exchangeCodeForTokens(authCode: string): Promise<TokenResponse> {
  // Prepare form data for the token request
  const formData = new URLSearchParams({
    grant_type: 'authorization_code',
    code: authCode,
    client_id: AUTH_CONFIG.clientId,
    client_secret: AUTH_CONFIG.clientSecret,
    redirect_uri: AUTH_CONFIG.redirectUri,
  });

  const response = await fetch(`${AUTH_CONFIG.authServerUrl}${AUTH_CONFIG.endpoints.token}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Token exchange failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return response.json();
}

export async function checkSessionAndAuthorize(): Promise<string | null> {
  const sessionId = getCookie('session_id');
  
  if (!sessionId) {
    return null;
  }

  try {
    const response = await fetch(`${AUTH_CONFIG.authServerUrl}${AUTH_CONFIG.endpoints.authorize}`, {
      method: 'GET',
      headers: {
        'Cookie': `session_id=${sessionId}`,
      },
      credentials: 'include',
    });

    if (response.ok) {
      // Extract auth code from response
      const data = await response.json();
      return data.code || null;
    }
    
    return null;
  } catch (error) {
    console.error('Authorization check failed:', error);
    return null;
  }
}

export function redirectToLogin(): void {
  // Generate and store state for CSRF protection
  const state = generateRandomState();
  storeOAuthState(state);
  
  // Redirect to the OAuth authorize endpoint using the configured URL
  window.location.href = buildAuthUrl(state);
}

// Generate a random state for CSRF protection
function generateRandomState(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

// Main authentication check function
export async function checkAuthenticationStatus(): Promise<AuthState> {
  // First, check if we already have valid tokens
  if (isAuthenticated()) {
    const { accessToken, idToken } = getStoredTokens();
    return {
      isAuthenticated: true,
      accessToken,
      idToken,
    };
  }

  // Check for auth code in URL parameters (from OAuth redirect)
  const urlAuthCode = getUrlParameter('code');
  const urlState = getUrlParameter('state');
  
  if (urlAuthCode) {
    // CSRF protection temporarily disabled for development
    // TODO: Re-enable CSRF protection in production
    /*
    // Validate state parameter for CSRF protection
    const storedState = getStoredOAuthState();
    if (urlState && storedState && urlState === storedState) {
    */
      try {
        console.log('Found auth code in URL, exchanging for tokens (CSRF protection disabled)...');
        // Exchange auth code for tokens
        const tokenResponse = await exchangeCodeForTokens(urlAuthCode);
        storeTokens(tokenResponse);
        
        // Clean up URL parameters after successful token exchange
        clearUrlParameters();
        // clearOAuthState(); // Commented out since CSRF protection is disabled
        
        return {
          isAuthenticated: true,
          accessToken: tokenResponse.access_token,
          idToken: tokenResponse.id_token,
        };
      } catch (error) {
        console.error('Token exchange from URL code failed:', error);
        clearTokens();
        // clearOAuthState(); // Commented out since CSRF protection is disabled
        // Clear URL parameters even on failure to avoid retry loops
        clearUrlParameters();
      }
    /*
    } else {
      console.warn('Invalid or missing OAuth state parameter - possible CSRF attack');
      clearUrlParameters();
      clearOAuthState();
    }
    */
  }

  // If no URL code, check session_id cookie and try to get auth code
  const authCode = await checkSessionAndAuthorize();
  
  if (authCode) {
    try {
      console.log('Found auth code from session, exchanging for tokens...');
      // Exchange auth code for tokens
      const tokenResponse = await exchangeCodeForTokens(authCode);
      storeTokens(tokenResponse);
      
      return {
        isAuthenticated: true,
        accessToken: tokenResponse.access_token,
        idToken: tokenResponse.id_token,
      };
    } catch (error) {
      console.error('Token exchange from session failed:', error);
      clearTokens();
    }
  }

  // No authentication available
  return {
    isAuthenticated: false,
    accessToken: null,
    idToken: null,
  };
}

// Sign out function
export function signOut(): void {
  clearTokens();
  // Clear session cookie
  document.cookie = 'session_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  window.location.reload();
} 