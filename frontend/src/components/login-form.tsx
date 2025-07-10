import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const apiAddress = "http://localhost:8080/oauth";
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [oauthParams, setOauthParams] = useState({
    client_id: "sap_concur_client_001", // default fallback
    redirect_uri: "https://www.concursolutions.com/auth/callback", // default fallback
    response_type: "code", // default
    state: "", // optional
    scope: "", // optional
  });

  useEffect(() => {
    // Extract parameters from URL and update state
    const urlClientId = searchParams.get("client_id");
    const urlRedirectUri = searchParams.get("redirect_uri");
    const urlResponseType = searchParams.get("response_type");
    const urlState = searchParams.get("state");
    const urlScope = searchParams.get("scope");

    setOauthParams({
      client_id: urlClientId || "sap_concur_client_001",
      redirect_uri:
        urlRedirectUri || "https://www.concursolutions.com/auth/callback",
      response_type: urlResponseType || "code",
      state: urlState || "",
      scope: urlScope || "",
    });
  }, [searchParams]);

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setError(null);
              try {
                const response = await axios.post(
                  apiAddress + "/login",
                  {
                    email,
                    password,
                  },
                  {
                    withCredentials: true,
                  },
                );
                console.log("Login success: ", response.data);

                // if (response.status == 200) {
                //   window.location.href =
                //     `${apiAddress}/authorize?` +
                //     new URLSearchParams({
                //       response_type: "code",
                //       client_id: "sap_concur_client_001",
                //       redirect_uri:
                //         "https://www.concursolutions.com/auth/callback",
                //     }).toString();
                // }

                if (response.status === 200) {
                  // Build OAuth authorization URL with the same parameters from the original request
                  const authParams = new URLSearchParams({
                    response_type: oauthParams.response_type,
                    client_id: oauthParams.client_id,
                    redirect_uri: oauthParams.redirect_uri,
                  });

                  // Add optional parameters if they exist
                  if (oauthParams.state) {
                    authParams.append("state", oauthParams.state);
                  }
                  if (oauthParams.scope) {
                    authParams.append("scope", oauthParams.scope);
                  }

                  window.location.href = `${apiAddress}/authorize?${authParams.toString()}`;
                }
                // window.location.href = apiAddress + "/authorize";
              } catch (err: any) {
                const msg =
                  err.response?.data?.message || err.message || "Login failed";
                setError(msg);
              }
            }}
          >
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {/* Optional error handling */}
              {error && (
                <Alert variant="destructive">
                  {/* <ExclamationTriangleIcon className="h-4 w-4"> */}
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full">
                  Login
                </Button>
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="underline underline-offset-4">
                Sign up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
