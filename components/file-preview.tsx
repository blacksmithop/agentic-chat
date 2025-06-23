"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X, Download, Eye, FileText, ImageIcon, Video, Music, Archive } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface FilePreviewProps {
  file: {
    name: string
    size: number
    type: string
    url: string
  }
  onRemove?: () => void
  showRemove?: boolean
  className?: string
}

export function FilePreview({ file, onRemove, showRemove = false, className }: FilePreviewProps) {
  const [showPreview, setShowPreview] = useState(false)

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return ImageIcon
    if (type.startsWith("video/")) return Video
    if (type.startsWith("audio/")) return Music
    if (type.includes("zip") || type.includes("rar") || type.includes("7z")) return Archive
    return FileText
  }

  const getFileColor = (type: string) => {
    if (type.startsWith("image/")) return "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200"
    if (type.startsWith("video/")) return "text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-200"
    if (type.startsWith("audio/")) return "text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-200"
    return "text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-200"
  }

  const canPreview = file.type.startsWith("image/") || file.type.startsWith("video/")
  const FileIcon = getFileIcon(file.type)

  return (
    <>
      <div className={`relative group bg-card border border-border rounded-lg p-3 max-w-sm ${className}`}>
        {showRemove && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            <X className="h-3 w-3" />
          </Button>
        )}

        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${getFileColor(file.type)}`}>
            <FileIcon className="h-5 w-5" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm truncate" title={file.name}>
              {file.name}
            </div>
            <div className="text-xs text-muted-foreground">{formatFileSize(file.size)}</div>

            <div className="flex gap-1 mt-2">
              {canPreview && (
                <Button variant="ghost" size="sm" onClick={() => setShowPreview(true)} className="h-7 px-2 text-xs">
                  <Eye className="h-3 w-3 mr-1" />
                  Preview
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const a = document.createElement("a")
                  a.href = file.url
                  a.download = file.name
                  a.click()
                }}
                className="h-7 px-2 text-xs"
              >
                <Download className="h-3 w-3 mr-1" />
                Download
              </Button>
            </div>
          </div>
        </div>

        {/* Image/Video preview thumbnail */}
        {file.type.startsWith("image/") && (
          <div className="mt-3">
            <img
              src={file.url || "/placeholder.svg"}
              alt={file.name}
              className="w-full h-32 object-cover rounded-lg cursor-pointer"
              onClick={() => setShowPreview(true)}
            />
          </div>
        )}

        {file.type.startsWith("video/") && (
          <div className="mt-3">
            <video
              src={file.url}
              className="w-full h-32 object-cover rounded-lg cursor-pointer"
              onClick={() => setShowPreview(true)}
              muted
            />
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="truncate">{file.name}</DialogTitle>
          </DialogHeader>
          <div className="p-6 pt-0">
            {file.type.startsWith("image/") && (
              <img
                src={file.url || "/placeholder.svg"}
                alt={file.name}
                className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
              />
            )}
            {file.type.startsWith("video/") && (
              <video src={file.url} controls className="w-full h-auto max-h-[70vh] rounded-lg" />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
