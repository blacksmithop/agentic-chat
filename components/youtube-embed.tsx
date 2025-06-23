"use client"

import { useState } from "react"
import { Play } from "lucide-react"
import { Button } from "@/components/ui/button"

interface YouTubeEmbedProps {
  videoId: string
  title: string
}

export function YouTubeEmbed({ videoId, title }: YouTubeEmbedProps) {
  const [isPlaying, setIsPlaying] = useState(false)

  const handlePlay = () => {
    setIsPlaying(true)
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden max-w-md">
      <div className="relative aspect-video bg-black">
        {!isPlaying ? (
          <div className="relative w-full h-full">
            <img
              src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
              alt={title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <Button
                onClick={handlePlay}
                size="lg"
                className="rounded-full w-16 h-16 bg-red-600 hover:bg-red-700 text-white"
              >
                <Play className="h-6 w-6 ml-1" />
              </Button>
            </div>
          </div>
        ) : (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
            title={title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
      </div>
      <div className="p-3">
        <h4 className="font-medium text-sm text-foreground line-clamp-2">{title}</h4>
        <p className="text-xs text-muted-foreground mt-1">YouTube</p>
      </div>
    </div>
  )
}
