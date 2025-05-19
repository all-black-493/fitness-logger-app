import { ResetPasswordForm } from "@/components/auth/reset-password-form"
import { Logo } from "@/components/logo"

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-emerald-50 dark:from-background dark:to-emerald-950/20 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo className="h-10 w-10" />
          <h1 className="mt-4 text-3xl font-bold">Set new password</h1>
          <p className="mt-2 text-muted-foreground">Create a new password for your account</p>
        </div>
        <div className="rounded-lg border bg-card p-8 shadow-sm">
          <ResetPasswordForm />
        </div>
      </div>
    </div>
  )
}
