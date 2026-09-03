"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import pb from "@/lib/pocketbase"
import {
  Users,
  CalendarDays,
  FileText,
  Award,
  ArrowUpRight,
  Clock,
} from "lucide-react"

const STATUS_STYLES = {
  requested: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  generated: "bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400",
  sent: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
}

// Shared shell for the two "recent activity" panels — kept in this file
// rather than split out, since it's only ever used here.
function ActivityCard({ title, href, loading, items, emptyIcon: EmptyIcon, emptyLabel, renderItem }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h2>
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-xs font-medium text-cyan-600 transition hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300"
        >
          View all <ArrowUpRight size={12} />
        </Link>
      </div>
      <div className="px-6 py-2">
        {loading ? (
          <div className="space-y-2 py-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
              <EmptyIcon size={16} />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{emptyLabel}</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {items.map(renderItem)}
          </div>
        )}
      </div>
    </div>
  )
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState({
    users: 0,
    registrations: 0,
    submissions: 0,
    certificates: 0,
  })
  const [recentRegistrations, setRecentRegistrations] = useState([])
  const [recentCertificates, setRecentCertificates] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    setLoading(true)
    try {
      // Fetch counts
      const [usersResult, regsResult, subsResult, certsResult] = await Promise.allSettled([
        pb.collection("users").getList(1, 1, { fields: "id" }),
        pb.collection("conf_registration").getList(1, 1, { fields: "id" }),
        pb.collection("paper_form_submission").getList(1, 1, { fields: "id" }),
        pb.collection("conf_certificates").getList(1, 1, { fields: "id" }),
      ])

      setStats({
        users: usersResult.status === "fulfilled" ? usersResult.value.totalItems : 0,
        registrations: regsResult.status === "fulfilled" ? regsResult.value.totalItems : 0,
        submissions: subsResult.status === "fulfilled" ? subsResult.value.totalItems : 0,
        certificates: certsResult.status === "fulfilled" ? certsResult.value.totalItems : 0,
      })

      // Fetch recent registrations
      const recentRegs = await pb.collection("conf_registration").getList(1, 5, {
        sort: "-created",
        expand: "user",
      }).catch(() => ({ items: [] }))
      setRecentRegistrations(recentRegs.items || [])

      // Fetch recent certificates
      const recentCerts = await pb.collection("conf_certificates").getList(1, 5, {
        sort: "-created",
        expand: "user",
      }).catch(() => ({ items: [] }))
      setRecentCertificates(recentCerts.items || [])
    } catch (err) {
      console.error("Error loading admin stats:", err)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      label: "Total Users",
      value: stats.users,
      icon: Users,
      href: "/admin/users",
      iconClass: "bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400",
    },
    {
      label: "Registrations",
      value: stats.registrations,
      icon: CalendarDays,
      href: "/admin/registrations",
      iconClass: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
    },
    {
      label: "Submissions",
      value: stats.submissions,
      icon: FileText,
      href: "/admin/submissions",
      iconClass: "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
    },
    {
      label: "Certificates",
      value: stats.certificates,
      icon: Award,
      href: "/admin/certificates",
      iconClass: "bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400",
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <Link key={card.label} href={card.href} className="group block">
              <div className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:shadow-none dark:hover:border-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {card.label}
                  </span>
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${card.iconClass}`}>
                    <Icon size={18} />
                  </div>
                </div>
                <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
                  {loading ? "—" : card.value.toLocaleString()}
                </p>
                <div className="mt-3 flex items-center gap-1 text-xs font-medium text-slate-400 transition group-hover:text-cyan-500 dark:text-slate-500 dark:group-hover:text-cyan-400">
                  View all
                  <ArrowUpRight
                    size={12}
                    className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ActivityCard
          title="Recent Registrations"
          href="/admin/registrations"
          loading={loading}
          items={recentRegistrations}
          emptyIcon={CalendarDays}
          emptyLabel="No registrations yet"
          renderItem={(reg) => (
            <div key={reg.id} className="flex items-center gap-3 py-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-50 text-xs font-bold text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400">
                {(reg.expand?.user?.name || reg.fullname || "U")[0]?.toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {reg.expand?.user?.name || reg.fullname || "Unknown User"}
                </div>
                <div className="truncate text-xs text-slate-400 dark:text-slate-500">
                  {reg.ticket_name?.slice(0, 40) || "Conference"}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                <Clock size={12} />
                {new Date(reg.created).toLocaleDateString("en", { month: "short", day: "numeric" })}
              </div>
            </div>
          )}
        />

        <ActivityCard
          title="Recent Certificate Requests"
          href="/admin/certificates"
          loading={loading}
          items={recentCertificates}
          emptyIcon={Award}
          emptyLabel="No certificate requests yet"
          renderItem={(cert) => (
            <div key={cert.id} className="flex items-center gap-3 py-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400">
                <Award size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {cert.certificate_no || `CERT-${cert.id.slice(0, 6)}`}
                </div>
                <div className="truncate text-xs capitalize text-slate-400 dark:text-slate-500">
                  {cert.certificate_type || "participation"}
                </div>
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                  STATUS_STYLES[cert.status] || STATUS_STYLES.requested
                }`}
              >
                {cert.status || "requested"}
              </span>
            </div>
          )}
        />
      </div>

      {/* Quick Actions */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
        <div className="border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Quick Actions</h2>
        </div>
        <div className="flex flex-wrap gap-3 px-6 py-5">
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-700"
          >
            <Users size={16} /> Manage Users
          </Link>
          <Link
            href="/admin/certificates"
            className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-700"
          >
            <Award size={16} /> Process Certificates
          </Link>
          <Link
            href="/admin/registrations"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-transparent dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <CalendarDays size={16} /> View Registrations
          </Link>
        </div>
      </div>
    </div>
  )
}
