"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Calendar, Trophy, Users, Share2, Bell, BellOff } from "lucide-react"
import Link from "next/link"

interface CompetitionDetailProps {
  id: string
}

export function CompetitionDetail({ id }: CompetitionDetailProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Mock data for the competition
  const competition = {
    id: Number.parseInt(id),
    title: "Weekly Bench Press Challenge",
    description:
      "Who can bench press the most weight relative to body weight? This challenge is designed to test your strength and technique. Submit your best bench press weight by the end of the week.",
    status: "ongoing", // ongoing, upcoming, past
    startDate: "May 15, 2025",
    endDate: "May 22, 2025",
    participants: 8,
    exercise: "Bench Press",
    type: "Max Weight",
    rules: [
      "All submissions must include a video for verification",
      "Weight must be clearly visible in the video",
      "Only one submission per day is allowed",
      "Final ranking will be based on weight lifted relative to body weight",
    ],
    progress: 60, // percentage of time elapsed
    yourRank: 2,
    totalRanks: 8,
    notifications: true,
  }

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate the main content
      gsap.from(".competition-detail-content", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      })

      // Animate the progress bar
      gsap.from(".time-progress", {
        width: 0,
        duration: 1.5,
        ease: "power2.out",
      })

      // Animate the rules
      gsap.from(".rule-item", {
        x: -20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out",
        delay: 0.3,
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={containerRef}>
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/competitions">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Competitions
          </Link>
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            {competition.notifications ? (
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

      <div className="competition-detail-content border rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div>
            <div className="flex items-center flex-wrap gap-2">
              <h1 className="text-3xl font-bold">{competition.title}</h1>
              <Badge
                className={
                  competition.status === "ongoing"
                    ? "bg-emerald-500 hover:bg-emerald-600"
                    : competition.status === "upcoming"
                      ? "bg-blue-500 hover:bg-blue-600"
                      : "bg-gray-500 hover:bg-gray-600"
                }
              >
                {competition.status === "ongoing"
                  ? "Ongoing"
                  : competition.status === "upcoming"
                    ? "Upcoming"
                    : "Completed"}
              </Badge>
              <Badge variant="outline">{competition.type}</Badge>
            </div>

            <p className="text-muted-foreground mt-4">{competition.description}</p>

            <div className="flex flex-wrap gap-6 mt-6 text-sm">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                <span>
                  <span className="font-medium">Dates:</span> {competition.startDate} - {competition.endDate}
                </span>
              </div>
              <div className="flex items-center">
                <Trophy className="h-4 w-4 mr-1 text-muted-foreground" />
                <span>
                  <span className="font-medium">Exercise:</span> {competition.exercise}
                </span>
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                <span>
                  <span className="font-medium">Participants:</span> {competition.participants}
                </span>
              </div>
            </div>

            {competition.status === "ongoing" && (
              <div className="mt-6">
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress</span>
                  <span>{competition.progress}%</span>
                </div>
                <Progress className="time-progress h-2" value={competition.progress} />
              </div>
            )}
          </div>

          {competition.status === "ongoing" && (
            <div className="shrink-0 border rounded-lg p-4 text-center w-full md:w-auto">
              <div className="text-sm text-muted-foreground">Your Current Rank</div>
              <div className="text-4xl font-bold text-emerald-500 my-2">{competition.yourRank}</div>
              <div className="text-sm text-muted-foreground">out of {competition.totalRanks}</div>
              <Button className="w-full mt-4 bg-emerald-500 hover:bg-emerald-600">Submit Entry</Button>
            </div>
          )}

          {competition.status === "upcoming" && (
            <div className="shrink-0 border rounded-lg p-4 text-center w-full md:w-auto">
              <div className="text-sm text-muted-foreground">Challenge Starts In</div>
              <div className="text-4xl font-bold text-blue-500 my-2">3 Days</div>
              <Button className="w-full mt-4">Join Challenge</Button>
            </div>
          )}

          {competition.status === "past" && (
            <div className="shrink-0 border rounded-lg p-4 text-center w-full md:w-auto">
              <div className="text-sm text-muted-foreground">Your Final Rank</div>
              <div className="text-4xl font-bold text-emerald-500 my-2">{competition.yourRank}</div>
              <div className="text-sm text-muted-foreground">out of {competition.totalRanks}</div>
              <Button variant="outline" className="w-full mt-4">
                View Certificate
              </Button>
            </div>
          )}
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Challenge Rules</h2>
          <ul className="space-y-2">
            {competition.rules.map((rule, index) => (
              <li key={index} className="rule-item flex gap-2">
                <span className="font-bold text-emerald-500">{index + 1}.</span>
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
