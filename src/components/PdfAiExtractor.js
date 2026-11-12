/**
 * <PdfAiExtractor /> — Built-In Gemini 2.5 Pro PDF OMR Extractor
 * ----------------------------------------------------------------------
 * Renders PDF pages offscreen at scale 3.0 via pdf.js, sends high-DPI PNG
 * snapshots to generativelanguage.googleapis.com (gemini-2.5-pro) with strict
 * OMR JSON schema & music math validation, normalizes exercises into canonical
 * ScoreRenderer + WebAudio tabData format, and persists to localStorage + IndexedDB.
 */

const STORAGE_KEY_API = "lmgs_gemini_api_key";
const STORAGE_KEY_EXTRACTED = "lmgs_ai_extracted_pages_v1";
const IDB_NAME = "lmgs_omr_storage";
const IDB_STORE = "extractedPages";

const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent";

const OMR_SYSTEM_INSTRUCTION = `You are a precision Guitar Method Book Optical Music Recognition (OMR) engine. Examine this high-resolution page from a guitar curriculum PDF.
CRITICAL RULES:
1. NEVER invent, summarize, or generate placeholder patterns. Read ONLY the exact musical exercises printed on the page.
2. Identify every separate numbered or titled exercise on the page (e.g., 1, 2, 3, 4).
3. For each exercise, count the exact number of measures (bars) separated by vertical barlines.
4. Read the Time Signature (default to 4/4 if Common Time 'C' or 4/4 is shown).
5. IF A 6-LINE TAB STAFF IS PRESENT: Read the exact string (1 = top line High E, 6 = bottom line Low E) and the exact fret number printed on that line for every note, left to right. Look up to the standard notation staff directly above each TAB number to read its exact rhythm duration:
   - Whole note (hollow oval, no stem) = 'w' (4 beats)
   - Half note (hollow oval with stem) = 'h' (2 beats)
   - Quarter note (solid black oval with single stem) = 'q' (1 beat)
   - Eighth note (solid oval with flag or horizontal beam connecting stems) = 'e' (0.5 beats)
   - Dotted half note = 'h.' (3 beats)
6. IF ONLY A 5-LINE STANDARD STAFF IS PRESENT (NO TAB): Read each note's treble clef pitch (e.g., E4 = 1st string fret 0, F4 = 1st string fret 1, G4 = 1st string fret 3; B3 = 2nd string fret 0, C4 = 2nd string fret 1, D4 = 2nd string fret 3; G3 = 3rd string fret 0, A3 = 3rd string fret 2; D3 = 4th string fret 0, E3 = 4th string fret 2, F3 = 4th string fret 3; A2 = 5th string fret 0, B2 = 5th string fret 2, C3 = 5th string fret 3; E2 = 6th string fret 0, F2 = 6th string fret 1, G2 = 6th string fret 3) and convert it into the exact String, Fret, Pitch, and Duration.
7. MATH CHECK: Before returning JSON, verify that the sum of beat durations in EVERY measure equals the time signature (e.g., 4.0 beats per measure in 4/4).`;

