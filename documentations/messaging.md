# Messaging

## GET /messages/threads
Query: `page=1&limit=20&search=project` or `cursor=BASE64`
Response (200):
```json
{
  "message": "Threads loaded",
  "data": {
    "items": [
      {
        "id": "uuid",
        "subject": "Project feedback",
        "participant": { "id": "uuid", "fullName": "Alex Kim", "avatarUrl": null },
        "lastMessage": { "id": "uuid", "body": "Hello!", "createdAt": "2026-04-08T10:00:00Z" },
        "lastMessageAt": "2026-04-08T10:00:00Z"
      }
    ],
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1,
    "nextCursor": "BASE64URL_CURSOR"
  }
}
```

## GET /messages/threads/:threadId
Query: `page=1&limit=30` or `cursor=BASE64`
Response (200):
```json
{
  "message": "Thread loaded",
  "data": {
    "thread": { "id": "uuid" },
    "items": [{ "id": "uuid", "body": "Hi", "createdAt": "2026-04-08T10:00:00Z" }],
    "page": 1,
    "limit": 30,
    "total": 1,
    "totalPages": 1,
    "nextCursor": "BASE64URL_CURSOR"
  }
}
```
Error (404):
```json
{"error":{"code":"NOT_FOUND","message":"Thread not found","details":null}}
```

## POST /messages/threads
Request:
```json
{ "participantId": "uuid", "subject": "Course help", "message": "Hello!" }
```
Response (201):
```json
{
  "message": "Thread created",
  "data": { "threadId": "uuid", "message": { "id": "uuid", "body": "Hello!" } }
}
```

## POST /messages/threads/:threadId/messages
Request:
```json
{ "body": "Thanks for the update!" }
```
Response (201):
```json
{ "message": "Message sent", "data": { "id": "uuid" } }
```

## WS /ws/messages
Real-time message events:
```json
{ "type": "message", "data": { "threadId": "uuid", "senderId": "uuid", "body": "Hello" } }
```

Send messages (client -> server):
```json
{ "type": "message", "data": { "threadId": "uuid", "body": "Hello" } }
```
Or start a new thread:
```json
{ "type": "message", "data": { "participantId": "uuid", "subject": "Help", "body": "Hello" } }
```
