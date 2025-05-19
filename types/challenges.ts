export type Challenge = {
  id: string
  name: string
  description: string | null
  start_date: string
  end_date: string
  created_by: string
  created_at: string
  updated_at: string
}

export type ChallengeParticipant = {
  id: string
  challenge_id: string
  user_id: string
  progress: number
  created_at: string
  updated_at: string
  // Joined fields
  profile?: {
    username: string | null
    full_name: string | null
    avatar_url: string | null
  }
}

export type UpcomingChallenge = {
  id: string
  name: string
  description: string | null
  start_date: string
  created_by: string
  created_at: string
}
