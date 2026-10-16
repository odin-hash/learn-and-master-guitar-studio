// Luxury Guitar TAB & True 5-Line Standard Staff Visualizer
export class TabStaffVisualizer {
  constructor(containerElement, onBeatClick = null) {
    this.container = containerElement;
    this.onBeatClick = onBeatClick;
    this.currentData = null;
    this.currentExercise = null;
    this.timeSignature = [4, 4];
    this.activeBeatNode = null;
    this.showNoteNames = true;
    this.showTabNumbers = true;
  }

  setSightReadingOptions({ showNoteNames, showTabNumbers }) {
    if (showNoteNames !== undefined) this.showNoteNames = showNoteNames;
    if (showTabNumbers !== undefined) this.showTabNumbers = showTabNumbers;
    if (this.container) {
      this.container.classList.toggle("hide-note-names", !this.showNoteNames);
      this.container.classList.toggle("hide-tab-numbers", !this.showTabNumbers);
    }
  }

  loadExercise(exercise) {
    this.currentExercise = exercise;
    this.currentData = exercise.tabData;
    this.timeSignature = exercise.timeSignature || [4, 4];
    this.render();
    this.setSightReadingOptions({
      showNoteNames: this.showNoteNames,
      showTabNumbers: this.showTabNumbers
    });
  }

  hasStandardStaff(exercise) {
    if (!exercise) return false;
    const id = exercise.id || "";
    if (id === "free-metronome") return false;
    if (id.startsWith("lb-s1-fe") || id.startsWith("bw-w1-fe") || id.startsWith("bw-w1-alt")) return false;
    return true;
  }

  getAccidentalSvg(noteName) {
    if (!noteName) return "";
    const n = noteName.toUpperCase();
    if (n.includes("#")) {
      return `<svg class="accidental-svg" viewBox="0 0 10 16" width="8" height="12"><line x1="3" y1="2" x2="3" y2="14" stroke="currentColor" stroke-width="1.3"/><line x1="7" y1="1" x2="7" y2="13" stroke="currentColor" stroke-width="1.3"/><line x1="1" y1="6" x2="9" y2="4.8" stroke="currentColor" stroke-width="1.7"/><line x1="1" y1="10.2" x2="9" y2="9" stroke="currentColor" stroke-width="1.7"/></svg>`;
    }
    if (n.includes("B") && (n.includes("FLAT") || /^[A-G]b$/i.test(noteName.trim()))) {
      return `<svg class="accidental-svg" viewBox="0 0 8 16" width="7" height="12"><line x1="2" y1="2" x2="2" y2="14" stroke="currentColor" stroke-width="1.3"/><path d="M2 8.2 C5 6.2, 7 8, 7 10.2 C7 12.2, 5 13.5, 2 12.5" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>`;
    }
    return "";
  }

  cleanNoteDisplay(noteName) {
    if (!noteName) return "";
    return noteName.replace(/#/g, "").replace(/b$/i, "").trim();
  }

  // Exact 1:1 pixel mapping onto the 5-Line Treble Staff (lines at y = 10, 16, 22, 28, 34)
  // Top line F5 = 10, Space E5 = 13, Line D5 = 16, Space C5 = 19, Line B4 = 22, Space A4 = 25, Line G4 = 28, Space F4 = 31, Line E4 = 34
  getStaffPitchY(b) {
    if (!b || typeof b.string !== "number" || b.fret === null || b.fret === undefined) {
      return 22; // Middle line B4 for generic chord rhythm slashes
    }
    const openMidi = { 1: 64, 2: 59, 3: 55, 4: 50, 5: 45, 6: 40 };
    const midi = (openMidi[b.string] || 64) + b.fret;
    const pitchClassSteps = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6]; // C, C#, D, D#, E, F, F#, G, G#, A, A#, B
    const octave = Math.floor(midi / 12) - 4;
    const diatonicStep = octave * 7 + pitchClassSteps[midi % 12];
    const y = 34 - (diatonicStep - 2) * 3;
    return Math.max(4, Math.min(43, y));
  }

