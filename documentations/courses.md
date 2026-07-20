# Courses (Shared)

Base URL: `http://localhost:4000`

Common errors:
```json
{"error":{"code":"FORBIDDEN","message":"Forbidden","details":null}}
```

## GET /courses
Query: `category=UI Design&q=design&difficulty=intermediate`
Response (200):
```json
{"message":"Courses loaded","data":[]}
```
Error (500):
```json
{"error":{"code":"COURSE_LIST_FAILED","message":"Failed to load courses","details":null}}
```

## GET /courses/featured
Response (200):
```json
{"message":"Featured courses loaded","data":[]}
```

## GET /courses/recommended
Auth required.
Response (200):
```json
{"message":"Recommended courses loaded","data":[]}
```

## GET /categories
Response (200):
```json
{"message":"Categories loaded","data":[]}
```

## GET /departments
Response (200):
```json
{"message":"Departments loaded","data":[]}
```

## GET /courses/:id
Response (200):
```json
{"message":"Course loaded","data":{"id":"uuid","title":"React for Designers"}}
```
Error (404):
```json
{"error":{"code":"NOT_FOUND","message":"Course not found","details":null}}
```

## POST /courses/:id/enroll
Auth required.
Response (201):
```json
{"message":"Enrollment created","data":{"enrollmentId":"uuid"}}
```
Error (404):
```json
{"error":{"code":"NOT_FOUND","message":"Course not found","details":null}}
```

## GET /courses/:id/announcements
Auth required.
Response (200):
```json
{"message":"Announcements loaded","data":[]}
```
Error (403):
```json
{"error":{"code":"FORBIDDEN","message":"Forbidden","details":null}}
```

## POST /courses/:id/announcements
Tutor only.
Request:
```json
{"title":"New assignment","body":"Please submit your project by Friday."}
```
Response (201):
```json
{"message":"Announcement created","data":{"id":"uuid","title":"New assignment"}}
```
Error (403):
```json
{"error":{"code":"FORBIDDEN","message":"Forbidden","details":null}}
```

## GET /courses/:id/events
Auth required.
Response (200):
```json
{"message":"Events loaded","data":[]}
```
Error (403):
```json
{"error":{"code":"FORBIDDEN","message":"Forbidden","details":null}}
```

## POST /courses/:id/events
Tutor only.
Request:
```json
{"title":"Live Q&A","startsAt":"2026-04-10T15:00:00Z"}
```
Response (201):
```json
{"message":"Event created","data":{"id":"uuid","title":"Live Q&A"}}
```

## GET /courses/:id/comments
Response (200):
```json
{"message":"Comments loaded","data":[]}
```

## POST /courses/:id/comments
Request:
```json
{"content":"Could we explore more about MVP phase?"}
```
Response (201):
```json
{"message":"Comment posted","data":{"id":"uuid","content":"Could we explore more about MVP phase?"}}
```
Error (403):
```json
{"error":{"code":"FORBIDDEN","message":"Forbidden","details":null}}
```
