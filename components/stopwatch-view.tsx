"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Play, Pause, RotateCcw, Flag, Trash2 } from "lucide-react"
import { StopwatchStore, type StopwatchState } from "@/lib/stopwatch-store"
import { bgManager } from "@/lib/background-manager"

export default function StopwatchView() {
  const [elapsed, setElapsed] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [laps, setLaps] = useState<number[]>([])
  const [startTime, setStartTime] = useState<number>(0)

  useEffect(() => {
    const savedStopwatch = StopwatchStore.getStopwatch()
    if (savedStopwatch) {
      const currentElapsed = StopwatchStore.getElapsedTime(savedStopwatch)
      setElapsed(currentElapsed)
      setIsRunning(savedStopwatch.isRunning)
      setLaps(savedStopwatch.laps)
      if (savedStopwatch.isRunning) {
        setStartTime(Date.now() - currentElapsed)
      }
    }
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isRunning) {
      interval = setInterval(() => {
        setElapsed((prev) => prev + 10)
      }, 10)
    }

    return () => clearInterval(interval)
  }, [isRunning])

  useEffect(() => {
    if (isRunning || elapsed > 0) {
      const stopwatchState: StopwatchState = {
        elapsed,
        isRunning,
        laps,
        startTime: startTime || Date.now(),
        pausedAt: isRunning ? undefined : Date.now(),
      }
      StopwatchStore.saveStopwatch(stopwatchState)

      // Show notification when running
      if (isRunning) {
        const minutes = Math.floor(elapsed / 60000)
        const seconds = Math.floor((elapsed % 60000) / 1000)
        bgManager.showNotification("Stopwatch Running", {
          body: `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`,
          icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='45' fill='%238b5cf6'/><text x='50' y='60' fontSize='40' fill='white' textAnchor='middle' fontWeight='bold'>⏱️</text></svg>",
        })
      }
    }
  }, [elapsed, isRunning, laps, startTime])

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    const milliseconds = Math.floor((ms % 1000) / 10)

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(milliseconds).padStart(2, "0")}`
  }

  const handleLap = () => {
    setLaps([...laps, elapsed])
  }

  const handleReset = () => {
    setIsRunning(false)
    setElapsed(0)
    setLaps([])
    setStartTime(0)
    StopwatchStore.clearStopwatch()
  }

  const handleDeleteLap = (index: number) => {
    setLaps(laps.filter((_, i) => i !== index))
  }

  return (
    <div className="p-3 max-w-2xl mx-auto pb-24 min-h-screen flex flex-col">
      <h1 className="text-2xl font-bold mb-6">Stopwatch</h1>

      <Card className="p-6 text-center mb-6 bg-gradient-to-br from-card to-card/50 border-accent/10 flex-1 flex flex-col justify-center animate-scale-in">
        <div className="text-5xl font-bold font-mono mb-6 text-accent">{formatTime(elapsed)}</div>

        <div className="flex gap-3 justify-center mb-6 flex-wrap">
          <Button
            onClick={() => {
              setIsRunning(!isRunning)
              if (!isRunning && startTime === 0) {
                setStartTime(Date.now() - elapsed)
              }
            }}
            size="lg"
            className="rounded-full w-16 h-16 shadow-lg shadow-accent/30 hover:shadow-accent/50 transition-all active:scale-95"
          >
            {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </Button>
          <Button
            onClick={handleLap}
            variant="outline"
            size="lg"
            className="rounded-full w-16 h-16 bg-transparent hover:bg-secondary/50 transition-all active:scale-95"
          >
            <Flag className="w-6 h-6" />
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

      {laps.length > 0 && (
        <Card className="p-4 bg-gradient-to-br from-card to-card/50 border-accent/10 animate-slide-up">
          <h2 className="font-bold mb-3 text-base">Laps ({laps.length})</h2>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {laps.map((lap, i) => (
              <div
                key={i}
                className="flex justify-between items-center text-xs p-2 bg-secondary/30 rounded-lg border border-border hover:bg-secondary/50 transition-colors animate-fade-in"
              >
                <span className="font-medium">Lap {i + 1}</span>
                <span className="font-mono text-accent text-sm">{formatTime(lap)}</span>
                <Button variant="ghost" size="sm" onClick={() => handleDeleteLap(i)} className="h-5 w-5 p-0">
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
