# AGENTS.md — Archvizon

## 1. Project Overview

**Product Name:** Archvizon  
**Product Type:** Architectural Visualization Client and Production-Management Platform  
**Primary Customers:** Real estate developers and architects.

Archvizon is a web-based platform through which clients can submit architectural and property materials, request professional visualization services, track production, review deliverables, request revisions, approve outputs, and download completed files.

The platform supports three service categories:

1. **Architectural CGI Rendering:** Photorealistic interior and exterior images produced from architectural plans, reference materials, or supported 3D models.
2. **Manual Virtual Staging:** Professionally furnished and decorated versions of photographs or visual scenes.
3. **Virtual Walkthroughs:** Supported walkthrough videos, 360-degree scenes, hosted tours, or browser-viewable 3D experiences.

### Product Boundary

Archvizon manages the customer, project, file, team-assignment, review, and delivery workflows.

Professional artists create visual outputs using external production software such as Blender, D5 Render, Unreal Engine, or other tools selected by the visualization team.

The platform is not a custom photorealistic rendering engine or a full CAD/BIM authoring application.

### Core Product Goals

- Provide one organized workspace for clients and the visualization team.
- Keep project requirements, source files, feedback, and deliverables traceable.
- Reduce scattered communication and unclear revision history.
- Give clients visibility into project status and pending actions.
- Provide a professional review, approval, and download experience.

---

## 2. Mandatory Technology Stack

All development must follow the team's standardized technology stack.

### Frontend

- Next.js
- React
- JavaScript unless TypeScript is explicitly approved.
- Tailwind CSS where appropriate.
- Reusable and accessible UI components.

### Backend

- Node.js
- Express.js
- RESTful APIs.
- Modular backend architecture.

### Database

- MongoDB.
- Mongoose for schema definition and database access.

### Supporting Technologies

Use additional technologies only when required by actual product needs.

- JWT-based authentication.
- Secure password hashing.
- Socket.IO for real-time updates when justified.
- Cloudinary for suitable image assets.
- S3-compatible object storage for large or private files.
- Three.js, React Three Fiber, or WebGL for specifically validated browser-viewable 3D formats.

These are optional supporting technologies, not a requirement to integrate everything in the first release.

### Architecture Boundary

Next.js is responsible for the frontend application.

Node.js and Express.js are responsible for backend APIs and server-side business logic.

**Do not replace the Express backend with Next.js API routes.**

Do not replace MongoDB with another database or introduce another frontend/backend framework unless an exception is explicitly approved.

---

## 3. General Engineering Principles

All code must be:

- Readable and maintainable.
- Properly organized.
- Consistently formatted.
- Reusable where appropriate.
- Secure by default.
- Validated at system boundaries.
- Testable and documented where necessary.

Follow these principles:

1. Inspect the existing repository before changing it.
2. Follow established project conventions unless they conflict with this document.
3. Keep business logic out of route handlers and presentation components.
4. Avoid unnecessary abstractions, dependencies, and infrastructure.
5. Maintain separation between frontend and backend responsibilities.
6. Preserve existing functionality when implementing new features.
7. Do not silently change API contracts or database structures.
8. Handle loading, empty, success, and failure states.
9. Do not use mock data as a substitute for real implementation unless explicitly requested.
10. Do not claim that code or tests work unless they have actually been executed and verified.

---

## 4. Recommended Repository Structure

Maintain a clear separation between frontend and backend.

```text
archvizon/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── features/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── services/
│   │   ├── contexts/
│   │   ├── utils/
│   │   └── styles/
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── validators/
│   │   ├── integrations/
│   │   ├── jobs/
│   │   ├── constants/
│   │   ├── utils/
│   │   └── app.js
│   ├── server.js
│   ├── package.json
│   └── ...
│
├── docs/
├── .gitignore
├── README.md
└── AGENTS.md
```

This is a recommended structure, not permission to reorganize an existing repository automatically.

Inspect the current structure first and preserve established conventions whenever practical.

---

## 5. User Roles and Permissions

