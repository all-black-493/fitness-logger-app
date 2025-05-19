"use client"

import { Button } from "@/components/ui/button"
import { MainNav } from "@/components/main-nav"
import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"

export default function Home() {
  const { user, isLoading } = useAuth()

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <MainNav />
          <div className="ml-auto flex items-center space-x-4">
            {!isLoading &&
              (user ? (
                <Button className="bg-emerald-500 hover:bg-emerald-600" asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button variant="outline" asChild>
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button className="bg-emerald-500 hover:bg-emerald-600" asChild>
                    <Link href="/register">Sign Up</Link>
                  </Button>
                </>
              ))}
          </div>
        </div>
      </header>
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
      </main>
    </div>
  )
}
