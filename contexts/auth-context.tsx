"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { User, Session } from "@supabase/supabase-js"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  signUp: (email: string, password: string, options?: { metadata?: Record<string, any> }) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: any }>
  updatePassword: (password: string) => Promise<{ error: any }>
  updateProfile: (profile: { username?: string; avatar_url?: string }) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = getSupabaseBrowserClient()
  const router = useRouter()

  useEffect(() => {
    const fetchSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()

      if (error) {
        console.error("Error fetching session:", error)
      }

      setSession(session)
      setUser(session?.user || null)
      setIsLoading(false)
    }

    fetchSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      setUser(session?.user || null)
      setIsLoading(false)

      router.refresh()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  const signUp = async (
    email: string,
    password: string,
    options?: { metadata?: Record<string, any> }
  ): Promise<{ error: any }> => {
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: "https://fitness-logger-all-black-493s-projects.vercel.app/dashboard",
      },
    })

    if (!error && data.user) {
      try {
        const userId = data.user.id
        const username = email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "")
        const fullName = options?.metadata?.full_name || null
        const firstLetter = email.charAt(0).toUpperCase()
        const avatarUrl = `https://ui-avatars.com/api/?name=${firstLetter}&background=10b981&color=ffffff`

        // Use upsert to avoid duplicate key error
        const { error: profileError } = await supabase.from("profiles").upsert(
          {
            id: userId,
            username,
            full_name: fullName,
            avatar_url: avatarUrl,
          },
          { onConflict: "id" } // optional, but makes intent clearer
        )

        if (profileError) {
          console.error("Error upserting profile during signup:", profileError)
        }
      } catch (profileCatchError) {
        console.error("Exception during profile creation:", profileCatchError)
      }
    }

    return { error }
  }


  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    return { error }
  }

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({
      password,
    })
    return { error }
  }

  const updateProfile = async (profile: { username?: string; avatar_url?: string }) => {
    const { error } = await supabase.auth.updateUser({
      data: profile,
    })
    return { error }
  }

  const value = {
    user,
    session,
    isLoading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
