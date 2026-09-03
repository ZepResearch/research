# ZEP Research Dashboard + Certificate Generator — Build Plan

This is a working blueprint for building the member/admin dashboard and the
conference certificate generator on top of the existing PocketBase instance
at `https://admin.zepresearch.com`. It assumes Next.js App Router, plain
JSX (no TypeScript), Tailwind, and the PocketBase JS SDK.

Companion doc: see the schema-change notes given alongside this file for the
required changes to `conf_certificates` before starting Phase 1.

---

## 1. Tech assumptions

- Next.js App Router, JSX (`.jsx`, not `.tsx`)
- Tailwind CSS + shadcn/ui for dashboard chrome
- PocketBase JS SDK (`pocketbase` npm package)
- PDF generation: `puppeteer-core` + `@sparticuz/chromium` (serverless-friendly
  headless Chrome) for the template → PDF path
- Existing membership system (`useMembershipStatus`, `MembershipBanner`,
  `ProfileCompletionGate`) is reused as-is for member gating — this plan
  does not touch it, it just composes with it.

**Convention used throughout this plan:** all **reads** (listing your own
registrations, submissions, certificates) go straight through the PocketBase
client SDK and are protected by PocketBase's own collection rules. All
**writes that matter** (request a certificate, generate one, upload one, mark
sent, reject) go through a Next.js Route Handler, even in cases where a
direct client-side `pb.collection(...).update()` would technically be
allowed by the rules. This keeps every state transition in one place, makes
it easy to add side effects later (emails, logging), and keeps the "who's
allowed to move status from X to Y" logic out of PocketBase rule strings,
where it's hard to express and harder to read back later.

---

## 2. Access control model

Two gates, stacked:

1. **Authenticated** — valid PocketBase auth cookie.
2. Then branch:
   - **Member area** (`/dashboard/**`): authenticated + passes the existing
     membership check (`useMembershipStatus` / `ProfileCompletionGate`).
   - **Admin area** (`/admin/**`): authenticated **and**
     `user.admin === true && user.verified === true && user.email` ends with
     `@zepresearch.com`.

```js
// lib/auth/isAdmin.js
export function isAdminUser(user) {
  if (!user) return false;
  return (
    user.admin === true &&
    user.verified === true &&
    typeof user.email === 'string' &&
    user.email.toLowerCase().endsWith('@zepresearch.com')
  );
}
```

Route protection is two layers, matching what PocketBase's own docs
recommend for SSR meta-frameworks — keep the browser SDK doing normal
user-scoped reads, and push anything privileged into one-off server actions
authenticated separately:

- `middleware.js` — cheap, cookie-presence check only, redirects to
  `/login` if there's no `pb_auth` cookie at all. Doesn't talk to PocketBase.
- Layout-level check in `app/(dashboard)/layout.jsx` and
  `app/(admin)/admin/layout.jsx` — does the real check (loads the user from
  the cookie, refreshes/validates the token, checks `isAdminUser` where
  relevant). This is the actual gate; middleware is just there to avoid a
  flash of protected content before the layout runs.

```js
// middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  const authCookie = request.cookies.get('pb_auth');
  const hasCookie = authCookie && authCookie.value && authCookie.value !== 'null';

  if (!hasCookie) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};
```

---

## 3. Certificate lifecycle

```
requested ──(admin uploads PDF or generates from template)──> generated ──(admin sends)──> sent
    │
    └──(admin declines)──> rejected
```

- `requested`: created the moment a user clicks "Request certificate" on an
  eligible registration. `certificate_no` and `verification_code` are
  generated at this point too — the record is complete from day one, it
  just doesn't have a `pdf` yet.
- `generated`: `pdf` file is attached, `issue_date` is set.
- `sent`: optional final step if you want to track that the user was
  notified (e.g. via Resend, since that's already wired up elsewhere in the
  app) — not required for MVP, `generated` records can be downloaded
  directly from the user dashboard regardless.
- `rejected`: admin declines; `rejected_reason` explains why. Record stays
  for audit purposes instead of being deleted.

---

## 4. Folder structure

