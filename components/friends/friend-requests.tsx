"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import type { FriendRequest, Profile } from "@/types/friends"
import { Skeleton } from "@/components/ui/skeleton"

export function FriendRequests() {
  const { user } = useAuth()
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([])
  const [friends, setFriends] = useState<Profile[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)
  const { toast } = useToast()
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    if (!user) return

    const fetchFriendsAndRequests = async () => {
      setLoading(true)
      try {
        const { data: requests, error: requestsError } = await supabase
          .from("friend_requests")
          .select(`
            *,
            sender:profiles!friend_requests_sender_id_fkey(id, username, full_name, avatar_url)
          `)
          .eq("receiver_id", user.id)
          .eq("status", "pending")

        if (requestsError) throw requestsError
        setPendingRequests(requests || [])

        const { data: acceptedRequests, error: acceptedError } = await supabase
          .from("friend_requests")
          .select(`
            *,
            sender:profiles!friend_requests_sender_id_fkey(id, username, full_name, avatar_url),
            receiver:profiles!friend_requests_receiver_id_fkey(id, username, full_name, avatar_url)
          `)
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .eq("status", "accepted")

        if (acceptedError) throw acceptedError

        const friendsList: Profile[] = []
        acceptedRequests?.forEach((request) => {
          if (request.sender && request.receiver) {
            if (request.sender_id === user.id) {
              friendsList.push(request.receiver)
            } else {
              friendsList.push(request.sender)
            }
          }
        })

        setFriends(friendsList)
      } catch (error) {
        console.error("Error fetching friends data:", error)
        toast({
          title: "Error",
          description: "Failed to load friends data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchFriendsAndRequests()
  }, [user, supabase, toast])

  const handleSearch = async () => {
    if (!searchQuery.trim() || !user) return

    setSearchLoading(true)
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .or(`username.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`)
        .neq("id", user.id)
        .limit(5)

      if (error) throw error
      setSearchResults(data || [])
    } catch (error) {
      console.error("Error searching users:", error)
      toast({
        title: "Error",
        description: "Failed to search users",
        variant: "destructive",
      })
    } finally {
      setSearchLoading(false)
    }
  }

  const sendFriendRequest = async (receiverId: string) => {
    if (!user) return

    try {
      const { data: existingRequest, error: checkError } = await supabase
        .from("friend_requests")
        .select("*")
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user.id})`,
        )
        .maybeSingle()

      if (checkError) throw checkError

      if (existingRequest) {
        toast({
          title: "Friend request exists",
          description: "A friend request already exists between you and this user",
        })
        return
      }

      // Send new friend request
      const { error } = await supabase.from("friend_requests").insert({
        sender_id: user.id,
        receiver_id: receiverId,
        status: "pending",
      })

      if (error) throw error

      toast({
        title: "Friend request sent",
        description: "Your friend request has been sent successfully",
      })

      setSearchResults((prev) =>
        prev.map((profile) => (profile.id === receiverId ? { ...profile, requestSent: true } : profile)),
      )
    } catch (error) {
      console.error("Error sending friend request:", error)
      toast({
        title: "Error",
        description: "Failed to send friend request",
        variant: "destructive",
      })
    }
  }

  const handleFriendRequest = async (requestId: string, status: "accepted" | "rejected") => {
    try {
      const { error } = await supabase
        .from("friend_requests")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", requestId)

      if (error) throw error

      if (status === "accepted") {
        const acceptedRequest = pendingRequests.find((req) => req.id === requestId)
        if (acceptedRequest?.sender) {
          setFriends((prev) => [...prev, acceptedRequest.sender!])
        }
      }

      setPendingRequests((prev) => prev.filter((req) => req.id !== requestId))

      toast({
        title: status === "accepted" ? "Friend request accepted" : "Friend request rejected",
        description:
          status === "accepted" ? "You are now friends with this user" : "The friend request has been rejected",
      })
    } catch (error) {
      console.error(`Error ${status} friend request:`, error)
      toast({
        title: "Error",
        description: `Failed to ${status} friend request`,
        variant: "destructive",
      })
    }
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Friends</CardTitle>
          <CardDescription>Please log in to manage your friends</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Friends</CardTitle>
        <CardDescription>Manage your friends and requests</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="friends">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="friends">Friends</TabsTrigger>
            <TabsTrigger value="requests">
              Requests
              {pendingRequests.length > 0 && (
                <span className="ml-1 rounded-full bg-primary w-5 h-5 text-xs flex items-center justify-center text-primary-foreground">
                  {pendingRequests.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="search">Find Friends</TabsTrigger>
          </TabsList>

          <TabsContent value="friends" className="mt-4">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div>
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                ))}
              </div>
            ) : friends.length > 0 ? (
              <div className="space-y-4">
                {friends.map((friend) => (
                  <div key={friend.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={friend.avatar_url || "/placeholder.svg?height=40&width=40"} />
                        <AvatarFallback>
                          {(friend.full_name?.[0] || friend.username?.[0] || "?").toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{friend.full_name || friend.username}</p>
                        {friend.username && friend.full_name && (
                          <p className="text-sm text-muted-foreground">@{friend.username}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-4 text-muted-foreground">
                You don't have any friends yet. Search for users to add friends.
              </p>
            )}
          </TabsContent>

          <TabsContent value="requests" className="mt-4">
            {loading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div>
                        <Skeleton className="h-4 w-24 mb-1" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Skeleton className="h-9 w-20" />
                      <Skeleton className="h-9 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : pendingRequests.length > 0 ? (
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage
                          src={request.sender?.avatar_url || "/placeholder.svg?height=40&width=40"}
                          alt={request.sender?.full_name || request.sender?.username || "User"}
                        />
                        <AvatarFallback>
                          {(request.sender?.full_name?.[0] || request.sender?.username?.[0] || "?").toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{request.sender?.full_name || request.sender?.username}</p>
                        {request.sender?.username && request.sender?.full_name && (
                          <p className="text-sm text-muted-foreground">@{request.sender.username}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleFriendRequest(request.id, "rejected")}>
                        Reject
                      </Button>
                      <Button size="sm" onClick={() => handleFriendRequest(request.id, "accepted")}>
                        Accept
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-4 text-muted-foreground">You don't have any pending friend requests.</p>
            )}
          </TabsContent>

          <TabsContent value="search" className="mt-4">
            <div className="flex space-x-2 mb-4">
              <Input
                placeholder="Search by username or name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={searchLoading}>
                {searchLoading ? "Searching..." : "Search"}
              </Button>
            </div>

            {searchLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div>
                        <Skeleton className="h-4 w-24 mb-1" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                    <Skeleton className="h-9 w-24" />
                  </div>
                ))}
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-4">
                {searchResults.map((profile) => {
                  const isFriend = friends.some((friend) => friend.id === profile.id)
                  const requestSent = (profile as any).requestSent

                  return (
                    <div key={profile.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={profile.avatar_url || "/placeholder.svg?height=40&width=40"} />
                          <AvatarFallback>
                            {(profile.full_name?.[0] || profile.username?.[0] || "?").toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{profile.full_name || profile.username}</p>
                          {profile.username && profile.full_name && (
                            <p className="text-sm text-muted-foreground">@{profile.username}</p>
                          )}
                        </div>
                      </div>
                      {isFriend ? (
                        <Button variant="outline" size="sm" disabled>
                          Friends
                        </Button>
                      ) : requestSent ? (
                        <Button variant="outline" size="sm" disabled>
                          Request Sent
                        </Button>
                      ) : (
                        <Button size="sm" onClick={() => sendFriendRequest(profile.id)}>
                          Add Friend
                        </Button>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : searchQuery ? (
              <p className="text-center py-4 text-muted-foreground">No users found matching your search.</p>
            ) : (
              <p className="text-center py-4 text-muted-foreground">Search for users by username or name.</p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
