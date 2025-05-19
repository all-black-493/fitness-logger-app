"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Shield, Users } from "lucide-react"

interface CommunityMembersProps {
  id: string
}

export function CommunityMembers({ id }: CommunityMembersProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Mock members data
  const members = [
    {
      id: 1,
      name: "Mike Smith",
      image: "/placeholder.svg?height=40&width=40",
      role: "admin",
      isYou: false,
    },
    {
      id: 2,
      name: "Sarah Johnson",
      image: "/placeholder.svg?height=40&width=40",
      role: "moderator",
      isYou: false,
    },
    {
      id: 3,
      name: "You",
      image: "/placeholder.svg?height=40&width=40",
      role: "member",
      isYou: true,
    },
    {
      id: 4,
      name: "Alex Williams",
      image: "/placeholder.svg?height=40&width=40",
      role: "member",
      isYou: false,
    },
    {
      id: 5,
      name: "Jordan Lee",
      image: "/placeholder.svg?height=40&width=40",
      role: "member",
      isYou: false,
    },
  ]

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".member-item", {
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out",
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <Card ref={containerRef}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Members</CardTitle>
            <CardDescription>People in this community</CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="text-xs">
            <Users className="h-3.5 w-3.5 mr-1" />
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {members.map((member) => (
            <div key={member.id} className="member-item flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={member.image || "/placeholder.svg"} alt={member.name} />
                  <AvatarFallback>{member.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium text-sm flex items-center">
                    {member.name}
                    {member.isYou && (
                      <Badge variant="outline" className="ml-1 text-xs">
                        You
                      </Badge>
                    )}
                  </div>
                  {member.role !== "member" && (
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Shield className="h-3 w-3 mr-1" />
                      <span className="capitalize">{member.role}</span>
                    </div>
                  )}
                </div>
              </div>
              {!member.isYou && (
                <Button variant="ghost" size="sm" className="h-7 text-xs">
                  Message
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
