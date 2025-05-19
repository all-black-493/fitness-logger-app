import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"
import { Logo } from "@/components/logo"
import Link from "next/link"

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-emerald-50 dark:from-background dark:to-emerald-950/20 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo className="h-10 w-10" />
          <h1 className="mt-4 text-3xl font-bold">Reset your password</h1>
          <p className="mt-2 text-muted-foreground">Enter your email to receive a password reset link</p>
        </div>
        <div className="rounded-lg border bg-card p-8 shadow-sm">
          <ForgotPasswordForm />
          <div className="mt-6 text-center text-sm">
            Remember your password?{" "}
            <Link href="/login" className="font-medium text-emerald-500 hover:text-emerald-600">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
