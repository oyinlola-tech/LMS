# Tutor Endpoints

Base URL: `http://localhost:4000`  
Auth: `Authorization: Bearer <tutor_jwt_token>`

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

## GET /tutor-dashboard/overview
Response (200):
```json
{"message":"Tutor dashboard loaded","data":{"revenue":{"total":1200,"currency":"USD","monthlyDeltaPercent":12}}}
```
Error (403):
```json
{"error":{"code":"FORBIDDEN","message":"Forbidden","details":null}}
```

## GET /tutor-dashboard/export
Response (200): CSV download  
Error (403):
```json
{"error":{"code":"FORBIDDEN","message":"Forbidden","details":null}}
```

## GET /tutor-dashboard/submission-queue
Response (200):
```json
{"message":"Submission queue loaded","data":[]}
```

## POST /tutors/actions/email-students
Request:
```json
{"subject":"Class update","body":"Please review module 4 before Friday."}
```
Response (200):
```json
{"message":"Emails sent","data":{"recipients":42}}
```

## POST /tutors/actions/post-update
Request:
```json
{"subject":"New resources","body":"Resources updated for Week 8."}
```
Response (200):
```json
{"message":"Update posted","data":null}
```

## POST /tutors/actions/schedule-office-hour
Request:
```json
{"title":"Office Hours","startsAt":"2026-05-01T17:00:00Z","durationMinutes":60,"meetingUrl":"https://meet.example.com/room","courseId":"uuid"}
```
Response (200):
```json
{"message":"Office hour scheduled","data":{"id":"uuid","title":"Office Hours"}}
```

## POST /courses/:id/announcements
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

## POST /courses/:id/events
Request:
```json
{"title":"Live Q&A","description":"Weekly live session","startsAt":"2026-04-10T15:00:00Z"}
```
Response (201):
```json
{"message":"Event created","data":{"id":"uuid","title":"Live Q&A"}}
```

## Builder: POST /builder/courses
Request:
```json
{"title":"Advanced UI Systems","categories":["UI Design"],"descriptionHtml":"<p>Course overview</p>","learningObjectives":["Master design systems"]}
```
Response (201):
```json
{"message":"Course draft created","data":{"id":"uuid"}}
```

## Builder: GET /builder/courses
Response (200):
```json
{"message":"Courses loaded","data":[]}
```

## Builder: PUT /builder/courses/:id
Request:
```json
{"title":"Updated Course"}
```
Response (200):
```json
{"message":"Course updated","data":{"id":"uuid"}}
```

## Builder: POST /builder/courses/:id/cover
Form Data: `file`
Response (200):
```json
{"message":"Cover updated","data":{"thumbnailUrl":"http://localhost:4000/uploads/cover.png"}}
```

## Builder: POST /builder/courses/:id/modules
Request:
```json
{"title":"Module 1","position":1}
```
Response (201):
```json
{"message":"Module created","data":{"id":"uuid"}}
```

## Builder: PUT /builder/courses/:id/modules/reorder
Request:
```json
{"order":[{"id":"uuid","position":1}]}
```
Response (200):
```json
{"message":"Modules reordered","data":null}
```

## Builder: PUT /builder/modules/:moduleId
Request:
```json
{"title":"Module 1 Updated"}
```
Response (200):
```json
{"message":"Module updated","data":null}
```

## Builder: DELETE /builder/modules/:moduleId
Response (200):
```json
{"message":"Module deleted","data":null}
```

## Builder: POST /builder/modules/:moduleId/lessons
Request:
```json
{"title":"Lesson 1","type":"video","durationMinutes":12,"position":1}
```
Response (201):
```json
{"message":"Lesson created","data":{"id":"uuid"}}
```

## Builder: PUT /builder/modules/:moduleId/lessons/reorder
Request:
```json
{"order":[{"id":"uuid","position":1}]}
```
Response (200):
```json
{"message":"Lessons reordered","data":null}
```

## Builder: PUT /builder/lessons/:lessonId
Request:
```json
{"title":"Lesson Updated"}
```
Response (200):
```json
{"message":"Lesson updated","data":null}
```

## Builder: DELETE /builder/lessons/:lessonId
Response (200):
```json
{"message":"Lesson deleted","data":null}
```

## Builder: POST /builder/lessons/:lessonId/content
Request:
```json
{"heading":"Overview","content":"Lesson content","position":1}
```
Response (201):
```json
{"message":"Lesson content added","data":{"id":"uuid"}}
```

## Builder: POST /builder/lessons/:lessonId/media
Form Data: `file`
Response (200):
```json
{"message":"Media uploaded","data":{"videoUrl":"http://localhost:4000/uploads/video.mp4"}}
```

## Builder: POST /builder/lessons/:lessonId/resources
Form Data: `file` (+ optional `title`)
Response (201):
```json
{"message":"Resource uploaded","data":{"id":"uuid","resourceUrl":"http://localhost:4000/uploads/resource.pdf"}}
```

## Builder: PUT /builder/lessons/:lessonId/media-url
Request:
```json
{"url":"https://cdn.example.com/video.mp4"}
```
Response (200):
```json
{"message":"Video URL set","data":null}
```

## Builder: POST /builder/courses/:id/assignments
Request:
```json
{"moduleId":"uuid","title":"Module 4 Assignment","description":"Design dashboard"}
```
Response (201):
```json
{"message":"Assignment created","data":{"id":"uuid"}}
```

## Builder: PUT /builder/assignments/:id
Request:
```json
{"title":"Updated Assignment","status":"published"}
```
Response (200):
```json
{"message":"Assignment updated","data":{"id":"uuid"}}
```

## Builder: DELETE /builder/assignments/:id
Response (200):
```json
{"message":"Assignment deleted","data":null}
```

## Builder: POST /builder/lessons/:lessonId/quiz
Request:
```json
{"title":"Module 1 Quiz","questions":[]}
```
Response (201):
```json
{"message":"Quiz created","data":{"id":"uuid"}}
```

## Builder: POST /builder/courses/:id/coupons
Request:
```json
{"code":"WELCOME10","discountPercent":10}
```
Response (201):
```json
{"message":"Coupon created","data":{"id":"uuid"}}
```

## Builder: GET /builder/courses/:id/preview
Response (200):
```json
{"message":"Course preview loaded","data":{"id":"uuid"}}
```

## Builder: POST /builder/courses/:id/apply-coupon
Request:
```json
{"code":"WELCOME10"}
```
Response (200):
```json
{"message":"Coupon applied","data":{"price":49.99}}
```

## Builder: POST /builder/courses/:id/enrollment-preview
Response (200):
```json
{"message":"Enrollment preview ready","data":{"courseId":"uuid","price":49.99}}
```

## Builder: POST /builder/courses/:id/publish
Response (200):
```json
{"message":"Course published","data":null}
```

## Builder: POST /builder/courses/:id/unpublish
Response (200):
```json
{"message":"Course unpublished","data":null}
```

## GET /assignments/:id/submissions
Response (200):
```json
{"message":"Submissions loaded","data":[]}
```

## GET /assignments/:id/submissions/:submissionId
Response (200):
```json
{"message":"Submission loaded","data":{"id":"uuid","status":"submitted"}}
```

## GET /assignments/:id/submissions/:submissionId/download
Response (302): Redirect to file URL.

## POST /assignments/:id/grade
Request:
```json
{"submissionId":"uuid","status":"graded","feedback":"Great work","score":88,"rubric":"meets"}
```
Response (200):
```json
{"message":"Submission graded","data":null}
```
