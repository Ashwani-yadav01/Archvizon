# Archvizon — Comprehensive Project Audit

**Date:** November 2026  
**Auditor:** Senior Full-Stack Software Architect & 3D Graphics Engineer  
**Repository:** `Archvizon`  

---

## 1. Executive Summary

Archvizon was originally implemented as an **agency production management portal** where clients submit design briefs for architectural CGI rendering, virtual staging, and walkthroughs, and external human visualization artists deliver offline-rendered files for review and approval.

Under the new **Master Product Vision (PRD)**, Archvizon is being transformed into a **web-based, interactive 3D Architectural Visualization, Rendering, Interior Design, and Virtual Staging Platform** inspired by Blender’s 3D editing experience. 

This audit evaluates the entire existing codebase, documents all existing components and endpoints, identifies what works and must be retained, isolates irrelevant and missing modules, and defines the refactoring strategy.

---

## 2. Technology Stack Audit

| Component | Target Requirement | Current Implementation | Status | Notes |
|---|---|---|---|---|
| **Frontend Framework** | Next.js (App Router, React) | Next.js 14.2.24 + React 18.3.1 | **Aligned** | App Router in place; builds cleanly (`next build` passes). |
| **Styling** | Tailwind CSS + Accessible UI | Tailwind CSS 3.4.17 + Lucide React | **Aligned** | Consistent dark slate theme, good component baseline. |
| **3D Graphics Engine** | Three.js / React Three Fiber | Three.js `^0.187.0` installed | **Partially Aligned** | Three.js is present and used in `PanoramaViewer.js`. No interactive 3D scene modeling workspace exists yet. R3F v9 requires React 19 (peer mismatch with React 18/Next 14); pure Three.js + React canvas ref provides optimal stability and Blender-grade viewport performance. |
| **Backend Runtime** | Node.js + Express.js | Node.js v24.22.1 + Express 4.21.2 | **Aligned** | Modular architecture, helmet, cors, morgan, express-validator. |
| **Database** | MongoDB + Mongoose | MongoDB 7.0 (Docker) + Mongoose 8.9.5 | **Aligned** | Connection verified on port 27017; seed script present. |
| **Authentication** | JWT + bcryptjs | JWT (`jsonwebtoken` 9.0.2) + `bcryptjs` 2.4.3 | **Aligned** | Working, robust token issuance, middleware, and RBAC. |
| **File Storage** | Multer + Local/Cloud Storage | Multer 2.5.0 + Local Disk Storage | **Aligned** | Working multipart upload abstraction. |
| **Virtual Staging** | Real image processing provider | Placeholder/none | **Missing** | Needs provider abstraction, job queue, and background polling/worker. |
| **Rendering Engine** | Background rendering solution | None | **Missing** | Needs background render queue, camera/light config, and image generator. |

---

## 3. Detailed Component & Module Audit

### 3.1 Backend Codebase Audit

#### Models (`backend/src/models/`):
- `User.js` — **RETAIN & EXTEND**: Well structured. Email, passwordHash, role, organization, phone, accountStatus. Add password reset token support.
- `Project.js` — **RETAIN & REFRACTOR**: Contains projectCode, name, description, propertyType, location, clientId, organizationId, status, deadline. Refactor to associate directly with 3D scenes, staging jobs, and render outputs.
- `Asset.js` — **RETAIN & EXTEND**: Tracks uploaded files, MIME types, sizes, storage paths. Extend to support 3D assets (GLTF, GLB, textures, materials).
- `ServiceRequest.js`, `Assignment.js`, `Deliverable.js`, `RevisionRequest.js`, `Comment.js`, `Notification.js`, `ActivityLog.js`, `Organization.js` — **RETAIN FOR COMPATIBILITY**: These power the existing 68 tests. Preserve routes to avoid regressions while directing primary application workflows toward the interactive 3D platform.
- **MISSING MODELS NEEDED**:
  - `Scene.js`: Stores 3D scene graph, objects (primitives, walls, doors, windows, furniture), transforms (position, rotation, scale), materials, camera settings, lighting settings, and environment properties.
  - `StagingJob.js`: Stores virtual staging requests (original photo, room category, design style, staging preferences, processing status `PENDING`/`PROCESSING`/`COMPLETED`/`FAILED`, progress, output image URL, provider metadata).
  - `RenderJob.js`: Stores architectural render requests (scene reference, camera preset, lighting scenario, resolution 4K/8K, samples, quality, engine, status, output URL, duration).
  - `ArchitecturalAsset.js`: Library catalog of furniture models, architectural components (doors, windows, columns), and PBR materials (wood, marble, concrete, glass, plaster, tiles).

