"use client"

import type React from "react"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface UserTooltipProps {
  children: React.ReactNode
  ageGroup: string
}

const getAgeGroupLabel = (ageGroup: string) => {
  switch (ageGroup) {
    case "teens":
      return "13-17 years old"
    case "young-adults":
      return "18-29 years old"
    case "adults":
      return "30+ years old"
    default:
      return "Unknown age group"
  }
}

export function UserTooltip({ children, ageGroup }: UserTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent>
          <p>{getAgeGroupLabel(ageGroup)}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
