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

### Projects & Briefs (Phase 2 — Project Intake)
- `POST /api/v1/projects` — Create project brief (Client/Admin)
- `GET /api/v1/projects` — List projects with pagination & filters
- `GET /api/v1/projects/:id` — Detailed project brief, services, assets, and audit logs
- `PUT /api/v1/projects/:id` — Update project brief details
- `POST /api/v1/projects/:id/submit` — Submit brief for production triage (`DRAFT` &rarr; `SUBMITTED`)
- `DELETE /api/v1/projects/:id` — Delete draft project

### Service Requests (Phase 2)
- `POST /api/v1/projects/:projectId/service-requests` — Add visualization service request
- `GET /api/v1/projects/:projectId/service-requests` — List services requested
- `PUT /api/v1/projects/:projectId/service-requests/:serviceId` — Update service specifications
- `DELETE /api/v1/projects/:projectId/service-requests/:serviceId` — Remove service request

### Assets & Source Materials (Phase 2)
- `POST /api/v1/projects/:projectId/assets` — Upload source CAD files or reference images (multipart)
- `GET /api/v1/projects/:projectId/assets` — List project assets
- `GET /api/v1/assets/:id/download` — Secure authenticated asset download
- `DELETE /api/v1/projects/:projectId/assets/:assetId` — Delete attached asset

### Team Operations & Production Triage (Phase 3)
- `PATCH /api/v1/projects/:id/status` — Validated status transition (`SUBMITTED` &rarr; `UNDER_REVIEW` &rarr; `AWAITING_INFORMATION` / `ASSIGNED` &rarr; `IN_PROGRESS`)
- `POST /api/v1/projects/:id/clarification/respond` — Client response to clarification request
- `GET /api/v1/projects/:projectId/assignments` — List team assignments (Artists & PMs)
- `POST /api/v1/projects/:projectId/assignments` — Assign visualization artist or PM (PM/Admin only)
- `DELETE /api/v1/projects/:projectId/assignments/:assignmentId` — Remove member assignment

### In-App Notifications (Phase 3)
- `GET /api/v1/notifications` — Fetch recipient notifications and unread badge count
- `PATCH /api/v1/notifications/:id/read` — Mark individual notification as read
- `PATCH /api/v1/notifications/read-all` — Mark all notifications as read

### Deliverables & Production Delivery (Phase 4)
- `GET /api/v1/projects/:projectId/deliverables` — List project deliverables (role-scoped, filters internal drafts for clients)
- `POST /api/v1/projects/:projectId/deliverables` — Upload initial deliverable output (v1, multipart)
- `GET /api/v1/deliverables/:id` — Deliverable details and complete iteration version history
- `POST /api/v1/deliverables/:id/versions` — Upload subsequent version iteration (`v2+`, multipart)
- `PATCH /api/v1/deliverables/:id/status` — Release deliverable to client (`READY_FOR_CLIENT`) or update review state
- `GET /api/v1/deliverables/:id/download` — Secure authenticated file download with headers
- `GET /api/v1/deliverables/:id/preview` — Authenticated inline stream for high-resolution images/videos

### Review, Revisions & Comments (Phase 5)
- `POST /api/v1/deliverables/:deliverableId/revisions` — Client submits revision request for deliverable (`READY_FOR_CLIENT` &rarr; `REVISION_REQUESTED`)
- `GET /api/v1/deliverables/:deliverableId/revisions` — List revisions and responses for a deliverable
- `GET /api/v1/projects/:projectId/revisions` — List all project revisions with version associations
- `PATCH /api/v1/revisions/:revisionId/respond` — Artist or PM responds to revision with resolution status (`OPEN` &rarr; `IN_PROGRESS` / `RESOLVED`)
- `POST /api/v1/deliverables/:deliverableId/approve` — Client approves deliverable as accepted final output (`APPROVED`)
- `POST /api/v1/projects/:projectId/complete` — PM or Admin marks project `COMPLETED` (enforces all deliverables are approved)
- `GET /api/v1/projects/:projectId/comments` — Project feedback and discussions (internal notes hidden from client)
- `POST /api/v1/projects/:projectId/comments` — Post feedback message or internal team note
- `DELETE /api/v1/comments/:commentId` — Delete comment (author or Admin)

### Walkthrough Presentation & Visual Viewing (Phase 6)
- **Walkthrough Video Player (`<WalkthroughPlayer />`)**: Custom dark video controls, timecode scrubber, speed selector (`0.5x` to `2x`), volume/mute, camera perspective chapter markers (`cameraViews`), and fullscreen toggle.
- **Hosted Virtual Tour Embed**: Embedded Matterport 3D and Kuula 360 interactive tours in secure WebGL iframe sandboxes with single-click external launch.
- **Equirectangular 360° Spherical Panorama Viewer (`<PanoramaViewer />`)**: Three.js WebGL inverted sphere projection with interactive drag navigation, FOV zoom clamping, and auto-tour rotation.
- **Before & After Staging Comparison (`<BeforeAfterComparison />`)**: Draggable split-screen comparison slider linking raw source photographs with finished manual virtual staging.
- **Format Compatibility & Boundaries Guide (`<FormatLimitationsModal />`)**: Explicitly documents supported browser-native formats (`.mp4`, `.webm`, `.jpg`, `.png`, `.glb`, `.gltf`) versus proprietary production software assets (`.blend`, `.max`, `.d5`, `.rvt`, `.dwg`, `.skp`) as specified in `AGENTS.md` Section 14.

### Production Analytics & Pipeline Intelligence (Phase 7)
- `GET /api/v1/analytics/overview` — Executive KPIs: total projects, active pipeline, approval rate, total revisions, and average turnaround time (days)
- `GET /api/v1/analytics/status-distribution` — Real-time project counts across all 12 lifecycle statuses
- `GET /api/v1/analytics/services` — Service request breakdown across CGI Renders, Virtual Staging, and Walkthroughs
- `GET /api/v1/analytics/velocity` — Artist production throughput (active assignments, deliverables uploaded, revisions resolved)
- `GET /api/v1/analytics/risks` — Deadline risk monitoring: overdue projects, items due within 72 hours, and clarification bottlenecks
- **Analytics Dashboard UI (`<AnalyticsDashboard />`)**: Interactive metrics cards, visual progress meters, and artist workload tables embedded in both Manager and Client dashboards.

### Organization & Multi-User Workspaces (Phase 8)
- `POST /api/v1/organizations` — Register a developer or architectural firm organization workspace
- `GET /api/v1/organizations/me` — Retrieve organization profile, project count, and team members
- `PUT /api/v1/organizations/:id` — Update organization details, phone, and contact email (Owner / Admin)
- `POST /api/v1/organizations/:id/members` — Invite/add a colleague by registered email to the workspace
- `DELETE /api/v1/organizations/:id/members/:userId` — Remove team member from organization workspace
- **Organization Workspace UI (`<OrganizationWorkspace />`)**: Multi-user collaboration suite with team member directory, ownership badges, email invitations, and unified shared access across projects and deliverables.
