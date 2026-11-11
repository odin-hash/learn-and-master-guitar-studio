/**
 * <FoundationsPrimer /> — Interactive Editorial Notation & Rhythm Primer
 * ----------------------------------------------------------------------
 * Renders:
 * 1) Categorized 4-part Theory & Notation Matrix with live VexFlow Bravura SVGs
 * 2) Tap-to-Learn Sandbox Drawer comparing Wrong vs. Right 2-measure demos
 *    with synchronized Karplus-Strong audio + 4-beat counter
 * 3) Embedded 60-Second No-Tab Staff Sight-Reading & Rhythm Flashcard Drill
 */

import { PRIMER_CATEGORIES, PRIMER_ITEMS, PRIMER_QUIZ_BANK } from "../data/primerCatalog.js";
import { buildCurriculumMeasures } from "../data/curriculumExercises.js";
import { ScoreRenderer } from "./ScoreRenderer.js";

export class FoundationsPrimer {
  constructor(rootEl, audioEngine, options = {}) {
    this.root = rootEl;
    this.audio = audioEngine;
    this.onNavigateToExercise = options.onNavigateToExercise || null;
    this.onEnterStudio = options.onEnterStudio || null;

    this.activeCategoryFilter = "all";
    this.searchQuery = "";
    this.activeItem = null;
    this.drawerMode = "demo"; // "demo" | "quiz"

    // Sandbox audio/animation playback state
    this._playTimerId = null;
    this._playRafId = null;
    this._playingKind = null; // "wrong" | "right" | null
    this._playEvents = [];
    this._wrongRenderer = null;
    this._rightRenderer = null;

    // 60s Quick Drill Quiz state
    this._quizTimerId = null;
    this._quizSecondsLeft = 60;
    this._quizScore = 0;
    this._quizTotal = 0;
    this._quizStreak = 0;
    this._quizBestStreak = 0;
    this._quizDeck = [];
    this._quizIndex = 0;
    this._quizAnswered = false;

    this.renderShell();
  }

  getVexFlow() {
    if (typeof window === "undefined") return null;
    if (window.Vex && window.Vex.Flow) return window.Vex.Flow;
    if (window.Vex && window.Vex.Renderer) return window.Vex;
    return null;
  }

  escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  renderShell() {
    if (!this.root) return;

    this.root.innerHTML = `
      <div class="primer-page-sheet">
        <header class="primer-hero">
          <div class="primer-hero-meta">
            <span class="primer-kicker">MUSIC THEORY &amp; SIGHT-READING FOUNDATIONS</span>
            <span class="primer-badge-count">${PRIMER_ITEMS.length} Live Reference Symbols</span>
          </div>
          <div class="primer-hero-row">
            <div>
              <h1 class="primer-title">Notation &amp; Rhythm Primer</h1>
              <p class="primer-lead">
                Learn to read standard treble notation and guitar tablature side by side.
                Tap any symbol row to open an interactive Wrong-vs-Right audio comparison and a 60-second sight-reading drill.
              </p>
            </div>
            <div class="primer-hero-actions">
              <button type="button" class="primer-btn-secondary" id="primer-btn-quick-quiz">
                &#9201; 60s Staff Flashcard Drill
              </button>
              <button type="button" class="primer-btn-primary" id="primer-btn-enter-studio">
                Open Curriculum Studio &rarr;
              </button>
            </div>
          </div>

          <div class="primer-filter-bar">
            <div class="primer-cat-pills" id="primer-cat-pills" role="tablist" aria-label="Primer Categories">
              <button type="button" class="primer-cat-pill active" data-cat="all">All Symbols</button>
              ${PRIMER_CATEGORIES.map(c => `
                <button type="button" class="primer-cat-pill" data-cat="${c.id}">${c.letter.toUpperCase()}. ${this.escapeHtml(c.title)}</button>
              `).join("")}
            </div>
            <div class="primer-search-wrap">
              <input type="text" id="primer-search-input" class="primer-search-input" placeholder="Filter symbols..." autocomplete="off">
            </div>
          </div>
        </header>

        <div class="primer-categories-stack" id="primer-categories-stack"></div>
      </div>

      <!-- TAP-TO-LEARN SLIDE-OVER SANDBOX DRAWER -->
      <div class="primer-sandbox-backdrop" id="primer-sandbox-backdrop" hidden></div>
      <aside class="primer-sandbox-drawer" id="primer-sandbox-drawer" aria-hidden="true" aria-label="Interactive Symbol Sandbox">
        <div class="sandbox-header">
          <div class="sandbox-header-text">
            <div class="sandbox-cat-crumb" id="sandbox-cat-crumb">THEORY SANDBOX</div>
            <h2 class="sandbox-title" id="sandbox-title">Symbol Sandbox</h2>
          </div>
          <button type="button" class="sandbox-close-btn" id="sandbox-close-btn" aria-label="Close Sandbox Drawer">&times;</button>
        </div>

        <div class="sandbox-body" id="sandbox-demo-body">
          <p class="sandbox-explanation" id="sandbox-explanation"></p>
          <div class="sandbox-tip-box" id="sandbox-tip-box"></div>

          <!-- Synchronized 4-Beat Visual Counter -->
          <div class="sandbox-beat-tracker">
            <div class="sandbox-beat-header">
              <span class="sandbox-beat-title">Visual Beat Counter</span>
              <span class="sandbox-beat-mode-lbl" id="sandbox-active-mode-lbl">Select Wrong or Right below to hear</span>
            </div>
            <div class="sandbox-beat-pills" id="sandbox-beat-pills">
              <div class="sandbox-beat-pill" data-beat="1">1</div>
              <div class="sandbox-beat-pill" data-beat="2">2</div>
              <div class="sandbox-beat-pill" data-beat="3">3</div>
              <div class="sandbox-beat-pill" data-beat="4">4</div>
            </div>
            <div class="sandbox-cue-banner" id="sandbox-cue-banner">Tap Play on either comparison measure to hear exact picking, ties, and rest damping.</div>
          </div>

          <!-- 2-Measure Interactive Comparisons -->
          <div class="sandbox-compare-card is-wrong" id="sandbox-wrong-card">
            <div class="compare-card-top">
              <div>
                <span class="compare-tag is-wrong">Wrong Way</span>
                <h3 class="compare-title" id="sandbox-wrong-title">Common Mistake</h3>
              </div>
              <button type="button" class="compare-play-btn is-wrong" id="btn-play-wrong">&#9654; Hear Mistake</button>
            </div>
            <p class="compare-summary" id="sandbox-wrong-summary"></p>
            <div class="compare-vf-host" id="sandbox-wrong-vf"></div>
          </div>

          <div class="sandbox-compare-card is-right" id="sandbox-right-card">
            <div class="compare-card-top">
              <div>
                <span class="compare-tag is-right">Right Way</span>
                <h3 class="compare-title" id="sandbox-right-title">Correct Execution</h3>
              </div>
              <button type="button" class="compare-play-btn is-right" id="btn-play-right">&#9654; Hear Right Way</button>
            </div>
            <p class="compare-summary" id="sandbox-right-summary"></p>
            <div class="compare-vf-host" id="sandbox-right-vf"></div>
          </div>

          <div class="sandbox-footer-cta">
            <button type="button" class="primer-btn-primary sandbox-drill-launch" id="btn-launch-quick-drill">
              &#9201; Practice This in a Quick Drill (60s No-Tab Quiz)
            </button>
            <button type="button" class="primer-btn-secondary" id="btn-jump-related-lesson">
              Open Related Curriculum Lesson &rarr;
            </button>
          </div>
        </div>

        <!-- 60-SECOND FLASHCARD MINI-QUIZ MODE -->
        <div class="sandbox-body" id="sandbox-quiz-body" hidden>
          <div class="quiz-topbar">
            <button type="button" class="micro-pill" id="btn-quiz-back-demo">&larr; Back to Sandbox</button>
            <div class="quiz-stats-cluster">
              <span class="quiz-stat-pill is-timer" id="quiz-timer-pill">60s</span>
              <span class="quiz-stat-pill" id="quiz-score-pill">Score: 0/0</span>
              <span class="quiz-stat-pill" id="quiz-streak-pill">Streak: 0</span>
            </div>
          </div>

          <div id="quiz-active-stage">
            <div class="quiz-card">
              <div class="quiz-card-meta">
                <span class="quiz-tag" id="quiz-card-tag">Treble Staff · No TAB</span>
                <button type="button" class="micro-pill" id="btn-quiz-hear-note">&#127925; Hear Reference</button>
              </div>
              <h3 class="quiz-prompt" id="quiz-card-prompt">Identify this note on the Standard Staff:</h3>
              <div class="quiz-staff-stage" id="quiz-staff-stage"></div>
              <div class="quiz-options-grid" id="quiz-options-grid"></div>
              <div class="quiz-feedback-bar" id="quiz-feedback-bar" hidden></div>
            </div>
          </div>

          <div id="quiz-summary-stage" hidden>
            <div class="quiz-summary-card">
              <div class="quiz-summary-kicker">60-SECOND DRILL COMPLETE</div>
              <h3 class="quiz-summary-title" id="quiz-summary-headline">Great Session!</h3>
              <div class="quiz-summary-metrics" id="quiz-summary-metrics"></div>
              <div class="quiz-summary-actions">
                <button type="button" class="primer-btn-primary" id="btn-quiz-restart">Play Another 60s Round</button>
                <button type="button" class="primer-btn-secondary" id="btn-quiz-to-studio">Continue in Curriculum Studio &rarr;</button>
              </div>
            </div>
          </div>
        </div>
      </aside>
    `;

    this.bindEvents();
    this.renderMatrix();
  }

