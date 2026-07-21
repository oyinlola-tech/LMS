# API Endpoints Contract

Generated from `docs/swagger.json` on 2026-04-10T12:50:18.563Z.

API: **undefined API** (v1.0.0)

## POST /admin/create-tutor

- Name: Admin creates tutor

### Request

- Path/Query/Header Params:
- None

- Body:
- Required: Yes
- application/json: Schema:CreateTutorRequest

### Responses

- 201: Tutor created
- application/json: None
- 401: Unauthorized
- Content: none
- 403: Forbidden
- Content: none

---

## GET /admin/dashboard

- Name: Admin dashboard overview

### Request

- Path/Query/Header Params:
- range (query, optional) -> string

- Body: None

### Responses

- 200: Admin dashboard data
- Content: none
- 403: Forbidden
- Content: none

---

## GET /admin/dashboard/audit

- Name: Admin audit trail

### Request

- Path/Query/Header Params:
- limit (query, optional) -> number

- Body: None

### Responses

- 200: Audit log list
- Content: none
- 403: Forbidden
- Content: none

---

## GET /admin/dashboard/export

- Name: Admin dashboard export (CSV)

### Request

- Path/Query/Header Params:
- range (query, optional) -> string

- Body: None

### Responses

- 200: CSV export
- Content: none
- 403: Forbidden
- Content: none

---

## GET /admin/dashboard/report

- Name: Admin report (PDF or JSON)

### Request

- Path/Query/Header Params:
- range (query, optional) -> string
- format (query, optional) -> string

- Body: None

### Responses

- 200: Report generated
- Content: none
- 403: Forbidden
- Content: none

---

## POST /admin/instructors

- Name: Create instructor (admin)

### Request

- Path/Query/Header Params:
- None

- Body:
- Required: Yes
- application/json: object

### Responses

- 201: Instructor created
- Content: none

---

## GET /admin/instructors/{id}

- Name: Admin instructor profile

### Request

- Path/Query/Header Params:
- id (path, required) -> string

- Body: None

### Responses

- 200: Instructor loaded
- Content: none

---

## PATCH /admin/instructors/{id}

- Name: Update instructor (admin)

### Request

- Path/Query/Header Params:
- id (path, required) -> string

- Body:
- Required: Yes
- application/json: object

### Responses

- 200: Instructor updated
- Content: none

---

## POST /admin/instructors/{id}/courses

- Name: Assign course to instructor

### Request

- Path/Query/Header Params:
- id (path, required) -> string

- Body:
- Required: Yes
- application/json: object

### Responses

- 200: Course assigned
- Content: none

---

## GET /admin/instructors/{id}/notes

- Name: Instructor notes

### Request

- Path/Query/Header Params:
- id (path, required) -> string

- Body: None

### Responses

- 200: Notes loaded
- Content: none

---

## POST /admin/instructors/{id}/notes

- Name: Add instructor note

### Request

- Path/Query/Header Params:
- id (path, required) -> string

- Body:
- Required: Yes
- application/json: object

### Responses

- 201: Note added
- Content: none

---

## GET /admin/support/tickets

- Name: Admin list support tickets

### Request

- Path/Query/Header Params:
- None

- Body: None

### Responses

- 200: Tickets list
- Content: none

---

## GET /admin/support/tickets/{id}

- Name: Admin support ticket detail

### Request

- Path/Query/Header Params:
- id (path, required) -> string

- Body: None

### Responses

- 200: Ticket loaded
- Content: none

---

## GET /admin/users

- Name: Admin list users

### Request

- Path/Query/Header Params:
- page (query, optional) -> number
- limit (query, optional) -> number
- role (query, optional) -> string
- status (query, optional) -> string
- q (query, optional) -> string

- Body: None

### Responses

- 200: Users list
- Content: none
- 403: Forbidden
- Content: none

---

## POST /admin/users

- Name: Create user (admin)

### Request

- Path/Query/Header Params:
- None

- Body:
- Required: Yes
- application/json: object

### Responses

- 200: User created
- Content: none

---

## GET /admin/users/{id}

- Name: Admin view user profile

### Request

- Path/Query/Header Params:
- id (path, required) -> string

- Body: None

### Responses

- 200: User detail
- Content: none
- 404: Not found
- Content: none

---

## GET /admin/users/{id}/activity

- Name: User activity (admin)

### Request

- Path/Query/Header Params:
- id (path, required) -> string

- Body: None

### Responses

- 200: Activity feed
- Content: none

---

## GET /admin/users/{id}/metrics

- Name: User metrics (admin)

### Request

- Path/Query/Header Params:
- id (path, required) -> string

- Body: None

### Responses

- 200: Metrics loaded
- Content: none

---

## GET /admin/users/{id}/notes

- Name: User notes (admin)

### Request

- Path/Query/Header Params:
- id (path, required) -> string

- Body: None

### Responses

- 200: Notes loaded
- Content: none

---

## POST /admin/users/{id}/notes

- Name: Add user note (admin)

### Request

- Path/Query/Header Params:
- id (path, required) -> string

- Body:
- Required: Yes
- application/json: object

### Responses

- 201: Note added
- Content: none

---

## PATCH /admin/users/{id}/role

- Name: Admin update user role

### Request

- Path/Query/Header Params:
- id (path, required) -> string

- Body:
- Required: Yes
- application/json: object

### Responses

- 200: User role updated
- Content: none
- 400: Validation error
- Content: none

---

## GET /admin/users/{id}/role-history

- Name: User role history (admin)

