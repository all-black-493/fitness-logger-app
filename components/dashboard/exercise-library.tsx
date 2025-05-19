"use client";

import { useState, useEffect, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { gsap } from "gsap";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Play, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { API_OPTIONS } from "./apis/api";
import { BASE_URL } from "./urls/urls";

interface Exercise {
  id: string;
  name: string;
  bodyPart: string;
  gifUrl: string;
  target?: string;
  equipment?: string;
}

export function ExerciseLibrary() {
  const [searchTerm, setSearchTerm] = useState("");
  const libraryRef = useRef<HTMLDivElement>(null);

  const fetchExercises = async ({ pageParam = 1 }) => {
    const url = `${BASE_URL}?limit=20&offset=${pageParam}`;
    const response = await fetch(url, API_OPTIONS);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.json();
  };

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["exercises"],
    queryFn: fetchExercises,
    getNextPageParam: (lastPage, allPages) => {
      const nextOffset = allPages.length * 20;
      return lastPage.length === 20 ? nextOffset : undefined;
    },
    initialPageParam: 1,
  });

  const allExercises = data?.pages.flat() || [];

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".exercise-card", {
        scale: 0.9,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "power3.out",
      });
    }, libraryRef);

    return () => ctx.revert();
  }, [allExercises]);

  const filteredExercises = allExercises.filter(
    (exercise) =>
      exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.bodyPart.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const bodyParts = [
    ...new Set(allExercises.map((exercise) => exercise.bodyPart)),
  ];

  return (
    <Card ref={libraryRef}>
      <CardHeader>
        <CardTitle>Exercise Library</CardTitle>
        <CardDescription>
          Browse exercises and learn proper form
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search exercises..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Tabs defaultValue="all">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-4 lg:grid-cols-6 mb-2 overflow-x-auto gap-0.5">
            {bodyParts.map((bodyPart, index) => (
              <TabsTrigger key={index} value={bodyPart} className="capitalize">
                {bodyPart}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredExercises.map((exercise) => (
                <ExerciseCard key={exercise.id} exercise={exercise} />
              ))}
            </div>
            <div className="mt-4 flex justify-center">
              <Button
                onClick={() => fetchNextPage()}
                disabled={!hasNextPage || isFetchingNextPage}
                className="mt-4"
              >
                {isFetchingNextPage
                  ? "Loading more..."
                  : hasNextPage
                  ? "Load More"
                  : "Nothing more to load"}
              </Button>
            </div>
          </TabsContent>

          {bodyParts.map((bodyPart, index) => (
            <TabsContent key={index} value={bodyPart} className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredExercises
                  .filter((ex) => ex.bodyPart === bodyPart)
                  .map((exercise) => (
                    <ExerciseCard key={exercise.id} exercise={exercise} />
                  ))}
              </div>
              <div className="mt-4 flex justify-center">
                <Button
                  onClick={() => fetchNextPage()}
                  disabled={!hasNextPage || isFetchingNextPage}
                  className="mt-4"
                >
                  {isFetchingNextPage
                    ? "Loading more..."
                    : hasNextPage
                    ? "Load More"
                    : "Nothing more to load"}
                </Button>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}

function ExerciseCard({ exercise }: { exercise: Exercise }) {
  return (
    <div className="exercise-card border rounded-lg overflow-hidden">
      <div className="relative h-40 bg-muted">
        <img
          src={exercise.gifUrl || "/placeholder.svg"}
          alt={exercise.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-3">
        <h3 className="font-medium">{exercise.name}</h3>
        <p className="text-xs text-muted-foreground capitalize">
          {exercise.bodyPart}
        </p>
        <div className="flex gap-2 mt-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="w-full">
                <Info className="h-3.5 w-3.5 mr-1" />
                Details
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{exercise.name}</DialogTitle>
                <DialogDescription>
                  Learn how to perform this exercise correctly
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col space-y-4">
                <div className="aspect-video bg-muted rounded-md overflow-hidden">
                  <img
                    src={exercise.gifUrl || "/placeholder.svg"}
                    alt={exercise.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Instructions</h4>
                  <p className="text-sm text-muted-foreground">
                    Detailed instructions on how to perform the {exercise.name}{" "}
                    with proper form. This would include step-by-step guidance
                    and tips to maximize effectiveness and prevent injury.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Video Tutorial</h4>
                  <Button variant="outline" className="w-full">
                    <Play className="h-4 w-4 mr-2" />
                    Watch on YouTube
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
