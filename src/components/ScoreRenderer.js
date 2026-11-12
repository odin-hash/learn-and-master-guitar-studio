/**
 * <ScoreRenderer /> — VexFlow 4 Music Engraving & Guitar Tablature Engine
 * ----------------------------------------------------------------------
 * Renders authentic Standard Notation (Treble Clef, Bravura Font, StaveNote,
 * GhostNote, Rests wr/hr/qr/8r, Dot, Beam, Accidental, StaveTie) paired with
 * 6-String TabStave + synchronized playback cursor.
 */

export const GUITAR_OPEN_MIDI = { 1: 64, 2: 59, 3: 55, 4: 50, 5: 45, 6: 40 };
export const GUITAR_SHARP_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
export const GUITAR_FLAT_NAMES = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
export const GUITAR_BLACK_KEY_PCS = new Set([1, 3, 6, 8, 10]);

/**
 * Single source of truth deriving exact pitch, accidental, written VexFlow key,
 * and display name strictly from guitar string (1-6) and fret (0-24).
 */
export function deriveGuitarNoteFromPosition(strVal, fretVal, preferFlat = false) {
  const str = Math.max(1, Math.min(6, parseInt(strVal, 10) || 1));
  const fret = Math.max(0, Math.min(24, parseInt(fretVal, 10) || 0));
  const midi = (GUITAR_OPEN_MIDI[str] || 64) + fret;
  const oct = Math.floor(midi / 12) - 1;
  const pc = ((midi % 12) + 12) % 12;
  const isBlackKey = GUITAR_BLACK_KEY_PCS.has(pc);
  const useFlat = isBlackKey && Boolean(preferFlat);
  const name = (useFlat ? GUITAR_FLAT_NAMES : GUITAR_SHARP_NAMES)[pc];
  const acc = isBlackKey ? (useFlat ? "b" : "#") : null;
  const letter = name[0];
  let displayName = name;
  if (name === "E" && oct >= 4) displayName = "High E";
  if (name === "E" && oct <= 2) displayName = "Low E";
  return {
    string: str,
    fret,
    midi,
    oct,
    isBlackKey,
    preferFlat: useFlat,
    concertPitch: `${name}${oct}`,
    vexKey: `${letter.toLowerCase()}${acc || ""}/${oct + 1}`,
    accidental: acc,
    displayName
  };
}

export class ScoreRenderer {
  constructor(containerElement, onBeatClick = null, onTabPeekToggle = null) {
    this.container = containerElement;
    this.onBeatClick = onBeatClick;
    this.onTabPeekToggle = onTabPeekToggle;
    this.exercise = null;
    this.measures = [];
    this.timeSignature = "4/4";
    this.noteNameMode = "above"; // "off" | "above" | "inside"
    this.tabVisibilityMode = "both"; // "both" | "staff-only" | "blur"
    this.showRhythmGuide = true;
    this.showCoachBanner = true;
    this.showNoteNames = true;
    this.showTabNumbers = true;
    this._tabPeeked = false;
    this.loopMeasureIndex = null;
    this.activeKey = null;
    this._lastRenderWidth = 0;
    this._noteMap = new Map();
    this._measureBounds = new Map();
    this._coachPillEl = null;
    this._lastCoachArgs = null;

    if (typeof ResizeObserver !== "undefined" && this.container) {
      this._ro = new ResizeObserver(() => {
        if (!this.exercise) return;
        const w = this.container.clientWidth || 0;
        if (w > 120 && Math.abs(w - this._lastRenderWidth) > 24) {
          const prevActive = this._lastActiveArgs;
          const prevCoach = this._lastCoachArgs;
          this.render();
          if (prevActive) {
            this.highlightBeat(prevActive.mIdx, prevActive.bIdx, prevActive.isRest, prevCoach);
          }
        }
      });
      this._ro.observe(this.container);
    }
  }

  static getVexFlowStatic() {
    if (typeof window === "undefined") return null;
    if (window.Vex && window.Vex.Flow) return window.Vex.Flow;
    if (window.Vex && window.Vex.Renderer) return window.Vex;
    return null;
  }

