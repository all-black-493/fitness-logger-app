import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { ProfileForm } from "@/components/auth/profile-form"

export default function ProfilePage() {
  return (
    <DashboardShell>
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
        <div className="border rounded-lg p-6">
          <ProfileForm />
        </div>
      </div>
    </DashboardShell>
  )
}
