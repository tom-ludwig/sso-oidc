'use client'

import {useEffect} from 'react'
import {useRouter, useSearchParams} from 'next/navigation'
import axios from 'axios'

export default function AuthCallback() {
    const router = useRouter()
    const searchParams = useSearchParams()

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Get authorization code from URL params
                const code = searchParams.get('code')
                const state = searchParams.get('state')
                const error = searchParams.get('error')

                if (error) {
                    console.error('Auth error:', error)
                    router.push('/?error=auth_failed')
                    return
                }

                if (code) {
                    // Exchange code for tokens
                    const response = await axios.post('/api/auth/callback', {
                        code,
                        state,
                    })

                    const {redirect_uri} = response.data
                    // Redirect to original destination or default
                    router.push(redirect_uri ?? '/site')
                } else {
                    // No code parameter, redirect to home
                    router.push('/')
                }
            } catch (error) {
                console.error('Callback handling failed:', error)
                router.push('/?error=auth_failed')
            }
        }

        handleCallback().then(r => console.log('Callback handled:', r))
    }, [router, searchParams])

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                <p>Processing authentication...</p>
            </div>
        </div>
    )
}