  // Render ledger lines for notes below D4 (y >= 40) or above G5 (y <= 4)
  getLedgerLinesSvg(cy) {
    let lines = "";
    if (cy >= 40) {
      for (let ly = 40; ly <= cy; ly += 6) {
        lines += `<line x1="4" y1="${ly}" x2="22" y2="${ly}" stroke="rgba(255,255,255,0.48)" stroke-width="1.3"/>`;
      }
    } else if (cy <= 4) {
      lines += `<line x1="4" y1="4" x2="22" y2="4" stroke="rgba(255,255,255,0.48)" stroke-width="1.3"/>`;
    }
    return lines;
  }

  svgNoteOnStaff(b, dur, sym, beamType) {
    const col = "var(--note-default, #ffffff)";
    const cy = this.getStaffPitchY(b);
    const ledgers = this.getLedgerLinesSvg(cy);
    const stemTop = Math.max(3, cy - 17);

    // Whole Note (Open oval)
    if (dur >= 4) {
      return `<svg class="note-svg" viewBox="0 0 28 46" width="28" height="46">${ledgers}<ellipse cx="14" cy="${cy}" rx="5.2" ry="3.4" fill="none" stroke="${col}" stroke-width="2" transform="rotate(-15 14 ${cy})"/></svg>`;
    }
    // Dotted Half Note
    if (dur >= 3 || sym === "3/4") {
      return `<svg class="note-svg" viewBox="0 0 28 46" width="28" height="46">${ledgers}<ellipse cx="11.5" cy="${cy}" rx="4.7" ry="3.2" fill="none" stroke="${col}" stroke-width="1.9" transform="rotate(-18 11.5 ${cy})"/><line x1="15.8" y1="${cy}" x2="15.8" y2="${stemTop}" stroke="${col}" stroke-width="1.7" stroke-linecap="round"/><circle cx="20.8" cy="${cy - 0.5}" r="1.7" fill="${col}"/></svg>`;
    }
    // Half Note
    if (dur >= 2) {
      return `<svg class="note-svg" viewBox="0 0 28 46" width="28" height="46">${ledgers}<ellipse cx="11.5" cy="${cy}" rx="4.7" ry="3.2" fill="none" stroke="${col}" stroke-width="1.9" transform="rotate(-18 11.5 ${cy})"/><line x1="15.8" y1="${cy}" x2="15.8" y2="${stemTop}" stroke="${col}" stroke-width="1.7" stroke-linecap="round"/></svg>`;
    }
    // Eighth Note (Beamed pair or single flagged)
    if (sym === "1/8" || dur === 0.5) {
      if (beamType === "start" || beamType === "end") {
        // Stem rises cleanly to y=5 where the horizontal CSS beam connects the pair
        return `<svg class="note-svg beamed-note-svg" viewBox="0 0 28 46" width="28" height="46">${ledgers}<ellipse cx="11.5" cy="${cy}" rx="4.7" ry="3.2" fill="${col}" transform="rotate(-18 11.5 ${cy})"/><line x1="15.8" y1="${cy}" x2="15.8" y2="5" stroke="${col}" stroke-width="1.8" stroke-linecap="butt" class="beam-stem"/></svg>`;
      }
      // Single Eighth Note with engraved flag
      return `<svg class="note-svg single-eighth-svg" viewBox="0 0 28 46" width="28" height="46">${ledgers}<ellipse cx="11.5" cy="${cy}" rx="4.7" ry="3.2" fill="${col}" transform="rotate(-18 11.5 ${cy})"/><line x1="15.8" y1="${cy}" x2="15.8" y2="${stemTop}" stroke="${col}" stroke-width="1.7" stroke-linecap="round"/><path d="M 15.8 ${stemTop} C 19.5 ${stemTop + 2.5}, 21.5 ${stemTop + 6.5}, 19.5 ${stemTop + 11.5}" fill="none" stroke="${col}" stroke-width="1.8" stroke-linecap="round"/></svg>`;
    }
    // Quarter Note
    return `<svg class="note-svg" viewBox="0 0 28 46" width="28" height="46">${ledgers}<ellipse cx="11.5" cy="${cy}" rx="4.7" ry="3.2" fill="${col}" transform="rotate(-18 11.5 ${cy})"/><line x1="15.8" y1="${cy}" x2="15.8" y2="${stemTop}" stroke="${col}" stroke-width="1.7" stroke-linecap="round"/></svg>`;
  }

