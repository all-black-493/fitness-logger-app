"use client"

import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { gsap } from "gsap"

export function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const descriptionRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Initial animation timeline
      const tl = gsap.timeline()

      tl.from(titleRef.current, {
        y: 50,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      })
        .from(
          descriptionRef.current,
          {
            y: 30,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out",
          },
          "-=0.4",
        )
        .from(
          ctaRef.current,
          {
            y: 20,
            opacity: 0,
            duration: 0.6,
            ease: "power3.out",
          },
          "-=0.2",
        )
        .from(
          imageRef.current,
          {
            x: 100,
            opacity: 0,
            duration: 1,
            ease: "power3.out",
          },
          "-=0.6",
        )

      // Floating animation for the image
      gsap.to(imageRef.current, {
        y: 15,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      })
    }, heroRef)

    return () => ctx.revert()
  }, [])

  return (
    <div
      ref={heroRef}
      className="relative overflow-hidden bg-gradient-to-b from-background to-emerald-50 dark:from-background dark:to-emerald-950/20"
    >
      <div className="container px-4 py-24 md:py-32 lg:py-40">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 items-center">
          <div className="flex flex-col space-y-6">
            <h1 ref={titleRef} className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Level Up Your <span className="text-emerald-500">Fitness Journey</span>
            </h1>
            <p ref={descriptionRef} className="text-lg text-muted-foreground md:text-xl">
              Track workouts, compete with friends, and perfect your form with AI-powered insights. Join the ultimate
              fitness community today.
            </p>
            <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600">
                Get Started
              </Button>
              <Button size="lg" variant="outline">
                Watch Demo
              </Button>
            </div>
          </div>
          <div ref={imageRef} className="relative h-[400px] w-full">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl opacity-20 blur-3xl"></div>
            <div className="relative h-full w-full rounded-2xl overflow-hidden border shadow-xl">
              <img
                src="/hero.jpeg?height=800&width=600"
                alt="Fitness tracking app interface"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
