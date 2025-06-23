"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, Globe } from "lucide-react"

interface UrlEmbedProps {
  url: string
}

interface EmbedData {
  title?: string
  description?: string
  image?: string
  siteName?: string
  type?: string
  author?: string
  publishedTime?: string
}

export function UrlEmbed({ url }: UrlEmbedProps) {
  const [embedData, setEmbedData] = useState<EmbedData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    // Simulate fetching oEmbed/Open Graph data
    // In a real app, this would call your backend API
    const fetchEmbedData = async () => {
      try {
        setLoading(true)

        // Mock data based on URL patterns
        let mockData: EmbedData = {}

        if (url.includes("github.com")) {
          mockData = {
            title: "GitHub Repository",
            description: "A great open source project with lots of stars and contributions.",
            image: "/placeholder.svg?height=200&width=400&text=GitHub",
            siteName: "GitHub",
            type: "website",
            author: "Developer",
          }
        } else if (url.includes("twitter.com") || url.includes("x.com")) {
          mockData = {
            title: "Tweet from @user",
            description: "This is an interesting tweet about web development and modern frameworks.",
            image: "/placeholder.svg?height=200&width=400&text=Twitter",
            siteName: "Twitter",
            type: "article",
            author: "@user",
          }
        } else if (url.includes("medium.com")) {
          mockData = {
            title: "How to Build Modern Web Applications",
            description:
              "A comprehensive guide to building scalable web applications using modern frameworks and best practices.",
            image: "/placeholder.svg?height=200&width=400&text=Medium+Article",
            siteName: "Medium",
            type: "article",
            author: "Tech Writer",
            publishedTime: "2024-01-15",
          }
        } else if (url.includes("stackoverflow.com")) {
          mockData = {
            title: "How to implement user authentication in React?",
            description:
              "A detailed question about implementing secure user authentication in React applications with answers from the community.",
            image: "/placeholder.svg?height=200&width=400&text=Stack+Overflow",
            siteName: "Stack Overflow",
            type: "website",
          }
        } else {
          // Generic website
          const domain = new URL(url).hostname
          mockData = {
            title: `${domain} - Website`,
            description: "Check out this interesting website with great content and resources.",
            image: "/placeholder.svg?height=200&width=400&text=Website",
            siteName: domain,
            type: "website",
          }
        }

        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 1000))

        setEmbedData(mockData)
        setError(false)
      } catch (err) {
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchEmbedData()
  }, [url])

  if (loading) {
    return (
      <Card className="max-w-md border-0 bg-muted/50 animate-pulse">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className="w-16 h-16 bg-muted rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-full" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !embedData) {
    return (
      <Card className="max-w-md border-0 bg-muted/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-muted rounded-lg">
              <Globe className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">{url}</div>
              <div className="text-xs text-muted-foreground">Unable to load preview</div>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <a href={url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className="max-w-md border-0 bg-card hover:bg-muted/50 transition-colors cursor-pointer"
      onClick={() => window.open(url, "_blank")}
    >
      <CardContent className="p-0">
        {embedData.image && (
          <div className="aspect-video w-full overflow-hidden rounded-t-lg">
            <img
              src={embedData.image || "/placeholder.svg"}
              alt={embedData.title || "Preview"}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="p-4">
          <div className="space-y-2">
            {embedData.siteName && (
              <div className="flex items-center gap-2">
                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  {embedData.siteName}
                </div>
                {embedData.publishedTime && (
                  <div className="text-xs text-muted-foreground">
                    {new Date(embedData.publishedTime).toLocaleDateString()}
                  </div>
                )}
              </div>
            )}

            {embedData.title && (
              <h4 className="font-semibold text-sm line-clamp-2 text-foreground">{embedData.title}</h4>
            )}

            {embedData.description && (
              <p className="text-xs text-muted-foreground line-clamp-3">{embedData.description}</p>
            )}

            {embedData.author && <div className="text-xs text-muted-foreground">by {embedData.author}</div>}

            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-muted-foreground truncate flex-1">{new URL(url).hostname}</div>
              <ExternalLink className="h-3 w-3 text-muted-foreground ml-2" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
