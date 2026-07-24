# Bug Report — LearnBridge LMS

## Critical Bugs

### 1. Malformed .env Line (Line 138)
**File:** `.env`
**Issue:** `DATABASE_URL` and `PAYSTACK_API_URL` are concatenated on one line without a newline separator. This causes `PAYSTACK_API_URL` to not be parsed correctly by dotenv.
```
# DATABASE_URL=postgresql://root:Oyinlola@localhost:5432/learnbridge?schema=publicPAYSTACK_API_URL=https://api.paystack.co
```
**Fix:** Split into two separate lines (already fixed).
**Status:** FIXED

---

### 2. Missing /profile/me Route
**File:** `src/app.ts`, `public/components/header.html`
**Issue:** The header navigation links to `/profile/me`, but `app.ts` only has `/profile/:id` which requires a UUID. Navigating to `/profile/me` results in a 404.
**Fix:** Add a `/profile/me` route in `app.ts` that redirects to the current user's profile or renders the profile page.

---

### 3. Webhook Routes Missing Rate Limiting
**File:** `src/routes/webhook.route.ts`
**Issue:** `POST /webhook/sendbyte` and `POST /webhook/paystack` have no rate limiting. These are security-critical endpoints vulnerable to brute-force and DoS attacks.
**Fix:** Add rate limiting to webhook routes, especially the Paystack webhook which handles payment events.

---

### 4. Payment Routes Missing Rate Limiting
**File:** `src/routes/payment.route.ts`
**Issue:** `POST /payments/initialize`, `POST /payments/verify`, and `GET /payments/history` have no rate limiting. Payment endpoints are high-value targets for brute-force and DDoS attacks.
**Fix:** Add per-route rate limiting to payment initialization (e.g., 10 requests per minute).

---

### 5. No CSRF Protection
**Files:** `src/app.ts`, `src/plugins/auth.plugin.ts`
**Issue:** The application has no CSRF protection. All state-changing endpoints (POST/PUT/PATCH/DELETE) are vulnerable to CSRF attacks when using cookie-based authentication.
**Fix:** Implement CSRF protection using `@fastify/csrf` or double-submit cookie pattern.

---

## Backend Issues

### 6. Missing Indexes on Foreign Keys (Performance)
Many Sequelize models lack indexes on foreign key columns, which causes slow JOIN queries at scale. Affected models include: Lesson, CourseSection, Assignment, Enrollment, AdminAuditLog, Notification, Milestone, OfficeHour, CourseAnnouncement, CourseCertificate, CourseCoupon, AssignmentRequirement, AssignmentResource, AssignmentSubmission, LessonContent, LessonResource, LessonNote, LessonBookmark, LearnerStats, UserSkillProgress, UserStreak, WeeklyTimeLog, QuizAttempt, GradingRubricCriterion, and all Portfolio models.

---

### 7. Dead Code — Validation Middleware
**File:** `src/middlewares/validate.middleware.ts`
**Issue:** Exports `validateBody`, `validateParams`, `validateQuery`, but none of these are imported or used in any route file. 200+ lines of dead code.
**Fix:** Either remove the middleware or integrate it into the routes.

---

### 8. JWT Algorithm Not Explicitly Specified
**File:** `src/plugins/auth.plugin.ts` line 55
**Issue:** `jwt.verify(token, secret)` is called without specifying the `algorithms` option. While modern `jsonwebtoken` rejects `none` algorithm by default, explicit algorithm declaration is a defense-in-depth best practice.
**Fix:** Add `algorithms: ['HS256']` to the `jwt.verify` call (consistent with `wsHub.util.ts` and `wsDiscussions.util.ts`).

---

### 9. Hardcoded 'superadmin' String Instead of Enum
**File:** `src/controllers/portfolio.controller.ts` line 86
**Issue:** Uses string literal `'superadmin'` instead of `UserRole.SUPER_ADMIN` enum value. Inconsistent and error-prone.
**Fix:** Replace with `UserRole.SUPER_ADMIN`.

---

