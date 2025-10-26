"use client"

import { useState } from "react"
import ClocksView from "./clocks-view"
import SettingsView from "./settings-view"
import { Button } from "@/components/ui/button"
import { Globe, Settings } from "lucide-react"

export default function ClocksAndSettings() {
  const [activeTab, setActiveTab] = useState<"clocks" | "settings">("clocks")

  return (
    <div className="min-h-screen pb-24">
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-40">
        <div className="flex gap-2 p-3 max-w-2xl mx-auto">
          <Button
            onClick={() => setActiveTab("clocks")}
            variant={activeTab === "clocks" ? "default" : "outline"}
            className="flex-1 gap-2 rounded-lg h-10"
          >
            <Globe className="w-4 h-4" />
            Clocks
          </Button>
          <Button
            onClick={() => setActiveTab("settings")}
            variant={activeTab === "settings" ? "default" : "outline"}
            className="flex-1 gap-2 rounded-lg h-10"
          >
            <Settings className="w-4 h-4" />
            Settings
          </Button>
        </div>
      </div>

      {activeTab === "clocks" && <ClocksView />}
      {activeTab === "settings" && <SettingsView />}
    </div>
  )
}
