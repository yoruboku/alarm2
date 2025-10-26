"use client"

import type { Alarm } from "@/types/alarm"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Trash2, Edit2, Check } from "lucide-react"
import { useState } from "react"
import AlarmForm from "./alarm-form"

interface AlarmCardProps {
  alarm: Alarm
  isSelected: boolean
  onToggleSelect: () => void
  onUpdate: (alarm: Alarm) => void
  onDelete: () => void
  multiSelectMode: boolean
}

export default function AlarmCard({
  alarm,
  isSelected,
  onToggleSelect,
  onUpdate,
  onDelete,
  multiSelectMode,
}: AlarmCardProps) {
  const [isEditing, setIsEditing] = useState(false)

  const daysLabel =
    alarm.daysOfWeek.length === 0
      ? "Once"
      : alarm.daysOfWeek.length === 7
        ? "Every day"
        : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].filter((_, i) => alarm.daysOfWeek.includes(i)).join(", ")

  if (isEditing) {
    return (
      <Card className="p-4 bg-card/50 border-accent/10 animate-slide-up">
        <AlarmForm
          initialAlarm={alarm}
          onSubmit={(updated) => {
            onUpdate(updated)
            setIsEditing(false)
          }}
          onCancel={() => setIsEditing(false)}
        />
      </Card>
    )
  }

  return (
    <Card
      className={`p-4 cursor-pointer transition-all ${
        isSelected ? "ring-2 ring-accent bg-card/50" : ""
      } ${multiSelectMode ? "cursor-pointer" : ""}`}
      onClick={() => multiSelectMode && onToggleSelect()}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{alarm.time}</span>
            <span className="text-sm text-muted-foreground">{daysLabel}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{alarm.label}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {alarm.tone} • {alarm.codeLength} digit code
          </p>
        </div>

        <div className="flex items-center gap-2">
          {multiSelectMode && (
            <div
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                isSelected ? "bg-accent border-accent" : "border-muted-foreground"
              }`}
            >
              {isSelected && <Check className="w-4 h-4 text-accent-foreground" />}
            </div>
          )}

          <Button
            size="icon"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation()
              onUpdate({ ...alarm, enabled: !alarm.enabled })
            }}
            className={alarm.enabled ? "text-accent" : "text-muted-foreground"}
          >
            <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center">
              {alarm.enabled && <div className="w-3 h-3 rounded-full bg-accent" />}
            </div>
          </Button>

          <Button
            size="icon"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation()
              setIsEditing(true)
            }}
          >
            <Edit2 className="w-4 h-4" />
          </Button>

          <Button
            size="icon"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
          >
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
