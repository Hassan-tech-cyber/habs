# Product Requirements Document
## Hospital Appointment Booking System (HABS)
### A Web-Based Platform for Streamlined Patient Scheduling in Aminu Kano Teaching Hospital

**Project Type:** Undergraduate Final Year Project
**Supervisor:** Mal Umar Saminu Muhammad
**Institution:** Federal University Dutse, Jigawa State

---

## 1. Executive Summary

Aminu Kano Teaching Hospital (AKTH) is a large tertiary hospital in Kano State that handles a high daily volume of outpatients across multiple clinical departments. Appointment scheduling at AKTH currently relies on manual, in-person processes — patients must physically visit the hospital or queue at reception to book, change, or cancel a consultation. This creates long queues, wasted travel, double-booking of doctors' time, and a high rate of missed appointments due to the absence of automated reminders.

HABS is a web-based appointment booking platform that lets patients register, browse departments and doctors, and book, reschedule, or cancel appointments online, at any time. Doctors manage their own working hours and view their schedules through a dedicated portal. Administrators oversee accounts, departments, doctor schedules, and appointment activity through a dashboard, and can generate exportable reports. Automated email reminders reduce no-shows, and online payment (Paystack) lets patients pay consultation fees at the time of booking.

The system is scoped as an undergraduate final year project: it demonstrates a production-realistic architecture (React frontend, Node.js/Express backend, Firebase Firestore database, JWT-based authentication) and a strict, server-enforced role-based access model, while deliberately excluding enterprise-scale concerns (HIS/LIS integration, multi-language support, telehealth, kiosk check-in, and compliance infrastructure) that are out of reach for a single-semester build. These are documented as future phases.

---

## 2. Goals & Success Metrics

| # | Goal | Success Metric |
|---|------|-----------------|
| G1 | Let patients book appointments without visiting the hospital | Patient can complete registration → booking in under 5 minutes, end to end |
| G2 | Eliminate double-booking of a doctor's time | 0% of confirmed appointments overlap for the same doctor |
| G3 | Give doctors self-service control of their availability | Doctor can set/update weekly working hours and see all their appointments without admin intervention |
| G4 | Give admins full operational oversight | Admin can view/manage all accounts, departments, doctors, and appointments, and export a report, from one dashboard |
| G5 | Reduce missed appointments | Automated email reminder sent for 100% of confirmed appointments ahead of the appointment time |
| G6 | Support online payment of consultation fees | Patient can pay via Paystack at booking time; payment status is recorded against the appointment |
| G7 | Protect patient data | All passwords hashed (bcrypt), all routes protected by JWT + server-side role checks, no cross-role data leakage |
| G8 | Demonstrate a coherent, defensible academic project | PRD, architecture, and implementation align with a single, consistent tech stack and scope throughout |

---

## 3. Scope

### 3.1 In-Scope (MVP)

- Patient self-registration and login
- Admin-created doctor and admin accounts (no doctor self-registration)
- Department management (admin creates/edits departments; doctors belong to one department)
- Doctor-defined working hours and slot duration → auto-generated bookable slots
- Appointment booking, rescheduling, and cancellation (in-person only, no cutoff restriction)
- Recurring appointments (e.g. weekly, for a defined number of occurrences)
- Paystack-based online payment of consultation fees at booking
- Automated email notifications (booking confirmation, reminder, cancellation/reschedule notice) via Nodemailer
- Admin dashboard: account management, department/doctor management, appointment oversight, simple activity log
- Reporting with CSV/PDF export (appointments, attendance, basic KPIs)
- Strict server-side RBAC across patient / doctor / admin roles
- Responsive web UI (desktop + mobile browser), English only

### 3.2 Out-of-Scope (MVP)

- Multilingual UI (Hausa)
- Telehealth / video consultations
- Physical kiosk / in-clinic check-in
- Waitlists for full slots
- Multi-factor authentication
- HIS/LIS/RIS or NHIS/billing system integration
- SMS notifications
- Native mobile app
- Immutable/compliance-grade audit logging (a simple activity log is included instead)

These are captured in Section 10 as potential future phases.

---

## 4. User Roles & Permissions

HABS enforces **strict role-based access control (RBAC)**. Each role has its own dedicated frontend area, and — critically — every API endpoint independently verifies the requesting user's role and ownership of the resource server-side. The frontend hiding a button or route is never treated as a security control; the backend must reject unauthorized requests regardless of what the UI shows.

### 4.1 Roles

