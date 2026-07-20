# Support

## POST /support/tickets
Request:
```json
{ "subject": "Login issue", "message": "I cannot log in", "priority": "high" }
```
Response (201):
```json
{ "message": "Support ticket created", "data": { "id": "uuid", "status": "open" } }
```
Error (400):
```json
{"error":{"code":"VALIDATION_ERROR","message":"subject and message are required","details":null}}
```

## GET /support/tickets
Response (200):
```json
{ "message": "Support tickets loaded", "data": [] }
```

## GET /admin/support/tickets
Admin-only list of all tickets.
Response (200):
```json
{ "message": "Support tickets loaded", "data": [] }
```

## GET /admin/support/tickets/:id
Admin-only ticket detail.
Response (200):
```json
{ "message": "Support ticket loaded", "data": { "id": "uuid" } }
```

## GET /support/tickets/:id
Response (200):
```json
{ "message": "Support ticket loaded", "data": { "id": "uuid", "status": "open" } }
```
Error (404):
```json
{"error":{"code":"NOT_FOUND","message":"Ticket not found","details":null}}
```

## PUT /support/tickets/:id
Request:
```json
{ "status": "resolved", "priority": "low" }
```
Response (200):
```json
{ "message": "Support ticket updated", "data": { "id": "uuid", "status": "resolved" } }
```

## POST /support/tickets/:id/messages
Request:
```json
{ "body": "Thanks, issue resolved." }
```
Response (201):
```json
{ "message": "Message added", "data": { "id": "uuid" } }
```
