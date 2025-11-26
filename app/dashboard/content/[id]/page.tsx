"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Heart, ShoppingCart, ChevronLeft } from "lucide-react"
import { toast } from "react-toastify"
import { API_BASE_URL } from "@/lib/api"
import { usePurchases } from "@/hooks/usePurchases"
import ContentSkeleton from "@/components/skeletons/ContentSkeleton"
import { DetailPageSkeleton } from "@/components/skeletons/DetailPageSkeleton"
import { getAuthUser } from "@/utils/auth"

export default function ContentDetailPage() {
  const params = useParams()
  const slug = params?.id as string | undefined
  const authUser = getAuthUser()
  const token = authUser?.token
  const [content, setContent] = useState<any>(null)
  const [relatedContent, setRelatedContent] = useState<any[]>([])
  const [isFavorite, setIsFavorite] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  const {
    purchases,
    buying,
    handleBuyNow,
    fetchPurchases,
    downloadFile
  } = usePurchases()

  // Fetch user's favourites
  const fetchFavourites = async (): Promise<Set<string>> => {


    try {
      const res = await axios.get(`${API_BASE_URL}/users/favourites`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      // unwrap the array safely
      const favouritesArray = Array.isArray(res.data) ? res.data : res.data.favourites || []

      const favIds = new Set<string>()
      favouritesArray.forEach((f: any) => {
        if (f.file?._id) favIds.add(f.file._id)
        else if (f.fileId) favIds.add(f.fileId)
        else if (f._id) favIds.add(f._id)
        else if (typeof f === "string") favIds.add(f)
      })
      return favIds
    } catch (err) {
      console.error("Failed to fetch favourites:", err)
      return new Set()
    }
  }


  // Fetch content details
  const fetchContent = async () => {
    if (!slug) return
    try {
      setLoading(true)


      const res = await axios.get(`${API_BASE_URL}/users/files/${slug}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })

      setContent(res.data.file)
      setRelatedContent(res.data.relatedFiles || [])

      // Fetch favourites separately
      const favIds = await fetchFavourites()
      setIsFavorite(favIds)
    } catch (err: any) {
      console.error(err)
      toast.error(err?.response?.data?.message || "Failed to fetch content")
    } finally {
      setLoading(false)
    }
  }

  // Toggle favourite
  const toggleFavorite = async () => {
    if (!content) return


    try {
      const isFav = isFavorite.has(content._id)

      if (isFav) {
        // Remove favourite
        await axios.delete(`${API_BASE_URL}/users/favourites/${content._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const next = new Set(isFavorite)
        next.delete(content._id)
        setIsFavorite(next)
        toast.success("Removed from favourites")
      } else {
        // Add favourite
        await axios.post(`${API_BASE_URL}/users/favourites/${content._id}`, null, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const next = new Set(isFavorite)
        next.add(content._id)
        setIsFavorite(next)
        toast.success("Added to favourites")
      }
    } catch (err: any) {
      console.error(err)
      toast.error(err?.response?.data?.message || "Failed to update favourites")
    }
  }

  useEffect(() => {
    fetchContent()
    fetchPurchases()
  }, [slug])

  if (loading) return <DetailPageSkeleton />
  if (!content) return <p className="text-center py-12">Content not found</p>

  return (
    <main className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/dashboard/browse" className="inline-flex items-center gap-2 text-primary hover:underline">
            <ChevronLeft className="w-4 h-4" />
            Back to Browse
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Preview */}
            <div className="w-full h-96 bg-linear-to-br from-primary/10 to-accent/10 rounded-xl mb-8 flex items-center justify-center">
              {content.previewImage ? (
                <img src={content.previewImage} className="w-full h-full object-cover rounded-xl" />
              ) : (
                <p className="text-muted-foreground">Content Preview</p>
              )}
            </div>

            {/* Title & Creator */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-foreground mb-4">{content.title}</h1>
              <div className="flex items-center gap-2 text-sm mb-4">
                <div className="" />
                <Link href={`/creator/${content.creator._id}`} className="text-primary hover:underline font-medium">
                  {content.creator.name}
                </Link>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8 py-6 border-y border-border">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Category</p>
                <p className="font-semibold text-foreground">{content.category?.name || "Uncategorized"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Downloads</p>
                <p className="font-semibold text-foreground">{content.sales}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Published</p>
                <p className="font-semibold text-foreground">{new Date(content.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">About This Content</h2>
              <p className="text-foreground leading-relaxed">{content.description}</p>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <Card className="p-6 border border-border sticky top-24 mb-6">
              <div className="mb-6">
                <p className="text-sm text-muted-foreground mb-2">Price</p>
                <p className="text-4xl font-bold text-primary">
                  {new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(content.price)}
                </p>
              </div>

              <Button
                className="w-full gap-2 mb-3 h-11"
                disabled={buying}
                onClick={() => {
                  if (purchases.has(content._id)) {
                    downloadFile(content._id)
                  } else {
                    handleBuyNow(content._id)
                  }
                }}
              >

                {purchases.has(content._id)
                  ? "Download"
                  : buying
                    ? "Processing..."
                    : "Buy Now"}
              </Button>



              <Button
                variant="outline"
                className="w-full gap-2 mb-3"
                onClick={toggleFavorite}
              >
                <Heart className={`w-5 h-5 ${isFavorite.has(content._id) ? "fill-current text-red-500" : ""}`} />
                {isFavorite.has(content._id) ? "Saved" : "Save"}
              </Button>
            </Card>

            {/* Related Content */}
            <Card className="p-6 border border-border">
              <h3 className="font-bold text-foreground mb-4">More from {content.creator.name}</h3>
              <div className="space-y-3">
                {!relatedContent.length && (
                  <p className="text-muted-foreground">No related content available.</p>
                )}
                {relatedContent.map((item) => (
                  <Link
                    key={item._id}
                    href={`/dashboard/content/${item.slug}`}
                    className="block p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                  >
                    <p className="text-sm font-medium text-foreground line-clamp-2">{item.title}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-primary font-semibold">
                        {new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(item.price)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
