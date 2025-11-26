"use client"

import { useState } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import { API_BASE_URL } from "@/lib/api"

export function usePurchases() {
  const [purchases, setPurchases] = useState<Set<string>>(new Set())
  const [buying, setBuying] = useState(false)

  // Fetch all purchased files
  const fetchPurchases = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const res = await axios.get(`${API_BASE_URL}/users/successful-purchases`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      const list = Array.isArray(res.data?.purchases)
        ? res.data.purchases
        : Array.isArray(res.data)
        ? res.data
        : []

      const ids = new Set<string>(
        list
          .map((p: any) =>
            p?.file?._id ||
            p?.fileId ||
            (typeof p === "string" ? p : undefined)
          )
          .filter((v: any): v is string => typeof v === "string")
      )

      setPurchases(ids)
    } catch (err) {
      console.error("Failed to fetch purchases:", err)
    }
  }

  // Paystack checkout
  const handleBuyNow = async (fileId: string) => {
    try {
      setBuying(true)
      const token = localStorage.getItem("token")

      const res = await axios.post(
        `${API_BASE_URL}/users/purchase/${fileId}`,
        null,
        { headers: token ? { Authorization: `Bearer ${token}` } : undefined }
      )

      if (res.data.authorization_url) {
        window.location.href = res.data.authorization_url
      } else {
        toast.error("Failed to initialize payment")
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Payment failed")
    } finally {
      setBuying(false)
    }
  }

  // Download helper
  const downloadFile = (fileId: string) => {
    const token = localStorage.getItem("token")
    const url = token
      ? `${API_BASE_URL}/users/files/download/${fileId}?token=${token}`
      : `${API_BASE_URL}/users/files/download/${fileId}`

    window.location.href = url
  }

  return {
    purchases,
    buying,
    handleBuyNow,
    fetchPurchases,
    downloadFile,
  }
}
