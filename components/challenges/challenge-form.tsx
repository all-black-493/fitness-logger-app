"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export function ChallengeForm() {
  const { user } = useAuth()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [startDate, setStartDate] = useState<Date | undefined>(new Date())
  const [endDate, setEndDate] = useState<Date | undefined>(new Date(new Date().setDate(new Date().getDate() + 7)))
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const supabase = getSupabaseBrowserClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || !name || !startDate || !endDate) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    if (endDate < startDate) {
      toast({
        title: "Invalid dates",
        description: "End date must be after start date",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const now = new Date()
      const isUpcoming = startDate > now

      if (isUpcoming) {
        const { error } = await supabase.from("upcoming_challenges").insert({
          name,
          description,
          start_date: startDate.toISOString(),
          created_by: user.id,
        })

        if (error) throw error
      } else {
        const { data, error } = await supabase
          .from("challenges")
          .insert({
            name,
            description,
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
            created_by: user.id,
          })
          .select()

        if (error) throw error

        if (data && data[0]) {
          await supabase.from("challenge_participants").insert({
            challenge_id: data[0].id,
            user_id: user.id,
            progress: 0,
          })
        }
      }

      toast({
        title: "Challenge created",
        description: isUpcoming
          ? "Your upcoming challenge has been scheduled"
          : "Your challenge has been created and is now active",
      })

      // Reset form
      setName("")
      setDescription("")
      setStartDate(new Date())
      setEndDate(new Date(new Date().setDate(new Date().getDate() + 7)))
    } catch (error) {
      console.error("Error creating challenge:", error)
      toast({
        title: "Error",
        description: "Failed to create challenge",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Create Challenge</CardTitle>
          <CardDescription>Please log in to create challenges</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Challenge</CardTitle>
        <CardDescription>Create a new fitness challenge for you and your friends</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Challenge Name</Label>
            <Input
              id="name"
              placeholder="e.g., Bench Press Max Reps"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the challenge rules and goals"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    disabled={(date) => date < new Date() || (startDate ? date < startDate : false)}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Challenge"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
