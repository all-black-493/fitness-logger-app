"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import type { ChallengeInvitation } from "@/types/challenge-invitations"
import { Skeleton } from "@/components/ui/skeleton"
import { Mail } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface ChallengeInvitationsProps {
  inDropdown?: boolean
  onUpdate?: () => void
}

export function ChallengeInvitations({ inDropdown = false, onUpdate }: ChallengeInvitationsProps) {
  const { user } = useAuth()
  const [invitations, setInvitations] = useState<ChallengeInvitation[]>([])
  const [loading, setLoading] = useState(true)
  const [responding, setResponding] = useState<string | null>(null)
  const { toast } = useToast()
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    if (!user) return

    const fetchInvitations = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from("challenge_invitations")
          .select(`
            *,
            challenge:challenges(name, description),
            sender:profiles!challenge_invitations_sender_id_fkey(username, full_name, avatar_url)
          `)
          .eq("receiver_id", user.id)
          .eq("status", "pending")
          .order("created_at", { ascending: false })

        if (error) throw error
        setInvitations(data || [])
      } catch (error) {
        console.error("Error fetching challenge invitations:", error)
        toast({
          title: "Error",
          description: "Failed to load challenge invitations",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchInvitations()

    const channel = supabase
      .channel("challenge-invitations")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "challenge_invitations",
          filter: `receiver_id=eq.${user.id}`,
        },
        () => {
          fetchInvitations()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, supabase, toast])

  const handleInvitation = async (invitationId: string, status: "accepted" | "dismissed") => {
    if (!user) return

    setResponding(invitationId)
    try {
      // Get the invitation details
      const invitation = invitations.find((inv) => inv.id === invitationId)
      if (!invitation) throw new Error("Invitation not found")

      // Update invitation status
      const { error: updateError } = await supabase
        .from("challenge_invitations")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", invitationId)

      if (updateError) throw updateError

      // If accepted, add user as participant
      if (status === "accepted") {
        const { error: participantError } = await supabase.from("challenge_participants").insert({
          challenge_id: invitation.challenge_id,
          user_id: user.id,
          progress: 0,
        })

        if (participantError) throw participantError

        // Create notification for the sender
        const { error: notificationError } = await supabase.from("notifications").insert({
          user_id: invitation.sender_id,
          type: "challenge_accepted",
          content: `${user.user_metadata?.full_name || user.email} has accepted your invitation to join "${invitation.challenge?.name}"`,
          related_id: invitation.challenge_id,
        })

        if (notificationError) throw notificationError
      }

      // Update UI
      setInvitations((prev) => prev.filter((inv) => inv.id !== invitationId))

      // Call onUpdate if provided
      if (onUpdate) onUpdate()

      toast({
        title: status === "accepted" ? "Challenge joined" : "Invitation dismissed",
        description:
          status === "accepted"
            ? `You've joined the challenge "${invitation.challenge?.name}"`
            : "The invitation has been dismissed",
      })
    } catch (error) {
      console.error(`Error ${status} challenge invitation:`, error)
      toast({
        title: "Error",
        description: `Failed to ${status === "accepted" ? "accept" : "dismiss"} invitation`,
        variant: "destructive",
      })
    } finally {
      setResponding(null)
    }
  }

  if (!user) {
    return null
  }

  if (loading) {
    return inDropdown ? (
      <div className="p-4">
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-4 w-full" />
              <div className="flex space-x-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    ) : (
      <Card>
        <CardHeader>
          <CardTitle>Challenge Invitations</CardTitle>
          <CardDescription>Invitations from your friends to join challenges</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="flex flex-col space-y-3 p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <Skeleton className="h-4 w-3/4" />
                <div className="flex space-x-2">
                  <Skeleton className="h-9 w-20" />
                  <Skeleton className="h-9 w-20" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (invitations.length === 0) {
    return inDropdown ? (
      <div className="p-4 text-center text-sm text-muted-foreground">No pending invitations</div>
    ) : null
  }

  return inDropdown ? (
    <div className="p-2">
      <div className="space-y-2">
        {invitations.map((invitation) => {
          const senderName = invitation.sender?.full_name || invitation.sender?.username || "Someone"
          const timeAgo = formatDistanceToNow(new Date(invitation.created_at), { addSuffix: true })
          const isResponding = responding === invitation.id

          return (
            <div key={invitation.id} className="flex flex-col space-y-2 p-2 border rounded-md">
              <div className="flex items-center space-x-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={invitation.sender?.avatar_url || "/placeholder.svg?height=24&width=24"} />
                  <AvatarFallback>
                    {(invitation.sender?.full_name?.[0] || invitation.sender?.username?.[0] || "?").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{senderName}</p>
                  <p className="text-xs text-muted-foreground">{timeAgo}</p>
                </div>
              </div>
              <p className="text-sm">
                Invited you to join "<span className="font-medium">{invitation.challenge?.name}</span>"
              </p>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isResponding}
                  onClick={() => handleInvitation(invitation.id, "dismissed")}
                  className="text-xs h-7"
                >
                  {isResponding ? "..." : "Dismiss"}
                </Button>
                <Button
                  size="sm"
                  disabled={isResponding}
                  onClick={() => handleInvitation(invitation.id, "accepted")}
                  className="text-xs h-7"
                >
                  {isResponding ? "..." : "Accept"}
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  ) : (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Mail className="mr-2 h-5 w-5" />
          Challenge Invitations
        </CardTitle>
        <CardDescription>Invitations from your friends to join challenges</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {invitations.map((invitation) => {
            const senderName = invitation.sender?.full_name || invitation.sender?.username || "Someone"
            const timeAgo = formatDistanceToNow(new Date(invitation.created_at), { addSuffix: true })
            const isResponding = responding === invitation.id

            return (
              <div key={invitation.id} className="flex flex-col space-y-3 p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={invitation.sender?.avatar_url || "/placeholder.svg?height=40&width=40"} />
                    <AvatarFallback>
                      {(invitation.sender?.full_name?.[0] || invitation.sender?.username?.[0] || "?").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{senderName}</p>
                    <p className="text-sm text-muted-foreground">{timeAgo}</p>
                  </div>
                </div>
                <p>
                  <span className="font-medium">{senderName}</span> invited you to join the challenge "
                  <span className="font-medium">{invitation.challenge?.name}</span>"
                </p>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isResponding}
                    onClick={() => handleInvitation(invitation.id, "dismissed")}
                  >
                    {isResponding ? "Processing..." : "Dismiss"}
                  </Button>
                  <Button size="sm" disabled={isResponding} onClick={() => handleInvitation(invitation.id, "accepted")}>
                    {isResponding ? "Processing..." : "Accept"}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