```
app/
  (dashboard)/
    layout.jsx                        # auth + membership gate
    dashboard/
      page.jsx                        # overview / quick links
      registrations/
        page.jsx                      # list of my conf_registration
        [id]/page.jsx                 # detail + "Request Certificate"
      certificates/
        page.jsx                      # my certificate requests + status + download
      submissions/
        page.jsx                      # my conf_paper_submission_all
      journals/
        page.jsx                      # redirect() to /journals/my-submission

  (admin)/
    admin/
      layout.jsx                      # admin-only gate
      page.jsx                        # overview stats
      users/
        page.jsx
        [id]/page.jsx
      registrations/
        page.jsx
      submissions/
        page.jsx
      certificates/
        page.jsx                      # queue, filterable by status
        [id]/page.jsx                 # the generate/upload screen

  api/
    certificates/
      request/route.js                # POST — user requests a cert
      [id]/
        upload/route.js               # POST — admin uploads a PDF directly
        generate/route.js             # POST — admin generates from template
        send/route.js                 # POST — admin marks as sent
        reject/route.js               # POST — admin rejects with a reason
  verify/
    [code]/page.jsx                   # public verification page

lib/
  pocketbase/
    client.js                         # browser SDK instance
    server.js                         # per-request server client (reads user from cookie)
    service.js                        # superuser client, server-only, for public verify lookups
  auth/
    isAdmin.js
  certificates/
    ids.js                            # certificate_no / verification_code generators
    templates/
      participation.js                # renderCertificateHtml({...}) -> HTML string

components/
  dashboard/
    RegistrationCard.jsx
    CertificateStatusBadge.jsx
    RequestCertificateButton.jsx
  admin/
    CertificateGenerateForm.jsx       # tabs: Upload PDF / Generate from template
    UsersTable.jsx
    SubmissionsTable.jsx
    RegistrationsTable.jsx
```

---

## 5. Build phases

**Phase 0 — Schema**
Apply the `conf_certificates` changes (status options, indexes, rules) from
the schema notes before writing any code against it.

**Phase 1 — PocketBase clients**
`lib/pocketbase/client.js`, `lib/pocketbase/server.js`,
`lib/pocketbase/service.js`, `lib/auth/isAdmin.js`. Nothing else depends on
UI yet, so this is a good first commit.

**Phase 2 — Dashboard shell + gates**
`middleware.js`, `app/(dashboard)/layout.jsx` (auth + membership),
`app/(admin)/admin/layout.jsx` (auth + `isAdminUser`).

**Phase 3 — User-facing lists**
Registrations list/detail, submissions list, journals redirect. Straight
`pb.collection(...).getList()` calls from client components, no route
handlers needed here.

**Phase 4 — Certificate request flow**
`lib/certificates/ids.js`, `app/api/certificates/request/route.js`,
`RequestCertificateButton.jsx`, certificates list page for the user.

**Phase 5 — Admin lists**
Users, registrations, submissions tables with pagination + search.

**Phase 6 — Certificate generation (the core of this feature)**
`app/api/certificates/[id]/upload/route.js`,
`app/api/certificates/[id]/generate/route.js`,
`lib/certificates/templates/participation.js`,
`CertificateGenerateForm.jsx` with the two tabs.

**Phase 7 — Verification page**
`lib/pocketbase/service.js` (if not already done in Phase 1),
`app/verify/[code]/page.jsx`.

**Phase 8 — Polish**
`send`/`reject` routes, status badges, empty states, maybe a Resend email on
`sent` (matches how admin notifications already work elsewhere in the app).

---

## 6. Key code

### 6.1 `lib/pocketbase/client.js`

```js
'use client';

import PocketBase from 'pocketbase';

export const pb = new PocketBase('https://admin.zepresearch.com');

// Keep the SSR-readable cookie in sync whenever auth state changes in the browser.
if (typeof document !== 'undefined') {
  pb.authStore.onChange(() => {
    document.cookie = pb.authStore.exportToCookie({
      httpOnly: false,
      secure: true,
      sameSite: 'Lax',
      path: '/',
    });
  }, true);
}
```

### 6.2 `lib/pocketbase/server.js`

