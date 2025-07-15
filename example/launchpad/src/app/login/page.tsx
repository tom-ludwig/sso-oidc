'use client';

import {useEffect} from 'react';

export default function SignupRedirectPage() {
    useEffect(() => {
        window.location.href = `${process.env.NEXT_PUBLIC_OAUTH_SERVER_FRONTEND_URL}/login?redirect_uri=${process.env.NEXT_PUBLIC_APP_URL}/site&client_id=${process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID}&response_type=code&scope=openid profile email`;
    }, []);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                <p>Redirecting to login...</p>
            </div>
        </div>
    );
}