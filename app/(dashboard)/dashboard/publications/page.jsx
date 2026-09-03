"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { useDashboardData } from "@/contexts/dashboard-context"
import RefreshDashboardButton from "@/components/dashboard/RefreshDashboardButton"
import { BookOpen, ArrowLeft, Eye, ExternalLink } from "lucide-react"

export default function PublicationsPage() {
  const { user } = useAuth()
  const { publications, loading, initializeDashboardData } = useDashboardData()

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
              My Publications
            </h1>
            <p className="m-0 text-sm text-slate-500 dark:text-slate-400">
              Manage your research publications
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
                  className="h-[72px] animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800"
                />
              ))}
            </div>
          ) : publications.length === 0 ? (
            <div className="flex flex-col items-center px-4 py-12 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-cyan-50 text-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-400">
                <BookOpen size={28} />
              </div>
              <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                No publications yet
              </h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Start by creating your first publication.
              </p>
              <Link
                href="/create-publication"
                className="mt-4 inline-block rounded-[10px] bg-cyan-600 px-6 py-2.5 text-sm font-semibold text-white no-underline transition-colors hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-400"
              >
                Create Publication
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {publications.map((pub) => (
                <div
                  key={pub.id}
                  className="flex cursor-pointer items-center gap-4 rounded-xl border border-slate-100 p-4 transition-colors hover:border-cyan-200 dark:border-slate-800 dark:hover:border-cyan-900"
                >
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-cyan-600 p-2 text-center text-[10px] font-semibold text-white dark:bg-cyan-700">
                    {pub.title?.split(" ").slice(0, 4).join(" ") || "Publication"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {pub.title || "Untitled Publication"}
                    </h4>
                    <div className="mt-1 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                      <Eye size={12} />
                      {pub.views_count || 0} views · {pub.downloads_count || 0} downloads
                    </div>
                  </div>
                  <Link
                    href={`/publication/${pub.id}`}
                    className="flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 px-3.5 py-1.5 text-[13px] font-medium text-cyan-600 no-underline transition-colors hover:bg-cyan-50 dark:border-slate-700 dark:text-cyan-400 dark:hover:bg-cyan-950/40"
                  >
                    View <ExternalLink size={12} />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}