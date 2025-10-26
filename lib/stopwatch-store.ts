export interface StopwatchState {
  elapsed: number
  isRunning: boolean
  laps: number[]
  startTime: number
  pausedAt?: number
}

export class StopwatchStore {
  private static readonly STORAGE_KEY = "stopwatch-state"

  static saveStopwatch(stopwatch: StopwatchState) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stopwatch))
  }

  static getStopwatch(): StopwatchState | null {
    const stored = localStorage.getItem(this.STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  }

  static clearStopwatch() {
    localStorage.removeItem(this.STORAGE_KEY)
  }

  static getElapsedTime(stopwatch: StopwatchState): number {
    if (!stopwatch.isRunning) {
      return stopwatch.pausedAt ? stopwatch.pausedAt - stopwatch.startTime : stopwatch.elapsed
    }
    return stopwatch.elapsed + (Date.now() - stopwatch.startTime)
  }
}
