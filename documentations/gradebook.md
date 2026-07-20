# Gradebook (Tutor)

## GET /gradebook/students
Response (200):
```json
{
  "message": "Gradebook students loaded",
  "data": [
    {
      "student": { "id": "uuid", "fullName": "Jane Doe" },
      "avgScore": 88,
      "progressPercent": 67
    }
  ]
}
```

## GET /gradebook/students/:id
Response (200):
```json
{
  "message": "Gradebook student loaded",
  "data": {
    "student": { "id": "uuid", "fullName": "Jane Doe" },
    "enrollments": [],
    "submissions": []
  }
}
```

## PUT /gradebook/students/:id/assignments/:assignmentId/grade
Request:
```json
{ "score": 88, "rubric": "meets", "feedback": "Nice work." }
```
Response (200):
```json
{ "message": "Submission graded", "data": { "id": "uuid", "score": 88 } }
```
