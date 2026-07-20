# Instructor

## GET /instructor/analytics
Response (200):
```json
{
  "message": "Instructor analytics loaded",
  "data": { "totalRevenue": 1200, "totalStudents": 34, "avgRating": 4.6, "courseCount": 3 }
}
```

## GET /instructor/courses
Response (200):
```json
{ "message": "Instructor courses loaded", "data": [] }
```

## GET /instructor/courses/stats
Response (200):
```json
{ "message": "Instructor course stats loaded", "data": { "totalEnrollments": 120 } }
```

## GET /instructor/activity
Response (200):
```json
{ "message": "Instructor activity loaded", "data": [] }
```

## GET /instructor/reviews
Response (200):
```json
{ "message": "Instructor reviews loaded", "data": [] }
```

## POST /instructor/support
Request:
```json
{ "subject": "Payout issue", "message": "Please review last month's payout." }
```
Response (201):
```json
{ "message": "Support ticket created", "data": { "id": "uuid", "status": "open" } }
```
