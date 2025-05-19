"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Camera, CheckCircle } from "lucide-react"

interface CompetitionSubmissionProps {
  id: string
}

export function CompetitionSubmission({ id }: CompetitionSubmissionProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [weight, setWeight] = useState("")
  const [reps, setReps] = useState("")
  const [bodyWeight, setBodyWeight] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".submission-form", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)

      // Reset form after showing success message
      setTimeout(() => {
        setIsSubmitted(false)
        setWeight("")
        setReps("")
        setBodyWeight("")
      }, 3000)
    }, 1500)
  }

  return (
    <Card ref={containerRef}>
      <CardHeader>
        <CardTitle>Submit Your Entry</CardTitle>
        <CardDescription>Record your performance for this challenge</CardDescription>
      </CardHeader>
      <CardContent>
        {isSubmitted ? (
          <div className="submission-form flex flex-col items-center justify-center py-8">
            <CheckCircle className="h-16 w-16 text-emerald-500 mb-4" />
            <h3 className="text-xl font-semibold">Entry Submitted Successfully!</h3>
            <p className="text-muted-foreground text-center mt-2">
              Your entry has been recorded. You can submit another entry tomorrow.
            </p>
          </div>
        ) : (
          <div className="submission-form">
            <Tabs defaultValue="weight">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="weight">Weight Lifted</TabsTrigger>
                <TabsTrigger value="video">Video Proof</TabsTrigger>
              </TabsList>

              <form onSubmit={handleSubmit}>
                <TabsContent value="weight" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="weight">Weight Lifted (lbs)</Label>
                      <Input
                        id="weight"
                        type="number"
                        placeholder="Enter weight"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reps">Number of Reps</Label>
                      <Input
                        id="reps"
                        type="number"
                        placeholder="Enter reps"
                        value={reps}
                        onChange={(e) => setReps(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bodyWeight">Your Body Weight (lbs)</Label>
                    <Input
                      id="bodyWeight"
                      type="number"
                      placeholder="Enter your body weight"
                      value={bodyWeight}
                      onChange={(e) => setBodyWeight(e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      This is used to calculate your strength-to-weight ratio
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="video" className="space-y-4">
                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="flex flex-col items-center space-y-2">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <div className="text-sm font-medium">Upload a video of your lift</div>
                        <p className="text-xs text-muted-foreground">
                          Video must clearly show the weight and your full range of motion
                        </p>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button type="button" size="sm" variant="outline">
                          <Upload className="h-3.5 w-3.5 mr-1" />
                          Upload Video
                        </Button>
                        <Button type="button" size="sm" variant="outline">
                          <Camera className="h-3.5 w-3.5 mr-1" />
                          Record Now
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    <p className="font-medium mb-1">Video Requirements:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Video must be clear and well-lit</li>
                      <li>Weight plates must be clearly visible</li>
                      <li>Full range of motion must be shown</li>
                      <li>Maximum file size: 100MB</li>
                      <li>Supported formats: MP4, MOV</li>
                    </ul>
                  </div>
                </TabsContent>

                <div className="mt-6 flex justify-end">
                  <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit Entry"}
                  </Button>
                </div>
              </form>
            </Tabs>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
