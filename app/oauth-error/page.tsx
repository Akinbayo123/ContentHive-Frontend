"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function OAuthErrorPage() {
    const router = useRouter();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const message = params.get("message");

        if (message) {
            toast.error(message);
        } else {
            toast.error("OAuth login failed");
        }

        router.push("/login"); // redirect after showing error
    }, [router]);

    return <div>Processing...</div>;
}
