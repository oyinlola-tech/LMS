## Deploying This Backend To Railway (DB + Redis)

This backend is configured for **MySQL** (Sequelize dialect: `mysql`) and optional **Redis** usage (notifications + BullMQ email queue).

### 1) Create The Railway Project

1. Create a new Railway project from your GitHub repo (or deploy from a zip).
2. Railway will detect Node and run:
   - install: `npm ci` (or `npm install`)
   - start: `npm run start` (your `package.json` uses `node src/server.js`)

### 2) Add MySQL (Required)

Because your app uses MySQL, you need a MySQL database service:

1. In Railway, add a **MySQL** service/plugin to the project.
2. In the MySQL service, copy the connection info (host, port, user, password, database) or a URL if provided.
3. In your **app service** Variables, prefer using Railway "Reference" variables so you don't copy secrets manually:
   - Variables -> New Variable -> Reference -> pick the MySQL service -> pick its connection string
4. In your **app service** Variables, set ONE of these options:

- Option A (recommended): Set a single connection string:
  - `MYSQL_URL` or `DATABASE_URL` or `DB_URL`
  - Example format: `mysql://USER:PASSWORD@HOST:PORT/DATABASE`

- Option B: Set discrete variables:
  - `DB_HOST`
  - `DB_PORT`
  - `DB_USER`
  - `DB_PASSWORD`
  - `DB_NAME`

Important production notes:
- Set `DB_CREATE_IF_MISSING=false` on Railway (managed DBs usually don’t allow creating databases).
- Set `DB_SYNC_ALTER=false` on Railway to avoid schema changes on each deploy.

### 3) Add Redis (Optional, But Recommended)

Redis is used for:
- Cross-instance notification broadcast (SSE + WebSocket)
- BullMQ queue (when `EMAIL_QUEUE_ENABLED=true`)

Steps:
1. Add a **Redis** service/plugin in Railway.
2. In your app Variables, set (again, you can use Railway "Reference" variables for `REDIS_URL`):
   - `REDIS_ENABLED=true`
   - `REDIS_URL=<your railway redis url>`

If you enable the email worker/queue:
- `EMAIL_QUEUE_ENABLED=true`
- `EMAIL_QUEUE_NAME=email-jobs` (or keep default)

BullMQ connection will use `REDIS_URL` if present, otherwise it falls back to `REDIS_HOST`, `REDIS_PORT`, etc.

### 4) Required App Variables For Railway

These are the minimum variables you should set for a successful boot:

- `APP_NAME=TalentFlow`
- `UPLOAD_DIR=uploads`
- `DEFAULT_CURRENCY=USD`
- `JWT_SECRET=<long random string>`
- `CORS_ORIGIN=<your frontend url(s), comma-separated>`
- `PUBLIC_BASE_URL=<your railway backend url>`
- `SWAGGER_SERVER_URL=<your railway backend url>`

Railway will provide `PORT`; your app already reads `process.env.PORT`.

### 7) Dev Seed Data (Frontend Testing)

This repo includes a dev-only seeder: `scripts/seed-dev-db.js`.

Automatic behavior:
- If `NODE_ENV=development`, the server **automatically drops and recreates** the schema and seeds the DB on every boot (to keep demo data fresh for frontend testing).
- If you want persistent data, do NOT set `NODE_ENV=development` on Railway. Use `NODE_ENV=production`.

Safety gates:
- It refuses to run when `NODE_ENV=production`.
- It does nothing unless `SEED_DEV_DATA=true`.

To seed (local):
- `SEED_DEV_DATA=true SEED_RESET=true npm run seed:dev`

To seed (Railway, in a non-production environment):
1. Temporarily add Variables:
   - `SEED_DEV_DATA=true`
   - `SEED_RESET=true` (optional; drops and recreates tables)
2. Run a one-off command: `npm run seed:dev`
3. Remove `SEED_DEV_DATA` when you're done.

### 8) OTP In Development (No Email Required)

If `NODE_ENV=development`, OTP endpoints do not send email. Instead, the OTP code is returned in the response as `devOtp` so the frontend can complete verification flows without SMTP configured.

### 5) OAuth Redirects (If You Use Google/GitHub Login)

Set:
- `OAUTH_CALLBACK_BASE=<your railway backend url>`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`

Then update your Google/GitHub OAuth app settings to include the correct callback URLs based on `OAUTH_CALLBACK_BASE`.

### 6) Uploads Warning (Persistence)

`UPLOAD_DIR=uploads` works on Railway, but the filesystem can be ephemeral depending on deploys/restarts.
If you need persistent uploads, use object storage (S3-compatible) and store URLs in the DB instead of files on disk.
