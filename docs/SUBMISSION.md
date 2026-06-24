# Submission Checklist

## 1. Documentation

Included in this repository:

- SDLC: [SDLC.md](./SDLC.md)
- API documentation: [API.md](./API.md)
- OpenAPI definition: [openapi.yaml](./openapi.yaml)
- Deployment guide: [DEPLOYMENT.md](./DEPLOYMENT.md)
- Presentation slides draft: [PRESENTATION-SLIDES.md](./PRESENTATION-SLIDES.md)

## 2. Private GitHub Repository

Create a new private repository and push this codebase:

```bash
git init
git add .
git commit -m "feat: implement full-stack file upload dashboard"
git branch -M main
git remote add origin git@github.com:YOUR_USERNAME/memoria-fullstack-test.git
git push -u origin main
```

After creating the repo:

1. Set repository visibility to `Private`
2. Add the reviewer GitHub usernames as collaborators
3. Verify that `.env` is not committed

## 3. Live Demo

Before submission, fill these in:

- Frontend URL: `https://memoria-docs.netlify.app`
- API URL: `https://memoria-j28d.onrender.com`
- Demo test user email: `____________________________`

If you do not want to share personal Google accounts with reviewers, create a dedicated reviewer Google account for the demo.

## 4. Presentation

Use [PRESENTATION-SLIDES.md](./PRESENTATION-SLIDES.md) as the script and slide source.

Suggested final format:

- 8 to 10 slides
- 15 minutes total
- 5 minutes reserved for demo and questions

## 5. Final Pre-Submission Checks

Run:

```bash
npm run lint
npm run test
npm run build
```

Confirm:

- Google OAuth works on the live deployment
- Password setup works after first OAuth login
- Local login works after password creation
- Upload requires file, description, and tags
- Dashboard updates after uploads
- Sessions persist after refresh

## 6. Optional Extras That Improve Scoring

- Generate and attach a coverage report with `npm run test:coverage`
- Add screenshots or GIFs to the README
- Add a short architecture diagram
- Add one end-to-end test flow