#### Controllers & Services (`backend/src/controllers/`, `backend/src/services/`):
- `authController` / `authService`: Fully functional. Register, login, profile retrieval. Add forgot/reset password.
- `projectController` / `projectService`: Supports CRUD, status transitions, submission. Add duplication, scene associations, and thumbnail generation.
- `assetController` / `storageService`: Supports file uploads and streaming downloads. Extend for 3D model formats (.glb, .gltf, .obj) and render output assets.
- **MISSING CONTROLLERS & SERVICES NEEDED**:
  - `sceneController.js` & `sceneService.js`: CRUD for 3D scene data, object graph persistence, auto-saving.
  - `stagingController.js` & `stagingService.js`: Real image processing provider integration (AI/Diffusion/Inpainting engine abstraction), job status polling, before/after output asset generation.
  - `renderController.js` & `renderService.js`: Architectural rendering orchestration (headless rendering pipeline, camera/lighting baking, high-res frame output).
  - `catalogController.js` & `catalogService.js`: Asset and material library retrieval for the 3D editor.

#### Tests (`backend/tests/`):
- 7 test suites, 68 tests (`auth.test.js`, `phase7and8.test.js`, `productionDelivery.test.js`, `projectIntake.test.js`, `reviewRevisions.test.js`, `teamOperations.test.js`, `walkthroughPresentation.test.js`).
- All 68 tests currently pass. All refactoring will preserve these contracts while adding comprehensive tests for 3D scenes, staging, and rendering.

---

### 3.2 Frontend Codebase Audit

#### Pages (`frontend/src/app/`):
- `/` (`page.js`): Marketing landing page emphasizing the previous agency outsourcing model. **UPDATE**: Refactor messaging and feature showcases to highlight the browser-based 3D modeling workspace, virtual staging, architectural rendering, and virtual walkthroughs.
- `/login` (`login/page.js`): Functional login screen. Add "Forgot Password" modal/action.
- `/register` (`register/page.js`): Functional registration form.
- `/dashboard` (`dashboard/page.js`): Renders role-specific dashboards. **UPDATE**: Transform ClientDashboard into a modern 3D Architectural Project Manager with direct buttons to launch 3D Editor, Virtual Staging, Walkthrough, and Renders.
- `/projects/new` (`projects/new/page.js`): 5-step wizard designed for brief outsourcing. **UPDATE**: Provide intuitive project initialization with direct template selection (Empty 3D Scene, Residential Room, Commercial Suite, Virtual Staging Project) and instant transition into the 3D workspace.
- `/projects/[id]` (`projects/[id]/page.js`): 7-tab portal for briefs, deliverables, and revisions. **UPDATE**: Integrate primary action hub with dedicated entry points to **3D Modeling Editor**, **Virtual Staging Studio**, **Architectural Rendering Studio**, and **3D Walkthrough Viewer**.
- **MISSING PAGES & WORKSPACES NEEDED**:
  - `/projects/[id]/editor` (or embedded full-screen 3D Editor): The core Blender-inspired 3D modeling, architectural layout, and interior design workspace.

