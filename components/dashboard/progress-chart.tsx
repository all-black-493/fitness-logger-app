"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Chart,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendItem,
} from "@/components/ui/chart"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts"

export function ProgressChart() {
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".chart-container", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      })
    }, chartRef)

    return () => ctx.revert()
  }, [])

  const weeklyData = [
    { day: "Mon", you: 120, average: 100 },
    { day: "Tue", you: 150, average: 110 },
    { day: "Wed", you: 140, average: 115 },
    { day: "Thu", you: 180, average: 120 },
    { day: "Fri", you: 190, average: 125 },
    { day: "Sat", you: 210, average: 130 },
    { day: "Sun", you: 200, average: 135 },
  ]

  const monthlyData = [
    { week: "Week 1", you: 800, average: 700 },
    { week: "Week 2", you: 900, average: 750 },
    { week: "Week 3", you: 1100, average: 800 },
    { week: "Week 4", you: 1200, average: 850 },
  ]

  return (
    <Card ref={chartRef}>
      <CardHeader>
        <CardTitle>Progress Tracking</CardTitle>
        <CardDescription>Compare your performance with your gym buddies</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="weekly">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>
          <TabsContent value="weekly" className="pt-4">
            <div className="chart-container h-[300px]">
              <ChartContainer>
                <ChartLegend>
                  <ChartLegendItem name="You" color="hsl(var(--emerald-500))" />
                  <ChartLegendItem name="Group Average" color="hsl(var(--muted-foreground))" />
                </ChartLegend>
                <Chart>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="you"
                        stroke="hsl(var(--emerald-500))"
                        strokeWidth={3}
                        dot={{ r: 4, fill: "hsl(var(--emerald-500))" }}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="average"
                        stroke="hsl(var(--muted-foreground))"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Chart>
              </ChartContainer>
            </div>
          </TabsContent>
          <TabsContent value="monthly" className="pt-4">
            <div className="chart-container h-[300px]">
              <ChartContainer>
                <ChartLegend>
                  <ChartLegendItem name="You" color="hsl(var(--emerald-500))" />
                  <ChartLegendItem name="Group Average" color="hsl(var(--muted-foreground))" />
                </ChartLegend>
                <Chart>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="you"
                        stroke="hsl(var(--emerald-500))"
                        strokeWidth={3}
                        dot={{ r: 4, fill: "hsl(var(--emerald-500))" }}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="average"
                        stroke="hsl(var(--muted-foreground))"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Chart>
              </ChartContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <ChartTooltip>
        <ChartTooltipContent>
          <div className="font-bold">{label}</div>
          <div className="flex items-center">
            <div className="h-2 w-2 rounded-full bg-emerald-500 mr-1"></div>
            <span>You: {payload[0].value}</span>
          </div>
          <div className="flex items-center">
            <div className="h-2 w-2 rounded-full bg-muted-foreground mr-1"></div>
            <span>Average: {payload[1].value}</span>
          </div>
        </ChartTooltipContent>
      </ChartTooltip>
    )
  }

  return null
}
