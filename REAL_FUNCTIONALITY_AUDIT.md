# Archvizon — Real Functionality vs. Simulated Functionality Audit

**Audit Date:** November 16, 2026  
**Auditor:** Independent Software Architect & Code Auditor  
**Repository:** Archvizon Full-Stack Repository (`frontend/` + `backend/`)

---

## 1. Classification Framework

Every product capability in Archvizon has been evaluated and classified into one of the following five rigorous tiers:

1. **Fully Functional and Verified:** The capability is completely implemented, connects to a live backend/database or client engine, has been tested end-to-end, and performs real data processing or 3D manipulation without mocks.
2. **Partially Functional:** The core workflow is implemented and verified, but specific edge behaviors, advanced modifiers, or sub-features have simplified or incomplete handling.
3. **UI Only / Simulated:** The visual controls, buttons, or dialogs exist in the user interface, but their internal implementation relies on placeholder delays (`setTimeout`), fake state updates, or does not alter the underlying data/geometry.
4. **Not Implemented:** Planned or advanced capabilities that are not present in the codebase.
5. **Blocked by External Service or Configuration:** The end-to-end software architecture (job queue, schema, controllers, UI) is fully built and operational, but executing real third-party AI synthesis or cloud raytracing requires external credentials or installed binaries not present in the local development environment.

---

## 2. Comprehensive Feature Matrix

### Module A: Authentication & User Management
| Feature | Classification | Implementation Details |
|---|---|---|
| User Registration | **Fully functional and verified** | Express route `POST /auth/register`, password hashing with `bcryptjs` (salt rounds: 10), MongoDB document creation, role assignment. Verified with live DB. |
| User Login & JWT | **Fully functional and verified** | `POST /auth/login`, cryptographically signed JWT with expiration, Bearer auth headers in Axios/fetch. Verified. |
| User Profile Management | **Fully functional and verified** | `GET /auth/me` and `PUT /auth/profile`. Supports name, phone, and organization profile updates. Verified. |
| Secure Password Reset | **Fully functional and verified** | `POST /auth/forgot-password` generates SHA-256 reset token with 1-hour expiration; `POST /auth/reset-password` updates password hash and invalidates token. Verified. |
| Role-Based Access Control | **Fully functional and verified** | Middleware checks roles (`CLIENT`, `VISUALIZATION_ARTIST`, `PROJECT_MANAGER`, `ADMIN`). Verified. |
| Resource Ownership Isolation | **Fully functional and verified** | Cross-client project read/write requests blocked with HTTP 403 Forbidden. Verified. |

---

### Module B: Project & Service Request Management
| Feature | Classification | Implementation Details |
|---|---|---|
| Project Creation | **Fully functional and verified** | `POST /projects` creates project, validates property type, assigns unique sequential code (e.g. `AV-MWISG3B2-2013`), creates initial scene graph. Verified. |
| Project Retrieval & Filtering | **Fully functional and verified** | `GET /projects` with pagination, status filters, search terms, and property types. Verified. |
| Project Duplication | **Fully functional and verified** | `POST /projects/:id/duplicate` creates deep clone of project document and associated 3D scene. Verified. |
| Project Status Lifecycle | **Fully functional and verified** | Backend state machine enforces allowed status transitions (`DRAFT` → `SUBMITTED` → `UNDER_REVIEW` → etc.). Arbitrary frontend updates are rejected. Verified. |
| Live Thumbnail Capture | **Fully functional and verified** | WebGL canvas frame captured via `toDataURL()` on scene save and persisted via `PATCH /projects/:id/thumbnail`. Verified. |
| Project Deletion | **Fully functional and verified** | `DELETE /projects/:id` cascades deletion of project, scene graph, and file metadata. Verified. |

---

