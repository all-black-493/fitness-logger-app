import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { CommunityDetail } from "@/components/communities/community-detail"
import { CommunityMembers } from "@/components/communities/community-members"
import { CommunityPosts } from "@/components/communities/community-posts"
import { CommunityEvents } from "@/components/communities/community-events"

export default function CommunityDetailPage({ params }: { params: { id: string } }) {
  return (
    <DashboardShell>
      <CommunityDetail id={params.id} />
      <div className="grid gap-6 mt-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <CommunityPosts id={params.id} />
        </div>
        <div className="space-y-6">
          <CommunityMembers id={params.id} />
          <CommunityEvents id={params.id} />
        </div>
      </div>
    </DashboardShell>
  )
}
