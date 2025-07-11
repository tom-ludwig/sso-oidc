import {redirect} from "next/navigation";

export default function Login() {
    redirect(`https://${process.env.AUTH_SERVER_HOST}/login?redirect=${process.env.LAUNCHPAD_HOST}/site`);
}
