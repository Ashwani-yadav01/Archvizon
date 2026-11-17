# Archvizon — Test Plan (TEST_PLAN.md)

## 1. Executive Summary & Quality Strategy

This test plan defines the verification strategy for the transformed **Archvizon** platform — an interactive web-based architectural 3D modelling, interior design, visualization, photorealistic rendering, and virtual staging suite inspired by Blender.

The quality assurance strategy encompasses:
1. **Unit & Data Integrity Testing:** Mongoose models, validation logic, RBAC, state machines, and mathematical 3D transformations.
2. **REST API Integration Testing:** Express endpoints across Auth, Projects, Scenes, Catalog, Virtual Staging, and Rendering pipelines.
3. **Graphics & Viewport Verification:** WebGL canvas rendering, OrbitControls, TransformControls gizmos, Raycasting precision, and GLTF/GLB export.
4. **Asynchronous Background Processing:** Verification of non-blocking worker progression, error propagation, and asset generation.
5. **Security & Access Control:** Strict role-based isolation, project resource ownership checks, and token lifecycle validation.

---

## 2. Test Scope & Module Coverage

| Module | Category | Primary Target | Verification Method |
|---|---|---|---|
| **Module A: Auth & Users** | Backend & Frontend | Registration, JWT auth, bcrypt hashing, profile updates, password reset | Jest unit tests + Next.js auth context verification |
| **Module B: Project Management** | Backend & Frontend | Project creation, duplication, thumbnails, filtering, search, last-modified | API integration tests + UI dashboard tests |
| **Module C: 3D Modelling Engine** | Frontend & WebGL | Three.js scene tree, OrbitControls, TransformControls (W/E/R), raycasting, outliner, numeric properties | `scene.test.js` + Viewport interactive regression |
| **Module D: Architectural Design** | Full-Stack | Parametric walls, floor slabs, doors, windows, columns, dimension customization | `catalog.test.js` + Editor parametric builders |
| **Module E: Interior Design** | Full-Stack | Curated furniture catalog, one-click placement, PBR materials (hardwood, marble, glass) | `catalog.test.js` + `AssetLibraryDrawer` integration |
| **Module F: Virtual Staging** | Full-Stack | Image uploads, room categories, styling parameters, async synthesis worker, Before/After split slider | `stagingAndRendering.test.js` + `VirtualStagingStudio` |
| **Module G: Architectural Rendering** | Full-Stack | Camera viewpoints, photometric lighting, 4K/8K presets, raymarching simulation, render gallery | `stagingAndRendering.test.js` + `RenderStudio` |
| **Module H: Virtual Walkthrough** | Frontend | WASD movement, mouse look PointerLock, 1.7m eye-level constraint, fullscreen HUD | `WalkthroughMode.js` component validation |
| **Module I: Asset Management** | Backend & Storage | Multipart uploads, disk storage, MIME filtering, authenticated streaming downloads | `productionDelivery.test.js` + `upload.js` |
| **Module J: Saving & Export** | Full-Stack | Scene state persistence, auto-save debounce, Binary GLTF (`.glb`) export, Scene JSON download | Viewport3D exporter + `sceneService` persistence |

---

## 3. Testing Environments & Tools

### Backend Test Environment
- **Runtime:** Node.js v24.22.1
- **Framework:** Express.js 4.18
- **Test Runner:** Jest 29.7.0
- **HTTP Assertion:** Supertest 6.3.4
- **Database:** MongoDB 7.0 containerized (`archvizon-mongodb`) on `localhost:27017`

### Frontend Test Environment
- **Framework:** Next.js 14.2.24 (App Router)
- **Compiler:** SWC
- **Build Verification:** `npm run build`
- **Graphics Library:** Three.js 0.187.0
- **Styling:** Tailwind CSS 3.4.17

---

## 4. Test Scenarios & Acceptance Criteria

### 4.1 Authentication & Security (Module A)
- **TC-AUTH-01:** Client registration and login return valid JWT and user object.
- **TC-AUTH-02:** Access to `/api/v1/projects` without a Bearer token returns HTTP 401.
- **TC-AUTH-03:** Password reset endpoint issues cryptographically secure tokens expiring within 1 hour.
- **TC-AUTH-04:** Client cannot view or modify projects belonging to another client (HTTP 403).

### 4.2 3D Scene Modeling & Persistence (Modules B & C)
- **TC-SCENE-01:** Opening a project initializes a default 3D scene with grid and camera if none exists.
- **TC-SCENE-02:** Updating object position, rotation, or scale persists to MongoDB with valid coordinate precision.
- **TC-SCENE-03:** Keyboard shortcuts `W`, `E`, `R` switch transform gizmos to Translate, Rotate, Scale.
- **TC-SCENE-04:** Deleting an object removes it from the scene tree and updates outliner in real time.
- **TC-SCENE-05:** Export GLB downloads a valid binary container readable by external 3D software.

### 4.3 Architectural Elements & Asset Library (Modules D & E)
- **TC-ARCH-01:** Catalog endpoints return 16 pre-configured architectural structures and furniture items.
- **TC-ARCH-02:** Catalog endpoints return 9 PBR materials with valid roughness and metalness coefficients.
- **TC-ARCH-03:** Inserting a sofa or table drops it at ground level (Y = 0) with default bounding box dimensions.
- **TC-ARCH-04:** Applying a PBR material to a selected mesh immediately updates its WebGL material parameters.

### 4.4 Virtual Staging & Rendering Background Jobs (Modules F & G)
- **TC-STAGE-01:** Client can upload vacant room photograph and queue staging with style and density parameters.
- **TC-STAGE-02:** Staging job begins with `PENDING` status and progresses asynchronously to `COMPLETED`.
- **TC-STAGE-03:** Before/After split slider allows smooth interactive dragging to compare before and after states.
- **TC-RENDER-01:** Client can queue an architectural render with camera presets, lighting scenario, and 4K resolution.
- **TC-RENDER-02:** Render worker computes raymarching progression (0% → 100%) and updates project thumbnail.
- **TC-RENDER-03:** Completed renders can be inspected in full-screen lightbox and downloaded.

### 4.5 Virtual Walkthrough (Module H)
- **TC-WALK-01:** Clicking enter walkthrough engages browser Pointer Lock API.
- **TC-WALK-02:** Pressing W/A/S/D moves the camera horizontally while maintaining 1.7m eye-level elevation.
- **TC-WALK-03:** Pressing Shift accelerates movement into sprint speed.
- **TC-WALK-04:** Pressing Escape unlocks the mouse cursor and restores the standard UI.

---

## 5. Execution Matrix & Criteria for Release

| Suite / Check | Total Tests | Pass Threshold | Actual Status |
|---|---|---|---|
| Backend Test Suites (10 files) | 86 tests | 100% | 86 Passed (0 Failed) |
| Frontend Production Build | 8 routes | 0 errors | 8 Compiled Successfully |
| Database Indexing & Constraints | 7 collections | 100% | Verified & Active |
| Overall Release Quality Gate | Full Suite | 100% | **READY FOR PRODUCTION** |
