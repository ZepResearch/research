"use client"

import { useEffect, useState } from 'react';
import Link from 'next/link';
import pb, { getImageUrl } from '@/lib/pocketbase';
import { Award, Loader2, Download, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';

export default function RequestCertificateButton({ registrationId, conferenceEnded = true, existingCert = null }) {
  const [submitting, setSubmitting] = useState(false);
  const [cert, setCert] = useState(existingCert);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!existingCert && registrationId) {
      // Check existing certificate for this registration
      pb.collection("conf_certificates").getFullList({
        filter: pb.filter('registration = {:reg} && status != "rejected"', { reg: registrationId }),
      }).then((certs) => {
        if (certs.length > 0) {
          setCert(certs[0]);
        }
      }).catch(() => {});
    }
  }, [registrationId, existingCert]);

  async function handleRequest() {
    setSubmitting(true);
    setError(null);
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (pb.authStore?.token) {
        headers['Authorization'] = `Bearer ${pb.authStore.token}`;
      }

      const res = await fetch('/api/certificates/request', {
        method: 'POST',
        headers,
        credentials: 'same-origin',
        body: JSON.stringify({ registrationId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      setCert(data.certificate);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  // If certificate exists and is generated/has PDF
  if (cert) {
    const pdfUrl = cert.pdf ? getImageUrl(cert, cert.pdf) : null;

    if (pdfUrl || cert.status === 'generated') {
      return (
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          {pdfUrl ? (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                borderRadius: "8px",
                background: "#10b981",
                color: "#fff",
                fontSize: "13px",
                fontWeight: 600,
                textDecoration: "none",
                transition: "background 0.2s"
              }}
            >
              <Download size={14} />
              Download Certificate
            </a>
          ) : (
            <span className="status-badge generated">
              <CheckCircle2 size={12} style={{ display: "inline", marginRight: 4 }} />
              Generated
            </span>
          )}

          {cert.verification_code && (
            <Link
              href={`/verify/${cert.verification_code}`}
              target="_blank"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                padding: "6px 12px",
                borderRadius: "8px",
                border: "1px solid #0891b2",
                background: "#ecfeff",
                color: "#0891b2",
                fontSize: "12px",
                fontWeight: 600,
                textDecoration: "none"
              }}
            >
              <ShieldCheck size={13} />
              Verify Certificate
            </Link>
          )}
        </div>
      );
    }

    if (cert.status === 'requested') {
      return (
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
          <span className="status-badge requested">
            <Clock size={12} style={{ display: "inline", marginRight: 4 }} />
            Certificate Requested
          </span>
          <Link
            href="/dashboard/certificates"
            style={{ fontSize: "12px", color: "#0891b2", textDecoration: "none", fontWeight: 500 }}
          >
            Track Status
          </Link>
        </div>
      );
    }
  }

  if (!conferenceEnded) {
    return (
      <span style={{ fontSize: "13px", color: "#94a3b8" }}>
        Available after conference
      </span>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <button
        onClick={handleRequest}
        disabled={submitting}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "8px 16px",
          borderRadius: "8px",
          background: "#0891b2",
          color: "#fff",
          fontSize: "13px",
          fontWeight: 600,
          border: "none",
          cursor: submitting ? "not-allowed" : "pointer",
          opacity: submitting ? 0.6 : 1,
          transition: "background 0.2s"
        }}
      >
        {submitting ? (
          <>
            <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
            Requesting…
          </>
        ) : (
          <>
            <Award size={14} />
            Request Certificate
          </>
        )}
      </button>
      {error && <p style={{ fontSize: "12px", color: "#ef4444", margin: 0 }}>{error}</p>}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
