# EchoVoice

Preserve the voices you love. EchoVoice lets you upload or record a loved one's voice sample and save spoken questions locally — the foundation for a future voice-response experience.

This is Phase 1: a fully frontend, browser-only MVP. No backend, no auth, no cloud storage.

---

## Routes

| Route | Description |
|---|---|
| `/` | Landing page — navigate to upload or ask flows |
| `/upload` | Upload an existing audio file or record a new voice sample in the browser |
| `/ask` | Record a spoken question, preview it, and save it locally |

---

## Tech stack

- [Next.js 16](https://nextjs.org) — App Router
- [React 19](https://react.dev)
- [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS v4](https://tailwindcss.com)

---

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project structure

```
app/
  page.tsx            # Landing page
  upload/page.tsx     # Voice upload + in-browser recording
  ask/page.tsx        # Question recording
components/
  NavBar.tsx          # Sticky navigation
  AudioPlayer.tsx     # Custom play/pause + seek scrubber
  AudioRecorder.tsx   # Recording widget (timer, stop, discard)
  FileUpload.tsx      # Drag-and-drop / click-to-browse audio uploader
hooks/
  useAudioRecorder.ts # MediaRecorder state machine
  useFileSave.ts      # File System Access API + download fallback
```

---

## Local file saving

Saving uses the [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API) where available:

- **Chrome / Edge** — a native "Save As" dialog lets you choose the exact save location
- **Firefox / Safari** — falls back to a standard browser download to your Downloads folder

See `hooks/useFileSave.ts` for full implementation details and browser notes.


---

## Scripts

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run lint     # ESLint
```
