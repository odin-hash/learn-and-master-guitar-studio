// Editorial Music Engraving & 6-String TAB Visualizer
// Delegates all notation engraving cleanly to VexFlow-powered <ScoreRenderer />.
import { ScoreRenderer } from "./src/components/ScoreRenderer.js";

export class TabStaffVisualizer {
  /**
   * Create a VexFlow-backed staff and tablature visualizer.
   * @param {HTMLElement} containerElement
   * @param {Function|null} onBeatClick
   */
  constructor(containerElement, onBeatClick = null) {
    this.container = containerElement;
    this.onBeatClick = onBeatClick;
    this.currentData = null;
    this.currentExercise = null;
    this.timeSignature = [4, 4];
    this.activeHighlightState = null;
    this.showNoteNames = true;
    this.showTabNumbers = true;
    this.loopMeasureIndex = null;
    this._scoreRenderer = null;

    this._ensureRenderer();
  }

  _ensureRenderer() {
    if (this._scoreRenderer) return this._scoreRenderer;
    const hasVex = typeof window !== "undefined" && (
      (window.Vex && window.Vex.Flow) ||
      (window.Vex && window.Vex.Renderer)
    );
    if (hasVex && typeof ScoreRenderer !== "undefined" && this.container) {
      this._scoreRenderer = new ScoreRenderer(this.container, this.onBeatClick);
      this._scoreRenderer.setSightReadingOptions({
        showNoteNames: this.showNoteNames,
        showTabNumbers: this.showTabNumbers
      });
      if (this.loopMeasureIndex !== null) {
        this._scoreRenderer.setLoopMeasure(this.loopMeasureIndex);
      }
    }
    return this._scoreRenderer;
  }

  setSightReadingOptions(opts) {
    if (opts && opts.showNoteNames !== undefined) this.showNoteNames = opts.showNoteNames;
    if (opts && opts.showTabNumbers !== undefined) this.showTabNumbers = opts.showTabNumbers;
    const renderer = this._ensureRenderer();
    if (renderer) {
      renderer.setSightReadingOptions(opts);
    }
  }

  setTutorOptions(opts) {
    const renderer = this._ensureRenderer();
    if (renderer && typeof renderer.setTutorOptions === "function") {
      renderer.setTutorOptions(opts);
    }
  }

  setLoopMeasure(measureIndexOrNull) {
    this.loopMeasureIndex = measureIndexOrNull;
    const renderer = this._ensureRenderer();
    if (renderer) {
      renderer.setLoopMeasure(measureIndexOrNull);
    }
  }

  loadExercise(exercise) {
    this.currentExercise = exercise;
    this.currentData = exercise ? exercise.tabData : null;
    this.timeSignature = (exercise && exercise.timeSignature) || [4, 4];
    this.activeHighlightState = null;

    const renderer = this._ensureRenderer();
    if (renderer) {
      renderer.loadExercise(exercise);
      return;
    }

    if (this.container) {
      this.container.innerHTML = `<div style="padding:18px;border:1px solid #E4E4E7;border-radius:6px;color:#71717A;font-size:13px;">VexFlow notation engine failed to initialize. Ensure <code>src/vendor/vexflow.min.js</code> is loaded.</div>`;
    }
  }

  hasStandardStaff(exercise) {
    const renderer = this._ensureRenderer();
    if (renderer && typeof renderer.hasStandardStaff === "function") {
      return renderer.hasStandardStaff(exercise);
    }
    if (!exercise) return false;
    const id = exercise.id || "";
    if (id === "free-metronome") return false;
    if (id.startsWith("lb-s1-fe") || id.startsWith("bw-w1-fe") || id.startsWith("bw-w1-alt")) return false;
    return true;
  }

  render() {
    if (this.currentExercise) {
      this.loadExercise(this.currentExercise);
    }
  }

  highlightBeat(measureIdx, beatIdx, isRest, coachMeta = null) {
    this.activeHighlightState = { mIdx: measureIdx, bIdx: beatIdx, isRest };
    const renderer = this._ensureRenderer();
    if (renderer) {
      renderer.highlightBeat(measureIdx, beatIdx, isRest, coachMeta);
    }
  }

  reset() {
    this.activeHighlightState = null;
    const renderer = this._ensureRenderer();
    if (renderer) {
      renderer.reset();
    }
  }
}
