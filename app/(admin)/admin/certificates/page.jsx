"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import pb from "@/lib/pocketbase"
import { Search, ChevronLeft, ChevronRight, Award, Clock, Eye } from "lucide-react"

const statusOptions = ["all", "requested", "generated", "sent", "rejected"]

export default function AdminCertificatesPage() {
  const [certificates, setCertificates] = useState([])
  const [totalItems, setTotalItems] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const perPage = 15

  useEffect(() => {
    loadCertificates()
  }, [page, search, statusFilter])

  async function loadCertificates() {
    setLoading(true)
    try {
      const filters = []
      if (search) {
        filters.push(`certificate_no ~ "${search}"`)
      }
      if (statusFilter !== "all") {
        filters.push(`status = "${statusFilter}"`)
      }
      const filter = filters.join(" && ")

      const result = await pb.collection("conf_certificates").getList(page, perPage, {
        sort: "-created",
        filter,
        expand: "user,registration",
      })
      setCertificates(result.items)
      setTotalItems(result.totalItems)
    } catch (err) {
      console.error("Error loading certificates:", err)
    } finally {
      setLoading(false)
    }
  }

  const totalPages = Math.ceil(totalItems / perPage)

  return (
    <div>
      <div className="admin-table-card fade-in-up">
        <div className="admin-table-header">
          <h2>Certificate Queue ({totalItems})</h2>
          <div style={{ position: "relative" }}>
            <Search size={14} style={{
              position: "absolute", left: 10, top: "50%",
              transform: "translateY(-50%)", color: "#94a3b8"
            }} />
            <input
              type="text"
              placeholder="Search by cert number..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="admin-search-input"
              style={{ paddingLeft: 32 }}
            />
          </div>
        </div>

        {/* Status filter tabs */}
        <div className="status-filter-tabs">
          {statusOptions.map((s) => (
            <button
              key={s}
              className={`status-filter-tab ${statusFilter === s ? "active" : ""}`}
              onClick={() => { setStatusFilter(s); setPage(1) }}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>Certificate No.</th>
              <th>User</th>
              <th>Type</th>
              <th>Status</th>
              <th>Requested</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={6}>
                    <div className="skeleton" style={{ height: 20 }} />
                  </td>
                </tr>
              ))
            ) : certificates.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>
                  No certificates found
                </td>
              </tr>
            ) : (
              certificates.map((cert) => (
                <tr key={cert.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Award size={14} style={{ color: "#8b5cf6", flexShrink: 0 }} />
                      <span style={{ fontWeight: 600 }}>
                        {cert.certificate_no || `CERT-${cert.id.slice(0, 8)}`}
                      </span>
                    </div>
                  </td>
                  <td>{cert.expand?.user?.name || "—"}</td>
                  <td style={{ textTransform: "capitalize" }}>
                    {cert.certificate_type || "participation"}
                  </td>
                  <td>
                    <span className={`status-badge ${cert.status || "requested"}`}>
                      {cert.status || "requested"}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <Clock size={12} />
                      {new Date(cert.created).toLocaleDateString("en", {
                        month: "short", day: "numeric", year: "numeric"
                      })}
                    </div>
                  </td>
                  <td>
                    <div className="table-actions">
                      <Link
                        href={`/admin/certificates/${cert.id}`}
                        className="action-btn primary"
                        style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}
                      >
                        <Eye size={12} /> Manage
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

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
