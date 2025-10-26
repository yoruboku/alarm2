"use client"

import { useState } from "react"
import type { Alarm } from "@/types/alarm"
import AlarmCard from "./alarm-card"
import AlarmForm from "./alarm-form"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Copy, Power, Settings2, X, CheckSquare } from "lucide-react"

interface AlarmListProps {
  alarms: Alarm[]
  onAddAlarm: (alarm: Alarm) => void
  onUpdateAlarm: (id: string, alarm: Alarm) => void
  onDeleteAlarm: (id: string) => void
  onMultiSelectStop: (ids: string[], todayOnly: boolean) => void
  onDuplicateAlarms: (ids: string[]) => void
}

const TONES = ["Bell", "Chime", "Digital", "Alarm", "Beep"]

export default function AlarmList({
  alarms,
  onAddAlarm,
  onUpdateAlarm,
  onDeleteAlarm,
  onMultiSelectStop,
  onDuplicateAlarms,
}: AlarmListProps) {
  const [showForm, setShowForm] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [multiSelectMode, setMultiSelectMode] = useState(false)
  const [bulkTone, setBulkTone] = useState<string | null>(null)
  const [bulkVolume, setBulkVolume] = useState<number | null>(null)

  const handleToggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedIds.size === alarms.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(alarms.map((a) => a.id)))
    }
  }

  const handleBulkToggleEnabled = (enabled: boolean) => {
    Array.from(selectedIds).forEach((id) => {
      const alarm = alarms.find((a) => a.id === id)
      if (alarm) {
        onUpdateAlarm(id, { ...alarm, enabled })
      }
    })
  }

  const handleBulkChangeTone = (tone: string) => {
    Array.from(selectedIds).forEach((id) => {
      const alarm = alarms.find((a) => a.id === id)
      if (alarm) {
        onUpdateAlarm(id, { ...alarm, tone })
      }
    })
    setBulkTone(null)
  }

  const handleBulkChangeVolume = (volume: number) => {
    Array.from(selectedIds).forEach((id) => {
      const alarm = alarms.find((a) => a.id === id)
      if (alarm) {
        onUpdateAlarm(id, { ...alarm, volume })
      }
    })
    setBulkVolume(null)
  }

  const handleExitMultiSelect = () => {
    setMultiSelectMode(false)
    setSelectedIds(new Set())
    setBulkTone(null)
    setBulkVolume(null)
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-balance">Alarms</h1>
        <Button onClick={() => setShowForm(!showForm)} size="icon" className="rounded-full">
          <Plus className="w-5 h-5" />
        </Button>
      </div>

      {showForm && (
        <div className="mb-6 animate-slide-up">
          <AlarmForm
            onSubmit={(alarm) => {
              onAddAlarm(alarm)
              setShowForm(false)
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {multiSelectMode && selectedIds.size > 0 && (
        <div className="mb-4 p-4 bg-gradient-to-r from-accent/10 to-accent/5 rounded-lg border border-accent/20 animate-slide-up space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-accent" />
              <span className="text-sm font-semibold">{selectedIds.size} selected</span>
            </div>
            <Button size="sm" variant="ghost" onClick={handleExitMultiSelect} className="h-8 w-8 p-0">
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button size="sm" variant="outline" onClick={() => handleBulkToggleEnabled(true)} className="gap-2">
              <Power className="w-4 h-4" />
              Enable All
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleBulkToggleEnabled(false)} className="gap-2">
              <Power className="w-4 h-4" />
              Disable All
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDuplicateAlarms(Array.from(selectedIds))}
              className="gap-2"
            >
              <Copy className="w-4 h-4" />
              Duplicate
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                Array.from(selectedIds).forEach((id) => onDeleteAlarm(id))
                setSelectedIds(new Set())
                setMultiSelectMode(false)
              }}
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          </div>

          <div className="space-y-3 pt-3 border-t border-accent/20">
            <div className="flex gap-2">
              <select
                value={bulkTone || ""}
                onChange={(e) => {
                  if (e.target.value) {
                    handleBulkChangeTone(e.target.value)
                  }
                }}
                className="flex-1 px-3 py-2 text-sm bg-input border border-border rounded-lg text-foreground font-medium"
              >
                <option value="">Change tone...</option>
                {TONES.map((tone) => (
                  <option key={tone} value={tone}>
                    {tone}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 items-center">
              <span className="text-xs text-muted-foreground font-medium">Volume:</span>
              <input
                type="range"
                min="0"
                max="100"
                step="10"
                onChange={(e) => handleBulkChangeVolume(Number.parseInt(e.target.value))}
                className="flex-1 h-2"
              />
            </div>
          </div>
        </div>
      )}

      {alarms.length > 0 && !multiSelectMode && (
        <div className="mb-4 flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setMultiSelectMode(true)} className="gap-2">
            <Settings2 className="w-4 h-4" />
            Multi-Select
          </Button>
        </div>
      )}

      {multiSelectMode && (
        <div className="mb-4 flex gap-2">
          <Button size="sm" variant="outline" onClick={handleSelectAll} className="gap-2 bg-transparent">
            <CheckSquare className="w-4 h-4" />
            {selectedIds.size === alarms.length ? "Deselect All" : "Select All"}
          </Button>
          <Button size="sm" variant="outline" onClick={handleExitMultiSelect}>
            Exit
          </Button>
        </div>
      )}

      <div className="space-y-3">
        {alarms.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No alarms yet. Create one to get started!</p>
          </div>
        ) : (
          alarms.map((alarm) => (
            <AlarmCard
              key={alarm.id}
              alarm={alarm}
              isSelected={selectedIds.has(alarm.id)}
              onToggleSelect={() => {
                handleToggleSelect(alarm.id)
                if (!multiSelectMode) {
                  setMultiSelectMode(true)
                }
              }}
              onUpdate={(updated) => onUpdateAlarm(alarm.id, updated)}
              onDelete={() => onDeleteAlarm(alarm.id)}
              multiSelectMode={multiSelectMode}
            />
          ))
        )}
      </div>
    </div>
  )
}