### Request

- Path/Query/Header Params:
- id (path, required) -> string

- Body: None

### Responses

- 200: Role history loaded
- Content: none

---

## PATCH /admin/users/{id}/status

- Name: Admin update user status

### Request

- Path/Query/Header Params:
- id (path, required) -> string

- Body:
- Required: Yes
- application/json: object

### Responses

- 200: User status updated
- Content: none
- 400: Validation error
- Content: none

---

## PATCH /admin/users/{id}/team

- Name: Admin assign team

### Request

- Path/Query/Header Params:
- id (path, required) -> string

- Body:
- Required: Yes
- application/json: object

### Responses

- 200: User team updated
- Content: none
- 400: Validation error
- Content: none

---

## GET /assignments

- Name: List assignments (learner/tutor)

### Request

- Path/Query/Header Params:
- page (query, optional) -> integer
- limit (query, optional) -> integer

- Body: None

### Responses

- 200: Assignments list
- Content: none

---

## GET /assignments/course/{courseId}

- Name: Assignments by course

### Request

- Path/Query/Header Params:
- courseId (path, required) -> string

- Body: None

### Responses

- 200: Assignments list
- Content: none

---

## GET /assignments/module/{moduleId}

- Name: Assignments by module

### Request

- Path/Query/Header Params:
- moduleId (path, required) -> string

- Body: None

### Responses

- 200: Assignments list
- Content: none

---

## GET /assignments/{id}

- Name: Assignment details

### Request

- Path/Query/Header Params:
- id (path, required) -> string

- Body: None

### Responses

- 200: Assignment details
- Content: none
- 404: Not found
- Content: none

---

## GET /assignments/{id}/attempts

- Name: Assignment attempts

### Request

- Path/Query/Header Params:
- id (path, required) -> string

- Body: None

### Responses

- 200: Attempts loaded
- Content: none

---

## GET /assignments/{id}/details

- Name: Assignment details (alias)

### Request

- Path/Query/Header Params:
- id (path, required) -> string

- Body: None

### Responses

- 200: Assignment detail
- Content: none

---

## POST /assignments/{id}/grade

- Name: Grade assignment submission

### Request

- Path/Query/Header Params:
- id (path, required) -> string

- Body:
- Required: Yes
- application/json: Schema:AssignmentGradeRequest

### Responses

- 200: Submission graded
- Content: none
- 403: Forbidden
- Content: none

---

## POST /assignments/{id}/start

- Name: Start assignment

### Request

- Path/Query/Header Params:
- id (path, required) -> string

- Body: None

### Responses

- 200: Assignment started
- Content: none

---

## GET /assignments/{id}/submission

- Name: Get my submission

### Request

- Path/Query/Header Params:
- id (path, required) -> string

- Body: None

### Responses

- 200: Submission data
- Content: none
- 404: Not found
- Content: none

---

## GET /assignments/{id}/submissions

- Name: List submissions (tutor)

### Request

- Path/Query/Header Params:
- id (path, required) -> string

- Body: None

### Responses

- 200: Submissions list
- Content: none
- 403: Forbidden
- Content: none

---

## GET /assignments/{id}/submissions/me

- Name: My assignment submission

### Request

- Path/Query/Header Params:
- id (path, required) -> string

- Body: None

### Responses

- 200: Submission loaded
- Content: none

---

## GET /assignments/{id}/submissions/{submissionId}

- Name: Get submission (tutor)

### Request

- Path/Query/Header Params:
- id (path, required) -> string
- submissionId (path, required) -> string

- Body: None

### Responses

- 200: Submission data
- Content: none
- 403: Forbidden
- Content: none
- 404: Not found
- Content: none

---

## PUT /assignments/{id}/submissions/{submissionId}

- Name: Update assignment submission

### Request

- Path/Query/Header Params:
- id (path, required) -> string
- submissionId (path, required) -> string

- Body:
- Required: Yes
- application/json: object

### Responses

- 200: Submission updated
- Content: none

---

## GET /assignments/{id}/submissions/{submissionId}/download

- Name: Download submission (tutor)

### Request

- Path/Query/Header Params:
- id (path, required) -> string
- submissionId (path, required) -> string

- Body: None

### Responses

- 302: Redirect to file
- Content: none
- 403: Forbidden
- Content: none
- 404: Not found
- Content: none

---

## POST /assignments/{id}/submit

- Name: Submit assignment

### Request

- Path/Query/Header Params:
- id (path, required) -> string

- Body:
- Required: Yes
- application/json: Schema:AssignmentSubmitRequest

### Responses

- 201: Assignment submitted
- Content: none
- 400: Validation error
- Content: none

---

## POST /assignments/{id}/submit-upload

- Name: Submit assignment (upload file)

### Request

- Path/Query/Header Params:
- id (path, required) -> string

- Body:
- Required: Yes
- multipart/form-data: object

### Responses

- 201: Assignment submitted
- Content: none
- 400: Validation error
- Content: none

---

## POST /auth/forgot-password

- Name: Request password reset

### Request

- Path/Query/Header Params:
- None

- Body:
- Required: Yes
- application/json: Schema:ForgotPasswordRequest

### Responses

- 200: Always returns OK to avoid email enumeration
- application/json: None

---

## GET /auth/github

- Name: GitHub OAuth start

### Request

- Path/Query/Header Params:
- None

- Body: None

### Responses

- 302: Redirect to GitHub
- Content: none

---

## GET /auth/github/callback

- Name: GitHub OAuth callback

