# Billing

## POST /billing/subscribe
Request:
```json
{ "plan": "pro" }
```
Response (201):
```json
{ "message": "Subscription created", "data": { "id": "uuid", "plan": "pro", "status": "active" } }
```

## GET /billing/subscription
Response (200):
```json
{ "message": "Subscription loaded", "data": { "id": "uuid", "plan": "pro", "status": "active" } }
```
