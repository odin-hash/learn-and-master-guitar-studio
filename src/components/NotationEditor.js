/**
 * <NotationEditor /> — Visual Notei.co-Style Music & Guitar TAB Editor
 * ----------------------------------------------------------------------
 * Renders an inline editorial symbol palette above an exercise's VexFlow stave
 * when Admin Mode is active. Every edit keeps Treble Staff pitch, Guitar TAB
 * string/fret, rhythm durations, rests, dots, ties, pick strokes, and fingers
 * 100% synchronized, immediately re-rendering ScoreRenderer and auto-saving.
 */

import { GUITAR_OPEN_MIDI, deriveGuitarNoteFromPosition } from "./ScoreRenderer.js";

const SVG_NOTE_WHOLE = `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" class="ne-svg-glyph" aria-hidden="true"><ellipse cx="8" cy="8" rx="6" ry="4" transform="rotate(-20 8 8)"/></svg>`;
const SVG_NOTE_HALF = `<svg width="14" height="16" viewBox="0 0 16 18" fill="none" stroke="currentColor" stroke-width="1.8" class="ne-svg-glyph" aria-hidden="true"><ellipse cx="6" cy="12" rx="4.5" ry="3" transform="rotate(-20 6 12)" stroke-width="2"/><line x1="10" y1="12" x2="10" y2="2" stroke-linecap="round"/></svg>`;
const SVG_NOTE_QUARTER = `<svg width="14" height="16" viewBox="0 0 16 18" fill="currentColor" class="ne-svg-glyph" aria-hidden="true"><ellipse cx="6" cy="12" rx="4.5" ry="3" transform="rotate(-20 6 12)"/><line x1="10" y1="12" x2="10" y2="2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;
const SVG_NOTE_EIGHTH = `<svg width="14" height="16" viewBox="0 0 16 18" fill="currentColor" class="ne-svg-glyph" aria-hidden="true"><ellipse cx="6" cy="12" rx="4.5" ry="3" transform="rotate(-20 6 12)"/><line x1="10" y1="12" x2="10" y2="2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M10 2 Q 13 4 14 7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;
const SVG_NOTE_SIXTEENTH = `<svg width="14" height="16" viewBox="0 0 16 18" fill="currentColor" class="ne-svg-glyph" aria-hidden="true"><ellipse cx="6" cy="12" rx="4.5" ry="3" transform="rotate(-20 6 12)"/><line x1="10" y1="12" x2="10" y2="2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M10 2 Q 13 4 14 7 M10 5.5 Q 13 7.5 14 10.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;

const SVG_REST = `<svg width="12" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ne-svg-glyph" aria-hidden="true"><path d="M6 3 L10 6 L6 9 L9 11 A2 2 0 1 1 7 13"/></svg>`;
const SVG_DOT = `<svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor" class="ne-svg-glyph" aria-hidden="true"><circle cx="4" cy="4" r="3"/></svg>`;
const SVG_TIE = `<svg width="14" height="10" viewBox="0 0 16 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="ne-svg-glyph" aria-hidden="true"><path d="M2 4 Q 8 11 14 4"/></svg>`;
const SVG_MINUS = `<svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" class="ne-svg-glyph" aria-hidden="true"><line x1="3" y1="8" x2="13" y2="8"/></svg>`;
const SVG_PLUS = `<svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" class="ne-svg-glyph" aria-hidden="true"><line x1="8" y1="3" x2="8" y2="13"/><line x1="3" y1="8" x2="13" y2="8"/></svg>`;
const SVG_ARROW_DOWN = `<svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="ne-svg-glyph" aria-hidden="true"><line x1="8" y1="3" x2="8" y2="13"/><polyline points="4 9 8 13 12 9"/></svg>`;
const SVG_ARROW_UP = `<svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="ne-svg-glyph" aria-hidden="true"><line x1="8" y1="13" x2="8" y2="3"/><polyline points="4 7 8 3 12 7"/></svg>`;

const EDITOR_DURATIONS = [
  { code: "w", vexDur: "w", beats: 4, symbol: "1/1", label: "Whole", glyph: SVG_NOTE_WHOLE },
  { code: "h", vexDur: "h", beats: 2, symbol: "1/2", label: "Half", glyph: SVG_NOTE_HALF },
  { code: "q", vexDur: "q", beats: 1, symbol: "1/4", label: "Quarter", glyph: SVG_NOTE_QUARTER },
  { code: "e", vexDur: "8", beats: 0.5, symbol: "1/8", label: "Eighth", glyph: SVG_NOTE_EIGHTH },
  { code: "16", vexDur: "16", beats: 0.25, symbol: "1/16", label: "16th", glyph: SVG_NOTE_SIXTEENTH }
];

function editorDurSpec(codeOrDur, isDotted = false) {
  const norm = String(codeOrDur || "q").toLowerCase();
  let spec = EDITOR_DURATIONS.find(d => d.code === norm || d.vexDur === norm) || EDITOR_DURATIONS[2];
  const baseBeats = spec.beats;
  const durationBeats = isDotted ? Number((baseBeats * 1.5).toFixed(3)) : baseBeats;
  let symbol = spec.symbol;
  if (isDotted && spec.code === "w") symbol = "3/2";
  else if (isDotted && spec.code === "h") symbol = "3/4";
  else if (isDotted && spec.code === "q") symbol = "3/8";
  return { spec, durationBeats, symbol };
}

export class NotationEditor {
  constructor({ onCommitExercise, onSelectNoteForFeedback, onAddSubExercise, onBeforeMutate, onDeleteExercise } = {}) {
    this.onCommitExercise = onCommitExercise || null;
    this.onSelectNoteForFeedback = onSelectNoteForFeedback || null;
    this.onAddSubExercise = onAddSubExercise || null;
    this.onBeforeMutate = onBeforeMutate || null;
    this.onDeleteExercise = onDeleteExercise || null;

    this.exercise = null;
    this.hostEl = null;
    this.paletteEl = null;
    this.selectedMeasureIdx = 0;
    this.selectedEventIdx = 0;
    this.shorthandOpen = false;
    this._fretDigitBuffer = "";
    this._fretDigitTimer = null;
  }

  notifyBeforeMutate(actionName = "Edit Notation") {
    if (typeof this.onBeforeMutate === "function") {
      this.onBeforeMutate(actionName);
    }
  }

  isActive() {
    return Boolean(this.exercise && this.hostEl && this.paletteEl);
  }

  open(exercise, hostContainerEl, measureIdx = 0, eventIdx = 0) {
    this.close(false);
    if (!exercise || !hostContainerEl) return;
    this.exercise = exercise;
    this.ensureCanonicalMeasures(this.exercise);
    this.hostEl = hostContainerEl;

    const totalM = Math.max(1, (this.exercise.measures || []).length);
    this.selectedMeasureIdx = Math.max(0, Math.min(measureIdx, totalM - 1));
    const evs = (this.exercise.measures[this.selectedMeasureIdx] && this.exercise.measures[this.selectedMeasureIdx].events) || [];
    this.selectedEventIdx = Math.max(0, Math.min(eventIdx, Math.max(0, evs.length - 1)));

    this.renderPalette();
  }

