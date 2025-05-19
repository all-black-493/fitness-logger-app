"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Users, Calendar, MessageSquare, Share2, Bell, BellOff } from "lucide-react"
import Link from "next/link"

interface CommunityDetailProps {
  id: string
}

export function CommunityDetail({ id }: CommunityDetailProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Mock data for the community
  const community = {
    id: Number.parseInt(id),
    name: "Powerlifting Pros",
    description:
      "A community for powerlifting enthusiasts of all levels. Share tips, celebrate PRs, and support each other on the journey to strength.",
    members: 1243,
    posts: 3567,
    events: 12,
    joined: true,
    notifications: true,
    image: "/placeholder.svg?height=200&width=800",
    coverImage: "/placeholder.svg?height=300&width=1200",
    tags: ["Powerlifting", "Strength Training", "Competition", "Technique"],
    about:
      "Powerlifting Pros is a community dedicated to the sport of powerlifting. Whether you're a beginner or an experienced lifter, this is a place to share knowledge, get form checks, discuss programming, and connect with fellow strength enthusiasts.\n\nOur community values supportive feedback, evidence-based training approaches, and celebrating each other's achievements regardless of the weight on the bar.",
    rules: [
      "Be respectful and supportive of all members",
      "No spam or self-promotion without moderator approval",
      "Form check videos should include multiple angles when possible",
      "Keep discussions related to strength training and powerlifting",
      "No medical advice - suggest consulting professionals instead",
    ],
  }

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate the cover image
      gsap.from(".community-cover", {
        y: -30,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      })

      // Animate the content
      gsap.from(".community-content", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        delay: 0.2,
      })

      // Animate the rules
      gsap.from(".rule-item", {
        x: -20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out",
        delay: 0.4,
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={containerRef}>
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/communities">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Communities
          </Link>
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            {community.notifications ? (
              <>
                <BellOff className="mr-2 h-4 w-4" />
                Mute
              </>
            ) : (
              <>
                <Bell className="mr-2 h-4 w-4" />
                Notify
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="community-cover relative h-48 md:h-64 rounded-t-lg overflow-hidden border-t border-x">
        <img
          src={community.coverImage || "/placeholder.svg"}
          alt={community.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-6 text-white">
          <h1 className="text-3xl font-bold">{community.name}</h1>
          <div className="flex items-center mt-2">
            <Users className="h-4 w-4 mr-1" />
            <span>{community.members.toLocaleString()} members</span>
            <span className="mx-2">•</span>
            <MessageSquare className="h-4 w-4 mr-1" />
            <span>{community.posts.toLocaleString()} posts</span>
            <span className="mx-2">•</span>
            <Calendar className="h-4 w-4 mr-1" />
            <span>{community.events} events</span>
          </div>
        </div>
      </div>

      <div className="community-content border rounded-b-lg p-6 mb-6">
        <div className="flex flex-wrap gap-2 mb-4">
          {community.tags.map((tag, index) => (
            <Badge key={index} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>

        <p className="text-muted-foreground mb-6">{community.description}</p>

        <div className="flex flex-wrap gap-2">
          {community.joined ? (
            <Button variant="outline">Leave Community</Button>
          ) : (
            <Button className="bg-emerald-500 hover:bg-emerald-600">Join Community</Button>
          )}
          <Button variant="outline">Create Post</Button>
        </div>

        <div className="mt-8">
          <Tabs defaultValue="about">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="rules">Rules</TabsTrigger>
            </TabsList>
            <div className="mt-4">
              <TabsContent value="about" className="mt-0">
                <div className="whitespace-pre-line">{community.about}</div>
              </TabsContent>
              <TabsContent value="rules" className="mt-0">
                <ol className="space-y-2">
                  {community.rules.map((rule, index) => (
                    <li key={index} className="rule-item flex gap-2">
                      <span className="font-bold text-emerald-500">{index + 1}.</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ol>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