```js
import PocketBase from 'pocketbase';
import { cookies } from 'next/headers';

// Per-request client authenticated as whoever's cookie is on the request.
// Use this in server components / route handlers for anything that should
// respect that user's own PocketBase collection rules.
export async function createServerClient() {
  const pb = new PocketBase('https://admin.zepresearch.com');
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('pb_auth');

  if (authCookie) {
    pb.authStore.loadFromCookie(`pb_auth=${authCookie.value}`);
  }

  try {
    if (pb.authStore.isValid) {
      await pb.collection('users').authRefresh();
    }
  } catch {
    pb.authStore.clear();
  }

  return pb;
}
```

### 6.3 `lib/pocketbase/service.js`

```js
import PocketBase from 'pocketbase';

// Superuser client, server-only. Never import this from a client component
// or leak its output beyond hand-picked fields — it bypasses every
// collection rule. Used only for the public verification lookup, where
// there's no logged-in user to authenticate as.
let cached = null;

export async function getServiceClient() {
  if (cached?.authStore?.isValid) return cached;

  const pb = new PocketBase('https://admin.zepresearch.com');
  await pb.collection('_superusers').authWithPassword(
    process.env.PB_SUPERUSER_EMAIL,
    process.env.PB_SUPERUSER_PASSWORD
  );
  cached = pb;
  return pb;
}
```

`PB_SUPERUSER_EMAIL` / `PB_SUPERUSER_PASSWORD` are server-only env vars for a
dedicated superuser account — never `NEXT_PUBLIC_*`. (If your PocketBase
instance predates the `_superusers` rename, this is `pb.admins.authWithPassword`
instead — check your installed version.)

### 6.4 `lib/certificates/ids.js`

```js
export function generateCertificateNo() {
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000);
  return `ZEP-CERT-${year}-${random}`;
}

export function generateVerificationCode() {
  const alphabet = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // no 0/O, 1/I confusion
  return Array.from({ length: 10 }, () =>
    alphabet[Math.floor(Math.random() * alphabet.length)]
  ).join('');
}
```

### 6.5 `app/api/certificates/request/route.js`

```js
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/pocketbase/server';
import { generateCertificateNo, generateVerificationCode } from '@/lib/certificates/ids';

export async function POST(request) {
  const pb = await createServerClient();
  const user = pb.authStore.record;

  if (!pb.authStore.isValid || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { registrationId, certificateType = 'participation' } = await request.json();

  if (!registrationId) {
    return NextResponse.json({ error: 'registrationId is required' }, { status: 400 });
  }

  let registration;
  try {
    registration = await pb.collection('conf_registration').getOne(registrationId);
  } catch {
    return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
  }

  if (registration.user !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (new Date(registration.conf_date) > new Date()) {
    return NextResponse.json(
      { error: 'Certificates are available once the conference has concluded.' },
      { status: 400 }
    );
  }

  const existing = await pb.collection('conf_certificates').getFullList({
    filter: pb.filter('registration = {:reg} && certificate_type = {:type} && status != "rejected"', {
      reg: registrationId,
      type: certificateType,
    }),
  });

  if (existing.length > 0) {
    return NextResponse.json({ certificate: existing[0] });
  }

  const certificate = await pb.collection('conf_certificates').create({
    user: user.id,
    registration: registrationId,
    certificate_type: certificateType,
    certificate_no: generateCertificateNo(),
    verification_code: generateVerificationCode(),
    status: 'requested',
  });

  return NextResponse.json({ certificate });
}
```

### 6.6 `components/dashboard/RequestCertificateButton.jsx`

```jsx
'use client';

import { useState } from 'react';

export default function RequestCertificateButton({ registrationId, conferenceEnded, existingStatus }) {
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(existingStatus ?? null);
  const [error, setError] = useState(null);

  async function handleRequest() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/certificates/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      setStatus(data.certificate.status);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (status) {
    return (
      <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-sm text-cyan-500">
        Certificate {status}
      </span>
    );
  }

  if (!conferenceEnded) {
    return (
      <span className="text-sm text-muted-foreground">
        Available after the conference concludes
      </span>
    );
  }

  return (
    <div className="space-y-1">
      <button
        onClick={handleRequest}
        disabled={submitting}
        className="rounded-md bg-cyan-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {submitting ? 'Requesting…' : 'Request Certificate'}
      </button>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
```

### 6.7 `app/api/certificates/[id]/upload/route.js` (admin, direct PDF)

