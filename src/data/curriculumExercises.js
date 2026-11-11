/**
 * Authentic Learn & Master Guitar PDF Curriculum Schema & VexFlow Measure Parser
 * -----------------------------------------------------------------------------
 * Every exercise in Session 1 and Session 2 is transcribed note-for-note from the
 * official Learn & Master Guitar Lesson Book PDF pages (pp. 2–15).
 * No notes are invented or guessed.
 *
 * Shorthand Measure Syntax for `parseMeasureNotation(measureStr, opts)`:
 *   "<Pitch>/<Dur>[.<dot>]@<String>:<Fret>[!<Chord>][[<Pick>]]"
 * Examples:
 *   "E4/q@1:0[Down], F4/q@1:1[Up], G4/h@1:3[Down]"
 *   "R/q, R/h"                     -> Quarter rest, half rest
 *   "F#4/q@1:2[Down]"              -> F#4 on string 1, fret 2
 *   "CHORD:C/w@5-1[Down]"          -> Whole-note chord strum (C major)
 *   "CHORD:G7/q@all[Up]"           -> Quarter-note chord strum slash (G7)
 *   "D4/q@2:3!G7"                  -> Single note with inline chord symbol G7
 *
 * Pitch Convention:
 *   Concert guitar octave is stored directly in `pitch` (e.g. Open 1st = E4,
 *   Open 2nd = B3, Open 3rd = G3, Open 4th = D3, Open 5th = A2, Open 6th = E2).
 *   Because classical/guitar treble clef sounds one octave lower than written
 *   (treble 8vb), `transposeOctave = 1` automatically maps E4 -> VexFlow "e/5"
 *   for authentic printed staff placement alongside accurate Web Audio pitch.
 */

const CHORD_POSITIONS = {
  "C": [
    { str: 5, fret: 3, finger: 3 },
    { str: 4, fret: 2, finger: 2 },
    { str: 3, fret: 0, finger: 0 },
    { str: 2, fret: 1, finger: 1 },
    { str: 1, fret: 0, finger: 0 }
  ],
  "G7": [
    { str: 6, fret: 3, finger: 3 },
    { str: 5, fret: 2, finger: 2 },
    { str: 4, fret: 0, finger: 0 },
    { str: 3, fret: 0, finger: 0 },
    { str: 2, fret: 0, finger: 0 },
    { str: 1, fret: 1, finger: 1 }
  ]
};

const OPEN_POSITION_GUITAR_MAP = {
  "E2": { string: 6, fret: 0, finger: 0 },
  "F2": { string: 6, fret: 1, finger: 1 },
  "F#2": { string: 6, fret: 2, finger: 2 },
  "G2": { string: 6, fret: 3, finger: 3 },
  "G#2": { string: 6, fret: 4, finger: 4 },
  "A2": { string: 5, fret: 0, finger: 0 },
  "B2": { string: 5, fret: 2, finger: 2 },
  "C3": { string: 5, fret: 3, finger: 3 },
  "D3": { string: 4, fret: 0, finger: 0 },
  "E3": { string: 4, fret: 2, finger: 2 },
  "F3": { string: 4, fret: 3, finger: 3 },
  "G3": { string: 3, fret: 0, finger: 0 },
  "A3": { string: 3, fret: 2, finger: 2 },
  "B3": { string: 2, fret: 0, finger: 0 },
  "C4": { string: 2, fret: 1, finger: 1 },
  "D4": { string: 2, fret: 3, finger: 3 },
  "E4": { string: 1, fret: 0, finger: 0 },
  "F4": { string: 1, fret: 1, finger: 1 },
  "F#4": { string: 1, fret: 2, finger: 2 },
  "G4": { string: 1, fret: 3, finger: 3 },
  "G#4": { string: 1, fret: 4, finger: 4 }
};

const DUR_TO_BEATS = {
  w: 4,
  "w.": 6,
  h: 2,
  "h.": 3,
  hd: 3,
  q: 1,
  "q.": 1.5,
  qd: 1.5,
  "8": 0.5,
  "16": 0.25
};

const DUR_TO_SYMBOL = {
  w: "1/1",
  "w.": "3/2",
  h: "1/2",
  "h.": "3/4",
  hd: "3/4",
  q: "1/4",
  "q.": "3/8",
  qd: "3/8",
  "8": "1/8",
  "16": "1/16"
};

