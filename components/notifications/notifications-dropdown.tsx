"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import type { Notification } from "@/types/challenge-invitations"
import { Bell } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChallengeInvitations } from "@/components/challenges/challenge-invitations"

export function NotificationsDropdown() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [invitationCount, setInvitationCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("notifications")
  const { toast } = useToast()
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    if (!user) return

    const fetchNotifications = async () => {
      setLoading(true)
      try {
        // Fetch notifications
        const { data: notificationsData, error: notificationsError } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(10)

        if (notificationsError) throw notificationsError

        // Fetch pending challenge invitations
        const { data: invitationsData, error: invitationsError } = await supabase
          .from("challenge_invitations")
          .select("id")
          .eq("receiver_id", user.id)
          .eq("status", "pending")

        if (invitationsError) throw invitationsError

        setNotifications(notificationsData || [])
        setUnreadCount(notificationsData?.filter((n) => !n.is_read).length || 0)
        setInvitationCount(invitationsData?.length || 0)

        // If there are invitations but no unread notifications, set the active tab to invitations
        if (invitationsData?.length && !notificationsData?.filter((n) => !n.is_read).length) {
          setActiveTab("invitations")
        }
      } catch (error) {
        console.error("Error fetching notifications:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()

    // Set up real-time subscription for new notifications
    const notificationsChannel = supabase
      .channel("notifications-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification
          setNotifications((prev) => [newNotification, ...prev].slice(0, 10))
          setUnreadCount((prev) => prev + 1)

          toast({
            title: "New Notification",
            description: newNotification.content,
          })
        },
      )
      .subscribe()

    // Set up real-time subscription for new invitations
    const invitationsChannel = supabase
      .channel("invitations-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "challenge_invitations",
          filter: `receiver_id=eq.${user.id} AND status=eq.pending`,
        },
        () => {
          setInvitationCount((prev) => prev + 1)
          toast({
            title: "New Challenge Invitation",
            description: "You've been invited to join a challenge!",
          })
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "challenge_invitations",
          filter: `receiver_id=eq.${user.id}`,
        },
        (payload: any) => {
          if (payload.new.status !== "pending") {
            setInvitationCount((prev) => Math.max(0, prev - 1))
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(notificationsChannel)
      supabase.removeChannel(invitationsChannel)
    }
  }, [user, supabase, toast])

  const markAsRead = async (notificationId?: string) => {
    if (!user) return

    try {
      if (notificationId) {
        // Mark single notification as read
        await supabase.from("notifications").update({ is_read: true }).eq("id", notificationId)

        setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n)))
        setUnreadCount((prev) => Math.max(0, prev - 1))
      } else {
        // Mark all as read
        await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id).eq("is_read", false)

        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
        setUnreadCount(0)
      }
    } catch (error) {
      console.error("Error marking notifications as read:", error)
    }
  }

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    await markAsRead(notification.id)

    // Navigate based on notification type
    if (notification.type === "challenge_accepted" && notification.related_id) {
      router.push(`/challenges/${notification.related_id}`)
    }
  }

  const handleInvitationUpdate = () => {
    // Refresh invitation count
    if (user) {
      supabase
        .from("challenge_invitations")
        .select("id")
        .eq("receiver_id", user.id)
        .eq("status", "pending")
        .then(({ data }) => {
          setInvitationCount(data?.length || 0)
        })
    }
  }

  if (!user) {
    return null
  }

  const totalAlerts = unreadCount + invitationCount

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {totalAlerts > 0 && (
            <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] text-white">
              {totalAlerts > 9 ? "9+" : totalAlerts}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between px-2">
            <TabsList>
              <TabsTrigger value="notifications" className="relative">
                Notifications
                {unreadCount > 0 && (
                  <span className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] text-white">
                    {unreadCount}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="invitations" className="relative">
                Invitations
                {invitationCount > 0 && (
                  <span className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] text-white">
                    {invitationCount}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
            {activeTab === "notifications" && unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={() => markAsRead()}>
                Mark all read
              </Button>
            )}
          </div>

          <TabsContent value="notifications" className="mt-0 max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">Loading notifications...</div>
            ) : notifications.length > 0 ? (
              notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={`flex flex-col items-start p-3 cursor-pointer ${
                    !notification.is_read ? "bg-muted/50" : ""
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="text-sm">{notification.content}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                  </div>
                </DropdownMenuItem>
              ))
            ) : (
              <div className="p-4 text-center text-sm text-muted-foreground">No notifications yet</div>
            )}
          </TabsContent>

          <TabsContent value="invitations" className="mt-0 max-h-[400px] overflow-y-auto">
            <ChallengeInvitations inDropdown onUpdate={handleInvitationUpdate} />
          </TabsContent>
        </Tabs>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
