"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  FileText,
  Award,
  Send,
  Shield,
  X,
  ArrowLeft,
} from "lucide-react"

const adminNavItems = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Registrations", href: "/admin/registrations", icon: CalendarDays },
  { label: "Conf. Submissions", href: "/admin/conference-submissions", icon: Send },
  { label: "Journal Submissions", href: "/admin/submissions", icon: FileText },
  { label: "Certificates Queue", href: "/admin/certificates", icon: Award },
]

export default function AdminSidebar({ isOpen, onClose }) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`sidebar-overlay ${isOpen ? "visible" : ""}`}
        onClick={onClose}
      />

      {/* Admin Sidebar */}
      <aside className={`dashboard-sidebar ${isOpen ? "open" : ""}`} style={{ background: "#0f172a", borderRightColor: "#1e293b" }}>
        {/* Header Branding */}
        <div className="sidebar-logo" style={{ borderBottomColor: "#1e293b", padding: "18px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: 34, height: 34, borderRadius: 10,
                background: "linear-gradient(135deg, #0891b2, #06b6d4)",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <Shield size={18} color="#fff" />
              </div>
              <div>
                <h2 style={{ color: "#fff", fontSize: 16, fontWeight: 700, margin: 0 }}>
                  ZEP Admin
                </h2>
                <p style={{ color: "#64748b", fontSize: 11, margin: 0 }}>
                  Management Console
                </p>
              </div>
            </div>
            {/* Mobile close */}
            <button
              onClick={onClose}
              className="mobile-menu-btn"
              style={{ display: isOpen ? "flex" : "", borderColor: "#1e293b", background: "#0f172a" }}
              aria-label="Close menu"
            >
              <X size={18} color="#94a3b8" />
            </button>
          </div>
        </div>

        {/* Admin Navigation */}
        <nav className="sidebar-nav" style={{ padding: "16px 12px" }}>
          {adminNavItems.map((item) => {
            const Icon = item.icon
            const isActive =
              (item.href === "/admin" && pathname === "/admin") ||
              (item.href !== "/admin" && pathname?.startsWith(item.href))

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-nav-item ${isActive ? "active" : ""}`}
                onClick={onClose}
                style={{
                  color: isActive ? "#ffffff" : "#94a3b8",
                  background: isActive ? "#0891b2" : "transparent",
                  fontWeight: isActive ? 600 : 500,
                  borderRadius: "8px",
                  padding: "10px 14px",
                  marginBottom: "4px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  textDecoration: "none",
                  transition: "all 0.2s"
                }}
              >
                <Icon size={18} color={isActive ? "#fff" : "#94a3b8"} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Back to User Dashboard Link */}
        <div style={{ padding: "16px", borderTop: "1px solid #1e293b", marginTop: "auto" }}>
          <Link
            href="/dashboard"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 14px",
              borderRadius: "8px",
              background: "#1e293b",
              color: "#22d3ee",
              fontSize: "13px",
              fontWeight: 600,
              textDecoration: "none",
              transition: "background 0.2s"
            }}
          >
            <ArrowLeft size={16} /> Return to Dashboard
          </Link>
        </div>
      </aside>
    </>
  )
}
