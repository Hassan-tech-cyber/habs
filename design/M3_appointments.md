# Architect Design: Milestone 3 - Appointments

## 1. Overview
This document specifies the APIs for Appointment Booking, Payment Mocking, and Appointment Retrieval.

## 2. Task 13: Appointment Booking API
Endpoint prefix: `/api/appointments`
- `POST /api/appointments` (Requires `patient` role)
  - **Body:** `{ doctorId, date (YYYY-MM-DD), slotTime (HH:mm) }`
  - **Logic:** 
    1. Query `appointments` for `doctorId`, `date`, `slotTime`, `status IN ['pending_payment', 'confirmed']`.
    2. If exists, return 400 "Slot already booked".
    3. Else, insert new document with `patientId` = `req.user.uid`, `status` = `'pending_payment'`.

## 3. Task 14: Mock Payment Webhook
- `POST /api/appointments/:id/pay` (Requires `patient` role)
  - **Body:** `{ paymentMethod (string) }`
  - **Logic:** 
    1. Retrieve appointment. Verify ownership (`patientId == req.user.uid`).
    2. If `status !== 'pending_payment'`, return 400.
    3. Update `status` to `'confirmed'`, append `paymentMethod` and `paidAt`.

## 4. Task 15: Appointment Retrieval
- `GET /api/appointments` (Requires `patient` or `doctor` role)
  - **Logic:**
    1. If `req.user.role === 'patient'`, query `appointments` where `patientId == req.user.uid`.
    2. If `req.user.role === 'doctor'`, query `appointments` where `doctorId == req.user.uid`.
    3. Sort by `date` desc, `slotTime` desc.
