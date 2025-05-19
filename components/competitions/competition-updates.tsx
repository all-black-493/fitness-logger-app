"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"

interface CompetitionUpdatesProps {
  id: string
}

export function CompetitionUpdates({ id }: CompetitionUpdatesProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Mock updates data
  const updates = [
    {
      id: 1,
      type: "joined",
      user: {
        name: "Chris Davis",
        image: "/placeholder.svg?height=40&width=40",
      },
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    },
    {
      id: 2,
      type: "submission",
      user: {
        name: "Sarah Johnson",
        image: "/placeholder.svg?height=40&width=40",
      },
      score: "185 lbs (1.4x BW)",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    },
    {
      id: 3,
      type: "submission",
      user: {
        name: "You",
        image: "/placeholder.svg?height=40&width=40",
      },
      score: "205 lbs (1.2x BW)",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    },
    {
      id: 4,
      type: "submission",
      user: {
        name: "Mike Smith",
        image: "/placeholder.svg?height=40&width=40",
      },
      score: "225 lbs (1.3x BW)",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
    },
    {
      id: 5,
      type: "announcement",
      title: "Challenge Started",
      content: "The Weekly Bench Press Challenge has officially begun! Good luck to all participants.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    },
  ]

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".update-item", {
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out",
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <Card ref={containerRef}>
      <CardHeader>
        <CardTitle>Recent Updates</CardTitle>
        <CardDescription>Activity and announcements for this challenge</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {updates.map((update) => (
            <div key={update.id} className="update-item border-b pb-4 last:border-0 last:pb-0">
              {update.type === "joined" && (
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={update.user.image || "/placeholder.svg"} alt={update.user.name} />
                    <AvatarFallback>{update.user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {update.user.name === "You" ? "You" : update.user.name} joined the challenge
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(update.timestamp, { addSuffix: true })}
                    </div>
                  </div>
                </div>
              )}

              {update.type === "submission" && (
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={update.user.image || "/placeholder.svg"} alt={update.user.name} />
                    <AvatarFallback>{update.user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {update.user.name === "You" ? "You" : update.user.name} submitted a new entry
                      {update.user.name === "You" && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          You
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm mt-1">{update.score}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(update.timestamp, { addSuffix: true })}
                    </div>
                  </div>
                </div>
              )}

              {update.type === "announcement" && (
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                      <line x1="12" y1="9" x2="12" y2="13"></line>
                      <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium">{update.title}</div>
                    <div className="text-sm mt-1">{update.content}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(update.timestamp, { addSuffix: true })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
