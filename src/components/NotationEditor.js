/**
 * <NotationEditor /> — Visual Notei.co-Style Music & Guitar TAB Editor
 * ----------------------------------------------------------------------
 * Renders an inline editorial symbol palette above an exercise's VexFlow stave
 * when Admin Mode is active. Every edit keeps Treble Staff pitch, Guitar TAB
 * string/fret, rhythm durations, rests, dots, ties, pick strokes, and fingers
 * 100% synchronized, immediately re-rendering ScoreRenderer and auto-saving.
 */

const EDITOR_OPEN_MIDI = { 1: 64, 2: 59, 3: 55, 4: 50, 5: 45, 6: 40 };
const EDITOR_SHARP_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const EDITOR_NOTE_SEMITONES = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

const EDITOR_DURATIONS = [
  { code: "w", vexDur: "w", beats: 4, symbol: "1/1", label: "Whole", glyph: "&#119133;" },
  { code: "h", vexDur: "h", beats: 2, symbol: "1/2", label: "Half", glyph: "&#119134;" },
  { code: "q", vexDur: "q", beats: 1, symbol: "1/4", label: "Quarter", glyph: "&#119135;" },
  { code: "e", vexDur: "8", beats: 0.5, symbol: "1/8", label: "Eighth", glyph: "&#119136;" },
  { code: "16", vexDur: "16", beats: 0.25, symbol: "1/16", label: "16th", glyph: "&#119137;" }
];

function editorMidiToInfo(midi, forcedAccidental = null, forcedLetterOct = null) {
  const clamped = Math.max(40, Math.min(88, Math.round(midi)));
  if (forcedLetterOct) {
    const { letter, oct, acc } = forcedLetterOct;
    const displayName = letter === "E" && !acc && oct >= 4
      ? "High E"
      : (letter === "E" && !acc && oct <= 2 ? "Low E" : `${letter}${acc || ""}`);
    return {
      concertPitch: `${letter}${acc || ""}${oct}`,
      vexKey: `${letter.toLowerCase()}${acc || ""}/${oct + 1}`,
      accidental: acc || null,
      displayName
    };
  }
  const oct = Math.floor(clamped / 12) - 1;
  const name = EDITOR_SHARP_NAMES[clamped % 12];
  const acc = name.includes("#") ? "#" : (forcedAccidental === "n" ? "n" : null);
  const letter = name[0];
  let displayName = name;
  if (name === "E" && oct >= 4) displayName = "High E";
  if (name === "E" && oct <= 2) displayName = "Low E";
  return {
    concertPitch: `${name}${oct}`,
    vexKey: `${letter.toLowerCase()}${acc && acc !== "n" ? acc : ""}/${oct + 1}`,
    accidental: acc,
    displayName
  };
}

