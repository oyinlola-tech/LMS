# Learner Endpoints

Base URL: `http://localhost:4000`  
Auth: `Authorization: Bearer <jwt_token>`

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

## GET /users/me
Response (200):
```json
{"message":"Profile loaded","data":{"id":"uuid","fullName":"Jane Doe","email":"jane@example.com","role":"learner"}}
```
Error (401):
```json
{"error":{"code":"AUTH_REQUIRED","message":"Missing token","details":null}}
```

## PUT /users/me/profile
Request:
```json
{"bio":"I love product design.","skills":["UX","Figma"],"avatarUrl":"https://cdn.example.com/avatar.png"}
```
Response (200):
```json
{"message":"Profile updated","data":null}
```
Error (401):
```json
{"error":{"code":"INVALID_TOKEN","message":"Invalid token","details":null}}
```

## POST /uploads/avatar
Form Data: `file`
Response (200):
```json
{"message":"Avatar uploaded","data":{"avatarUrl":"http://localhost:4000/uploads/avatar.png"}}
```

## PUT /users/me/avatar
Request:
```json
{"avatarUrl":"http://localhost:4000/uploads/avatar.png"}
```
Response (200):
```json
{"message":"Avatar updated","data":{"avatarUrl":"http://localhost:4000/uploads/avatar.png"}}
```

## PUT /users/me/interests
Request:
```json
{"interests":["frontend","ui design"]}
```
Response (200):
```json
{"message":"Interests updated","data":["frontend","ui design"]}
```
Error (400):
```json
{"error":{"code":"VALIDATION_ERROR","message":"Interests must be an array of strings","details":null}}
```

## PUT /users/me/email
Request:
```json
{"email":"new@email.com"}
```
Response (200):
```json
{"message":"Email updated, verification required","data":{"email":"new@email.com"}}
```

## PUT /users/me/weekly-goal
Request:
```json
{"weeklyGoalHours":10,"weeklyGoalProgressHours":7.5}
```
Response (200):
```json
{"message":"Weekly goal updated","data":null}
```

## GET /dashboard/overview
Response (200):
```json
{"message":"Dashboard loaded","data":{"welcome":"Welcome back, Jane Doe","announcements":[]}}
```
Error (401):
```json
{"error":{"code":"AUTH_REQUIRED","message":"Missing token","details":null}}
```

## GET /tutors/recommended
Response (200):
```json
{"message":"Recommended mentors loaded","data":[]}
```

## GET /tutors
Response (200):
```json
{"message":"Tutors loaded","data":[]}
```

## POST /tutors/:id/follow
Response (201):
```json
{"message":"Followed tutor","data":null}
```
Error (400):
```json
{"error":{"code":"VALIDATION_ERROR","message":"You cannot follow yourself","details":null}}
```

## DELETE /tutors/:id/follow
Response (200):
```json
{"message":"Unfollowed tutor","data":null}
```

## GET /courses
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
Response (201):
```json
{"message":"Enrollment created","data":{"enrollmentId":"uuid"}}
```
Error (404):
```json
{"error":{"code":"NOT_FOUND","message":"Course not found","details":null}}
```

## GET /enrollments/resume
Response (200):
```json
{"message":"Resume data loaded","data":{"courseTitle":"React for Designers","lessonId":"uuid","lastPositionSeconds":320}}
```

## GET /enrollments
Response (200):
```json
{"message":"Enrollments loaded","data":[]}
```

## GET /enrollments/:id
Response (200):
```json
{"message":"Enrollment loaded","data":{"id":"uuid","progressPercent":45}}
```
Error (404):
```json
{"error":{"code":"NOT_FOUND","message":"Enrollment not found","details":null}}
```

## PUT /enrollments/:id/progress
Request:
```json
{"progressPercent":60,"lastLessonId":"uuid","lastPositionSeconds":120,"hoursSpent":3.5}
```
Response (200):
```json
{"message":"Progress updated","data":null}
```

## GET /courses/:id/announcements
Response (200):
```json
{"message":"Announcements loaded","data":[]}
```
Error (403):
```json
{"error":{"code":"FORBIDDEN","message":"Forbidden","details":null}}
```

