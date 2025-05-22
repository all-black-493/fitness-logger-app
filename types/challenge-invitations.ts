export type ChallengeInvitation = {
  id: string
  challenge_id: string
  sender_id: string
  receiver_id: string
  status: "pending" | "accepted" | "dismissed"
  created_at: string
  updated_at: string
  challenge: {
    name: string
    description: string | null
  }
  sender?: {
    username: string | null
    full_name: string | null
    avatar_url: string | null
  }
  receiver?: {
    username: string | null
    full_name: string | null
    avatar_url: string | null
  }
}

export type Notification = {
  id: string
  user_id: string
  type: string
  content: string
  related_id: string | null
  is_read: boolean
  created_at: string
}