### 10. Missing onDelete for Enrollment.lastLessonId
**File:** `src/models/Enrollment.model.ts` line 44
**Issue:** `lastLessonId` foreign key has no `onDelete` specified. If a lesson is deleted, the reference becomes a dangling foreign key.
**Fix:** Add `onDelete: 'SET NULL'` to the `lastLessonId` association.

---

## Frontend Issues

### 11. Missing HTML Pages Not Registered in app.ts
The following HTML files exist in `public/` but have no corresponding server route in `src/app.ts`:

| File | Expected Route |
|---|---|
| `public/admin/pages/warnings.html` | `/admin/warnings` |
| `public/superadmin/dashboard.html` | `/superadmin/dashboard` |
| `public/superadmin/pages/plans.html` | `/superadmin/plans` |
| `public/students/pages/communities.html` | `/students/communities` |
| `public/students/pages/groups.html` | `/students/groups` |
| `public/students/pages/warnings.html` | `/students/warnings` |
| `public/tutors/pages/communities.html` | `/tutors/communities` |
| `public/tutors/pages/groups.html` | `/tutors/groups` |
| `public/mentors/manage.html` | `/mentors/manage` |
| `public/chat-content.html` | Not a page (partial only) |

---

### 12. Broken Header Links
| Link | Location | Issue |
|---|---|---|
| `/profile/me` | `public/components/header.html` | No `/profile/me` route exists; only `/profile/:id` (UUID) |
| `/profile` | `public/tutors/components/tutor-header.html` | Requires UUID, not a valid direct link |
| `/profile` | `public/admin/components/admin-header.html` | Same issue |

---

### 13. Missing Route Exports from `src/routes/index.ts`
The following route files exist but are not re-exported from `src/routes/index.ts`:
- `adminEmail.route.ts`
- `adminReports.route.ts`
- `marketing.route.ts`
- `payment.route.ts`
- `webhook.route.ts`

---

### 14. Unlinked Admin Warnings Page
`public/admin/pages/warnings.html` exists but is not accessible via any navigation in the admin sidebar or header. It should be linked from `public/admin/components/admin-sidebar.html`.

---

## Suggested New Pages

### Student Pages
1. **`public/students/pages/achievements.html`** — Student achievement and milestone tracking
2. **`public/students/pages/grades.html`** — Gradebook view for students
3. **`public/students/pages/support.html`** — Student support ticket creation

### Tutor Pages
1. **`public/tutors/pages/earnings.html`** — Tutor earnings and payout history
2. **`public/tutors/pages/students.html`** — List of tutor students
3. **`public/tutors/pages/analytics.html`** — Detailed tutor analytics
4. **`public/tutors/pages/calendar.html`** — Office hours and schedule calendar
5. **`public/tutors/pages/submissions.html`** — Assignment submissions queue

### Admin Pages
1. **`public/admin/pages/warnings.html`** — Already exists, needs route and nav link
2. **`public/admin/pages/system.html`** — System health and configuration

### Super Admin Pages
1. **`public/superadmin/dashboard.html`** — Already exists, needs route registration
2. **`public/superadmin/pages/plans.html`** — Already exists, needs route registration
3. **`public/superadmin/pages/analytics.html`** — Platform-wide analytics

---

## Rate Limiting Recommendations

### Current State
- Global: 200 requests per 15 minutes (applies to all routes)
- Auth: 30 requests per 10 minutes (per auth route)
- Contact: 3 requests per minute

### Recommended Additions
| Endpoint | Limit | Window |
|---|---|---|
| `POST /webhook/sendbyte` | 50 | 1 minute |
| `POST /webhook/paystack` | 50 | 1 minute |
| `POST /payments/initialize` | 10 | 1 minute |
| `POST /payments/verify` | 10 | 1 minute |
| `POST /messages/threads` | 30 | 1 minute |
| `POST /auth/register` | 5 | 15 minutes |
| `POST /auth/login` | 5 | 15 minutes |
| `POST /auth/forgot-password` | 3 | 15 minutes |
