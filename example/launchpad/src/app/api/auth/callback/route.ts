import {NextRequest, NextResponse} from 'next/server'
import axios from 'axios'

export async function POST(request: NextRequest) {
    try {
        const {code, state} = await request.json()

        if (!code) {
            return NextResponse.json(
                {message: 'Authorization code required'},
                {status: 400}
            )
        }

        // Exchange authorization code for tokens
        const tokenResponse = await axios.post(
            `${process.env.OIDC_ISSUER_URL}/oauth/token`,
            new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                client_id: process.env.OIDC_CLIENT_ID!,
                client_secret: process.env.OIDC_CLIENT_SECRET!,
                redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/callback`,
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        )

        const tokens = tokenResponse.data

        // Decode state to get original redirect URI
        let redirect_uri = '/site'
        if (state) {
            try {
                const decodedState = JSON.parse(Buffer.from(state, 'base64').toString())
                redirect_uri = decodedState.redirect_uri ?? '/site'
            } catch (e) {
                console.error('Failed to decode state:', e)
            }
        }

        // Create response with redirect info
        const response = NextResponse.json({redirect_uri})

        // Set secure HTTP-only cookies
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax' as const,
            path: '/',
            maxAge: tokens.expires_in || 3600, // 1 hour default
        }

        response.cookies.set('auth-token', tokens.access_token, cookieOptions)
        response.cookies.set('id-token', tokens.id_token, cookieOptions)
        response.cookies.set('refresh-token', tokens.refresh_token, {
            ...cookieOptions,
            maxAge: 30 * 24 * 60 * 60, // 30 days
        })

        return response
    } catch (error) {
        console.error('Auth callback error:', error)
        if (axios.isAxiosError(error)) {
            console.error('Response data:', error.response?.data)
            console.error('Response status:', error.response?.status)
        }
        return NextResponse.json(
            {message: 'Authentication failed'},
            {status: 500}
        )
    }
}