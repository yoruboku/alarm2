"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronUp, ChevronDown } from "lucide-react"

interface TimePickerProps {
  hours?: number
  minutes?: number
  seconds?: number
  onChange: (hours: number, minutes: number, seconds: number) => void
}

export default function TimePicker({ hours = 0, minutes = 0, seconds = 0, onChange }: TimePickerProps) {
  const [h, setH] = useState(hours)
  const [m, setM] = useState(minutes)
  const [s, setS] = useState(seconds)

  const increment = (type: "h" | "m" | "s") => {
    if (type === "h") setH((h + 1) % 24)
    if (type === "m") setM((m + 1) % 60)
    if (type === "s") setS((s + 1) % 60)
  }

  const decrement = (type: "h" | "m" | "s") => {
    if (type === "h") setH((h - 1 + 24) % 24)
    if (type === "m") setM((m - 1 + 60) % 60)
    if (type === "s") setS((s - 1 + 60) % 60)
  }

  const getValues = () => ({ h, m, s })

  const TimeUnit = ({ label, value, onIncrement, onDecrement }: any) => (
    <div className="flex flex-col items-center gap-2">
      <Button
        size="icon"
        variant="ghost"
        onClick={onIncrement}
        className="h-10 w-10 rounded-full hover:bg-accent/20 transition-all active:scale-95"
      >
        <ChevronUp className="w-5 h-5" />
      </Button>
      <div className="w-16 h-20 flex items-center justify-center bg-gradient-to-br from-accent/10 to-accent/5 rounded-xl border border-accent/20 backdrop-blur-sm">
        <span className="text-3xl font-bold font-mono text-accent">{String(value).padStart(2, "0")}</span>
      </div>
      <Button
        size="icon"
        variant="ghost"
        onClick={onDecrement}
        className="h-10 w-10 rounded-full hover:bg-accent/20 transition-all active:scale-95"
      >
        <ChevronDown className="w-5 h-5" />
      </Button>
      <span className="text-xs text-muted-foreground font-semibold uppercase">{label}</span>
    </div>
  )

  return (
    <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-accent/20">
      <div className="flex justify-center items-end gap-4">
        <TimeUnit label="Hours" value={h} onIncrement={() => increment("h")} onDecrement={() => decrement("h")} />
        <div className="text-3xl font-bold text-accent/50 mb-8">:</div>
        <TimeUnit label="Minutes" value={m} onIncrement={() => increment("m")} onDecrement={() => decrement("m")} />
        <div className="text-3xl font-bold text-accent/50 mb-8">:</div>
        <TimeUnit label="Seconds" value={s} onIncrement={() => increment("s")} onDecrement={() => decrement("s")} />
      </div>
    </Card>
  )
}
