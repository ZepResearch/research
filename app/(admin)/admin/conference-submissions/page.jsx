"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import pb, { getImageUrl } from "@/lib/pocketbase"
import zpb, { getConferenceById, getImageUrl as getZepImageUrl } from "@/lib/zep-pocketbase"
import { downloadCsv } from "@/lib/csv"
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  Download,
  CalendarDays,
  User,
  Globe,
  Tag,
  Presentation,
  MapPin,
  Mail,
  Phone,
  Building,
  Award,
  ExternalLink,
  Loader2,
} from "lucide-react"

const conferenceSubmissionCsvColumns = [
  { header: "Submission ID", field: "id" },
  { header: "User ID", field: "user" },
  { header: "Conference ID", field: "conference" },
  { header: "Conference Name", value: (record) => record.expand?.conference?.title || record.conf_name || "" },
  { header: "Submitted Conference Name", field: "conf_name" },
  { header: "Paper Title", field: "paper_title" },
  { header: "Paper Type", field: "paper_type" },
  { header: "Presentation Type", field: "presentation_type" },
  { header: "Author", field: "author" },
  { header: "Co-author", field: "co_author" },
  { header: "Email", field: "email" },
  { header: "Phone Number", field: "phone_number" },
  { header: "Country", field: "country" },
  { header: "Department", field: "department" },
  { header: "Organization", field: "organization" },
  { header: "How They Heard About Us", field: "know_to_you" },
  { header: "Message", field: "message" },
  { header: "Submitted File", field: "file" },
  { header: "Submitted File URL", value: (record) => record.file ? getImageUrl(record, record.file) : "" },
  { header: "Submitted At", field: "created" },
  { header: "Last Updated", field: "updated" },
]

