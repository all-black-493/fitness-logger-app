"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface WorkoutTrackerProps {
  className?: string
}

export function WorkoutTracker({ className }: WorkoutTrackerProps) {
  const [exercises, setExercises] = useState([
    {
      id: 1,
      name: "Bench Press",
      sets: [
        { reps: 10, weight: 135 },
        { reps: 8, weight: 155 },
      ],
    },
    {
      id: 2,
      name: "Squats",
      sets: [
        { reps: 12, weight: 185 },
        { reps: 10, weight: 205 },
      ],
    },
  ])

  const [newExercise, setNewExercise] = useState("")

  const addExercise = () => {
    if (newExercise.trim()) {
      setExercises([...exercises, { id: Date.now(), name: newExercise, sets: [{ reps: 0, weight: 0 }] }])
      setNewExercise("")
    }
  }

  const addSet = (exerciseId: number) => {
    setExercises(
      exercises.map((ex) => (ex.id === exerciseId ? { ...ex, sets: [...ex.sets, { reps: 0, weight: 0 }] } : ex)),
    )
  }

  const updateSet = (exerciseId: number, setIndex: number, field: "reps" | "weight", value: number) => {
    setExercises(
      exercises.map((ex) =>
        ex.id === exerciseId
          ? {
              ...ex,
              sets: ex.sets.map((set, idx) => (idx === setIndex ? { ...set, [field]: value } : set)),
            }
          : ex,
      ),
    )
  }

  const removeExercise = (exerciseId: number) => {
    setExercises(exercises.filter((ex) => ex.id !== exerciseId))
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle>Workout Tracker</CardTitle>
        <CardDescription>Log your exercises, sets, reps, and weights</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="current">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="current">Current Workout</TabsTrigger>
            <TabsTrigger value="history">Workout History</TabsTrigger>
          </TabsList>
          <TabsContent value="current" className="space-y-4 pt-4">
            <div className="flex items-end gap-2">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="exercise">Add Exercise</Label>
                <Input
                  id="exercise"
                  placeholder="Exercise name"
                  value={newExercise}
                  onChange={(e) => setNewExercise(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addExercise()}
                />
              </div>
              <Button onClick={addExercise} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4 mt-6">
              {exercises.map((exercise) => (
                <div key={exercise.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium text-lg">{exercise.name}</h3>
                    <Button variant="ghost" size="icon" onClick={() => removeExercise(exercise.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground">
                      <div className="col-span-1">#</div>
                      <div className="col-span-5">Reps</div>
                      <div className="col-span-6">Weight (kgs)</div>
                    </div>

                    {exercise.sets.map((set, setIndex) => (
                      <div key={setIndex} className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-1 text-sm font-medium">{setIndex + 1}</div>
                        <div className="col-span-5">
                          <Input
                            type="number"
                            value={set.reps}
                            onChange={(e) =>
                              updateSet(exercise.id, setIndex, "reps", Number.parseInt(e.target.value) || 0)
                            }
                          />
                        </div>
                        <div className="col-span-6">
                          <Input
                            type="number"
                            value={set.weight}
                            onChange={(e) =>
                              updateSet(exercise.id, setIndex, "weight", Number.parseInt(e.target.value) || 0)
                            }
                          />
                        </div>
                      </div>
                    ))}

                    <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => addSet(exercise.id)}>
                      Add Set
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="history">
            <div className="py-6 text-center text-muted-foreground">Your previous workouts will appear here</div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button className="w-full bg-emerald-500 hover:bg-emerald-600">Save Workout</Button>
      </CardFooter>
    </Card>
  )
}
