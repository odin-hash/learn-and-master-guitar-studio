# Learn & Master Guitar — Interactive Practice Studio & Metronome Companion

A complete interactive web companion for **Steve Krenz's *Learn & Master Guitar: Lesson Book*** (Sessions 1–20) and ***Bonus Workshop Book*** (Workshops 1–20).

## Key Features
- **Complete 40-Chapter Curriculum**: All 20 Lesson Book Sessions and 20 Bonus Workshops (135+ interactive exercises, strumming patterns, scales, and dual-mode melody/chord repertoire songs).
- **1:1 Engraved 5-Line Treble Staff & TAB**: Pixel-aligned 5-line treble staff with ledger lines for strings 5 & 6, beamed eighth notes, and click-to-seek on any beat.
- **Sight-Reading & Practice Trainer Bar**:
  - **Note Names Toggle**: Show or hide note letters (`E`, `F`, `G`) on the staff.
  - **TAB Numbers Toggle**: Hide TAB numbers to practice pure standard-notation sight-reading (auto-enabled on *"More ... String Exercises"*).
  - **Chord Voicing Switcher**: Toggle between **Full Chords**, **4-Note Beginner Chords**, and **3-Note Easy Chords** (Bonus Book p. 9 & 38).
  - **Drill String Selector**: Transpose Session 1 finger exercises across Strings 1–6.
- **15-Fret Interactive Fretboard (Frets 0–14)**: Displays left-hand finger numbers (`0–4`), red `X` markers on muted strings, and ghost background chord shapes during single-note melodies.
- **Web Audio Lookahead Metronome & Guitar Pitch Synthesizer**:
  - Synthesizes acoustic guitar note pitches and directional Down/Up chord strums in real time.
  - 3-Speed Jam-Along Presets (**Slow / Med / Goal BPM**) tailored to each exercise.
  - 1-Bar Count-In chime, Woodblock / Beep / Studio Drum click options, and Palm Mute Rest cues.
- **Progress Tracking**: Check off completed exercises and *"You're Ready to Move On"* session benchmarks (saved automatically in `localStorage`).

## Build & Run
```powershell
# 1. Compile and generate exercises.js from MasterCourseGenerator.cs
csc.exe /out:MasterCourseGenerator.exe MasterCourseGenerator.cs
.\MasterCourseGenerator.exe exercises.js

# 2. Bundle into standalone index.html
.\bundle.ps1

# 3. Launch local server
.\server.ps1
```
