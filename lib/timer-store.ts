export interface TimerState {
  id: string
  duration: number
  startTime: number
  isRunning: boolean
  pausedAt?: number
}

export class TimerStore {
  private static readonly STORAGE_KEY = "timer-state"

  static saveTimer(timer: TimerState) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(timer))
  }

  static getTimer(): TimerState | null {
    const stored = localStorage.getItem(this.STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  }

  static clearTimer() {
    localStorage.removeItem(this.STORAGE_KEY)
  }

  static getRemainingTime(timer: TimerState): number {
    if (!timer.isRunning) {
      return timer.duration - (timer.pausedAt ? timer.pausedAt - timer.startTime : 0)
    }
    const elapsed = Date.now() - timer.startTime
    return Math.max(0, timer.duration - elapsed)
  }
}
