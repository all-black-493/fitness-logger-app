"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Star, Clock, Flame, BarChart3, Share2, Play } from "lucide-react"
import Link from "next/link"

interface ExerciseDetailProps {
  id: string
}

export function ExerciseDetail({ id }: ExerciseDetailProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Mock data for the exercise
  const exercise = {
    id: Number.parseInt(id),
    name: "Barbell Bench Press",
    category: "strength",
    difficulty: "Intermediate",
    duration: "10-15 min",
    calories: "8-12 per rep",
    muscles: ["Chest", "Triceps", "Shoulders"],
    image: "/placeholder.svg?height=400&width=600",
    favorite: true,
    description:
      "The bench press is a compound exercise that develops the chest, shoulders, and triceps. It involves lying on a bench and pressing weight upward using either a barbell or dumbbells.",
    instructions: [
      "Lie on a flat bench with your feet flat on the floor.",
      "Grip the barbell with hands slightly wider than shoulder-width apart.",
      "Unrack the barbell and lower it to your mid-chest.",
      "Press the barbell back up to the starting position, fully extending your arms.",
      "Repeat for the desired number of repetitions.",
    ],
    tips: [
      "Keep your wrists straight and elbows at a 45-degree angle from your body.",
      "Maintain a slight arch in your lower back.",
      "Keep your feet flat on the floor for stability.",
      "Control the weight throughout the entire movement.",
    ],
    variations: ["Incline Bench Press", "Decline Bench Press", "Close-Grip Bench Press", "Dumbbell Bench Press"],
  }

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate the main content
      gsap.from(".exercise-detail-content", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      })

      // Animate the image
      gsap.from(".exercise-image", {
        x: 50,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
      })

      // Animate the instructions
      gsap.from(".instruction-item", {
        x: -20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out",
        delay: 0.3,
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={containerRef}>
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/exercises">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Exercises
          </Link>
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600">
            Log Exercise
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="exercise-image rounded-lg overflow-hidden border">
          <img src={exercise.image || "/placeholder.svg"} alt={exercise.name} className="w-full h-auto object-cover" />
        </div>

        <div className="exercise-detail-content">
          <div className="flex items-center mb-2">
            <h1 className="text-3xl font-bold">{exercise.name}</h1>
            {exercise.favorite && <Star className="h-5 w-5 text-yellow-400 ml-2 fill-yellow-400" />}
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {exercise.muscles.map((muscle, index) => (
              <Badge key={index} className="bg-emerald-500 hover:bg-emerald-600">
                {muscle}
              </Badge>
            ))}
          </div>

          <div className="flex flex-wrap gap-6 mb-6 text-sm">
            <div className="flex items-center">
              <BarChart3 className="h-4 w-4 mr-1 text-muted-foreground" />
              <span>
                <span className="font-medium">Difficulty:</span> {exercise.difficulty}
              </span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
              <span>
                <span className="font-medium">Duration:</span> {exercise.duration}
              </span>
            </div>
            <div className="flex items-center">
              <Flame className="h-4 w-4 mr-1 text-muted-foreground" />
              <span>
                <span className="font-medium">Calories:</span> {exercise.calories}
              </span>
            </div>
          </div>

          <p className="text-muted-foreground mb-6">{exercise.description}</p>

          <Card>
            <CardContent className="p-0">
              <Tabs defaultValue="instructions">
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="instructions">Instructions</TabsTrigger>
                  <TabsTrigger value="tips">Tips</TabsTrigger>
                  <TabsTrigger value="variations">Variations</TabsTrigger>
                </TabsList>
                <div className="p-4">
                  <TabsContent value="instructions" className="mt-0">
                    <ol className="space-y-2">
                      {exercise.instructions.map((instruction, index) => (
                        <li key={index} className="instruction-item flex gap-2">
                          <span className="font-bold text-emerald-500">{index + 1}.</span>
                          <span>{instruction}</span>
                        </li>
                      ))}
                    </ol>
                  </TabsContent>
                  <TabsContent value="tips" className="mt-0">
                    <ul className="space-y-2">
                      {exercise.tips.map((tip, index) => (
                        <li key={index} className="instruction-item flex gap-2">
                          <span className="text-emerald-500">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </TabsContent>
                  <TabsContent value="variations" className="mt-0">
                    <ul className="space-y-2">
                      {exercise.variations.map((variation, index) => (
                        <li key={index} className="instruction-item flex gap-2">
                          <span className="text-emerald-500">•</span>
                          <span>{variation}</span>
                        </li>
                      ))}
                    </ul>
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </Card>

          <div className="mt-6">
            <Button className="w-full bg-emerald-500 hover:bg-emerald-600">
              <Play className="mr-2 h-4 w-4" />
              Watch Tutorial Video
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
