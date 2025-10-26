"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { audioGenerator } from "@/lib/audio"
import { Volume2, Music, Bell, Vibrate, Info, Globe, Palette, Moon, Sun, Smartphone } from "lucide-react"
import OptionToggle from "./option-toggle"

interface Settings {
  volume: number
  vibration: boolean
  theme: "dark" | "light" | "system"
  defaultTone: string
  timezone: string
  autoSnooze: boolean
  snoozeMinutes: number
  notificationSound: boolean
  screenBrightness: boolean
}

const TONES = ["Bell", "Chime", "Digital", "Alarm", "Beep"]

const TIMEZONES = [
  { label: "New York (EST)", value: "America/New_York" },
  { label: "Los Angeles (PST)", value: "America/Los_Angeles" },
  { label: "Chicago (CST)", value: "America/Chicago" },
  { label: "Denver (MST)", value: "America/Denver" },
  { label: "London (GMT)", value: "Europe/London" },
  { label: "Paris (CET)", value: "Europe/Paris" },
  { label: "Tokyo (JST)", value: "Asia/Tokyo" },
  { label: "Sydney (AEDT)", value: "Australia/Sydney" },
  { label: "Dubai (GST)", value: "Asia/Dubai" },
  { label: "Singapore (SGT)", value: "Asia/Singapore" },
  { label: "Hong Kong (HKT)", value: "Asia/Hong_Kong" },
  { label: "Bangkok (ICT)", value: "Asia/Bangkok" },
  { label: "Mumbai (IST)", value: "Asia/Kolkata" },
  { label: "São Paulo (BRT)", value: "America/Sao_Paulo" },
  { label: "Mexico City (CST)", value: "America/Mexico_City" },
]

const THEMES = [
  { label: "Dark", value: "dark", icon: Moon },
  { label: "Light", value: "light", icon: Sun },
  { label: "System", value: "system", icon: Smartphone },
]

