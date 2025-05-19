-- Create profiles table if it doesn't exist (for user profiles)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create friend_requests table
CREATE TABLE IF NOT EXISTS friend_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(sender_id, receiver_id)
);

-- Create challenges table
CREATE TABLE IF NOT EXISTS challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create challenge_participants table
CREATE TABLE IF NOT EXISTS challenge_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  progress NUMERIC(5, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(challenge_id, user_id)
);

-- Create upcoming_challenges table
CREATE TABLE IF NOT EXISTS upcoming_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE upcoming_challenges ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policies for friend_requests
CREATE POLICY "Users can view their own friend requests" ON friend_requests
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can insert their own friend requests" ON friend_requests
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update friend requests they received" ON friend_requests
  FOR UPDATE USING (auth.uid() = receiver_id);

-- Policies for challenges
CREATE POLICY "Users can view challenges they created or participate in" ON challenges
  FOR SELECT USING (
    auth.uid() = created_by OR 
    EXISTS (SELECT 1 FROM challenge_participants WHERE challenge_id = challenges.id AND user_id = auth.uid())
  );

CREATE POLICY "Users can insert their own challenges" ON challenges
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update challenges they created" ON challenges
  FOR UPDATE USING (auth.uid() = created_by);

-- Policies for challenge_participants
CREATE POLICY "Users can view their own participation" ON challenge_participants
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view participants in their challenges" ON challenge_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM challenges 
      WHERE id = challenge_participants.challenge_id AND created_by = auth.uid()
    )
  );

CREATE POLICY "Users can insert themselves as participants" ON challenge_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" ON challenge_participants
  FOR UPDATE USING (auth.uid() = user_id);


-- Policies for upcoming_challenges
CREATE POLICY "Users can view upcoming challenges" ON upcoming_challenges
  FOR SELECT USING (true);

CREATE POLICY "Users can insert upcoming challenges they create" ON upcoming_challenges
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Create indexes
CREATE INDEX friend_requests_sender_idx ON friend_requests(sender_id);
CREATE INDEX friend_requests_receiver_idx ON friend_requests(receiver_id);
CREATE INDEX challenge_participants_challenge_idx ON challenge_participants(challenge_id);
CREATE INDEX challenge_participants_user_idx ON challenge_participants(user_id);
