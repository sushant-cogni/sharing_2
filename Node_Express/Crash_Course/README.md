**Project:** Crash Course (wrapped backend + frontend)

- **Backend:** `backend/` — contains the Node/Express API. Run:

```powershell
cd backend
npm install
npm run start
```

- **Frontend:** `frontend/` — minimal Vite + React app. Run:

```powershell
cd frontend
npm install
npm run dev
```

Notes:
- I copied all server files into `backend/` and added a `backend/package.json` and `backend/.env` (copied as-is). You may want to update `backend/.env` values, especially the DB connection string.
- I left `node_modules/` in place at the root. For cleanliness you can remove it and run `npm install` inside `backend/` and `frontend/` independently.
- If you want me to remove the original backend files from the project root, tell me and I'll delete them.
