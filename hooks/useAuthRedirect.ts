"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { toast } from "react-toastify"
import { jwtDecode } from "jwt-decode"

export function useAuthRedirect() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    try {
      const decoded: any = jwtDecode(token)

      // --- NEW: CHECK EXPIRATION ---
      if (decoded?.exp) {
        const isExpired = decoded.exp * 1000 < Date.now()
        if (isExpired) {
          console.log("Token expired, removing...")
          localStorage.removeItem("token")
          return
        }
      }

      if (decoded?.role) {
        
        const isAuthEntry = pathname === "/" || pathname === "/login" || pathname === "/register"

        if (!isAuthEntry) return

        setTimeout(() => {
          switch (decoded.role) {
            case "admin":
              router.push("/admin")
              break
            case "creator":
              router.push("/creator")
              break
            default:
              router.push("/dashboard")
          }
        }, 800)
      }
    } catch (error) {
      console.error("Invalid token, clearing...")
      localStorage.removeItem("token")
      router.push("/login")
    }
  }, [router, pathname])
}
