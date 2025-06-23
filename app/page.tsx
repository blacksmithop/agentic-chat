"use client"

import { useState } from "react"
import { NicknameInput } from "@/components/nickname-input"
import { ChatRoom } from "@/components/chat-room"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export type User = {
  nickname: string
  ageGroup: string
  joinedAt: Date
  lastSeen: Date
  roles: string[]
  previousNicknames: string[]
  chatColor: string
  avatar: string
  status: "online" | "idle" | "busy" | "invisible"
}

export type Message = {
  id: string
  nickname: string
  content: string
  timestamp: Date
  type?: "message" | "system" | "command" | "whisper"
  embedData?: {
    type: "youtube" | "url" | "gif"
    videoId?: string
    title?: string
    url?: string
  }
  fileData?: {
    name: string
    size: number
    type: string
    url: string
  }
}

export type PrivateChat = {
  withUser: string
  messages: Message[]
  unreadCount: number
}

export type Friend = {
  nickname: string
  lastOnline: Date
  status: "online" | "away" | "offline"
}

const chatColors = [
  "#3B82F6", // Blue
  "#10B981", // Emerald
  "#8B5CF6", // Violet
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#06B6D4", // Cyan
  "#84CC16", // Lime
  "#F97316", // Orange
  "#EC4899", // Pink
  "#6366F1", // Indigo
]

export default function ChatApp() {
  const [step, setStep] = useState<"nickname" | "chat">("nickname")
  const [user, setUser] = useState<User>({
    nickname: "",
    ageGroup: "",
    joinedAt: new Date(),
    lastSeen: new Date(),
    roles: [],
    previousNicknames: [],
    chatColor: "",
    avatar: "",
    status: "online",
  })
  const [privateChats, setPrivateChats] = useState<Record<string, PrivateChat>>({})
  const [activePrivateChat, setActivePrivateChat] = useState<string | null>(null)

  const { toast } = useToast()

  const handleUserSubmit = async (nickname: string, ageGroup: string) => {
    try {
      const response = await apiClient.login({ nickname, ageGroup })

      if (response.success && response.data) {
        const userData = response.data.user
        apiClient.setToken(response.data.token)

        setUser({
          nickname: userData.nickname,
          ageGroup: userData.ageGroup,
          joinedAt: new Date(userData.joinedAt),
          lastSeen: new Date(userData.lastSeen),
          roles: userData.roles,
          previousNicknames: userData.previousNicknames,
          chatColor: userData.chatColor,
          avatar: userData.avatar,
          status: userData.status,
        })

        toast({
          title: "Welcome!",
          description: `Successfully joined as ${userData.nickname}`,
          variant: "success",
        })

        setStep("chat")
      } else {
        toast({
          title: "Login Failed",
          description: response.error || "Failed to join the chat",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Failed to connect to the chat server",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {step === "nickname" && <NicknameInput onSubmit={handleUserSubmit} />}
      {step === "chat" && (
        <ChatRoom
          user={user}
          privateChats={privateChats}
          setPrivateChats={setPrivateChats}
          activePrivateChat={activePrivateChat}
          setActivePrivateChat={setActivePrivateChat}
        />
      )}
    </div>
  )
}
