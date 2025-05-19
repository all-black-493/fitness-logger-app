"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, TrendingUp, TrendingDown } from "lucide-react"
import Link from "next/link"

export function RecentExercises() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".recent-exercise-card", {
        x: -30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out",
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  const recentExercises = [
    {
      id: 1,
      name: "Bench Press",
      date: "Today",
      progress: "+5 lbs",
      trend: "up",
      sets: 4,
      image: "/placeholder.svg?height=80&width=80",
    },
    {
      id: 2,
      name: "Squats",
      date: "Yesterday",
      progress: "+10 lbs",
      trend: "up",
      sets: 5,
      image: "/placeholder.svg?height=80&width=80",
    },
    {
      id: 3,
      name: "Deadlift",
      date: "3 days ago",
      progress: "-5 lbs",
      trend: "down",
      sets: 3,
      image: "/placeholder.svg?height=80&width=80",
    },
    {
      id: 4,
      name: "Pull-ups",
      date: "5 days ago",
      progress: "+2 reps",
      trend: "up",
      sets: 4,
      image: "/placeholder.svg?height=80&width=80",
    },
    {
      id: 5,
      name: "Shoulder Press",
      date: "1 week ago",
      progress: "Same",
      trend: "neutral",
      sets: 3,
      image: "/placeholder.svg?height=80&width=80",
    },
  ]

  return (
    <Card ref={containerRef}>
      <CardHeader>
        <CardTitle>Recent Exercises</CardTitle>
        <CardDescription>Your recently performed exercises and progress</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="pb-4 -mx-2 px-2">
          <div className="flex gap-4">
            {recentExercises.map((exercise) => (
              <div key={exercise.id} className="flex-shrink-0">
                <div className="recent-exercise-card w-[280px] border rounded-lg overflow-hidden hover:border-emerald-500/50 transition-all duration-300">
                  <div className="h-32 bg-muted relative">
                    <img
                      src={exercise.image || "/placeholder.svg"}
                      alt={exercise.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{exercise.name}</h3>
                        <p className="text-sm text-muted-foreground">{exercise.date}</p>
                      </div>
                      <div
                        className={`flex items-center ${
                          exercise.trend === "up"
                            ? "text-emerald-500"
                            : exercise.trend === "down"
                              ? "text-red-500"
                              : "text-muted-foreground"
                        }`}
                      >
                        {exercise.trend === "up" ? (
                          <TrendingUp className="h-4 w-4 mr-1" />
                        ) : exercise.trend === "down" ? (
                          <TrendingDown className="h-4 w-4 mr-1" />
                        ) : null}
                        <span className="text-sm font-medium">{exercise.progress}</span>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">{exercise.sets} sets completed</div>
                    <Button variant="ghost" size="sm" className="mt-2 w-full" asChild>
                      <Link href={`/exercises/${exercise.id}`}>
                        <span>View Details</span>
                        <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
