/*
 * Dashboard Component with OAuth Authentication Protection
 *
 * Authentication Flow:
 * 1. Check if tokens exist in sessionStorage
 * 2. If no tokens, check session_id cookie and call /oauth/authorize
 * 3. If auth code received, exchange for tokens via /oauth/token
 * 4. Store tokens in sessionStorage
 * 5. Show dashboard or authentication required screen
 *
 * Global Auth Server: Configure in src/lib/auth.ts
 */

import React, {useEffect, useState} from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from "./ui/card.tsx";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "./ui/table.tsx";
import {Button} from "./ui/button.tsx";
import {Badge} from "./ui/badge.tsx";
import {Progress} from "./ui/progress.tsx";
import {Separator} from "./ui/separator.tsx";
import {faker} from "@faker-js/faker";
import {Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,} from "recharts";
import {type AuthState, checkAuthenticationStatus, redirectToLogin, signOut,} from "../lib/auth.ts";

// Generate fake data
const users = Array.from({ length: 8 }, () => ({
  id: faker.string.uuid(),
  name: faker.person.fullName(),
  email: faker.internet.email(),
  status: faker.helpers.arrayElement(["active", "pending", "inactive"]),
  joinDate: faker.date.past().toLocaleDateString(),
  progress: faker.number.int({ min: 10, max: 100 }),
}));

const chartData = Array.from({ length: 7 }, (_, i) => ({
  name: faker.date.weekday(),
  users: faker.number.int({ min: 100, max: 1000 }),
  revenue: faker.number.int({ min: 5000, max: 25000 }),
}));

const revenueData = Array.from({ length: 6 }, (_, i) => ({
  month: faker.date.month(),
  revenue: faker.number.int({ min: 10000, max: 50000 }),
}));

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
          </div>
          <CardTitle className="text-2xl font-bold">
            Checking Authentication
          </CardTitle>
          <CardDescription>
            Please wait while we verify your session...
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

function AuthenticationRequired() {
  const [isLoading, setIsLoading] = useState(false);

  const handleAuthenticate = async () => {
    setIsLoading(true);
    try {
      redirectToLogin();
    } catch (error) {
      console.error("Authentication redirect failed:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold">
            Authentication Required
          </CardTitle>
          <CardDescription>
            You need to authenticate to access this dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-3">
            <p className="text-sm text-muted-foreground">
              We'll check your session and redirect you to authenticate if
              needed.
            </p>
          </div>
          <div className="flex flex-col space-y-2">
            <Button
              onClick={handleAuthenticate}
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Authenticating...
                </>
              ) : (
                "Authenticate with OAuth"
              )}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.location.reload()}
              disabled={isLoading}
            >
              Refresh Page
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DashboardContent({ authState }: { authState: AuthState }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header using shadcn/ui styling */}
      <header className="border-b">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">OAuth Dashboard</h1>
            <Badge variant="secondary">Authenticated</Badge>
            {authState.accessToken && (
              <Badge variant="outline" className="hidden md:inline-flex">
                Token: {authState.accessToken.substring(0, 10)}...
              </Badge>
            )}
          </div>
          <div className="ml-auto flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground text-sm font-medium">
                  {faker.person.firstName().charAt(0)}
                </span>
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium">{faker.person.fullName()}</p>
                <p className="text-xs text-muted-foreground">
                  {faker.internet.email()}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 space-y-6 p-6">
        {/* Stats Cards - showcasing Card component variants */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <div className="h-4 w-4 rounded bg-primary"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {faker.number.int({ min: 1000, max: 10000 }).toLocaleString()}
              </div>
              <CardDescription>
                +{faker.number.int({ min: 1, max: 20 })}% from last month
              </CardDescription>
              <Progress
                value={faker.number.int({ min: 40, max: 90 })}
                className="mt-2"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Sessions
              </CardTitle>
              <div className="h-4 w-4 rounded bg-green-500"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {faker.number.int({ min: 100, max: 1000 }).toLocaleString()}
              </div>
              <CardDescription>
                +{faker.number.int({ min: 1, max: 15 })}% from last hour
              </CardDescription>
              <Progress
                value={faker.number.int({ min: 60, max: 95 })}
                className="mt-2"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <div className="h-4 w-4 rounded bg-yellow-500"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                $
                {faker.number.int({ min: 10000, max: 100000 }).toLocaleString()}
              </div>
              <CardDescription>
                +{faker.number.int({ min: 5, max: 25 })}% from last month
              </CardDescription>
              <Progress
                value={faker.number.int({ min: 30, max: 80 })}
                className="mt-2"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Conversion Rate
              </CardTitle>
              <div className="h-4 w-4 rounded bg-purple-500"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {faker.number.float({ min: 1, max: 10, fractionDigits: 1 })}%
              </div>
              <CardDescription>
                +{faker.number.float({ min: 0.1, max: 2, fractionDigits: 1 })}%
                from last week
              </CardDescription>
              <Progress
                value={faker.number.int({ min: 20, max: 70 })}
                className="mt-2"
              />
            </CardContent>
          </Card>
        </div>

        {/* Charts using Card components */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Active Users</CardTitle>
              <CardDescription>
                User engagement over the past week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="opacity-30"
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "calc(var(--radius) - 2px)",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{
                        fill: "hsl(var(--primary))",
                        strokeWidth: 2,
                        r: 4,
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue</CardTitle>
              <CardDescription>Revenue breakdown by month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="opacity-30"
                    />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "calc(var(--radius) - 2px)",
                      }}
                    />
                    <Bar
                      dataKey="revenue"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Overview with separator */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Overview</CardTitle>
            <CardDescription>
              Recent system activity and metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Database Performance
                </span>
                <Badge variant="outline">Excellent</Badge>
              </div>
              <Progress value={95} />
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">API Response Time</span>
                <Badge variant="secondary">Good</Badge>
              </div>
              <Progress value={78} />
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Server Load</span>
                <Badge variant="destructive">High</Badge>
              </div>
              <Progress value={85} />
            </div>
          </CardContent>
        </Card>

        {/* Users Table using shadcn Table component */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
            <CardDescription>
              A list of users who have recently joined the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Join Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                          <span className="text-secondary-foreground text-sm font-medium">
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">{user.name}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.email}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.status === "active"
                            ? "default"
                            : user.status === "pending"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="w-full max-w-[100px]">
                        <Progress value={user.progress} />
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.joinDate}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Token Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Authentication Details</CardTitle>
            <CardDescription>
              Current session and token information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="text-sm font-medium">Access Token</div>
                <div className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded">
                  {authState.accessToken?.substring(0, 50)}...
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">ID Token</div>
                <div className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded">
                  {authState.idToken?.substring(0, 50)}...
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons showcasing Button variants */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button>Export Data</Button>
              <Button variant="secondary">Generate Report</Button>
              <Button variant="outline">View Analytics</Button>
              <Button variant="ghost">Manage Users</Button>
              <Button variant="destructive">Delete Cache</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [authState, setAuthState] = useState<AuthState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const auth = await checkAuthenticationStatus();
        setAuthState(auth);
      } catch (error) {
        console.error("Authentication check failed:", error);
        setAuthState({
          isAuthenticated: false,
          accessToken: null,
          idToken: null,
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!authState?.isAuthenticated) {
    return <AuthenticationRequired />;
  }

  return <DashboardContent authState={authState} />;
}