```js
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/pocketbase/server';
import { isAdminUser } from '@/lib/auth/isAdmin';

export async function POST(request, { params }) {
  const pb = await createServerClient();
  const admin = pb.authStore.record;

  if (!pb.authStore.isValid || !isAdminUser(admin)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const formData = await request.formData();
  const file = formData.get('pdf');

  if (!file) {
    return NextResponse.json({ error: 'pdf file is required' }, { status: 400 });
  }

  const updated = await pb.collection('conf_certificates').update(id, {
    pdf: file,
    status: 'generated',
    generation_method: 'manual_upload',
    issue_date: new Date().toISOString(),
  });

  return NextResponse.json({ certificate: updated });
}
```

### 6.8 `lib/certificates/templates/participation.js`

Self-contained HTML with inlined styles — deliberately not pulling in your
app's Tailwind build, so this renders identically regardless of network
access or CSS pipeline changes elsewhere. Treat this as a starting point;
swap in your actual design.

```js
export function renderCertificateHtml({ name, conference, certificateType, certificateNo, verificationCode, issueDate }) {
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
  @page { margin: 0; }
  body {
    margin: 0;
    width: 1122px;
    height: 793px;
    font-family: Georgia, 'Times New Roman', serif;
    background: #ffffff;
    border: 14px solid #0e7490;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
  }
  .label { letter-spacing: 4px; text-transform: uppercase; color: #0e7490; font-size: 14px; }
  .name { font-size: 42px; margin: 24px 0 8px; color: #111; }
  .body-text { font-size: 16px; color: #444; max-width: 700px; line-height: 1.6; }
  .footer { margin-top: 48px; font-size: 12px; color: #888; }
</style>
</head>
<body>
  <div class="label">Certificate of ${certificateType}</div>
  <div class="name">${name}</div>
  <div class="body-text">
    This certifies participation in <strong>${conference}</strong>,
    issued on ${issueDate}.
  </div>
  <div class="footer">
    Certificate No. ${certificateNo} &nbsp;·&nbsp; Verify at
    zepresearch.com/verify/${verificationCode}
  </div>
</body>
</html>`;
}
```

### 6.9 `app/api/certificates/[id]/generate/route.js` (admin, template → PDF)

```js
import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { createServerClient } from '@/lib/pocketbase/server';
import { isAdminUser } from '@/lib/auth/isAdmin';
import { renderCertificateHtml } from '@/lib/certificates/templates/participation';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(request, { params }) {
  const pb = await createServerClient();
  const admin = pb.authStore.record;

  if (!pb.authStore.isValid || !isAdminUser(admin)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const { name: overrideName, issueDate } = await request.json();

  const certificate = await pb.collection('conf_certificates').getOne(id, {
    expand: 'user,registration',
  });

  const resolvedIssueDate = issueDate || new Date().toISOString().slice(0, 10);

  const html = renderCertificateHtml({
    name: overrideName || certificate.expand.user.name,
    conference: certificate.expand.registration.ticket_name,
    certificateType: certificate.certificate_type,
    certificateNo: certificate.certificate_no,
    verificationCode: certificate.verification_code,
    issueDate: resolvedIssueDate,
  });

  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
  });

  let pdfBuffer;
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    pdfBuffer = await page.pdf({
      width: '1122px',
      height: '793px',
      printBackground: true,
    });
  } finally {
    await browser.close();
  }

  const updateForm = new FormData();
  updateForm.append('status', 'generated');
  updateForm.append('generation_method', 'template');
  updateForm.append('issue_date', resolvedIssueDate);
  updateForm.append(
    'pdf',
    new Blob([pdfBuffer], { type: 'application/pdf' }),
    `${certificate.certificate_no}.pdf`
  );

  const updated = await pb.collection('conf_certificates').update(id, updateForm);

  return NextResponse.json({ certificate: updated });
}
```

**Deployment note:** this route needs the Node.js runtime (not Edge) and a
platform that tolerates the Chromium binary's size and cold-start time —
fine on Vercel's Node functions, but check current limits on your plan. If
Puppeteer turns out to be more infrastructure than you want to run,
`@react-pdf/renderer` is the alternative: no headless browser at all, but
you write the template with its own component API instead of plain
HTML/CSS.

### 6.10 `components/admin/CertificateGenerateForm.jsx`

```jsx
'use client';

