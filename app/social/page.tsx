import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { FriendRequests } from "@/components/friends/friend-requests"
import { ChallengeForm } from "@/components/challenges/challenge-form"
import { UpdateProgress } from "@/components/challenges/update-progress"

export default function SocialPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Social" text="Connect with friends and participate in challenges." />
      <div className="grid gap-6 md:grid-cols-2">
        <FriendRequests />
        <div className="space-y-6">
          <UpdateProgress />
          <ChallengeForm />
        </div>
      </div>
    </DashboardShell>
  )
}
