"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link";
export default function PaymentFailedClient() {
    const searchParams = useSearchParams()
    const reference = searchParams.get("reference")

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-red-600">Payment Failed</h1>
                <p className="mt-2 text-gray-600">
                    Transaction Ref: {reference || "N/A"}
                </p>
                <Link href="/dashboard/browse" className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90">
                    Continue Browsing
                </Link>
            </div>
        </div>
    )
}