| Role | Description | Account Creation |
|------|-------------|-------------------|
| **Patient** | End user who books/manages their own appointments | Self-registration |
| **Doctor** | Clinician who manages their own availability and appointments | Created by Admin |
| **Admin** | Manages departments, doctor/admin accounts, all appointments, and reports | Created by another Admin (or seeded as the initial account) |

### 4.2 Permission Matrix

| Capability | Patient | Doctor | Admin |
|---|:---:|:---:|:---:|
| Register/login as self | ✅ | ❌ | ❌ |
| View own profile / edit own profile | ✅ | ✅ | ✅ |
| Create doctor accounts | ❌ | ❌ | ✅ |
| Create admin accounts | ❌ | ❌ | ✅ |
| View own appointments | ✅ | ✅ | ✅ (all) |
| View another patient's appointments | ❌ | ❌ (only own patients) | ✅ |
| Book an appointment | ✅ (self) | ❌ | ❌ |
| Reschedule/cancel an appointment | ✅ (own) | ✅ (own, e.g. mark unavailable) | ✅ (any) |
| Set/edit own working hours | ❌ | ✅ | ❌ |
| Create/edit departments | ❌ | ❌ | ✅ |
| View system-wide activity log | ❌ | ❌ | ✅ |
| Generate/export reports | ❌ | ❌ | ✅ |
| Make payment for own appointment | ✅ | ❌ | ❌ |
| View payment status | ✅ (own) | ❌ | ✅ (all) |

### 4.3 Enforcement Rules

1. Every JWT carries the user's `uid` and `role`; the backend re-validates the role against the Firestore user record on every request (never trusts the token's claim of role alone, in case a token is old and the role changed).
2. Every appointment-related endpoint checks resource ownership: a patient can only fetch/modify appointments where `appointment.patientId === req.user.uid`; a doctor only where `appointment.doctorId === req.user.uid`.
3. Admin-only endpoints (department management, account creation, activity log, reports) are protected by a role-check middleware that runs before the controller logic, not left to the frontend route guard.
4. Passwords are never returned in any API response, logged, or stored anywhere except as a bcrypt hash.

---

## 5. Functional Requirements

### 5.1 Module: Authentication & Account Management

**Owner role(s):** Patient (registration/login), Admin (creating doctor/admin accounts)

**Description:** Handles patient self-registration/login, and admin-driven creation of doctor and admin accounts. Uses JWT for session management and bcrypt for password hashing.

**Fields / Business Rules:**
1. Patient registration requires: full name, email (unique), phone number, date of birth, gender, password.
2. Passwords must be at least 8 characters and are hashed with bcrypt before storage; plaintext passwords are never persisted.
3. Email must be unique across all users regardless of role (a single email cannot be both a patient and a doctor account).
4. On successful login, the backend issues a signed JWT containing `uid`, `role`, and an expiry (e.g. 24h); the token is required on all subsequent protected requests.
5. Admin creates doctor accounts by supplying: full name, email, phone, department, specialty, and a temporary password (or the system generates one and emails it via Nodemailer).
6. Admin creates other admin accounts the same way, with a role flag of `admin`.
7. A logged-in user can update their own profile fields (name, phone) but not their own role.
8. Failed login attempts return a generic error ("invalid email or password") — the system does not reveal whether the email exists.

**Acceptance Criteria:**
- Given a new visitor on the registration page, when they submit a unique email and a valid password, then a patient account is created and they are logged in with a valid JWT.
- Given an existing email, when a visitor tries to register with it again, then registration is rejected with a clear error and no duplicate account is created.
- Given an admin on the "Create Doctor" form, when they submit valid doctor details, then a doctor account is created, a welcome email with login instructions is sent via Nodemailer, and the doctor appears in the admin's doctor list.
- Given a patient JWT, when it is used to call an admin-only endpoint (e.g. create department), then the request is rejected with a 403 error.

---

### 5.2 Module: Department & Doctor Management

**Owner role(s):** Admin (management), Doctor (own profile only), Patient (read-only browsing)

**Description:** Admin maintains the list of hospital departments and the doctors within them. Patients browse departments and doctors when booking.

**Fields / Business Rules:**
1. A Department has: name, description.
2. A Doctor belongs to exactly one Department (assigned at account creation, editable by admin).
3. Doctor profile includes: name, specialty, department, consultation fee, and working-hours configuration (see 5.3).
4. Admin can deactivate a doctor account (e.g. on leave); a deactivated doctor's slots are hidden from patient booking but historical appointments remain visible.
5. Admin can edit or delete a department only if no active doctors are assigned to it (prevents orphaned doctor records).

