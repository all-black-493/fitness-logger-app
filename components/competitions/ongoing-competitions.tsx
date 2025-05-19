"use client"

import type React from "react"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, Trophy, Clock } from "lucide-react"
import Link from "next/link"

export function OngoingCompetitions() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".competition-card", {
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out",
      })

      // Animate progress bars
      gsap.from(".competition-progress", {
        width: 0,
        duration: 1.5,
        ease: "power2.out",
        stagger: 0.2,
        delay: 0.3,
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  const ongoingCompetitions = [
    {
      id: 1,
      title: "Weekly Bench Press Challenge",
      description: "Who can bench press the most weight relative to body weight?",
      endDate: "Ends in 3 days",
      participants: 8,
      exercise: "Bench Press",
      type: "Max Weight",
      participants_data: [
        { name: "You", progress: 85, image: "/placeholder.svg?height=40&width=40" },
        { name: "Mike", progress: 92, image: "/placeholder.svg?height=40&width=40" },
        { name: "Sarah", progress: 78, image: "/placeholder.svg?height=40&width=40" },
      ],
    },
    {
      id: 2,
      title: "30-Day Push-Up Challenge",
      description: "Complete 100 push-ups every day for 30 days",
      endDate: "Ends in 18 days",
      participants: 24,
      exercise: "Push-Ups",
      type: "Consistency",
      participants_data: [
        { name: "You", progress: 65, image: "/placeholder.svg?height=40&width=40" },
        { name: "Alex", progress: 72, image: "/placeholder.svg?height=40&width=40" },
        { name: "Jordan", progress: 88, image: "/placeholder.svg?height=40&width=40" },
      ],
    },
    {
      id: 3,
      title: "Squat PR Challenge",
      description: "Beat your personal record in squats by the end of the month",
      endDate: "Ends in 12 days",
      participants: 15,
      exercise: "Squats",
      type: "Personal Best",
      participants_data: [
        { name: "You", progress: 70, image: "/placeholder.svg?height=40&width=40" },
        { name: "Chris", progress: 65, image: "/placeholder.svg?height=40&width=40" },
        { name: "Taylor", progress: 80, image: "/placeholder.svg?height=40&width=40" },
      ],
    },
  ]

  return (
    <Card ref={containerRef}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Ongoing Challenges</CardTitle>
            <CardDescription>Competitions currently in progress</CardDescription>
          </div>
          <Badge className="bg-emerald-500 hover:bg-emerald-600">{ongoingCompetitions.length} Active</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {ongoingCompetitions.map((competition) => (
            <div
              key={competition.id}
              className="competition-card border rounded-lg p-4 hover:border-emerald-500/50 transition-all duration-300"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center">
                    <h3 className="font-medium">{competition.title}</h3>
                    <Badge variant="outline" className="ml-2 text-xs">
                      {competition.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{competition.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <div className="flex items-center">
                      <Trophy className="h-3.5 w-3.5 mr-1" />
                      <span>{competition.participants} participants</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      <span>{competition.endDate}</span>
                    </div>
                  </div>
                </div>
                <Button size="sm" className="md:self-start" asChild>
                  <Link href={`/competitions/${competition.id}`}>
                    <span>View Challenge</span>
                    <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>

              <div className="mt-4 space-y-3">
                <div className="text-sm font-medium">Top Performers</div>
                {competition.participants_data.map((participant, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={participant.image || "/placeholder.svg"} alt={participant.name} />
                          <AvatarFallback>{participant.name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{participant.name}</span>
                      </div>
                      <span className="text-xs font-medium">{participant.progress}%</span>
                    </div>
                    <Progress
                      className="competition-progress h-2"
                      value={participant.progress}
                      style={
                        {
                          "--progress-background": participant.name === "You" ? "hsl(var(--emerald-500))" : undefined,
                        } as React.CSSProperties
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
