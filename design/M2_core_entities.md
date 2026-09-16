# Architect Design: Milestone 2 - Core Entities

## 1. Overview
This document specifies the APIs for Department management, Doctor management, Working Hours configuration, and the dynamic Slot Generation logic.

## 2. Task 9: Department Management API
Endpoint prefix: `/api/admin/departments` (requires `admin` role)
- `GET /api/departments` (Public): Returns all departments `{ id, name, description }`.
- `POST /api/admin/departments`: Creates a department `{ name, description }`.
- `PUT /api/admin/departments/:id`: Updates `{ name, description }`.
- `DELETE /api/admin/departments/:id`:
  - **Constraint:** Must query `users` collection where `departmentId == id`. If any docs exist (active or inactive), reject with 400 "Cannot delete department with assigned doctors."

## 3. Task 10: Doctor Management Additions
Endpoint prefix: `/api/admin/users/doctor` (requires `admin` role)
- `PUT /api/admin/users/doctor/:uid`:
  - Updates `{ departmentId, specialty, consultationFee, isActive }`.
- `GET /api/doctors` (Public):
  - Returns list of doctors. 
  - **Constraint:** If the requester is an admin, return all doctors. If requester is a patient, return ONLY doctors where `isActive == true`.
  - Can optionally filter by `departmentId` via query string.

## 4. Task 11: Doctor Working Hours Config API
Endpoint prefix: `/api/doctors/working-hours` (requires `doctor` role)
- `PUT /api/doctors/working-hours`:
  - **Body:** `{ workingHours: { mon: {start, end, active}, ... }, slotDurationMinutes: 30 }`
  - Updates the doctor's own profile. 
  - Validation: Ensure start < end times, valid HH:mm format.

## 5. Task 12: Slot Generation Logic
Endpoint prefix: `/api/doctors/:uid/slots` (Public / Patient)
- `GET /api/doctors/:uid/slots?date=YYYY-MM-DD`:
  - **Flow:**
    1. Fetch doctor by `:uid`. If `!isActive`, return empty or error.
    2. Get the day of the week from `date` (e.g., 'mon').
    3. Check `doctor.workingHours[day]`. If `!active`, return `[]`.
    4. Generate potential slots based on `start`, `end`, and `slotDurationMinutes`.
       - Example: start '09:00', end '11:00', 30 min -> `['09:00', '09:30', '10:00', '10:30']`.
    5. Query `appointments` collection: `doctorId == uid`, `date == date`, `status IN ['pending_payment', 'confirmed']`.
    6. Filter out generated slots that match the `slotTime` of any fetched appointment.
    7. Return the available slots: `['09:00', '10:00']`.

## 6. Frontend Impact (Coder Instructions)
- Apply the "Medical Blue and White" theme in `index.css`.
- Update the React Dashboard layouts to use these colors as primary/secondary.