The platform initially defines four roles.

### CLIENT

A real estate developer, architect, or client representative.

Permissions:

- Register, sign in, and manage their profile.
- Create and view their own projects.
- Select visualization services and submit project briefs.
- Upload source files and references.
- View project status and relevant activity.
- Comment on deliverables.
- Request revisions.
- Approve deliverables.
- Download authorized final outputs.

### VISUALIZATION_ARTIST

Permissions:

- View projects assigned to them.
- Access permitted source files and references.
- Update permitted production tasks and statuses.
- Upload previews and deliverables.
- Respond to feedback and revision requests.

### PROJECT_MANAGER

Permissions:

- Review submitted briefs.
- Request missing information or clarification.
- Assign and reassign project team members.
- Coordinate production and client reviews.
- Update project statuses within permitted transitions.
- Monitor deadlines, revisions, and pending approvals.

### ADMIN

Permissions:

- Manage user accounts and roles.
- Access and filter all projects.
- Manage service categories and supported file types.
- Audit important platform activity.
- Administer platform settings.

### Authorization Rules

- Enforce permissions on the backend for every protected operation.
- Never rely only on frontend route guards or hidden UI controls.
- A client must not access another client's projects or files.
- Artists must not access projects unless assigned or otherwise explicitly authorized.
- Project managers must operate within their permitted administrative scope.
- Administrative access must be restricted to authorized administrator accounts.
- Verify both the user's role and their relationship to the requested resource.

Organization-level multi-user access is not assumed to be mandatory for the first MVP. Do not build complex organization membership workflows unless confirmed by the project owner.

---

## 6. Frontend Development Guidelines

### Next.js

- Use Next.js as the frontend framework.
- Follow the router convention already established in the repository.
- Prefer the App Router for a new Next.js application unless otherwise specified.
- Do not mix App Router and Pages Router patterns unnecessarily.
- Use Server Components by default with the App Router.
- Use Client Components only where browser interaction, client state, or browser-only APIs require them.
- Implement appropriate loading, error, and not-found states.
- Keep page components focused.
- Move reusable UI into appropriate component and feature modules.

### UI and UX

Archvizon must have a professional interface appropriate for architectural and real-estate clients.

The interface must:

- Work across desktop, tablet, and mobile browser sizes.
- Use consistent typography, spacing, colors, and interaction patterns.
- Provide clear navigation for client, artist, project-manager, and administrator workflows.
- Use accessible labels, keyboard navigation, and readable contrast.
- Clearly communicate project status and pending actions.
- Provide useful empty, loading, success, and error states.
- Avoid unnecessary visual complexity.

### Suggested Reusable Components

Create components according to actual feature requirements.

Examples:

- ProjectCard
- ProjectStatusBadge
- ProjectDashboard
- ServiceSelection
- ProjectBriefForm
- AssetUploader
- AssetList
- RenderGallery
- DeliverableVersionList
- RevisionTimeline
- FeedbackComment
- ApprovalPanel
- BeforeAfterComparison
- WalkthroughPlayer
- ThreeDViewer
- TeamAssignmentPanel
- NotificationList

Avoid creating components that duplicate existing functionality.

### Frontend State Management

- Use local React state for local interactions.
- Use shared state only when multiple parts of the application need it.
- Keep API calls in a consistent service/data-access layer.
- Handle loading, empty, and error states for important requests.
- Never store backend secrets in frontend code.
- Do not treat client-side state as authoritative for permissions or project status.

---

## 7. Backend Development Guidelines

Use Express.js for backend APIs and business logic.

### Recommended Request Flow

```text
HTTP Request
    |
    v
Express Route
    |
    v
Authentication Middleware
    |
    v
Authorization Middleware
    |
    v
Request Validation
    |
    v
Controller
    |
    v
Service Layer
    |
    v
Mongoose Model
    |
    v
MongoDB
```

### Routes

- Define API endpoints.
- Apply authentication, authorization, and validation middleware.
- Delegate request handling to controllers.
- Do not contain business workflows.

### Controllers

