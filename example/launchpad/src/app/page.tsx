import type {Metadata} from "next";
import HomePage from "../components/HomePage/HomePage";

export const metadata: Metadata = {
    title: "Welcome to S&P Launchpad",
    description: "The inofficial S&P Launchpad.",
};

export default function Home() {
    return <HomePage/>;
}