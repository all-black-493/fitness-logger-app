# 🏋️ Fitness Logger App

A sleek, full-stack fitness journal built with Supabase, Next.js, and React. Users can sign up, log workouts, track progress, manage profiles, and more.

---

## Table of Contents

* [Features](#features)
* [Tech Stack](#tech-stack)
* [Getting Started](#getting-started)
* [Usage](#usage)
* [Database Schema](#database-schema)
* [Folder Structure](#folder-structure)
* [Environment Variables](#environment-variables)
* [Deployment](#deployment)
* [Contributing](#contributing)
* [License](#license)

---

## Features

* **User authentication** via Supabase (sign up, sign in, sign out, password reset)
* **Profile management** with avatar, username, and full name
* **Workout logging**: record exercises, sets, reps, weights, and timestamps
* **Dashboard**: view past workouts and progress over time
* **Real-time updates**: auth and profile updates sync instantly
* **Responsive UI** tailored for mobile & desktop

---

## Tech Stack

* **Frontend**: Next.js (App Router), React, Tailwind CSS
* **Authentication & Database**: Supabase (Auth + PostgreSQL)
* **Hosting**: Vercel
* **Utilities**: TypeScript, `ui-avatars.com` for default avatars

---

## Getting Started

### Prerequisites

* Node.js `>=16.x`
* Yarn or NPM
* Supabase account

### Installation

1. Clone the repo

   ```bash
   git clone https://github.com/all-black-493/fitness-logger-app.git
   cd fitness-logger-app
   ```
2. Install dependencies

   ```bash
   yarn install
   ```
3. Create a Supabase project and initialize tables
   Use the provided SQL scripts in `supabase/setup.sql`:

   ```sql
   -- or equivalent script
   CREATE TABLE profiles (
     id uuid PRIMARY KEY,
     username text UNIQUE NOT NULL,
     full_name text,
     avatar_url text
   );

   CREATE TABLE workouts (
     id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
     user_id uuid REFERENCES profiles(id),
     created_at timestamp with time zone DEFAULT now()
   );

   CREATE TABLE exercises (
     id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
     workout_id bigint REFERENCES workouts(id),
     name text NOT NULL
   );

   CREATE TABLE sets (
     id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
     exercise_id bigint REFERENCES exercises(id),
     reps integer,
     weight numeric
   );
   ```
4. Set up environment variables

---

## Environment Variables

Create a `.env.local` file at the root:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

📌 **Note:** Client-side code uses public keys; your database row-level security policies must protect data accordingly.

---

## Usage

### Running Locally

```bash
yarn dev
```

* Visit `http://localhost:3000`
* Sign up with email/password
* A profile record is created using an idempotent upsert method
* Log workouts and track your progress

### Core Modules

* `AuthContext` handles authentication and profile upserts
* `Dashboard` displays your workout history
* `Workout pages` allow creating new workouts, adding exercises and sets

---

## Database Schema

| Table       | Key Fields                                  |
| ----------- | ------------------------------------------- |
| `profiles`  | `id`, `username`, `full_name`, `avatar_url` |
| `workouts`  | `id`, `user_id`, `created_at`               |
| `exercises` | `id`, `workout_id`, `name`                  |
| `sets`      | `id`, `exercise_id`, `reps`, `weight`       |

---

## Folder Structure

```
/pages             # Next.js pages
/components        # UI & layout components
/lib               # supabase client init
/context           # Auth providers/hooks
/supabase          # SQL migration/setup scripts
/styles            # Global styles and Tailwind config
```

---

## Deployment

1. Push to GitHub
2. Connect your repo on **Vercel**
3. Set environment variables in Vercel dashboard
4. Deploy — your app is live!

---

## Contributing

Feel free to open issues or pull requests. Guidelines:

* Fork the repo
* Create a feature branch
* Add/update tests & documentation
* Submit PR for review

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

Enjoy building healthier habits! 💪
