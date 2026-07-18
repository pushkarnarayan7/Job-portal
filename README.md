# TalentHub — Job Portal

Full-stack job portal with a TypeScript Express + MongoDB backend and a production-quality React frontend.

## Stack

| Layer | Technology |
|---|---|
| Backend | Express 5, TypeScript, Mongoose, JWT, CORS, dotenv |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, React Router, Axios, React Hook Form, Zod, Framer Motion, Lucide, React Hot Toast |
| Database | MongoDB |

## Backend API (existing)

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register (demo — does not persist users) |
| `POST` | `/api/auth/login` | Public | Login → JWT + role |
| `GET` | `/api/auth/me` | Bearer JWT | Current user `{ id, role }` |
| `GET` | `/api/jobs` | Public | List jobs (`search`, `company`, `page`, `limit`) |
| `GET` | `/api/jobs/:id` | Public | Job detail |
| `POST` | `/api/jobs` | Recruiter JWT | Create job |
| `PUT` | `/api/jobs/:id` | Recruiter JWT | Update job |
| `DELETE` | `/api/jobs/:id` | Recruiter JWT | Delete job |

### Demo auth behavior

- Login with `recruiter@jobportal.com` → role `recruiter`
- Login with any other email → role `student`
- Password only needs to be non-empty (validated ≥ 6 chars on the frontend)

### Missing backend APIs (frontend uses localStorage for these)

The UI is complete for these features, but there is **no backend endpoint** yet:

- Password reset / forgot password
- Persistent user profiles (name, headline, skills, etc.)
- Resume file upload
- Job applications / applicants list
- Bookmarks / saved jobs
- Notifications
- Company profiles
- Job analytics (views, applicant counts)
- Extra job fields: salary, location, employment type, benefits, skills

When those endpoints are added, swap the helpers in `frontend/src/lib/storage.ts` for real API calls.

## Run locally

### Prerequisites

- Node.js 20+
- MongoDB (local or Docker)

Start MongoDB with Docker if needed:

```bash
docker run -d --name job-portal-mongo -p 27017:27017 mongo:7
```

### Backend

```bash
cd backend
cp .env.example .env   # already created if you followed earlier steps
npm install
npm run build
npm start              # http://localhost:5000
```

### Frontend

```bash
cd frontend
cp .env.example .env   # VITE_API_BASE_URL=/api (proxied by Vite)
npm install
npm run dev            # http://localhost:5173
```

Vite proxies `/api` → `http://localhost:5000`, so no CORS issues in development.

## Frontend routes

| Path | Access |
|---|---|
| `/` | Public landing page |
| `/jobs`, `/jobs/:id` | Public job browse / detail |
| `/login`, `/register`, `/forgot-password` | Auth |
| `/dashboard/*` | Student only |
| `/recruiter/*` | Recruiter only |

## Project structure (frontend)

```
frontend/src/
  components/   # UI, layout, auth, jobs
  context/      # AuthContext
  lib/          # utils + localStorage stores for missing APIs
  pages/        # landing, auth, jobs, student, recruiter
  services/     # Axios HTTP layer + auth/jobs services
  types/        # Shared TypeScript contracts
```
