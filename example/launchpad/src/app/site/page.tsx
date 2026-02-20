"use client";

import Link from "next/link"
import Navbar from "../../components/Navbar/Navbar";
import NavbarMobile from "../../components/Navbar/NavbarMobile";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from "../../components/ui/breadcrumb";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "../../components/ui/card";
import {Avatar, AvatarFallback, AvatarImage} from "@radix-ui/react-avatar";


export default function Site() {


    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <Navbar site={"site"}></Navbar>
            <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
                <NavbarMobile site={"site"}>
                    <Breadcrumb className="hidden md:flex">
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbPage className={"text-muted-foreground"}>Home</BreadcrumbPage>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator/>
                            <BreadcrumbItem>
                                <BreadcrumbLink asChild>
                                    <Link href={"/site"}>Explore</Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </NavbarMobile>

                <div className="mt-10 pl-6 lg:mt-3 lg:pl-8 md:mt-3 md:pl-8 sm:mt-3 sm:pl-8">
                    <h1 className="text-3xl font-bold mb-4">My Applications</h1>
                </div>

                <main
                    className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
                    <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
                        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-5">

                            <Link href={"http://localhost:5555"}>
                                <Card className="hover:bg-gray-900" x-chunk="dashboard-05-chunk-2">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-2xl">Analytics</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <CardDescription>Track performance metrics and business
                                            insights</CardDescription>
                                    </CardContent>
                                    <CardFooter>
                                        <Avatar className="w-12 h-12">
                                            <AvatarImage src="https://cdn-icons-png.flaticon.com/512/2920/2920277.png"/>
                                            <AvatarFallback>ANA</AvatarFallback>
                                        </Avatar>
                                    </CardFooter>
                                </Card>
                            </Link>

                            <Card className="hover:bg-gray-900" x-chunk="dashboard-05-chunk-1">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-2xl">CRM</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription>Manage customer relationships and sales pipeline</CardDescription>
                                </CardContent>
                                <CardFooter>
                                    <Avatar className="w-12 h-12">
                                        <AvatarImage src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"/>
                                        <AvatarFallback>CRM</AvatarFallback>
                                    </Avatar>
                                </CardFooter>
                            </Card>

                            <Card className="hover:bg-gray-900" x-chunk="dashboard-05-chunk-4">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-2xl">Inventory</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription>Track stock levels and manage warehouse
                                        operations</CardDescription>
                                </CardContent>
                                <CardFooter>
                                    <Avatar className="w-12 h-12">
                                        <AvatarImage src="https://cdn-icons-png.flaticon.com/512/3659/3659899.png"/>
                                        <AvatarFallback>INV</AvatarFallback>
                                    </Avatar>
                                </CardFooter>
                            </Card>

                            <Card className="hover:bg-gray-900" x-chunk="dashboard-05-chunk-6">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-2xl">HR Management</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription>Employee records, payroll, and performance
                                        tracking</CardDescription>
                                </CardContent>
                                <CardFooter>
                                    <Avatar className="w-12 h-12">
                                        <AvatarImage src="https://cdn-icons-png.flaticon.com/512/1077/1077012.png"/>
                                        <AvatarFallback>HRM</AvatarFallback>
                                    </Avatar>
                                </CardFooter>
                            </Card>

                            <Card className="hover:bg-gray-900" x-chunk="dashboard-05-chunk-7">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-2xl">Project Manager</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription>Plan, track, and deliver projects on time</CardDescription>
                                </CardContent>
                                <CardFooter>
                                    <Avatar className="w-12 h-12">
                                        <AvatarImage src="https://cdn-icons-png.flaticon.com/512/2422/2422601.png"/>
                                        <AvatarFallback>PM</AvatarFallback>
                                    </Avatar>
                                </CardFooter>
                            </Card>

                            <Card className="hover:bg-gray-900" x-chunk="dashboard-05-chunk-8">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-2xl">Document Manager</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription>Store, organize, and share business documents</CardDescription>
                                </CardContent>
                                <CardFooter>
                                    <Avatar className="w-12 h-12">
                                        <AvatarImage src="https://cdn-icons-png.flaticon.com/512/3659/3659898.png"/>
                                        <AvatarFallback>DOC</AvatarFallback>
                                    </Avatar>
                                </CardFooter>
                            </Card>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}
