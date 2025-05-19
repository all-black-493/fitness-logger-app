export type Profile = {
  id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export type FriendRequest = {
  id: string
  sender_id: string
  receiver_id: string
  status: "pending" | "accepted" | "rejected"
  created_at: string
  updated_at: string
  // Joined fields
  sender?: Profile
  receiver?: Profile
}

export type Friend = {
  id: string
  user_id: string
  friend_id: string
  created_at: string
  // Joined fields
  profile?: Profile
}
