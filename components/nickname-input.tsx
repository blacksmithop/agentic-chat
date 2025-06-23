"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { MessageCircle, Sparkles } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

interface NicknameInputProps {
  onSubmit: (nickname: string, ageGroup: string) => void
}

const ageGroups = [
  { id: "teens", label: "13-17", icon: "🎮" },
  { id: "young-adults", label: "18-29", icon: "💼" },
  { id: "adults", label: "30+", icon: "🏠" },
]

export function NicknameInput({ onSubmit }: NicknameInputProps) {
  const [nickname, setNickname] = useState("")
  const [showAgeGroups, setShowAgeGroups] = useState(false)

  const handleNicknameSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (nickname.trim() && nickname.trim().length >= 4) {
      setShowAgeGroups(true)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && nickname.trim() && nickname.trim().length >= 4) {
      setShowAgeGroups(true)
    }
  }

  const handleAgeGroupSelect = (ageGroup: string) => {
    onSubmit(nickname.trim(), ageGroup)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-8 pt-12">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                  <MessageCircle className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1">
                  <Sparkles className="h-4 w-4 text-yellow-400" />
                </div>
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ChatConnect
            </h1>
            <p className="text-muted-foreground mt-2">Connect with people around the world</p>
          </CardHeader>
          <CardContent className="px-8 pb-12">
            {!showAgeGroups ? (
              <div className="space-y-6">
                <form onSubmit={handleNicknameSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Choose your nickname</label>
                    <Input
                      type="text"
                      placeholder="Enter your nickname (min 4 characters)"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="h-12 text-center text-lg border-0 bg-muted/50 focus:bg-muted/80 transition-colors"
                      maxLength={20}
                      autoFocus
                    />
                    {nickname.trim() && nickname.trim().length < 4 && (
                      <p className="text-xs text-red-500 text-center">Nickname must be at least 4 characters long</p>
                    )}
                  </div>
                </form>
                <p className="text-xs text-muted-foreground text-center">Press Enter to continue</p>
              </div>
            ) : (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center">
                  <h3 className="text-lg font-semibold">Welcome, {nickname}!</h3>
                  <p className="text-sm text-muted-foreground mt-1">Select your age group to get started</p>
                </div>
                <div className="space-y-3">
                  {ageGroups.map((group) => (
                    <Button
                      key={group.id}
                      variant="outline"
                      className="w-full h-14 justify-start text-left hover:bg-muted/50 border-0 bg-muted/30 transition-all hover:scale-[1.02]"
                      onClick={() => handleAgeGroupSelect(group.id)}
                    >
                      <span className="text-2xl mr-3">{group.icon}</span>
                      <span className="font-medium">{group.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
