"use client"
import { Clock, Timer, StepBack as Stopwatch, Globe, Settings } from "lucide-react"

interface BottomNavProps {
  currentView: "alarms" | "timer" | "stopwatch" | "clocks" | "settings"
  onViewChange: (view: "alarms" | "timer" | "stopwatch" | "clocks" | "settings") => void
}

export default function BottomNav({ currentView, onViewChange }: BottomNavProps) {
  const navItems = [
    { id: "alarms", label: "Alarms", icon: Clock },
    { id: "timer", label: "Timer", icon: Timer },
    { id: "stopwatch", label: "Stopwatch", icon: Stopwatch },
    { id: "clocks", label: "Clocks", icon: Globe },
    { id: "settings", label: "Settings", icon: Settings },
  ] as const

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border flex justify-around items-center h-20">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = currentView === item.id
        return (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`flex flex-col items-center justify-center gap-1 py-2 px-4 transition-all ${
              isActive ? "text-accent" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="w-6 h-6" />
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
