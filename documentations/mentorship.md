# Mentorship

## POST /mentorship/apply
Request:
```json
{ "courseId": "uuid", "message": "I'd love to join the elite track." }
```
Response (201):
```json
{ "message": "Mentorship application submitted", "data": { "id": "uuid", "status": "pending" } }
```
Error (404):
```json
{"error":{"code":"NOT_FOUND","message":"Course not found","details":null}}
```
