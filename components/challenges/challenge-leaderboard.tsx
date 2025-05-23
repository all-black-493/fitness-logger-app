"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import type { Challenge } from "@/types/challenges"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp, TrendingDown, Equal } from "lucide-react"

interface Workout {
  id: string
  user_id: string
  created_at: string
  exercises: {
    exercise_id: string
    name: string
    sets: {
      weight: number
      reps: number
    }[]
  }[]
}

interface Participant {
  id: string
  user_id: string
  profile: {
    username: string
    avatar_url?: string
  }
  currentVolume?: number
  previousVolume?: number
  percentageChange?: number
  isCurrentUser?: boolean
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

  const calculateVolumeLoad = (workout: Workout): number => {
    if (!workout.exercises || workout.exercises.length === 0) return 0

    let workoutVolumeLoad = 0
    let exerciseCount = 0

    workout.exercises.forEach(exercise => {
      if (!exercise.sets || exercise.sets.length === 0) return

      const totalVolumeLoad = exercise.sets.reduce((sum, set) => sum + (set.weight * set.reps), 0)
      const exerciseAverage = totalVolumeLoad / exercise.sets.length
      workoutVolumeLoad += exerciseAverage
      exerciseCount++
    })

    return exerciseCount > 0 ? workoutVolumeLoad / exerciseCount : 0
  }

  const fetchChallengeData = async (challengeId: string) => {
    if (!user) return;

    try {
      // 1. Get all participants for this challenge
      const { data: participantsData, error: participantsError } = await supabase
        .from("challenge_participants")
        .select(`
        id,
        user_id,
        profiles:user_id (username, avatar_url)
      `)
        .eq("challenge_id", challengeId);

      if (participantsError) throw participantsError;
      if (!participantsData) return;

      // 2. Get challenge time period
      const { data: challenge } = await supabase
        .from("challenges")
        .select("start_date, end_date")
        .eq("id", challengeId)
        .single();

      if (!challenge) return;

      // 3. Get workouts for all participants
      const { data: workouts, error: workoutsError } = await supabase
        .from("workouts")
        .select(`
        id,
        user_id,
        created_at,
        exercises:workout_exercises(
          workout_id,
          name,
          sets:workout_sets(
            weight,
            reps
          )
        )
      `)
        .in("user_id", participantsData.map(p => p.user_id))
        .gte("created_at", challenge.start_date)
        .lte("created_at", challenge.end_date)
        .order("created_at", { ascending: false });

      if (workoutsError) throw workoutsError;

      // 4. Process and calculate metrics
      const participantsWithData = participantsData.map(participant => {
        const userWorkouts = workouts?.filter(w => w.user_id === participant.user_id) || [];

        if (userWorkouts.length === 0) {
          return {
            ...participant,
            profile: {
              username: participant.profiles?.username || `User ${participant.user_id.substring(0, 6)}`,
              avatar_url: participant.profiles?.avatar_url
            },
            currentVolume: 0,
            previousVolume: 0,
            percentageChange: 0,
            isCurrentUser: participant.user_id === user.id
          };
        }

        const currentWorkout = userWorkouts[0];
        const previousWorkout = userWorkouts.length > 1 ? userWorkouts[1] : null;

        const currentVolume = calculateVolumeLoad(currentWorkout);
        const previousVolume = previousWorkout ? calculateVolumeLoad(previousWorkout) : 0;
        const percentageChange = previousVolume
          ? ((currentVolume - previousVolume) / previousVolume) * 100
          : 0;

        return {
          ...participant,
          profile: {
            username: participant.profiles?.username || `User ${participant.user_id.substring(0, 6)}`,
            avatar_url: participant.profiles?.avatar_url
          },
          currentVolume,
          previousVolume,
          percentageChange,
          isCurrentUser: participant.user_id === user.id
        };
      });

      await supabase
        .from("leaderboard_cache") 
        .upsert(
          participantsWithData.map(p => ({
            challenge_id: challengeId,
            user_id: p.user_id,
            username: p.profile.username,
            current_volume: p.currentVolume,
            percentage_change: p.percentageChange,
            updated_at: new Date().toISOString()
          })),
          { onConflict: ["challenge_id", "user_id"] } 
        );

      const { data: leaderboardData } = await supabase
        .from("leaderboard_cache")
        .select("*")
        .eq("challenge_id", challengeId)
        .order("current_volume", { ascending: false });

      const processedParticipants = leaderboardData?.map(item => ({
        id: item.user_id, // Using user_id as temporary ID
        user_id: item.user_id,
        profile: {
          username: item.username,
          avatar_url: participantsData.find(p => p.user_id === item.user_id)?.profiles?.avatar_url
        },
        currentVolume: item.current_volume,
        percentageChange: item.percentage_change,
        isCurrentUser: item.user_id === user.id
      })) || [];

      setParticipants(processedParticipants);
    } catch (error) {
      console.error("Error fetching challenge data:", error);
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
                      Current: {participant.currentVolume?.toFixed(2) || 0}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  {participant.percentageChange !== undefined && participant.percentageChange > 0 ? (
                    <div className="text-emerald-500 flex items-center">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      <span>{Math.abs(participant.percentageChange).toFixed(2)}%</span>
                    </div>
                  ) : participant.percentageChange !== undefined && participant.percentageChange < 0 ? (
                    <div className="text-red-500 flex items-center">
                      <TrendingDown className="h-4 w-4 mr-1" />
                      <span>{Math.abs(participant.percentageChange).toFixed(2)}%</span>
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