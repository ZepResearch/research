import { createServerClient } from '@/lib/pocketbase/server';
import { getServiceClient } from '@/lib/pocketbase/service';
import { Award, ShieldCheck, XCircle, CheckCircle2, Clock } from 'lucide-react';
import Link from 'next/link';

export default async function VerifyPage({ params }) {
  const { code } = await params;

  let certificate = null;

  // 1. Try with request user credentials if available
  try {
    const pb = await createServerClient();
    certificate = await pb.collection('conf_certificates').getFirstListItem(
      `verification_code = "${code}"`,
      { expand: 'user,registration' }
    );
  } catch {
    // 2. Fallback to service client (superuser/unauthenticated)
    try {
      const servicePb = await getServiceClient();
      certificate = await servicePb.collection('conf_certificates').getFirstListItem(
        `verification_code = "${code}"`,
        { expand: 'user,registration' }
      );
    } catch (err) {
      console.error('Failed to find certificate for verification code:', code, err);
      certificate = null;
    }
  }

  if (!certificate) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#f8fafc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px"
      }}>
        <div style={{
          maxWidth: "440px",
          width: "100%",
          background: "#ffffff",
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
          padding: "40px 24px",
          textAlign: "center",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)"
        }}>
          <div style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            background: "#fef2f2",
            color: "#ef4444",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px"
          }}>
            <XCircle size={32} />
          </div>
          <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#1e293b", margin: "0 0 8px" }}>
            Certificate Not Found
          </h1>
          <p style={{ fontSize: "14px", color: "#64748b", margin: 0, lineHeight: 1.5 }}>
            This verification code (<code style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px" }}>{code}</code>) does not match any valid certificate in the system.
          </p>
          <div style={{ marginTop: "24px" }}>
            <Link
              href="/"
              style={{
                fontSize: "14px",
                fontWeight: 600,
                color: "#3b82f6",
                textDecoration: "none"
              }}
            >
              ← Return to ZEP Research
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const userName = certificate.expand?.user?.name || certificate.expand?.registration?.fullname || "Participant";
  const confTitle = certificate.expand?.registration?.ticket_name || "ZEP Research Conference";
  const certType = certificate.certificate_type || "Participation";
  const isGenerated = certificate.status === "generated" || certificate.status === "sent";

  const issueDate = certificate.issue_date
    ? new Date(certificate.issue_date).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })
    : certificate.updated
    ? new Date(certificate.updated).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })
    : "Processing";

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f8fafc",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px"
    }}>
      <div style={{
        maxWidth: "480px",
        width: "100%",
        background: "#ffffff",
        borderRadius: "16px",
        border: "1px solid #e2e8f0",
        padding: "40px 28px",
        textAlign: "center",
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)"
      }}>
        <div style={{
          width: "64px",
          height: "64px",
          borderRadius: "50%",
          background: isGenerated ? "#dcfce7" : "#fef3c7",
          color: isGenerated ? "#16a34a" : "#d97706",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 16px"
        }}>
          {isGenerated ? <CheckCircle2 size={36} /> : <Clock size={36} />}
        </div>
        <span style={{
          display: "inline-block",
          fontSize: "12px",
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: isGenerated ? "#16a34a" : "#d97706",
          background: isGenerated ? "#f0fdf4" : "#fffbeb",
          border: isGenerated ? "1px solid #bbf7d0" : "1px solid #fde68a",
          padding: "4px 12px",
          borderRadius: "20px",
          marginBottom: "12px"
        }}>
          {isGenerated ? "Authentic Credential" : "Certificate Requested"}
        </span>
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#1e293b", margin: "0 0 6px" }}>
          Official Verification
        </h1>
        <p style={{ fontSize: "14px", color: "#64748b", margin: "0 0 24px" }}>
          {isGenerated
            ? "This document is officially issued and verified by ZEP Research."
            : "This certificate request has been recorded and is currently being processed by ZEP Research."}
        </p>

        <div style={{
          background: "#f8fafc",
          border: "1px solid #f1f5f9",
          borderRadius: "12px",
          padding: "20px",
          textAlign: "left",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          marginBottom: "24px"
        }}>
          <div>
            <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", color: "#94a3b8", fontWeight: 600 }}>
              Recipient Name
            </div>
            <div style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", marginTop: "2px" }}>
              {userName}
            </div>
          </div>

          <div>
            <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", color: "#94a3b8", fontWeight: 600 }}>
              Certificate Type & Event
            </div>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#334155", marginTop: "2px" }}>
              Certificate of {certType.charAt(0).toUpperCase() + certType.slice(1)}
            </div>
            <div style={{ fontSize: "13px", color: "#64748b", marginTop: "2px" }}>
              {confTitle}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #e2e8f0", paddingTop: "10px" }}>
            <div>
              <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", color: "#94a3b8", fontWeight: 600 }}>
                Certificate No.
              </div>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "#475569", marginTop: "2px", fontFamily: "monospace" }}>
                {certificate.certificate_no}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", color: "#94a3b8", fontWeight: 600 }}>
                Status / Issue Date
              </div>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "#475569", marginTop: "2px" }}>
                {isGenerated ? issueDate : "Pending Generation"}
              </div>
            </div>
          </div>
        </div>

        <Link
          href="/"
          style={{
            fontSize: "14px",
            fontWeight: 600,
            color: "#3b82f6",
            textDecoration: "none"
          }}
        >
          ZEP Research Platform
        </Link>
      </div>
    </div>
  );
}
