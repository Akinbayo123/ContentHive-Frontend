"use client"

import type React from "react"
import Link from "next/link"
import { useState } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { FcGoogle } from "react-icons/fc"
import { FaGithub } from "react-icons/fa"
import { API_BASE_URL } from "@/lib/api"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

export default function LoginPage() {
    const router = useRouter()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    // Shared function to save token & redirect


    // Normal email/password login
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (!email) {
            setError("Email field is required")
            return
        }

        try {
            setLoading(true)
            const res = await axios.post(`${API_BASE_URL}/auth/forgot-password`, { email })

            if (res.data.message) {
                toast.success(res.data.message)
            }
        } catch (err: any) {
            console.error(err)
            if (err.response?.data?.message) {
                setError(err.response.data.message)
            } else {
                setError("Network error. Please check your connection.")
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="min-h-screen bg-background flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8 mt-10">
                    <Link href="/" className="inline-flex items-center gap-2 mb-6">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                            <span className="text-primary-foreground font-bold">H</span>
                        </div>
                        <span className="text-xl font-semibold text-foreground">ContentHive</span>
                    </Link>
                    <h1 className="text-2xl font-bold text-foreground mb-2">Forgot Password</h1>
                    <p className="text-muted-foreground">Enter your email to receive a password reset link</p>
                </div>

                {/* Form Card */}
                <Card className="p-6 border border-border space-y-4">




                    {/* Email/password form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="flex gap-3 p-4 bg-destructive/10 text-destructive rounded-lg">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                <p className="text-sm">{error}</p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Email</label>
                            <Input
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>


                        <Button type="submit" className="w-full h-10" disabled={loading}>
                            {loading ? "Sending..." : "Send Reset Link"}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        <span className="text-muted-foreground">Already have an account? </span>
                        <Link href="/login" className="text-primary font-medium hover:underline">
                            Sign in
                        </Link>
                    </div>
                </Card>

                <p className="text-center text-xs text-muted-foreground mt-6">
                    <Link href="/" className="hover:text-foreground transition-colors">
                        Back to home
                    </Link>
                </p>
            </div>
        </main>
    )
}
