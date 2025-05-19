"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Medal } from "lucide-react"

interface CompetitionLeaderboardProps {
  id: string
}

export function CompetitionLeaderboard({ id }: CompetitionLeaderboardProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Mock leaderboard data
  const leaderboard = [
    {
      rank: 1,
      name: "Mike Smith",
      image: "/placeholder.svg?height=40&width=40",
      score: "225 lbs (1.3x BW)",
      isYou: false,
      change: "up",
    },
    {
      rank: 2,
      name: "You",
      image: "/placeholder.svg?height=40&width=40",
      score: "205 lbs (1.2x BW)",
      isYou: true,
      change: "same",
    },
    {
      rank: 3,
      name: "Sarah Johnson",
      image: "/placeholder.svg?height=40&width=40",
      score: "185 lbs (1.4x BW)",
      isYou: false,
      change: "up",
    },
    {
      rank: 4,
      name: "Alex Williams",
      image: "/placeholder.svg?height=40&width=40",
      score: "175 lbs (1.1x BW)",
      isYou: false,
      change: "down",
    },
    {
      rank: 5,
      name: "Jordan Lee",
      image: "/placeholder.svg?height=40&width=40",
      score: "165 lbs (1.0x BW)",
      isYou: false,
      change: "same",
    },
    {
      rank: 6,
      name: "Taylor Brown",
      image: "/placeholder.svg?height=40&width=40",
      score: "155 lbs (0.9x BW)",
      isYou: false,
      change: "up",
    },
    {
      rank: 7,
      name: "Chris Davis",
      image: "/placeholder.svg?height=40&width=40",
      score: "145 lbs (0.8x BW)",
      isYou: false,
      change: "down",
    },
    {
      rank: 8,
      name: "Jamie Wilson",
      image: "/placeholder.svg?height=40&width=40",
      score: "135 lbs (0.8x BW)",
      isYou: false,
      change: "same",
    },
  ]

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".leaderboard-item", {
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.05,
        ease: "power2.out",
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <Card ref={containerRef}>
      <CardHeader>
        <CardTitle>Leaderboard</CardTitle>
        <CardDescription>Current rankings for this challenge</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {leaderboard.map((entry) => (
            <div
              key={entry.rank}
              className={`leaderboard-item flex items-center justify-between p-3 rounded-lg ${
                entry.isYou
                  ? "bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900"
                  : "border"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 text-center font-bold">
                  {entry.rank === 1 ? (
                    <Medal className="h-5 w-5 text-yellow-500 mx-auto" />
                  ) : entry.rank === 2 ? (
                    <Medal className="h-5 w-5 text-gray-400 mx-auto" />
                  ) : entry.rank === 3 ? (
                    <Medal className="h-5 w-5 text-amber-600 mx-auto" />
                  ) : (
                    entry.rank
                  )}
                </div>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={entry.image || "/placeholder.svg"} alt={entry.name} />
                  <AvatarFallback>{entry.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium flex items-center">
                    {entry.name}
                    {entry.isYou && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        You
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">{entry.score}</div>
                </div>
              </div>
              <div
                className={`text-xs font-medium ${
                  entry.change === "up"
                    ? "text-emerald-500"
                    : entry.change === "down"
                      ? "text-red-500"
                      : "text-muted-foreground"
                }`}
              >
                {entry.change === "up" ? "↑ Improved" : entry.change === "down" ? "↓ Dropped" : "― No change"}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
