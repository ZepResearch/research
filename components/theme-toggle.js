"use client"

import { useTheme } from "@/contexts/theme-context"
import { Sun, Moon, Monitor } from "lucide-react"

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme()

  const themes = [
    { value: "light", icon: Sun, label: "Light" },
    { value: "dark", icon: Moon, label: "Dark" },
    { value: "system", icon: Monitor, label: "System" },
  ]

  return (
    <div className="flex items-center gap-1 p-1 bg-white/10 dark:bg-black/10 backdrop-blur-sm rounded-lg border border-white/20 dark:border-white/10">
      {themes.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={`p-2 rounded-md transition-all duration-200 ${
            theme === value
              ? "bg-cyan-500 text-white shadow-lg"
              : "text-gray-600 dark:text-gray-400 hover:bg-white/20 dark:hover:bg-white/10"
          }`}
          title={label}
        >
          <Icon size={16} />
        </button>
      ))}
    </div>
  )
}
