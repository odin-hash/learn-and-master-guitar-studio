# 🎸 Learn & Master Guitar — Interactive Practice Studio & Metronome Companion

**[🚀 Launch Live Web Studio](https://odin-hash.github.io/learn-and-master-guitar-studio/)**

An interactive sight-reading, fretboard visualization, and metronome practice workstation built as a companion for Steve Krenz's *Gibson's Learn & Master Guitar* (**Lesson Book** & **Bonus Workshop Book**).

---

## ✨ Key Features

### 1. Three Dedicated Practice Workspaces
- **Foundation:** Essential posture, pick grip, tuning, and foundational technique primer for absolute beginners.
- **Curriculum (`Lessons` & `Workshops`):** Organized session-by-session drills, sight-reading exercises, strumming studies, and full repertoire arrangements across the Lesson Book and Bonus Workshop Book.
- **Metronome:** Standalone programmable practice metronome with custom time signatures (`2/4`, `3/4`, `4/4`, `5/4`, `6/8`), subdivisions (`Quarter`, `Eighth`, `Triplets`), tap tempo, and visual beat indicators.

### 2. Interactive Score, PDF Reference & Split View
- **1:1 Engraved 5-Line Treble Staff & 6-Line TAB:** Single-line horizontal stave rendering with beamed eighth notes, ties, dotted rhythms, pick-direction arrows (`↓` / `↑`), left-hand fingerings, and click-to-seek on any beat.
- **Synchronized Split-View PDF Reader:** View the interactive notation side-by-side with the synced textbook page (`pdf.js` canvas viewer with touch scrolling for iPad, desktop, and mobile) or load a local PDF file.

### 3. Sight-Reading & Fretboard Trainer Controls
- **Note Names Toggle:** Switch between `Off`, `Above Note`, or `Inside Notehead` to gradually wean off letter prompts.
- **Tab Visibility Modes:** Switch between `Show Both`, `Staff Only` (pure standard-notation sight-reading), or `Blur Tab` (hover/peek only when stuck).
- **Fretboard Voicing Switcher:** Toggle the 15-fret interactive fretboard (`Open` to `Fret 14`) between single-note **`Melody Notes`** and **`Full Chords`**, **`4-Note Chords`**, or **`3-Note Chords`** (matching Workshop Book p. 9).
- **Live Coach & Rhythm Guide:** Real-time floating pluck/strum instructions (`Pluck 1st String (E, Open String)`) and beat-aligned playback cursor.

### 4. Web Audio Synthesizer & Jam-Along Engine
- **Real-Time Acoustic Synth & Click Options:** Synthesizes guitar pitches, directional chord strums, Woodblock (`1200/800 Hz`) clicks, and rest-click cues.
- **3-Speed Practice Presets:** Instant **Slow**, **Med**, and **Goal BPM** targets tailored to each exercise, plus loop-all / play-once modes and a **1-Bar Count-In**.
- **Progress Tracking:** Mark exercises as completed (`✓ Mark Done`) with automatic session progress tracking saved in `localStorage`.

### 5. Maintainer Studio & AI OMR Editor (`Admin Mode`)
- **Visual Note & Measure Editor:** Edit pitches, string/fret pairs, durations, rests, dots, ties, chord symbols, pick directions, and bar structures directly in the browser.
- **Gemini Vision PDF Extractor:** Extract or append multi-page exercises directly from the rendered PDF page with 50-step Undo/Redo history and one-click GitHub API cloud commits (`Save Live`).

---

## 🛠️ Build & Run Locally

```powershell
# 1. Compile and generate exercises.js from scripts/MasterCourseGenerator.cs
csc.exe /out:MasterCourseGenerator.exe scripts\MasterCourseGenerator.cs
.\MasterCourseGenerator.exe exercises.js

# 2. Bundle into standalone index.html
.\scripts\bundle.ps1

# 3. Launch local development server
.\scripts\server.ps1
```

---

## ⚠️ Legal & Educational Disclaimer

This project is an independent, unofficial, fan-made open-source practice tool and metronome workstation built for educational and sight-reading practice purposes. It is not affiliated with, endorsed by, or sponsored by Steve Krenz, Legacy Learning Systems, or Gibson Brands, Inc. All trademarks and course titles belong to their respective owners. Students should purchase and use the official Learn & Master Guitar textbooks and media alongside this practice tool.
