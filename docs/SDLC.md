# Software Development Lifecycle

## Project Planning and Requirements Analysis

The application was broken into four vertical slices:

1. Authentication: Google OAuth, required password setup, local login, session persistence.
2. File management: upload, metadata, tags, secure user ownership, listing, download, delete.
3. Dashboard: per-user aggregates for count, storage, tags, file types, and recent activity.
4. Delivery: Docker, CI, tests, README, API docs, and presentation material.

The priority was to produce a runnable application with production-shaped boundaries rather than isolated mock screens.

## Architecture Design

The repo is a two-app npm workspace:

- `apps/web`: Next.js App Router client.
- `apps/api`: Express API.

The API owns authentication, session validation, file writes, and Prisma queries. The frontend talks to it through `fetch` with `credentials: "include"` so the session cookie remains HTTP-only.

MySQL stores users, sessions, file metadata, tags, and many-to-many file tag links. Uploaded binaries are stored on disk under user-specific directories. In production, the file storage adapter can be swapped for S3 or GCS without changing the database contract.

## Technology Stack Selection Rationale

- Next.js App Router: aligns with the requirement and provides modern routing.
- Tailwind CSS: fast responsive implementation with low component overhead.
- Zustand: minimal client state for auth without Redux ceremony.
- React Hook Form and Zod: controlled validation for login, password setup, and upload forms.
- Recharts: straightforward chart rendering for dashboard distributions.
- Express and Passport.js: explicit REST API and established OAuth/session flow.
- Prisma: type-safe schema, migrations, and query composition for MySQL.
- Multer: reliable multipart upload handling.
- Docker Compose: reproducible MySQL and app runtime for reviewers.

## Development Process

The work was organized as short implementation passes:

1. Create workspace, environment contract, Docker, and CI.
2. Model the database schema and Prisma client.
3. Implement authentication and session management.
4. Implement upload and metadata endpoints.
5. Implement dashboard aggregation endpoints.
6. Build the Next.js UI against the API.
7. Add tests and documentation.

Each pass left the project runnable before moving to the next slice.

## Testing Strategy

Backend tests cover:

- API health route with Supertest.
- Tag normalization utility used by upload and update flows.

Frontend tests cover:

- Byte formatting utility used in dashboard and file tables.

Recommended next coverage:

- Auth route integration tests with a test database.
- Upload endpoint integration tests with temporary file storage.
- React Testing Library tests for login, upload, and dashboard loading states.
- Playwright end-to-end flow for OAuth-mocked login, upload, and delete.

## Deployment Strategy

Local review can use Docker Compose. A production deployment can be split as:

- Web: Vercel or another Next.js host.
- API: Render, Railway, Fly.io, AWS ECS, Heroku, or a VM.
- Database: managed MySQL.
- Files: S3/GCS/Azure Blob for durable object storage.

Required production environment variables:

- `DATABASE_URL`
- `SESSION_SECRET`
- `FRONTEND_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_CALLBACK_URL`
- `UPLOAD_DIR` or cloud storage config

## Challenges Faced and Solutions

- OAuth plus local password setup needs a clear user state. The API returns `hasPassword`, and the frontend routes users to `/setup-password` until it is true.
- Sessions should not use the default in-memory store. A Prisma-backed session store persists sessions in MySQL.
- File ownership must be enforced on every file endpoint. Each read, update, download, and delete query includes `userId`.
- Dashboard aggregates need user scoping. Tag counts are derived only from the authenticated user's file tag links.
- External MySQL from Render requires the public database host and SSL. The API appends `sslaccept=strict` automatically for common cloud MySQL hostnames and exposes `GET /health/db` for deployment verification.

## Future Improvements

- Move binary storage to S3/GCS with signed download URLs.
- Add virus scanning and stricter file policy controls.
- Add pagination and search for large file collections.
- Add password reset and account recovery.
- Add audit logs for upload/download/delete events.
- Add OpenAPI generation and a Postman collection.
- Add full E2E tests and coverage reporting in CI.
