"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import axios from "axios"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Wallet, TrendingUp, EyeIcon, Search } from "lucide-react"
import { API_BASE_URL } from "@/lib/api"
import { useRouter } from "next/navigation"
import TableSkeleton from "@/components/skeletons/TableSkeleton"
import { getAuthUser } from "@/utils/auth"

export default function EarningsPage() {
  const router = useRouter()
  const [payments, setPayments] = useState<any[]>([])
  const [summary, setSummary] = useState({ totalEarned: 0, thisMonthEarned: 0 })
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [loading, setLoading] = useState(true)
  const authUser = getAuthUser()
  const token = authUser?.token
  const fetchEarnings = async () => {
    try {

      const headers = token ? { Authorization: `Bearer ${token}` } : undefined
      setLoading(true)
      const res = await axios.get(`${API_BASE_URL}/creators/payments`, {
        headers,
        params: {
          page,
          limit: 10,
          sortBy: "createdAt",
          order: "desc",
          search,
          status,
          fromDate,
          toDate,
        },
      })

      // Debug raw response shape when developing
      console.debug("fetchEarnings response", res?.data)

      const data = res?.data || {}
      setLoading(false)

      // Normalize payments: API may return { payments: [...] } or an array directly
      const paymentsList: any[] = Array.isArray(data.payments)
        ? data.payments
        : Array.isArray(data)
          ? data
          : data.payments
            ? data.payments
            : []

      setPayments(paymentsList)

      // Summary may be nested or absent
      if (data.summary) setSummary(data.summary)

      // Pagination may be nested under pagination or directly available
      const total = data?.pagination?.totalPages ?? data?.totalPages ?? 1
      setTotalPages(total)
    } catch (error) {
      console.error("Failed to fetch earnings:", error)
    }
  }

  useEffect(() => {
    fetchEarnings()
  }, [page, search, status, fromDate, toDate])

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">

      {/* Header */}
      <div className="mb-8">
        <Link href="/creator" className="inline-flex items-center gap-2 text-primary hover:underline mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">Earnings</h1>
        <p className="text-muted-foreground">Track your revenue and payouts</p>
      </div>

      {/* Summary */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card className="p-6 border">
          <TrendingUp className="w-6 h-6 text-accent mb-3" />
          <p className="text-sm text-muted-foreground">This Month</p>
          <p className="text-3xl font-bold">
            ₦{summary.thisMonthEarned.toLocaleString()}
          </p>
        </Card>

        <Card className="p-6 border">
          <Wallet className="w-6 h-6 text-secondary mb-3" />
          <p className="text-sm text-muted-foreground">Total Earned</p>
          <p className="text-3xl font-bold">
            ₦{summary.totalEarned.toLocaleString()}
          </p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6 border mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">

          {/* Search */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1 opacity-70">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search content or user..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border rounded-md text-sm"
              />
            </div>
          </div>

          {/* Status */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1 opacity-70">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm"
            >
              <option value="">All Status</option>
              <option value="success">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          {/* From Date */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1 opacity-70">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm"
            />
          </div>

          {/* To Date */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1 opacity-70">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm"
            />
          </div>

        </div>

      </Card>

      {/* Transactions */}
      <Card className="p-6 border">
        <h2 className="text-lg font-semibold mb-4">Transactions</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-2 text-left">#</th>
                <th className="px-4 py-2 text-left">User</th>
                <th className="px-4 py-2 text-left">Content</th>
                <th className="px-4 py-2 text-right">Amount</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-center">Status</th>
                <th className="px-4 py-2 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7}>
                    <TableSkeleton rows={5} cols={7} />
                  </td>
                </tr>
              )}

              {payments.map((p, index) => (
                <tr key={p._id} className="border-b hover:bg-muted/50">
                  <td className="px-4 py-3">{index + 1}</td>
                  <td className="px-4 py-3">{p.user?.name}</td>
                  <td className="px-4 py-3">{p.file?.title}</td>
                  <td className="px-4 py-3 text-right font-bold text-primary">
                    ₦{Number(p.amount).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`
      px-3 py-1 rounded-full text-xs font-medium
      ${p.status === "success" ? "bg-green-100 text-green-700" : ""}
      ${p.status === "pending" ? "bg-yellow-100 text-yellow-700" : ""}
      ${p.status === "failed" ? "bg-red-100 text-red-700" : ""}
    `}
                    >
                      {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-center">
                    <Button size="sm" variant="ghost" onClick={() => router.push(`/creator/content/${p.file?.slug}`)}>
                      <EyeIcon className="w-4 h-4 text-primary" />
                    </Button>
                  </td>
                </tr>
              ))}

              {payments.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-muted-foreground">
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-6">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage(prev => prev - 1)}
          >
            Previous
          </Button>

          <span className="text-sm">
            Page {page} of {totalPages}
          </span>

          <Button
            variant="outline"
            disabled={page === totalPages}
            onClick={() => setPage(prev => prev + 1)}
          >
            Next
          </Button>
        </div>
      </Card>
    </div>
  )
}
