"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import {
  Dumbbell,
  Heart,
  MonitorIcon as Running,
  StretchVerticalIcon as Stretch,
  Weight,
  Bike,
  FishIcon as Swim,
  SpaceIcon as Yoga,
  Hammer,
  Footprints,
} from "lucide-react"

export function ExerciseCategories() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".category-card", {
        scale: 0.9,
        opacity: 0,
        duration: 0.5,
        stagger: 0.05,
        ease: "back.out(1.7)",
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  const categories = [
    { id: 1, name: "Strength", icon: <Dumbbell className="h-6 w-6" />, count: 45 },
    { id: 2, name: "Cardio", icon: <Heart className="h-6 w-6" />, count: 32 },
    { id: 3, name: "Running", icon: <Running className="h-6 w-6" />, count: 18 },
    { id: 4, name: "Flexibility", icon: <Stretch className="h-6 w-6" />, count: 24 },
    { id: 5, name: "Powerlifting", icon: <Weight className="h-6 w-6" />, count: 15 },
    { id: 6, name: "Cycling", icon: <Bike className="h-6 w-6" />, count: 12 },
    { id: 7, name: "Swimming", icon: <Swim className="h-6 w-6" />, count: 8 },
    { id: 8, name: "Yoga", icon: <Yoga className="h-6 w-6" />, count: 22 },
    { id: 9, name: "CrossFit", icon: <Hammer className="h-6 w-6" />, count: 28 },
    { id: 10, name: "Walking", icon: <Footprints className="h-6 w-6" />, count: 10 },
  ]

  return (
    <Card ref={containerRef}>
      <CardHeader>
        <CardTitle>Exercise Categories</CardTitle>
        <CardDescription>Browse exercises by category</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {categories.map((category) => (
            <Link
              href={`/exercises?category=${category.name.toLowerCase()}`}
              key={category.id}
              className="category-card flex flex-col items-center justify-center p-4 border rounded-lg hover:border-emerald-500/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/10 transition-all duration-300"
            >
              <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-500 mb-2">
                {category.icon}
              </div>
              <h3 className="font-medium text-center">{category.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">{category.count} exercises</p>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
