"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Activity,
  Users,
  Video,
  Trophy,
  Brain,
  HeartPulse,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export function FeaturesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".features-title", {
        y: 50,
        opacity: 0,
        duration: 0.8,
        scrollTrigger: {
          trigger: ".features-title",
          start: "top 80%",
        },
      });

      gsap.utils.toArray(".feature-card").forEach((card, i) => {
        gsap.from(card, {
          y: 50,
          opacity: 0,
          duration: 0.6,
          delay: i * 0.1,
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
          },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const features = [
    {
      icon: <Activity className="h-10 w-10 text-emerald-500" />,
      title: "Track Your Progress",
      description:
        "Log workouts, track reps, sets, and weights with our intuitive interface.",
    },
    {
      icon: <Users className="h-10 w-10 text-emerald-500" />,
      title: "Compete with Friends",
      description:
        "Challenge your gym buddies and see who can push the hardest.",
    },
    {
      icon: <Video className="h-10 w-10 text-emerald-500" />,
      title: "Exercise Library",
      description:
        "Access GIFs and videos showing proper form for hundreds of exercises.",
    },
    {
      icon: <Trophy className="h-10 w-10 text-emerald-500" />,
      title: "Performance Rankings",
      description:
        "See how you stack up against friends with detailed performance metrics.",
    },
    {
      icon: <Brain className="h-10 w-10 text-emerald-500" />,
      title: "AI Form Feedback",
      description:
        "Get personalized suggestions to improve your workout technique.",
    },
    {
      icon: <HeartPulse className="h-10 w-10 text-emerald-500" />,
      title: "Remain Healthy",
      description:
        "Get a chance and a motivation to stay physically fit with peers. ",
    },
  ];

  return (
    <div ref={sectionRef} className="py-20 bg-background">
      <div className="container px-4">
        <h2 className="features-title text-3xl font-bold text-center mb-16">
          Everything You Need to{" "}
          <span className="text-emerald-500">Crush Your Goals</span>
        </h2>

        <div
          ref={cardsRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => (
            <Card
              key={index}
              className="feature-card border-2 hover:border-emerald-500/50 transition-all duration-300"
            >
              <CardHeader>
                <div className="mb-4">{feature.icon}</div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