### Request

- Path/Query/Header Params:
- None

- Body: None

### Responses

- 200: Returns JWT or redirects
- Content: none

---

## GET /auth/google

- Name: Google OAuth start

### Request

- Path/Query/Header Params:
- None

- Body: None

### Responses

- 302: Redirect to Google
- Content: none

---

## GET /auth/google/callback

- Name: Google OAuth callback

### Request

- Path/Query/Header Params:
- None

- Body: None

### Responses

- 200: Returns JWT or redirects
- Content: none

---

## POST /auth/login

- Name: Login

### Request

- Path/Query/Header Params:
- None

- Body:
- Required: Yes
- application/json: Schema:LoginRequest

### Responses

- 200: OK
- application/json: Schema:LoginResponse
- 401: Invalid credentials
- Content: none
- 403: Email not verified
- Content: none

---

## POST /auth/logout

- Name: Logout (client-side)

### Request

- Path/Query/Header Params:
- None

- Body: None

### Responses

- 200: Logged out
- Content: none

---

## POST /auth/register

- Name: Register learner

### Request

- Path/Query/Header Params:
- None

- Body:
- Required: Yes
- application/json: Schema:RegisterRequest

### Responses

- 201: Registered
- application/json: None
- 400: Validation error
- Content: none
- 409: Email already in use
- Content: none

---

## POST /auth/resend-otp

- Name: Resend verification OTP

### Request

- Path/Query/Header Params:
- None

- Body:
- Required: Yes
- application/json: Schema:ResendOtpRequest

### Responses

- 200: OTP resent
- application/json: None
- 400: Already verified or invalid request
- Content: none
- 404: User not found
- Content: none
- 429: Too many requests
- Content: none

---

## POST /auth/reset-password

- Name: Reset password

### Request

- Path/Query/Header Params:
- None

- Body:
- Required: Yes
- application/json: Schema:ResetPasswordRequest

### Responses

- 200: Password reset
- application/json: None
- 400: Token invalid/expired
- Content: none

---

## POST /auth/verify-otp

- Name: Verify email OTP

### Request

- Path/Query/Header Params:
- None

- Body:
- Required: Yes
- application/json: Schema:OtpVerifyRequest

### Responses

- 200: Verified
- application/json: None
- 400: OTP invalid/expired
- Content: none
- 404: User not found
- Content: none

---

## POST /billing/subscribe

- Name: Create subscription

### Request

- Path/Query/Header Params:
- None

- Body:
- Required: Yes
- application/json: object

### Responses

- 201: Subscription created
- Content: none

---

## GET /billing/subscription

- Name: Get subscription

### Request

- Path/Query/Header Params:
- None

- Body: None

### Responses

- 200: Subscription loaded
- Content: none

---

## PUT /builder/assignments/{id}

- Name: Update assignment

### Request

- Path/Query/Header Params:
- id (path, required) -> string

- Body:
- Required: Yes
- application/json: object

### Responses

- 200: Assignment updated
- Content: none

---

## DELETE /builder/assignments/{id}

- Name: Delete assignment

### Request

- Path/Query/Header Params:
- id (path, required) -> string

- Body: None

### Responses

- 200: Assignment deleted
- Content: none

---

## POST /builder/courses

- Name: Create course draft (tutor)

### Request

- Path/Query/Header Params:
- None

- Body:
- Required: Yes
- application/json: object

### Responses

- 201: Course draft created
- Content: none

---

## GET /builder/courses

- Name: List my courses (tutor)

### Request

- Path/Query/Header Params:
- None

- Body: None

### Responses

- 200: Courses list
- Content: none

---

## GET /builder/courses/{id}

- Name: Get course draft with modules/lessons

### Request

- Path/Query/Header Params:
- id (path, required) -> string

- Body: None

### Responses

- 200: Course draft
- Content: none
- 404: Not found
- Content: none

---

## PUT /builder/courses/{id}

- Name: Update course draft (tutor)

### Request

- Path/Query/Header Params:
- id (path, required) -> string

- Body:
- Required: Yes
- application/json: object

### Responses

- 200: Course updated
- Content: none

---

## POST /builder/courses/{id}/apply-coupon

- Name: Apply coupon (preview)

### Request

- Path/Query/Header Params:
- id (path, required) -> string

- Body:
- Required: Yes
- application/json: object

### Responses

- 200: Coupon applied
- Content: none

---

## POST /builder/courses/{id}/assignments

- Name: Create assignment

### Request

- Path/Query/Header Params:
- id (path, required) -> string

- Body:
- Required: Yes
- application/json: object

### Responses

- 201: Assignment created
- Content: none

---

## POST /builder/courses/{id}/coupons

- Name: Create coupon

### Request

- Path/Query/Header Params:
- id (path, required) -> string

- Body:
- Required: Yes
- application/json: object

### Responses

- 201: Coupon created
- Content: none

---

## POST /builder/courses/{id}/cover

- Name: Upload course cover image

### Request

- Path/Query/Header Params:
- id (path, required) -> string

- Body:
- Required: Yes
- multipart/form-data: object

### Responses

- 200: Cover updated
- Content: none

---

## POST /builder/courses/{id}/enrollment-preview

- Name: Enrollment preview

### Request

- Path/Query/Header Params:
- id (path, required) -> string

- Body: None

### Responses

- 200: Enrollment preview
- Content: none

---

## POST /builder/courses/{id}/modules

- Name: Create module

### Request

- Path/Query/Header Params:
- id (path, required) -> string

