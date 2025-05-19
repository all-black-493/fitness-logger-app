"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users } from "lucide-react"

export function YourCommunities() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".community-card", {
        x: -30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out",
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  const communities = [
    {
      id: 1,
      name: "Powerlifting Pros",
      members: 1243,
      image: "/placeholder.svg?height=80&width=80",
      unread: 5,
      active: true,
    },
    {
      id: 2,
      name: "Cardio Kings",
      members: 876,
      image: "/placeholder.svg?height=80&width=80",
      unread: 0,
      active: true,
    },
    {
      id: 3,
      name: "Yoga Enthusiasts",
      members: 1502,
      image: "/placeholder.svg?height=80&width=80",
      unread: 12,
      active: true,
    },
    {
      id: 4,
      name: "Calisthenics Crew",
      members: 654,
      image: "/placeholder.svg?height=80&width=80",
      unread: 0,
      active: false,
    },
    {
      id: 5,
      name: "Marathon Runners",
      members: 932,
      image: "/placeholder.svg?height=80&width=80",
      unread: 3,
      active: true,
    },
    {
      id: 6,
      name: "Squat Masters",
      members: 932,
      image: "/placeholder.svg?height=80&width=80",
      unread: 3,
      active: true,
    },
  ]

  return (
    <Card ref={containerRef}>

      <CardHeader>
        <CardTitle>Your Communities</CardTitle>
        <CardDescription>Communities you've joined</CardDescription>
      </CardHeader>

      <CardContent>
        <ScrollArea className="pb-4 -mx-2 px-2">
          <div className="flex gap-4">
            {communities.map((community) => (
              <div
                key={community.id}
                className="community-card flex-shrink-0 w-[280px] border rounded-lg overflow-hidden hover:border-emerald-500/50 transition-all duration-300"
              >
                <div className="h-24 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 relative">
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
                    <Avatar className="h-16 w-16 border-4 border-background">
                      <AvatarImage src={community.image || "/placeholder.svg"} alt={community.name} />
                      <AvatarFallback className="text-lg bg-emerald-500 text-white">
                        {community.name.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
                <div className="pt-10 p-4 text-center">
                  <h3 className="font-semibold text-lg">{community.name}</h3>
                  <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mt-1">
                    <Users className="h-3.5 w-3.5" />
                    <span>{community.members.toLocaleString()} members</span>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    {community.unread > 0 && (
                      <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20">
                        {community.unread} new
                      </Badge>
                    )}
                    {community.unread === 0 && <div />}
                    
                    <Button variant="ghost" size="sm" className="text-xs">
                      {community.active ? "View" : "Rejoin"}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
