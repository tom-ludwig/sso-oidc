import {NextRequest, NextResponse} from 'next/server'
import axios from 'axios'

export async function GET(request: NextRequest) {
    // Get token from cookie
    const token = request.cookies.get('Session ID')?.value

    if (!token) {
        return NextResponse.json(
            {message: 'No token provided'},
            {status: 401}
        )
    }

    try {
        // Validate token with your auth server's userinfo endpoint
        const response = await axios.get(`${process.env.OIDC_ISSUER_URL}/userinfo`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })

        const userData = response.data
        return NextResponse.json(userData)
    } catch (error) {
        console.error('Token validation failed:', error)

        if (axios.isAxiosError(error) && error.response?.status === 401) {
            return NextResponse.json(
                {message: 'Invalid token'},
                {status: 401}
            )
        }

        return NextResponse.json(
            {message: 'Authentication server error'},
            {status: 500}
        )
    }
}