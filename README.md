# StudyPilot AI

**Your Personal Academic Mentor**

StudyPilot AI is a calm, responsive React prototype for university students. It turns course materials into a guided loop: Upload → Analyze → Understand → Practice → Diagnose Weaknesses → Improve → Final Revision → Mastery.

## Included

- Multi-step onboarding saved in LocalStorage
- Home dashboard, course search, course details, and upload/analyze simulation
- Guided learning mode with explanations, notes, bookmark, concept connections, and hidden-answer quick check
- 10-question quiz with navigation, flags, confirmation, and results analysis
- Persistent adaptive study-plan checklist
- Progress charts, study garden, and knowledge tree
- Nova AI Mentor mock chat
- Final revision pack and profile settings
- Responsive desktop, tablet, and mobile navigation
- HashRouter for static-host compatibility

## Run locally

```bash
npm install
npm run dev
```

Open the local URL shown by Vite.

## Production build

```bash
npm run build
npm run preview
```

The production files are created in `dist/`.

## Deploy to Vercel

1. Upload this project to a GitHub repository.
2. In Vercel, choose **Add New → Project** and import the repository.
3. Vercel should detect Vite automatically.
4. Build command: `npm run build`
5. Output directory: `dist`
6. Deploy. No environment variables are required.

## Deploy to GitHub Pages

This project uses `HashRouter` and `base: './'`, so direct refreshes work on static hosting.

1. Run `npm install` and `npm run build`.
2. Publish the contents of `dist/` to a `gh-pages` branch, or configure a GitHub Actions Pages workflow.
3. In repository **Settings → Pages**, select the deployed branch/action.

For a simple manual deployment with the `gh-pages` package, install it and add a deployment script if desired. Vercel is the easiest option for this version.

## Mock-only features

File reading, Google Drive, AI analysis, Nova responses, external sources, notifications, charts, and course intelligence use realistic local mock data. No uploaded document leaves the browser and no real file parsing occurs.

## Future real integrations

Connect a backend and AI service for document parsing, embeddings/retrieval, grounded explanations, quiz generation, weakness diagnosis, adaptive planning, and Nova chat. Add authentication and a database only when multi-device synchronization is needed.