export default function AdminConferenceSubmissionsPage() {
  const [submissions, setSubmissions] = useState([])
  const [totalItems, setTotalItems] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
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
        ? `paper_title ~ "${search}" || author ~ "${search}" || email ~ "${search}" || conf_name ~ "${search}"`
        : ""

      const result = await pb.collection("conf_paper_submission_all").getList(page, perPage, {
        filter,
      }).catch(() => ({ items: [], totalItems: 0 }))

      const items = result.items || []

      // Enrich with Conference details from Conference collection
      const enrichedItems = await Promise.all(
        items.map(async (sub) => {
          if (sub.conference) {
            try {
              const zepRes = await getConferenceById(sub.conference).catch(() => null)
              if (zepRes && zepRes.success && zepRes.data) {
                return { ...sub, confData: zepRes.data }
              }
              const pbConf = await pb.collection("Conference").getOne(sub.conference).catch(() => null)
              if (pbConf) {
                return { ...sub, confData: pbConf }
              }
            } catch (err) {
              console.error("Error fetching conference detail:", err)
            }
          }
          return sub
        })
      )

      setSubmissions(enrichedItems)
      setTotalItems(result.totalItems || items.length)
    } catch (err) {
      console.error("Error loading conference paper submissions:", err)
    } finally {
      setLoading(false)
    }
  }

  async function downloadConferenceSubmissionsCsv() {
    setExporting(true)
    setFeedback(null)

    try {
      const records = await pb.collection("conf_paper_submission_all").getFullList({
        sort: "-created",
        expand: "conference",
      })
      downloadCsv({
        filename: `conference-paper-submissions-${new Date().toISOString().slice(0, 10)}.csv`,
        columns: conferenceSubmissionCsvColumns,
        records,
      })
      setFeedback({ type: "success", message: `${records.length} submission${records.length === 1 ? "" : "s"} exported to CSV.` })
    } catch (err) {
      console.error("Error exporting conference submissions:", err)
      setFeedback({ type: "error", message: "Could not export conference paper submissions. Please try again." })
    } finally {
      setExporting(false)
    }
  }

  const totalPages = Math.ceil(totalItems / perPage)

  return (
    <div className="fade-in-up">
      <div className="admin-table-card">
        {/* Header Bar */}
        <div className="admin-table-header" style={{ flexWrap: "wrap", gap: 16 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
              Conference Paper Submissions ({totalItems})
            </h2>
            <p style={{ fontSize: 13, color: "#64748b", margin: "2px 0 0" }}>
              View and manage all conference research paper submissions across all events
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={downloadConferenceSubmissionsCsv}
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
                placeholder="Search title, author, email, conf..."
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

        <div style={{ padding: "16px 20px" }}>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 140, marginBottom: 16 }} />
            ))
          ) : submissions.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>
              <FileText size={32} style={{ margin: "0 auto 8px" }} />
              <h3>No conference paper submissions found</h3>
            </div>
          ) : (
            submissions.map((sub) => {
              const conf = sub.confData || sub.expand?.conference
              const confTitle = conf?.title || sub.conf_name || "Conference Paper Submission"
              const confLocation = conf?.location || sub.country || "Online"
              const confDate = conf?.date || (conf?.field ? new Date(conf.field).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "")
              const websiteUrl = conf?.websiteUrl
              const createdDate = sub.created
                ? new Date(sub.created).toLocaleDateString("en-US", {
                    month: "short", day: "numeric", year: "numeric",
                  })
                : ""

              const fileUrl = sub.file ? getImageUrl(sub, sub.file) : null

              return (
                <div
                  key={sub.id}
                  className="admin-card-item"
                  style={{
                    padding: "20px",
                    borderRadius: "12px",
                    marginBottom: "16px",
                  }}
                >
                  {/* Top Line: Paper Title + Badges */}
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 12 }}>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 6px" }}>
                        {sub.paper_title || "Untitled Paper"}
                      </h3>
                      {/* Conference info */}
                      <div style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        fontSize: 13, fontWeight: 600, color: "#3b82f6",
                        background: "rgba(59, 130, 246, 0.1)", border: "1px solid rgba(59, 130, 246, 0.2)",
                        padding: "3px 10px", borderRadius: 6
                      }}>
                        <CalendarDays size={13} /> Targeted Conference: {confTitle}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                      {sub.paper_type && (
                        <span className="status-badge upcoming" style={{ fontSize: 12 }}>
                          <Tag size={11} style={{ display: "inline", marginRight: 4 }} />
                          {sub.paper_type}
                        </span>
                      )}
                      {sub.presentation_type && (
                        <span className="status-badge registered" style={{ fontSize: 12 }}>
                          <Presentation size={11} style={{ display: "inline", marginRight: 4 }} />
                          {sub.presentation_type}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Conference Details Banner if available */}
                  {(confLocation || confDate || websiteUrl) && (
                    <div
                      className="admin-info-box"
                      style={{
                        borderRadius: 8, padding: "10px 14px", marginBottom: 12,
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        flexWrap: "wrap", gap: 12, fontSize: 12
                      }}
                    >
                      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
                        {confLocation && (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontWeight: 500 }}>
                            <MapPin size={13} color="#3b82f6" /> {confLocation}
                          </span>
                        )}
                        {confDate && (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontWeight: 500 }}>
                            <Clock size={13} color="#3b82f6" /> Date: {confDate}
                          </span>
                        )}
                        {conf?.cpd_accredited && (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "#16a34a", fontWeight: 600, background: "#dcfce7", padding: "1px 6px", borderRadius: 4 }}>
                            <Award size={12} /> CPD Accredited ({conf.cpd_hours || 0}h)
                          </span>
                        )}
                      </div>

                      {websiteUrl && (
                        <a
                          href={websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontSize: 12, fontWeight: 600, color: "#3b82f6",
                            display: "inline-flex", alignItems: "center", gap: 4,
                            textDecoration: "none"
                          }}
                        >
                          <Globe size={12} /> Website <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  )}

                  {/* Author & Affiliation Details Grid */}
                  <div
                    className="admin-info-box"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
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
                        Contact
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
                        Submission Info
                      </span>
                      {createdDate && <div>Submitted: <strong>{createdDate}</strong></div>}
                      {sub.know_to_you && <div style={{ fontSize: 12 }}>Source: {sub.know_to_you}</div>}
                    </div>
                  </div>

                  {/* Bottom Line: File Download & Message */}
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
