# Memoria Full-Stack Technical Test

Memoria is a full-stack file upload dashboard built for the technical test brief. It uses a Next.js App Router frontend, an Express API, Prisma, MySQL, Google OAuth, session cookies, and local file storage.

## Features

- Google OAuth 2.0 account creation with Passport.js
- Required local password setup after first OAuth login
- Session management backed by MySQL via Prisma
- Local email/password login after password setup
- Authenticated file upload with description and multiple tags
- User-scoped file listing, download, metadata update endpoint, and delete
- Dashboard statistics for total files, storage usage, frequent tags, file type distribution, and recent uploads
- Docker Compose stack for MySQL, API, and web
- CI workflow for lint, test, and build

## Tech Stack

- Frontend: Next.js App Router, React, Tailwind CSS, Zustand, React Hook Form, Recharts
- Backend: Node.js, Express, Passport.js, Multer, Prisma
- Database: MySQL 8
- Testing: Vitest, React Testing Library dependencies, Supertest
- DevOps: Docker, Docker Compose, GitHub Actions

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Copy the environment template:

```bash
cp .env.example .env
```

3. Add Google OAuth credentials in `.env`.

Create an OAuth client in Google Cloud Console with this redirect URI:

```text
http://localhost:4000/api/auth/oauth/google/callback
```

4. Start MySQL:

If Docker is available:

```bash
docker compose up -d mysql
```

If Docker is not available and you are using a local MySQL service:

```bash
sudo service mysql start
```

5. Create the database tables:

```bash
npm run prisma:generate
npm run prisma:deploy --workspace @memoria/api
```

6. Start both apps:

```bash
npm run dev
```

The web app runs at `http://localhost:3000` and the API runs at `http://localhost:4000`.

## Docker Setup

```bash
cp .env.example .env
docker compose up --build
```

Before using OAuth in Docker, set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `SESSION_SECRET`, and keep `GOOGLE_CALLBACK_URL=http://localhost:4000/api/auth/oauth/google/callback`.

## Useful Commands

```bash
npm run dev
npm run lint
npm run test
npm run build
npm run prisma:migrate
```

## Repository Structure

```text
apps/api     Express API, Prisma schema, upload handling, tests
apps/web     Next.js frontend, dashboard UI, tests
docs         SDLC, API, and presentation notes
```

## Deployment Notes

- Deploy `apps/web` to Vercel with `NEXT_PUBLIC_API_URL` pointing at the API.
- Deploy `apps/api` to a Node-capable host such as Render, Railway, Fly.io, AWS ECS, or Heroku.
- Provision MySQL and set `DATABASE_URL`.
- On Render, run Prisma migrations in a release step rather than during build; `render.yaml` includes that configuration.
- Use persistent storage or replace local disk uploads with S3/GCS before production use.
- Set secure production values for `SESSION_SECRET`, Google OAuth credentials, `FRONTEND_URL`, and `GOOGLE_CALLBACK_URL`.

See these documents for submission:

- [docs/SDLC.md](docs/SDLC.md)
- [docs/API.md](docs/API.md)
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
- [docs/SUBMISSION.md](docs/SUBMISSION.md)
- [docs/PRESENTATION-SLIDES.md](docs/PRESENTATION-SLIDES.md)
