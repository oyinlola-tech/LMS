# LearnBridge LMS

LearnBridge is a full-stack learning management system for course discovery, lesson delivery, assignments, grading, mentorship, community learning, billing, admin operations, and verifiable certificates.

It is not only an API. The repository includes a Fastify + TypeScript backend, a vanilla HTML/CSS/JS frontend, role-based dashboards, public marketing pages, certificate rendering, portfolio sharing, and operational admin screens.

## Stack

| Layer | Technology |
| --- | --- |
| Frontend | Vanilla HTML, CSS, JavaScript |
| Backend | Node.js, TypeScript, Fastify |
| Database | PostgreSQL with Sequelize models |
| Generated Client | Prisma client present for generated access patterns |
| Realtime | WebSocket channels for notifications, chat, discussions |
| Jobs / Cache | Redis and BullMQ optional |
| Certificates | HTML templates, QR codes, Puppeteer PDF/PNG rendering |
| Payments | Paystack-oriented payment and billing flow |
| Security | JWT auth, Argon2 passwords, role guards, rate limiting, Helmet |

## What LearnBridge Builds

LearnBridge supports four major user experiences:

- Public website: landing page, course catalog, learning paths, certifications, corporate training, blog, certificate verification, privacy, terms, support.
- Student workspace: dashboard, course progress, lessons, notes, bookmarks, wishlist, grades, assignments, submissions, certificates, mentorship, communities, timeline, messages, settings.
- Tutor workspace: course creation, course builder, assignments, submission review, students, analytics, earnings, office hours, mentorship, portfolio, messages.
- Admin and superadmin workspace: users, courses, enrollments, reports, warnings, email logs, support, financials, system logs, compliance, platform settings.

## Product Architecture

```mermaid
flowchart TB
    Visitor["Visitor / Recruiter"]
    Student["Student"]
    Tutor["Tutor"]
    Admin["Admin / Superadmin"]

    PublicUI["Public Frontend<br/>Landing, Catalog, Blog, Terms, Privacy"]
    StudentUI["Student Dashboard<br/>Learning, Notes, Progress, Certificates"]
    TutorUI["Tutor Studio<br/>Courses, Assignments, Earnings"]
    AdminUI["Admin Console<br/>Users, Reports, System, Compliance"]

    API["Fastify TypeScript API"]
    DB[("PostgreSQL<br/>Sequelize Models")]
    Files[("Uploads<br/>Certificates, Submissions, Media")]
    Redis[("Redis / BullMQ<br/>Optional Queue + Cache")]
    Email["Email Service"]
    Payments["Payment Provider"]
    Browser["Puppeteer<br/>PDF + PNG Rendering"]

    Visitor --> PublicUI
    Student --> StudentUI
    Tutor --> TutorUI
    Admin --> AdminUI

    PublicUI --> API
    StudentUI --> API
    TutorUI --> API
    AdminUI --> API

    API --> DB
    API --> Files
    API --> Redis
    API --> Email
    API --> Payments
    API --> Browser
```

## Role Flow

```mermaid
flowchart LR
    Register["Register / Login / OTP"]
    Profile["Profile Setup"]
    Learn["Enroll + Learn"]
    Submit["Assignments + Quizzes"]
    Complete["Course Completed"]
    Cert["Certificate Issued"]
    Share["LinkedIn + Portfolio Embed"]

    Register --> Profile --> Learn --> Submit --> Complete --> Cert --> Share

    Tutor["Tutor creates course"] --> Learn
    Tutor --> Review["Review submissions"]
    Review --> Complete

    Admin["Admin moderates and operates"] --> Learn
    Admin --> Cert
```

## Certificate Verification System

When a learner completes a course, LearnBridge can issue a certificate with a unique ID. The certificate flow is designed for real external proof.

```mermaid
sequenceDiagram
    actor Student
    participant API as Fastify API
    participant DB as PostgreSQL
    participant Render as Puppeteer Renderer
    participant Public as Public Verification Page
    participant LinkedIn as LinkedIn
    participant Portfolio as External Portfolio

    Student->>API: Complete course
    API->>DB: Validate enrollment completion
    API->>Render: Render certificate PDF/PNG with QR code
    API->>DB: Store certificate record
    API-->>Student: Certificate metadata and share links

    Student->>LinkedIn: Add certification with verification URL
    Student->>Portfolio: Paste embed code
    Portfolio->>Public: Loads certificate image / verify link
    Public->>API: GET /certificates/verify/:certId
    API->>DB: Lookup certificate
    API-->>Public: Verified credential details
```

Certificate capabilities:

- Public verification page: `/certificates/verify/:certId/page`
- JSON verification endpoint: `/certificates/verify/:certId`
- PDF download: `/certificates/download/:certId`
- PNG export: `/certificates/export/:certId?format=png`
- Share page: `/certificates/share/:certId`
- Portfolio embed: `/certificates/embed/:certId`
- LinkedIn add-to-profile URL included in certificate API responses

## Frontend Structure