### Module C: 3D Modeling Workspace
| Feature | Classification | Implementation Details |
|---|---|---|
| Three.js WebGL Viewport | **Fully functional and verified** | Three.js r187 canvas rendering at 60 FPS with ACESFilmic tone mapping, PCFSoftShadowMap, and photometric lighting. Verified in browser. |
| Camera Navigation | **Fully functional and verified** | Three.js `OrbitControls` with smooth damping, zoom limits, pitch clamping, and preset camera angles (Perspective, Top, Front, Right, Isometric). Verified in browser. |
| Primitive Object Creation | **Fully functional and verified** | Adds Cube, Sphere, Cylinder, Plane, Cone into Three.js scene graph. Generates proper vertices and face indices. Verified in browser. |
| Object Selection & Outliner | **Fully functional and verified** | Raycasting selection in viewport synchronized bidirectionally with the Scene Hierarchy Outliner. Verified in browser. |
| TransformControls (Gizmos) | **Fully functional and verified** | Three.js `TransformControls` attached to active selection. Supports Translate (W), Rotate (E), Scale (R), and World/Local coordinate spaces. Verified in browser. |
| Numeric Transform Input | **Fully functional and verified** | Real-time position (m), rotation (deg), and scale numeric inputs in Properties Panel. Verified. |
| Duplicate & Delete Objects | **Fully functional and verified** | Keyboard shortcuts (Shift+D, Delete/X) perform real scene graph cloning and removal. Verified. |
| Grid Snapping | **Fully functional and verified** | Configurable magnetic snapping (0.1m, 0.5m, 1.0m) actively clamps transform coordinates during gizmo dragging. Verified. |
| Undo / Redo History Stack | **Fully functional and verified** | Deep-cloned snapshot stack supporting Ctrl+Z and Ctrl+Y / Shift+Ctrl+Z. Verified. |
| Shading Modes | **Fully functional and verified** | Switches between Wireframe, Solid, Material PBR, and Real-Time Rendered shading modes. Verified. |
| Binary GLTF (.glb) Export | **Fully functional and verified** | Real export using Three.js `GLTFExporter`. Tested download of `Seaside_Villa_3D.glb`. Opens in Blender and 3D viewers. Verified. |
| Scene Hierarchy JSON Export | **Fully functional and verified** | Serializes full object transforms, geometry parameters, and PBR materials into structured JSON file. Verified. |
| Subdivide Mesh Modifier | **UI only / simulated** | In `editor/page.js:369`, clicking Subdivide sets `parameters.segments = 2` without subdividing existing buffer geometry or adding vertices to the active mesh. |
| Bevel Modifier | **UI only / simulated** | In `editor/page.js:387`, clicking Bevel lowers material roughness by 0.15 rather than performing geometric chamfering on mesh edges. |
| Boolean Operations (CSG) | **Not implemented** | Constructive Solid Geometry (union, difference, intersect) is not present in the current release. |

---

### Module D: Architectural Design Tools
| Feature | Classification | Implementation Details |
|---|---|---|
| Parametric Walls | **Fully functional and verified** | Generates box geometry with length, height (2.8m), and architectural thickness (0.2m). Casts and receives shadows. Verified in browser. |
| Floor Slabs | **Fully functional and verified** | Creates wide architectural slab geometries with wood or concrete materials. Verified in browser. |
| Doors & Openings | **Fully functional and verified** | Creates door frame and leaf components positioned on the architectural floor plane. Verified in browser. |
| Window Glazing | **Fully functional and verified** | Creates window components with transparent standard material (`opacity: 0.35`, `roughness: 0.05`). Verified in browser. |
| Architectural Columns | **Fully functional and verified** | Creates structural column cylinders with height and radius parameters. Verified in browser. |

---

### Module E: Interior Design & Materials
| Feature | Classification | Implementation Details |
|---|---|---|
| Furniture Asset Library | **Fully functional and verified** | 16 seeded architectural and furniture assets (Sofas, Armchairs, Dining Tables, Beds, Lamps, Plants). Drawer inserts assets with authentic bounding dimensions directly into the 3D scene. Verified. |
| PBR Material Catalog | **Fully functional and verified** | 9 pre-calibrated architectural PBR materials (Oak Flooring, Walnut, Carrara Marble, Cast Concrete, Brushed Stainless Steel, Polished Brass/Gold, Linen Fabric, Clear Architectural Glass, Cognac Leather). Verified. |
| Live Material Assignment | **Fully functional and verified** | Clicking a material card in the Properties Panel immediately updates the active mesh's color, roughness, metalness, and transparency in the WebGL canvas. Verified. |
| Custom Material Tuning | **Fully functional and verified** | Sliders for Color Hex, Roughness (0.0–1.0), Metalness (0.0–1.0), and Opacity (0.0–1.0) update materials in real-time. Verified. |

