# Deployment Guide

This project is easiest to deploy as:

- Frontend: Vercel
- API: Render web service
- Database: Railway MySQL, Neon-compatible MySQL host, PlanetScale, or managed MySQL

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

Use a managed MySQL database and apply migrations after deployment:

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
