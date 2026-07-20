# TalentFlow Backend

TalentFlow is a comprehensive Udemy-style learning management platform (LMS) backend. This API provides secure authentication, course management, progress tracking, messaging, certificates, billing, and administrative tooling.

## Getting Started

New to TalentFlow? Start here:

1. **[Quick Start](#quick-start)** - Get the server running in 5 minutes
2. **[API Overview](#api-overview)** - See common endpoints
3. **[Documentation](documentations/README.md)** - Detailed API guides by role
4. **[Swagger UI](http://localhost:4000/docs)** - Interactive API explorer (when server running)

## Features

- **Authentication**: JWT with OTP email verification, password reset flows, social login (Google/GitHub)
- **Role-Based Access**: Distinct APIs for learners, tutors, instructors, and administrators
- **Course Management**: Course creation, enrollment, lessons, quizzes, assignments, progress tracking
- **Messaging**: Real-time WebSocket chat between users
- **Certificates**: PDF certificate generation with custom branding
- **Notifications**: Real-time WebSocket notifications, email delivery
- **Billing**: Subscription management and payment processing
- **Support**: Ticketing system for learner support
- **Admin Dashboard**: User management, analytics, audit logs
- **API Documentation**: Interactive Swagger UI at `/docs`

## Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: Express.js 5
- **Database**: MySQL with Sequelize ORM
- **Authentication**: JWT, Argon2id password hashing
- **Email**: Nodemailer (SMTP)
- **Queue**: Redis + BullMQ (optional async email queue)
- **WebSocket**: ws library for real-time features
- **PDF Generation**: PDFKit and Puppeteer
- **Documentation**: Swagger UI (OpenAPI 3)

## Prerequisites

1. **Node.js** 20 or higher
2. **MySQL** 5.7 or higher (or MySQL-compatible database)
3. **Redis** (optional, for queue and real-time features)
4. **SMTP server** (or email service like SendGrid, Mailgun)

## Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd Stitch_Design _backend
npm install
```

### 2. Configure Environment

Copy the example environment file and update with your values:

```bash
cp .env.example .env
```

Edit `.env` with your database, SMTP, and other settings. Required variables:

```env
# Database (required)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=talentflow

# Authentication (required)
JWT_SECRET=your_secure_jwt_secret_min_32_chars

# Application (required)
PORT=4000
APP_NAME=TalentFlow
SWAGGER_SERVER_URL=http://localhost:4000
```

### 3. Start Database

Create a MySQL database:

```sql
CREATE DATABASE talentflow;
```

Or set `DB_CREATE_IF_MISSING=true` in your `.env` to have the server create it automatically.

### 4. Start the Server

```bash
npm start
```

The server will:
1. Connect to MySQL
2. Create/migrate database tables
3. Start the HTTP server on port 4000

### 5. Access the API

- **API Base URL**: http://localhost:4000
- **Swagger Docs**: http://localhost:4000/docs
- **Email Preview**: http://localhost:4000/dev/email (development only)

## Next Steps

Now that the server is running, dive into the detailed documentation:

### For API Development
- **[API Documentation](documentations/README.md)** - Start here for complete API guides
- **[Swagger UI](http://localhost:4000/docs)** - Interactive endpoint explorer
- **[Auth Guide](documentations/auth.md)** - Login, OTP, OAuth flows
- **[Learner Guide](documentations/learner.md)** - Learner endpoints
- **[Tutor Guide](documentations/tutor.md)** - Course creation & management
- **[Admin Guide](documentations/admin.md)** - User & platform management

### For Features
- **[Courses](documentations/courses.md)** - Course browsing & content
- **[Messaging](documentations/messaging.md)** - Real-time chat
- **[Notifications](documentations/notifications.md)** - Real-time alerts
- **[Certificates](documentations/certificates.md)** - Certificate generation
- **[Billing](documentations/billing.md)** - Subscriptions
- **[Support](documentations/support.md)** - Help tickets

### For Deployment
- **[Railway Guide](documentations/railway.md)** - Deploy to Railway
- **[Security Policy](SECURITY.md)** - Vulnerability reporting

## Development

```bash
# Start in development mode with hot reload
npm run dev

# Run linting
npm run lint

# Run tests
npm test
```

## API Overview

### Authentication

| Endpoint | Method | Description |
| --- | --- | --- |
| `/auth/register` | POST | Register a new user |
| `/auth/login` | POST | Login with email/password |
| `/auth/logout` | POST | Invalidate JWT |
| `/auth/otp/send` | POST | Send OTP to user's email |
| `/auth/otp/verify` | POST | Verify OTP code |
| `/auth/password/reset` | POST | Request password reset |
| `/auth/password/reset/confirm` | POST | Confirm password reset |
| `/auth/oauth/google` | GET | Google OAuth login |
| `/auth/oauth/github` | GET | GitHub OAuth login |

### Users

| Endpoint | Method | Description |
| --- | --- | --- |
| `/users/me` | GET | Get current user profile |
| `/users/me` | PATCH | Update current user profile |
| `/users/:id` | GET | Get user by ID |

### Courses

| Endpoint | Method | Description |
| --- | --- | --- |
| `/courses` | GET | List all courses |
| `/courses` | POST | Create a new course (tutor/admin) |
| `/courses/:id` | GET | Get course details |
| `/courses/:id` | PATCH | Update course (tutor/admin) |
| `/courses/:id/enroll` | POST | Enroll in a course |

### See Also

- [API Documentation](documentations/README.md) - Role-based endpoint guides
- [Security Policy](SECURITY.md) - Vulnerability reporting
- [Railway Deployment](documentations/railway.md) - Railway-specific setup

## Project Structure

```
talentflow-backend/
├── documentations/          # Role-based API documentation
│   ├── auth.md            # Authentication endpoints
│   ├── learner.md        # Learner endpoints
│   ├── tutor.md         # Tutor/creator endpoints
│   ├── admin.md         # Admin endpoints
│   ├── courses.md       # Course management
│   ├── messaging.md     # Chat/messaging
│   ├── notifications.md # Real-time notifications
│   ├── certificates.md # Certificate APIs
│   ├── billing.md       # Subscriptions/billing
│   ├── support.md      # Support tickets
│   └── ...
├── src/
│   ├── config/           # Configuration files
│   │   ├── db.js       # Database connection
│   │   └── passport.js # OAuth setup
│   ├── docs/            # Swagger/OpenAPI specs
│   │   └── swagger.js
│   ├── middleware/       # Express middleware
│   │   └── auth.js     # JWT authentication
│   ├── models/           # Sequelize models (60+ models)
│   │   ├── index.js    # Model registry
│   │   ├── User.js
│   │   ├── Course.js
│   │   ├── Enrollment.js
│   │   └── ...
│   ├── routes/           # API route handlers (35+ routes)
│   │   ├── auth.js
│   │   ├── courses.js
│   │   ├── lessons.js
│   │   └── ...
│   ├── utils/            # Helper functions
│   │   ├── wsHub.js     # WebSocket server
│   │   ├── mail.js     # Email templates
│   │   ├── redis.js    # Redis client
│   │   └── ...
│   ├── templates/        # HTML/PDF templates
│   ├── app.js          # Express app setup
│   └── server.js       # Server entry point
├── scripts/             # Build/deploy scripts
├── deploy/              # Deployment configs
├── uploads/             # File uploads directory
├── .env                 # Environment config
├── package.json
├── README.md
└── SECURITY.md
```

## Environment Variables

### Required

| Variable | Description | Example |
| --- | --- | --- |
| `DB_HOST` | MySQL host | `localhost` |
| `DB_USER` | MySQL username | `root` |
| `DB_PASSWORD` | MySQL password | `password` |
| `DB_NAME` | Database name | `talentflow` |
| `JWT_SECRET` | JWT signing secret | (min 32 chars) |
| `PORT` | HTTP server port | `4000` |
| `APP_NAME` | Application name | `TalentFlow` |

### Optional - Database

| Variable | Default | Description |
| --- | --- | --- |
| `DB_PORT` | `3306` | MySQL port |
| `DB_CREATE_IF_MISSING` | `false` | Auto-create database |
| `DB_SYNC_ALTER` | `false` | Auto-migrate tables |
| `DB_URL` | - | Full database URL (alternative) |

### Optional - Authentication

| Variable | Default | Description |
| --- | --- | --- |
| `JWT_EXPIRES_IN` | `7d` | JWT expiration |
| `GOOGLE_CLIENT_ID` | - | Google OAuth |
| `GOOGLE_CLIENT_SECRET` | - | Google OAuth |
| `GITHUB_CLIENT_ID` | - | GitHub OAuth |
| `GITHUB_CLIENT_SECRET` | - | GitHub OAuth |

### Optional - Email

| Variable | Default | Description |
| --- | --- | --- |
| `SMTP_HOST` | - | SMTP server |
| `SMTP_PORT` | `587` | SMTP port |
| `SMTP_SECURE` | `false` | Use TLS |
| `SMTP_USER` | - | SMTP username |
| `SMTP_PASS` | - | SMTP password |
| `SMTP_FROM` | - | From email address |

### Optional - Redis/Queue

| Variable | Default | Description |
| --- | --- | --- |
| `REDIS_ENABLED` | `false` | Enable Redis features |
| `REDIS_URL` | - | Redis connection URL |
| `EMAIL_QUEUE_ENABLED` | `false` | Use BullMQ for emails |

### Optional - Upload

| Variable | Default | Description |
| --- | --- | --- |
| `UPLOAD_DIR` | `./uploads` | Upload directory |
| `UPLOAD_MAX_MB` | `10` | Max file size (MB) |
| `UPLOAD_ALLOWED_MIME` | - | Allowed MIME types |

### Optional - Certificates

| Variable | Default | Description |
| --- | --- | --- |
| `CERT_SIGNATORY_NAME` | - | Certificate signatory |
| `CERT_SIGNATORY_TITLE` | - | Signatory title |
| `CERT_SIGNATURE_MODE` | `auto` | Signature generation mode |

### Optional - CORS/Security

| Variable | Default | Description |
| --- | --- | --- |
| `CORS_ORIGIN` | - | Allowed origins (comma-separated) |
| `CSP_ENABLED` | `true` | Enable Content Security Policy |
| `RATE_LIMIT_MAX` | `200` | Requests per window |

For a complete list, see `.env.example`.

## Common Errors

### ENOENT: no such file or directory

Ensure `.env` file exists:
```bash
cp .env.example .env
```

### ECONNREFUSED (MySQL)

- Verify MySQL is running
- Check `DB_HOST`, `DB_PORT` in `.env`
- Ensure database exists

### ECONNREFUSED (Redis)

- If `REDIS_ENABLED=true`, ensure Redis is running
- Or set `REDIS_ENABLED=false`

### Missing JWT_SECRET

JWT_SECRET must be at least 32 characters:
```env
JWT_SECRET=your_very_long_secure_secret_key_here
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npm run lint` to check code style
5. Submit a pull request

## License

Proprietary - All rights reserved

