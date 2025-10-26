export interface Alarm {
  id: string
  time: string
  label: string
  enabled: boolean
  daysOfWeek: number[]
  tone: string
  volume: number
  vibration: boolean
  codeLength: number
  codeAttempts: number
  fadeIn: boolean
  growing: boolean
  customAudioUrl?: string
  snoozeMinutes?: number
}

export interface AlarmStore {
  alarms: Alarm[]
  ringingAlarm: Alarm | null
}
