"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Upload, ImageIcon, Video, FileText, Link, Globe } from "lucide-react"

interface UploadModalProps {
  isOpen: boolean
  onClose: () => void
  onFileUpload: (file: File, type: "image" | "video" | "file") => Promise<void>
  onLinkEmbed: (url: string) => void
}

export function UploadModal({ isOpen, onClose, onFileUpload, onLinkEmbed }: UploadModalProps) {
  const [activeTab, setActiveTab] = useState("file")
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [linkUrl, setLinkUrl] = useState("")

  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File, type: "image" | "video" | "file") => {
    setUploading(true)
    setUploadProgress(0)

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 200)

    try {
      await onFileUpload(file, type)
      setUploadProgress(100)
      setTimeout(() => {
        onClose()
        setUploading(false)
        setUploadProgress(0)
      }, 500)
    } catch (error) {
      setUploading(false)
      setUploadProgress(0)
    }

    clearInterval(progressInterval)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "video" | "file") => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file, type)
      e.target.value = ""
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      const file = files[0]
      let type: "image" | "video" | "file" = "file"

      if (file.type.startsWith("image/")) {
        type = "image"
        setActiveTab("image")
      } else if (file.type.startsWith("video/")) {
        type = "video"
        setActiveTab("video")
      } else {
        setActiveTab("file")
      }

      handleFileSelect(file, type)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (linkUrl.trim() && (linkUrl.startsWith("http://") || linkUrl.startsWith("https://"))) {
      onLinkEmbed(linkUrl.trim())
      setLinkUrl("")
      onClose()
    }
  }

  const getFileTypeInfo = (type: "image" | "video" | "file") => {
    switch (type) {
      case "image":
        return {
          icon: ImageIcon,
          title: "Upload Image",
          description: "Share photos, screenshots, and graphics",
          accept: "image/*",
          maxSize: "10MB",
          formats: "JPG, PNG, GIF, WebP",
          ref: imageInputRef,
        }
      case "video":
        return {
          icon: Video,
          title: "Upload Video",
          description: "Share video clips and recordings",
          accept: "video/*",
          maxSize: "50MB",
          formats: "MP4, WebM, MOV",
          ref: videoInputRef,
        }
      case "file":
        return {
          icon: FileText,
          title: "Upload File",
          description: "Share documents and other files",
          accept: "*",
          maxSize: "25MB",
          formats: "Any file type",
          ref: fileInputRef,
        }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl border-0 bg-card/95 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Share Content
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="image" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Image
            </TabsTrigger>
            <TabsTrigger value="video" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              Video
            </TabsTrigger>
            <TabsTrigger value="file" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              File
            </TabsTrigger>
            <TabsTrigger value="link" className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              Link
            </TabsTrigger>
          </TabsList>

          {/* File Upload Tabs */}
          {(["image", "video", "file"] as const).map((type) => {
            const info = getFileTypeInfo(type)
            const Icon = info.icon

            return (
              <TabsContent key={type} value={type} className="mt-6">
                <div className="space-y-6">
                  {uploading && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} className="w-full" />
                    </div>
                  )}

                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      dragOver
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                    }`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                  >
                    <div className="space-y-4">
                      <div className="flex justify-center">
                        <div className="p-4 bg-primary/10 rounded-full">
                          <Icon className="h-8 w-8 text-primary" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold">{info.title}</h3>
                        <p className="text-sm text-muted-foreground">{info.description}</p>
                      </div>

                      <div className="space-y-3">
                        <Button onClick={() => info.ref.current?.click()} disabled={uploading} className="w-full">
                          <Upload className="h-4 w-4 mr-2" />
                          Choose {type === "file" ? "File" : type}
                        </Button>

                        <p className="text-xs text-muted-foreground">or drag and drop your {type} here</p>
                      </div>

                      <div className="pt-4 border-t border-border">
                        <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                          <div>
                            <span className="font-medium">Max size:</span> {info.maxSize}
                          </div>
                          <div>
                            <span className="font-medium">Formats:</span> {info.formats}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <input
                  ref={info.ref}
                  type="file"
                  accept={info.accept}
                  onChange={(e) => handleFileChange(e, type)}
                  className="hidden"
                />
              </TabsContent>
            )
          })}

          {/* Link Tab */}
          <TabsContent value="link" className="mt-6">
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="p-4 bg-primary/10 rounded-full">
                    <Globe className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Share a Link</h3>
                  <p className="text-sm text-muted-foreground">
                    Paste a URL to create a rich preview with title, description, and image
                  </p>
                </div>
              </div>

              <form onSubmit={handleLinkSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="link-url">URL</Label>
                  <Input
                    id="link-url"
                    type="url"
                    placeholder="https://example.com"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    className="h-12"
                  />
                </div>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!linkUrl.trim() || (!linkUrl.startsWith("http://") && !linkUrl.startsWith("https://"))}
                    className="flex-1"
                  >
                    <Link className="h-4 w-4 mr-2" />
                    Share Link
                  </Button>
                </div>
              </form>

              <div className="pt-4 border-t border-border">
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>
                    <span className="font-medium">Supported sites:</span> GitHub, Twitter, Medium, Stack Overflow, and
                    more
                  </p>
                  <p>
                    <span className="font-medium">Features:</span> Automatic title, description, and image extraction
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
