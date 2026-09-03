"use client"

import { useAuth } from "@/contexts/auth-context"
import { getImageUrl } from "@/lib/pocketbase"
import { Bell, ChevronDown, Menu } from "lucide-react"

export default function DashboardHeader({ onMenuToggle }) {
  const { user } = useAuth()

  const userName = user?.name || user?.email?.split("@")[0] || "User"
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const avatarUrl = user?.avatar
    ? getImageUrl(user, user.avatar)
    : null

  return (
    <header className="dashboard-topbar">
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {/* Mobile menu button */}
        <button className="mobile-menu-btn" onClick={onMenuToggle} aria-label="Toggle menu">
          <Menu size={18} />
        </button>

        <div className="topbar-welcome">
          <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>Welcome back,</p>
          <h1>{userName} 👋</h1>
        </div>
      </div>

      <div className="topbar-actions">
        {/* Notification Bell */}
        <button className="topbar-notification" aria-label="Notifications">
          <Bell size={18} color="#64748b" />
          <span className="notif-dot" />
        </button>

        {/* User Avatar */}
        <div className="topbar-user">
          <div className="topbar-user-avatar">
            {avatarUrl ? (
              <img src={avatarUrl} alt={userName} />
            ) : (
              initials
            )}
          </div>
          <span className="topbar-user-name">{userName}</span>
          <ChevronDown size={14} color="#94a3b8" />
        </div>
      </div>
    </header>
  )
}