- Body:
- Required: Yes
- application/json: object

### Responses

- 201: Module created
- Content: none

---

## PUT /builder/courses/{id}/modules/reorder

- Name: Reorder modules

### Request

- Path/Query/Header Params:
- id (path, required) -> string

- Body:
- Required: Yes
- application/json: object

### Responses

- 200: Modules reordered
- Content: none

---

## GET /builder/courses/{id}/preview

- Name: Course preview (tutor)

### Request

- Path/Query/Header Params:
- id (path, required) -> string

- Body: None

### Responses

- 200: Course preview
- Content: none

---

## POST /builder/courses/{id}/publish

- Name: Publish course

### Request

- Path/Query/Header Params:
- id (path, required) -> string

- Body: None

### Responses

- 200: Course published
- Content: none

---

## POST /builder/courses/{id}/unpublish

- Name: Unpublish course

### Request

- Path/Query/Header Params:
- id (path, required) -> string

- Body: None

### Responses

- 200: Course unpublished
- Content: none

---

## PUT /builder/lessons/{lessonId}

- Name: Update lesson

### Request

- Path/Query/Header Params:
- lessonId (path, required) -> string

- Body:
- Required: Yes
- application/json: object

### Responses

- 200: Lesson updated
- Content: none

---

## DELETE /builder/lessons/{lessonId}

- Name: Delete lesson

### Request

- Path/Query/Header Params:
- lessonId (path, required) -> string

- Body: None

### Responses

- 200: Lesson deleted
- Content: none

---

## POST /builder/lessons/{lessonId}/content

- Name: Add lesson content

### Request

- Path/Query/Header Params:
- lessonId (path, required) -> string

- Body:
- Required: Yes
- application/json: object

### Responses

- 201: Lesson content added
- Content: none

---

## POST /builder/lessons/{lessonId}/media

- Name: Upload lesson media

### Request

- Path/Query/Header Params:
- lessonId (path, required) -> string

- Body:
- Required: Yes
- multipart/form-data: object

### Responses

- 200: Media uploaded
- Content: none

---

## PUT /builder/lessons/{lessonId}/media-url

- Name: Set lesson media URL

### Request

- Path/Query/Header Params:
- lessonId (path, required) -> string

- Body:
- Required: Yes
- application/json: object

### Responses

- 200: Video URL set
- Content: none

---

## POST /builder/lessons/{lessonId}/quiz

- Name: Create quiz for lesson

### Request

- Path/Query/Header Params:
- lessonId (path, required) -> string

- Body:
- Required: Yes
- application/json: object

### Responses

- 201: Quiz created
- Content: none

---

## POST /builder/lessons/{lessonId}/resources

- Name: Upload lesson resource (tutor)

### Request

- Path/Query/Header Params:
- lessonId (path, required) -> string

- Body:
- Required: Yes
- multipart/form-data: object

### Responses

- 201: Resource uploaded
- Content: none

---

## PUT /builder/modules/{moduleId}

- Name: Update module

### Request

- Path/Query/Header Params:
- moduleId (path, required) -> string

- Body:
- Required: Yes
- application/json: object

### Responses

- 200: Module updated
- Content: none

---

## DELETE /builder/modules/{moduleId}

- Name: Delete module

### Request

- Path/Query/Header Params:
- moduleId (path, required) -> string

- Body: None

### Responses

- 200: Module deleted
- Content: none

---

## POST /builder/modules/{moduleId}/lessons

- Name: Create lesson

### Request

- Path/Query/Header Params:
- moduleId (path, required) -> string

- Body:
- Required: Yes
- application/json: object

### Responses

- 201: Lesson created
- Content: none

---

## PUT /builder/modules/{moduleId}/lessons/reorder

- Name: Reorder lessons

### Request

- Path/Query/Header Params:
- moduleId (path, required) -> string

- Body:
- Required: Yes
- application/json: object

### Responses

- 200: Lessons reordered
- Content: none

---

## GET /categories

- Name: Categories list

### Request

- Path/Query/Header Params:
- None

- Body: None

### Responses

- 200: Categories loaded
- Content: none

---

## GET /certificates

- Name: List certificates

### Request

- Path/Query/Header Params:
- None

- Body: None

### Responses

- 200: Certificates list
- Content: none

---

## GET /certificates/badge

- Name: LearnBridge Verified badge (SVG)

### Request

- Path/Query/Header Params:
- None

- Body: None

### Responses

- 200: SVG badge
- Content: none

---

## GET /certificates/badge.png

- Name: LearnBridge Verified badge (PNG)

### Request

- Path/Query/Header Params:
- None

- Body: None

### Responses

- 200: PNG badge
- Content: none

---

## GET /certificates/badge/page

- Name: LearnBridge Verified badge page (social share)

### Request

- Path/Query/Header Params:
- None

- Body: None

### Responses

- 200: HTML badge share page
- Content: none

---

## GET /certificates/download/{certId}

- Name: Download certificate PDF

### Request

- Path/Query/Header Params:
- certId (path, required) -> string

- Body: None

### Responses

- 200: PDF file
- Content: none
- 404: Not found
- Content: none

---

## GET /certificates/export/{certId}

- Name: Export certificate as PNG or PDF

### Request

- Path/Query/Header Params:
- certId (path, required) -> string
- format (query, optional) -> string

- Body: None

### Responses

- 200: PNG or PDF export
- Content: none
- 404: Not found
- Content: none

---

## POST /certificates/issue

- Name: Issue certificate

### Request

