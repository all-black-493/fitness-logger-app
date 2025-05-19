"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, MessageSquare, Calendar } from "lucide-react"

export function CommunitiesList() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".community-list-item", {
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out",
      })
    }, containerRef)

    return () => ctx.revert()
  }, [activeTab])

  const allCommunities = [
    {
      id: 1,
      name: "Strength Training 101",
      members: 5432,
      posts: 342,
      events: 5,
      category: "strength",
      description: "Learn proper techniques for building strength and muscle",
      image: "/placeholder.svg?height=40&width=40",
      tags: ["Beginners", "Technique"],
    },
    {
      id: 2,
      name: "HIIT Workouts",
      members: 3876,
      posts: 287,
      events: 8,
      category: "cardio",
      description: "High-intensity interval training for maximum calorie burn",
      image: "/placeholder.svg?height=40&width=40",
      tags: ["Intense", "Fat Loss"],
    },
    {
      id: 3,
      name: "Yoga & Flexibility",
      members: 7123,
      posts: 412,
      events: 12,
      category: "wellness",
      description: "Improve flexibility, balance, and mental wellbeing",
      image: "/placeholder.svg?height=40&width=40",
      tags: ["Relaxation", "Mobility"],
    },
    {
      id: 4,
      name: "Nutrition Experts",
      members: 4567,
      posts: 321,
      events: 3,
      category: "nutrition",
      description: "Discuss diet plans, supplements, and meal prep strategies",
      image: "/placeholder.svg?height=40&width=40",
      tags: ["Diet", "Supplements"],
    },
    {
      id: 5,
      name: "Bodyweight Fitness",
      members: 3245,
      posts: 198,
      events: 4,
      category: "strength",
      description: "Master calisthenics and bodyweight exercises",
      image: "/placeholder.svg?height=40&width=40",
      tags: ["No Equipment", "Calisthenics"],
    },
    {
      id: 6,
      name: "Running Club",
      members: 6789,
      posts: 432,
      events: 15,
      category: "cardio",
      description: "From 5K to marathons - training plans and race strategies",
      image: "/placeholder.svg?height=40&width=40",
      tags: ["Endurance", "Races"],
    },
  ]

  const filteredCommunities =
    activeTab === "all" ? allCommunities : allCommunities.filter((community) => community.category === activeTab)

  return (
    <Card ref={containerRef}>
      <CardHeader>
        <CardTitle>Discover Communities</CardTitle>
        <CardDescription>Find and join communities based on your fitness interests</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-6 mb-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="strength">Strength</TabsTrigger>
            <TabsTrigger value="cardio">Cardio</TabsTrigger>
            <TabsTrigger value="wellness">Wellness</TabsTrigger>
            <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
            <TabsTrigger value="sports">Sports</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0 space-y-4">
            {filteredCommunities.map((community) => (
              <div
                key={community.id}
                className="community-list-item flex flex-col md:flex-row md:items-center justify-between border rounded-lg p-4 hover:border-emerald-500/50 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={community.image || "/placeholder.svg"} alt={community.name} />
                    <AvatarFallback className="bg-emerald-500 text-white">
                      {community.name.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{community.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{community.description}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {community.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4 mt-4 md:mt-0">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      <span>{community.members.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>{community.posts}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{community.events}</span>
                    </div>
                  </div>
                  <Button className="bg-emerald-500 hover:bg-emerald-600">Join Community</Button>
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
