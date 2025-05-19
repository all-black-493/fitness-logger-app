"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"

interface RouteGuardProps {
  children: React.ReactNode
}

export default function RouteGuard({ children }: RouteGuardProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    const authCheck = () => {
      const publicPaths = ["/", "/login", "/register", "/forgot-password"]
      const path = pathname

      if (!publicPaths.includes(path) && !user) {
        setAuthorized(false)
        router.push("/login")
      } else {
        setAuthorized(true)
      }
    }

    if (!isLoading) {
      authCheck()
    }
  }, [isLoading, user, router, pathname])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  return authorized ? <>{children}</> : null
}
