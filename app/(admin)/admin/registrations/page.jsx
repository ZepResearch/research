"use client"

import { useEffect, useState } from "react"
import pb from "@/lib/pocketbase"
import zpb, { getConferenceById, getImageUrl as getZepImageUrl } from "@/lib/zep-pocketbase"
import { downloadCsv } from "@/lib/csv"
import { Search, ChevronLeft, ChevronRight, Calendar, MapPin, Globe, Award, ExternalLink, Mail, Phone, Building, User, Download, Loader2 } from "lucide-react"

const registrationCsvColumns = [
  { header: "Registration ID", field: "id" },
  { header: "User ID", field: "user" },
  { header: "Conference ID", field: "conference" },
  { header: "Conference Name", value: (record) => record.expand?.conference?.title || "" },
  { header: "Full Name", field: "fullname" },
  { header: "Email", field: "email" },
  { header: "Phone Number", field: "phone_no" },
  { header: "Organization", field: "organization" },
  { header: "Designation", field: "designation" },
  { header: "Address", field: "adress" },
  { header: "City", field: "city" },
  { header: "State", field: "state" },
  { header: "ZIP Code", field: "zip_code" },
  { header: "Country", field: "country" },
  { header: "Conference Date", field: "conf_date" },
  { header: "Ticket Type", field: "ticket_type" },
  { header: "Ticket Category", field: "ticket_category" },
  { header: "Ticket Name", field: "ticket_name" },
  { header: "Registered At", field: "created" },
  { header: "Last Updated", field: "updated" },
]