```text
public/
  pages/                 Public website pages
  students/              Student dashboard and learner pages
  tutors/                Tutor dashboard, course builder, assignment tools
  admin/                 Admin console
  superadmin/            Superadmin console
  courses/               Course details and checkout pages
  lessons/               Lesson viewer
  portfolio/             Public and editable portfolio pages
  js/                    Shared API clients and page scripts
  css/                   Global styles, modal styles, workspace/error styles
```

Important public pages:

- `/` landing page
- `/courses`
- `/learning-paths`
- `/certifications`
- `/corporate-training`
- `/certificate/verify`
- `/privacy`
- `/terms`
- `/maintenance`
- `/401`, `/403`, `/404`, `/500`, `/offline`

## Backend Structure

```text
src/
  app.ts                 Fastify app composition, static pages, route registration
  server.ts              Server startup
  routes/                HTTP route modules
  controllers/           Request handlers
  services/              Commands and queries
  repositories/          Data access helpers
  models/                Sequelize models and associations
  plugins/               Auth, Swagger, CSRF
  middlewares/           Auth, validation, audit
  utils/                 Certificates, tokens, notifications, sanitization
  templates/             Certificate HTML/SVG templates
```

## Core Backend Modules

```mermaid
flowchart LR
    Routes["Routes"]
    Controllers["Controllers"]
    Services["Commands / Queries"]
    Models["Sequelize Models"]
    DB[("PostgreSQL")]
    Utils["Utils<br/>Tokens, Certificates, Notifications"]

    Routes --> Controllers
    Controllers --> Services
    Services --> Models
    Models --> DB
    Services --> Utils
    Controllers --> Utils
```

## Data Model Overview

```mermaid
erDiagram
    User ||--o{ Enrollment : has
    User ||--o{ CourseCertificate : earns
    User ||--o{ AssignmentSubmission : submits
    User ||--o{ Message : sends
    User ||--o{ Portfolio : owns
    User ||--o{ Notification : receives

    Course ||--o{ Enrollment : contains
    Course ||--o{ CourseSection : has
    Course ||--o{ CourseCertificate : issues
    Course ||--o{ Assignment : includes
    Course ||--o{ CourseReview : receives

    CourseSection ||--o{ Lesson : contains
    Lesson ||--o{ LessonProgress : tracks
    Lesson ||--o{ LessonNote : has
    Lesson ||--o{ Quiz : may_have

    Assignment ||--o{ AssignmentSubmission : receives
    Assignment ||--o{ GradingRubricCriterion : uses

    DiscussionThread ||--o{ DiscussionReply : has
    SupportTicket ||--o{ SupportTicketMessage : has
    Report ||--o{ UserWarning : may_create
```

## Main Features

### Authentication and Roles

- Email/password registration
- OTP verification
- Login and logout
- OAuth command support
- JWT authentication
- Role guards for learner, tutor, admin, and superadmin

### Learning

- Course catalog and course detail pages
- Enrollment and resume-learning flow
- Lesson viewer
- Lesson progress tracking
- Notes, bookmarks, wishlist
- Quizzes and attempts
- Assignments, file upload submissions, grading, feedback
- Gradebook and student detail pages

### Teaching

- Tutor dashboard
- Course creation flow
- Course builder for modules, lessons, quizzes, resources, coupons
- Assignment builder
- Submission queues and grading
- Student analytics
- Office hours and mentorship
- Earnings overview and period detail pages

### Community

- Discussions
- Groups
- Timeline posts
- Followers
- Direct messages
- Notifications
- Public profiles
- Portfolio pages

### Operations

- Admin dashboard
- User management
- Reports and warnings
- Support tickets
- Email logs and templates
- Financial reporting
- System and compliance pages
- Superadmin plans, users, courses, enrollments, analytics

## Request Lifecycle

```mermaid
sequenceDiagram
    participant UI as Frontend Page
    participant API as Fastify Route
    participant Auth as Auth Middleware
    participant Service as Service Layer
    participant DB as PostgreSQL

    UI->>API: HTTP request with optional JWT
    API->>Auth: Authenticate and check role
    Auth-->>API: User context
    API->>Service: Execute command/query
    Service->>DB: Read/write models
    DB-->>Service: Result
    Service-->>API: Domain response
    API-->>UI: JSON response or HTML page
```

## Realtime Channels

```mermaid
flowchart LR
    UI["Authenticated Browser"]
    Notifications["/ws/notifications"]
    Messages["/ws/messages"]
    Discussions["/ws/discussions"]
    Hub["WebSocket Hubs"]
    DB[("PostgreSQL")]

    UI --> Notifications
    UI --> Messages
    UI --> Discussions
    Notifications --> Hub
    Messages --> Hub
    Discussions --> Hub
    Hub --> DB
```

## Important Routes

### Public Pages

| Route | Purpose |
| --- | --- |
| `/` | Landing page |
| `/courses` | Public course listing |
| `/course/:id` | Public course details |
| `/learning-paths` | Learning paths |
| `/certifications` | Certification catalog |
| `/corporate-training` | Corporate training |
| `/blog` | Blog |
| `/privacy` | Privacy policy |
| `/terms` | Terms of service |
| `/certificate/verify` | Manual certificate verification page |

