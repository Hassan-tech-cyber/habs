# Architect Design: Task 2 - Users Database Schema & Security

## 1. Overview
This document specifies the data model for the `users` collection in Firestore. Since we are using the `firebase-admin` SDK in our Express backend, Firestore Security Rules (the client-side rules engine) are bypassed. Therefore, our Express backend must strictly validate all payloads before writing to Firestore.

## 2. Schema Definition (users collection)
Every user document uses their Firebase `uid` (or our own generated UUID) as the document ID.

### 2.1 Base User Fields (All Roles)
- `uid` (String): Document ID
- `role` (String): `"patient" | "doctor" | "admin"`
- `name` (String): Full name
- `email` (String): Must be unique across all users.
- `phone` (String): Contact number
- `passwordHash` (String): bcrypt hash (NEVER returned in API responses)
- `createdAt` (Timestamp): ISO 8601 string or Firestore Timestamp

### 2.2 Patient-Specific Fields
- `dob` (String): Date of Birth (YYYY-MM-DD)
- `gender` (String): `"male" | "female" | "other"`

### 2.3 Doctor-Specific Fields
- `departmentId` (String): Reference to a department document
- `specialty` (String): Doctor's specialty
- `consultationFee` (Number): Fee amount in Naira
- `isActive` (Boolean): Defines if the doctor is bookable
- `workingHours` (Object): Map of weekdays to availability
  ```json
  {
    "mon": { "start": "09:00", "end": "17:00", "active": true },
    "tue": { "start": "09:00", "end": "17:00", "active": true }
    // ...
  }
  ```
- `slotDurationMinutes` (Number): Default e.g. 30

## 3. Coder Instructions
1. We don't need to write SQL migration scripts. Instead, create a utility file `backend/src/utils/validation.js` or `backend/src/models/User.js` (even though it's NoSQL) that exports Joi/Yup schema definitions or simple validation functions for `registerPatient`, `createDoctor`, and `createAdmin`.
2. This ensures when we build the auth endpoints in Task 4, we have a strict way to enforce this schema.
3. *Note: Since this task only requests defining the schema and security rules, the actual endpoint implementation will happen in Task 4 and 6.* For this task, just create the validation utility module.

## 4. Impact List
- Dictates the payload shapes for Task 4 (Auth) and Task 6 (Admin creates users).
- Ensures data consistency in Firestore.
