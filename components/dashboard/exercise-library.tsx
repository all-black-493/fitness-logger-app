"use client"

import { useState, useEffect, useRef } from "react"
import { gsap } from "gsap"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Play, Info } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function ExerciseLibrary() {
  const [searchTerm, setSearchTerm] = useState("")
  const libraryRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".exercise-card", {
        scale: 0.9,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "power3.out",
      })
    }, libraryRef)

    return () => ctx.revert()
  }, [])

  // Mock exercise data
  const exercises = [
    { id: 1, name: "Bench Press", category: "chest", gifUrl: "/placeholder.svg?height=200&width=200" },
    { id: 2, name: "Squats", category: "legs", gifUrl: "/placeholder.svg?height=200&width=200" },
    { id: 3, name: "Deadlift", category: "back", gifUrl: "/placeholder.svg?height=200&width=200" },
    { id: 4, name: "Shoulder Press", category: "shoulders", gifUrl: "/placeholder.svg?height=200&width=200" },
    { id: 5, name: "Bicep Curls", category: "arms", gifUrl: "/placeholder.svg?height=200&width=200" },
    { id: 6, name: "Tricep Extensions", category: "arms", gifUrl: "/placeholder.svg?height=200&width=200" },
    { id: 7, name: "Pull-ups", category: "back", gifUrl: "/placeholder.svg?height=200&width=200" },
    { id: 8, name: "Leg Press", category: "legs", gifUrl: "/placeholder.svg?height=200&width=200" },
  ]

  const filteredExercises = exercises.filter(
    (exercise) =>
      exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <Card ref={libraryRef}>
      <CardHeader>
        <CardTitle>Exercise Library</CardTitle>
        <CardDescription>Browse exercises and learn proper form</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search exercises..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Tabs defaultValue="all">
          <TabsList className="grid grid-cols-6 mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="chest">Chest</TabsTrigger>
            <TabsTrigger value="back">Back</TabsTrigger>
            <TabsTrigger value="legs">Legs</TabsTrigger>
            <TabsTrigger value="shoulders">Shoulders</TabsTrigger>
            <TabsTrigger value="arms">Arms</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredExercises.map((exercise) => (
                <ExerciseCard key={exercise.id} exercise={exercise} />
              ))}
            </div>
          </TabsContent>

          {["chest", "back", "legs", "shoulders", "arms"].map((category) => (
            <TabsContent key={category} value={category} className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredExercises
                  .filter((ex) => ex.category === category)
                  .map((exercise) => (
                    <ExerciseCard key={exercise.id} exercise={exercise} />
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}

interface Exercise {
  id: number
  name: string
  category: string
  gifUrl: string
}

function ExerciseCard({ exercise }: { exercise: Exercise }) {
  return (
    <div className="exercise-card border rounded-lg overflow-hidden">
      <div className="relative h-40 bg-muted">
        <img src={exercise.gifUrl || "/placeholder.svg"} alt={exercise.name} className="w-full h-full object-cover" />
      </div>
      <div className="p-3">
        <h3 className="font-medium">{exercise.name}</h3>
        <p className="text-xs text-muted-foreground capitalize">{exercise.category}</p>
        <div className="flex gap-2 mt-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="w-full">
                <Info className="h-3.5 w-3.5 mr-1" />
                Details
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{exercise.name}</DialogTitle>
                <DialogDescription>Learn how to perform this exercise correctly</DialogDescription>
              </DialogHeader>
              <div className="flex flex-col space-y-4">
                <div className="aspect-video bg-muted rounded-md overflow-hidden">
                  <img
                    src={exercise.gifUrl || "/placeholder.svg"}
                    alt={exercise.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Instructions</h4>
                  <p className="text-sm text-muted-foreground">
                    Detailed instructions on how to perform the {exercise.name} with proper form. This would include
                    step-by-step guidance and tips to maximize effectiveness and prevent injury.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Video Tutorial</h4>
                  <Button variant="outline" className="w-full">
                    <Play className="h-4 w-4 mr-2" />
                    Watch on YouTube
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}
