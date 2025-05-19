import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { WorkoutTracker } from "@/components/dashboard/workout-tracker"
import { ChallengeCard } from "@/components/dashboard/challenge-card"
import { ProgressChart } from "@/components/dashboard/progress-chart"
// import { AiSuggestions } from "@/components/dashboard/ai-suggestions"

export default function DashboardPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Dashboard" text="Track your workouts, compete with friends, and improve your form." />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <WorkoutTracker className="lg:col-span-2" />
        <ChallengeCard />
      </div>
      <div className="grid gap-6 md:grid-cols-2 mt-6">
        <ProgressChart />
        {/* <AiSuggestions /> */}
      </div>
      {/* <div className="mt-6">
        <ExerciseLibrary />
      </div> */}
    </DashboardShell>
  )
}