**Acceptance Criteria:**
- Given the admin dashboard, when the admin creates a department "Cardiology," then it appears immediately in the department list and is selectable when creating a doctor.
- Given a deactivated doctor, when a patient browses that department, then the deactivated doctor does not appear in the bookable doctor list.
- Given a department with active doctors assigned, when admin attempts to delete it, then the system blocks deletion with an explanatory error.

---

### 5.3 Module: Doctor Availability & Slot Generation

**Owner role(s):** Doctor (sets own hours), Admin (can view/override), Patient (sees resulting slots read-only)

**Description:** Doctors define their weekly working hours and a fixed slot duration; the system automatically generates individual bookable time slots from this configuration.

**Fields / Business Rules:**
1. Doctor sets, per weekday: working start time, working end time, and whether they are working that day at all.
2. Doctor sets a single slot duration (e.g. 30 minutes) that applies across their working hours.
3. The system generates bookable slots for a rolling window (e.g. the next 30 days) based on the doctor's working hours and slot duration.
4. A slot already booked (or blocked by the doctor) is not shown as available to other patients.
5. Doctor can manually block a specific slot (e.g. for an emergency) without cancelling any existing booking in it; a blocked slot with an existing booking must first be resolved via reschedule (see 5.4, Rule 5).
6. Any change to working hours only affects future, not-yet-booked slots; existing confirmed appointments are not retroactively invalidated.

**Acceptance Criteria:**
- Given a doctor sets Mon–Fri, 9:00–17:00, 30-minute slots, when a patient views that doctor's availability, then they see individual 30-minute slots across those days, excluding any already booked.
- Given a doctor updates their working hours, when the change is saved, then newly generated future slots reflect the update, and existing booked appointments are unaffected.
- Given a doctor blocks a slot with no existing booking, when a patient views availability, then that slot no longer appears as bookable.

---

### 5.4 Module: Appointment Booking, Rescheduling & Cancellation

**Owner role(s):** Patient (books/reschedules/cancels own), Doctor (views own, can cancel), Admin (full access)

**Description:** Core booking workflow. Patients select a department, doctor, and available slot; the system prevents double-booking and supports recurring bookings.

**Fields / Business Rules:**
1. An Appointment has: patientId, doctorId, departmentId, date, time slot, status (`pending_payment`, `confirmed`, `cancelled`, `completed`, `no_show`), paymentStatus, isRecurring flag, recurrenceGroupId (if part of a recurring series), createdAt, updatedAt.
2. Booking a slot is atomic: the system checks the slot is still available and reserves it in the same transaction, preventing two patients from double-booking the same doctor/time.
3. A newly booked appointment starts as `pending_payment`; it becomes `confirmed` once payment succeeds (see 5.5). Unpaid appointments older than a defined window (e.g. 30 minutes) are auto-released back to available.
4. Patients may reschedule or cancel their own appointment at any time before the appointment's scheduled time, with no cutoff restriction.
5. Rescheduling releases the original slot (making it available again) and books a new slot in the same operation.
6. Recurring appointments: patient selects a recurrence pattern (e.g. weekly) and a number of occurrences (e.g. 6 weeks); the system attempts to book the same weekday/time slot with the same doctor for each occurrence, sharing a `recurrenceGroupId`. If a specific occurrence's slot is unavailable, that single occurrence is skipped and flagged, without blocking the rest of the series.
7. Cancelling one occurrence of a recurring series cancels only that occurrence unless the patient explicitly chooses "cancel entire series."
8. Doctors can cancel an appointment on their side (e.g. unavailability); this triggers a reschedule/cancellation notification email to the patient.
9. Admin can view, reschedule, or cancel any appointment across the system.

**Acceptance Criteria:**
- Given an available slot, when a patient books it, then the appointment is created as `pending_payment` and the slot is immediately removed from other patients' availability.
- Given two patients attempting to book the same slot simultaneously, when both requests are processed, then only one succeeds and the other receives a "slot no longer available" error.
- Given a confirmed appointment, when the patient cancels it, then its status becomes `cancelled`, the slot becomes available again, and a cancellation email is sent.
- Given a patient books a 6-week weekly recurring appointment, when the booking completes, then 6 linked appointment records are created (or fewer, with a note on any skipped occurrence due to conflict).
- Given a recurring series, when the patient cancels only one occurrence, then the other occurrences in the series remain `confirmed`.