export default function SettingsView() {
  const [settings, setSettings] = useState<Settings>({
    volume: 80,
    vibration: true,
    theme: "dark",
    defaultTone: "Bell",
    timezone: "America/New_York",
    autoSnooze: false,
    snoozeMinutes: 5,
    notificationSound: true,
    screenBrightness: false,
  })
  const [testingTone, setTestingTone] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem("settings")
    if (stored) {
      setSettings(JSON.parse(stored))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("settings", JSON.stringify(settings))
    const htmlElement = document.documentElement
    if (settings.theme === "light") {
      htmlElement.classList.remove("dark")
      htmlElement.classList.add("light")
    } else if (settings.theme === "dark") {
      htmlElement.classList.remove("light")
      htmlElement.classList.add("dark")
    } else {
      // System theme
      htmlElement.classList.remove("light")
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        htmlElement.classList.add("dark")
      }
    }
  }, [settings])

  const handleTestTone = (tone: string) => {
    setTestingTone(tone)
    audioGenerator.playTone(tone as any, 1, settings.volume / 100)
    setTimeout(() => setTestingTone(null), 1000)
  }

  const handleReset = () => {
    if (confirm("Reset all alarms and settings?")) {
      localStorage.clear()
      window.location.reload()
    }
  }

  return (
    <div className="p-3 max-w-2xl mx-auto pb-24">
      <h1 className="text-2xl font-bold mb-6 text-balance">Settings</h1>

      <div className="space-y-3">
        {/* Master Volume */}
        <Card className="p-4 bg-gradient-to-br from-card to-card/50 border-accent/10 rounded-2xl animate-fade-in">
          <div className="flex items-center gap-3 mb-3">
            <Volume2 className="w-5 h-5 text-accent flex-shrink-0" />
            <Label htmlFor="volume" className="text-base font-semibold">
              Master Volume
            </Label>
          </div>
          <div className="flex items-center gap-3">
            <input
              id="volume"
              type="range"
              min="0"
              max="100"
              value={settings.volume}
              onChange={(e) => setSettings({ ...settings, volume: Number.parseInt(e.target.value) })}
              className="flex-1 h-2 rounded-full accent-accent"
            />
            <div className="w-14 h-9 bg-accent/20 rounded-lg flex items-center justify-center text-xs font-bold text-accent">
              {settings.volume}%
            </div>
          </div>
        </Card>

        {/* Default Tone */}
        <Card className="p-4 bg-gradient-to-br from-card to-card/50 border-accent/10 rounded-2xl animate-fade-in">
          <div className="flex items-center gap-3 mb-3">
            <Music className="w-5 h-5 text-accent flex-shrink-0" />
            <Label htmlFor="tone" className="text-base font-semibold">
              Default Alarm Tone
            </Label>
          </div>
          <div className="space-y-2">
            <select
              id="tone"
              value={settings.defaultTone}
              onChange={(e) => setSettings({ ...settings, defaultTone: e.target.value })}
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-accent/50"
            >
              {TONES.map((tone) => (
                <option key={tone} value={tone}>
                  {tone}
                </option>
              ))}
            </select>
            <Button
              variant="outline"
              onClick={() => handleTestTone(settings.defaultTone)}
              disabled={testingTone !== null}
              className="w-full gap-2 h-9 rounded-lg text-sm"
            >
              <Bell className="w-4 h-4" />
              {testingTone ? "Playing..." : "Test Tone"}
            </Button>
          </div>
        </Card>

        {/* Timezone */}
        <Card className="p-4 bg-gradient-to-br from-card to-card/50 border-accent/10 rounded-2xl animate-fade-in">
          <div className="flex items-center gap-3 mb-3">
            <Globe className="w-5 h-5 text-accent flex-shrink-0" />
            <Label htmlFor="timezone" className="text-base font-semibold">
              Timezone
            </Label>
          </div>
          <select
            id="timezone"
            value={settings.timezone}
            onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
            className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-accent/50"
          >
            {TIMEZONES.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
        </Card>

        {/* Theme Selection */}
        <Card className="p-4 bg-gradient-to-br from-card to-card/50 border-accent/10 rounded-2xl animate-fade-in">
          <div className="flex items-center gap-3 mb-3">
            <Palette className="w-5 h-5 text-accent flex-shrink-0" />
            <Label className="text-base font-semibold">Theme</Label>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {THEMES.map((theme) => {
              const Icon = theme.icon
              return (
                <Button
                  key={theme.value}
                  onClick={() => setSettings({ ...settings, theme: theme.value as any })}
                  variant={settings.theme === theme.value ? "default" : "outline"}
                  className="rounded-lg h-10 font-semibold transition-all flex flex-col items-center gap-1 text-xs"
                >
                  <Icon className="w-4 h-4" />
                  <span>{theme.label}</span>
                </Button>
              )
            })}
          </div>
        </Card>

        {/* Vibration Toggle */}
        <OptionToggle
          label="Vibration Feedback"
          description="Haptic feedback for alarms"
          checked={settings.vibration}
          onChange={(checked) => setSettings({ ...settings, vibration: checked })}
          icon={Vibrate}
        />

        {/* Notification Sound */}
        <OptionToggle
          label="Notification Sound"
          description="Play sound for notifications"
          checked={settings.notificationSound}
          onChange={(checked) => setSettings({ ...settings, notificationSound: checked })}
          icon={Bell}
        />

        {/* Auto Snooze */}
        <Card className="p-4 bg-gradient-to-br from-card to-card/50 border-accent/10 rounded-2xl animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <Label className="text-base font-semibold">Auto Snooze</Label>
            <input
              type="checkbox"
              checked={settings.autoSnooze}
              onChange={(e) => setSettings({ ...settings, autoSnooze: e.target.checked })}
              className="w-5 h-5 rounded accent-accent cursor-pointer"
            />
          </div>
          {settings.autoSnooze && (
            <div className="space-y-2">
              <Label htmlFor="snooze-mins" className="text-xs text-muted-foreground">
                Snooze Duration (minutes)
              </Label>
              <input
                id="snooze-mins"
                type="number"
                min="1"
                max="60"
                value={settings.snoozeMinutes}
                onChange={(e) => setSettings({ ...settings, snoozeMinutes: Number.parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>
          )}
        </Card>

        {/* Screen Brightness */}
        <OptionToggle
          label="Keep Screen On"
          description="Keep screen on during alarm"
          checked={settings.screenBrightness}
          onChange={(checked) => setSettings({ ...settings, screenBrightness: checked })}
          icon={Sun}
        />

        {/* About */}
        <Card className="p-4 bg-gradient-to-br from-card to-card/50 border-accent/10 rounded-2xl animate-fade-in">
          <div className="flex items-start gap-3 mb-3">
            <Info className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-base">About</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Alarm App v5.0 - Modern offline alarm with background functionality, timer, stopwatch, world clocks,
                custom audio, timezone selection, and themes.
              </p>
            </div>
          </div>
          <Button variant="destructive" onClick={handleReset} className="w-full h-9 rounded-lg font-semibold text-sm">
            Reset All Data
          </Button>
        </Card>
      </div>
    </div>
  )
}
