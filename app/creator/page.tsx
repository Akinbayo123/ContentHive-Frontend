'use client'

import Link from "next/link"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, CreditCard } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import axios from "axios"
import { API_BASE_URL } from "@/lib/api"
import { FaNairaSign } from "react-icons/fa6"
import DashboardSkeleton from "@/components/skeletons/DashboardSkeleton"
import { toast } from "react-toastify"
import { getAuthUser } from "@/utils/auth"

interface DashboardData {
  totalViews: number
  totalEarnings: number
  totalContents: number
  growth: number
  salesCount: number
  recentUploads: {
    _id: string
    title: string
    slug: string
    previewImage: string
    views: number
    sales: number
    price: number
    createdAt: string
  }[]
}

export default function CreatorDashboard() {
  useAuth(["admin", "creator"])

  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const authUser = getAuthUser()
  const token = authUser?.token

  useEffect(() => {
    const fetchDashboard = async () => {
      try {

        const res = await axios.get(`${API_BASE_URL}/creators/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        setData(res.data)
      } catch (err: any) {
        console.error("Failed to load dashboard:", err)
        toast.error(err?.response?.data?.message || "Failed to fetch dashboard data")
        setData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [])

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">

      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-1 sm:mb-2">
          Creator Dashboard
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Manage your content and track your earnings
        </p>
      </div>

      {/* Loading Skeleton */}
      {loading && <DashboardSkeleton />}

      {/* Error Message */}
      {!loading && !data && (
        <p className="p-6 text-center text-red-500">
          Failed to load dashboard
        </p>
      )}

      {/* Real Content */}
      {!loading && data && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            {[
              { icon: CreditCard, label: "Total Sales", value: data.salesCount },
              {
                icon: FaNairaSign,
                label: "Earnings",
                value: `₦${data.totalEarnings.toLocaleString("NGN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`,
              },
              { icon: Upload, label: "Total Contents", value: data.totalContents },
            ].map((stat, i) => {
              const Icon = stat.icon
              return (
                <Card
                  key={i}
                  className="p-4 sm:p-6 border border-border hover:border-primary transition-colors"
                >
                  <Icon className="w-5 sm:w-6 h-5 sm:h-6 text-accent mb-2 sm:mb-3" />
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-xl sm:text-2xl font-bold text-foreground">{stat.value}</p>
                </Card>
              )
            })}
          </div>

          {/* Content Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Recent Content */}
            <Card className="p-4 sm:p-6 border border-border lg:col-span-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-0">
                  Recent Content
                </h2>
                <Button asChild size="sm" variant="outline">
                  <Link href="/creator/content">View All</Link>
                </Button>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {data.recentUploads.length === 0 && (
                  <p className="text-muted-foreground">No uploads yet.</p>
                )}

                {data.recentUploads.map((item) => (
                  <div
                    key={item._id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between py-2 sm:py-3 border-b border-border last:border-0 gap-2 sm:gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{item.title}</p>
                      <div className="flex flex-wrap gap-2 text-xs sm:text-sm text-muted-foreground mt-1">
                        <span>{item.views} views</span>
                        <span>{item.sales} sales</span>
                        <span>
                          ₦
                          {item.price.toLocaleString("NGN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>

                      </div>
                    </div>

                    <div className="flex gap-2 mt-2 sm:mt-0">
                      <Button size="sm" variant="ghost" asChild>
                        <Link href={`/creator/content/edit/${item.slug}`}>Edit</Link>
                      </Button>
                      <Button size="sm" variant="ghost" asChild>
                        <Link href={`/creator/content/${item.slug}`}>View</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-4 sm:p-6 border border-border h-fit">
              <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
              <div className="flex flex-col gap-3">
                <Button asChild className="w-full flex items-center justify-center gap-2" variant="default">
                  <Link href="/creator/content/upload">
                    <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
                    Upload Content
                  </Link>
                </Button>
                <Button asChild className="w-full" variant="outline">
                  <Link href="/creator/analytics">View Analytics</Link>
                </Button>
                <Button asChild className="w-full" variant="outline">
                  <Link href="/creator/earnings">Earnings</Link>
                </Button>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
