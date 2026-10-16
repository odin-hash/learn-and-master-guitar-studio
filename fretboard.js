// Luxury Fretboard Visualizer (Frets 0 to 14 with Muted String X Markers & Beginner Chord Modes)
export class FretboardVisualizer {
  constructor(containerElement) {
    this.container = containerElement;
    this.strings = [
      { num: 1, name: "E4", label: "1 (High E)" },
      { num: 2, name: "B3", label: "2 (B)" },
      { num: 3, name: "G3", label: "3 (G)" },
      { num: 4, name: "D3", label: "4 (D)" },
      { num: 5, name: "A2", label: "5 (A)" },
      { num: 6, name: "E2", label: "6 (Low E)" }
    ];
    this.frets = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
    this.chordMode = "full"; // "full" | "easy3" | "easy4"
    this.render();
  }

  setChordMode(mode) {
    this.chordMode = mode || "full";
  }

  render() {
    const inlayFrets = new Set([3, 5, 7, 9, 12]);
    this.container.innerHTML = `
      <div class="fretboard-card">
        <div class="fretboard-header-row" style="grid-template-columns: 82px repeat(${this.frets.length}, minmax(28px, 1fr));">
          <div class="string-header-blank">String</div>
          ${this.frets.map(f => {
            if (f === 0) return `<div class="fret-col-title nut-title">Open</div>`;
            if (f === 12) return `<div class="fret-col-title fret-inlay">${f} &bull;&bull;</div>`;
            if (inlayFrets.has(f)) return `<div class="fret-col-title fret-inlay">${f} &bull;</div>`;
            return `<div class="fret-col-title">${f}</div>`;
          }).join("")}
        </div>
        <div class="fretboard-neck-board" id="fretboard-neck-board">
          ${this.strings.map(s => `
            <div class="fret-string-row" data-string="${s.num}" style="grid-template-columns: 82px repeat(${this.frets.length}, minmax(28px, 1fr));">
              <div class="string-title">${s.label}</div>
              ${this.frets.map(f => `
                <div class="fret-space ${f === 0 ? 'nut-space' : ''}" data-string="${s.num}" data-fret="${f}">
                  <div class="finger-marker" id="fret-dot-${s.num}-${f}"></div>
                </div>
              `).join("")}
            </div>
          `).join("")}
          <div class="mute-damp-overlay" id="mute-damp-overlay">
            <div class="mute-damp-badge">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 6px;"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>
              PALM MUTE / REST - SILENCE ALL STRINGS
            </div>
          </div>
        </div>
      </div>
    `;
  }

  update(beatData, isRest, chordName = null) {
    const neck = this.container.querySelector("#fretboard-neck-board");
    const overlay = this.container.querySelector("#mute-damp-overlay");

    // Clear previous markers
    const dots = this.container.querySelectorAll(".finger-marker");
    dots.forEach(d => {
      d.className = "finger-marker";
      d.textContent = "";
    });

    if (isRest) {
      neck.classList.add("is-muted-state");
      overlay.style.display = "flex";
      return;
    }

    neck.classList.remove("is-muted-state");
    overlay.style.display = "none";

    if (!beatData) return;

    // Priority 1: If the beat is a specific single-string note (melody or arpeggio), show the exact note!
    // If chordName is also present, faintly ghost the background chord so the student sees the context.
    if (typeof beatData.string === "number" && beatData.fret !== null && beatData.fret !== undefined) {
      if (chordName) {
        this._highlightChord(chordName, true); // faint ghost chord
      }
      const s = beatData.string;
      const f = beatData.fret;
      const dot = this.container.querySelector(`#fret-dot-${s}-${f}`);
      if (dot) {
        dot.className = "finger-marker active-play-dot";
        dot.textContent = beatData.finger !== undefined && beatData.finger !== null ? beatData.finger : (f === 0 ? "0" : "");
      }
      return;
    }

    // Priority 2: Full chord strumming
    if (chordName) {
      this._highlightChord(chordName, false);
    }
  }

