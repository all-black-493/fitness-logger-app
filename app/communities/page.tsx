import { CommunitiesHeader } from "@/components/communities/communities-header"
import { CommunitiesList } from "@/components/communities/communities-list"
import { TrendingCommunities } from "@/components/communities/trending-communities"
import { YourCommunities } from "@/components/communities/your-communities"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"

export default function CommunitiesPage() {
  return (
    <DashboardShell>
      <CommunitiesHeader />
      <div className="grid gap-6 mt-6">
        <YourCommunities />
        <TrendingCommunities />
        <CommunitiesList />
      </div>
    </DashboardShell>
  )
}