const OMR_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    pageTitle: { type: "STRING", description: "Heading or topic printed at the top of the PDF page" },
    exercises: {
      type: "ARRAY",
      description: "Every numbered or titled musical exercise printed on this page in order",
      items: {
        type: "OBJECT",
        properties: {
          title: { type: "STRING", description: "Exact exercise number and title from the page" },
          description: { type: "STRING", description: "Brief instruction or performance note printed for this exercise" },
          timeSignature: { type: "STRING", description: "Time signature such as 4/4, 3/4, 2/4, or 6/8" },
          defaultBpm: { type: "INTEGER", description: "Printed tempo BPM if present, otherwise 65" },
          hasTabStaff: { type: "BOOLEAN", description: "True if a 6-line guitar TAB staff is printed for this exercise" },
          measures: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                measureNumber: { type: "INTEGER" },
                chord: { type: "STRING", description: "Optional chord symbol printed above this measure (e.g. C, G7, Am) or empty string" },
                events: {
                  type: "ARRAY",
                  items: {
                    type: "OBJECT",
                    properties: {
                      isRest: { type: "BOOLEAN" },
                      pitch: { type: "STRING", description: "Concert guitar pitch e.g. E4, F4, G4, B3, C4, D4, G3, A3, D3, E3, A2, E2, or REST" },
                      string: { type: "INTEGER", description: "Guitar string 1 (High E) to 6 (Low E), or 0 for rest/chord" },
                      fret: { type: "INTEGER", description: "Fret number 0..20, or -1 for rest" },
                      durationCode: { type: "STRING", description: "One of: w, h., h, q., q, e, 16" },
                      durationBeats: { type: "NUMBER", description: "Numeric beat length: w=4, h.=3, h=2, q.=1.5, q=1, e=0.5, 16=0.25" },
                      pick: { type: "STRING", description: "Down, Up, or -" },
                      chordChange: { type: "STRING", description: "Chord symbol starting on this beat if any" },
                      tieToNext: { type: "BOOLEAN" },
                      tieFromPrev: { type: "BOOLEAN" }
                    },
                    required: ["isRest", "pitch", "string", "fret", "durationCode", "durationBeats"]
                  }
                }
              },
              required: ["measureNumber", "events"]
            }
          }
        },
        required: ["title", "timeSignature", "measures"]
      }
    }
  },
  required: ["exercises"]
};

const OPEN_STRING_MIDI = { 1: 64, 2: 59, 3: 55, 4: 50, 5: 45, 6: 40 };
const CHROMATIC_SHARP = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const NOTE_SEMITONES = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

const STANDARD_GUITAR_MAP = {
  E4: { string: 1, fret: 0 }, F4: { string: 1, fret: 1 }, "F#4": { string: 1, fret: 2 },
  G4: { string: 1, fret: 3 }, "G#4": { string: 1, fret: 4 }, A4: { string: 1, fret: 5 },
  B3: { string: 2, fret: 0 }, C4: { string: 2, fret: 1 }, "C#4": { string: 2, fret: 2 },
  D4: { string: 2, fret: 3 }, "D#4": { string: 2, fret: 4 },
  G3: { string: 3, fret: 0 }, "G#3": { string: 3, fret: 1 }, A3: { string: 3, fret: 2 },
  "A#3": { string: 3, fret: 3 }, Bb3: { string: 3, fret: 3 },
  D3: { string: 4, fret: 0 }, "D#3": { string: 4, fret: 1 }, Eb3: { string: 4, fret: 1 },
  E3: { string: 4, fret: 2 }, F3: { string: 4, fret: 3 }, "F#3": { string: 4, fret: 4 },
  A2: { string: 5, fret: 0 }, "A#2": { string: 5, fret: 1 }, Bb2: { string: 5, fret: 1 },
  B2: { string: 5, fret: 2 }, C3: { string: 5, fret: 3 }, "C#3": { string: 5, fret: 4 },
  E2: { string: 6, fret: 0 }, F2: { string: 6, fret: 1 }, "F#2": { string: 6, fret: 2 },
  G2: { string: 6, fret: 3 }, "G#2": { string: 6, fret: 4 }
};

const DUR_MAP = {
  w: { vexDur: "w", isDotted: false, beats: 4, symbol: "1/1" },
  "w.": { vexDur: "w", isDotted: true, beats: 6, symbol: "3/2" },
  "h.": { vexDur: "h", isDotted: true, beats: 3, symbol: "3/4" },
  hd: { vexDur: "h", isDotted: true, beats: 3, symbol: "3/4" },
  h: { vexDur: "h", isDotted: false, beats: 2, symbol: "1/2" },
  "q.": { vexDur: "q", isDotted: true, beats: 1.5, symbol: "3/8" },
  qd: { vexDur: "q", isDotted: true, beats: 1.5, symbol: "3/8" },
  q: { vexDur: "q", isDotted: false, beats: 1, symbol: "1/4" },
  e: { vexDur: "8", isDotted: false, beats: 0.5, symbol: "1/8" },
  "8": { vexDur: "8", isDotted: false, beats: 0.5, symbol: "1/8" },
  "16": { vexDur: "16", isDotted: false, beats: 0.25, symbol: "1/16" },
  s: { vexDur: "16", isDotted: false, beats: 0.25, symbol: "1/16" }
};