  /**
   * Renders an authentic Bravura VexFlow note/rest/tempo icon directly inside any
   * small UI container (eliminating all custom hand-drawn note/rest SVGs).
   */
  static renderInlineBravuraNote(targetEl, { sym = "1/4", dur = 1, isRest = false, color = "#18181B", width = 34, height = 34 } = {}) {
    if (!targetEl) return false;
    const VF = ScoreRenderer.getVexFlowStatic();
    if (!VF) return false;

    targetEl.innerHTML = "";
    try {
      const renderer = new VF.Renderer(targetEl, VF.Renderer.Backends.SVG);
      const scale = 0.62;
      const lw = Math.round(width / scale);
      const lh = Math.round(height / scale);
      renderer.resize(width, height);
      const ctx = renderer.getContext();
      ctx.scale(scale, scale);

      const svg = targetEl.querySelector("svg");
      if (svg) {
        svg.setAttribute("viewBox", `0 0 ${lw} ${lh}`);
        svg.classList.add("vf-mini-glyph");
      }

      const normSym = String(sym || "").toLowerCase();
      let baseDur = "q";
      let isDotted = false;
      if (normSym === "1/1" || dur >= 4) baseDur = "w";
      else if (normSym === "3/4" || dur >= 3) { baseDur = "h"; isDotted = true; }
      else if (normSym === "1/2" || dur >= 2) baseDur = "h";
      else if (normSym === "3/8" || Math.abs((dur || 1) - 1.5) < 0.05) { baseDur = "q"; isDotted = true; }
      else if (normSym === "1/8" || dur <= 0.5) baseDur = "8";

      const staveY = -20;
      const stave = new VF.Stave(0, staveY, lw, {
        spacing_between_lines_px: 10,
        left_bar: false,
        right_bar: false
      });
      if (VF.Barline && VF.Barline.type) {
        stave.setBegBarType(VF.Barline.type.NONE);
        stave.setEndBarType(VF.Barline.type.NONE);
      }
      stave.setNoteStartX(4);

      const duration = isRest ? `${baseDur}r` : baseDur;
      const keys = isRest ? (baseDur === "w" ? ["d/5"] : ["b/4"]) : ["b/4"];

      if (isRest && (baseDur === "w" || baseDur === "h") && svg) {
        const lineY = stave.getYForLine(baseDur === "w" ? 1 : 2);
        const refLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
        refLine.setAttribute("x1", String(Math.round(lw * 0.2)));
        refLine.setAttribute("x2", String(Math.round(lw * 0.8)));
        refLine.setAttribute("y1", String(lineY));
        refLine.setAttribute("y2", String(lineY));
        refLine.setAttribute("stroke", "rgba(113,113,122,0.55)");
        refLine.setAttribute("stroke-width", "1.4");
        svg.appendChild(refLine);
      }

      const notes = [];
      if (!isRest && baseDur === "8") {
        const n1 = new VF.StaveNote({ keys: ["b/4"], duration: "8", stem_direction: 1 });
        const n2 = new VF.StaveNote({ keys: ["b/4"], duration: "8", stem_direction: 1 });
        n1.setStyle({ fillStyle: color, strokeStyle: color });
        n2.setStyle({ fillStyle: color, strokeStyle: color });
        notes.push(n1, n2);
        const beam = new VF.Beam(notes);
        beam.setStyle({ fillStyle: color, strokeStyle: color });
        const voice = new VF.Voice({ num_beats: 1, beat_value: 4 }).setMode(VF.Voice.Mode.SOFT);
        voice.addTickables(notes);
        new VF.Formatter().joinVoices([voice]).format([voice], Math.max(16, lw - 14));
        voice.draw(ctx, stave);
        beam.setContext(ctx).draw();
      } else {
        const note = new VF.StaveNote({
          keys,
          duration,
          stem_direction: 1,
          align_center: true
        });
        if (isDotted) {
          VF.Dot.buildAndAttach([note], { all: true });
        }
        note.setStyle({ fillStyle: color, strokeStyle: color });
        notes.push(note);
        const voiceBeats = isDotted ? 3 : (baseDur === "w" ? 4 : (baseDur === "h" ? 2 : 1));
        const voice = new VF.Voice({ num_beats: voiceBeats, beat_value: 4 }).setMode(VF.Voice.Mode.SOFT);
        voice.addTickables(notes);
        new VF.Formatter().joinVoices([voice]).format([voice], Math.max(12, lw - 10));
        voice.draw(ctx, stave);
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  getVexFlow() {
    return ScoreRenderer.getVexFlowStatic();
  }

  setTutorOptions(opts = {}) {
    const prevNoteMode = this.noteNameMode;
    const prevTabMode = this.tabVisibilityMode;
    const prevRhythm = this.showRhythmGuide;

    if (opts.noteNameMode && ["off", "above", "inside"].includes(opts.noteNameMode)) {
      this.noteNameMode = opts.noteNameMode;
      this.showNoteNames = opts.noteNameMode !== "off";
    } else if (opts.showNoteNames !== undefined) {
      this.showNoteNames = Boolean(opts.showNoteNames);
      this.noteNameMode = this.showNoteNames ? (this.noteNameMode === "inside" ? "inside" : "above") : "off";
    }

    if (opts.tabVisibilityMode && ["both", "staff-only", "blur"].includes(opts.tabVisibilityMode)) {
      this.tabVisibilityMode = opts.tabVisibilityMode;
      this.showTabNumbers = opts.tabVisibilityMode !== "staff-only";
      if (this.tabVisibilityMode !== "blur") this._tabPeeked = false;
    } else if (opts.showTabNumbers !== undefined) {
      this.showTabNumbers = Boolean(opts.showTabNumbers);
      this.tabVisibilityMode = this.showTabNumbers ? (this.tabVisibilityMode === "blur" ? "blur" : "both") : "staff-only";
    }

    if (opts.showRhythmGuide !== undefined) {
      this.showRhythmGuide = Boolean(opts.showRhythmGuide);
    }
    if (opts.showCoachBanner !== undefined) {
      this.showCoachBanner = Boolean(opts.showCoachBanner);
      if (!this.showCoachBanner) this.clearCoachBanner();
    }

    const needsRerender = Boolean(
      this.exercise && (
        prevNoteMode !== this.noteNameMode ||
        prevTabMode !== this.tabVisibilityMode ||
        prevRhythm !== this.showRhythmGuide
      )
    );

    if (needsRerender) {
      const prevActive = this._lastActiveArgs;
      const prevCoach = this._lastCoachArgs;
      this.render();
      if (prevActive) {
        this.highlightBeat(prevActive.mIdx, prevActive.bIdx, prevActive.isRest, prevCoach);
      }
      return;
    }

    if (this.container) {
      this.container.classList.toggle("hide-note-names", this.noteNameMode === "off");
      this.container.classList.toggle("hide-tab-numbers", this.tabVisibilityMode === "staff-only");
      const sheet = this.container.querySelector(".vf-score-sheet");
      if (sheet) {
        sheet.classList.toggle("is-tab-blurred", this.tabVisibilityMode === "blur");
      }
    }
  }

  setSightReadingOptions(opts = {}) {
    this.setTutorOptions(opts);
  }

  setLoopMeasure(measureIndexOrNull) {
    this.loopMeasureIndex = measureIndexOrNull;
    if (!this.container) return;
    this.container.querySelectorAll(".vf-loop-band").forEach(el => {
      const m = parseInt(el.dataset.measure, 10);
      el.classList.toggle("is-looped", this.loopMeasureIndex !== null && m === this.loopMeasureIndex);
    });
  }

  loadExercise(exercise, options = null) {
    this.exercise = exercise;
    this._lastActiveArgs = null;
    this._lastCoachArgs = null;
    this.activeKey = null;
    this._tabPeeked = false;

    if (options) {
      if (options.noteNameMode) {
        this.noteNameMode = options.noteNameMode;
        this.showNoteNames = options.noteNameMode !== "off";
      }
      if (options.tabVisibilityMode) {
        this.tabVisibilityMode = options.tabVisibilityMode;
        this.showTabNumbers = options.tabVisibilityMode !== "staff-only";
      }
      if (options.showRhythmGuide !== undefined) {
        this.showRhythmGuide = Boolean(options.showRhythmGuide);
      }
      if (options.showCoachBanner !== undefined) {
        this.showCoachBanner = Boolean(options.showCoachBanner);
      }
    }

    const ts = exercise.timeSignature || [4, 4];
    this.timeSignature = Array.isArray(ts) ? `${ts[0]}/${ts[1]}` : String(ts);

    if (Array.isArray(exercise.measures) && exercise.measures.length > 0) {
      this.measures = exercise.measures;
    } else {
      this.measures = this._adaptLegacyTabData(exercise);
    }

    this.render();
  }

  hasStandardStaff(exercise) {
    if (!exercise) return false;
    if (exercise.notationMode === "tab" || exercise.clef === "tab") return false;
    const id = exercise.id || "";
    if (id.startsWith("lb-s1-fe") || id.startsWith("bw-w1-fe") || id.startsWith("bw-w1-alt")) return false;
    return true;
  }

  _adaptLegacyTabData(exercise) {
    const isTabOnly = !this.hasStandardStaff(exercise);
    const openMidi = { 1: 64, 2: 59, 3: 55, 4: 50, 5: 45, 6: 40 };
    const pitchNames = ["c", "c#", "d", "d#", "e", "f", "f#", "g", "g#", "a", "a#", "b"];
    const rawMeasures = exercise.tabData || [];

    const durSpecForBeats = (durBeats, sym) => {
      const s = String(sym || "").toLowerCase();
      if (durBeats >= 4 || s === "1/1") return { vexDur: "w", isDotted: false };
      if (durBeats >= 3 || s === "3/4") return { vexDur: "h", isDotted: true };
      if (durBeats >= 2 || s === "1/2") return { vexDur: "h", isDotted: false };
      if (Math.abs(durBeats - 1.5) < 0.05 || s === "3/8") return { vexDur: "q", isDotted: true };
      if (s === "1/8" || durBeats === 0.5) return { vexDur: "8", isDotted: false };
      if (s === "1/16" || durBeats === 0.25) return { vexDur: "16", isDotted: false };
      return { vexDur: "q", isDotted: false };
    };

    const adapted = rawMeasures.map((m, idx) => {
      const events = [];
      const beats = m.beats || [];

      beats.forEach((b, bIdx) => {
        // Detect tie carryover on beat 1 (e.g. "Tied from previous bar" in Session 3 Exercises)
        const isLeadingCrossBarTie = bIdx === 0 && idx > 0 && (b.isSustain || b.type === "sustain") && b.type !== "rest";
        if ((b.isSustain || b.type === "sustain") && !isLeadingCrossBarTie) return;

        let effectiveDur = b.duration || 1;
        if (isLeadingCrossBarTie) {
          let tieSpan = 1;
          for (let k = bIdx + 1; k < beats.length; k++) {
            if ((beats[k].isSustain || beats[k].type === "sustain") && beats[k].note === b.note) {
              tieSpan++;
            } else {
              break;
            }
          }
          effectiveDur = tieSpan;
        }

        const { vexDur, isDotted } = durSpecForBeats(effectiveDur, isLeadingCrossBarTie ? null : b.symbol);

        if (b.type === "rest") {
          events.push({
            beat: b.beat || (bIdx + 1),
            tabBeatIndex: bIdx,
            isRest: true,
            note: "REST",
            vexKey: vexDur === "w" ? "d/5" : "b/4",
            accidental: null,
            duration: vexDur,
            isDotted,
            vexDuration: `${vexDur}r`,
            durationBeats: effectiveDur,
            string: null,
            fret: null,
            pick: "-",
            positions: []
          });
          return;
        }

        if (b.type === "metronome" || exercise.isMetronomeOnly) {
          events.push({
            beat: b.beat || (bIdx + 1),
            tabBeatIndex: bIdx,
            isRest: false,
            isChord: true,
            isMetronomeOnly: true,
            note: b.note || `Beat ${bIdx + 1}`,
            vexKey: "b/4",
            accidental: null,
            duration: vexDur,
            isDotted,
            vexDuration: vexDur,
            durationBeats: effectiveDur,
            string: null,
            fret: null,
            pick: "-",
            positions: []
          });
          return;
        }

        let vexKey = "b/4";
        let accidental = null;
        let positions = [];
        let isChord = false;
        let noteName = b.note || "";
        let preferFlat = Boolean(b.preferFlat) || /^[A-G]b\d?$/i.test(String(noteName).trim());

        if (typeof b.string === "number" && b.fret !== null && b.fret !== undefined) {
          const derived = deriveGuitarNoteFromPosition(b.string, b.fret, preferFlat);
          vexKey = derived.vexKey;
          accidental = derived.accidental;
          preferFlat = derived.preferFlat;
          positions = [{ str: derived.string, fret: derived.fret }];
          noteName = derived.displayName;
        } else {
          isChord = true;
          positions = [{ str: 3, fret: 0 }, { str: 2, fret: 1 }, { str: 1, fret: 0 }];
        }

        events.push({
          beat: b.beat || (bIdx + 1),
          tabBeatIndex: bIdx,
          isRest: false,
          isChord,
          note: noteName,
          preferFlat,
          vexKey,
          accidental,
          duration: vexDur,
          isDotted,
          vexDuration: vexDur,
          durationBeats: effectiveDur,
          string: b.string,
          fret: b.fret,
          pick: isLeadingCrossBarTie ? "-" : (b.pick || "Down"),
          positions,
          tieFromPrev: isLeadingCrossBarTie || Boolean(b.tieFromPrev),
          tieToNext: Boolean(b.tieToNext)
        });
      });

      return {
        measure: m.measure || (idx + 1),
        clef: isTabOnly ? "tab" : "treble",
        notationMode: isTabOnly ? "tab" : "standard",
        timeSignature: this.timeSignature,
        chordName: m.chordName || null,
        events
      };
    });

    // Propagate tieToNext onto previous bar's final event if next bar begins with tieFromPrev
    for (let i = 0; i < adapted.length - 1; i++) {
      const curEvs = adapted[i].events;
      const nxtEvs = adapted[i + 1].events;
      if (curEvs.length > 0 && nxtEvs.length > 0 && nxtEvs[0].tieFromPrev && !curEvs[curEvs.length - 1].isRest) {
        curEvs[curEvs.length - 1].tieToNext = true;
      }
    }

    return adapted;
  }

  _getMeasuresPerSystem(containerWidth) {
    if (!this.measures || this.measures.length === 0) return 4;
    const total = this.measures.length;
    const maxEvents = this.measures.reduce((mx, m) => Math.max(mx, (m.events || []).length), 4);
    // Desktop (>= 900px): keep exercises up to 8 bars on one continuous row
    if (containerWidth >= 900) {
      if (total <= 8) return total;
      return Math.min(total, maxEvents >= 8 ? 3 : 4);
    }
    // Tablet / iPad / Phone Landscape (540px - 899px): wrap cleanly at 4 bars per row
    if (containerWidth >= 540) {
      return Math.min(total, maxEvents >= 8 ? 3 : 4);
    }
    // Phone Portrait (< 540px): wrap at 2 bars per row so staves stay legible
    return Math.min(total, 2);
  }

  _buildBeatIndexLookup(mIdx) {
    const legacyM = this.exercise && this.exercise.tabData && this.exercise.tabData[mIdx];
    const map = {};
    if (legacyM && Array.isArray(legacyM.beats)) {
      let nonSustainCounter = 0;
      legacyM.beats.forEach((b, bIdx) => {
        if (b.eventIndex !== undefined) {
          if (map[b.eventIndex] === undefined) map[b.eventIndex] = bIdx;
        } else {
          const isLeadingTie = bIdx === 0 && mIdx > 0 && (b.isSustain || b.type === "sustain") && b.type !== "rest";
          if ((!b.isSustain && b.type !== "sustain") || isLeadingTie) {
            map[nonSustainCounter] = bIdx;
            nonSustainCounter++;
          }
        }
      });
    }
    return map;
  }

  render() {
    if (!this.container || !this.exercise) return;
    const VF = this.getVexFlow();
    if (!VF) {
      this.container.innerHTML = `<div class="vf-fallback-notice">VexFlow engraving engine not loaded.</div>`;
      return;
    }

    if (typeof VF.setMusicFont === "function") {
      try { VF.setMusicFont("Bravura"); } catch (e) {}
    }

    this._noteMap.clear();
    this._measureBounds.clear();
    this.container.innerHTML = "";
    this.container.style.position = "relative";

    const totalMeasures = this.measures.length;
    if (totalMeasures === 0) return;

    const availW = Math.max(240, this.container.clientWidth || 760);
    this._lastRenderWidth = availW;

    const showTreble = this.hasStandardStaff(this.exercise);
    const isMetOnly = Boolean(this.exercise && (this.exercise.isMetronomeOnly || this.exercise.id === "free-metronome"));
    const showTab = !isMetOnly && (!showTreble || this.tabVisibilityMode !== "staff-only");
    const isTabBlurred = showTab && this.tabVisibilityMode === "blur";

    const baseScale = availW < 540 ? 0.86 : 0.82;
    const mps = this._getMeasuresPerSystem(availW);
    const leftGutter = showTreble && showTab ? 18 : 6;
    const clefExtra = showTreble ? 78 : 54;
    const maxEvents = this.measures.reduce((mx, m) => Math.max(mx, (m.events || []).length), 1);
    const minPerBar = maxEvents >= 6 ? 152 : (maxEvents >= 4 ? 128 : 112);
    const mobileMinPerBar = maxEvents >= 6 ? 150 : 132;
    const minLogicalW = availW < 540
      ? (leftGutter + clefExtra + mps * mobileMinPerBar + 16)
      : (mps > 4 ? (leftGutter + clefExtra + mps * minPerBar + 16) : 0);
    const logicalW = Math.max(Math.floor(availW / baseScale), minLogicalW);
    const SCALE = availW / logicalW;
    this._activeScale = SCALE;

    const systems = [];
    for (let i = 0; i < totalMeasures; i += mps) {
      systems.push({ startIdx: i, items: this.measures.slice(i, i + mps) });
    }

    const SVG_NS = "http://www.w3.org/2000/svg";
    const sheetWrap = document.createElement("div");
    sheetWrap.className = `vf-score-sheet ${isTabBlurred ? "is-tab-blurred" : ""} ${this._tabPeeked ? "is-tab-peeked" : ""}`;
    this.container.appendChild(sheetWrap);

    if (isTabBlurred) {
      const peekBar = document.createElement("div");
      peekBar.className = "vf-tab-peek-bar";
      peekBar.innerHTML = `
        <span class="vf-peek-hint">TAB blurred for sight-reading &middot; Hover staff or click to peek</span>
        <button type="button" class="micro-pill vf-peek-toggle-btn">${this._tabPeeked ? "Re-Blur TAB" : "Peek TAB"}</button>
      `;
      peekBar.querySelector(".vf-peek-toggle-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        this._tabPeeked = !this._tabPeeked;
        sheetWrap.classList.toggle("is-tab-peeked", this._tabPeeked);
        e.currentTarget.textContent = this._tabPeeked ? "Re-Blur TAB" : "Peek TAB";
      });
      sheetWrap.appendChild(peekBar);
    }

    // Floating Live Action Coach Pill (anchored above active measure during playback/seek)
    const coachPill = document.createElement("div");
    coachPill.className = "vf-coach-pill";
    coachPill.hidden = true;
    this.container.appendChild(coachPill);
    this._coachPillEl = coachPill;

    let prevMeasureTail = null;

    systems.forEach((sys, sysIdx) => {
      const sysEl = document.createElement("div");
      sysEl.className = "vf-system-block";
      sysEl.id = `score-system-${sysIdx}`;
      sheetWrap.appendChild(sysEl);

      const topPad = 56;
      const trebleY = topPad;
      const tabY = showTreble ? (topPad + 122) : (topPad + 4);
      const rhythmExtra = this.showRhythmGuide ? 38 : 0;
      const sysH = (showTab ? (tabY + 116) : (trebleY + 112)) + rhythmExtra;

      const renderer = new VF.Renderer(sysEl, VF.Renderer.Backends.SVG);
      renderer.resize(availW, Math.ceil(sysH * SCALE));
      const ctx = renderer.getContext();
      ctx.scale(SCALE, SCALE);

      const svgEl = sysEl.querySelector("svg");
      if (svgEl) {
        svgEl.classList.add("vf-system-svg");
        svgEl.setAttribute("viewBox", `0 0 ${logicalW} ${sysH}`);
        svgEl.setAttribute("preserveAspectRatio", "xMidYMin meet");
        svgEl.removeAttribute("width");
        svgEl.removeAttribute("height");
      }

      const backdropLayer = document.createElementNS(SVG_NS, "g");
      backdropLayer.setAttribute("class", "vf-backdrop-layer");
      const tabLayer = document.createElementNS(SVG_NS, "g");
      tabLayer.setAttribute("class", "vf-tab-blur-wrap");
      const overlayLayer = document.createElementNS(SVG_NS, "g");
      overlayLayer.setAttribute("class", "vf-overlay-layer");

      if (svgEl) {
        svgEl.insertBefore(backdropLayer, svgEl.firstChild);
        svgEl.appendChild(tabLayer);
      }

      if (isTabBlurred) {
        tabLayer.addEventListener("click", (e) => {
          e.stopPropagation();
          this._tabPeeked = !this._tabPeeked;
          sheetWrap.classList.toggle("is-tab-peeked", this._tabPeeked);
          const btn = sheetWrap.querySelector(".vf-peek-toggle-btn");
          if (btn) btn.textContent = this._tabPeeked ? "Re-Blur TAB" : "Peek TAB";
          if (this.onTabPeekToggle) this.onTabPeekToggle(this._tabPeeked);
        });
      }

      const captureIntoTabLayer = (fn) => {
        if (!svgEl) { fn(); return; }
        const before = new Set(Array.from(svgEl.children));
        fn();
        Array.from(svgEl.children).forEach(ch => {
          if (!before.has(ch) && ch !== backdropLayer && ch !== tabLayer && ch !== overlayLayer) {
            tabLayer.appendChild(ch);
          }
        });
      };

      const rightMargin = availW < 540 ? 14 : 6;
      const usableW = logicalW - leftGutter - rightMargin;
      const countInRow = sys.items.length;
      const barGridCols = countInRow === 1 && totalMeasures > 1 ? Math.min(2, mps) : countInRow;
      const remainingW = usableW - clefExtra;
      const baseMeasureW = Math.floor(remainingW / barGridCols);

      if (isTabBlurred && svgEl) {
        const hoverZone = document.createElementNS(SVG_NS, "rect");
        hoverZone.setAttribute("class", "vf-tab-hover-zone");
        hoverZone.setAttribute("x", String(leftGutter));
        hoverZone.setAttribute("y", String(tabY - 8));
        hoverZone.setAttribute("width", String(usableW));
        hoverZone.setAttribute("height", "72");
        hoverZone.setAttribute("fill", "transparent");
        hoverZone.style.cursor = "pointer";
        tabLayer.appendChild(hoverZone);
      }

      let curX = leftGutter;

      sys.items.forEach((m, mInSysIdx) => {
        const mIdx = sys.startIdx + mInSysIdx;
        const isFirstInSys = mInSysIdx === 0;
        const isLastOfPiece = mIdx === totalMeasures - 1;
        const mWidth = isFirstInSys ? (baseMeasureW + clefExtra) : baseMeasureW;
        const tsStr = m.timeSignature || this.timeSignature || "4/4";
        const events = m.events || [];
        const beatLookup = this._buildBeatIndexLookup(mIdx);

        let stave = null;
        let tabStave = null;

        if (showTreble) {
          stave = new VF.Stave(curX, trebleY, mWidth, {
            spacing_between_lines_px: 11
          });
          stave.setStyle({ strokeStyle: "#27272A", lineWidth: 1.0 });
          stave.setMeasure(m.measure || (mIdx + 1));

          if (isFirstInSys) {
            stave.addClef("treble");
            if (mIdx === 0) stave.addTimeSignature(tsStr);
          }
          if (isLastOfPiece) {
            stave.setEndBarType(VF.Barline.type.END);
          }
          stave.setContext(ctx);
        }

        if (showTab) {
          tabStave = new VF.TabStave(curX, tabY, mWidth, {
            spacing_between_lines_px: 10.5
          });
          tabStave.setStyle({ strokeStyle: "#3F3F46", lineWidth: 0.95 });
          if (!showTreble) tabStave.setMeasure(m.measure || (mIdx + 1));

          if (isFirstInSys) {
            tabStave.addClef("tab");
            if (!showTreble && mIdx === 0) tabStave.addTimeSignature(tsStr);
          }
          if (isLastOfPiece) {
            tabStave.setEndBarType(VF.Barline.type.END);
          }
          tabStave.setContext(ctx);
        }

        if (stave) stave.draw();
        if (tabStave) captureIntoTabLayer(() => tabStave.draw());

        const extraBarStartPad = isFirstInSys ? 0 : 8;
        const commonNoteStartX = (showTreble && showTab
          ? Math.max(stave.getNoteStartX(), tabStave.getNoteStartX()) + 6
          : (showTreble ? stave.getNoteStartX() : tabStave.getNoteStartX()) + 4) + extraBarStartPad;
        if (stave) stave.setNoteStartX(commonNoteStartX);
        if (tabStave) tabStave.setNoteStartX(commonNoteStartX);

        if (showTreble && showTab) {
          if (isFirstInSys) {
            const bracket = new VF.StaveConnector(stave, tabStave);
            bracket.setType(VF.StaveConnector.type.BRACKET);
            bracket.setContext(ctx).draw();

            const leftLine = new VF.StaveConnector(stave, tabStave);
            leftLine.setType(VF.StaveConnector.type.SINGLE_LEFT);
            leftLine.setContext(ctx).draw();
          }

          const rightConn = new VF.StaveConnector(stave, tabStave);
          rightConn.setType(
            isLastOfPiece ? VF.StaveConnector.type.THIN_DOUBLE : VF.StaveConnector.type.SINGLE_RIGHT
          );
          rightConn.setContext(ctx).draw();
        }

        const topLineY = showTreble ? stave.getYForLine(0) : tabStave.getYForLine(0);
        const trebleBotY = showTreble ? stave.getYForLine(4) : topLineY;
        const tabTopY = showTab ? tabStave.getYForLine(0) : trebleBotY;
        const botLineY = showTab ? tabStave.getYForLine(5) : trebleBotY;

        this._measureBounds.set(mIdx, {
          sysEl,
          x: curX,
          width: mWidth,
          topLineY,
          botLineY
        });

        const loopTop = topLineY - 6;
        const loopBot = botLineY + 6;
        const loopBand = document.createElementNS(SVG_NS, "rect");
        loopBand.setAttribute("class", `vf-loop-band ${this.loopMeasureIndex === mIdx ? "is-looped" : ""}`);
        loopBand.setAttribute("data-measure", String(mIdx));
        loopBand.setAttribute("x", String(curX + 1));
        loopBand.setAttribute("y", String(loopTop));
        loopBand.setAttribute("width", String(Math.max(10, mWidth - 2)));
        loopBand.setAttribute("height", String(loopBot - loopTop));
        loopBand.setAttribute("stroke", "none");
        backdropLayer.appendChild(loopBand);

        if (events.length > 0) {
          const vfStaveNotes = [];
          const vfTabNotes = [];
          const beatMeta = [];
          const vfTies = [];
          const vfTabTies = [];

          events.forEach((ev, evIdx) => {
            const rawDur = (ev.duration || "q").replace(/[^0-9a-z]/gi, "").replace(/r$/i, "").toLowerCase();
            const safeDur = rawDur === "e" ? "8" : rawDur;
            const durCode = ev.isRest ? `${safeDur}r` : safeDur;

            let sn = null;
            let tn = null;

            const posDerived = (!ev.isRest && !ev.isChord && typeof ev.string === "number" && ev.fret !== null && ev.fret !== undefined)
              ? deriveGuitarNoteFromPosition(ev.string, ev.fret, Boolean(ev.preferFlat))
              : null;

            if (showTreble) {
              let keys = [posDerived ? posDerived.vexKey : (ev.vexKey || (safeDur === "w" && ev.isRest ? "d/5" : "b/4"))];
              let alignCenter = false;
              const derivedAcc = posDerived ? posDerived.accidental : ev.accidental;

              if (ev.isRest) {
                keys = safeDur === "w" ? ["d/5"] : ["b/4"];
                alignCenter = events.length === 1 && safeDur === "w";
              } else if (ev.isChord) {
                keys = (safeDur === "w" || safeDur === "h") ? ["b/4"] : ["b/4/s"];
              }

              sn = new VF.StaveNote({
                clef: "treble",
                keys,
                duration: durCode,
                auto_stem: true,
                align_center: alignCenter
              });

              if (ev.isDotted) {
                VF.Dot.buildAndAttach([sn], { all: true });
              }
              if (derivedAcc && derivedAcc !== "n" && !ev.isRest) {
                sn.addModifier(new VF.Accidental(derivedAcc), 0);
              }
              if (ev.isRest) {
                sn.setStyle({ fillStyle: "#DC2626", strokeStyle: "#DC2626" });
              } else {
                sn.setStyle({ fillStyle: "#18181B", strokeStyle: "#18181B" });
              }
              vfStaveNotes.push(sn);
            }

            if (showTab) {
              if (ev.isRest) {
                tn = new VF.GhostNote({ duration: safeDur });
              } else {
                const pos = posDerived
                  ? [{ str: posDerived.string, fret: String(posDerived.fret) }]
                  : ((ev.positions && ev.positions.length > 0)
                      ? ev.positions.map(p => ({ str: p.str, fret: String(p.fret) }))
                      : [{ str: 1, fret: "0" }]);
                tn = new VF.TabNote({
                  positions: pos,
                  duration: safeDur
                });
                if (ev.isDotted) {
                  VF.Dot.buildAndAttach([tn], { all: true });
                }
                tn.setStyle({ fillStyle: "#18181B", strokeStyle: "#18181B" });
              }
              vfTabNotes.push(tn);
            }

            beatMeta.push({
              ev,
              evIdx,
              safeDur,
              sn,
              tn,
              startBeatIdx: beatLookup[evIdx] !== undefined ? beatLookup[evIdx] : evIdx
            });
          });

          try {
            const tsParts = tsStr.split("/");
            const voiceOpts = {
              num_beats: parseInt(tsParts[0], 10) || 4,
              beat_value: parseInt(tsParts[1], 10) || 4
            };
            const voices = [];

            let beams = [];
            if (showTreble && vfStaveNotes.length > 0) {
              const stdVoice = new VF.Voice(voiceOpts).setMode(VF.Voice.Mode.SOFT);
              stdVoice.addTickables(vfStaveNotes);
              beams = VF.Beam.generateBeams(vfStaveNotes);
              voices.push(stdVoice);
            }

            if (showTab && vfTabNotes.length > 0) {
              const tabVoice = new VF.Voice(voiceOpts).setMode(VF.Voice.Mode.SOFT);
              tabVoice.addTickables(vfTabNotes);
              voices.push(tabVoice);
            }

            if (voices.length > 0) {
              const noteStartX = showTreble ? stave.getNoteStartX() : tabStave.getNoteStartX();
              const noteEndX = curX + mWidth - (isLastOfPiece ? 18 : 10);
              const formatWidth = Math.max(40, noteEndX - noteStartX);

              new VF.Formatter().joinVoices(voices).format(voices, formatWidth);

              if (showTreble && voices[0]) {
                voices[0].draw(ctx, stave);
                beams.forEach(b => b.setContext(ctx).draw());
              }
              const tabVoice = showTreble ? voices[1] : voices[0];
              if (showTab && tabVoice) {
                captureIntoTabLayer(() => tabVoice.draw(ctx, tabStave));
              }

              beatMeta.forEach((meta, i) => {
                if (meta.ev.tieFromPrev && prevMeasureTail && prevMeasureTail.sameSystem === sysIdx && i === 0) {
                  if (showTreble && prevMeasureTail.sn && meta.sn) {
                    vfTies.push(new VF.StaveTie({
                      first_note: prevMeasureTail.sn,
                      last_note: meta.sn,
                      first_indices: [0],
                      last_indices: [0]
                    }));
                  }
                  if (showTab && prevMeasureTail.tn && meta.tn && !meta.ev.isRest) {
                    vfTabTies.push(new VF.TabTie({
                      first_note: prevMeasureTail.tn,
                      last_note: meta.tn,
                      first_indices: [0],
                      last_indices: [0]
                    }));
                  }
                } else if (meta.ev.tieFromPrev && i === 0 && showTreble && meta.sn) {
                  vfTies.push(new VF.StaveTie({
                    first_note: null,
                    last_note: meta.sn,
                    first_indices: [0],
                    last_indices: [0]
                  }));
                }

                if (meta.ev.tieToNext && i + 1 < beatMeta.length) {
                  const nxt = beatMeta[i + 1];
                  if (showTreble && meta.sn && nxt.sn) {
                    vfTies.push(new VF.StaveTie({
                      first_note: meta.sn,
                      last_note: nxt.sn,
                      first_indices: [0],
                      last_indices: [0]
                    }));
                  }
                  if (showTab && meta.tn && nxt.tn && !meta.ev.isRest && !nxt.ev.isRest) {
                    vfTabTies.push(new VF.TabTie({
                      first_note: meta.tn,
                      last_note: nxt.tn,
                      first_indices: [0],
                      last_indices: [0]
                    }));
                  }
                } else if (meta.ev.tieToNext && i === beatMeta.length - 1 && mInSysIdx === countInRow - 1 && showTreble && meta.sn) {
                  vfTies.push(new VF.StaveTie({
                    first_note: meta.sn,
                    last_note: null,
                    first_indices: [0],
                    last_indices: [0]
                  }));
                }
              });

              vfTies.forEach(t => t.setContext(ctx).draw());
              if (vfTabTies.length > 0) {
                captureIntoTabLayer(() => vfTabTies.forEach(t => t.setContext(ctx).draw()));
              }
            }
          } catch (vfErr) {
            console.warn(`VexFlow formatting error on Measure ${mIdx + 1}:`, vfErr);
          }

          if (beatMeta.length > 0) {
            const lastB = beatMeta[beatMeta.length - 1];
            prevMeasureTail = { sameSystem: sysIdx, sn: lastB.sn, tn: lastB.tn };
          }

          const hasAnyPick = beatMeta.some(x => !x.ev.isRest && x.ev.pick && x.ev.pick !== "-");
          let runningBeatPos = 0.0;

          // Compute aligned Y clearance above stems, beams, ties, dots, and measure numbers
          let measureNoteTopY = topLineY;
          beatMeta.forEach(meta => {
            if (!meta.sn) return;
            try {
              if (typeof meta.sn.getBoundingBox === "function") {
                const bb = meta.sn.getBoundingBox();
                if (bb) measureNoteTopY = Math.min(measureNoteTopY, bb.getY());
              }
              if (typeof meta.sn.getYs === "function") {
                const ys = meta.sn.getYs();
                if (ys && ys.length > 0 && (meta.ev.tieToNext || meta.ev.tieFromPrev) && ys[0] <= topLineY + 12) {
                  measureNoteTopY = Math.min(measureNoteTopY, ys[0] - 14);
                }
              }
            } catch (e) {}
          });
          const aboveNoteY = Math.min(topLineY - 17, measureNoteTopY - 8);

          // Overlay labels, Note Names (Above/Inside), Rhythm Counting Guide, Cursors & Hit Targets
          beatMeta.forEach((meta, idx) => {
            const { ev, evIdx, safeDur, sn, tn, startBeatIdx } = meta;
            const refNote = sn || tn;
            if (!refNote) return;

            let centerX = curX + 24;
            try {
              centerX = refNote.getAbsoluteX() + 5;
            } catch (e) {}

            let headX = centerX;
            let headY = topLineY + 22;
            if (sn) {
              try {
                if (typeof sn.getNoteHeadBeginX === "function" && typeof sn.getNoteHeadEndX === "function") {
                  headX = (sn.getNoteHeadBeginX() + sn.getNoteHeadEndX()) / 2;
                }
                if (typeof sn.getYs === "function") {
                  const ys = sn.getYs();
                  if (ys && ys.length > 0) headY = ys[0];
                }
              } catch (e) {}
            }

            const chordLabel = ev.chordChange || (idx === 0 ? m.chordName : null);
            if (chordLabel) {
              const chText = document.createElementNS(SVG_NS, "text");
              chText.setAttribute("class", "vf-chord-label");
              chText.setAttribute("x", String(headX - 3));
              chText.setAttribute("y", String(this.noteNameMode === "above" ? (aboveNoteY - 13) : (topLineY - 18)));
              chText.textContent = chordLabel;
              overlayLayer.appendChild(chText);
            }

            const textEls = [];
            const noteEls = [];
            const labelSrc = (!ev.isRest && !ev.isChord && typeof ev.string === "number" && ev.fret !== null && ev.fret !== undefined)
              ? deriveGuitarNoteFromPosition(ev.string, ev.fret, Boolean(ev.preferFlat)).displayName
              : (ev.note || "");
            const shortPitch = String(labelSrc).replace(/^High\s+/i, "").replace(/^Low\s+/i, "").trim();

            if (showTreble && !ev.isRest && !ev.isChord && shortPitch) {
              if (this.noteNameMode === "above") {
                const nmText = document.createElementNS(SVG_NS, "text");
                nmText.setAttribute("class", "vf-note-label vf-note-above");
                nmText.setAttribute("x", String(headX));
                nmText.setAttribute("y", String(aboveNoteY));
                nmText.setAttribute("text-anchor", "middle");
                nmText.textContent = shortPitch;
                overlayLayer.appendChild(nmText);
                textEls.push(nmText);
              } else if (this.noteNameMode === "inside") {
                const isHollow = safeDur === "w" || safeDur === "h";

                // Mask underlying Bravura notehead glyph path while preserving stems, dots, accidentals, and ledger lines
                if (sn && typeof sn.getSVGElement === "function") {
                  const snSvg = sn.getSVGElement();
                  const nhPath = snSvg ? snSvg.querySelector(".vf-notehead > path") : null;
                  if (nhPath) nhPath.classList.add("vf-alpha-head-hidden");
                }

                const insideG = document.createElementNS(SVG_NS, "g");
                insideG.setAttribute("class", "vf-inside-head-group");

                const oval = document.createElementNS(SVG_NS, "ellipse");
                oval.setAttribute("class", `vf-alpha-oval ${isHollow ? "is-hollow" : "is-filled"}`);
                oval.setAttribute("cx", String(headX));
                oval.setAttribute("cy", String(headY));
                oval.setAttribute("rx", shortPitch.length > 1 ? "6.6" : "5.5");
                oval.setAttribute("ry", "4.2");

                const letter = document.createElementNS(SVG_NS, "text");
                letter.setAttribute("class", `vf-alpha-letter ${isHollow ? "is-hollow" : "is-filled"} ${shortPitch.length > 1 ? "is-accidental" : ""}`);
                letter.setAttribute("x", String(headX));
                letter.setAttribute("y", String(headY));
                letter.setAttribute("text-anchor", "middle");
                letter.setAttribute("dominant-baseline", "central");
                letter.textContent = shortPitch;

                insideG.appendChild(oval);
                insideG.appendChild(letter);
                overlayLayer.appendChild(insideG);
                noteEls.push(insideG);
              }
            }

            if (!ev.isRest && ev.pick && ev.pick !== "-") {
              const pkText = document.createElementNS(SVG_NS, "text");
              pkText.setAttribute("class", "vf-pick-label");
              pkText.setAttribute("x", String(headX));
              pkText.setAttribute("y", String(botLineY + 17));
              pkText.setAttribute("text-anchor", "middle");
              pkText.textContent = ev.pick === "Up" ? "\u2191" : (ev.pick === "Down" ? "\u2193" : ev.pick);
              overlayLayer.appendChild(pkText);
              textEls.push(pkText);
            }

            // Rhythm & Counting Guide beneath each measure
            const beatDisplayNum = runningBeatPos + 1;
            const isHalfBeatOff = Math.abs((runningBeatPos % 1) - 0.5) < 0.08;
            const beatLabel = isHalfBeatOff ? "&" : String(Math.round(beatDisplayNum));
            runningBeatPos += (ev.durationBeats || 1);

            if (this.showRhythmGuide) {
              const guideLine1Y = botLineY + (hasAnyPick ? 32 : 20);
              const guideBadgeY = guideLine1Y + 13;
              const guideG = document.createElementNS(SVG_NS, "g");

              if (!ev.isRest && ev.tieFromPrev) {
                guideG.setAttribute("class", "vf-rhythm-item is-tied");

                // Curved continuation arrow pointing into Hold(beat)
                const arc = document.createElementNS(SVG_NS, "path");
                arc.setAttribute("class", "vf-rhythm-tie-arrow");
                arc.setAttribute("d", `M ${headX - 24} ${guideLine1Y - 6} Q ${headX - 15} ${guideLine1Y - 13}, ${headX - 7} ${guideLine1Y - 5}`);
                guideG.appendChild(arc);

                const arrowHead = document.createElementNS(SVG_NS, "path");
                arrowHead.setAttribute("class", "vf-rhythm-tie-head");
                arrowHead.setAttribute("d", `M ${headX - 10} ${guideLine1Y - 7} L ${headX - 6} ${guideLine1Y - 4} L ${headX - 9} ${guideLine1Y - 2}`);
                guideG.appendChild(arrowHead);

                const holdText = `Hold (${beatLabel})`;
                const pillW = Math.max(38, holdText.length * 5.2 + 8);
                const pill = document.createElementNS(SVG_NS, "rect");
                pill.setAttribute("class", "vf-rhythm-pill is-tied");
                pill.setAttribute("x", String(headX - pillW / 2));
                pill.setAttribute("y", String(guideLine1Y - 9));
                pill.setAttribute("width", String(pillW));
                pill.setAttribute("height", "12.5");
                pill.setAttribute("rx", "3");
                guideG.appendChild(pill);

                const lbl = document.createElementNS(SVG_NS, "text");
                lbl.setAttribute("class", "vf-rhythm-badge-text is-tied");
                lbl.setAttribute("x", String(headX));
                lbl.setAttribute("y", String(guideLine1Y));
                lbl.setAttribute("text-anchor", "middle");
                lbl.textContent = holdText;
                guideG.appendChild(lbl);
              } else if (ev.isRest) {
                guideG.setAttribute("class", "vf-rhythm-item is-rest");

                const numText = document.createElementNS(SVG_NS, "text");
                numText.setAttribute("class", "vf-rhythm-count is-rest");
                numText.setAttribute("x", String(headX));
                numText.setAttribute("y", String(guideLine1Y));
                numText.setAttribute("text-anchor", "middle");
                numText.textContent = beatLabel;
                guideG.appendChild(numText);

                const restLbl = "Rest / Mute";
                const pillW = 48;
                const pill = document.createElementNS(SVG_NS, "rect");
                pill.setAttribute("class", "vf-rhythm-pill is-rest");
                pill.setAttribute("x", String(headX - pillW / 2));
                pill.setAttribute("y", String(guideBadgeY - 8.5));
                pill.setAttribute("width", String(pillW));
                pill.setAttribute("height", "11.5");
                pill.setAttribute("rx", "3");
                guideG.appendChild(pill);

                const lbl = document.createElementNS(SVG_NS, "text");
                lbl.setAttribute("class", "vf-rhythm-badge-text is-rest");
                lbl.setAttribute("x", String(headX));
                lbl.setAttribute("y", String(guideBadgeY));
                lbl.setAttribute("text-anchor", "middle");
                lbl.textContent = restLbl;
                guideG.appendChild(lbl);
              } else if (ev.isDotted) {
                guideG.setAttribute("class", "vf-rhythm-item is-dotted");

                const numText = document.createElementNS(SVG_NS, "text");
                numText.setAttribute("class", "vf-rhythm-count is-dotted");
                numText.setAttribute("x", String(headX));
                numText.setAttribute("y", String(guideLine1Y));
                numText.setAttribute("text-anchor", "middle");
                numText.textContent = beatLabel;
                guideG.appendChild(numText);

                const dotLbl = "+1/2 beat";
                const pillW = 44;
                const pill = document.createElementNS(SVG_NS, "rect");
                pill.setAttribute("class", "vf-rhythm-pill is-dotted");
                pill.setAttribute("x", String(headX - pillW / 2));
                pill.setAttribute("y", String(guideBadgeY - 8.5));
                pill.setAttribute("width", String(pillW));
                pill.setAttribute("height", "11.5");
                pill.setAttribute("rx", "3");
                guideG.appendChild(pill);

                const lbl = document.createElementNS(SVG_NS, "text");
                lbl.setAttribute("class", "vf-rhythm-badge-text is-dotted");
                lbl.setAttribute("x", String(headX));
                lbl.setAttribute("y", String(guideBadgeY));
                lbl.setAttribute("text-anchor", "middle");
                lbl.textContent = dotLbl;
                guideG.appendChild(lbl);
              } else {
                guideG.setAttribute("class", "vf-rhythm-item is-normal");
                const numText = document.createElementNS(SVG_NS, "text");
                numText.setAttribute("class", "vf-rhythm-count");
                numText.setAttribute("x", String(headX));
                numText.setAttribute("y", String(guideLine1Y));
                numText.setAttribute("text-anchor", "middle");
                const extraHold = (ev.durationBeats && ev.durationBeats >= 2)
                  ? `–${Math.round(beatDisplayNum + ev.durationBeats - 1)}`
                  : "";
                numText.textContent = `${beatLabel}${extraHold}`;
                guideG.appendChild(numText);
              }

              overlayLayer.appendChild(guideG);
              textEls.push(guideG);
            }

            const nextMeta = beatMeta[idx + 1];
            let hitW = 28;
            if (nextMeta && (nextMeta.sn || nextMeta.tn)) {
              try {
                const nextX = (nextMeta.sn || nextMeta.tn).getAbsoluteX() + 5;
                hitW = Math.max(18, Math.min(44, nextX - headX));
              } catch (e) {}
            } else {
              hitW = Math.max(20, Math.min(46, (curX + mWidth - headX)));
            }

            const bandX = headX - Math.min(13, hitW * 0.4);
            const bandY = topLineY - 8;
            const bandBot = botLineY + 8;

            const bandRect = document.createElementNS(SVG_NS, "rect");
            bandRect.setAttribute("class", "vf-cursor-band");
            bandRect.setAttribute("id", `vf-cursor-${mIdx}-${evIdx}`);
            bandRect.setAttribute("x", String(bandX));
            bandRect.setAttribute("y", String(bandY));
            bandRect.setAttribute("width", String(hitW));
            bandRect.setAttribute("height", String(bandBot - bandY));
            bandRect.setAttribute("rx", "3");
            bandRect.setAttribute("stroke", "none");
            backdropLayer.appendChild(bandRect);

            const hitBot = (isTabBlurred && showTreble) ? (trebleBotY + 14) : (bandBot + 10);
            const hitRect = document.createElementNS(SVG_NS, "rect");
            hitRect.setAttribute("class", "vf-hit-target");
            hitRect.setAttribute("x", String(bandX));
            hitRect.setAttribute("y", String(bandY - 6));
            hitRect.setAttribute("width", String(hitW));
            hitRect.setAttribute("height", String(Math.max(24, hitBot - (bandY - 6))));
            hitRect.setAttribute("fill", "transparent");
            hitRect.setAttribute("stroke", "none");
            hitRect.style.cursor = "pointer";
            hitRect.addEventListener("click", (e) => {
              e.stopPropagation();
              if (this.onBeatClick) this.onBeatClick(mIdx, startBeatIdx, evIdx);
            });
            overlayLayer.appendChild(hitRect);

            if (sn && typeof sn.getSVGElement === "function") {
              const el = sn.getSVGElement();
              if (el) {
                el.classList.add("vf-tracked-note");
                noteEls.push(el);
              }
            }
            if (tn && typeof tn.getSVGElement === "function") {
              const el = tn.getSVGElement();
              if (el) {
                el.classList.add("vf-tracked-tabnote");
                noteEls.push(el);
              }
            }

            this._noteMap.set(`${mIdx}-${evIdx}`, {
              bandEl: bandRect,
              noteEls,
              textEls,
              sysEl
            });
          });
        }

        curX += mWidth;
      });

      // Ensure overlayLayer paints strictly ON TOP of all VexFlow staves, noteheads, stems, beams, and ties
      if (svgEl) {
        svgEl.appendChild(overlayLayer);
      }
    });
  }

  updateCoachBanner(measureIdx, coachMeta) {
    if (!this._coachPillEl || !this.showCoachBanner || !coachMeta || !coachMeta.text) {
      this.clearCoachBanner();
      return;
    }
    const bounds = this._measureBounds.get(measureIdx);
    if (!bounds || !bounds.sysEl) {
      this.clearCoachBanner();
      return;
    }

    const SCALE = this._activeScale || 0.82;
    const pill = this._coachPillEl;
    const variant = coachMeta.variant || "play";
    pill.className = `vf-coach-pill is-${variant}`;
    pill.textContent = coachMeta.text;
    pill.hidden = false;

    const containerW = (this.container && this.container.clientWidth) ? this.container.clientWidth : 740;
    const measureLeftPx = bounds.x * SCALE;
    const measureWidthPx = bounds.width * SCALE;
    const targetCenterX = measureLeftPx + (measureWidthPx / 2);
    const pillW = pill.offsetWidth || 180;
    const leftPx = Math.max(4, Math.min(containerW - pillW - 4, targetCenterX - pillW / 2));
    const topPx = bounds.sysEl.offsetTop + Math.max(2, Math.round(bounds.topLineY * SCALE) - 44);

    pill.style.left = `${Math.round(leftPx)}px`;
    pill.style.top = `${Math.round(topPx)}px`;
  }

  clearCoachBanner() {
    if (this._coachPillEl) {
      this._coachPillEl.hidden = true;
    }
  }

  highlightBeat(measureIdx, beatIdx, isRest, coachMeta = null, explicitEvIdx = null) {
    if (!this.container) return;
    this._lastActiveArgs = { mIdx: measureIdx, bIdx: beatIdx, isRest };
    if (coachMeta !== undefined) this._lastCoachArgs = coachMeta;

    let evIdx = (explicitEvIdx !== null && explicitEvIdx !== undefined) ? explicitEvIdx : beatIdx;
    const legacyM = this.exercise && this.exercise.tabData && this.exercise.tabData[measureIdx];
    const beatObj = legacyM && legacyM.beats && legacyM.beats[beatIdx];
    if (explicitEvIdx === null || explicitEvIdx === undefined) {
      if (beatObj && beatObj.eventIndex !== undefined) {
        evIdx = beatObj.eventIndex;
      } else if (legacyM && legacyM.beats) {
        let walk = beatIdx;
        while (walk > 0 && (legacyM.beats[walk].isSustain || legacyM.beats[walk].type === "sustain")) {
          walk--;
        }
        let evCounter = 0;
        for (let i = 0; i < walk; i++) {
          const b = legacyM.beats[i];
          const isLeadingTie = i === 0 && measureIdx > 0 && (b.isSustain || b.type === "sustain") && b.type !== "rest";
          if ((!b.isSustain && b.type !== "sustain") || isLeadingTie) evCounter++;
        }
        evIdx = evCounter;
      }
    }

    const key = `${measureIdx}-${evIdx}`;
    this._clearActiveClasses();

    const entry = this._noteMap.get(key);
    if (entry) {
      this.activeKey = key;
      const cls = isRest ? "is-active-rest" : "is-active";
      if (entry.bandEl) entry.bandEl.classList.add(cls);
      entry.noteEls.forEach(el => el.classList.add(cls));
      entry.textEls.forEach(el => el.classList.add(cls));

      if (beatIdx === 0 && entry.sysEl) {
        const viewport = this.container ? this.container.closest(".studio-score-viewport") : null;
        if (viewport) {
          const vpRect = viewport.getBoundingClientRect();
          const sysRect = entry.sysEl.getBoundingClientRect();
          if (sysRect.top < vpRect.top + 8 || sysRect.bottom > vpRect.bottom - 8) {
            const targetTop = viewport.scrollTop + (sysRect.top - vpRect.top) - 12;
            viewport.scrollTo({ top: Math.max(0, targetTop), behavior: "smooth" });
          }
        } else {
          entry.sysEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      }
    }

    if (coachMeta && this.showCoachBanner) {
      this.updateCoachBanner(measureIdx, coachMeta);
    } else if (!this.showCoachBanner) {
      this.clearCoachBanner();
    }
  }

  _clearActiveClasses() {
    if (!this.activeKey) return;
    const prev = this._noteMap.get(this.activeKey);
    if (prev) {
      if (prev.bandEl) prev.bandEl.classList.remove("is-active", "is-active-rest");
      prev.noteEls.forEach(el => el.classList.remove("is-active", "is-active-rest"));
      prev.textEls.forEach(el => el.classList.remove("is-active", "is-active-rest"));
    }
    this.activeKey = null;
  }

  reset() {
    this._lastActiveArgs = null;
    this._lastCoachArgs = null;
    this._clearActiveClasses();
    this.clearCoachBanner();
  }
}