export default function AdminRegistrationsPage() {
  const [registrations, setRegistrations] = useState([])
  const [totalItems, setTotalItems] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const perPage = 15

  useEffect(() => {
    loadRegistrations()
  }, [page, search])

  async function loadRegistrations() {
    setLoading(true)
    try {
      const filter = search
        ? `fullname ~ "${search}" || ticket_name ~ "${search}" || email ~ "${search}" || organization ~ "${search}"`
        : ""
      const result = await pb.collection("conf_registration").getList(page, perPage, {
        sort: "-created",
        filter,
        expand: "user",
      })

      const items = result.items || []

      // Enrich registrations with Conference details by conference ID
      const enrichedItems = await Promise.all(
        items.map(async (reg) => {
          if (reg.conference) {
            try {
              const zepRes = await getConferenceById(reg.conference).catch(() => null)
              if (zepRes && zepRes.success && zepRes.data) {
                return { ...reg, confData: zepRes.data }
              }
              const pbConf = await pb.collection("Conference").getOne(reg.conference).catch(() => null)
              if (pbConf) {
                return { ...reg, confData: pbConf }
              }
            } catch (err) {
              console.error("Error fetching conference for registration:", err)
            }
          }
          return reg
        })
      )

      setRegistrations(enrichedItems)
      setTotalItems(result.totalItems || items.length)
    } catch (err) {
      console.error("Error loading registrations:", err)
    } finally {
      setLoading(false)
    }
  }

  async function downloadRegistrationsCsv() {
    setExporting(true)
    setFeedback(null)

    try {
      const records = await pb.collection("conf_registration").getFullList({
        sort: "-created",
        expand: "conference",
      })
      downloadCsv({
        filename: `conference-registrations-${new Date().toISOString().slice(0, 10)}.csv`,
        columns: registrationCsvColumns,
        records,
      })
      setFeedback({ type: "success", message: `${records.length} registration${records.length === 1 ? "" : "s"} exported to CSV.` })
    } catch (err) {
      console.error("Error exporting registrations:", err)
      setFeedback({ type: "error", message: "Could not export registrations. Please try again." })
    } finally {
      setExporting(false)
    }
  }

  const totalPages = Math.ceil(totalItems / perPage)

  return (
    <div className="fade-in-up">
      <div className="admin-table-card">
        <div className="admin-table-header" style={{ flexWrap: "wrap", gap: 16 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
              Conference Registrations ({totalItems})
            </h2>
            <p style={{ fontSize: 13, color: "#64748b", margin: "2px 0 0" }}>
              Review attendee registrations and their associated conference details
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={downloadRegistrationsCsv}
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
                placeholder="Search name, ticket, email, org..."
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
              <div key={i} className="skeleton" style={{ height: 110, marginBottom: 16 }} />
            ))
          ) : registrations.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>
              <Calendar size={32} style={{ margin: "0 auto 8px" }} />
              <h3>No registrations found</h3>
            </div>
          ) : (
            registrations.map((reg) => {
              const conf = reg.confData
              const confTitle = conf?.title || reg.ticket_name || "Conference Registration"
              const confLocation = conf?.location || reg.city ? `${reg.city}, ${reg.country || ""}` : "Online"
              const confDate = conf?.date || (reg.conf_date ? new Date(reg.conf_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "")
              const websiteUrl = conf?.websiteUrl
              const createdDate = reg.created
                ? new Date(reg.created).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                : ""

              return (
                <div
                  key={reg.id}
                  className="admin-card-item"
                  style={{
                    padding: "20px",
                    borderRadius: "12px",
                    marginBottom: "16px"
                  }}
                >
                  {/* Top Line: Attendee Name & Conference Name */}
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 12 }}>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 4px" }}>
                        {reg.fullname || reg.expand?.user?.name || "Attendee"}
                      </h3>
                      <div style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        fontSize: 13, fontWeight: 600, color: "#3b82f6",
                        background: "rgba(59, 130, 246, 0.1)", border: "1px solid rgba(59, 130, 246, 0.2)",
                        padding: "3px 10px", borderRadius: 6
                      }}>
                        <Calendar size={13} /> Registered Conference: {confTitle}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                      {reg.ticket_type && (
                        <span className="status-badge registered" style={{ fontSize: 12 }}>
                          {reg.ticket_type}
                        </span>
                      )}
                      {reg.ticket_category && (
                        <span className="status-badge upcoming" style={{ fontSize: 12 }}>
                          {reg.ticket_category}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Conference Info Banner */}
                  {(confLocation || confDate || websiteUrl || conf?.cpd_accredited) && (
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
                            <MapPin size={13} color="#3b82f6" /> Location: {confLocation}
                          </span>
                        )}
                        {confDate && (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontWeight: 500 }}>
                            <Calendar size={13} color="#3b82f6" /> Date: {confDate}
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

                  {/* Registration Details Grid */}
                  <div
                    className="admin-info-box"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                      gap: 12,
                      padding: "12px 14px",
                      borderRadius: 8,
                      fontSize: 12
                    }}
                  >
                    <div>
                      <span style={{ color: "#94a3b8", display: "block", fontSize: 11, textTransform: "uppercase", fontWeight: 600 }}>
                        Attendee Details
                      </span>
                      <strong>{reg.fullname || "—"}</strong>
                      <div style={{ fontSize: 12 }}>{reg.email || reg.expand?.user?.email || "—"}</div>
                      {reg.phone_no && <div style={{ fontSize: 12 }}>{reg.phone_no}</div>}
                    </div>

                    {(reg.organization || reg.designation) && (
                      <div>
                        <span style={{ color: "#94a3b8", display: "block", fontSize: 11, textTransform: "uppercase", fontWeight: 600 }}>
                          Organization & Designation
                        </span>
                        <strong>{reg.organization || "—"}</strong>
                        {reg.designation && <div style={{ fontSize: 12 }}>{reg.designation}</div>}
                      </div>
                    )}

                    {(reg.city || reg.state || reg.country) && (
                      <div>
                        <span style={{ color: "#94a3b8", display: "block", fontSize: 11, textTransform: "uppercase", fontWeight: 600 }}>
                          Address / Location
                        </span>
                        <div>
                          {[reg.city, reg.state, reg.country].filter(Boolean).join(", ") || "—"}
                        </div>
                        {reg.zip_code && <div style={{ fontSize: 12 }}>ZIP: {reg.zip_code}</div>}
                      </div>
                    )}

                    <div>
                      <span style={{ color: "#94a3b8", display: "block", fontSize: 11, textTransform: "uppercase", fontWeight: 600 }}>
                        Registration Date
                      </span>
                      <div>{createdDate || "—"}</div>
                    </div>
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
