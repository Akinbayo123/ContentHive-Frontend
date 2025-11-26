"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { BarChart3, Users, ShoppingCart, TrendingUp, AlertCircle, Eye, Trash2, CheckCircle } from "lucide-react"
import { logout, useAuth } from "@/hooks/useAuth"
import { useAuthRedirect } from "@/hooks/useAuthRedirect"

export default function AdminDashboard() {

  useAuthRedirect()
  useAuth(["admin"])
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "content" | "reports">("overview")

  const stats = [
    { icon: Users, label: "Total Users", value: "1,234", change: "+12% this week" },
    { icon: ShoppingCart, label: "Total Sales", value: "$24,582", change: "+8% this week" },
    { icon: TrendingUp, label: "Active Creators", value: "342", change: "+5 new" },
    { icon: BarChart3, label: "Revenue", value: "$12,291", change: "+15% this month" },
  ]

  const flaggedContent = [
    { id: 1, title: "Suspicious Template", creator: "Unknown User", reports: 5, status: "Under Review" },
    { id: 2, title: "Duplicate Content", creator: "Creator X", reports: 3, status: "Flagged" },
    { id: 3, title: "Invalid License", creator: "Dev Co", reports: 7, status: "Suspended" },
  ]

  const recentUsers = [
    { id: 1, name: "Alice Johnson", email: "alice@example.com", type: "Buyer", date: "2025-01-12" },
    { id: 2, name: "Bob Smith", email: "bob@example.com", type: "Creator", date: "2025-01-11" },
    { id: 3, name: "Carol Davis", email: "carol@example.com", type: "Buyer", date: "2025-01-10" },
  ]

  return (
    <main className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">A</span>
            </div>
            <span className="font-semibold text-foreground">Admin Panel</span>
          </div>
          <Button onClick={logout} className=" transition-colors">
            Logout
          </Button>
        </div>
      </nav>

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => {
            const Icon = stat.icon
            return (
              <Card key={i} className="p-6 border border-border">
                <Icon className="w-6 h-6 text-primary mb-3" />
                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-primary mt-2">{stat.change}</p>
              </Card>
            )
          })}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border mb-6">
          {(["overview", "users", "content", "reports"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 border-b-2 capitalize text-sm transition-colors ${activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === "overview" && (
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="p-6 border border-border">
              <h2 className="text-lg font-bold text-foreground mb-4">Recent Users</h2>
              <div className="space-y-3">
                {recentUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div>
                      <p className="font-medium text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">{user.type}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 border border-border">
              <h2 className="text-lg font-bold text-foreground mb-4">Platform Health</h2>
              <div className="space-y-3">
                {[
                  { label: "System Status", status: "Operational" },
                  { label: "Database", status: "Healthy" },
                  { label: "Payment Gateway", status: "Connected" },
                  { label: "Email Service", status: "Active" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <p className="text-foreground">{item.label}</p>
                    <span className="flex items-center gap-1 text-xs text-primary">
                      <CheckCircle className="w-4 h-4" />
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {activeTab === "users" && (
          <Card className="p-6 border border-border">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-foreground">User Management</h2>
              <Input placeholder="Search users..." className="w-64 bg-background" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">Name</th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">Type</th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">Status</th>
                    <th className="text-right px-4 py-3 font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map((user) => (
                    <tr key={user.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3 text-foreground">{user.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{user.type}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded">Active</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button size="sm" variant="ghost">
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {activeTab === "content" && (
          <Card className="p-6 border border-border">
            <h2 className="text-lg font-bold text-foreground mb-4">Flagged Content</h2>
            <div className="space-y-4">
              {flaggedContent.map((item) => (
                <div key={item.id} className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertCircle className="w-5 h-5 text-destructive" />
                        <p className="font-semibold text-foreground">{item.title}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">by {item.creator}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${item.status === "Suspended"
                        ? "bg-destructive/10 text-destructive"
                        : item.status === "Flagged"
                          ? "bg-secondary/10 text-secondary"
                          : "bg-primary/10 text-primary"
                        }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">{item.reports} reports</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="gap-2 bg-transparent">
                        <Eye className="w-4 h-4" />
                        Review
                      </Button>
                      <Button size="sm" variant="outline" className="gap-2 text-destructive bg-transparent">
                        <Trash2 className="w-4 h-4" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeTab === "reports" && (
          <Card className="p-6 border border-border text-center py-12">
            <h2 className="text-lg font-bold text-foreground mb-2">Reports & Analytics</h2>
            <p className="text-muted-foreground mb-6">Detailed analytics and reports coming soon</p>
            <Button>Generate Report</Button>
          </Card>
        )}
      </div>
    </main>
  )
}