#### Components (`frontend/src/components/`):
- `walkthrough/PanoramaViewer.js` — **RETAIN & INTEGRATE**: Clean Three.js 360 viewer.
- `walkthrough/BeforeAfterComparison.js` — **RETAIN & INTEGRATE**: Split-screen draggable slider; ready to be plugged directly into the Virtual Staging module.
- `walkthrough/WalkthroughPlayer.js` — **RETAIN & INTEGRATE**: Clean video player for rendered fly-through animations.
- **MISSING COMPONENTS NEEDED**:
  - `editor/Viewport3D.js`: Interactive Three.js WebGL viewport with OrbitControls, TransformControls (translate/rotate/scale gizmos), grid, axes, raycasting object selection, and shading modes (Wireframe, Solid, Material, Rendered).
  - `editor/TopToolbar.js`: File (Save, Reopen, Export GLTF), Edit (Undo, Redo, Duplicate, Delete), Mode switcher (Model, Architecture, Interior, Walkthrough), Snapping controls, Shading modes.
  - `editor/ModelingToolbar.js`: Left-side vertical toolbar with Select, Move, Rotate, Scale, Add Primitive (Cube, Sphere, Cylinder, Plane), Wall Tool, Floor Tool, Door Tool, Window Tool, Extrude, Bevel.
  - `editor/SceneHierarchy.js`: Outliner tree listing all scene objects, parent-child relationships, visibility toggles, lock toggles, and deletion.
  - `editor/PropertiesPanel.js`: Right-side inspector with numeric transform inputs (Position X/Y/Z, Rotation X/Y/Z, Scale X/Y/Z), dimensions (Width, Height, Depth), material controls (color picker, roughness, metalness, textures), and architectural parameters.
  - `editor/AssetLibraryDrawer.js`: Categorized drawer for Furniture (Sofas, Beds, Tables, Chairs, Lamps), Architectural components (Walls, Doors, Windows, Stairs), and Materials (Wood, Marble, Concrete, Fabric, Glass).
  - `editor/StatusBar.js`: Bottom bar showing object count, vertex/polygon stats, selected object name, and coordinate system.
  - `editor/WalkthroughMode.js`: First-person camera navigation with WASD keyboard movement, pointer lock/mouse look, and room-to-room exploration.
  - `staging/VirtualStagingStudio.js`: Complete upload, room classification, style selector, AI processing trigger, real-time job progress polling, before/after slider comparison, and download.
  - `rendering/RenderStudio.js`: Camera perspectives, lighting scenarios, quality settings (4K/8K), render execution, live progress bar, render history gallery, and high-res downloads.

---

## 4. Irrelevant vs. Preserved Code Analysis

### Items to Retain:
1. All core Express setup, middleware (`auth.js`, `errorHandler.js`, `rbac.js`, `upload.js`, `validate.js`).
2. Authentication system (JWT, password hashing, session tokens, user profiles).
3. Project base metadata schema, asset storage services, and file streaming.
4. Existing tests and API contracts (to prevent breakage).
5. Existing 3D visualization utilities (`PanoramaViewer.js`, `BeforeAfterComparison.js`).
6. Dark-mode UI styling and Tailwind design system.

### Items to Refactor / Modernize:
1. Project Creation & Dashboard: Transition from an outsourcing brief intake flow to an active 3D architectural project creation and management suite.
2. Project Details Page: Elevate from an approval/revision ticket tracker into a central 3D command center providing direct access to the 3D Editor, Virtual Staging Studio, Render Studio, and Walkthrough.
3. Landing Page: Update branding, feature showcases, and interactive capability highlights to reflect the browser 3D editor and AI staging platform.

### Items to Implement from Scratch:
1. 3D Scene Data Model (`Scene.js`) and REST APIs for scene graph persistence.
2. Interactive Three.js 3D Viewport with Blender-inspired editing controls (TransformControls, Raycaster, Gizmos, Snapping, Shading modes).
3. Primitive 3D Object Creation & Mesh Manipulation.
4. Architectural Design Tools (Walls, Floors, Ceilings, Doors, Windows, parametric room layouts).
5. Interior Design & Furniture Library (drag/drop furniture placement, material customization).
6. Virtual Staging Engine (real image processing provider abstraction, job queue, background polling, status handling, result generation).
7. Architectural Rendering Engine (background render job processor, camera/lighting configuration, progress reporting, output storage).
8. First-Person 3D Walkthrough Mode (WASD movement, mouse look, room exploration).
9. GLTF/GLB Scene Export & Project Archiving.

---

## 5. Audit Conclusion

The existing project has a solid architectural core (clean Express structure, MongoDB integration, JWT auth, and tested REST endpoints) but was pointed toward the wrong product type (an administrative outsourcing agency portal). 

By building upon the robust authentication, asset storage, and database foundations, and adding the dedicated 3D scene engine, modeling workspace, virtual staging pipeline, rendering orchestrator, and walkthrough controls, the project will be fully transformed into the intended professional architectural 3D visualization platform.
