# Voice First Web Apps — Deck Review

A four-pass review of the 17-slide deck, done by walking the deck end-to-end at 1280×800, then again at 375×812 (mobile), then re-reading the source. Findings are organised so you can scan the **Executive Summary** in 60 seconds, dive into **Per-slide notes** when you want detail, or jump straight to the **Prioritised improvement table** at the end if you only have 30 minutes to act.

> Reviewer lenses used per slide: speaker, UX designer, senior FE engineer (15y), mid engineer (3y), fresher (0–2y), final-year CS student, first-year CS student, conference organiser, skeptical voice-tech veteran.

---

## TL;DR — Top 7 highest-leverage fixes

If you only had **one hour** before the talk, these are the things to do, in order:

1. **Slide 8 (From mic to action) — replace placeholder code with real JS.** The `// 1. Listen continuously` comments inside `VoiceController()` are aspirational, not code. At a JS meetup that's the slide most engineers will photograph; it has to compile.
2. **Slide 8 — show all 3 cards from step 0, dimmed.** Currently step 0 hides cards 2 and 3 entirely; the audience loses the "where are we going" map. Your own feedback to me earlier was *don't just reveal the next block* — that's still happening.
3. **Slides 5 & 12 auto-stagger reset gap — hold the "all-lit" state for 4–6s, not 2s.** Right now the reset moment shows every stage dimmed, which feels like a bug to the audience.
4. **Slide 13 (Extract the intent) — slow the cycle from 3.5s to ~6s and overlap the in/out so both cards aren't blank at once.** `AnimatePresence mode="wait"` is currently leaving a hole between examples.
5. **Slide 9 (Demo) — the link `/demo-dictation` does not exist in the codebase.** Either wire up the route or remove the link / make it a QR. If the demo is the deck itself, say that.
6. **Slide 17 — fix the awkward "Q&A &" wrap.** Either `Q&A` on its own line, or use a centered `·` separator like `Q&A · Thanks`. The orphan ampersand is the only typographically broken moment in the deck.
7. **Add `prefers-reduced-motion` respect at the CSS / framer-motion level.** Every slide currently animates; one attendee with vestibular sensitivity is one too many.

Everything else is in the prioritised table at the bottom.

---

## Pass 1 — Walkthrough capture

| # | Slide | Notes captured |
|---|---|---|
| 01 | Cover | Hero text + gradient "listen" works. Speaker block balanced. Aurora subtle. |
| 02 | Talk Agenda | 8 items, 2 cols, numbered 01–08. No time estimates. |
| 03 | CLI → GUI → Voice | Three era cards (cyan / violet / magenta). Glyphs animate. Faint connector line. |
| 04 | Use Cases | 3 cards, animated SVG icons. Layout is solid. |
| 05 | The Interaction Loop | Auto-stagger 2s. Listen → Transcribe → Understand → Act. Reset moment shows all dim. |
| 06 | Commands vs Conversation | Clean split. 3 traits each side. |
| 07 | A Clean State Flow | 4 pipeline cards with payload chips + continuous packet flow underneath. |
| 08 | From mic to action | Step-based reveal of 3 code cards. Highlights + "EXPLAINING THIS" badge. |
| 09 | Demo | Big "Demo" gradient + `/demo-dictation` pill. |
| 10 | From phrase to handler | Live phrase→registry→handler loop + examples grid + how-to-detect card. |
| 11 | Where AI fits | Augment vs Don't drive — two columns. |
| 12 | The Hybrid Model | Auto-stagger 3 stages, phrase chip, packet, result line, principles. |
| 13 | Extract the intent | Cycling 3 examples through raw→AI→intent transformation. |
| 14 | Demo · with AI | Repeats `/demo-dictation` URL, adds AI mode tag + example phrases. |
| 15 | Ship-ready voice | 8 best-practice cards 4×2. |
| 16 | Summing up | 6 numbered principles + closing line. |
| 17 | Q&A & Thanks | Big title + contact bar at bottom. |

Mobile pass (375×812): the 1920×1080 stage scales to ~0.195, so the slide content occupies only a thin horizontal strip in the middle of the screen. Mobile tap nav works (verified `2` buttons, `display: flex`, viewport reflows correctly), but the underlying slide is illegible. **Mobile is currently unviewable as a deck**, even though the tap layer is functioning.

---

## Pass 2 — Per-slide persona notes

### 01 · Cover

**What works**
- Strong hero. The gradient on `listen` lands the verb.
- Speaker / contact blocks have a clean rhythm at the bottom.
- Aurora is alive enough to feel modern, not enough to distract.

