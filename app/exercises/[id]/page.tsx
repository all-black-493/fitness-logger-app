import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { ExerciseDetail } from "@/components/exercises/exercise-detail"
import { ExerciseHistory } from "@/components/exercises/exercise-history"
import { ExerciseVideos } from "@/components/exercises/exercise-videos"
import { SimilarExercises } from "@/components/exercises/similar-exercises"

export default function ExerciseDetailPage({ params }: { params: { id: string } }) {
  return (
    <DashboardShell>
      <ExerciseDetail id={params.id} />
      <div className="grid gap-6 mt-6 md:grid-cols-2">
        <ExerciseHistory id={params.id} />
        <ExerciseVideos id={params.id} />
      </div>
      <div className="mt-6">
        <SimilarExercises id={params.id} />
      </div>
    </DashboardShell>
  )
}