  close(notify = true) {
    if (this.paletteEl && this.paletteEl.parentNode) {
      this.paletteEl.parentNode.removeChild(this.paletteEl);
    }
    this.paletteEl = null;
    this.hostEl = null;
    const prevId = this.exercise ? this.exercise.id : null;
    this.exercise = null;
    if (notify && prevId && typeof this.onCommitExercise === "function") {
      // Nothing to mutate on close
    }
  }

  selectNote(mIdx, beatOrEventIdx, explicitEvIdx = null) {
    if (!this.exercise || !Array.isArray(this.exercise.measures)) return;
    if (mIdx < 0 || mIdx >= this.exercise.measures.length) return;
    this.selectedMeasureIdx = mIdx;
    const evs = this.exercise.measures[mIdx].events || [];
    if (explicitEvIdx !== null && explicitEvIdx >= 0 && explicitEvIdx < evs.length) {
      this.selectedEventIdx = explicitEvIdx;
    } else {
      const matchedIdx = evs.findIndex(ev => ev.tabBeatIndex === beatOrEventIdx);
      this.selectedEventIdx = matchedIdx >= 0
        ? matchedIdx
        : Math.max(0, Math.min(beatOrEventIdx, Math.max(0, evs.length - 1)));
    }
    this.renderPalette();
  }

  syncEventFromSource(ev) {
    if (!ev) return ev;
    const durCode = ev.duration || "q";
    const isDotted = Boolean(ev.isDotted);
    const { spec, durationBeats, symbol } = editorDurSpec(durCode, isDotted);
    ev.duration = spec.vexDur;
    ev.isDotted = isDotted;
    ev.durationBeats = durationBeats;

    if (ev.isRest) {
      ev.type = "rest";
      ev.note = "REST";
      ev.concertPitch = null;
      ev.accidental = null;
      ev.preferFlat = false;
      ev.vexKey = spec.vexDur === "w" ? "d/5" : "b/4";
      ev.vexDuration = `${spec.vexDur}r`;
      ev.symbol = "REST";
      ev.string = null;
      ev.fret = null;
      ev.finger = null;
      ev.pick = "-";
      ev.positions = [];
      ev.tip = `Rest (${durationBeats} ${durationBeats === 1 ? "Beat" : "Beats"})`;
      return ev;
    }

    if (ev.isChord) {
      ev.type = "play";
      ev.vexDuration = spec.vexDur;
      ev.symbol = symbol;
      return ev;
    }

    // Single source of truth: string (1-6), fret (0-24), and preferFlat
    let srcStr = typeof ev.string === "number" ? ev.string : null;
    let srcFret = typeof ev.fret === "number" ? ev.fret : null;
    if ((srcStr === null || srcFret === null) && Array.isArray(ev.positions) && ev.positions[0]) {
      srcStr = parseInt(ev.positions[0].str, 10);
      srcFret = parseInt(ev.positions[0].fret, 10);
    }
    if (srcStr === null || isNaN(srcStr)) srcStr = 1;
    if (srcFret === null || isNaN(srcFret)) srcFret = 0;

    if (ev.preferFlat === undefined) {
      const hint = String(ev.concertPitch || ev.note || "").trim();
      ev.preferFlat = /^[A-G]b\d?$/i.test(hint) || ev.accidental === "b";
    }

    const derived = deriveGuitarNoteFromPosition(srcStr, srcFret, Boolean(ev.preferFlat));
    ev.type = "play";
    ev.isChord = false;
    ev.string = derived.string;
    ev.fret = derived.fret;
    ev.preferFlat = derived.preferFlat;
    ev.concertPitch = derived.concertPitch;
    ev.vexKey = derived.vexKey;
    ev.accidental = derived.accidental;
    ev.note = derived.displayName;
    ev.vexDuration = spec.vexDur;
    ev.symbol = symbol;
    ev.positions = [{ str: derived.string, fret: derived.fret }];
    ev.pick = ev.pick && ev.pick !== "-" ? ev.pick : "Down";
    if (ev.finger === null || ev.finger === undefined) {
      ev.finger = derived.fret === 0 ? 0 : Math.min(4, derived.fret);
    }
    ev.tip = `String ${derived.string}, Fret ${derived.fret}`;
    return ev;
  }

  ensureCanonicalMeasures(ex) {
    if (!ex) return;
    if (Array.isArray(ex.measures) && ex.measures.length > 0) {
      ex.measures.forEach((m, idx) => {
        if (!m.measure) m.measure = idx + 1;
        if (!Array.isArray(m.events)) m.events = [];
        m.events.forEach(ev => this.syncEventFromSource(ev));
      });
      this.syncMeasuresToTabData(ex);
      return;
    }

    const ts = ex.timeSignature || [4, 4];
    const tsStr = Array.isArray(ts) ? `${ts[0]}/${ts[1]}` : String(ts);
    const rawMeasures = ex.tabData || [];
    ex.measures = rawMeasures.map((m, idx) => {
      const beats = m.beats || [];
      const events = [];
      beats.forEach((b, bIdx) => {
        const isLeadingTie = bIdx === 0 && idx > 0 && (b.isSustain || b.type === "sustain") && b.type !== "rest";
        if ((b.isSustain || b.type === "sustain") && !isLeadingTie) return;

        // Read this beat's own duration inside its own measure without pulling notes across bars
        let durBeats = b.duration || 1;
        if (isLeadingTie) {
          let tieSpan = 1;
          for (let k = bIdx + 1; k < beats.length; k++) {
            if ((beats[k].isSustain || beats[k].type === "sustain") && beats[k].note === b.note) tieSpan++;
            else break;
          }
          durBeats = tieSpan;
        }
        const sym = String(b.symbol || "").toLowerCase();
        let code = "q";
        let dotted = Boolean(b.isDotted);
        if (durBeats >= 4 || sym === "1/1") code = "w";
        else if (durBeats >= 3 || sym === "3/4") { code = "h"; dotted = true; }
        else if (durBeats >= 2 || sym === "1/2") code = "h";
        else if (Math.abs(durBeats - 1.5) < 0.05 || sym === "3/8") { code = "q"; dotted = true; }
        else if (sym === "1/8" || durBeats === 0.5) code = "e";
        else if (sym === "1/16" || durBeats === 0.25) code = "16";

        const { spec } = editorDurSpec(code, dotted);
        if (b.type === "rest") {
          events.push(this.syncEventFromSource({
            beat: b.beat || (bIdx + 1),
            tabBeatIndex: bIdx,
            isRest: true,
            duration: spec.vexDur,
            isDotted: dotted
          }));
        } else {
          const str = typeof b.string === "number" ? b.string : 1;
          const fret = typeof b.fret === "number" ? b.fret : 0;
          const preferFlat = Boolean(b.preferFlat) || /^[A-G]b\d?$/i.test(String(b.note || b.concertPitch || "").trim());
          events.push(this.syncEventFromSource({
            beat: b.beat || (bIdx + 1),
            tabBeatIndex: bIdx,
            isRest: false,
            duration: spec.vexDur,
            isDotted: dotted,
            string: str,
            fret,
            preferFlat,
            finger: b.finger !== undefined && b.finger !== null ? b.finger : (fret === 0 ? 0 : Math.min(4, fret)),
            pick: isLeadingTie ? "-" : (b.pick || "Down"),
            tieFromPrev: isLeadingTie || Boolean(b.tieFromPrev),
            tieToNext: Boolean(b.tieToNext)
          }));
        }
      });

      return {
        measure: m.measure || (idx + 1),
        clef: "treble",
        notationMode: "standard",
        timeSignature: tsStr,
        chordName: m.chordName || null,
        events
      };
    });
    this.syncMeasuresToTabData(ex);
  }