---

### 5.5 Module: Payment (Paystack)

**Owner role(s):** Patient (pays), Admin (views payment records)

**Description:** Patients pay the doctor's consultation fee via Paystack at the time of booking. Payment status gates appointment confirmation.

**Fields / Business Rules:**
1. Each department/doctor has a defined consultation fee, shown to the patient before payment.
2. On booking, the patient is redirected to (or presented with) a Paystack payment flow for the exact fee amount.
3. On payment success (verified server-side via Paystack's verify-transaction API — never trusting a client-side "success" callback alone), the appointment's status transitions from `pending_payment` to `confirmed`, and a confirmation email is sent.
4. On payment failure or abandonment, the appointment remains `pending_payment` and is auto-released after the timeout window (5.4 Rule 3).
5. Payment records store: appointmentId, amount, Paystack reference, status (success/failed), timestamp.
6. Refunds are out of scope for MVP; cancellation does not trigger an automatic refund (documented as a known limitation).

**Acceptance Criteria:**
- Given a patient completes a successful Paystack payment, when the backend verifies the transaction reference with Paystack's API, then the appointment status updates to `confirmed` and the patient sees a confirmation screen.
- Given a patient's payment fails, when they return to the app, then the appointment is still `pending_payment` and they are prompted to retry payment or the slot is released after the timeout.
- Given an admin viewing an appointment, when they open its details, then they can see the payment status and Paystack reference.

---

### 5.6 Module: Notifications (Email)

**Owner role(s):** System-triggered; visible outcome to Patient and Doctor

**Description:** Automated transactional and reminder emails sent via Nodemailer.

**Fields / Business Rules:**
1. Emails are sent for: account creation (doctor/admin welcome email), booking confirmation, appointment reminder (e.g. 24 hours before), cancellation, and reschedule.
2. Reminder emails are triggered by a scheduled job (e.g. a daily cron-style check) that looks for confirmed appointments occurring within the reminder window.
3. Email failures are logged but do not block or roll back the underlying appointment action (e.g. a booking still succeeds even if the confirmation email fails to send).
4. Emails use a simple templated format including: patient name, doctor name, department, date/time, and (for confirmations) payment amount.

**Acceptance Criteria:**
- Given a confirmed appointment, when it is created, then a confirmation email is sent to the patient's registered email within a reasonable time.
- Given an appointment scheduled for tomorrow, when the reminder job runs, then a reminder email is sent once (not duplicated on subsequent runs).
- Given an email send failure, when it occurs, then the appointment action still completes successfully and the failure is recorded in server logs.

---

### 5.7 Module: Admin Dashboard & Activity Log

**Owner role(s):** Admin

**Description:** Central operational view for admins covering accounts, departments, doctors, appointments, and a simple activity log.

**Fields / Business Rules:**
1. Dashboard shows summary counts: total patients, total doctors, appointments today, appointments this week, pending-payment appointments.
2. Admin can search/filter appointments by patient, doctor, department, date range, and status.
3. Activity log records: actor (userId + role), action type (e.g. `appointment_booked`, `appointment_cancelled`, `doctor_created`), target entity, and timestamp — displayed as a simple, admin-only, reverse-chronological list.
4. Activity log is append-only from the application's perspective (no UI to edit or delete entries), though it is not built to formal immutable/tamper-proof compliance standards.

**Acceptance Criteria:**
- Given the admin dashboard, when an admin logs in, then they see current counts for patients, doctors, and today's appointments.
- Given a patient cancels an appointment, when the admin views the activity log, then a corresponding entry appears with the correct actor, action, and timestamp.
- Given the appointment search filters, when an admin filters by department and date range, then only matching appointments are shown.

---

### 5.8 Module: Reporting & Export

**Owner role(s):** Admin

**Description:** Admin can generate and export operational reports.

**Fields / Business Rules:**
1. Available reports: appointments by department (date range), appointments by doctor (date range), attendance summary (completed vs cancelled vs no-show), and payment summary (revenue by department/date range).
2. Each report can be exported as CSV or PDF from the dashboard.
3. Reports are generated on-demand from current Firestore data (no separate data warehouse for MVP).

**Acceptance Criteria:**
- Given the reports screen, when an admin selects "Appointments by Department" for a date range and clicks export, then a correctly formatted CSV (or PDF) file downloads with matching data.
- Given a department with zero appointments in the selected range, when the report is generated, then it shows zero/empty rather than erroring.

---

## 6. Non-Functional Requirements

### 6.1 Security
- Passwords hashed with bcrypt (cost factor ≥ 10); never stored or logged in plaintext.
- All authenticated routes require a valid JWT; expired/invalid tokens are rejected with 401.
- All role-restricted routes enforce role + ownership checks server-side (see Section 4.3) — this is treated as the primary security boundary, not the frontend UI.
- All traffic served over HTTPS in production.
- Input validation and sanitization on all API endpoints to guard against injection and malformed data.
- Paystack payment verification always performed server-side against Paystack's API, never trusting client-reported payment status.
- Environment secrets (JWT secret, Firebase credentials, Paystack keys, email credentials) stored in environment variables, never committed to source control.

### 6.2 Performance
- Typical API responses (slot lookup, booking) should complete within ~1–2 seconds under normal load for a project of this scale.
- Slot-generation logic should be efficient enough to compute a doctor's next-30-days availability without noticeable UI delay.

### 6.3 Availability & Deployment
- Deployed as a standard three-tier web app: React frontend (e.g. Vercel/Netlify), Node/Express backend (e.g. Render/Railway), Firebase Firestore as the managed database.
- No formal SLA/uptime target is required for an academic project, but the deployed demo should be reliably reachable for defense/demo purposes.
- Firestore's built-in redundancy is relied upon; no custom backup/disaster-recovery infrastructure is built for MVP (noted as a future-phase concern, not an MVP requirement).

### 6.4 Usability
- Responsive design working on both desktop and mobile browsers.
- Clear, simple English-language UI; form validation with helpful error messages.

---

## 7. System Architecture Overview

### 7.1 Stack Table

| Layer | Technology | Notes |
|---|---|---|
| Frontend | React | SPA, role-based routing (patient / doctor / admin dashboards) |
| Backend | Node.js + Express | REST API, role-check middleware on protected routes |
| Database | Firebase Firestore | NoSQL document store; collections for users, appointments, departments, payments, activity logs |
| Auth | JWT + bcrypt | Custom auth (not Firebase Auth) — backend issues/verifies JWTs; bcrypt hashes passwords |
| Notifications | Nodemailer | SMTP-based transactional and reminder emails |
| Payments | Paystack | Hosted payment flow + server-side transaction verification |

### 7.2 High-Level Flow

```
[Patient Browser] --HTTPS--> [React Frontend] --REST/JWT--> [Express API]
                                                                  |
                        --------------------------------------------------
                        |                    |                    |
                  [Firestore DB]      [Paystack API]        [Nodemailer/SMTP]
                (users, appts,         (payment init +         (confirmation,
                 depts, payments,       verification)           reminder,
                 activity log)                                  cancellation emails)
```

1. Patient registers/logs in → React frontend sends credentials to Express → Express validates, hashes/verifies via bcrypt, issues JWT.
2. Patient browses departments/doctors/slots → Express reads from Firestore, computes available slots from doctor working-hours config.
3. Patient books a slot → Express performs an atomic Firestore transaction to reserve the slot and create a `pending_payment` appointment.
4. Patient pays via Paystack → Express verifies the transaction server-side → updates appointment to `confirmed` in Firestore → triggers a confirmation email via Nodemailer.
5. A scheduled job periodically scans Firestore for upcoming confirmed appointments and sends reminder emails.
6. Every write (booking, cancel, reschedule, account creation) also writes an entry to the `activityLogs` collection.
7. Admin dashboard reads aggregated data from Firestore for counts, filters, and report generation/export.

---

## 8. Core Data Entities / Schema (Firestore Collections)

**users**
```
{
  uid: string (doc id),
  role: "patient" | "doctor" | "admin",
  name: string,
  email: string,
  phone: string,
  passwordHash: string,
  // patient-only:
  dob: string, gender: string,
  // doctor-only:
  departmentId: string, specialty: string, consultationFee: number,
  isActive: boolean,
  workingHours: { mon: {start, end, active}, tue: {...}, ... },
  slotDurationMinutes: number,
  createdAt: timestamp
}
```

**departments**
```
{
  id: string (doc id),
  name: string,
  description: string
}
```

**appointments**
```
{
  id: string (doc id),
  patientId: string,
  doctorId: string,
  departmentId: string,
  date: string (YYYY-MM-DD),
  slotTime: string (HH:mm),
  status: "pending_payment" | "confirmed" | "cancelled" | "completed" | "no_show",
  paymentStatus: "unpaid" | "paid",
  isRecurring: boolean,
  recurrenceGroupId: string | null,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**payments**
```
{
  id: string (doc id),
  appointmentId: string,
  amount: number,
  paystackReference: string,
  status: "success" | "failed",
  createdAt: timestamp
}
```

**activityLogs**
```
{
  id: string (doc id),
  actorId: string,
  actorRole: "patient" | "doctor" | "admin",
  action: string,          // e.g. "appointment_booked"
  targetType: string,      // e.g. "appointment"
  targetId: string,
  timestamp: timestamp
}
```

---

## 9. Reporting & Export

Covered functionally in Section 5.8. Summary of exportable reports:

| Report | Filters | Export Formats |
|---|---|---|
| Appointments by Department | Date range | CSV, PDF |
| Appointments by Doctor | Date range, doctor | CSV, PDF |
| Attendance Summary (completed / cancelled / no-show) | Date range | CSV, PDF |
| Payment/Revenue Summary | Date range, department | CSV, PDF |

---

## 10. Out of Scope & Future Phases

The following, present in the original requirements research but deliberately excluded from this undergraduate MVP, are documented as future-phase candidates:

- **Multilingual UI (Hausa)** — localize UI text and emails.
- **Telehealth** — video consultation links for remote appointments.
- **Kiosk / in-clinic check-in** — self-service arrival tracking.
- **Waitlists** — automatic notification when a full slot opens up.
- **Multi-factor authentication** — OTP-based login for doctors/admins.
- **HIS/LIS/RIS integration** — connecting to hospital, lab, and imaging systems.
- **NHIS/insurance billing integration**.
- **SMS notifications** — in addition to or instead of email.
- **Native mobile app**.
- **Formal immutable/compliance-grade audit logging and data-retention policy** (NDPA-level controls) — the MVP's simple activity log is a foundation, not a compliance solution.
- **Refund handling** for cancelled paid appointments.

---

## 11. Assumptions & Open Questions

**Assumptions:**
- A single admin account will be seeded manually (e.g. via a Firestore console entry or a one-time setup script) to bootstrap the system, since no admin exists to create the first admin.
- Consultation fees are fixed per doctor and do not vary by appointment type (since only in-person appointments are supported).
- The reminder job (Section 5.6, Rule 2) is implemented as a scheduled server-side task (e.g. `node-cron` within the Express app, or a scheduled Cloud Function) — exact mechanism to be decided during implementation.
- "Recurring appointment" conflict handling (skip-and-flag, per 5.4 Rule 6) is acceptable rather than blocking the whole series — confirmed by scope decisions above, but worth re-confirming with your supervisor since it adds real implementation complexity for an undergrad timeline.

**Open Questions (for you/your supervisor to resolve before or during build):**
- How many occurrences should a recurring series default to / cap at?
- Should doctors be able to see a patient's appointment history with other doctors, or only their own encounters? (Current RBAC assumes doctors see only their own.)
- Should the pending-payment auto-release timeout be configurable, and what value should it default to (recommendation above: 30 minutes)?
- Should completed/no-show status be set automatically (e.g. by a scheduled job comparing appointment time to now) or manually by the doctor/admin?

---

## 12. Suggested Delivery Milestones

| Milestone | Deliverables | Suggested Duration |
|---|---|---|
| M1 — Foundations | Project setup (React + Express + Firestore), auth (register/login, JWT, bcrypt), role-based route protection skeleton | 1–2 weeks |
| M2 — Core Entities | Department & doctor management (admin), doctor working-hours config, slot generation logic | 1–2 weeks |
| M3 — Booking Core | Appointment booking with double-booking prevention, reschedule, cancellation | 2 weeks |
| M4 — Payments | Paystack integration (init + server-side verification), appointment status transitions | 1 week |
| M5 — Notifications | Nodemailer setup, confirmation/cancellation emails, scheduled reminder job | 1 week |
| M6 — Recurring Appointments | Recurring booking logic, conflict skip-and-flag handling | 1 week |
| M7 — Admin Dashboard & Reporting | Dashboard summary, appointment search/filter, activity log, CSV/PDF export | 1–2 weeks |
| M8 — Polish, Testing & Documentation | Responsive UI pass, manual/automated testing of RBAC boundaries, project write-up/defense prep | 1–2 weeks |

---

*Document generated as a PRD deliverable for the HABS final year project. All scope decisions in Sections 3, 5, and 10 reflect choices made explicitly for this undergraduate build and may be revisited with your supervisor.*
