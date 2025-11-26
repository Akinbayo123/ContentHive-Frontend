'use client'
import type React from "react"
import { SidebarNav } from "@/components/sidebar-nav"
import { useAuthRedirect } from "@/hooks/useAuthRedirect"
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
},

) {
  useAuthRedirect()
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background">
      <SidebarNav />
      <main className="flex-1 pt-16 md:pt-0">{children}</main>
    </div>
  )
}