function editorPitchToMidi(concertPitch) {
  const m = String(concertPitch || "").trim().match(/^([A-Ga-g])(#|b|n)?(\d)$/);
  if (!m) return 64;
  const base = EDITOR_NOTE_SEMITONES[m[1].toUpperCase()];
  if (base === undefined) return 64;
  const acc = m[2] === "#" ? 1 : (m[2] === "b" ? -1 : 0);
  const oct = parseInt(m[3], 10);
  return (oct + 1) * 12 + base + acc;
}

function findBestPositionForMidi(midi, preferredString = null) {
  if (preferredString >= 1 && preferredString <= 6) {
    const f = midi - EDITOR_OPEN_MIDI[preferredString];
    if (f >= 0 && f <= 12) {
      return { string: preferredString, fret: f };
    }
  }
  // Prefer open position (frets 0..4) across strings 1..6 cleanly
  for (let s = 1; s <= 6; s++) {
    const f = midi - EDITOR_OPEN_MIDI[s];
    if (f >= 0 && f <= 4) {
      return { string: s, fret: f };
    }
  }
  let best = { string: 1, fret: 0, dist: 999 };
  for (let s = 1; s <= 6; s++) {
    const f = midi - EDITOR_OPEN_MIDI[s];
    if (f >= 0 && f <= 20 && f < best.dist) {
      best = { string: s, fret: f, dist: f };
    }
  }
  return { string: best.string, fret: best.fret };
}

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
  constructor({ onCommitExercise, onSelectNoteForFeedback, onAddSubExercise } = {}) {
    this.onCommitExercise = onCommitExercise || null;
    this.onSelectNoteForFeedback = onSelectNoteForFeedback || null;
    this.onAddSubExercise = onAddSubExercise || null;

    this.exercise = null;
    this.hostEl = null;
    this.paletteEl = null;
    this.selectedMeasureIdx = 0;
    this.selectedEventIdx = 0;
    this.shorthandOpen = false;
    this._fretDigitBuffer = "";
    this._fretDigitTimer = null;
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

  ensureCanonicalMeasures(ex) {
    if (!ex) return;
    if (Array.isArray(ex.measures) && ex.measures.length > 0) {
      ex.measures.forEach((m, idx) => {
        if (!m.measure) m.measure = idx + 1;
        if (!Array.isArray(m.events)) m.events = [];
        m.events.forEach(ev => {
          if (ev.isRest) {
            ev.vexDuration = ev.vexDuration || `${ev.duration || "q"}r`;
          } else {
            if (typeof ev.string === "number" && (ev.fret === null || ev.fret === undefined)) ev.fret = 0;
            if (typeof ev.string === "number" && !ev.concertPitch) {
              const info = editorMidiToInfo(EDITOR_OPEN_MIDI[ev.string] + (ev.fret || 0));
              ev.concertPitch = info.concertPitch;
              ev.vexKey = ev.vexKey || info.vexKey;
              ev.note = ev.note || info.displayName;
            }
            if (!Array.isArray(ev.positions) || ev.positions.length === 0) {
              ev.positions = typeof ev.string === "number" ? [{ str: ev.string, fret: ev.fret || 0 }] : [];
            }
          }
        });
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

        const { spec, durationBeats, symbol } = editorDurSpec(code, dotted);
        if (b.type === "rest") {
          events.push({
            beat: b.beat || (bIdx + 1),
            tabBeatIndex: bIdx,
            isRest: true,
            type: "rest",
            note: "REST",
            concertPitch: null,
            vexKey: spec.vexDur === "w" ? "d/5" : "b/4",
            accidental: null,
            duration: spec.vexDur,
            isDotted: dotted,
            vexDuration: `${spec.vexDur}r`,
            durationBeats,
            symbol: "REST",
            string: null,
            fret: null,
            finger: null,
            pick: "-",
            positions: []
          });
        } else {
          const str = typeof b.string === "number" ? b.string : 1;
          const fret = typeof b.fret === "number" ? b.fret : 0;
          const info = editorMidiToInfo(EDITOR_OPEN_MIDI[str] + fret);
          events.push({
            beat: b.beat || (bIdx + 1),
            tabBeatIndex: bIdx,
            isRest: false,
            isChord: false,
            type: "play",
            note: b.note || info.displayName,
            concertPitch: b.concertPitch || info.concertPitch,
            vexKey: b.vexKey || info.vexKey,
            accidental: info.accidental,
            duration: spec.vexDur,
            isDotted: dotted,
            vexDuration: spec.vexDur,
            durationBeats,
            symbol,
            string: str,
            fret,
            finger: b.finger !== undefined && b.finger !== null ? b.finger : (fret === 0 ? 0 : Math.min(4, fret)),
            pick: isLeadingTie ? "-" : (b.pick || "Down"),
            positions: [{ str, fret }],
            tieFromPrev: isLeadingTie || Boolean(b.tieFromPrev),
            tieToNext: Boolean(b.tieToNext),
            tip: `String ${str}, Fret ${fret}`
          });
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

      const sf = head.match(/^([1-6]):(\d{1,2})$/);
      const str = sf ? parseInt(sf[1], 10) : 1;
      const fret = sf ? Math.max(0, Math.min(22, parseInt(sf[2], 10))) : 0;
      const info = editorMidiToInfo(EDITOR_OPEN_MIDI[str] + fret);
      newEvents.push({
        beat: 1,
        isRest: false,
        isChord: false,
        type: "play",
        note: info.displayName,
        concertPitch: info.concertPitch,
        vexKey: info.vexKey,
        accidental: info.accidental,
        duration: spec.vexDur,
        isDotted,
        vexDuration: spec.vexDur,
        durationBeats,
        symbol,
        string: str,
        fret,
        finger: fret === 0 ? 0 : Math.min(4, fret),
        pick,
        positions: [{ str, fret }],
        tieToNext,
        tieFromPrev: false,
        tip: `String ${str}, Fret ${fret}`
      });
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

  mutateActiveEvent(fn) {
    const ev = this.getActiveEvent();
    if (!ev) return;
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
    if (isNaN(parsed) || parsed > 15) {
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

  setDurationCode(code) {
    this.mutateActiveEvent(ev => {
      const { spec, durationBeats, symbol } = editorDurSpec(code, Boolean(ev.isDotted));
      ev.duration = spec.vexDur;
      ev.durationBeats = durationBeats;
      ev.symbol = ev.isRest ? "REST" : symbol;
      ev.vexDuration = ev.isRest ? `${spec.vexDur}r` : spec.vexDur;
    });
  }

  toggleRest() {
    this.mutateActiveEvent(ev => {
      ev.isRest = !ev.isRest;
      if (ev.isRest) {
        ev.note = "REST";
        ev.vexDuration = `${ev.duration || "q"}r`;
        ev.symbol = "REST";
        ev.positions = [];
      } else {
        const str = typeof ev.string === "number" ? ev.string : 1;
        const fret = typeof ev.fret === "number" ? ev.fret : 0;
        const info = editorMidiToInfo(EDITOR_OPEN_MIDI[str] + fret);
        ev.string = str;
        ev.fret = fret;
        ev.finger = fret === 0 ? 0 : Math.min(4, fret);
        ev.concertPitch = info.concertPitch;
        ev.vexKey = info.vexKey;
        ev.accidental = info.accidental;
        ev.note = info.displayName;
        ev.vexDuration = ev.duration || "q";
        ev.pick = ev.pick && ev.pick !== "-" ? ev.pick : "Down";
        ev.positions = [{ str, fret }];
        const { symbol } = editorDurSpec(ev.duration || "q", Boolean(ev.isDotted));
        ev.symbol = symbol;
      }
    });
  }

  toggleDotted() {
    this.mutateActiveEvent(ev => {
      ev.isDotted = !ev.isDotted;
      const { durationBeats, symbol } = editorDurSpec(ev.duration || "q", ev.isDotted);
      ev.durationBeats = durationBeats;
      ev.symbol = ev.isRest ? "REST" : symbol;
    });
  }

  toggleTieToNext() {
    const measures = this.exercise && this.exercise.measures;
    const m = measures && measures[this.selectedMeasureIdx];
    const ev = this.getActiveEvent();
    if (!m || !ev || ev.isRest) return;
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

  applyAccidental(accType) {
    this.mutateActiveEvent(ev => {
      if (ev.isRest) ev.isRest = false;
      const m = String(ev.concertPitch || "E4").match(/^([A-Ga-g])(#|b|n)?(\d)$/);
      const letter = m ? m[1].toUpperCase() : "E";
      const oct = m ? parseInt(m[3], 10) : 4;
      const baseMidi = (oct + 1) * 12 + (EDITOR_NOTE_SEMITONES[letter] || 0);
      const offset = accType === "#" ? 1 : (accType === "b" ? -1 : 0);
      const newMidi = Math.max(40, Math.min(84, baseMidi + offset));
      const pos = findBestPositionForMidi(newMidi, ev.string);
      const acc = accType === "#" || accType === "b" ? accType : null;
      const info = editorMidiToInfo(newMidi, accType, { letter, oct, acc: accType === "n" ? "n" : acc });
      ev.string = pos.string;
      ev.fret = pos.fret;
      ev.finger = pos.fret === 0 ? 0 : Math.min(4, pos.fret);
      ev.concertPitch = `${letter}${acc || ""}${oct}`;
      ev.vexKey = info.vexKey;
      ev.accidental = accType === "n" ? "n" : acc;
      ev.note = info.displayName;
      ev.positions = [{ str: pos.string, fret: pos.fret }];
    });
  }

  setStringAndFret(strVal, fretVal) {
    this.mutateActiveEvent(ev => {
      const str = Math.max(1, Math.min(6, parseInt(strVal, 10) || 1));
      const fret = Math.max(0, Math.min(22, parseInt(fretVal, 10) || 0));
      const midi = EDITOR_OPEN_MIDI[str] + fret;
      const info = editorMidiToInfo(midi);
      ev.isRest = false;
      ev.string = str;
      ev.fret = fret;
      ev.finger = fret === 0 ? 0 : Math.min(4, fret);
      ev.concertPitch = info.concertPitch;
      ev.vexKey = info.vexKey;
      ev.accidental = info.accidental;
      ev.note = info.displayName;
      ev.vexDuration = ev.duration || "q";
      ev.pick = ev.pick && ev.pick !== "-" ? ev.pick : "Down";
      ev.positions = [{ str, fret }];
      const { symbol } = editorDurSpec(ev.duration || "q", Boolean(ev.isDotted));
      ev.symbol = symbol;
    });
  }

  stepPitch(deltaSemitones) {
    this.mutateActiveEvent(ev => {
      if (ev.isRest) ev.isRest = false;
      const curMidi = (typeof ev.string === "number" && typeof ev.fret === "number")
        ? (EDITOR_OPEN_MIDI[ev.string] + ev.fret)
        : editorPitchToMidi(ev.concertPitch);
      const nextMidi = Math.max(40, Math.min(84, curMidi + deltaSemitones));
      const pos = findBestPositionForMidi(nextMidi, ev.string);
      const info = editorMidiToInfo(nextMidi);
      ev.string = pos.string;
      ev.fret = pos.fret;
      ev.finger = pos.fret === 0 ? 0 : Math.min(4, pos.fret);
      ev.concertPitch = info.concertPitch;
      ev.vexKey = info.vexKey;
      ev.accidental = info.accidental;
      ev.note = info.displayName;
      ev.vexDuration = ev.duration || "q";
      ev.positions = [{ str: pos.string, fret: pos.fret }];
      const { symbol } = editorDurSpec(ev.duration || "q", Boolean(ev.isDotted));
      ev.symbol = symbol;
    });
  }

  addNoteAfterSelected() {
    if (!this.exercise || !this.exercise.measures) return;
    const m = this.exercise.measures[this.selectedMeasureIdx];
    if (!m) return;
    const cur = this.getActiveEvent();
    const str = cur && typeof cur.string === "number" ? cur.string : 1;
    const fret = cur && typeof cur.fret === "number" ? cur.fret : 0;
    const info = editorMidiToInfo(EDITOR_OPEN_MIDI[str] + fret);
    const { spec, durationBeats, symbol } = editorDurSpec(cur ? cur.duration : "q", false);

    const newEv = {
      beat: 1,
      isRest: false,
      isChord: false,
      type: "play",
      note: info.displayName,
      concertPitch: info.concertPitch,
      vexKey: info.vexKey,
      accidental: info.accidental,
      duration: spec.vexDur,
      isDotted: false,
      vexDuration: spec.vexDur,
      durationBeats,
      symbol,
      string: str,
      fret,
      finger: fret === 0 ? 0 : Math.min(4, fret),
      pick: cur && cur.pick === "Down" ? "Up" : "Down",
      positions: [{ str, fret }],
      tieToNext: false,
      tieFromPrev: false,
      tip: `String ${str}, Fret ${fret}`
    };

    const insertIdx = Math.min(m.events.length, this.selectedEventIdx + 1);
    m.events.splice(insertIdx, 0, newEv);
    this.selectedEventIdx = insertIdx;
    this.commitChanges();
  }

  deleteSelectedNote() {
    if (!this.exercise || !this.exercise.measures) return;
    const m = this.exercise.measures[this.selectedMeasureIdx];
    if (!m || !Array.isArray(m.events)) return;
    if (m.events.length <= 1) {
      // Turn single remaining slot into a Whole Rest so the measure remains valid
      const ev = m.events[0];
      if (ev) {
        ev.isRest = true;
        ev.duration = "w";
        ev.durationBeats = 4;
        ev.isDotted = false;
        ev.vexDuration = "wr";
        ev.symbol = "REST";
      }
      this.selectedEventIdx = 0;
    } else {
      m.events.splice(this.selectedEventIdx, 1);
      this.selectedEventIdx = Math.max(0, Math.min(this.selectedEventIdx, m.events.length - 1));
    }
    this.commitChanges();
  }

  addMeasure() {
    if (!this.exercise || !this.exercise.measures) return;
    const ts = this.exercise.timeSignature || [4, 4];
    const tsNum = Array.isArray(ts) ? ts[0] : 4;
    const tsDen = Array.isArray(ts) ? ts[1] : 4;
    const tsStr = `${tsNum}/${tsDen}`;
    const beatsPerBar = tsNum * (4 / tsDen);
    const cur = this.getActiveEvent();
    const str = cur && typeof cur.string === "number" ? cur.string : 1;
    const fret = cur && typeof cur.fret === "number" ? cur.fret : 0;
    const info = editorMidiToInfo(EDITOR_OPEN_MIDI[str] + fret);

    const quarterCount = Math.max(1, Math.round(beatsPerBar));
    const events = [];
    for (let i = 0; i < quarterCount; i++) {
      events.push({
        beat: i + 1,
        isRest: false,
        isChord: false,
        type: "play",
        note: info.displayName,
        concertPitch: info.concertPitch,
        vexKey: info.vexKey,
        accidental: info.accidental,
        duration: "q",
        isDotted: false,
        vexDuration: "q",
        durationBeats: 1,
        symbol: "1/4",
        string: str,
        fret,
        finger: fret === 0 ? 0 : Math.min(4, fret),
        pick: i % 2 === 0 ? "Down" : "Up",
        positions: [{ str, fret }],
        tieToNext: false,
        tieFromPrev: false,
        tip: `String ${str}, Fret ${fret}`
      });
    }

    this.exercise.measures.push({
      measure: this.exercise.measures.length + 1,
      clef: "treble",
      notationMode: "standard",
      timeSignature: tsStr,
      chordName: null,
      events
    });
    this.selectedMeasureIdx = this.exercise.measures.length - 1;
    this.selectedEventIdx = 0;
    this.commitChanges();
  }

  deleteMeasure() {
    if (!this.exercise || !this.exercise.measures || this.exercise.measures.length <= 1) return;
    this.exercise.measures.splice(this.selectedMeasureIdx, 1);
    this.selectedMeasureIdx = Math.max(0, Math.min(this.selectedMeasureIdx, this.exercise.measures.length - 1));
    this.selectedEventIdx = 0;
    this.commitChanges();
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
    const expectedBeats = (ts[0] || 4) * (4 / (ts[1] || 4));
    const curBeatsSum = curMeasure
      ? (curMeasure.events || []).reduce((s, x) => s + (Number(x.durationBeats) || 1), 0)
      : 0;
    const isMathOk = Math.abs(curBeatsSum - expectedBeats) < 0.05;

    const curDur = ev ? (ev.duration || "q") : "q";
    const isRest = Boolean(ev && ev.isRest);
    const isDotted = Boolean(ev && ev.isDotted);
    const isTied = Boolean(ev && ev.tieToNext);
    const curAcc = ev ? ev.accidental : null;
    const curStr = ev && typeof ev.string === "number" ? ev.string : 1;
    const curFret = ev && typeof ev.fret === "number" ? ev.fret : 0;
    const curPick = ev && ev.pick === "Up" ? "Up" : "Down";
    const curFinger = ev && ev.finger !== null && ev.finger !== undefined ? ev.finger : 0;
    const pitchSummary = ev
      ? (ev.isRest ? "Rest" : `${ev.concertPitch || ev.note} · S${curStr} F${curFret}`)
      : "No Selection";

    this.paletteEl.innerHTML = `
      <div class="ne-header-row">
        <div class="ne-bar-tabs">
          <span class="ne-kicker">NOTE EDITOR</span>
          ${measures.map((m, idx) => `
            <button type="button" class="ne-bar-pill ${idx === this.selectedMeasureIdx ? "active" : ""}" data-ne-bar="${idx}">Bar ${idx + 1}</button>
          `).join("")}
        </div>
        <div class="ne-header-meta">
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

        <div class="ne-group" role="group" aria-label="Rests, Dots, Ties and Accidentals">
          <button type="button" class="ne-sym-btn ${isRest ? "active" : ""}" id="ne-btn-rest" title="Toggle Rest">&#119101; Rest</button>
          <button type="button" class="ne-sym-btn ${isDotted ? "active" : ""}" id="ne-btn-dot" title="Toggle Dotted Note">&bull; Dot</button>
          <button type="button" class="ne-sym-btn ${isTied ? "active" : ""}" id="ne-btn-tie" title="Tie to Next Note">&#8255; Tie</button>
          <button type="button" class="ne-sym-btn ${curAcc === "#" ? "active" : ""}" data-ne-acc="#" title="Sharp">&#9839;</button>
          <button type="button" class="ne-sym-btn ${curAcc === "b" ? "active" : ""}" data-ne-acc="b" title="Flat">&#9837;</button>
          <button type="button" class="ne-sym-btn ${curAcc === "n" ? "active" : ""}" data-ne-acc="n" title="Natural">&#9838;</button>
        </div>

        <div class="ne-group" role="group" aria-label="Bar Actions">
          <button type="button" class="ne-action-btn" id="ne-btn-add-note">+ Add Note</button>
          <button type="button" class="ne-action-btn is-danger" id="ne-btn-del-note">Delete Note</button>
          <button type="button" class="ne-action-btn" id="ne-btn-add-bar">+ Add Bar</button>
          <button type="button" class="ne-action-btn is-danger" id="ne-btn-del-bar" ${measures.length <= 1 ? "disabled" : ""}>- Delete Bar</button>
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
          <button type="button" class="ne-num-btn" id="ne-fret-dec" title="Decrease Fret">&minus;</button>
          <span class="ne-fret-val" id="ne-fret-val" title="Use 0-15 keyboard number keys while editor is open">${isRest ? "-" : curFret}</span>
          <button type="button" class="ne-num-btn" id="ne-fret-inc" title="Increase Fret">+</button>
        </div>

        <div class="ne-group" role="group" aria-label="Staff Pitch Step">
          <span class="ne-lbl">Pitch</span>
          <button type="button" class="ne-num-btn" id="ne-pitch-down" title="Step Pitch Down (&darr;)">&darr;</button>
          <button type="button" class="ne-num-btn" id="ne-pitch-up" title="Step Pitch Up (&uarr;)">&uarr;</button>
        </div>

        <div class="ne-group" role="group" aria-label="Pick Stroke">
          <span class="ne-lbl">Pick</span>
          <button type="button" class="ne-sym-btn ${curPick === "Down" ? "active" : ""}" data-ne-pick="Down">&darr; Down</button>
          <button type="button" class="ne-sym-btn ${curPick === "Up" ? "active" : ""}" data-ne-pick="Up">&uarr; Up</button>
        </div>

        <div class="ne-group" role="group" aria-label="Left Hand Finger">
          <span class="ne-lbl">Finger</span>
          ${[0, 1, 2, 3, 4].map(f => `
            <button type="button" class="ne-num-btn ${!isRest && curFinger === f ? "active" : ""}" data-ne-finger="${f}">${f}</button>
          `).join("")}
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
        if (typeof this.onSelectNoteForFeedback === "function") {
          const ev = this.getActiveEvent();
          this.onSelectNoteForFeedback(this.selectedMeasureIdx, ev && ev.tabBeatIndex !== undefined ? ev.tabBeatIndex : 0, Boolean(ev && ev.isRest));
        }
      });
    });

    this.paletteEl.querySelectorAll("[data-ne-dur]").forEach(btn => {
      btn.addEventListener("click", () => this.setDurationCode(btn.dataset.neDur));
    });

    const btnRest = this.paletteEl.querySelector("#ne-btn-rest");
    if (btnRest) btnRest.addEventListener("click", () => this.toggleRest());

    const btnDot = this.paletteEl.querySelector("#ne-btn-dot");
    if (btnDot) btnDot.addEventListener("click", () => this.toggleDotted());

    const btnTie = this.paletteEl.querySelector("#ne-btn-tie");
    if (btnTie) btnTie.addEventListener("click", () => this.toggleTieToNext());

    this.paletteEl.querySelectorAll("[data-ne-acc]").forEach(btn => {
      btn.addEventListener("click", () => this.applyAccidental(btn.dataset.neAcc));
    });

    this.paletteEl.querySelectorAll("[data-ne-str]").forEach(btn => {
      btn.addEventListener("click", () => {
        const ev = this.getActiveEvent();
        const curF = ev && typeof ev.fret === "number" ? ev.fret : 0;
        this.setStringAndFret(parseInt(btn.dataset.neStr, 10), curF);
      });
    });

    const btnFretDec = this.paletteEl.querySelector("#ne-fret-dec");
    if (btnFretDec) {
      btnFretDec.addEventListener("click", () => {
        const ev = this.getActiveEvent();
        const s = ev && typeof ev.string === "number" ? ev.string : 1;
        const f = ev && typeof ev.fret === "number" ? ev.fret : 0;
        this.setStringAndFret(s, Math.max(0, f - 1));
      });
    }

    const btnFretInc = this.paletteEl.querySelector("#ne-fret-inc");
    if (btnFretInc) {
      btnFretInc.addEventListener("click", () => {
        const ev = this.getActiveEvent();
        const s = ev && typeof ev.string === "number" ? ev.string : 1;
        const f = ev && typeof ev.fret === "number" ? ev.fret : 0;
        this.setStringAndFret(s, Math.min(22, f + 1));
      });
    }

    const btnPitchUp = this.paletteEl.querySelector("#ne-pitch-up");
    if (btnPitchUp) btnPitchUp.addEventListener("click", () => this.stepPitch(1));

    const btnPitchDown = this.paletteEl.querySelector("#ne-pitch-down");
    if (btnPitchDown) btnPitchDown.addEventListener("click", () => this.stepPitch(-1));

    this.paletteEl.querySelectorAll("[data-ne-pick]").forEach(btn => {
      btn.addEventListener("click", () => {
        this.mutateActiveEvent(ev => {
          ev.pick = btn.dataset.nePick;
        });
      });
    });

    this.paletteEl.querySelectorAll("[data-ne-finger]").forEach(btn => {
      btn.addEventListener("click", () => {
        this.mutateActiveEvent(ev => {
          ev.finger = parseInt(btn.dataset.neFinger, 10);
        });
      });
    });

    const btnAddNote = this.paletteEl.querySelector("#ne-btn-add-note");
    if (btnAddNote) btnAddNote.addEventListener("click", () => this.addNoteAfterSelected());

    const btnDelNote = this.paletteEl.querySelector("#ne-btn-del-note");
    if (btnDelNote) btnDelNote.addEventListener("click", () => this.deleteSelectedNote());

    const btnAddBar = this.paletteEl.querySelector("#ne-btn-add-bar");
    if (btnAddBar) btnAddBar.addEventListener("click", () => this.addMeasure());

    const btnDelBar = this.paletteEl.querySelector("#ne-btn-del-bar");
    if (btnDelBar) btnDelBar.addEventListener("click", () => this.deleteMeasure());

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
