import type {Metadata} from "next";
import HomePage from "../components/HomePage/HomePage";

export const metadata: Metadata = {
    title: "Welcome to SAP Launchpad",
    description: "The inofficial SAP Launchpad.",
};

export default function Home() {
    return <HomePage/>;
}