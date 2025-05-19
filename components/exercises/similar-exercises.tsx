"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { ArrowUpRight } from "lucide-react"
import Link from "next/link"

interface SimilarExercisesProps {
  id: string
}

export function SimilarExercises({ id }: SimilarExercisesProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const similarExercises = [
    {
      id: 101,
      name: "Incline Bench Press",
      muscles: ["Upper Chest", "Shoulders", "Triceps"],
      image: "/placeholder.svg?height=150&width=150",
    },
    {
      id: 102,
      name: "Decline Bench Press",
      muscles: ["Lower Chest", "Triceps"],
      image: "/placeholder.svg?height=150&width=150",
    },
    {
      id: 103,
      name: "Dumbbell Bench Press",
      muscles: ["Chest", "Shoulders", "Triceps"],
      image: "/placeholder.svg?height=150&width=150",
    },
    {
      id: 104,
      name: "Close-Grip Bench Press",
      muscles: ["Triceps", "Chest"],
      image: "/placeholder.svg?height=150&width=150",
    },
    {
      id: 105,
      name: "Push-Ups",
      muscles: ["Chest", "Shoulders", "Triceps", "Core"],
      image: "/placeholder.svg?height=150&width=150",
    },
    {
      id: 106,
      name: "Chest Fly",
      muscles: ["Chest", "Shoulders"],
      image: "/placeholder.svg?height=150&width=150",
    },
  ]

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".similar-exercise-card", {
        x: -30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out",
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <Card ref={containerRef}>
      <CardHeader>
        <CardTitle>Similar Exercises</CardTitle>
        <CardDescription>Alternative exercises that target similar muscle groups</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="pb-4 -mx-2 px-2">
          <div className="flex gap-4">
            {similarExercises.map((exercise) => (
              <div key={exercise.id} className="flex-shrink-0">
                <div className="similar-exercise-card w-[220px] border rounded-lg overflow-hidden hover:border-emerald-500/50 transition-all duration-300">
                  <div className="h-40 bg-muted relative">
                    <img
                      src={exercise.image || "/placeholder.svg"}
                      alt={exercise.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-sm">{exercise.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {exercise.muscles.slice(0, 2).join(", ")}
                      {exercise.muscles.length > 2 && "..."}
                    </p>
                    <Button variant="ghost" size="sm" className="mt-2 w-full text-xs" asChild>
                      <Link href={`/exercises/${exercise.id}`}>
                        <span>View Details</span>
                        <ArrowUpRight className="ml-1 h-3 w-3" />
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