- Path/Query/Header Params:
- None

- Body:
- Required: Yes
- application/json: object

### Responses

- 201: Certificate issued
- Content: none
- 403: Forbidden
- Content: none

---

## GET /certificates/preview

- Name: Certificate preview (dev)

### Request

- Path/Query/Header Params:
- format (query, optional) -> string
- studentName (query, optional) -> string
- courseTitle (query, optional) -> string
- instructorName (query, optional) -> string
- issueDate (query, optional) -> string
- grade (query, optional) -> string
- courseHours (query, optional) -> number

- Body: None

### Responses

- 200: HTML or PDF preview
- Content: none
- 403: Disabled
- Content: none

---

## GET /certificates/preview/gallery

- Name: Certificate preview gallery (dev)

### Request

- Path/Query/Header Params:
- None

- Body: None

### Responses

- 200: HTML gallery of PDF previews
- Content: none
- 403: Disabled
- Content: none

---

## GET /certificates/verify/{certId}

- Name: Verify certificate

### Request

- Path/Query/Header Params:
- certId (path, required) -> string

- Body: None

### Responses

- 200: Certificate verified
- Content: none
- 404: Not found
- Content: none

---

## GET /certificates/verify/{certId}/page

- Name: Certificate verification landing page

### Request

- Path/Query/Header Params:
- certId (path, required) -> string

- Body: None

### Responses

- 200: HTML verification page
- Content: none
- 404: Not found
- Content: none

---

## GET /certificates/{courseId}

- Name: Get certificate by course

### Request

- Path/Query/Header Params:
- courseId (path, required) -> string

- Body: None

### Responses

- 200: Certificate data
- Content: none
- 404: Not found
- Content: none

---

## GET /courses

- Name: List courses

### Request

- Path/Query/Header Params:
- specialization (query, optional) -> string
- category (query, optional) -> string
- difficulty (query, optional) -> string
- q (query, optional) -> string

- Body: None

### Responses

- 200: Course list
- Content: none

---

## GET /courses/featured

- Name: Featured courses

### Request

- Path/Query/Header Params:
- None

- Body: None

### Responses

- 200: Featured courses loaded
- Content: none

---

## GET /courses/recommended

- Name: Recommended courses

### Request

- Path/Query/Header Params:
- None

- Body: None

### Responses

- 200: Recommendations loaded
- Content: none

---

## GET /courses/{id}

- Name: Course details

### Request

- Path/Query/Header Params:
- id (path, required) -> string

- Body: None

### Responses

- 200: Course details
- Content: none
- 404: Not found
- Content: none

---

## GET /courses/{id}/announcements

- Name: Course announcements

### Request

- Path/Query/Header Params:
- id (path, required) -> string

- Body: None

### Responses

- 200: Announcements list
- Content: none

---

## POST /courses/{id}/announcements

- Name: Create announcement (tutor)

### Request

- Path/Query/Header Params:
- id (path, required) -> string

- Body:
- Required: Yes
- application/json: Schema:AnnouncementCreateRequest

### Responses

- 201: Announcement created
- Content: none
- 403: Forbidden
- Content: none

---

## GET /courses/{id}/comments

- Name: Course comments

### Request

- Path/Query/Header Params:
- id (path, required) -> string

- Body: None

### Responses

- 200: Comments list
- Content: none

---

## POST /courses/{id}/comments

- Name: Post course comment

### Request

- Path/Query/Header Params:
- id (path, required) -> string

- Body:
- Required: Yes
- application/json: object

### Responses

- 201: Comment posted
- Content: none
- 403: Forbidden
- Content: none

---

## GET /courses/{id}/curriculum

- Name: Course curriculum (learner)

### Request

- Path/Query/Header Params:
- id (path, required) -> string

- Body: None

### Responses

- 200: Curriculum loaded
- Content: none

---

## POST /courses/{id}/enroll

- Name: Enroll in course

### Request

- Path/Query/Header Params:
- id (path, required) -> string

- Body: None

### Responses

- 201: Enrollment created
- Content: none
- 404: Not found
- Content: none

---

## GET /courses/{id}/events

- Name: Course events

### Request

- Path/Query/Header Params:
- id (path, required) -> string

- Body: None

### Responses

- 200: Events list
- Content: none

---

## POST /courses/{id}/events

- Name: Create event (tutor)

### Request

- Path/Query/Header Params:
- id (path, required) -> string

- Body:
- Required: Yes
- application/json: Schema:EventCreateRequest

### Responses

- 201: Event created
- Content: none
- 403: Forbidden
- Content: none

---

## GET /courses/{id}/preview

- Name: Course preview (learner)

### Request

- Path/Query/Header Params:
- id (path, required) -> string

- Body: None

### Responses

- 200: Course preview
- Content: none

---

## GET /courses/{id}/pricing

- Name: Course pricing

### Request

- Path/Query/Header Params:
- id (path, required) -> string

- Body: None

### Responses

- 200: Pricing loaded
- Content: none

---

## GET /courses/{id}/reviews

- Name: Course reviews

### Request

- Path/Query/Header Params:
- id (path, required) -> string

- Body: None

### Responses

- 200: Reviews loaded
- Content: none

---

## GET /dashboard/overview

- Name: Learner dashboard overview

### Request

- Path/Query/Header Params:
- None

- Body: None

### Responses

- 200: Dashboard data
- Content: none
- 401: Unauthorized
- Content: none

---

## GET /departments

- Name: Departments list

### Request

- Path/Query/Header Params:
- None

- Body: None

