# 15-Minute Presentation Outline

## 1. Product Walkthrough (2 minutes)

- Problem: authenticated users need secure file upload, metadata, tags, and storage insight.
- Demo flow: Google login, password setup, local login, upload, dashboard, file list, delete.

## 2. Architecture Decisions (4 minutes)

- Two-app workspace: Next.js frontend and Express API.
- Session cookie auth with MySQL-backed session store.
- Prisma schema for users, files, tags, file tags, and sessions.
- Local storage adapter now, cloud object storage ready later.

## 3. Backend Walkthrough (3 minutes)

- Passport Google OAuth strategy.
- Password setup and bcrypt hashing.
- Multer upload pipeline and user-scoped directories.
- REST endpoints and dashboard aggregation queries.
- Ownership checks on file operations.

## 4. Frontend Walkthrough (3 minutes)

- Zustand auth store and credentialed API client.
- Route protection and password setup redirect.
- React Hook Form validation.
- Upload form, Recharts dashboard, file table.
- Responsive Tailwind layout.

## 5. DevOps and Quality (2 minutes)

- Docker Compose for MySQL, API, and web.
- GitHub Actions for install, lint, test, build.
- Vitest and Supertest coverage.
- Environment variable contract.

## 6. Improvements and Tradeoffs (1 minute)

- Replace disk storage with S3/GCS.
- Add E2E tests and OAuth mocking.
- Add pagination, search, audit logs, and malware scanning.
