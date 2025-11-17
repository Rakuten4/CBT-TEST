# CBT Practice — Offline Static App

This is a simple offline-capable multiple-choice practice app for WAEC, JAMB, NECO and GCE-style questions. It is intentionally small and self-contained so you can use it to test knowledge before exams.

How to use

- Open `index.html` in a browser to run the app (basic functionality works from the filesystem).
- For the service worker (true offline caching) you need to serve the files over HTTP. Example using Python (from the project directory):

```powershell
# Python 3
python -m http.server 8000

# Then open http://localhost:8000 in your browser
```

Files added

- `index.html` — main UI
- `css/style.css` — styles
- `js/app.js` — quiz logic and service worker registration
- `data/questions.json` — sample questions (editable)
- `sw.js` — service worker to cache app shell and question data

Notes

- Service workers do not run on the `file://` protocol. If you want full offline caching, serve the folder using a small local server (see examples above) and open via `http://localhost`.
- The `data/questions.json` file contains sample questions. You can expand or replace it with your own question bank (preserve the JSON structure).

If you want I can: add categories/subjects, import CSV question banks, track user progress in localStorage, or add a printable summary of results.

Admin (edit questions)

An in-app admin UI is included. Click the "Admin" button to open a simple editor where you can add, edit, and delete questions grouped by exam (WAEC / JAMB / NECO / GCE).

When you open the app in a browser (file:// or http), changes are saved to `localStorage`.

Running locally

You can serve the directory with a small static server during development. One simple option is to use the bundled command in `package.json`:

```powershell
npx http-server -c-1 . -p 8000
# then open http://localhost:8000
```

Note: This project no longer includes a service worker or an Electron runtime. It's intended to be hosted online (GitHub Pages, Netlify, Vercel, or any static host). Serve over HTTPS/HTTP for best compatibility.

