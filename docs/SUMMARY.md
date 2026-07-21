## Objective
Build a full-stack learning platform (LearnBridge) with Fastify + TypeScript + PostgreSQL, component-based frontend, role-based navigation, real-time group discussions via WebSocket, and Firebase push notifications.

## Architecture
- **Backend**: Fastify with TypeScript, Sequelize ORM, PostgreSQL, WebSocket (ws)
- **Frontend**: Vanilla JS with component-based HTML partials (`data-include`), Material Symbols icons
- **Auth**: JWT-based with OTP, password reset, role-based access (learner/tutor/admin)
- **WebSocket**: Three endpoints — `/ws/notifications`, `/ws/messages` (1:1 chat), `/ws/discussions` (group chat)
- **Push**: Firebase Cloud Messaging (placeholder config)

## Completed Services

### Models (all renamed to `.model.ts` convention)
- `BlogPost`, `BlogComment` — blog posts with threaded comments
- `Career` — job listings (admin-managed)
- `DiscussionGroup`, `GroupMember` — topic/course-based discussion groups with roles (admin/moderator/member)
- `DiscussionMessage` — persisted group chat messages
- `ThreadSubscription` — users can subscribe to group notifications
- `Follow` — generic user-to-user follow/unfollow
- All 53 models renamed from `.ts` to `.model.ts`

### Routes
- `/api/blog` — public blog listing, admin/tutor CRUD, comment CRUD
- `/api/careers` — public listing, admin-only CRUD
- `/api/groups` — discussion groups (CRUD, join/leave, members, messages history, subscribe/unsubscribe)
- `/api/follow/:userId` — follow/unfollow, followers/following lists, status check
- `/api/contact` — contact form submission
- `/auth`, `/users`, `/courses`, `/enrollments`, `/dashboard`, `/tutor-dashboard`, etc.
- Clean URL page routes mapped to `public/pages/`, `public/students/`, `public/tutors/`, `public/admin/`

### WebSocket
- `/ws/notifications` — real-time push notifications to individual users
- `/ws/messages` — 1:1 private messaging with thread management
- `/ws/discussions` — group real-time chat (join group, send messages, broadcast to members)

### Frontend Pages
- `public/pages/` — about, blog, careers, certifications, community, contact, cookie-settings, corporate-training, courses, discussions, learning-paths, privacy, support, terms
- `public/students/index.html` — learner dashboard with course progress
- `public/tutors/index.html` — tutor dashboard with submissions queue
- `public/admin/index.html` — admin dashboard with user management
- `public/components/` — header, footer, admin-sidebar, learner-sidebar, tutor-sidebar, auth-modal

### Home Page
- Data-driven: courses, stats, instructors (with TutorProfile), testimonials, and recent blog posts from API
- Animated testimonial marquee with consent-to-feature reviews
- Review popup after course completion (rating + comment + consent checkbox)
- `data-auth` attribute wiring for login-gated actions

### Discussions
- Group listing with search and "My Groups" tab
- Create group modal (name, description, public/private)
- Join/leave groups with one-click buttons
- Real-time WebSocket messaging within groups
- Message history via REST API
- Follow/unfollow users
- Subscribe/unsubscribe to group threads
- ThreadSubscription for email/push notification targeting

### Notifications
- Firebase Cloud Messaging integration (placeholder service account at `src/credentials/firebase.json`)
- FCM token registration endpoint (`PUT /users/fcm-token`)
- Broadcast notification via WebSocket and Firebase (when configured)
- `sendPushNotification()` utility

### Contact
- Functional contact form with backend API (`POST /api/contact`)
- AJAX submission with success/error feedback
- Email notification to admin on form submission

## Pending
- **Firebase credentials**: User to provide real `firebase.json` service account
- **Email notifications**: Wire up email for discussion activity (new group message, new follower, new reply)
- **Page content**: Continue enriching static pages with dynamic content as needed

## Testing
- TypeScript compiles with 0 errors (`npx tsc --noEmit`)
- All services committed and pushed individually to `origin/main`
