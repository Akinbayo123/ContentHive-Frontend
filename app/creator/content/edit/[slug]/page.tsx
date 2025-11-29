"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import axios from "axios"
import { API_BASE_URL } from "@/lib/api"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ArrowLeft, UploadIcon, AlertCircle } from "lucide-react"
import { toast } from "react-toastify"
import { EditContentSkeleton } from "@/components/skeletons/EditContentSkeleton"
import { getAuthUser } from "@/utils/auth"

interface Content {
  _id: string
  slug: string
  title: string
  description: string
  price: number
  previewImage: string
  category: { _id: string; name: string }
}

export default function EditContentPage() {
  const params = useParams()
  const slug = params?.slug as string | undefined
  const router = useRouter()
  const authUser = getAuthUser()
  const token = authUser?.token
  const [content, setContent] = useState<Content | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const [categories, setCategories] = useState<any[]>([])

  // Editable fields
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    isAvailable: true
  })

  const [previewImage, setPreviewImage] = useState<File | null>(null)
  const [contentFile, setContentFile] = useState<File | null>(null)

  // Load categories + content
  useEffect(() => {
    const fetchData = async () => {
      try {

        // Fetch categories
        const catRes = await axios.get(`${API_BASE_URL}/creators/categories`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setCategories(catRes.data)

        //  Fetch content by slug
        if (!slug) throw new Error("Missing slug")
        const fileRes = await axios.get(`${API_BASE_URL}/creators/files/${slug}`, {
          headers: { Authorization: `Bearer ${token}` }
        })

        const file = fileRes.data.file
        setContent(file)

        // Pre-fill form
        setFormData({
          title: file.title,
          description: file.description,
          category: file.category?._id || "",
          price: String(file.price),
          isAvailable: file.isAvailable ?? true
        })
      } catch (err: any) {
        console.error(err)
        toast.error("Unable to load content")

      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [slug])

  // SUBMIT EDIT
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content) return

    try {
      setSubmitting(true)


      const data = new FormData()

      data.append("title", formData.title)
      data.append("description", formData.description)
      data.append("category", formData.category)
      data.append("price", formData.price)
      data.append("isAvailable", String(formData.isAvailable))

      if (previewImage) data.append("previewImage", previewImage)
      if (contentFile) data.append("file", contentFile)

      const res = await axios.put(`${API_BASE_URL}/creators/files/${content._id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      toast.success("Content updated successfully!")
      setTimeout(() => {
        router.push(`/creator/content/${content.slug}`)
      }, 1200)
    } catch (err: any) {
      if (err.response?.data) {
        const data = err.response.data

        if (data.errors?.length) {
          const messages = data.errors.map((e: any) => e.msg)
          setError(messages)
        }

        else if (data.message) setError(data.message)
        else setError("Something went wrong.")
      } else {
        setError("Network error. Check your connection.")
      }
    } finally {
      setLoading(false)
      setSubmitting(false)
    }
  }

  if (loading) return <EditContentSkeleton />


  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto w-full">
      <div className="mb-8">
        <Link href="/creator/content" className="inline-flex items-center gap-2 text-primary">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <h1 className="text-3xl font-bold text-foreground mt-4">Edit Content</h1>
      </div>

      <Card className="p-6 border border-border">
        {/* Errors */}
        {error && (
          <div className="flex gap-3 p-4 bg-destructive/10 text-destructive rounded-lg mb-4">
            <AlertCircle className="w-5 h-5" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-6">
          {/* Preview Image */}
          <div>
            <label className="text-sm font-medium">Preview Image</label>

            <div className="relative mt-2 border-2 border-dashed border-border rounded-lg p-8 text-center">
              {previewImage ? (
                <img
                  src={URL.createObjectURL(previewImage)}
                  className="w-full h-48 object-cover rounded-md"
                />
              ) : (
                <img
                  src={content?.previewImage}
                  className="w-full h-48 object-cover rounded-md"
                />
              )}

              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPreviewImage(e.target.files?.[0] || null)}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          </div>

          {/* Content File */}
          <div>
            <label className="text-sm font-medium">Main Content File</label>

            <div className="relative mt-2 border-2 border-dashed border-border rounded-lg p-8 text-center">
              <UploadIcon className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p>Select a new file only if you want to replace it.</p>

              <input
                type="file"
                onChange={(e) => setContentFile(e.target.files?.[0] || null)}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
            {contentFile && (
              <p className="text-sm text-primary mt-2">Selected: {contentFile.name}</p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="text-sm font-medium">Title</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-2"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full mt-2 p-3 bg-background border border-border rounded-lg"
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-sm font-medium">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full mt-2 p-3 border border-border rounded-lg"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Price */}
          <div>
            <label className="text-sm font-medium">Price (₦)</label>
            <div className="flex items-center mt-2">
              <span className="px-3 py-2 bg-muted rounded-l-lg">₦</span>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="rounded-l-none"
              />
            </div>
          </div>
          {/* Availability */}
          <div>
            <label className="text-sm font-medium">Availabile</label>
            <div
              onClick={() =>
                setFormData({ ...formData, isAvailable: !formData.isAvailable })
              }
              className={`w-14 h-7 flex items-center rounded-full p-1 cursor-pointer transition ${formData.isAvailable ? "bg-sidebar-primary" : "bg-gray-400"
                }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${formData.isAvailable ? "translate-x-7" : ""
                  }`}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <Button type="submit" disabled={submitting} className="flex-1">
              {submitting ? "Updating..." : "Update Content"}
            </Button>

            <Button asChild variant="outline" className="flex-1">
              <Link href={`/creator/content/${content?.slug}`}>Cancel</Link>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