function pitchToVexKey(concertPitch, transposeOctave = 1) {
  const m = String(concertPitch || "E4").trim().match(/^([A-Ga-g])(#|b|n)?(\d+)$/);
  if (!m) return { vexKey: "e/5", accidental: null, displayName: "E" };
  const letter = m[1].toUpperCase();
  const acc = m[2] || null;
  const oct = parseInt(m[3], 10) + transposeOctave;
  const accSuffix = acc ? acc : "";
  let displayName = `${letter}${acc && acc !== "n" ? acc : ""}`;
  if (letter === "E" && !acc && parseInt(m[3], 10) >= 4) displayName = "High E";
  if (letter === "E" && !acc && parseInt(m[3], 10) <= 2) displayName = "Low E";
  return {
    vexKey: `${letter.toLowerCase()}${accSuffix}/${oct}`,
    accidental: acc,
    displayName,
    concertPitch: `${letter}${accSuffix}${m[3]}`
  };
}

function inferFingerFromFret(fret) {
  if (fret === null || fret === undefined) return null;
  if (fret === 0) return 0;
  if (fret >= 1 && fret <= 4) return fret;
  return fret;
}

/**
 * Clean parser for transcribing exact PDF measures into normalized VexFlow + WebAudio events.
 * Supports concise measure notation strings ("E4/q@1:0[Down], F4/q@1:1[Up], G4/h@1:3[Down]")
 * or structured note event objects.
 */
export function parseMeasureNotation(input, options = {}) {
  const {
    transposeOctave = 1,
    defaultChord = null,
    measureNumber = 1
  } = options;

  const tokens = Array.isArray(input)
    ? input
    : String(input || "")
        .split(",")
        .map(s => s.trim())
        .filter(Boolean);

  const events = [];
  let beatCursor = 1;

  tokens.forEach((tok) => {
    if (typeof tok === "object" && tok !== null && !Array.isArray(tok)) {
      events.push(tok);
      beatCursor += tok.durationBeats || 1;
      return;
    }

    // Parse optional leading/trailing/inline "~" tie markers (e.g. "~D3/q@4:0", "D3/q~@4:0[Up]", "D3/q@4:0~")
    let work = tok;
    let tieToNext = false;
    let tieFromPrev = false;
    if (work.startsWith("~")) {
      tieFromPrev = true;
      work = work.slice(1).trim();
    }
    if (work.endsWith("~")) {
      tieToNext = true;
      work = work.slice(0, -1).trim();
    }
    let pick = "Down";
    const pickMatch = work.match(/\[([^\]]+)\]/);
    if (pickMatch) {
      pick = pickMatch[1].trim();
      work = work.replace(pickMatch[0], "").trim();
    }
    if (work.endsWith("~")) {
      tieToNext = true;
      work = work.slice(0, -1).trim();
    }

    // Parse optional inline chord symbol "!G7"
    let inlineChord = null;
    const chordMatch = work.match(/!([A-Za-z0-9#b/]+)/);
    if (chordMatch) {
      inlineChord = chordMatch[1].trim();
      work = work.replace(chordMatch[0], "").trim();
    }

    // Parse optional string:fret "@1:0" or "@5-1" or "@all"
    let stringVal = null;
    let fretVal = null;
    const locMatch = work.match(/@([0-9]+|all|[0-9]+-[0-9]+)(?::([0-9]+))?/i);
    if (locMatch) {
      const sRaw = locMatch[1].toLowerCase();
      stringVal = /^\d+$/.test(sRaw) ? parseInt(sRaw, 10) : sRaw;
      fretVal = locMatch[2] !== undefined ? parseInt(locMatch[2], 10) : null;
      work = work.replace(locMatch[0], "").trim();
    }

    if (work.endsWith("~")) {
      tieToNext = true;
      work = work.slice(0, -1).trim();
    }

    // Parse head/duration e.g. "E4/q", "R/h", "CHORD:C/w", "D4/h.", "D3/q~"
    const slashParts = work.split("/");
    const head = (slashParts[0] || "E4").trim();
    let durRaw = (slashParts[1] || "q").trim().toLowerCase();
    if (durRaw.includes("~")) {
      tieToNext = true;
      durRaw = durRaw.replace(/~/g, "").trim();
    }
    const isDotted = durRaw.endsWith(".");
    let vexDuration = durRaw.replace(".", "");
    if (vexDuration === "e" || vexDuration === "er") vexDuration = "8";
    const durKey = isDotted ? `${vexDuration}.` : vexDuration;
    const durationBeats = DUR_TO_BEATS[durKey] || DUR_TO_BEATS[vexDuration] || 1;
    const symbol = DUR_TO_SYMBOL[durKey] || DUR_TO_SYMBOL[vexDuration] || "1/4";

    if (/^R(EST)?$/i.test(head)) {
      const restKey = vexDuration === "w" ? "d/5" : "b/4";
      events.push({
        beat: beatCursor,
        isRest: true,
        type: "rest",
        note: "REST",
        concertPitch: null,
        vexKey: restKey,
        accidental: null,
        duration: vexDuration,
        isDotted,
        vexDuration: `${vexDuration}r`,
        durationBeats,
        symbol: "REST",
        string: null,
        fret: null,
        finger: null,
        pick: "-",
        positions: [],
        chordChange: inlineChord,
        tip: `Rest (${durationBeats} ${durationBeats === 1 ? "Beat" : "Beats"})`
      });
      beatCursor += durationBeats;
      return;
    }

    if (/^CHORD:/i.test(head)) {
      const chordLabel = inlineChord || head.replace(/^CHORD:/i, "").trim() || defaultChord || "C";
      const keyNorm = chordLabel.toUpperCase();
      const positions = CHORD_POSITIONS[keyNorm] || CHORD_POSITIONS["C"];
      events.push({
        beat: beatCursor,
        isRest: false,
        isChord: true,
        type: "play",
        note: chordLabel,
        concertPitch: chordLabel,
        vexKey: "b/4",
        accidental: null,
        duration: vexDuration,
        isDotted,
        vexDuration,
        durationBeats,
        symbol,
        string: stringVal || (keyNorm === "C" ? "5-1" : "all"),
        fret: null,
        finger: null,
        pick,
        positions,
        tieToNext,
        tieFromPrev,
        chordChange: inlineChord || chordLabel,
        tip: `${chordLabel} Chord Strum`
      });
      beatCursor += durationBeats;
      return;
    }

    const pitchInfo = pitchToVexKey(head, transposeOctave);
    const inferred = OPEN_POSITION_GUITAR_MAP[pitchInfo.concertPitch] || { string: 1, fret: 0, finger: 0 };
    const finalStr = stringVal !== null ? stringVal : inferred.string;
    const finalFret = fretVal !== null ? fretVal : inferred.fret;
    const finalFinger = inferFingerFromFret(finalFret);

    events.push({
      beat: beatCursor,
      isRest: false,
      isChord: false,
      type: "play",
      note: pitchInfo.displayName,
      concertPitch: pitchInfo.concertPitch,
      vexKey: pitchInfo.vexKey,
      accidental: pitchInfo.accidental,
      duration: vexDuration,
      isDotted,
      vexDuration,
      durationBeats,
      symbol,
      string: finalStr,
      fret: finalFret,
      finger: finalFinger,
      pick,
      positions: typeof finalStr === "number" ? [{ str: finalStr, fret: finalFret }] : [],
      tieToNext,
      tieFromPrev,
      chordChange: inlineChord,
      tip: `String ${finalStr}, Fret ${finalFret}`
    });
    beatCursor += durationBeats;
  });

  return {
    measureNumber,
    events
  };
}

/**
 * Converts parsed measure definitions into BOTH:
 * 1) VexFlow measure specs (`measures`) for crisp <ScoreRenderer /> rendering
 * 2) Compatible `tabData` beats array for audio.js synth + fretboard.js + lookahead cursor sync
 */
export function buildCurriculumMeasures(rawMeasures, defaults = {}) {
  const {
    clef = "treble",
    notationMode = "standard", // "standard" | "tab" | "chord-rhythm"
    timeSignature = "4/4",
    transposeOctave = 1
  } = defaults;

  const tsParts = String(timeSignature).split("/").map(n => parseInt(n, 10));
  const beatsPerBar = tsParts[0] || 4;

  const measures = [];
  const tabData = [];

  rawMeasures.forEach((rawM, idx) => {
    const mNum = rawM.measure || (idx + 1);
    const chordName = rawM.chord || rawM.chordName || null;
    const mClef = rawM.clef || clef;
    const mTs = rawM.timeSignature || timeSignature;
    const notationSpec = typeof rawM === "string" ? rawM : rawM.notes;

    const parsed = parseMeasureNotation(notationSpec, {
      transposeOctave: mClef === "tab" ? 1 : transposeOctave,
      defaultChord: chordName,
      measureNumber: mNum
    });

    measures.push({
      measure: mNum,
      clef: mClef,
      notationMode: rawM.notationMode || notationMode,
      timeSignature: mTs,
      chordName,
      lyrics: rawM.lyrics || null,
      events: parsed.events
    });

    // Build synchronized tabData array preserving multi-beat sustain padding for audio/fretboard scheduler
    const legacyBeats = [];
    let runningOffset = 0;

    parsed.events.forEach((ev, evIdx) => {
      const displayNote = ev.isRest ? "REST" : ev.note;
      const isTieCont = Boolean(ev.tieFromPrev && !ev.isRest);
      legacyBeats.push({
        beat: runningOffset + 1,
        eventIndex: evIdx,
        note: displayNote,
        concertPitch: ev.concertPitch,
        vexKey: ev.vexKey,
        symbol: ev.symbol,
        type: ev.isRest ? "rest" : "play",
        string: ev.string,
        fret: ev.fret,
        finger: ev.finger,
        pick: isTieCont ? "-" : ev.pick,
        duration: ev.durationBeats,
        isDotted: Boolean(ev.isDotted),
        tieFromPrev: Boolean(ev.tieFromPrev),
        tieToNext: Boolean(ev.tieToNext),
        isTieContinuation: isTieCont,
        isStart: true,
        isSustain: false,
        chordChange: ev.chordChange || null,
        tip: isTieCont ? "Keep Holding (Tied)" : ev.tip
      });

      const wholePads = Math.floor(ev.durationBeats) - 1;
      for (let p = 1; p <= wholePads; p++) {
        if (ev.isRest) {
          legacyBeats.push({
            beat: runningOffset + 1 + p,
            eventIndex: evIdx,
            note: "REST",
            symbol: "REST",
            type: "rest",
            string: null,
            fret: null,
            finger: null,
            pick: "-",
            duration: 1,
            isDotted: Boolean(ev.isDotted),
            isStart: false,
            isSustain: true,
            tip: "Rest"
          });
        } else {
          legacyBeats.push({
            beat: runningOffset + 1 + p,
            eventIndex: evIdx,
            note: displayNote,
            concertPitch: ev.concertPitch,
            symbol: ev.symbol,
            type: "sustain",
            string: ev.string,
            fret: ev.fret,
            finger: ev.finger,
            pick: "-",
            duration: ev.durationBeats,
            isDotted: Boolean(ev.isDotted),
            tieToNext: Boolean(ev.tieToNext),
            isStart: false,
            isSustain: true,
            tip: ev.isDotted ? "Hold (Dotted Extension)" : "Hold"
          });
        }
      }
      runningOffset += ev.durationBeats;
    });

    tabData.push({
      measure: mNum,
      chordName,
      beats: legacyBeats.length > 0 ? legacyBeats : Array.from({ length: beatsPerBar }, (_, i) => ({
        beat: i + 1,
        note: "REST",
        symbol: "REST",
        type: "rest",
        duration: 1,
        pick: "-"
      }))
    });
  });

  return { measures, tabData };
}

export function buildExerciseFromCurriculum(exDef) {
  const tsStr = exDef.timeSignature || "4/4";
  const tsArr = tsStr.split("/").map(n => parseInt(n, 10));
  const { measures, tabData } = buildCurriculumMeasures(exDef.measures, {
    clef: exDef.clef || "treble",
    notationMode: exDef.notationMode || "standard",
    timeSignature: tsStr,
    transposeOctave: exDef.transposeOctave !== undefined ? exDef.transposeOctave : 1
  });

  return {
    ...exDef,
    timeSignature: tsArr,
    timeSignatureString: tsStr,
    measures,
    tabData,
    verificationStatus: exDef.verificationStatus || "pdf-verified"
  };
}

/**
 * Exact PDF-Transcribed Curriculum Schema (Lesson Book Sessions 1 & 2)
 */
export const CURRICULUM_EXERCISES = {
  lessonBook: [
    // =========================================================================
    // SESSION 1: STARTING OFF RIGHT (Lesson Book pp. 2–6)
    // =========================================================================
    {
      sessionNumber: 1,
      sessionTitle: "Session 1: Starting Off Right",
      sessionSubtitle: "String Names, Tuning, Finger Exercises 1–5, C & G7 Chords (p. 2–6)",
      verificationStatus: "pdf-verified",
      topics: [
        {
          topicTitle: "String Names & Open String Orientation (p. 2)",
          exercises: [
            buildExerciseFromCurriculum({
              id: "lb-s1-tour",
              title: "Open Strings Tour (6th Low E down to 1st High E)",
              description: "Memorize the 6 open strings from thickest to thinnest: 6th (E), 5th (A), 4th (D), 3rd (G), 2nd (B), 1st (E). Strike each open string cleanly for 3 beats and mute cleanly on beat 4.",
              pdfPage: 2,
              clef: "treble",
              notationMode: "standard",
              hasBookTab: true,
              timeSignature: "4/4",
              defaultBpm: 60,
              goalBpm: 80,
              concepts: ["Open Strings EADGBE", "Beat 4 Damping"],
              measures: [
                "E2/h.@6:0[Down], R/q",
                "A2/h.@5:0[Down], R/q",
                "D3/h.@4:0[Down], R/q",
                "G3/h.@3:0[Down], R/q",
                "B3/h.@2:0[Down], R/q",
                "E4/h.@1:0[Down], R/q"
              ]
            })
          ]
        },
        {
          topicTitle: "Finger Exercises 1–5 (Lesson Book p. 4–5)",
          exercises: [
            buildExerciseFromCurriculum({
              id: "lb-s1-fe1",
              title: "Finger Exercise 1: 1-1-1-1 2-2-2-2 (Down-Up-Down-Up, Repeat All Strings)",
              description: "Lesson Book p. 4: Play 4 alternate picks per finger ascending (1-2-3-4) and descending (3-2-1). Keep fingers curved directly behind the fret wire. The goal is control, not speed.",
              pdfPage: 4,
              clef: "tab",
              notationMode: "tab",
              hasBookTab: true,
              timeSignature: "4/4",
              defaultBpm: 60,
              goalBpm: 90,
              concepts: ["Alternate Picking", "Finger Independence", "All 6 Strings"],
              measures: [
                "F4/q@1:1[Down], F4/q@1:1[Up], F4/q@1:1[Down], F4/q@1:1[Up]",
                "F#4/q@1:2[Down], F#4/q@1:2[Up], F#4/q@1:2[Down], F#4/q@1:2[Up]",
                "G4/q@1:3[Down], G4/q@1:3[Up], G4/q@1:3[Down], G4/q@1:3[Up]",
                "G#4/q@1:4[Down], G#4/q@1:4[Up], G#4/q@1:4[Down], G#4/q@1:4[Up]",
                "G4/q@1:3[Down], G4/q@1:3[Up], G4/q@1:3[Down], G4/q@1:3[Up]",
                "F#4/q@1:2[Down], F#4/q@1:2[Up], F#4/q@1:2[Down], F#4/q@1:2[Up]",
                "F4/q@1:1[Down], F4/q@1:1[Up], F4/q@1:1[Down], F4/q@1:1[Up]"
              ]
            }),
            buildExerciseFromCurriculum({
              id: "lb-s1-fe2",
              title: "Finger Exercise 2: 1-1 2-2 3-3 4-4 (Down-Up, Repeat All Strings)",
              description: "Lesson Book p. 4: Two alternate picks (Down-Up) per finger pattern 1-1 2-2 3-3 4-4 3-3 2-2 1-1. Final pair rings cleanly as half notes to complete the 4/4 turnaround.",
              pdfPage: 4,
              clef: "tab",
              notationMode: "tab",
              hasBookTab: true,
              timeSignature: "4/4",
              defaultBpm: 60,
              goalBpm: 90,
              concepts: ["Down-Up Picking", "All 6 Strings"],
              measures: [
                "F4/q@1:1[Down], F4/q@1:1[Up], F#4/q@1:2[Down], F#4/q@1:2[Up]",
                "G4/q@1:3[Down], G4/q@1:3[Up], G#4/q@1:4[Down], G#4/q@1:4[Up]",
                "G4/q@1:3[Down], G4/q@1:3[Up], F#4/q@1:2[Down], F#4/q@1:2[Up]",
                "F4/h@1:1[Down], F4/h@1:1[Up]"
              ]
            }),
            buildExerciseFromCurriculum({
              id: "lb-s1-fe3",
              title: "Finger Exercise 3: 1-2-3-4-3-2-1 (All Downstrokes)",
              description: "Lesson Book p. 4: One stroke per finger (1-2-3-4-3-2-1) using all downstrokes. Hold the final 1st-finger note 2 beats to complete measure 2.",
              pdfPage: 4,
              clef: "tab",
              notationMode: "tab",
              hasBookTab: true,
              timeSignature: "4/4",
              defaultBpm: 60,
              goalBpm: 95,
              concepts: ["All Down Strokes", "Finger Control"],
              measures: [
                "F4/q@1:1[Down], F#4/q@1:2[Down], G4/q@1:3[Down], G#4/q@1:4[Down]",
                "G4/q@1:3[Down], F#4/q@1:2[Down], F4/h@1:1[Down]"
              ]
            }),
            buildExerciseFromCurriculum({
              id: "lb-s1-fe4",
              title: "Finger Exercise 4: 1-2-1-3-1-4-1-3-1-2-1 (1st String)",
              description: "Lesson Book p. 5: Pattern 1-2-1-3-1-4-1-3-1-2-1 keeping your 1st finger anchored as a pivot. Repeat across all 6 strings.",
              pdfPage: 5,
              clef: "tab",
              notationMode: "tab",
              hasBookTab: true,
              timeSignature: "4/4",
              defaultBpm: 60,
              goalBpm: 88,
              concepts: ["Pivot Finger", "All 6 Strings"],
              measures: [
                "F4/q@1:1[Down], F#4/q@1:2[Up], F4/q@1:1[Down], G4/q@1:3[Up]",
                "F4/q@1:1[Down], G#4/q@1:4[Up], F4/q@1:1[Down], G4/q@1:3[Up]",
                "F4/q@1:1[Down], F#4/q@1:2[Up], F4/h@1:1[Down]"
              ]
            }),
            buildExerciseFromCurriculum({
              id: "lb-s1-fe5",
              title: "Finger Exercise 5: 4-3-4-2-4-1 Reverse Stretch (6th String)",
              description: "Lesson Book p. 5: Pattern 4-3-4-2-4-1-4-3-4-2-4-1 starting on the 6th string (thickest E string). Great stretch for 4th-finger strength.",
              pdfPage: 5,
              clef: "tab",
              notationMode: "tab",
              hasBookTab: true,
              timeSignature: "4/4",
              defaultBpm: 60,
              goalBpm: 85,
              concepts: ["6th String", "Pinky Stretch"],
              measures: [
                "G#2/q@6:4[Down], G2/q@6:3[Up], G#2/q@6:4[Down], F#2/q@6:2[Up]",
                "G#2/q@6:4[Down], F2/q@6:1[Up], G#2/q@6:4[Down], G2/q@6:3[Up]",
                "G#2/q@6:4[Down], F#2/q@6:2[Up], G#2/q@6:4[Down], F2/q@6:1[Up]"
              ]
            })
          ]
        },
        {
          topicTitle: "The C and G7 Chords (Lesson Book p. 6)",
          exercises: [
            buildExerciseFromCurriculum({
              id: "lb-s1-ch1",
              title: "Chord Exercise 1: C & G7 Whole-Note Diamonds (5 Bars)",
              description: "Lesson Book p. 6: Form C (omit 6th string) and G7 (all 6 strings). Strum once per measure on beat 1 and prepare your next chord shape cleanly without rushing.",
              pdfPage: 6,
              clef: "treble",
              notationMode: "chord-rhythm",
              hasBookTab: true,
              timeSignature: "4/4",
              defaultBpm: 60,
              goalBpm: 80,
              concepts: ["C Major", "G7", "Whole Strums"],
              measures: [
                { chord: "C", notes: "CHORD:C/w@5-1[Down]" },
                { chord: "G7", notes: "CHORD:G7/w@all[Down]" },
                { chord: "C", notes: "CHORD:C/w@5-1[Down]" },
                { chord: "G7", notes: "CHORD:G7/w@all[Down]" },
                { chord: "C", notes: "CHORD:C/w@5-1[Down]" }
              ]
            }),
            buildExerciseFromCurriculum({
              id: "lb-s1-ch2",
              title: "Chord Exercise 2: C & G7 Four Strums Per Measure (5 Bars)",
              description: "Lesson Book p. 6: Strum chord for each slash (4 strums per bar): 2 bars of C, 2 bars of G7, ending on C.",
              pdfPage: 6,
              clef: "treble",
              notationMode: "chord-rhythm",
              hasBookTab: true,
              timeSignature: "4/4",
              defaultBpm: 65,
              goalBpm: 90,
              concepts: ["C Major", "G7", "Quarter Strumming"],
              measures: [
                { chord: "C", notes: "CHORD:C/q@5-1[Down], CHORD:C/q@5-1[Down], CHORD:C/q@5-1[Down], CHORD:C/q@5-1[Down]" },
                { chord: "C", notes: "CHORD:C/q@5-1[Down], CHORD:C/q@5-1[Down], CHORD:C/q@5-1[Down], CHORD:C/q@5-1[Down]" },
                { chord: "G7", notes: "CHORD:G7/q@all[Down], CHORD:G7/q@all[Down], CHORD:G7/q@all[Down], CHORD:G7/q@all[Down]" },
                { chord: "G7", notes: "CHORD:G7/q@all[Down], CHORD:G7/q@all[Down], CHORD:G7/q@all[Down], CHORD:G7/q@all[Down]" },
                { chord: "C", notes: "CHORD:C/q@5-1[Down], CHORD:C/q@5-1[Down], CHORD:C/q@5-1[Down], CHORD:C/q@5-1[Down]" }
              ]
            }),
            buildExerciseFromCurriculum({
              id: "lb-s1-ch3",
              title: "Chord Exercise 3: C & G7 Alternating Measures (5 Bars)",
              description: "Lesson Book p. 6: Change chords every measure: C | G7 | C | G7 | C with four even downward strums per bar.",
              pdfPage: 6,
              clef: "treble",
              notationMode: "chord-rhythm",
              hasBookTab: true,
              timeSignature: "4/4",
              defaultBpm: 65,
              goalBpm: 90,
              concepts: ["C Major", "G7", "Bar-by-Bar Changes"],
              measures: [
                { chord: "C", notes: "CHORD:C/q@5-1[Down], CHORD:C/q@5-1[Down], CHORD:C/q@5-1[Down], CHORD:C/q@5-1[Down]" },
                { chord: "G7", notes: "CHORD:G7/q@all[Down], CHORD:G7/q@all[Down], CHORD:G7/q@all[Down], CHORD:G7/q@all[Down]" },
                { chord: "C", notes: "CHORD:C/q@5-1[Down], CHORD:C/q@5-1[Down], CHORD:C/q@5-1[Down], CHORD:C/q@5-1[Down]" },
                { chord: "G7", notes: "CHORD:G7/q@all[Down], CHORD:G7/q@all[Down], CHORD:G7/q@all[Down], CHORD:G7/q@all[Down]" },
                { chord: "C", notes: "CHORD:C/q@5-1[Down], CHORD:C/q@5-1[Down], CHORD:C/q@5-1[Down], CHORD:C/q@5-1[Down]" }
              ]
            })
          ]
        }
      ]
    },

    // =========================================================================
    // SESSION 2: READING MUSIC & NOTES ON THE 1ST & 2ND STRINGS (Lesson Book pp. 7–15)
    // =========================================================================
    {
      sessionNumber: 2,
      sessionTitle: "Session 2: Reading Music & Notes on the 1st & 2nd Strings",
      sessionSubtitle: "First String (E-F-G), Second String (B-C-D), Rests, Ode to Joy & Jingle Bells (p. 7–15)",
      verificationStatus: "pdf-verified",
      topics: [
        {
          topicTitle: "First String Exercises (E - F - G) (Lesson Book p. 9)",
          exercises: [
            buildExerciseFromCurriculum({
              id: "lb-s2-str1-ex1",
              title: "First String Exercise 1: Whole Notes (7 Bars)",
              description: "Lesson Book p. 9: Whole notes get 4 beats. Play E (open), F (1st fret), and G (3rd fret) on the 1st string while counting all 4 beats cleanly.",
              pdfPage: 9,
              clef: "treble",
              notationMode: "standard",
              hasBookTab: true,
              timeSignature: "4/4",
              defaultBpm: 65,
              goalBpm: 80,
              measures: [
                "E4/w@1:0[Down]",
                "F4/w@1:1[Down]",
                "G4/w@1:3[Down]",
                "F4/w@1:1[Down]",
                "E4/w@1:0[Down]",
                "G4/w@1:3[Down]",
                "E4/w@1:0[Down]"
              ]
            }),
            buildExerciseFromCurriculum({
              id: "lb-s2-str1-ex2",
              title: "First String Exercise 2: Half Notes (4 Bars)",
              description: "Lesson Book p. 9: Half notes get 2 beats each.",
              pdfPage: 9,
              clef: "treble",
              notationMode: "standard",
              hasBookTab: true,
              timeSignature: "4/4",
              defaultBpm: 65,
              goalBpm: 85,
              measures: [
                "E4/h@1:0[Down], F4/h@1:1[Down]",
                "E4/h@1:0[Down], G4/h@1:3[Down]",
                "F4/h@1:1[Down], G4/h@1:3[Down]",
                "F4/h@1:1[Down], E4/h@1:0[Down]"
              ]
            }),
            buildExerciseFromCurriculum({
              id: "lb-s2-str1-ex3",
              title: "First String Exercise 3: Quarter Notes & Half/Whole Mix (5 Bars)",
              description: "Lesson Book p. 9: Quarter notes get 1 beat. Keep a steady pulse as you move between E, F, and G.",
              pdfPage: 9,
              clef: "treble",
              notationMode: "standard",
              hasBookTab: true,
              timeSignature: "4/4",
              defaultBpm: 65,
              goalBpm: 85,
              measures: [
                "E4/q@1:0[Down], E4/q@1:0[Down], F4/q@1:1[Down], F4/q@1:1[Down]",
                "G4/q@1:3[Down], F4/q@1:1[Down], E4/h@1:0[Down]",
                "E4/q@1:0[Down], F4/q@1:1[Down], G4/h@1:3[Down]",
                "G4/q@1:3[Down], F4/q@1:1[Down], E4/q@1:0[Down], F4/q@1:1[Down]",
                "E4/w@1:0[Down]"
              ]
            }),
            buildExerciseFromCurriculum({
              id: "lb-s2-str1-ex4",
              title: "First String Exercise 4: Mixed Rhythm Drill (6 Bars)",
              description: "Lesson Book p. 9: Starts on a half-note G (3rd fret), then mixes quarter and half notes across 6 bars.",
              pdfPage: 9,
              clef: "treble",
              notationMode: "standard",
              hasBookTab: true,
              timeSignature: "4/4",
              defaultBpm: 65,
              goalBpm: 85,
              measures: [
                "G4/h@1:3[Down], E4/q@1:0[Down], F4/q@1:1[Down]",
                "E4/q@1:0[Down], E4/q@1:0[Down], E4/h@1:0[Down]",
                "F4/q@1:1[Down], F4/q@1:1[Down], F4/h@1:1[Down]",
                "E4/q@1:0[Down], E4/q@1:0[Down], E4/h@1:0[Down]",
                "G4/q@1:3[Down], F4/q@1:1[Down], E4/q@1:0[Down], F4/q@1:1[Down]",
                "G4/q@1:3[Down], E4/q@1:0[Down], G4/h@1:3[Down]"
              ]
            })
          ]
        },
        {
          topicTitle: "More First String Exercises (Sight-Reading, Lesson Book p. 10)",
          exercises: [
            buildExerciseFromCurriculum({
              id: "lb-s2-m1-ex1",
              title: "More First String Exercise 1 (7 Bars, Sight-Reading)",
              description: "Lesson Book p. 10: No tablature in the book—practice reading E, F, and G directly off the 5-line treble staff.",
              pdfPage: 10,
              clef: "treble",
              notationMode: "standard",
              hasBookTab: false,
              timeSignature: "4/4",
              defaultBpm: 65,
              goalBpm: 85,
              measures: [
                "E4/h@1:0, F4/h@1:1",
                "G4/w@1:3",
                "G4/q@1:3, F4/q@1:1, E4/q@1:0, G4/q@1:3",
                "F4/h@1:1, F4/h@1:1",
                "G4/q@1:3, E4/q@1:0, F4/q@1:1, E4/q@1:0",
                "G4/h@1:3, E4/h@1:0",
                "G4/w@1:3"
              ]
            }),
            buildExerciseFromCurriculum({
              id: "lb-s2-m1-ex2",
              title: "More First String Exercise 2 (4 Bars, Sight-Reading)",
              description: "Lesson Book p. 10: Sight-reading quarter & half notes on the 1st string.",
              pdfPage: 10,
              clef: "treble",
              notationMode: "standard",
              hasBookTab: false,
              timeSignature: "4/4",
              defaultBpm: 65,
              goalBpm: 85,
              measures: [
                "E4/q@1:0, F4/q@1:1, E4/q@1:0, G4/q@1:3",
                "F4/q@1:1, F4/q@1:1, E4/h@1:0",
                "F4/h@1:1, G4/h@1:3",
                "F4/q@1:1, F4/q@1:1, E4/h@1:0"
              ]
            }),
            buildExerciseFromCurriculum({
              id: "lb-s2-m1-ex3",
              title: "More First String Exercise 3 (5 Bars, Sight-Reading)",
              description: "Lesson Book p. 10: Sight-reading mixed quarter, half, and whole notes on string 1.",
              pdfPage: 10,
              clef: "treble",
              notationMode: "standard",
              hasBookTab: false,
              timeSignature: "4/4",
              defaultBpm: 65,
              goalBpm: 85,
              measures: [
                "E4/q@1:0, F4/h@1:1, E4/q@1:0",
                "G4/q@1:3, F4/q@1:1, E4/h@1:0",
                "F4/h@1:1, G4/q@1:3, E4/q@1:0",
                "F4/q@1:1, G4/q@1:3, F4/q@1:1, E4/q@1:0",
                "F4/w@1:1"
              ]
            }),
            buildExerciseFromCurriculum({
              id: "lb-s2-m1-ex4",
              title: "More First String Exercise 4 (6 Bars, Sight-Reading)",
              description: "Lesson Book p. 10: Keep counting beats steadily across syncopated half-note groupings.",
              pdfPage: 10,
              clef: "treble",
              notationMode: "standard",
              hasBookTab: false,
              timeSignature: "4/4",
              defaultBpm: 65,
              goalBpm: 85,
              measures: [
                "F4/h@1:1, E4/h@1:0",
                "F4/q@1:1, G4/h@1:3, E4/q@1:0",
                "F4/q@1:1, G4/h@1:3, E4/q@1:0",
                "F4/q@1:1, E4/h@1:0, G4/q@1:3",
                "G4/w@1:3",
                "F4/w@1:1"
              ]
            }),
            buildExerciseFromCurriculum({
              id: "lb-s2-m1-ex5",
              title: "More First String Exercise 5 (10 Bars, Extended Sight-Reading)",
              description: "Lesson Book p. 10: Two-line extended sight-reading study on the 1st string.",
              pdfPage: 10,
              clef: "treble",
              notationMode: "standard",
              hasBookTab: false,
              timeSignature: "4/4",
              defaultBpm: 65,
              goalBpm: 90,
              measures: [
                "E4/q@1:0, F4/q@1:1, G4/q@1:3, E4/q@1:0",
                "F4/q@1:1, G4/q@1:3, E4/q@1:0, G4/q@1:3",
                "F4/q@1:1, F4/q@1:1, F4/h@1:1",
                "G4/q@1:3, F4/q@1:1, E4/q@1:0, F4/q@1:1",
                "F4/w@1:1",
                "E4/q@1:0, F4/q@1:1, G4/q@1:3, E4/q@1:0",
                "F4/q@1:1, G4/q@1:3, E4/q@1:0, E4/q@1:0",
                "F4/q@1:1, F4/q@1:1, G4/q@1:3, F4/q@1:1",
                "E4/h@1:0, G4/h@1:3",
                "F4/w@1:1"
              ]
            })
          ]
        },
        {
          topicTitle: "Second String Exercises (B - C - D) (Lesson Book p. 11)",
          exercises: [
            buildExerciseFromCurriculum({
              id: "lb-s2-str2-ex1",
              title: "Second String Exercise 1: Whole Notes (7 Bars)",
              description: "Lesson Book p. 11: Learn B (open), C (1st fret), and D (3rd fret) on the 2nd string.",
              pdfPage: 11,
              clef: "treble",
              notationMode: "standard",
              hasBookTab: true,
              timeSignature: "4/4",
              defaultBpm: 65,
              goalBpm: 80,
              measures: [
                "B3/w@2:0[Down]",
                "C4/w@2:1[Down]",
                "D4/w@2:3[Down]",
                "B3/w@2:0[Down]",
                "D4/w@2:3[Down]",
                "B3/w@2:0[Down]",
                "C4/w@2:1[Down]"
              ]
            }),
            buildExerciseFromCurriculum({
              id: "lb-s2-str2-ex2",
              title: "Second String Exercise 2: Half Notes (4 Bars)",
              description: "Lesson Book p. 11: Half notes (2 beats each) on the 2nd string.",
              pdfPage: 11,
              clef: "treble",
              notationMode: "standard",
              hasBookTab: true,
              timeSignature: "4/4",
              defaultBpm: 65,
              goalBpm: 85,
              measures: [
                "B3/h@2:0[Down], C4/h@2:1[Down]",
                "B3/h@2:0[Down], D4/h@2:3[Down]",
                "C4/h@2:1[Down], D4/h@2:3[Down]",
                "C4/h@2:1[Down], B3/h@2:0[Down]"
              ]
            }),
            buildExerciseFromCurriculum({
              id: "lb-s2-str2-ex3",
              title: "Second String Exercise 3: Quarter, Half & Whole Notes (5 Bars)",
              description: "Lesson Book p. 11: Play smoothly through B, C, and D on the 2nd string.",
              pdfPage: 11,
              clef: "treble",
              notationMode: "standard",
              hasBookTab: true,
              timeSignature: "4/4",
              defaultBpm: 65,
              goalBpm: 85,
              measures: [
                "B3/q@2:0, B3/q@2:0, C4/q@2:1, C4/q@2:1",
                "D4/q@2:3, C4/q@2:1, B3/h@2:0",
                "B3/q@2:0, C4/q@2:1, D4/h@2:3",
                "D4/q@2:3, C4/q@2:1, B3/q@2:0, C4/q@2:1",
                "D4/w@2:3"
              ]
            }),
            buildExerciseFromCurriculum({
              id: "lb-s2-str2-ex4",
              title: "Second String Exercise 4: Mixed Rhythm Drill (6 Bars)",
              description: "Lesson Book p. 11: Mixed quarter and half-note rhythm study on string 2.",
              pdfPage: 11,
              clef: "treble",
              notationMode: "standard",
              hasBookTab: true,
              timeSignature: "4/4",
              defaultBpm: 65,
              goalBpm: 85,
              measures: [
                "D4/h@2:3, B3/q@2:0, C4/q@2:1",
                "B3/q@2:0, B3/q@2:0, B3/h@2:0",
                "C4/q@2:1, C4/q@2:1, C4/h@2:1",
                "B3/q@2:0, B3/q@2:0, B3/h@2:0",
                "D4/q@2:3, C4/q@2:1, B3/q@2:0, C4/q@2:1",
                "D4/q@2:3, B3/q@2:0, D4/h@2:3"
              ]
            })
          ]
        },
        {
          topicTitle: "More Second String Exercises (Sight-Reading, Lesson Book p. 11–12)",
          exercises: [
            buildExerciseFromCurriculum({
              id: "lb-s2-m2-ex1",
              title: "More Second String Exercise 1 (7 Bars, Sight-Reading)",
              description: "Lesson Book p. 11: Read B, C, and D on the treble staff without hesitation between notes.",
              pdfPage: 11,
              clef: "treble",
              notationMode: "standard",
              hasBookTab: false,
              timeSignature: "4/4",
              defaultBpm: 65,
              goalBpm: 85,
              measures: [
                "B3/h@2:0, D4/h@2:3",
                "C4/w@2:1",
                "D4/q@2:3, C4/q@2:1, B3/q@2:0, D4/q@2:3",
                "C4/h@2:1, C4/h@2:1",
                "B3/q@2:0, C4/q@2:1, D4/q@2:3, C4/q@2:1",
                "B3/h@2:0, D4/h@2:3",
                "C4/w@2:1"
              ]
            }),
            buildExerciseFromCurriculum({
              id: "lb-s2-m2-ex2",
              title: "More Second String Exercise 2 (4 Bars, Sight-Reading)",
              description: "Lesson Book p. 12: Sight-reading study on the 2nd string.",
              pdfPage: 12,
              clef: "treble",
              notationMode: "standard",
              hasBookTab: false,
              timeSignature: "4/4",
              defaultBpm: 65,
              goalBpm: 85,
              measures: [
                "D4/q@2:3, D4/q@2:3, B3/q@2:0, C4/q@2:1",
                "D4/q@2:3, D4/q@2:3, C4/h@2:1",
                "D4/h@2:3, C4/h@2:1",
                "B3/q@2:0, B3/q@2:0, C4/h@2:1"
              ]
            }),
            buildExerciseFromCurriculum({
              id: "lb-s2-m2-ex3",
              title: "More Second String Exercise 3 (5 Bars, Sight-Reading)",
              description: "Lesson Book p. 12: Sight-reading study on the 2nd string.",
              pdfPage: 12,
              clef: "treble",
              notationMode: "standard",
              hasBookTab: false,
              timeSignature: "4/4",
              defaultBpm: 65,
              goalBpm: 85,
              measures: [
                "C4/q@2:1, B3/h@2:0, D4/q@2:3",
                "B3/q@2:0, D4/q@2:3, C4/h@2:1",
                "D4/h@2:3, C4/q@2:1, C4/q@2:1",
                "B3/q@2:0, B3/q@2:0, D4/q@2:3, B3/q@2:0",
                "C4/w@2:1"
              ]
            }),
            buildExerciseFromCurriculum({
              id: "lb-s2-m2-ex4",
              title: "More Second String Exercise 4 (6 Bars, Sight-Reading)",
              description: "Lesson Book p. 12: Mixed quarter, half, and whole notes on string 2.",
              pdfPage: 12,
              clef: "treble",
              notationMode: "standard",
              hasBookTab: false,
              timeSignature: "4/4",
              defaultBpm: 65,
              goalBpm: 85,
              measures: [
                "B3/h@2:0, C4/h@2:1",
                "C4/q@2:1, D4/h@2:3, D4/q@2:3",
                "C4/q@2:1, D4/h@2:3, C4/q@2:1",
                "B3/q@2:0, D4/h@2:3, B3/q@2:0",
                "D4/w@2:3",
                "C4/w@2:1"
              ]
            }),
            buildExerciseFromCurriculum({
              id: "lb-s2-m2-ex5",
              title: "More Second String Exercise 5 (10 Bars, Extended Sight-Reading)",
              description: "Lesson Book p. 12: Extended 10-bar sight-reading workout on string 2.",
              pdfPage: 12,
              clef: "treble",
              notationMode: "standard",
              hasBookTab: false,
              timeSignature: "4/4",
              defaultBpm: 65,
              goalBpm: 90,
              measures: [
                "B3/q@2:0, C4/q@2:1, D4/q@2:3, B3/q@2:0",
                "C4/q@2:1, D4/q@2:3, B3/q@2:0, D4/q@2:3",
                "C4/q@2:1, D4/q@2:3, B3/q@2:0, B3/q@2:0",
                "D4/q@2:3, C4/q@2:1, B3/q@2:0, C4/q@2:1",
                "B3/w@2:0",
                "C4/q@2:1, D4/q@2:3, B3/q@2:0, D4/q@2:3",
                "C4/q@2:1, D4/q@2:3, B3/q@2:0, B3/q@2:0",
                "C4/q@2:1, C4/q@2:1, C4/h@2:1",
                "B3/h@2:0, D4/h@2:3",
                "B3/w@2:0"
              ]
            })
          ]
        },
        {
          topicTitle: "First and Second String Exercises (Lesson Book p. 12–13)",
          exercises: [
            buildExerciseFromCurriculum({
              id: "lb-s2-comb-ex1",
              title: "1st & 2nd String Exercise 1 (7 Bars)",
              description: "Lesson Book p. 12: Combines E-F-G on string 1 with B-C-D on string 2 cleanly.",
              pdfPage: 12,
              clef: "treble",
              notationMode: "standard",
              hasBookTab: true,
              timeSignature: "4/4",
              defaultBpm: 65,
              goalBpm: 85,
              measures: [
                "E4/h@1:0, F4/h@1:1",
                "G4/q@1:3, F4/q@1:1, E4/h@1:0",
                "B3/h@2:0, C4/h@2:1",
                "D4/q@2:3, C4/q@2:1, B3/h@2:0",
                "C4/q@2:1, D4/q@2:3, E4/q@1:0, F4/q@1:1",
                "G4/h@1:3, G4/h@1:3",
                "C4/w@2:1"
              ]
            }),
            buildExerciseFromCurriculum({
              id: "lb-s2-comb-ex2",
              title: "1st & 2nd String Exercise 2 (4 Bars)",
              description: "Lesson Book p. 12: Switch smoothly between string 2 (C, D, B) and string 1 (E, F).",
              pdfPage: 12,
              clef: "treble",
              notationMode: "standard",
              hasBookTab: true,
              timeSignature: "4/4",
              defaultBpm: 65,
              goalBpm: 85,
              measures: [
                "C4/q@2:1, C4/q@2:1, E4/q@1:0, E4/q@1:0",
                "D4/q@2:3, D4/q@2:3, C4/h@2:1",
                "F4/q@1:1, E4/q@1:0, D4/q@2:3, C4/q@2:1",
                "B3/q@2:0, D4/q@2:3, C4/h@2:1"
              ]
            }),
            buildExerciseFromCurriculum({
              id: "lb-s2-comb-ex3",
              title: "1st & 2nd String Exercise 3 (5 Bars)",
              description: "Lesson Book p. 12: Alternating stepwise skips across strings 1 and 2.",
              pdfPage: 12,
              clef: "treble",
              notationMode: "standard",
              hasBookTab: true,
              timeSignature: "4/4",
              defaultBpm: 65,
              goalBpm: 85,
              measures: [
                "B3/q@2:0, D4/q@2:3, C4/q@2:1, E4/q@1:0",
                "D4/q@2:3, F4/q@1:1, E4/q@1:0, G4/q@1:3",
                "G4/q@1:3, D4/q@2:3, E4/q@1:0, B3/q@2:0",
                "D4/q@2:3, B3/q@2:0, C4/q@2:1, B3/q@2:0",
                "C4/h@2:1, C4/h@2:1"
              ]
            }),
            buildExerciseFromCurriculum({
              id: "lb-s2-comb-ex4",
              title: "1st & 2nd String Exercise 4 (6 Bars)",
              description: "Lesson Book p. 13: Scale ascent & string crossings from B up to G and back down to C.",
              pdfPage: 13,
              clef: "treble",
              notationMode: "standard",
              hasBookTab: true,
              timeSignature: "4/4",
              defaultBpm: 65,
              goalBpm: 85,
              measures: [
                "B3/q@2:0, C4/q@2:1, D4/q@2:3, E4/q@1:0",
                "F4/q@1:1, G4/q@1:3, F4/q@1:1, E4/q@1:0",
                "D4/q@2:3, C4/q@2:1, B3/h@2:0",
                "G4/q@1:3, F4/q@1:1, E4/q@1:0, F4/q@1:1",
                "E4/q@1:0, D4/q@2:3, E4/q@1:0, D4/q@2:3",
                "C4/q@2:1, B3/q@2:0, C4/h@2:1"
              ]
            })
          ]
        },
        {
          topicTitle: "More First & Second String Exercises with Rests (Lesson Book p. 13)",
          exercises: [
            buildExerciseFromCurriculum({
              id: "lb-s2-mc-ex1",
              title: "More 1st & 2nd String Exercise 1 (8 Bars, Sight-Reading)",
              description: "Lesson Book p. 13: Sight-reading eighth-note/quarter-note arpeggio contours across strings 1 and 2.",
              pdfPage: 13,
              clef: "treble",
              notationMode: "standard",
              hasBookTab: false,
              timeSignature: "4/4",
              defaultBpm: 65,
              goalBpm: 90,
              measures: [
                "C4/q@2:1, C4/q@2:1, E4/q@1:0, E4/q@1:0",
                "G4/q@1:3, G4/q@1:3, E4/h@1:0",
                "F4/q@1:1, F4/q@1:1, C4/q@2:1, C4/q@2:1",
                "B3/q@2:0, B3/q@2:0, G4/h@1:3",
                "C4/q@2:1, C4/q@2:1, E4/q@1:0, E4/q@1:0",
                "G4/q@1:3, G4/q@1:3, E4/h@1:0",
                "F4/q@1:1, F4/q@1:1, C4/q@2:1, C4/q@2:1",
                "C4/h@2:1, C4/h@2:1"
              ]
            }),
            buildExerciseFromCurriculum({
              id: "lb-s2-mc-rest2",
              title: "More 1st & 2nd String Exercise 2: Quarter Rests (4 Bars)",
              description: "Lesson Book p. 13: Quarter rest gets 1 beat of complete silence. Damp strings cleanly with your palm/fingers on Beat 2 of every bar.",
              pdfPage: 13,
              clef: "treble",
              notationMode: "standard",
              hasBookTab: false,
              timeSignature: "4/4",
              defaultBpm: 60,
              goalBpm: 80,
              measures: [
                "E4/q@1:0, R/q, C4/q@2:1, D4/q@2:3",
                "E4/q@1:0, R/q, C4/q@2:1, D4/q@2:3",
                "F4/q@1:1, R/q, E4/q@1:0, D4/q@2:3",
                "C4/q@2:1, R/q, C4/h@2:1"
              ]
            }),
            buildExerciseFromCurriculum({
              id: "lb-s2-mc-rest3",
              title: "More 1st & 2nd String Exercise 3: Half & Quarter Rests (5 Bars)",
              description: "Lesson Book p. 13: Half rest gets 2 full beats of silence. Count rest beats carefully.",
              pdfPage: 13,
              clef: "treble",
              notationMode: "standard",
              hasBookTab: false,
              timeSignature: "4/4",
              defaultBpm: 60,
              goalBpm: 80,
              measures: [
                "E4/h@1:0, R/h",
                "F4/q@1:1, E4/q@1:0, D4/q@2:3, R/q",
                "E4/h@1:0, R/q, C4/q@2:1",
                "C4/q@2:1, B3/q@2:0, C4/q@2:1, R/q",
                "R/h, C4/h@2:1"
              ]
            }),
            buildExerciseFromCurriculum({
              id: "lb-s2-mc-rest4",
              title: "More 1st & 2nd String Exercise 4: Alternating Strings + Rest (4 Bars)",
              description: "Lesson Book p. 13: Practice clean string skips between G-C and F-B, finishing with a beat-3 quarter rest.",
              pdfPage: 13,
              clef: "treble",
              notationMode: "standard",
              hasBookTab: false,
              timeSignature: "4/4",
              defaultBpm: 65,
              goalBpm: 85,
              measures: [
                "G4/q@1:3, C4/q@2:1, G4/q@1:3, C4/q@2:1",
                "F4/q@1:1, B3/q@2:0, F4/q@1:1, B3/q@2:0",
                "G4/q@1:3, C4/q@2:1, G4/q@1:3, C4/q@2:1",
                "D4/q@2:3, E4/q@1:0, R/q, C4/q@2:1"
              ]
            }),
            buildExerciseFromCurriculum({
              id: "lb-s2-mc-rest5",
              title: "More 1st & 2nd String Exercise 5: Dotted-Beat & Double-Rest Drill (4 Bars)",
              description: "Lesson Book p. 13: Focus on strict muting during multiple quarter rests in Bars 3 & 4.",
              pdfPage: 13,
              clef: "treble",
              notationMode: "standard",
              hasBookTab: false,
              timeSignature: "4/4",
              defaultBpm: 65,
              goalBpm: 85,
              measures: [
                "B3/h@2:0, C4/q@2:1, C4/q@2:1",
                "D4/h@2:3, C4/q@2:1, C4/q@2:1",
                "G4/q@1:3, R/q, D4/q@2:3, R/q",
                "C4/q@2:1, R/q, R/q, C4/q@2:1"
              ]
            }),
            buildExerciseFromCurriculum({
              id: "lb-s2-mc-rest6",
              title: "More 1st & 2nd String Exercise 6: Rests & Whole Notes (4 Bars)",
              description: "Lesson Book p. 13: Whole-note E sustained 4 beats followed by a half rest entry in Bar 2 and final quarter rest damping.",
              pdfPage: 13,
              clef: "treble",
              notationMode: "standard",
              hasBookTab: false,
              timeSignature: "4/4",
              defaultBpm: 65,
              goalBpm: 85,
              measures: [
                "E4/w@1:0",
                "R/h, F4/q@1:1, B3/q@2:0",
                "C4/q@2:1, D4/q@2:3, G4/q@1:3, B3/q@2:0",
                "C4/q@2:1, G4/q@1:3, C4/q@2:1, R/q"
              ]
            })
          ]
        },
        {
          topicTitle: "Repertoire Songs (Lesson Book p. 14–15)",
          exercises: [
            buildExerciseFromCurriculum({
              id: "lb-s2-song-ode",
              title: "Song: Ode to Joy - Full 16-Bar Arrangement (CD #1 Tracks 2, 3, 4)",
              description: "Lesson Book p. 14: Play the single-note melody first with clean fretting and steady timing, then practice strumming the C & G7 chord changes above each measure.",
              pdfPage: 14,
              clef: "treble",
              notationMode: "standard",
              hasBookTab: true,
              timeSignature: "4/4",
              defaultBpm: 75,
              goalBpm: 94,
              measures: [
                { chord: "C", notes: "E4/q@1:0, E4/q@1:0, F4/q@1:1, G4/q@1:3" },
                { chord: "G7", notes: "G4/q@1:3, F4/q@1:1, E4/q@1:0, D4/q@2:3" },
                { chord: "C", notes: "C4/q@2:1, C4/q@2:1, D4/q@2:3, E4/q@1:0" },
                { chord: "G7", notes: "E4/q@1:0, D4/q@2:3, D4/h@2:3" },
                { chord: "C", notes: "E4/q@1:0, E4/q@1:0, F4/q@1:1, G4/q@1:3" },
                { chord: "G7", notes: "G4/q@1:3, F4/q@1:1, E4/q@1:0, D4/q@2:3" },
                { chord: "C", notes: "C4/q@2:1, C4/q@2:1, D4/q@2:3, E4/q@1:0" },
                { chord: "G7", notes: "D4/q@2:3!G7, C4/q@2:1!C, C4/h@2:1" },
                { chord: "G7", notes: "D4/q@2:3, D4/q@2:3, E4/q@1:0, C4/q@2:1" },
                { chord: "G7", notes: "D4/q@2:3, F4/q@1:1, E4/q@1:0, C4/q@2:1" },
                { chord: "G7", notes: "D4/q@2:3, F4/q@1:1, E4/q@1:0, D4/q@2:3" },
                { chord: "C", notes: "C4/q@2:1!C, D4/q@2:3, G4/h@1:3!G7" },
                { chord: "C", notes: "E4/q@1:0, E4/q@1:0, F4/q@1:1, G4/q@1:3" },
                { chord: "G7", notes: "G4/q@1:3, F4/q@1:1, E4/q@1:0, D4/q@2:3" },
                { chord: "C", notes: "C4/q@2:1, C4/q@2:1, D4/q@2:3, E4/q@1:0" },
                { chord: "G7", notes: "D4/q@2:3!G7, C4/q@2:1!C, C4/h@2:1" }
              ]
            }),
            buildExerciseFromCurriculum({
              id: "lb-s2-song-jingle",
              title: "Song: Jingle Bells - Full 16-Bar Arrangement (CD #1 Tracks 5, 6, 7)",
              description: "Lesson Book p. 15: Play through the melody on the 1st and 2nd strings, then strum the C and G7 chord accompaniment.",
              pdfPage: 15,
              clef: "treble",
              notationMode: "standard",
              hasBookTab: true,
              timeSignature: "4/4",
              defaultBpm: 75,
              goalBpm: 94,
              measures: [
                { chord: "C", notes: "E4/q@1:0, E4/q@1:0, E4/h@1:0" },
                { chord: "C", notes: "E4/q@1:0, E4/q@1:0, E4/h@1:0" },
                { chord: "C", notes: "E4/q@1:0, G4/q@1:3, C4/q@2:1, D4/q@2:3" },
                { chord: "C", notes: "E4/w@1:0" },
                { chord: "G7", notes: "F4/q@1:1, F4/q@1:1, F4/q@1:1, F4/q@1:1" },
                { chord: "C", notes: "F4/q@1:1!C, E4/q@1:0, E4/q@1:0, E4/q@1:0" },
                { chord: "G7", notes: "E4/q@1:0!G7, D4/q@2:3, D4/q@2:3, E4/q@1:0" },
                { chord: "G7", notes: "D4/h@2:3, G4/h@1:3" },
                { chord: "C", notes: "E4/q@1:0, E4/q@1:0, E4/h@1:0" },
                { chord: "C", notes: "E4/q@1:0, E4/q@1:0, E4/h@1:0" },
                { chord: "C", notes: "E4/q@1:0, G4/q@1:3, C4/q@2:1, D4/q@2:3" },
                { chord: "C", notes: "E4/w@1:0" },
                { chord: "G7", notes: "F4/q@1:1, F4/q@1:1, F4/q@1:1, F4/q@1:1" },
                { chord: "C", notes: "F4/q@1:1!C, E4/q@1:0, E4/q@1:0, E4/q@1:0" },
                { chord: "G7", notes: "G4/q@1:3!G7, G4/q@1:3, F4/q@1:1, D4/q@2:3" },
                { chord: "C", notes: "C4/w@2:1" }
              ]
            })
          ]
        }
      ]
    }
  ],

  bonusWorkshop: [
    {
      sessionNumber: 3,
      verifiedTopics: [
        {
          matchTopic: /Ties,\s*Dots\s*&\s*Rests/i,
          topicTitle: "Ties, Dots & Rests! (Bonus Book p. 26)",
          pdfPage: 26,
          exercises: [
            buildExerciseFromCurriculum({
              id: "bw-w3-tdr-ex1",
              title: "Exercise 1: Ties Across Barlines & Alternating Eighth Pairs",
              description: "Bonus Book p. 26: Beat 4 ties across the barline into Beat 1. Pluck Beat 4 cleanly and hold its sustain into the next bar without re-picking.",
              pdfPage: 26,
              clef: "treble",
              notationMode: "standard",
              hasBookTab: false,
              timeSignature: "4/4",
              defaultBpm: 65,
              goalBpm: 88,
              concepts: ["Ties Across Barlines", "Eighth Pairs", "Strings 2, 3, 4"],
              measures: [
                "D3/q@4:0[Down], D3/8@4:0[Down], D3/8@4:0[Up], D3/q@4:0[Down], D3/q~@4:0[Up]",
                "~D3/q@4:0, G3/8@3:0[Down], G3/8@3:0[Up], D3/q@4:0[Down], D3/q~@4:0[Up]",
                "~D3/q@4:0, G3/8@3:0[Down], G3/8@3:0[Up], D3/q@4:0[Down], D3/q~@4:0[Up]",
                "~D3/q@4:0, G3/8@3:0[Down], G3/8@3:0[Up], C4/q@2:1[Down], C4/q~@2:1[Up]",
                "~C4/q@2:1, G3/8@3:0[Down], G3/8@3:0[Up], C4/q@2:1[Down], C4/q~@2:1[Up]",
                "~C4/q@2:1, G3/8@3:0[Down], G3/8@3:0[Up], D3/h@4:0[Down]"
              ]
            }),
            buildExerciseFromCurriculum({
              id: "bw-w3-tdr-ex2",
              title: "Exercise 2: Tied Descending Scalar Pattern (G–F–E–D)",
              description: "Bonus Book p. 26: Each bar ties Beat 4 cleanly across the barline into Beat 1 while stepping smoothly down from 3rd string G to 4th string D.",
              pdfPage: 26,
              clef: "treble",
              notationMode: "standard",
              hasBookTab: false,
              timeSignature: "4/4",
              defaultBpm: 65,
              goalBpm: 88,
              concepts: ["Ties Across Barlines", "Stepwise Bass Motion"],
              measures: [
                "G3/8@3:0[Down], A3/8@3:2[Up], G3/8@3:0[Down], A3/8@3:2[Up], G3/q@3:0[Down], G3/q~@3:0[Up]",
                "~G3/q@3:0, F3/8@4:3[Down], G3/8@3:0[Up], F3/q@4:3[Down], F3/q~@4:3[Up]",
                "~F3/q@4:3, E3/8@4:2[Down], F3/8@4:3[Up], E3/q@4:2[Down], E3/q~@4:2[Up]",
                "~E3/q@4:2, D3/8@4:0[Down], E3/8@4:2[Up], G3/q@3:0[Down], C4/q@2:1[Up]"
              ]
            }),
            buildExerciseFromCurriculum({
              id: "bw-w3-tdr-ex3",
              title: "Exercise 3: Dotted Half Notes & D-String Upbeats",
              description: "Bonus Book p. 26: Dotted half notes hold for 3 beats followed by a pair of open 4th-string D eighth notes on Beat 4 (and final quarter rest mute).",
              pdfPage: 26,
              clef: "treble",
              notationMode: "standard",
              hasBookTab: false,
              timeSignature: "4/4",
              defaultBpm: 65,
              goalBpm: 90,
              concepts: ["Dotted Half = 3 Beats", "Eighth Upbeats", "Quarter Rest"],
              measures: [
                "G3/h.@3:0[Down], D3/8@4:0[Down], D3/8@4:0[Up]",
                "G3/h.@3:0[Down], D3/8@4:0[Down], D3/8@4:0[Up]",
                "G3/q@3:0[Down], D3/8@4:0[Down], D3/8@4:0[Up], G3/q@3:0[Down], D3/8@4:0[Down], D3/8@4:0[Up]",
                "G3/h.@3:0[Down], R/q"
              ]
            }),
            buildExerciseFromCurriculum({
              id: "bw-w3-tdr-ex4",
              title: "Exercise 4: Dotted Quarter Syncopation (+1/2 Beat)",
              description: "Bonus Book p. 26: Feel the dotted quarter note hold past Beat 2 into the '&' of Beat 2 (1 1/2 beats) before picking the following eighth note.",
              pdfPage: 26,
              clef: "treble",
              notationMode: "standard",
              hasBookTab: false,
              timeSignature: "4/4",
              defaultBpm: 60,
              goalBpm: 84,
              concepts: ["Dotted Quarter = 1.5 Beats", "Off-Beat Eighths"],
              measures: [
                "G3/q@3:0[Down], G3/8@3:0[Down], A3/8@3:2[Up], G3/h@3:0[Down]",
                "G3/q.@3:0[Down], A3/8@3:2[Up], G3/h@3:0[Down]",
                "C4/q@2:1[Down], C4/8@2:1[Down], D4/8@2:3[Up], C4/h@2:1[Down]",
                "C4/q.@2:1[Down], D4/8@2:3[Up], C4/h@2:1[Down]",
                "G4/q.@1:3[Down], D4/8@2:3[Up], G3/q@3:0[Down], G3/q@3:0[Down]"
              ]
            }),
            buildExerciseFromCurriculum({
              id: "bw-w3-tdr-ex5",
              title: "Exercise 5: Eighth Rests & Quarter Rest Damping",
              description: "Bonus Book p. 26: Damp cleanly on every eighth rest ('2') before plucking the '&' upbeat, and mute silently on all quarter rests.",
              pdfPage: 26,
              clef: "treble",
              notationMode: "standard",
              hasBookTab: false,
              timeSignature: "4/4",
              defaultBpm: 60,
              goalBpm: 84,
              concepts: ["Eighth Rests", "Quarter Rests", "Syncopated Upbeats"],
              measures: [
                "G3/q@3:0[Down], R/8, G3/8@3:0[Up], C4/q@2:1[Down], R/q",
                "D4/q@2:3[Down], R/8, C4/8@2:1[Up], G3/q@3:0[Down], R/q",
                "C4/q@2:1[Down], R/8, D4/8@2:3[Up], G3/q@3:0[Down], R/8, G3/8@3:0[Up]",
                "C4/q@2:1[Down], B3/8@2:0[Down], G3/8@3:0[Up], C4/q@2:1[Down], R/q"
              ]
            }),
            buildExerciseFromCurriculum({
              id: "bw-w3-tdr-ex6",
              title: "Exercise 6: Full Mix — Rests, Dotted Quarters & Octave Leaps",
              description: "Bonus Book p. 26: Capstone rhythm reading combining quarter rests, eighth rests, dotted quarter syncopations, and D4-to-D3 octave jumps.",
              pdfPage: 26,
              clef: "treble",
              notationMode: "standard",
              hasBookTab: false,
              timeSignature: "4/4",
              defaultBpm: 58,
              goalBpm: 82,
              concepts: ["Mixed Rests", "Dotted Quarters", "Octave Leaps"],
              measures: [
                "R/q, C4/8@2:1[Down], C4/8@2:1[Up], R/q, G3/8@3:0[Down], G3/8@3:0[Up]",
                "C4/8@2:1[Down], C4/8@2:1[Up], R/8, G3/8@3:0[Up], D4/8@2:3[Down], D3/8@4:0[Up], D3/q@4:0[Down]",
                "D3/8@4:0[Down], E3/q.@4:2[Up], G3/8@3:0[Up], A3/q.@3:2[Down]",
                "D4/8@2:3[Down], G3/8@3:0[Up], R/8, G3/8@3:0[Up], D4/8@2:3[Down], D3/8@4:0[Up], D3/q@4:0[Down]"
              ]
            })
          ]
        }
      ]
    }
  ],

  /**
   * Sessions 3–20 Page-by-Page Transcription Registry
   * Populate each session cleanly via `buildExerciseFromCurriculum({ ... measures: [...] })`
   * directly from Learn-and-Master-Guitar-Lesson-Book.pdf pages 16–105.
   */
  pendingSessionsTemplate: [
    { sessionNumber: 3, pdfStartPage: 16, status: "pending-pdf-transcription" },
    { sessionNumber: 4, pdfStartPage: 23, status: "pending-pdf-transcription" },
    { sessionNumber: 5, pdfStartPage: 31, status: "pending-pdf-transcription" },
    { sessionNumber: 6, pdfStartPage: 37, status: "pending-pdf-transcription" },
    { sessionNumber: 7, pdfStartPage: 43, status: "pending-pdf-transcription" },
    { sessionNumber: 8, pdfStartPage: 48, status: "pending-pdf-transcription" },
    { sessionNumber: 9, pdfStartPage: 52, status: "pending-pdf-transcription" },
    { sessionNumber: 10, pdfStartPage: 57, status: "pending-pdf-transcription" },
    { sessionNumber: 11, pdfStartPage: 63, status: "pending-pdf-transcription" },
    { sessionNumber: 12, pdfStartPage: 67, status: "pending-pdf-transcription" },
    { sessionNumber: 13, pdfStartPage: 71, status: "pending-pdf-transcription" },
    { sessionNumber: 14, pdfStartPage: 76, status: "pending-pdf-transcription" },
    { sessionNumber: 15, pdfStartPage: 80, status: "pending-pdf-transcription" },
    { sessionNumber: 16, pdfStartPage: 85, status: "pending-pdf-transcription" },
    { sessionNumber: 17, pdfStartPage: 89, status: "pending-pdf-transcription" },
    { sessionNumber: 18, pdfStartPage: 93, status: "pending-pdf-transcription" },
    { sessionNumber: 19, pdfStartPage: 98, status: "pending-pdf-transcription" },
    { sessionNumber: 20, pdfStartPage: 102, status: "pending-pdf-transcription" }
  ]
};

function inferPageNumFromStrings(...texts) {
  for (const raw of texts) {
    if (!raw) continue;
    const m = String(raw).match(/\bp\.\s*(\d+)/i);
    if (m) return parseInt(m[1], 10);
  }
  return null;
}

function normalizeBookTree(sessions, bookCategory) {
  return (sessions || []).map((session) => {
    const fallbackSessionPage = inferPageNumFromStrings(session.sessionSubtitle, session.sessionTitle) || 1;
    return {
      ...session,
      topics: (session.topics || []).map((topic, topicIdx) => {
        const topicId = topic.topicId || `${bookCategory}_s${session.sessionNumber}_t${topicIdx}`;
        const topicPdfPage = topic.pdfPage || inferPageNumFromStrings(topic.topicTitle) || fallbackSessionPage;
        const normalizedExercises = (topic.exercises || []).map((ex, exIdx) => ({
          ...ex,
          topicId,
          topicTitle: topic.topicTitle,
          pdfPage: ex.pdfPage || inferPageNumFromStrings(ex.title, ex.description) || topicPdfPage,
          exerciseNumberInTopic: exIdx + 1,
          verificationStatus: ex.verificationStatus || session.verificationStatus || "pending-pdf-transcription"
        }));
        return {
          ...topic,
          topicId,
          pdfPage: topicPdfPage,
          exercises: normalizedExercises
        };
      })
    };
  });
}

/**
 * Overlays verified PDF transcriptions into legacy course tree and normalizes every
 * session/topic/exercise with explicit `topicId` and `pdfPage`.
 */
export function mergeVerifiedCurriculumIntoCourses(legacyCourses) {
  if (!legacyCourses || !Array.isArray(legacyCourses.lessonBook)) return legacyCourses;

  const verifiedBySession = new Map(
    CURRICULUM_EXERCISES.lessonBook.map(s => [s.sessionNumber, s])
  );

  legacyCourses.lessonBook = normalizeBookTree(
    legacyCourses.lessonBook.map((session) => {
      if (verifiedBySession.has(session.sessionNumber)) {
        return verifiedBySession.get(session.sessionNumber);
      }
      return {
        ...session,
        verificationStatus: "pending-pdf-transcription",
        topics: (session.topics || []).map(t => ({
          ...t,
          exercises: (t.exercises || []).map(ex => ({
            ...ex,
            verificationStatus: ex.verificationStatus || "pending-pdf-transcription"
          }))
        }))
      };
    }),
    "lessonBook"
  );

  const bonusOverrides = new Map(
    (CURRICULUM_EXERCISES.bonusWorkshop || []).map(s => [s.sessionNumber, s.verifiedTopics || []])
  );

  if (Array.isArray(legacyCourses.bonusWorkshop)) {
    legacyCourses.bonusWorkshop = normalizeBookTree(
      legacyCourses.bonusWorkshop.map(s => {
        const overrides = bonusOverrides.get(s.sessionNumber) || [];
        return {
          ...s,
          verificationStatus: s.verificationStatus || "pending-pdf-transcription",
          topics: (s.topics || []).map(t => {
            const matchedOverride = overrides.find(ov => ov.matchTopic && ov.matchTopic.test(t.topicTitle || ""));
            if (matchedOverride) {
              return {
                topicTitle: matchedOverride.topicTitle || t.topicTitle,
                pdfPage: matchedOverride.pdfPage,
                exercises: matchedOverride.exercises
              };
            }
            return {
              ...t,
              exercises: (t.exercises || []).map(ex => ({
                ...ex,
                verificationStatus: ex.verificationStatus || "pending-pdf-transcription"
              }))
            };
          })
        };
      }),
      "bonusWorkshop"
    );
  }

  return legacyCourses;
}