---

### Module F: Architectural Rendering Studio
| Feature | Classification | Implementation Details |
|---|---|---|
| Camera & Lighting Presets | **Fully functional and verified** | Perspective 3D, Isometric View, Eye-Level Human, Top-Down Plan, Ultra-Wide 18mm camera angles; Bright Daylight, Golden Hour Sunset, Dramatic Twilight, Clean White Studio lighting environments. Verified. |
| Resolution & Quality Config | **Fully functional and verified** | Selectors for 1080p, 4K UHD, 8K Ultra, and draft/production/ultra sample depths. Verified. |
| Asynchronous Render Job Queue | **Fully functional and verified** | `POST /render/jobs` queues render, validates project access, persists job in MongoDB, and exposes polling via `GET /render/jobs/:id`. Verified with live DB. |
| Viewport Real-Time Rendering | **Fully functional and verified** | Browser WebGL canvas renders photometric lighting, soft shadows, and tone-mapping in real time at 60 FPS. Captured snapshots deliver authentic rendered frames. Verified. |
| Headless Backend Raymarching / Blender CLI | **Partially functional / Simulated in local dev** | `backend/src/services/renderService.js:98-110` uses `setTimeout` delays to simulate multi-pass sampling (700ms + 900ms + 600ms) because neither Blender CLI nor headless WebGL is installed in the local Node.js environment. Writes the live viewport screenshot when available, or a fallback buffer. |

---

### Module G: Virtual Staging Engine
| Feature | Classification | Implementation Details |
|---|---|---|
| Photo Upload & Preset Selection | **Fully functional and verified** | Multi-category empty room selection (`Living Room`, `Bedroom`, `Dining`, `Kitchen`, `Office`, `Patio`) and styling themes (`Modern`, `Scandinavian`, `Luxury`, `Minimalist`, `Industrial`, `Japandi`). Verified in browser. |
| Asynchronous Staging Job Queue | **Fully functional and verified** | `POST /staging/jobs` queues job in MongoDB, tracks status transitions (`PENDING` → `PROCESSING` → `COMPLETED`), and lists history via `GET /staging/projects/:id`. Verified with live DB. |
| AI Neural Staging Synthesis | **Partially functional / Blocked by external configuration** | In `backend/src/services/stagingService.js:112-138`, the job worker simulates step progression using `setTimeout` (800ms + 800ms) and copies the original photograph or writes a fixture buffer. Real automated furniture inpainting requires an external AI synthesis API key (`STAGING_API_KEY`) and endpoint (`STAGING_ENDPOINT`). |

---

### Module H: 3D Virtual Walkthrough Tour
| Feature | Classification | Implementation Details |
|---|---|---|
| First-Person Perspective | **Fully functional and verified** | Camera placed at 1.7m eye-level elevation with 70° field-of-view and realistic clipping planes. Verified in browser. |
| WASD + Sprint Navigation | **Fully functional and verified** | Smooth keyboard movement with forward/backward/strafe physics, velocity damping, and Shift key sprint boost. Verified in browser. |
| Pointer Lock Mouse Look | **Fully functional and verified** | Standard FPS mouse look with Euler angles, pitch clamping (-85° to +85°), and cursor hiding via Pointer Lock API. Verified in browser. |
| Backend Scene Synchronization | **Fully functional and verified** | Fetches active project scene from `GET /projects/:id/scene` and dynamically constructs Three.js meshes matching all stored objects. Verified in browser. |
| Fullscreen & HUD Overlay | **Fully functional and verified** | Fullscreen toggle button, keybinding hints, and scene statistics counter. Verified in browser. |

---

