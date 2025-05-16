"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, Upload, Camera } from "lucide-react"

export function AiSuggestions() {
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate the sparkle icon
      gsap.to(".sparkle-icon", {
        rotate: 15,
        duration: 1,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      })

      // Animate the suggestion items
      gsap.from(".suggestion-item", {
        x: -20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out",
      })
    }, cardRef)

    return () => ctx.revert()
  }, [])

  return (
    <Card ref={cardRef}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>AI Form Coach</CardTitle>
          <Sparkles className="sparkle-icon h-5 w-5 text-emerald-500" />
        </div>
        <CardDescription>Get personalized feedback on your form</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 border border-dashed border-muted-foreground/50">
            <div className="flex flex-col items-center justify-center text-center space-y-2">
              <div className="flex flex-col items-center space-y-2">
                <Camera className="h-8 w-8 text-muted-foreground" />
                <div className="text-sm font-medium">Upload a video of your workout</div>
                <p className="text-xs text-muted-foreground">
                  Our AI will analyze your form and provide personalized feedback
                </p>
              </div>
              <div className="flex gap-2 mt-2">
                <Button size="sm" variant="outline">
                  <Upload className="h-3.5 w-3.5 mr-1" />
                  Upload Video
                </Button>
                <Button size="sm" variant="outline">
                  <Camera className="h-3.5 w-3.5 mr-1" />
                  Record Now
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium">Recent Suggestions</h4>
            <div className="space-y-2">
              <div className="suggestion-item bg-muted/30 p-3 rounded-md text-sm">
                <p className="font-medium">Bench Press - May 15</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Try to keep your elbows at a 45° angle to reduce shoulder strain. Your arch looks good!
                </p>
              </div>
              <div className="suggestion-item bg-muted/30 p-3 rounded-md text-sm">
                <p className="font-medium">Squat Form - May 12</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Great depth! Focus on keeping your knees tracking over your toes throughout the movement.
                </p>
              </div>
              <div className="suggestion-item bg-muted/30 p-3 rounded-md text-sm">
                <p className="font-medium">Deadlift - May 10</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Your lower back is rounding slightly. Try engaging your lats more before initiating the pull.
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
