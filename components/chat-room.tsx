"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Send, Users, Hash, Settings, PanelRightClose, PanelRightOpen, UserPlus, RefreshCw } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import type { User, Message, PrivateChat as PrivateChatType, Friend } from "@/app/page"
import { UserProfileModal } from "@/components/user-profile-modal"
import { PrivateChat } from "@/components/private-chat"
import { YouTubeEmbed } from "@/components/youtube-embed"
import { CommandHelp } from "@/components/command-help"
import { UserMentionDropdown } from "@/components/user-mention-dropdown"
import { SettingsModal } from "@/components/settings-modal"
import { FileUploadButton } from "@/components/file-upload-button"
import { FilePreview } from "@/components/file-preview"
import { UrlEmbed } from "@/components/url-embed"
import { UploadModal } from "@/components/upload-modal"
import { StatusSelector } from "@/components/status-selector"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api"

interface ChatRoomProps {
  user: User
  privateChats: Record<string, PrivateChatType>
  setPrivateChats: React.Dispatch<React.SetStateAction<Record<string, PrivateChatType>>>
  activePrivateChat: string | null
  setActivePrivateChat: React.Dispatch<React.SetStateAction<string | null>>
}

// AI Bot user
const genieBot: User = {
  nickname: "Genie",
  ageGroup: "adults",
  joinedAt: new Date(Date.now() - 86400000 * 365), // 1 year ago
  lastSeen: new Date(), // Always online
  roles: ["Bot", "AI Assistant"],
  previousNicknames: ["ChatGenie", "AIHelper"],
  chatColor: "#9333EA", // Purple for AI
  avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Genie&backgroundColor=9333ea",
  status: "online",
}

// Update dummy users to include status
const dummyUsers: User[] = [
  {
    nickname: "Alex",
    ageGroup: "teens",
    joinedAt: new Date(Date.now() - 86400000 * 5),
    lastSeen: new Date(Date.now() - 300000),
    roles: ["Member"],
    previousNicknames: ["AlexTheGreat"],
    chatColor: "#3B82F6",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=transparent",
    status: "online",
  },
  {
    nickname: "Sarah",
    ageGroup: "young-adults",
    joinedAt: new Date(Date.now() - 86400000 * 12),
    lastSeen: new Date(Date.now() - 600000),
    roles: ["Moderator", "Helper"],
    previousNicknames: ["SarahJ", "Sarah123"],
    chatColor: "#10B981",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&backgroundColor=transparent",
    status: "busy",
  },
  {
    nickname: "Mike",
    ageGroup: "adults",
    joinedAt: new Date(Date.now() - 86400000 * 30),
    lastSeen: new Date(Date.now() - 120000),
    roles: ["Admin", "Veteran"],
    previousNicknames: ["MikeM", "Michael"],
    chatColor: "#8B5CF6",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike&backgroundColor=transparent",
    status: "online",
  },
  {
    nickname: "Emma",
    ageGroup: "teens",
    joinedAt: new Date(Date.now() - 86400000 * 3),
    lastSeen: new Date(Date.now() - 180000),
    roles: ["Member"],
    previousNicknames: [],
    chatColor: "#F59E0B",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma&backgroundColor=transparent",
    status: "idle",
  },
  {
    nickname: "David",
    ageGroup: "young-adults",
    joinedAt: new Date(Date.now() - 86400000 * 8),
    lastSeen: new Date(Date.now() - 900000),
    roles: ["Helper"],
    previousNicknames: ["Dave", "DavidK"],
    chatColor: "#EF4444",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David&backgroundColor=transparent",
    status: "online",
  },
  {
    nickname: "Lisa",
    ageGroup: "adults",
    joinedAt: new Date(Date.now() - 86400000 * 45),
    lastSeen: new Date(Date.now() - 240000),
    roles: ["Moderator"],
    previousNicknames: ["LisaP"],
    chatColor: "#06B6D4",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa&backgroundColor=transparent",
    status: "online",
  },
  genieBot, // Add the bot to the users list
]

// Dummy friends
const dummyFriends: Friend[] = [
  { nickname: "Sarah", lastOnline: new Date(Date.now() - 600000), status: "online" },
  { nickname: "Mike", lastOnline: new Date(Date.now() - 120000), status: "online" },
  { nickname: "Emma", lastOnline: new Date(Date.now() - 86400000), status: "offline" },
  { nickname: "David", lastOnline: new Date(Date.now() - 3600000), status: "away" },
]

