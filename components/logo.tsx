import { Dumbbell } from "lucide-react"
import Link from "next/link"

interface LogoProps {
  className?: string
}

export function Logo({ className }: LogoProps) {
  return (
    <Link href="/" className="flex items-center space-x-2">
      <Dumbbell className={`text-emerald-500 ${className}`} />
      <span className="font-bold text-xl">GymBro</span>
    </Link>
  )
}
