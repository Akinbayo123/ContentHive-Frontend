"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { ArrowLeft, UploadIcon, AlertCircle } from "lucide-react"
import axios from "axios"
import { API_BASE_URL } from "@/lib/api"
import { toast } from "react-toastify";
import { useRouter } from "next/navigation"
import { getAuthUser } from "@/utils/auth"
import { is } from "date-fns/locale"

export default function UploadContentPage() {
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const router = useRouter()
  const authUser = getAuthUser()
  const token = authUser?.token
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    isAvailable: true
  })

  const [previewImage, setPreviewImage] = useState<File | null>(null)
  const [contentFile, setContentFile] = useState<File | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true)
      setError("")

      try {

        const res = await axios.get(`${API_BASE_URL}/creators/categories`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setCategories(res.data)
      } catch (err: any) {

        if (err.response?.data) {
          const data = err.response.data
          console.log(data)
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
      }
    }

    fetchCategories()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    // Require only the main content file. Preview image is optional.
    if (!contentFile || !previewImage) {
      setError("Please select a main content file to upload")
      setLoading(false)
      return
    }

    try {
      const data = new FormData()
      data.append("title", formData.title)
      data.append("description", formData.description)
      data.append("category", formData.category)
      data.append("price", formData.price)
      data.append("isAvailable", String(formData.isAvailable))
      data.append("previewImage", previewImage)
      // backend expects the main file under the `file` field
      data.append("file", contentFile)
      // data.forEach((value, key) => {
      //   console.log(key, value);
      // });


      const res = await axios.post(`${API_BASE_URL}/creators/files`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": null,

        },
      })

      console.log("Upload success:", res.data)

      toast.success("File Uploaded Successfully");
      setTimeout(() => router.push("/creator/content"), 1500);
      // Optionally redirect or reset form here
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
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto w-full">
      {/* Header */}
      <div className="mb-8">
        <Link href="/creator/content" className="inline-flex items-center gap-2 text-primary hover:underline mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <h1 className="text-3xl font-bold text-foreground mb-2">Upload New Content</h1>
        <p className="text-muted-foreground">Share your digital content with the community</p>
      </div>

      {/* Form */}
      <Card className="p-6 border border-border">
        {error && Array.isArray(error) ? (
          <div className="flex flex-col gap-1 p-4 bg-destructive/10 text-destructive rounded-lg">
            {error.map((e: string, i: number) => (
              <p key={i} className="text-sm">{e}</p>
            ))}
          </div>
        ) : (
          error && (
            <div className="flex gap-3 p-4 bg-destructive/10 text-destructive rounded-lg">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )
        )}


        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Preview Image */}
          <div>
            <label className="text-sm font-medium text-foreground">Preview Image</label>
            <div className="relative mt-2 border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
              {/* Show image preview if available, otherwise show upload icon */}
              {previewImage ? (
                <img
                  src={URL.createObjectURL(previewImage)}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-md"
                />
              ) : (
                <>
                  <UploadIcon className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="font-medium text-foreground mb-1">Drag and drop or click to upload</p>
                  <p className="text-sm text-muted-foreground">Supported formats: Image</p>
                </>
              )}

              {/* File input always on top */}
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
            <label className="text-sm font-medium text-foreground">Content File</label>
            <div className="relative mt-2 border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
              <UploadIcon className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium text-foreground mb-1">Drag and drop or click to upload</p>
              <p className="text-sm text-muted-foreground">Supported formats: ZIP, PDF, MP3, MP4, IMAGE</p>
              <input
                type="file"
                onChange={(e) => setContentFile(e.target.files?.[0] || null)}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
            {contentFile && <p className="text-sm text-primary mt-2">Selected: {contentFile.name}</p>}
          </div>


          {/* Title */}
          <div>
            <label className="text-sm font-medium text-foreground">Title</label>
            <Input
              placeholder="E.g., Premium React Template"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-2 bg-background"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-foreground">Description</label>
            <textarea
              placeholder="Describe your content, features, and what buyers will get..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full mt-2 p-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              rows={4}
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-sm font-medium text-foreground">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full mt-2 p-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select a category</option>
              {categories.map((cat: any) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Price */}
          <div>
            <label className="text-sm font-medium text-foreground">Price (₦)</label>
            <div className="flex items-center mt-2">
              <span className="text-foreground px-3 py-2 bg-muted rounded-l-lg">₦</span>
              <Input
                type="number"
                placeholder="0.00"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="rounded-l-none bg-background"
                step="0.01"
                min="0"
              />
            </div>
          </div>
          {/* Availability */}
          <div>
            <label className="text-sm font-medium">Availability</label>
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
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Uploading..." : "Upload Content"}
            </Button>
            <Button asChild variant="outline" className="flex-1 bg-transparent">
              <Link href="/creator/content">Cancel</Link>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
