"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, Star, Clock, Flame, BarChart3 } from "lucide-react"
import Link from "next/link"

export function ExercisesList() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".exercise-list-item", {
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out",
      })
    }, containerRef)

    return () => ctx.revert()
  }, [activeTab])

  const allExercises = [
    {
      id: 1,
      name: "Barbell Bench Press",
      category: "strength",
      difficulty: "Intermediate",
      duration: "10-15 min",
      calories: "8-12 per rep",
      muscles: ["Chest", "Triceps", "Shoulders"],
      image: "/placeholder.svg?height=80&width=80",
      favorite: true,
    },
    {
      id: 2,
      name: "Squats",
      category: "strength",
      difficulty: "Intermediate",
      duration: "10-15 min",
      calories: "8-12 per rep",
      muscles: ["Quadriceps", "Glutes", "Hamstrings"],
      image: "/placeholder.svg?height=80&width=80",
      favorite: true,
    },
    {
      id: 3,
      name: "Deadlift",
      category: "strength",
      difficulty: "Advanced",
      duration: "10-15 min",
      calories: "10-15 per rep",
      muscles: ["Back", "Glutes", "Hamstrings"],
      image: "/placeholder.svg?height=80&width=80",
      favorite: false,
    },
    {
      id: 4,
      name: "Pull-ups",
      category: "strength",
      difficulty: "Intermediate",
      duration: "5-10 min",
      calories: "5-8 per rep",
      muscles: ["Back", "Biceps", "Shoulders"],
      image: "/placeholder.svg?height=80&width=80",
      favorite: false,
    },
    {
      id: 5,
      name: "Treadmill Running",
      category: "cardio",
      difficulty: "Beginner",
      duration: "20-30 min",
      calories: "300-400 total",
      muscles: ["Legs", "Core", "Cardiovascular"],
      image: "/placeholder.svg?height=80&width=80",
      favorite: false,
    },
    {
      id: 6,
      name: "Cycling",
      category: "cardio",
      difficulty: "Beginner",
      duration: "30-45 min",
      calories: "400-600 total",
      muscles: ["Legs", "Core", "Cardiovascular"],
      image: "/placeholder.svg?height=80&width=80",
      favorite: true,
    },
    {
      id: 7,
      name: "Yoga Flow",
      category: "flexibility",
      difficulty: "All Levels",
      duration: "30-60 min",
      calories: "150-300 total",
      muscles: ["Full Body", "Core", "Balance"],
      image: "/placeholder.svg?height=80&width=80",
      favorite: false,
    },
    {
      id: 8,
      name: "HIIT Circuit",
      category: "cardio",
      difficulty: "Advanced",
      duration: "20-30 min",
      calories: "300-500 total",
      muscles: ["Full Body", "Cardiovascular"],
      image: "/placeholder.svg?height=80&width=80",
      favorite: true,
    },
  ]

  const filteredExercises =
    activeTab === "all" ? allExercises : allExercises.filter((exercise) => exercise.category === activeTab)

  return (
    <Card ref={containerRef}>
      <CardHeader>
        <CardTitle>Exercise Library</CardTitle>
        <CardDescription>Browse and track your favorite exercises</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="strength">Strength</TabsTrigger>
            <TabsTrigger value="cardio">Cardio</TabsTrigger>
            <TabsTrigger value="flexibility">Flexibility</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0 space-y-4">
            {filteredExercises.map((exercise) => (
              <div
                key={exercise.id}
                className="exercise-list-item flex flex-col sm:flex-row sm:items-center justify-between border rounded-lg overflow-hidden hover:border-emerald-500/50 transition-all duration-300"
              >
                <div className="flex items-center">
                  <div className="w-24 h-24 bg-muted shrink-0">
                    <img
                      src={exercise.image || "/placeholder.svg"}
                      alt={exercise.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center">
                      <h3 className="font-medium">{exercise.name}</h3>
                      {exercise.favorite && <Star className="h-4 w-4 text-yellow-400 ml-2 fill-yellow-400" />}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {exercise.muscles.map((muscle, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {muscle}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-4 mt-3 text-xs text-muted-foreground">
                      <div className="flex items-center">
                        <BarChart3 className="h-3.5 w-3.5 mr-1" />
                        <span>{exercise.difficulty}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3.5 w-3.5 mr-1" />
                        <span>{exercise.duration}</span>
                      </div>
                      <div className="flex items-center">
                        <Flame className="h-3.5 w-3.5 mr-1" />
                        <span>{exercise.calories}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4 sm:pr-6 flex sm:flex-col gap-2 sm:items-end">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/exercises/${exercise.id}`}>
                      <span>Details</span>
                      <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                  <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600">
                    Log Exercise
                  </Button>
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
