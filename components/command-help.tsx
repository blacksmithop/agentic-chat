"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Terminal, Youtube, HelpCircle, Globe, Hash, ImageIcon, User, Eye, MessageSquare, Bot } from "lucide-react"

export function CommandHelp() {
  const commands = [
    {
      command: "/help",
      description: "Show this help message",
      icon: <HelpCircle className="h-4 w-4" />,
      example: "/help",
    },
    {
      command: "/whoami",
      description: "Show your previous nicknames",
      icon: <User className="h-4 w-4" />,
      example: "/whoami",
    },
    {
      command: "/lastseen",
      description: "Check when a user was last seen",
      icon: <Eye className="h-4 w-4" />,
      example: "/lastseen username",
    },
    {
      command: "/whisper",
      description: "Send a private whisper in general chat",
      icon: <MessageSquare className="h-4 w-4" />,
      example: "/whisper username your message",
    },
    {
      command: "/askai",
      description: "Ask a question to the AI assistant",
      icon: <Bot className="h-4 w-4" />,
      example: "/askai What is the weather like?",
    },
    {
      command: "/yt",
      description: "Embed a YouTube video",
      icon: <Youtube className="h-4 w-4" />,
      example: "/yt https://youtube.com/watch?v=dQw4w9WgXcQ",
    },
    {
      command: "/link",
      description: "Embed a URL with preview",
      icon: <Globe className="h-4 w-4" />,
      example: "/link https://github.com/user/repo",
    },
    {
      command: "/gif",
      description: "Send a GIF",
      icon: <ImageIcon className="h-4 w-4" />,
      example: "/gif funny cat",
    },
  ]

  const features = [
    {
      feature: "@mentions",
      description: "Mention other users",
      icon: <Terminal className="h-4 w-4" />,
      example: "@username",
    },
    {
      feature: "#hashtags",
      description: "Add hashtags to your messages",
      icon: <Hash className="h-4 w-4" />,
      example: "#coding #fun",
    },
  ]

  return (
    <Card className="max-w-md border-0 bg-muted/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Terminal className="h-4 w-4" />
          Available Commands & Features
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Commands</h4>
          {commands.map((cmd, index) => (
            <div key={index} className="space-y-1">
              <div className="flex items-center gap-2">
                {cmd.icon}
                <Badge variant="secondary" className="font-mono text-xs">
                  {cmd.command}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{cmd.description}</p>
              <p className="text-xs text-muted-foreground font-mono bg-muted/50 px-2 py-1 rounded">{cmd.example}</p>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Features</h4>
          {features.map((feature, index) => (
            <div key={index} className="space-y-1">
              <div className="flex items-center gap-2">
                {feature.icon}
                <Badge variant="outline" className="font-mono text-xs">
                  {feature.feature}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
              <p className="text-xs text-muted-foreground font-mono bg-muted/50 px-2 py-1 rounded">{feature.example}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
