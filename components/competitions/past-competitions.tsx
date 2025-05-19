"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Trophy, Medal, ArrowUpRight } from "lucide-react"
import Link from "next/link"

export function PastCompetitions() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".past-competition", {
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out",
      })
    }, containerRef)

    return () => ctx.revert()
  }, [showAll])

  const pastCompetitions = [
    {
      id: 201,
      title: "Spring Fitness Challenge",
      date: "Ended 2 weeks ago",
      participants: 42,
      exercise: "Multiple",
      type: "Overall Fitness",
      yourRank: 3,
      totalRanks: 42,
      winner: {
        name: "Alex Johnson",
        image: "/placeholder.svg?height=40&width=40",
      },
    },
    {
      id: 202,
      title: "Max Push-Up Challenge",
      date: "Ended 1 month ago",
      participants: 28,
      exercise: "Push-Ups",
      type: "Max Reps",
      yourRank: 5,
      totalRanks: 28,
      winner: {
        name: "Mike Smith",
        image: "/placeholder.svg?height=40&width=40",
      },
    },
    {
      id: 203,
      title: "Plank Endurance Test",
      date: "Ended 2 months ago",
      participants: 35,
      exercise: "Plank",
      type: "Time Challenge",
      yourRank: 1,
      totalRanks: 35,
      winner: {
        name: "You",
        image: "/placeholder.svg?height=40&width=40",
      },
    },
    {
      id: 204,
      title: "Winter Weightlifting Competition",
      date: "Ended 3 months ago",
      participants: 22,
      exercise: "Multiple",
      type: "Strength",
      yourRank: 7,
      totalRanks: 22,
      winner: {
        name: "Sarah Williams",
        image: "/placeholder.svg?height=40&width=40",
      },
    },
    {
      id: 205,
      title: "Holiday Fitness Challenge",
      date: "Ended 4 months ago",
      participants: 50,
      exercise: "Multiple",
      type: "Overall Fitness",
      yourRank: 12,
      totalRanks: 50,
      winner: {
        name: "Chris Taylor",
        image: "/placeholder.svg?height=40&width=40",
      },
    },
    {
      id: 206,
      title: "Fall Running Challenge",
      date: "Ended 5 months ago",
      participants: 38,
      exercise: "Running",
      type: "Distance",
      yourRank: 2,
      totalRanks: 38,
      winner: {
        name: "Jordan Lee",
        image: "/placeholder.svg?height=40&width=40",
      },
    },
  ]

  const displayedCompetitions = showAll ? pastCompetitions : pastCompetitions.slice(0, 3)

  return (
    <Card ref={containerRef}>
      <CardHeader>
        <CardTitle>Past Challenges</CardTitle>
        <CardDescription>Previous competitions and results</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayedCompetitions.map((competition) => (
            <div
              key={competition.id}
              className="past-competition flex flex-col sm:flex-row sm:items-center justify-between gap-4 border rounded-lg p-4 hover:border-emerald-500/50 transition-all duration-300"
            >
              <div>
                <div className="flex items-center">
                  <h3 className="font-medium">{competition.title}</h3>
                  <Badge variant="outline" className="ml-2 text-xs">
                    {competition.type}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <div className="flex items-center">
                    <Calendar className="h-3.5 w-3.5 mr-1" />
                    <span>{competition.date}</span>
                  </div>
                  <div className="flex items-center">
                    <Trophy className="h-3.5 w-3.5 mr-1" />
                    <span>{competition.participants} participants</span>
                  </div>
                </div>
                <div className="flex items-center mt-3">
                  <div className="text-sm">Winner:</div>
                  <div className="flex items-center ml-2">
                    <Avatar className="h-6 w-6 mr-1">
                      <AvatarImage src={competition.winner.image || "/placeholder.svg"} alt={competition.winner.name} />
                      <AvatarFallback>{competition.winner.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{competition.winner.name}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:items-end gap-2">
                <div className="flex items-center">
                  <Medal
                    className={`h-5 w-5 mr-1 ${
                      competition.yourRank === 1
                        ? "text-yellow-500"
                        : competition.yourRank === 2
                          ? "text-gray-400"
                          : competition.yourRank === 3
                            ? "text-amber-600"
                            : "text-muted-foreground"
                    }`}
                  />
                  <span className="text-sm font-medium">
                    Your Rank: {competition.yourRank}/{competition.totalRanks}
                  </span>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/competitions/${competition.id}`}>
                    <span>View Results</span>
                    <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>

        {pastCompetitions.length > 3 && (
          <Button variant="outline" className="w-full mt-4" onClick={() => setShowAll(!showAll)}>
            {showAll ? "Show Less" : `Show ${pastCompetitions.length - 3} More`}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
