"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, Settings, LogOut, User } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChallengeInvitations } from "@/components/challenges/challenge-invitations"
import { useToast } from "@/components/ui/use-toast"
import { NotificationsDropdown } from "../notifications/notifications-dropdown"
import { SidebarTrigger } from "../ui/sidebar"

export function UserNav() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [invitationCount, setInvitationCount] = useState(0)
  const [activeTab, setActiveTab] = useState("invitations")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const supabase = getSupabaseBrowserClient()

  const handleSignOut = async () => {
    await signOut()
  }

  const userInitials = user?.email ? user.email.substring(0, 2).toUpperCase() : "GU"
  const username = user?.user_metadata?.username || "User"
  const avatarUrl = user?.user_metadata?.avatar_url

  // Fetch invitation count
  useEffect(() => {
    if (!user) return

    const fetchInvitationCount = async () => {
      try {
        const { data, error } = await supabase
          .from("challenge_invitations")
          .select("id")
          .eq("receiver_id", user.id)
          .eq("status", "pending")

        if (error) throw error
        setInvitationCount(data?.length || 0)
      } catch (error) {
        console.error("Error fetching invitation count:", error)
      }
    }

    fetchInvitationCount()

    // Set up real-time subscription for invitations
    const invitationsChannel = supabase
      .channel("user-invitations")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "challenge_invitations",
          filter: `receiver_id=eq.${user.id} AND status=eq.pending`,
        },
        () => {
          setInvitationCount((prev) => prev + 1)
          toast({
            title: "New Challenge Invitation",
            description: "You've been invited to join a challenge!",
          })
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "challenge_invitations",
          filter: `receiver_id=eq.${user.id}`,
        },
        (payload: any) => {
          if (payload.new.status !== "pending") {
            setInvitationCount((prev) => Math.max(0, prev - 1))
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(invitationsChannel)
    }
  }, [user, supabase, toast])

  const handleInvitationUpdate = () => {
    if (user) {
      supabase
        .from("challenge_invitations")
        .select("id")
        .eq("receiver_id", user.id)
        .eq("status", "pending")
        .then(({ data }) => {
          setInvitationCount(data?.length || 0)
        })
    }
  }

  return (
    <div className="flex items-center gap-2">
      
      <SidebarTrigger className="md:hidden"/>
      <NotificationsDropdown />

      <DropdownMenu>

        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={avatarUrl || "/placeholder.svg?height=32&width=32"} alt={username} />
              <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>


        <DropdownMenuContent className="w-56" align="end" forceMount>

          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{username}</p>
              <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => router.push("/profile")}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>

        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