### Responses

- 200: Departments loaded
- Content: none

---

## GET /dev/email/gallery

- Name: Email preview gallery (dev)

### Request

- Path/Query/Header Params:
- None

- Body: None

### Responses

- 200: HTML gallery
- Content: none
- 403: Disabled
- Content: none

---

## GET /discussions/threads

- Name: Discussion threads

### Request

- Path/Query/Header Params:
- courseId (query, optional) -> string
- q (query, optional) -> string
- page (query, optional) -> integer
- limit (query, optional) -> integer

- Body: None

### Responses

- 200: Threads list
- Content: none

---

## POST /discussions/threads

- Name: Create discussion thread

### Request

- Path/Query/Header Params:
- None

- Body:
- Required: Yes
- application/json: object

### Responses

- 201: Thread created
- Content: none

---

## GET /discussions/threads/{id}

- Name: Discussion thread detail

### Request

- Path/Query/Header Params:
- id (path, required) -> string
- limit (query, optional) -> integer
- offset (query, optional) -> integer

- Body: None

### Responses

- 200: Thread detail
- Content: none

---

## POST /discussions/threads/{id}/replies

- Name: Add discussion reply

### Request

- Path/Query/Header Params:
- id (path, required) -> string

- Body:
- Required: Yes
- application/json: object

### Responses

- 201: Reply added
- Content: none

---

## GET /enrollments

- Name: List enrollments

### Request

- Path/Query/Header Params:
- None

- Body: None

### Responses

- 200: Enrollments list
- Content: none

---

## GET /enrollments/resume

- Name: Resume last lesson

### Request

- Path/Query/Header Params:
- None

- Body: None

### Responses

- 200: Resume data
- Content: none

---

## GET /enrollments/{id}

- Name: Get enrollment

### Request

- Path/Query/Header Params:
- id (path, required) -> string

- Body: None

### Responses

- 200: Enrollment loaded
- Content: none

---

## PUT /enrollments/{id}/progress

- Name: Update progress

### Request

- Path/Query/Header Params:
- id (path, required) -> string

- Body:
- Required: Yes
- application/json: Schema:ProgressUpdateRequest

### Responses

- 200: Progress updated
- Content: none
- 404: Not found
- Content: none

---

## GET /gradebook/students

- Name: Gradebook students (tutor)

### Request

- Path/Query/Header Params:
- None

- Body: None

### Responses

- 200: Students list
- Content: none

---

## GET /gradebook/students/{id}

- Name: Gradebook student detail (tutor)

### Request

- Path/Query/Header Params:
- id (path, required) -> string

- Body: None

### Responses

- 200: Student detail
- Content: none

---

## PUT /gradebook/students/{id}/assignments/{assignmentId}/grade

- Name: Grade student assignment (tutor)

### Request

- Path/Query/Header Params:
- id (path, required) -> string
- assignmentId (path, required) -> string

- Body:
- Required: Yes
- application/json: object

### Responses

- 200: Submission graded
- Content: none

---

## GET /instructor/activity

- Name: Instructor activity

### Request

- Path/Query/Header Params:
- None

- Body: None

### Responses

- 200: Activity loaded
- Content: none

---

## GET /instructor/analytics

- Name: Instructor analytics

### Request

- Path/Query/Header Params:
- None

- Body: None

### Responses

- 200: Analytics loaded
- Content: none

---

## GET /instructor/courses

- Name: Instructor courses

### Request

- Path/Query/Header Params:
- None

- Body: None

### Responses

- 200: Courses loaded
- Content: none

---

## GET /instructor/courses/stats

- Name: Instructor course stats

### Request

- Path/Query/Header Params:
- None

- Body: None

### Responses

- 200: Stats loaded
- Content: none

---

## GET /instructor/reviews

- Name: Instructor reviews

### Request

- Path/Query/Header Params:
- None

- Body: None

### Responses

- 200: Reviews loaded
- Content: none

---

## POST /instructor/support

- Name: Instructor support ticket

### Request

- Path/Query/Header Params:
- None

- Body:
- Required: Yes
- application/json: object

### Responses

- 201: Ticket created
- Content: none

---

## GET /instructors/{id}

- Name: Public instructor profile

### Request

- Path/Query/Header Params:
- id (path, required) -> string

- Body: None

### Responses

- 200: Instructor loaded
- Content: none

---

## GET /lessons/{id}

- Name: Lesson details

### Request

- Path/Query/Header Params:
- id (path, required) -> string

- Body: None

### Responses

- 200: Lesson details
- Content: none
- 403: Forbidden
- Content: none
- 404: Not found
- Content: none

---

## GET /lessons/{id}/bookmarks

- Name: Lesson bookmarks

### Request

- Path/Query/Header Params:
- id (path, required) -> string

- Body: None

### Responses

- 200: Bookmarks list
- Content: none

---

## POST /lessons/{id}/bookmarks

- Name: Add lesson bookmark

### Request

- Path/Query/Header Params:
- id (path, required) -> string

- Body:
- Required: No
- application/json: object

### Responses

- 201: Bookmark added
- Content: none

---

## DELETE /lessons/{id}/bookmarks/{bookmarkId}

- Name: Delete lesson bookmark

### Request

- Path/Query/Header Params:
- id (path, required) -> string
- bookmarkId (path, required) -> string

- Body: None

### Responses

- 200: Bookmark deleted
- Content: none

---

## GET /lessons/{id}/comments

- Name: Lesson comments

### Request

- Path/Query/Header Params:
- id (path, required) -> string

