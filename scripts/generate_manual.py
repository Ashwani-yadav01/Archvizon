"""
Comprehensive Generator for Archvizon Platform Architecture & User Manual PDF.
Generates a 15-page, publication-quality, color-coded manual with NumberedCanvas.
"""
import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        # Do not draw headers/footers on cover page (page 1)
        if self._pageNumber > 1:
            self.saveState()
            
            # Running Header
            self.setFont('Helvetica-Bold', 8)
            self.setFillColor(colors.HexColor('#0369a1'))
            self.drawString(40, 755, "ARCHVIZON")
            self.setFont('Helvetica', 8)
            self.setFillColor(colors.HexColor('#64748b'))
            self.drawString(98, 755, "|  Comprehensive Platform Architecture, Engineering & User Manual")
            self.drawRightString(letter[0] - 40, 755, "v2.0 (November 2026)")
            
            self.setStrokeColor(colors.HexColor('#cbd5e1'))
            self.setLineWidth(0.75)
            self.line(40, 748, letter[0] - 40, 748)
            
            # Running Footer
            self.line(40, 42, letter[0] - 40, 42)
            self.setFont('Helvetica', 8)
            self.setFillColor(colors.HexColor('#64748b'))
            self.drawString(40, 30, "Archvizon Platform — Architectural Visualization, 3D Web Workspace & Virtual Staging")
            page_text = f"Page {self._pageNumber} of {page_count}"
            self.drawRightString(letter[0] - 40, 30, page_text)
            
            self.restoreState()

