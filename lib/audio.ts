// Audio utility for generating and playing alarm sounds

export type ToneType = "Bell" | "Chime" | "Digital" | "Alarm" | "Beep"

class AudioGenerator {
  private audioContext: AudioContext | null = null
  private oscillators: OscillatorNode[] = []
  private gainNodes: GainNode[] = []

  private getAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    return this.audioContext
  }

  private stopAllOscillators() {
    this.oscillators.forEach((osc) => {
      try {
        osc.stop()
      } catch (e) {
        // Already stopped
      }
    })
    this.gainNodes.forEach((gain) => {
      gain.gain.setValueAtTime(0, this.getAudioContext().currentTime)
    })
    this.oscillators = []
    this.gainNodes = []
  }

  playBell(duration = 1, volume = 0.3) {
    const ctx = this.getAudioContext()
    const now = ctx.currentTime

    // Bell sound: multiple frequencies
    const frequencies = [523.25, 659.25, 783.99] // C5, E5, G5
    frequencies.forEach((freq, index) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.frequency.value = freq
      osc.type = "sine"

      gain.gain.setValueAtTime(volume * (1 - index * 0.2), now)
      gain.gain.exponentialRampToValueAtTime(0.01, now + duration)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + duration)

      this.oscillators.push(osc)
      this.gainNodes.push(gain)
    })
  }

  playChime(duration = 1, volume = 0.3) {
    const ctx = this.getAudioContext()
    const now = ctx.currentTime

    // Chime: descending tones
    const frequencies = [880, 659.25, 523.25] // A5, E5, C5
    frequencies.forEach((freq, index) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.frequency.value = freq
      osc.type = "sine"

      const startTime = now + index * 0.15
      gain.gain.setValueAtTime(volume, startTime)
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration * 0.6)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(startTime)
      osc.stop(startTime + duration * 0.6)

      this.oscillators.push(osc)
      this.gainNodes.push(gain)
    })
  }

  playDigital(duration = 1, volume = 0.3) {
    const ctx = this.getAudioContext()
    const now = ctx.currentTime

    // Digital: rapid beeps
    const beepDuration = 0.1
    const beepCount = Math.floor(duration / 0.15)

    for (let i = 0; i < beepCount; i++) {
      const startTime = now + i * 0.15
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.frequency.value = 1000
      osc.type = "square"

      gain.gain.setValueAtTime(volume, startTime)
      gain.gain.setValueAtTime(0, startTime + beepDuration)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(startTime)
      osc.stop(startTime + beepDuration)

      this.oscillators.push(osc)
      this.gainNodes.push(gain)
    }
  }

  playAlarm(duration = 1, volume = 0.3) {
    const ctx = this.getAudioContext()
    const now = ctx.currentTime

    // Alarm: alternating frequencies
    const frequencies = [800, 600]
    let currentFreq = 0

    const switchInterval = 0.2
    const switchCount = Math.floor(duration / switchInterval)

    for (let i = 0; i < switchCount; i++) {
      const startTime = now + i * switchInterval
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.frequency.value = frequencies[currentFreq % 2]
      osc.type = "sine"

      gain.gain.setValueAtTime(volume, startTime)
      gain.gain.setValueAtTime(0, startTime + switchInterval)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(startTime)
      osc.stop(startTime + switchInterval)

      this.oscillators.push(osc)
      this.gainNodes.push(gain)
      currentFreq++
    }
  }

  playBeep(duration = 0.5, volume = 0.3) {
    const ctx = this.getAudioContext()
    const now = ctx.currentTime

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.frequency.value = 1200
    osc.type = "sine"

    gain.gain.setValueAtTime(volume, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + duration)

    this.oscillators.push(osc)
    this.gainNodes.push(gain)
  }

  playTone(tone: ToneType, duration = 1, volume = 0.3) {
    this.stopAllOscillators()

    switch (tone) {
      case "Bell":
        this.playBell(duration, volume)
        break
      case "Chime":
        this.playChime(duration, volume)
        break
      case "Digital":
        this.playDigital(duration, volume)
        break
      case "Alarm":
        this.playAlarm(duration, volume)
        break
      case "Beep":
        this.playBeep(duration, volume)
        break
    }
  }

  stop() {
    this.stopAllOscillators()
  }
}

export const audioGenerator = new AudioGenerator()
