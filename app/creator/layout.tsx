'use client'
import type React from "react"
import { CreatorSidebarNav } from "@/components/creator-sidebar-nav" // Import creator sidebar
import { useAuthRedirect } from "@/hooks/useAuthRedirect"
export default function CreatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useAuthRedirect()
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background">
      <CreatorSidebarNav /> {/* Use creator sidebar instead of generic one */}
      <main className="flex-1 pt-16 md:pt-0">{children}</main>
    </div>
  )
}
