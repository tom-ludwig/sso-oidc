import {redirect} from "next/navigation";

export default function Login() {
    redirect(`https://${process.env.OIDC_ISSUER_URL}/login?redirect=${process.env.NEXT_PUBLIC_APP_URL}/site`);
}
