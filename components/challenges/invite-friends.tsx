"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, UserPlus, Users } from "lucide-react"

interface Friend {
  id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  invited: boolean
}

interface InviteFriendsProps {
  challengeId: string
  onClose?: () => void
}

export function InviteFriends({ challengeId, onClose }: InviteFriendsProps) {
  const { user } = useAuth()
  const [friends, setFriends] = useState<Friend[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    if (!user) return

    const fetchFriends = async () => {
      setLoading(true)
      try {
        // Get all accepted friend requests where the current user is either the sender or receiver
        const { data: friendRequests, error: friendRequestsError } = await supabase
          .from("friend_requests")
          .select("*")
          .eq("status", "accepted")
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)

        if (friendRequestsError) throw friendRequestsError

        if (!friendRequests?.length) {
          setFriends([])
          setLoading(false)
          return
        }

        // Extract friend IDs
        const friendIds = friendRequests.map((fr) => (fr.sender_id === user.id ? fr.receiver_id : fr.sender_id))

        // Get friend profiles
        const { data: friendProfiles, error: profilesError } = await supabase
          .from("profiles")
          .select("*")
          .in("id", friendIds)

        if (profilesError) throw profilesError

        // Get already invited friends for this challenge
        const { data: invitations, error: invitationsError } = await supabase
          .from("challenge_invitations")
          .select("receiver_id")
          .eq("challenge_id", challengeId)
          .eq("sender_id", user.id)

        if (invitationsError) throw invitationsError

        // Get existing participants
        const { data: participants, error: participantsError } = await supabase
          .from("challenge_participants")
          .select("user_id")
          .eq("challenge_id", challengeId)

        if (participantsError) throw participantsError

        // Combine invited and participating users
        const invitedIds = new Set([
          ...(invitations?.map((i) => i.receiver_id) || []),
          ...(participants?.map((p) => p.user_id) || []),
        ])

        // Map profiles to friends with invited status
        const friendsWithStatus = friendProfiles?.map((profile) => ({
          id: profile.id,
          username: profile.username,
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          invited: invitedIds.has(profile.id),
        }))

        setFriends(friendsWithStatus || [])
      } catch (error) {
        console.error("Error fetching friends:", error)
        toast({
          title: "Error",
          description: "Failed to load friends",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchFriends()
  }, [user, challengeId, supabase, toast])

  const handleInvite = async () => {
    if (!user) return

    const selectedFriends = friends.filter((f) => f.selected && !f.invited)
    if (selectedFriends.length === 0) {
      toast({
        title: "No friends selected",
        description: "Please select at least one friend to invite",
      })
      return
    }

    setSending(true)
    try {
      const invitations = selectedFriends.map((friend) => ({
        challenge_id: challengeId,
        sender_id: user.id,
        receiver_id: friend.id,
        status: "pending",
      }))

      const { error } = await supabase.from("challenge_invitations").insert(invitations)

      if (error) throw error

      // Update UI
      setFriends((prev) =>
        prev.map((friend) => {
          if (friend.selected) {
            return { ...friend, invited: true, selected: false }
          }
          return friend
        }),
      )

      toast({
        title: "Invitations sent",
        description: `Invited ${selectedFriends.length} friend${selectedFriends.length > 1 ? "s" : ""} to the challenge`,
      })

      // Close dialog if provided
      if (onClose) onClose()
    } catch (error) {
      console.error("Error sending invitations:", error)
      toast({
        title: "Error",
        description: "Failed to send invitations",
        variant: "destructive",
      })
    } finally {
      setSending(false)
    }
  }

  const toggleFriendSelection = (friendId: string) => {
    setFriends((prev) =>
      prev.map((friend) => {
        if (friend.id === friendId && !friend.invited) {
          return { ...friend, selected: !friend.selected }
        }
        return friend
      }),
    )
  }

  const filteredFriends = friends.filter((friend) => {
    const fullName = friend.full_name?.toLowerCase() || ""
    const username = friend.username?.toLowerCase() || ""
    const query = searchQuery.toLowerCase()
    return fullName.includes(query) || username.includes(query)
  })

  const availableFriends = filteredFriends.filter((f) => !f.invited)
  const invitedFriends = filteredFriends.filter((f) => f.invited)
  const selectedCount = friends.filter((f) => f.selected && !f.invited).length

  if (!user) {
    return null
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold mb-2">Invite Friends to Challenge</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Select friends to invite to this challenge. Only friends can be invited.
        </p>

        <div className="relative mb-4">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search friends..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-2 p-2">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-10 w-10 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : availableFriends.length > 0 ? (
          <div className="max-h-60 overflow-y-auto space-y-1 border rounded-md p-1">
            {availableFriends.map((friend) => {
              const displayName = friend.full_name || friend.username || "Unknown User"
              const initial = (friend.full_name?.[0] || friend.username?.[0] || "?").toUpperCase()

              return (
                <div
                  key={friend.id}
                  className={`flex items-center space-x-2 p-2 rounded-md hover:bg-muted cursor-pointer ${
                    friend.selected ? "bg-muted" : ""
                  }`}
                  onClick={() => toggleFriendSelection(friend.id)}
                >
                  <Checkbox checked={friend.selected} />
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={friend.avatar_url || "/placeholder.svg?height=32&width=32"} />
                    <AvatarFallback>{initial}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{displayName}</p>
                    {friend.username && friend.username !== friend.full_name && (
                      <p className="text-xs text-muted-foreground">@{friend.username}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8 border rounded-md">
            <Users className="mx-auto h-10 w-10 text-muted-foreground opacity-50 mb-2" />
            <p className="text-muted-foreground">
              {friends.length === 0
                ? "You don't have any friends yet"
                : searchQuery
                  ? "No friends match your search"
                  : "All your friends have been invited"}
            </p>
          </div>
        )}

        {invitedFriends.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2 flex items-center">
              <UserPlus className="mr-1 h-4 w-4" /> Already Invited
            </h3>
            <div className="flex flex-wrap gap-2">
              {invitedFriends.map((friend) => {
                const displayName = friend.full_name || friend.username || "Unknown User"
                const initial = (friend.full_name?.[0] || friend.username?.[0] || "?").toUpperCase()

                return (
                  <div key={friend.id} className="flex items-center space-x-1 bg-muted px-2 py-1 rounded-full text-xs">
                    <Avatar className="h-4 w-4">
                      <AvatarImage src={friend.avatar_url || "/placeholder.svg?height=16&width=16"} />
                      <AvatarFallback className="text-[8px]">{initial}</AvatarFallback>
                    </Avatar>
                    <span>{displayName}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-2 pt-2">
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        )}
        <Button onClick={handleInvite} disabled={sending || selectedCount === 0}>
          {sending ? "Sending..." : `Invite ${selectedCount ? `(${selectedCount})` : ""}`}
        </Button>
      </div>
    </div>
  )
}