  svgWholeRest() {
    return `<svg class="rest-svg" viewBox="0 0 28 46" width="28" height="46"><rect x="8" y="16" width="12" height="5" fill="#f43f5e" rx="0.8"/></svg>`;
  }

  svgHalfRest() {
    return `<svg class="rest-svg" viewBox="0 0 28 46" width="28" height="46"><rect x="8" y="17" width="12" height="5" fill="#f43f5e" rx="0.8"/></svg>`;
  }

  svgQuarterRest() {
    return `<svg class="rest-svg" viewBox="0 0 28 46" width="28" height="46"><path d="M 11 11 L 17 17 L 11.5 22.5 L 17 28 C 13.5 27, 11 29.5, 13.5 32.5" fill="none" stroke="#f43f5e" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }

  svgEighthRest() {
    return `<svg class="rest-svg" viewBox="0 0 28 46" width="28" height="46"><circle cx="11.5" cy="18" r="2.4" fill="#f43f5e"/><path d="M 11.5 18 Q 14.5 19.5, 16.5 16 L 12 30" fill="none" stroke="#f43f5e" stroke-width="2" stroke-linecap="round"/></svg>`;
  }

  getNoteGlyph(b, isDual, beamType) {
    if (!isDual) return "";
    const dur = b.duration || 1;
    const sym = (b.symbol || "").toLowerCase();
    const isRest = b.type === "rest";
    const isSustain = b.isSustain || b.type === "sustain";

    if (isSustain) {
      return `<div class="std-hold-tie"><span class="tie-arc">&#8960;</span></div>`;
    }

    if (isRest) {
      if (dur >= 4) return `<div class="std-glyph-cell rest-cell">${this.svgWholeRest()}<span class="note-name-label rest-label">REST</span></div>`;
      if (dur >= 2) return `<div class="std-glyph-cell rest-cell">${this.svgHalfRest()}<span class="note-name-label rest-label">REST</span></div>`;
      if (sym === "1/8") return `<div class="std-glyph-cell rest-cell">${this.svgEighthRest()}<span class="note-name-label rest-label">REST</span></div>`;
      return `<div class="std-glyph-cell rest-cell">${this.svgQuarterRest()}<span class="note-name-label rest-label">REST</span></div>`;
    }

    const noteName = b.note || "";
    const accSvg = this.getAccidentalSvg(noteName);
    const cleanName = this.cleanNoteDisplay(noteName);
    const namePart = `<span class="note-name-label">${accSvg}${cleanName}</span>`;

