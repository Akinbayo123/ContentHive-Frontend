"use client"
import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import axios from "axios"
import { Search, Heart, ChevronDown } from "lucide-react"
import { FaHeart } from "react-icons/fa";
import { FaRegHeart } from "react-icons/fa6";
import { toast } from "react-toastify";
import { API_BASE_URL } from "@/lib/api"
import { useRouter } from "next/navigation"
import { usePurchases } from "@/hooks/usePurchases"
import ContentSkeleton from "@/components/skeletons/ContentSkeleton"
import { getAuthUser } from "@/utils/auth"
export default function BrowsePage() {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("All")
  const [categories, setCategories] = useState<string[]>(["All"])
  const [page, setPage] = useState(1)
  const [files, setFiles] = useState<any[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [favourites, setFavourites] = useState<Set<string>>(new Set())
  const [loadingFile, setLoadingFile] = useState<string | null>(null)
  const router = useRouter()

  const { buying, purchases, handleBuyNow, fetchPurchases, downloadFile } = usePurchases()
  const authUser = getAuthUser()
  const token = authUser?.token

  // Fetch categories from API
  const fetchCategories = async () => {
    try {

      const res = await axios.get(`${API_BASE_URL}/users/files/categories`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      // Add "All" option at the start
      setCategories([{ _id: "All", name: "All" }, ...res.data])
    } catch (err) {
      console.error("Failed to fetch categories:", err)
    }
  }

  // Fetch content files from API
  const fetchFiles = async () => {
    try {
      setLoading(true)

      const res = await axios.get(`${API_BASE_URL}/users/files`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page,
          limit: 12,
          search,
          category: category !== "All" ? category : "",
        },
      })

      setFiles(res.data.files)
      setTotalPages(res.data.totalPages)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch categories once on mount
  useEffect(() => {
    fetchCategories()
    fetchFavourites()
    fetchPurchases();
  }, [])

  // Refetch files whenever filters change
  useEffect(() => {
    fetchFiles()
  }, [page, search, category])

  // Fetch user's favourites

  const fetchFavourites = async (page = 1) => {
    try {


      const res = await axios.get(`${API_BASE_URL}/users/favourites`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page, limit: 100 }, // fetch enough favourites, adjust limit if needed
      })

      const favIds = new Set<string>();
      res.data.favourites.forEach((f: any) => {
        if (f.file?._id) favIds.add(f.file._id); // most common case
        else if (f.fileId) favIds.add(f.fileId);
        else if (f._id) favIds.add(f._id);
        else if (typeof f === "string") favIds.add(f);
      });

      setFavourites(favIds);

    } catch (err) {
      console.error("Failed to fetch favourites:", err);
    }
  };


  const addToFavourites = async (fileId: string) => {
    try {


      const isFav = favourites.has(fileId)

      if (isFav) {
        // remove
        await axios.delete(`${API_BASE_URL}/users/favourites/${fileId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const next = new Set(favourites)
        next.delete(fileId)
        setFavourites(next)
        toast.success("Removed from favourites")
      } else {
        // add
        await axios.post(
          `${API_BASE_URL}/users/favourites/${fileId}`,
          null,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        const next = new Set(favourites)
        next.add(fileId)
        setFavourites(next)
        toast.success("Added to favourites")
      }

      // refresh files to reflect potential server-side changes
      fetchFiles()
    } catch (err: any) {
      console.error("Failed to add/remove favourites:", err)
      const msg = err?.response?.data?.message || err?.message || "Failed to update favourites"
      toast.error(msg)
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold">Browse Content</h1>
        <p className="text-muted-foreground">Discover amazing digital content from creators</p>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search content..."
            value={search}
            onChange={(e) => {
              setPage(1)
              setSearch(e.target.value)
            }}
            className="pl-10"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-8">
        {categories.map((cat: any) => (
          <Button
            key={cat._id || cat}
            variant={category === cat._id ? "default" : "outline"}
            onClick={() => {
              setPage(1)
              setCategory(cat._id)
            }}
            className="whitespace-nowrap"
          >
            {cat.name}
          </Button>
        ))}
      </div>

      {/* Loading State */}
      {loading && <ContentSkeleton rows={1} columns={4} />
      }

      {/* Content Grid */}
      {!loading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {files.map((item: any) => (
            <Card key={item._id} className="overflow-hidden hover:border-primary transition-colors group cursor-pointer">

              {/* Thumbnail */}
              <div className="w-full h-40 bg-muted relative">
                {item.previewImage ? (
                  <img
                    src={item.previewImage}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                    No Preview
                  </div>
                )}

                {/* Wishlist Icon */}
                <Button
                  onClick={(e) => { e.stopPropagation(); addToFavourites(item._id) }}
                  size="icon"
                  variant="secondary"
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity hover:cursor-pointer border"
                >
                  {favourites.has(item._id) ? (
                    <FaHeart className="w-8 h-8 text-red-500" size={32} />
                  ) : (
                    <FaRegHeart className="w-8 h-8 text-white" size={32} />
                  )}
                </Button>
              </div>

              {/* Info */}
              <div className="p-4">
                <p className="text-xs text-muted-foreground mb-1">
                  {item.category?.name || "Uncategorized"}
                </p>


                <h3 className="font-semibold mb-2 line-clamp-2 hover:cursor-pointer hover:underline" onClick={() => router.push(`/dashboard/content/${item.slug}`)}>{item.title}</h3>

                <p className="text-sm text-muted-foreground mb-3">
                  {item.creator?.name || "Unknown Creator"}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between border-t pt-3">
                  <span className="font-bold text-primary "> {new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(item.price)}</span>

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
      )
      }

      {/* Empty State */}
      {
        !loading && files.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No content found</p>
            <Button
              onClick={() => {
                setSearch("")
                setCategory("All")
              }}
            >
              Reset Filters
            </Button>
          </div>
        )
      }

      {/* Pagination */}
      {
        !loading && files.length > 0 && (
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
        )
      }
    </div >
  )
}
