# Auth & Security

Base URL: `http://localhost:4000`  
Auth: `Authorization: Bearer <jwt_token>`

Standard error format:
```json
{"error":{"code":"ERROR_CODE","message":"Human readable message","details":null}}
```

## POST /auth/register
Request:
```json
{"fullName":"Jane Doe","email":"jane@example.com","password":"StrongPass123!","confirmPassword":"StrongPass123!"}
```
Response (201):
```json
{"message":"Registered. Please verify your email with the OTP.","data":{"userId":"uuid"}}
```
Error (400):
```json
{"error":{"code":"VALIDATION_ERROR","message":"All fields are required","details":null}}
```
Error (409):
```json
{"error":{"code":"EMAIL_IN_USE","message":"Email already in use","details":null}}
```

## POST /auth/login
Request:
```json
{"email":"jane@example.com","password":"StrongPass123!"}
```
Response (200):
```json
{"message":"Login successful","data":{"token":"jwt_token"}}
```
Error (401):
```json
{"error":{"code":"INVALID_CREDENTIALS","message":"Invalid credentials","details":null}}
```
Error (403):
```json
{"error":{"code":"EMAIL_NOT_VERIFIED","message":"Please verify your email first","details":null}}
```
Error (403):
```json
{"error":{"code":"ACCOUNT_INACTIVE","message":"Account is not active","details":null}}
```

## POST /auth/verify-otp
Request:
```json
{"email":"jane@example.com","code":"123456"}
```
Response (200):
```json
{"message":"Email verified","data":null}
```
Error (400):
```json
{"error":{"code":"OTP_INVALID","message":"OTP expired or invalid","details":null}}
```

## POST /auth/resend-otp
Request:
```json
{"email":"jane@example.com"}
```
Response (200):
```json
{"message":"OTP resent","data":null}
```
Error (429):
```json
{"error":{"code":"RATE_LIMITED","message":"Please wait before requesting a new code","details":null}}
```

## POST /auth/forgot-password
Request:
```json
{"email":"jane@example.com"}
```
Response (200):
```json
{"message":"If the email exists, you will receive a reset link","data":null}
```

## POST /auth/reset-password
Request:
```json
{"token":"reset_token","password":"NewStrongPass123!","confirmPassword":"NewStrongPass123!"}
```
Response (200):
```json
{"message":"Password reset successful","data":null}
```
Error (400):
```json
{"error":{"code":"TOKEN_INVALID","message":"Token expired or invalid","details":null}}
```

## GET /auth/google
Response (302): Redirect to Google OAuth.

## GET /auth/google/callback
Response (200):
```json
{"message":"OAuth login successful","data":{"token":"jwt_token"}}
```
Error (401):
```json
{"error":{"code":"OAUTH_DENIED","message":"Access denied by user","details":null}}
```
Error (500):
```json
{"error":{"code":"OAUTH_FAILED","message":"OAuth provider error","details":null}}
```

## GET /auth/github
Response (302): Redirect to GitHub OAuth.

## GET /auth/github/callback
Response (200):
```json
{"message":"OAuth login successful","data":{"token":"jwt_token"}}
```
Error (401):
```json
{"error":{"code":"OAUTH_DENIED","message":"Access denied by user","details":null}}
```
Error (500):
```json
{"error":{"code":"OAUTH_FAILED","message":"OAuth provider error","details":null}}
```

## POST /auth/logout
Response (200):
```json
{"message":"Logged out","data":null}
```
