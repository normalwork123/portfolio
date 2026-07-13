# Cinematic Portfolio

A world-class cinematic portfolio website for Harsh Rai - Frontend Developer & UI/UX Enthusiast.

Built with Next.js 16 (App Router), React 19, TypeScript, Three.js, Tailwind CSS, and Supabase.

## Getting Started

```bash
npm install
npm run dev
npm run build
```

_Full build in progress._

## CI/CD

This repository uses **GitLab CI/CD** to automatically deploy to **Vercel**. Vercel remains the host because the project is a Next.js App Router app that requires a Node.js server (GitLab Pages is not used).

### Pipeline stages

The pipeline (`.gitlab-ci.yml`) runs three stages:

1. **install** - runs `npm ci` to install dependencies.
2. **build** - runs `npm run build` (`next build`) to compile the app and catch TypeScript errors early.
3. **deploy** - installs the Vercel CLI and deploys the prebuilt output to production.

Behavior by trigger:

- **Merge requests** run `install` + `build` only (no deploy), so changes are validated before merging.
- **Only the `main` branch** deploys to production at https://portofoliov1-eta.vercel.app.

### Required CI/CD variables

Set the following in **GitLab → Settings → CI/CD → Variables**. All three must be **Masked** and **Protected**:

| Variable | Description |
| --- | --- |
| `VERCEL_TOKEN` | Vercel access token used to authenticate the CLI. |
| `VERCEL_ORG_ID` | Your Vercel organization/team ID. |
| `VERCEL_PROJECT_ID` | The Vercel project ID for this portfolio. |

Do **not** hardcode these values in the repository.

### How to get `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID`

Run the following in the project root locally and follow the prompts to link to the existing Vercel project:

```bash
npx vercel link
```

After linking, both IDs are written to `.vercel/project.json`:

```bash
cat .vercel/project.json
# { "orgId": "...", "projectId": "..." }
```

Use `orgId` for `VERCEL_ORG_ID` and `projectId` for `VERCEL_PROJECT_ID`. The `.vercel` folder is git-ignored and should not be committed.


