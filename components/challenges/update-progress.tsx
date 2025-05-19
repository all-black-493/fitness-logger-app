"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import type { Challenge } from "@/types/challenges"
import { Skeleton } from "@/components/ui/skeleton"

export function UpdateProgress() {
  const { user } = useAuth()
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [selectedChallenge, setSelectedChallenge] = useState<string | null>(null)
  const [progress, setProgress] = useState<number>(0)
  const [currentProgress, setCurrentProgress] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const { toast } = useToast()
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    if (!user) return

    const fetchChallenges = async () => {
      setLoading(true)
      try {
        // Get active challenges
        const { data: challenges, error } = await supabase
          .from("challenges")
          .select("*")
          .lte("start_date", new Date().toISOString())
          .gte("end_date", new Date().toISOString())
          .order("created_at", { ascending: false })

        if (error) throw error
        setChallenges(challenges || [])

        if (challenges && challenges.length > 0) {
          setSelectedChallenge(challenges[0].id)

          // Get user's current progress in this challenge
          const { data: participant } = await supabase
            .from("challenge_participants")
            .select("*")
            .eq("challenge_id", challenges[0].id)
            .eq("user_id", user.id)
            .maybeSingle()

          if (participant) {
            setCurrentProgress(participant.progress)
            setProgress(participant.progress)
          } else {
            setCurrentProgress(0)
            setProgress(0)
          }
        }
      } catch (error) {
        console.error("Error fetching challenges:", error)
        toast({
          title: "Error",
          description: "Failed to load challenges",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchChallenges()
  }, [user, supabase, toast])

  const handleChallengeChange = async (challengeId: string) => {
    setSelectedChallenge(challengeId)

    if (!user) return

    try {
      // Get user's current progress in this challenge
      const { data: participant } = await supabase
        .from("challenge_participants")
        .select("*")
        .eq("challenge_id", challengeId)
        .eq("user_id", user.id)
        .maybeSingle()

      if (participant) {
        setCurrentProgress(participant.progress)
        setProgress(participant.progress)
      } else {
        setCurrentProgress(0)
        setProgress(0)
      }
    } catch (error) {
      console.error("Error fetching participant data:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || !selectedChallenge) {
      toast({
        title: "Error",
        description: "Missing required information",
        variant: "destructive",
      })
      return
    }

    setUpdating(true)
    try {
      // Check if user is already a participant
      const { data: existingParticipant } = await supabase
        .from("challenge_participants")
        .select("id")
        .eq("challenge_id", selectedChallenge)
        .eq("user_id", user.id)
        .maybeSingle()

      if (existingParticipant) {
        // Update existing participant
        const { error } = await supabase
          .from("challenge_participants")
          .update({
            progress,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingParticipant.id)

        if (error) throw error
      } else {
        // Add new participant
        const { error } = await supabase.from("challenge_participants").insert({
          challenge_id: selectedChallenge,
          user_id: user.id,
          progress,
        })

        if (error) throw error
      }

      setCurrentProgress(progress)

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
      setUpdating(false)
    }
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Update Progress</CardTitle>
          <CardDescription>Please log in to update your challenge progress</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Update Progress</CardTitle>
          <CardDescription>Track your progress in active challenges</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
        <CardFooter>
          <Skeleton className="h-10 w-32" />
        </CardFooter>
      </Card>
    )
  }

  if (challenges.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Update Progress</CardTitle>
          <CardDescription>Track your progress in active challenges</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center py-4 text-muted-foreground">There are no active challenges at the moment.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Update Progress</CardTitle>
        <CardDescription>Track your progress in active challenges</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="challenge">Select Challenge</Label>
            <select
              id="challenge"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={selectedChallenge || ""}
              onChange={(e) => handleChallengeChange(e.target.value)}
            >
              {challenges.map((challenge) => (
                <option key={challenge.id} value={challenge.id}>
                  {challenge.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="progress">Your Progress</Label>
              <span className="text-sm text-muted-foreground">Current: {currentProgress}%</span>
            </div>
            <Slider
              id="progress"
              min={0}
              max={100}
              step={1}
              value={[progress]}
              onValueChange={(values) => setProgress(values[0])}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="progress-value">Progress Value</Label>
            <Input
              id="progress-value"
              type="number"
              min={0}
              max={100}
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={updating || progress === currentProgress}>
            {updating ? "Updating..." : "Update Progress"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