## GET /courses/:id/events
Response (200):
```json
{"message":"Events loaded","data":[]}
```
Error (403):
```json
{"error":{"code":"FORBIDDEN","message":"Forbidden","details":null}}
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

## GET /lessons/:id
Response (200):
```json
{"message":"Lesson loaded","data":{"id":"uuid","title":"Design Systems Intro","progressPercent":50}}
```
Error (403):
```json
{"error":{"code":"FORBIDDEN","message":"Forbidden","details":null}}
```

## GET /lessons/:id/resources
Response (200):
```json
{"message":"Resources loaded","data":[]}
```

## GET /lessons/:id/comments
Response (200):
```json
{"message":"Lesson comments loaded","data":[]}
```

## POST /lessons/:id/comments
Request:
```json
{"content":"Great lesson!"}
```
Response (201):
```json
{"message":"Lesson comment posted","data":{"id":"uuid"}}
```

## PUT /lessons/:id/progress
Request:
```json
{"progressPercent":75,"lastPositionSeconds":320}
```
Response (200):
```json
{"message":"Lesson progress updated","data":null}
```

## POST /lessons/:id/complete
Response (201):
```json
{"message":"Lesson marked complete","data":null}
```

## GET /lessons/:id/notes
Response (200):
```json
{"message":"Notes loaded","data":[]}
```

## POST /lessons/:id/notes
Request:
```json
{"content":"Remember this concept","timestampSeconds":120}
```
Response (201):
```json
{"message":"Note added","data":{"id":"uuid","content":"Remember this concept"}}
```

## DELETE /lessons/:id/notes/:noteId
Response (200):
```json
{"message":"Note deleted","data":null}
```

## GET /lessons/:id/bookmarks
Response (200):
```json
{"message":"Bookmarks loaded","data":[]}
```

## POST /lessons/:id/bookmarks
Request:
```json
{"note":"Rewatch this part","timestampSeconds":240}
```
Response (201):
```json
{"message":"Bookmark added","data":{"id":"uuid","note":"Rewatch this part"}}
```

## DELETE /lessons/:id/bookmarks/:bookmarkId
Response (200):
```json
{"message":"Bookmark deleted","data":null}
```

## GET /lessons/:id/quiz
Response (200):
```json
{"message":"Quiz loaded","data":{"attemptId":"uuid","quiz":{"id":"uuid","title":"Module 1 Quiz"}}}
```
Error (404):
```json
{"error":{"code":"NOT_FOUND","message":"Quiz not found","details":null}}
```

## POST /lessons/:id/quiz/submit
Request:
```json
{"attemptId":"uuid","answers":[{"questionId":"uuid","optionId":"uuid"}]}
```
Response (200):
```json
{"message":"Quiz submitted","data":{"score":8,"total":10,"scorePercent":80}}
```
Error (400):
```json
{"error":{"code":"VALIDATION_ERROR","message":"attemptId and answers are required","details":null}}
```

## GET /assignments/:id
Response (200):
```json
{"message":"Assignment loaded","data":{"id":"uuid","title":"Module 4 Assignment","status":"published"}}
```
Error (404):
```json
{"error":{"code":"NOT_FOUND","message":"Assignment not found","details":null}}
```

## POST /assignments/:id/start
Response (200):
```json
{"message":"Assignment started","data":null}
```

## POST /assignments/:id/submit
Request:
```json
{"fileUrl":"https://cdn.example.com/submission.zip","fileType":"zip","fileSizeMb":20,"submissionNotes":"Submitting final files"}
```
Response (201):
```json
{"message":"Assignment submitted","data":{"submissionId":"uuid"}}
```
Error (400):
```json
{"error":{"code":"VALIDATION_ERROR","message":"File type not allowed","details":null}}
```

## POST /assignments/:id/submit-upload
Form Data: `file` + `submissionNotes`
Response (201):
```json
{"message":"Assignment submitted","data":{"submissionId":"uuid","fileUrl":"http://localhost:4000/uploads/file.zip"}}
```
Error (400):
```json
{"error":{"code":"VALIDATION_ERROR","message":"File type not allowed","details":null}}
```

## GET /assignments/course/:courseId
Response (200):
```json
{"message":"Assignments loaded","data":[]}
```

## GET /assignments/module/:moduleId
Response (200):
```json
{"message":"Assignments loaded","data":[]}
```

## GET /assignments/:id/submission
Response (200):
```json
{"message":"Submission loaded","data":{"id":"uuid","status":"submitted","fileUrl":"https://cdn.example.com/submission.zip"}}
```
Error (404):
```json
{"error":{"code":"NOT_FOUND","message":"Submission not found","details":null}}
```

## GET /assignments/:id/attempts
Response (200):
```json
{"message":"Assignment attempts loaded","data":[]}
```

## GET /assignments/:id/submissions/me
Response (200):
```json
{"message":"Submission loaded","data":{"id":"uuid","status":"submitted"}}
```

## PUT /assignments/:id/submissions/:submissionId
Request:
```json
{"submissionNotes":"Updated notes","fileUrl":"https://cdn.example.com/new.zip"}
```
Response (200):
```json
{"message":"Submission updated","data":{"id":"uuid"}}
```

## GET /progress/overview
Response (200):
```json
{"message":"Progress overview loaded","data":{"skills":[],"mastery":{"totalMasteryPercent":0}}}
```

## GET /progress/streak
Response (200):
```json
{"message":"Streak loaded","data":{"currentStreak":2,"longestStreak":5}}
```

## POST /progress/track-time
Request:
```json
{"minutes":45}
```
Response (200):
```json
{"message":"Time tracked","data":{"minutes":45}}
```

## GET /progress/timeline
Response (200):
```json
{"message":"Timeline loaded","data":[]}
```

## GET /notifications
Response (200):
```json
{"message":"Notifications loaded","data":[]}
```

## PUT /notifications/:id/read
Response (200):
```json
{"message":"Notification marked read","data":null}
```

## POST /notifications/mark-all-read
Response (200):
```json
{"message":"All notifications marked read","data":null}
```

## GET /notifications/stream
Response (200): `text/event-stream`

## WS /ws/notifications
WebSocket stream (see README for connect example).
