"use client"

import Link from "next/link"
import {
  ArrowLeft,
  ArrowRight,
  CreditCard,
  FileText,
  BookMarked,
  Award,
  ShieldCheck,
  Clock3,
  Briefcase,
  GraduationCap,
} from "lucide-react"

const documents = [
  {
    title: "Membership Card",
    subtitle: "View / Download your membership ID card",
    icon: CreditCard,
    iconClass: "membership",
    href: "/membership",
  },
  {
    title: "Conference ID Card",
    subtitle: "View / Download your conference identification card",
    icon: FileText,
    iconClass: "id-card",
  },
  {
    title: "Conference Proceedings Book",
    subtitle: "View / Download published proceedings",
    icon: BookMarked,
    iconClass: "proceedings",
  },
  {
    title: "Participation Certificate",
    subtitle: "View / Download participation certificates",
    icon: Award,
    iconClass: "certificate",
    href: "/dashboard/certificates",
  },
  {
    title: "CPD Certificate",
    subtitle: "Continuing Professional Development certificate",
    icon: ShieldCheck,
    iconClass: "cpd",
  },
  {
    title: "Paper Acceptance Letter",
    subtitle: "View / Download paper acceptance letters",
    icon: Briefcase,
    iconClass: "id-card",
  },
  {
    title: "Presentation Certificate",
    subtitle: "View / Download presentation certificates",
    icon: GraduationCap,
    iconClass: "certificate",
  },
]

// Cool, cyan-forward family so every icon feels part of the same theme
const iconColors = {
  membership: "bg-cyan-50 text-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-400",
  "id-card": "bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400",
  proceedings: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400",
  certificate: "bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400",
  cpd: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400",
}

export default function DocumentsPage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/dashboard"
          className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-cyan-50 hover:text-cyan-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-cyan-950/40 dark:hover:text-cyan-400"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="m-0 text-[22px] font-bold text-slate-800 dark:text-slate-100">
            My Documents
          </h1>
          <p className="m-0 text-sm text-slate-500 dark:text-slate-400">
            View and download all your documents and certificates
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="divide-y divide-slate-100 p-5 dark:divide-slate-800">
          {documents.map((doc) => {
            const Icon = doc.icon
            return (
              <div
                key={doc.title}
                className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconColors[doc.iconClass]}`}
                >
                  <Icon size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {doc.title}
                  </h4>
                  <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                    {doc.subtitle}
                  </p>
                </div>
                {doc.href ? (
                  <Link
                    href={doc.href}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-600 dark:border-slate-700 dark:text-slate-400 dark:hover:border-cyan-800 dark:hover:bg-cyan-950/40 dark:hover:text-cyan-400"
                    aria-label={`View ${doc.title}`}
                    title={`View ${doc.title}`}
                  >
                    <ArrowRight size={16} />
                  </Link>
                ) : (
                  <>
                    {/*
                    <button className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-600 dark:border-slate-700 dark:text-slate-400 dark:hover:border-cyan-800 dark:hover:bg-cyan-950/40 dark:hover:text-cyan-400" aria-label={`Download ${doc.title}`}>
                      <Download size={16} />
                    </button>
                    */}
                    <span
                      className="flex shrink-0 items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 text-xs text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                      title="This feature will be available soon"
                      aria-label={`${doc.title} download coming soon`}
                    >
                      <Clock3 size={15} aria-hidden="true" />
                      <span>Coming soon</span>
                    </span>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}