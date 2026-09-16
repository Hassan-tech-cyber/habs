# Architect Design: Task 1 - Project Setup & Scaffolding

## 1. Overview
This document specifies the scaffolding and initial configuration for the HABS project (Task 1). The project consists of a React frontend and a Node.js/Express backend, with Firebase Firestore as the database.

## 2. Directory Structure
The workspace will be split into two main directories:
- `/frontend` - React SPA (Vite + React + JavaScript/TypeScript)
- `/backend` - Node.js + Express API

## 3. Backend Setup (Node.js/Express)
### 3.1 Dependencies
- Core: `express`, `cors`, `dotenv`
- Auth/Security: `bcrypt`, `jsonwebtoken`
- Firebase: `firebase-admin`
- Email: `nodemailer`

### 3.2 File Structure
```
/backend
├── /src
│   ├── /config       # Firebase initialization, env variables
│   ├── /controllers  # Route logic
│   ├── /middlewares  # Auth & Role validation
│   ├── /routes       # Express router definitions
│   └── index.js      # App entry point
├── .env              # Secrets (not committed)
├── package.json
```

### 3.3 Database Connection (Firebase Admin)
- Use `firebase-admin` for server-side Firestore access.
- The credentials will be loaded via a service account JSON file (or env vars) inside `/src/config/firebase.js`.
- Export the initialized `db` (Firestore instance) as a singleton for use across controllers.

## 4. Frontend Setup (React)
### 4.1 Dependencies
- Core: `react`, `react-dom`, `react-router-dom`
- Styling: Vanilla CSS (as per guidelines) or Tailwind (if needed, but sticking to basic CSS for now unless specified).

### 4.2 File Structure
```
/frontend
├── /src
│   ├── /components   # Reusable UI parts
│   ├── /pages        # Page views (Login, Dashboards)
│   ├── /contexts     # AuthContext (React Context for JWT state)
│   ├── /services     # API call wrappers (Axios/fetch)
│   ├── App.jsx       # Main router setup
│   └── main.jsx      # Entry point
├── .env              # Frontend env vars (API URL)
├── package.json
```

## 5. Coder Instructions
1. Run `npm init -y` in `/backend`. Install the specified backend dependencies.
2. Setup the basic Express server in `backend/src/index.js` listening on port 5000.
3. Run `npm create vite@latest frontend -- --template react` in the root.
4. Clean up Vite's default styling to prepare for our custom UI.
5. Create the `.env.example` files in both directories.
6. **Important**: Do not implement any auth logic yet, just set up the folders and ensure the dev servers run without errors.

## 6. Impact List
- Sets the foundation for all future API and UI modules.
- Establishes the port conventions (Backend: 5000, Frontend: Vite default 5173).
