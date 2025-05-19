"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"
import { format, subDays } from "date-fns"

interface ExerciseHistoryProps {
  id: string
}

export function ExerciseHistory({ id }: ExerciseHistoryProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Generate mock data for the past 30 days
  const generateHistoryData = () => {
    const data = []
    const today = new Date()

    // Generate some random workout days
    const workoutDays = new Set()
    for (let i = 0; i < 12; i++) {
      workoutDays.add(Math.floor(Math.random() * 30))
    }

    for (let i = 29; i >= 0; i--) {
      const date = subDays(today, i)
      const formattedDate = format(date, "MMM d")

      // Only add weight/reps for workout days
      if (workoutDays.has(i)) {
        // Simulate progress over time with some variation
        const baseWeight = 135 + Math.floor((30 - i) / 3)
        const randomVariation = Math.floor(Math.random() * 10) - 5

        data.push({
          date: formattedDate,
          weight: baseWeight + randomVariation,
          reps: Math.floor(Math.random() * 4) + 8, // 8-12 reps
        })
      }
    }

    return data
  }

  const historyData = generateHistoryData()

  // Calculate personal best
  const personalBest = historyData.reduce((max, item) => Math.max(max, item.weight), 0)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".history-chart", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <Card ref={containerRef}>
      <CardHeader>
        <CardTitle>Exercise History</CardTitle>
        <CardDescription>Your progress over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="history-chart h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historyData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip
                formatter={(value, name) => [
                  `${value} ${name === "weight" ? "lbs" : ""}`,
                  name === "weight" ? "Weight" : "Reps",
                ]}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="hsl(var(--emerald-500))"
                strokeWidth={2}
                dot={{ r: 4, fill: "hsl(var(--emerald-500))" }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="reps"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              <ReferenceLine
                y={personalBest}
                stroke="rgba(220, 53, 69, 0.7)"
                strokeDasharray="3 3"
                label={{ value: "Personal Best", position: "insideTopRight", fill: "rgba(220, 53, 69, 0.7)" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 text-center">
          <div className="border rounded-lg p-3">
            <p className="text-sm text-muted-foreground">Personal Best</p>
            <p className="text-2xl font-bold text-emerald-500">{personalBest} lbs</p>
          </div>
          <div className="border rounded-lg p-3">
            <p className="text-sm text-muted-foreground">Last Workout</p>
            <p className="text-2xl font-bold">
              {historyData[historyData.length - 1]?.weight || 0} lbs × {historyData[historyData.length - 1]?.reps || 0}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
