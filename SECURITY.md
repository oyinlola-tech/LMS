# Security Policy

We take security seriously at TalentFlow. This document explains how to report issues and what to expect from us.

## Supported Versions
- `main` branch (latest)
- Latest tagged release (if applicable)

## Reporting a Vulnerability
Please report security issues **privately** using one of the contact methods below.

Primary contact:
- Email: oyinlola.tech@icloud.com

Optional contacts (if you configure them):
- Security contact URL: see `SECURITY_CONTACT_URL` in `.env`

When reporting, include:
- A clear description of the issue
- Steps to reproduce (proof-of-concept)
- Impact assessment (what can be compromised)
- Any relevant logs or stack traces

We aim to respond within **3 business days** and will keep you updated throughout triage.

## Disclosure Timeline
We follow responsible disclosure:
1. Confirm receipt within 3 business days.
2. Triage and severity assessment.
3. Provide a remediation plan or timeline.
4. Release a fix and coordinate disclosure if requested.

## Safe Harbor
We will not pursue legal action against researchers who:
- Follow this policy
- Avoid accessing or modifying user data
- Do not degrade service availability
- Report issues promptly

## Security.txt
We also publish a `/.well-known/security.txt` endpoint. Configure:
- `SECURITY_CONTACT_EMAIL`
- `SECURITY_CONTACT_URL`
- `SECURITY_POLICY_URL`
- `SECURITY_ACK_URL`
- `SECURITY_EXPIRES`

## Environment Controls
Security-relevant settings are managed via environment variables:
- `CSP_ENABLED`, `CSP_REPORT_ONLY`
- `RATE_LIMIT_*`, `AUTH_RATE_LIMIT_*`
- `CORS_ORIGIN`, `CORS_ALLOW_CREDENTIALS`
- `SECURITY_*`

If you need help hardening production settings, reach out and we’ll help.
