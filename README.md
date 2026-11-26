# CodeTrail

A gamified coding-lessons app: Python, C, C++, React, SQL, Java, JavaScript, DSA and Git courses with lessons, quizzes, coding challenges, XP, streaks and badges.

- `frontend/` — React + TypeScript + Vite app. Code execution for every course runs client-side via small in-browser interpreters/simulators (ported and extended from the original prototype — see "Course content status" below).
- `backend/` — FastAPI + SQLite. Handles accounts (JWT auth) and persists each user's progress (XP, streak, badges, chapter/quiz/challenge state).
- `legacy/CodeTrail.html` — the original single-file prototype this project was converted from.

## Backend setup

```
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

This creates `backend/codetrail.db` (SQLite) on first run. Config lives in `backend/app/config.py` and can be overridden via a `backend/.env` file (`DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGINS`, etc.). Set a real `JWT_SECRET` before deploying.

## Frontend setup

```
cd frontend
npm install
npm run dev
```

The dev server runs on `http://localhost:5173`. It talks to the backend at `http://localhost:8000` by default — override with `VITE_API_URL` in `frontend/.env.development` if your backend runs elsewhere.

## Deployment (free tiers)

Frontend on Vercel, backend on Render, database on Neon Postgres. Don't use SQLite in production on Render's free tier — its disk is wiped on every restart/redeploy.

1. **Database (Neon):** create a project and copy its connection string (`postgresql://...?sslmode=require`).
2. **Backend (Render):** New → Blueprint → pick this repo; it reads `render.yaml`. When prompted, set:
   - `DATABASE_URL` — the Neon connection string
   - `CORS_ORIGINS` — a JSON list with your frontend URL, e.g. `["https://codetrail.vercel.app"]` (fill in after step 3, then redeploy)

   `JWT_SECRET` is generated automatically. Check `https://<service>.onrender.com/health` returns `{"status":"ok"}`. The free service sleeps after ~15 min idle, so the first request after that takes ~30–60s.
3. **Frontend (Vercel):** New Project → this repo, Root Directory `frontend` (Vite preset). Add env var `VITE_API_URL` = your Render URL (no trailing slash). `frontend/vercel.json` rewrites all routes to `index.html` so deep links work.

## Course content status

The original prototype only had full lessons (sections + quiz + challenge) for chapters 1–2 of each 8-chapter course; chapters 3–8 were stubs with just a title and topic list. Each course's mini-interpreter was also deliberately minimal — e.g. the original Python runner had no loops, functions, or data structures at all.

Work is going course-by-course: first extend that language's interpreter to actually support what its later chapters teach (verified against a regression suite so earlier chapters never break), then write and verify the missing chapters against it.

| Course | Chapters 1–2 | Chapters 3–8 | Interpreter |
| --- | --- | --- | --- |
| Python | ✅ | ✅ | if/elif/else, for/while, functions (incl. scope/defaults/kwargs), lists/tuples/dicts/sets, classes/inheritance |
| JavaScript | ✅ | ✅ | switch, classes/inheritance, async/await + Promise, fetch mock, a small virtual DOM |
| C | ✅ | ⏳ | still the original minimal runner (print/variables/math only) |
| C++ | ✅ | ⏳ | still the original minimal runner |
| Java | ✅ | ⏳ | still the original minimal runner |
| SQL | ✅ | ⏳ | SELECT only; no JOIN/INSERT/UPDATE/DELETE/subqueries yet |
| Git | ✅ | ⏳ | local repo basics only; no remote/push/pull/tag/revert/rebase yet |
| React | ✅ | ⏳ | function components, JSX, props, useState, events |
| DSA | ✅ | ⏳ | JS variant benefits from the JS engine work above; other language variants use precomputed reference output |

## Notes

- Progress is per-account: create an account, and XP/streak/badges/chapter progress sync to the backend (debounced) instead of living in `localStorage`.
- Code "execution" is simulated in the browser for every language — there is no server-side sandboxed code runner.
