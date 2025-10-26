"use client"

import { useState, useEffect } from "react"
import AlarmList from "@/components/alarm-list"
import AlarmRingScreen from "@/components/alarm-ring-screen"
import BottomNav from "@/components/bottom-nav"
import TimerView from "@/components/timer-view"
import StopwatchView from "@/components/stopwatch-view"
import ClocksView from "@/components/clocks-view"
import SettingsView from "@/components/settings-view"
import { bgManager } from "@/lib/background-manager"
import type { Alarm } from "@/types/alarm"

export default function Home() {
  const [view, setView] = useState<"alarms" | "timer" | "stopwatch" | "clocks" | "settings">("alarms")
  const [alarms, setAlarms] = useState<Alarm[]>([])
  const [ringingAlarm, setRingingAlarm] = useState<Alarm | null>(null)
  const [codeAttempts, setCodeAttempts] = useState(0)
  const [snoozeTimer, setSnoozeTimer] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    bgManager.requestNotificationPermission().catch(() => {
      console.log("[App] Notifications not available")
    })
  }, [])

  // Load alarms from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("alarms")
    if (stored) {
      setAlarms(JSON.parse(stored))
    }
  }, [])

  // Save alarms to localStorage and update service worker
  useEffect(() => {
    localStorage.setItem("alarms", JSON.stringify(alarms))
    bgManager.updateState({ alarms, ringingAlarmId: ringingAlarm?.id || null })
  }, [alarms, ringingAlarm])

  useEffect(() => {
    const handleAlarmRinging = (event: any) => {
      const alarm = event.detail
      if (!ringingAlarm) {
        setRingingAlarm(alarm)
        setCodeAttempts(0)
      }
    }

    window.addEventListener("alarm-ringing", handleAlarmRinging)
    return () => window.removeEventListener("alarm-ringing", handleAlarmRinging)
  }, [ringingAlarm])

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`

      // Check alarms using worker
      bgManager.checkAlarms(alarms, currentTime)

      // Also check locally for immediate response
      const alarm = alarms.find(
        (a) =>
          a.enabled &&
          a.time === currentTime &&
          !ringingAlarm &&
          (a.daysOfWeek.length === 0 || a.daysOfWeek.includes(now.getDay())),
      )

      if (alarm) {
        setRingingAlarm(alarm)
        setCodeAttempts(0)
        bgManager.showNotification(`Alarm: ${alarm.label}`, {
          body: `Time to wake up!`,
          icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='45' fill='%238b5cf6'/><text x='50' y='60' fontSize='40' fill='white' textAnchor='middle' fontWeight='bold'>⏰</text></svg>",
        })
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [alarms, ringingAlarm])

  const handleAddAlarm = (alarm: Alarm) => {
    setAlarms([...alarms, { ...alarm, id: Date.now().toString() }])
  }

  const handleUpdateAlarm = (id: string, alarm: Alarm) => {
    setAlarms(alarms.map((a) => (a.id === id ? { ...alarm, id } : a)))
  }

  const handleDeleteAlarm = (id: string) => {
    setAlarms(alarms.filter((a) => a.id !== id))
  }

  const handleStopAlarm = () => {
    setRingingAlarm(null)
    setCodeAttempts(0)
    if (snoozeTimer) {
      clearTimeout(snoozeTimer)
      setSnoozeTimer(null)
    }
  }

  const handleSnooze = (minutes: number) => {
    if (ringingAlarm) {
      if (snoozeTimer) {
        clearTimeout(snoozeTimer)
      }

      const timer = setTimeout(
        () => {
          setRingingAlarm(ringingAlarm)
          setCodeAttempts(0)
        },
        minutes * 60 * 1000,
      )

      setSnoozeTimer(timer)
      setRingingAlarm(null)
      setCodeAttempts(0)
    }
  }

  const handleMultiSelectStop = (ids: string[], todayOnly: boolean) => {
    if (todayOnly) {
      setAlarms(alarms.map((a) => (ids.includes(a.id) ? { ...a, enabled: false } : a)))
    } else {
      setAlarms(alarms.map((a) => (ids.includes(a.id) ? { ...a, enabled: false } : a)))
    }
  }

  const handleDuplicateAlarms = (ids: string[]) => {
    const newAlarms = alarms
      .filter((a) => ids.includes(a.id))
      .map((a) => ({
        ...a,
        id: Date.now().toString() + Math.random(),
      }))
    setAlarms([...alarms, ...newAlarms])
  }

  if (ringingAlarm) {
    return (
      <AlarmRingScreen
        alarm={ringingAlarm}
        onStop={handleStopAlarm}
        onSnooze={handleSnooze}
        codeAttempts={codeAttempts}
        onCodeAttempt={() => setCodeAttempts(codeAttempts + 1)}
      />
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {view === "alarms" && (
        <AlarmList
          alarms={alarms}
          onAddAlarm={handleAddAlarm}
          onUpdateAlarm={handleUpdateAlarm}
          onDeleteAlarm={handleDeleteAlarm}
          onMultiSelectStop={handleMultiSelectStop}
          onDuplicateAlarms={handleDuplicateAlarms}
        />
      )}
      {view === "timer" && <TimerView />}
      {view === "stopwatch" && <StopwatchView />}
      {view === "clocks" && <ClocksView />}
      {view === "settings" && <SettingsView />}

      <BottomNav currentView={view} onViewChange={setView} />
    </div>
  )
}
