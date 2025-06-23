"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  Volume2,
  MessageSquare,
  Globe,
  Download,
  Trash2,
  Circle,
  Moon,
  Minus,
  EyeOff,
} from "lucide-react"

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  currentUser: any
  onStatusChange?: (status: "online" | "idle" | "busy" | "invisible") => void
}

export function SettingsModal({ isOpen, onClose, currentUser, onStatusChange }: SettingsModalProps) {
  const [settings, setSettings] = useState({
    // Profile settings
    nickname: currentUser?.nickname || "",
    status: "online",
    showOnlineStatus: true,

    // Notification settings
    soundEnabled: true,
    desktopNotifications: true,
    mentionNotifications: true,
    privateMessageNotifications: true,

    // Privacy settings
    showLastSeen: true,
    allowPrivateMessages: true,
    showTypingIndicator: true,

    // Appearance settings
    theme: "system",
    fontSize: "medium",
    compactMode: false,
    showAvatars: true,

    // Chat settings
    enterToSend: true,
    showTimestamps: true,
    groupMessages: true,
    autoEmbedLinks: true,
  })

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] p-0 border-0 bg-card/95 backdrop-blur-sm">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Settings className="h-5 w-5" />
            Settings
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          <Tabs defaultValue="profile" orientation="vertical" className="flex w-full">
            {/* Sidebar */}
            <div className="w-64 border-r border-border/50 bg-muted/20">
              <TabsList className="flex flex-col h-full w-full bg-transparent p-2 space-y-1">
                <TabsTrigger value="profile" className="w-full justify-start gap-2 data-[state=active]:bg-primary/10">
                  <User className="h-4 w-4" />
                  Profile
                </TabsTrigger>
                <TabsTrigger
                  value="notifications"
                  className="w-full justify-start gap-2 data-[state=active]:bg-primary/10"
                >
                  <Bell className="h-4 w-4" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="privacy" className="w-full justify-start gap-2 data-[state=active]:bg-primary/10">
                  <Shield className="h-4 w-4" />
                  Privacy & Safety
                </TabsTrigger>
                <TabsTrigger
                  value="appearance"
                  className="w-full justify-start gap-2 data-[state=active]:bg-primary/10"
                >
                  <Palette className="h-4 w-4" />
                  Appearance
                </TabsTrigger>
                <TabsTrigger value="chat" className="w-full justify-start gap-2 data-[state=active]:bg-primary/10">
                  <MessageSquare className="h-4 w-4" />
                  Chat & Messaging
                </TabsTrigger>
                <TabsTrigger value="audio" className="w-full justify-start gap-2 data-[state=active]:bg-primary/10">
                  <Volume2 className="h-4 w-4" />
                  Audio & Video
                </TabsTrigger>
                <TabsTrigger value="language" className="w-full justify-start gap-2 data-[state=active]:bg-primary/10">
                  <Globe className="h-4 w-4" />
                  Language
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-6">
                  {/* Profile Settings */}
                  <TabsContent value="profile" className="mt-0 space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Profile Settings</h3>

                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <img
                            src={currentUser?.avatar || "/placeholder.svg"}
                            alt="Avatar"
                            className="w-16 h-16 rounded-full bg-white"
                          />
                          <div className="space-y-2">
                            <Button variant="outline" size="sm">
                              Change Avatar
                            </Button>
                            <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max size 8MB.</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="nickname">Nickname</Label>
                          <Input
                            id="nickname"
                            value={settings.nickname}
                            onChange={(e) => handleSettingChange("nickname", e.target.value)}
                            maxLength={20}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Status</Label>
                          <div className="flex gap-2 flex-wrap">
                            {[
                              { value: "online", label: "Online", icon: Circle, color: "text-green-500" },
                              { value: "idle", label: "Idle", icon: Moon, color: "text-yellow-500" },
                              { value: "busy", label: "Busy", icon: Minus, color: "text-red-500" },
                              { value: "invisible", label: "Invisible", icon: EyeOff, color: "text-gray-500" },
                            ].map((status) => {
                              const Icon = status.icon
                              const isSelected = settings.status === status.value

                              return (
                                <Button
                                  key={status.value}
                                  variant={isSelected ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => {
                                    handleSettingChange("status", status.value)
                                    onStatusChange?.(status.value as any)
                                  }}
                                  className="flex items-center gap-2"
                                >
                                  <Icon className={`h-4 w-4 ${isSelected ? "text-white" : status.color}`} />
                                  {status.label}
                                </Button>
                              )
                            })}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Show Online Status</Label>
                            <p className="text-sm text-muted-foreground">Let others see when you're online</p>
                          </div>
                          <Switch
                            checked={settings.showOnlineStatus}
                            onCheckedChange={(checked) => handleSettingChange("showOnlineStatus", checked)}
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Notification Settings */}
                  <TabsContent value="notifications" className="mt-0 space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Notification Settings</h3>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Sound Notifications</Label>
                            <p className="text-sm text-muted-foreground">Play sounds for new messages</p>
                          </div>
                          <Switch
                            checked={settings.soundEnabled}
                            onCheckedChange={(checked) => handleSettingChange("soundEnabled", checked)}
                          />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Desktop Notifications</Label>
                            <p className="text-sm text-muted-foreground">Show notifications on your desktop</p>
                          </div>
                          <Switch
                            checked={settings.desktopNotifications}
                            onCheckedChange={(checked) => handleSettingChange("desktopNotifications", checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Mention Notifications</Label>
                            <p className="text-sm text-muted-foreground">Get notified when someone mentions you</p>
                          </div>
                          <Switch
                            checked={settings.mentionNotifications}
                            onCheckedChange={(checked) => handleSettingChange("mentionNotifications", checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Private Message Notifications</Label>
                            <p className="text-sm text-muted-foreground">Get notified for private messages</p>
                          </div>
                          <Switch
                            checked={settings.privateMessageNotifications}
                            onCheckedChange={(checked) => handleSettingChange("privateMessageNotifications", checked)}
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Privacy Settings */}
                  <TabsContent value="privacy" className="mt-0 space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Privacy & Safety</h3>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Show Last Seen</Label>
                            <p className="text-sm text-muted-foreground">Let others see when you were last online</p>
                          </div>
                          <Switch
                            checked={settings.showLastSeen}
                            onCheckedChange={(checked) => handleSettingChange("showLastSeen", checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Allow Private Messages</Label>
                            <p className="text-sm text-muted-foreground">
                              Allow other users to send you private messages
                            </p>
                          </div>
                          <Switch
                            checked={settings.allowPrivateMessages}
                            onCheckedChange={(checked) => handleSettingChange("allowPrivateMessages", checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Show Typing Indicator</Label>
                            <p className="text-sm text-muted-foreground">Show when you're typing a message</p>
                          </div>
                          <Switch
                            checked={settings.showTypingIndicator}
                            onCheckedChange={(checked) => handleSettingChange("showTypingIndicator", checked)}
                          />
                        </div>

                        <Separator />

                        <div className="space-y-3">
                          <Label>Blocked Users</Label>
                          <div className="text-sm text-muted-foreground">No blocked users</div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Appearance Settings */}
                  <TabsContent value="appearance" className="mt-0 space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Appearance</h3>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Theme</Label>
                          <div className="flex gap-2">
                            {["light", "dark", "system"].map((theme) => (
                              <Button
                                key={theme}
                                variant={settings.theme === theme ? "default" : "outline"}
                                size="sm"
                                onClick={() => handleSettingChange("theme", theme)}
                                className="capitalize"
                              >
                                {theme}
                              </Button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Font Size</Label>
                          <div className="flex gap-2">
                            {["small", "medium", "large"].map((size) => (
                              <Button
                                key={size}
                                variant={settings.fontSize === size ? "default" : "outline"}
                                size="sm"
                                onClick={() => handleSettingChange("fontSize", size)}
                                className="capitalize"
                              >
                                {size}
                              </Button>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Compact Mode</Label>
                            <p className="text-sm text-muted-foreground">Reduce spacing between messages</p>
                          </div>
                          <Switch
                            checked={settings.compactMode}
                            onCheckedChange={(checked) => handleSettingChange("compactMode", checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Show Avatars</Label>
                            <p className="text-sm text-muted-foreground">Display user avatars in chat</p>
                          </div>
                          <Switch
                            checked={settings.showAvatars}
                            onCheckedChange={(checked) => handleSettingChange("showAvatars", checked)}
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Chat Settings */}
                  <TabsContent value="chat" className="mt-0 space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Chat & Messaging</h3>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Enter to Send</Label>
                            <p className="text-sm text-muted-foreground">Press Enter to send messages</p>
                          </div>
                          <Switch
                            checked={settings.enterToSend}
                            onCheckedChange={(checked) => handleSettingChange("enterToSend", checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Show Timestamps</Label>
                            <p className="text-sm text-muted-foreground">Display message timestamps</p>
                          </div>
                          <Switch
                            checked={settings.showTimestamps}
                            onCheckedChange={(checked) => handleSettingChange("showTimestamps", checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Group Messages</Label>
                            <p className="text-sm text-muted-foreground">
                              Group consecutive messages from the same user
                            </p>
                          </div>
                          <Switch
                            checked={settings.groupMessages}
                            onCheckedChange={(checked) => handleSettingChange("groupMessages", checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Auto-embed Links</Label>
                            <p className="text-sm text-muted-foreground">Automatically embed links and media</p>
                          </div>
                          <Switch
                            checked={settings.autoEmbedLinks}
                            onCheckedChange={(checked) => handleSettingChange("autoEmbedLinks", checked)}
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Audio Settings */}
                  <TabsContent value="audio" className="mt-0 space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Audio & Video</h3>
                      <div className="text-sm text-muted-foreground">Audio and video features coming soon!</div>
                    </div>
                  </TabsContent>

                  {/* Language Settings */}
                  <TabsContent value="language" className="mt-0 space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Language & Region</h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Language</Label>
                          <Button variant="outline" className="w-full justify-start">
                            English (US)
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </div>
              </ScrollArea>
            </div>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="border-t border-border/50 p-6 flex justify-between">
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            <Button variant="outline" size="sm" className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Account
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={onClose}>Save Changes</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
