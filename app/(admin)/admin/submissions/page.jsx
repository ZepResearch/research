"use client"

import { useEffect, useState } from "react"
import pb, { getImageUrl } from "@/lib/pocketbase"
import { downloadCsv } from "@/lib/csv"
import { Search, ChevronLeft, ChevronRight, FileText, Download, BookOpen, Loader2 } from "lucide-react"

const csvColumns = [
  { header: "Submission ID", field: "id" },
  { header: "Status", field: "status" },
  { header: "Paper Title", field: "paper_title" },
  { header: "Journal Name", field: "journal_name" },
  { header: "Author", field: "author" },
  { header: "Co-author", field: "co_author" },
  { header: "Email", field: "email" },
  { header: "Phone Number", field: "phone_number" },
  { header: "Country", field: "country" },
  { header: "Department", field: "department" },
  { header: "Organization", field: "organization" },
  { header: "Message", field: "message" },
  { header: "Submitted File", field: "file" },
  { header: "Submitted File URL", value: (record) => record.file ? getImageUrl(record, record.file) : "" },
  { header: "Submitted At", field: "created" },
  { header: "Last Updated", field: "updated" },
]

export default function AdminJournalSubmissionsPage() {
  const [submissions, setSubmissions] = useState([])
  const [totalItems, setTotalItems] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)
  const [exporting, setExporting] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const perPage = 15

  useEffect(() => {
    loadSubmissions()
  }, [page, search])

  async function loadSubmissions() {
    setLoading(true)
    try {
      const filter = search
        ? `paper_title ~ "${search}" || author ~ "${search}" || journal_name ~ "${search}" || email ~ "${search}"`
        : ""
      const result = await pb.collection("paper_form_submission").getList(page, perPage, {
        sort: "-created",
        filter,
      })
      setSubmissions(result.items || [])
      setTotalItems(result.totalItems || 0)
    } catch (err) {
      console.error("Error loading journal paper submissions:", err)
    } finally {
      setLoading(false)
    }
  }

  async function handleStatusChange(id, newStatus) {
    setUpdatingId(id)
    setFeedback(null)
    try {
      await pb.collection("paper_form_submission").update(id, { status: newStatus })
      setSubmissions((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
      )
      setFeedback({ type: "success", message: "Submission status updated." })
    } catch (err) {
      console.error("Error updating submission status:", err)
      setFeedback({
        type: "error",
        message: err?.data?.message || "Could not update the submission status. Please try again.",
      })
    } finally {
      setUpdatingId(null)
    }
  }

  async function downloadSubmissionsCsv() {
    setExporting(true)
    setFeedback(null)

    try {
      // getFullList retrieves every page, so the export is not limited to the rows currently visible.
      const records = await pb.collection("paper_form_submission").getFullList({
        sort: "-created",
      })
      downloadCsv({
        filename: `journal-submissions-${new Date().toISOString().slice(0, 10)}.csv`,
        columns: csvColumns,
        records,
      })
      setFeedback({ type: "success", message: `${records.length} submission${records.length === 1 ? "" : "s"} exported to CSV.` })
    } catch (err) {
      console.error("Error exporting journal submissions:", err)
      setFeedback({ type: "error", message: "Could not export journal submissions. Please try again." })
    } finally {
      setExporting(false)
    }
  }

  const totalPages = Math.ceil(totalItems / perPage)

  return (
    <div className="fade-in-up">
      <div className="admin-table-card">
        {/* Table Header */}
        <div className="admin-table-header" style={{ flexWrap: "wrap", gap: 16 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
              Journal Paper Submissions ({totalItems})
            </h2>
            <p style={{ fontSize: 13, color: "#64748b", margin: "2px 0 0" }}>
              Review and manage all journal form paper submissions
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={downloadSubmissionsCsv}
              disabled={exporting}
              style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
                minHeight: 36, padding: "7px 12px", border: 0, borderRadius: 8,
                background: "#2563eb", color: "#fff", fontSize: 12, fontWeight: 600,
                cursor: exporting ? "wait" : "pointer", opacity: exporting ? 0.7 : 1,
              }}
            >
              {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              {exporting ? "Exporting..." : "Export all CSV"}
            </button>
            <div style={{ position: "relative", minWidth: 260, flex: "1 1 260px" }}>
              <Search size={14} style={{
                position: "absolute", left: 10, top: "50%",
                transform: "translateY(-50%)", color: "#94a3b8"
              }} />
              <input
                type="text"
                placeholder="Search paper title, author, journal..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                className="admin-search-input"
                style={{ paddingLeft: 32, width: "100%" }}
              />
            </div>
          </div>
        </div>

        {feedback && (
          <div
            role="status"
            style={{
              margin: "0 20px", padding: "10px 12px", borderRadius: 8, fontSize: 13,
              color: feedback.type === "error" ? "#b91c1c" : "#166534",
              background: feedback.type === "error" ? "#fef2f2" : "#f0fdf4",
              border: `1px solid ${feedback.type === "error" ? "#fecaca" : "#bbf7d0"}`,
            }}
          >
            {feedback.message}
          </div>
        )}

        {/* Submissions List */}
        <div style={{ padding: "16px 20px" }}>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 120, marginBottom: 16 }} />
            ))
          ) : submissions.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>
              <FileText size={32} style={{ margin: "0 auto 8px" }} />
              <h3>No journal paper submissions found</h3>
            </div>
          ) : (
            submissions.map((sub) => {
              const currentStatus = sub.status?.toLowerCase() || "pending"
              const fileUrl = sub.file ? getImageUrl(sub, sub.file) : null
              const createdDate = sub.created
                ? new Date(sub.created).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                : ""

              return (
                <div
                  key={sub.id}
                  className="admin-card-item"
                  style={{
                    padding: "20px",
                    borderRadius: "12px",
                    marginBottom: "16px"
                  }}
                >
                  {/* Top Header Line */}
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 12 }}>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 4px" }}>
                        {sub.paper_title || "Untitled Journal Paper"}
                      </h3>
                      {sub.journal_name && (
                        <div style={{ fontSize: 13, color: "#3b82f6", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 5 }}>
                          <BookOpen size={13} /> {sub.journal_name}
                        </div>
                      )}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <select
                        value={currentStatus}
                        onChange={(e) => handleStatusChange(sub.id, e.target.value)}
                        disabled={updatingId === sub.id}
                        style={{
                          padding: "6px 12px",
                          borderRadius: 8,
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: "pointer"
                        }}
                      >
                        <option value="pending">Pending</option>
                        <option value="approve">Approved</option>
                        <option value="reject">Rejected</option>
                      </select>
                    </div>
                  </div>

                  {/* Metadata Grid */}
                  <div
                    className="admin-info-box"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                      gap: 12,
                      padding: "12px 14px",
                      borderRadius: 8,
                      fontSize: 12,
                      marginBottom: 12
                    }}
                  >
                    <div>
                      <span style={{ color: "#94a3b8", display: "block", fontSize: 11, textTransform: "uppercase", fontWeight: 600 }}>
                        Author
                      </span>
                      <strong>{sub.author || "—"}</strong>
                      {sub.co_author && <div style={{ fontSize: 12 }}>Co: {sub.co_author}</div>}
                    </div>

                    <div>
                      <span style={{ color: "#94a3b8", display: "block", fontSize: 11, textTransform: "uppercase", fontWeight: 600 }}>
                        Contact Info
                      </span>
                      <div>{sub.email || "—"}</div>
                      {sub.phone_number && <div style={{ fontSize: 12 }}>{sub.phone_number}</div>}
                    </div>

                    {(sub.organization || sub.department) && (
                      <div>
                        <span style={{ color: "#94a3b8", display: "block", fontSize: 11, textTransform: "uppercase", fontWeight: 600 }}>
                          Affiliation
                        </span>
                        <strong>{sub.organization || "—"}</strong>
                        {sub.department && <div style={{ fontSize: 12 }}>{sub.department}</div>}
                      </div>
                    )}

                    <div>
                      <span style={{ color: "#94a3b8", display: "block", fontSize: 11, textTransform: "uppercase", fontWeight: 600 }}>
                        Submitted Date
                      </span>
                      <div>{createdDate || "—"}</div>
                      {sub.country && <div style={{ fontSize: 12 }}>{sub.country}</div>}
                    </div>
                  </div>

                  {/* Bottom File Download & Message */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                    {sub.message ? (
                      <p style={{ fontSize: 12, margin: 0, fontStyle: "italic" }}>
                        &ldquo;{sub.message}&rdquo;
                      </p>
                    ) : <div />}

                    {fileUrl ? (
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 6,
                          padding: "6px 14px", borderRadius: 8,
                          background: "#3b82f6", color: "#fff",
                          fontSize: 12, fontWeight: 600, textDecoration: "none"
                        }}
                      >
                        <Download size={14} /> Download Submitted Paper File
                      </a>
                    ) : (
                      <span style={{ fontSize: 12, color: "#94a3b8" }}>No file attached</span>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="admin-pagination">
            <span>
              Showing {((page - 1) * perPage) + 1}–{Math.min(page * perPage, totalItems)} of {totalItems}
            </span>
            <div className="pagination-btns">
              <button
                className="page-btn"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  className={`page-btn ${page === p ? "active" : ""}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}
              <button
                className="page-btn"
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
