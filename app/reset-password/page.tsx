"use client"

import type React from "react"
import Link from "next/link"
import { useState, useEffect } from "react"
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


    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [token, setToken] = useState("")
    // Extract token from URL query parameters
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search)
        const tokenFromUrl = urlParams.get("token") || ""
        setToken(tokenFromUrl)
    }, [])
    // Shared function to save token & redirect


    // Normal email/password login
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (!password || !confirmPassword) {
            setError("Password field is required")
            return
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match")
            return
        }

        try {
            setLoading(true)
            const res = await axios.put(`${API_BASE_URL}/auth/reset-password/${token}`, { password })

            if (res.data.message) {

                toast.success(res.data.message)
                setTimeout(() => router.push("/login"), 1500);
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
                    <h1 className="text-2xl font-bold text-foreground mb-2">Reset Password</h1>
                    <p className="text-muted-foreground">Enter your new password below</p>
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
                            <label className="text-sm font-medium text-foreground">New Password</label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Confirm New Password</label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>


                        <Button type="submit" className="w-full h-10" disabled={loading}>
                            {loading ? "Sending..." : "Reset Password"}
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
