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
import { formatDistanceToNow } from "date-fns"
import { Trophy } from "lucide-react"

type Challenge = {
  id: string
  name: string
  description: string | null
  start_date: string
  end_date: string
  created_by: string
  created_at: string
  updated_at: string
}

type ChallengeParticipant = {
  id: string
  challenge_id: string
  user_id: string
  progress: number
  created_at: string
  updated_at: string
  profile?: {
    username: string | null
    full_name: string | null
    avatar_url: string | null
  }
}

type UpcomingChallenge = {
  id: string
  name: string
  description: string | null
  start_date: string
  created_by: string
  created_at: string
}

export function ChallengeCard() {
  const cardRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null)
  const [participants, setParticipants] = useState<ChallengeParticipant[]>([])
  const [upcomingChallenges, setUpcomingChallenges] = useState<UpcomingChallenge[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    if (!user) return

    const fetchCurrentChallenge = async () => {
      setLoading(true)
      setError(null)
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

          // Get friends of the current user
          const { data: friends, error: friendsError } = await supabase
            .from("friend_requests")
            .select("sender_id, receiver_id")
            .eq("status", "accepted")
            .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)

          if (friendsError) throw friendsError

          // Extract friend IDs
          const friendIds = friends
            ? friends.map((fr) => (fr.sender_id === user.id ? fr.receiver_id : fr.sender_id))
            : []

          // Include the user's own ID
          const participantIds = [user.id, ...friendIds]

          // Get participants for this challenge who are friends
          const { data: participants, error: participantsError } = await supabase
            .from("challenge_participants")
            .select(`
              *,
              profile:profiles(username, full_name, avatar_url)
            `)
            .eq("challenge_id", challenges[0].id)
            .in("user_id", participantIds)
            .order("progress", { ascending: false })

          if (participantsError) throw participantsError
          setParticipants(participants || [])
        }

        const { data: upcoming, error: upcomingError } = await supabase
          .from("upcoming_challenges")
          .select("*")
          .gt("start_date", new Date().toISOString())
          .order("start_date", { ascending: true })
          .limit(2)

        if (upcomingError) throw upcomingError
        setUpcomingChallenges(upcoming || [])
      } catch (error) {
        console.error("Error fetching challenge data:", error)
        setError("Failed to load challenge data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchCurrentChallenge()
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
  }, [loading, participants])

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

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error Loading Challenge</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!currentChallenge) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Active Challenge</CardTitle>
          <CardDescription>There are no active challenges at the moment.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Check back later or create a new challenge to compete with friends.
          </p>
          {upcomingChallenges.length > 0 && (
            <div className="mt-6 pt-4 border-t">
              <h4 className="font-semibold mb-2">Upcoming Challenges</h4>
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

  return (
    <Card ref={cardRef}>
      <CardHeader>
        <h4 className="font-semibold mb-2">Active Challenge</h4>
        <CardTitle>
          <div className="flex space-x-2">
            <Trophy /><span>{currentChallenge.name}</span>
          </div>
        </CardTitle>
        <CardDescription>{currentChallenge.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
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
        </div>

        {upcomingChallenges.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <h4 className="font-semibold mb-2">Upcoming Challenges</h4>
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
