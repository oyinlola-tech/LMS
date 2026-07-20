# Notifications

Base URL: `http://localhost:4000`  
Auth: `Authorization: Bearer <jwt_token>`

Common errors:
```json
{"error":{"code":"AUTH_REQUIRED","message":"Missing token","details":null}}
```

## GET /notifications
Response (200):
```json
{"message":"Notifications loaded","data":[]}
```
Error (401):
```json
{"error":{"code":"AUTH_REQUIRED","message":"Missing token","details":null}}
```

## POST /notifications
Request:
```json
{"type":"reminder","title":"Reminder","message":"Finish module 4","data":{"courseId":"uuid"}}
```
Response (200):
```json
{"message":"Notification created","data":{"id":"uuid"}}
```
Error (400):
```json
{"error":{"code":"VALIDATION_ERROR","message":"invalid notification type","details":null}}
```

## PUT /notifications/:id/read
Response (200):
```json
{"message":"Notification marked read","data":null}
```
Error (404):
```json
{"error":{"code":"NOT_FOUND","message":"Notification not found","details":null}}
```

## POST /notifications/mark-all-read
Response (200):
```json
{"message":"All notifications marked read","data":null}
```

## GET /notifications/stream
Response (200): `text/event-stream`

## WS /ws/notifications
Real-time WebSocket stream.
