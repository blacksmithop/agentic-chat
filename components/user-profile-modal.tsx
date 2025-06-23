"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { MessageCircle, Clock, Tag, Crown, Shield, VolumeX, UserX, UserMinus, Ban, UserPlus } from "lucide-react"
import type { User as UserType } from "@/app/page"
import { useState, useEffect } from "react"

interface UserProfileModalProps {
  user: UserType | null
  isOpen: boolean
  onClose: () => void
  onStartPrivateChat: (nickname: string) => void
  currentUser: UserType
  onMuteUser: (user: UserType) => void
  onBlockUser: (user: UserType) => void
  onKickUser: (user: UserType) => void
  onBanUser: (user: UserType) => void
  isFriend?: boolean
  onAddFriend?: (user: UserType) => void
  onRemoveFriend?: (user: UserType) => void
}

export function UserProfileModal({
  user,
  isOpen,
  onClose,
  onStartPrivateChat,
  currentUser,
  onMuteUser,
  onBlockUser,
  onKickUser,
  onBanUser,
  isFriend = false,
  onAddFriend,
  onRemoveFriend,
}: UserProfileModalProps) {
  const [isMuted, setIsMuted] = useState(false)
  const [isBlocked, setIsBlocked] = useState(false)
  const [isBanned, setIsBanned] = useState(false)
  const [isFriendState, setIsFriendState] = useState(isFriend)

  useEffect(() => {
    setIsFriendState(isFriend)
  }, [isFriend])

  if (!user) return null

  const formatDate = (date: Date) => {
    return date.toLocaleDateString() + " at " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const getTimeSince = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins} minutes ago`
    if (diffHours < 24) return `${diffHours} hours ago`
    return `${diffDays} days ago`
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "Admin":
        return <Crown className="h-3 w-3" />
      case "Moderator":
        return <Shield className="h-3 w-3" />
      default:
        return <Tag className="h-3 w-3" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Admin":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
      case "Moderator":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "Helper":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "Veteran":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      case "Bot":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      case "AI Assistant":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getStatusLabel = (status: UserType["status"]) => {
    switch (status) {
      case "online":
        return "Online"
      case "idle":
        return "Idle"
      case "busy":
        return "Busy"
      case "invisible":
        return "Invisible"
      default:
        return "Unknown"
    }
  }

  const getStatusColor = (status: UserType["status"]) => {
    switch (status) {
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

  // Check if current user has moderation permissions
  const canModerate = currentUser.roles.includes("Admin") || currentUser.roles.includes("Moderator")
  const isTargetSelf = user.nickname === currentUser.nickname
  const isTargetAdmin = user.roles.includes("Admin")
  const isCurrentUserAdmin = currentUser.roles.includes("Admin")
  const isTargetBot = user.roles.includes("Bot")

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-0 bg-card/95 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <img
                src={user.avatar || "/placeholder.svg"}
                alt={user.nickname}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to initials if image fails to load
                  e.currentTarget.style.display = "none"
                  e.currentTarget.nextElementSibling!.style.display = "flex"
                }}
              />
              <div
                className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl"
                style={{ display: "none" }}
              >
                {user.nickname.charAt(0).toUpperCase()}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span>{user.nickname}</span>
                {user.nickname === currentUser.nickname && (
                  <Badge variant="secondary" className="text-xs">
                    You
                  </Badge>
                )}
                {isTargetBot && (
                  <Badge variant="outline" className="text-xs text-purple-600 border-purple-600">
                    Bot
                  </Badge>
                )}
              </div>
              {user.roles.includes("Admin") && (
                <div className="flex items-center gap-1 mt-1">
                  <Crown className="h-3 w-3 text-amber-600" />
                  <span className="text-xs text-amber-600 dark:text-amber-400">Administrator</span>
                </div>
              )}
              {user.roles.includes("Moderator") && !user.roles.includes("Admin") && (
                <div className="flex items-center gap-1 mt-1">
                  <Shield className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-600 dark:text-green-400">Moderator</span>
                </div>
              )}
              {user.roles.includes("AI Assistant") && (
                <div className="flex items-center gap-1 mt-1">
                  <Tag className="h-3 w-3 text-purple-600" />
                  <span className="text-xs text-purple-600 dark:text-purple-400">AI Assistant</span>
                </div>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 ${getStatusColor(user.status)} rounded-full`} />
              <span className="text-sm text-muted-foreground">Status:</span>
            </div>
            <span className="text-sm font-medium">{getStatusLabel(user.status)}</span>
          </div>

          {/* Roles */}
          {user.roles.length > 0 && (
            <div className="flex items-center gap-3 flex-wrap">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Roles:</span>
              <div className="flex gap-2 flex-wrap">
                {user.roles.map((role, index) => (
                  <Badge key={index} className={`text-xs flex items-center gap-1 ${getRoleColor(role)}`}>
                    {getRoleIcon(role)}
                    {role}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Joined At */}
          <div className="flex items-center gap-3">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Joined:</span>
            <span className="text-sm">{formatDate(user.joinedAt)}</span>
          </div>

          {/* Last Seen */}
          <div className="flex items-center gap-3">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Last seen:</span>
            <span className="text-sm">{getTimeSince(user.lastSeen)}</span>
          </div>

          {/* Previous Nicknames */}
          {user.previousNicknames.length > 0 && (
            <>
              <Separator />
              <div>
                <span className="text-sm text-muted-foreground mb-3 block">Previous nicknames:</span>
                <div className="flex flex-wrap gap-2">
                  {user.previousNicknames.map((nickname, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {nickname}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Actions */}
          {!isTargetSelf && (
            <>
              <Separator />
              <div className="space-y-3">
                {/* Primary Actions */}
                <div className="space-y-2">
                  <Button
                    onClick={() => {
                      onStartPrivateChat(user.nickname)
                      onClose()
                    }}
                    className="w-full h-12 rounded-xl"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Send Private Message
                  </Button>

                  {/* Friend Management - Not available for bots */}
                  {!isTargetBot && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (isFriendState) {
                          onRemoveFriend?.(user)
                        } else {
                          onAddFriend?.(user)
                        }
                      }}
                      className="w-full h-10 rounded-xl"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      {isFriendState ? "Remove Friend" : "Add Friend"}
                    </Button>
                  )}
                </div>

                {/* User Actions - Available for bots (mute/block) */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (isMuted) {
                        setIsMuted(false)
                      } else {
                        onMuteUser(user)
                        setIsMuted(true)
                      }
                      onClose()
                    }}
                    className="flex items-center gap-2"
                  >
                    <VolumeX className="h-4 w-4" />
                    {isMuted ? "Unmute" : "Mute"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (isBlocked) {
                        setIsBlocked(false)
                      } else {
                        onBlockUser(user)
                        setIsBlocked(true)
                      }
                      onClose()
                    }}
                    className="flex items-center gap-2 text-destructive hover:text-destructive"
                  >
                    <UserX className="h-4 w-4" />
                    {isBlocked ? "Unblock" : "Block"}
                  </Button>
                </div>

                {/* Moderation Actions - Not available for bots */}
                {canModerate && !isTargetAdmin && !isTargetBot && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <span className="text-sm font-medium text-muted-foreground">Moderation Actions</span>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            onKickUser(user)
                            onClose()
                          }}
                          className="flex items-center gap-2 text-orange-600 hover:text-orange-600"
                        >
                          <UserMinus className="h-4 w-4" />
                          Kick
                        </Button>
                        {/* Only admins can ban/whitelist */}
                        {isCurrentUserAdmin && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (isBanned) {
                                // Whitelist logic
                                setIsBanned(false)
                              } else {
                                onBanUser(user)
                                setIsBanned(true)
                              }
                              onClose()
                            }}
                            className="flex items-center gap-2 text-destructive hover:text-destructive"
                          >
                            <Ban className="h-4 w-4" />
                            {isBanned ? "Whitelist" : "Ban"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
