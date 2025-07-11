import type {Metadata} from "next";
import localFont from "next/font/local";
// Import initial FontAwesome Styles: https://github.com/FortAwesome/react-fontawesome/issues/134#issuecomment-476276516
import '@fortawesome/fontawesome-svg-core/styles.css'
import "./globals.css";
// Import FontAwesome Icons
import {config, library} from '@fortawesome/fontawesome-svg-core'
import {faArrowDown, faArrowLeft, faArrowRight, faArrowUp, faStar, faTrophy,} from '@fortawesome/free-solid-svg-icons'
import {faGithub} from '@fortawesome/free-brands-svg-icons'

const geistSans = localFont({
    src: "./fonts/GeistVF.woff",
    variable: "--font-geist-sans",
    weight: "100 900",
});
const geistMono = localFont({
    src: "./fonts/GeistMonoVF.woff",
    variable: "--font-geist-mono",
    weight: "100 900",
});

export const metadata: Metadata = {
    title: "Snake",
    description: "Simple Snake App",
};

library.add(
    faStar,
    faArrowUp,
    faArrowRight,
    faArrowDown,
    faArrowLeft,
    faTrophy,
    faGithub
)
config.autoAddCss = false

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
        {children}
        </body>
        </html>
    );
}
