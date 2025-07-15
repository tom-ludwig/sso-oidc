import {useEffect, useState} from "react";
import {User, UserManager} from "oidc-client-ts";
import axios from "axios";

type Props = {
    authenticated: boolean | null;
    setAuth: (authenticated: boolean | null) => void;
    userManager: UserManager;
    handleLogout: () => void;
};

const Callback = ({
                      authenticated,
                      setAuth,
                      userManager,
                      handleLogout,
                  }: Props) => {
    const [userInfo, setUserInfo] = useState<User | null>(null);
    const [tasks, setTasks] = useState<string[]>([]);
    const [newTask, setNewTask] = useState<string>("");

    const fetchTasks = async (token: string) => {
        try {
            const response = await axios.get("http://localhost:8089/api/tasks", {
                headers: {Authorization: `Bearer ${token}`},
            });

            const data = response.data;

            console.log("Fetched tasks response:", data);

            if (Array.isArray(data.tasks)) {
                setTasks(data.tasks);
            } else {
                console.error("Unexpected format. 'tasks' not an array.");
                setTasks([]);
            }
        } catch (error) {
            console.error("Failed to fetch tasks", error);
            setTasks([]);
        }
    };

    const addTask = async (token: string, task: string) => {
        try {
            await axios.post(
                "http://localhost:8089/api/add-task",
                {task: task},
                {
                    headers: {Authorization: `Bearer ${token}`},
                },
            );
            fetchTasks(token);
        } catch (error) {
            console.error("Failed to add task", error);
        }
    };

    useEffect(() => {
        if (authenticated === null) {
            userManager
                .signinRedirectCallback()
                .then((user: User) => {
                    if (user) {
                        setAuth(true);
                        setUserInfo(user);
                    } else {
                        setAuth(false);
                    }
                })
                .catch(() => {
                    setAuth(false);
                });
        }

        if (authenticated === true && userInfo === null) {
            userManager
                .getUser()
                .then((user) => {
                    if (user) {
                        setAuth(true);
                        setUserInfo(user);
                        fetchTasks(user.access_token);
                    } else {
                        setAuth(false);
                    }
                })
                .catch(() => {
                    setAuth(false);
                });
        }
    }, [authenticated, userInfo, setAuth, userManager]);

    const handleAddTask = () => {
        if (userInfo) {
            addTask(userInfo.access_token, newTask);
            setNewTask("");
        }
    };

    if (authenticated === true && userInfo) {
        return (
            <div className="user">
                <h2>Welcome, {userInfo.profile?.name}!</h2>
                <p className="description">Your ZITADEL Profile Information</p>
                <p>Name: {userInfo.profile?.name}</p>
                <p>Email: {userInfo.profile?.email}</p>
                <p>Access Token: {userInfo.access_token}</p>
                <p>Email Verified: {userInfo.profile?.email_verified ? "Yes" : "No"}</p>
                <p>
                    Roles:{" "}
                    {JSON.stringify(
                        userInfo.profile?.["urn:zitadel:iam:org:project:roles"],
                    )}
                </p>

                <button onClick={handleLogout}>Log out</button>

                <div className="tasks">
                    <h3>Tasks</h3>
                    <ul>
                        {tasks.map((task, index) => (
                            <li key={index}>{task}</li>
                        ))}
                    </ul>
                    <input
                        type="text"
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        placeholder="Add a new task"
                    />
                    <button onClick={handleAddTask}>Post Task</button>
                </div>
            </div>
        );
    }

    return <div>Loading...</div>;
};

export default Callback;
