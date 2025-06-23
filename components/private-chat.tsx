"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowLeft, Send, MoreVertical } from "lucide-react"
import type { User, PrivateChat as PrivateChatType } from "@/app/page"

interface PrivateChatProps {
  currentUser: User
  targetUser: User
  chat: PrivateChatType
  onSendMessage: (message: string) => void
  onBack: () => void
}

export function PrivateChat({ currentUser, targetUser, chat, onSendMessage, onBack }: PrivateChatProps) {
  const [newMessage, setNewMessage] = useState("")
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chat.messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim())
      setNewMessage("")
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const formatFullTimestamp = (date: Date) => {
    return date.toLocaleString()
  }

  const getStatusColor = (lastSeen: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - lastSeen.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 5) return "bg-green-500"
    if (diffMins < 30) return "bg-yellow-500"
    return "bg-gray-400"
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-card/50 backdrop-blur-sm border-b border-border/50 p-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="rounded-xl">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="relative">
            <img
              src={targetUser.avatar || "/placeholder.svg"}
              alt={targetUser.nickname}
              className="w-10 h-10 rounded-full bg-white"
            />
            <div
              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${getStatusColor(targetUser.lastSeen)} rounded-full border-2 border-background`}
            />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">{targetUser.nickname}</h3>
            <p className="text-xs text-muted-foreground">
              {targetUser.roles.includes("Admin") && "Admin • "}
              {targetUser.roles.includes("Moderator") && !targetUser.roles.includes("Admin") && "Moderator • "}
              Private conversation
            </p>
          </div>
          <Button variant="ghost" size="sm" className="rounded-xl">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4 custom-scrollbar">
        <div className="space-y-4">
          {chat.messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              <div className="w-16 h-16 rounded-full mx-auto mb-4 overflow-hidden">
                <img
                  src={targetUser.avatar || "/placeholder.svg"}
                  alt={targetUser.nickname}
                  className="w-full h-full object-cover bg-white"
                />
              </div>
              <p className="font-medium">Start a conversation with {targetUser.nickname}</p>
              <p className="text-sm mt-1">Send a message to get the conversation started!</p>
            </div>
          ) : (
            chat.messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.nickname === currentUser.nickname ? "justify-end" : "justify-start"} animate-fade-in`}
              >
                <div className="flex flex-col max-w-xs lg:max-w-md">
                  <div
                    className="cursor-pointer"
                    onClick={() => setSelectedMessageId(selectedMessageId === message.id ? null : message.id)}
                  >
                    <div
                      className="message-bubble"
                      style={{
                        backgroundColor:
                          message.nickname === currentUser.nickname ? currentUser.chatColor : targetUser.chatColor,
                        color: "white",
                      }}
                    >
                      <div className="text-sm leading-relaxed">{message.content}</div>
                      <div className="text-xs opacity-70 mt-1 text-right">{formatTime(message.timestamp)}</div>
                    </div>
                    {selectedMessageId === message.id && (
                      <div className="mt-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                        {formatFullTimestamp(message.timestamp)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="bg-card/50 backdrop-blur-sm border-t border-border/50 p-4">
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <Input
            type="text"
            placeholder={`Message ${targetUser.nickname}...`}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 h-12 border-0 bg-muted/50 focus:bg-muted/80 transition-colors"
            maxLength={500}
          />
          <Button type="submit" disabled={!newMessage.trim()} className="h-12 px-6 rounded-xl">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
