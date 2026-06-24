# Deployment Guide

This project is easiest to deploy as:

- Frontend: Vercel
- API: Render web service
- Database: Railway MySQL, Neon-compatible MySQL host, PlanetScale, or managed MySQL

Note: Render Blueprints manage web services and Render Postgres, not MySQL, so the database must be hosted outside Render.
If the API runs on Render and the database runs on Railway, `DATABASE_URL` must use Railway's TCP Proxy hostname and port. The `mysql.railway.internal` host only works from services inside Railway's private network.

## Recommended Production Topology

1. Deploy the frontend from `apps/web`
2. Deploy the API from `apps/api`
3. Provision a managed MySQL database
4. Set environment variables in both services
5. Update Google OAuth redirect settings for the public domains

## Frontend Deployment

Recommended platform: Netlify or Vercel

Netlify settings:

- Runtime: `Next.js`
- Package directory: `apps/web`
- Build command: `npm --workspace @memoria/web run build`
- Publish directory: `apps/web/.next`
- Functions directory: leave the default placeholder as-is or blank

The repository also includes `netlify.toml` with the same build command and publish directory. Netlify file-based configuration takes precedence over conflicting UI values.

Vercel settings:

- Framework preset: `Next.js`
- Root directory: `apps/web`
- Build command: `npm run build --workspace @memoria/web`
- Install command: `npm install`

Required environment variable:

```env
NEXT_PUBLIC_API_URL=https://your-api-domain.example.com
```

## API Deployment

Recommended platform: Render web service

Settings:

- Root directory: leave blank
- Runtime: `Node`
- Build command: `npm install && npm run build --workspace @memoria/api`
- Pre-deploy command: `npm run prisma:deploy --workspace @memoria/api`
- Start command: `npm run start --workspace @memoria/api`

Required environment variables:

```env
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.example.com
DATABASE_URL=mysql://user:password@host:3306/database
SESSION_SECRET=generate-a-long-random-value
UPLOAD_DIR=./uploads
MAX_UPLOAD_MB=50
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://your-api-domain.example.com/api/auth/oauth/google/callback
```

## Database Setup

Use a managed MySQL database and apply migrations after deployment. On Render, prefer the pre-deploy command above or a blueprint like [render.yaml](render.yaml).

When the database is on Railway, copy the public TCP Proxy endpoint from Railway's database service settings and build `DATABASE_URL` from that host and port. Do not use `mysql.railway.internal` from Render or other external hosts.

For Railway and other managed MySQL hosts, external connections usually require SSL. The API automatically appends `sslaccept=strict` in production when it detects common cloud MySQL hostnames. You can also set it manually:

```env
DATABASE_URL=mysql://user:password@host:port/database?sslaccept=strict
```

After deployment, verify database connectivity:

```text
GET https://your-api-domain.example.com/health/db
```

Expected response:

```json
{ "status": "ok", "database": "connected" }
```

If this endpoint returns `503`, fix `DATABASE_URL` before testing OAuth or login.

```bash
npm run prisma:deploy --workspace @memoria/api
```

## Google OAuth for Production

Update the OAuth client in Google Cloud Console.

Authorized JavaScript origins:

```text
https://your-frontend-domain.example.com
```

Authorized redirect URIs:

```text
https://your-api-domain.example.com/api/auth/oauth/google/callback
```

## Storage Caveat

This app currently stores uploaded files on the API filesystem.

That is acceptable for local review, but for a real live demo on ephemeral hosting you should either:

- use a host with persistent disk support, or
- replace local file storage with S3, GCS, or similar object storage

If you keep local disk for the demo, note that uploaded files may be lost on redeploy or instance restart.

## Post-Deploy Smoke Test

1. Open the frontend URL
2. Click `Continue with Google`
3. Complete Google login
4. Set a local password
5. Upload a file with description and tags
6. Confirm dashboard counts update
7. Sign out and sign back in with local credentials