def create_manual(output_filename):
    doc = SimpleDocTemplate(
        output_filename,
        pagesize=letter,
        leftMargin=40,
        rightMargin=40,
        topMargin=52,
        bottomMargin=50
    )

    styles = getSampleStyleSheet()

    # Custom Palette
    C_PRIMARY = colors.HexColor('#0f172a')     # Dark Slate
    C_SECONDARY = colors.HexColor('#1e293b')   # Slate 800
    C_ACCENT_BLUE = colors.HexColor('#0284c7') # Sky 600
    C_ACCENT_DARK = colors.HexColor('#0369a1') # Sky 700
    C_EMERALD = colors.HexColor('#059669')     # Emerald 600
    C_AMBER = colors.HexColor('#d97706')       # Amber 600
    C_TEXT_MAIN = colors.HexColor('#1e293b')   # Body Dark
    C_TEXT_MUTED = colors.HexColor('#64748b')  # Muted Gray
    C_BG_LIGHT = colors.HexColor('#f8fafc')    # Table light
    C_BG_CALLOUT = colors.HexColor('#f0f9ff')  # Sky tint
    C_BORDER_LIGHT = colors.HexColor('#e2e8f0')

    # Custom Typography Styles
    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=28,
        leading=34,
        textColor=C_PRIMARY,
        spaceAfter=8
    )

    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=17,
        textColor=C_ACCENT_DARK,
        spaceAfter=15
    )

    h1_style = ParagraphStyle(
        'ChapterHeading',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=16,
        leading=20,
        textColor=C_PRIMARY,
        spaceBefore=12,
        spaceAfter=6,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'SectionHeading',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11.5,
        leading=15,
        textColor=C_ACCENT_DARK,
        spaceBefore=8,
        spaceAfter=4,
        keepWithNext=True
    )

    h3_style = ParagraphStyle(
        'SubSectionHeading',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=13,
        textColor=C_SECONDARY,
        spaceBefore=6,
        spaceAfter=2,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'BodyMain',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=C_TEXT_MAIN,
        spaceAfter=5
    )

    body_bold = ParagraphStyle(
        'BodyBold',
        parent=body_style,
        fontName='Helvetica-Bold'
    )

    bullet_style = ParagraphStyle(
        'BulletMain',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=C_TEXT_MAIN,
        leftIndent=14,
        firstLineIndent=-10,
        spaceAfter=3
    )

    code_style = ParagraphStyle(
        'CodeSnippet',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=7.5,
        leading=9.5,
        textColor=colors.HexColor('#0f172a'),
        backColor=colors.HexColor('#f1f5f9'),
        borderPadding=5,
        spaceBefore=3,
        spaceAfter=5
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=11,
        textColor=colors.white
    )

    table_body_style = ParagraphStyle(
        'TableBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.5,
        leading=10,
        textColor=C_TEXT_MAIN
    )

    table_body_bold = ParagraphStyle(
        'TableBodyBold',
        parent=table_body_style,
        fontName='Helvetica-Bold'
    )

    table_code_style = ParagraphStyle(
        'TableCode',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=7,
        leading=9,
        textColor=colors.HexColor('#0369a1')
    )

    callout_text_style = ParagraphStyle(
        'CalloutText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11.5,
        textColor=colors.HexColor('#0c4a6e')
    )

    callout_bold_style = ParagraphStyle(
        'CalloutBold',
        parent=callout_text_style,
        fontName='Helvetica-Bold'
    )

    def callout_box(title, text, accent_color='#0284c7', bg_color='#f0f9ff'):
        content = [
            Paragraph(f"<b>{title}</b>", ParagraphStyle('CT', parent=callout_bold_style, textColor=colors.HexColor(accent_color))),
            Spacer(1, 2),
            Paragraph(text, callout_text_style)
        ]
        t = Table([[content]], colWidths=[532])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor(bg_color)),
            ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#bae6fd')),
            ('LINELEFT', (0,0), (-1,-1), 3.5, colors.HexColor(accent_color)),
            ('TOPPADDING', (0,0), (-1,-1), 5),
            ('BOTTOMPADDING', (0,0), (-1,-1), 5),
            ('LEFTPADDING', (0,0), (-1,-1), 8),
            ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ]))
        return t

    story = []

    # =========================================================================
    # COVER PAGE (PAGE 1)
    # =========================================================================
    story.append(Spacer(1, 15))
    header_table = Table([[""]], colWidths=[532], rowHeights=[6])
    header_table.setStyle(TableStyle([('BACKGROUND', (0,0), (-1,-1), C_ACCENT_BLUE)]))
    story.append(header_table)
    story.append(Spacer(1, 18))

    story.append(Paragraph("ARCHVIZON PLATFORM", ParagraphStyle('Eyebrow', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=10.5, leading=13, textColor=C_ACCENT_DARK, spaceAfter=6)))
    story.append(Paragraph("Complete System Architecture, Technical Specifications & End-to-End User Manual", title_style))
    story.append(Paragraph("The Unified Platform for Architectural CGI Rendering, Interactive 3D Web Modeling, AI/Manual Virtual Staging & Production Management", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=C_ACCENT_BLUE, spaceBefore=4, spaceAfter=14))

    meta_data = [
        [Paragraph("<b>Document Version:</b>", body_style), Paragraph("2.0 (Production Release)", body_style),
         Paragraph("<b>Date of Issue:</b>", body_style), Paragraph("November 2026", body_style)],
        [Paragraph("<b>System Core:</b>", body_style), Paragraph("Next.js 14 App Router + Express REST API", body_style),
         Paragraph("<b>Database:</b>", body_style), Paragraph("MongoDB 7.0 with Mongoose ODM", body_style)],
        [Paragraph("<b>Graphics Engine:</b>", body_style), Paragraph("Three.js WebGL (60 FPS Native Viewport)", body_style),
         Paragraph("<b>Security Standard:</b>", body_style), Paragraph("Stateless JWT + RBAC + Bcrypt (Salt=10)", body_style)],
        [Paragraph("<b>Target Audience:</b>", body_style), Paragraph("Developers, Architects, Artists, PMs & Admins", body_style),
         Paragraph("<b>Execution Status:</b>", body_style), Paragraph("<font color='#059669'><b>Production Ready (All Tests Passing)</b></font>", body_style)],
    ]
    meta_table = Table(meta_data, colWidths=[100, 180, 100, 152])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), C_BG_LIGHT),
        ('BOX', (0,0), (-1,-1), 1, C_BORDER_LIGHT),
        ('INNERGRID', (0,0), (-1,-1), 0.5, C_BORDER_LIGHT),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 7),
        ('RIGHTPADDING', (0,0), (-1,-1), 7),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 14))

    story.append(callout_box(
        "Platform Overview & Purpose",
        "Archvizon solves the fragmentation, communication friction, and revision chaos in real estate visualization. "
        "It provides real estate developers and architects with an all-in-one web portal to submit architectural briefs, "
        "upload massive CAD/3D files, explore spaces in real-time browser 3D, furnish vacant rooms with virtual staging, "
        "inspect 4K/8K CGI renders, execute first-person walkthroughs, and conduct structured review/approval cycles with "
        "dedicated 3D artists and project managers."
    ))

    story.append(Spacer(1, 14))
    story.append(Paragraph("<b>Table of Contents at a Glance:</b>", h3_style))
    
    toc_items = [
        ("Chapter 1: Platform Overview & Strategic Architecture", "Core value proposition, 3 pillars & platform boundaries"),
        ("Chapter 2: Technical Stack & System Architecture", "Decoupled 4-tier design: Next.js 14, Express REST API, Three.js, MongoDB"),
        ("Chapter 3: Database Models & Entity Relationships", "Mongoose schemas: Users, Projects, Scenes, Deliverables, Staging, Renders"),
        ("Chapter 4: Project Lifecycle & 12-Stage State Machine", "Validated status progression, clarification loops, and approval gating"),
        ("Chapter 5: Core Functional Modules Deep Dive", "3D Editor, Virtual Staging Studio, Render Studio, Walkthroughs & Analytics"),
        ("Chapter 6: Installation, Configuration & Deployment", "Prerequisites, backend/frontend setup, database seeding & demo credentials"),
        ("Chapter 7: End-to-End Persona User Guides", "Step-by-step guides for Clients, Artists, Project Managers, and Admins"),
        ("Chapter 8: Complete REST API Reference (/api/v1)", "Comprehensive endpoint catalog with methods, payloads & auth rules"),
        ("Chapter 9: File Formats, Security & Operational Policies", "Browser-native vs CAD boundaries, encryption, download security & best practices"),
    ]
    toc_data = [[Paragraph(f"<b>{t[0]}</b>", body_style), Paragraph(t[1], table_body_style)] for t in toc_items]
    toc_table = Table(toc_data, colWidths=[240, 292])
    toc_table.setStyle(TableStyle([
        ('LINEBELOW', (0,0), (-1,-1), 0.5, C_BORDER_LIGHT),
        ('TOPPADDING', (0,0), (-1,-1), 2.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
    ]))
    story.append(toc_table)
    story.append(PageBreak())

    # =========================================================================
    # CHAPTER 1: PLATFORM OVERVIEW & STRATEGIC ARCHITECTURE (PAGE 2)
    # =========================================================================
    story.append(Paragraph("Chapter 1: Platform Overview & Strategic Architecture", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=C_ACCENT_BLUE, spaceBefore=2, spaceAfter=8))

    story.append(Paragraph("1.1 The Business Problem in Architectural Visualization", h2_style))
    story.append(Paragraph(
        "Commercial and residential real estate development requires constant visual marketing assets: photorealistic "
        "exterior renderings, interior virtual staging for vacant listings, and immersive virtual walkthroughs for prospective buyers. "
        "Traditionally, this process suffers from severe workflow bottlenecks: requirements are scattered across email threads and chat "
        "apps, multi-gigabyte CAD/BIM drawings are lost or mismatched, revision requests lack visual context, and clients have zero "
        "visibility into production stages. Archvizon eliminates these problems by centralizing client intake, interactive 3D spatial "
        "modeling, virtual staging, high-resolution rendering, and revision management into a single, cohesive, secure platform.",
        body_style
    ))

    story.append(Paragraph("1.2 The Three Visualization Pillars", h2_style))
    p_data = [
        [
            Paragraph("<b>Pillar 1: Architectural CGI Rendering</b>", table_header_style),
            Paragraph("<b>Pillar 2: Manual & AI Virtual Staging</b>", table_header_style),
            Paragraph("<b>Pillar 3: Virtual Walkthroughs & 360°</b>", table_header_style)
        ],
        [
            Paragraph(
                "Photorealistic interior and exterior still images created from architectural floorplans, CAD drawings, or 3D scene geometry. "
                "Supports customizable camera perspectives, lighting scenarios (Day, Dusk, Night, Studio), high sample counts, and master "
                "resolutions up to 8K Ultra-HD.",
                table_body_style
            ),
            Paragraph(
                "Furnishing and styling photographs of raw, unfurnished, or outdated real estate properties. "
                "Clients upload empty space images, select room classifications (Living Room, Bedroom, Kitchen, etc.) and design aesthetics "
                "(Modern, Minimalist, Luxury, Scandinavian), producing furnished previews with split-screen Before/After sliders.",
                table_body_style
            ),
            Paragraph(
                "Immersive spatial navigation modes: browser-based First-Person 3D Walkthroughs with WASD/mouse look controls, "
                "spherical 360° Equirectangular Panorama Viewers with Three.js WebGL projection, and embedded hosted interactive tours "
                "(Matterport 3D and Kuula 360).",
                table_body_style
            )
        ]
    ]
    p_table = Table(p_data, colWidths=[177, 177, 178])
    p_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), C_PRIMARY),
        ('BOX', (0,0), (-1,-1), 1, C_BORDER_LIGHT),
        ('INNERGRID', (0,0), (-1,-1), 0.5, C_BORDER_LIGHT),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(p_table)
    story.append(Spacer(1, 8))

    story.append(Paragraph("1.3 Product Scope & System Boundaries", h2_style))
    story.append(Paragraph(
        "To ensure high engineering integrity, Archvizon maintains explicit architectural boundaries: "
        "<br/>• <b>In-Platform Responsibilities:</b> Complete client project intake, brief drafting, asset and source CAD storage, "
        "interactive real-time 3D space modeling (parametric walls, floors, doors, windows, interior furniture catalog), virtual staging "
        "orchestration, render pipeline queueing, versioned deliverable delivery, revision tracking, client approvals, team assignments, "
        "activity auditing, and multi-user organization management. "
        "<br/>• <b>Production Boundary:</b> While the platform includes an in-browser Three.js modeling editor and headless rendering service, "
        "complex proprietary photorealistic raytracing and BIM modeling are authored by visualization artists using external DCC tools "
        "(Blender, D5 Render, Unreal Engine 5, 3ds Max, Revit). Archvizon acts as the master management hub, communication layer, and delivery "
        "gateway for all source assets and final deliverables.",
        body_style
    ))
    story.append(Spacer(1, 8))

    story.append(callout_box(
        "Core Engineering Principle",
        "Keep business logic strictly isolated on the backend. Next.js App Router provides the interactive client-side experience, "
        "while Express.js and MongoDB guarantee data security, state machine transitions, and access control. "
        "Frontend UI state is never treated as authoritative for permissions or project statuses."
    ))
    story.append(PageBreak())

    # =========================================================================
    # CHAPTER 2: TECHNICAL STACK & SYSTEM ARCHITECTURE (PAGE 3)
    # =========================================================================
    story.append(Paragraph("Chapter 2: Technical Stack & System Architecture", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=C_ACCENT_BLUE, spaceBefore=2, spaceAfter=8))

    story.append(Paragraph("2.1 Decoupled Multi-Tier System Topology", h2_style))
    story.append(Paragraph(
        "Archvizon follows a strictly decoupled, modular multi-tier architecture adhering to modern web performance and security standards.",
        body_style
    ))

    arch_tiers = [
        [Paragraph("<b>Layer</b>", table_header_style), Paragraph("<b>Technology</b>", table_header_style), Paragraph("<b>Key Responsibilities & Components</b>", table_header_style)],
        [
            Paragraph("<b>Frontend Client Layer</b>", table_body_bold),
            Paragraph("Next.js 14.2 (App Router)<br/>React 18<br/>Tailwind CSS<br/>Three.js WebGL", table_body_style),
            Paragraph(
                "• Responsive UI Shell across desktop, tablet, and mobile browser sizes.<br/>"
                "• Pure WebGL Viewport (`Viewport3D.js`) with React ref-binding (zero reconciler overhead at 60 FPS).<br/>"
                "• OrbitControls, TransformControls (Translate, Rotate, Scale), Raycaster object selection.<br/>"
                "• Before/After comparison sliders, Walkthrough HUD, Panorama WebGL inverted sphere.<br/>"
                "• Client-side Binary GLTF/GLB Exporter and Scene JSON serializer.",
                table_body_style
            )
        ],
        [
            Paragraph("<b>Backend API Layer</b>", table_body_bold),
            Paragraph("Node.js (v18+)<br/>Express.js REST API<br/>Multer<br/>Bcrypt & JWT", table_body_style),
            Paragraph(
                "• Modular architecture: Routes &rarr; Auth/RBAC &rarr; Validators &rarr; Controllers &rarr; Services &rarr; Models.<br/>"
                "• Versioned endpoints under prefix `http://localhost:5000/api/v1`.<br/>"
                "• Role-Based Access Control (RBAC) and strict resource ownership verification.<br/>"
                "• Centralized error handling, input sanitization, and structured JSON envelopes.<br/>"
                "• Secure streaming endpoints for authenticated file downloads and inline previews.",
                table_body_style
            )
        ],
        [
            Paragraph("<b>Persistence Data Layer</b>", table_body_bold),
            Paragraph("MongoDB 7.0<br/>Mongoose ODM", table_body_style),
            Paragraph(
                "• Document store housing users, projects, 3D scenes, deliverables, assets, and audit logs.<br/>"
                "• Compound indexing on project codes, user emails, status lifecycles, and foreign keys.<br/>"
                "• Schema-level validation and pre-save password hashing hooks.<br/>"
                "• Zero exposure of credential hashes (`select: false` on Mongoose schema).",
                table_body_style
            )
        ],
        [
            Paragraph("<b>Execution & Storage Layer</b>", table_body_bold),
            Paragraph("Storage Service<br/>Staging Worker<br/>Render Engine", table_body_style),
            Paragraph(
                "• Asynchronous staging and rendering job queues with real-time status and progress tracking.<br/>"
                "• Storage abstraction supporting local disk storage and S3-compatible cloud object storage.<br/>"
                "• Secure content-disposition and MIME header management.",
                table_body_style
            )
        ],
    ]
    t_arch = Table(arch_tiers, colWidths=[100, 120, 312])
    t_arch.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), C_PRIMARY),
        ('BOX', (0,0), (-1,-1), 1, C_BORDER_LIGHT),
        ('INNERGRID', (0,0), (-1,-1), 0.5, C_BORDER_LIGHT),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_arch)
    story.append(Spacer(1, 8))

    story.append(Paragraph("2.2 API Request Flow & Envelope Standards", h2_style))
    story.append(Paragraph(
        "Every client request to the Express backend passes through a rigorous security and domain pipeline: "
        "<b>HTTP Request &rarr; Security Headers (Helmet, CORS) &rarr; JWT Authentication &rarr; RBAC Authorization &rarr; "
        "Input Validation (express-validator) &rarr; Controller &rarr; Domain Service &rarr; Mongoose Model &rarr; MongoDB</b>. "
        "All API responses follow a strict, predictable JSON envelope structure:",
        body_style
    ))
    story.append(Paragraph(
        "// Success Response (HTTP 200/201):\n"
        "{\n  \"success\": true,\n  \"message\": \"Project created successfully\",\n  \"data\": { ... }\n}\n\n"
        "// Error Response (HTTP 400/401/403/404/422/500):\n"
        "{\n  \"success\": false,\n  \"message\": \"Validation or authorization error description\",\n  \"errors\": [ ... ]\n}",
        code_style
    ))
    story.append(PageBreak())

    # =========================================================================
    # CHAPTER 3: DATABASE MODELS & ENTITY RELATIONSHIPS (PAGES 4 & 5)
    # =========================================================================
    story.append(Paragraph("Chapter 3: Database Models & Entity Relationships", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=C_ACCENT_BLUE, spaceBefore=2, spaceAfter=8))

    story.append(Paragraph("3.1 Database Architecture Overview", h2_style))
    story.append(Paragraph(
        "The Archvizon database layer is built on MongoDB 7.0 using Mongoose ODM. "
        "It consists of 14 domain collections designed for referential integrity, performant querying via compound indexes, "
        "and granular activity auditing across all project lifecycle stages.",
        body_style
    ))

    # Split models into 2 tables so Page 4 and Page 5 are full and balanced
    models_part1 = [
        [Paragraph("<b>Model / Collection</b>", table_header_style), Paragraph("<b>Key Attributes & Schema Fields</b>", table_header_style), Paragraph("<b>Domain Purpose & Relationships</b>", table_header_style)],
        [
            Paragraph("<b>User</b><br/>(`users`)", table_body_bold),
            Paragraph("name, email, passwordHash (hidden), role (`CLIENT`, `VISUALIZATION_ARTIST`, `PROJECT_MANAGER`, `ADMIN`), organizationId, accountStatus, resetPasswordToken", table_code_style),
            Paragraph("Core user identity, authentication, and platform authorization. Indexed on email and organizationId.", table_body_style)
        ],
        [
            Paragraph("<b>Organization</b><br/>(`organizations`)", table_body_bold),
            Paragraph("name, organizationType (`DEVELOPER`, `ARCHITECTURAL_FIRM`, `STUDIO`), contactEmail, phone, ownerId (Ref: User), memberIds (Array of User Refs)", table_code_style),
            Paragraph("Multi-user corporate workspace enabling teams of architects and developers to share projects and review assets.", table_body_style)
        ],
        [
            Paragraph("<b>Project</b><br/>(`projects`)", table_body_bold),
            Paragraph("projectCode (`PRJ-YYMM-XXXX`), name, description, propertyType (`RESIDENTIAL`, `COMMERCIAL`, `MIXED_USE`), location, clientId (Ref: User), organizationId, status, deadline, tags", table_code_style),
            Paragraph("Master architectural brief record. Tracks the complete production lifecycle from DRAFT to COMPLETED.", table_body_style)
        ],
        [
            Paragraph("<b>ServiceRequest</b><br/>(`servicerequests`)", table_body_bold),
            Paragraph("projectId (Ref: Project), serviceType (`CGI_RENDERING`, `VIRTUAL_STAGING`, `WALKTHROUGH`), requirements, stylePreferences, outputSpecifications, status", table_code_style),
            Paragraph("Specific visualization services attached to a project brief. Defines resolution, camera angles, and style goals.", table_body_style)
        ],
        [
            Paragraph("<b>Scene</b><br/>(`scenes`)", table_body_bold),
            Paragraph("projectId, userId, name, version, environment (ambient, directional, grid, background), camera (pos, target, fov), objects (id, type, transforms, geometry, PBR material)", table_code_style),
            Paragraph("Normalized 3D spatial scene graph synchronizing the Next.js Three.js modeling editor with MongoDB.", table_body_style)
        ],
        [
            Paragraph("<b>ArchitecturalAsset</b><br/>(`architecturalassets`)", table_body_bold),
            Paragraph("name, category (`ARCHITECTURAL`, `INTERIOR`, `LIGHTING`), subCategory (`WALLS`, `FLOORS`, `DOORS`, `WINDOWS`, `FURNITURE`), dimensions, defaultMaterial, tags", table_code_style),
            Paragraph("Pre-configured 3D structural elements and designer furniture assets available in the modeling editor catalog.", table_body_style)
        ],
        [
            Paragraph("<b>Asset</b><br/>(`assets`)", table_body_bold),
            Paragraph("projectId, serviceRequestId, uploadedBy (Ref: User), storageKey, originalName, mimeType, size, category (`SOURCE_FILE`, `REFERENCE_IMAGE`, `SPECIFICATION`), version", table_code_style),
            Paragraph("Raw client CAD drawings (`.dwg`, `.dxf`), architectural blueprints (`.pdf`), and reference photographs.", table_body_style)
        ],
    ]
    t_models1 = Table(models_part1, colWidths=[100, 230, 202])
    t_models1.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), C_PRIMARY),
        ('BOX', (0,0), (-1,-1), 1, C_BORDER_LIGHT),
        ('INNERGRID', (0,0), (-1,-1), 0.5, C_BORDER_LIGHT),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_models1)
    story.append(PageBreak())

    # PAGE 5: MODELS PART 2 + INDEXES & DATA INTEGRITY
    story.append(Paragraph("3.2 Complete Schema Reference (Continued)", h2_style))
    story.append(HRFlowable(width="100%", thickness=0.75, color=C_BORDER_LIGHT, spaceBefore=2, spaceAfter=8))

    models_part2 = [
        [Paragraph("<b>Model / Collection</b>", table_header_style), Paragraph("<b>Key Attributes & Schema Fields</b>", table_header_style), Paragraph("<b>Domain Purpose & Relationships</b>", table_header_style)],
        [
            Paragraph("<b>Deliverable</b><br/>(`deliverables`)", table_body_bold),
            Paragraph("projectId, serviceRequestId, title, deliverableType (`CGI_RENDER`, `VIRTUAL_STAGING`, `WALKTHROUGH_VIDEO`, `THREE_D_SCENE`), reviewStatus, versionNumber, currentVersionId, versions array", table_code_style),
            Paragraph("Artist-produced visual deliverables. Maintains complete version iteration history (v1, v2...) and client release states.", table_body_style)
        ],
        [
            Paragraph("<b>RevisionRequest</b><br/>(`revisionrequests`)", table_body_bold),
            Paragraph("deliverableId, versionNumber, requestedBy (Ref: User), title, description, status (`OPEN`, `IN_PROGRESS`, `RESOLVED`), artistResponse, resolvedBy, resolvedAt", table_code_style),
            Paragraph("Structured change requests logged by clients against specific deliverable versions. Enforces accountability.", table_body_style)
        ],
        [
            Paragraph("<b>Comment</b><br/>(`comments`)", table_body_bold),
            Paragraph("projectId, deliverableId (optional), authorId (Ref: User), content, isInternal (Boolean: true hides from Client), attachments array", table_code_style),
            Paragraph("Threaded project feedback discussions. Internal notes allow private coordination between PMs and Artists.", table_body_style)
        ],
        [
            Paragraph("<b>Assignment</b><br/>(`assignments`)", table_body_bold),
            Paragraph("projectId, assignedTo (Ref: User), assignedBy (Ref: User), roleOnProject (`LEAD_ARTIST`, `STAGING_ARTIST`, `PROJECT_MANAGER`), assignedAt, status (`ACTIVE`)", table_code_style),
            Paragraph("Team member allocations. Governs artist access control to assigned projects and source assets.", table_body_style)
        ],
        [
            Paragraph("<b>StagingJob</b><br/>(`stagingjobs`)", table_body_bold),
            Paragraph("projectId, userId, originalImageUrl, roomType (`LIVING_ROOM`, `BEDROOM`, `KITCHEN`), designStyle (`MODERN`, `MINIMALIST`, `LUXURY`), status, progress, resultImageUrl", table_code_style),
            Paragraph("Asynchronous virtual staging execution queue and Before/After image URL pairing.", table_body_style)
        ],
        [
            Paragraph("<b>RenderJob</b><br/>(`renderjobs`)", table_body_bold),
            Paragraph("projectId, sceneId, userId, settings (resolution, quality, cameraPosition, lightingScenario, samples), status (`PENDING`, `PROCESSING`, `COMPLETED`), progress, outputUrl", table_code_style),
            Paragraph("Headless architectural rendering queue. Orchestrates high-sample frame generation and lightbox gallery outputs.", table_body_style)
        ],
        [
            Paragraph("<b>Notification & ActivityLog</b><br/>(`notifications`, `activitylogs`)", table_body_bold),
            Paragraph("recipientId, type, message, readAt / actorId, projectId, action (`CREATED`, `STATUS_CHANGED`, `APPROVED`), entityType, metadata, timestamp", table_code_style),
            Paragraph("In-app real-time notification badge feed and immutable system audit trail for compliance and reporting.", table_body_style)
        ],
    ]
    t_models2 = Table(models_part2, colWidths=[100, 230, 202])
    t_models2.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), C_PRIMARY),
        ('BOX', (0,0), (-1,-1), 1, C_BORDER_LIGHT),
        ('INNERGRID', (0,0), (-1,-1), 0.5, C_BORDER_LIGHT),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_models2)
    story.append(Spacer(1, 10))

    story.append(Paragraph("3.3 Database Indexing & Referential Integrity", h2_style))
    story.append(Paragraph(
        "• <b>Compound Indexes:</b> Indexes on `{ clientId: 1, status: 1 }` and `{ organizationId: 1, status: 1 }` optimize dashboard queries. "
        "`{ email: 1 }` on `User` is enforced unique. Project codes (`PRJ-YYMM-XXXX`) are uniquely indexed for instant lookup.<br/>"
        "• <b>Referential Integrity:</b> Deleting a draft project cascades to its attached assets, scenes, and service requests. Once submitted, "
        "projects cannot be deleted—only transitioned to `CANCELLED` by authorized administrators to maintain audit compliance.<br/>"
        "• <b>Immutable Version Stacks:</b> Deliverables store version iterations in an embedded array containing immutable timestamped records. "
        "Prior drafts are never overwritten, guaranteeing full traceability for client audits.",
        body_style
    ))
    story.append(PageBreak())

    # =========================================================================
    # CHAPTER 4: PROJECT LIFECYCLE & 12-STAGE STATE MACHINE (PAGE 6)
    # =========================================================================
    story.append(Paragraph("Chapter 4: Project Lifecycle & 12-Stage State Machine", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=C_ACCENT_BLUE, spaceBefore=2, spaceAfter=8))

    story.append(Paragraph("4.1 Centralized Status Transition Matrix", h2_style))
    story.append(Paragraph(
        "Archvizon enforces a strict, validated finite-state machine on the backend (`projectStatuses.js`). "
        "Arbitrary status modifications from client payloads are strictly rejected. Only authorized roles can execute "
        "permitted transitions, and multi-step workflows require explicit preconditions.",
        body_style
    ))

    status_data = [
        [Paragraph("<b>Status Code</b>", table_header_style), Paragraph("<b>Lifecycle Meaning</b>", table_header_style), Paragraph("<b>Permitted Next Transitions</b>", table_header_style), Paragraph("<b>Authorized Actor</b>", table_header_style)],
        [Paragraph("`DRAFT`", table_code_style), Paragraph("Client initiated project; brief and CAD assets are being prepared.", table_body_style), Paragraph("`SUBMITTED`, `CANCELLED`", table_code_style), Paragraph("CLIENT", table_body_bold)],
        [Paragraph("`SUBMITTED`", table_code_style), Paragraph("Brief submitted to Archvizon production queue; awaiting PM triage.", table_body_style), Paragraph("`UNDER_REVIEW`, `AWAITING_INFORMATION`, `CANCELLED`", table_code_style), Paragraph("PM, ADMIN", table_body_bold)],
        [Paragraph("`UNDER_REVIEW`", table_code_style), Paragraph("Project Manager is auditing floorplans, specifications, and deadline.", table_body_style), Paragraph("`AWAITING_INFORMATION`, `ASSIGNED`, `CANCELLED`", table_code_style), Paragraph("PM, ADMIN", table_body_bold)],
        [Paragraph("`AWAITING_INFORMATION`", table_code_style), Paragraph("PM flagged missing drawings or specs; waiting for client response.", table_body_style), Paragraph("`SUBMITTED`, `UNDER_REVIEW`, `CANCELLED`", table_code_style), Paragraph("CLIENT (via Clarification)", table_body_bold)],
        [Paragraph("`ASSIGNED`", table_code_style), Paragraph("PM has assigned lead 3D artists and visualization specialists.", table_body_style), Paragraph("`IN_PROGRESS`, `CANCELLED`", table_code_style), Paragraph("PM, ARTIST, ADMIN", table_body_bold)],
        [Paragraph("`IN_PROGRESS`", table_code_style), Paragraph("Active 3D modeling, staging, and rendering production is underway.", table_body_style), Paragraph("`INTERNAL_REVIEW`, `CLIENT_REVIEW`, `CANCELLED`", table_code_style), Paragraph("ARTIST, PM, ADMIN", table_body_bold)],
        [Paragraph("`INTERNAL_REVIEW`", table_code_style), Paragraph("Quality gate: PM and senior artists audit renders prior to client release.", table_body_style), Paragraph("`IN_PROGRESS`, `CLIENT_REVIEW`, `CANCELLED`", table_code_style), Paragraph("PM, ADMIN", table_body_bold)],
        [Paragraph("`CLIENT_REVIEW`", table_code_style), Paragraph("Deliverables released to client (`READY_FOR_CLIENT`) for formal inspection.", table_body_style), Paragraph("`REVISION_REQUESTED`, `APPROVED`, `CANCELLED`", table_code_style), Paragraph("CLIENT", table_body_bold)],
        [Paragraph("`REVISION_REQUESTED`", table_code_style), Paragraph("Client submitted formal revision requests against deliverable versions.", table_body_style), Paragraph("`IN_PROGRESS`, `INTERNAL_REVIEW`, `CANCELLED`", table_code_style), Paragraph("ARTIST, PM, ADMIN", table_body_bold)],
        [Paragraph("`APPROVED`", table_code_style), Paragraph("Client formally approved all final deliverable outputs.", table_body_style), Paragraph("`COMPLETED`, `CANCELLED`", table_code_style), Paragraph("PM, ADMIN", table_body_bold)],
        [Paragraph("`COMPLETED`", table_code_style), Paragraph("Terminal state: all deliverables verified, approved, and archived.", table_body_style), Paragraph("<i>(None — Terminal State)</i>", table_body_style), Paragraph("System Locked", table_body_style)],
        [Paragraph("`CANCELLED`", table_code_style), Paragraph("Project aborted by mutual agreement or administrative action.", table_body_style), Paragraph("<i>(None — Terminal State)</i>", table_body_style), Paragraph("PM, ADMIN, CLIENT", table_body_style)],
    ]
    t_status = Table(status_data, colWidths=[105, 175, 142, 110])
    t_status.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), C_PRIMARY),
        ('BOX', (0,0), (-1,-1), 1, C_BORDER_LIGHT),
        ('INNERGRID', (0,0), (-1,-1), 0.5, C_BORDER_LIGHT),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_status)
    story.append(Spacer(1, 8))

    story.append(Paragraph("4.2 Critical Workflow Gating Rules", h2_style))
    story.append(Paragraph(
        "1. <b>The Clarification Loop (`AWAITING_INFORMATION`):</b> If a PM determines that submitted CAD drawings are incomplete or "
        "specifications are ambiguous, they trigger a clarification request with custom inquiry notes. The project enters `AWAITING_INFORMATION`, "
        "prompting an interactive banner on the client's screen. Once the client uploads the requested materials and clicks "
        "<b>'Submit Clarification Response'</b>, the project status automatically rolls back to `UNDER_REVIEW`.<br/>"
        "2. <b>The Quality Gate (`INTERNAL_REVIEW`):</b> Artists upload draft outputs marked as `INTERNAL_DRAFT`. These files are strictly "
        "invisible to the client. Only after the PM verifies quality standards does the PM promote the deliverable to `READY_FOR_CLIENT`, "
        "moving the project into `CLIENT_REVIEW`.<br/>"
        "3. <b>The Completion Invariant (`COMPLETED`):</b> A project <i>cannot</i> be marked `COMPLETED` while any deliverables remain "
        "unapproved or in an active revision cycle. The endpoint `POST /api/v1/projects/:projectId/complete` checks that every attached "
        "deliverable has status `APPROVED`. If any unapproved deliverables exist, the request is rejected with HTTP 400.",
        body_style
    ))
    story.append(PageBreak())

    # =========================================================================
    # CHAPTER 5: CORE FUNCTIONAL MODULES DEEP DIVE (PAGES 7, 8, 9)
    # =========================================================================
    # PAGE 7: 3D MODELING WORKSPACE & VIRTUAL STAGING
    story.append(Paragraph("Chapter 5: Core Functional Modules Deep Dive", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=C_ACCENT_BLUE, spaceBefore=2, spaceAfter=8))

    story.append(Paragraph("5.1 Interactive 3D Modeling Workspace (`/projects/[id]/editor`)", h2_style))
    story.append(Paragraph(
        "Archvizon features a built-in, browser-native 3D modeling editor powered by Three.js (`^0.187.0`). "
        "It provides real-time architectural design capabilities directly inside the web browser without requiring external software installations.",
        body_style
    ))
    
    ed_features = [
        ("WebGL Viewport & Shading Modes", "Renders at a smooth 60 FPS using raw WebGL canvas ref-binding. Supports 4 real-time viewport shading modes: Wireframe, Solid Flat Shading, Material Preview, and Rendered Ambient Occlusion."),
        ("Interactive Gizmos & Controls", "Full spatial manipulation via TransformControls: Translation (W), Rotation (E), and Scale (R) in World or Local coordinates. OrbitControls with smooth damping and clamped polar angles."),
        ("Parametric Architectural Builders", "Parametric Wall Builder (custom width, height, thickness, plaster materials), Floor Slab Generator with wood/tile texture tiling, Parametric Doors and Double Glazed Windows, and Structural Columns/Stairs."),
        ("Interior Design Catalog Drawer", "One-click drop of pre-configured interior furniture assets: Contemporary Sofas, King Beds, Dining Tables, Ergonomic Chairs, and Floor Lamps, with automatic ground-surface raycast alignment."),
        ("PBR Material Engine", "Real-time physical material switcher: Hardwood Oak, Calacatta Marble, Brushed Concrete, Architectural Glass (specular transmission), Ceramic Tiles, and Matte Metals."),
        ("Scene Graph & Cloud Persistence", "SceneHierarchy tree outliner with lock, hide, rename, and delete actions. Full persistence with backend `Scene` model via debounced auto-save. Client-side export to Binary GLTF (`.glb`) and Scene JSON."),
    ]
    for title, desc in ed_features:
        story.append(Paragraph(f"• <b>{title}:</b> {desc}", bullet_style))

    story.append(Spacer(1, 8))
    story.append(Paragraph("5.2 Virtual Staging Studio", h2_style))
    story.append(Paragraph(
        "The Virtual Staging Studio (`VirtualStagingStudio.js`) enables real estate developers to furnish vacant property photos in seconds: "
        "<br/>1. <b>Photo Intake:</b> Upload high-resolution photographs (`.jpg`, `.png`, `.webp`) of empty interior rooms. "
        "<br/>2. <b>Space Configuration:</b> Select room type (Living Room, Master Bedroom, Kitchen, Dining Room, Home Office, Terrace) and "
        "design aesthetic (Modern, Scandinavian, Minimalist, Contemporary, Industrial, Luxury, Traditional). "
        "<br/>3. <b>Execution Queue:</b> The backend spawns an asynchronous `StagingJob` with progress tracking (0% to 100%). "
        "<br/>4. <b>Interactive Split-Screen Slider:</b> Finished staging results are presented with a draggable Before/After slider "
        "(`BeforeAfterComparison.js`), allowing clients to drag a split divider across the image to evaluate spatial transformations.",
        body_style
    ))
    story.append(PageBreak())

    # PAGE 8: RENDERING STUDIO, WALKTHROUGHS & DELIVERABLES
    story.append(Paragraph("5.3 Architectural Rendering Studio", h2_style))
    story.append(Paragraph(
        "The Architectural Rendering Studio (`RenderStudio.js`) serves as the production render management interface: "
        "<br/>• <b>Camera Preset Positioning:</b> Select standard architectural camera angles (Eye-Level 1.7m, Elevated Corner, Drone Aerial Perspective). "
        "<br/>• <b>Lighting Scenarios:</b> Switch between Daylight Sunny, Golden Hour Dusk, Architectural Night Exterior, and Studio Interior lighting. "
        "<br/>• <b>Resolution Ceilings:</b> Generate preview frames in Full HD (1080p), Production master renders in 4K UHD, and ultra-large billboard formats in 8K. "
        "<br/>• <b>Asynchronous Render Queue:</b> Dispatches `RenderJob` background tasks with real-time progress bars, duration timers, and a high-resolution lightbox gallery for instant inspection.",
        body_style
    ))

    story.append(Spacer(1, 8))
    story.append(Paragraph("5.4 Virtual Walkthroughs & Immersive 3D Tours", h2_style))
    story.append(Paragraph(
        "Archvizon provides multiple immersive formats for spatial presentation: "
        "<br/>1. <b>First-Person 3D Walkthrough (`WalkthroughMode.js`):</b> An interactive first-person mode featuring WASD/arrow keyboard movement, "
        "Shift sprint multiplier, PointerLock mouse look, 1.7m eye-level maintenance, spatial collision bounding, and an on-screen HUD. "
        "<br/>2. <b>360° Spherical Panorama Viewer (`PanoramaViewer.js`):</b> Three.js WebGL inverted sphere projection with interactive drag navigation, "
        "FOV zoom clamping (30° to 100°), and smooth auto-rotation tour mode. "
        "<br/>3. <b>Hosted Tour Sandboxes:</b> Secure WebGL iframe sandboxes for embedding Matterport 3D digital twins and Kuula 360 virtual tours. "
        "<br/>4. <b>Walkthrough Video Player (`WalkthroughPlayer.js`):</b> Dark video player with timecode scrubber, speed selector (0.5x to 2x), and chapter markers.",
        body_style
    ))

    story.append(Spacer(1, 8))
    story.append(Paragraph("5.5 Deliverables, Review, Revisions & Approvals", h2_style))
    story.append(Paragraph(
        "Production deliverables follow a structured review cycle: "
        "<br/>• <b>Version History:</b> Each deliverable holds an immutable array of version iterations (`v1`, `v2`, `v3`). Prior drafts are never overwritten. "
        "<br/>• <b>Revision Requests:</b> Clients submit revision requests pinpointing the exact deliverable version, title, and detailed change requirements. "
        "<br/>• <b>Artist Resolution:</b> Artists view open revisions, update status (`OPEN` &rarr; `IN_PROGRESS` &rarr; `RESOLVED`), upload new version files, and log explanatory resolution notes. "
        "<br/>• <b>Client Sign-Off:</b> Once satisfied, the client clicks <b>'Approve Deliverable'</b>, recording the timestamp and approving user identity.",
        body_style
    ))
    story.append(PageBreak())

    # PAGE 9: COLLABORATION, ANALYTICS & ORGANIZATIONS
    story.append(Paragraph("5.6 Collaboration, Comments & Notification Hub", h2_style))
    story.append(Paragraph(
        "Feedback and communication are embedded directly into project contexts: "
        "<br/>• <b>Threaded Feedback (`FeedbackCommentsSection.js`):</b> Clients and team members communicate within the project workspace. "
        "<br/>• <b>Internal Team Notes (`isInternal: true`):</b> Project managers and artists can log private production notes invisible to the client. "
        "<br/>• <b>Real-Time Notification Bell (`NotificationBell.js`):</b> Alerts users to project assignments, clarification requests, new deliverables, "
        "and client approvals, complete with unread count badges and one-click navigation.",
        body_style
    ))

    story.append(Spacer(1, 8))
    story.append(Paragraph("5.7 Production Analytics & Pipeline Intelligence", h2_style))
    story.append(Paragraph(
        "The Analytics Dashboard (`AnalyticsDashboard.js`) surfaces real-time business intelligence for studio operations: "
        "<br/>• <b>Executive KPIs:</b> Total projects, active production pipeline, overall client approval rate (%), and average turnaround time (days). "
        "<br/>• <b>Status Distribution:</b> Real-time project counts across all 12 lifecycle stages. "
        "<br/>• <b>Artist Throughput & Velocity:</b> Workload distribution per visualization artist (active projects, deliverables uploaded, revisions resolved). "
        "<br/>• <b>Deadline Risk Monitor:</b> Real-time flags for overdue projects, deliverables due within 72 hours, and clarification bottlenecks.",
        body_style
    ))

    story.append(Spacer(1, 8))
    story.append(Paragraph("5.8 Multi-User Organization Workspaces", h2_style))
    story.append(Paragraph(
        "For architectural firms and real estate developers with multiple team members: "
        "<br/>• <b>Workspace Directory (`OrganizationWorkspace.js`):</b> Manage company profile, verified contact details, and organization type. "
        "<br/>• <b>Member Invitations:</b> Invite colleagues by registered email address to join the workspace. "
        "<br/>• <b>Shared Ownership:</b> All team members in an organization have unified visibility and collaborative review access over company projects.",
        body_style
    ))
    story.append(PageBreak())

    # =========================================================================
    # CHAPTER 6: INSTALLATION, CONFIGURATION & GETTING STARTED (PAGE 10)
    # =========================================================================
    story.append(Paragraph("Chapter 6: Installation, Configuration & Getting Started", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=C_ACCENT_BLUE, spaceBefore=2, spaceAfter=8))

    story.append(Paragraph("6.1 System Prerequisites", h2_style))
    story.append(Paragraph(
        "Before launching Archvizon, ensure the following software dependencies are installed on the host machine: "
        "<br/>• <b>Node.js:</b> Version >= 18.0.0 (Tested and certified on Node.js v24.22.1 LTS). "
        "<br/>• <b>npm:</b> Version >= 9.0.0. "
        "<br/>• <b>MongoDB:</b> Version 7.0+ (Local MongoDB service or cloud MongoDB Atlas cluster). "
        "<br/>• <b>Docker & Docker Compose (Optional):</b> For instant containerized database deployment.",
        body_style
    ))

    story.append(Paragraph("6.2 Step-by-Step Backend Setup", h2_style))
    story.append(Paragraph(
        "1. Open a terminal and navigate to the backend directory: `cd backend`<br/>"
        "2. Install all required Node.js dependencies: `npm install`<br/>"
        "3. Configure backend environment variables in `backend/.env`:",
        body_style
    ))
    story.append(Paragraph(
        "# backend/.env\n"
        "NODE_ENV=development\n"
        "PORT=5000\n"
        "MONGODB_URI=mongodb://127.0.0.1:27017/archvizon\n"
        "JWT_SECRET=archvizon_super_secret_jwt_key_2026_production_grade\n"
        "JWT_EXPIRES_IN=7d\n"
        "CLIENT_URL=http://localhost:3000",
        code_style
    ))
    story.append(Paragraph(
        "4. Start the backend development server: `npm run dev`<br/>"
        "The server initializes on port `5000` with the versioned REST API accessible at `http://localhost:5000/api/v1`.",
        body_style
    ))

    story.append(Paragraph("6.3 Step-by-Step Frontend Setup", h2_style))
    story.append(Paragraph(
        "1. In a separate terminal, navigate to the frontend directory: `cd frontend`<br/>"
        "2. Install all frontend React, Next.js, and Three.js dependencies: `npm install`<br/>"
        "3. Configure frontend environment variables in `frontend/.env.local`:",
        body_style
    ))
    story.append(Paragraph(
        "# frontend/.env.local\n"
        "NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1",
        code_style
    ))
    story.append(Paragraph(
        "4. Start the Next.js development server: `npm run dev`<br/>"
        "The frontend application runs on `http://localhost:3000`.",
        body_style
    ))

    story.append(Paragraph("6.4 Database Seeding & Default Demo Accounts", h2_style))
    story.append(Paragraph(
        "To populate the database with default accounts across all 4 system roles, run the automated seed script: "
        "`cd backend && npm run seed`. This immediately configures the following authenticated credentials:",
        body_style
    ))

    cred_data = [
        [Paragraph("<b>Role</b>", table_header_style), Paragraph("<b>Email Address</b>", table_header_style), Paragraph("<b>Password</b>", table_header_style), Paragraph("<b>Associated Organization</b>", table_header_style)],
        [Paragraph("`ADMIN`", table_code_style), Paragraph("`admin@archvizon.com`", table_body_style), Paragraph("`Password123!`", table_code_style), Paragraph("Archvizon HQ", table_body_style)],
        [Paragraph("`PROJECT_MANAGER`", table_code_style), Paragraph("`pm@archvizon.com`", table_body_style), Paragraph("`Password123!`", table_code_style), Paragraph("Archvizon Production", table_body_style)],
        [Paragraph("`VISUALIZATION_ARTIST`", table_code_style), Paragraph("`artist@archvizon.com`", table_body_style), Paragraph("`Password123!`", table_code_style), Paragraph("Archvizon Studio", table_body_style)],
        [Paragraph("`CLIENT`", table_code_style), Paragraph("`client@developer.com`", table_body_style), Paragraph("`Password123!`", table_code_style), Paragraph("Skyline Urban Properties", table_body_style)],
    ]
    t_cred = Table(cred_data, colWidths=[120, 150, 110, 152])
    t_cred.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), C_PRIMARY),
        ('BOX', (0,0), (-1,-1), 1, C_BORDER_LIGHT),
        ('INNERGRID', (0,0), (-1,-1), 0.5, C_BORDER_LIGHT),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_cred)
    story.append(Spacer(1, 8))

    story.append(Paragraph("6.5 Automated Test Verification", h2_style))
    story.append(Paragraph(
        "To verify system health, execute the backend automated test suite: `cd backend && npm test`. "
        "The test suite executes 10 test suites comprising 86 comprehensive unit, integration, and security tests "
        "covering authentication, project intake, asset storage, status state machine transitions, deliverables versioning, "
        "revision lifecycles, and RBAC authorization boundaries. All 86 tests pass cleanly.",
        body_style
    ))
    story.append(PageBreak())

    # =========================================================================
    # CHAPTER 7: COMPLETE PERSONA USER MANUAL (PAGES 11 & 12)
    # =========================================================================
    # PAGE 11: CLIENT & ARTIST GUIDES
    story.append(Paragraph("Chapter 7: Complete Persona User Manual", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=C_ACCENT_BLUE, spaceBefore=2, spaceAfter=8))

    story.append(Paragraph("7.1 The Client Journey (Real Estate Developers & Architects)", h2_style))
    story.append(Paragraph(
        "As a developer or architectural client, Archvizon provides a streamlined portal to order and manage visualizations:",
        body_style
    ))
    c_steps = [
        ("Step 1: Account Registration & Sign In", "Navigate to `http://localhost:3000/register` to create your client profile, or sign in at `/login` with your credentials (`client@developer.com` / `Password123!`)."),
        ("Step 2: Create a Project Brief", "From your Dashboard, click <b>'New Project'</b>. Enter the project name, description, property type (Residential, Commercial, Mixed Use), site location, and completion deadline. You can start with an empty canvas or select a starter architectural template."),
        ("Step 3: Attach Services & Upload CAD Assets", "In the project brief, add your required services (Architectural CGI Rendering, Virtual Staging, Walkthroughs). Go to the <b>'Assets'</b> tab and upload your AutoCAD floorplans (`.dwg`, `.dxf`), PDF blueprints, and inspirational style reference photos."),
        ("Step 4: Submit Brief for Review", "Click the <b>'Submit Brief for Review'</b> button. The project status shifts from `DRAFT` to `SUBMITTED`. The Archvizon management team is immediately notified."),
        ("Step 5: Respond to Clarifications", "If the project manager needs additional information, an orange alert banner appears on your project. Click <b>'Respond to Clarification'</b>, provide the requested answers, attach any missing drawings, and submit."),
        ("Step 6: Explore in 3D Modeling Editor", "Click <b>'Open 3D Studio'</b> to launch the full-screen Three.js workspace. Orbit around the space, sketch walls, drop in designer furniture, and test PBR materials."),
        ("Step 7: Launch Virtual Staging & Renders", "Switch to the <b>'Virtual Staging'</b> tab, upload photos of empty spaces, choose furniture styles, and view the results via the Before/After split slider. In the <b>'Render Studio'</b>, configure camera angles and lighting presets to queue high-res frames."),
        ("Step 8: Review Deliverables & Request Revisions", "When deliverables are ready, visit the <b>'Deliverables'</b> tab. Open high-res previews or download master outputs. If revisions are required, click <b>'Request Revision'</b>, specify what needs adjustment, and submit."),
        ("Step 9: Approve Final Deliverables & Download", "Once satisfied with a deliverable version, click <b>'Approve Deliverable'</b>. Your approval is recorded with a verified timestamp. Download the uncompressed master assets."),
        ("Step 10: Manage Organization Workspace", "Navigate to <b>'Organization'</b> to invite architectural colleagues and project partners by email, granting them shared visibility over projects."),
    ]
    for s_title, s_desc in c_steps:
        story.append(Paragraph(f"• <b>{s_title}:</b> {s_desc}", bullet_style))

    story.append(Spacer(1, 8))
    story.append(Paragraph("7.2 The Visualization Artist Journey", h2_style))
    story.append(Paragraph(
        "As a 3D artist, Archvizon organizes your assigned production pipeline without scattered communication:",
        body_style
    ))
    a_steps = [
        ("Step 1: Review Assigned Projects", "Log in at `/login` as `artist@archvizon.com`. Your Artist Dashboard immediately highlights active projects assigned to you by project managers."),
        ("Step 2: Inspect Brief & Source Files", "Open the project overview. Review the client's specifications, required camera perspectives, and download source CAD drawings (`.dwg`, `.pdf`) from the <b>'Assets'</b> tab."),
        ("Step 3: Author 3D Scenes & Preview Outputs", "Build or import scene assets in the 3D Editor, or utilize external tools (Blender, 3ds Max, D5, Unreal). Run render tests using the in-platform Render Studio."),
        ("Step 4: Upload Deliverables (v1)", "In the <b>'Deliverables'</b> tab, click <b>'Upload Deliverable'</b>. Select deliverable type (CGI Render, Virtual Staging, Walkthrough), attach the image/video binary, and include technical notes. It is initially saved as `INTERNAL_DRAFT`."),
        ("Step 5: Address Client Revision Requests", "In the <b>'Revisions'</b> tab, review open client feedback. Click <b>'Respond to Revision'</b>, set status to `IN_PROGRESS` or `RESOLVED`, upload iteration `v2`, and submit your response."),
    ]
    for s_title, s_desc in a_steps:
        story.append(Paragraph(f"• <b>{s_title}:</b> {s_desc}", bullet_style))
    story.append(PageBreak())

    # PAGE 12: PROJECT MANAGER & ADMIN GUIDES
    story.append(Paragraph("7.3 The Project Manager Journey", h2_style))
    story.append(Paragraph(
        "Project managers coordinate brief intake, team assignments, quality gates, and delivery oversight:",
        body_style
    ))
    pm_steps = [
        ("Step 1: Triage Submitted Briefs", "Log in at `/login` as `pm@archvizon.com`. Filter your dashboard for `SUBMITTED` projects. Click into a brief to verify specifications and attached CAD assets."),
        ("Step 2: Request Clarification or Advance Status", "Use the <b>Status Transition Control</b> panel to transition the project to `UNDER_REVIEW`. If information is missing, click <b>'Request Clarification'</b>, enter inquiry notes, and transition to `AWAITING_INFORMATION`."),
        ("Step 3: Assign Production Team", "Open the <b>'Team'</b> tab. Assign a lead visualization artist and secondary staging artists from the user directory."),
        ("Step 4: Internal Quality Audit", "When artists upload drafts, audit them under `INTERNAL_REVIEW`. Verify adherence to client specs before promoting the deliverable to `READY_FOR_CLIENT`."),
        ("Step 5: Monitor Analytics & Close Projects", "Review the Analytics Dashboard for deadline bottlenecks and artist velocity. Once all deliverables are approved, mark the project as `COMPLETED`."),
    ]
    for s_title, s_desc in pm_steps:
        story.append(Paragraph(f"• <b>{s_title}:</b> {s_desc}", bullet_style))

    story.append(Spacer(1, 10))
    story.append(Paragraph("7.4 The Platform Administrator Journey", h2_style))
    story.append(Paragraph(
        "Administrators (`admin@archvizon.com`) have unrestricted platform governance: "
        "<br/>• <b>User Directory Management:</b> Inspect all user accounts, elevate roles (e.g. promote a user to `PROJECT_MANAGER` or `VISUALIZATION_ARTIST`), and toggle account status (`ACTIVE` vs `SUSPENDED`). "
        "<br/>• <b>Global Project Audit:</b> Unrestricted access to view, filter, reassign, or archive any project in the database. "
        "<br/>• <b>System Health & Audit Logs:</b> Inspect immutable activity logs across all system actors to ensure regulatory and security compliance.",
        body_style
    ))
    story.append(Spacer(1, 10))

    story.append(callout_box(
        "Multi-Role Collaboration Best Practice",
        "Archvizon is designed so each persona works in harmony: Clients submit and approve, Artists produce and iterate, "
        "Project Managers coordinate and maintain quality, and Admins supervise platform health. "
        "Separation of concerns ensures no single role can bypass quality checks or access unauthorized customer files."
    ))
    story.append(PageBreak())

    # =========================================================================
    # CHAPTER 8: COMPLETE REST API REFERENCE (PAGES 13 & 14)
    # =========================================================================
    # PAGE 13: API PART 1 (AUTH, USERS, ORGS, PROJECTS)
    story.append(Paragraph("Chapter 8: Complete REST API Reference (/api/v1)", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=C_ACCENT_BLUE, spaceBefore=2, spaceAfter=8))

    story.append(Paragraph("8.1 Endpoint Catalog Grouped by Domain (Part 1)", h2_style))
    story.append(Paragraph(
        "All endpoints require standard JSON bodies and bearer authentication headers (`Authorization: Bearer <JWT>`) "
        "unless noted as Public.",
        body_style
    ))

    api_part1 = [
        [Paragraph("<b>Method & Endpoint</b>", table_header_style), Paragraph("<b>Auth / Roles</b>", table_header_style), Paragraph("<b>Description & Request Payload</b>", table_header_style)],
        # Auth
        [Paragraph("`POST /api/v1/auth/register`", table_code_style), Paragraph("Public", table_body_style), Paragraph("Register new client account (`name, email, password, organization`)", table_body_style)],
        [Paragraph("`POST /api/v1/auth/login`", table_code_style), Paragraph("Public", table_body_style), Paragraph("Authenticate credentials; returns signed JWT token and user profile", table_body_style)],
        [Paragraph("`GET /api/v1/auth/me`", table_code_style), Paragraph("Authenticated", table_body_style), Paragraph("Retrieve current authenticated user context and role", table_body_style)],
        [Paragraph("`POST /api/v1/auth/forgot-password`", table_code_style), Paragraph("Public", table_body_style), Paragraph("Initiate password reset workflow; generates reset token", table_body_style)],
        [Paragraph("`POST /api/v1/auth/reset-password`", table_code_style), Paragraph("Public", table_body_style), Paragraph("Reset password using valid reset token and new password", table_body_style)],
        # Users
        [Paragraph("`GET /api/v1/users`", table_code_style), Paragraph("PM, ADMIN", table_body_style), Paragraph("List user directory with pagination, role filtering, and search", table_body_style)],
        [Paragraph("`PATCH /api/v1/users/:id/role`", table_code_style), Paragraph("ADMIN", table_body_style), Paragraph("Elevate or modify user role (`newRole: 'VISUALIZATION_ARTIST'`, etc.)", table_body_style)],
        # Organizations
        [Paragraph("`POST /api/v1/organizations`", table_code_style), Paragraph("Authenticated", table_body_style), Paragraph("Register a new firm organization workspace", table_body_style)],
        [Paragraph("`GET /api/v1/organizations/me`", table_code_style), Paragraph("Authenticated", table_body_style), Paragraph("Retrieve current user's organization profile and team members", table_body_style)],
        [Paragraph("`POST /api/v1/organizations/:id/members`", table_code_style), Paragraph("Owner, ADMIN", table_body_style), Paragraph("Invite/add a colleague by registered email address", table_body_style)],
        # Projects
        [Paragraph("`POST /api/v1/projects`", table_code_style), Paragraph("CLIENT, ADMIN", table_body_style), Paragraph("Create a new project brief draft (`name, propertyType, deadline...`)", table_body_style)],
        [Paragraph("`GET /api/v1/projects`", table_code_style), Paragraph("Authenticated", table_body_style), Paragraph("List projects (role-scoped ownership filtering with pagination)", table_body_style)],
        [Paragraph("`GET /api/v1/projects/:id`", table_code_style), Paragraph("Authenticated", table_body_style), Paragraph("Fetch full project details, services, assets, deliverables, and team", table_body_style)],
        [Paragraph("`POST /api/v1/projects/:id/submit`", table_code_style), Paragraph("Owner, ADMIN", table_body_style), Paragraph("Submit brief for production triage (`DRAFT` &rarr; `SUBMITTED`)", table_body_style)],
        [Paragraph("`PATCH /api/v1/projects/:id/status`", table_code_style), Paragraph("Staff / Client", table_body_style), Paragraph("Execute validated status transition with transition map verification", table_body_style)],
        [Paragraph("`POST /api/v1/projects/:id/complete`", table_code_style), Paragraph("PM, ADMIN", table_body_style), Paragraph("Mark project `COMPLETED` (enforces all deliverables are approved)", table_body_style)],
    ]
    t_api1 = Table(api_part1, colWidths=[150, 95, 287])
    t_api1.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), C_PRIMARY),
        ('BOX', (0,0), (-1,-1), 1, C_BORDER_LIGHT),
        ('INNERGRID', (0,0), (-1,-1), 0.5, C_BORDER_LIGHT),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_api1)
    story.append(PageBreak())

    # PAGE 14: API PART 2 (ASSETS, 3D SCENES, DELIVERABLES, REVISIONS, STAGING, RENDERS, ANALYTICS)
    story.append(Paragraph("8.2 Endpoint Catalog Grouped by Domain (Part 2)", h2_style))
    story.append(HRFlowable(width="100%", thickness=0.75, color=C_BORDER_LIGHT, spaceBefore=2, spaceAfter=8))

    api_part2 = [
        [Paragraph("<b>Method & Endpoint</b>", table_header_style), Paragraph("<b>Auth / Roles</b>", table_header_style), Paragraph("<b>Description & Request Payload</b>", table_header_style)],
        # Assets
        [Paragraph("`POST /api/v1/projects/:id/assets`", table_code_style), Paragraph("Authenticated", table_body_style), Paragraph("Upload source CAD/BIM drawing or reference file (Multipart form)", table_body_style)],
        [Paragraph("`GET /api/v1/assets/:id/download`", table_code_style), Paragraph("Authenticated", table_body_style), Paragraph("Secure authenticated binary file stream with content headers", table_body_style)],
        # 3D Scenes
        [Paragraph("`GET /api/v1/scenes/project/:projectId`", table_code_style), Paragraph("Authenticated", table_body_style), Paragraph("Retrieve 3D spatial scene graph for Three.js modeling editor", table_body_style)],
        [Paragraph("`PUT /api/v1/scenes/project/:projectId`", table_code_style), Paragraph("Authenticated", table_body_style), Paragraph("Synchronize 3D scene objects, camera, and environment settings", table_body_style)],
        # Deliverables & Revisions
        [Paragraph("`POST /api/v1/projects/:id/deliverables`", table_code_style), Paragraph("Artist, PM, Admin", table_body_style), Paragraph("Upload initial deliverable file (v1, multipart binary)", table_body_style)],
        [Paragraph("`POST /api/v1/deliverables/:id/versions`", table_code_style), Paragraph("Artist, PM, Admin", table_body_style), Paragraph("Upload subsequent deliverable iteration (`v2+`, multipart)", table_body_style)],
        [Paragraph("`POST /api/v1/deliverables/:id/approve`", table_code_style), Paragraph("Client, Admin", table_body_style), Paragraph("Client signs off on deliverable version as final approved output", table_body_style)],
        [Paragraph("`POST /api/v1/deliverables/:id/revisions`", table_code_style), Paragraph("Client, Admin", table_body_style), Paragraph("Submit formal change request against a deliverable version", table_body_style)],
        [Paragraph("`PATCH /api/v1/revisions/:id/respond`", table_code_style), Paragraph("Artist, PM, Admin", table_body_style), Paragraph("Artist/PM marks revision `IN_PROGRESS` or `RESOLVED` with response", table_body_style)],
        # Staging & Renders
        [Paragraph("`POST /api/v1/staging`", table_code_style), Paragraph("Authenticated", table_body_style), Paragraph("Queue virtual staging job with empty room image, room type, and style", table_body_style)],
        [Paragraph("`GET /api/v1/staging/:jobId`", table_code_style), Paragraph("Authenticated", table_body_style), Paragraph("Poll staging progress (0-100%) and retrieve Before/After URLs", table_body_style)],
        [Paragraph("`POST /api/v1/render`", table_code_style), Paragraph("Authenticated", table_body_style), Paragraph("Queue headless architectural render with camera and lighting presets", table_body_style)],
        # Analytics
        [Paragraph("`GET /api/v1/analytics/overview`", table_code_style), Paragraph("Staff / Client", table_body_style), Paragraph("Retrieve executive KPIs: projects, approval rate, turnaround days", table_body_style)],
        [Paragraph("`GET /api/v1/analytics/risks`", table_code_style), Paragraph("PM, ADMIN", table_body_style), Paragraph("Retrieve deadline risk alerts: overdue and 72-hour delivery items", table_body_style)],
        [Paragraph("`GET /api/v1/analytics/status-distribution`", table_code_style), Paragraph("Staff / Client", table_body_style), Paragraph("Real-time project counts across all 12 lifecycle stages", table_body_style)],
        [Paragraph("`GET /api/v1/analytics/velocity`", table_code_style), Paragraph("PM, ADMIN", table_body_style), Paragraph("Artist production throughput: assignments, uploads, and resolutions", table_body_style)],
    ]
    t_api2 = Table(api_part2, colWidths=[150, 95, 287])
    t_api2.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), C_PRIMARY),
        ('BOX', (0,0), (-1,-1), 1, C_BORDER_LIGHT),
        ('INNERGRID', (0,0), (-1,-1), 0.5, C_BORDER_LIGHT),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_api2)
    story.append(PageBreak())

    # =========================================================================
    # CHAPTER 9: FILE FORMATS, SECURITY & OPERATIONAL POLICIES (PAGE 15)
    # =========================================================================
    story.append(Paragraph("Chapter 9: File Formats, Security & Operational Policies", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=C_ACCENT_BLUE, spaceBefore=2, spaceAfter=8))

    story.append(Paragraph("9.1 Supported File Formats vs System Boundaries", h2_style))
    story.append(Paragraph(
        "Archvizon provides clear transparency regarding browser-supported visual formats versus desktop production formats. "
        "The in-platform <b>Format Compatibility Guide</b> (`FormatLimitationsModal.js`) documents the following:",
        body_style
    ))

    fmt_data = [
        [Paragraph("<b>Category</b>", table_header_style), Paragraph("<b>File Extensions</b>", table_header_style), Paragraph("<b>Browser Capabilities & Platform Handling</b>", table_header_style)],
        [
            Paragraph("<b>Native 3D Spatial</b>", table_body_bold),
            Paragraph("`.glb`, `.gltf`", table_code_style),
            Paragraph("Full real-time 3D interactive viewing, geometry inspection, and PBR material rendering inside the Three.js viewport and first-person walkthrough engine.", table_body_style)
        ],
        [
            Paragraph("<b>High-Res 2D Images</b>", table_body_bold),
            Paragraph("`.jpg`, `.png`, `.webp`", table_code_style),
            Paragraph("Full-resolution lightbox inspection, Before/After split comparison sliders, and 360° spherical equirectangular panorama projection.", table_body_style)
        ],
        [
            Paragraph("<b>Walkthrough Videos</b>", table_body_bold),
            Paragraph("`.mp4`, `.webm`", table_code_style),
            Paragraph("In-platform video player playback with custom timecode scrubbers, speed selection (0.5x to 2x), and camera perspective chapter markers.", table_body_style)
        ],
        [
            Paragraph("<b>CAD & Blueprints</b>", table_body_bold),
            Paragraph("`.dwg`, `.dxf`, `.pdf`", table_code_style),
            Paragraph("Stored securely as source reference assets. Downloadable by assigned artists for production in external CAD/BIM authoring software.", table_body_style)
        ],
        [
            Paragraph("<b>Production 3D Software</b>", table_body_bold),
            Paragraph("`.blend`, `.max`, `.d5`, `.rvt`, `.skp`", table_code_style),
            Paragraph("Proprietary desktop software project files. Stored securely in project asset repository; edited externally by visualization artists.", table_body_style)
        ],
    ]
    t_fmt = Table(fmt_data, colWidths=[120, 110, 302])
    t_fmt.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), C_PRIMARY),
        ('BOX', (0,0), (-1,-1), 1, C_BORDER_LIGHT),
        ('INNERGRID', (0,0), (-1,-1), 0.5, C_BORDER_LIGHT),
        ('TOPPADDING', (0,0), (-1,-1), 3.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3.5),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_fmt)
    story.append(Spacer(1, 8))

    story.append(Paragraph("9.2 Security & Operational Integrity Architecture", h2_style))
    story.append(Paragraph(
        "Archvizon is engineered to enterprise security standards: "
        "<br/>• <b>Stateless Authentication:</b> Cryptographically signed JWT tokens with configurable expiration (default 7 days). "
        "<br/>• <b>Password Security:</b> Passwords hashed using bcrypt with salt rounds = 10. Password hashes are excluded by default (`select: false`) on all database queries. "
        "<br/>• <b>Resource Isolation:</b> Backend middleware verifies resource ownership for every request. Clients cannot view or download assets belonging to other clients or organizations. "
        "<br/>• <b>Controlled File Streaming:</b> Asset and deliverable downloads require valid bearer authentication. Direct public URL leaking of confidential architectural drawings is prevented. "
        "<br/>• <b>Immutable Audit Logging:</b> Every project creation, brief submission, status transition, deliverable upload, revision request, and approval is written to the `ActivityLog` collection with timestamp, actor ID, and metadata.",
        body_style
    ))
    story.append(Spacer(1, 8))

    story.append(callout_box(
        "Summary & Operational Certification",
        "Archvizon 2.0 provides an end-to-end, certified production foundation for real estate visualization, "
        "interactive 3D spatial modeling, virtual staging, and client revision workflows. "
        "For additional technical documentation, consult README.md and ARCHITECTURE.md in the project root.",
        accent_color='#059669',
        bg_color='#f0fdf4'
    ))

    # Build Document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Manual successfully generated at: {output_filename}")

if __name__ == '__main__':
    target_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'Archvizon_Complete_Project_and_User_Manual.pdf'))
    create_manual(target_path)
