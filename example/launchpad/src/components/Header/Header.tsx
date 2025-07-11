import {Button} from "../../components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {Avatar, AvatarFallback, AvatarImage} from "../../components/ui/avatar";
import {LogOut} from "lucide-react";
import {User as AuthUser} from "oidc-client-ts";
import {useRouter} from "next/navigation";

interface HeaderProps {
    authenticated: boolean | null;
    userInfo: AuthUser | null;
}

export function Header({authenticated, userInfo}: Readonly<HeaderProps>) {
    const router = useRouter();

    const onSignUp = () => {
        window.location.href = `${process.env.NEXT_PUBLIC_OAUTH_SERVER_FRONTEND_URL}/signup`;
    };

    const onLogin = () => {
        router.push('/login');
    }

    return (
        <header
            className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center space-x-2">
                    <h1 className="text-xl font-bold">SAP SE</h1>
                </div>

                <nav className="flex items-center space-x-6">
                    {authenticated === false && (
                        <Button onClick={onLogin} variant="default">
                            Sign In
                        </Button>
                    )}

                    <Button onClick={onSignUp} variant="outline">
                        Sign Up
                    </Button>

                    {authenticated === true && userInfo && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src="" alt={userInfo.profile?.name || ""}/>
                                        <AvatarFallback>
                                            {userInfo.profile?.name?.charAt(0) || "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">
                                            {userInfo.profile?.name}
                                        </p>
                                        <p className="text-xs leading-none text-muted-foreground">
                                            {userInfo.profile?.email}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator/>
                                <DropdownMenuItem onClick={() => {
                                }}>
                                    <LogOut className="mr-2 h-4 w-4"/>
                                    <span>Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}

                    {authenticated === null && (
                        <div className="h-10 w-10 rounded-full bg-muted animate-pulse"/>
                    )}
                </nav>
            </div>
        </header>
    );
}