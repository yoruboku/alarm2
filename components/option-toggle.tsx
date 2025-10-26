"use client"

import { Switch } from "@/components/ui/switch"
import { Card } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface OptionToggleProps {
  label: string
  description?: string
  checked: boolean
  onChange: (checked: boolean) => void
  icon?: LucideIcon
}

export default function OptionToggle({ label, description, checked, onChange, icon: Icon }: OptionToggleProps) {
  return (
    <Card className="p-4 bg-secondary/30 border-secondary/50 hover:border-accent/30 transition-all">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
          {Icon && <Icon className="w-5 h-5 text-accent flex-shrink-0" />}
          <div>
            <p className="font-semibold text-sm text-foreground">{label}</p>
            {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
          </div>
        </div>
        <Switch checked={checked} onCheckedChange={onChange} />
      </div>
    </Card>
  )
}
