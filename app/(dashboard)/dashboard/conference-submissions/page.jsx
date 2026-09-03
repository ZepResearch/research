"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { useDashboardData } from "@/contexts/dashboard-context"
import RefreshDashboardButton from "@/components/dashboard/RefreshDashboardButton"
import pb, { getImageUrl } from "@/lib/pocketbase"
import zpb, { getConferenceById, getImageUrl as getZepImageUrl } from "@/lib/zep-pocketbase"
import {
  FileText,
  ArrowLeft,
  Clock,
  Download,
  CalendarDays,
  User,
  Globe,
  Tag,
  Presentation,
  Plus,
  MapPin,
  Mail,
  Phone,
  Building,
  Award,
  ExternalLink,
  Info,
} from "lucide-react"

export default function ConferenceSubmissionsPage() {
  const { user } = useAuth()
  const { conferenceSubmissions: submissions, loading, initializeDashboardData } = useDashboardData()

  useEffect(() => {
    if (!user) return
    initializeDashboardData(user.id)
  }, [user, initializeDashboardData])

  return (
    <div>
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="w-9 h-9 rounded-[10px] border border-slate-200 dark:border-slate-700 flex items-center justify-center bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 no-underline hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-[22px] font-bold text-slate-900 dark:text-white m-0">
              Conference Paper Submissions
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 m-0">
              Detailed view of all your submitted research papers &amp; conference details
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <RefreshDashboardButton />
          <Link
            href="/dashboard/conferences"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[10px] bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-[13px] no-underline shadow-sm shadow-cyan-600/20 transition-colors"
          >
            <Plus size={15} /> Submit to Conference
          </Link>
        </div>
      </div>

      <div className="section-card">
        <div className="section-card-body p-5">
          {loading ? (
            <div>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="skeleton h-40 mb-4 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse"
                />
              ))}
            </div>
          ) : submissions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <FileText size={28} />
              </div>
              <h3>No conference paper submissions found</h3>
              <p>Submit your research abstract or full paper to an upcoming conference.</p>
              <Link
                href="/dashboard/conferences"
                className="inline-block mt-4 bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2.5 rounded-[10px] font-semibold text-sm no-underline transition-colors"
              >
                Browse Conferences
              </Link>
            </div>
          ) : (
            submissions.map((sub) => {
              const conf = sub.confData || sub.expand?.conference
              const confTitle = conf?.title || sub.conf_name || "Conference Paper Submission"
              const confLocation = conf?.location || sub.country || "Online"
              const confDate = conf?.date || (conf?.field ? new Date(conf.field).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "")
              const confDescription = conf?.shortDescription || conf?.description || ""
              const websiteUrl = conf?.websiteUrl
              const confImg = conf?.img
                ? (conf.img.startsWith("http") ? conf.img : getZepImageUrl(conf, conf.img))
                : null

              const createdDate = sub.created
                ? new Date(sub.created).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : ""

              const fileUrl = sub.file ? getImageUrl(sub, sub.file) : null

              return (
                <div
                  key={sub.id}
                  className="p-6 rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/40 mb-5 shadow-sm dark:shadow-none hover:shadow-md dark:hover:border-slate-600 transition-all duration-200"
                >
                  {/* Top Header Line: Paper Title + Type Badges */}
                  <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                    <div className="flex gap-3.5 items-start">
                      <div className="document-icon id-card w-11 h-11 rounded-xl flex-shrink-0">
                        <FileText size={22} />
                      </div>
                      <div>
                        <h3 className="text-[17px] font-bold text-slate-900 dark:text-white m-0 mb-1.5">
                          {sub.paper_title || "Untitled Research Paper"}
                        </h3>

                        <div className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-100 dark:border-cyan-500/20 px-2.5 py-1 rounded-md">
                          <CalendarDays size={14} />
                          Targeted Conference: {confTitle}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 flex-wrap items-center">
                      {sub.paper_type && (
                        <span className="status-badge inline-flex items-center gap-1 text-xs font-semibold bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/20 rounded-full px-2.5 py-1">
                          <Tag size={12} />
                          {sub.paper_type}
                        </span>
                      )}
                      {sub.presentation_type && (
                        <span className="status-badge inline-flex items-center gap-1 text-xs font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20 rounded-full px-2.5 py-1">
                          <Presentation size={12} />
                          {sub.presentation_type}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Conference Info Card (Fetched by Conference ID) */}
                  <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/70 dark:to-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded-xl p-4 mb-4 flex gap-4 items-center flex-wrap">
                    {confImg && (
                      <div
                        className="w-20 h-14 rounded-lg bg-cover bg-center flex-shrink-0 border border-slate-300 dark:border-slate-600"
                        style={{ backgroundImage: `url(${confImg})` }}
                      />
                    )}
                    <div className="flex-1 min-w-[240px]">
                      <div className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1">
                        {confTitle}
                      </div>
                      {confDescription && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 m-0 mb-1.5 overflow-hidden text-ellipsis whitespace-nowrap max-w-[500px]">
                          {confDescription}
                        </p>
                      )}
                      <div className="flex gap-4 flex-wrap text-xs text-slate-600 dark:text-slate-300">
                        {confLocation && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin size={13} className="text-cyan-600 dark:text-cyan-400" /> {confLocation}
                          </span>
                        )}
                        {confDate && (
                          <span className="inline-flex items-center gap-1">
                            <Clock size={13} className="text-cyan-600 dark:text-cyan-400" /> {confDate}
                          </span>
                        )}
                        {conf?.cpd_accredited && (
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-300 font-semibold bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded">
                            <Award size={12} /> CPD Accredited ({conf.cpd_hours || 0}h)
                          </span>
                        )}
                      </div>
                    </div>

                    {websiteUrl && (
                      <a
                        href={websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-cyan-700 dark:text-cyan-300 inline-flex items-center gap-1 no-underline bg-white dark:bg-slate-700/60 px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                      >
                        <Globe size={13} /> Visit Website <ExternalLink size={11} />
                      </a>
                    )}
                  </div>

                  {/* Submission Info Grid */}
                  <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 bg-white dark:bg-slate-800/30 border border-slate-100 dark:border-slate-700/40 p-3.5 px-4.5 rounded-[10px] text-[13px] mb-4">
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 text-[11px] uppercase font-semibold tracking-wide block">
                        Primary Author
                      </span>
                      <strong className="text-slate-900 dark:text-slate-100 text-sm inline-flex items-center gap-1.5 mt-0.5">
                        <User size={13} className="text-slate-400 dark:text-slate-500" />
                        {sub.author || user?.name || "—"}
                      </strong>
                      {sub.co_author && (
                        <div className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                          Co-Author: <strong className="text-slate-700 dark:text-slate-200">{sub.co_author}</strong>
                        </div>
                      )}
                    </div>

                    <div>
                      <span className="text-slate-400 dark:text-slate-500 text-[11px] uppercase font-semibold tracking-wide block">
                        Contact Details
                      </span>
                      <div className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5 mt-0.5">
                        <Mail size={13} className="text-slate-400 dark:text-slate-500" /> {sub.email || user?.email || "—"}
                      </div>
                      {sub.phone_number && (
                        <div className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5 mt-0.5">
                          <Phone size={13} className="text-slate-400 dark:text-slate-500" /> {sub.phone_number}
                        </div>
                      )}
                    </div>

                    {(sub.organization || sub.department) && (
                      <div>
                        <span className="text-slate-400 dark:text-slate-500 text-[11px] uppercase font-semibold tracking-wide block">
                          Affiliation
                        </span>
                        <div className="text-slate-900 dark:text-slate-100 font-semibold flex items-center gap-1.5 mt-0.5">
                          <Building size={13} className="text-slate-400 dark:text-slate-500" /> {sub.organization || "—"}
                        </div>
                        {sub.department && <div className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">{sub.department}</div>}
                      </div>
                    )}

                    <div>
                      <span className="text-slate-400 dark:text-slate-500 text-[11px] uppercase font-semibold tracking-wide block">
                        Submission Info
                      </span>
                      {createdDate && (
                        <div className="text-slate-600 dark:text-slate-300 mt-0.5">
                          Submitted: <strong className="text-slate-900 dark:text-slate-100">{createdDate}</strong>
                        </div>
                      )}
                      {sub.know_to_you && (
                        <div className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                          Source: {sub.know_to_you}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom Line: File Download & Message */}
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    {sub.message ? (
                      <div className="text-xs text-slate-500 dark:text-slate-400 italic flex items-center gap-1.5">
                        <Info size={14} className="text-slate-400 dark:text-slate-500" /> &ldquo;{sub.message}&rdquo;
                      </div>
                    ) : <div />}

                    {fileUrl ? (
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-[18px] py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-[13px] font-semibold no-underline shadow-sm shadow-cyan-600/20 transition-colors"
                      >
                        <Download size={15} /> Download Submitted Paper File
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400 dark:text-slate-500">No file attached</span>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
