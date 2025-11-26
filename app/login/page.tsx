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
import { jwtDecode } from "jwt-decode"
import { useAuthRedirect } from "@/hooks/useAuthRedirect"

export default function LoginPage() {
  const router = useRouter()
  // AUTO-REDIRECT IF USER ALREADY LOGGED IN
  useAuthRedirect()


  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  // Shared function to save token & redirect
  function saveTokenAndRedirect(token: string, redirectPath = "/dashboard", message = "Login successful!") {
    localStorage.setItem("token", token)
    toast.success(message)
    setTimeout(() => router.push(redirectPath), 1500)
  }

  // Normal email/password login
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("Please fill in all fields")
      return
    }

    try {
      setLoading(true)
      const res = await axios.post(`${API_BASE_URL}/auth/login`, { email, password })

      if (res.data?.token && res.data?.user) {
        const { token, user } = res.data

        // Redirect based on role
        let redirectPath = "/dashboard" // default
        switch (user.role) {
          case "admin":
            redirectPath = "/admin"
            break
          case "creator":
            redirectPath = "/creator"
            break
          case "user":
          default:
            redirectPath = "/dashboard"
        }

        // Save token & redirect
        saveTokenAndRedirect(token, redirectPath, "Login successful!")
      } else {
        setError("Invalid login credentials")
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


  // OAuth login
  const handleOAuthLogin = (provider: "google" | "github") => {
    window.location.href = `${API_BASE_URL}/oauth/${provider}`
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
          <h1 className="text-2xl font-bold text-foreground mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to access your content and dashboard</p>
        </div>

        {/* Form Card */}
        <Card className="p-6 border border-border space-y-4">
          {/* OAuth Buttons */}
          <div className="flex flex-col gap-4">
            <Button
              onClick={() => handleOAuthLogin("google")}
              variant="outline"
              className="flex items-center justify-center gap-2"
            >
              <FcGoogle className="w-5 h-5" /> Sign in with Google
            </Button>
            <Button
              onClick={() => handleOAuthLogin("github")}
              variant="outline"
              className="flex items-center justify-center gap-2"
            >
              <FaGithub className="w-5 h-5" /> Sign in with GitHub
            </Button>
          </div>

          <div className="relative py-2">
            <hr className="border-t border-border" />
            <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
              OR
            </span>
          </div>

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

            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium text-foreground">Password</label>
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Link href="/forgot-password" className="text-xs text-primary hover:underline float-right mt-5 mb-5">
                Forgot Password?
              </Link>
            </div>

            <Button type="submit" className="w-full h-10" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Don't have an account? </span>
            <Link href="/register" className="text-primary font-medium hover:underline">
              Create one
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
