export class BackgroundManager {
  private static instance: BackgroundManager
  private worker: Worker | null = null
  private listeners: Map<string, Function[]> = new Map()

  private constructor() {
    this.initWorker()
  }

  static getInstance(): BackgroundManager {
    if (!BackgroundManager.instance) {
      BackgroundManager.instance = new BackgroundManager()
    }
    return BackgroundManager.instance
  }

  private initWorker() {
    // Use inline worker since we can't load external files
    try {
      const workerCode = `
        let timers = {};
        let alarms = {};

        self.onmessage = (event) => {
          const { type, payload } = event.data;

          if (type === 'START_TIMER') {
            const { id, duration } = payload;
            const startTime = Date.now();
            timers[id] = { startTime, duration, paused: false, pausedTime: 0 };
            
            const interval = setInterval(() => {
              if (!timers[id]) {
                clearInterval(interval);
                return;
              }

              if (timers[id].paused) return;

              const elapsed = Date.now() - timers[id].startTime - timers[id].pausedTime;
              const remaining = Math.max(0, timers[id].duration - elapsed);

              if (remaining === 0) {
                clearInterval(interval);
                self.postMessage({ type: 'TIMER_FINISHED', payload: { id } });
                delete timers[id];
              } else {
                self.postMessage({ type: 'TIMER_TICK', payload: { id, remaining } });
              }
            }, 100);
          }

          if (type === 'PAUSE_TIMER') {
            const { id } = payload;
            if (timers[id]) {
              timers[id].paused = true;
              timers[id].pauseTime = Date.now();
            }
          }

          if (type === 'RESUME_TIMER') {
            const { id } = payload;
            if (timers[id]) {
              timers[id].pausedTime += Date.now() - timers[id].pauseTime;
              timers[id].paused = false;
            }
          }

          if (type === 'STOP_TIMER') {
            const { id } = payload;
            delete timers[id];
          }

          if (type === 'CHECK_ALARMS') {
            const { alarms: alarmList, currentTime } = payload;
            alarmList.forEach((alarm) => {
              if (alarm.enabled && alarm.time === currentTime) {
                self.postMessage({ type: 'ALARM_SHOULD_RING', payload: alarm });
              }
            });
          }
        };
      `

      const blob = new Blob([workerCode], { type: "application/javascript" })
      const workerUrl = URL.createObjectURL(blob)
      this.worker = new Worker(workerUrl)

      this.worker.onmessage = (event) => {
        this.handleWorkerMessage(event.data)
      }

      this.worker.onerror = (error) => {
        console.error("[BG] Worker error:", error)
      }
    } catch (error) {
      console.error("[BG] Failed to initialize worker:", error)
    }
  }

  private handleWorkerMessage(data: any) {
    const { type, payload } = data
    const listeners = this.listeners.get(type) || []

    listeners.forEach((listener) => {
      listener(payload)
    })

    // Also dispatch custom events for backward compatibility
    if (type === "ALARM_SHOULD_RING") {
      window.dispatchEvent(new CustomEvent("alarm-ringing", { detail: payload }))
    }

    if (type === "TIMER_FINISHED") {
      window.dispatchEvent(new CustomEvent("timer-finished", { detail: payload }))
    }

    if (type === "TIMER_TICK") {
      window.dispatchEvent(new CustomEvent("timer-tick", { detail: payload }))
    }
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(callback)
  }

  off(event: string, callback: Function) {
    const listeners = this.listeners.get(event) || []
    const index = listeners.indexOf(callback)
    if (index > -1) {
      listeners.splice(index, 1)
    }
  }

  updateState(state: any) {
    if (this.worker) {
      this.worker.postMessage({
        type: "UPDATE_STATE",
        payload: state,
      })
    }
  }

  startTimer(id: string, duration: number) {
    if (this.worker) {
      this.worker.postMessage({
        type: "START_TIMER",
        payload: { id, duration },
      })
    }
  }

  stopTimer(id: string) {
    if (this.worker) {
      this.worker.postMessage({
        type: "STOP_TIMER",
        payload: { id },
      })
    }
  }

  pauseTimer(id: string) {
    if (this.worker) {
      this.worker.postMessage({
        type: "PAUSE_TIMER",
        payload: { id },
      })
    }
  }

  resumeTimer(id: string) {
    if (this.worker) {
      this.worker.postMessage({
        type: "RESUME_TIMER",
        payload: { id },
      })
    }
  }

  checkAlarms(alarms: any[], currentTime: string) {
    if (this.worker) {
      this.worker.postMessage({
        type: "CHECK_ALARMS",
        payload: { alarms, currentTime },
      })
    }
  }

  requestNotificationPermission() {
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        return Promise.resolve()
      }
      if (Notification.permission !== "denied") {
        return Notification.requestPermission()
      }
    }
    return Promise.reject("Notifications not supported")
  }

  showNotification(title: string, options?: NotificationOptions) {
    if ("Notification" in window && Notification.permission === "granted") {
      return new Notification(title, options)
    }
  }
}

export const bgManager = BackgroundManager.getInstance()
