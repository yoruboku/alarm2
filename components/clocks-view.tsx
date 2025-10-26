"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, Plus, ChevronDown } from "lucide-react"

interface Clock {
  id: string
  timezone: string
  label: string
}

const TIMEZONES = [
  { label: "New York", value: "America/New_York" },
  { label: "London", value: "Europe/London" },
  { label: "Tokyo", value: "Asia/Tokyo" },
  { label: "Sydney", value: "Australia/Sydney" },
  { label: "Dubai", value: "Asia/Dubai" },
  { label: "Singapore", value: "Asia/Singapore" },
  { label: "Hong Kong", value: "Asia/Hong_Kong" },
  { label: "Bangkok", value: "Asia/Bangkok" },
  { label: "Mumbai", value: "Asia/Kolkata" },
  { label: "Berlin", value: "Europe/Berlin" },
  { label: "Paris", value: "Europe/Paris" },
  { label: "Los Angeles", value: "America/Los_Angeles" },
]

export default function ClocksView() {
  const [clocks, setClocks] = useState<Clock[]>([])
  const [times, setTimes] = useState<Record<string, string>>({})
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("clocks")
    if (stored) {
      setClocks(JSON.parse(stored))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("clocks", JSON.stringify(clocks))
  }, [clocks])

  useEffect(() => {
    const updateTimes = () => {
      const newTimes: Record<string, string> = {}
      clocks.forEach((clock) => {
        const time = new Date().toLocaleTimeString("en-US", {
          timeZone: clock.timezone,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
        newTimes[clock.id] = time
      })
      setTimes(newTimes)
    }

    updateTimes()
    const interval = setInterval(updateTimes, 1000)
    return () => clearInterval(interval)
  }, [clocks])

  const handleAddClock = (timezone: string) => {
    const tzData = TIMEZONES.find((t) => t.value === timezone)
    if (tzData) {
      setClocks([
        ...clocks,
        {
          id: Date.now().toString(),
          timezone,
          label: tzData.label,
        },
      ])
      setIsDropdownOpen(false)
    }
  }

  const handleRemoveClock = (id: string) => {
    setClocks(clocks.filter((c) => c.id !== id))
  }

  return (
    <div className="p-3 max-w-2xl mx-auto pb-24 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">World Clocks</h1>

      <div className="mb-6 relative">
        <Button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          variant="outline"
          className="w-full flex items-center justify-between px-4 py-2 bg-card hover:bg-secondary/50 rounded-lg border border-border transition-all"
        >
          <span className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Clock
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
        </Button>

        {isDropdownOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto animate-slide-down">
            {TIMEZONES.map((tz) => (
              <button
                key={tz.value}
                onClick={() => handleAddClock(tz.value)}
                className="w-full text-left px-4 py-3 hover:bg-secondary/50 transition-colors border-b border-border/50 last:border-b-0 text-sm"
              >
                {tz.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-3">
        {clocks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground">No clocks added yet. Add one to get started!</p>
          </div>
        ) : (
          clocks.map((clock) => (
            <Card key={clock.id} className="p-4 flex items-center justify-between animate-fade-in">
              <div>
                <p className="text-xs text-muted-foreground mb-1">{clock.label}</p>
                <p className="text-3xl font-bold font-mono text-accent">{times[clock.id] || "--:--:--"}</p>
              </div>
              <Button size="icon" variant="ghost" onClick={() => handleRemoveClock(clock.id)} className="h-8 w-8">
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
