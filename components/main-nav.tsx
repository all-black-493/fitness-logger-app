"use client"

import Link from "next/link"
import { Dumbbell } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function MainNav() {
  const { user } = useAuth()
  const pathname = usePathname()

  return (
    <div className="flex items-center space-x-4 lg:space-x-6">
      <Link href="/" className="flex items-center space-x-2">
        <Dumbbell className="h-6 w-6 text-emerald-500" />
        <span className="font-bold text-xl">GymBro</span>
      </Link>
      <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
        {user ? (
          // Links for authenticated users
          <>
            <Link
              href="/exercises"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname.startsWith("/exercises") ? "text-primary" : "text-muted-foreground",
              )}
            >
              Exercises
            </Link>
            <Link
              href="/competitions"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname.startsWith("/challenges") ? "text-primary" : "text-muted-foreground",
              )}
            >
              Challenges
            </Link>
            <Link
              href="/communities"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname.startsWith("/communities") ? "text-primary" : "text-muted-foreground",
              )}
            >
              Communities
            </Link>
          </>
        ) : (
          // Links for non-authenticated users
          <>
            <Link
              href="/features"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === "/features" ? "text-primary" : "text-muted-foreground",
              )}
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === "/pricing" ? "text-primary" : "text-muted-foreground",
              )}
            >
              Pricing
            </Link>
            <Link
              href="/about"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === "/about" ? "text-primary" : "text-muted-foreground",
              )}
            >
              About
            </Link>
          </>
        )}
      </nav>
    </div>
  )
}
