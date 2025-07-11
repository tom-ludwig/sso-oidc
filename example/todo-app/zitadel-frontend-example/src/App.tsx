import {useCallback, useEffect, useMemo, useState} from "react";
import {createZitadelAuth, type ZitadelConfig} from "@zitadel/react";
import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import {User} from "oidc-client-ts";

import {Header} from "./components/Header";
import {Homepage} from "./components/Homepage";
import {Dashboard} from "./components/Dashboard";

// Callback component to handle authentication redirect
function CallbackHandler({zitadel, setAuthenticated, setUserInfo}: {
    zitadel: any;
    setAuthenticated: (auth: boolean) => void;
    setUserInfo: (user: User | null) => void;
}) {
    const [isProcessing, setIsProcessing] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleCallback = async () => {
            try {
                const user = await zitadel.userManager.signinRedirectCallback();
                if (user) {
                    setAuthenticated(true);
                    setUserInfo(user);
                } else {
                    setAuthenticated(false);
                    setUserInfo(null);
                    setError("Authentication failed");
                }
            } catch (error) {
                console.error("Callback error:", error);
                setAuthenticated(false);
                setUserInfo(null);
                setError("Authentication error occurred");
            } finally {
                setIsProcessing(false);
            }
        };

        handleCallback();
    }, [zitadel, setAuthenticated, setUserInfo]);

    if (isProcessing) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p>Completing authentication...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-red-500 mb-4">{error}</p>
                    <Navigate to="/" replace/>
                </div>
            </div>
        );
    }

    return <Navigate to="/dashboard" replace/>;
}

function App() {
    const config: ZitadelConfig = useMemo(() => ({
        authority: "http://localhost:8080",
        client_id: "327812043233099779",
        redirect_uri: "http://localhost:5173/callback",
        post_logout_redirect_uri: "http://localhost:5173",
        scope: "openid profile email",
    }), []);

    const zitadel = useMemo(() => createZitadelAuth(config), [config]);

    const login = useCallback(() => {
        zitadel.authorize();
    }, [zitadel]);

    const signout = useCallback(() => {
        zitadel.signout();
        setAuthenticated(false);
        setUserInfo(null);
    }, [zitadel]);

    const [authenticated, setAuthenticated] = useState<boolean | null>(null);
    const [userInfo, setUserInfo] = useState<User | null>(null);
    const [hasCheckedUser, setHasCheckedUser] = useState(false);

    useEffect(() => {
        if (hasCheckedUser) return; // Only check once

        let isMounted = true;

        zitadel.userManager.getUser().then((user) => {
            if (isMounted) {
                console.log("Current user:", user);
                if (user) {
                    setAuthenticated(true);
                    setUserInfo(user);
                } else {
                    setAuthenticated(false);
                    setUserInfo(null);
                }
                setHasCheckedUser(true);
            }
        }).catch((error) => {
            if (isMounted) {
                console.error("Error getting user:", error);
                setAuthenticated(false);
                setUserInfo(null);
                setHasCheckedUser(true);
            }
        });

        return () => {
            isMounted = false;
        };
    }, [zitadel, hasCheckedUser]);

    console.log("App state:", {authenticated, userInfo: !!userInfo}); // Debug log

    return (
        <BrowserRouter>
            <div className="min-h-screen bg-background">
                <Header
                    authenticated={authenticated}
                    userInfo={userInfo}
                    onLogin={login}
                    onLogout={signout}
                />

                <Routes>
                    <Route
                        path="/"
                        element={
                            authenticated === true ?
                                <Navigate to="/dashboard" replace/> :
                                <Homepage onLogin={login}/>
                        }
                    />
                    <Route
                        path="/callback"
                        element={
                            <CallbackHandler
                                zitadel={zitadel}
                                setAuthenticated={setAuthenticated}
                                setUserInfo={setUserInfo}
                            />
                        }
                    />
                    <Route
                        path="/dashboard"
                        element={
                            authenticated === true && userInfo ? (
                                <Dashboard userInfo={userInfo}/>
                            ) : authenticated === false ? (
                                <Navigate to="/" replace/>
                            ) : (
                                <div className="flex items-center justify-center min-h-screen">
                                    <div className="text-center">
                                        <div
                                            className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                                        <p>Loading...</p>
                                    </div>
                                </div>
                            )
                        }
                    />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;
