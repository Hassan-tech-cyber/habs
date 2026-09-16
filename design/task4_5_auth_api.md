# Architect Design: Tasks 4 & 5 - Auth API & Role Middleware

## 1. Overview
This module covers Patient self-registration, the unified Login system for all roles, and the server-side role enforcement middlewares.

## 2. API Endpoints

### 2.1 `POST /api/auth/register` (Patient Registration)
- **Access:** Public
- **Request Body:** Must match `patientSchema` (name, email, phone, password, dob, gender).
- **Behavior:**
  - Validates input.
  - Checks if `email` exists in `users` collection. Returns 400 if it does.
  - Hashes `password` using bcrypt.
  - Creates the user in Firestore with `role: 'patient'` and generated `uid`.
  - Generates a 24-hour JWT for immediate login.
- **Response (201):** `{ token, user: { uid, name, email, role } }`

### 2.2 `POST /api/auth/login`
- **Access:** Public
- **Request Body:** `{ email, password }`
- **Behavior:**
  - Finds user by `email`. If not found, returns generic 401.
  - Compares `password` with `passwordHash`. Returns generic 401 if it fails.
  - Generates a JWT containing `{ uid, role }` valid for 24h.
- **Response (200):** `{ token, user: { uid, name, email, role, departmentId? } }`

## 3. Middleware Design
Located in `middlewares/auth.js`.

### 3.1 `verifyToken`
- Extracts Bearer token from `Authorization` header.
- Uses `jsonwebtoken` to verify it against `process.env.JWT_SECRET`.
- Attaches decoded `{ uid, role }` to `req.user`.
- Rejects with 401 if missing or invalid.
- *Security Rule (PRD 4.3.1):* Re-validates the user's role against Firestore to prevent stale tokens from escalating privilege. (To keep DB reads optimized, we'll fetch the user and attach `req.dbUser` if verification succeeds).

### 3.2 `requireRole(roles)`
- A factory middleware taking an array of allowed roles (e.g., `['admin']` or `['patient', 'doctor']`).
- Checks if `req.user.role` is in the array.
- Rejects with 403 Forbidden if not.

## 4. Impact List
- Secures all future endpoints (Departments, Appointments).
- Dictates that the React frontend must store the JWT (e.g., in localStorage) and attach it as a Bearer token to all requests.
