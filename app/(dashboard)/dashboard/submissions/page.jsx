"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { useDashboardData } from "@/contexts/dashboard-context"
import RefreshDashboardButton from "@/components/dashboard/RefreshDashboardButton"
import pb, { getImageUrl } from "@/lib/pocketbase"
import {
  FileText,
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  BookOpen,
  User,
  Globe,
  Plus,
} from "lucide-react"

const statusConfig = {
  pending: {
    label: "Pending",
    icon: AlertCircle,
    badgeClass: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-200 dark:border-amber-500/20",
  },
  under_review: {
    label: "Under Review",
    icon: Clock,
    badgeClass: "bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/20",
  },
  accepted: {
    label: "Accepted",
    icon: CheckCircle,
    badgeClass: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    badgeClass: "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-500/20",
  },
}

const fallbackBadgeClass = "bg-slate-100 dark:bg-slate-500/10 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-500/20"

export default function SubmissionsPage() {
  const { user } = useAuth()
  const { journalSubmissions: submissions, loading, initializeDashboardData } = useDashboardData()

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
              Journal Paper Submissions
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 m-0">
              Track all your submitted research papers and journal form status
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <RefreshDashboardButton />
          <Link
            href="/journals"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[10px] bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-[13px] no-underline shadow-sm shadow-cyan-600/20 transition-colors"
          >
            <Plus size={15} /> Submit New Paper
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700/60 rounded-2xl">
        <div className="p-5">
          {loading ? (
            <div>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-[110px] mb-3 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse"
                />
              ))}
            </div>
          ) : submissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-16 px-6">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center mb-4">
                <FileText size={28} />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white m-0 mb-1.5">
                No journal paper submissions found
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 m-0 mb-5 max-w-sm">
                Submit your research paper to a journal to see it listed here.
              </p>
              <Link
                href="/journals"
                className="inline-block bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2.5 rounded-[10px] font-semibold text-sm no-underline transition-colors"
              >
                Explore Journals
              </Link>
            </div>
          ) : (
            submissions.map((sub) => {
              const currentStatus = sub.status?.toLowerCase() || "pending"
              const statusInfo = statusConfig[currentStatus] || {
                label: sub.status ? sub.status.charAt(0).toUpperCase() + sub.status.slice(1) : "Pending",
                icon: AlertCircle,
                badgeClass: fallbackBadgeClass,
              }
              const StatusIcon = statusInfo.icon || AlertCircle

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
                  className="flex max-w-screen-2xl mx-auto flex-col items-stretch gap-3 p-5 mb-4 rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/40 shadow-sm dark:shadow-none hover:shadow-md dark:hover:border-slate-600 transition-all duration-200"
                >
                  {/* Top Line: Title & Status */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3.5 items-start">
                      <div className="w-[42px] h-[42px] rounded-[10px] flex-shrink-0 bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                        <FileText size={20} />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white m-0 mb-1">
                          {sub.paper_title || sub.title || "Untitled Journal Paper"}
                        </h4>
                        {sub.journal_name && (
                          <div className="text-[13px] text-cyan-600 dark:text-cyan-400 font-semibold flex items-center gap-1.5">
                            <BookOpen size={13} /> {sub.journal_name}
                          </div>
                        )}
                      </div>
                    </div>

                    <span className={`inline-flex items-center gap-1 text-xs font-semibold capitalize px-2.5 py-1 rounded-full flex-shrink-0 ${statusInfo.badgeClass}`}>
                      <StatusIcon size={12} />
                      {statusInfo.label}
                    </span>
                  </div>

                  {/* Middle Line: Submission Details */}
                  <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 px-4 rounded-lg text-xs text-slate-600 dark:text-slate-300">
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block mb-0.5">
                        <User size={11} className="inline mr-1 -mt-0.5" />
                        Author
                      </span>
                      <strong className="text-slate-900 dark:text-slate-100">{sub.author || user?.name || "—"}</strong>
                      {sub.co_author && <span className="text-slate-500 dark:text-slate-400"> (Co: {sub.co_author})</span>}
                    </div>

                    {sub.organization && (
                      <div>
                        <span className="text-slate-400 dark:text-slate-500 block mb-0.5">Organization</span>
                        <strong className="text-slate-900 dark:text-slate-100">{sub.organization}</strong>
                        {sub.department && <span className="text-slate-500 dark:text-slate-400"> - {sub.department}</span>}
                      </div>
                    )}

                    {sub.country && (
                      <div>
                        <span className="text-slate-400 dark:text-slate-500 block mb-0.5">
                          <Globe size={11} className="inline mr-1 -mt-0.5" />
                          Country
                        </span>
                        <strong className="text-slate-900 dark:text-slate-100">{sub.country}</strong>
                      </div>
                    )}

                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block mb-0.5">Submitted Date</span>
                      <strong className="text-slate-900 dark:text-slate-100">{createdDate || "—"}</strong>
                    </div>
                  </div>

                  {/* Bottom Line: File Download & Message */}
                  <div className="flex items-center justify-between flex-wrap gap-2.5 pt-1">
                    {sub.message ? (
                      <p className="text-xs text-slate-500 dark:text-slate-400 m-0 italic">
                        &ldquo;{sub.message}&rdquo;
                      </p>
                    ) : <div />}

                    {fileUrl ? (
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-100 dark:border-cyan-500/20 text-cyan-700 dark:text-cyan-300 text-xs font-semibold no-underline hover:bg-cyan-100 dark:hover:bg-cyan-500/20 transition-colors"
                      >
                        <Download size={14} /> Download Submitted Paper File
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
