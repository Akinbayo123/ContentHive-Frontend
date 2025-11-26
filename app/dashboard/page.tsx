'use client'

import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ShoppingBag, Bookmark, TrendingUp } from "lucide-react"
import { useAuthRedirect } from "@/hooks/useAuthRedirect"
import axios from "axios"
import { toast } from "react-toastify"
import { API_BASE_URL } from "@/lib/api"
import TableSkeleton from "@/components/skeletons/TableSkeleton"
import DashboardSkeleton from "@/components/skeletons/DashboardSkeleton"
import { getAuthUser } from "@/utils/auth"

export default function BuyerDashboard() {
  useAuthRedirect()
  const authUser = getAuthUser()
  const token = authUser?.token
  const [stats, setStats] = useState({
    totalPurchases: 0,
    totalFavourites: 0,
    totalAmountSpent: 0,
  })
  const [recentPurchases, setRecentPurchases] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)

  const fetchDashboardData = async () => {
    try {

      const res = await axios.get(`${API_BASE_URL}/users/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      setData(res.data)
      setStats({
        totalPurchases: res.data.totalPurchases,
        totalFavourites: res.data.totalFavourites,
        totalAmountSpent: res.data.totalAmountSpent,
      })
      setRecentPurchases(res.data.recentPurchases || [])
    } catch (err: any) {
      console.error(err)
      toast.error(err?.response?.data?.message || "Failed to fetch dashboard data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])




  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
          Welcome back
        </h1>
        <p className="text-muted-foreground">Here's an overview of your activity</p>
      </div>
      {loading && <DashboardSkeleton />}
      {!data && !loading && (
        <p className="text-center py-12 text-red-600">Failed to load dashboard data.</p>
      )}



      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: ShoppingBag, label: "Purchases", value: stats.totalPurchases },
          { icon: Bookmark, label: "Favorites", value: stats.totalFavourites },
          {
            icon: TrendingUp,
            label: "Spent",
            value: new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(stats.totalAmountSpent),
          },
        ].map((stat, i) => {
          const Icon = stat.icon
          return (
            <Card
              key={i}
              className="p-6 border border-border hover:border-primary transition-colors"
            >
              <Icon className="w-6 h-6 text-primary mb-3" />
              <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </Card>
          )
        })}
      </div>

      {/* Recent Activity Section */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Purchases */}
        <Card className="p-6 border border-border lg:col-span-2">
          <h2 className="text-lg font-semibold text-foreground mb-4">Recent Purchases</h2>
          {recentPurchases.length === 0 ? (
            <p className="text-muted-foreground">No recent purchases</p>
          ) : (
            <div className="space-y-4">
              {recentPurchases.map((purchase) => (
                <div
                  key={purchase._id}
                  className="flex items-center justify-between py-3 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <img
                      src={purchase.file.previewImage || "/placeholder-image.png"}
                      alt={purchase.file.title}
                      className="w-16 h-16 object-cover rounded-lg shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">{purchase.file.title}</p>
                      <p className="text-sm text-muted-foreground">{purchase.file.creator?.name || "Unknown"}</p>
                    </div>
                  </div>
                  <p className="font-semibold text-foreground ml-4">
                    {new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(purchase.file.price)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <Card className="p-6 border border-border">
          <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Button asChild className="w-full" variant="default">
              <Link href="/dashboard/browse">Browse Content</Link>
            </Button>
            <Button asChild className="w-full" variant="outline">
              <Link href="/dashboard/favorites">View Favorites</Link>
            </Button>
            <Button asChild className="w-full" variant="outline">
              <Link href="/dashboard/settings">Account Settings</Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
