"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/contexts/auth-context"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import type { Challenge, ChallengeParticipant, UpcomingChallenge } from "@/types/challenges"
import { formatDistanceToNow } from "date-fns"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/components/ui/use-toast"
import { Trophy, UserPlus, Users } from "lucide-react"
import { InviteFriends } from "@/components/challenges/invite-friends"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function ChallengeCard() {
  const cardRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null)
  const [participants, setParticipants] = useState<ChallengeParticipant[]>([])
  const [pendingInvites, setPendingInvites] = useState<any[]>([])
  const [upcomingChallenges, setUpcomingChallenges] = useState<UpcomingChallenge[]>([])
  const [loading, setLoading] = useState(true)
  const [userProgress, setUserProgress] = useState(0)
  const [isUpdating, setIsUpdating] = useState(false)
  const [showUpdateForm, setShowUpdateForm] = useState(false)
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [activeTab, setActiveTab] = useState("participants")
  const { toast } = useToast()
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    if (!user) return

    const fetchCurrentChallenge = async () => {
      setLoading(true)
      try {
        // Get the current active challenge
        const { data: challenges, error } = await supabase
          .from("challenges")
          .select("*")
          .lte("start_date", new Date().toISOString())
          .gte("end_date", new Date().toISOString())
          .order("created_at", { ascending: false })
          .limit(1)

        if (error) throw error

        if (challenges && challenges.length > 0) {
          setCurrentChallenge(challenges[0])

          // Get participants for this challenge
          const { data: participants, error: participantsError } = await supabase
            .from("challenge_participants")
            .select(`
              *,
              profile:profiles(username, full_name, avatar_url)
            `)
            .eq("challenge_id", challenges[0].id)
            .order("progress", { ascending: false })

          if (participantsError) throw participantsError
          setParticipants(participants || [])

          // Check if user is a participant and get their progress
          const userParticipant = participants?.find((p) => p.user_id === user.id)
          if (userParticipant) {
            setUserProgress(userParticipant.progress)
          }

          // If user is the creator, get pending invitations
          if (challenges[0].created_by === user.id) {
            const { data: invites, error: invitesError } = await supabase
              .from("challenge_invitations")
              .select(`
                *,
                receiver:profiles!challenge_invitations_receiver_id_fkey(username, full_name, avatar_url)
              `)
              .eq("challenge_id", challenges[0].id)
              .eq("sender_id", user.id)
              .eq("status", "pending")

            if (invitesError) throw invitesError
            setPendingInvites(invites || [])
          }
        }

        // Get upcoming challenges
        const { data: upcoming, error: upcomingError } = await supabase
          .from("challenges")
          .select("*")
          .gt("start_date", new Date().toISOString())
          .order("start_date", { ascending: true })
          .limit(2)

        if (upcomingError) throw upcomingError
        setUpcomingChallenges(upcoming || [])
      } catch (error) {
        console.error("Error fetching challenge data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCurrentChallenge()

    // Set up real-time subscription for participants
    const participantsChannel = supabase
      .channel("participants-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "challenge_participants",
        },
        () => {
          fetchCurrentChallenge()
        },
      )
      .subscribe()

    // Set up real-time subscription for invitations
    const invitationsChannel = supabase
      .channel("invitations-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "challenge_invitations",
        },
        () => {
          fetchCurrentChallenge()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(participantsChannel)
      supabase.removeChannel(invitationsChannel)
    }
  }, [user, supabase])

  useEffect(() => {
    if (loading || !cardRef.current || !participants.length) return

    const ctx = gsap.context(() => {
      // Animate progress bars
      gsap.from(".competition-progress", {
        width: 0,
        duration: 1.5,
        ease: "power2.out",
        stagger: 0.2,
      })

      // Animate avatars
      gsap.from(".competition-avatar", {
        scale: 0,
        opacity: 0,
        duration: 0.5,
        ease: "back.out(1.7)",
        stagger: 0.1,
      })
    }, cardRef)

    return () => ctx.revert()
  }, [loading, participants, activeTab])

  // Function to update progress
  const updateProgress = async () => {
    if (!user || !currentChallenge) return

    setIsUpdating(true)
    try {
      // Check if user is already a participant
      const { data: existingParticipant } = await supabase
        .from("challenge_participants")
        .select("id")
        .eq("challenge_id", currentChallenge.id)
        .eq("user_id", user.id)
        .single()

      if (existingParticipant) {
        // Update existing participant
        await supabase
          .from("challenge_participants")
          .update({ progress: userProgress, updated_at: new Date().toISOString() })
          .eq("id", existingParticipant.id)
      } else {
        // Add new participant
        await supabase.from("challenge_participants").insert({
          challenge_id: currentChallenge.id,
          user_id: user.id,
          progress: userProgress,
        })
      }

      // Refresh participants
      const { data: refreshedParticipants } = await supabase
        .from("challenge_participants")
        .select(`
          *,
          profile:profiles(username, full_name, avatar_url)
        `)
        .eq("challenge_id", currentChallenge.id)
        .order("progress", { ascending: false })

      setParticipants(refreshedParticipants || [])
      setShowUpdateForm(false)

      toast({
        title: "Progress updated",
        description: "Your challenge progress has been updated successfully",
      })
    } catch (error) {
      console.error("Error updating progress:", error)
      toast({
        title: "Error",
        description: "Failed to update progress",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  // Create a sample challenge if none exists
  const createSampleChallenge = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Create a challenge
      const challenge = {
        name: "Weekly Steps Challenge",
        description: "Who can get the most steps this week?",
        start_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        end_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days from now
        created_by: user.id,
      }

      const { data: newChallenge, error } = await supabase.from("challenges").insert(challenge).select().single()

      if (error) throw error

      // Add the current user as a participant
      await supabase.from("challenge_participants").insert({
        challenge_id: newChallenge.id,
        user_id: user.id,
        progress: 65.5,
      })

      // Refresh the page
      window.location.reload()
    } catch (error) {
      console.error("Error creating sample challenge:", error)
      toast({
        title: "Error",
        description: "Failed to create sample challenge",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
            <div className="mt-6 pt-4 border-t">
              <Skeleton className="h-6 w-1/3 mb-4" />
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!currentChallenge) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="mr-2 h-5 w-5" />
            No Active Challenge
          </CardTitle>
          <CardDescription>There are no active challenges at the moment.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Trophy className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
            <p className="text-muted-foreground">Check back later or create a new challenge to compete with friends.</p>
            <Button onClick={createSampleChallenge} className="mt-4">
              Create Sample Challenge
            </Button>
          </div>

          {upcomingChallenges.length > 0 && (
            <div className="mt-6 pt-4 border-t">
              <h4 className="font-semibold mb-2 flex items-center">
                <Users className="mr-2 h-4 w-4" />
                Upcoming Challenges
              </h4>
              <ul className="space-y-2 text-sm">
                {upcomingChallenges.map((challenge) => (
                  <li key={challenge.id} className="flex justify-between">
                    <span>{challenge.name}</span>
                    <span className="text-muted-foreground">
                      Starts {formatDistanceToNow(new Date(challenge.start_date), { addSuffix: true })}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  const isCreator = currentChallenge.created_by === user?.id

  return (
    <Card ref={cardRef}>
      <CardHeader>
        <h4>Active Challenge</h4>
        <CardTitle className="flex items-center">
          <Trophy className="mr-2 h-5 w-5" />
          {currentChallenge.name}
        </CardTitle>
        <CardDescription>{currentChallenge.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {isCreator && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="participants">Participants</TabsTrigger>
              <TabsTrigger value="invites" className="relative">
                Pending Invites
                {pendingInvites.length > 0 && (
                  <span className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] text-white">
                    {pendingInvites.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}
        <Tabs>

        <TabsContent value="participants" className="mt-0 space-y-4">
          {participants.map((participant, index) => {
            const isCurrentUser = user && participant.user_id === user.id
            const name = participant.profile?.full_name || participant.profile?.username || "Unknown User"
            const initial = name.charAt(0).toUpperCase()

            return (
              <div key={participant.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Avatar className="competition-avatar h-8 w-8">
                      <AvatarImage
                        src={participant.profile?.avatar_url || "/placeholder.svg?height=40&width=40"}
                        alt={name}
                      />
                      <AvatarFallback>{initial}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{isCurrentUser ? "You" : name}</span>
                  </div>
                  <span className="text-sm font-bold">{participant.progress}%</span>
                </div>
                <Progress
                  className="competition-progress h-2"
                  value={participant.progress}
                  style={
                    {
                      "--progress-background": isCurrentUser ? "hsl(var(--emerald-500))" : undefined,
                    } as React.CSSProperties
                  }
                />
              </div>
            )
          })}

          {participants.length === 0 && (
            <p className="text-sm text-muted-foreground py-2">No participants yet. Be the first to join!</p>
          )}
        </TabsContent>

        <TabsContent value="invites" className="mt-0">
          {pendingInvites.length > 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                These friends have been invited but haven't responded yet:
              </p>
              {pendingInvites.map((invite) => {
                const name = invite.receiver?.full_name || invite.receiver?.username || "Unknown User"
                const initial = (invite.receiver?.full_name?.[0] || invite.receiver?.username?.[0] || "?").toUpperCase()
                const timeAgo = formatDistanceToNow(new Date(invite.created_at), { addSuffix: true })

                return (
                  <div key={invite.id} className="flex items-center justify-between p-2 border rounded-md">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={invite.receiver?.avatar_url || "/placeholder.svg?height=32&width=32"} />
                        <AvatarFallback>{initial}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{name}</p>
                        <p className="text-xs text-muted-foreground">Invited {timeAgo}</p>
                      </div>
                    </div>
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Pending</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-6">
              <UserPlus className="mx-auto h-10 w-10 text-muted-foreground opacity-50 mb-2" />
              <p className="text-muted-foreground">No pending invitations</p>
            </div>
          )}
        </TabsContent>
        </Tabs>

        <div className="flex space-x-2 mt-4">
          {showUpdateForm ? (
            <div className="w-full mt-2 pt-4 border-t">
              <h4 className="font-semibold mb-4">Update Your Progress</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Progress: {userProgress}%</span>
                </div>
                <Slider
                  value={[userProgress]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={(values) => setUserProgress(values[0])}
                />
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => setShowUpdateForm(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={updateProgress} disabled={isUpdating} className="flex-1">
                    {isUpdating ? "Updating..." : "Save Progress"}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <Button onClick={() => setShowUpdateForm(true)} className="flex-1" variant="outline">
                Update Progress
              </Button>

              {isCreator && (
                <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex items-center">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Invite Friends
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <InviteFriends challengeId={currentChallenge.id} onClose={() => setShowInviteDialog(false)} />
                  </DialogContent>
                </Dialog>
              )}
            </>
          )}
        </div>

        {upcomingChallenges.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <h4 className="font-semibold mb-2 flex items-center">
              <Users className="mr-2 h-4 w-4" />
              Upcoming Challenges
            </h4>
            <ul className="space-y-2 text-sm">
              {upcomingChallenges.map((challenge) => (
                <li key={challenge.id} className="flex justify-between">
                  <span>{challenge.name}</span>
                  <span className="text-muted-foreground">
                    Starts {formatDistanceToNow(new Date(challenge.start_date), { addSuffix: true })}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
