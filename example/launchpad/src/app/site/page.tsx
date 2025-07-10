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
                            <Card className="hover:bg-gray-900" x-chunk="dashboard-05-chunk-1">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-2xl">TODO</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription>Write down your todos!</CardDescription>
                                </CardContent>
                                <CardFooter>
                                    <Avatar>
                                        <AvatarImage
                                            src="https://icons.veryicon.com/png/o/business/vscode-program-item-icon/todo-2.png"/>
                                        <AvatarFallback>APP</AvatarFallback>
                                    </Avatar>
                                </CardFooter>
                            </Card>
                            <Card className="hover:bg-gray-900" x-chunk="dashboard-05-chunk-1">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-2xl">Snake</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription>Play your favorite game - Snake!</CardDescription>
                                </CardContent>
                                <CardFooter>
                                    <Avatar>
                                        <AvatarImage src="https://images.icon-icons.com/348/PNG/512/Snake_35967.png"/>
                                        <AvatarFallback>APP</AvatarFallback>
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
