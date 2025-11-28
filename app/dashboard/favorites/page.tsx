"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Heart, ArrowLeft } from "lucide-react"
import axios from "axios"
import { API_BASE_URL } from "@/lib/api"
import { toast } from "react-toastify"
import { useRouter } from "next/navigation"
import { usePurchases } from "@/hooks/usePurchases"
import ContentSkeleton from "@/components/skeletons/ContentSkeleton"
import { getAuthUser } from "@/utils/auth"

export default function FavoritesPage() {
  const router = useRouter()
  const authUser = getAuthUser()
  const token = authUser?.token
  const [files, setFiles] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [loadingFile, setLoadingFile] = useState<string | null>(null)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [favourites, setFavourites] = useState<Set<string>>(new Set())
  const { buying, purchases, handleBuyNow, fetchPurchases, downloadFile } = usePurchases()

  const fetchFavourites = async (page = 1) => {
    try {

      setLoading(true)
      const res = await axios.get(`${API_BASE_URL}/users/favourites`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        params: { page, limit: 12 },
      })

      // Update files
      setFiles(res.data.favourites.map((f: any) => f.file))
      setTotalPages(res.data.totalPages)
      setPage(res.data.page)

      // Track favourite ids
      const favIds = new Set<string>()
      res.data.favourites.forEach((f: any) => {
        if (f.file?._id) favIds.add(f.file._id)
      })
      setFavourites(favIds)
    } catch (err) {
      console.error("Failed to fetch favourites:", err)
      toast.error("Failed to load favourites")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFavourites(page)
    fetchPurchases()
  }, [page])

  const toggleFavourite = async (fileId: string) => {
    try {


      const isFav = favourites.has(fileId)
      if (isFav) {
        await axios.delete(`${API_BASE_URL}/users/favourites/${fileId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const next = new Set(favourites)
        next.delete(fileId)
        setFavourites(next)
        toast.success("Removed from favourites")
        fetchFavourites(page)
      }
    } catch (err: any) {
      console.error(err)
      toast.error(err?.response?.data?.message || "Failed to update favourites")
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="mb-8">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-primary hover:underline mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Favorites</h1>
        <p className="text-muted-foreground">Your saved content {files.length} items</p>
      </div>

      {/* Loading */}
      {loading && <ContentSkeleton rows={1} columns={4} />
      }

      {/* Favorites Grid */}
      {!loading && files.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {files.map((item) => (
            <Card key={item._id} className="overflow-hidden hover:border-primary transition-colors" >
              <div className="w-full h-48 bg-muted relative">
                {item.previewImage ? (
                  <img src={item.previewImage} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                    No Preview
                  </div>
                )}

                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute top-3 right-3"
                  onClick={(e) => { e.stopPropagation(); toggleFavourite(item._id) }}
                >
                  <Heart className={`w-5 h-5 ${favourites.has(item._id) ? "fill-red-500 text-red-500" : "text-white"}`} />
                </Button>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-foreground mb-1 hover:underline cursor-pointer" onClick={() => router.push(`/dashboard/content/${item.slug}`)}>{item.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{item.creator?.name || "Unknown Creator"}</p>
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <span className="font-bold text-primary">
                    {new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(item.price)}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="hover:cursor-pointer"
                    disabled={loadingFile === item._id}
                    onClick={async () => {
                      try {
                        setLoadingFile(item._id)

                        if (purchases.has(item._id)) {
                          await downloadFile(item._id)
                        } else {
                          await handleBuyNow(item._id)
                        }

                      } finally {
                        setLoadingFile(null)
                      }
                    }}
                  >
                    {purchases.has(item._id)
                      ? "Download"
                      : loadingFile === item._id
                        ? "Processing..."
                        : "Buy Now"}
                  </Button>

                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && files.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No favorites found</p>
          <Button onClick={() => window.location.href = '/dashboard/browse'}>
            Browse Content
          </Button>
        </div>
      )}

      {/* Pagination */}
      {!loading && files.length > 0 && (
        <div className="flex justify-center gap-3 mt-10">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>

          <span className="py-2 px-4">
            Page {page} of {totalPages}
          </span>

          <Button
            variant="outline"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
