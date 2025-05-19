"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, ArrowUpRight } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

interface CommunityEventsProps {
  id: string
}

export function CommunityEvents({ id }: CommunityEventsProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Mock events data
  const events = [
    {
      id: 1,
      title: "Summer Powerlifting Meet",
      date: new Date(2025, 5, 15), // June 15, 2025
      location: "City Strength Gym, Downtown",
      participants: 32,
      joined: true,
    },
    {
      id: 2,
      title: "Technique Workshop: Squat",
      date: new Date(2025, 5, 22), // June 22, 2025
      location: "Iron Temple Fitness",
      participants: 18,
      joined: false,
    },
    {
      id: 3,
      title: "Nutrition Seminar",
      date: new Date(2025, 5, 29), // June 29, 2025
      location: "Online Zoom Meeting",
      participants: 45,
      joined: false,
    },
  ]

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".event-item", {
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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>Community meetups and activities</CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="text-xs">
            <Calendar className="h-3.5 w-3.5 mr-1" />
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.map((event) => (
            <div
              key={event.id}
              className="event-item border rounded-lg p-3 hover:border-emerald-500/50 transition-all duration-300"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-sm">{event.title}</h3>
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    <Calendar className="h-3.5 w-3.5 mr-1" />
                    <span>{format(event.date, "MMM d, yyyy")}</span>
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    <MapPin className="h-3.5 w-3.5 mr-1" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    <Users className="h-3.5 w-3.5 mr-1" />
                    <span>{event.participants} attending</span>
                  </div>
                </div>
                {event.joined && <Badge className="bg-emerald-500 hover:bg-emerald-600 text-xs">Going</Badge>}
              </div>
              <div className="mt-3 flex justify-between">
                <Button
                  variant={event.joined ? "outline" : "default"}
                  size="sm"
                  className={`text-xs ${!event.joined ? "bg-emerald-500 hover:bg-emerald-600" : ""}`}
                >
                  {event.joined ? "Cancel RSVP" : "RSVP"}
                </Button>
                <Button variant="ghost" size="sm" className="text-xs" asChild>
                  <Link href={`/communities/${id}/events/${event.id}`}>
                    <span>Details</span>
                    <ArrowUpRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
