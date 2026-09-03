"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { useDashboardData } from "@/contexts/dashboard-context"
import RefreshDashboardButton from "@/components/dashboard/RefreshDashboardButton"
import RequestCertificateButton from "@/components/dashboard/RequestCertificateButton"
import { CalendarDays, MapPin, ArrowLeft, Clock, Award } from "lucide-react"

export default function RegistrationsPage() {
  const { user } = useAuth()
  const { registrations, loading, initializeDashboardData } = useDashboardData()

  useEffect(() => {
    if (!user) return
    initializeDashboardData(user.id)
  }, [user, initializeDashboardData])

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-3">
          <Link
            href="/dashboard"
            className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-slate-200 bg-white text-slate-600 no-underline transition-colors hover:bg-cyan-50 hover:text-cyan-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-cyan-950/40 dark:hover:text-cyan-400"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="m-0 text-[22px] font-bold text-slate-800 dark:text-slate-100">
              My Conference Registrations
            </h1>
            <p className="m-0 text-sm text-slate-500 dark:text-slate-400">
              View all your conference registrations and request certificates
            </p>
          </div>
        </div>
        <RefreshDashboardButton />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="p-5">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-24 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800"
                />
              ))}
            </div>
          ) : registrations.length === 0 ? (
            <div className="flex flex-col items-center px-4 py-12 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-cyan-50 text-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-400">
                <CalendarDays size={28} />
              </div>
              <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                No registrations yet
              </h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                You haven&apos;t registered for any conferences yet.
              </p>
              <Link
                href="/membership"
                className="mt-4 inline-block rounded-[10px] bg-cyan-600 px-6 py-2.5 text-sm font-semibold text-white no-underline transition-colors hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-400"
              >
                Browse Conferences
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {registrations.map((reg, index) => {
                const confDate = reg.conf_date ? new Date(reg.conf_date) : null
                const isUpcoming = confDate && confDate > new Date()
                const month = confDate
                  ? confDate.toLocaleString("en", { month: "short" }).toUpperCase()
                  : ""
                const day = confDate ? confDate.getDate() : ""
                const year = confDate ? confDate.getFullYear() : ""
                const createdDate = reg.created
                  ? new Date(reg.created).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })
                  : ""

                return (
                  <div
                    key={reg.id}
                    className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-100 p-4 transition-colors hover:border-cyan-200 dark:border-slate-800 dark:hover:border-cyan-900"
                  >
                    <div
                      className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-xl p-2 text-center text-[11px] font-semibold text-white ${
                        index % 2 === 1
                          ? "bg-sky-600 dark:bg-sky-700"
                          : "bg-cyan-600 dark:bg-cyan-700"
                      }`}
                    >
                      {reg.ticket_name?.split(" ").slice(0, 3).join(" ") || "Conf"}
                    </div>

                    <div className="flex w-14 shrink-0 flex-col items-center justify-center text-center">
                      <div className="text-xl font-bold leading-none text-slate-800 dark:text-slate-100">
                        {day || "—"}
                      </div>
                      {month && (
                        <div className="mt-1 text-[10px] font-semibold uppercase leading-tight text-slate-500 dark:text-slate-400">
                          {month}
                          <br />
                          {year}
                        </div>
                      )}
                    </div>

                    <div className="min-w-[220px] flex-1">
                      <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                        {reg.ticket_name || "Conference Registration"}
                      </h4>
                      <div className="mb-1 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                        <MapPin size={12} />
                        {reg.city ? `${reg.city}, ${reg.country || ""}` : "Online"}
                      </div>
                      <div className="flex gap-4 text-xs text-slate-400 dark:text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock size={11} /> Registered: {createdDate}
                        </span>
                        {reg.ticket_type && (
                          <span className="flex items-center gap-1">
                            <Award size={11} /> {reg.ticket_type}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-3">
                      <span
                        className={`inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${
                          isUpcoming
                            ? "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-400"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
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
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}