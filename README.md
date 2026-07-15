# StudyPilot AI V3

A stable bootcamp MVP that uses Gemini's native PDF document understanding. This avoids broken Arabic extraction from browser PDF text parsers and lets Gemini understand Arabic text, diagrams, tables, and page layout.

## Run

1. Copy `.env.example` to `.env` and add your Gemini API key.
2. Install dependencies: `npm install`
3. Terminal 1: `npm run server`
4. Terminal 2: `npm run dev`
5. Open `http://localhost:5173`

## MVP limits

- PDF files up to 25 MB.
- The analysis prompt requests up to the first 30 pages to control latency and output size.
- Course analyses are saved in browser LocalStorage; the PDF itself is not stored.
