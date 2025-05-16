import Link from "next/link"
import { Dumbbell } from "lucide-react"

export function MainNav() {
  return (
    <div className="flex items-center space-x-4 lg:space-x-6">
      <Link href="/" className="flex items-center space-x-2">
        <Dumbbell className="h-6 w-6 text-emerald-500" />
        <span className="font-bold text-xl">GymBro</span>
      </Link>
      <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
        <Link href="/dashboard" className="text-sm font-medium transition-colors hover:text-primary">
          Dashboard
        </Link>
        <Link
          href="/exercises"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          Exercises
        </Link>
        <Link
          href="/competitions"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          Competitions
        </Link>
        <Link
          href="/community"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          Community
        </Link>
      </nav>
    </div>
  )
}
