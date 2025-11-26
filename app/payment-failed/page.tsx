"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function PaymentFailedPage() {
    const searchParams = useSearchParams();
    const reference = searchParams.get("reference");

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
            <h1 className="text-3xl font-bold text-red-600 mb-4">Payment Failed!</h1>
            <p className="mb-4">Reference: <span className="font-mono">{reference}</span></p>
            <Link href="/dashboard/browse" className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90">
                Try Again
            </Link>
        </div>
    );
}
