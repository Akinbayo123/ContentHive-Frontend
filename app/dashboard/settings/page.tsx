"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Eye, Lock } from "lucide-react"
import Link from "next/link"
import axios from "axios"
import { toast } from "react-toastify"
import { API_BASE_URL } from "@/lib/api"
import { getAuthUser } from "@/utils/auth"

export default function BuyerSettingsPage() {
  const [activeTab, setActiveTab] = useState<"account" | "security">("account")
  const authUser = getAuthUser()
  const token = authUser?.token
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })
  const [oauthProvider, setOauthProvider] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Fetch user profile
  const fetchProfile = async () => {
    try {

      const res = await axios.get(`${API_BASE_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      const user = res.data
      setFormData({
        fullName: user.name || "",
        email: user.email || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      })
      setOauthProvider(user.oauthProvider || null)
    } catch (err: any) {
      console.error(err)
      toast.error(err?.response?.data?.message || "Failed to fetch profile")
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  // Update profile (name/password)
  const handleSave = async () => {
    try {
      setLoading(true)


      if (!formData.fullName.trim()) {
        toast.error("Full Name cannot be empty")
        setLoading(false)
        return
      }
      const payload: any = { name: formData.fullName }
      if (!formData.newPassword || !formData.currentPassword) {
        toast.error("Please enter both current and new passwords to update password")
        setLoading(false)
        return
      }
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          toast.error("Passwords do not match")
          return
        }
        payload.currentPassword = formData.currentPassword
        payload.password = formData.newPassword
      }

      const res = await axios.put(`${API_BASE_URL}/users/me`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      })

      toast.success(res.data.message || "Profile updated successfully")
      setFormData({
        ...formData,
        newPassword: "",
        confirmPassword: "",
        currentPassword: ""
      })
    } catch (err: any) {
      console.error(err)
      toast.error(err?.response?.data?.message || "Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  // Define tabs (hide security if oauthProvider exists)
  const tabs: Array<"account" | "security"> = ["account"]
  if (!oauthProvider) tabs.push("security") // only add security if user did NOT sign up via OAuth

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="mb-8">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-primary hover:underline mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Account Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences and security</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border mb-8">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 capitalize transition-colors text-sm ${activeTab === tab
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
          >
            {tab === "account" && <Eye className="w-4 h-4" />}
            {tab === "security" && <Lock className="w-4 h-4" />}
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "account" && (
          <Card className="p-6 border border-border space-y-6">
            <div>
              <label className="text-sm font-medium text-foreground">Full Name</label>
              <Input
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="mt-2 bg-background"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Email Address</label>
              <Input
                type="email"
                value={formData.email}
                disabled
                className="mt-2 bg-background cursor-not-allowed"
              />
            </div>

            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </Card>
        )}

        {activeTab === "security" && !oauthProvider && (
          <Card className="p-6 border border-border space-y-6">
            <div>
              <label className="text-sm font-medium text-foreground">Current Password</label>
              <Input
                type="password"
                value={formData.currentPassword}
                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                placeholder="••••••••"
                className="mt-2 bg-background"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">New Password</label>
              <Input
                type="password"
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                placeholder="••••••••"
                className="mt-2 bg-background"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Confirm Password</label>
              <Input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="••••••••"
                className="mt-2 bg-background"
              />
            </div>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </Card>
        )}
      </div>
    </div>
  )
}
