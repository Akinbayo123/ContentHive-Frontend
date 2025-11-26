"use client"

import { useSearchParams } from "next/navigation"

export default function PaymentSuccessClient() {
    const searchParams = useSearchParams()
    const reference = searchParams.get("reference")

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-green-600">Payment Successful</h1>
                <p className="mt-2 text-gray-600">
                    Transaction Ref: {reference || "N/A"}
                </p>
            </div>
        </div>
    )
}