function pitchToMidi(concertPitch) {
  const m = String(concertPitch || "").trim().match(/^([A-Ga-g])(#|b)?(\d)$/);
  if (!m) return null;
  const base = NOTE_SEMITONES[m[1].toUpperCase()];
  if (base === undefined) return null;
  const acc = m[2] === "#" ? 1 : (m[2] === "b" ? -1 : 0);
  const oct = parseInt(m[3], 10);
  return (oct + 1) * 12 + base + acc;
}

function midiToPitchInfo(midi) {
  const clamped = Math.max(36, Math.min(88, Math.round(midi)));
  const oct = Math.floor(clamped / 12) - 1;
  const name = CHROMATIC_SHARP[clamped % 12];
  const acc = name.includes("#") ? "#" : null;
  const letter = name[0];
  let displayName = name;
  if (name === "E" && oct >= 4) displayName = "High E";
  if (name === "E" && oct <= 2) displayName = "Low E";
  return {
    concertPitch: `${name}${oct}`,
    vexKey: `${letter.toLowerCase()}${acc || ""}/${oct + 1}`,
    accidental: acc,
    displayName
  };
}

function resolveEventPitchAndPosition(rawEv) {
  let str = Number.isFinite(Number(rawEv.string)) ? parseInt(rawEv.string, 10) : null;
  let fret = Number.isFinite(Number(rawEv.fret)) ? parseInt(rawEv.fret, 10) : null;
  if (str !== null && (str < 1 || str > 6)) str = null;
  if (fret !== null && (fret < 0 || fret > 22)) fret = null;

  const rawPitch = String(rawEv.pitch || "").trim();
  const pitchMatch = rawPitch.match(/^([A-Ga-g])(#|b|n)?(\d)$/);

  // Prefer exact TAB string+fret when both are supplied; fallback to standard-staff pitch lookup
  if (str !== null && fret !== null) {
    const midi = OPEN_STRING_MIDI[str] + fret;
    const derived = midiToPitchInfo(midi);
    return {
      string: str,
      fret,
      finger: fret === 0 ? 0 : Math.min(4, fret),
      ...derived
    };
  }

  if (pitchMatch) {
    const normPitch = `${pitchMatch[1].toUpperCase()}${pitchMatch[2] && pitchMatch[2] !== "n" ? pitchMatch[2] : ""}${pitchMatch[3]}`;
    const mapped = STANDARD_GUITAR_MAP[normPitch];
    if (mapped) {
      str = mapped.string;
      fret = mapped.fret;
    } else {
      const midi = pitchToMidi(normPitch);
      if (midi !== null) {
        let best = { string: 1, fret: 0, dist: 99 };
        for (let s = 1; s <= 6; s++) {
          const f = midi - OPEN_STRING_MIDI[s];
          if (f >= 0 && f <= 12 && f < best.dist) {
            best = { string: s, fret: f, dist: f };
          }
        }
        str = best.string;
        fret = best.fret;
      }
    }
    const letter = pitchMatch[1].toUpperCase();
    const acc = pitchMatch[2] && pitchMatch[2] !== "n" ? pitchMatch[2] : null;
    const oct = parseInt(pitchMatch[3], 10);
    let displayName = `${letter}${acc || ""}`;
    if (displayName === "E" && oct >= 4) displayName = "High E";
    if (displayName === "E" && oct <= 2) displayName = "Low E";
    return {
      string: str || 1,
      fret: fret !== null ? fret : 0,
      finger: fret ? Math.min(4, fret) : 0,
      concertPitch: normPitch,
      vexKey: `${letter.toLowerCase()}${acc || ""}/${oct + 1}`,
      accidental: acc,
      displayName
    };
  }

  // Safe fallback: open 1st string E4
  return {
    string: 1,
    fret: 0,
    finger: 0,
    concertPitch: "E4",
    vexKey: "e/5",
    accidental: null,
    displayName: "High E"
  };
}

export class PdfAiExtractor {
  constructor() {
    this._batchCancelled = false;
    this._isBusy = false;
  }

  getApiKey() {
    try {
      return (localStorage.getItem(STORAGE_KEY_API) || "").trim();
    } catch (e) {
      return "";
    }
  }

  saveApiKey(key) {
    const clean = String(key || "").trim();
    try {
      if (clean) {
        localStorage.setItem(STORAGE_KEY_API, clean);
      } else {
        localStorage.removeItem(STORAGE_KEY_API);
      }
    } catch (e) {}
    return clean;
  }

  loadExtractedStoreSync() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_EXTRACTED);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return (parsed && typeof parsed === "object" && !Array.isArray(parsed)) ? parsed : {};
    } catch (e) {
      return {};
    }
  }

  _openIdb() {
    return new Promise((resolve, reject) => {
      if (typeof indexedDB === "undefined") {
        reject(new Error("IndexedDB unavailable"));
        return;
      }
      const req = indexedDB.open(IDB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE, { keyPath: "pageKey" });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async loadExtractedStoreAsync() {
    const local = this.loadExtractedStoreSync();
    try {
      const db = await this._openIdb();
      const rows = await new Promise((resolve, reject) => {
        const tx = db.transaction(IDB_STORE, "readonly");
        const store = tx.objectStore(IDB_STORE);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });
      const merged = { ...local };
      rows.forEach(row => {
        if (row && row.pageKey && !merged[row.pageKey]) {
          merged[row.pageKey] = row;
        }
      });
      return merged;
    } catch (e) {
      return local;
    }
  }

  async savePageEntry(entry) {
    const storeMap = this.loadExtractedStoreSync();
    storeMap[entry.pageKey] = entry;
    try {
      localStorage.setItem(STORAGE_KEY_EXTRACTED, JSON.stringify(storeMap));
    } catch (e) {
      // localStorage quota full on very large multi-book batches; IndexedDB below handles overflow cleanly
    }
    try {
      const db = await this._openIdb();
      await new Promise((resolve, reject) => {
        const tx = db.transaction(IDB_STORE, "readwrite");
        tx.objectStore(IDB_STORE).put(entry);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (e) {}
    return storeMap;
  }

  async clearAllExtractedPages() {
    try {
      localStorage.removeItem(STORAGE_KEY_EXTRACTED);
    } catch (e) {}
    try {
      const db = await this._openIdb();
      await new Promise((resolve, reject) => {
        const tx = db.transaction(IDB_STORE, "readwrite");
        tx.objectStore(IDB_STORE).clear();
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (e) {}
  }

  async renderPdfPageToBase64Png(pdfDoc, pageNumber, scale = 3.0) {
    const safePage = Math.max(1, Math.min(pageNumber, pdfDoc.numPages || pageNumber));
    const pdfPage = await pdfDoc.getPage(safePage);
    const viewport = pdfPage.getViewport({ scale });

    const offCanvas = document.createElement("canvas");
    offCanvas.width = Math.floor(viewport.width);
    offCanvas.height = Math.floor(viewport.height);
    const ctx = offCanvas.getContext("2d", { alpha: false });
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, offCanvas.width, offCanvas.height);

    await pdfPage.render({ canvasContext: ctx, viewport }).promise;
    const dataUrl = offCanvas.toDataURL("image/png");

    // Free backing store promptly between batch pages
    offCanvas.width = 0;
    offCanvas.height = 0;

    return dataUrl.replace(/^data:image\/png;base64,/, "");
  }

  async callGeminiVision(base64Png, apiKey, contextHint = "") {
    if (!apiKey) {
      throw new Error("Missing Gemini API key. Click the key icon to save your API key.");
    }

    const userPrompt = contextHint
      ? `Extract every numbered/titled guitar exercise on this page (${contextHint}). Verify duration math sums per measure against the time signature.`
      : "Extract every numbered/titled guitar exercise on this page. Verify duration math sums per measure against the time signature.";

    const payload = {
      systemInstruction: {
        parts: [{ text: OMR_SYSTEM_INSTRUCTION }]
      },
      contents: [
        {
          role: "user",
          parts: [
            { text: userPrompt },
            {
              inlineData: {
                mimeType: "image/png",
                data: base64Png
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: "application/json",
        responseSchema: OMR_RESPONSE_SCHEMA
      }
    };

    const res = await fetch(`${GEMINI_ENDPOINT}?key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      let errMsg = `Gemini API error (${res.status})`;
      try {
        const errJson = await res.json();
        if (errJson && errJson.error && errJson.error.message) {
          errMsg = errJson.error.message;
        }
      } catch (e) {}
      throw new Error(errMsg);
    }

    const data = await res.json();
    const textPart =
      data &&
      data.candidates &&
      data.candidates[0] &&
      data.candidates[0].content &&
      Array.isArray(data.candidates[0].content.parts)
        ? data.candidates[0].content.parts.map(p => p.text || "").join("").trim()
        : "";

    if (!textPart) {
      throw new Error("Gemini returned an empty response for this page.");
    }

    const cleanedJson = textPart
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```$/i, "")
      .trim();

    return JSON.parse(cleanedJson);
  }

  normalizeExtractedPage({ omrJson, bookCategory, rawPdfPage, bookPage }) {
    const rawList = Array.isArray(omrJson && omrJson.exercises) ? omrJson.exercises : [];
    const mathWarnings = [];

    const exercises = rawList.map((rawEx, idx) => {
      const tsStr = /^\d+\/\d+$/.test(String(rawEx.timeSignature || "").trim())
        ? String(rawEx.timeSignature).trim()
        : "4/4";
      const [tsNum, tsDen] = tsStr.split("/").map(n => parseInt(n, 10) || 4);
      const expectedMeasureBeats = tsNum * (4 / tsDen);
      const clef = rawEx.hasTabStaff === false ? "treble" : "treble";
      const notationMode = "standard";

      const measures = [];
      const tabData = [];

      (rawEx.measures || []).forEach((rawM, mIdx) => {
        const mNum = rawM.measureNumber || (mIdx + 1);
        const chordName = rawM.chord && String(rawM.chord).trim() ? String(rawM.chord).trim() : null;
        const events = [];
        const legacyBeats = [];
        let beatCursor = 1;
        let runningOffset = 0;
        let barBeatSum = 0;

        (rawM.events || []).forEach((rawEv, evIdx) => {
          const codeKey = String(rawEv.durationCode || "q").trim().toLowerCase();
          const durSpec = DUR_MAP[codeKey] || DUR_MAP.q;
          const durationBeats = Number(rawEv.durationBeats) > 0 ? Number(rawEv.durationBeats) : durSpec.beats;
          barBeatSum += durationBeats;

          const isRest = Boolean(rawEv.isRest || /^R(EST)?$/i.test(String(rawEv.pitch || "").trim()));
          if (isRest) {
            const restKey = durSpec.vexDur === "w" ? "d/5" : "b/4";
            const evObj = {
              beat: beatCursor,
              isRest: true,
              type: "rest",
              note: "REST",
              concertPitch: null,
              vexKey: restKey,
              accidental: null,
              duration: durSpec.vexDur,
              isDotted: durSpec.isDotted,
              vexDuration: `${durSpec.vexDur}r`,
              durationBeats,
              symbol: "REST",
              string: null,
              fret: null,
              finger: null,
              pick: "-",
              positions: [],
              chordChange: rawEv.chordChange || null,
              tip: `Rest (${durationBeats} ${durationBeats === 1 ? "Beat" : "Beats"})`
            };
            events.push(evObj);
            legacyBeats.push({
              beat: runningOffset + 1,
              eventIndex: evIdx,
              note: "REST",
              symbol: "REST",
              type: "rest",
              string: null,
              fret: null,
              finger: null,
              pick: "-",
              duration: durationBeats,
              isDotted: durSpec.isDotted,
              isStart: true,
              isSustain: false,
              chordChange: rawEv.chordChange || null,
              tip: evObj.tip
            });
            const wholePads = Math.floor(durationBeats) - 1;
            for (let p = 1; p <= wholePads; p++) {
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
                isDotted: durSpec.isDotted,
                isStart: false,
                isSustain: true,
                tip: "Rest"
              });
            }
          } else {
            const resolved = resolveEventPitchAndPosition(rawEv);
            const isTieCont = Boolean(rawEv.tieFromPrev);
            const pick = isTieCont ? "-" : (rawEv.pick || "Down");
            const evObj = {
              beat: beatCursor,
              isRest: false,
              isChord: false,
              type: "play",
              note: resolved.displayName,
              concertPitch: resolved.concertPitch,
              vexKey: resolved.vexKey,
              accidental: resolved.accidental,
              duration: durSpec.vexDur,
              isDotted: durSpec.isDotted,
              vexDuration: durSpec.vexDur,
              durationBeats,
              symbol: durSpec.symbol,
              string: resolved.string,
              fret: resolved.fret,
              finger: resolved.finger,
              pick,
              positions: [{ str: resolved.string, fret: resolved.fret }],
              tieToNext: Boolean(rawEv.tieToNext),
              tieFromPrev: isTieCont,
              chordChange: rawEv.chordChange || null,
              tip: `String ${resolved.string}, Fret ${resolved.fret}`
            };
            events.push(evObj);
            legacyBeats.push({
              beat: runningOffset + 1,
              eventIndex: evIdx,
              note: resolved.displayName,
              concertPitch: resolved.concertPitch,
              vexKey: resolved.vexKey,
              symbol: durSpec.symbol,
              type: "play",
              string: resolved.string,
              fret: resolved.fret,
              finger: resolved.finger,
              pick,
              duration: durationBeats,
              isDotted: durSpec.isDotted,
              tieFromPrev: isTieCont,
              tieToNext: Boolean(rawEv.tieToNext),
              isTieContinuation: isTieCont,
              isStart: true,
              isSustain: false,
              chordChange: rawEv.chordChange || null,
              tip: isTieCont ? "Keep Holding (Tied)" : evObj.tip
            });
            const wholePads = Math.floor(durationBeats) - 1;
            for (let p = 1; p <= wholePads; p++) {
              legacyBeats.push({
                beat: runningOffset + 1 + p,
                eventIndex: evIdx,
                note: resolved.displayName,
                concertPitch: resolved.concertPitch,
                vexKey: resolved.vexKey,
                symbol: durSpec.symbol,
                type: "sustain",
                string: resolved.string,
                fret: resolved.fret,
                finger: resolved.finger,
                pick: "-",
                duration: durationBeats,
                isDotted: durSpec.isDotted,
                isStart: false,
                isSustain: true,
                tip: "Keep Holding"
              });
            }
          }
          beatCursor += durationBeats;
          runningOffset += durationBeats;
        });

        if (Math.abs(barBeatSum - expectedMeasureBeats) > 0.05) {
          mathWarnings.push(`Ex ${idx + 1} Bar ${mNum}: ${barBeatSum}/${expectedMeasureBeats} beats`);
        }

        measures.push({
          measure: mNum,
          clef,
          notationMode,
          timeSignature: tsStr,
          chordName,
          events
        });

        tabData.push({
          measure: mNum,
          chordName,
          beats: legacyBeats
        });
      });

      const prefix = bookCategory === "bonusWorkshop" ? "bw" : "lb";
      const safeId = `${prefix}-ai-p${bookPage}-ex${idx + 1}`;
      const barCount = measures.length;

      return {
        id: safeId,
        title: rawEx.title || `Exercise ${idx + 1} (p. ${bookPage})`,
        description: rawEx.description || `Extracted from Book p. ${bookPage} via Gemini 2.5 Pro Vision OMR.`,
        timeSignature: [tsNum, tsDen],
        defaultBpm: Number(rawEx.defaultBpm) >= 30 && Number(rawEx.defaultBpm) <= 240 ? Number(rawEx.defaultBpm) : 65,
        pdfPage: bookPage,
        pdfRawPage: rawPdfPage,
        verificationStatus: "pdf-verified",
        aiExtracted: true,
        notationMode,
        concepts: [`Book p. ${bookPage}`, `${barCount} Bars`, "AI Extracted"],
        measures,
        tabData
      };
    });

    const pageKey = `${bookCategory}_p${rawPdfPage}`;
    return {
      pageKey,
      bookCategory,
      rawPdfPage,
      bookPage,
      pageTitle: (omrJson && omrJson.pageTitle) ? String(omrJson.pageTitle).trim() : `Book Page ${bookPage}`,
      extractedAt: new Date().toISOString(),
      mathWarnings,
      exercises
    };
  }
}
