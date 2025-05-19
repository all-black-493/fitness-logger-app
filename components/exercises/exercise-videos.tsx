"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Youtube } from "lucide-react"

interface ExerciseVideosProps {
  id: string
}

export function ExerciseVideos({ id }: ExerciseVideosProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Mock video data
  const videos = [
    {
      id: "v1",
      title: "Perfect Bench Press Form Guide",
      channel: "GymBro Official",
      views: "1.2M views",
      length: "8:42",
      thumbnail: "/placeholder.svg?height=120&width=200",
    },
    {
      id: "v2",
      title: "How to Increase Your Bench Press",
      channel: "Strength Academy",
      views: "856K views",
      length: "12:15",
      thumbnail: "/placeholder.svg?height=120&width=200",
    },
    {
      id: "v3",
      title: "Common Bench Press Mistakes",
      channel: "Form Fix",
      views: "543K views",
      length: "6:28",
      thumbnail: "/placeholder.svg?height=120&width=200",
    },
  ]

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".video-item", {
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
        <CardTitle>Tutorial Videos</CardTitle>
        <CardDescription>Learn proper form and technique</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {videos.map((video) => (
            <div
              key={video.id}
              className="video-item flex gap-4 border rounded-lg p-3 hover:border-emerald-500/50 transition-all duration-300"
            >
              <div className="relative flex-shrink-0">
                <img
                  src={video.thumbnail || "/placeholder.svg"}
                  alt={video.title}
                  className="w-32 h-20 object-cover rounded-md"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-8 w-8 rounded-full bg-black/60 flex items-center justify-center">
                    <Play className="h-4 w-4 text-white" fill="white" />
                  </div>
                </div>
                <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">
                  {video.length}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-sm line-clamp-2">{video.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{video.channel}</p>
                <p className="text-xs text-muted-foreground">{video.views}</p>
              </div>
            </div>
          ))}
        </div>

        <Button variant="outline" className="w-full mt-4">
          <Youtube className="mr-2 h-4 w-4" />
          View More on YouTube
        </Button>
      </CardContent>
    </Card>
  )
}