  _highlightChord(chord, isGhost = false) {
    const c = (chord || "").trim().toUpperCase();

    // Beginner 3-Note & 4-Note simplified shapes from Bonus Workshop Book (p. 9 & p. 38)
    const EASY3_MAP = {
      "C": { notes: [[3,0,"0"],[2,1,"1"],[1,0,"0"]], muted: [6,5,4] },
      "C MAJOR": { notes: [[3,0,"0"],[2,1,"1"],[1,0,"0"]], muted: [6,5,4] },
      "G": { notes: [[3,0,"0"],[2,0,"0"],[1,3,"3"]], muted: [6,5,4] },
      "G MAJOR": { notes: [[3,0,"0"],[2,0,"0"],[1,3,"3"]], muted: [6,5,4] },
      "G7": { notes: [[3,0,"0"],[2,0,"0"],[1,1,"1"]], muted: [6,5,4] },
      "AM": { notes: [[3,2,"2"],[2,1,"1"],[1,0,"0"]], muted: [6,5,4] },
      "E": { notes: [[3,1,"1"],[2,0,"0"],[1,0,"0"]], muted: [6,5,4] }
    };

    const EASY4_MAP = {
      "C": { notes: [[4,2,"2"],[3,0,"0"],[2,1,"1"],[1,0,"0"]], muted: [6,5] },
      "C MAJOR": { notes: [[4,2,"2"],[3,0,"0"],[2,1,"1"],[1,0,"0"]], muted: [6,5] },
      "G": { notes: [[4,0,"0"],[3,0,"0"],[2,0,"0"],[1,3,"3"]], muted: [6,5] },
      "G7": { notes: [[4,0,"0"],[3,0,"0"],[2,0,"0"],[1,1,"1"]], muted: [6,5] },
      "AM": { notes: [[4,2,"2"],[3,2,"3"],[2,1,"1"],[1,0,"0"]], muted: [6,5] },
      "E": { notes: [[4,2,"2"],[3,1,"1"],[2,0,"0"],[1,0,"0"]], muted: [6,5] },
      "F": { notes: [[4,3,"3"],[3,2,"2"],[2,1,"1"],[1,1,"1"]], muted: [6,5] },
      "F BARRE": { notes: [[4,3,"3"],[3,2,"2"],[2,1,"1"],[1,1,"1"]], muted: [6,5] }
    };

    const FULL_CHORD_MAP = {
      "C": { notes: [[5,3,"3"],[4,2,"2"],[3,0,"0"],[2,1,"1"],[1,0,"0"]], muted: [6] },
      "C MAJOR": { notes: [[5,3,"3"],[4,2,"2"],[3,0,"0"],[2,1,"1"],[1,0,"0"]], muted: [6] },
      "C7": { notes: [[5,3,"3"],[4,2,"2"],[3,3,"4"],[2,1,"1"],[1,0,"0"]], muted: [6] },
      "CMAJ7": { notes: [[5,3,"3"],[4,2,"2"],[3,0,"0"],[2,0,"0"],[1,0,"0"]], muted: [6] },
      "CADD9": { notes: [[5,3,"2"],[4,2,"1"],[3,0,"0"],[2,3,"3"],[1,0,"0"]], muted: [6] },
      "CSUS": { notes: [[5,3,"3"],[4,3,"4"],[3,0,"0"],[2,1,"1"],[1,0,"0"]], muted: [6] },
      "CM": { notes: [[5,3,"1"],[4,5,"3"],[3,5,"4"],[2,4,"2"],[1,3,"1"]], muted: [6] },
      "C9": { notes: [[5,3,"2"],[4,2,"1"],[3,3,"3"],[2,3,"3"],[1,3,"3"]], muted: [6] },
      "C BARRE": { notes: [[5,3,"1"],[4,5,"3"],[3,5,"3"],[2,5,"3"],[1,3,"1"]], muted: [6] },
      "C7 BARRE": { notes: [[5,3,"1"],[4,5,"3"],[3,3,"1"],[2,5,"4"],[1,3,"1"]], muted: [6] },
      "G": { notes: [[6,3,"2"],[5,2,"1"],[4,0,"0"],[3,0,"0"],[2,0,"0"],[1,3,"3"]], muted: [] },
      "G MAJOR": { notes: [[6,3,"2"],[5,2,"1"],[4,0,"0"],[3,0,"0"],[2,0,"0"],[1,3,"3"]], muted: [] },
      "G7": { notes: [[6,3,"3"],[5,2,"2"],[4,0,"0"],[3,0,"0"],[2,0,"0"],[1,1,"1"]], muted: [] },
      "GADD9": { notes: [[6,3,"2"],[5,0,"0"],[4,0,"0"],[3,2,"1"],[2,0,"0"],[1,3,"3"]], muted: [] },
      "GM": { notes: [[6,3,"1"],[5,5,"3"],[4,5,"4"],[3,3,"1"],[2,3,"1"],[1,3,"1"]], muted: [] },
      "G13": { notes: [[6,3,"1"],[4,3,"2"],[3,4,"3"],[2,5,"4"]], muted: [5,1] },
      "G9": { notes: [[6,3,"2"],[5,2,"1"],[4,3,"3"],[3,2,"1"],[2,3,"4"]], muted: [1] },
      "G BARRE": { notes: [[6,3,"1"],[5,5,"3"],[4,5,"4"],[3,4,"2"],[2,3,"1"],[1,3,"1"]], muted: [] },
      "D": { notes: [[4,0,"0"],[3,2,"1"],[2,3,"3"],[1,2,"2"]], muted: [6,5] },
      "D MAJOR": { notes: [[4,0,"0"],[3,2,"1"],[2,3,"3"],[1,2,"2"]], muted: [6,5] },
      "D7": { notes: [[4,0,"0"],[3,2,"2"],[2,1,"1"],[1,2,"3"]], muted: [6,5] },
      "DM": { notes: [[4,0,"0"],[3,2,"2"],[2,3,"3"],[1,1,"1"]], muted: [6,5] },
      "DM7": { notes: [[4,0,"0"],[3,2,"2"],[2,1,"1"],[1,1,"1"]], muted: [6,5] },
      "DM9": { notes: [[5,5,"2"],[4,3,"1"],[3,5,"3"],[2,5,"4"]], muted: [6,1] },
      "DM11": { notes: [[4,0,"0"],[3,0,"0"],[2,1,"1"],[1,1,"1"]], muted: [6,5] },
      "DSUS": { notes: [[4,0,"0"],[3,2,"1"],[2,3,"3"],[1,3,"4"]], muted: [6,5] },
      "D9": { notes: [[5,5,"2"],[4,4,"1"],[3,5,"3"],[2,5,"3"]], muted: [6,1] },
      "D13": { notes: [[6,10,"1"],[4,10,"2"],[3,11,"3"],[2,12,"4"]], muted: [5,1] },
      "D7#9": { notes: [[5,5,"2"],[4,4,"1"],[3,5,"3"],[2,6,"4"]], muted: [6,1] },
      "D BARRE": { notes: [[5,5,"1"],[4,7,"3"],[3,7,"3"],[2,7,"3"],[1,5,"1"]], muted: [6] },
      "A": { notes: [[5,0,"0"],[4,2,"1"],[3,2,"2"],[2,2,"3"],[1,0,"0"]], muted: [6] },
      "A7": { notes: [[5,0,"0"],[4,2,"2"],[3,0,"0"],[2,2,"3"],[1,0,"0"]], muted: [6] },
      "AM": { notes: [[5,0,"0"],[4,2,"2"],[3,2,"3"],[2,1,"1"],[1,0,"0"]], muted: [6] },
      "AM7": { notes: [[5,0,"0"],[4,2,"2"],[3,0,"0"],[2,1,"1"],[1,0,"0"]], muted: [6] },
      "AM9": { notes: [[5,0,"0"],[4,2,"1"],[3,4,"3"],[2,1,"1"],[1,0,"0"]], muted: [6] },
      "ASUS": { notes: [[5,0,"0"],[4,2,"1"],[3,2,"2"],[2,3,"3"],[1,0,"0"]], muted: [6] },
      "A13": { notes: [[6,5,"1"],[4,5,"2"],[3,6,"3"],[2,7,"4"]], muted: [5,1] },
      "A BARRE": { notes: [[6,5,"1"],[5,7,"3"],[4,7,"4"],[3,6,"2"],[2,5,"1"],[1,5,"1"]], muted: [] },
      "E": { notes: [[6,0,"0"],[5,2,"2"],[4,2,"3"],[3,1,"1"],[2,0,"0"],[1,0,"0"]], muted: [] },
      "E7": { notes: [[6,0,"0"],[5,2,"2"],[4,0,"0"],[3,1,"1"],[2,0,"0"],[1,0,"0"]], muted: [] },
      "EM": { notes: [[6,0,"0"],[5,2,"2"],[4,2,"3"],[3,0,"0"],[2,0,"0"],[1,0,"0"]], muted: [] },
      "EM7": { notes: [[6,0,"0"],[5,2,"1"],[4,2,"2"],[3,0,"0"],[2,3,"3"],[1,0,"0"]], muted: [] },
      "ESUS": { notes: [[6,0,"0"],[5,2,"2"],[4,2,"3"],[3,2,"4"],[2,0,"0"],[1,0,"0"]], muted: [] },
      "E9": { notes: [[6,0,"0"],[5,7,"2"],[4,6,"1"],[3,7,"3"],[2,7,"3"]], muted: [1] },
      "E7#9": { notes: [[6,0,"0"],[5,7,"2"],[4,6,"1"],[3,7,"3"],[2,8,"4"]], muted: [1] },
      "F": { notes: [[6,1,"1"],[5,3,"3"],[4,3,"4"],[3,2,"2"],[2,1,"1"],[1,1,"1"]], muted: [] },
      "F MAJOR": { notes: [[6,1,"1"],[5,3,"3"],[4,3,"4"],[3,2,"2"],[2,1,"1"],[1,1,"1"]], muted: [] },
      "F BARRE": { notes: [[6,1,"1"],[5,3,"3"],[4,3,"4"],[3,2,"2"],[2,1,"1"],[1,1,"1"]], muted: [] },
      "FMAJ7": { notes: [[4,3,"3"],[3,2,"2"],[2,1,"1"],[1,0,"0"]], muted: [6,5] },
      "FMAJ7#11": { notes: [[4,3,"3"],[3,2,"2"],[2,0,"0"],[1,0,"0"]], muted: [6,5] },
      "FM": { notes: [[6,1,"1"],[5,3,"3"],[4,3,"4"],[3,1,"1"],[2,1,"1"],[1,1,"1"]], muted: [] },
      "F9": { notes: [[5,8,"2"],[4,7,"1"],[3,8,"3"],[2,8,"4"]], muted: [6,1] },
      "B7": { notes: [[5,2,"2"],[4,1,"1"],[3,2,"3"],[2,0,"0"],[1,2,"4"]], muted: [6] },
      "BM": { notes: [[5,2,"1"],[4,4,"3"],[3,4,"4"],[2,3,"2"],[1,2,"1"]], muted: [6] },
      "BM7": { notes: [[5,2,"1"],[4,4,"3"],[3,2,"1"],[2,3,"2"],[1,2,"1"]], muted: [6] },
      "B7#9": { notes: [[5,2,"1"],[4,1,"3"],[3,2,"3"],[2,3,"4"]], muted: [6,1] },
      "BB BARRE": { notes: [[5,1,"1"],[4,3,"3"],[3,3,"3"],[2,3,"3"],[1,1,"1"]], muted: [6] },
      "F#M": { notes: [[6,2,"1"],[5,4,"3"],[4,4,"4"],[3,2,"1"],[2,2,"1"],[1,2,"1"]], muted: [] },
      "F#M7": { notes: [[6,2,"1"],[5,4,"3"],[4,2,"1"],[3,2,"1"],[2,2,"1"],[1,2,"1"]], muted: [] },
      "F#7": { notes: [[6,2,"1"],[5,4,"3"],[4,2,"1"],[3,3,"2"],[2,2,"1"],[1,2,"1"]], muted: [] },
      "C#M7": { notes: [[5,4,"1"],[4,6,"3"],[3,4,"1"],[2,5,"2"],[1,4,"1"]], muted: [6] },
      "C#7": { notes: [[5,4,"1"],[4,6,"3"],[3,4,"1"],[2,6,"4"],[1,4,"1"]], muted: [6] },
      "G#M7": { notes: [[6,4,"1"],[5,6,"3"],[4,4,"1"],[3,4,"1"],[2,4,"1"],[1,4,"1"]], muted: [] },
      "AB BARRE": { notes: [[6,4,"1"],[5,6,"3"],[4,6,"4"],[3,5,"2"],[2,4,"1"],[1,4,"1"]], muted: [] },
      "EB BARRE": { notes: [[5,6,"1"],[4,8,"3"],[3,8,"3"],[2,8,"3"],[1,6,"1"]], muted: [6] },
      "DB BARRE": { notes: [[5,4,"1"],[4,6,"3"],[3,6,"3"],[2,6,"3"],[1,4,"1"]], muted: [6] },
      "E5": { notes: [[6,0,"0"],[5,2,"1"]], muted: [4,3,2,1] },
      "G5": { notes: [[6,3,"1"],[5,5,"3"]], muted: [4,3,2,1] },
      "A5": { notes: [[5,0,"0"],[4,2,"1"]], muted: [6,3,2,1] },
      "B5": { notes: [[5,2,"1"],[4,4,"3"]], muted: [6,3,2,1] },
      "C5": { notes: [[5,3,"1"],[4,5,"3"]], muted: [6,3,2,1] },
      "D5": { notes: [[5,5,"1"],[4,7,"3"]], muted: [6,3,2,1] },
      "A TRIAD": { notes: [[3,2,"1"],[2,2,"2"],[1,0,"0"]], muted: [6,5,4] },
      "D TRIAD": { notes: [[3,2,"1"],[2,3,"3"],[1,2,"2"]], muted: [6,5,4] },
      "E TRIAD": { notes: [[3,1,"1"],[2,0,"0"],[1,0,"0"]], muted: [6,5,4] },
      "G/B": { notes: [[5,2,"1"],[4,0,"0"],[3,0,"0"],[2,3,"3"],[1,3,"4"]], muted: [6] },
      "D/F#": { notes: [[6,2,"1"],[5,0,"0"],[4,0,"0"],[3,2,"2"],[2,3,"4"],[1,2,"3"]], muted: [] },
      "C/E": { notes: [[6,0,"0"],[5,3,"3"],[4,2,"2"],[3,0,"0"],[2,1,"1"],[1,0,"0"]], muted: [] },
      "C/G": { notes: [[6,3,"3"],[5,3,"4"],[4,2,"2"],[3,0,"0"],[2,1,"1"],[1,0,"0"]], muted: [] },
      "G 4THS": { notes: [[4,5,"1"],[3,5,"1"]], muted: [6,5,2,1] },
      "A 4THS": { notes: [[4,7,"1"],[3,7,"1"]], muted: [6,5,2,1] },
      "B 4THS": { notes: [[4,9,"1"],[3,9,"1"]], muted: [6,5,2,1] },
      "C 4THS": { notes: [[4,10,"1"],[3,10,"1"]], muted: [6,5,2,1] }
    };

    let shape = FULL_CHORD_MAP[c];
    if (this.chordMode === "easy3" && EASY3_MAP[c]) shape = EASY3_MAP[c];
    if (this.chordMode === "easy4" && EASY4_MAP[c]) shape = EASY4_MAP[c];

    if (shape) {
      shape.notes.forEach(([s, f, label]) => this._activate(s, f, label, isGhost));
      if (!isGhost && shape.muted) {
        shape.muted.forEach(s => this._markMutedString(s));
      }
    }
  }

  _activate(s, f, label, isGhost = false) {
    const dot = this.container.querySelector(`#fret-dot-${s}-${f}`);
    if (dot) {
      dot.classList.add(isGhost ? "ghost-chord-dot" : "active-play-dot");
      dot.textContent = label;
    }
  }

  _markMutedString(s) {
    const dot = this.container.querySelector(`#fret-dot-${s}-0`);
    if (dot && !dot.classList.contains("active-play-dot")) {
      dot.classList.add("muted-string-x");
      dot.textContent = "X";
    }
  }

  reset() {
    const dots = this.container.querySelectorAll(".finger-marker");
    dots.forEach(d => {
      d.className = "finger-marker";
      d.textContent = "";
    });
    const neck = this.container.querySelector("#fretboard-neck-board");
    if (neck) neck.classList.remove("is-muted-state");
    const overlay = this.container.querySelector("#mute-damp-overlay");
    if (overlay) overlay.style.display = "none";
  }
}
