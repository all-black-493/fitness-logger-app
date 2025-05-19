import { CompetitionsHeader } from "@/components/competitions/competitions-header"
import { OngoingCompetitions } from "@/components/competitions/ongoing-competitions"
import { UpcomingCompetitions } from "@/components/competitions/upcoming-competitions"
import { PastCompetitions } from "@/components/competitions/past-competitions"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"

export default function CompetitionsPage() {
  return (
    <DashboardShell>
      <CompetitionsHeader />
      <div className="grid gap-6 mt-6">
        <OngoingCompetitions />
        <UpcomingCompetitions />
        <PastCompetitions />
      </div>
    </DashboardShell>
  )
}
