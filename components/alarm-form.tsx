"use client"

import type React from "react"
import { useState } from "react"
import type { Alarm } from "@/types/alarm"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, X, Volume2, Music, Vibrate } from "lucide-react"
import DaySelector from "./day-selector"
import OptionToggle from "./option-toggle"

interface AlarmFormProps {
  onSubmit: (alarm: Alarm) => void
  onCancel: () => void
  initialAlarm?: Alarm
}

const TONES = ["Bell", "Chime", "Digital", "Alarm", "Beep"]

export default function AlarmForm({ onSubmit, onCancel, initialAlarm }: AlarmFormProps) {
  const [time, setTime] = useState(initialAlarm?.time || "07:00")
  const [label, setLabel] = useState(initialAlarm?.label || "Wake up")
  const [tone, setTone] = useState(initialAlarm?.tone || "Bell")
  const [volume, setVolume] = useState(initialAlarm?.volume || 80)
  const [vibration, setVibration] = useState(initialAlarm?.vibration ?? true)
  const [codeLength, setCodeLength] = useState(initialAlarm?.codeLength || 4)
  const [fadeIn, setFadeIn] = useState(initialAlarm?.fadeIn || false)
  const [growing, setGrowing] = useState(initialAlarm?.growing || false)
  const [selectedDays, setSelectedDays] = useState<number[]>(initialAlarm?.daysOfWeek || [])
  const [customAudioUrl, setCustomAudioUrl] = useState(initialAlarm?.customAudioUrl || "")
  const [customAudioName, setCustomAudioName] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      id: initialAlarm?.id || "",
      time,
      label,
      enabled: initialAlarm?.enabled ?? true,
      daysOfWeek: selectedDays,
      tone,
      volume,
      vibration,
      codeLength,
      codeAttempts: initialAlarm?.codeAttempts || 0,
      fadeIn,
      growing,
      customAudioUrl,
    })
  }

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const url = event.target?.result as string
        setCustomAudioUrl(url)
        setCustomAudioName(file.name)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <Card className="p-4 bg-card/50 backdrop-blur border-accent/10 animate-slide-up">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Time Input */}
        <div>
          <Label htmlFor="time" className="text-xs font-semibold mb-1 block">
            Alarm Time
          </Label>
          <Input
            id="time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="text-base font-semibold h-10 rounded-lg"
          />
        </div>

        {/* Label Input */}
        <div>
          <Label htmlFor="label" className="text-xs font-semibold mb-1 block">
            Label
          </Label>
          <Input
            id="label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Wake up"
            className="h-10 rounded-lg text-sm"
          />
        </div>

        {/* Day Selector */}
        <DaySelector selectedDays={selectedDays} onChange={setSelectedDays} />

        {/* Tone Selection */}
        <div>
          <Label htmlFor="tone" className="text-xs font-semibold mb-1 block flex items-center gap-2">
            <Music className="w-3 h-3 text-accent" />
            Alarm Tone
          </Label>
          <select
            id="tone"
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            className="w-full h-10 px-3 bg-input border border-border rounded-lg text-sm text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-accent/50"
          >
            {TONES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
            {customAudioUrl && <option value="custom">Custom Audio</option>}
          </select>
        </div>

        {/* Custom Audio Upload */}
        <div className="p-3 bg-secondary/30 rounded-lg border border-secondary/50">
          <Label className="block mb-2 text-xs font-semibold">Custom Audio (MP3, WAV, OGG)</Label>
          <div className="flex gap-2 items-center">
            <label className="flex-1 flex items-center gap-2 px-3 py-2 bg-input border border-border rounded-lg cursor-pointer hover:bg-input/80 transition-all active:scale-95">
              <Upload className="w-3 h-3 text-accent" />
              <span className="text-xs font-medium">{customAudioName || "Choose file..."}</span>
              <input type="file" accept="audio/*" onChange={handleAudioUpload} className="hidden" />
            </label>
            {customAudioUrl && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  setCustomAudioUrl("")
                  setCustomAudioName("")
                }}
                className="rounded-lg h-10 w-10"
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Volume Control */}
        <div className="p-3 bg-secondary/30 rounded-lg border border-secondary/50">
          <Label htmlFor="volume" className="block mb-2 text-xs font-semibold flex items-center gap-2">
            <Volume2 className="w-3 h-3 text-accent" />
            Volume: {volume}%
          </Label>
          <div className="flex items-center gap-2">
            <input
              id="volume"
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(Number.parseInt(e.target.value))}
              className="flex-1 h-2 rounded-full"
            />
            <div className="w-12 h-7 bg-accent/20 rounded-lg flex items-center justify-center text-xs font-bold text-accent">
              {volume}%
            </div>
          </div>
        </div>

        {/* Code Length */}
        <div>
          <Label htmlFor="codeLength" className="text-xs font-semibold mb-1 block">
            Code Length (digits)
          </Label>
          <Input
            id="codeLength"
            type="number"
            min="1"
            max="10"
            value={codeLength}
            onChange={(e) => setCodeLength(Number.parseInt(e.target.value))}
            className="h-10 rounded-lg text-sm"
          />
        </div>

        {/* Option Toggles */}
        <div className="space-y-2">
          <OptionToggle
            label="Vibration"
            description="Haptic feedback when alarm rings"
            checked={vibration}
            onChange={setVibration}
            icon={Vibrate}
          />
          <OptionToggle label="Fade In" description="Gradually increase volume" checked={fadeIn} onChange={setFadeIn} />
          <OptionToggle
            label="Growing Volume"
            description="Volume increases over time"
            checked={growing}
            onChange={setGrowing}
          />
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-2 pt-2">
          <Button type="submit" className="flex-1 h-10 rounded-lg font-semibold text-sm">
            Save Alarm
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1 h-10 rounded-lg bg-transparent text-sm"
          >
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  )
}