- Body: None

### Responses

- 200: Comments loaded
- Content: none

---

## POST /lessons/{id}/comments

- Name: Add lesson comment

### Request

- Path/Query/Header Params:
- id (path, required) -> string

- Body:
- Required: Yes
- application/json: object

### Responses

- 201: Comment added
- Content: none

---

## POST /lessons/{id}/complete

- Name: Mark lesson complete

### Request

- Path/Query/Header Params:
- id (path, required) -> string

- Body:
- Required: No
- application/json: Schema:LessonCompleteRequest

### Responses

- 201: Lesson completed
- Content: none

---

## GET /lessons/{id}/notes

- Name: Lesson notes

### Request

- Path/Query/Header Params:
- id (path, required) -> string

- Body: None

### Responses

- 200: Notes list
- Content: none

---

## POST /lessons/{id}/notes

- Name: Add lesson note

### Request

- Path/Query/Header Params:
- id (path, required) -> string

- Body:
- Required: Yes
- application/json: object

### Responses

- 201: Note added
- Content: none

---

## DELETE /lessons/{id}/notes/{noteId}

- Name: Delete lesson note

### Request

- Path/Query/Header Params:
- id (path, required) -> string
- noteId (path, required) -> string

- Body: None

### Responses

- 200: Note deleted
- Content: none

---

## PUT /lessons/{id}/progress

- Name: Update lesson progress

### Request

- Path/Query/Header Params:
- id (path, required) -> string

- Body:
- Required: Yes
- application/json: object

### Responses

- 200: Lesson progress updated
- Content: none

---

## GET /lessons/{id}/quiz

- Name: Start quiz (randomized)

### Request

- Path/Query/Header Params:
- id (path, required) -> string

- Body: None

### Responses

- 200: Quiz loaded
- Content: none
- 404: Not found
- Content: none

---

## POST /lessons/{id}/quiz/submit

- Name: Submit quiz

### Request

- Path/Query/Header Params:
- id (path, required) -> string

- Body:
- Required: Yes
- application/json: object

### Responses

- 200: Quiz submitted
- Content: none

---

## GET /lessons/{id}/resources

- Name: Lesson resources

### Request

- Path/Query/Header Params:
- id (path, required) -> string

- Body: None

### Responses

- 200: Lesson resources
- Content: none

---

## POST /mentorship/apply

- Name: Apply for mentorship

### Request

- Path/Query/Header Params:
- None

- Body:
- Required: Yes
- application/json: object

### Responses

- 201: Application submitted
- Content: none

---

## GET /messages/threads

- Name: List message threads

### Request

- Path/Query/Header Params:
- page (query, optional) -> integer
- limit (query, optional) -> integer
- search (query, optional) -> string
- cursor (query, optional) -> string

- Body: None

### Responses

- 200: Threads list
- Content: none

---

## POST /messages/threads

- Name: Start a new conversation

### Request

- Path/Query/Header Params:
- None

- Body:
- Required: Yes
- application/json: object

### Responses

- 201: Thread created
- Content: none

---

## GET /messages/threads/{threadId}

- Name: Get thread messages

### Request

- Path/Query/Header Params:
- threadId (path, required) -> string
- page (query, optional) -> integer
- limit (query, optional) -> integer
- cursor (query, optional) -> string

- Body: None

### Responses

- 200: Thread detail
- Content: none

---

## POST /messages/threads/{threadId}/messages

- Name: Send message in thread

### Request

- Path/Query/Header Params:
- threadId (path, required) -> string

- Body:
- Required: Yes
- application/json: object

### Responses

- 201: Message sent
- Content: none

---

## GET /notifications

- Name: List notifications

### Request

- Path/Query/Header Params:
- unread (query, optional) -> boolean

- Body: None

### Responses

- 200: Notifications list
- Content: none

---

## POST /notifications

- Name: Create notification (self)

### Request

- Path/Query/Header Params:
- None

- Body:
- Required: Yes
- application/json: object

### Responses

- 200: Notification created
- Content: none

---

## POST /notifications/mark-all-read

- Name: Mark all notifications read

### Request

- Path/Query/Header Params:
- None

- Body: None

### Responses

- 200: All notifications marked read
- Content: none

---

## GET /notifications/stream

- Name: Real-time notification stream (SSE)

### Request

- Path/Query/Header Params:
- None

- Body: None

### Responses

- 200: text/event-stream (SSE)
- Content: none
- 401: Unauthorized
- Content: none

---

## PUT /notifications/{id}/read

- Name: Mark notification read

### Request

- Path/Query/Header Params:
- id (path, required) -> string

- Body: None

### Responses

- 200: Notification marked read
- Content: none

---

## GET /progress/overview

- Name: Learner progress overview

### Request

- Path/Query/Header Params:
- None

- Body: None

### Responses

- 200: Progress overview
- Content: none
- 401: Unauthorized
- Content: none

---

## GET /progress/streak

- Name: Learning streak

### Request

- Path/Query/Header Params:
- None

- Body: None

### Responses

- 200: Streak data
- Content: none

---

## GET /progress/timeline

- Name: Progress timeline

### Request

- Path/Query/Header Params:
- range (query, optional) -> string
- periods (query, optional) -> number

- Body: None

### Responses

- 200: Timeline data
- Content: none

---

## POST /progress/track-time

- Name: Track learning time

### Request

- Path/Query/Header Params:
- None

- Body:
- Required: Yes
- application/json: object

### Responses

- 200: Time tracked
- Content: none

