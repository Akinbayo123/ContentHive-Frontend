"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Search, Upload, Edit, Trash2, Eye, ArrowLeft, Table } from "lucide-react"
import axios from "axios"
import { API_BASE_URL } from "@/lib/api"
import { useRouter } from "next/navigation"
import TableSkeleton from "@/components/skeletons/TableSkeleton"
import { toast } from "react-toastify";
import { getAuthUser } from "@/utils/auth"

export default function ContentManagementPage() {
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState("createdAt")
  const [order, setOrder] = useState("desc")
  const [enabled, setEnabled] = useState(false);
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const router = useRouter()
  const authUser = getAuthUser()
  const token = authUser?.token

  const [contents, setContents] = useState({
    data: [],
    total: 0,
    totalPages: 1,
    page: 1,
    limit: 10,
  })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [togglingIds, setTogglingIds] = useState<string[]>([])

  // Fetch Contents
  const fetchContents = async () => {
    setLoading(true)
    setError("")

    try {

      const res = await axios.get(
        `${API_BASE_URL}/creators/files`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            search,
            sort,
            order,
            page,
            limit,
          },
        }
      )

      setContents(res.data)
    } catch (err: any) {
      setError("Failed to load content")
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  //Fetch whenever filters change (debounce search)
  useEffect(() => {
    const delay = setTimeout(() => {
      fetchContents()
    }, 500)

    return () => clearTimeout(delay)
  }, [search, sort, order, page])

  const handleDelete = async (fileId: string) => {
    const yes = confirm("Are you sure you want to delete this content?");
    if (!yes) return;

    try {


      await axios.delete(`${API_BASE_URL}/creators/files/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Remove the deleted item from UI
      setContents(prev => ({
        ...prev,
        data: prev.data.filter((item: any) => item._id !== fileId)
      }));


      toast.success("Content deleted successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete content");
    }
  };
  const toggleAvailability = async (fileId: string, currentStatus: boolean) => {
    // prevent duplicate toggles
    if (togglingIds.includes(fileId)) return

    setTogglingIds((prev) => [...prev, fileId])

    try {
      const res = await axios.patch(
        `${API_BASE_URL}/creators/files/${fileId}/availability`,
        { isAvailable: !currentStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      // Update UI instantly (safe updater)
      setContents((prev: any) => {
        if (!prev || !Array.isArray(prev.data)) return prev

        const isAvailableFromRes = res?.data?.file?.isAvailable ?? !currentStatus

        const updated = prev.data.map((item: any) =>
          item._id === fileId ? { ...item, isAvailable: isAvailableFromRes } : item
        )

        return { ...prev, data: updated }
      })

      toast.success("Availability updated successfully")
    } catch (err) {
      console.error(err)
      toast.error("Failed to update availability")
      // Optionally: revert optimistic UI by re-fetching or toggling back. Here we revert locally.
      setContents((prev: any) => {
        if (!prev || !Array.isArray(prev.data)) return prev
        const reverted = prev.data.map((item: any) =>
          item._id === fileId ? { ...item, isAvailable: currentStatus } : item
        )
        return { ...prev, data: reverted }
      })
    } finally {
      setTogglingIds((prev) => prev.filter((id) => id !== fileId))
    }
  }


  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">

      {/* Back Button */}
      <Link href="/creator" className="inline-flex items-center gap-2 text-primary hover:underline mb-4">
        <ArrowLeft className="w-4 h-4" />
        Back
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Content Management</h1>
          <p className="text-muted-foreground">Manage and monitor your uploads</p>
        </div>

        <Button asChild className="gap-2">
          <Link href="/creator/content/upload">
            <Upload className="w-4 h-4" />
            Upload New
          </Link>
        </Button>
      </div>

      {/* Search + Filtering */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center mb-6">

        {/* Search */}
        <div className="relative w-full sm:w-1/2">
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

        {/* Sort */}
        <select
          className="border rounded-md px-3 py-2"
          value={sort}
          onChange={(e) => {
            setPage(1)
            setSort(e.target.value)
          }}
        >
          <option value="createdAt">Newest</option>
          <option value="title">Title</option>
          <option value="price">Price</option>
        </select>

        {/* Order */}
        <select
          className="border rounded-md px-3 py-2"
          value={order}
          onChange={(e) => {
            setPage(1)
            setOrder(e.target.value)
          }}
        >
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3 text-left">Title</th>
              <th className="px-4 py-3 text-center">Category</th>
              <th className="px-4 py-3 text-center">Views</th>
              <th className="px-4 py-3 text-center">Sales</th>
              <th className="px-4 py-3 text-center">Available</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {/* Loading state */}
            {loading && (
              <tr>
                <td colSpan={7}>
                  <TableSkeleton rows={5} cols={7} />
                </td>
              </tr>
            )}


            {/* Data */}
            {!loading && contents.data?.length > 0 &&
              contents.data.map((item: any, index: number) => {
                const isToggling = togglingIds.includes(item._id)
                return (
                  <tr key={item._id} className="border-b hover:bg-muted/50">
                    <td className="px-4 py-4">{(page - 1) * limit + index + 1}</td>

                    <td className="px-4 py-4">
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(item.price)}</p>
                    </td>

                    <td className="px-4 py-4 text-center">{item.category?.name}</td>

                    <td className="px-4 py-4  text-center">{item.views ?? 0}</td>
                    <td className="px-4 py-4 text-center">{item.sales ?? 0}</td>
                    <td className="px-4 py-4 text-center">
                      <button
                        type="button"
                        disabled={isToggling}
                        aria-pressed={item.isAvailable}
                        onClick={() => toggleAvailability(item._id, item.isAvailable)}
                        className={`w-14 h-7 flex items-center rounded-full p-1 transition ${item.isAvailable ? "bg-sidebar-primary" : "bg-gray-400"} ${isToggling ? 'opacity-60 cursor-wait' : 'cursor-pointer'}`}
                      >
                        <div
                          className={`bg-white w-5 h-5 rounded-full shadow-md transform transition ${item.isAvailable ? "translate-x-7" : "translate-x-0"}`}
                        />
                      </button>
                    </td>



                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => router.push(`/creator/content/${item.slug}`)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => router.push(`/creator/content/edit/${item.slug}`)}><Edit className="w-4 h-4" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(item._id)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </td>
                  </tr>
                )
              })
            }

            {/* Empty */}
            {!loading && contents.data?.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-6 text-muted-foreground">
                  No content found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-4 mt-8 ">
        <Button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Previous
        </Button>

        <span className="text-sm text-muted-foreground pt-2">
          Page {page} of {contents.totalPages}
        </span>

        <Button
          disabled={page === contents.totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
