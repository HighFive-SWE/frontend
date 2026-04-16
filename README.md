# frontend

next.js 14 app router · tailwind · zustand · react-query.

## run

```bash
npm install
npm run dev
```

opens on http://localhost:3000. set `NEXT_PUBLIC_API_URL` to point at the backend (default `http://localhost:8000`).

## structure

```
app/         routes (/, /learn, /mirror)
components/  design system (Button, Card)
lib/         zustand store
services/    api client
modules/     feature-scoped code
  mirror/    hand tracker hook, comparator, overlay, coach hint
```

## mirror mode

runs `@mediapipe/tasks-vision` in-browser. on first open the model (~8 MB)
downloads from mediapipe's public CDN — allow ~1–2 s before tracking kicks in.
evaluation is throttled to ~220 ms; the rAF loop caps at the browser's refresh rate.