---

## GET /submissions

- Name: List my submissions

### Request

- Path/Query/Header Params:
- page (query, optional) -> integer
- limit (query, optional) -> integer

- Body: None

### Responses

- 200: Submissions list
- Content: none

---

## POST /support/tickets

- Name: Create support ticket

### Request

- Path/Query/Header Params:
- None

- Body:
- Required: Yes
- application/json: object

### Responses

- 201: Ticket created
- Content: none

---

## GET /support/tickets

- Name: List support tickets

### Request

- Path/Query/Header Params:
- None

- Body: None

### Responses

- 200: Tickets list
- Content: none

---

## GET /support/tickets/{id}

- Name: Get support ticket

### Request

- Path/Query/Header Params:
- id (path, required) -> string

- Body: None

### Responses

- 200: Ticket loaded
- Content: none

---

## PUT /support/tickets/{id}

- Name: Update support ticket (admin)

### Request

- Path/Query/Header Params:
- id (path, required) -> string

- Body:
- Required: Yes
- application/json: object

### Responses

- 200: Ticket updated
- Content: none

---

## POST /support/tickets/{id}/messages

- Name: Add support ticket message

### Request

- Path/Query/Header Params:
- id (path, required) -> string

- Body:
- Required: Yes
- application/json: object

### Responses

- 201: Message added
- Content: none

---

## GET /tutor-dashboard/export

- Name: Export tutor analytics (CSV)

### Request

- Path/Query/Header Params:
- format (query, optional) -> string

- Body: None

### Responses

- 200: CSV export
- Content: none
- 403: Forbidden
- Content: none

---

## GET /tutor-dashboard/overview

- Name: Tutor dashboard overview

### Request

- Path/Query/Header Params:
- None

- Body: None

### Responses

- 200: Tutor dashboard data
- Content: none
- 403: Forbidden
- Content: none

---

## GET /tutor-dashboard/submission-queue

- Name: Submission queue (tutor)

### Request

- Path/Query/Header Params:
- sort (query, optional) -> string

- Body: None

### Responses

- 200: Submission queue
- Content: none

---

## GET /tutors

- Name: List tutors

### Request

- Path/Query/Header Params:
- None

- Body: None

### Responses

- 200: Tutors list
- Content: none

---

## POST /tutors/actions/email-students

- Name: Email all students (tutor)

### Request

- Path/Query/Header Params:
- None

- Body:
- Required: Yes
- application/json: object

### Responses

- 200: Emails sent
- Content: none
- 403: Forbidden
- Content: none

---

## POST /tutors/actions/post-update

- Name: Post update (tutor)

### Request

- Path/Query/Header Params:
- None

- Body:
- Required: Yes
- application/json: object

### Responses

- 200: Update posted
- Content: none
- 403: Forbidden
- Content: none

---

## POST /tutors/actions/schedule-office-hour

- Name: Schedule office hour (tutor)

### Request

- Path/Query/Header Params:
- None

- Body:
- Required: Yes
- application/json: object

### Responses

- 200: Office hour scheduled
- Content: none
- 403: Forbidden
- Content: none

---

## GET /tutors/recommended

- Name: Recommended mentors

### Request

- Path/Query/Header Params:
- None

- Body: None

### Responses

- 200: Recommended tutors
- Content: none

---

## POST /tutors/{id}/follow

- Name: Follow tutor

### Request

- Path/Query/Header Params:
- id (path, required) -> string

- Body: None

### Responses

- 201: Followed tutor
- Content: none

---

## DELETE /tutors/{id}/follow

- Name: Unfollow tutor

### Request

- Path/Query/Header Params:
- id (path, required) -> string

- Body: None

### Responses

- 200: Unfollowed tutor
- Content: none

---

## POST /uploads/avatar

- Name: Upload avatar image

### Request

- Path/Query/Header Params:
- None

- Body:
- Required: Yes
- multipart/form-data: object

### Responses

- 200: Avatar uploaded
- Content: none

---

## GET /users/me

- Name: Get my profile

### Request

- Path/Query/Header Params:
- None

- Body: None

### Responses

- 200: Profile data
- Content: none
- 401: Unauthorized
- Content: none

---

## PUT /users/me/avatar

- Name: Update my avatar URL

### Request

- Path/Query/Header Params:
- None

- Body:
- Required: Yes
- application/json: object

### Responses

- 200: Avatar updated
- Content: none

---

## PUT /users/me/email

- Name: Change my email

### Request

- Path/Query/Header Params:
- None

- Body:
- Required: Yes
- application/json: object

### Responses

- 200: Email updated
- Content: none

---

## PUT /users/me/interests

- Name: Update learner interests

### Request

- Path/Query/Header Params:
- None

- Body:
- Required: Yes
- application/json: Schema:InterestsUpdateRequest

### Responses

- 200: Interests updated
- Content: none
- 400: Validation error
- Content: none

---

## PUT /users/me/profile

- Name: Complete/update profile

### Request

- Path/Query/Header Params:
- None

- Body:
- Required: Yes
- application/json: Schema:ProfileUpdateRequest

### Responses

- 200: Profile updated
- application/json: None
- 401: Unauthorized
- Content: none

---

## PUT /users/me/weekly-goal

- Name: Update weekly goal

### Request

- Path/Query/Header Params:
- None

- Body:
- Required: Yes
- application/json: Schema:WeeklyGoalRequest

### Responses

- 200: Weekly goal updated
- Content: none
- 400: Validation error
- Content: none

---