import { useState } from 'react';

export default function CertificateGenerateForm({ certificate, userName, onDone }) {
  const [tab, setTab] = useState('upload'); // 'upload' | 'template'
  const [file, setFile] = useState(null);
  const [name, setName] = useState(userName);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function handleUpload(e) {
    e.preventDefault();
    if (!file) return;
    setSubmitting(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('pdf', file);
      const res = await fetch(`/api/certificates/${certificate.id}/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onDone(data.certificate);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGenerate(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/certificates/${certificate.id}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onDone(data.certificate);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setTab('upload')}
          className={`px-3 py-2 text-sm ${tab === 'upload' ? 'border-b-2 border-cyan-500 font-medium' : 'text-muted-foreground'}`}
        >
          Upload PDF
        </button>
        <button
          onClick={() => setTab('template')}
          className={`px-3 py-2 text-sm ${tab === 'template' ? 'border-b-2 border-cyan-500 font-medium' : 'text-muted-foreground'}`}
        >
          Generate from template
        </button>
      </div>

      {tab === 'upload' ? (
        <form onSubmit={handleUpload} className="space-y-3">
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            required
          />
          <button type="submit" disabled={submitting} className="rounded-md bg-cyan-500 px-4 py-2 text-sm text-white disabled:opacity-50">
            {submitting ? 'Uploading…' : 'Upload & Mark Generated'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleGenerate} className="space-y-3">
          <label className="block text-sm">
            Name on certificate
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            />
            <span className="text-xs text-muted-foreground">
              Pre-filled from the user's profile — edit if needed.
            </span>
          </label>
          <button type="submit" disabled={submitting} className="rounded-md bg-cyan-500 px-4 py-2 text-sm text-white disabled:opacity-50">
            {submitting ? 'Generating…' : 'Generate PDF'}
          </button>
        </form>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
```

Note: this pre-fills from `user.name` (profile) per your description. Worth
double-checking against `registration.fullname` (the name given at
registration time) before you lock this in — they can differ if someone
registers on a colleague's behalf. Either way, the field is editable, so
it's a fallback question, not a blocker.

### 6.11 `app/verify/[code]/page.jsx` (public)

```jsx
import { getServiceClient } from '@/lib/pocketbase/service';

export default async function VerifyPage({ params }) {
  const { code } = await params;
  const pb = await getServiceClient();

  let certificate = null;
  try {
    certificate = await pb.collection('conf_certificates').getFirstListItem(
      pb.filter('verification_code = {:code} && status = "sent"', { code }),
      { expand: 'user,registration' }
    );
  } catch {
    certificate = null;
  }

  if (!certificate) {
    return (
      <div className="mx-auto max-w-md py-24 text-center">
        <h1 className="text-xl font-semibold">Certificate not found</h1>
        <p className="mt-2 text-muted-foreground">
          This verification code doesn't match any issued certificate.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md py-24 text-center">
      <h1 className="text-xl font-semibold text-cyan-500">Verified</h1>
      <p className="mt-4 text-lg">{certificate.expand.user.name}</p>
      <p className="text-muted-foreground">{certificate.expand.registration.ticket_name}</p>
      <p className="mt-2 text-sm text-muted-foreground">
        Certificate No. {certificate.certificate_no} · Issued {certificate.issue_date}
      </p>
    </div>
  );
}
```

Only exposes hand-picked fields, and only for certificates already marked
`sent` — a `requested` or `generated`-but-not-sent certificate won't verify
publicly yet.

### 6.12 Journals redirect

```jsx
// app/(dashboard)/dashboard/journals/page.jsx
import { redirect } from 'next/navigation';

export default function JournalsRedirect() {
  redirect('/journals/my-submission');
}
```

---

## 7. Not built here (left as stubs / follow-ups)

- `app/api/certificates/[id]/send/route.js` and `reject/route.js` — same
  shape as `upload/route.js`, just flipping `status` and, for reject,
  writing `rejected_reason` from the request body.
- Admin tables for users / registrations / submissions — standard
  `getList()` + pagination, no certificate-specific logic, not detailed here.
- Optional Resend email on `send` — reuse whatever pattern is already used
  for admin notifications elsewhere in the app. 35242422q24