  syncMeasuresToTabData(ex) {
    if (!ex || !Array.isArray(ex.measures)) return;
    const ts = ex.timeSignature || [4, 4];
    const tsStr = Array.isArray(ts) ? `${ts[0]}/${ts[1]}` : String(ts);

    ex.tabData = ex.measures.map((m, mIdx) => {
      m.measure = mIdx + 1;
      m.clef = "treble";
      m.notationMode = "standard";
      m.timeSignature = m.timeSignature || tsStr;
      const legacyBeats = [];
      let beatCursor = 1;
      let runningOffset = 0;

      (m.events || []).forEach((ev, evIdx) => {
        ev.beat = beatCursor;
        ev.tabBeatIndex = legacyBeats.length;
        const durBeats = ev.durationBeats || 1;

        if (ev.isRest) {
          ev.type = "rest";
          ev.note = "REST";
          ev.vexKey = ev.duration === "w" ? "d/5" : "b/4";
          ev.vexDuration = `${ev.duration || "q"}r`;
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
            duration: durBeats,
            isDotted: Boolean(ev.isDotted),
            isStart: true,
            isSustain: false,
            tip: `Rest (${durBeats} beats)`
          });
          const pads = Math.floor(durBeats) - 1;
          for (let p = 1; p <= pads; p++) {
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
          }
        } else {
          ev.type = "play";
          ev.vexDuration = ev.duration || "q";
          const isTieCont = Boolean(ev.tieFromPrev);
          legacyBeats.push({
            beat: runningOffset + 1,
            eventIndex: evIdx,
            note: ev.note,
            concertPitch: ev.concertPitch,
            vexKey: ev.vexKey,
            symbol: ev.symbol || "1/4",
            type: "play",
            string: ev.string,
            fret: ev.fret,
            finger: ev.finger,
            pick: isTieCont ? "-" : (ev.pick || "Down"),
            duration: durBeats,
            isDotted: Boolean(ev.isDotted),
            tieFromPrev: isTieCont,
            tieToNext: Boolean(ev.tieToNext),
            isTieContinuation: isTieCont,
            isStart: true,
            isSustain: false,
            chordChange: ev.chordChange || null,
            tip: isTieCont ? "Keep Holding (Tied)" : `String ${ev.string}, Fret ${ev.fret}`
          });
          const pads = Math.floor(durBeats) - 1;
          for (let p = 1; p <= pads; p++) {
            legacyBeats.push({
              beat: runningOffset + 1 + p,
              eventIndex: evIdx,
              note: ev.note,
              concertPitch: ev.concertPitch,
              vexKey: ev.vexKey,
              symbol: ev.symbol || "1/4",
              type: "sustain",
              string: ev.string,
              fret: ev.fret,
              finger: ev.finger,
              pick: "-",
              duration: durBeats,
              isDotted: Boolean(ev.isDotted),
              isStart: false,
              isSustain: true,
              tip: "Keep Holding"
            });
          }
        }

        beatCursor += durBeats;
        runningOffset += durBeats;
      });

      return {
        measure: m.measure,
        chordName: m.chordName || null,
        beats: legacyBeats
      };
    });

    ex.verificationStatus = "pdf-verified";
    ex.aiEdited = true;
  }

  getActiveEvent() {
    if (!this.exercise || !this.exercise.measures) return null;
    const m = this.exercise.measures[this.selectedMeasureIdx];
    if (!m || !Array.isArray(m.events)) return null;
    return m.events[this.selectedEventIdx] || null;
  }

  formatBarShorthand(m) {
    if (!m || !Array.isArray(m.events)) return "";
    return m.events.map(ev => {
      let code = "q";
      if (ev.duration === "w") code = "w";
      else if (ev.duration === "h") code = "h";
      else if (ev.duration === "8") code = "e";
      else if (ev.duration === "16") code = "16";
      const dot = ev.isDotted ? "." : "";
      const tie = ev.tieToNext ? "~" : "";
      if (ev.isRest) return `R/${code}${dot}`;
      const s = typeof ev.string === "number" ? ev.string : 1;
      const f = typeof ev.fret === "number" ? ev.fret : 0;
      const p = ev.pick === "Up" ? "[Up]" : "";
      return `${s}:${f}/${code}${dot}${tie}${p}`;
    }).join(" ");
  }

  formatExerciseShorthand() {
    if (!this.exercise || !Array.isArray(this.exercise.measures)) return "";
    return this.exercise.measures.map(m => this.formatBarShorthand(m)).join(" | ");
  }

  _parseShorthandBarEvents(barText) {
    const tokens = String(barText || "")
      .split(/[\s,]+/)
      .map(s => s.trim())
      .filter(Boolean);
    const newEvents = [];
    tokens.forEach(tok => {
      let work = tok;
      let pick = "Down";
      const pickM = work.match(/\[(Down|Up)\]/i);
      if (pickM) {
        pick = pickM[1].toLowerCase() === "up" ? "Up" : "Down";
        work = work.replace(pickM[0], "");
      }
      const tieToNext = work.endsWith("~");
      if (tieToNext) work = work.slice(0, -1);

      const parts = work.split("/");
      const head = (parts[0] || "1:0").trim();
      let durRaw = (parts[1] || "q").trim().toLowerCase();
      const isDotted = durRaw.endsWith(".");
      if (isDotted) durRaw = durRaw.slice(0, -1);
      const { spec, durationBeats, symbol } = editorDurSpec(durRaw, isDotted);

      if (/^R(EST)?$/i.test(head)) {
        newEvents.push({
          beat: 1,
          isRest: true,
          type: "rest",
          note: "REST",
          concertPitch: null,
          vexKey: spec.vexDur === "w" ? "d/5" : "b/4",
          accidental: null,
          duration: spec.vexDur,
          isDotted,
          vexDuration: `${spec.vexDur}r`,
          durationBeats,
          symbol: "REST",
          string: null,
          fret: null,
          finger: null,
          pick: "-",
          positions: []
        });
        return;
      }

      const sf = head.match(/^([1-6]):(\d{1,2})(b|#)?$/);
      const str = sf ? parseInt(sf[1], 10) : 1;
      const fret = sf ? Math.max(0, Math.min(24, parseInt(sf[2], 10))) : 0;
      const preferFlat = Boolean(sf && sf[3] === "b");
      const ev = this.syncEventFromSource({
        beat: 1,
        isRest: false,
        duration: spec.vexDur,
        isDotted,
        string: str,
        fret,
        preferFlat,
        pick,
        tieToNext,
        tieFromPrev: false
      });
      newEvents.push(ev);
    });
    return newEvents;
  }

  applyQuickShorthand(rawText) {
    if (!this.exercise || !this.exercise.measures) return;
    const rawStr = String(rawText || "").trim();
    if (!rawStr) return;

    const tsArr = this.exercise.timeSignature || [4, 4];
    const tsStr = `${tsArr[0] || 4}/${tsArr[1] || 4}`;

    if (rawStr.includes("|")) {
      const barChunks = rawStr.split("|").map(s => s.trim()).filter(Boolean);
      if (barChunks.length === 0) return;
      const parsedBars = barChunks.map((chunk, idx) => {
        const events = this._parseShorthandBarEvents(chunk);
        const existing = this.exercise.measures[idx] || {};
        return {
          measure: idx + 1,
          clef: existing.clef || "treble",
          notationMode: existing.notationMode || "standard",
          timeSignature: existing.timeSignature || tsStr,
          chordName: existing.chordName || null,
          events: events.length > 0 ? events : this._parseShorthandBarEvents("R/w")
        };
      });
      this.exercise.measures = parsedBars;
      this.selectedMeasureIdx = Math.max(0, Math.min(this.selectedMeasureIdx, parsedBars.length - 1));
      this.selectedEventIdx = 0;
      this.commitChanges();
      return;
    }

    const m = this.exercise.measures[this.selectedMeasureIdx];
    if (!m) return;
    const newEvents = this._parseShorthandBarEvents(rawStr);
    if (newEvents.length > 0) {
      m.events = newEvents;
      this.selectedEventIdx = 0;
      this.commitChanges();
    }
  }

  commitChanges() {
    if (!this.exercise) return;
    this.syncMeasuresToTabData(this.exercise);
    const activeEv = this.getActiveEvent();
    const tabBeatIdx = activeEv && activeEv.tabBeatIndex !== undefined ? activeEv.tabBeatIndex : 0;
    if (typeof this.onCommitExercise === "function") {
      this.onCommitExercise(this.exercise, this.selectedMeasureIdx, tabBeatIdx, this.selectedEventIdx);
    }
    this.renderPalette();
  }

  mutateActiveEvent(actionOrFn, maybeFn) {
    const ev = this.getActiveEvent();
    if (!ev) return;
    const action = typeof actionOrFn === "string" ? actionOrFn : "Edit Note";
    const fn = typeof actionOrFn === "function" ? actionOrFn : maybeFn;
    if (typeof fn !== "function") return;
    this.notifyBeforeMutate(action);
    fn(ev);
    this.commitChanges();
  }

  handleDirectFretDigit(digitChar) {
    if (!this.isActive()) return false;
    const ev = this.getActiveEvent();
    if (!ev) return false;

    clearTimeout(this._fretDigitTimer);
    let nextBuffer = `${this._fretDigitBuffer}${digitChar}`;
    let parsed = parseInt(nextBuffer, 10);
    if (isNaN(parsed) || parsed > 24) {
      nextBuffer = digitChar;
      parsed = parseInt(nextBuffer, 10);
    }
    this._fretDigitBuffer = nextBuffer;
    this._fretDigitTimer = setTimeout(() => {
      this._fretDigitBuffer = "";
    }, 650);

    this.setStringAndFret(typeof ev.string === "number" ? ev.string : 1, parsed);
    return true;
  }

  _adjustMeasureRestsOnDurationChange(m, evIdx, oldBeats, newBeats, prevMeasureBeats) {
    if (!m || !Array.isArray(m.events)) return;
    const ts = (this.exercise && this.exercise.timeSignature) || [4, 4];
    const expectedBeats = (ts[0] || 4) * (4 / (ts[1] || 4));
    const delta = Number((oldBeats - newBeats).toFixed(3));

    if (delta > 0.05 && prevMeasureBeats <= expectedBeats + 0.05) {
      // Measure stayed <= full before shortening: fill gap inside THIS measure only (zero cross-bar impact)
      let rem = delta;
      const denoms = [
        { beats: 4, code: "w", dotted: false },
        { beats: 3, code: "h", dotted: true },
        { beats: 2, code: "h", dotted: false },
        { beats: 1.5, code: "q", dotted: true },
        { beats: 1, code: "q", dotted: false },
        { beats: 0.5, code: "e", dotted: false },
        { beats: 0.25, code: "16", dotted: false }
      ];
      const fillEvents = [];
      for (const d of denoms) {
        while (rem >= d.beats - 0.01) {
          fillEvents.push(this.syncEventFromSource({
            beat: 1,
            isRest: true,
            isAutoFillRest: true,
            duration: d.code,
            isDotted: d.dotted
          }));
          rem = Number((rem - d.beats).toFixed(3));
        }
      }
      if (fillEvents.length > 0) {
        m.events.splice(evIdx + 1, 0, ...fillEvents);
      }
    } else if (delta < -0.05) {
      // If lengthening a note directly next to an auto-fill rest inside THIS measure, absorb only that rest
      const needed = Math.abs(delta);
      const nextEv = m.events[evIdx + 1];
      if (nextEv && nextEv.isRest && nextEv.isAutoFillRest && Math.abs((Number(nextEv.durationBeats) || 1) - needed) < 0.05) {
        m.events.splice(evIdx + 1, 1);
      }
    }
  }

  setDurationCode(code) {
    const m = this.exercise && this.exercise.measures && this.exercise.measures[this.selectedMeasureIdx];
    const ev = this.getActiveEvent();
    if (!m || !ev) return;
    this.notifyBeforeMutate(`Change Duration to ${code}`);
    const prevBeatsSum = (m.events || []).reduce((s, x) => s + (Number(x.durationBeats) || 1), 0);
    const oldBeats = Number(ev.durationBeats) || 1;
    const { spec } = editorDurSpec(code, Boolean(ev.isDotted));
    ev.duration = spec.vexDur;
    ev.isAutoFillRest = false;
    this.syncEventFromSource(ev);
    const newBeats = Number(ev.durationBeats) || 1;
    this._adjustMeasureRestsOnDurationChange(m, this.selectedEventIdx, oldBeats, newBeats, prevBeatsSum);
    this.commitChanges();
  }

  toggleRest() {
    this.mutateActiveEvent("Toggle Rest", ev => {
      ev.isRest = !ev.isRest;
      ev.isAutoFillRest = false;
      if (!ev.isRest && typeof ev.string !== "number") {
        ev.string = 1;
        ev.fret = 0;
      }
      this.syncEventFromSource(ev);
    });
  }

  toggleDotted() {
    const m = this.exercise && this.exercise.measures && this.exercise.measures[this.selectedMeasureIdx];
    const ev = this.getActiveEvent();
    if (!m || !ev) return;
    this.notifyBeforeMutate("Toggle Dot");
    const prevBeatsSum = (m.events || []).reduce((s, x) => s + (Number(x.durationBeats) || 1), 0);
    const oldBeats = Number(ev.durationBeats) || 1;
    ev.isDotted = !ev.isDotted;
    ev.isAutoFillRest = false;
    this.syncEventFromSource(ev);
    const newBeats = Number(ev.durationBeats) || 1;
    this._adjustMeasureRestsOnDurationChange(m, this.selectedEventIdx, oldBeats, newBeats, prevBeatsSum);
    this.commitChanges();
  }

  toggleTieToNext() {
    const measures = this.exercise && this.exercise.measures;
    const m = measures && measures[this.selectedMeasureIdx];
    const ev = this.getActiveEvent();
    if (!m || !ev || ev.isRest) return;
    this.notifyBeforeMutate("Toggle Tie");
    ev.tieToNext = !ev.tieToNext;
    // Sync next note tieFromPrev cleanly when same bar or next bar
    let nextEv = m.events[this.selectedEventIdx + 1] || null;
    if (!nextEv && measures[this.selectedMeasureIdx + 1]) {
      nextEv = (measures[this.selectedMeasureIdx + 1].events || [])[0] || null;
    }
    if (nextEv && !nextEv.isRest) {
      nextEv.tieFromPrev = ev.tieToNext;
    }
    this.commitChanges();
  }

  setEnharmonicFlat(useFlat) {
    this.mutateActiveEvent(useFlat ? "Spell as Flat (♭)" : "Spell as Sharp (♯)", ev => {
      if (ev.isRest) return;
      ev.preferFlat = Boolean(useFlat);
      this.syncEventFromSource(ev);
    });
  }

  setStringAndFret(strVal, fretVal) {
    const str = Math.max(1, Math.min(6, parseInt(strVal, 10) || 1));
    const fret = Math.max(0, Math.min(24, parseInt(fretVal, 10) || 0));
    this.mutateActiveEvent(`Set String ${str} Fret ${fret}`, ev => {
      ev.isRest = false;
      ev.isAutoFillRest = false;
      ev.string = str;
      ev.fret = fret;
      ev.finger = fret === 0 ? 0 : Math.min(4, fret);
      this.syncEventFromSource(ev);
    });
  }

  stepFret(delta) {
    const ev = this.getActiveEvent();
    if (!ev) return;
    const str = typeof ev.string === "number" ? ev.string : 1;
    const curFret = ev.isRest || typeof ev.fret !== "number" ? 0 : ev.fret;
    const nextFret = Math.max(0, Math.min(24, curFret + delta));
    this.setStringAndFret(str, nextFret);
  }

  stepPitch(deltaSemitones) {
    const ev = this.getActiveEvent();
    if (!ev) return;
    let str = typeof ev.string === "number" ? ev.string : 1;
    let curFret = ev.isRest || typeof ev.fret !== "number" ? 0 : ev.fret;
    let nextFret = curFret + deltaSemitones;
    if (nextFret < 0 && str < 6) {
      const targetMidi = (GUITAR_OPEN_MIDI[str] || 64) + nextFret;
      str = str + 1;
      nextFret = Math.max(0, targetMidi - (GUITAR_OPEN_MIDI[str] || 40));
    } else if (nextFret > 24 && str > 1) {
      const targetMidi = (GUITAR_OPEN_MIDI[str] || 64) + nextFret;
      str = str - 1;
      nextFret = Math.max(0, Math.min(24, targetMidi - (GUITAR_OPEN_MIDI[str] || 64)));
    } else {
      nextFret = Math.max(0, Math.min(24, nextFret));
    }
    this.setStringAndFret(str, nextFret);
  }

  setChordSymbol(chordVal) {
    const ev = this.getActiveEvent();
    if (!ev) return;
    const clean = String(chordVal || "").trim();
    this.notifyBeforeMutate(`Set Chord "${clean || "None"}"`);
    ev.chordChange = clean || null;
    if (this.selectedEventIdx === 0) {
      const m = this.exercise && this.exercise.measures && this.exercise.measures[this.selectedMeasureIdx];
      if (m) m.chordName = clean || null;
    }
    this.commitChanges();
  }

  setTimeSignature(tsStr) {
    if (!this.exercise) return;
    this.notifyBeforeMutate(`Change Time Signature to ${tsStr}`);
    const parts = String(tsStr).split("/").map(Number);
    const num = parts[0] || 4;
    const den = parts[1] || 4;
    this.exercise.timeSignature = [num, den];
    (this.exercise.measures || []).forEach(m => {
      m.timeSignature = `${num}/${den}`;
    });
    this.commitChanges();
  }

  setDefaultBpm(bpmVal) {
    if (!this.exercise) return;
    const bpm = Math.max(30, Math.min(240, parseInt(bpmVal, 10) || 60));
    this.notifyBeforeMutate(`Set BPM to ${bpm}`);
    this.exercise.defaultBpm = bpm;
    this.exercise.bpm = bpm;
    this.commitChanges();
  }

  notifyFeedbackSelection() {
    if (typeof this.onSelectNoteForFeedback === "function") {
      const ev = this.getActiveEvent();
      this.onSelectNoteForFeedback(
        this.selectedMeasureIdx,
        ev && ev.tabBeatIndex !== undefined ? ev.tabBeatIndex : 0,
        Boolean(ev && ev.isRest),
        this.selectedEventIdx
      );
    }
  }

  selectPrevNote() {
    if (!this.exercise || !Array.isArray(this.exercise.measures)) return;
    const m = this.exercise.measures[this.selectedMeasureIdx];
    if (!m) return;
    if (this.selectedEventIdx > 0) {
      this.selectNote(this.selectedMeasureIdx, 0, this.selectedEventIdx - 1);
    } else if (this.selectedMeasureIdx > 0) {
      const prevM = this.exercise.measures[this.selectedMeasureIdx - 1];
      const lastEvIdx = Math.max(0, (prevM.events || []).length - 1);
      this.selectNote(this.selectedMeasureIdx - 1, 0, lastEvIdx);
    }
    this.notifyFeedbackSelection();
  }

  selectNextNote() {
    if (!this.exercise || !Array.isArray(this.exercise.measures)) return;
    const m = this.exercise.measures[this.selectedMeasureIdx];
    if (!m) return;
    if (this.selectedEventIdx < (m.events || []).length - 1) {
      this.selectNote(this.selectedMeasureIdx, 0, this.selectedEventIdx + 1);
    } else if (this.selectedMeasureIdx < this.exercise.measures.length - 1) {
      this.selectNote(this.selectedMeasureIdx + 1, 0, 0);
    }
    this.notifyFeedbackSelection();
  }

  smartBackspace() {
    const ev = this.getActiveEvent();
    if (!ev) return;
    if (!ev.isRest) {
      this.notifyBeforeMutate("Convert Note to Rest");
      ev.isRest = true;
      ev.isAutoFillRest = false;
      this.syncEventFromSource(ev);
      this.commitChanges();
    } else {
      this.deleteSelectedNote();
    }
  }

  smartDelete() {
    this.deleteSelectedNote();
  }

  addNoteAfterSelected() {
    if (!this.exercise || !this.exercise.measures) return;
    const m = this.exercise.measures[this.selectedMeasureIdx];
    if (!m) return;
    this.notifyBeforeMutate("Add Note After Selected");
    const cur = this.getActiveEvent();
    const str = cur && typeof cur.string === "number" ? cur.string : 1;
    const fret = cur && typeof cur.fret === "number" ? cur.fret : 0;
    const { spec } = editorDurSpec(cur ? cur.duration : "q", false);

    const newEv = this.syncEventFromSource({
      beat: 1,
      isRest: false,
      duration: spec.vexDur,
      isDotted: false,
      string: str,
      fret,
      preferFlat: Boolean(cur && cur.preferFlat),
      pick: cur && cur.pick === "Down" ? "Up" : "Down",
      tieToNext: false,
      tieFromPrev: false
    });

    const insertIdx = Math.min(m.events.length, this.selectedEventIdx + 1);
    m.events.splice(insertIdx, 0, newEv);
    this.selectedEventIdx = insertIdx;
    this.commitChanges();
  }

  deleteSelectedNote() {
    if (!this.exercise || !this.exercise.measures) return;
    const m = this.exercise.measures[this.selectedMeasureIdx];
    if (!m || !Array.isArray(m.events)) return;
    this.notifyBeforeMutate("Delete Note");
    if (m.events.length <= 1) {
      const ev = m.events[0];
      if (ev) {
        ev.isRest = true;
        ev.isAutoFillRest = false;
        ev.duration = "w";
        ev.isDotted = false;
        this.syncEventFromSource(ev);
      }
      this.selectedEventIdx = 0;
    } else {
      m.events.splice(this.selectedEventIdx, 1);
      this.selectedEventIdx = Math.max(0, Math.min(this.selectedEventIdx, m.events.length - 1));
    }
    this.commitChanges();
  }

  insertMeasureAfter() {
    if (!this.exercise || !this.exercise.measures) return;
    this.notifyBeforeMutate("Insert Bar After");
    const ts = this.exercise.timeSignature || [4, 4];
    const tsNum = Array.isArray(ts) ? ts[0] : 4;
    const tsDen = Array.isArray(ts) ? ts[1] : 4;
    const tsStr = `${tsNum}/${tsDen}`;
    const beatsPerBar = tsNum * (4 / tsDen);
    const quarterCount = Math.max(1, Math.round(beatsPerBar));
    const events = [];
    for (let i = 0; i < quarterCount; i++) {
      events.push(this.syncEventFromSource({
        beat: i + 1,
        isRest: true,
        duration: "q",
        isDotted: false
      }));
    }

    const newMeasure = {
      measure: this.selectedMeasureIdx + 2,
      clef: "treble",
      notationMode: "standard",
      timeSignature: tsStr,
      chordName: null,
      events
    };

    this.exercise.measures.splice(this.selectedMeasureIdx + 1, 0, newMeasure);
    this.selectedMeasureIdx = this.selectedMeasureIdx + 1;
    this.selectedEventIdx = 0;
    this.commitChanges();
  }

  duplicateSelectedMeasure() {
    if (!this.exercise || !this.exercise.measures) return;
    const m = this.exercise.measures[this.selectedMeasureIdx];
    if (!m) return;
    this.notifyBeforeMutate("Duplicate Bar");
    const clonedMeasure = JSON.parse(JSON.stringify(m));
    clonedMeasure.events.forEach(ev => this.syncEventFromSource(ev));
    this.exercise.measures.splice(this.selectedMeasureIdx + 1, 0, clonedMeasure);
    this.selectedMeasureIdx = this.selectedMeasureIdx + 1;
    this.selectedEventIdx = 0;
    this.commitChanges();
  }

  deleteSelectedMeasure() {
    if (!this.exercise || !this.exercise.measures || this.exercise.measures.length <= 1) return;
    this.notifyBeforeMutate("Delete Bar");
    this.exercise.measures.splice(this.selectedMeasureIdx, 1);
    this.selectedMeasureIdx = Math.max(0, Math.min(this.selectedMeasureIdx, this.exercise.measures.length - 1));
    this.selectedEventIdx = 0;
    this.commitChanges();
  }

  addMeasure() {
    this.insertMeasureAfter();
  }

  deleteMeasure() {
    this.deleteSelectedMeasure();
  }

  renderPalette() {
    if (!this.hostEl || !this.exercise) return;
    if (!this.paletteEl) {
      this.paletteEl = document.createElement("div");
      this.paletteEl.className = "notation-editor-palette admin-only-control";
      this.paletteEl.id = "notation-editor-palette";
      this.hostEl.prepend(this.paletteEl);
    }

    const measures = this.exercise.measures || [];
    const curMeasure = measures[this.selectedMeasureIdx] || measures[0];
    const ev = this.getActiveEvent();
    const ts = this.exercise.timeSignature || [4, 4];
    const tsNum = Array.isArray(ts) ? (ts[0] || 4) : 4;
    const tsDen = Array.isArray(ts) ? (ts[1] || 4) : 4;
    const tsStr = `${tsNum}/${tsDen}`;
    const expectedBeats = tsNum * (4 / tsDen);
    const curBeatsSum = curMeasure
      ? (curMeasure.events || []).reduce((s, x) => s + (Number(x.durationBeats) || 1), 0)
      : 0;
    const isMathOk = Math.abs(curBeatsSum - expectedBeats) < 0.05;

    const curDur = ev ? (ev.duration || "q") : "q";
    const isRest = Boolean(ev && ev.isRest);
    const isDotted = Boolean(ev && ev.isDotted);
    const isTied = Boolean(ev && ev.tieToNext);
    const curStr = ev && typeof ev.string === "number" ? ev.string : 1;
    const curFret = ev && typeof ev.fret === "number" ? ev.fret : 0;
    const derived = (!isRest && ev)
      ? deriveGuitarNoteFromPosition(curStr, curFret, Boolean(ev.preferFlat))
      : null;
    const isBlackKey = Boolean(derived && derived.isBlackKey);
    const preferFlat = Boolean(derived && derived.preferFlat);
    const curPick = ev && ev.pick === "Up" ? "Up" : "Down";
    const curFinger = ev && ev.finger !== null && ev.finger !== undefined ? ev.finger : 0;
    const curChord = ev ? (ev.chordChange || (this.selectedEventIdx === 0 && curMeasure ? curMeasure.chordName : "") || "") : "";
    const curBpm = this.exercise.defaultBpm || this.exercise.bpm || 60;
    const pitchSummary = ev
      ? (isRest ? "Rest" : `${derived.concertPitch} (${derived.displayName}) · S${derived.string} F${derived.fret}`)
      : "No Selection";

    const commonChords = ["", "C", "G", "G7", "D", "D7", "Am", "Em", "E", "E7", "A", "A7", "F", "Dm", "Dm7", "C7", "B7", "F#m", "Bm"];

    this.paletteEl.innerHTML = `
      <div class="ne-header-row">
        <div class="ne-bar-tabs">
          <span class="ne-kicker">NOTE EDITOR</span>
          ${measures.map((m, idx) => `
            <button type="button" class="ne-bar-pill ${idx === this.selectedMeasureIdx ? "active" : ""}" data-ne-bar="${idx}">Bar ${idx + 1}</button>
          `).join("")}
        </div>
        <div class="ne-header-meta">
          <div class="ne-meter-cluster" title="Exercise Time Signature">
            <span class="ne-lbl">Meter</span>
            <select class="ne-select-sm" id="ne-meter-select">
              <option value="4/4" ${tsStr === "4/4" ? "selected" : ""}>4/4</option>
              <option value="3/4" ${tsStr === "3/4" ? "selected" : ""}>3/4</option>
              <option value="2/4" ${tsStr === "2/4" ? "selected" : ""}>2/4</option>
              <option value="6/8" ${tsStr === "6/8" ? "selected" : ""}>6/8</option>
            </select>
          </div>
          <div class="ne-bpm-cluster" title="Exercise Default Tempo BPM">
            <span class="ne-lbl">BPM</span>
            <input type="number" id="ne-bpm-input" class="ne-input-sm mono-font" min="30" max="240" value="${curBpm}">
          </div>
          <span class="ne-beat-counter ${isMathOk ? "is-ok" : "is-warn"}" title="Total beats in Bar ${this.selectedMeasureIdx + 1} vs Time Signature">
            ${Number(curBeatsSum.toFixed(2))} / ${Number(expectedBeats.toFixed(2))} beats
          </span>
          <span class="ne-sel-readout">${pitchSummary}</span>
          <button type="button" class="micro-pill ne-shorthand-toggle ${this.shorthandOpen ? "active" : ""}" id="ne-btn-shorthand">Quick Shorthand</button>
          <button type="button" class="micro-pill" id="ne-btn-close">Done</button>
        </div>
      </div>

      <div class="ne-tools-row">
        <div class="ne-group" role="group" aria-label="Note Duration">
          ${EDITOR_DURATIONS.map(d => `
            <button type="button" class="ne-sym-btn ${curDur === d.vexDur ? "active" : ""}" data-ne-dur="${d.code}" title="${d.label} (${d.beats} beats)">
              <span class="ne-glyph">${d.glyph}</span>
              <span class="ne-sub">${d.code}</span>
            </button>
          `).join("")}
        </div>

        <div class="ne-group" role="group" aria-label="Rests, Dots, Ties and Enharmonic Spelling">
          <button type="button" class="ne-sym-btn ${isRest ? "active" : ""}" id="ne-btn-rest" title="Toggle Rest">${SVG_REST} <span>Rest</span></button>
          <button type="button" class="ne-sym-btn ${isDotted ? "active" : ""}" id="ne-btn-dot" title="Toggle Dotted Note">${SVG_DOT} <span>Dot</span></button>
          <button type="button" class="ne-sym-btn ${isTied ? "active" : ""}" id="ne-btn-tie" title="Tie to Next Note">${SVG_TIE} <span>Tie</span></button>
          <span class="ne-lbl" style="margin-left:4px;">Spell</span>
          <button type="button" class="ne-sym-btn ${isBlackKey && !preferFlat ? "active" : ""}" id="ne-spell-sharp" data-ne-spell="sharp" ${!isBlackKey ? "disabled" : ""} title="${isBlackKey ? "Spell chromatic fret as Sharp (♯)" : "Natural fret — never takes sharp or flat"}">&#9839;</button>
          <button type="button" class="ne-sym-btn ${isBlackKey && preferFlat ? "active" : ""}" id="ne-spell-flat" data-ne-spell="flat" ${!isBlackKey ? "disabled" : ""} title="${isBlackKey ? "Spell chromatic fret as Flat (♭)" : "Natural fret — never takes sharp or flat"}">&#9837;</button>
        </div>

        <div class="ne-group" role="group" aria-label="Chord Symbol Tag">
          <span class="ne-lbl">Chord</span>
          <select class="ne-select-sm ne-chord-select" id="ne-chord-select" title="Attach chord symbol above active note">
            <option value="">-- None --</option>
            ${commonChords.filter(Boolean).map(c => `
              <option value="${c}" ${curChord === c ? "selected" : ""}>${c}</option>
            `).join("")}
            ${curChord && !commonChords.includes(curChord) ? `<option value="${curChord}" selected>${curChord}</option>` : ""}
          </select>
          <input type="text" class="ne-input-sm ne-chord-input mono-font" id="ne-chord-input" placeholder="Custom" value="${curChord}" maxlength="8" title="Type custom chord symbol and press Enter">
          <button type="button" class="ne-num-btn" id="ne-btn-clear-chord" title="Clear Chord" ${!curChord ? "disabled" : ""}>&times;</button>
        </div>
      </div>

      <div class="ne-tools-row">
        <div class="ne-group" role="group" aria-label="String Selector">
          <span class="ne-lbl">String</span>
          ${[1, 2, 3, 4, 5, 6].map(s => `
            <button type="button" class="ne-num-btn ${!isRest && curStr === s ? "active" : ""}" data-ne-str="${s}">${s}</button>
          `).join("")}
        </div>

        <div class="ne-group" role="group" aria-label="Fret Stepper">
          <span class="ne-lbl">Fret</span>
          <button type="button" class="ne-num-btn" id="ne-fret-dec" title="Decrease Fret (same string)">${SVG_MINUS}</button>
          <span class="ne-fret-val" id="ne-fret-val" title="Use 0-9 number keys while note is selected">${isRest ? "-" : curFret}</span>
          <button type="button" class="ne-num-btn" id="ne-fret-inc" title="Increase Fret (same string)">${SVG_PLUS}</button>
        </div>

        <div class="ne-group" role="group" aria-label="Staff Pitch Step">
          <span class="ne-lbl">Pitch</span>
          <button type="button" class="ne-num-btn" id="ne-pitch-down" title="Step Pitch Down (↓)">${SVG_ARROW_DOWN}</button>
          <button type="button" class="ne-num-btn" id="ne-pitch-up" title="Step Pitch Up (↑)">${SVG_ARROW_UP}</button>
        </div>

        <div class="ne-group" role="group" aria-label="Pick Stroke">
          <span class="ne-lbl">Pick</span>
          <button type="button" class="ne-sym-btn ${curPick === "Down" ? "active" : ""}" data-ne-pick="Down">${SVG_ARROW_DOWN} <span>Down</span></button>
          <button type="button" class="ne-sym-btn ${curPick === "Up" ? "active" : ""}" data-ne-pick="Up">${SVG_ARROW_UP} <span>Up</span></button>
        </div>

        <div class="ne-group" role="group" aria-label="Left Hand Finger">
          <span class="ne-lbl">Finger</span>
          ${[0, 1, 2, 3, 4].map(f => `
            <button type="button" class="ne-num-btn ${!isRest && curFinger === f ? "active" : ""}" data-ne-finger="${f}">${f}</button>
          `).join("")}
        </div>
      </div>

      <div class="ne-tools-row">
        <div class="ne-group" role="group" aria-label="Note Actions">
          <button type="button" class="ne-action-btn" id="ne-btn-add-note" title="Add note after currently selected note">+ Add Note After</button>
          <button type="button" class="ne-action-btn" id="ne-btn-backspace" title="Convert note to Rest of exact same duration (Backspace)">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="btn-icon"><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path><line x1="18" y1="9" x2="12" y2="15"></line><line x1="12" y1="9" x2="18" y2="15"></line></svg>
            Rest
          </button>
          <button type="button" class="ne-action-btn is-danger" id="ne-btn-del-note" title="Delete note/rest completely from measure (Delete)">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="btn-icon"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            Del Note
          </button>
        </div>

        <div class="ne-group" role="group" aria-label="Measure Actions">
          <button type="button" class="ne-action-btn" id="ne-btn-insert-bar-after" title="Insert a new empty measure after active bar">+ Insert Bar After</button>
          <button type="button" class="ne-action-btn" id="ne-btn-dup-bar" title="Duplicate currently selected measure">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="btn-icon"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            Duplicate Bar
          </button>
          <button type="button" class="ne-action-btn is-danger" id="ne-btn-del-bar" ${measures.length <= 1 ? "disabled" : ""} title="Delete entire currently selected measure">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="btn-icon"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            Delete Bar
          </button>
          <button type="button" class="ne-action-btn is-danger ne-delete-ex-btn" id="ne-btn-delete-exercise" title="Delete entire current exercise">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="btn-icon"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            Delete Exercise
          </button>
        </div>
      </div>

      <div class="ne-shorthand-row" ${this.shorthandOpen ? "" : "hidden"}>
        <span class="ne-lbl">Quick Shorthand (Str:Fret/Dur, use | between bars)</span>
        <input type="text" class="ne-shorthand-input" id="ne-shorthand-input" value="${this.formatExerciseShorthand().replace(/"/g, "&quot;")}" placeholder="e.g. 3:0/h 3:2/h | 3:0/q 3:0/q 3:0/h | 3:2/q 3:2/q 3:2/h">
        <button type="button" class="micro-pill pdf-ai-primary-sm" id="ne-btn-apply-shorthand">Apply Shorthand</button>
      </div>
    `;

    this._bindPaletteEvents();
  }

  _bindPaletteEvents() {
    if (!this.paletteEl) return;

    this.paletteEl.querySelectorAll("[data-ne-bar]").forEach(btn => {
      btn.addEventListener("click", () => {
        const b = parseInt(btn.dataset.neBar, 10);
        this.selectNote(b, 0, 0);
        this.notifyFeedbackSelection();
      });
    });

    const meterSelect = this.paletteEl.querySelector("#ne-meter-select");
    if (meterSelect) {
      meterSelect.addEventListener("change", () => this.setTimeSignature(meterSelect.value));
    }

    const bpmInput = this.paletteEl.querySelector("#ne-bpm-input");
    if (bpmInput) {
      bpmInput.addEventListener("change", () => this.setDefaultBpm(bpmInput.value));
      bpmInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          this.setDefaultBpm(bpmInput.value);
        }
      });
    }

    this.paletteEl.querySelectorAll("[data-ne-dur]").forEach(btn => {
      btn.addEventListener("click", () => this.setDurationCode(btn.dataset.neDur));
    });

    const btnRest = this.paletteEl.querySelector("#ne-btn-rest");
    if (btnRest) btnRest.addEventListener("click", () => this.toggleRest());

    const btnDot = this.paletteEl.querySelector("#ne-btn-dot");
    if (btnDot) btnDot.addEventListener("click", () => this.toggleDotted());

    const btnTie = this.paletteEl.querySelector("#ne-btn-tie");
    if (btnTie) btnTie.addEventListener("click", () => this.toggleTieToNext());

    this.paletteEl.querySelectorAll("[data-ne-spell]").forEach(btn => {
      btn.addEventListener("click", () => this.setEnharmonicFlat(btn.dataset.neSpell === "flat"));
    });

    const chordSelect = this.paletteEl.querySelector("#ne-chord-select");
    const chordInput = this.paletteEl.querySelector("#ne-chord-input");
    const btnClearChord = this.paletteEl.querySelector("#ne-btn-clear-chord");
    if (chordSelect) {
      chordSelect.addEventListener("change", () => {
        const val = chordSelect.value;
        if (chordInput) chordInput.value = val;
        this.setChordSymbol(val);
      });
    }
    if (chordInput) {
      chordInput.addEventListener("change", () => this.setChordSymbol(chordInput.value));
      chordInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          this.setChordSymbol(chordInput.value);
        }
      });
    }
    if (btnClearChord) {
      btnClearChord.addEventListener("click", () => {
        if (chordInput) chordInput.value = "";
        if (chordSelect) chordSelect.value = "";
        this.setChordSymbol("");
      });
    }

    this.paletteEl.querySelectorAll("[data-ne-str]").forEach(btn => {
      btn.addEventListener("click", () => {
        const ev = this.getActiveEvent();
        const curF = ev && typeof ev.fret === "number" ? ev.fret : 0;
        this.setStringAndFret(parseInt(btn.dataset.neStr, 10), curF);
      });
    });

    const btnFretDec = this.paletteEl.querySelector("#ne-fret-dec");
    if (btnFretDec) {
      btnFretDec.addEventListener("click", () => this.stepFret(-1));
    }

    const btnFretInc = this.paletteEl.querySelector("#ne-fret-inc");
    if (btnFretInc) {
      btnFretInc.addEventListener("click", () => this.stepFret(1));
    }

    const btnPitchUp = this.paletteEl.querySelector("#ne-pitch-up");
    if (btnPitchUp) btnPitchUp.addEventListener("click", () => this.stepPitch(1));

    const btnPitchDown = this.paletteEl.querySelector("#ne-pitch-down");
    if (btnPitchDown) btnPitchDown.addEventListener("click", () => this.stepPitch(-1));

    this.paletteEl.querySelectorAll("[data-ne-pick]").forEach(btn => {
      btn.addEventListener("click", () => {
        this.mutateActiveEvent("Set Pick Direction", ev => {
          ev.pick = btn.dataset.nePick;
        });
      });
    });

    this.paletteEl.querySelectorAll("[data-ne-finger]").forEach(btn => {
      btn.addEventListener("click", () => {
        this.mutateActiveEvent("Set Left Hand Finger", ev => {
          ev.finger = parseInt(btn.dataset.neFinger, 10);
        });
      });
    });

    const btnAddNote = this.paletteEl.querySelector("#ne-btn-add-note");
    if (btnAddNote) btnAddNote.addEventListener("click", () => this.addNoteAfterSelected());

    const btnBackspace = this.paletteEl.querySelector("#ne-btn-backspace");
    if (btnBackspace) btnBackspace.addEventListener("click", () => this.smartBackspace());

    const btnDelNote = this.paletteEl.querySelector("#ne-btn-del-note");
    if (btnDelNote) btnDelNote.addEventListener("click", () => this.smartDelete());

    const btnInsertBarAfter = this.paletteEl.querySelector("#ne-btn-insert-bar-after");
    if (btnInsertBarAfter) btnInsertBarAfter.addEventListener("click", () => this.insertMeasureAfter());

    const btnDupBar = this.paletteEl.querySelector("#ne-btn-dup-bar");
    if (btnDupBar) btnDupBar.addEventListener("click", () => this.duplicateSelectedMeasure());

    const btnDelBar = this.paletteEl.querySelector("#ne-btn-del-bar");
    if (btnDelBar) btnDelBar.addEventListener("click", () => this.deleteSelectedMeasure());

    const btnDeleteEx = this.paletteEl.querySelector("#ne-btn-delete-exercise");
    if (btnDeleteEx) {
      btnDeleteEx.addEventListener("click", () => {
        if (!this.exercise) return;
        const exId = this.exercise.id;
        this.close(false);
        if (typeof this.onDeleteExercise === "function") {
          this.onDeleteExercise(exId);
        }
      });
    }

    const btnShortToggle = this.paletteEl.querySelector("#ne-btn-shorthand");
    if (btnShortToggle) {
      btnShortToggle.addEventListener("click", () => {
        this.shorthandOpen = !this.shorthandOpen;
        this.renderPalette();
      });
    }

    const btnApplyShort = this.paletteEl.querySelector("#ne-btn-apply-shorthand");
    const shortInput = this.paletteEl.querySelector("#ne-shorthand-input");
    if (btnApplyShort && shortInput) {
      btnApplyShort.addEventListener("click", () => this.applyQuickShorthand(shortInput.value));
      shortInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          this.applyQuickShorthand(shortInput.value);
        }
      });
    }

    const btnClose = this.paletteEl.querySelector("#ne-btn-close");
    if (btnClose) {
      btnClose.addEventListener("click", () => {
        this.close();
        if (typeof this.onSelectNoteForFeedback === "function") {
          this.onSelectNoteForFeedback(null, null, false);
        }
      });
    }
  }
}