    const svg = this.svgNoteOnStaff(b, dur, sym, beamType);
    const cellClass = (sym === "1/8" || dur === 0.5) && beamType ? `eighth-beamed-${beamType}` : "note-cell";
    return `<div class="std-glyph-cell ${cellClass}">${svg}${namePart}</div>`;
  }

  isEighthNote(b) {
    return b && !b.isSustain && b.type !== "sustain" && b.type !== "rest" && ((b.symbol || "").toLowerCase() === "1/8" || b.duration === 0.5);
  }

  renderChordStrings(b) {
    const str = b.string;
    let cells = "";
    for (let s = 1; s <= 6; s++) {
      let content = "";
      if (!b.isSustain && b.type !== "sustain" && b.type !== "rest") {
        if (str === "all") {
          content = `<span class="tab-chord-dot">&#9679;</span>`;
        } else if (str === "6-5" && (s === 6 || s === 5)) {
          content = `<span class="tab-chord-dot">&#9679;</span>`;
        } else if (str === "5-4" && (s === 5 || s === 4)) {
          content = `<span class="tab-chord-dot">&#9679;</span>`;
        } else if (str === "4-3" && (s === 4 || s === 3)) {
          content = `<span class="tab-chord-dot">&#9679;</span>`;
        } else if (str === "3-1" && s >= 1 && s <= 3) {
          content = `<span class="tab-chord-dot">&#9679;</span>`;
        } else if (str === "5-1" && s >= 1 && s <= 5) {
          content = `<span class="tab-chord-dot">&#9679;</span>`;
        } else if (str === "4-1" && s >= 1 && s <= 4) {
          content = `<span class="tab-chord-dot">&#9679;</span>`;
        } else if (typeof str === "number" && str === s) {
          content = `<span class="tab-fret-pill">${b.fret !== null && b.fret !== undefined ? b.fret : ""}</span>`;
        }
      } else if (b.type === "rest" && !b.isSustain && s === 3) {
        content = `<span class="tab-rest-mark">&#8211;</span>`;
      }
      cells += `<div class="tab-string-cell" data-string="${s}">${content}</div>`;
    }
    return cells;
  }

  render() {
    if (!this.currentData || !this.container) return;

    const totalMeasures = this.currentData.length;
    const isDualNotation = this.hasStandardStaff(this.currentExercise);
    const measuresPerSystem = 4;
    const systems = [];
    const timeSig = this.timeSignature;

    for (let i = 0; i < totalMeasures; i += measuresPerSystem) {
      systems.push(this.currentData.slice(i, i + measuresPerSystem));
    }

    let systemsHtml = "";

    systems.forEach((systemMeasures, sysIdx) => {
      let measuresHtml = "";

      systemMeasures.forEach((m, mInSysIdx) => {
        const mIdx = sysIdx * measuresPerSystem + mInSysIdx;
        const isLastMeasureOfPiece = mIdx === totalMeasures - 1;
        const beats = m.beats || [];
        const beatsCount = beats.length || 4;

        // Beam eighth notes that belong to the same beat pulse
        const beamMap = {};
        let bi = 0;
        while (bi < beats.length - 1) {
          if (this.isEighthNote(beats[bi]) && this.isEighthNote(beats[bi + 1]) && beats[bi].beat === beats[bi + 1].beat) {
            beamMap[bi] = "start";
            beamMap[bi + 1] = "end";
            bi += 2;
          } else {
            bi += 1;
          }
        }

        let beatColumnsHtml = "";

        for (let bIdx = 0; bIdx < beatsCount; bIdx++) {
          const b = beats[bIdx];
          const isRest = b.type === "rest";
          const isSustain = b.isSustain || b.type === "sustain";
          const beamType = beamMap[bIdx] || (this.isEighthNote(b) ? "single" : null);

          const stdGlyph = this.getNoteGlyph(b, isDualNotation, beamType);
          const tabStringCellsHtml = this.renderChordStrings(b);

          const pickText = (!isRest && !isSustain && b.pick && b.pick !== "-")
            ? (b.pick === "Up" ? "&#8593;" : (b.pick === "P" || b.pick === "I" || b.pick === "M" || b.pick === "A") ? b.pick : "&#8595;")
            : "";

          const beamClass = beamType ? `beam-${beamType}` : "";

          beatColumnsHtml += `
            <div class="measure-beat-column ${isRest ? 'is-rest-beat' : 'is-play-beat'} ${isSustain ? 'is-sustain-beat' : ''} ${beamClass}"
                 id="score-beat-${mIdx}-${bIdx}"
                 data-measure="${mIdx}" data-beat="${bIdx}"
                 title="Click to jump playhead to Bar ${m.measure || mIdx + 1}, Beat ${b.beat || bIdx + 1}">
              ${isDualNotation ? `<div class="std-staff-row five-line-stave">${stdGlyph}</div>` : ""}
              <div class="tab-strings-stack">
                ${tabStringCellsHtml}
              </div>
              <div class="tab-pick-row">
                ${pickText ? `<span class="pick-label">${pickText}</span>` : ""}
              </div>
            </div>
          `;
        }

        const chordBadge = m.chordName
          ? `<span class="chord-name-badge">${m.chordName}</span>`
          : "";

        measuresHtml += `
          <div class="score-measure-panel ${isLastMeasureOfPiece ? 'is-final-measure' : ''}" id="score-measure-${mIdx}">
            <div class="measure-top-meta">
              <span class="bar-num-label">Bar ${m.measure || mIdx + 1}</span>
              ${chordBadge}
            </div>
            <div class="measure-beats-grid" style="grid-template-columns: repeat(${beatsCount}, 1fr);">
              ${beatColumnsHtml}
            </div>
          </div>
        `;
      });

      const trebleClefSvg = `<svg class="treble-clef-svg" viewBox="0 0 26 58" width="15" height="38" fill="none">
        <path d="M13 52 L13 6 M13 6 C17 6,21 10,21 15 C21 20,13 23,11 29 C9 35,15 40,18 43 C21 46,19 51,13 51 C8 51,7 48,9 43 C11 38,15 35,15 29 C15 23,10 21,10 15 C10 10,13 6,13 6" stroke="#f97316" stroke-width="1.9" stroke-linecap="round"/>
        <circle cx="13" cy="52" r="2.8" fill="#f97316"/>
      </svg>`;

      const timeSigHtml = `<div class="time-sig-stack">
        <span class="time-sig-num">${timeSig[0] || 4}</span>
        <span class="time-sig-den">${timeSig[1] || 4}</span>
      </div>`;

      const systemClefHtml = `
        <div class="score-system-clef ${isDualNotation ? 'is-dual-mode' : 'is-tab-only-mode'}">
          ${isDualNotation ? `
            <div class="clef-standard-stave">
              ${trebleClefSvg}${timeSigHtml}
            </div>
          ` : ""}
          <div class="clef-tab-stave">
            <span class="tab-word-vert">T<br>A<br>B</span>
            ${!isDualNotation ? `<div class="time-sig-stack tab-time-sig">${timeSigHtml}</div>` : ""}
          </div>
        </div>
      `;

      systemsHtml += `
        <div class="score-system-row" id="score-system-${sysIdx}">
          ${systemClefHtml}
          <div class="score-measures-wrapper">
            ${measuresHtml}
          </div>
        </div>
      `;
    });

    this.container.innerHTML = `
      <div class="sheet-music-card ${isDualNotation ? 'has-dual-score' : 'has-tab-only-score'}">
        ${systemsHtml}
      </div>
    `;

    // Click-to-Seek on any beat column
    this.container.querySelectorAll(".measure-beat-column").forEach(col => {
      col.addEventListener("click", () => {
        const mIdx = parseInt(col.dataset.measure, 10);
        const bIdx = parseInt(col.dataset.beat, 10);
        if (this.onBeatClick) this.onBeatClick(mIdx, bIdx);
      });
    });
  }

  highlightBeat(measureIdx, beatIdx, isRest) {
    if (!this.container) return;

    if (this.activeBeatNode) {
      this.activeBeatNode.classList.remove("active-beat-glow", "active-rest-glow", "beam-active");
      this.activeBeatNode = null;
    }
    const allBeamActive = this.container.querySelectorAll(".beam-active");
    allBeamActive.forEach(el => el.classList.remove("beam-active"));

    const target = this.container.querySelector(`#score-beat-${measureIdx}-${beatIdx}`);
    if (target) {
      this.activeBeatNode = target;
      if (isRest) {
        target.classList.add("active-rest-glow");
      } else {
        target.classList.add("active-beat-glow");
        if (target.classList.contains("beam-end")) {
          const prev = this.container.querySelector(`#score-beat-${measureIdx}-${beatIdx - 1}`);
          if (prev && prev.classList.contains("beam-start")) {
            prev.classList.add("beam-active");
          }
        } else if (target.classList.contains("beam-start")) {
          target.classList.add("beam-active");
        }
      }

      if (beatIdx === 0 && measureIdx % 4 === 0) {
        const sysEl = this.container.querySelector(`#score-system-${Math.floor(measureIdx / 4)}`);
        if (sysEl) {
          sysEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      }
    }
  }

  reset() {
    if (this.activeBeatNode) {
      this.activeBeatNode.classList.remove("active-beat-glow", "active-rest-glow", "beam-active");
      this.activeBeatNode = null;
    }
    if (this.container) {
      const allBeamActive = this.container.querySelectorAll(".beam-active");
      allBeamActive.forEach(el => el.classList.remove("beam-active"));
    }
  }
}
