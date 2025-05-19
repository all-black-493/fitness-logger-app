"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, ThumbsUp, Share2, ImageIcon, Smile, Send } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface CommunityPostsProps {
  id: string
}

export function CommunityPosts({ id }: CommunityPostsProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [newPost, setNewPost] = useState("")

  // Mock posts data
  const posts = [
    {
      id: 1,
      user: {
        name: "Mike Smith",
        image: "/placeholder.svg?height=40&width=40",
        role: "admin",
      },
      content:
        "Just hit a new PR on my bench press today! 315 lbs for 2 reps. Been working on my form for months and it's finally paying off. Any tips for getting to 3 plates?",
      image: "/placeholder.svg?height=400&width=600",
      likes: 24,
      comments: 8,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      liked: true,
    },
    {
      id: 2,
      user: {
        name: "Sarah Johnson",
        image: "/placeholder.svg?height=40&width=40",
        role: "moderator",
      },
      content:
        "Form check on my deadlift please! I'm trying to fix my lower back rounding. This is 225 lbs for 5 reps. Any feedback is appreciated!",
      video: true,
      videoThumbnail: "/placeholder.svg?height=400&width=600",
      likes: 18,
      comments: 12,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
      liked: false,
    },
    {
      id: 3,
      user: {
        name: "You",
        image: "/placeholder.svg?height=40&width=40",
        role: "member",
      },
      content:
        "What's your favorite program for increasing squat strength? I've been running 5/3/1 for a few months but looking to try something new.",
      likes: 15,
      comments: 6,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      liked: false,
    },
    {
      id: 4,
      user: {
        name: "Alex Williams",
        image: "/placeholder.svg?height=40&width=40",
        role: "member",
      },
      content:
        "Just registered for my first powerlifting meet in June! Any advice for a first-time competitor? I'm both excited and nervous!",
      likes: 32,
      comments: 15,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      liked: true,
    },
  ]

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".post-card", {
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.2,
        ease: "power2.out",
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle post submission
    setNewPost("")
  }

  return (
    <div ref={containerRef}>
      <Card className="mb-6">
        <CardContent className="p-4">
          <form onSubmit={handlePostSubmit}>
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Your Avatar" />
                <AvatarFallback>YA</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  placeholder="Share something with the community..."
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
                <div className="flex justify-between items-center mt-3">
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm">
                      <ImageIcon className="h-4 w-4 mr-1" />
                      Photo
                    </Button>
                    <Button type="button" variant="outline" size="sm">
                      <Smile className="h-4 w-4 mr-1" />
                      Emoji
                    </Button>
                  </div>
                  <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600" disabled={!newPost.trim()}>
                    <Send className="h-4 w-4 mr-1" />
                    Post
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <Tabs defaultValue="recent">
        <TabsList className="w-full grid grid-cols-3 mb-6">
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="popular">Popular</TabsTrigger>
          <TabsTrigger value="your-posts">Your Posts</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="mt-0 space-y-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </TabsContent>

        <TabsContent value="popular" className="mt-0 space-y-6">
          {[...posts]
            .sort((a, b) => b.likes - a.likes)
            .map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
        </TabsContent>

        <TabsContent value="your-posts" className="mt-0 space-y-6">
          {posts
            .filter((post) => post.user.name === "You")
            .map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface Post {
  id: number
  user: {
    name: string
    image: string
    role: string
  }
  content: string
  image?: string
  video?: boolean
  videoThumbnail?: string
  likes: number
  comments: number
  timestamp: Date
  liked: boolean
}

function PostCard({ post }: { post: Post }) {
  const [liked, setLiked] = useState(post.liked)
  const [likeCount, setLikeCount] = useState(post.likes)

  const toggleLike = () => {
    if (liked) {
      setLikeCount(likeCount - 1)
    } else {
      setLikeCount(likeCount + 1)
    }
    setLiked(!liked)
  }

  return (
    <Card className="post-card">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={post.user.image || "/placeholder.svg"} alt={post.user.name} />
            <AvatarFallback>{post.user.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center">
              <div className="font-medium">{post.user.name}</div>
              {post.user.name === "You" && (
                <Badge variant="outline" className="ml-2 text-xs">
                  You
                </Badge>
              )}
              {post.user.role !== "member" && (
                <Badge className="ml-2 text-xs bg-emerald-500 hover:bg-emerald-600">
                  <span className="capitalize">{post.user.role}</span>
                </Badge>
              )}
              <div className="text-xs text-muted-foreground ml-auto">
                {formatDistanceToNow(post.timestamp, { addSuffix: true })}
              </div>
            </div>

            <div className="mt-2">{post.content}</div>

            {post.image && (
              <div className="mt-3 rounded-lg overflow-hidden border">
                <img src={post.image || "/placeholder.svg"} alt="Post attachment" className="w-full h-auto" />
              </div>
            )}

            {post.video && (
              <div className="mt-3 rounded-lg overflow-hidden border relative">
                <img src={post.videoThumbnail || "/placeholder.svg"} alt="Video thumbnail" className="w-full h-auto" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-16 w-16 rounded-full bg-black/60 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="white"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-white"
                    >
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center mt-4 pt-3 border-t">
              <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={toggleLike}>
                <ThumbsUp className={`h-4 w-4 mr-1 ${liked ? "fill-emerald-500 text-emerald-500" : ""}`} />
                <span>{likeCount}</span>
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                <MessageSquare className="h-4 w-4 mr-1" />
                <span>{post.comments}</span>
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground ml-auto">
                <Share2 className="h-4 w-4 mr-1" />
                <span>Share</span>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
