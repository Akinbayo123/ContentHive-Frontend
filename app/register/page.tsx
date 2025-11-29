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


export default function RegisterPage() {
  const router = useRouter()
  // AUTO-REDIRECT IF USER ALREADY LOGGED IN

  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
  useEffect(() => {
    if (token) {
      router.push("/dashboard")
    }
  }, [router, token])


  // FORM STATES
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [userType, setUserType] = useState<"user" | "creator">("user")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  // SAVE TOKEN AND REDIRECT
  function saveTokenAndRedirect(token: string, redirectPath = "/dashboard", message = "Success!") {
    localStorage.setItem("token", token)
    toast.success(message)
    setTimeout(() => router.push(redirectPath), 1500)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("Please fill in all fields")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    try {
      setLoading(true)
      const res = await axios.post(`${API_BASE_URL}/auth/register`, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: userType,
      })

      if (res.data?.token && res.data?.user) {
        const { token, user } = res.data

        let redirectPath = "/dashboard"
        switch (user.role) {
          case "admin":
            redirectPath = "/admin"
            break
          case "creator":
            redirectPath = "/creator"
            break
          default:
            redirectPath = "/dashboard"
        }

        saveTokenAndRedirect(token, redirectPath, "Registration Successful! Redirecting...")
      }
    } catch (err: any) {
      console.error(err)
      if (err.response?.data) {
        const data = err.response.data
        if (data.errors?.length) setError(data.errors[0].msg)
        else if (data.message) setError(data.message)
        else setError("Something went wrong.")
      } else {
        setError("Network error. Check your connection.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleOAuthLogin = (provider: "google" | "github") => {
    window.location.href = `${API_BASE_URL}/oauth/${provider}?role=${userType}`
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
          <h1 className="text-2xl font-bold text-foreground mb-2">Create Account</h1>
          <p className="text-muted-foreground">Join our community of creators and users</p>
        </div>

        {/* Form Card */}
        <Card className="p-6 border border-border">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* User type selection */}
            <div className="space-y-2 mb-6">
              <label className="text-sm font-medium text-foreground">I am a</label>
              <div className="flex gap-3">
                {(["user", "creator"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setUserType(type)}
                    className={`flex-1 py-2 px-4 rounded-lg border transition-colors capitalize ${userType === type
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border text-foreground hover:border-primary"
                      }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* OAuth buttons */}
            <div className="flex flex-col gap-4 mb-10 mt-10">
              <Button
                onClick={() => handleOAuthLogin("google")}
                variant="outline"
                type="button"
                className="flex items-center justify-center gap-2"
              >
                <FcGoogle className="w-5 h-5" /> Sign up with Google
              </Button>
              <Button
                onClick={() => handleOAuthLogin("github")}
                variant="outline"
                type="button"
                className="flex items-center justify-center gap-2"
              >
                <FaGithub className="w-5 h-5" /> Sign up with GitHub
              </Button>
            </div>

            <div className="relative py-2">
              <hr className="border-t border-border" />
              <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
                OR
              </span>
            </div>

            {error && (
              <div className="flex gap-3 p-4 bg-destructive/10 text-destructive rounded-lg">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Form fields */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Full Name</label>
              <Input
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Confirm Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
            </div>

            <Button type="submit" className="w-full h-10" disabled={loading}>
              {loading ? "Creating..." : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link href="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </div>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6 mb-10">
          <Link href="/" className="hover:text-foreground transition-colors">
            Back to home
          </Link>
        </p>
      </div>
    </main>
  )
}