- Read validated request data.
- Call the relevant service.
- Return consistent HTTP responses.
- Do not contain complex business logic.

### Services

- Implement business rules and workflows.
- Coordinate database operations.
- Enforce valid state transitions.
- Coordinate file-storage and notification integrations.
- Keep service functions focused and testable.

### Models

- Define Mongoose schemas and indexes.
- Define schema-level validation where appropriate.
- Represent domain entities and their relationships.
- Avoid placing unrelated business workflows in model files.

### Middleware

Use middleware for:

- Authentication.
- Authorization.
- Request validation.
- Centralized error handling.
- Request logging.
- Rate limiting where appropriate.

---

## 8. Core Product Modules

Implement the platform according to the approved product requirements.

### 8.1 Authentication and Account Management

- User registration and login.
- Secure password hashing.
- Password reset.
- JWT-based authentication with protected backend routes.
- Role-based access control.
- Profile management.
- Account status controls.
- Appropriate token invalidation and sign-out strategy.

### 8.2 Client Dashboard

Display:

- Active projects.
- Completed projects.
- Projects awaiting client action.
- Project status and latest activity.
- Pending clarification, review, or approval actions.
- Recent deliverables and notifications.
- Links to project details and permitted files.

### 8.3 Project and Service Request Management

A project may include:

- Project name and description.
- Property type.
- Optional location.
- Deadline.
- Project references.
- One or more requested services.
- Service-specific requirements.
- Desired output specifications.
- Style references.
- Camera views.
- Additional notes.

Clients must be able to save a draft before submitting it.

Project managers must be able to request missing information before accepting a brief.

### 8.4 Architectural CGI Rendering

Capture relevant requirements, including:

- Architectural drawings and reference images.
- Supported 3D source files.
- Interior, exterior, aerial, day, night, or other agreed views.
- Materials and finishes.
- Lighting preferences.
- Camera angles.
- Output resolution.
- Production status.

Artists must be able to upload previews and approved high-resolution outputs.

Actual rendering takes place outside the web application.

### 8.5 Manual Virtual Staging

Support:

- Uploading photographs or supported source materials.
- Room type.
- Preferred design style.
- Furniture requirements.
- Color palette.
- Reference images.
- Assignment to a visualization artist.
- Uploading staged versions.
- Retaining the original source image.
- Before-and-after comparison in the review interface.

Virtual staging is a human-led production workflow.

### 8.6 Virtual Walkthroughs

Support:

- Walkthrough requests and reference materials.
- Supported 3D source files or scene files.
- Expected output type: video, 360-degree/panorama tour, or interactive 3D experience.
- Uploading walkthrough videos.
- Providing supported hosted walkthrough links.
- In-platform playback or viewing when the output format allows it.

Treat interactive 3D viewing as format-dependent. Validate formats and technical requirements before advertising support.

### 8.7 File and Asset Management

- Associate every asset with the correct project and, where applicable, service request.
- Record uploader, upload date, original filename, file type, file size, category, version, and visibility.
- Use private storage and controlled download access.
- Validate extension, MIME type, and file size.
- Use configurable upload limits.
- Support an appropriate large-file upload strategy.
- Store file metadata and storage keys in MongoDB.
- Store file binaries in approved object storage.
- Do not expose permanent public URLs for private source files.

### 8.8 Deliverables, Review, Revisions, and Approval

- Artists can upload previews and final deliverables.
- Deliverables may include images, videos, and specifically supported 3D assets.
- Clients and authorized staff can review deliverables.
- Comments must be associated with the relevant project and, when applicable, a deliverable.
- Revision requests must identify the affected deliverable version and describe the requested change.
- Preserve prior versions; never silently overwrite a submitted or approved deliverable.
- Artists or project managers can respond to revision requests.
- Clients can approve the relevant deliverable.
- Record who approved the deliverable and when.
- Make approved final files available through secure downloads.

### 8.9 Notifications and Activity History

Create in-app notifications for:

