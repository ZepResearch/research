"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import pb from "@/lib/pocketbase"
import {
  ArrowLeft,
  Award,
  Upload,
  FileText,
  User,
  Calendar,
  Hash,
  ShieldCheck,
  XCircle,
  Send,
  Loader2,
} from "lucide-react"

const STATUS_STYLES = {
  requested: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  generated: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  sent: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  rejected: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
}

function DetailRow({ icon: Icon, label, value, mono, capitalize, subvalue }) {
  return (
    <div className="flex items-start gap-3">
      <Icon size={16} className="mt-0.5 shrink-0 text-slate-400 dark:text-slate-500" />
      <div className="min-w-0">
        <div className="text-xs text-slate-400 dark:text-slate-500">{label}</div>
        <div
          className={`text-sm font-semibold text-slate-900 dark:text-slate-100 ${
            mono ? "font-mono" : ""
          } ${capitalize ? "capitalize" : ""}`}
        >
          {value}
        </div>
        {subvalue && (
          <div className="text-xs text-slate-500 dark:text-slate-400">{subvalue}</div>
        )}
      </div>
    </div>
  )
}

export default function CertificateDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [certificate, setCertificate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("upload") // 'upload' | 'generate'
  const [file, setFile] = useState(null)
  const [nameOverride, setNameOverride] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    loadCertificate()
  }, [params.id])

  async function loadCertificate() {
    setLoading(true)
    try {
      const cert = await pb.collection("conf_certificates").getOne(params.id, {
        expand: "user,registration",
      })
      setCertificate(cert)
      setNameOverride(cert.expand?.user?.name || "")
    } catch (err) {
      console.error("Error loading certificate:", err)
    } finally {
      setLoading(false)
    }
  }

  function getAuthHeaders() {
    const headers = {}
    if (pb.authStore?.token) {
      headers["Authorization"] = `Bearer ${pb.authStore.token}`
    }
    return headers
  }

  async function handleUpload(e) {
    e.preventDefault()
    if (!file) return
    setSubmitting(true)
    setError(null)
    setSuccess(null)
    try {
      const formData = new FormData()
      formData.append("pdf", file)
      const res = await fetch(`/api/certificates/${params.id}/upload`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Upload failed")
      setSuccess("Certificate uploaded successfully!")
      setCertificate(data.certificate)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleGenerate(e) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setSuccess(null)
    try {
      const res = await fetch(`/api/certificates/${params.id}/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ name: nameOverride }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Generation failed")
      setSuccess("Certificate generated successfully!")
      setCertificate(data.certificate)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSend() {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/certificates/${params.id}/send`, {
        method: "POST",
        headers: getAuthHeaders(),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to send")
      setSuccess("Certificate sent to user successfully!")
      setCertificate(data.certificate)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleReject(e) {
    e.preventDefault()
    if (!rejectReason) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/certificates/${params.id}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ reason: rejectReason }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Rejection failed")
      setSuccess("Certificate request rejected.")
      setCertificate(data.certificate)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400 dark:text-slate-500">
        <Loader2 size={22} className="animate-spin" />
      </div>
    )
  }

  if (!certificate) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
          <Award size={26} />
        </div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">
          Certificate not found
        </h3>
        <Link
          href="/admin/certificates"
          className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          <ArrowLeft size={14} /> Back to queue
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* Back button */}
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/admin/certificates"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          <ArrowLeft size={16} />
        </Link>
        <div className="min-w-0">
          <h1 className="truncate text-lg font-bold text-slate-900 dark:text-white">
            Certificate: {certificate.certificate_no || certificate.id.slice(0, 8)}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage certificate request
          </p>
        </div>
        <span
          className={`ml-auto shrink-0 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
            STATUS_STYLES[certificate.status] || STATUS_STYLES.requested
          }`}
        >
          {certificate.status || "requested"}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Certificate Details */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
          <div className="border-b border-slate-100 px-6 py-4 dark:border-slate-800">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Certificate Details
            </h2>
          </div>
          <div className="flex flex-col gap-4 px-6 py-5">
            <DetailRow
              icon={Hash}
              label="Certificate No."
              value={certificate.certificate_no || "—"}
            />
            <DetailRow
              icon={User}
              label="User"
              value={certificate.expand?.user?.name || "—"}
              subvalue={certificate.expand?.user?.email || "—"}
            />
            <DetailRow
              icon={Award}
              label="Type"
              value={certificate.certificate_type || "participation"}
              capitalize
            />
            <DetailRow
              icon={Calendar}
              label="Conference"
              value={certificate.expand?.registration?.ticket_name || "—"}
            />
            <DetailRow
              icon={ShieldCheck}
              label="Verification Code"
              value={certificate.verification_code || "—"}
              mono
            />
          </div>
        </div>

        {/* Actions */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
          <div className="border-b border-slate-100 px-6 py-4 dark:border-slate-800">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Actions</h2>
          </div>
          <div className="px-6 py-5">
            {/* Success / Error Messages */}
            {success && (
              <div className="mb-4 rounded-lg bg-emerald-50 px-3.5 py-2.5 text-sm font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                {success}
              </div>
            )}
            {error && (
              <div className="mb-4 rounded-lg bg-rose-50 px-3.5 py-2.5 text-sm font-medium text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">
                {error}
              </div>
            )}

            {certificate.status === "requested" && (
              <>
                {/* Tab Buttons */}
                <div className="mb-5 flex gap-2 border-b border-slate-100 pb-4 dark:border-slate-800">
                  <button
                    onClick={() => setActiveTab("upload")}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-semibold transition ${
                      activeTab === "upload"
                        ? "border-2 border-indigo-500 bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
                        : "border border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                    }`}
                  >
                    <Upload size={14} /> Upload PDF
                  </button>
                  <button
                    onClick={() => setActiveTab("generate")}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-semibold transition ${
                      activeTab === "generate"
                        ? "border-2 border-violet-500 bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400"
                        : "border border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                    }`}
                  >
                    <FileText size={14} /> Generate from Template
                  </button>
                </div>

                {activeTab === "upload" ? (
                  <form onSubmit={handleUpload} className="flex flex-col gap-3">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
                        PDF File
                      </label>
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                        required
                        className="block w-full rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-indigo-600 hover:file:bg-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:file:bg-indigo-500/10 dark:file:text-indigo-400"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submitting || !file}
                      className="w-fit rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {submitting ? "Uploading…" : "Upload & Mark Generated"}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleGenerate} className="flex flex-col gap-3">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
                        Name on Certificate
                      </label>
                      <input
                        type="text"
                        value={nameOverride}
                        onChange={(e) => setNameOverride(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-violet-500 dark:focus:bg-slate-800 dark:focus:ring-violet-500/20"
                      />
                      <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                        Pre-filled from user profile — edit if needed.
                      </p>
                    </div>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-fit rounded-lg bg-violet-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {submitting ? "Generating…" : "Generate PDF"}
                    </button>
                  </form>
                )}

                {/* Reject */}
                <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800">
                  <h3 className="mb-2 text-sm font-semibold text-rose-600 dark:text-rose-400">
                    Reject Request
                  </h3>
                  <form onSubmit={handleReject} className="flex flex-col gap-2">
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Reason for rejection..."
                      required
                      rows={3}
                      className="w-full resize-y rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100 dark:border-rose-500/30 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-rose-500/20"
                    />
                    <button
                      type="submit"
                      disabled={submitting || !rejectReason}
                      className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <XCircle size={14} /> Reject
                    </button>
                  </form>
                </div>
              </>
            )}

            {certificate.status === "generated" && (
              <div className="py-4 text-center">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-400">
                  <Award size={24} />
                </div>
                <h3 className="mb-1 text-base font-bold text-slate-900 dark:text-white">
                  Certificate Generated
                </h3>
                <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
                  PDF generated and ready to deliver to the user
                </p>
                <button
                  onClick={handleSend}
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send size={14} /> {submitting ? "Delivering…" : "Send / Deliver to User"}
                </button>
              </div>
            )}

            {certificate.status === "rejected" && (
              <div className="py-4 text-center">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 dark:bg-rose-500/10 dark:text-rose-400">
                  <XCircle size={24} />
                </div>
                <h3 className="mb-1 text-base font-bold text-slate-900 dark:text-white">
                  Request Rejected
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {certificate.rejection_reason || certificate.rejected_reason || "No reason provided."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}