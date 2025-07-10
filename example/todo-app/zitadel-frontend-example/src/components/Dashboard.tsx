import {useCallback, useEffect, useRef, useState} from "react";
import {User} from "oidc-client-ts";
import axios from "axios";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Badge} from "@/components/ui/badge";
import {Separator} from "@/components/ui/separator";
import {Activity, CheckCircle2, Clock, Plus, User as UserIcon} from "lucide-react";

interface DashboardProps {
    userInfo: User;
}

export function Dashboard({userInfo}: DashboardProps) {
    const [tasks, setTasks] = useState<string[]>([]);
    const [newTask, setNewTask] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [hasInitialized, setHasInitialized] = useState(false);
    const [healthStatus, setHealthStatus] = useState<'checking' | 'healthy' | 'unhealthy'>('checking');

    // Use ref to track if we've already fetched tasks to prevent duplicates
    const hasFetchedRef = useRef(false);

    const checkHealth = useCallback(async () => {
        try {
            const response = await axios.get("http://localhost:8089/api/healthz", {
                timeout: 3000,
            });
            setHealthStatus(response.status === 200 ? 'healthy' : 'unhealthy');
        } catch (error) {
            setHealthStatus('unhealthy');
        }
    }, []);

    const fetchTasks = useCallback(async (token: string) => {
        // Prevent multiple simultaneous calls
        if (isLoading || hasFetchedRef.current) {
            return;
        }

        try {
            setIsLoading(true);
            hasFetchedRef.current = true;

            const response = await axios.get("http://localhost:8089/api/tasks", {
                headers: {Authorization: `Bearer ${token}`},
                timeout: 5000,
            });

            const data = response.data;

            if (Array.isArray(data.tasks)) {
                setTasks(data.tasks);
            } else {
                setTasks([]);
            }
        } catch (error) {
            // Set empty tasks, no retry
            setTasks([]);
        } finally {
            setIsLoading(false);
            setHasInitialized(true);
        }
    }, [isLoading]);

    const addTask = useCallback(async (token: string, task: string) => {
        if (!task.trim() || isLoading) return;

        try {
            setIsLoading(true);

            await axios.post(
                "http://localhost:8089/api/add-task",
                {task: task},
                {
                    headers: {Authorization: `Bearer ${token}`},
                    timeout: 5000,
                },
            );

            // NO RETRY - Just add to local state and clear input
            setTasks(prev => [...prev, task]);
            setNewTask("");

        } catch (error) {
            // Add task locally if API fails, no retry
            setTasks(prev => [...prev, task]);
            setNewTask("");
        } finally {
            setIsLoading(false);
        }
    }, [isLoading]);

    // Use the access token string instead of the whole userInfo object
    const accessToken = userInfo?.access_token;

    useEffect(() => {
        // Only fetch once when we have a token and haven't initialized yet
        if (accessToken && !hasInitialized && !hasFetchedRef.current) {
            fetchTasks(accessToken);
        }
    }, [accessToken, hasInitialized, fetchTasks]);

    // Check health on component mount
    useEffect(() => {
        checkHealth();
    }, [checkHealth]);

    const handleAddTask = useCallback(() => {
        if (accessToken && newTask.trim()) {
            addTask(accessToken, newTask);
        }
    }, [accessToken, newTask, addTask]);

    const oandleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTask();
        }
    }, [handleAddTask]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setNewTask(e.target.value);
    }, []);

    const getHealthBadge = () => {
        switch (healthStatus) {
            case 'healthy':
                return <Badge variant="default" className="bg-green-500">Healthy</Badge>;
            case 'unhealthy':
                return <Badge variant="destructive">Unhealthy</Badge>;
            default:
                return <Badge variant="secondary">Checking...</Badge>;
        }
    };

    return (
        <div className="container mx-auto py-8 px-4 max-w-6xl">
            {/* Welcome Section */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">
                    Welcome back, {userInfo.profile?.name || 'User'}!
                </h1>
                <p className="text-muted-foreground">
                    Here's your task overview for today.
                </p>
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                        ✅ Dashboard is working! Tasks: {tasks.length}
                    </p>
                </div>

                {/* Temporary Debug Section - Remove after testing */}
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm font-semibold text-yellow-800 mb-2">Debug: User Profile Claims</p>
                    <pre className="text-xs text-yellow-700 overflow-auto max-h-32">
            {JSON.stringify(userInfo.profile, null, 2)}
          </pre>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Add Task Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Plus className="w-5 h-5"/>
                                Add New Task
                            </CardTitle>
                            <CardDescription>
                                Create a new task to add to your list
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Enter a new task..."
                                    value={newTask}
                                    onChange={handleInputChange}
                                    onKeyPress={oandleKeyPress}
                                    disabled={isLoading}
                                />
                                <Button
                                    onClick={handleAddTask}
                                    disabled={isLoading || !newTask.trim()}
                                >
                                    {isLoading ? "Adding..." : "Add Task"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tasks List */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5"/>
                                Your Tasks
                            </CardTitle>
                            <CardDescription>
                                {tasks.length === 0
                                    ? "No tasks yet. Add your first task above!"
                                    : `You have ${tasks.length} task${tasks.length === 1 ? '' : 's'}`
                                }
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading && tasks.length === 0 ? (
                                <div className="space-y-2">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="h-12 bg-muted animate-pulse rounded"/>
                                    ))}
                                </div>
                            ) : tasks.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Clock className="w-12 h-12 mx-auto mb-4 opacity-50"/>
                                    <p>No tasks yet. Time to add your first one!</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {tasks.map((task, index) => (
                                        <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                            <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"/>
                                            <span className="flex-1">{task}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Profile Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UserIcon className="w-5 h-5"/>
                                Profile
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm font-medium">Name</p>
                                <p className="text-sm text-muted-foreground">{userInfo.profile?.name || 'N/A'}</p>
                            </div>
                            <Separator/>
                            <div>
                                <p className="text-sm font-medium">Email</p>
                                <p className="text-sm text-muted-foreground">{userInfo.profile?.email || 'N/A'}</p>
                            </div>
                            <Separator/>
                            <div>
                                <p className="text-sm font-medium">Email Verified</p>
                                <Badge variant={userInfo.profile?.email_verified ? "default" : "secondary"}>
                                    {userInfo.profile?.email_verified ? "Verified" : "Unverified"}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stats Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="w-5 h-5"/>
                                Statistics
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Total Tasks</span>
                                <Badge variant="secondary">{tasks.length}</Badge>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Today</span>
                                <Badge variant="default">{tasks.length}</Badge>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">API Health</span>
                                {getHealthBadge()}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
} 