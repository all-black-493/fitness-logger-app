import { ExercisesHeader } from "@/components/exercises/exercises-header"
import { ExerciseCategories } from "@/components/exercises/exercise-categories"
import { ExercisesList } from "@/components/exercises/exercises-list"
import { RecentExercises } from "@/components/exercises/recent-exercises"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"

export default function ExercisesPage() {
  return (
    <DashboardShell>
      <ExercisesHeader />
      <div className="grid gap-6 mt-6">
        <RecentExercises />
        <ExerciseCategories />
        <ExercisesList />
      </div>
    </DashboardShell>
  )
}
