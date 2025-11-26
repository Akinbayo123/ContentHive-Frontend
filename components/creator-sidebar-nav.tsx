"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, Upload, BarChart3, DollarSign, Settings, LogOut, Menu, X, MessageSquare } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { logout } from "@/hooks/useAuth"

const creatorNavItems = [
  { href: "/creator", label: "Dashboard", icon: Home },
  { href: "/creator/content", label: "My Content", icon: Upload },
  { href: "/creator/chat", label: "Messages", icon: MessageSquare }, // Added chat navigation
  // { href: "/creator/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/creator/earnings", label: "Earnings", icon: DollarSign },
  { href: "/creator/settings", label: "Settings", icon: Settings },
]

export function CreatorSidebarNav() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Mobile Toggle */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-card border-b border-border px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">H</span>
          </div>
          <span className="font-semibold text-foreground">ContentHive</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed md:static left-0 top-16 md:top-0 bottom-0 w-64 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform duration-300 z-50",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        {/* Header - Desktop Only */}
        <div className="hidden md:flex items-center gap-2 p-6 border-b border-sidebar-border">
          <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <span className="text-sidebar-primary-foreground font-bold">H</span>
          </div>
          <span className="font-semibold text-sidebar-foreground">ContentHive</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {creatorNavItems.map((item) => {
            const Icon = item.icon
            const isActive =
              item.href === "/creator"
                ? pathname === "/creator"
                : pathname.startsWith(item.href);


            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/20",
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>


        {/* Logout */}
        <div className="border-t border-sidebar-border p-4">
          <Button
            onClick={logout}
            variant="ghost"
            className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-500/10 transition-colors duration-200 rounded-lg"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </Button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 md:hidden z-40 top-16" onClick={() => setIsOpen(false)} />}
    </>
  )
}
