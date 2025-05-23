"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Trash2, Calendar, Dumbbell, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import type { Workout } from "@/types/workout"
import { format } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"

interface WorkoutTrackerProps {
  className?: string
}

export function WorkoutTracker({ className }: WorkoutTrackerProps) {
  const { user } = useAuth()
  const [exercises, setExercises] = useState<
    Array<{
      id: number
      name: string
      sets: Array<{ reps: number; weight: number }>
    }>
  >([])
  const [newExercise, setNewExercise] = useState("")
  const [workoutName, setWorkoutName] = useState("My Workout")
  const [workoutNotes, setWorkoutNotes] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [workoutHistory, setWorkoutHistory] = useState<Workout[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [activeTab, setActiveTab] = useState("current")
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null)

  useEffect(() => {
    if (user && activeTab === "history") {
      fetchWorkoutHistory()
    }
  }, [user, activeTab])

  const fetchWorkoutHistory = async () => {
    if (!user) return

    setIsLoadingHistory(true)
    const supabase = getSupabaseBrowserClient()

    try {
      const { data: workouts, error: workoutsError } = await supabase
        .from("workouts")
        .select("*")
        .order("created_at", { ascending: false })

      if (workoutsError) throw workoutsError

      const workoutsWithExercises = await Promise.all(
        workouts.map(async (workout) => {
          const { data: exercises, error: exercisesError } = await supabase
            .from("workout_exercises")
            .select("*")
            .eq("workout_id", workout.id)

          if (exercisesError) throw exercisesError

          const exercisesWithSets = await Promise.all(
            exercises.map(async (exercise) => {
              const { data: sets, error: setsError } = await supabase
                .from("workout_sets")
                .select("*")
                .eq("workout_exercise_id", exercise.id)

              if (setsError) throw setsError

              return {
                ...exercise,
                sets,
              }
            }),
          )

          return {
            ...workout,
            exercises: exercisesWithSets,
          }
        }),
      )

      setWorkoutHistory(workoutsWithExercises)
    } catch (error) {
      console.error("Error fetching workout history:", error)
      toast({
        title: "Error",
        description: "Failed to load workout history. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingHistory(false)
    }
  }

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

  const saveWorkout = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to save your workout.",
        variant: "destructive",
      })
      return
    }

    if (exercises.length === 0) {
      toast({
        title: "No exercises",
        description: "Please add at least one exercise to your workout.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    const supabase = getSupabaseBrowserClient()

    try {
      const { data: workout, error: workoutError } = await supabase
        .from("workouts")
        .insert({
          user_id: user.id,
          name: workoutName,
          notes: workoutNotes,
        })
        .select()
        .single()

      if (workoutError) throw workoutError

      for (const exercise of exercises) {
        const { data: workoutExercise, error: exerciseError } = await supabase
          .from("workout_exercises")
          .insert({
            workout_id: workout.id,
            name: exercise.name,
          })
          .select()
          .single()

        if (exerciseError) throw exerciseError

        const setsToInsert = exercise.sets.map((set) => ({
          workout_exercise_id: workoutExercise.id,
          reps: set.reps,
          weight: set.weight,
        }))

        const { error: setsError } = await supabase.from("workout_sets").insert(setsToInsert)

        if (setsError) throw setsError
      }

      toast({
        title: "Workout saved",
        description: "Your workout has been saved successfully.",
      })

      setExercises([])
      setWorkoutName("My Workout")
      setWorkoutNotes("")

      if (activeTab === "history") {
        fetchWorkoutHistory()
      }
    } catch (error) {
      console.error("Error saving workout:", error)
      toast({
        title: "Error",
        description: "Failed to save workout. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const viewWorkoutDetails = (workout: Workout) => {
    setSelectedWorkout(workout)
  }

  const closeWorkoutDetails = () => {
    setSelectedWorkout(null)
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy 'at' h:mm a")
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle>Workout Tracker</CardTitle>
        <CardDescription>Log your exercises, sets, reps, and weights</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="current" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="current">Current Workout</TabsTrigger>
            <TabsTrigger value="history" onClick={fetchWorkoutHistory}>
              Workout History
            </TabsTrigger>
          </TabsList>
          <TabsContent value="current" className="space-y-4 pt-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="workout-name">Workout Name</Label>
                <Input
                  id="workout-name"
                  value={workoutName}
                  onChange={(e) => setWorkoutName(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="workout-notes">Notes (optional)</Label>
                <Input
                  id="workout-notes"
                  value={workoutNotes}
                  onChange={(e) => setWorkoutNotes(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-end gap-2">
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
              <Button onClick={addExercise} size="icon" className="mt-2 sm:mt-0">
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
            {isLoadingHistory ? (
              <div className="space-y-4 py-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : selectedWorkout ? (
              <div className="py-4 space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold">{selectedWorkout.name}</h3>
                  <Button variant="outline" onClick={closeWorkoutDetails}>
                    Back to History
                  </Button>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{selectedWorkout.created_at && formatDate(selectedWorkout.created_at)}</span>
                </div>

                {selectedWorkout.notes && (
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-sm">{selectedWorkout.notes}</p>
                  </div>
                )}

                <div className="space-y-4">
                  {selectedWorkout.exercises.map((exercise) => (
                    <div key={exercise.id} className="border rounded-lg p-4">
                      <h4 className="font-medium text-lg mb-3">{exercise.name}</h4>

                      <div className="space-y-3">
                        <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground">
                          <div className="col-span-1">#</div>
                          <div className="col-span-5">Reps</div>
                          <div className="col-span-6">Weight (kgs)</div>
                        </div>

                        {exercise.sets.map((set, index) => (
                          <div key={set.id} className="grid grid-cols-12 gap-2 items-center">
                            <div className="col-span-1 text-sm font-medium">{index + 1}</div>
                            <div className="col-span-5 text-sm">{set.reps}</div>
                            <div className="col-span-6 text-sm">{set.weight}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : workoutHistory.length > 0 ? (
              <div className="py-4 space-y-4">
                {workoutHistory.map((workout) => (
                  <div
                    key={workout.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => viewWorkoutDetails(workout)}
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">{workout.name}</h3>
                      <span className="text-sm text-muted-foreground">
                        {workout.created_at && formatDate(workout.created_at)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Dumbbell className="h-4 w-4" />
                        <span>{workout.exercises.length} exercises</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>
                          {workout.exercises.reduce((total, exercise) => total + exercise.sets.length, 0)} sets
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-muted-foreground">
                <p>You haven't logged any workouts yet.</p>
                <p className="mt-2">Start tracking your progress by saving a workout!</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        {activeTab === "current" && (
          <Button
            className="w-full bg-emerald-500 hover:bg-emerald-600"
            onClick={saveWorkout}
            disabled={isSaving || exercises.length === 0}
          >
            {isSaving ? "Saving..." : "Save Workout"}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
