"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import pb from "@/lib/pocketbase"
import RequestCertificateButton from "@/components/dashboard/RequestCertificateButton"
import { ArrowLeft, Calendar, MapPin, Award, User, Mail, Building, Ticket } from "lucide-react"

export default function RegistrationDetailPage() {
  const params = useParams()
  const [registration, setRegistration] = useState(null)
  const [certificateStatus, setCertificateStatus] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      loadRegistrationDetail()
    }
  }, [params.id])

  async function loadRegistrationDetail() {
    setLoading(true)
    try {
      const reg = await pb.collection("conf_registration").getOne(params.id)
      setRegistration(reg)

      // Check existing certificate for this registration
      const certs = await pb.collection("conf_certificates").getFullList({
        filter: pb.filter('registration = {:reg} && status != "rejected"', { reg: params.id }),
      }).catch(() => [])

      if (certs.length > 0) {
        setCertificateStatus(certs[0].status)
      }
    } catch (err) {
      console.error("Error loading registration detail:", err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <div className="skeleton" style={{ height: 200, maxWidth: 600, margin: "0 auto" }} />
      </div>
    )
  }

  if (!registration) {
    return (
      <div className="empty-state">
        <h3>Registration not found</h3>
        <Link href="/dashboard/registrations" style={{ color: "#3b82f6", textDecoration: "none" }}>
          ← Back to registrations
        </Link>
      </div>
    )
  }

  const confDate = registration.conf_date ? new Date(registration.conf_date) : null
  const hasEnded = confDate ? confDate < new Date() : true

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
        <Link href="/dashboard/registrations" style={{
          width: 36, height: 36, borderRadius: 10,
          border: "1px solid #e2e8f0", display: "flex",
          alignItems: "center", justifyContent: "center",
          background: "#fff", color: "#475569", textDecoration: "none"
        }}>
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#1e293b", margin: 0 }}>
            {registration.ticket_name || "Registration Detail"}
          </h1>
          <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
            Registration ID: {registration.id}
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div className="admin-table-card">
          <div className="admin-table-header">
            <h2>Registration Information</h2>
          </div>
          <div style={{ padding: 20, display: "grid", gap: 16 }}>
            <div>
              <div style={{ fontSize: 12, color: "#94a3b8" }}>Attendee</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#1e293b" }}>{registration.fullname || "—"}</div>
              <div style={{ fontSize: 13, color: "#64748b" }}>{registration.email || "—"}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#94a3b8" }}>Organization & Role</div>
              <div style={{ fontSize: 14, color: "#1e293b" }}>{registration.organization || "—"}</div>
              <div style={{ fontSize: 13, color: "#64748b" }}>{registration.designation || "—"}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#94a3b8" }}>Ticket</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#3b82f6" }}>
                {registration.ticket_type || registration.ticket_category || "Standard Ticket"}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#94a3b8" }}>Conference Date & Location</div>
              <div style={{ fontSize: 14, color: "#1e293b" }}>
                {confDate ? confDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "—"}
              </div>
              <div style={{ fontSize: 13, color: "#64748b" }}>
                {registration.city ? `${registration.city}, ${registration.country}` : "Online Event"}
              </div>
            </div>
          </div>
        </div>

        <div className="admin-table-card">
          <div className="admin-table-header">
            <h2>Certificate Options</h2>
          </div>
          <div style={{ padding: 20 }}>
            <div style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: 12,
              padding: 20,
              textAlign: "center"
            }}>
              <Award size={36} color="#3b82f6" style={{ margin: "0 auto 12px" }} />
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", margin: "0 0 6px" }}>
                Participation Certificate
              </h3>
              <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 20px" }}>
                Official certificate verifying your participation in this conference.
              </p>
              <RequestCertificateButton
                registrationId={registration.id}
                conferenceEnded={hasEnded}
                existingStatus={certificateStatus}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
