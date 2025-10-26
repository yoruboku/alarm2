"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Play, Pause, RotateCcw, Bell } from "lucide-react"
import { bgManager } from "@/lib/background-manager"
import { TimerStore, type TimerState } from "@/lib/timer-store"

export default function TimerView() {
  const [hours, setHours] = useState(0)
  const [minutes, setMinutes] = useState(5)
  const [seconds, setSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [totalSeconds, setTotalSeconds] = useState(0)
  const [timerId, setTimerId] = useState<string>("")
  const [showNotification, setShowNotification] = useState(false)
  const [showPicker, setShowPicker] = useState(true)
  const [startTime, setStartTime] = useState<number>(0)

  useEffect(() => {
    const savedTimer = TimerStore.getTimer()
    if (savedTimer) {
      const remaining = TimerStore.getRemainingTime(savedTimer)
      if (remaining > 0) {
        setTotalSeconds(remaining)
        setIsRunning(savedTimer.isRunning)
        setTimerId(savedTimer.id)
        setShowPicker(false)

        const h = Math.floor(remaining / 3600)
        const m = Math.floor((remaining % 3600) / 60)
        const s = remaining % 60
        setHours(h)
        setMinutes(m)
        setSeconds(s)
      } else {
        TimerStore.clearTimer()
      }
    }
  }, [])

  useEffect(() => {
    const handleTimerFinished = (event: any) => {
      if (event.detail.id === timerId) {
        setIsRunning(false)
        setTotalSeconds(0)
        setShowNotification(true)
        TimerStore.clearTimer()
        bgManager.showNotification("Timer Finished", {
          body: "Your timer has completed",
          icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='45' fill='%238b5cf6'/><text x='50' y='60' fontSize='40' fill='white' textAnchor='middle' fontWeight='bold'>⏱️</text></svg>",
        })
        setTimeout(() => setShowNotification(false), 3000)
      }
    }

    window.addEventListener("timer-finished", handleTimerFinished)
    return () => window.removeEventListener("timer-finished", handleTimerFinished)
  }, [timerId])

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isRunning && totalSeconds > 0) {
      interval = setInterval(() => {
        setTotalSeconds((prev) => {
          const newTotal = prev - 1

          if (newTotal <= 0) {
            setIsRunning(false)
            setShowNotification(true)
            TimerStore.clearTimer()
            bgManager.showNotification("Timer Finished", {
              body: "Your timer has completed",
              icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='45' fill='%238b5cf6'/><text x='50' y='60' fontSize='40' fill='white' textAnchor='middle' fontWeight='bold'>⏱️</text></svg>",
            })
            setTimeout(() => setShowNotification(false), 3000)
            return 0
          }

          return newTotal
        })
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [isRunning, totalSeconds])

  useEffect(() => {
    const h = Math.floor(totalSeconds / 3600)
    const m = Math.floor((totalSeconds % 3600) / 60)
    const s = totalSeconds % 60
    setHours(h)
    setMinutes(m)
    setSeconds(s)
  }, [totalSeconds])

  useEffect(() => {
    if (timerId && (totalSeconds > 0 || isRunning)) {
      const timerState: TimerState = {
        id: timerId,
        duration: totalSeconds,
        startTime: startTime || Date.now(),
        isRunning,
      }
      TimerStore.saveTimer(timerState)
    }
  }, [timerId, totalSeconds, isRunning, startTime])

  const handleStart = () => {
    if (!isRunning && totalSeconds === 0) {
      // Starting a new timer
      const duration = hours * 3600 + minutes * 60 + seconds
      if (duration === 0) return // Don't start with 0 duration

      const newTimerId = Date.now().toString()
      setTimerId(newTimerId)
      setTotalSeconds(duration)
      setStartTime(Date.now())
      bgManager.startTimer(newTimerId, duration * 1000)
      setShowPicker(false)
      setIsRunning(true)
    } else if (isRunning) {
      // Pause running timer
      setIsRunning(false)
      bgManager.pauseTimer(timerId)
    } else if (totalSeconds > 0) {
      // Resume paused timer
      setIsRunning(true)
      bgManager.resumeTimer(timerId)
    }
  }

  const handleReset = () => {
    if (timerId) {
      bgManager.stopTimer(timerId)
    }
    setIsRunning(false)
    setTotalSeconds(0)
    setHours(0)
    setMinutes(5)
    setSeconds(0)
    setTimerId("")
    setShowPicker(true)
    setStartTime(0)
    TimerStore.clearTimer()
  }

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.min(23, Math.max(0, Number.parseInt(e.target.value) || 0))
    setHours(val)
  }

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.min(59, Math.max(0, Number.parseInt(e.target.value) || 0))
    setMinutes(val)
  }

  const handleSecondsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.min(59, Math.max(0, Number.parseInt(e.target.value) || 0))
    setSeconds(val)
  }

  return (
    <div className="p-3 max-w-2xl mx-auto pb-24 min-h-screen flex flex-col">
      <h1 className="text-2xl font-bold mb-4 text-balance">Timer</h1>

      {showNotification && (
        <div className="mb-4 p-3 bg-accent/20 border border-accent rounded-lg flex items-center gap-2 animate-slide-up">
          <Bell className="w-4 h-4 text-accent flex-shrink-0" />
          <span className="text-sm text-accent font-semibold">Timer finished!</span>
        </div>
      )}

      <Card className="p-6 text-center mb-6 bg-gradient-to-br from-card to-card/50 border-accent/10 flex-1 flex flex-col justify-center animate-scale-in">
        <div className="text-4xl font-bold font-mono mb-6 text-accent tracking-tight">
          {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </div>

        {showPicker && totalSeconds === 0 && !isRunning && (
          <div className="mb-6 animate-fade-in space-y-4">
            <div className="flex gap-3 justify-center items-end">
              <div className="flex flex-col items-center">
                <label className="text-xs font-semibold text-muted-foreground mb-2">Hours</label>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={hours}
                  onChange={handleHoursChange}
                  className="w-16 h-12 text-center text-xl font-bold bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>
              <span className="text-2xl font-bold mb-2">:</span>
              <div className="flex flex-col items-center">
                <label className="text-xs font-semibold text-muted-foreground mb-2">Minutes</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={minutes}
                  onChange={handleMinutesChange}
                  className="w-16 h-12 text-center text-xl font-bold bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>
              <span className="text-2xl font-bold mb-2">:</span>
              <div className="flex flex-col items-center">
                <label className="text-xs font-semibold text-muted-foreground mb-2">Seconds</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={seconds}
                  onChange={handleSecondsChange}
                  className="w-16 h-12 text-center text-xl font-bold bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3 justify-center mt-auto">
          <Button
            onClick={handleStart}
            size="lg"
            className="rounded-full w-16 h-16 shadow-lg shadow-accent/30 hover:shadow-accent/50 transition-all active:scale-95"
          >
            {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </Button>
          <Button
            onClick={handleReset}
            variant="outline"
            size="lg"
            className="rounded-full w-16 h-16 bg-transparent hover:bg-secondary/50 transition-all active:scale-95"
          >
            <RotateCcw className="w-6 h-6" />
          </Button>
        </div>
      </Card>
    </div>
  )
}
