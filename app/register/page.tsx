import { RegisterForm } from "@/components/auth/register-form"
import { Logo } from "@/components/logo"
import Link from "next/link"

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-emerald-50 dark:from-background dark:to-emerald-950/20 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo className="h-10 w-10" />
          <h1 className="mt-4 text-3xl font-bold">Create an account</h1>
          <p className="mt-2 text-muted-foreground">Sign up to start tracking your fitness journey</p>
        </div>
        <div className="rounded-lg border bg-card p-8 shadow-sm">
          <RegisterForm />
          <div className="mt-6 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-emerald-500 hover:text-emerald-600">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
