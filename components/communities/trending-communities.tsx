"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { TrendingUp, Users, Activity } from "lucide-react"

export function TrendingCommunities() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".trending-item", {
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out",
      })

      // Animate the trending icon
      gsap.to(".trending-icon", {
        y: -3,
        duration: 1,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  const trendingCommunities = [
    {
      id: 1,
      name: "CrossFit Champions",
      members: 3245,
      growth: "+15%",
      description: "High-intensity interval training and Olympic weightlifting",
      image: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 2,
      name: "Plant-Based Athletes",
      members: 2187,
      growth: "+23%",
      description: "Vegan nutrition and workout plans for optimal performance",
      image: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 3,
      name: "Home Gym Heroes",
      members: 4521,
      growth: "+18%",
      description: "Get fit with minimal equipment in your own space",
      image: "/placeholder.svg?height=40&width=40",
    },
  ]

  return (
    <Card ref={containerRef}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center">
            Trending Communities
            <TrendingUp className="trending-icon ml-2 h-5 w-5 text-emerald-500" />
          </CardTitle>
          <CardDescription>Fast-growing fitness communities to explore</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {trendingCommunities.map((community) => (
            <div
              key={community.id}
              className="trending-item flex items-center justify-between border rounded-lg p-4 hover:border-emerald-500/50 transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={community.image || "/placeholder.svg"} alt={community.name} />
                  <AvatarFallback className="bg-emerald-500 text-white">
                    {community.name.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{community.name}</h3>
                  <div className="flex items-center gap-4 mt-1">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="h-3.5 w-3.5" />
                      <span>{community.members.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-emerald-500">
                      <Activity className="h-3.5 w-3.5" />
                      <span>{community.growth} this month</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{community.description}</p>
                </div>
              </div>
              <Button className="bg-emerald-500 hover:bg-emerald-600">Join</Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
