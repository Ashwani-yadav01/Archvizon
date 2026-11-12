# Archvizon — Architectural Visualization Platform

Archvizon is a client and production-management platform for photorealistic architectural CGI rendering, manual virtual staging, and virtual walkthroughs.

## Architecture

- **Frontend:** Next.js (App Router, JavaScript, React, Tailwind CSS)
- **Backend:** Node.js & Express.js REST API (`/api/v1`)
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** Stateless JWT with password hashing (bcrypt) and Role-Based Access Control (RBAC)

---

## Getting Started

### 1. Prerequisites
- Node.js >= 18 (Tested on v24.22.1)
- npm >= 9
- MongoDB instance (Local or MongoDB Atlas)

---

### 2. Backend Setup

```bash
cd backend
npm install
npm run dev
```

The backend server runs on `http://localhost:5000` with the versioned API prefix `http://localhost:5000/api/v1`.

#### Environment Configuration (`backend/.env`)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/archvizon
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

#### Running Backend Tests
```bash
cd backend
npm test
```

---

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend application runs on `http://localhost:3000`.

#### Environment Configuration (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

#### Production Build
```bash
cd frontend
npm run build
npm start
```

---

## User Roles & Permissions

1. **`CLIENT`**: Register, submit briefs, upload source CAD/references, review deliverables, request revisions, approve, and download final assets.
2. **`VISUALIZATION_ARTIST`**: View assigned projects, download source drawings, upload preview and high-resolution render deliverables, and address revisions.
3. **`PROJECT_MANAGER`**: Triage client briefs, request clarifications, assign artists, manage status transitions, and oversee client delivery.
4. **`ADMIN`**: User management, role elevation, platform health auditing, and global configuration.

---

## API Endpoints (v1)

### Public / Auth
- `GET /api/v1/health` — Health check
- `POST /api/v1/auth/register` — Register a client account
- `POST /api/v1/auth/login` — Sign in and issue JWT

### Authenticated
- `GET /api/v1/auth/me` — Current user profile

### Admin / Management
- `GET /api/v1/users` — User directory (Admin & Project Manager)
- `GET /api/v1/users/:id` — User details
- `PATCH /api/v1/users/:id/role` — Update user role (Admin only)
