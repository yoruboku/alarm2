"use client"

interface DaySelectorProps {
  selectedDays: number[]
  onChange: (days: number[]) => void
}

const DAYS = [
  { label: "Sun", short: "S" },
  { label: "Mon", short: "M" },
  { label: "Tue", short: "T" },
  { label: "Wed", short: "W" },
  { label: "Thu", short: "T" },
  { label: "Fri", short: "F" },
  { label: "Sat", short: "S" },
]

export default function DaySelector({ selectedDays, onChange }: DaySelectorProps) {
  const toggleDay = (day: number) => {
    const newDays = selectedDays.includes(day) ? selectedDays.filter((d) => d !== day) : [...selectedDays, day]
    onChange(newDays)
  }

  return (
    <div className="space-y-3">
      <label className="text-sm font-semibold text-foreground">Repeat</label>
      <div className="grid grid-cols-7 gap-2">
        {DAYS.map((day, i) => (
          <button
            key={i}
            onClick={() => toggleDay(i)}
            className={`
              relative h-12 rounded-xl font-semibold text-sm transition-all duration-300 transform
              ${
                selectedDays.includes(i)
                  ? "bg-gradient-to-br from-accent to-accent/80 text-accent-foreground shadow-lg shadow-accent/30 scale-105"
                  : "bg-secondary/50 text-secondary-foreground hover:bg-secondary/70 border border-secondary"
              }
              active:scale-95 hover:shadow-md
            `}
          >
            <span className="hidden sm:inline">{day.label}</span>
            <span className="sm:hidden">{day.short}</span>
            {selectedDays.includes(i) && (
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
