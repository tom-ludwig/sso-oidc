/*
 * Copyright (c) 2024 All rights reserved.
 * This code is the intellectual property of Louis Kauer [dev-Laky].
 */

"use client";

import Link from "next/link"
import {Terminal,} from "lucide-react"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {Card, CardContent, CardHeader, CardTitle,} from "@/components/ui/card"
import Navbar from "@/components/Navbar/Navbar";
import NavbarMobile from "@/components/Navbar/NavbarMobile";
import * as React from "react";
import {useEffect, useState} from "react";
import {usePlantData} from "@/hooks/usePlantData/usePlantData";
import {Alert, AlertTitle} from "@/components/ui/alert";
import {getVersion} from "@/lib/PlantData/PlantData";


export default function Settings() {

    // Fetch every 5 seconds
    const {plantData, locationData, loading, error} = usePlantData(5000);

    const [version, setVersion] = useState<string>('');

    useEffect(() => {
        const fetchVersion = async () => {
            const version = await getVersion();
            setVersion(version);
        };
        fetchVersion().then(r => r);
    }, []);

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <Navbar site={"settings"}></Navbar>
            <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
                <NavbarMobile site={"settings"}>
                    <Breadcrumb className="hidden md:flex">
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbPage className={"text-muted-foreground"}>Home</BreadcrumbPage>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator/>
                            <BreadcrumbItem>
                                <BreadcrumbLink asChild>
                                    <Link href={"/settings"}>Settings</Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </NavbarMobile>
                <main
                    className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
                    <div className="mx-auto grid w-full max-w-6xl gap-2">
                        <h1 className="text-3xl font-semibold">Settings</h1>
                    </div>
                    <div
                        className="mx-auto grid w-full max-w-6xl items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
                        <nav
                            className="grid gap-4 text-sm text-muted-foreground" x-chunk="dashboard-04-chunk-0"
                        >
                            <Link href="#" className="font-semibold text-primary">
                                General
                            </Link>
                        </nav>
                        <div className="grid gap-6">
                            <Card x-chunk="dashboard-04-chunk-1">
                                <CardHeader>
                                    <CardTitle>Launchpad Version</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Alert>
                                        <Terminal className="h-4 w-4"/>
                                        <AlertTitle>v{version} BETA</AlertTitle>
                                    </Alert>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}
