'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Edit, Eye, Trash2 } from "lucide-react"
import axios from "axios"
import { API_BASE_URL } from "@/lib/api"
import { Card } from "@/components/ui/card"
import { useParams } from "next/navigation"
import { DetailPageSkeleton } from "@/components/skeletons/DetailPageSkeleton"
import { getAuthUser } from "@/utils/auth"

interface Content {
  _id: string
  slug: string
  title: string
  creator: { _id: string, name: string }
  creatorid: string
  price: number
  views: number
  sales: number
  description: string
  previewImage: string
  url: string
  category: { _id: string; name: string }
  createdAt: string
}

export default function DetailPage() {
  const params = useParams()
  const slug = params?.slug as string | undefined

  const router = useRouter()
  const [content, setContent] = useState<Content | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const authUser = getAuthUser()
  const token = authUser?.token

  useEffect(() => {
    const fetchContent = async () => {
      try {

        if (!slug) throw new Error('Missing slug')
        const res = await axios.get(`${API_BASE_URL}/creators/files/${slug}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setContent(res.data.file)
      } catch (err: any) {
        console.error(err)
        setError("Failed to load content")
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [slug])

  const handleDelete = async () => {
    if (!content) return
    if (!confirm("Are you sure you want to delete this content?")) return

    try {
      setLoading(true)
      setError("")


      // API might accept either the slug or the _id — prefer slug when available
      const identifier = slug ?? content._id
      if (!identifier) throw new Error("Missing identifier for deletion")

      await axios.delete(`${API_BASE_URL}/creators/files/${identifier}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      // navigate back after successful delete
      router.push("/creator/content")
    } catch (err: any) {
      console.error(err)
      const msg = err?.response?.data?.message || err?.message || "Failed to delete content"
      setError(msg)
      alert(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    if (!slug) return
    router.push(`/creator/content/edit/${slug}`)
  }

  if (loading) return <DetailPageSkeleton />
  if (error || !content) return <p className="text-center py-20 text-red-600">{error}</p>
  const publishedDate = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(content.createdAt));
  const formattedPrice = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(content.price);


  return (


    <main className="min-h-screen bg-background" >
      {/* Navigation */}
      <nav className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur" >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/creator/content" className="inline-flex items-center gap-2 text-primary hover:underline">
            <ChevronLeft className="w-4 h-4" />
            Back
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Preview Image */}
            <div className="w-full h-96 rounded-xl mb-8 flex items-center justify-center bg-muted/20">
              <img
                src={content.previewImage || ""}
                alt={content.title}
                className="object-cover w-full h-full rounded-xl"
              />
            </div>

            {/* Title & Creator */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-foreground mb-2">{content.title}</h1>

            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8 py-6 border-y border-border">
              {[
                { label: "Price", value: `${formattedPrice}` },
                { label: "Category", value: content.category?.name || "N/A" },
                { label: "Downloads", value: content.sales },
                { label: "Views", value: content.views },
                { label: "Published", value: publishedDate },

              ].map((stat, i) => (
                <div key={i}>
                  <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                  <p className="font-semibold text-foreground">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">About This Content</h2>
              <p className="text-foreground leading-relaxed mb-6">{content.description}</p>


              <div className="flex flex-wrap gap-3 mt-4">

                <Button
                  type="button"
                  onClick={() => {
                    const fileUrl = content?.url;
                    if (fileUrl) window.location.href = fileUrl;
                    else alert("File not available");
                  }}
                  className="flex items-center gap-2 bg-primary text-white hover:bg-primary/90"
                >
                  <Eye size={16} />
                  View
                </Button>



                <Button
                  onClick={handleEdit}
                  variant="outline"
                  className="flex items-center gap-2 border-muted  transition"
                >
                  <Edit size={16} />
                  Edit
                </Button>

                <Button
                  onClick={handleDelete}
                  className="flex items-center gap-2 bg-red-600 text-white hover:bg-red-700 transition"
                >
                  <Trash2 size={16} />
                  Delete
                </Button>
              </div>

            </div>
          </div>


        </div>
      </div>
    </main >
  )
}


