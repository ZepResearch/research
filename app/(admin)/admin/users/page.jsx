"use client"

import { useEffect, useState } from "react"
import pb, { getImageUrl } from "@/lib/pocketbase"
import { downloadCsv } from "@/lib/csv"
import { Search, ChevronLeft, ChevronRight, Mail, Calendar, Users, Download, Loader2 } from "lucide-react"

const userCsvColumns = [
  { header: "User ID", field: "id" },
  { header: "Name", field: "name" },
  { header: "Username", field: "username" },
  { header: "Email", field: "email" },
  { header: "Email Visible", field: "emailVisibility" },
  { header: "Verified", value: (record) => record.verified ? "Yes" : "No" },
  { header: "Admin", value: (record) => record.admin ? "Yes" : "No" },
  { header: "Phone Number", field: "phone_no" },
  { header: "Researcher Type", field: "researcher_type" },
  { header: "Institution", field: "institution" },
  { header: "Department", field: "department" },
  { header: "Company", field: "company" },
  { header: "Position", field: "position" },
  { header: "Scientific Researcher", value: (record) => record.is_scientific ? "Yes" : "No" },
  { header: "Headline", field: "headline" },
  { header: "Bio", field: "bio" },
  { header: "Location", field: "location" },
  { header: "ORCID ID", field: "orcid_id" },
  { header: "Website", field: "website" },
  { header: "Social Links", field: "social_links" },
  { header: "Open to Work", value: (record) => record.open_to_work ? "Yes" : "No" },
  { header: "Avatar", field: "avatar" },
  { header: "Avatar URL", value: (record) => record.avatar ? getImageUrl(record, record.avatar) : "" },
  { header: "Profile Banner", field: "profile_banner" },
  { header: "Profile Banner URL", value: (record) => record.profile_banner ? getImageUrl(record, record.profile_banner) : "" },
  { header: "Joined At", field: "created" },
  { header: "Last Updated", field: "updated" },
]

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [totalItems, setTotalItems] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const perPage = 15

  useEffect(() => {
    loadUsers()
  }, [page, search])

  async function loadUsers() {
    setLoading(true)
    try {
      const filter = search
        ? `name ~ "${search}" || email ~ "${search}"`
        : ""
      const result = await pb.collection("users").getList(page, perPage, {
        sort: "-created",
        filter,
      })
      setUsers(result.items)
      setTotalItems(result.totalItems)
    } catch (err) {
      console.error("Error loading users:", err)
    } finally {
      setLoading(false)
    }
  }

  async function downloadUsersCsv() {
    setExporting(true)
    setFeedback(null)

    try {
      const records = await pb.collection("users").getFullList({ sort: "-created" })
      downloadCsv({
        filename: `users-${new Date().toISOString().slice(0, 10)}.csv`,
        columns: userCsvColumns,
        records,
      })
      setFeedback({ type: "success", message: `${records.length} user${records.length === 1 ? "" : "s"} exported to CSV.` })
    } catch (err) {
      console.error("Error exporting users:", err)
      setFeedback({ type: "error", message: "Could not export users. Please try again." })
    } finally {
      setExporting(false)
    }
  }

  const totalPages = Math.ceil(totalItems / perPage) || 1

  // Center a 5-wide page window on the current page instead of always showing 1-5
  const windowSize = Math.min(totalPages, 5)
  let windowStart = Math.max(1, page - Math.floor(windowSize / 2))
  windowStart = Math.min(windowStart, totalPages - windowSize + 1)
  const pageNumbers = Array.from({ length: windowSize }, (_, i) => windowStart + i)

  return (
    <div className="w-full">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Users{" "}
            <span className="font-normal text-slate-400 dark:text-slate-500">
              ({totalItems})
            </span>
          </h2>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={downloadUsersCsv}
              disabled={exporting}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-cyan-600 px-3 text-xs font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-wait disabled:opacity-70"
            >
              {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              {exporting ? "Exporting..." : "Export all CSV"}
            </button>
            <div className="relative w-full sm:w-64">
              <Search
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
              />
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:bg-white focus:ring-2 focus:ring-cyan-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:border-cyan-500 dark:focus:bg-slate-800 dark:focus:ring-cyan-500/20"
              />
            </div>
          </div>
        </div>

        {feedback && (
          <div
            role="status"
            className={`mx-6 mt-4 rounded-lg border px-3 py-2 text-sm ${
              feedback.type === "error"
                ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300"
                : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300"
            }`}
          >
            {feedback.message}
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-800/40">
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  User
                </th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Email
                </th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Verified
                </th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Joined
                </th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />
                        <div className="h-3.5 w-24 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-3.5 w-36 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-5 w-16 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-3.5 w-20 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-3.5 w-10 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                    </td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16">
                    <div className="mx-auto flex max-w-xs flex-col items-center gap-2 text-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                        <Users size={17} />
                      </div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                        No users found
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        Try a different name or email.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr
                    key={u.id}
                    className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/50"
                  >
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 text-xs font-semibold text-white ring-2 ring-white dark:ring-slate-900">
                          {u.avatar ? (
                            <img
                              src={getImageUrl(u, u.avatar)}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            (u.name || u.email)?.[0]?.toUpperCase() || "U"
                          )}
                        </div>
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {u.name || "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Mail size={13} className="text-slate-400 dark:text-slate-500" />
                        {u.email}
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                          u.verified
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                            : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            u.verified ? "bg-emerald-500" : "bg-amber-500"
                          }`}
                        />
                        {u.verified ? "Verified" : "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-slate-400 dark:text-slate-500" />
                        {new Date(u.created).toLocaleDateString("en", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <button className="rounded-lg px-3 py-1.5 text-xs font-medium text-cyan-600 transition hover:bg-cyan-50 dark:text-cyan-400 dark:hover:bg-cyan-500/10">
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col gap-3 border-t border-slate-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Showing{" "}
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {(page - 1) * perPage + 1}–{Math.min(page * perPage, totalItems)}
              </span>{" "}
              of{" "}
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {totalItems}
              </span>
            </span>
            <div className="flex items-center gap-1">
              <button
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft size={14} />
              </button>
              {pageNumbers.map((p) => (
                <button
                  key={p}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition ${
                    page === p
                      ? "bg-cyan-600 text-white"
                      : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
                  }`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}
              <button
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
