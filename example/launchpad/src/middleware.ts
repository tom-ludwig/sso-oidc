// middleware.ts
import {NextRequest, NextResponse} from 'next/server';
import axios from 'axios';

const AUTH_SERVER_URL = process.env.NEXT_PUBLIC_AUTH_SERVER_URL || 'http://no-auth-server-url';
const CLIENT_ID = process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID || 'your-client-id';
const CLIENT_SECRET = process.env.NEXT_PUBLIC_OAUTH_CLIENT_SECRET || 'your-client-secret';

interface JWTPayload {
    sub: string;
    iss: string;
    aud: string;
    exp: number;
    iat: number;
    email?: string;
    name?: string;
}

// Simple JWT decoder (for verification, use a proper JWT library in production)
function decodeJWT(token: string): JWTPayload | null {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;

        console.log(parts[1]); // TODO: Remove this debug log in production

        return JSON.parse(atob(parts[1]));
    } catch {
        return null;
    }
}

// Verify JWT token with JWKS
async function verifyToken(token: string): Promise<boolean> {
    try {
        const payload = decodeJWT(token);
        if (!payload) return false;

        // Check expiration
        if (payload.exp * 1000 < Date.now()) {
            console.warn('Token expired:', payload.exp); // TODO : Remove this debug log in production
            return false;
        }

        console.log("Token payload:", payload); // TODO: Remove this debug log in production

        // In production, verify signature with JWKS from /.well-known/jwks.json
        // For now, basic validation
        // return payload.iss === AUTH_SERVER_URL && payload.aud === CLIENT_ID;
        return payload.aud === CLIENT_ID;
    } catch {
        return false;
    }
}

// Exchange authorization code for tokens
async function exchangeCodeForTokens(code: string, redirectUri: string) {
    try {
        const response = await axios.post(
            `${AUTH_SERVER_URL}/oauth/token`,
            new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                redirect_uri: redirectUri,
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );

        return response.data;
    } catch (error) {
        console.error('Token exchange failed:', error);
        return null;
    }
}

export async function middleware(request: NextRequest) {
    const {pathname, searchParams} = request.nextUrl;

    // Only protect /site and /settings routes
    if (!pathname.startsWith('/site') && !pathname.startsWith('/settings')) {
        return NextResponse.next();
    }

    // Check for authorization code in callback
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (code) {
        // Handle OAuth callback
        const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}${pathname}`;
        const tokens = await exchangeCodeForTokens(code, redirectUri);

        if (tokens) {
            // Set tokens in cookies and redirect to clean URL
            const response = NextResponse.redirect(new URL(pathname, request.url));

            // Set secure HTTP-only cookies
            response.cookies.set('access_token', tokens.access_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: tokens.expires_in || 3600,
            });

            if (tokens.id_token) {
                response.cookies.set('id_token', tokens.id_token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    maxAge: tokens.expires_in || 3600,
                });
            }

            return response;
        }
    }

    // Check for existing valid token
    const accessToken = request.cookies.get('access_token')?.value;
    const idToken = request.cookies.get('id_token')?.value;

    if (accessToken && idToken) {
        const isValid = await verifyToken(idToken);
        if (isValid) {
            // Add user info to request headers for downstream use
            const payload = decodeJWT(idToken);
            if (payload) {
                const requestHeaders = new Headers(request.headers);
                requestHeaders.set('x-user-id', payload.sub);
                requestHeaders.set('x-user-email', payload.email || '');

                return NextResponse.next({
                    request: {
                        headers: requestHeaders,
                    },
                });
            }
        }
    }

    // No valid token, redirect to authorization
    const redirectUri = `${request.nextUrl.origin}${pathname}`;
    const authUrl = new URL(`${AUTH_SERVER_URL}/oauth/authorize`);

    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('client_id', CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('scope', 'openid profile email');
    authUrl.searchParams.set('state', pathname); // Use pathname as state for redirect after auth

    return NextResponse.redirect(authUrl);
}

export const config = {
    matcher: ['/site/:path*', '/settings/:path*'],
};