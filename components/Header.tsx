"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

export default function Header() {
    const [open, setOpen] = useState(false)

    return (
        <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                            <span className="text-primary-foreground font-bold text-lg">H</span>
                        </div>
                        <span className="text-xl font-semibold text-foreground">ContentHive</span>
                    </div>

                    {/* Desktop actions */}
                    <div className="hidden md:flex items-center gap-4">
                        <Link href="/login" className="text-foreground hover:text-primary transition-colors">
                            Login
                        </Link>
                        <Button asChild variant="default">
                            <Link href="/register">Get Started</Link>
                        </Button>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            aria-expanded={open}
                            aria-controls="mobile-menu"
                            onClick={() => setOpen((v) => !v)}
                            className="p-2 rounded-md text-foreground hover:bg-muted/20"
                        >
                            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            <div
                id="mobile-menu"
                className={`${open ? 'block' : 'hidden'
                    } md:hidden `}
            >
                <div className="absolute top-16 left-0 right-0 bg-background shadow-xl border border-border p-6 animate-slideDown">
                    <div className="flex flex-col space-y-6">

                        <Link
                            href="/login"
                            className="text-center text-base font-medium py-3 rounded-xl border border-border text-foreground hover:text-primary hover:border-primary transition-all"
                        >
                            Login
                        </Link>

                        <Button asChild className="rounded-xl py-6 text-base font-semibold">
                            <Link href="/register" className="w-full text-center">
                                Get Started
                            </Link>
                        </Button>

                    </div>
                </div>
            </div>

        </nav>
    )
}
