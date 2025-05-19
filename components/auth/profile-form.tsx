"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"
import { AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function ProfileForm() {
  const { user, updateProfile } = useAuth()
  const [username, setUsername] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (user) {
      setUsername(user.user_metadata?.username || "")
      setAvatarUrl(user.user_metadata?.avatar_url || "")
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const { error } = await updateProfile({
        username,
        avatar_url: avatarUrl,
      })

      if (error) {
        setError(error.message)
        return
      }

      // Show success message
      setSuccess(true)
    } catch (err) {
      setError("An unexpected error occurred")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const userInitials = user?.email ? user.email.substring(0, 2).toUpperCase() : "GU"

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>Profile updated successfully</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={username || user?.email || "User"} />
          <AvatarFallback className="text-lg">{userInitials}</AvatarFallback>
        </Avatar>
        <div className="space-y-2 flex-1">
          <Label htmlFor="avatar-url">Profile Picture URL</Label>
          <Input
            id="avatar-url"
            type="url"
            placeholder="https://example.com/avatar.jpg"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          type="text"
          placeholder="Your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={user?.email || ""} disabled />
        <p className="text-xs text-muted-foreground">Email cannot be changed</p>
      </div>

      <div className="flex justify-end">
        <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </form>
  )
}
