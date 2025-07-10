import React, { useEffect, useState, createContext } from "react";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== "http://api.myapp.local:8080/") return;

      const { type, token, user } = event.data;
      if (type === "SSO_AUTH_SUCCESS") {
        setUser(user);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  useEffect(() => {
    const authorize = async () => {
      const url = new URL("http://api.myapp.local:8080/oauth/authorize");
      url.searchParams.append("response_type", "code");
      url.searchParams.append("client_id", "my-client-id");
      url.searchParams.append("redirect_uri", "http://myapp.local:5173/callback");
      url.searchParams.append("origin", "http://myapp.local:5173");

      try {
        const response = await fetch(url.toString(), {
          method: "GET",
          credentials: "include",
          // redirect: "manual",
        });

        if (response.status === 302 || response.status === 307) {
          const location = response.headers.get("Location");
          if (location) {
            window.location.href = location;
          } else {
            console.error("Redirect status but no Location header");
          }
        } else {
          console.log("Authorization response status:", response.status);
        }
        console.log("Final response:", response);
      } catch (err) {
        console.error("Authorization fetch failed", err);
      }
    };

    authorize();
  }, []);

  return (
    <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
  );
};
