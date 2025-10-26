// Service Worker for background alarm and timer functionality
const CACHE_NAME = "alarm-app-v1"
const STORE_NAME = "alarm-store"

let alarmState = {
  alarms: [],
  timers: [],
  stopwatches: [],
  ringingAlarmId: null,
}

// Install event
self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker")
  self.skipWaiting()
})

// Activate event
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating service worker")
  self.clients.claim()
})

// Message handler for state updates
self.addEventListener("message", (event) => {
  const { type, payload } = event.data

  if (type === "UPDATE_STATE") {
    alarmState = payload
    console.log("[SW] State updated:", alarmState)
  }

  if (type === "START_TIMER") {
    const { id, duration } = payload
    const timer = {
      id,
      startTime: Date.now(),
      duration: duration * 1000,
      isRunning: true,
    }
    alarmState.timers.push(timer)
    console.log("[SW] Timer started:", id)
  }

  if (type === "STOP_TIMER") {
    alarmState.timers = alarmState.timers.filter((t) => t.id !== payload.id)
    console.log("[SW] Timer stopped:", payload.id)
  }

  if (type === "PAUSE_TIMER") {
    const timer = alarmState.timers.find((t) => t.id === payload.id)
    if (timer) {
      timer.isRunning = false
      timer.pausedAt = Date.now()
    }
  }

  if (type === "RESUME_TIMER") {
    const timer = alarmState.timers.find((t) => t.id === payload.id)
    if (timer) {
      timer.isRunning = true
      timer.startTime += Date.now() - timer.pausedAt
    }
  }
})

// Periodic background sync for alarms and timers
setInterval(() => {
  const now = new Date()
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`

  // Check for alarms
  const alarm = alarmState.alarms.find(
    (a) =>
      a.enabled &&
      a.time === currentTime &&
      !alarmState.ringingAlarmId &&
      (a.daysOfWeek.length === 0 || a.daysOfWeek.includes(now.getDay())),
  )

  if (alarm) {
    alarmState.ringingAlarmId = alarm.id
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({
          type: "ALARM_RINGING",
          payload: alarm,
        })
      })
    })

    // Send notification
    self.registration.showNotification(`Alarm: ${alarm.label}`, {
      body: `Time to wake up! Enter your code to stop the alarm.`,
      icon: "/alarm-icon.png",
      badge: "/alarm-badge.png",
      tag: "alarm-notification",
      requireInteraction: true,
    })
  }

  // Check for timers
  alarmState.timers.forEach((timer) => {
    if (timer.isRunning) {
      const elapsed = Date.now() - timer.startTime
      if (elapsed >= timer.duration) {
        alarmState.timers = alarmState.timers.filter((t) => t.id !== timer.id)
        self.clients.matchAll().then((clients) => {
          clients.forEach((client) => {
            client.postMessage({
              type: "TIMER_FINISHED",
              payload: { id: timer.id },
            })
          })
        })

        self.registration.showNotification("Timer Finished", {
          body: "Your timer has finished!",
          icon: "/timer-icon.png",
          badge: "/timer-badge.png",
          tag: "timer-notification",
        })
      }
    }
  })
}, 1000)