- Project submission.
- Assignment or reassignment.
- Project status changes.
- Clarification requests.
- New deliverables.
- Revision requests and responses.
- Approval requests and approvals.

Maintain activity history for important project events.

Email notifications may be added when the delivery environment and account configuration support them.

### 8.10 Administration

Administrators and authorized project managers need appropriate views to:

- Manage client and staff accounts and roles.
- View and filter projects.
- Review submitted briefs.
- Request clarification.
- Assign or reassign project managers and visualization artists.
- Monitor status, deadlines, revisions, and pending approvals.
- Manage service categories and supported file types.

---

## 9. Project Status Lifecycle

The backend must validate all project status transitions.

Use these statuses unless an approved requirements change specifies otherwise:

| Status | Meaning |
|---|---|
| DRAFT | Client has started a project but has not submitted it. |
| SUBMITTED | Client has submitted the request for review. |
| UNDER_REVIEW | Project manager is checking the brief and files. |
| AWAITING_INFORMATION | Client must provide clarification or missing materials. |
| ASSIGNED | Project has an owner or production team. |
| IN_PROGRESS | Production work is underway. |
| INTERNAL_REVIEW | Team is checking the output before client review. |
| CLIENT_REVIEW | Deliverable is waiting for client feedback. |
| REVISION_REQUESTED | Client has requested changes. |
| APPROVED | Client has approved the required output. |
| COMPLETED | All required deliverables are approved and delivered. |
| CANCELLED | Project has been cancelled by an authorized user. |

### Status Rules

- Define allowed transitions centrally.
- Validate the current status and requested next status on the backend.
- Verify that the requesting user is authorized to perform the transition.
- Record status changes in activity history.
- Do not allow arbitrary status updates from the frontend.
- Do not mark a project complete while required deliverables remain unapproved or undelivered.

---

## 10. MongoDB Data Modeling Guidelines

Use MongoDB with Mongoose.

The initial domain collections are:

| Collection | Purpose / example fields |
|---|---|
| users | name, email, passwordHash, role, organizationId, accountStatus, createdAt |
| organizations | name, organizationType, contactDetails, memberIds; only if multi-user organizations are required |
| projects | projectCode, name, description, propertyType, location, clientId/organizationId, status, deadline, createdAt |
| serviceRequests | projectId, serviceType, requirements, stylePreferences, outputSpecifications, status |
| assets | projectId, serviceRequestId, uploadedBy, storageKey, originalName, MIME type, size, category, version, visibility |
| assignments | projectId, serviceRequestId, assignedTo, assignedBy, roleOnProject, assignedAt |
| deliverables | projectId, serviceRequestId, assetId, deliverableType, version, notes, uploadedBy, reviewStatus |
| revisionRequests | deliverableId, requestedBy, description, status, response, createdAt |
| comments | projectId, optional deliverableId, authorId, message, createdAt |
| notifications | recipientId, type, message, relatedProjectId, readAt, createdAt |
| activityLogs | actorId, projectId, action, entityType, entityId, timestamp, metadata |

These are initial modeling references, not a command to create every collection before its need is established.

### Data Integrity Rules

- Every project must have an owning client or organization.
- Every service request must belong to a project.
- Every deliverable must belong to the relevant project and, where applicable, service request.
- Every revision request must reference a specific deliverable version.
- Only authorized users may access project files and perform status transitions.
- Every approval must record the approving user and timestamp.
- Use references for entities requiring independent querying, access, or lifecycle management.
- Avoid duplicating large file binaries in MongoDB.
- Add indexes for common queries such as project owner, status, assignee, and creation date.
- Use pagination for large result sets.
- Use database transactions when a multi-document operation must succeed or fail as a unit and the MongoDB deployment supports transactions.

---

## 11. API Development Standards

Use a versioned REST API prefix:

```text
/api/v1
```

Suggested endpoint groups:

