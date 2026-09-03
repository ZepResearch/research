"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { useDashboardData } from "@/contexts/dashboard-context"
import { getImageUrl as getZepImageUrl } from "@/lib/zep-pocketbase"
import RequestCertificateButton from "@/components/dashboard/RequestCertificateButton"
import RefreshDashboardButton from "@/components/dashboard/RefreshDashboardButton"
import {
  Crown,
  CalendarDays,
  BookOpen,
  MapPin,
  Download,
  FileText,
  CreditCard,
  Award,
  BookMarked,
  ShieldCheck,
  ArrowRight,
  ClipboardList,
  ExternalLink,
  Send,
} from "lucide-react"

export default function DashboardPage() {
  const { user } = useAuth()
  const { conferences, registrations, publications, membership, loading, initializeDashboardData } =
    useDashboardData()

  useEffect(() => {
    if (!user) return
    // Initialize dashboard data (will use cache if available)
    initializeDashboardData(user.id)
  }, [user, initializeDashboardData])

  const userName = user?.name || user?.email?.split("@")[0] || "User"

  // Determine membership label
  const membershipLabel = membership?.plan
    ? membership.plan.charAt(0).toUpperCase() + membership.plan.slice(1) + " Member"
    : "Free Member"

  return (
    <div>
      {/* Dashboard Header with Refresh Button */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>
            Here&apos;s what&apos;s happening with your conference journey
          </p>
        </div>
        <RefreshDashboardButton />
      </div>

      {/* ===== Stat Cards Row (3 Cards) ===== */}
      <div className="stat-cards-row fade-in-up" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
        {/* Membership */}
        <div className="stat-card">
          <div className="stat-card-icon cyan">
            <Crown size={22} />
          </div>
          <div className="stat-card-info">
            <h3>Membership</h3>
            <p className="stat-value" style={{ fontSize: "16px" }}>{membershipLabel}</p>
            <Link href="/membership" className="stat-link">
              View Membership Card <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Upcoming Conferences */}
        <div className="stat-card">
          <div className="stat-card-icon green">
            <CalendarDays size={22} />
          </div>
          <div className="stat-card-info">
            <h3>Upcoming Conferences</h3>
            <p className="stat-value">{conferences.length}</p>
            <Link href="/dashboard/conferences" className="stat-link">
              View All <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* My Publications */}
        <div className="stat-card">
          <div className="stat-card-icon cyan">
            <BookOpen size={22} />
          </div>
          <div className="stat-card-info">
            <h3>My Publications</h3>
            <p className="stat-value">{publications.length}</p>
            <Link href="/dashboard/publications" className="stat-link">
              View All <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>

      {/* ===== Main Grid: Upcoming Conferences + My Documents ===== */}
      <div className="dashboard-grid fade-in-up fade-in-up-delay-1">
        {/* Upcoming Conferences (from Conference collection) */}
        <div className="section-card">
          <div className="section-card-header">
            <h2>Upcoming Conferences</h2>
            <Link href="/dashboard/conferences" className="view-all-btn">View All</Link>
          </div>
          <div className="section-card-body">
            {loading ? (
              <div>
                <div className="skeleton" style={{ height: 88, marginBottom: 12 }} />
                <div className="skeleton" style={{ height: 88 }} />
              </div>
            ) : conferences.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <CalendarDays size={28} />
                </div>
                <h3>No upcoming conferences</h3>
                <p>Check back later for new conference announcements</p>
              </div>
            ) : (
  <div className="section-card-body">
  {loading ? (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="skeleton" style={{ height: 220 }} />
      <div className="skeleton" style={{ height: 220 }} />
      <div className="skeleton" style={{ height: 220 }} />
    </div>
  ) : conferences.length === 0 ? (
    <div className="empty-state">
      <div className="empty-icon">
        <CalendarDays size={28} />
      </div>
      <h3>No upcoming conferences</h3>
      <p>Check back later for new conference announcements</p>
    </div>
  ) : (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2  .l/.7,6m5jn4htkyluio0xl:grid-cols-3 gap-4">
      {conferences.slice(0, 4).map((conf, index) => {
        const confDate = conf.field ? new Date(conf.field) : null
        const dateStr = conf.date || ""
        const month = confDate
          ? confDate.toLocaleString("en", { month: "short" }).toUpperCase()
          : ""
        const day = confDate ? confDate.getDate() : ""
        const year = confDate ? confDate.getFullYear() : ""
        const imgUrl = conf.img
          ? (conf.img.startsWith("http") ? conf.img : getZepImageUrl(conf, conf.img))
          : null

        return (
          <div
            key={conf.id}
            className="flex flex-col gap-3 p-3 rounded-xl border border-white/10 bg-white/[0.03] hover:border-cyan-500/40 hover:bg-white/[0.05] transition-all"
          >
            {/* Thumbnail — full width banner */}
            <div
              className={`w-full h-32 rounded-lg bg-cover bg-center flex items-center justify-center text-center text-xs font-medium leading-tight text-white p-3 ${
                index % 2 === 1
                  ? "bg-gradient-to-br from-cyan-500 to-cyan-600"
                  : "bg-gradient-to-br from-cyan-500 to-cyan-600"
              }`}
              style={
                imgUrl
                  ? {
                      backgroundImage: `url(${imgUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      textShadow: "0 1px 4px rgba(0,0,0,0.6)",
                    }
                  : undefined
              }
            >
              {!imgUrl && (conf.title?.split(" ").slice(0, 3).join(" ") || "Conference")}
            </div>

            {/* Date */}
            <div className="text-sm sm:text-xs font-bold dark:text-white leading-snug break-words">
              {dateStr || (day && month ? `${month} ${day}, ${year}` : "TBA")}
            </div>

            {/* Title */}
            <h4 className="text-sm font-semibold dark:text-white leading-snug break-words">
              {conf.title || "Conference"}
            </h4>

            {/* Location */}
            <div className="flex items-center gap-1 text-xs dark:text-gray-400 min-w-0">
              <MapPin size={12} className="shrink-0" />
              <span className="truncate">{conf.location || "Online"}</span>
            </div>

            {/* Footer: status + website */}
            <div className="flex items-center justify-between gap-2 pt-2 mt-auto border-t border-white/10">
              <span className="status-badge upcoming text-xs px-2 py-1 rounded-full whitespace-nowrap">
                Upcoming
              </span>
              {conf.websiteUrl && (
                <a
                  href={conf.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-cyan-500 flex items-center gap-1 no-underline shrink-0"
                >
                  Website <ExternalLink size={10} />
                </a>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )}
</div>
            )}
          </div>
        </div>

        {/* My Documents */}
        <div className="section-card">
          <div className="section-card-header">
            <h2>My Documents</h2>
            <Link href="/dashboard/documents" className="view-all-btn">View All</Link>
          </div>
          <div className="section-card-body">
            <div className="document-item">
              <div className="document-icon membership">
                <CreditCard size={18} />
              </div>
              <div className="document-info">
                <h4>Membership Card</h4>
                <p>View / Download</p>
              </div>
              <button className="document-download" aria-label="Download">
                <Download size={16} />
              </button>
            </div>

            <div className="document-item">
              <div className="document-icon id-card">
                <FileText size={18} />
              </div>
              <div className="document-info">
                <h4>Conference ID Card</h4>
                <p>View / Download</p>
              </div>
              <button className="document-download" aria-label="Download">
                <Download size={16} />
              </button>
            </div>

            <div className="document-item">
              <div className="document-icon proceedings">
                <BookMarked size={18} />
              </div>
              <div className="document-info">
                <h4>Conference Proceedings Book</h4>
                <p>View / Download</p>
              </div>
              <button className="document-download" aria-label="Download">
                <Download size={16} />
              </button>
            </div>

            <div className="document-item">
              <div className="document-icon certificate">
                <Award size={18} />
              </div>
              <div className="document-info">
                <h4>Participation Certificate</h4>
                <p>Request / View issued certificates</p>
              </div>
              <Link href="/dashboard/certificates" className="document-download" title="My Certificates">
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="document-item">
              <div className="document-icon cpd">
                <ShieldCheck size={18} />
              </div>
              <div className="document-info">
                <h4>CPD Certificate</h4>
                <p>View / Download</p>
              </div>
              <button className="document-download" aria-label="Download">
                <Download size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ===== My Conference Registrations with Request Certificate Button ===== */}
      <div className="dashboard-grid full-width fade-in-up fade-in-up-delay-2" style={{ marginBottom: 24 }}>
        <div className="section-card">
          <div className="section-card-header">
            <h2>My Conference Registrations</h2>
            <Link href="/dashboard/registrations" className="view-all-btn">View All</Link>
          </div>
          <div className="section-card-body">
            {loading ? (
              <div>
                <div className="skeleton" style={{ height: 72, marginBottom: 12 }} />
                <div className="skeleton" style={{ height: 72 }} />
              </div>
            ) : registrations.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <ClipboardList size={28} />
                </div>
                <h3>No registrations yet</h3>
                <p>Register for a conference to see your registrations here and request certificates</p>
              </div>
            ) : (
              registrations.slice(0, 4).map((reg, index) => {
                const confDate = reg.conf_date ? new Date(reg.conf_date) : null
                const isUpcoming = confDate && confDate > new Date()
                const month = confDate
                  ? confDate.toLocaleString("en", { month: "short" }).toUpperCase()
                  : ""
                const day = confDate ? confDate.getDate() : ""
                const year = confDate ? confDate.getFullYear() : ""

                return (
                  <div key={reg.id} className="conference-item" style={{ flexWrap: "wrap" }}>
                    <div className={`conference-thumb ${index % 2 === 1 ? "alt" : ""}`}>
                      {reg.ticket_name?.split(" ").slice(0, 3).join(" ") || "Conf"}
                    </div>
                    <div className="conference-dates">
                      <div className="day">{day || "—"}</div>
                      {month && (
                        <div className="month-year">
                          {month}<br />{year}
                        </div>
                      )}
                    </div>
                    <div className="conference-info" style={{ flex: 1, minWidth: 200 }}>
                      <h4>{reg.ticket_name || "Conference Registration"}</h4>
                      <div className="conf-location">
                        <MapPin size={12} />
                        {reg.city ? `${reg.city}, ${reg.country || ""}` : "Online"}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span className={`status-badge ${isUpcoming ? "upcoming" : "registered"}`}>
                        {isUpcoming ? "Upcoming" : "Registered"}
                      </span>
                      {/* Request Certificate Button */}
                      <RequestCertificateButton
                        registrationId={reg.id}
                        conferenceEnded={!isUpcoming}
                      />
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* ===== Quick Actions Grid ===== */}
      <div className="dashboard-grid full-width fade-in-up fade-in-up-delay-3" style={{ marginBottom: 24 }}>
        <div className="section-card">
          <div className="section-card-header">
            <h2>Quick Actions</h2>
          </div>
          <div className="section-card-body">
            <div className="quick-actions-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
              <Link href="/dashboard/conferences" className="quick-action-item">
                <div className="quick-action-icon register">
                  <CalendarDays size={22} />
                </div>
                <span>Register for Conference</span>
              </Link>
              <Link href="/dashboard/registrations" className="quick-action-item">
                <div className="quick-action-icon submit">
                  <ClipboardList size={22} />
                </div>
                <span>My Registrations</span>
              </Link>
              <Link href="/dashboard/conference-submissions" className="quick-action-item">
                <div className="quick-action-icon submit">
                  <Send size={22} />
                </div>
                <span>Conf. Paper Submissions</span>
              </Link>
              <Link href="/dashboard/submissions" className="quick-action-item">
                <div className="quick-action-icon explore">
                  <FileText size={22} />
                </div>
                <span>Journal Submissions</span>
              </Link>
              <Link href="/dashboard/certificates" className="quick-action-item">
                <div className="quick-action-icon coins">
                  <Award size={22} />
                </div>
                <span>My Certificates</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
