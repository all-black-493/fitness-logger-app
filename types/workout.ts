export interface WorkoutSet {
  id?: string
  reps: number
  weight: number
  workout_exercise_id?: string
}

export interface WorkoutExercise {
  id?: string
  name: string
  workout_id?: string
  sets: WorkoutSet[]
}

export interface Workout {
  id?: string
  name: string
  notes?: string
  created_at?: string
  user_id?: string
  exercises: WorkoutExercise[]
}