```text
/api/v1/auth
/api/v1/users
/api/v1/organizations
/api/v1/projects
/api/v1/projects/:projectId/members
/api/v1/projects/:projectId/service-requests
/api/v1/projects/:projectId/assets
/api/v1/projects/:projectId/assignments
/api/v1/projects/:projectId/deliverables
/api/v1/deliverables/:deliverableId/versions
/api/v1/revisions
/api/v1/comments
/api/v1/approvals
/api/v1/notifications
/api/v1/activity
/api/v1/admin
```

These endpoint groups are illustrative. Inspect existing routes and approved feature requirements before adding or renaming endpoints.

### Success Response

```json
{
  "success": true,
  "message": "Project created successfully",
  "data": {}
}
```

### Error Response

```json
{
  "success": false,
  "message": "Invalid project details",
  "errors": []
}
```

Use appropriate HTTP status codes:

- 200 — Successful request.
- 201 — Resource created.
- 400 — Invalid request.
- 401 — Unauthenticated.
- 403 — Authenticated but not authorized.
- 404 — Resource not found.
- 409 — Resource conflict.
- 422 — Validation failure, where appropriate.
- 500 — Unexpected server error.

Never expose stack traces, secrets, tokens, or sensitive internal details in production responses.

---

## 12. Security Requirements

Security must be enforced on the backend.

- Hash passwords with a modern password-hashing algorithm.
- Protect private APIs with authentication.
- Enforce role-based and resource-level authorization.
- Validate request bodies, query parameters, and route parameters.
- Validate MongoDB ObjectId values before querying.
- Validate file extension, MIME type, size, and storage policy.
- Use secure, expiring links or authenticated download endpoints.
- Do not expose permanent public URLs for private source files.
- Keep credentials and secrets in environment variables or a secrets manager.
- Configure CORS for approved frontend origins.
- Use rate limiting for sensitive endpoints.
- Protect against injection, broken access control, CSRF where applicable, and unsafe file uploads.
- Do not log passwords, authentication tokens, private file contents, or secrets.
- Do not trust client-submitted role, owner, uploader, or approval identity fields.
- Derive sensitive identity fields from authenticated server-side user context.

---

## 13. File Storage and Large Assets

File storage must be separated from business logic.

- Use an approved storage provider.
- Store object keys and metadata in MongoDB.
- Keep private source files and deliverables private by default.
- Generate authorized, time-limited access for downloads and previews.
- Validate uploads before accepting them.
- Configure file-size limits based on actual production requirements.
- Avoid loading full-resolution images, videos, or 3D files in ordinary dashboard API responses.
- Use thumbnails and optimized previews where practical.
- Handle large uploads and downloads without blocking normal API requests.
- Make upload operations retry-safe where practical.
- Record upload failures and provide useful user-facing errors.

Confirm accepted file formats, maximum file sizes, storage provider, and retention policy with the project owner.

Do not promise universal CAD/BIM or 3D format compatibility.

---

## 14. Walkthrough and 3D Viewing Boundaries

- Support walkthrough videos and hosted-tour links where approved.
- Use in-platform playback only for supported video formats.
- Treat interactive 3D viewing as conditional on technical validation.
- Confirm supported model formats, conversion requirements, hosting, browser compatibility, and device performance before implementation.
- Use Three.js, React Three Fiber, or WebGL only when a validated viewer requirement exists.
- Do not promise that every CAD, BIM, or 3D format can be displayed in a browser.
- Document unsupported formats and limitations clearly.

---

## 15. Performance, Reliability, and Accessibility

### Performance and Reliability

- Paginate project lists, activity feeds, comments, and deliverable lists.
- Add indexes for frequent query patterns.
- Avoid retrieving large assets in dashboard API responses.
- Use optimized previews and thumbnails.
- Handle large uploads and downloads without blocking normal API requests.
- Provide clear errors and retry-safe upload behavior.
- Log operational errors without recording credentials or private file contents.
- Keep external storage operations separate from core project business logic.

### Compatibility and Accessibility

- Support current desktop versions of Chrome, Edge, Firefox, and Safari.
- Make core client and staff workflows usable on mobile browsers.
- Use accessible labels and keyboard navigation.
- Maintain readable contrast.
- Treat advanced 3D viewing as a capability that may require more powerful devices and browsers.

