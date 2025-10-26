"use client"

import { useState, useEffect } from "react"
import type { Alarm } from "@/types/alarm"
import { Button } from "@/components/ui/button"
import { audioGenerator } from "@/lib/audio"
import { Clock, Volume2, Vibrate, X } from "lucide-react"

interface AlarmRingScreenProps {
  alarm: Alarm
  onStop: () => void
  onSnooze?: (minutes: number) => void
  codeAttempts: number
  onCodeAttempt: () => void
}

export default function AlarmRingScreen({
  alarm,
  onStop,
  onSnooze,
  codeAttempts,
  onCodeAttempt,
}: AlarmRingScreenProps) {
  const [code, setCode] = useState("")
  const [error, setError] = useState(false)
  const [time, setTime] = useState(new Date())
  const [showSnoozeOptions, setShowSnoozeOptions] = useState(false)
  const [correctCode, setCorrectCode] = useState("")

  useEffect(() => {
    // Generate random code
    const randomCode = Array.from({ length: alarm.codeLength }, () => Math.floor(Math.random() * 10).toString()).join(
      "",
    )
    setCorrectCode(randomCode)
  }, [alarm.codeLength])

  useEffect(() => {
    const playAlarmAudio = () => {
      const volume = alarm.volume / 100
      if (alarm.customAudioUrl) {
        const audio = new Audio(alarm.customAudioUrl)
        audio.volume = volume
        audio.play().catch(() => {
          audioGenerator.playTone(alarm.tone as any, 2, volume)
        })
      } else {
        audioGenerator.playTone(alarm.tone as any, 2, volume)
      }
    }

    playAlarmAudio()
    const audioInterval = setInterval(playAlarmAudio, 2500)

    if (alarm.vibration && navigator.vibrate) {
      const vibrationPattern = [200, 100, 200, 100]
      navigator.vibrate(vibrationPattern)
      const vibrationInterval = setInterval(() => {
        navigator.vibrate(vibrationPattern)
      }, 600)
      return () => {
        clearInterval(audioInterval)
        clearInterval(vibrationInterval)
        audioGenerator.stop()
      }
    }

    return () => {
      clearInterval(audioInterval)
      audioGenerator.stop()
    }
  }, [alarm])

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const handleCodeInput = (digit: string) => {
    if (code.length < alarm.codeLength) {
      const newCode = code + digit
      setCode(newCode)

      if (newCode.length === alarm.codeLength) {
        onCodeAttempt()
        if (newCode === correctCode) {
          setError(false)
          audioGenerator.stop()
          setTimeout(onStop, 500)
        } else {
          setError(true)
          setCode("")
          setTimeout(() => setError(false), 500)
        }
      }
    }
  }

  const handleBackspace = () => {
    setCode(code.slice(0, -1))
  }

  const handleSnooze = (minutes: number) => {
    audioGenerator.stop()
    if (onSnooze) {
      onSnooze(minutes)
    }
    setShowSnoozeOptions(false)
  }

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 animate-fade-in overflow-y-auto z-50">
      {/* Time Display */}
      <div className="text-center mb-8 mt-4 animate-scale-in">
        <div className="text-7xl font-bold mb-2 text-accent">
          {time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
        </div>
        <p className="text-2xl text-muted-foreground">{alarm.label}</p>
      </div>

      {/* Pulsing Ring Indicator */}
      <div className="mb-8 relative animate-pulse-ring">
        <div className="w-32 h-32 rounded-full bg-accent/20 flex items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-accent/40 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-accent animate-pulse" />
          </div>
        </div>
      </div>

      {/* Alarm Info */}
      <div className="mb-8 flex gap-4 justify-center text-sm text-muted-foreground">
        {alarm.vibration && (
          <div className="flex items-center gap-1">
            <Vibrate className="w-4 h-4" />
            <span>Vibration</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <Volume2 className="w-4 h-4" />
          <span>{alarm.volume}%</span>
        </div>
      </div>

      {/* Snooze Options */}
      {showSnoozeOptions && (
        <div className="mb-8 p-4 bg-card rounded-2xl border border-border animate-slide-up space-y-2 w-full max-w-xs">
          <p className="text-sm font-medium text-center mb-3">Snooze for:</p>
          <div className="grid grid-cols-2 gap-2">
            {[5, 10, 15, 30].map((minutes) => (
              <Button
                key={minutes}
                onClick={() => handleSnooze(minutes)}
                variant="outline"
                size="sm"
                className="gap-2 rounded-xl"
              >
                <Clock className="w-4 h-4" />
                {minutes}m
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Code Display */}
      <div className="mb-8 p-6 bg-accent/10 rounded-2xl border border-accent/30 animate-scale-in">
        <p className="text-center text-muted-foreground mb-3 text-sm">Enter the code:</p>
        <div className="text-3xl font-bold text-accent font-mono tracking-widest text-center">{correctCode}</div>
      </div>

      {/* Code Input */}
      <div className="mb-8">
        <p className="text-center text-muted-foreground mb-4">Enter {alarm.codeLength}-digit code</p>
        <div className={`flex gap-3 justify-center transition-all ${error ? "animate-pulse" : ""}`}>
          {Array.from({ length: alarm.codeLength }).map((_, i) => (
            <div
              key={i}
              className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center text-xl font-bold transition-all ${
                i < code.length
                  ? error
                    ? "border-destructive bg-destructive/20 text-destructive animate-pulse"
                    : "border-accent bg-accent/20 text-accent"
                  : "border-muted-foreground/30"
              }`}
            >
              {i < code.length && "•"}
            </div>
          ))}
        </div>
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-3 mb-8 w-full max-w-xs">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <Button
            key={num}
            onClick={() => handleCodeInput(num.toString())}
            className="w-full h-16 text-xl font-bold rounded-xl active:scale-95 transition-transform"
            variant="secondary"
          >
            {num}
          </Button>
        ))}
      </div>

      {/* 0 and Backspace */}
      <div className="flex gap-3 mb-8 w-full max-w-xs">
        <Button
          onClick={() => handleCodeInput("0")}
          className="flex-1 h-16 text-xl font-bold rounded-xl active:scale-95 transition-transform"
          variant="secondary"
        >
          0
        </Button>
        <Button
          onClick={handleBackspace}
          className="flex-1 h-16 text-xl font-bold rounded-xl bg-transparent active:scale-95 transition-transform"
          variant="outline"
        >
          ←
        </Button>
      </div>

      {/* Attempts Counter */}
      <p className="text-sm text-muted-foreground mb-6">Attempts: {codeAttempts}</p>

      {/* Action Buttons */}
      <div className="flex gap-3 w-full max-w-xs flex-col">
        <Button
          onClick={() => setShowSnoozeOptions(!showSnoozeOptions)}
          variant="outline"
          className="w-full gap-2 rounded-xl h-12"
        >
          <Clock className="w-4 h-4" />
          Snooze
        </Button>
        <Button onClick={onStop} variant="destructive" className="w-full rounded-xl h-12 font-semibold">
          <X className="w-4 h-4 mr-2" />
          Stop Alarm
        </Button>
      </div>
    </div>
  )
}
