# ZEP Research — PocketBase Schema (agent reference)

Backend: PocketBase. Auth model: every protected collection uses the same
"self OR admin" pattern:

```
ADMIN = @request.auth.admin = true && @request.auth.verified = true && @request.auth.email ~ "@zepresearch.com"
SELF  = <owner_field> = @request.auth.id
```

Referenced below as `SELF` / `ADMIN`.

---

## `users` (auth collection)

| Field | Type | Notes |
|---|---|---|
| email | email | |
| verified | bool | used in `ADMIN` check |
| admin | bool | used in `ADMIN` check |
| username | text | unique, autogen `users######` |
| name, phone_no | text | |
| avatar | file (img) | |
| researcher_type | select | `academic \| corporate \| medical \| non_researcher` |
| institution, department, company, position | text | |
| is_scientific | bool | |
| bio, headline, location | text | |
| orcid_id | text | |
| website | url | |
| social_links | json | |
| profile_banner | file | |
| open_to_work | bool | |

**Rules:** list/view = `SELF OR ADMIN` · **create = open (no restriction)** · **update = open (no restriction)** · delete = `ADMIN`
⚠️ create/update have empty rules → any client (incl. unauthenticated) can create or update **any** user record, not just their own.

**Auth config:** password login (email or username) + OAuth2 enabled + email OTP (6 digits, 180s). MFA disabled. Session token: 14 days.

---

## `Conference` (id: `lvjitnfhnky3omk`)

| Field | Type | Notes |
|---|---|---|
| order | number | |
| title*, date*, description* | text | *required |
| shortDescription | text | |
| websiteUrl*, img* | url | *required |
| location* | text | required |
| field | date | |
| cpd_accredited | bool | |
| cpd_hours | number | |

**Rules:** list/view/create/update/delete = **all open** (empty string on every rule).
⚠️ Fully public collection — no auth needed for any CRUD operation, including delete.

---

## `conf_registration` (id: `pbc_790762782`)

| Field | Type | Notes |
|---|---|---|
| user | relation → `users` | |
| conference | relation → `Conference` | |
| fullname, email, organization, designation | text/email | |
| adress *(sic)*, city, state, zip_code, country | text | |
| phone_no | text | |
| conf_date | date | |
| ticket_type, ticket_category, ticket_name | text | |

**Rules:** list/view = `SELF OR ADMIN` · create = authenticated **and** `user = self` · update = `SELF OR ADMIN` · delete = `ADMIN`

---

## `conf_paper_submission_all` (id: `65e4bsry4w8s4l1`)

| Field | Type | Notes |
|---|---|---|
| user | relation → `users` | |
| author, co_author | text | |
| phone_number | number | |
| email | email | |
| country, department, organization, paper_title, conf_name, message | text | |
| file | file | |
| paper_type | select | `Abstract \| Full Paper` |
| presentation_type | select | `Poster \| Oral \| Virtual` |
| know_to_you | select | `Conference Alerts \| Email \| Friend or Colleague or Supervisor \| Facebook \| Google Search \| Eventbit \| Linkdin \| Others` |

**Rules:** same shape as `conf_registration` — list/view = `SELF OR ADMIN` · create = authenticated **and** `user = self` · update = `SELF OR ADMIN` · delete = `ADMIN`

---

## `conf_certificates` (id: `pbc_3669933913`)

| Field | Type | Notes |
|---|---|---|
| user | relation → `users` | |
| registration | relation → `conf_registration` | |
| certificate_type | select | participation, presentation, best paper, speaker, organizer, organizing secretary, conference chair, conference co-chair, session chair, panel speaker, keynote speakers, guest of honor, guest speaker |
| certificate_no | text | autogen `CERT-XXXXXXXXXXXX`, **unique** |
| verification_code | text | autogen 8-char, **unique** |
| issue_date | date | |
| pdf | file | |
| status | select | `requested \| generated \| rejected` |
| rejection_reason | text | |
| generation_method | select | `manual_upload \| template` |

**Rules:** list/view = `SELF OR ADMIN` · create = authenticated, `user = self` **and** `status = "requested"` · update = `ADMIN` only · **delete = `status = "rejected"`** (no auth/ownership check)
⚠️ Any client can delete a certificate record as soon as its status is `rejected` — no `SELF`/`ADMIN` check on delete.

**Unique indexes:** `(registration, certificate_type)`, `verification_code`, `certificate_no`. Regular index on `user`.

---

## Relations

```
users ─< conf_registration >─ Conference
users ─< conf_paper_submission_all
conf_registration ─< conf_certificates >─ users
```

## Collection IDs (for schema diffs / SDK relation refs)

| Name | id |
|---|---|
| users | `_pb_users_auth_` |
| Conference | `lvjitnfhnky3omk` |
| conf_registration | `pbc_790762782` |
| conf_paper_submission_all | `65e4bsry4w8s4l1` |
| conf_certificates | `pbc_3669933913` |

## ⚠️ Access-rule flags worth revisiting
1. `users` create/update rules are empty → open write access to all user records.
2. `Conference` has zero restriction on all 5 rules → publicly writable/deletable.
3. `conf_certificates` delete only checks `status`, not `SELF`/`ADMIN` → any caller can delete rejected certs.