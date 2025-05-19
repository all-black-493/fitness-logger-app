"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, ArrowUpRight } from "lucide-react"
import Link from "next/link"

export function UpcomingCompetitions() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".upcoming-card", {
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out",
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  const upcomingCompetitions = [
    {
      id: 101,
      title: "Summer Shred Challenge",
      description: "30-day challenge to reduce body fat percentage",
      startDate: "Starts in 5 days",
      participants: 32,
      exercise: "Multiple",
      type: "Body Composition",
      joined: false,
    },
    {
      id: 102,
      title: "Pull-Up Marathon",
      description: "Who can do the most pull-ups in a single session?",
      startDate: "Starts in 1 week",
      participants: 18,
      exercise: "Pull-Ups",
      type: "Max Reps",
      joined: true,
    },
    {
      id: 103,
      title: "5K Running Challenge",
      description: "Improve your 5K time over the course of a month",
      startDate: "Starts in 2 weeks",
      participants: 45,
      exercise: "Running",
      type: "Time Trial",
      joined: false,
    },
    {
      id: 104,
      title: "Deadlift Showdown",
      description: "Competition for the highest deadlift relative to bodyweight",
      startDate: "Starts in 3 weeks",
      participants: 22,
      exercise: "Deadlift",
      type: "Max Weight",
      joined: true,
    },
  ]

  return (
    <Card ref={containerRef}>
      <CardHeader>
        <CardTitle>Upcoming Challenges</CardTitle>
        <CardDescription>Competitions starting soon</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {upcomingCompetitions.map((competition) => (
            <div
              key={competition.id}
              className="upcoming-card border rounded-lg p-4 hover:border-emerald-500/50 transition-all duration-300"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center">
                    <h3 className="font-medium">{competition.title}</h3>
                    <Badge variant="outline" className="ml-2 text-xs">
                      {competition.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{competition.description}</p>
                </div>
                {competition.joined && <Badge className="bg-emerald-500 hover:bg-emerald-600 shrink-0">Joined</Badge>}
              </div>

              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                <div className="flex items-center">
                  <Calendar className="h-3.5 w-3.5 mr-1" />
                  <span>{competition.startDate}</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-3.5 w-3.5 mr-1" />
                  <span>{competition.participants} participants</span>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Button
                  variant={competition.joined ? "outline" : "default"}
                  size="sm"
                  className={competition.joined ? "" : "bg-emerald-500 hover:bg-emerald-600"}
                >
                  {competition.joined ? "Leave Challenge" : "Join Challenge"}
                </Button>
                <Button variant="outline" size="sm" className="ml-auto" asChild>
                  <Link href={`/competitions/${competition.id}`}>
                    <span>Details</span>
                    <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
