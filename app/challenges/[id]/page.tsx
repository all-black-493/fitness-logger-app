import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { CompetitionDetail } from "@/components/competitions/competition-detail"
import { CompetitionLeaderboard } from "@/components/competitions/competition-leaderboard"
import { CompetitionUpdates } from "@/components/competitions/competition-updates"
import { CompetitionSubmission } from "@/components/competitions/competition-submission"

interface CompetitionDetailPageProps {
  params: { id: string };
}

export default async function CompetitionDetailPage({
  params,
}: CompetitionDetailPageProps) {
  return (
    <DashboardShell>
      <CompetitionDetail id={params.id} />
      <div className="grid gap-6 mt-6 md:grid-cols-2">
        <CompetitionLeaderboard id={params.id} />
        <CompetitionUpdates id={params.id} />
      </div>
      <div className="mt-6">
        <CompetitionSubmission id={params.id} />
      </div>
    </DashboardShell>
  )
}