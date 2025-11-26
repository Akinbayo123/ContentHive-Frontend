"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";

export default function OAuthSuccessPage() {
    const router = useRouter();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");

        if (token) {
            localStorage.setItem("token", token);
            interface MyJwtPayload {
                id: string;
                role: string;
                exp?: number;
                iat?: number;
            }
            // Decode the token to get role
            const decoded = jwtDecode<MyJwtPayload>(token);
            const role = decoded.role;

            toast.success("Login successful!");

            // Redirect based on role
            setTimeout(() => {
                switch (role) {
                    case "admin":
                        router.push("/admin");
                        break;
                    case "creator":
                        router.push("/creator");
                        break;
                    case "user":
                        router.push("/dashboard");
                        break;
                    default:
                        router.push("/dashboard");
                        break;
                }
            }, 1500);
        } else {
            toast.error("OAuth login failed");
            setTimeout(() => router.push("/login"), 1500);
        }
    }, [router]);

    return (
        <div className="flex justify-center items-center min-h-screen">
            Loading...
        </div>
    );
}
