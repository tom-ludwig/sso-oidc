/*
 * Copyright (c) 2024 All rights reserved.
 * This code is the intellectual property of Louis Kauer [dev-Laky].
 */

"use client";

import {ReactNode} from "react";
import Link from "next/link";
import {Home, Leaf, LineChart, Package2, PanelLeft, Settings} from "lucide-react";
import {toast} from "sonner";
import {Sheet, SheetContent, SheetTrigger} from "../ui/sheet";
import {Button} from "../../components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "../ui/dropdown-menu";
import {ModeToggle} from "../mode-toggle";
import {Avatar, AvatarFallback, AvatarImage} from "../ui/avatar";
import {useRouter} from "next/navigation";
import axios from "axios";


interface PlantBlockSkeletonProps {
    children: ReactNode;
    site: string;
}

export default function NavbarMobile({children, site}: Readonly<PlantBlockSkeletonProps>) {
    const router = useRouter()

    const handleLogout = async () => {
        try {
            await axios.post('/api/auth/logout', {}, {
                withCredentials: true,
            });
        } catch (error) {
            console.error('Logout error:', error);
        }

        // Redirect regardless of API call success
        window.location.href = '/';
    };

    return (
        <>
            <header
                className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button size="icon" variant="outline" className="sm:hidden">
                            <PanelLeft className="h-5 w-5"/>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="sm:max-w-xs">
                        <nav className="grid gap-6 text-lg font-medium">
                            <Link
                                href="#"
                                className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
                            >
                                <Package2 className="h-5 w-5 transition-all group-hover:scale-110"/>
                            </Link>
                            <Link
                                href={"/site"}
                                className={`flex items-center gap-4 px-2.5 hover:text-foreground ${site === "site" ? "text-foreground" : "text-muted-foreground"}`}
                            >
                                <Home className="h-5 w-5"/>
                                Home
                            </Link>
                            <span
                                onClick={() => {
                                    toast(`The Landscape Site is in Development.`, {
                                        description: "Please be patient for further updates.",
                                    });
                                }}
                                className={`flex items-center gap-4 px-2.5 hover:text-foreground ${site === "analyze" ? "text-foreground" : "text-muted-foreground"}`}
                            >
                                    <Leaf className="h-5 w-5"/>
                                    Landscape
                                </span>
                            <span
                                onClick={() => {
                                    toast(`The Analysis Site is in Development.`, {
                                        description: "Please be patient for further updates.",
                                    });
                                }}
                                className={`flex items-center gap-4 px-2.5 hover:text-foreground ${site === "analyze" ? "text-foreground" : "text-muted-foreground"}`}
                            >
                                    <LineChart className="h-5 w-5"/>
                                    Analysis
                                </span>
                            <Link
                                href={"/settings"}
                                className={`flex items-center gap-4 px-2.5 hover:text-foreground ${site === "settings" ? "text-foreground" : "text-muted-foreground"}`}
                            >
                                <Settings className="h-5 w-5"/>
                                Settings
                            </Link>
                        </nav>
                    </SheetContent>
                </Sheet>
                {children}
                <div className="relative ml-auto flex-1 md:grow-0"/>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            className="overflow-hidden rounded-full"
                        >
                            <Avatar>
                                <AvatarImage alt="CK"/>
                                <AvatarFallback>CK</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Christian Klein</DropdownMenuLabel>
                        <DropdownMenuSeparator/>
                        <Link href={"/settings"}>
                            <DropdownMenuItem>Settings</DropdownMenuItem>
                        </Link>
                        <Link href={"mailto:laky.dev@proton.me"}>
                            <DropdownMenuItem>Support</DropdownMenuItem>
                        </Link>
                        <DropdownMenuSeparator/>
                        <DropdownMenuItem onSelect={handleLogout}>Logout</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <ModeToggle/>
            </header>
        </>
    )
}
