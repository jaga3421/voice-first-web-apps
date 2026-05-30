# Voice First Web Apps

A cinematic keynote on building web apps that listen — given at **JSLovers Chennai × MongoDB**, May meetup.

The deck itself is voice-driven: you can advance slides, jump to the agenda, start and pause the talk timer, toggle live subtitles, and trigger a confetti reaction, all by speaking. There's also a live dictation demo at `/demo-dictation` that contrasts deterministic phrase matching with an AI-inferred intent path.

Live: <https://voice-first-web-apps.vercel.app>

---

## Run it locally

```bash
npm install
OPENAI_API_KEY=sk-... npm run dev
```

The dev server runs on <http://localhost:3000>. The OpenAI key is only needed for the **AI** mode of `/demo-dictation` (audio transcription + intent classification). Everything else works without a key.

For production, set `OPENAI_API_KEY` as an environment variable in your Vercel project's Settings → Environment Variables.

## During the talk

| Key | Action |
| --- | --- |
| `Q` | Toggle voice command listening on / off |
| `→`, `Space`, `PageDown` | Next step / slide |
| `←`, `PageUp` | Previous step / slide |
| `↑` `↓` | Jump to previous / next slide |
| `Home` / `End` | First / last slide |
| `G` | Toggle the slide grid overview |
| `F` | Toggle browser fullscreen |
| `Esc` | Close the grid overview |

The bottom-centre waveform indicator turns from grey to cyan when the mic is active and animates in real time to your audio level. It turns **red** if speech recognition fails — the app will silently attempt one recovery; if that also fails, refresh the page to get another single retry.

## Voice commands

Say these naturally — partial phrases work too (the matcher is intentionally generous with mishears).

- **Navigation** — *"next"*, *"go to the next"*, *"previous"*, *"go back"*, *"slide three"*, *"agenda"*
- **Timer** — *"start timer"*, *"pause timer"*, *"resume timer"*
- **Subtitles** — *"show subtitles"*, *"hide subtitles"*
- **Confetti** — *"100"*, *"my demo"*
- **Easter eggs** — *"molecules"* and *"iron man"* / *"vibe coder"* each pop a 2-second gif overlay

## The dictation demo

Hit `/demo-dictation` (or click the **Demo** slide) for a side-by-side that visualises the voice loop:

- **Browser transcript** — what `SpeechRecognition` heard, updated live.
- **Command panel** — registered phrases. The one that matched lights up green.
- **Executed list** — what the system actually fired and why.
- **AI toggle** — flip it on to also send each audio segment to OpenAI for transcription and intent classification. The "AI intent" pill shows when the model picked a command the literal-match path missed.

It's the same speech loop used by the deck, in slow motion.

## Stack

- Vite + React 19 + TypeScript
- TanStack Router (file-based)
- Tailwind CSS v4
- Framer Motion
- OpenAI Node SDK (server-side, in a Vite dev plugin during local dev and a Vercel serverless function in production)
- Web Speech API (`SpeechRecognition`) for in-browser dictation and command matching
