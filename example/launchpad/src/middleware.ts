import type {NextRequest} from 'next/server'
import {NextResponse} from 'next/server'

// Define protected routes
const protectedRoutes = ['/site', '/settings']

export function middleware(request: NextRequest) {
    const {pathname} = request.nextUrl

    // Check if the current path is a protected route
    const isProtectedRoute = protectedRoutes.some(route =>
        pathname.startsWith(route)
    )

    if (isProtectedRoute) {
        // Check for authentication token
        const token = request.cookies.get('Session ID')?.value

        if (!token) {
            // For API routes, return 401 instead of redirect
            if (pathname.startsWith('/api/')) {
                return NextResponse.json(
                    {message: 'Authentication required'},
                    {status: 401}
                )
            }

            // For page routes, redirect to auth server
            const authUrl = new URL('/oauth/authorize', process.env.OIDC_ISSUER_URL!)
            authUrl.searchParams.set('response_type', 'code')
            authUrl.searchParams.set('client_id', process.env.OIDC_CLIENT_ID!)
            authUrl.searchParams.set('redirect_uri', `${process.env.NEXT_PUBLIC_APP_URL}/callback`)
            authUrl.searchParams.set('scope', 'openid profile email')

            // Encode the original URL as state for redirect after login
            const state = Buffer.from(JSON.stringify({
                redirect_uri: request.url
            })).toString('base64')
            authUrl.searchParams.set('state', state)

            return NextResponse.redirect(authUrl)
        }

        // Optional: You could add server-side token validation here
        // For now, we'll trust the presence of the cookie
        // In production, you might want to validate the token periodically
    }

    return NextResponse.next()
}

// Configure which routes this middleware should run on
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder files
         * - callback (auth callback page)
         */
        '/((?!_next/static|_next/image|favicon.ico|public|callback).*)',
    ],
}