"use client"

import { useEffect, useRef, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts"
import { useAuth } from "@/contexts/auth-context"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import gsap from "gsap"

type ParticipantData = {
  user_id: string
  user_name: string
  is_you: boolean
  is_average: boolean
  volume: number
}

type TrendDataPoint = {
  [key: string]: string | number
} & Record<string, number>

type Challenge = {
  id: string
  name: string
}

export function ProgressChart() {
  const { user } = useAuth()
  const supabase = getSupabaseBrowserClient()
  const chartRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("weekly")
  const [weeklyData, setWeeklyData] = useState<TrendDataPoint[]>([])
  const [monthlyData, setMonthlyData] = useState<TrendDataPoint[]>([])
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [selectedChallenge, setSelectedChallenge] = useState<string>("")
  const [participantColors, setParticipantColors] = useState<Record<string, string>>({})

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".chart-container", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        delay: 0.2,
      })
    }, chartRef)

    return () => ctx.revert()
  }, [])

  const fetchActiveChallenges = async () => {
    if (!user) return

    try {
      const { data: participants, error: participantsError } = await supabase
        .from("challenge_participants")
        .select("challenge_id")
        .eq("user_id", user.id)

      console.log('The participants: ', participants)

      if (participantsError) throw participantsError
      if (!participants.length) {
        setChallenges([])
        return
      }

      const challengeIds = participants.map(p => p.challenge_id)

      console.log('The Challenge IDs: ', challengeIds)

      const { data: challengeData, error: challengesError } = await supabase
        .from("challenges")
        .select("id, name, end_date")
        .in("id", challengeIds)
        .or(`end_date.gte.${new Date().toISOString()},end_date.is.null`)

      console.log('The Challenge Data: ', challengeData)

      if (challengesError) throw challengesError

      const activeChallenges = challengeData || []
      setChallenges(activeChallenges)
      if (activeChallenges.length > 0) {
        setSelectedChallenge(activeChallenges[0].id)
      }
    } catch (error) {
      console.error("Error fetching challenges:", error)
      toast({
        title: "Error",
        description: "Failed to load challenges",
        variant: "destructive",
      })
    }
  }

  const generateColors = (participants: ParticipantData[]) => {
    const colors: Record<string, string> = {}
    const colorPalette = [
      "#10b981", // emerald (current user)
      "#3b82f6", // blue
      "#f59e0b", // amber
      "#ef4444", // red
      "#8b5cf6", // violet
      "#ec4899", // pink
      "#14b8a6", // teal
      "#f97316", // orange
      "#6b7280", // gray (average)
    ]

    participants.forEach((participant, index) => {
      if (participant.is_you) {
        colors[participant.user_id] = colorPalette[0]
      } else if (participant.is_average) {
        colors[participant.user_id] = colorPalette[colorPalette.length - 1]
      } else {
        colors[participant.user_id] = colorPalette[(index % (colorPalette.length - 2)) + 1]
      }
    })

    return colors
  }

  const transformTrendData = (rawData: any[], timeKey: 'day' | 'week'): TrendDataPoint[] => {
    if (!rawData || rawData.length === 0) return []

    const grouped: Record<string, TrendDataPoint> = {}
    const participants = new Set<string>()

    rawData.forEach(item => {
      const timeValue = item[timeKey]
      const userId = item.user_id
      participants.add(userId)

      if (!grouped[timeValue]) {
        grouped[timeValue] = { [timeKey]: timeValue }
      }

      grouped[timeValue][userId] = item.volume
      grouped[timeValue][`${userId}_name`] = item.user_name
      grouped[timeValue][`${userId}_is_you`] = item.is_you
      grouped[timeValue][`${userId}_is_average`] = item.is_average
    })

    const participantColors = generateColors(
      Array.from(participants).map(userId => ({
        user_id: userId,
        user_name: rawData.find(item => item.user_id === userId)?.user_name || 'Unknown',
        is_you: rawData.some(item => item.user_id === userId && item.is_you),
        is_average: rawData.some(item => item.user_id === userId && item.is_average),
        volume: 0
      }))
    )
    setParticipantColors(participantColors)

    return Object.values(grouped).sort((a, b) => {
      if (timeKey === 'day') {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        return days.indexOf(a[timeKey] as string) - days.indexOf(b[timeKey] as string)
      } else {
        return parseInt(a[timeKey] as string) - parseInt(b[timeKey] as string)
      }
    })
  }

  const fetchWorkoutData = async (challengeId: string) => {
    if (!user) return
    setIsLoading(true)

    console.log('The parameter for fetchWorkoutData function: ', challengeId)

    try {
      const { data, error } = await supabase.rpc("get_user_volume_trends", {
        input_user_id: user.id,
        input_challenge_id: challengeId,
      })

      console.log('Output of database function: ', data)

      if (error) throw error
      if (!data) {
        toast({
          title: "No Data",
          description: "No workout data found for this challenge",
          variant: "default",
        })
        return
      }

      console.log("WEEKLY-DATA [Raw - FULL]: ", data)      
      console.log("WEEKLY-DATA [Raw]: ", data.weekly)
      console.log("WEEKLY-DATA [Processed]: ", transformTrendData(data.weekly || [], 'day'))

      setWeeklyData(transformTrendData(data.weekly || [], 'day'))
      setMonthlyData(transformTrendData(data.monthly || [], 'week'))
    } catch (error) {
      console.error("Error fetching workout data:", error)
      toast({
        title: "Error",
        description: "Failed to load progress data",
        variant: "destructive",
      })
      setWeeklyData([])
      setMonthlyData([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user) fetchActiveChallenges()
  }, [user])

  useEffect(() => {
    if (selectedChallenge) fetchWorkoutData(selectedChallenge)
  }, [selectedChallenge])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2 mt-2" />
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
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Progress Tracking</CardTitle>
            <CardDescription>
              {challenges.length > 0
                ? "Compare your performance with challenge participants"
                : "Join a challenge to track progress"}
            </CardDescription>
          </div>
          {challenges.length > 0 && (
            <Select
              value={selectedChallenge}
              onValueChange={setSelectedChallenge}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select challenge" />
              </SelectTrigger>
              <SelectContent>
                {challenges.map((challenge) => (
                  <SelectItem key={challenge.id} value={challenge.id}>
                    {challenge.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {challenges.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>You're not currently participating in any active challenges</p>
          </div>
        ) : weeklyData.length === 0 && monthlyData.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No workout data available for this challenge yet</p>
            <p className="text-sm">Complete a workout to see your progress</p>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>

            <TabsContent value="weekly" className="pt-4">
              <MultiParticipantChart
                data={weeklyData}
                dataKey="day"
                participantColors={participantColors}
              />
            </TabsContent>

            <TabsContent value="monthly" className="pt-4">
              <MultiParticipantChart
                data={monthlyData}
                dataKey="week"
                participantColors={participantColors}
              />
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}

function MultiParticipantChart({
  data,
  dataKey,
  participantColors
}: {
  data: TrendDataPoint[],
  dataKey: string,
  participantColors: Record<string, string>
}) {
  const { user } = useAuth()
  const participantIds = Object.keys(participantColors)

  console.log("challenge graph data:-> ", data)

  return (
    <div className="chart-container h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey={dataKey} />
          <YAxis />
          <Tooltip content={<MultiParticipantTooltip participantColors={participantColors} />} />
          <Legend />
          {participantIds.map(userId => (
            <Line
              key={userId}
              type="monotone"
              dataKey={userId}
              name={data[0]?.[`${userId}_name`] as string || userId}
              stroke={participantColors[userId]}
              strokeWidth={userId === 'average' ? 2 : userId === user?.id ? 3 : 2}
              dot={{
                r: userId === 'average' ? 3 : userId === user?.id ? 4 : 3,
                fill: participantColors[userId]
              }}
              activeDot={{ r: userId === 'average' ? 5 : 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function MultiParticipantTooltip({
  active,
  payload,
  label,
  participantColors
}: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-md shadow-md p-3">
        <p className="font-bold">{label}</p>
        {payload.map((entry: any) => {
          const userId = entry.dataKey
          const isYou = entry.payload[`${userId}_is_you`]
          const isAverage = entry.payload[`${userId}_is_average`]
          const userName = entry.payload[`${userId}_name`] ||
            (isYou ? 'You' : isAverage ? 'Average' : 'Unknown')

          return (
            <div key={userId} className="flex items-center mt-1">
              <div
                className="h-2 w-2 rounded-full mr-2"
                style={{ backgroundColor: participantColors[userId] }}
              />
              <span>{userName}: {entry.value}</span>
            </div>
          )
        })}
      </div>
    )
  }

  return null
}