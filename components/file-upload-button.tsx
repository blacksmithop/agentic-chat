"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Paperclip } from "lucide-react"

interface FileUploadButtonProps {
  onOpenModal: () => void
  disabled?: boolean
}

export function FileUploadButton({ onOpenModal, disabled }: FileUploadButtonProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onOpenModal()
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={disabled}
      className="h-10 w-10 rounded-xl hover:bg-muted/50"
      onClick={handleClick}
    >
      <Paperclip className="h-4 w-4" />
      <span className="sr-only">Attach file</span>
    </Button>
  )
}
