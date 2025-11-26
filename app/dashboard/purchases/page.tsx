'use client'

import Link from "next/link"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Wallet, TrendingUp, View, Download, Search } from "lucide-react"
import axios from "axios"
import { toast } from "react-toastify"
import { API_BASE_URL } from "@/lib/api"
import { FaEye } from "react-icons/fa6"
import TableSkeleton from "@/components/skeletons/TableSkeleton"
import { getAuthUser } from "@/utils/auth"

export default function PurchasesPage() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize] = useState(5)
  const [totalPages, setTotalPages] = useState(1)
  const authUser = getAuthUser()
  const token = authUser?.token

  const fetchTransactions = async () => {
    try {
      setLoading(true)


      const res = await axios.get(`${API_BASE_URL}/users/all-purchases`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          search: searchTerm,
          page,
          limit: pageSize,
          sortBy: "createdAt",
          order: "desc",
        },
      })

      setTransactions(res.data.purchases || [])
      setTotalPages(res.data.totalPages || 1)
    } catch (err: any) {
      console.error(err)
      toast.error(err?.response?.data?.message || "Failed to fetch purchases")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [page, searchTerm])

  const handleDownload = (fileId: string) => {

    const url = token
      ? `${API_BASE_URL}/users/files/download/${fileId}?token=${token}`
      : `${API_BASE_URL}/users/files/download/${fileId}`

    window.location.href = url
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="mb-8">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-primary hover:underline mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Purchases</h1>
        <p className="text-muted-foreground">Track your purchases and payments</p>
      </div>

      {/* Search */}
      <div className="mb-4 flex items-center gap-2">
        <Search className="w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search content..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border border-border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-primary"
        />
      </div>

      {/* Transactions Table */}
      <Card className="p-6 border border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">All Purchases</h2>
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
        </div>
        {loading ? (
          <TableSkeleton rows={5} cols={6} />
        ) : transactions.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">No purchases found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-foreground">#</th>

                  <th className="text-left px-4 py-3 font-semibold text-foreground">Content</th>
                  <th className="text-right px-4 py-3 font-semibold text-foreground">Amount</th>
                  <th className="text-left px-4 py-3 font-semibold text-foreground">Date</th>
                  <th className="text-center px-4 py-3 font-semibold text-foreground">Status</th>
                  <th className="text-center px-4 py-3 font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, index) => (
                  <tr key={tx._id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 text-foreground">{(page - 1) * pageSize + index + 1}</td>
                    <td className="px-4 py-3 text-foreground">{tx.file?.title}</td>
                    <td className="px-4 py-3 text-right font-bold text-primary">
                      {new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(tx.file?.price || 0)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(tx.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${tx.status === "success" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"
                          }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center flex items-center justify-center gap-2">
                      <Button size="sm" variant="ghost" asChild>
                        <Link href={`/dashboard/content/${tx.file?.slug}`}>
                          <FaEye className="w-4 h-4 mr-1" />
                          View
                        </Link>
                      </Button>
                      {tx.status === "success" && (
                        <Button size="sm" variant="ghost" onClick={() => handleDownload(tx.file?._id)}>
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="mt-4 flex justify-between items-center">
          <Button
            size="sm"
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          >
            Previous
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          >
            Next
          </Button>
        </div>
      </Card>
    </div>
  )
}
