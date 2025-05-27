"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import type { Challenge } from "@/types/challenges"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp, TrendingDown, Equal } from "lucide-react"

// interface Workout {
//   id: string
//   user_id: string
//   created_at: string
//   exercises: {
//     exercise_id: string
//     name: string
//     sets: {
//       weight: number
//       reps: number
//     }[]
//   }[]
// }

interface Participant {
  id: string;
  user_id: string;
  profile: {
    username: string;
    avatar_url?: string;
  };
  current_volume?: number;  
  percentage_change?: number; 
  isCurrentUser?: boolean;
}

export function ChallengeLeaderboard() {
  const { user } = useAuth()
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [isParticipant, setIsParticipant] = useState(false)
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    if (!user) return

    const fetchChallenges = async () => {
      setLoading(true)
      try {
        // Get challenges where user is a participant
        const { data: challenges, error } = await supabase
          .from("challenges")
          .select("*")
          .lte("start_date", new Date().toISOString())
          .gte("end_date", new Date().toISOString())
          .order("created_at", { ascending: false })

        if (error) throw error

        // Check which challenges the user is participating in
        if (challenges && challenges.length > 0) {
          const { data: participants } = await supabase
            .from("challenge_participants")
            .select("challenge_id")
            .eq("user_id", user.id)

          const participatingChallenges = challenges.filter(challenge =>
            participants?.some(p => p.challenge_id === challenge.id)
          )

          setChallenges(participatingChallenges)

          if (participatingChallenges.length > 0) {
            const challenge = participatingChallenges[0]
            setSelectedChallenge(challenge)
            setIsParticipant(true)
            await fetchChallengeData(challenge.id)
          }
        }
      } catch (error) {
        console.error("Error fetching challenges:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchChallenges()
  }, [user, supabase])

  const fetchChallengeData = async (challengeId: string) => {
  if (!user) return;

  try {
    await supabase.rpc('update_leaderboard_cache', { challenge_id: challengeId });

    const { data: leaderboard, error } = await supabase
      .from('leaderboard_cache')
      .select('*')
      .eq('challenge_id', challengeId)
      .order('current_volume', { ascending: false });

    if (error) throw error;

    setParticipants(leaderboard?.map(item => ({
      id: item.user_id,
      user_id: item.user_id,
      profile: {
        username: item.username,
        avatar_url: item.avatar_url
      },
      current_volume: item.current_volume, 
      percentage_change: item.percentage_change,
      isCurrentUser: item.user_id === user.id
    })) || []);

  } catch (error) {
    console.error("Leaderboard error:", error);
  }
};

  const handleChallengeChange = async (challengeId: string) => {
    const challenge = challenges.find(c => c.id === challengeId)
    if (!challenge) return

    setSelectedChallenge(challenge)
    await fetchChallengeData(challengeId)
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Challenge Leaderboard</CardTitle>
          <CardDescription>Please log in to view challenge leaderboard</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Challenge Leaderboard</CardTitle>
          <CardDescription>Loading challenge data...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (challenges.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Challenge Leaderboard</CardTitle>
          <CardDescription>You are not participating in any active challenges</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Challenge Leaderboard</CardTitle>
        <CardDescription>
          {selectedChallenge?.name} - Ends {new Date(selectedChallenge?.end_date).toDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="challenge" className="block text-sm font-medium">
            Select Challenge
          </label>
          <select
            id="challenge"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={selectedChallenge?.id || ""}
            onChange={(e) => handleChallengeChange(e.target.value)}
          >
            {challenges.map((challenge) => (
              <option key={challenge.id} value={challenge.id}>
                {challenge.name} (until {new Date(challenge.end_date).toLocaleDateString()})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-4">
          {participants.length > 0 ? (
            participants.map((participant, index) => (
              <div
                key={participant.id}
                className={`flex items-center justify-between p-4 border rounded-lg ${participant.isCurrentUser ? "bg-primary/10" : ""
                  }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="font-medium w-6 text-right">{index + 1}</span>
                  {participant.profile.avatar_url ? (
                    <img
                      src={participant.profile.avatar_url}
                      alt={participant.profile.username}
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      {participant.profile.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className={`font-medium ${participant.isCurrentUser ? "text-primary" : ""}`}>
                      {participant.profile.username}
                      {participant.isCurrentUser && " (You)"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Current Workout Volume: {participant.current_volume?.toFixed(1) || 0}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  {participant.percentage_change !== undefined && participant.percentage_change > 0 ? (
                    <div className="text-emerald-500 flex items-center">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      <span>{Math.abs(participant.percentage_change).toFixed(2)}%</span>
                    </div>
                  ) : participant.percentage_change !== undefined && participant.percentage_change < 0 ? (
                    <div className="text-red-500 flex items-center">
                      <TrendingDown className="h-4 w-4 mr-1" />
                      <span>{Math.abs(participant.percentage_change).toFixed(2)}%</span>
                    </div>
                  ) : (
                    <div className="text-gray-500 flex items-center">
                      <Equal className="h-4 w-4 mr-1" />
                      <span>0%</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No participants with workout data found for this challenge.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}