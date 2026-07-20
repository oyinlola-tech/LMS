# TalentFlow API Documentation

This folder contains role-based API documentation organized by user role and feature area.

## Overview

TalentFlow provides distinct API sets for different user roles:

- **Learner**: Students enrolled in courses
- **Tutor**: Course creators and instructors
- **Instructor**: Analytics and review management
- **Admin**: Platform administration and user management

## Documentation Files

### Authentication & Users
| File | Description |
| --- | --- |
| [auth.md](auth.md) | Registration, login, OTP, OAuth, password reset |

### Role-Based APIs
| File | Description |
| --- | --- |
| [learner.md](learner.md) | Learner dashboard, enrollments, lessons, progress, assignments |
| [tutor.md](tutor.md) | Course creation, tutor dashboard, grading, exports |
| [instructor.md](instructor.md) | Analytics, reviews, course management |
| [admin.md](admin.md) | Admin dashboard, user management, audit logs |

### Feature Areas
| File | Description |
| --- | --- |
| [courses.md](courses.md) | Course browsing, catalog, content APIs |
| [certificates.md](certificates.md) | Issue, verify, download, preview, export certificates |
| [notifications.md](notifications.md) | Real-time notifications, WebSocket stream |
| [messaging.md](messaging.md) | Chat threads, messages, WebSocket chat |
| [support.md](support.md) | Support ticket system |
| [billing.md](billing.md) | Subscriptions, payment endpoints |
| [mentorship.md](mentorship.md) | Mentorship applications |
| [gradebook.md](gradebook.md) | Tutor gradebook management |

### Deployment
| File | Description |
| --- | --- |
| [railway.md](railway.md) | Railway deployment guide |

## Common Conventions

### Base URL
```
http://localhost:4000
```

### Authentication Header
Protected endpoints require a JWT token:
```http
Authorization: Bearer <jwt_token>
```

### Request Format
JSON for all request bodies:
```http
Content-Type: application/json
```

### Response Format
Standard response wrapper:
```json
{
  "data": { ... },
  "meta": { ... }
}
```

### Error Format
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": null
  }
}
```

### Pagination
List endpoints return paginated results:
```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

## Quick Reference

### Authentication Flow

1. **Register**: `POST /auth/register`
2. **Login**: `POST /auth/login`
3. **Verify OTP**: `POST /auth/otp/verify` (first login)
4. **Access APIs**: Use JWT token in `Authorization` header

### Course Enrollment Flow

1. **Browse**: `GET /courses`
2. **Enroll**: `POST /courses/:id/enroll`
3. **Learn**: `GET /courses/:id/lessons`, `POST /lessons/:id/complete`
4. **Earn Certificate**: `POST /certificates/issue` (on completion)

### Real-Time Features

- **Notifications**: WebSocket at `/ws/notifications`
- **Chat**: WebSocket at `/ws/chat`

Connect with JWT token as query param: `?token=<jwt>`

## Interactive Documentation

Use Swagger UI for the full interactive API explorer:
```
http://localhost:4000/docs
```

This provides:
- Complete endpoint listing
- Request/response schema
- Try-it-out functionality (when authenticated)
- Schema download (JSON/YAML)

## Rate Limiting

| Endpoint Type | Limit |
| --- | --- |
| General | 200 requests / 15 min |
| Auth | 30 requests / 15 min |

## Getting Started

1. **Start Server**: `npm start`
2. **Explore Docs**: Open http://localhost:4000/docs
3. **Register User**: `POST /auth/register`
4. **Login**: `POST /auth/login`
5. **Verify OTP**: Check email, then `POST /auth/otp/verify`
6. **Browse Courses**: `GET /courses`

## Role Permissions

| Role | Permissions |
| --- | --- |
| `learner` | Browse courses, enroll, learn, message, earn certificates |
| `tutor` | All learner + create courses, manage lessons, grade |
| `instructor` | All tutor + analytics, manage reviews |
| `admin` | All roles + user management, platform settings, audit logs |

## Need Help?

- Check [Swagger UI](http://localhost:4000/docs) for endpoint details
- Review error codes in API responses
- See [main README](../README.md) for setup help
