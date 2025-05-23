import React from 'react'
import { ChallengeLeaderboard } from '@/components/challenges/challenge-leaderboard'
import { DashboardShell } from "@/components/dashboard/dashboard-shell"

const Leaderboard = () => {
  return (
    <DashboardShell>
      <ChallengeLeaderboard />
    </DashboardShell>
  )
}

export default Leaderboard
