"use client"

import { useState, useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { User } from "@/app/page"

interface UserMentionDropdownProps {
  users: User[]
  query: string
  onSelect: (user: User) => void
  position: { top: number; left: number }
  visible: boolean
}

export function UserMentionDropdown({ users, query, onSelect, position, visible }: UserMentionDropdownProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const filteredUsers = users.filter((user) => user.nickname.toLowerCase().includes(query.toLowerCase())).slice(0, 5)

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!visible) return

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          setSelectedIndex((prev) => (prev + 1) % filteredUsers.length)
          break
        case "ArrowUp":
          e.preventDefault()
          setSelectedIndex((prev) => (prev - 1 + filteredUsers.length) % filteredUsers.length)
          break
        case "Enter":
          e.preventDefault()
          if (filteredUsers[selectedIndex]) {
            onSelect(filteredUsers[selectedIndex])
          }
          break
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [visible, selectedIndex, filteredUsers, onSelect])

  if (!visible || filteredUsers.length === 0) return null

  return (
    <div
      className="absolute z-50 bg-card border border-border rounded-lg shadow-lg min-w-48 max-w-64"
      style={{
        top: position.top - 8,
        left: position.left,
      }}
    >
      <ScrollArea className="max-h-48">
        <div className="p-2">
          <div className="text-xs text-muted-foreground px-2 py-1 font-medium">Mention User</div>
          {filteredUsers.map((user, index) => (
            <div
              key={user.nickname}
              className={`flex items-center gap-3 px-2 py-2 rounded cursor-pointer transition-colors ${
                index === selectedIndex ? "bg-primary/10 text-primary" : "hover:bg-muted/50"
              }`}
              onClick={() => onSelect(user)}
            >
              <img
                src={user.avatar || "/placeholder.svg"}
                alt={user.nickname}
                className="w-6 h-6 rounded-full bg-white"
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{user.nickname}</div>
                {user.roles.includes("Admin") && (
                  <div className="text-xs text-amber-600 dark:text-amber-400">Admin</div>
                )}
                {user.roles.includes("Moderator") && !user.roles.includes("Admin") && (
                  <div className="text-xs text-green-600 dark:text-green-400">Moderator</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
