/*
 * Copyright (c) 2024 All rights reserved.
 * This code is the intellectual property of Louis Kauer [dev-Laky].
 */

"use client";

import Link from "next/link";
import {Home, Leaf, LineChart, Package2, Settings} from "lucide-react";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import {toast} from "sonner";


interface PlantBlockSkeletonProps {
    site: string;
}

export default function Navbar({site}: Readonly<PlantBlockSkeletonProps>) {

    return (
        <>
            <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
                <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
                    <Link
                        href="#"
                        className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
                    >
                        <Package2 className="h-4 w-4 transition-all group-hover:scale-110"/>
                    </Link>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Link
                                    href={"/site"}
                                    className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-foreground md:h-8 md:w-8 ${site === "site" ? "text-foreground" : "text-muted-foreground"}`}
                                >
                                    <Home className="h-5 w-5"/>
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent side="right">Home</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger onClick={() => {
                                toast(`The Landscape Site is in Development.`, {
                                    description: "Please be patient for further updates.",
                                });
                            }} asChild>
                                <span
                                    className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-foreground md:h-8 md:w-8 ${site === "analyze" ? "text-foreground" : "text-muted-foreground"}`}
                                >
                                    <Leaf className="h-5 w-5"/>
                                </span>
                            </TooltipTrigger>
                            <TooltipContent side="right">Landscape</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger onClick={() => {
                                toast(`The Analysis Site is in Development.`, {
                                    description: "Please be patient for further updates.",
                                });
                            }} asChild>
                                <span
                                    className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-foreground md:h-8 md:w-8 ${site === "analyze" ? "text-foreground" : "text-muted-foreground"}`}
                                >
                                    <LineChart className="h-5 w-5"/>
                                </span>
                            </TooltipTrigger>
                            <TooltipContent side="right">Analysis</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </nav>
                <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Link
                                    href={"/settings"}
                                    className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-foreground md:h-8 md:w-8 ${site === "settings" ? "text-foreground" : "text-muted-foreground"}`}
                                >
                                    <Settings className="h-5 w-5"/>
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent side="right">Settings</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </nav>
            </aside>
        </>
    )
}
