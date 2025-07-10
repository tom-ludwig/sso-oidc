import {NextRequest, NextResponse} from 'next/server'

export async function POST(request: NextRequest) {
    const response = NextResponse.json({message: 'Logged out successfully'})

    // Clear all auth cookies
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        path: '/',
        maxAge: 0, // Expire immediately
    }

    response.cookies.set('Session ID', '', cookieOptions)

    return response
}