"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts"
import { useAuth } from "@/contexts/auth-context"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"
import gsap from "gsap"

export function ProgressChart() {
  const { user } = useAuth()
  const chartRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("weekly")

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

  useEffect(() => {
    setIsLoading(false) 

    const ctx = gsap?.context(() => {
      gsap?.from(".chart-container", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        delay: 0.2,
      })
    }, chartRef)

    return () => ctx?.revert()
  }, [])

    const fetchWorkoutData = async () => {
    if (!user) return

    try {
 
      await new Promise((resolve) => setTimeout(resolve, 500))

      // console.log("Would fetch workout data for user:", user.id)
    } catch (error) {
      console.error("Error fetching workout data:", error)
      toast({
        title: "Error",
        description: "Failed to load progress data. Using sample data instead.",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    if (user) {
      fetchWorkoutData()
    }
  }, [user, activeTab])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card ref={chartRef}>
      <CardHeader>
        <CardTitle>Progress Tracking</CardTitle>
        <CardDescription>Compare your performance with your gym buddies</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="weekly" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>
          <TabsContent value="weekly" className="pt-4">
            <div className="chart-container h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="you"
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#10b981" }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="average"
                    stroke="#6b7280"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          <TabsContent value="monthly" className="pt-4">
            <div className="chart-container h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="you"
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#10b981" }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="average"
                    stroke="#6b7280" 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
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
      <div className="bg-background border rounded-md shadow-md p-3">
        <p className="font-bold">{label}</p>
        <div className="flex items-center mt-1">
          <div className="h-2 w-2 rounded-full bg-emerald-500 mr-1"></div>
          <span>You: {payload[0].value}</span>
        </div>
        <div className="flex items-center mt-1">
          <div className="h-2 w-2 rounded-full bg-gray-500 mr-1"></div>
          <span>Average: {payload[1].value}</span>
        </div>
      </div>
    )
  }

  return null
}