### Student Pages

| Route | Purpose |
| --- | --- |
| `/students/dashboard` | Learner dashboard |
| `/courses/catalog` | Student catalog |
| `/lessons/:id` | Lesson viewer |
| `/assignments/:id/student` | Student assignment view |
| `/assignments/:id/student/submit` | Assignment submission page |
| `/students/certificates` | Certificates |
| `/students/progress` | Progress |
| `/students/grades` | Grades |
| `/students/study-planner` | Study planning |

### Tutor Pages

| Route | Purpose |
| --- | --- |
| `/tutor/dashboard` | Tutor dashboard |
| `/tutor/courses/create` | Course creation wizard |
| `/tutor/courses/builder/:id` | Course builder |
| `/tutor/assignments` | Assignment list |
| `/tutor/assignments/builder/:id` | Assignment builder |
| `/tutor/submissions` | Submission queues |
| `/tutor/earnings` | Earnings |
| `/tutor/earnings/:period` | Earnings detail |

### Admin Pages

| Route | Purpose |
| --- | --- |
| `/admin/dashboard` | Admin dashboard |
| `/admin/users` | User management |
| `/admin/reports` | Reports |
| `/admin/reports/export` | Report export |
| `/admin/warnings` | Warnings |
| `/admin/emails` | Email logs |
| `/admin/emails/templates` | Email templates |
| `/admin/system` | System settings |
| `/admin/system/logs` | System logs |
| `/admin/compliance` | Compliance center |

## Certificate API

| Method | Path | Description | Auth |
| --- | --- | --- | --- |
| GET | `/certificates` | List current user's certificates with share URLs | Required |
| GET | `/certificates/:courseId` | Get certificate for one course | Required |
| POST | `/certificates/issue` | Issue certificate after completion | Required |
| GET | `/certificates/verify/:certId` | Verify certificate as JSON | Public |
| GET | `/certificates/verify/:certId/page` | Public verification page | Public |
| GET | `/certificates/share/:certId` | Public share page | Public |
| GET | `/certificates/embed/:certId` | Small embeddable credential card | Public |
| GET | `/certificates/download/:certId` | Download PDF | Public |
| GET | `/certificates/export/:certId?format=png` | Export PNG or PDF | Public |

## Setup

Install dependencies:

```bash
npm install
```

Configure environment:

```bash
cp .env.example .env
```

Minimum important values:

```env
PORT=4000
DATABASE_URL=postgres://user:password@localhost:5432/learnbridge
JWT_SECRET=replace_with_a_long_random_secret
UPLOAD_DIR=uploads
CORS_ORIGIN=http://localhost:4000
PUBLIC_BASE_URL=http://localhost:4000
```

Build:

```bash
npm run build
```

Start compiled server:

```bash
npm start
```

Development mode:

```bash
npm run dev
```

Health check:

```bash
curl http://localhost:4000/api/health
```

Swagger docs:

```text
http://localhost:4000/docs
```

## Environment Notes

| Variable | Purpose |
| --- | --- |
| `PUBLIC_BASE_URL` | Canonical URL used for certificates, LinkedIn, embeds, and public links |
| `BRAND_APP_URL` | Alternate public app URL |
| `BRAND_LOGO_URL` | Logo used on certificate verification pages |
| `UPLOAD_DIR` | Upload and generated certificate storage |
| `CERT_IMAGE_CACHE_DIR` | Optional certificate image export cache |
| `CERT_CACHE_ENABLED` | Enables certificate export cache |
| `CERT_PDF_LANDSCAPE` | Renders certificates in landscape PDF format |
| `SMTP_*` | Email delivery |
| `PAYSTACK_*` | Payment integration |
| `REDIS_ENABLED` | Optional Redis support |
| `CSRF_ENABLED` | Optional CSRF protection |
| `CSP_ENABLED` | Optional Content Security Policy |

## Security Model

```mermaid
flowchart TB
    Request["Incoming Request"]
    RateLimit["Rate Limiting"]
    Auth["JWT Authentication"]
    Role["Role Guard"]
    Validate["Validation"]
    Audit["Audit / Logs"]
    Handler["Controller"]

    Request --> RateLimit --> Auth --> Role --> Validate --> Handler
    Handler --> Audit
```

Security features include:

- Password hashing with Argon2
- JWT authentication
- Role-based authorization
- Rate limits on sensitive routes
- Helmet security headers
- Optional CSRF protection
- Upload size limits
- Public certificate verification by immutable certificate ID
- Admin audit and warning workflows

## Current Validation

Run:

```bash
npm run build
```

The TypeScript build should complete before deployment. Runtime app construction also depends on valid model associations and environment configuration.

## Author

Built by Oluwayemi Oyinlola Michael.

- Website: https://oyinlola.site
- X: https://x.com/oyinlola141
