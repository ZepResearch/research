"use client"

import { useState } from "react"
import { RotateCcw } from "lucide-react"
import { useDashboardData } from "@/contexts/dashboard-context"
import { useAuth } from "@/contexts/auth-context"

export default function RefreshDashboardButton() {
  const { user } = useAuth()
  const { refreshData } = useDashboardData()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    if (!user) return
    setIsRefreshing(true)
    await refreshData(user.id)
    setIsRefreshing(false)
  }

  return (
    <button
      onClick={handleRefresh}
      disabled={isRefreshing}
      className="refresh-btn"
      title="Refresh dashboard data"
      style={{
        padding: "8px 16px",
        borderRadius: "6px",
        border: "1px solid #e2e8f0",
        backgroundColor: "#f8fafc",
        color: "#334155",
        fontSize: "13px",
        fontWeight: "500",
        cursor: isRefreshing ? "not-allowed" : "pointer",
        display: "flex",
        alignItems: "center",
        gap: "6px",
        opacity: isRefreshing ? 0.6 : 1,
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        if (!isRefreshing) {
          e.target.style.backgroundColor = "#e2e8f0"
        }
      }}
      onMouseLeave={(e) => {
        e.target.style.backgroundColor = "#f8fafc"
      }}
    >
      <RotateCcw
        size={14}
        className={isRefreshing ? "animate-spin" : ""}
        style={{
          animation: isRefreshing ? "spin 1s linear infinite" : "none",
        }}
      />
      {isRefreshing ? "Refreshing..." : "Refresh"}
    </button>
  )
}
