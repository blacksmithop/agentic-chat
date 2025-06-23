"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Circle, Moon, Minus, EyeOff } from "lucide-react"
import type { User } from "@/app/page"

interface StatusSelectorProps {
  currentStatus: User["status"]
  onStatusChange: (status: User["status"]) => void
}

const statusOptions = [
  {
    value: "online" as const,
    label: "Online",
    description: "Available to chat",
    icon: Circle,
    color: "text-green-500",
    bgColor: "bg-green-500",
  },
  {
    value: "idle" as const,
    label: "Idle",
    description: "Away from keyboard",
    icon: Moon,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500",
  },
  {
    value: "busy" as const,
    label: "Busy",
    description: "Do not disturb",
    icon: Minus,
    color: "text-red-500",
    bgColor: "bg-red-500",
  },
  {
    value: "invisible" as const,
    label: "Invisible",
    description: "Appear offline",
    icon: EyeOff,
    color: "text-gray-500",
    bgColor: "bg-gray-500",
  },
]

export function StatusSelector({ currentStatus, onStatusChange }: StatusSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const currentStatusOption = statusOptions.find((option) => option.value === currentStatus)
  const StatusIcon = currentStatusOption?.icon || Circle

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 px-2 gap-2 hover:bg-muted/50">
          <div className="relative">
            <StatusIcon className={`h-4 w-4 ${currentStatusOption?.color}`} />
            {currentStatus === "online" && (
              <div className="absolute inset-0 rounded-full border-2 border-background">
                <div className={`w-full h-full rounded-full ${currentStatusOption?.bgColor}`} />
              </div>
            )}
          </div>
          <span className="text-sm font-medium">{currentStatusOption?.label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="start">
        <div className="space-y-1">
          <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Set your status</div>
          {statusOptions.map((option) => {
            const Icon = option.icon
            const isSelected = option.value === currentStatus

            return (
              <Button
                key={option.value}
                variant="ghost"
                className={`w-full justify-start gap-3 h-auto p-3 ${isSelected ? "bg-primary/10 text-primary" : ""}`}
                onClick={() => {
                  onStatusChange(option.value)
                  setIsOpen(false)
                }}
              >
                <div className="relative">
                  <Icon className={`h-4 w-4 ${option.color}`} />
                  {option.value === "online" && (
                    <div className="absolute inset-0 rounded-full border-2 border-background">
                      <div className={`w-full h-full rounded-full ${option.bgColor}`} />
                    </div>
                  )}
                </div>
                <div className="text-left flex-1">
                  <div className="font-medium text-sm">{option.label}</div>
                  <div className="text-xs text-muted-foreground">{option.description}</div>
                </div>
                {isSelected && <Circle className="h-2 w-2 fill-current" />}
              </Button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
