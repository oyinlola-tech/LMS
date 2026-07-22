# Certificates

## POST /certificates/issue
Issue a certificate for a completed course. If `certificateUrl` is omitted, the backend generates a PDF from the HTML template.

Common error:
```json
{"error":{"code":"FORBIDDEN","message":"Course not completed","details":null}}
```

Request:
```json
{ "courseId": "uuid" }
```

Response (201):
```json
{
  "message": "Certificate issued",
  "data": {
    "id": "uuid",
    "certificateUrl": "http://localhost:4000/uploads/certificates/uuid.pdf"
  }
}
```

Error (403):
```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Course not completed",
    "details": null
  }
}
```

## GET /certificates
Response (200):
```json
{
  "message": "Certificates loaded",
  "data": []
}
```

## GET /certificates/:courseId
Response (200):
```json
{
  "message": "Certificate loaded",
  "data": {
    "id": "uuid",
    "courseId": "uuid",
    "certificateUrl": "https://cdn.example.com/cert.pdf",
    "issuedAt": "2026-04-08T10:00:00Z"
  }
}
```

Error (404):
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Certificate not found",
    "details": null
  }
}
```

## GET /certificates/verify/:certId
Response (200):
```json
{
  "message": "Certificate verified",
  "data": {
    "id": "uuid",
    "courseTitle": "Advanced UI Systems",
    "studentName": "Jane Doe",
    "issuedAt": "2026-04-08T10:00:00Z",
    "certificateUrl": "https://cdn.example.com/cert.pdf"
  }
}
```
Error (404):
```json
{"error":{"code":"NOT_FOUND","message":"Certificate not found","details":null}}
```

## GET /certificates/verify/:certId/page
Response (200):
```
HTML verification page
```
Error (404):
```json
{"error":{"code":"NOT_FOUND","message":"Certificate not found","details":null}}
```

## GET /certificates/download/:certId
Response (200):
```
PDF file download
```
Error (404):
```json
{"error":{"code":"NOT_FOUND","message":"Certificate not found","details":null}}
```

## GET /certificates/export/:certId?format=png|pdf
Response (200):
```
PNG (default) or PDF export
```
Error (404):
```json
{"error":{"code":"NOT_FOUND","message":"Certificate not found","details":null}}
```


## GET /certificates/badge
Returns the LearnBridge Verified badge (SVG).
Response (200):
```
SVG badge
```

## GET /certificates/badge/page
Shareable HTML badge page (for LinkedIn/portfolio).
Response (200):
```
HTML badge share page
```

## GET /certificates/badge.png
Returns the LearnBridge Verified badge (PNG).
Response (200):
```
PNG badge
```

LinkedIn embed example:
```
https://your-domain.com/certificates/badge.png
```