### Module I: Asset & File Management
| Feature | Classification | Implementation Details |
|---|---|---|
| Multipart File Upload | **Fully functional and verified** | `POST /projects/:id/assets` with Multer middleware, disk storage in `uploads/projects/`, MIME type and extension validation. Verified with real JPEG file upload. |
| Streaming Binary Download | **Fully functional and verified** | `GET /assets/:id/download` with Bearer token authentication streams exact binary bytes matching uploaded files. Verified with byte comparison. |
| Asset Metadata & Reference Tracking | **Fully functional and verified** | Asset documents in MongoDB record filename, storage path, size, MIME type, uploader ID, category, and project ID. Verified with live DB. |
| Asset Deletion | **Fully functional and verified** | Removes asset document from MongoDB and deletes binary file from disk. Verified. |

---

### Module J: Collaboration, Review, Revisions & Teams
| Feature | Classification | Implementation Details |
|---|---|---|
| Deliverable Version Upload | **Fully functional and verified** | Uploads CGI renders, staging previews, or walkthrough links with version numbers and artist notes. Verified. |
| Revision Requests & Responses | **Fully functional and verified** | `RevisionRequestModal` and `RevisionResponseModal` allow clients to describe changes and artists to link revised assets. Verified. |
| Project Clarification Workflow | **Fully functional and verified** | `ClarificationBanner` and `ClarificationModal` enable project managers to request missing materials before brief acceptance. Verified. |
| Team Assignment Panel | **Fully functional and verified** | Assigns project managers and visualization artists to specific project IDs. Verified. |
| Organization Workspace | **Fully functional and verified** | Multi-user organization management with member invitations and shared projects. Verified. |

---

## 3. Detailed Audit of Simulated Code & Placeholders

The following table details every occurrence of simulated delays, mock data, or placeholder logic discovered across the codebase during verification:

| File Location | Line Numbers | Category | Code Snippet / Mechanism | Impact & Explanation |
|---|---|---|---|---|
| `backend/src/services/stagingService.js` | Lines 112–121 | `setTimeout` delay | `await new Promise((resolve) => setTimeout(resolve, 800));` | Simulates step progression for AI image generation worker in local development. |
| `backend/src/services/stagingService.js` | Lines 128–138 | Image copy / fixture | `fs.copyFileSync(sourceCandidate, resultFilePath);` or base64 1x1 buffer | Without an active `STAGING_API_KEY`, copies the source room photo or writes a base64 fixture rather than performing neural inpainting. |
| `backend/src/services/renderService.js` | Lines 98–110 | `setTimeout` delay | `setTimeout(resolve, 700); setTimeout(resolve, 900); setTimeout(resolve, 600);` | Simulates raymarching passes for headless render jobs in local development. |
| `backend/src/services/renderService.js` | Lines 127–134 | Fallback buffer | Base64 1x1 JPEG buffer | Used as fallback when no real WebGL viewport snapshot is stored on the project. (Resolved by wiring live viewport snapshots). |
| `frontend/src/app/projects/[id]/editor/page.js` | Line 369 | Simulated modifier | `parameters: { ...o.geometry?.parameters, segments: 2 }` | Subdivide button sets `segments: 2` in metadata without regenerating subdivided geometry buffers. |
| `frontend/src/app/projects/[id]/editor/page.js` | Line 387 | Simulated modifier | `roughness: Math.max(0.1, (o.material?.roughness || 0.6) - 0.15)` | Bevel button decreases material roughness instead of chamfering mesh polygon edges. |

---

## 4. Summary of Real vs. Simulated Boundaries

| Dimension | Real Implementation | Simulated / Blocked in Dev |
|---|---|---|
| **Data & Auth** | 100% Real (MongoDB, Express, JWT, Bcrypt) | None |
| **3D Modeling** | 100% Real (Three.js WebGL, Gizmos, GLB/JSON export) | Mesh Subdivide & Bevel (Metadata only) |
| **Walkthrough** | 100% Real (WASD, Pointer Lock, Scene sync) | None |
| **File Management** | 100% Real (Multer, Streaming Binary Download) | None |
| **Rendering** | Real-time WebGL rendering & snapshots | Backend offline raymarching / Blender CLI |
| **Virtual Staging** | Full job queue, parameters, photo upload | AI inpainting (requires cloud API key) |