// Enhanced dummy messages
const dummyMessages: Message[] = [
  {
    id: "1",
    nickname: "Alex",
    content: "Hey everyone! How's your day going? 😊",
    timestamp: new Date(Date.now() - 1800000),
    type: "message",
  },
  {
    id: "2",
    nickname: "Sarah",
    content: "Pretty good! Just finished work. Anyone have weekend plans?",
    timestamp: new Date(Date.now() - 1500000),
    type: "message",
  },
  {
    id: "3",
    nickname: "Mike",
    content: "Planning to go hiking with the family. Weather looks perfect! 🏔️",
    timestamp: new Date(Date.now() - 1200000),
    type: "message",
  },
]

export function ChatRoom({
  user,
  privateChats,
  setPrivateChats,
  activePrivateChat,
  setActivePrivateChat,
}: ChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>(dummyMessages)
  const [newMessage, setNewMessage] = useState("")
  const [onlineUsers, setOnlineUsers] = useState([...dummyUsers])
  const [friends] = useState<Friend[]>(dummyFriends)
  const [sidebarVisible, setSidebarVisible] = useState(true)
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showUserProfile, setShowUserProfile] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Mention functionality
  const [mentionQuery, setMentionQuery] = useState("")
  const [showMentionDropdown, setShowMentionDropdown] = useState(false)
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 })
  const [cursorPosition, setCursorPosition] = useState(0)

  const [uploadingFile, setUploadingFile] = useState<File | null>(null)
  const [showUploadModal, setShowUploadModal] = useState(false)

  // Add state for user status and track if user has joined
  const [userStatus, setUserStatus] = useState<User["status"]>("online")
  const [hasJoined, setHasJoined] = useState(false)

  const [mentionedUsers, setMentionedUsers] = useState<Set<string>>(new Set())
  const [userFriends, setUserFriends] = useState<Set<string>>(new Set())

  const { toast } = useToast()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Only show join message once when user first joins
    if (!hasJoined) {
      const currentUserWithDetails: User = {
        ...user,
        joinedAt: new Date(),
        lastSeen: new Date(),
        roles: ["Member"],
        previousNicknames: [],
        status: userStatus,
      }

      setOnlineUsers((prev) => [...prev, currentUserWithDetails])

      const joinMessage: Message = {
        id: Date.now().toString(),
        nickname: "System",
        content: `${user.nickname} joined the conversation`,
        timestamp: new Date(),
        type: "system",
      }
      setMessages((prev) => [...prev, joinMessage])
      setHasJoined(true)
    } else {
      // Just update the user status without showing join message
      setOnlineUsers((prev) => prev.map((u) => (u.nickname === user.nickname ? { ...u, status: userStatus } : u)))
    }
  }, [user, userStatus, hasJoined])

  const extractYouTubeId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
    const match = url.match(regex)
    return match ? match[1] : null
  }

  const handleFileUpload = async (file: File, type: "image" | "video" | "file") => {
    setUploadingFile(file)

    try {
      const response = await apiClient.uploadFile(file, type)
      if (response.success && response.data) {
        const message: Message = {
          id: Date.now().toString(),
          nickname: user.nickname,
          content: `Shared ${type === "image" ? "an image" : type === "video" ? "a video" : "a file"}: ${file.name}`,
          timestamp: new Date(),
          type: "message",
          fileData: {
            name: file.name,
            size: file.size,
            type: file.type,
            url: response.data.url,
          },
        }
        setMessages((prev) => [...prev, message])

        toast({
          title: "File Uploaded",
          description: `${file.name} uploaded successfully`,
          variant: "success",
        })
      } else {
        toast({
          title: "Upload Failed",
          description: response.error || "Failed to upload file",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Upload Error",
        description: "Failed to upload file",
        variant: "destructive",
      })
    } finally {
      setUploadingFile(null)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const cursorPos = e.target.selectionStart || 0

    setNewMessage(value)
    setCursorPosition(cursorPos)

    // Check for @ mentions
    const beforeCursor = value.slice(0, cursorPos)
    const mentionMatch = beforeCursor.match(/@(\w*)$/)

    if (mentionMatch) {
      const query = mentionMatch[1]
      setMentionQuery(query)
      setShowMentionDropdown(true)

      // Calculate position for dropdown
      if (inputRef.current) {
        const rect = inputRef.current.getBoundingClientRect()
        setMentionPosition({
          top: rect.top - 8,
          left: rect.left + 8,
        })
      }
    } else {
      setShowMentionDropdown(false)
      setMentionQuery("")
    }
  }

  const handleMentionSelect = (selectedUser: User) => {
    const beforeCursor = newMessage.slice(0, cursorPosition)
    const afterCursor = newMessage.slice(cursorPosition)
    const mentionMatch = beforeCursor.match(/@(\w*)$/)

    if (mentionMatch) {
      const beforeMention = beforeCursor.slice(0, mentionMatch.index)
      const newValue = `${beforeMention}@${selectedUser.nickname} ${afterCursor}`
      setNewMessage(newValue)

      // Set cursor position after the mention
      setTimeout(() => {
        if (inputRef.current) {
          const newCursorPos = beforeMention.length + selectedUser.nickname.length + 2
          inputRef.current.setSelectionRange(newCursorPos, newCursorPos)
          inputRef.current.focus()
        }
      }, 0)
    }

    setShowMentionDropdown(false)
    setMentionQuery("")
  }

  // Function to process hashtags and mentions in message content
  const processContent = (content: string, isCurrentUser = false, messageType?: string) => {
    let processedContent = content

    // Process hashtags
    processedContent = processedContent.replace(/#(\w+)/g, '<span class="text-blue-500 font-medium">#$1</span>')

    // Process mentions with different colors and ensure name visibility
    processedContent = processedContent.replace(/@(\w+)/g, (match, username) => {
      if (messageType === "whisper") {
        // For whispers, use a different color scheme
        return `<span class="text-purple-200 font-medium bg-purple-500/20 px-1 rounded">${match}</span>`
      } else {
        // For regular messages, ensure the username is visible
        const mentionColor = isCurrentUser ? "text-yellow-200" : "text-blue-300"
        return `<span class="${mentionColor} font-medium bg-black/20 px-1 rounded">${match}</span>`
      }
    })

    return processedContent
  }

  // Mock AI response function
  const generateAIResponse = (question: string): string => {
    const responses = [
      `Based on my knowledge, ${question.toLowerCase()} is an interesting topic. Here's what I can tell you...`,
      `Great question! Regarding ${question.toLowerCase()}, I'd say that it depends on several factors...`,
      `I understand you're asking about ${question.toLowerCase()}. From my training data, I can provide some insights...`,
      `That's a thoughtful question about ${question.toLowerCase()}. Let me break this down for you...`,
      `Interesting! When it comes to ${question.toLowerCase()}, there are multiple perspectives to consider...`,
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim()) {
      const content = newMessage.trim()

      // Handle commands
      if (content.startsWith("/")) {
        const [command, ...args] = content.split(" ")

        switch (command.toLowerCase()) {
          case "/help":
            const helpMessage: Message = {
              id: Date.now().toString(),
              nickname: "System",
              content: "help",
              timestamp: new Date(),
              type: "command",
            }
            setMessages((prev) => [...prev, helpMessage])
            break

          case "/whoami":
            const currentUserDetails = onlineUsers.find((u) => u.nickname === user.nickname)
            const previousNicks = currentUserDetails?.previousNicknames || []
            const whoamiContent =
              previousNicks.length > 0
                ? `You are ${user.nickname}. Previous nicknames: ${previousNicks.join(", ")}`
                : `You are ${user.nickname}. No previous nicknames.`

            const whoamiMessage: Message = {
              id: Date.now().toString(),
              nickname: "System",
              content: whoamiContent,
              timestamp: new Date(),
              type: "system",
            }
            setMessages((prev) => [...prev, whoamiMessage])
            break

          case "/lastseen":
            const targetUsername = args[0]
            if (!targetUsername) {
              toast({
                title: "Invalid Command",
                description: "Usage: /lastseen <username>",
                variant: "destructive",
              })
            } else {
              // Use an async function to handle the API call
              ;(async () => {
                try {
                  const response = await apiClient.getUserLastSeen(targetUsername)
                  if (response.success && response.data) {
                    const timeSince = getTimeSince(new Date(response.data.lastSeen))
                    const lastSeenMessage: Message = {
                      id: Date.now().toString(),
                      nickname: "System",
                      content: `${response.data.username} was last seen ${timeSince}`,
                      timestamp: new Date(),
                      type: "system",
                    }
                    setMessages((prev) => [...prev, lastSeenMessage])
                  } else {
                    toast({
                      title: "User Not Found",
                      description: response.error || `User "${targetUsername}" not found`,
                      variant: "destructive",
                    })
                  }
                } catch (error) {
                  toast({
                    title: "Error",
                    description: "Failed to check user's last seen time",
                    variant: "destructive",
                  })
                }
              })()
            }
            break

          case "/whisper":
            const [targetUser, ...messageArgs] = args
            if (!targetUser || messageArgs.length === 0) {
              const errorMessage: Message = {
                id: Date.now().toString(),
                nickname: "System",
                content: "Usage: /whisper <username> <message>",
                timestamp: new Date(),
                type: "system",
              }
              setMessages((prev) => [...prev, errorMessage])
            } else {
              const whisperContent = messageArgs.join(" ")
              const whisperMessage: Message = {
                id: Date.now().toString(),
                nickname: user.nickname,
                content: `@${targetUser} ${whisperContent}`,
                timestamp: new Date(),
                type: "whisper",
              }
              setMessages((prev) => [...prev, whisperMessage])
            }
            break

          case "/askai":
            const question = args.join(" ")
            if (!question) {
              toast({
                title: "Invalid Command",
                description: "Usage: /askai <your question>",
                variant: "destructive",
              })
            } else {
              // User's question
              const questionMessage: Message = {
                id: Date.now().toString(),
                nickname: user.nickname,
                content: `@Genie ${question}`,
                timestamp: new Date(),
                type: "message",
              }
              setMessages((prev) => [...prev, questionMessage])

              // API call to AI wrapped in async function
              ;(async () => {
                try {
                  const response = await apiClient.askAI({ question })
                  if (response.success && response.data) {
                    const aiResponse: Message = {
                      id: (Date.now() + 1).toString(),
                      nickname: "Genie",
                      content: `@${user.nickname} ${response.data.response}`,
                      timestamp: new Date(),
                      type: "message",
                    }
                    setMessages((prev) => [...prev, aiResponse])
                  } else {
                    toast({
                      title: "AI Error",
                      description: "Failed to get AI response",
                      variant: "destructive",
                    })
                  }
                } catch (error) {
                  toast({
                    title: "AI Error",
                    description: "Failed to connect to AI service",
                    variant: "destructive",
                  })
                }
              })()
            }
            break

          case "/yt":
            const url = args.join(" ")
            const videoId = extractYouTubeId(url)
            if (videoId) {
              const ytMessage: Message = {
                id: Date.now().toString(),
                nickname: user.nickname,
                content: `Shared a YouTube video`,
                timestamp: new Date(),
                type: "message",
                embedData: {
                  type: "youtube",
                  videoId,
                  title: "YouTube Video",
                },
              }
              setMessages((prev) => [...prev, ytMessage])
            } else {
              const errorMessage: Message = {
                id: Date.now().toString(),
                nickname: "System",
                content: "Invalid YouTube URL. Use: /yt https://youtube.com/watch?v=VIDEO_ID",
                timestamp: new Date(),
                type: "system",
              }
              setMessages((prev) => [...prev, errorMessage])
            }
            break

          case "/link":
            const linkUrl = args.join(" ")
            if (linkUrl && (linkUrl.startsWith("http://") || linkUrl.startsWith("https://"))) {
              const linkMessage: Message = {
                id: Date.now().toString(),
                nickname: user.nickname,
                content: `Shared a link: ${linkUrl}`,
                timestamp: new Date(),
                type: "message",
                embedData: {
                  type: "url",
                  url: linkUrl,
                  title: "Shared Link",
                },
              }
              setMessages((prev) => [...prev, linkMessage])
            } else {
              const errorMessage: Message = {
                id: Date.now().toString(),
                nickname: "System",
                content: "Invalid URL. Use: /link https://example.com",
                timestamp: new Date(),
                type: "system",
              }
              setMessages((prev) => [...prev, errorMessage])
            }
            break

          case "/gif":
            const gifQuery = args.join(" ")
            const gifMessage: Message = {
              id: Date.now().toString(),
              nickname: user.nickname,
              content: `Shared a GIF${gifQuery ? `: ${gifQuery}` : ""}`,
              timestamp: new Date(),
              type: "message",
              embedData: {
                type: "gif",
                url: "https://i.giphy.com/8Zaoyr0zW9NJLiF6Pv.webp",
                title: gifQuery || "GIF",
              },
            }
            setMessages((prev) => [...prev, gifMessage])
            break

          default:
            const unknownMessage: Message = {
              id: Date.now().toString(),
              nickname: "System",
              content: `Unknown command: ${command}. Type /help for available commands.`,
              timestamp: new Date(),
              type: "system",
            }
            setMessages((prev) => [...prev, unknownMessage])
        }
      } else {
        // Regular message
        const message: Message = {
          id: Date.now().toString(),
          nickname: user.nickname,
          content,
          timestamp: new Date(),
          type: "message",
        }
        setMessages((prev) => [...prev, message])
      }

      setNewMessage("")
      setShowMentionDropdown(false)
      setMentionQuery("")
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const formatFullTimestamp = (date: Date) => {
    return date.toLocaleString()
  }

  const handleUserClick = (clickedUser: User) => {
    setSelectedUser(clickedUser)
    setShowUserProfile(true)
  }

  const handleStartPrivateChat = (targetNickname: string) => {
    if (!privateChats[targetNickname]) {
      setPrivateChats((prev) => ({
        ...prev,
        [targetNickname]: {
          withUser: targetNickname,
          messages: [],
          unreadCount: 0,
        },
      }))
    }
    setActivePrivateChat(targetNickname)
  }

  const handleSendPrivateMessage = (content: string) => {
    if (!activePrivateChat) return

    const message: Message = {
      id: Date.now().toString(),
      nickname: user.nickname,
      content,
      timestamp: new Date(),
      type: "message",
    }

    setPrivateChats((prev) => ({
      ...prev,
      [activePrivateChat]: {
        ...prev[activePrivateChat],
        messages: [...prev[activePrivateChat].messages, message],
      },
    }))
  }

  const handleBackToMain = () => {
    setActivePrivateChat(null)
  }

  // Update the getStatusColor function to use the new status
  const getStatusColor = (userStatus: User["status"]) => {
    switch (userStatus) {
      case "online":
        return "bg-green-500"
      case "idle":
        return "bg-yellow-500"
      case "busy":
        return "bg-red-500"
      case "invisible":
        return "bg-gray-400"
      default:
        return "bg-gray-400"
    }
  }

  const getTimeSince = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return "just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  // Update the handleLinkEmbed function to detect YouTube URLs
  const handleLinkEmbed = (url: string) => {
    // Check if it's a YouTube URL
    const videoId = extractYouTubeId(url)

    if (videoId) {
      // If it's a YouTube URL, create a YouTube embed instead
      const ytMessage: Message = {
        id: Date.now().toString(),
        nickname: user.nickname,
        content: `Shared a YouTube video`,
        timestamp: new Date(),
        type: "message",
        embedData: {
          type: "youtube",
          videoId,
          title: "YouTube Video",
        },
      }
      setMessages((prev) => [...prev, ytMessage])
    } else {
      // Regular link embed
      const linkMessage: Message = {
        id: Date.now().toString(),
        nickname: user.nickname,
        content: `Shared a link: ${url}`,
        timestamp: new Date(),
        embedData: {
          type: "url",
          url: url,
          title: "Shared Link",
        },
      }
      setMessages((prev) => [...prev, linkMessage])
    }
  }

  // Add status change handler - only show status change message, not join message
  const handleStatusChange = async (newStatus: User["status"]) => {
    setUserStatus(newStatus)

    // API call to update status
    try {
      const response = await apiClient.updateStatus({ status: newStatus })
      if (response.success) {
        toast({
          title: "Status Updated",
          description: `You are now ${newStatus}`,
          variant: "success",
        })
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to update status",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      })
    }
  }

  // Add user action handlers
  const handleMuteUser = (targetUser: User) => {
    toast({
      title: "User Muted",
      description: `You muted ${targetUser.nickname}`,
      variant: "info",
    })
  }

  const handleBlockUser = (targetUser: User) => {
    toast({
      title: "User Blocked",
      description: `You blocked ${targetUser.nickname}`,
      variant: "warning",
    })
  }

  const handleKickUser = (targetUser: User) => {
    const kickMessage: Message = {
      id: Date.now().toString(),
      nickname: "System",
      content: `${targetUser.nickname} was kicked from the channel`,
      timestamp: new Date(),
      type: "system",
    }
    setMessages((prev) => [...prev, kickMessage])
  }

  const handleBanUser = (targetUser: User) => {
    const banMessage: Message = {
      id: Date.now().toString(),
      nickname: "System",
      content: `${targetUser.nickname} was banned from the channel`,
      timestamp: new Date(),
      type: "system",
    }
    setMessages((prev) => [...prev, banMessage])
  }

  const handleRefreshMembers = async () => {
    try {
      const response = await apiClient.getUsers()
      if (response.success) {
        toast({
          title: "Members Refreshed",
          description: "Members list updated successfully",
          variant: "success",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to refresh members list",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh members list",
        variant: "destructive",
      })
    }
  }

  const handleRefreshFriends = () => {
    toast({
      title: "Friends Refreshed",
      description: "Friends list updated successfully",
      variant: "success",
    })
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="bg-card/50 backdrop-blur-sm border-b border-border/50 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                <Hash className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">General</h1>
                <p className="text-sm text-muted-foreground">{onlineUsers.length} members online</p>
              </div>
            </div>
            {/* In the header section, add the StatusSelector */}
            <div className="flex items-center gap-2">
              <StatusSelector currentStatus={userStatus} onStatusChange={handleStatusChange} />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarVisible(!sidebarVisible)}
                className="rounded-xl"
              >
                {sidebarVisible ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="sm" className="rounded-xl" onClick={() => setShowSettings(true)}>
                <Settings className="h-4 w-4" />
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-hidden relative">
          <ScrollArea className="h-full px-6 py-4 custom-scrollbar">
            <div className="space-y-6 pb-4">
              {messages.map((message) => (
                <div key={message.id} className="animate-fade-in">
                  {message.type === "system" ? (
                    <div className="flex justify-center">
                      <div className="bg-muted/50 text-muted-foreground text-xs px-3 py-1.5 rounded-full">
                        {message.content}
                      </div>
                    </div>
                  ) : message.type === "command" && message.content === "help" ? (
                    <div className="flex justify-center">
                      <CommandHelp />
                    </div>
                  ) : (
                    <div className={`flex ${message.nickname === user.nickname ? "justify-end" : "justify-start"}`}>
                      <div className="flex flex-col max-w-xs lg:max-w-md">
                        {message.nickname !== user.nickname && (
                          <div className="flex items-center gap-2 mb-1 ml-4">
                            <img
                              src={
                                onlineUsers.find((u) => u.nickname === message.nickname)?.avatar ||
                                `https://api.dicebear.com/7.x/avataaars/svg?seed=${message.nickname || "/placeholder.svg"}&backgroundColor=transparent`
                              }
                              alt={message.nickname}
                              className="w-5 h-5 rounded-full"
                            />
                            <span className="text-sm font-medium text-foreground">{message.nickname}</span>
                            <span className="text-xs text-muted-foreground">{formatTime(message.timestamp)}</span>
                          </div>
                        )}
                        <div
                          className="cursor-pointer"
                          onClick={() => setSelectedMessageId(selectedMessageId === message.id ? null : message.id)}
                        >
                          <div
                            className="message-bubble"
                            style={{
                              backgroundColor:
                                message.type === "whisper"
                                  ? "#7C3AED" // Purple for whispers
                                  : message.nickname === user.nickname
                                    ? user.chatColor
                                    : onlineUsers.find((u) => u.nickname === message.nickname)?.chatColor || "#6B7280",
                              color: "white",
                            }}
                          >
                            <div
                              className={`text-sm leading-relaxed ${
                                message.content.includes(`@${user.nickname}`)
                                  ? "bg-yellow-500/20 border-l-2 border-yellow-500 pl-2"
                                  : ""
                              }`}
                              dangerouslySetInnerHTML={{
                                __html: processContent(
                                  message.content,
                                  message.nickname === user.nickname,
                                  message.type,
                                ),
                              }}
                            />
                            {message.nickname === user.nickname && (
                              <div className="text-xs opacity-70 mt-1 text-right">{formatTime(message.timestamp)}</div>
                            )}
                            {message.type === "whisper" && (
                              <div className="text-xs opacity-70 mt-1 text-right italic">whisper</div>
                            )}
                          </div>
                          {message.embedData?.type === "youtube" && (
                            <div className="mt-2">
                              <YouTubeEmbed videoId={message.embedData.videoId} title={message.embedData.title} />
                            </div>
                          )}
                          {message.fileData && (
                            <div className="mt-2">
                              <FilePreview file={message.fileData} />
                            </div>
                          )}
                          {message.embedData?.type === "url" && (
                            <div className="mt-2">
                              <UrlEmbed url={message.embedData.url!} />
                            </div>
                          )}
                          {message.embedData?.type === "gif" && (
                            <div className="mt-2">
                              <img
                                src={message.embedData.url || "/placeholder.svg"}
                                alt={message.embedData.title}
                                className="max-w-xs rounded-lg"
                              />
                            </div>
                          )}
                          {selectedMessageId === message.id && (
                            <div className="mt-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                              {formatFullTimestamp(message.timestamp)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </div>

        {/* Message Input - Sticky at bottom */}
        <div className="bg-card/50 backdrop-blur-sm border-t border-border/50 p-6 flex-shrink-0 relative">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <FileUploadButton onOpenModal={() => setShowUploadModal(true)} disabled={!!uploadingFile} />
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                type="text"
                placeholder={
                  uploadingFile
                    ? `Uploading ${uploadingFile.name}...`
                    : "Type a message, @mention someone, #hashtag, or /help for commands..."
                }
                value={newMessage}
                onChange={handleInputChange}
                className="h-12 border-0 bg-muted/50 focus:bg-muted/80 transition-colors pr-4"
                maxLength={500}
                disabled={!!uploadingFile}
              />
              <UserMentionDropdown
                users={onlineUsers.filter((u) => u.nickname !== user.nickname)}
                query={mentionQuery}
                onSelect={handleMentionSelect}
                position={mentionPosition}
                visible={showMentionDropdown}
              />
            </div>
            <Button type="submit" disabled={!newMessage.trim() || !!uploadingFile} className="h-12 px-6 rounded-xl">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>

      {/* Right Sidebar */}
      {sidebarVisible && (
        <div className="w-80 bg-card/30 backdrop-blur-sm border-l border-border/50 flex flex-col flex-shrink-0">
          {activePrivateChat ? (
            <PrivateChat
              currentUser={onlineUsers.find((u) => u.nickname === user.nickname) || user}
              targetUser={onlineUsers.find((u) => u.nickname === activePrivateChat) || onlineUsers[0]}
              chat={privateChats[activePrivateChat]}
              onSendMessage={handleSendPrivateMessage}
              onBack={handleBackToMain}
            />
          ) : (
            <Tabs defaultValue="members" className="flex flex-col h-full">
              <div className="p-4 border-b border-border/50 flex-shrink-0">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="members" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Members
                  </TabsTrigger>
                  <TabsTrigger value="friends" className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Friends
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="members" className="flex-1 m-0 overflow-hidden">
                <div className="p-4 border-b border-border/50 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">Online</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{onlineUsers.length}</Badge>
                      <Button variant="ghost" size="sm" onClick={handleRefreshMembers} className="h-6 w-6 p-0">
                        <RefreshCw className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
                <ScrollArea className="flex-1 p-4 custom-scrollbar">
                  <div className="space-y-2">
                    {onlineUsers.map((onlineUser, index) => (
                      <div
                        key={index}
                        onClick={() => handleUserClick(onlineUser)}
                        className={`group p-3 rounded-xl cursor-pointer transition-all hover:bg-muted/50 ${
                          onlineUser.nickname === user.nickname ? "bg-primary/10 border border-primary/20" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <img
                              src={onlineUser.avatar || "/placeholder.svg"}
                              alt={onlineUser.nickname}
                              className="w-10 h-10 rounded-full bg-white"
                            />
                            {/* Update the status indicator in the user list to use the status property */}
                            <div
                              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${getStatusColor(onlineUser.status)} rounded-full border-2 border-background`}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground truncate">{onlineUser.nickname}</span>
                              {onlineUser.nickname === user.nickname && (
                                <Badge variant="secondary" className="text-xs">
                                  You
                                </Badge>
                              )}
                              {onlineUser.roles.includes("Bot") && (
                                <Badge variant="outline" className="text-xs text-purple-600 border-purple-600">
                                  Bot
                                </Badge>
                              )}
                            </div>
                            {onlineUser.roles.includes("Admin") && (
                              <span className="text-xs text-amber-600 dark:text-amber-400">Admin</span>
                            )}
                            {onlineUser.roles.includes("Moderator") && !onlineUser.roles.includes("Admin") && (
                              <span className="text-xs text-green-600 dark:text-green-400">Moderator</span>
                            )}
                            {onlineUser.roles.includes("AI Assistant") && (
                              <span className="text-xs text-purple-600 dark:text-purple-400">AI Assistant</span>
                            )}
                          </div>
                          {privateChats[onlineUser.nickname]?.unreadCount > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {privateChats[onlineUser.nickname].unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="friends" className="flex-1 m-0 overflow-hidden">
                <div className="p-4 border-b border-border/50 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">Friends</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{friends.length}</Badge>
                      <Button variant="ghost" size="sm" onClick={handleRefreshFriends} className="h-6 w-6 p-0">
                        <RefreshCw className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
                <ScrollArea className="flex-1 p-4 custom-scrollbar">
                  <div className="space-y-2">
                    {friends.map((friend, index) => (
                      <div
                        key={index}
                        className="group p-3 rounded-xl cursor-pointer transition-all hover:bg-muted/50"
                        onClick={() => {
                          const friendUser = onlineUsers.find((u) => u.nickname === friend.nickname)
                          if (friendUser) {
                            handleUserClick(friendUser)
                          }
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <img
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.nickname}&backgroundColor=transparent`}
                              alt={friend.nickname}
                              className="w-10 h-10 rounded-full bg-white"
                            />
                            <div
                              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${
                                friend.status === "online"
                                  ? "bg-green-500"
                                  : friend.status === "away"
                                    ? "bg-yellow-500"
                                    : "bg-gray-400"
                              } rounded-full border-2 border-background`}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground truncate">{friend.nickname}</span>
                              <Badge
                                variant="secondary"
                                className={`text-xs ${
                                  friend.status === "online"
                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                    : friend.status === "away"
                                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                      : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                                }`}
                              >
                                {friend.status}
                              </Badge>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              Last online {getTimeSince(friend.lastOnline)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          )}
        </div>
      )}

      {/* User Profile Modal */}
      <UserProfileModal
        user={selectedUser}
        isOpen={showUserProfile}
        onClose={() => setShowUserProfile(false)}
        onStartPrivateChat={handleStartPrivateChat}
        currentUser={onlineUsers.find((u) => u.nickname === user.nickname) || user}
        onMuteUser={handleMuteUser}
        onBlockUser={handleBlockUser}
        onKickUser={handleKickUser}
        onBanUser={handleBanUser}
        isFriend={userFriends.has(selectedUser?.nickname || "")}
        onAddFriend={(targetUser) => {
          setUserFriends((prev) => new Set([...prev, targetUser.nickname]))
          const friendMessage: Message = {
            id: Date.now().toString(),
            nickname: "System",
            content: `You are now friends with ${targetUser.nickname}`,
            timestamp: new Date(),
            type: "system",
          }
          setMessages((prev) => [...prev, friendMessage])
        }}
        onRemoveFriend={(targetUser) => {
          setUserFriends((prev) => {
            const newSet = new Set(prev)
            newSet.delete(targetUser.nickname)
            return newSet
          })
          const unfriendMessage: Message = {
            id: Date.now().toString(),
            nickname: "System",
            content: `You are no longer friends with ${targetUser.nickname}`,
            timestamp: new Date(),
            type: "system",
          }
          setMessages((prev) => [...prev, unfriendMessage])
        }}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        currentUser={onlineUsers.find((u) => u.nickname === user.nickname) || user}
        onStatusChange={handleStatusChange}
      />

      {/* Upload Modal */}
      <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onFileUpload={handleFileUpload}
        onLinkEmbed={handleLinkEmbed}
      />
    </div>
  )
}
