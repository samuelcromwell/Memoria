# Presentation Slides

## Slide 1: Title

Memoria  
Full-Stack Developer Technical Test

Talking points:

- Brief overview of the product
- Problem being solved
- Main stack: Next.js, Express, Prisma, MySQL

## Slide 2: Requirements Summary

- Google OAuth plus local password setup
- Authenticated file upload with metadata
- Per-user dashboard statistics
- Documentation, deployment, and testing

Talking points:

- Explain how the implementation was split by vertical feature slices

## Slide 3: Architecture

- `apps/web`: Next.js App Router frontend
- `apps/api`: Express API
- MySQL for persistence
- Session cookie auth between frontend and API

Talking points:

- Frontend communicates with API using credentialed requests
- API owns auth, uploads, and aggregation logic

## Slide 4: Authentication Design

- Google OAuth via Passport.js
- First-time Google users are redirected to password setup
- Local login uses bcrypt password verification
- Sessions are stored in MySQL

Talking points:

- Explain why session storage moved out of in-memory Express state

## Slide 5: File Upload Design

- Uploads handled with Multer
- Files stored in user-specific directories
- Metadata stored in MySQL
- Tags implemented as many-to-many relation

Talking points:

- Show ownership enforcement on every file route
- Mention backend validation for required metadata

## Slide 6: Dashboard Design

- Total files
- Total storage used
- Most-used tags
- File type distribution
- Recent uploads

Talking points:

- Explain aggregation queries and why stats are scoped to the authenticated user

## Slide 7: Frontend Implementation

- Next.js App Router
- Zustand auth store
- React Hook Form plus Zod validation
- Recharts for visualization

Talking points:

- Show required field validation
- Show success/error handling in the upload flow

## Slide 8: DevOps and Quality

- Docker Compose for local stack
- GitHub Actions CI
- Vitest and Supertest coverage
- OpenAPI and SDLC documentation

Talking points:

- Mention current test coverage and the next logical test additions

## Slide 9: Demo

Demo steps:

1. Sign in with Google
2. Set a password
3. Upload a file with description and tags
4. View dashboard updates
5. Log out and sign back in locally

## Slide 10: Tradeoffs and Future Improvements

- Local filesystem storage is fine for the test, but object storage is better for production
- Sessions are implemented with cookies and MySQL persistence
- Next improvements:
  S3/GCS storage
  richer integration and E2E coverage
  pagination and search
  audit logging

Talking points:

- Close by tying tradeoffs back to speed of delivery and submission scope