---

## 16. Testing Requirements

Write tests for critical business rules and user workflows.

### Backend Testing

Use suitable tools such as Jest or Vitest, Supertest, and an isolated test database.

Test at least:

- Registration, login, and protected routes.
- Role-based access and project ownership.
- Project creation, editing, and submission.
- Service request validation.
- Project review and clarification.
- Assignment and reassignment permissions.
- Valid and invalid status transitions.
- File access and upload restrictions.
- Deliverable uploads and version history.
- Revision requests and responses.
- Approval identity and timestamps.
- Secure download authorization.
- Notifications and activity history.
- Error handling and invalid identifiers.

### Frontend Testing

Test important:

- Forms and validation.
- Reusable components.
- Navigation and role-specific views.
- API integration.
- Loading, empty, and error states.
- Project submission and review flows.
- Deliverable review, revision, and approval interactions.

Do not mark a feature complete solely because its page renders. Verify the underlying workflow and permission boundaries.

---

## 17. Environment Variables and Secrets

Maintain `.env.example` files with variable names but no real credentials.

Example backend configuration:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=
JWT_SECRET=
CLIENT_URL=
STORAGE_PROVIDER=
STORAGE_ACCESS_KEY=
STORAGE_SECRET_KEY=
```

Rules:

- Never commit actual `.env` files.
- Never hardcode credentials or API keys.
- Never expose backend secrets through frontend environment variables.
- Validate required environment variables during application startup.
- Document configuration requirements in the README.

---

## 18. Git and GitHub Guidelines

Use Git and GitHub for version control and collaboration.

Suggested branches:

```text
main
develop
feature/authentication
feature/project-management
feature/file-management
feature/deliverables
feature/revision-workflow
feature/walkthrough-viewer
fix/secure-file-access
refactor/project-service
```

Use descriptive commit messages:

```text
feat: implement project creation API
feat: add service request forms
feat: add deliverable version management
fix: prevent unauthorized project access
fix: validate project status transitions
refactor: separate project business logic
test: cover approval workflow permissions
docs: update API documentation
```

Do not commit:

- `.env` files or credentials.
- `node_modules`.
- Build artifacts.
- Temporary files.
- Local uploads or private customer assets.
- Unnecessary generated files.

---

## 19. Required Workflow for Coding Agents

Every coding agent must follow this workflow.

### Before Implementation

1. Read this AGENTS.md.
2. Inspect the repository structure.
3. Read the README and relevant project documentation.
4. Inspect the existing implementation of the affected feature.
5. Identify related frontend pages, backend routes, services, models, and middleware.
6. Review relevant tests.
7. Understand the current API and data contracts.
8. Identify authorization, validation, and failure cases.

Do not begin by generating a new architecture or replacing existing files without inspecting the repository.

### Planning

Before a substantial feature:

1. Summarize the requirement.
2. Identify the affected modules.
3. Identify required database changes.
4. Define or confirm the API contract.
5. Identify role and resource permissions.
6. Identify validation and error cases.
7. Break work into small implementation steps.

For small, clearly scoped fixes, keep planning proportionate.

### During Implementation

- Modify only files relevant to the task.
- Reuse existing components, services, middleware, and utilities.
- Preserve current functionality.
- Keep frontend and backend responsibilities separate.
- Follow the mandatory technology stack.
- Avoid unnecessary dependencies.
- Do not bypass authentication, authorization, or validation to make a workflow pass.
- Do not silently change existing API contracts or persisted data structures.
- Do not overwrite historical deliverables.
- Do not implement out-of-scope product capabilities.

### After Implementation

1. Run relevant frontend checks.
2. Run relevant backend checks.
3. Run tests related to the changed behavior.
4. Verify important API responses.
5. Verify role and resource access restrictions.
6. Check for regressions in related workflows.
7. Update documentation when required.
8. Report files changed, behavior implemented, checks executed, and remaining limitations.

Clearly distinguish what is implemented, tested, partially implemented, blocked, or not implemented.

---

## 20. Architectural Change Approval

If a technical difficulty appears to require a major architectural change:

1. Explain the problem.
2. Explain why the current approach is insufficient.
3. Present the proposed change.
4. Describe reasonable alternatives.
5. Explain trade-offs and risks.
6. Identify affected modules, APIs, data, and dependencies.
7. Discuss the proposal with the team or project owner.
8. Wait for approval before making the major change.

Do not change the mandatory technology stack without explicit approval.

---

## 21. Out-of-Scope Boundaries

Do not implement the following unless the project owner formally changes the requirements:

- A custom photorealistic CGI rendering engine.
- Full CAD/BIM editing or authoring in the browser.
- Guaranteed import or conversion of every 2D/3D design format.
- Real-time multi-user editing of 3D scenes.
- Automatic model reconstruction from ordinary photographs.
- Online payments, subscriptions, or invoicing automation before business rules are confirmed.
- Native mobile applications; the initial product is a responsive web application.
- Browser-based production rendering that attempts to replace the visualization team's external production tools.

The platform coordinates professional production work; it does not replace the artists' production software.

---

## 22. MVP Development Priorities

Build and validate the platform in phases.

### Phase 1 — Foundation

- Repository and environment setup.
- Next.js frontend.
- Express backend.
- MongoDB connection and Mongoose models.
- Authentication.
- Role-based access control.

**Exit criteria:** Users can sign in and access role-appropriate areas.

### Phase 2 — Project Intake

- Client dashboard.
- Project creation.
- Service selection.
- Service-specific brief forms.
- File uploads.
- Draft and submission workflow.

**Exit criteria:** A client can submit a complete project with source files and requirements.

### Phase 3 — Team Operations

- Project-manager views.
- Brief review.
- Clarification requests.
- Team assignment.
- Status tracking.

**Exit criteria:** Staff can review, assign, and track submitted projects.

### Phase 4 — Production and Delivery

- Artist workspace.
- Preview and final uploads.
- Deliverable versions.
- Secure preview and download.

**Exit criteria:** Assigned staff can upload outputs and clients can access authorized deliverables.

### Phase 5 — Review and Revisions

- Comments.
- Revision requests.
- Approval actions.
- In-app notifications.
- Activity history.

**Exit criteria:** A project can complete a full review, revision, approval, and delivery cycle.

### Phase 6 — Walkthrough Presentation

- Video playback and/or supported hosted-tour links.
- Evaluate a browser 3D viewer for selected, validated formats.

**Exit criteria:** Clients can open supported walkthrough deliverables, and format limitations are documented.

### MVP Must-Have Features

- Authentication and authorization.
- Project creation and service requests.
- File upload.
- Project assignment.
- Status tracking.
- Deliverable upload and version history.
- Revisions.
- Approval.
- Secure download.

### Defer Until Validated

- Advanced interactive 3D viewer.
- Complex team collaboration.
- Payments and subscriptions.
- Detailed analytics.

---

## 23. Definition of Done

A feature is complete only when:

- The approved requirement is implemented.
- Frontend integration works.
- Backend APIs behave correctly.
- Database relationships and constraints are respected.
- Authentication and authorization are enforced.
- Input validation is implemented.
- Error and edge cases are handled.
- Relevant tests have been run successfully.
- Existing functionality has not been broken.
- Documentation is updated where necessary.
- Known limitations are clearly reported.

---

## 24. Final Project Principle

Build Archvizon as a dependable architectural visualization service-management platform for real estate developers, architects, clients, project managers, and visualization artists.

Prioritize:

1. Correct project and service-request workflows.
2. Secure authentication and resource-level authorization.
3. Reliable file and asset management.
4. Clear team assignment and production tracking.
5. Deliverable versioning and traceable feedback.
6. Reliable revision, approval, and secure delivery.
7. Responsive and accessible user experience.
8. Maintainable architecture using the mandatory team stack.

**Build only what the approved product requirements call for. Prefer reliable, understandable solutions over unnecessary complexity.**