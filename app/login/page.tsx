import { LoginForm } from "@/components/auth/login-form"
import { Logo } from "@/components/logo"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-emerald-50 dark:from-background dark:to-emerald-950/20 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo className="h-10 w-10" />
          <h1 className="mt-4 text-3xl font-bold">Welcome back</h1>
          <p className="mt-2 text-muted-foreground">Sign in to your account to continue your fitness journey</p>
        </div>
        <div className="rounded-lg border bg-card p-8 shadow-sm">
          <LoginForm />
          <div className="mt-6 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium text-emerald-500 hover:text-emerald-600">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
