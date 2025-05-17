"use client"

import type React from "react"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"

export function CompetitionCard() {
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
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
  }, [])

  const competitors = [
    { name: "You", progress: 85, image: "/placeholder.svg?height=40&width=40" },
    { name: "Mike", progress: 99, image: "/placeholder.svg?height=40&width=40" },
    { name: "Sarah", progress: 78, image: "/placeholder.svg?height=40&width=40" },
    { name: "Alex", progress: 65, image: "/placeholder.svg?height=40&width=40" },
  ]

  return (
    <Card ref={cardRef}>
      <CardHeader>
        <CardTitle>Weekly Challenge</CardTitle>
        <CardDescription>Bench Press Max Reps (135 lbs)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {competitors.map((competitor, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Avatar className="competition-avatar h-8 w-8">
                    <AvatarImage src={competitor.image || "/placeholder.svg"} alt={competitor.name} />
                    <AvatarFallback>{competitor.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{competitor.name}</span>
                </div>
                <span className="text-sm font-bold">{competitor.progress}%</span>
              </div>
              <Progress
                className="competition-progress h-2"
                value={competitor.progress}
                style={
                  {
                    "--progress-background": index === 0 ? "hsl(var(--emerald-500))" : undefined,
                  } as React.CSSProperties
                }
              />
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t">
          <h4 className="font-semibold mb-2">Upcoming Challenges</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between">
              <span>Squat Challenge</span>
              <span className="text-muted-foreground">Starts in 3 days</span>
            </li>
            <li className="flex justify-between">
              <span>Pull-up Marathon</span>
              <span className="text-muted-foreground">Starts in 7 days</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
