"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChallengeInvitation } from "@/types/challenge-invitations"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })


export function ChallengeCard() {
  const cardRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth() //Current Authenticated User
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null) //currentChallenge is a variable whose type is Challenge and whose value is currently null
  const [participants, setParticipants] = useState<ChallengeParticipant[]>([]) //No participants yet
  const [pendingInvites, setPendingInvites] = useState<ChallengeInvitation[]>([]) //No pending invites yet
  const [upcomingChallenges, setUpcomingChallenges] = useState<UpcomingChallenge[]>([]) //No upcomingChallenges yet
  const [loading, setLoading] = useState(true)//Loading is initially True
  const [userProgress, setUserProgress] = useState(0) //Initial userProgress value is false
  const [isUpdating, setIsUpdating] = useState(false) //Initial isUpdating is false
  const [showUpdateForm, setShowUpdateForm] = useState(false) //Not currently showing update form
  const [showInviteDialog, setShowInviteDialog] = useState(false) //Same applies here
  const [activeTab, setActiveTab] = useState("participants") //activeTab is participants
  const { toast } = useToast()
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    if (!user) return // Return  nothing if the user is not authenticated or does not exist
    //We are defining a function here. Not yet calling it
    const fetchCurrentChallenge = async () => {
      setLoading(true)
      try {
        // 1. Get the current active challenge
        const { data: challenges, error } = await supabase
          .from("challenges") // challenges table
          .select("*") //all entries in the challenges table
          .lte("start_date", new Date().toISOString()) //Challenges that HAVE BEGUN since the start date is less than today
          .gte("end_date", new Date().toISOString()) //Challenges that HAVE NOT ENDED since the end date is greater than today
          .order("created_at", { ascending: false }) //Newest first
          .limit(1) //One challenge entry that meets all these requirements. Remember, we are fetching the current challenge!

        if (error) throw error

        if (challenges && challenges.length > 0) {
          setCurrentChallenge(challenges[0])

          // 2. Get participants for this challenge
          const { data: participants, error: participantsError } = await supabase
            .from("challenge_participants") //challenge_participants table
            .select(`
              *,
              profile:profiles(username, full_name, avatar_url) 
            `) // 3. alias name is profile so you can refer it as {participants.profile}
            .eq("challenge_id", challenges[0].id) // where challenge_id is equivalent to Challenge.id
            .order("progress", { ascending: false }) //Highest first Lowest last

          console.log('Participants are: ', participants)
          if (participantsError) throw participantsError
          setParticipants(participants || [])

          // 4. Check if user is a participant and get their progress
          const userParticipant = participants?.find((p) => p.user_id === user.id)
          if (userParticipant) {
            setUserProgress(userParticipant.progress)
          }

          // 5. If user is the creator, get pending invitations
          if (challenges[0].created_by === user.id) {
            const { data: invites, error: invitesError } = await supabase
              .from("challenge_invitations")
              .select(`
                *,
                receiver:profiles!challenge_invitations_receiver_id_fkey(username, full_name, avatar_url)
              `) // 6. The alias here is receiver, so we get the pending invitations for this challenge this way {invites.receiver}
              .eq("challenge_id", challenges[0].id) //obvious
              .eq("sender_id", user.id) //obvious
              .eq("status", "pending") //obvious

            if (invitesError) throw invitesError
            setPendingInvites(invites || [])
          }
        }

        // 7. Get upcoming challenges
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

    // Hey! Watch the challenge_participants table, and if anything changes (like someone joins, updates their progress, or leaves), let me know right away — and when that happens, run my fetchCurrentChallenge() function
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

    // Same applies here
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

    // Clean up to avoid memory leaks and bugs
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
        <CardDescription>
          <pre className={inter.className}>
            {currentChallenge.description}
          </pre>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isCreator && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
            <TabsList className="grid w-full grid-cols-2 mb-6">
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
                    </div>
                  </div>
                )
              })}

              {participants.length === 0 && (
                <p className="text-sm text-muted-foreground py-2">No participants yet. You are the first to join!</p>
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
        )}


        <div className="flex space-x-2 mt-4">
          <>
            {isCreator && (
              <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Invite Friends
                  </Button>
                </DialogTrigger>
                <DialogTitle></DialogTitle>
                <DialogContent>
                  <InviteFriends challengeId={currentChallenge.id} onClose={() => setShowInviteDialog(false)} />
                </DialogContent>
              </Dialog>
            )}
          </>
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
