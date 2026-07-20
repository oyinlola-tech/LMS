# Admin Endpoints

Base URL: `http://localhost:4000`  
Auth: `Authorization: Bearer <admin_jwt_token>`

Standard error format:
```json
{"error":{"code":"ERROR_CODE","message":"Human readable message","details":null}}
```

Common errors (apply to protected endpoints):
```json
{"error":{"code":"AUTH_REQUIRED","message":"Missing token","details":null}}
```
```json
{"error":{"code":"FORBIDDEN","message":"Forbidden","details":null}}
```

## GET /admin/dashboard
Response (200):
```json
{"message":"Admin dashboard loaded","data":{"range":7,"totals":{"users":1200,"userGrowthPercent":12}}}
```
Error (403):
```json
{"error":{"code":"FORBIDDEN","message":"Forbidden","details":null}}
```

## GET /admin/dashboard/export
Response (200): CSV download  
Error (403):
```json
{"error":{"code":"FORBIDDEN","message":"Forbidden","details":null}}
```

## GET /admin/dashboard/report
Query: `format=pdf&range=30d`  
Response (200): PDF or JSON  
Error (403):
```json
{"error":{"code":"FORBIDDEN","message":"Forbidden","details":null}}
```

## GET /admin/dashboard/audit
Response (200):
```json
{"message":"Audit trail loaded","data":[]}
```

## GET /admin/users
Query: `page=1&limit=20&role=learner&status=active&q=jane`  
Response (200):
```json
{"message":"Users loaded","data":{"items":[],"page":1,"limit":20,"total":0,"totalPages":0}}
```

## POST /admin/users
Request:
```json
{"fullName":"Alex Kim","email":"alex@talentflow.com","role":"tutor","password":"TempPass123"}
```
Response (200):
```json
{"message":"User created","data":{"id":"uuid","email":"alex@talentflow.com","role":"tutor"}}
```

## GET /admin/users/:id
Response (200):
```json
{"message":"User loaded","data":{"profile":{"id":"uuid","fullName":"Jane Doe","email":"jane@example.com"}}}
```
Error (404):
```json
{"error":{"code":"NOT_FOUND","message":"User not found","details":null}}
```

## GET /admin/users/:id/activity
Response (200):
```json
{"message":"User activity loaded","data":[{"type":"enrollment","createdAt":"2026-04-08T10:00:00Z"}]}
```

## GET /admin/users/:id/role-history
Response (200):
```json
{"message":"Role history loaded","data":[]}
```

## GET /admin/users/:id/notes
Response (200):
```json
{"message":"User notes loaded","data":[]}
```

## POST /admin/users/:id/notes
Request:
```json
{"note":"Warning issued for policy breach."}
```
Response (201):
```json
{"message":"Note added","data":{"id":"uuid","note":"Warning issued for policy breach."}}
```

## GET /admin/users/:id/metrics
Response (200):
```json
{"message":"User metrics loaded","data":{"enrollments":2,"submissions":4,"avgScore":85}}
```

## PATCH /admin/users/:id/status
Request:
```json
{"status":"suspended","reason":"Multiple failed login attempts"}
```
Response (200):
```json
{"message":"User status updated","data":null}
```
Error (400):
```json
{"error":{"code":"VALIDATION_ERROR","message":"invalid status","details":null}}
```

## PATCH /admin/users/:id/role
Request:
```json
{"role":"tutor"}
```
Response (200):
```json
{"message":"User role updated","data":null}
```

## PATCH /admin/users/:id/team
Request:
```json
{"team":"Mentorship Ops"}
```
Response (200):
```json
{"message":"User team updated","data":null}
```

## POST /admin/create-tutor
Request:
```json
{"fullName":"John Tutor","email":"tutor@example.com","password":"TutorStrongPass123!"}
```
Response (201):
```json
{"message":"Tutor created","data":{"userId":"uuid"}}
```
Error (409):
```json
{"error":{"code":"EMAIL_IN_USE","message":"Email already in use","details":null}}
```

## GET /admin/support/tickets
Response (200):
```json
{"message":"Support tickets loaded","data":[]}
```

## GET /admin/support/tickets/:id
Response (200):
```json
{"message":"Support ticket loaded","data":{"id":"uuid"}}
```
