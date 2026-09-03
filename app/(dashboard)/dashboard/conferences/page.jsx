"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useDashboardData } from "@/contexts/dashboard-context"
import { getImageUrl as getZepImageUrl } from "@/lib/zep-pocketbase"
import RefreshDashboardButton from "@/components/dashboard/RefreshDashboardButton"
import { useAuth } from "@/contexts/auth-context"
import { CalendarDays, MapPin, ArrowLeft, ExternalLink, Globe } from "lucide-react"

export default function ConferencesPage() {
  const { user } = useAuth()
  const { conferences, loading, initializeDashboardData } = useDashboardData()

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
          <div className="flex-1">
            <h1 className="m-0 text-[22px] font-bold text-slate-800 dark:text-slate-100">
              All Conferences
            </h1>
            <p className="m-0 text-sm text-slate-500 dark:text-slate-400">
              Browse all available conferences
            </p>
          </div>
        </div>
        <div className=" flex-col md:flex-row flex items-center gap-2">
          <RefreshDashboardButton />
          <Link
            href="/dashboard/registrations"
            className="rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-2 text-[13px] font-semibold text-cyan-600 no-underline transition-colors hover:bg-cyan-100 dark:border-cyan-800 dark:bg-cyan-950/40 dark:text-cyan-400 dark:hover:bg-cyan-900/40"
          >
            My Registrations →
          </Link>
        </div>
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
          ) : conferences.length === 0 ? (
            <div className="flex   flex-col items-center px-4 py-12 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-cyan-50 text-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-400">
                <CalendarDays size={28} />
              </div>
              <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                No conferences available
              </h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Check back later for new conference announcements.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {conferences.map((conf, index) => {
                const confDate = conf.field ? new Date(conf.field) : null
                const isUpcoming = confDate && confDate > new Date()
                const month = confDate
                  ? confDate.toLocaleString("en", { month: "short" }).toUpperCase()
                  : ""
                const day = confDate ? confDate.getDate() : ""
                const year = confDate ? confDate.getFullYear() : ""
                const dateStr = conf.date || ""
                const imgUrl = conf.img
                  ? (conf.img.startsWith("http") ? conf.img : getZepImageUrl(conf, conf.img))
                  : null

                return (
                  <div
                    key={conf.id}
                    className="flex  flex-wrap items-center gap-4 rounded-xl border border-slate-100 p-4 transition-colors hover:border-cyan-200 dark:border-slate-800 dark:hover:border-cyan-900"
                  >
                    <div
                      className={`flex h-20 w-full md:w-[120px] shrink-0 items-center justify-center rounded-xl bg-cover bg-center p-2 text-center text-[11px] font-semibold text-white ${
                        imgUrl
                          ? "[text-shadow:0_1px_4px_rgba(0,0,0,0.6)]"
                          : index % 2 === 1
                            ? "bg-sky-600 dark:bg-sky-700"
                            : "bg-cyan-600 dark:bg-cyan-700"
                      }`}
                      style={imgUrl ? { backgroundImage: `url(${imgUrl})` } : undefined}
                    >
                      {!imgUrl && (conf.title?.split(" ").slice(0, 3).join(" ") || "Conference")}
                    </div>

                    

                    <div className="min-w-[220px] flex-1">
                        <h4 className="text-[15px] font-semibold text-slate-800 dark:text-slate-100">
                        {conf.title || "Conference"}
                      </h4>
                          <p className="max-w-[340px] truncate text-xs text-slate-500 dark:text-slate-400">
                           <CalendarDays size={12} className="mr-1 inline-block" />
                           {dateStr || day}
                        </p>
                    
                      <div className="mb-1 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                        <MapPin size={12} />
                        {conf.location || "Online"}
                      </div>
                      {conf.shortDescription && (
                        <p className="max-w-[340px] truncate text-xs text-slate-400 dark:text-slate-500">
                          {conf.shortDescription}
                        </p>
                      )}
                      {conf.cpd_accredited && (
                        <span className="mt-1 inline-block rounded bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                          CPD Accredited ({conf.cpd_hours}h)
                        </span>
                      )}
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      {/* <span className={`status-badge ${isUpcoming ? "upcoming" : "registered"}`}>
                        {isUpcoming ? "Upcoming" : "Past"}
                      </span> */}
                      {conf.websiteUrl && (
                        <a
                          href={conf.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs font-medium text-cyan-600 no-underline transition-colors hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300"
                        >
                          <Globe size={12} /> Visit Site
                        </a>
                      )}
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