**What doesn't**
- *Speaker (you)*: there's no date, no edition number, no venue, no city. The opening photo of the slide gets shared on LinkedIn — those details matter.
- *UX designer*: "Front End Developer" is mid-weight, "Turing.com" reads as a URL (with `.com`) right under a job title. Make it "Turing" or drop the dotcom.
- *Voice-tech veteran*: the hero `Build apps that listen to you` is grammatically a bit off — the apps listen to the user, not "to you" the speaker. A safer landing is `Build apps that listen.` (period, full stop).
- *Conference organiser*: no QR or short URL for the deck itself. If audience members want to follow along on phones, they can't.
- *First-year CS student*: this is approachable; the title doesn't gate-keep.
- *Senior FE engineer*: the cover is the only slide where I expect to see the date/version. Without it the deck has no edition.

### 02 · Talk Agenda

**What works**
- Two-column 8-item layout is easy to read.
- 01–08 numbering anchors progress.

**What doesn't**
- "CLI to GUI to Voice" — "to" appears twice. The visual arrow `→` would read faster. (You already use it on slide 3's title.)
- No timing estimates next to each item. For a 25-minute talk, the audience cannot pace themselves.
- "Q&A" as item 08 is fine, but a viewer assumes 8 sections; the actual deck has 17 slides because some sections span multiples. Either drop slide counts, or say "Section 8 of 8."
- *3-year engineer*: "Phrase vs Intent" is jargon — they won't know yet whether to care.
- *Final-year student*: the agenda doesn't tell them what they'll be able to do at the end. A line like *"You'll leave with a command registry pattern you can drop into your next React app"* would set expectation.

### 03 · CLI → GUI → Voice

**What works**
- Three accent-coloured cards. The glyphs (`❯_`, `▢`, `◎`) are charming and culturally legible.
- Keyword chips at the bottom of each card carry their own micro-story.

**What doesn't**
- *Voice-tech veteran*: the arrow `→` implies obsolescence. CLI did not get replaced; GUI did not get replaced. The talk-friendly framing is *"layers of interaction"*, not *"eras"*.
- *Senior engineer*: "Era 01 / Era 02 / Era 03" feels marketing-deck. The keyword chips already do the work; the "Era" label adds nothing.
- *UX designer*: the horizontal connector line behind the cards isn't depicting flow — it visually competes with the cards. Either make it a clear timeline (with dates) or drop it.
- The `❯_` glyph is visually smaller than `▢` and `◎` — set them to the same em-box or unify with a small icon set.

### 04 · Use Cases

**What works**
- Animated SVG icons are subtle and on-brand.
- Three categories cover the realistic shape of the market.

**What doesn't**
- "Next-Gen Agents" reads buzzword-y. Try "AI Assistants" or "Conversational Agents".
- The three card-glow halos (cyan / violet / magenta) blend at a distance into one purplish mass. Increase the gap between card glows or vary halo sizes.
- *Conference organiser*: there's no anchor example per use case. A real product name (e.g. "Otter for dictation, BMW iDrive for cars, ChatGPT voice for assistants") makes each card concrete.
- *15-year engineer*: where's the business case? Accessibility cards always benefit from a stat ("1.3B people globally have a disability"). It moves the room.
- *First-year student*: copy is short and crisp — accessible.

### 05 · The Interaction Loop

**What works**
- 4 stages is the right number for memorability.
- Per-stage visuals are appropriate: waveform bars under Listen, transcript under Transcribe, particle dots under Understand, validation chip under Act.
- Auto-stagger removes the need for keypress and lets the audience watch.

**What doesn't**
- **Reset gap.** With `holdCycles=1` and 2s intervals, the "all-dimmed" state at reset feels like the slide broke. Hold full-lit for 4–6s, then dim, then restart. Or run a *forward-only* sweep that simply re-enters.
- The circles render as rounded-square in the captured screenshot at 1280×800. They are actually `rounded-full` per code but visually read as squircles at scale. Worth eyeballing in real fullscreen.
- "Understand: Command, intent, or just dictation?" — `just dictation?` is a vague third option and not actionable. If dictation is a real branch, give it a stage; if not, drop it.
- *Voice-tech veteran*: where is "Permit"? Mic permission is stage 0 of every real voice app and you skip it. Audience needs to know permissions aren't given to you, they're asked for.
- *3-year engineer*: glossary moment — VAD (Voice Activity Detection) is the technical name for the Listen stage. Saying it once raises trust.

### 06 · Commands vs Conversation

**What works**
- Clean side-by-side. Parallel structure (Deterministic/Fast/Safer vs Flexible/Ambiguous/AI-Friendly).
- The single most actionable framing in the deck.

**What doesn't**
- Visually the two cards are too similar. *Command Mode* should feel like a switch (rigid, monospace, neat); *Conversation Mode* should feel like a chat bubble (softer, organic).
- No example sentences anchor the difference. Imagine each card showed a real quote: `"next slide"` vs `"can you take me to the last graph"`. That single line is the takeaway.

### 07 · A Clean State Flow

**What works**
- Pipeline cards have payload chips (`audio chunks` → `"next slide"` → `{cmd: "next_slide"}` → `goNext()`). This is the strongest data-narrative in the deck — keep it.
- "The only thing that mutates" is a great Redux-flavoured line. It earns its place.
- The footer mantra "UNIDIRECTIONAL · ISOLATED · DEBUGGABLE" is a memorable closer.

**What doesn't**
- **Redundancy with Slide 5.** Slide 5 is *Listen → Transcribe → Understand → Act* (semantic) and Slide 7 is *Speech Input → Transcript State → Intent Parser → Action Dispatcher* (architectural). Same arc, different vocab. Either explicitly frame them as "concept vs code-shape", or merge.
- The packet flow rail at the bottom duplicates the card pipeline above. It's pretty but earns no new information. Either remove or use it to *animate the payload transformation* (audio → string → object → action) instead of repeating the cards.
- Card sub-text lengths are uneven, making card heights look unbalanced ("Web Speech API · streaming STT" is 2 lines, "the only thing that mutates" is 1).
- *Senior engineer*: I like the architecture but I want to see how the parser is wired. The talk needs to either show that on the next slide or admit it's out of scope.

### 08 · From mic to action

This is the most important slide in the deck for the engineering audience, and also the weakest.

**What works**
- Three code cards with macOS traffic-light headers. The visual is good.
- "EXPLAINING THIS" badge on the focused card is a clever speaker aid.
- Highlighted line ranges (per `card.highlight`) draw attention.

**What doesn't**
- **The controller code is fake.** All four numbered comments (`// 1. Listen continuously`...) are placeholders inside an empty function body. At a JS meetup, that's the slide everyone photographs. It needs real `useState`, real event listeners, real callbacks.
- **Step 0 hides the other two cards entirely.** You told me last round *don't just show next blocks*. That's still happening. Render all three at step 0, dimmed, so the audience sees the map. Step changes focus, not visibility.
- Filename says `controller.tsx` but contains no JSX. Use `voice-controller.ts` or actually show JSX.
- Code size is `15px` (small) inside the card. At projection distance that may be illegible for the back row. Try 18–20px and reduce the number of lines.
- `<voice-interface />` is not a standard HTML element. If you're using web components, say so explicitly; if it's a placeholder for a React component, use the React name (`<VoiceInterface />`).
- No `await`, no error handling. Real voice code is async-first.
- *Mid engineer*: I want to copy this on Monday. Right now I can't.

### 09 · Demo

**What works**
- Punchy. Big "Demo" with the gradient hammer. Pulse indicator on the mic dot.

**What doesn't**
- **`/demo-dictation` route doesn't exist in the codebase.** Either build a minimal dictation demo at that path (which is the most valuable thing you could do for this talk) or replace the URL with a QR to a live external demo.
- The audience won't be browsing to `/demo-dictation` mid-talk on their laptops. The slide presumes you'll be running the demo on the projection itself. Make that explicit ("try saying 'next slide' now").
- Background loses the aurora because of the `relative z-10 text-center` wrapper around the demo content — the slide feels dimmer than 14 (Demo + AI). Inconsistent.

### 10 · From phrase to handler

**What works**
- The flow loop is the best motion piece in the deck. Phrase chip enters left, packet rides to the registry, registry highlights matching row, packet rides to the handler, handler badge flashes ✓.
- The "How to detect them" card is the cleanest text panel.

**What doesn't**
- **Phrase and handler can desync.** Both use `cur` from one state but each `AnimatePresence mode="wait"` block sequences its own exit/enter, with the handler delayed by `0.5–1.3s`. During transitions the audience sometimes sees `"pause timer"` paired with `goNext()`. Sync them by keying both off a single shared `cur.key` and avoiding the delayed handler.
- The cycle is 2.8s — fast for reading the handler call. 4s would breathe.
- "search docs for hooks" reads like an in-joke (React hooks). If your audience is mixed (Vue, Solid, vanilla) drop the React-flavoured noun.
- Right card lists 3 detection mechanics (Registry, Aliases, Confidence) but says nothing about *partial vs final transcripts*. That's the production gotcha that bites every newcomer; mention it.

### 11 · Where AI fits

**What works**
- Strong opinionated framing: Augment vs Don't drive.
- The check / cross system reads at a glance.

**What doesn't**
- "Don't drive" — the wordplay is cute but it confuses non-native English speakers ("driving means controlling" vs "driving a car"). `Don't lead` or `Don't decide` are unambiguous.
- The card is dense: kicker + h1 + 3 items × (header + 2-line body). At projection distance this is a wall of text. Cut to 2 items per card.
- No example per item. "Critical Controls: No model fires payments or deletes directly" begs for a real cautionary tale (a Tweet, an incident).
- *Senior engineer*: this is the slide that should reference real production scares — Air Canada chatbot, Cursor's recent incidents, etc. One line of attribution gives the principle teeth.

### 12 · The Hybrid Model

**What works**
- Same auto-stagger shape as Slide 5 — viewer learns the pattern.
- The phrase chip at top + `{ command: "next_slide" }` at bottom closes the loop visually.

**What doesn't**
- Same reset-gap issue as Slide 5: all-dimmed state at restart looks broken.
- The packet animation on the rail moves at a fixed 4s sweep regardless of which stage is "active". It should *pause at each stage* to mirror the per-stage explanation.
- "Allow-list" — newcomer doesn't know if this means whitelist of command IDs, or something else. One line: "Reject anything not in the registry."
- *Voice-tech veteran*: hybrid is the actual production pattern. It deserves more breathing room than this single slide.

### 13 · Extract the intent

**What works**
- The structured intent card on the right with the JSON shape `{ command, confidence }` is the most production-realistic visual in the deck.
- 3 examples gives variety.

**What doesn't**
- **AnimatePresence transition gap.** Mode `"wait"` + a 0.2s delay on the right card means at certain moments both sides are fading and the slide visibly *empties*. Either drop mode="wait" and crossfade, or extend the dwell.
- 3.5s is too fast to read both the raw transcript and the intent — at projection distance the eye barely lands on one card before they cycle.
- The arrow + "AI parse" mini-label between the cards has a thin progress bar that loops independently of the actual cycle. It looks like a loading spinner that never finishes. Either tie it to the cycle progress or remove.
- The 3 bottom bullets ("Model the meaning / Validate / Hybrid") are buried under the loop; viewers focus on the moving things and miss the takeaway. Promote the bullets above the loop or hide them until the loop has run once.

### 14 · Demo · with AI

**What works**
- Pulsing example phrase chips are atmospheric.
- "Demo + AI" gradient title is consistent with Slide 9 visual rhyme.

**What doesn't**
- **Same URL as Slide 9** — `/demo-dictation`. Either two demos at two URLs, or one demo with a "Toggle AI" button. Two slides pointing at the same nonexistent demo URL is a credibility hit.
- Five example phrases pulsing simultaneously creates a "Vegas signage" feel — pick 3 and let them breathe.
- "Now natural phrases route through AI intent extraction." — the *now* implies *change from before*. If the talk hasn't actually shown the non-AI demo first, this slide makes no sense.

### 15 · Ship-ready voice (Best Practices)

**What works**
- 8 items, 4×2 grid, neatly numbered. Skimmable.
- Honest production-derived advice.

**What doesn't**
- Items are flat. Grouping them helps recall: **UX** (1, 2, 4), **Engineering** (3, 5, 6), **Privacy** (8), **Robustness** (7).
- Several items want a number or KPI:
  - #6 "Measure latency, failures, and no-match commands" — what's a good target? (Tip: total round-trip < 1.2s for command UX.)
  - #7 "Design for noise, accents, and bad networks" — how? (Tip: fall back to push-to-talk + dictation when SNR drops.)
- *3-year engineer*: these read like a checklist. They'd land harder if each had a one-line *war story*.
- The numbering 01..08 implies an ordering that isn't there. Either reorder by priority or remove the numbers.

### 16 · Summing up

**What works**
- Six principles + a closing line is the right shape.
- Italic delivery of the closer ties back to Slide 1.

**What doesn't**
- "Voice is the most natural interface" — debatable, and the back of the room will quietly disagree. *"Voice is one of the most natural interfaces"* keeps the point without inviting Twitter beef.
- "The app always owns execution and safety" — true but reads like compliance-speak. Try "The app — not the model — owns execution."
- "Let's build apps that listen." duplicates the cover hero. If you want the call-back, contrast the typography: cover = serif/giant, summing-up = monospaced/small. Right now they look identical.
- No call-to-action: no Discord, no repo link, no follow-up event. The "what next" is missing.

### 17 · Q&A & Thanks

**What works**
- Massive headline. Speaker info + 4 contact cards = everything someone needs.

**What doesn't**
- **"Q&A &" line break.** The ampersand sandwich is the only typographic glitch in the deck. Options:
  - `Q&A · Thanks` with center dot
  - `Q&A` on one line, `& Thanks` on second line with smaller weight
  - Just `Thanks. Questions?` — shorter, friendlier
- "Thanks" is set in plain foreground while "Q&A" is in gradient. The hierarchy implies "Q&A" > "Thanks", but you actually want them equal.
- Contact cards are width-uniform but content widths are not — `linkedin.com/in/jjayy` is much shorter than `jagadeesh.jkp@gmail.com`. Either ellipsize, set monospace and let them ragged, or use shorter visual handles.
- **No QR code.** This is the slide that screams for a QR. People want to scan and save your contact in 5 seconds before the next session starts.
- Email card should be `mailto:` with a prefilled subject like `Voice First Web Apps — Question`. (You already do `mailto:` — just add the subject query param.)

---

## Pass 3 — Dimensional sweep

### Content & narrative arc

The story is roughly:

```
Setup → Why → How → Implement → Show → Refine → AI → Show again → Best practice → Close
1      2,4   3,5,6,7 8           9     10        11,12,13 14         15            16,17
```

**Issues**

1. **5 and 7 are siblings.** Slide 5 ("Listen → Transcribe → Understand → Act") and Slide 7 ("Speech Input → Transcript State → Intent Parser → Action Dispatcher") are the same arc in two vocabularies. Audience absorbs whichever lands first and tunes out the other. Either:
   - Frame explicitly: 5 = the user's experience loop, 7 = the developer's code loop.
   - Or merge into one slide with two rows: top row in nouns ("Speech / State / Parser / Dispatcher"), bottom row in verbs ("Listen / Transcribe / Understand / Act").
2. **9 and 14 are two demo slides for the same URL.** Either:
   - Show the same demo twice with different prompts (deterministic phrases → fuzzy phrases). Make the *difference* the slide.
   - Or cut one slide.
3. **12 and 13 overlap.** Both teach intent extraction. 12 shows the pipeline, 13 shows the input/output. Consider 12 = mechanism, 13 = examples that prove it works.
4. **No numbered story arc.** Audiences track better when you say "we're now in part 2 of 3". Your section kickers (`02 · The Path`) hint at this but the audience never sees the macro.

### Copy & voice

- Generally crisp.
- Some lines are too punchy and lose nuance ("Voice is the most natural interface"). Soften the strongest claims.
- Many descriptors are abstract: "Augment", "Don't drive". One concrete example per principle moves it from poster to lesson.
- Bullet pattern is inconsistent: sometimes `Label: sentence.` (slide 6), sometimes just `Sentence.` (slide 4). Pick one and apply.

### Code samples

- Slide 8 is the only code-heavy slide. Three samples.
- **Sample 1 (controller)** is a stub. Either real or removed.
- **Sample 2 (registry)** is the strongest — viewers can copy this verbatim.
- **Sample 3 (UI tags)** uses non-standard tag names that imply web components but doesn't say so. Confusing.
- No async / await. No error path. No mic-permission code. Real voice JS has all three.
- Recommend: **one** code slide showing the full happy path (~25 lines of real code, syntax-highlighted) instead of three pseudo-cards. Or a series of *three short real snippets* that build on each other (permission → listen → match → dispatch).

### Animation & motion

- The motion language is consistent: enter from below + blur + scale 0.985 → 1, exit reverse. Strong system.
- Easing `[0.22, 1, 0.36, 1]` (your `EASE`) is the right cubic curve.
- Three problems:
  1. **Auto-stagger reset moments** on slides 5 and 12 — all stages dim simultaneously, which looks broken.
  2. **AnimatePresence gaps** on slides 10 and 13 — the `mode="wait"` semantics leaves the stage briefly empty.
  3. **Continuous motion overload** — Aurora at the page level + per-card hover/breath + packet flows + spinner-style dot streams. At any moment ~6 things are animating. Pick a hierarchy: *one* hero motion per slide, supporting motion at 50% opacity / 50% speed.
- **No `prefers-reduced-motion` respect.** Easy fix at the CSS level:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

  Or wrap your `motion.div`s with `useReducedMotion()` from framer-motion.

### Colors & contrast

- Palette: cyan `oklch(0.85 0.15 200)`, violet `oklch(0.70 0.20 290)`, magenta `oklch(0.70 0.25 340)` on bg `oklch(0.10 0.02 265)`.
- High contrast on big text. Pass WCAG AA easily.
- **Muted text** at `oklch(0.62 0.02 260)` against the bg passes AA for body text (~7.2:1) but borderline for the 14px+ kicker labels.
- **Glass cards have lower contrast** when sitting over the aurora's brightest spots — text legibility drops. Either:
  - Increase glass tint opacity from `0.45` to `0.6+` for the inside fill, or
  - Add a stronger inset shadow under text to lift it.
- The three accents (cyan / violet / magenta) are all in the cool half of the wheel. From the back row they merge into "a bunch of purple lights". Consider warming up one of them — e.g., make magenta closer to coral (`oklch(0.72 0.18 25)`), or add an amber accent as a fourth.

### Typography

- Inter + JetBrains Mono is a strong pair.
- Type scale is intentional. 168 / 96 / 56 / 28 / 22 / 14 covers the room.
- Tracking `-0.025em` on display is right for the size.
- Mono text is set ALL-CAPS at `0.32em` tracking — at 11–14px that crosses into "harder to read than necessary". Consider:
  - Reducing tracking to `0.18em` for sub-14px mono lines, or
  - Using sentence case for HUD strings ("Voice First Web Apps" instead of "VOICE FIRST WEB APPS").

### Layout

- Stage is fixed 1920×1080 with `transform: scale(...)` to fit viewport — works for landscape desktops, fails for mobile and for non-16:9 monitors.
- Card heights are pixel-precise (`h-[680px]`, `h-[480px]`). If you change a single bullet, layout breaks.
- Section kickers are too small (14px mono) relative to titles (96px display). The visual jump is large; the kicker gets lost.
- Many slides have an "empty band" between the title and the body because content uses `flex-1 justify-center`. The whitespace is nice, but on dense slides (11, 15) it feels wasted.

### Accessibility

- **No reduced-motion support.** Listed above.
- **No visible keyboard focus** on the deck navigation. With the bottom pill removed, the only nav is the keyboard, but `:focus-visible` isn't styled on tap zones or the timer.
- **Mobile tap zones have aria-labels** (good) but no announced state ("Slide 5 of 17"). A screen reader user would never know where they are. Add `aria-live="polite"` to the bottom-right counter.
- **Heading semantics**: each slide uses an `<h1>` via `SlideShell`. That gives the page 17 H1s. Better: keep one global page H1 (the deck title), and use H2 for each slide title.
- **Color-only signalling**: ✓/✕ on slide 11 are colour-coded too — already good. But Slide 7's payload chips are colour-coded with no glyph; a colour-blind viewer can't tell them apart. Add a small icon per stage.

### Performance

- Aurora = 3 large blurred radial gradients with continuous `motion` — expensive but not catastrophic.
- `backdrop-filter: blur(18px) saturate(140%)` on `kn-glass` + `kn-glass::before` highlight gradient. Every glass card is roughly 2 passes of GPU work. On a slide like 15 with 8 glass cards + aurora, GPU compositing gets busy.
- Multiple `setInterval`-driven hooks for auto-stagger and loops. No `clearInterval` on slide change because the components unmount cleanly when AnimatePresence exits, but worth verifying with profiler.
- HMR warning about `StepContext` causes full reloads, not Fast Refresh. Move `StepContext` into its own file (`./step-context.ts`) and re-export — that silences the warning and improves dev iteration.

### Code quality

- `slides.tsx` is **1,991 lines in one file**. That's the single biggest maintainability issue. Each slide is a self-contained component (good), but they all share one file (bad).
- Recommended structure:

```
src/components/keynote/
  Deck.tsx
  step-context.ts      // <- StepContext alone, fixes HMR
  reveal.tsx           // Reveal, StepGate, FocusRing
  slide-shell.tsx
  use-auto-stage.ts
  tokens.tsx           // k, str, cmt, fn, punc, idt helpers
  slides/
    01-cover.tsx
    02-agenda.tsx
    ...
    17-qa-thanks.tsx
  slides.ts            // assembles the array
```

- **Dead code**: `FocusRing` is exported but no slide uses it after the What-not-to-do removal.
- **Magic numbers**: card heights (680, 700, 620, 480), delays (0.15, 0.3, 0.5...), intervals (2000, 2800, 3500). Centralise the timing constants somewhere.
- **TypeScript**: most slide data is inline arrays of tuples (`["Inclusion", "Empowering..."]`). Promoting these to typed const objects keeps autocomplete sane.
- **Inconsistent template literal usage** in style objects: `${n.color}33` (hex alpha suffix) on slide 7 only works because the colour is already in hex; your `oklch()` colours don't accept that. Worked here because `n.color` happens to be a CSS variable that resolves to oklch but the `33` won't apply. Use `oklch(... / 0.2)` instead.
- **No tests.** For a deck this isn't critical, but a Playwright smoke test that walks all 17 slides catches console errors before talks.

### Mobile

- Stage scales to `0.195` at 375px — the slide is unreadable.
- The mobile tap nav exists and **functionally** works, but operates on an illegible substrate.
- Two paths:
  1. **Build a mobile-specific layout.** A separate `MobileDeck` component that renders one column, full-width, with proper type sizes. ~1 day of work.
  2. **Block mobile gracefully.** Show "Best viewed on desktop or landscape iPad" with a link to slides on Notion / PDF / Speaker Deck for the talk. ~10 min of work.

Recommended: **(2) now, (1) before any public link goes out.**

---

## Pass 4 — Prioritised improvement table

`Impact` = how much it improves the talk. `Effort` = engineering hours roughly. Rows sorted Impact ↓ then Effort ↑.

| # | Slide / Area | Category | Issue | Impact | Effort | Suggested fix |
|---|---|---|---|---|---|---|
| 1 | 08 mic→action | Code | Controller code is placeholder comments, not real | **H** | M | Replace with 15–20 lines of real `useState`/`useEffect`/event listener code |
| 2 | 08 mic→action | Animation | Step 0 hides cards 2 & 3 entirely | **H** | S | Render all 3 cards always, dim non-focused ones (opacity 0.35) |
| 3 | 09 Demo | Content | `/demo-dictation` route does not exist | **H** | M | Build the route OR replace link with QR / external URL |
| 4 | 05, 12 loop & hybrid | Animation | Auto-stagger reset shows all-dimmed (looks broken) | **H** | S | Increase `holdCycles` to 3, or animate dimming sequentially on reset |
| 5 | 17 Q&A | Typography | "Q&A &" wraps with orphan ampersand | **H** | S | Replace with `Q&A · Thanks` or split into two lines |
| 6 | Global | A11y | No `prefers-reduced-motion` support | **H** | S | Add CSS media query + framer-motion `useReducedMotion()` |
| 7 | 13 Extract intent | Animation | `AnimatePresence mode="wait"` leaves both cards blank mid-cycle | **H** | S | Drop mode="wait", crossfade with `initial=false` |
| 8 | 13 Extract intent | UX | 3.5s cycle too fast to read both cards | **H** | S | Increase cycle to 6s |
| 9 | 10 phrase→handler | Bug | Phrase and handler can desync during cycle | **H** | S | Key both `AnimatePresence` blocks off the same `cur.key`, remove handler delay |
| 10 | 17 Q&A | Content | No QR code for contacts | **H** | S | Add a 200×200 QR linking to `linktr.ee/jjayy` or vcard |
| 11 | Global | Architecture | `slides.tsx` is 1,991 lines | **M** | M | Split into `slides/01-cover.tsx`, etc. (see structure above) |
| 12 | 5 + 7 | Content | Interaction Loop and Clean State Flow tell the same story | **M** | M | Reframe 5 = experience loop, 7 = code shape; or merge |
| 13 | 9 + 14 | Content | Two demo slides for the same URL | **M** | S | Cut one OR show the same demo with a different prompt set |
| 14 | 02 Agenda | Copy | No time estimates next to items | **M** | S | Add `~3 min` after each section name |
| 15 | 08 mic→action | Code | Filename `controller.tsx` has no JSX | **M** | S | Rename to `voice-controller.ts` or add real JSX |
| 16 | 08 mic→action | Typography | Code at 15px illegible from back row | **M** | S | Bump to 18–20px, reduce lines per card |
| 17 | 11 Where AI fits | Copy | "Don't drive" wordplay unclear to non-native speakers | **M** | S | Replace with "Don't decide" or "Don't act" |
| 18 | Mobile | UX | Stage scales to 0.195, deck unreadable | **M** | S | Show "Best on desktop / landscape" overlay below `md:` breakpoint |
| 19 | 04 Use Cases | Copy | "Next-Gen Agents" is buzzwordy | **M** | S | Rename to "AI Assistants" or "Conversational Agents" |
| 20 | 04 Use Cases | Copy | No anchor product per use case | **M** | S | Add 1 real product per card (Otter, BMW iDrive, ChatGPT voice) |
| 21 | 05 Loop | Content | Missing Stage 0 "Permit" (mic permission) | **M** | S | Add a sub-step or call it out in narration |
| 22 | 06 Cmd vs Convo | UX | Both cards visually identical | **M** | S | Differentiate: command = monospaced, conversation = chat bubble |
| 23 | 06 Cmd vs Convo | Content | No example phrases anchored to each mode | **M** | S | Add 1 real quote per card |
| 24 | 07 Clean state | Animation | Packet rail at bottom duplicates pipeline above | **M** | S | Remove rail OR repurpose to show payload transformation |
| 25 | 10 phrase→handler | Animation | 2.8s cycle too fast | **M** | S | Increase to 4–4.5s |
| 26 | 11 Where AI fits | Layout | 3-item cards too dense at projection distance | **M** | S | Cut to 2 items per card OR split into two slides |
| 27 | 13 Extract intent | UX | "AI parse" progress bar loops independently of cycle | **M** | S | Tie progress bar to cycle, or remove |
| 28 | 15 Best practices | Content | No grouping (UX / Eng / Privacy) | **M** | S | Add small section labels above groups |
| 29 | 15 Best practices | Content | Items lack numbers / war stories | **M** | M | Annotate at least 3 items with target metrics or anecdotes |
| 30 | 16 Summing up | Copy | "Voice is the most natural interface" is debatable | **M** | S | "Voice is one of the most natural interfaces" |
| 31 | 16 Summing up | UX | No call-to-action (repo / Discord / next event) | **M** | S | Add a single CTA line |
| 32 | 17 Q&A | Code | `mailto:` link lacks subject | **L** | S | `mailto:...?subject=Voice%20First%20Web%20Apps` |
| 33 | 17 Q&A | UX | Contact cards uneven content widths | **L** | S | Set mono font + uniform max-width with text-overflow |
| 34 | 01 Cover | Content | No date / venue / edition | **L** | S | Add `Bangalore · 27 May 2026` under the kicker |
| 35 | 01 Cover | Copy | "Build apps that listen to you" — grammatically loose | **L** | S | `Build apps that listen.` (period) |
| 36 | 03 Eras | Copy | "Era 01/02/03" feels marketing-y | **L** | S | Remove the "Era" labels |
| 37 | 03 Eras | Content | Faint connector line under cards earns nothing | **L** | S | Drop OR turn into a real labelled timeline |
| 38 | 07 Clean state | Layout | Card sub-text lengths uneven | **L** | S | Normalise to 1 line per sub |
| 39 | Global | Code | Dead `FocusRing` export | **L** | S | Remove |
| 40 | Global | DX | HMR warning: `StepContext` Fast Refresh | **L** | S | Move `StepContext` to its own file |
| 41 | Global | Code | Magic numbers across heights & timings | **L** | M | Centralise in a constants file |
| 42 | Global | Code | `${n.color}33` hex-alpha won't apply to oklch | **L** | S | Replace with `color-mix()` or `oklch(... / 0.2)` |
| 43 | Global | Typography | Mono labels at 11–14px ALL-CAPS + 0.32em hard to read | **L** | S | Reduce tracking to `0.18em` under 14px |
| 44 | A11y | Headings | 17 separate H1s on the page | **L** | S | One global H1, slide titles → H2 |
| 45 | A11y | Screen reader | Slide counter not announced | **L** | S | Add `aria-live="polite"` to bottom-right counter |
| 46 | Color | Palette | All 3 accents are cool-tone | **L** | M | Warm one accent (move magenta toward coral) |

---

## "If I had only one hour" — the punch list

```
[ ] 1. Wire reduced-motion CSS               (~5 min)
[ ] 2. Fix Q&A & line break                   (~5 min)
[ ] 3. Show all 3 cards on slide 8 from step 0 (~10 min)
[ ] 4. Replace slide 8 controller stub with real code (~20 min)
[ ] 5. Slow slide 13 cycle from 3.5s → 6s     (~5 min)
[ ] 6. Hold "all-lit" longer on slides 5 & 12 (~5 min)
[ ] 7. Add mobile blocker overlay             (~10 min)
```

Total ≈ 60 min. That alone moves the deck from B+ to A−.

---

## What's actually really good (don't change these)

- **The motion system.** The base transition (blur + scale + y) is tasteful and consistent.
- **The aurora background.** Subtle, ambient, on-brand.
- **The HUD redesign.** Centered timer with depleting bar + bottom-right counter is the cleanest deck chrome I've seen in a meetup talk.
- **Slide 7's payload chips.** `audio chunks → "next slide" → {cmd:"next_slide"} → goNext()` is the single most teach-y visual in the deck.
- **Slide 10's phrase→handler loop.** When it works (when the desync isn't visible), it's the best motion piece in the deck. Worth fixing because it's so close.
- **The colour palette.** Even if I'd add a warm accent, the cyan/violet/magenta on near-black is striking and the OKLCH choices are perceptually balanced.
- **The story arc.** It's there, even if 2–3 slides are siblings. The bones are right.
- **Speaker block on slide 1.** Clean, no LinkedIn-photo cringe, contact info on the closer.

---

*Reviewed at 1280×800 (16:10) and 375×812 (iPhone). All findings derived from end-to-end visual walkthrough plus source code read of `Deck.tsx`, `slides.tsx`, and `styles.css`.*
