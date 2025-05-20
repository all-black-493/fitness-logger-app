"use client"

import { useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"

export function ProfileTrigger() {
  const { user } = useAuth()
  const supabase = getSupabaseBrowserClient()
  const { toast } = useToast()

  useEffect(() => {
    if (!user) return

    const createUserProfile = async () => {
      try {
        const { data: existingProfile, error: checkError } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", user.id)
          .maybeSingle()

        if (checkError) {
          console.error("Error checking profile:", checkError)
          return
        }

        if (!existingProfile) {
          const username = user.email
            ? user.email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "")
            : `user_${Math.floor(Math.random() * 10000)}`

          const fullName = user.user_metadata?.full_name || null

          const firstLetter = (user.email?.charAt(0) || username.charAt(0)).toUpperCase()
          const avatarUrl = `https://ui-avatars.com/api/?name=${firstLetter}&background=10b981&color=ffffff`

          const { error: insertError } = await supabase.from("profiles").insert({
            id: user.id,
            username: username,
            full_name: fullName,
            avatar_url: avatarUrl,
          })

          if (insertError) {
            console.error("Error creating profile:", insertError)
            toast({
              title: "Profile Creation Failed",
              description: "There was an error creating your profile. Please try again later.",
              variant: "destructive",
            })
          } else {
            console.log("Profile created successfully")
            toast({
              title: "Profile Created",
              description: "Your profile has been created successfully. You can update it in your profile settings.",
            })
          }
        }
      } catch (error) {
        console.error("Error in profile trigger:", error)
      }
    }

    createUserProfile()
  }, [user, supabase, toast])

  return null
}
