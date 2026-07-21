# LearnBridge LMS — Bug Report & Audit

**Date:** 2026-07-21  
**Repository:** `C:\Users\donri\Desktop\LMS`  
**Scanned:** Backend (`src/`, `prisma/`) + Frontend (`public/`)

---

## Table of Contents

1. [Critical Security Issues](#critical-security-issues)
2. [Backend Bugs](#backend-bugs)
3. [Backend Inconsistencies](#backend-inconsistencies)
4. [Frontend Bugs & Issues](#frontend-bugs--issues)
5. [Missing Frontend Pages](#missing-frontend-pages)
6. [Unlinked / Orphaned Pages](#unlinked--orphaned-pages)
7. [Broken Frontend Links](#broken-frontend-links)
8. [Navigation Structure Issues](#navigation-structure-issues)
9. [Suggested Next Pages](#suggested-next-pages)
10. [Recommended Structure Improvements](#recommended-structure-improvements)

---

## Critical Security Issues

### 1. Development Email Preview Exposes All Templates Without Auth
**File:** `src/routes/emailPreview.route.ts`  
**Severity:** HIGH

Dead code logic makes all email templates publicly accessible when `DEV_EMAIL_PREVIEW=true`. The second auth check is unreachable because the first `if (!devEmailPreview)` returns 403.

```typescript
// Line 69-76: Dead code — auth check is unreachable
if (!devEmailPreview) {
  return error(reply, 403, 'FORBIDDEN', 'Email preview disabled');
}
if (!devEmailPreview) {  // <-- DEAD CODE
  await fastify.authenticate(request, reply);
}
```

**Fix:** Remove the dead code or ensure auth is properly enforced.

### 2. Dev Certificate Issue Allows Arbitrary User ID Injection
**File:** `src/routes/certificates.route.ts`  
**Severity:** HIGH

The `/dev-issue` endpoint accepts a `userId` from the request body and creates certificates for any user when `DEV_EMAIL_PREVIEW=true`.

```typescript
const targetUserId = userId || request.user!.sub; // Line 162
```

**Fix:** Remove the `userId` parameter or restrict to the authenticated user only.

### 3. SMTP TLS Certificate Verification Disabled
**File:** `src/services/mail/transporter.ts`  
**Line:** 26  
**Severity:** HIGH

```typescript
tls: { rejectUnauthorized: false, family: 4 },
```

Disables TLS verification, making email traffic vulnerable to MITM attacks.

**Fix:** Set `rejectUnauthorized: true` and configure proper certificates.

### 4. User Role ENUM Missing `super_admin` in Sequelize Model
**File:** `src/models/User.model.ts`  
**Line:** 31  
**Severity:** HIGH

The Sequelize User model's role column ENUM only includes `'learner'`, `'tutor'`, `'admin'` — missing `'super_admin'`. The Prisma schema, enums, and routes all use `super_admin`, causing runtime failures.

```typescript
role: { type: DataTypes.ENUM('learner', 'tutor', 'admin'), allowNull: false, defaultValue: 'learner' },
```

**Fix:** Update to `DataTypes.ENUM('learner', 'tutor', 'admin', 'super_admin')`.

### 5. CORS Allows All Origins in Development
**File:** `src/app.ts`  
**Lines:** 84-87  
**Severity:** MEDIUM-HIGH

```typescript
origin: corsOrigins.length ? corsOrigins : (isDevelopment ? true : false),
```

`NODE_ENV` can be spoofed, accidentally enabling wildcard CORS in production.

**Fix:** Require explicit `CORS_ORIGIN` in all environments.

### 6. Admin-Created Users Bypass Email Verification
**File:** `src/routes/admin.route.ts`  
**Line:** 35  
**File:** `src/routes/adminInstructors.route.ts`  
**Line:** 141  
**Severity:** MEDIUM

```typescript
isEmailVerified: true, // Bypasses email verification
```

**Fix:** Send verification email or document the intentional bypass.

### 7. Optional Auth Silently Ignores Invalid JWT Secrets
**File:** `src/plugins/auth.plugin.ts`  
**Lines:** 75-76  
**Severity:** MEDIUM

```typescript
const secret = process.env.JWT_SECRET;
if (!secret || secret.length < 32) return; // Silently ignores invalid secret
```

**Fix:** Throw an error during app startup if `JWT_SECRET` is missing or too short.

### 8. Admin Financials PATCH Route Has Weak Authorization
**File:** `src/routes/adminFinancials.route.ts`  
**Lines:** 120-140  
**Severity:** MEDIUM-HIGH

`PATCH /payouts/:id` only uses `authenticate` instead of `requireAtLeastRole(UserRole.ADMIN)`, relying solely on `hasPermission` check.

**Fix:** Add `fastify.requireAtLeastRole(UserRole.ADMIN)` preHandler.

### 9. Contact Form Exposes Email Address
**File:** `src/routes/contact.route.ts`  
**Line:** 13  
**Severity:** LOW-MEDIUM

```typescript
to: process.env.CONTACT_EMAIL || 'hello@learnbridge.com',
```

Hardcoded fallback email exposed in client-side JS bundle.

### 10. Public Config Endpoint Exposes Internal Settings
**File:** `src/routes/public.route.ts`  
**Lines:** 10-19  
**Severity:** LOW

`/public/config` exposes `SUPPORT_EMAIL` and `BRAND_APP_URL` without authentication.

### 11. String Literal Used for Role Check Instead of Enum
**File:** `src/routes/support.route.ts`  
**Line:** 33  
**Severity:** MEDIUM

```typescript
if (request.user!.role !== 'admin' && ticket.UserId !== request.user!.sub)
```

Uses hardcoded `'admin'` instead of `UserRole.ADMIN`.

---

## Backend Bugs

### 1. Course Review Repository May Return Null Causing TypeError
**File:** `src/routes/course.route.ts`  
**Lines:** 128-129  
**Severity:** MEDIUM

```typescript
const existing = await courseReviewRepository.findByCourseId(id);
const mine = existing.find((r: any) => r.UserId === request.user!.sub);
```

If `findByCourseId` returns `null`, calling `.find()` throws a `TypeError`.

### 2. Enrollment Completion Bypasses Service Layer and Uses Wrong Date Type
**File:** `src/routes/enrollment.route.ts`  
**Lines:** 81-82  
**Severity:** MEDIUM

```typescript
enrollment.set('status', 'completed');
enrollment.set('completedAt', new Date().toISOString()); // String, but model expects DATE
```

Directly mutates the enrollment model instead of using the service layer. Also sets `completedAt` to an ISO string, but the Sequelize model defines it as `DataTypes.DATE`.

### 3. Non-Cryptographic Random Used for File Names
**File:** `src/routes/assignment.route.ts`  
**Line:** 94  
**File:** `src/routes/uploads.route.ts`  
**Line:** 26  
**Severity:** LOW-MEDIUM

```typescript
const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
```

`Math.random()` is not cryptographically secure.

### 4. Global Error Handler Exposes Messages in Development
**File:** `src/app.ts`  
**Lines:** 242  
**Severity:** LOW-MEDIUM

```typescript
message: isDevelopment ? ((err as Error).message || 'An unexpected error occurred') : 'An unexpected error occurred',
```

Exposes internal error details to clients in development mode.

### 5. Super Admin Creation Silently Fails When Env Vars Missing
**File:** `src/server.ts`  
**Lines:** 28-29  
**Severity:** LOW-MEDIUM

```typescript
if (!SUPER_ADMIN_EMAIL || !SUPER_ADMIN_PASSWORD) return;
```

If env vars are missing, the function returns silently, leaving the application without a super admin.

### 6. `sequelize.sync({ alter: true })` Dangerous in Production
**File:** `src/server.ts`  
**Line:** 66  
**Severity:** MEDIUM

```typescript
await sequelize.sync({ alter: String(DB_SYNC_ALTER) === 'true' });
```

Using `alter` in production can cause unexpected schema changes or data loss.

### 7. Blog Post Create Has Potential Crash
**File:** `src/routes/blog.route.ts`  
**Line:** 126

```typescript
excerpt: body.excerpt || body.content.slice(0, 200),
```

If `body.content` is `undefined`, `.slice(0, 200)` throws a `TypeError`.

### 8. Contact Form Returns 200 OK on Email Failure
**File:** `src/routes/contact.route.ts`  
**Lines:** 19-21  
**Severity:** MEDIUM

```typescript
} catch {
  return ok(reply, null, 'Message received. We will get back to you soon.');
}
```

When email sending fails, the endpoint returns 200 OK, making it impossible for the client to know if the message was delivered.

### 9. Mentorship Route Auth Logic Is Confusing
**File:** `src/routes/mentorship.route.ts`  
**Lines:** 48-51  
**Severity:** MEDIUM

```typescript
if (course.tutorId !== request.user!.sub && request.user!.role === UserRole.TUTOR) {
  return error(reply, 403, 'FORBIDDEN', 'Only the course tutor can view applications');
}
```

The condition means non-tutors (including admins) bypass this check. The logic is confusing and could lead to authorization bugs.

### 10. Assignment Model Has Fields Not in Prisma Schema
**File:** `src/models/Assignment.model.ts`  
**Lines:** 15-29  
**Severity:** MEDIUM

Fields `dueDaysFromEnrollment`, `instructions`, `downloadAssetsUrl`, `estimatedTime`, `coreObjective`, `keyDeliverables`, `proTip`, `difficulty`, `type`, `totalPoints` exist in Sequelize but not in Prisma schema.

### 11. CourseSection Model Has Extra Fields Not in Prisma Schema
**File:** `src/models/CourseSection.model.ts`  
**Lines:** 9-13  
**Severity:** MEDIUM

Fields `coreObjective`, `keyDeliverables`, `moduleBrief`, `coverImage` exist in Sequelize but not in Prisma schema.

### 12. User Model Has `fcmToken` Not in Prisma Schema
**File:** `src/models/User.model.ts`  
**Line:** 23  
**Severity:** LOW-MEDIUM

`fcmToken` field exists in Sequelize model but not in Prisma schema.

### 13. AssignmentResource and GradingRubricCriterion Missing from Prisma Schema
**File:** `prisma/schema.prisma`  
**Severity:** MEDIUM

These Sequelize models exist and are used in code but have no corresponding Prisma schema definitions.

### 14. Bare Catch Blocks Swallow Errors
**Files:** Multiple  
**Severity:** MEDIUM

Many route handlers use bare `catch` blocks that return generic 500 errors without logging:
- `src/routes/enrollment.route.ts` lines 20-22, 29-31
- `src/routes/course.route.ts` lines 36-38, 44-47
- `src/routes/contact.route.ts` lines 19-21
- `src/routes/discussionGroup.route.ts` multiple locations

### 15. Forgot Password Returns Generic Error on Failure
**File:** `src/routes/auth.route.ts`  
**Lines:** 152-154  
**Severity:** LOW

Bare catch block returns a generic error without any AppError handling or logging.

---

## Backend Inconsistencies

### 1. `routes/index.ts` Missing Multiple Route Exports
**File:** `src/routes/index.ts`  
**Severity:** MEDIUM

Does not export:
- `adminFinancialsRoutes`
- `tutorFinancialsRoutes`
- `tutorAssignmentBuilderRoutes`
- `publicRoutes`
- `followRoutes`
- `blogRoutes`
- `careerRoutes`
- `contactRoutes`
- `discussionGroupRoutes`

These are imported directly in `app.ts`, so the app works, but `routes/index.ts` is incomplete.

### 2. `services/index.ts` Is Highly Incomplete
**File:** `src/services/index.ts`  
**Severity:** MEDIUM

Only exports ~60 services but there are ~200+ service files. Routes import directly from service file paths.

### 3. Dual ORM — Prisma Schema Unused at Runtime
**Files:** `prisma/schema.prisma`, `src/generated/prisma/`, `src/config/db.config.ts`  
**Severity:** HIGH

The application uses **Sequelize** at runtime, but also maintains a full **Prisma** schema with generated client code. The Prisma client is generated but **never imported or used**.

### 4. Inconsistent Authorization Patterns
**Files:** Multiple route files  
**Severity:** MEDIUM

Some admin routes use `requireAtLeastRole(UserRole.ADMIN)` in the route definition, while others only use `authenticate` and check permissions inside the handler.

### 5. Swagger/OpenAPI Docs Exposed Without Authentication
**File:** `src/plugins/swagger.plugin.ts`  
**Lines:** 27-30  
**Severity:** LOW-MEDIUM

The Swagger UI is available at `/docs` without any authentication.

---

## Frontend Bugs & Issues

### 1. Blog Post Page Crashes on Missing Content
**File:** `public/pages/blog.html`  
**Line:** 45

```javascript
p.excerpt || p.content.slice(0, 200)
```

If `p.content` is `undefined`, `.slice(0, 200)` throws a `TypeError`. Same bug exists in `src/routes/blog.route.ts` line 126.

### 2. Missing `api.js` Import in `public/pages/blog.html`
**File:** `public/pages/blog.html`  
**Severity:** MEDIUM

The page uses `BlogAPI.list()` but only loads `api.js` indirectly through other scripts. However, `api.js` is not explicitly included in the script tags.

### 3. `messages.js` Has Type Casting Issue
**File:** `public/js/messages.js`  
**Line:** 9

```javascript
(opts as any).month = 'short';
(opts as any).day = 'numeric';
```

Uses `as any` in plain JavaScript, which will throw a `ReferenceError` at runtime.

### 4. Admin Dashboard JS Uses Wrong API Response Shape
**File:** `public/js/admin/index.js`  
**Lines:** 31-36

```javascript
$('stat-users').textContent = data.totalUsers ?? '—'
$('stat-courses').textContent = data.totalCourses ?? '—'
$('stat-enrollments').textContent = data.totalEnrollments ?? '—'
$('stat-revenue').textContent = data.revenue != null ? `$${data.revenue.toLocaleString()}` : '—'
```

The backend `adminDashboard.route.ts` returns `totals: { users, userGrowthPercent, activeCourses, pendingAllocations, ... }`, not `totalUsers`, `totalCourses`, etc. The frontend expects a flat structure that doesn't match the API response.

### 5. Student Dashboard Links to Non-Existent Routes
**File:** `public/students/js/dashboard.js`  
**Lines:** 94, 129

```javascript
window.location.href = '/courses/' + c.id + '/materials' // Line 94
window.location.href = '/courses/' + c.id + '/discussions/' + d.id // Line 129 (tutor dashboard)
```

`/courses/:id/materials` and `/courses/:id/discussions/:id` are not registered in `app.ts`.

### 6. Tutor Dashboard Links to Non-Existent Routes
**File:** `public/tutors/js/dashboard.js`  
**Line:** 107

```javascript
window.location.href = '/tutor/submissions/' + s.submissionId;
```

`/tutor/submissions/:id` is not registered in `app.ts`.

### 7. Profile Page JS Has Hardcoded API Endpoint
**File:** `public/js/profile.js`  
**Line:** 121

```javascript
api.get('/api/groups?createdBy=' + profileId)
```

The backend `discussionGroup.route.ts` doesn't support a `createdBy` query parameter for the public `GET /` endpoint.

### 8. Missing `api.js` in Several Pages
Multiple pages load `api.js` through other scripts but don't include it explicitly. This is fragile and may break if script loading order changes.

---

## Missing Frontend Pages

Based on the backend routes and sidebar navigation, the following pages are **referenced but do not exist**:

| Missing Route | Expected HTML File | Referenced From |
|---------------|-------------------|-----------------|
| `/announcements` | `public/pages/announcements.html` | `students/index.html` line 90 |
| `/dashboard/learning` | `public/pages/learning.html` or similar | `students/components/dashboard-sidebar.html` line 9 |
| `/dashboard/milestones` | `public/pages/milestones.html` or similar | `students/components/dashboard-sidebar.html` line 12 |
| `/dashboard/communities` | `public/pages/communities.html` or similar | `students/components/dashboard-sidebar.html` line 15 |
| `/dashboard/support` | `public/pages/support.html` or similar | `students/components/dashboard-sidebar.html` line 21 |
| `/mentorship` | `public/pages/mentorship.html` or similar | `students/index.html` line 137, `public/pages/community.html` line 36 |
| `/assignments` | `public/pages/assignments.html` or similar | `public/tutors/components/tutor-sidebar.html` line 10 |
| `/tutor/analytics` | `public/tutors/analytics.html` or similar | `public/tutors/components/tutor-sidebar.html` line 14 |
| `/tutor/reviews` | `public/tutors/reviews.html` or similar | `public/tutors/components/tutor-sidebar.html` line 18 |
| `/tutor/students` | `public/tutors/students.html` or similar | `public/tutors/components/tutor-sidebar.html` line 20 |
| `/blog/:slug` | `public/blog/[slug].html` or dynamic handler | `public/pages/blog.html` line 44, `public/js/index.js` line 66 |
| `/profile/:id` | Already exists but has JS bugs | Multiple pages |

---

## Unlinked / Orphaned Pages

These HTML files exist in `public/` but are **not registered in `app.ts`** or **not linked from any navigation**:

| File | Issue |
|------|-------|
| `public/admin/profile.html` | Not registered in `app.ts` pages array |
| `public/superadmin/profile.html` | Not registered in `app.ts` pages array |
| `public/tutors/profile.html` | Not registered in `app.ts` pages array |
| `public/students/profile/index.html` | Not registered in `app.ts` pages array |
| `public/students/profile/setup.html` | Registered at `/profile/setup` but not linked from header |
| `public/tutors/assignment/assignment-details.html` | Not registered in `app.ts` |
| `public/tutors/assignment/builder.html` | Registered at `/tutor/assignments/builder/:id` but not linked from sidebar |
| `public/mentors/index.html` | Registered at `/mentors` but not linked from header/footer |
| `public/blog/index.html` | Registered at `/blog` but not linked from header/footer (only `/blog` is in pages) |
| `public/courses/course-details.html` | Registered at `/course/:id` but the page uses `admin-layout` class which may cause styling issues |
| `public/students/assignment.html` | Registered at `/assignments/:id/student` but not linked from anywhere |

---

## Broken Frontend Links

### In Header (`public/components/header.html`)
| Link | Target | Issue |
|------|--------|-------|
| `/courses` | `/courses` | OK |
| `/learning-paths` | `/learning-paths` | OK |
| `/blog` | `/blog` | OK |
| `/discussions` | `/discussions` | OK |
| `/about` | `/about` | OK |
| `/messages` | `/messages` | OK |
| `/dashboard` | `/dashboard` | OK (authenticated) |
| `/profile/me` | `/profile/me` | OK |
| `/login` | `/login` | OK |
| `/register` | `/register` | OK |

### In Footer (`public/components/footer.html`)
| Link | Target | Issue |
|------|--------|-------|
| `/courses` | `/courses` | OK |
| `/learning-paths` | `/learning-paths` | OK |
| `/certifications` | `/certifications` | OK |
| `/corporate-training` | `/corporate-training` | OK |
| `/about` | `/about` | OK |
| `/careers` | `/careers` | OK |
| `/blog` | `/blog` | OK |
| `/contact` | `/contact` | OK |
| `/terms` | `/terms` | OK |
| `/privacy` | `/privacy` | OK |
| `/cookie-settings` | `/cookie-settings` | OK |
| `/support` | `/support` | OK |
| `/community` | `/community` | OK |

### Broken Links Found
| Source | Link | Issue |
|--------|------|-------|
| `public/students/index.html` line 90 | `/announcements` | Page does not exist |
| `public/students/index.html` line 137 | `/mentorship` | Page does not exist |
| `public/students/js/dashboard.js` line 94 | `/courses/:id/materials` | Route not registered |
| `public/students/js/dashboard.js` line 113 | `/api/groups?createdBy=` | Query param not supported by backend |
| `public/tutors/js/dashboard.js` line 107 | `/tutor/submissions/:id` | Route not registered |
| `public/tutors/js/dashboard.js` line 129 | `/courses/:id/discussions/:id` | Route not registered |
| `public/tutors/components/tutor-sidebar.html` | `#` (My Courses, Analytics, Reviews, Students, Blog Posts, Settings) | All dead links |
| `public/admin/components/admin-sidebar.html` | `#` (Courses, Users, Enrollments, Blog, Careers, Support, Settings) | All dead links |
| `public/students/components/dashboard-sidebar.html` | `/dashboard/learning`, `/dashboard/milestones`, `/dashboard/communities`, `/dashboard/support` | Pages do not exist |
| `public/pages/community.html` line 36 | Mentorship card | Links to `/mentorship` which doesn't exist |
| `public/pages/certifications.html` | No API calls | Static content only — should fetch real certifications |

---

## Navigation Structure Issues

### 1. Admin Sidebar Has All Dead Links
**File:** `public/admin/components/admin-sidebar.html`

All navigation links (`#`) are placeholders. The admin sidebar has no working internal navigation.

### 2. Tutor Sidebar Has Multiple Dead Links
**File:** `public/tutors/components/tutor-sidebar.html`

"My Courses", "Analytics", "Reviews", "Students", "Blog Posts", and "Settings" all link to `#`.

### 3. Student Dashboard Sidebar Links to Missing Pages
**File:** `public/students/components/dashboard-sidebar.html`

"My Learning", "Milestones", "Communities", and "Support" link to pages that don't exist.

### 4. Super Admin Bottom Nav All Links to Same Page
**File:** `public/superadmin/components/superadmin-bottom-nav.html`

All nav items link to `/superadmin`, making navigation impossible.

### 5. No Mobile Navigation for Student Dashboard
The student dashboard sidebar is hidden on mobile (`display: none` at `< 768px`), but there's no alternative mobile navigation provided.

---

## Suggested Next Pages

### High Priority (Missing Core Functionality)
1. **`/announcements`** — `public/pages/announcements.html` (referenced from dashboard)
2. **`/mentorship`** — `public/pages/mentorship.html` (referenced from community and dashboard)
3. **`/dashboard/learning`** — Student's ongoing courses with lesson viewer
4. **`/dashboard/milestones`** — Full milestones management page
5. **`/dashboard/communities`** — Student's group management
6. **`/dashboard/support`** — Student's support tickets
7. **`/assignments`** — Student assignments list and submission
8. **`/tutor/assignments`** — Tutor assignment management (exists but not linked)
9. **`/tutor/analytics`** — Tutor analytics page
10. **`/tutor/reviews`** — Tutor reviews management
11. **`/tutor/students`** — Tutor student management
12. **`/blog/:slug`** — Individual blog post page (dynamic or SPA-style)
13. **`/courses/:id/materials`** — Course materials/curriculum page
14. **`/courses/:id/discussions/:id`** — Course discussion thread page
15. **`/tutor/submissions/:id`** — Individual submission grading page

### Medium Priority (Admin/Tutor Experience)
16. **`/admin/courses`** — Admin course management
17. **`/admin/users`** — Admin user management (exists but sidebar link is dead)
18. **`/admin/enrollments`** — Admin enrollment management
19. **`/admin/blog`** — Admin blog management
20. **`/admin/careers`** — Admin career management
21. **`/admin/support`** — Admin support tickets
22. **`/admin/settings`** — Admin platform settings
23. **`/tutor/courses`** — Tutor course management
24. **`/tutor/settings`** — Tutor settings

### Low Priority (Nice-to-Have)
25. **`/search`** — Global search page
26. **`/wishlist`** — Saved courses wishlist
27. **`/certificates`** — User certificates page (backend exists at `/certificates`)
28. **`/progress`** — Detailed learning progress analytics
29. **`/bookmarks`** — Lesson bookmarks page
30. **`/notes`** — Lesson notes page

---

## Recommended Structure Improvements

### Backend
1. **Consolidate ORMs:** Remove Prisma or make it the primary ORM. Having both Sequelize and Prisma with a full schema causes maintenance burden and risk of drift.
2. **Fix `routes/index.ts`:** Export all route modules for consistency.
3. **Fix `services/index.ts`:** Complete the barrel exports or document that direct imports are intentional.
4. **Standardize auth patterns:** Use `requireAtLeastRole` consistently across all admin routes.
5. **Add startup validation:** Validate all required env vars (`JWT_SECRET`, `DATABASE_URL`, etc.) at startup, not silently ignore them.
6. **Enable TLS verification:** Fix SMTP transporter to validate certificates.
7. **Remove dead code:** Clean up unreachable auth checks in email preview routes.
8. **Add proper error logging:** Replace bare `catch` blocks with proper logging.

### Frontend
1. **Create a central routing/linking system:** Instead of hardcoding links in every HTML file, create a central navigation config.
2. **Fix the admin sidebar:** Replace all `#` links with actual routes.
3. **Fix the tutor sidebar:** Replace all `#` links with actual routes.
4. **Fix the superadmin bottom nav:** Each tab should link to a different page or section.
5. **Add mobile navigation:** Provide a hamburger menu for the student dashboard on mobile.
6. **Standardize script loading:** Explicitly include `api.js` in every page that makes API calls, rather than relying on indirect loading.
7. **Create a shared API client:** Move `api.js`, `auth.js`, and other API files into a shared location and ensure all pages use them.
8. **Add a 404 page:** Create `public/pages/404.html` and register it as a catch-all.
9. **Fix CSS class conflicts:** The `admin-layout` class is used on the course details page but it's not an admin page.
10. **Add page titles:** Several pages have hardcoded titles that don't update based on content (e.g., blog posts, course details).

### Architecture
1. **Separate public and authenticated layouts:** Currently, the same header/footer are used for both. Consider separate layouts for logged-in vs. logged-out users.
2. **Add a proper frontend framework:** Consider migrating to React, Vue, or Svelte for better state management and routing. The current vanilla JS approach with `data-include` is fragile.
3. **Add a build step:** Currently, HTML/JS/CSS files are served as-is. A build step would enable minification, bundling, and asset optimization.
4. **Add E2E tests:** There are no frontend tests. Add Playwright or Cypress tests for critical user flows.

---

## Summary

| Category | Count | Severity |
|----------|-------|----------|
| Security Issues | 11 | 3 HIGH, 5 MEDIUM, 3 LOW-MEDIUM |
| Backend Bugs | 15 | 2 MEDIUM, 7 LOW-MEDIUM, 6 LOW |
| Backend Inconsistencies | 5 | 1 HIGH, 2 MEDIUM, 2 LOW-MEDIUM |
| Frontend Bugs | 8 | 2 MEDIUM, 4 LOW-MEDIUM, 2 LOW |
| Missing Pages | 15+ | — |
| Broken Links | 13+ | — |
| Navigation Issues | 5 | — |

**Top Priority Fixes:**
1. Fix `User.model.ts` role ENUM to include `super_admin`
2. Add authentication to email preview routes or disable them in production
3. Remove or restrict `/dev-issue` certificate endpoint
4. Enable TLS verification in SMTP transporter
5. Fix CORS configuration to require explicit origins
6. Fix admin dashboard JS to match API response shape
7. Fix broken student/tutor dashboard links
8. Create missing pages referenced from sidebars
9. Remove or isolate the unused Prisma schema to prevent drift
10. Fix dead links in admin and tutor sidebars
