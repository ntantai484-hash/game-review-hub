# Game Review Hub

Local web app built with Node.js, Express, MongoDB, Mongoose, EJS, and Bootstrap 5.

Quick start:

1. Install deps:

```bash
npm install
```

2. Start local MongoDB and run:

```bash
npm run dev
```

3. Open http://localhost:3000

Default Mongo URL: `mongodb://127.0.0.1:27017/gamehub` (configurable via `MONGO_URI` env).

Notes:
- Admin routes are under `/admin` and require a user with role `admin` (create manually in DB or adjust registration temporarily).
- Uploaded images are saved to `public/uploads`.

Files overview:
- `app.js` — application entry and route mounting.
- `config/db.js` — mongoose connection helper.
- `models/` — `User`, `Game`, `Comment` Mongoose models.
- `controllers/` — handlers for auth, games, comments.
- `routes/` — express routers.
- `middleware/` — auth checks and multer upload config.
- `views/` — EJS templates (Bootstrap 5 UI).
"# game-review-hub" 