  bindEvents() {
    const pills = this.root.querySelectorAll("#primer-cat-pills .primer-cat-pill");
    pills.forEach(btn => {
      btn.addEventListener("click", () => {
        this.activeCategoryFilter = btn.dataset.cat;
        pills.forEach(b => b.classList.toggle("active", b === btn));
        this.renderMatrix();
      });
    });

    const searchInput = this.root.querySelector("#primer-search-input");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.searchQuery = e.target.value || "";
        this.renderMatrix();
      });
    }

    const btnEnterStudio = this.root.querySelector("#primer-btn-enter-studio");
    if (btnEnterStudio) {
      btnEnterStudio.addEventListener("click", () => {
        this.closeSandbox();
        if (this.onEnterStudio) this.onEnterStudio();
      });
    }

    const btnTopQuiz = this.root.querySelector("#primer-btn-quick-quiz");
    if (btnTopQuiz) {
      btnTopQuiz.addEventListener("click", () => {
        this.openSandbox(PRIMER_ITEMS[0].id, { startQuizImmediately: true, focusCategory: "all" });
      });
    }

    const closeBtn = this.root.querySelector("#sandbox-close-btn");
    const backdrop = this.root.querySelector("#primer-sandbox-backdrop");
    if (closeBtn) closeBtn.addEventListener("click", () => this.closeSandbox());
    if (backdrop) backdrop.addEventListener("click", () => this.closeSandbox());

    document.addEventListener("keydown", (e) => {
      const drawer = this.root && this.root.querySelector("#primer-sandbox-drawer");
      if (e.key === "Escape" && drawer && drawer.classList.contains("is-open")) {
        this.closeSandbox();
      }
    });

    const btnPlayWrong = this.root.querySelector("#btn-play-wrong");
    const btnPlayRight = this.root.querySelector("#btn-play-right");
    if (btnPlayWrong) {
      btnPlayWrong.addEventListener("click", () => {
        if (this._playingKind === "wrong") this.stopSandboxPlayback();
        else this.playSandboxExample("wrong");
      });
    }
    if (btnPlayRight) {
      btnPlayRight.addEventListener("click", () => {
        if (this._playingKind === "right") this.stopSandboxPlayback();
        else this.playSandboxExample("right");
      });
    }

    const btnLaunchQuiz = this.root.querySelector("#btn-launch-quick-drill");
    if (btnLaunchQuiz) {
      btnLaunchQuiz.addEventListener("click", () => {
        this.stopSandboxPlayback();
        this.startQuickDrill(this.activeItem ? this.activeItem.categoryId : "all");
      });
    }

    const btnJumpLesson = this.root.querySelector("#btn-jump-related-lesson");
    if (btnJumpLesson) {
      btnJumpLesson.addEventListener("click", () => {
        const targetId = this.activeItem && this.activeItem.linkedExerciseId;
        this.closeSandbox();
        if (targetId && this.onNavigateToExercise) {
          this.onNavigateToExercise(targetId);
        } else if (this.onEnterStudio) {
          this.onEnterStudio();
        }
      });
    }

    const btnBackDemo = this.root.querySelector("#btn-quiz-back-demo");
    if (btnBackDemo) {
      btnBackDemo.addEventListener("click", () => {
        this.stopQuizTimer();
        this.showDrawerMode("demo");
      });
    }

    const btnHearQuiz = this.root.querySelector("#btn-quiz-hear-note");
    if (btnHearQuiz) {
      btnHearQuiz.addEventListener("click", () => {
        const q = this._quizDeck[this._quizIndex];
        if (q && q.audioEvent && this.audio) {
          this.audio.init();
          const t = (this.audio.audioCtx && this.audio.audioCtx.currentTime > 0) ? this.audio.audioCtx.currentTime + 0.02 : 0;
          this.audio.playNoteEvent(t, q.audioEvent, null, 0.9);
        }
      });
    }

    const btnQuizRestart = this.root.querySelector("#btn-quiz-restart");
    if (btnQuizRestart) {
      btnQuizRestart.addEventListener("click", () => {
        this.startQuickDrill(this.activeItem ? this.activeItem.categoryId : "all");
      });
    }

    const btnQuizStudio = this.root.querySelector("#btn-quiz-to-studio");
    if (btnQuizStudio) {
      btnQuizStudio.addEventListener("click", () => {
        const targetId = this.activeItem && this.activeItem.linkedExerciseId;
        this.closeSandbox();
        if (targetId && this.onNavigateToExercise) this.onNavigateToExercise(targetId);
        else if (this.onEnterStudio) this.onEnterStudio();
      });
    }
  }

  renderMatrix() {
    const stack = this.root.querySelector("#primer-categories-stack");
    if (!stack) return;

    const query = this.searchQuery.trim().toLowerCase();
    const catsToRender = PRIMER_CATEGORIES.filter(cat =>
      this.activeCategoryFilter === "all" || cat.id === this.activeCategoryFilter
    );

    let sectionsHtml = "";
    const itemsToEngrave = [];

    catsToRender.forEach((cat) => {
      const catItems = PRIMER_ITEMS.filter(item => {
        if (item.categoryId !== cat.id) return false;
        if (!query) return true;
        return (
          item.name.toLowerCase().includes(query) ||
          item.whatItMeans.toLowerCase().includes(query) ||
          item.howToPlay.toLowerCase().includes(query) ||
          cat.title.toLowerCase().includes(query)
        );
      });

      if (catItems.length === 0) return;

      const rowsHtml = catItems.map((item) => {
        itemsToEngrave.push(item);
        const kind = item.symbolSpec && item.symbolSpec.kind;
        const isTallCell = kind === "tab-vs-std" || kind === "open-strings" || kind === "string-circles";
        return `
          <tr class="primer-row" data-primer-id="${item.id}" tabindex="0" role="button" aria-label="Open interactive demo for ${this.escapeHtml(item.name)}">
            <td class="primer-col-symbol">
              <div class="primer-vf-cell symbol-preview-box ${isTallCell ? "is-tall" : ""}" id="primer-sym-${item.id}"></div>
            </td>
            <td class="primer-col-name">
              <div class="primer-item-name">${this.escapeHtml(item.name)}</div>
            </td>
            <td class="primer-col-meaning">${this.escapeHtml(item.whatItMeans)}</td>
            <td class="primer-col-guitar">${this.escapeHtml(item.howToPlay)}</td>
            <td class="primer-col-action">
              <button type="button" class="primer-demo-btn" data-demo-id="${item.id}">
                Interactive Demo
              </button>
            </td>
          </tr>
        `;
      }).join("");

      sectionsHtml += `
        <section class="primer-cat-section" id="primer-sec-${cat.id}">
          <div class="primer-cat-head">
            <div class="primer-cat-kicker">${cat.letter.toUpperCase()} &middot; CATEGORY</div>
            <h2 class="primer-cat-title">${this.escapeHtml(cat.title)}</h2>
            <p class="primer-cat-sub">${this.escapeHtml(cat.subtitle)}</p>
          </div>

          <div class="primer-table-wrap">
            <table class="primer-table">
              <thead>
                <tr>
                  <th class="primer-th-sym">Symbol</th>
                  <th class="primer-th-name">Name</th>
                  <th class="primer-th-mean">What It Means</th>
                  <th class="primer-th-play">How to Play It on Guitar</th>
                  <th class="primer-th-act">Interactive Demo</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml}
              </tbody>
            </table>
          </div>
        </section>
      `;
    });

    if (!sectionsHtml) {
      sectionsHtml = `<div class="primer-empty-state">No notation symbols matching "${this.escapeHtml(this.searchQuery)}".</div>`;
    }

    stack.innerHTML = sectionsHtml;

    // Render all live VexFlow symbols synchronously
    itemsToEngrave.forEach((item) => {
      const host = stack.querySelector(`#primer-sym-${item.id}`);
      if (host) this.renderLiveSymbolSvg(host, item.symbolSpec);
    });

    // Attach tap/click handlers on rows & demo buttons
    stack.querySelectorAll(".primer-row").forEach((row) => {
      row.addEventListener("click", () => {
        this.openSandbox(row.dataset.primerId);
      });
      row.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this.openSandbox(row.dataset.primerId);
        }
      });
    });

    stack.querySelectorAll(".primer-demo-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.openSandbox(btn.dataset.demoId);
      });
    });
  }

  refreshSymbolsIfNeeded() {
    if (!this.root) return;
    const svgs = this.root.querySelectorAll(".primer-vf-svg");
    const needsRefit = Array.from(svgs).some(svg => svg.dataset.bboxFitted !== "1");
    if (needsRefit) {
      this.renderCategories();
    }
  }

  /**
   * Renders an authentic VexFlow 4 symbol vignette for any row in the Primer Matrix.
   */
  renderLiveSymbolSvg(targetEl, spec) {
    if (!targetEl || !spec) return;
    const VF = this.getVexFlow();
    if (!VF) return;

    if (typeof VF.setMusicFont === "function") {
      try { VF.setMusicFont("Bravura"); } catch (e) {}
    }

    targetEl.innerHTML = "";
    const SVG_NS = "http://www.w3.org/2000/svg";
    const isTall = spec.kind === "tab-vs-std" || spec.kind === "open-strings" || spec.kind === "string-circles";
    targetEl.classList.add("symbol-preview-box");
    targetEl.classList.toggle("is-tall", isTall);

    const width = 180;
    const height = isTall ? 145 : 84;
    const scale = 0.75;
    const lw = Math.round(width / scale);
    const lh = Math.round(height / scale);

    try {
      const renderer = new VF.Renderer(targetEl, VF.Renderer.Backends.SVG);
      renderer.resize(width, height);
      const ctx = renderer.getContext();
      ctx.scale(scale, scale);

      const svg = targetEl.querySelector("svg");
      if (svg) {
        svg.setAttribute("viewBox", `0 0 ${lw} ${lh}`);
        svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
        svg.classList.add("primer-vf-svg");
      }

      const drawOverlayText = (x, y, txt, cls = "primer-vf-annot") => {
        if (!svg) return;
        const t = document.createElementNS(SVG_NS, "text");
        t.setAttribute("class", cls);
        t.setAttribute("x", String(x));
        t.setAttribute("y", String(y));
        t.setAttribute("text-anchor", "middle");
        t.textContent = txt;
        svg.appendChild(t);
      };

      const makeNotes = (items, color = "#18181B") => items.map(str => {
        const parts = str.split("/");
        const key = `${parts[0]}/${parts[1]}`;
        const dur = parts[2] || "q";
        const isRest = dur.endsWith("r");
        const n = new VF.StaveNote({
          clef: "treble",
          keys: [key],
          duration: dur,
          auto_stem: true,
          align_center: items.length === 1
        });
        n.setStyle({ fillStyle: isRest ? "#DC2626" : color, strokeStyle: isRest ? "#DC2626" : color });
        return n;
      });

      const formatAndDraw = (stave, notes, opts = { num_beats: 4, beat_value: 4 }, withBeam = false) => {
        const voice = new VF.Voice(opts).setMode(VF.Voice.Mode.SOFT);
        voice.addTickables(notes);
        const beams = withBeam ? VF.Beam.generateBeams(notes) : [];
        const fmtW = Math.max(40, stave.getWidth() - (stave.getNoteStartX() - stave.getX()) - 12);
        new VF.Formatter().joinVoices([voice]).format([voice], fmtW);
        voice.draw(ctx, stave);
        beams.forEach(b => b.setContext(ctx).draw());
      };

      const kind = spec.kind;

      if (kind === "stave-lines-spaces") {
        const stave = new VF.Stave(10, 20, lw - 20).setStyle({ strokeStyle: "#27272A", lineWidth: 1.1 });
        stave.setContext(ctx).draw();
        const notes = makeNotes(spec.notes);
        formatAndDraw(stave, notes);
        notes.forEach((n, idx) => {
          const x = n.getAbsoluteX() + 5;
          drawOverlayText(x, stave.getYForLine(0) - 8, spec.labels[idx]);
        });
        drawOverlayText(lw - 5, stave.getYForLine(0) + 3, "5", "primer-vf-linenum");
        drawOverlayText(lw - 5, stave.getYForLine(4) + 3, "1", "primer-vf-linenum");
      } else if (kind === "ledger") {
        const stave = new VF.Stave(10, 18, lw - 20).setStyle({ strokeStyle: "#27272A", lineWidth: 1.0 });
        stave.setContext(ctx).draw();
        const notes = makeNotes(spec.notes);
        formatAndDraw(stave, notes);
        drawOverlayText(notes[1].getAbsoluteX() + 5, stave.getYForLine(4) + 34, "Middle C", "primer-vf-annot");
      } else if (kind === "treble-clef") {
        const stave = new VF.Stave(10, 22, lw - 20).addClef("treble").setStyle({ strokeStyle: "#27272A", lineWidth: 1.1 });
        stave.setContext(ctx).draw();
        const gNote = new VF.StaveNote({ clef: "treble", keys: ["g/4"], duration: "w" });
        gNote.setStyle({ fillStyle: "#C2410C", strokeStyle: "#C2410C" });
        formatAndDraw(stave, [gNote]);
        drawOverlayText(gNote.getAbsoluteX() + 8, stave.getYForLine(0) - 8, "Line 2 = G", "primer-vf-annot-accent");
      } else if (kind === "tab-vs-std") {
        const stave = new VF.Stave(14, 14, lw - 24).addClef("treble").setStyle({ strokeStyle: "#27272A", lineWidth: 1.0 });
        const tab = new VF.TabStave(14, 96, lw - 24).addClef("tab").setStyle({ strokeStyle: "#3F3F46", lineWidth: 0.95 });
        stave.setContext(ctx).draw();
        tab.setContext(ctx).draw();
        const startX = Math.max(stave.getNoteStartX(), tab.getNoteStartX()) + 6;
        stave.setNoteStartX(startX);
        tab.setNoteStartX(startX);
        new VF.StaveConnector(stave, tab).setType(VF.StaveConnector.type.BRACKET).setContext(ctx).draw();
        new VF.StaveConnector(stave, tab).setType(VF.StaveConnector.type.SINGLE_LEFT).setContext(ctx).draw();
        const notes = makeNotes(["e/5/q", "f/5/q", "g/5/q"]);
        const tabs = [
          new VF.TabNote({ positions: [{ str: 1, fret: "0" }], duration: "q" }),
          new VF.TabNote({ positions: [{ str: 1, fret: "1" }], duration: "q" }),
          new VF.TabNote({ positions: [{ str: 1, fret: "3" }], duration: "q" })
        ];
        const v1 = new VF.Voice({ num_beats: 3, beat_value: 4 }).setMode(VF.Voice.Mode.SOFT).addTickables(notes);
        const v2 = new VF.Voice({ num_beats: 3, beat_value: 4 }).setMode(VF.Voice.Mode.SOFT).addTickables(tabs);
        new VF.Formatter().joinVoices([v1, v2]).format([v1, v2], lw - startX - 18);
        v1.draw(ctx, stave);
        v2.draw(ctx, tab);
      } else if (kind === "barlines") {
        const halfW = Math.floor((lw - 20) / 2);
        const s1 = new VF.Stave(10, 20, halfW).setStyle({ strokeStyle: "#27272A", lineWidth: 1.1 });
        const s2 = new VF.Stave(10 + halfW, 20, halfW).setEndBarType(VF.Barline.type.END).setStyle({ strokeStyle: "#27272A", lineWidth: 1.1 });
        s1.setContext(ctx).draw();
        s2.setContext(ctx).draw();
        drawOverlayText(10 + halfW, 12, "Barline");
        drawOverlayText(lw - 22, 12, "End");
      } else if (kind === "repeat") {
        const s1 = new VF.Stave(10, 18, lw - 20)
          .setBegBarType(VF.Barline.type.REPEAT_BEGIN)
          .setEndBarType(VF.Barline.type.REPEAT_END)
          .setStyle({ strokeStyle: "#27272A", lineWidth: 1.1 });
        s1.setContext(ctx).draw();
        const notes = makeNotes(["g/4/h", "g/4/h"]);
        formatAndDraw(s1, notes);
      } else if (kind === "notes") {
        const stave = new VF.Stave(10, 14, lw - 20).setStyle({ strokeStyle: "#27272A", lineWidth: 1.0 });
        stave.setContext(ctx).draw();
        const notes = makeNotes(spec.notes);
        formatAndDraw(stave, notes, { num_beats: 6, beat_value: 4 });
        drawOverlayText(notes[0].getAbsoluteX() + 7, stave.getYForLine(4) + 22, "4 Beats");
        drawOverlayText(notes[1].getAbsoluteX() + 6, stave.getYForLine(4) + 22, "2 Beats");
      } else if (kind === "quarter-eighth") {
        const stave = new VF.Stave(10, 14, lw - 20).setStyle({ strokeStyle: "#27272A", lineWidth: 1.0 });
        stave.setContext(ctx).draw();
        const notes = makeNotes(["g/4/q", "g/4/8", "g/4/8"]);
        formatAndDraw(stave, notes, { num_beats: 2, beat_value: 4 }, true);
        drawOverlayText(notes[0].getAbsoluteX() + 5, stave.getYForLine(4) + 22, "1 Beat");
        drawOverlayText((notes[1].getAbsoluteX() + notes[2].getAbsoluteX()) / 2 + 5, stave.getYForLine(4) + 22, "1/2 + 1/2");
      } else if (kind === "whole-half-rests") {
        const stave = new VF.Stave(10, 14, lw - 20).setStyle({ strokeStyle: "#27272A", lineWidth: 1.0 });
        stave.setContext(ctx).draw();
        const notes = makeNotes(["d/5/wr", "b/4/hr"]);
        formatAndDraw(stave, notes, { num_beats: 6, beat_value: 4 });
        drawOverlayText(notes[0].getAbsoluteX() + 5, stave.getYForLine(4) + 22, "Whole (4)", "primer-vf-annot-rest");
        drawOverlayText(notes[1].getAbsoluteX() + 5, stave.getYForLine(4) + 22, "Half (2)", "primer-vf-annot-rest");
      } else if (kind === "quarter-eighth-rests") {
        const stave = new VF.Stave(10, 14, lw - 20).setStyle({ strokeStyle: "#27272A", lineWidth: 1.0 });
        stave.setContext(ctx).draw();
        const notes = makeNotes(["b/4/qr", "b/4/8r"]);
        formatAndDraw(stave, notes, { num_beats: 2, beat_value: 4 });
        drawOverlayText(notes[0].getAbsoluteX() + 5, stave.getYForLine(4) + 22, "1 Beat", "primer-vf-annot-rest");
        drawOverlayText(notes[1].getAbsoluteX() + 5, stave.getYForLine(4) + 22, "1/2 Beat", "primer-vf-annot-rest");
      } else if (kind === "dotted-half") {
        const stave = new VF.Stave(10, 14, lw - 20).setStyle({ strokeStyle: "#27272A", lineWidth: 1.0 });
        stave.setContext(ctx).draw();
        const n = new VF.StaveNote({ clef: "treble", keys: ["g/4"], duration: "h", align_center: true });
        VF.Dot.buildAndAttach([n], { all: true });
        n.setStyle({ fillStyle: "#18181B", strokeStyle: "#18181B" });
        formatAndDraw(stave, [n], { num_beats: 3, beat_value: 4 });
        drawOverlayText(lw / 2, stave.getYForLine(4) + 22, "2 + 1 = 3 Beats", "primer-vf-annot-blue");
      } else if (kind === "dotted-quarter") {
        const stave = new VF.Stave(10, 14, lw - 20).setStyle({ strokeStyle: "#27272A", lineWidth: 1.0 });
        stave.setContext(ctx).draw();
        const n1 = new VF.StaveNote({ clef: "treble", keys: ["g/4"], duration: "q" });
        VF.Dot.buildAndAttach([n1], { all: true });
        const n2 = new VF.StaveNote({ clef: "treble", keys: ["a/4"], duration: "8" });
        formatAndDraw(stave, [n1, n2], { num_beats: 2, beat_value: 4 });
        drawOverlayText(n1.getAbsoluteX() + 8, stave.getYForLine(4) + 22, "1 + 1/2", "primer-vf-annot-blue");
      } else if (kind === "tie-vs-slur") {
        const halfW = Math.floor((lw - 20) / 2);
        const s1 = new VF.Stave(10, 20, halfW).setStyle({ strokeStyle: "#27272A", lineWidth: 1.0 });
        const s2 = new VF.Stave(10 + halfW, 20, halfW).setStyle({ strokeStyle: "#27272A", lineWidth: 1.0 });
        s1.setContext(ctx).draw();
        s2.setContext(ctx).draw();
        const tNotes = makeNotes(["g/4/h", "g/4/h"]);
        formatAndDraw(s1, tNotes);
        new VF.StaveTie({ first_note: tNotes[0], last_note: tNotes[1], first_indices: [0], last_indices: [0] }).setContext(ctx).draw();
        const slNotes = makeNotes(["g/4/h", "b/4/h"]);
        formatAndDraw(s2, slNotes);
        if (VF.Curve) {
          new VF.Curve(slNotes[0], slNotes[1], { cps: [{ x: 0, y: 12 }, { x: 0, y: 12 }] }).setContext(ctx).draw();
        }
        drawOverlayText(10 + halfW / 2, 12, "Tie (Hold)", "primer-vf-annot-accent");
        drawOverlayText(10 + halfW * 1.5, 12, "Slur");
      } else if (kind === "time-sigs") {
        const s1 = new VF.Stave(8, 20, Math.floor((lw - 16) / 3) + 12).addClef("treble").addTimeSignature("4/4").setStyle({ strokeStyle: "#27272A", lineWidth: 1.0 });
        const s2 = new VF.Stave(s1.getX() + s1.getWidth(), 20, Math.floor((lw - 16) / 3) - 6).addTimeSignature("3/4").setStyle({ strokeStyle: "#27272A", lineWidth: 1.0 });
        const s3 = new VF.Stave(s2.getX() + s2.getWidth(), 20, Math.floor((lw - 16) / 3) - 6).addTimeSignature("C").setStyle({ strokeStyle: "#27272A", lineWidth: 1.0 });
        s1.setContext(ctx).draw();
        s2.setContext(ctx).draw();
        s3.setContext(ctx).draw();
      } else if (kind === "key-sigs") {
        const halfW = Math.floor((lw - 16) / 2);
        const s1 = new VF.Stave(8, 20, halfW).addClef("treble").addKeySignature("G").setStyle({ strokeStyle: "#27272A", lineWidth: 1.0 });
        const s2 = new VF.Stave(8 + halfW, 20, halfW).addClef("treble").addKeySignature("F").setStyle({ strokeStyle: "#27272A", lineWidth: 1.0 });
        s1.setContext(ctx).draw();
        s2.setContext(ctx).draw();
        drawOverlayText(8 + halfW / 2, s1.getYForLine(4) + 32, "Key of G (F#)");
        drawOverlayText(8 + halfW * 1.5, s2.getYForLine(4) + 32, "Key of F (Bb)");
      } else if (kind === "accidental") {
        const stave = new VF.Stave(10, 20, lw - 20).addClef("treble").setStyle({ strokeStyle: "#27272A", lineWidth: 1.0 });
        stave.setContext(ctx).draw();
        const n = new VF.StaveNote({ clef: "treble", keys: [spec.vexKey], duration: "h", align_center: true });
        n.addModifier(new VF.Accidental(spec.acc), 0);
        n.setStyle({ fillStyle: "#C2410C", strokeStyle: "#C2410C" });
        formatAndDraw(stave, [n], { num_beats: 2, beat_value: 4 });
      } else if (kind === "natural-pair") {
        const stave = new VF.Stave(10, 14, lw - 20).setStyle({ strokeStyle: "#27272A", lineWidth: 1.0 });
        stave.setContext(ctx).draw();
        const n1 = new VF.StaveNote({ clef: "treble", keys: ["f#/4"], duration: "h" });
        n1.addModifier(new VF.Accidental("#"), 0);
        const n2 = new VF.StaveNote({ clef: "treble", keys: ["f/4"], duration: "h" });
        n2.addModifier(new VF.Accidental("n"), 0);
        n2.setStyle({ fillStyle: "#C2410C", strokeStyle: "#C2410C" });
        formatAndDraw(stave, [n1, n2]);
        drawOverlayText(n2.getAbsoluteX() + 6, stave.getYForLine(4) + 22, "Reset \u266E", "primer-vf-annot-accent");
      } else if (kind === "barline-reset") {
        const halfW = Math.floor((lw - 16) / 2);
        const s1 = new VF.Stave(8, 14, halfW).setStyle({ strokeStyle: "#27272A", lineWidth: 1.0 });
        const s2 = new VF.Stave(8 + halfW, 14, halfW).setStyle({ strokeStyle: "#27272A", lineWidth: 1.0 });
        s1.setContext(ctx).draw();
        s2.setContext(ctx).draw();
        const n1 = new VF.StaveNote({ clef: "treble", keys: ["f#/4"], duration: "h" }).addModifier(new VF.Accidental("#"), 0);
        const n2 = new VF.StaveNote({ clef: "treble", keys: ["f/4"], duration: "h" });
        formatAndDraw(s1, [n1, n2]);
        const n3 = new VF.StaveNote({ clef: "treble", keys: ["f/4"], duration: "w" });
        n3.setStyle({ fillStyle: "#15803D", strokeStyle: "#15803D" });
        formatAndDraw(s2, [n3]);
        drawOverlayText(n2.getAbsoluteX() + 4, s1.getYForLine(4) + 22, "Still #");
        drawOverlayText(n3.getAbsoluteX() + 6, s2.getYForLine(4) + 22, "Auto \u266E!", "primer-vf-annot-green");
      } else if (kind === "picks") {
        const stave = new VF.Stave(10, 22, lw - 20).setStyle({ strokeStyle: "#27272A", lineWidth: 1.0 });
        stave.setContext(ctx).draw();
        const n1 = new VF.StaveNote({ clef: "treble", keys: ["e/5"], duration: "8" });
        const n2 = new VF.StaveNote({ clef: "treble", keys: ["e/5"], duration: "8" });
        if (VF.Articulation && VF.Modifier) {
          try {
            n1.addModifier(new VF.Articulation("am").setPosition(VF.Modifier.Position.ABOVE), 0);
            n2.addModifier(new VF.Articulation("a|").setPosition(VF.Modifier.Position.ABOVE), 0);
          } catch (e) {}
        }
        formatAndDraw(stave, [n1, n2], { num_beats: 1, beat_value: 4 }, true);
        drawOverlayText(n1.getAbsoluteX() + 5, stave.getYForLine(4) + 22, "Down (\u220F)");
        drawOverlayText(n2.getAbsoluteX() + 5, stave.getYForLine(4) + 22, "Up (V)");
      } else if (kind === "string-circles") {
        const stave = new VF.Stave(14, 24, lw - 24).addClef("treble").setStyle({ strokeStyle: "#27272A", lineWidth: 1.0 });
        const tab = new VF.TabStave(14, 102, lw - 24).addClef("tab").setStyle({ strokeStyle: "#3F3F46", lineWidth: 0.95 });
        stave.setContext(ctx).draw();
        tab.setContext(ctx).draw();
        const startX = Math.max(stave.getNoteStartX(), tab.getNoteStartX()) + 6;
        stave.setNoteStartX(startX);
        tab.setNoteStartX(startX);
        const notes = makeNotes(["e/5/q", "b/4/q", "g/4/q"]);
        if (VF.StringNumber && VF.Modifier) {
          notes.forEach((n, idx) => {
            const snMod = new VF.StringNumber(String(idx + 1)).setPosition(VF.Modifier.Position.ABOVE);
            snMod.setStyle({ fillStyle: "#C2410C", strokeStyle: "#C2410C" });
            n.addModifier(snMod, 0);
          });
        }
        const tabs = [
          new VF.TabNote({ positions: [{ str: 1, fret: "0" }], duration: "q" }),
          new VF.TabNote({ positions: [{ str: 2, fret: "0" }], duration: "q" }),
          new VF.TabNote({ positions: [{ str: 3, fret: "0" }], duration: "q" })
        ];
        const v1 = new VF.Voice({ num_beats: 3, beat_value: 4 }).setMode(VF.Voice.Mode.SOFT).addTickables(notes);
        const v2 = new VF.Voice({ num_beats: 3, beat_value: 4 }).setMode(VF.Voice.Mode.SOFT).addTickables(tabs);
        new VF.Formatter().joinVoices([v1, v2]).format([v1, v2], lw - startX - 18);
        v1.draw(ctx, stave);
        v2.draw(ctx, tab);
      } else if (kind === "finger-numbers") {
        const stave = new VF.Stave(10, 18, lw - 20).setStyle({ strokeStyle: "#27272A", lineWidth: 1.0 });
        stave.setContext(ctx).draw();
        const n1 = new VF.StaveNote({ clef: "treble", keys: ["f/5"], duration: "q" });
        const n2 = new VF.StaveNote({ clef: "treble", keys: ["f#/5"], duration: "q" }).addModifier(new VF.Accidental("#"), 0);
        const n3 = new VF.StaveNote({ clef: "treble", keys: ["g/5"], duration: "q" });
        const n4 = new VF.StaveNote({ clef: "treble", keys: ["g#/5"], duration: "q" }).addModifier(new VF.Accidental("#"), 0);
        const notes = [n1, n2, n3, n4];
        formatAndDraw(stave, notes);
        notes.forEach((n, i) => {
          drawOverlayText(n.getAbsoluteX() + 6, stave.getYForLine(4) + 22, String(i + 1), "primer-vf-annot-accent");
        });
      } else if (kind === "open-strings") {
        const stave = new VF.Stave(14, 18, lw - 24).addClef("treble").setStyle({ strokeStyle: "#27272A", lineWidth: 1.0 });
        const tab = new VF.TabStave(14, 98, lw - 24).addClef("tab").setStyle({ strokeStyle: "#3F3F46", lineWidth: 0.95 });
        stave.setContext(ctx).draw();
        tab.setContext(ctx).draw();
        const startX = Math.max(stave.getNoteStartX(), tab.getNoteStartX()) + 6;
        stave.setNoteStartX(startX);
        tab.setNoteStartX(startX);
        const notes = makeNotes(["e/5/q", "b/4/q", "g/4/q"]);
        const tabs = [
          new VF.TabNote({ positions: [{ str: 1, fret: "0" }], duration: "q" }),
          new VF.TabNote({ positions: [{ str: 2, fret: "0" }], duration: "q" }),
          new VF.TabNote({ positions: [{ str: 3, fret: "0" }], duration: "q" })
        ];
        const v1 = new VF.Voice({ num_beats: 3, beat_value: 4 }).setMode(VF.Voice.Mode.SOFT).addTickables(notes);
        const v2 = new VF.Voice({ num_beats: 3, beat_value: 4 }).setMode(VF.Voice.Mode.SOFT).addTickables(tabs);
        new VF.Formatter().joinVoices([v1, v2]).format([v1, v2], lw - startX - 18);
        v1.draw(ctx, stave);
        v2.draw(ctx, tab);
        notes.forEach(n => drawOverlayText(n.getAbsoluteX() + 5, stave.getYForLine(0) - 8, "0", "primer-vf-annot-green"));
      } else if (kind === "muting") {
        const stave = new VF.Stave(10, 14, lw - 20).setStyle({ strokeStyle: "#27272A", lineWidth: 1.0 });
        stave.setContext(ctx).draw();
        const notes = makeNotes(["e/5/q", "b/4/qr", "e/5/q", "b/4/qr"]);
        formatAndDraw(stave, notes);
        drawOverlayText(notes[1].getAbsoluteX() + 5, stave.getYForLine(4) + 22, "Mute", "primer-vf-annot-rest");
        drawOverlayText(notes[3].getAbsoluteX() + 5, stave.getYForLine(4) + 22, "Mute", "primer-vf-annot-rest");
      }

      // Compute exact ink bounding box and center cleanly inside padded preview box
      if (svg) {
        try {
          const bb = svg.getBBox();
          if (bb && bb.width > 8 && bb.height > 8) {
            const padX = 10;
            const padY = 8;
            const vbW = bb.width + padX * 2;
            const vbH = bb.height + padY * 2;
            svg.setAttribute(
              "viewBox",
              `${(bb.x - padX).toFixed(1)} ${(bb.y - padY).toFixed(1)} ${vbW.toFixed(1)} ${vbH.toFixed(1)}`
            );
            const maxDrawW = 160;
            const maxDrawH = isTall ? 128 : 68;
            const fitScale = Math.min(maxDrawW / vbW, maxDrawH / vbH, 0.85);
            svg.setAttribute("width", String(Math.round(vbW * fitScale)));
            svg.setAttribute("height", String(Math.round(vbH * fitScale)));
            svg.dataset.bboxFitted = "1";
          }
        } catch (bbErr) {}
      }
    } catch (err) {
      targetEl.innerHTML = `<span class="primer-sym-fallback">${this.escapeHtml(spec.kind)}</span>`;
    }
  }

  renderQuizCardStaff(targetEl, spec) {
    if (!targetEl || !spec) return;
    const VF = this.getVexFlow();
    if (!VF) return;

    if (typeof VF.setMusicFont === "function") {
      try { VF.setMusicFont("Bravura"); } catch (e) {}
    }

    targetEl.innerHTML = "";
    const width = 260;
    const height = 112;
    const scale = 0.82;
    const lw = Math.round(width / scale);
    const lh = Math.round(height / scale);

    try {
      const renderer = new VF.Renderer(targetEl, VF.Renderer.Backends.SVG);
      renderer.resize(width, height);
      const ctx = renderer.getContext();
      ctx.scale(scale, scale);
      const svg = targetEl.querySelector("svg");
      if (svg) {
        svg.setAttribute("viewBox", `0 0 ${lw} ${lh}`);
        svg.style.overflow = "visible";
      }

      const stave = new VF.Stave(14, 24, lw - 28).addClef("treble").addTimeSignature("4/4").setStyle({ strokeStyle: "#27272A", lineWidth: 1.1 });
      stave.setContext(ctx).draw();

      let notes = [];
      let tiePair = false;
      if (spec.kind === "single-rest") {
        const n = new VF.StaveNote({
          clef: "treble",
          keys: [spec.vexKey || "b/4"],
          duration: spec.duration,
          align_center: true
        });
        n.setStyle({ fillStyle: "#DC2626", strokeStyle: "#DC2626" });
        notes = [n];
      } else if (spec.kind === "tie-pair") {
        const n1 = new VF.StaveNote({ clef: "treble", keys: [spec.key1], duration: "h" });
        const n2 = new VF.StaveNote({ clef: "treble", keys: [spec.key2], duration: "h" });
        notes = [n1, n2];
        tiePair = true;
      } else if (spec.kind === "pick-symbol") {
        const n = new VF.StaveNote({ clef: "treble", keys: ["e/5"], duration: "q", align_center: true });
        if (VF.Articulation && VF.Modifier) {
          n.addModifier(new VF.Articulation(spec.stroke === "up" ? "a|" : "am").setPosition(VF.Modifier.Position.ABOVE), 0);
        }
        notes = [n];
      } else {
        const n = new VF.StaveNote({
          clef: "treble",
          keys: [spec.vexKey || "e/5"],
          duration: spec.duration || "q",
          align_center: true
        });
        if (spec.acc) n.addModifier(new VF.Accidental(spec.acc), 0);
        if (spec.isDotted) VF.Dot.buildAndAttach([n], { all: true });
        n.setStyle({ fillStyle: "#18181B", strokeStyle: "#18181B" });
        notes = [n];
      }

      const voice = new VF.Voice({ num_beats: 4, beat_value: 4 }).setMode(VF.Voice.Mode.SOFT).addTickables(notes);
      new VF.Formatter().joinVoices([voice]).format([voice], lw - stave.getNoteStartX() - 20);
      voice.draw(ctx, stave);

      if (tiePair && notes.length === 2) {
        new VF.StaveTie({
          first_note: notes[0],
          last_note: notes[1],
          first_indices: [0],
          last_indices: [0]
        }).setContext(ctx).draw();
      }
    } catch (e) {}
  }

  openSandbox(itemId, opts = {}) {
    const found = PRIMER_ITEMS.find(it => it.id === itemId) || PRIMER_ITEMS[0];
    if (!found) return;

    this.stopSandboxPlayback();
    this.stopQuizTimer();
    this.activeItem = found;

    const drawer = this.root.querySelector("#primer-sandbox-drawer");
    const backdrop = this.root.querySelector("#primer-sandbox-backdrop");
    const cat = PRIMER_CATEGORIES.find(c => c.id === found.categoryId);

    const catCrumb = this.root.querySelector("#sandbox-cat-crumb");
    const titleEl = this.root.querySelector("#sandbox-title");
    const expEl = this.root.querySelector("#sandbox-explanation");
    const tipEl = this.root.querySelector("#sandbox-tip-box");

    if (catCrumb) catCrumb.textContent = cat ? `${cat.letter.toUpperCase()}. ${cat.title.toUpperCase()}` : "THEORY SANDBOX";
    if (titleEl) titleEl.textContent = found.name;
    if (expEl) expEl.textContent = `${found.whatItMeans} ${found.howToPlay}`;
    if (tipEl) tipEl.innerHTML = `<strong>Key Rule:</strong> ${this.escapeHtml(found.sandbox.tip)}`;

    if (backdrop) backdrop.removeAttribute("hidden");
    if (drawer) {
      drawer.classList.add("is-open");
      drawer.setAttribute("aria-hidden", "false");
    }

    this.renderSandboxExamples(found);
    this.resetBeatTrackerUI(found.sandbox.rightExample.timeSignature || "4/4");

    if (opts.startQuizImmediately) {
      this.startQuickDrill(opts.focusCategory || found.categoryId);
    } else {
      this.showDrawerMode("demo");
    }
  }

  closeSandbox() {
    this.stopSandboxPlayback();
    this.stopQuizTimer();
    const drawer = this.root && this.root.querySelector("#primer-sandbox-drawer");
    const backdrop = this.root && this.root.querySelector("#primer-sandbox-backdrop");
    if (drawer) {
      drawer.classList.remove("is-open");
      drawer.setAttribute("aria-hidden", "true");
    }
    if (backdrop) backdrop.setAttribute("hidden", "");
  }

  showDrawerMode(mode) {
    this.drawerMode = mode;
    const demoBody = this.root.querySelector("#sandbox-demo-body");
    const quizBody = this.root.querySelector("#sandbox-quiz-body");
    const titleEl = this.root.querySelector("#sandbox-title");
    if (demoBody) demoBody.hidden = mode !== "demo";
    if (quizBody) quizBody.hidden = mode !== "quiz";
    if (titleEl && this.activeItem) {
      titleEl.textContent = mode === "quiz"
        ? "60-Second Sight-Reading Drill (No TAB)"
        : this.activeItem.name;
    }
  }

  renderSandboxExamples(item) {
    const wrongTitle = this.root.querySelector("#sandbox-wrong-title");
    const wrongSum = this.root.querySelector("#sandbox-wrong-summary");
    const rightTitle = this.root.querySelector("#sandbox-right-title");
    const rightSum = this.root.querySelector("#sandbox-right-summary");
    const wrongHost = this.root.querySelector("#sandbox-wrong-vf");
    const rightHost = this.root.querySelector("#sandbox-right-vf");

    const buildExObj = (idSuffix, spec) => {
      const tsStr = spec.timeSignature || "4/4";
      const tsParts = tsStr.split("/").map(n => parseInt(n, 10) || 4);
      const { measures, tabData } = buildCurriculumMeasures(spec.measures, {
        clef: "treble",
        notationMode: "standard",
        timeSignature: tsStr,
        transposeOctave: 1
      });
      return {
        id: `${item.id}-${idSuffix}`,
        title: spec.label,
        timeSignature: tsParts,
        hasBookTab: true,
        measures,
        tabData,
        cues: spec.cues || []
      };
    };

    const wrongEx = buildExObj("wrong", item.sandbox.wrongExample);
    const rightEx = buildExObj("right", item.sandbox.rightExample);
    this._sandboxExMap = { wrong: wrongEx, right: rightEx };

    if (wrongTitle) wrongTitle.textContent = item.sandbox.wrongExample.label;
    if (wrongSum) wrongSum.textContent = item.sandbox.wrongExample.summary;
    if (rightTitle) rightTitle.textContent = item.sandbox.rightExample.label;
    if (rightSum) rightSum.textContent = item.sandbox.rightExample.summary;

    if (wrongHost) {
      this._wrongRenderer = new ScoreRenderer(wrongHost);
      this._wrongRenderer.loadExercise(wrongEx, {
        noteNameMode: "above",
        tabVisibilityMode: "both",
        showRhythmGuide: true,
        showCoachBanner: false
      });
    }
    if (rightHost) {
      this._rightRenderer = new ScoreRenderer(rightHost);
      this._rightRenderer.loadExercise(rightEx, {
        noteNameMode: "above",
        tabVisibilityMode: "both",
        showRhythmGuide: true,
        showCoachBanner: false
      });
    }
  }

  resetBeatTrackerUI(tsStr = "4/4") {
    const beatsCount = parseInt(String(tsStr).split("/")[0], 10) || 4;
    const pillsEl = this.root.querySelector("#sandbox-beat-pills");
    if (pillsEl) {
      let html = "";
      for (let i = 1; i <= beatsCount; i++) {
        html += `<div class="sandbox-beat-pill" data-beat="${i}">${i}</div>`;
      }
      pillsEl.innerHTML = html;
    }
    const modeLbl = this.root.querySelector("#sandbox-active-mode-lbl");
    const cueEl = this.root.querySelector("#sandbox-cue-banner");
    if (modeLbl) modeLbl.textContent = "Ready — choose Wrong or Right below";
    if (cueEl) cueEl.textContent = "Tap Play on either comparison measure to hear exact plucking, ties, and rest muting.";
  }

  playSandboxExample(which) {
    this.stopSandboxPlayback();
    if (!this._sandboxExMap || !this._sandboxExMap[which] || !this.audio) return;

    this.audio.init();
    this._playingKind = which;
    const ex = this._sandboxExMap[which];
    const renderer = which === "wrong" ? this._wrongRenderer : this._rightRenderer;
    const bpm = (this.activeItem && this.activeItem.sandbox && this.activeItem.sandbox.bpm) || 64;
    const spb = 60.0 / bpm;
    const beatsPerBar = (ex.timeSignature && ex.timeSignature[0]) || 4;

    this.resetBeatTrackerUI(`${beatsPerBar}/4`);
    this.updateSandboxPlayButtons(which);

    const ctx = this.audio.audioCtx;
    const startAudioTime = (ctx ? ctx.currentTime : 0) + 0.06;
    const scheduledUiEvents = [];
    let runningBeats = 0;

    ex.tabData.forEach((m, mIdx) => {
      for (let b = 0; b < beatsPerBar; b++) {
        const beatAudioTime = startAudioTime + (runningBeats + b) * spb;
        const beatInBarList = (m.beats || []);

        // Compute beat timeline
        let pos = 0;
        const timeline = beatInBarList.map((bt, idx) => {
          const item = { beatData: bt, beatIndex: idx, startOffset: pos };
          pos += (bt.isSustain || bt.type === "sustain") ? (bt.symbol === "1/8" ? 0.5 : 1.0) : (bt.duration || 1.0);
          return item;
        });

        const matching = timeline.filter(it => it.startOffset >= (b - 0.02) && it.startOffset < (b + 0.98));
        const downbeatRest = matching.length > 0 && matching[0].startOffset <= (b + 0.05)
          ? matching[0].beatData.type === "rest"
          : Boolean(timeline.slice().reverse().find(it => it.startOffset <= b + 0.01)?.beatData?.type === "rest");

        this.audio.playBeat(beatAudioTime, b === 0, downbeatRest, false);

        if (matching.length > 0) {
          if (matching[0].startOffset > b + 0.05) {
            const carry = timeline.slice().reverse().find(it => it.startOffset < b - 0.01);
            if (carry) {
              const carryRest = carry.beatData.type === "rest";
              if (carryRest) this.audio.dampAllStrings(beatAudioTime);
              scheduledUiEvents.push({
                time: beatAudioTime,
                mIdx,
                bIdx: carry.beatIndex,
                beatNum: b + 1,
                isUpbeat: false,
                isRest: carryRest,
                isHold: !carryRest,
                beatData: carry.beatData,
                cueIdx: mIdx === 0 ? b : 4 + b
              });
            }
          }

          matching.forEach((it) => {
            const offset = Math.max(0, it.startOffset - b);
            const tEv = beatAudioTime + offset * spb;
            const isRest = it.beatData.type === "rest";
            const isTieCont = Boolean(it.beatData.isTieContinuation || it.beatData.tieFromPrev);
            const isSustain = Boolean(it.beatData.isSustain || it.beatData.type === "sustain");

            if (isRest) {
              this.audio.dampAllStrings(tEv);
            } else if (!isSustain && !isTieCont) {
              let durB = it.beatData.duration || 1.0;
              if (it.beatData.tieToNext && ex.tabData[mIdx + 1] && ex.tabData[mIdx + 1].beats[0]) {
                const nxt = ex.tabData[mIdx + 1].beats[0];
                if (nxt.tieFromPrev || nxt.isTieContinuation) durB += (nxt.duration || 1.0);
              }
              this.audio.playNoteEvent(tEv, it.beatData, null, durB * spb);
            }

            scheduledUiEvents.push({
              time: tEv,
              mIdx,
              bIdx: it.beatIndex,
              beatNum: b + 1,
              isUpbeat: offset >= 0.25,
              isRest,
              isHold: isTieCont || isSustain,
              isTieCont,
              beatData: it.beatData,
              cueIdx: mIdx === 0 ? b : 4 + b
            });
          });
        } else {
          const carry = timeline.slice().reverse().find(it => it.startOffset <= b + 0.01);
          const isRest = carry ? carry.beatData.type === "rest" : false;
          if (isRest) this.audio.dampAllStrings(beatAudioTime);
          scheduledUiEvents.push({
            time: beatAudioTime,
            mIdx,
            bIdx: carry ? carry.beatIndex : 0,
            beatNum: b + 1,
            isUpbeat: false,
            isRest,
            isHold: !isRest,
            beatData: carry ? carry.beatData : null,
            cueIdx: mIdx === 0 ? b : 4 + b
          });
        }
      }
      runningBeats += beatsPerBar;
    });

    const endAudioTime = startAudioTime + runningBeats * spb + 0.05;
    this._playEvents = scheduledUiEvents;

    const modeLbl = this.root.querySelector("#sandbox-active-mode-lbl");
    if (modeLbl) {
      modeLbl.textContent = which === "wrong" ? "Playing: Common Mistake" : "Playing: Right Execution";
      modeLbl.className = `sandbox-beat-mode-lbl is-${which}`;
    }

    const tick = () => {
      if (this._playingKind !== which || !this.audio.audioCtx) return;
      const now = this.audio.audioCtx.currentTime;

      while (this._playEvents.length > 0 && this._playEvents[0].time <= now) {
        const ev = this._playEvents.shift();
        if (renderer) renderer.highlightBeat(ev.mIdx, ev.bIdx, ev.isRest, null);
        this.updateSandboxTrackerVisual(ev, ex);
      }

      if (now >= endAudioTime && this._playEvents.length === 0) {
        this.stopSandboxPlayback();
        return;
      }
      this._playRafId = requestAnimationFrame(tick);
    };
    this._playRafId = requestAnimationFrame(tick);
  }

  updateSandboxTrackerVisual(ev, ex) {
    const pills = this.root.querySelectorAll("#sandbox-beat-pills .sandbox-beat-pill");
    pills.forEach(p => {
      const n = parseInt(p.dataset.beat, 10);
      const isCur = n === ev.beatNum;
      p.classList.toggle("is-active", isCur && !ev.isRest && !ev.isHold);
      p.classList.toggle("is-hold", isCur && ev.isHold && !ev.isRest);
      p.classList.toggle("is-rest", isCur && ev.isRest);
      p.textContent = (isCur && ev.isUpbeat) ? `${n} &` : String(n);
    });

    const cueEl = this.root.querySelector("#sandbox-cue-banner");
    if (cueEl) {
      const customCue = ex.cues && ex.cues[ev.cueIdx];
      let msg = customCue || "";
      if (!msg && ev.beatData) {
        const nm = (ev.beatData.note || "Note").replace(/^High\s+/i, "").replace(/^Low\s+/i, "");
        if (ev.isRest) msg = `Beat ${ev.beatNum}: Mute String with Palm (Rest!)`;
        else if (ev.isTieCont) msg = `Beat ${ev.beatNum}: HOLD Tied ${nm} — Do NOT Re-Pluck!`;
        else if (ev.isHold) msg = `Beat ${ev.beatNum}: Keep Holding ${nm}`;
        else msg = `Beat ${ev.beatNum}: Pluck ${nm} (String ${ev.beatData.string || ""}, Fret ${ev.beatData.fret ?? 0})`;
      }
      cueEl.textContent = msg;
      cueEl.className = `sandbox-cue-banner ${ev.isRest ? "is-rest" : (ev.isHold ? "is-hold" : "is-play")}`;
    }
  }

  updateSandboxPlayButtons(activeWhich) {
    const btnW = this.root.querySelector("#btn-play-wrong");
    const btnR = this.root.querySelector("#btn-play-right");
    if (btnW) btnW.innerHTML = activeWhich === "wrong" ? "&#9632; Stop" : "&#9654; Hear Mistake";
    if (btnR) btnR.innerHTML = activeWhich === "right" ? "&#9632; Stop" : "&#9654; Hear Right Way";
  }

  stopSandboxPlayback() {
    this._playingKind = null;
    this._playEvents = [];
    if (this._playRafId) {
      cancelAnimationFrame(this._playRafId);
      this._playRafId = null;
    }
    if (this._playTimerId) {
      clearTimeout(this._playTimerId);
      this._playTimerId = null;
    }
    if (this.audio && typeof this.audio.dampAllStrings === "function") {
      this.audio.dampAllStrings();
    }
    if (this._wrongRenderer) this._wrongRenderer.reset();
    if (this._rightRenderer) this._rightRenderer.reset();
    if (this.root) {
      this.updateSandboxPlayButtons(null);
      const pills = this.root.querySelectorAll("#sandbox-beat-pills .sandbox-beat-pill");
      pills.forEach(p => {
        p.classList.remove("is-active", "is-hold", "is-rest");
        p.textContent = p.dataset.beat;
      });
    }
  }

  // =========================================================================
  // 60-SECOND NO-TAB STAFF SIGHT-READING & RHYTHM QUIZ
  // =========================================================================

  startQuickDrill(focusCategory = "all") {
    this.stopQuizTimer();
    this.showDrawerMode("quiz");

    this._quizSecondsLeft = 60;
    this._quizScore = 0;
    this._quizTotal = 0;
    this._quizStreak = 0;
    this._quizBestStreak = 0;
    this._quizIndex = 0;
    this._quizAnswered = false;

    const prioritized = PRIMER_QUIZ_BANK.filter(q => focusCategory !== "all" && q.categoryId === focusCategory);
    const others = PRIMER_QUIZ_BANK.filter(q => focusCategory === "all" || q.categoryId !== focusCategory);
    const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
    this._quizDeck = [...shuffle(prioritized), ...shuffle(others)];

    const activeStage = this.root.querySelector("#quiz-active-stage");
    const summaryStage = this.root.querySelector("#quiz-summary-stage");
    if (activeStage) activeStage.hidden = false;
    if (summaryStage) summaryStage.hidden = true;

    this.updateQuizStatsUI();
    this.renderCurrentQuizCard();

    this._quizTimerId = setInterval(() => {
      this._quizSecondsLeft--;
      this.updateQuizStatsUI();
      if (this._quizSecondsLeft <= 0) {
        this.finishQuickDrill();
      }
    }, 1000);
  }

  stopQuizTimer() {
    if (this._quizTimerId) {
      clearInterval(this._quizTimerId);
      this._quizTimerId = null;
    }
  }

  updateQuizStatsUI() {
    const timerEl = this.root.querySelector("#quiz-timer-pill");
    const scoreEl = this.root.querySelector("#quiz-score-pill");
    const streakEl = this.root.querySelector("#quiz-streak-pill");
    if (timerEl) {
      timerEl.textContent = `${Math.max(0, this._quizSecondsLeft)}s`;
      timerEl.classList.toggle("is-urgent", this._quizSecondsLeft <= 10);
    }
    if (scoreEl) scoreEl.textContent = `Score: ${this._quizScore}/${this._quizTotal}`;
    if (streakEl) streakEl.textContent = `Streak: ${this._quizStreak}`;
  }

  renderCurrentQuizCard() {
    if (!this._quizDeck.length) return;
    if (this._quizIndex >= this._quizDeck.length) {
      this._quizDeck = [...this._quizDeck].sort(() => Math.random() - 0.5);
      this._quizIndex = 0;
    }

    const q = this._quizDeck[this._quizIndex];
    this._quizAnswered = false;

    const tagEl = this.root.querySelector("#quiz-card-tag");
    const promptEl = this.root.querySelector("#quiz-card-prompt");
    const staffStage = this.root.querySelector("#quiz-staff-stage");
    const optsGrid = this.root.querySelector("#quiz-options-grid");
    const feedbackBar = this.root.querySelector("#quiz-feedback-bar");
    const hearBtn = this.root.querySelector("#btn-quiz-hear-note");

    if (tagEl) tagEl.textContent = q.tag;
    if (promptEl) promptEl.textContent = q.prompt;
    if (hearBtn) hearBtn.style.display = q.audioEvent ? "inline-flex" : "none";
    if (feedbackBar) {
      feedbackBar.hidden = true;
      feedbackBar.textContent = "";
      feedbackBar.className = "quiz-feedback-bar";
    }

    if (staffStage) {
      this.renderQuizCardStaff(staffStage, q.spec);
    }

    if (optsGrid) {
      optsGrid.innerHTML = q.options.map((opt, idx) => `
        <button type="button" class="quiz-option-btn" data-opt-idx="${idx}">
          ${this.escapeHtml(opt)}
        </button>
      `).join("");

      optsGrid.querySelectorAll(".quiz-option-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          this.handleQuizAnswer(parseInt(btn.dataset.optIdx, 10));
        });
      });
    }
  }

  handleQuizAnswer(chosenIdx) {
    if (this._quizAnswered) return;
    this._quizAnswered = true;

    const q = this._quizDeck[this._quizIndex];
    const isCorrect = chosenIdx === q.correctIndex;

    this._quizTotal++;
    if (isCorrect) {
      this._quizScore++;
      this._quizStreak++;
      if (this._quizStreak > this._quizBestStreak) this._quizBestStreak = this._quizStreak;
    } else {
      this._quizStreak = 0;
    }
    this.updateQuizStatsUI();

    if (q.audioEvent && this.audio) {
      this.audio.init();
      const t = (this.audio.audioCtx && this.audio.audioCtx.currentTime > 0) ? this.audio.audioCtx.currentTime + 0.02 : 0;
      this.audio.playNoteEvent(t, q.audioEvent, null, 0.8);
    }

    const opts = this.root.querySelectorAll("#quiz-options-grid .quiz-option-btn");
    opts.forEach((btn, idx) => {
      btn.disabled = true;
      if (idx === q.correctIndex) btn.classList.add("is-correct");
      else if (idx === chosenIdx && !isCorrect) btn.classList.add("is-wrong");
    });

    const fb = this.root.querySelector("#quiz-feedback-bar");
    if (fb) {
      fb.hidden = false;
      fb.className = `quiz-feedback-bar ${isCorrect ? "is-correct" : "is-wrong"}`;
      fb.innerHTML = `<strong>${isCorrect ? "Correct!" : "Not quite."}</strong> ${this.escapeHtml(q.explanation)}`;
    }

    setTimeout(() => {
      if (this.drawerMode === "quiz" && this._quizSecondsLeft > 0) {
        this._quizIndex++;
        this.renderCurrentQuizCard();
      }
    }, 950);
  }

  finishQuickDrill() {
    this.stopQuizTimer();
    const activeStage = this.root.querySelector("#quiz-active-stage");
    const summaryStage = this.root.querySelector("#quiz-summary-stage");
    const headlineEl = this.root.querySelector("#quiz-summary-headline");
    const metricsEl = this.root.querySelector("#quiz-summary-metrics");

    if (activeStage) activeStage.hidden = true;
    if (summaryStage) summaryStage.hidden = false;

    const acc = this._quizTotal > 0 ? Math.round((this._quizScore / this._quizTotal) * 100) : 0;
    if (headlineEl) {
      headlineEl.textContent = acc >= 80 ? "Sharp Sight-Reading!" : "Solid Foundation Practice!";
    }
    if (metricsEl) {
      metricsEl.innerHTML = `
        <div class="quiz-metric"><span>Score</span><strong>${this._quizScore} / ${this._quizTotal}</strong></div>
        <div class="quiz-metric"><span>Accuracy</span><strong>${acc}%</strong></div>
        <div class="quiz-metric"><span>Best Streak</span><strong>${this._quizBestStreak}</strong></div>
      `;
    }
  }
}
