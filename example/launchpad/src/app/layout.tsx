/*
 * Copyright (c) 2024 All rights reserved.
 * This code is the intellectual property of Louis Kauer [dev-Laky].
 */

import type {Metadata} from "next";
import {Inter} from "next/font/google";
import "./globals.css";
import {ThemeProvider} from "next-themes";
import {Toaster} from "../components/ui/sonner";
import * as React from "react";

const inter = Inter({subsets: ["latin"]});

export const metadata: Metadata = {
    title: "Home",
    description: "The inofficial SAP Launchpad.",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <body className={inter.className}>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange>
            {children}
        </ThemeProvider>
        <Toaster/>
        </body>
        </html>
    );
}
