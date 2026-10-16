import { GUITAR_COURSES } from "./exercises.js";
import { MetronomeAudioEngine } from "./audio.js";
import { GuitarSpeedDial } from "./dial.js";
import { FretboardVisualizer } from "./fretboard.js";
import { TabStaffVisualizer } from "./tab.js";

export class GuitarMasterApp {
  constructor() {
    this.audio = new MetronomeAudioEngine();
    this.currentBookCategory = "lessonBook"; // "lessonBook" | "bonusWorkshop"
    this.allExercises = this.buildFlatExerciseList();
    this.currentExercise = this.findExerciseById("lb-s2-str1-ex1") || this.allExercises[0];
    this.currentExerciseIndex = this.allExercises.findIndex(e => e.id === this.currentExercise.id);
    this.bpm = 60;
    this.isPlaying = false;
    this.currentView = "home"; // "home" | "book" | "studio"
    this.isRestoring = false;
    this.wakeLock = null;

    // Timing state
    this.lookahead = 25.0; // ms
    this.scheduleAheadTime = 0.1; // seconds
    this.currentMeasureIndex = 0;
    this.currentBeatInMeasure = 0;
    this.currentBeatIndex = 0;
    this.currentMeasureBeatPos = 0.0;
    this.nextBeatTime = 0.0;
    this.timerId = null;
    this.queue = [];

    // Count-in & Trainer options
    this.countInEnabled = false;
    this.isCountingIn = false;
    this.countInBeat = 0;
    this.countInTotalBeats = 4;
    this.showNoteNames = true;
    this.showTabNumbers = true;
    this.chordMode = "full"; // "full" | "easy4" | "easy3"
    this.selectedSpiderString = 1;

    // Progress tracking
    this.completedExercises = this.loadProgressSet("guitar_completed_exercises");
    this.checkedGoals = this.loadProgressSet("guitar_checked_goals");

    this.initDOM();
    this.initDial();
    this.initVisualizers();
    this.injectStudioTrainerToolbar();
    this.populateStudioDropdown();
    this.renderCourseBookCatalog();
    this.attachEvents();
    this.requestDrawLoop();

    // Restore state from URL Hash / LocalStorage
    this.restoreState();
  }

  loadProgressSet(key) {
    try {
      const raw = localStorage.getItem(key);
      return new Set(raw ? JSON.parse(raw) : []);
    } catch (e) {
      return new Set();
    }
  }

  saveProgressSet(key, setObj) {
    try {
      localStorage.setItem(key, JSON.stringify([...setObj]));
    } catch (e) {}
  }

  toggleExerciseCompleted(id) {
    if (this.completedExercises.has(id)) {
      this.completedExercises.delete(id);
    } else {
      this.completedExercises.add(id);
    }
    this.saveProgressSet("guitar_completed_exercises", this.completedExercises);
    this.updateDoneButtonUI();
    this.renderCourseBookCatalog(this.catalogSearchInput ? this.catalogSearchInput.value : "");
  }

  toggleGoalChecked(key) {
    if (this.checkedGoals.has(key)) {
      this.checkedGoals.delete(key);
    } else {
      this.checkedGoals.add(key);
    }
    this.saveProgressSet("guitar_checked_goals", this.checkedGoals);
  }

  buildFlatExerciseList() {
    const list = [];
    // Lesson Book
    (GUITAR_COURSES.lessonBook || []).forEach(session => {
      (session.topics || []).forEach(topic => {
        (topic.exercises || []).forEach(ex => {
          list.push({
            ...ex,
            bookCategory: "lessonBook",
            bookName: "Lesson Book",
            sessionNumber: session.sessionNumber,
            sessionTitle: session.sessionTitle,
            topicTitle: topic.topicTitle
          });
        });
      });
    });

    // Bonus Workshop
    (GUITAR_COURSES.bonusWorkshop || []).forEach(session => {
      (session.topics || []).forEach(topic => {
        (topic.exercises || []).forEach(ex => {
          list.push({
            ...ex,
            bookCategory: "bonusWorkshop",
            bookName: "Bonus Workshop",
            sessionNumber: session.sessionNumber,
            sessionTitle: session.sessionTitle,
            topicTitle: topic.topicTitle
          });
        });
      });
    });

    // Free Metronome
    if (GUITAR_COURSES.freeMetronome) {
      list.push({
        ...GUITAR_COURSES.freeMetronome,
        bookCategory: "freeMetronome",
        bookName: "Free Studio",
        sessionNumber: 0,
        sessionTitle: "Free Metronome Studio",
        topicTitle: "Unrestricted Practice"
      });
    }

    return list;
  }

  findExerciseById(id) {
    return this.allExercises.find(e => e.id === id);
  }

  initDOM() {
    this.masterHeader = document.querySelector(".master-header");
    this.btnMasterBack = document.getElementById("btn-master-back");
    this.btnBookBack = document.getElementById("btn-book-back");
    this.tabBtnHome = document.getElementById("tab-btn-home");
    this.tabBtnBook = document.getElementById("tab-btn-book");
    this.tabBtnWorkshop = document.getElementById("tab-btn-workshop");
    this.tabBtnStudio = document.getElementById("tab-btn-studio");
    this.viewHome = document.getElementById("view-home");
    this.viewCourseBook = document.getElementById("view-course-book");
    this.viewMetronomeStudio = document.getElementById("view-metronome-studio");
    this.navModeIndicator = document.getElementById("nav-mode-indicator");

    // Home Action Cards
    this.portalCardLesson = document.getElementById("portal-card-lesson");
    this.portalCardWorkshop = document.getElementById("portal-card-workshop");
    this.portalCardStudio = document.getElementById("portal-card-studio");

    // Book Catalog
    this.choiceLessonBook = document.getElementById("choice-lesson-book");
    this.choiceWorkshopBook = document.getElementById("choice-workshop-book");
    this.choiceFreeMode = document.getElementById("choice-free-mode");
    this.sessionsCatalogGrid = document.getElementById("sessions-catalog-grid");
    this.catalogSearchInput = document.getElementById("catalog-search-input");

    // Studio Header & Steppers
    this.btnStudioBack = document.getElementById("btn-studio-back");
    this.studioExerciseTitle = document.getElementById("studio-exercise-title");
    this.studioExerciseTopicBadge = document.getElementById("studio-exercise-topic-badge");
    this.studioSessionSelect = document.getElementById("studio-session-select");
    this.btnPrevExercise = document.getElementById("btn-prev-exercise");
    this.btnNextExercise = document.getElementById("btn-next-exercise");
    this.studioInstructionText = document.getElementById("studio-instruction-text");

    // Studio Metronome Controls
    this.bpmDisplay = document.getElementById("bpm-number-display");
    this.btnBpmMinus = document.getElementById("btn-bpm-minus");
    this.btnBpmPlus = document.getElementById("btn-bpm-plus");
    this.beatDotsSequence = document.getElementById("beat-dots-sequence");
    this.timePillBadge = document.getElementById("time-pill-badge");

    // Feedback Card
    this.noteActiveCard = document.getElementById("note-active-card");
    this.noteGlyphLarge = document.getElementById("note-glyph-large");
    this.noteHeaderBig = document.getElementById("note-header-big");
    this.noteSubInstruction = document.getElementById("note-sub-instruction");
    this.noteRightGuidance = document.getElementById("note-right-guidance");

    // Audio Settings
    this.selectSound = document.getElementById("select-sound");
    this.selectRestSound = document.getElementById("select-rest-sound");
    this.toggleCountIn = document.getElementById("toggle-count-in");

    // Ensure Count-In row is visible
    if (this.toggleCountIn) {
      const countInRow = this.toggleCountIn.closest(".setting-item-row");
      if (countInRow) countInRow.style.display = "flex";
    }

    // Update Fretboard meta label
    const metaLabels = document.querySelectorAll(".box-meta-text");
    metaLabels.forEach(el => {
      if (el.textContent.includes("Frets 0 to 7")) {
        el.textContent = "Frets 0 to 14 (Fingerings & Muted String Markers)";
      }
    });
  }

  initDial() {
    const canvas = document.getElementById("speed-dial-canvas");
    this.dial = new GuitarSpeedDial(
      canvas,
      (newBpm) => this.setBpm(newBpm),
      () => this.togglePlay()
    );
    this.dial.setBpm(this.bpm);
  }

  initVisualizers() {
    this.fretboard = new FretboardVisualizer(document.getElementById("fretboard-container"));
    this.tabStaff = new TabStaffVisualizer(
      document.getElementById("tab-container"),
      (mIdx, bIdx) => this.seekToMeasureBeat(mIdx, bIdx)
    );
  }

  seekToMeasureBeat(mIdx, bIdx) {
    if (!this.currentExercise || !this.currentExercise.tabData[mIdx]) return;
    const measure = this.currentExercise.tabData[mIdx];
    const ts = this.currentExercise.timeSignature || [4, 4];
    const numBeats = ts[0] || 4;
    const timeline = this.getMeasureNoteTimeline(measure, numBeats);
    const safeBeatIdx = Math.min(bIdx, measure.beats.length - 1);
    const item = timeline[safeBeatIdx] || timeline[0];

    const primaryBeat = Math.min(numBeats - 1, Math.floor(item.startOffset + 0.01));
    const isDownbeat = Math.abs(item.startOffset - primaryBeat) < 0.05;

    this.currentMeasureIndex = mIdx;
    this.currentBeatInMeasure = primaryBeat;
    this.currentBeatIndex = safeBeatIdx;
    this.currentMeasureBeatPos = item.startOffset;
    this.queue = [];

    if (this.isPlaying) {
      this.nextBeatTime = this.audio.audioCtx.currentTime + 0.05;
    }

    const beatData = item.beatData;
    const isRest = beatData.type === "rest";

    this.updateBeatVisuals({
      mIdx: mIdx,
      bIdx: safeBeatIdx,
      primaryBeat: primaryBeat,
      isDownbeat: isDownbeat,
      beatPos: item.startOffset,
      beatData: beatData,
      chordName: measure.chordName,
      isRest: isRest
    });
  }

  injectStudioTrainerToolbar() {
    // 1. Add Guitar Pitch Synth toggle in Audio Options
    const audioBox = document.querySelector(".studio-audio-options");
    if (audioBox && !document.getElementById("toggle-guitar-tone")) {
      const row = document.createElement("div");
      row.className = "setting-item-row";
      row.innerHTML = `
        <span>Guitar Pitch Synth:</span>
        <label style="display:flex;align-items:center;gap:6px;cursor:pointer;color:var(--color-orange-light);font-weight:700;">
          <input type="checkbox" id="toggle-guitar-tone" checked> On (Hear Notes)
        </label>
      `;
      audioBox.appendChild(row);
      this.toggleGuitarTone = row.querySelector("#toggle-guitar-tone");
      this.toggleGuitarTone.addEventListener("change", (e) => {
        this.audio.setGuitarTone(e.target.checked);
        this.saveState();
      });
    }

    // 2. Add 3-Speed Jam-Along Presets (Slow / Medium / Fast) under the BPM readout
    const dialPanel = document.querySelector(".dial-studio-panel");
    if (dialPanel && !document.getElementById("jam-speed-presets")) {
      const presetBar = document.createElement("div");
      presetBar.id = "jam-speed-presets";
      presetBar.className = "jam-speed-presets";
      presetBar.innerHTML = `
        <button class="speed-preset-btn" id="btn-speed-slow" data-speed="slow" title="Slow Learning Tempo">Slow: 45</button>
        <button class="speed-preset-btn active" id="btn-speed-med" data-speed="med" title="Standard Practice Tempo">Med: 60</button>
        <button class="speed-preset-btn" id="btn-speed-fast" data-speed="fast" title="Ready-to-Move-On Goal Tempo">Goal: 84</button>
      `;
      const timeBadge = document.getElementById("time-pill-badge");
      if (timeBadge) {
        dialPanel.insertBefore(presetBar, timeBadge);
      } else {
        dialPanel.appendChild(presetBar);
      }
      presetBar.querySelectorAll(".speed-preset-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const targetBpm = parseInt(btn.dataset.bpm, 10);
          if (targetBpm) this.setBpm(targetBpm);
        });
      });
    }

    // 3. Add Interactive Sight-Reading, Chord Version, String Selector & Done Checkmark bar above Fretboard
    const displayPanel = document.querySelector(".course-display-panel");
    if (displayPanel && !document.getElementById("studio-trainer-bar")) {
      const trainerBar = document.createElement("div");
      trainerBar.id = "studio-trainer-bar";
      trainerBar.className = "studio-trainer-bar";
      trainerBar.innerHTML = `
        <div class="trainer-group" id="sight-reading-group">
          <span class="trainer-group-lbl">Sight-Reading:</span>
          <button class="trainer-pill-btn active" id="btn-toggle-notes" title="Show/Hide Note Letter Names (E, F, G)">Note Names: ON</button>
          <button class="trainer-pill-btn active" id="btn-toggle-tab" title="Show/Hide TAB Numbers (Practice reading staff notation)">TAB Numbers: ON</button>
        </div>
        <div class="trainer-group" id="chord-mode-group">
          <span class="trainer-group-lbl">Chord Voicing:</span>
          <button class="trainer-pill-btn active" data-chord-mode="full" title="Standard Full Chord Form">Full</button>
          <button class="trainer-pill-btn" data-chord-mode="easy4" title="4-Note Beginner Chords (Bonus Book p. 9 & 38)">4-Note</button>
          <button class="trainer-pill-btn" data-chord-mode="easy3" title="3-Note Easy Chords (Bonus Book p. 9 & 38)">3-Note</button>
        </div>
        <div class="trainer-group" id="string-selector-group" style="display:none;">
          <span class="trainer-group-lbl">Drill String:</span>
          <button class="trainer-pill-btn active" data-str="1">1 (E)</button>
          <button class="trainer-pill-btn" data-str="2">2 (B)</button>
          <button class="trainer-pill-btn" data-str="3">3 (G)</button>
          <button class="trainer-pill-btn" data-str="4">4 (D)</button>
          <button class="trainer-pill-btn" data-str="5">5 (A)</button>
          <button class="trainer-pill-btn" data-str="6">6 (E)</button>
        </div>
        <div class="trainer-group">
          <button class="trainer-done-btn" id="btn-mark-done" title="Mark this exercise completed in your progress checklist">
            ✓ Mark Completed
          </button>
        </div>
      `;
      displayPanel.insertBefore(trainerBar, displayPanel.firstChild);

      // Sight-reading toggles
      const btnNotes = trainerBar.querySelector("#btn-toggle-notes");
      const btnTab = trainerBar.querySelector("#btn-toggle-tab");
      btnNotes.addEventListener("click", () => {
        this.showNoteNames = !this.showNoteNames;
        btnNotes.classList.toggle("active", this.showNoteNames);
        btnNotes.textContent = `Note Names: ${this.showNoteNames ? "ON" : "HIDDEN"}`;
        this.tabStaff.setSightReadingOptions({ showNoteNames: this.showNoteNames });
      });
      btnTab.addEventListener("click", () => {
        this.showTabNumbers = !this.showTabNumbers;
        btnTab.classList.toggle("active", this.showTabNumbers);
        btnTab.textContent = `TAB Numbers: ${this.showTabNumbers ? "ON" : "HIDDEN"}`;
        this.tabStaff.setSightReadingOptions({ showTabNumbers: this.showTabNumbers });
      });

      // Chord version selector (Full / 4-Note / 3-Note)
      trainerBar.querySelectorAll("[data-chord-mode]").forEach(btn => {
        btn.addEventListener("click", () => {
          this.chordMode = btn.dataset.chordMode;
          trainerBar.querySelectorAll("[data-chord-mode]").forEach(b => b.classList.toggle("active", b === btn));
          this.fretboard.setChordMode(this.chordMode);
          const curM = this.currentExercise.tabData[this.currentMeasureIndex] || this.currentExercise.tabData[0];
          const curB = curM.beats[this.currentBeatIndex] || curM.beats[0];
          this.fretboard.update(curB, curB.type === "rest", curM.chordName);
        });
      });

      // String selector (1..6) for Finger Exercises ("Repeat for all Strings")
      trainerBar.querySelectorAll("[data-str]").forEach(btn => {
        btn.addEventListener("click", () => {
          const targetStr = parseInt(btn.dataset.str, 10);
          trainerBar.querySelectorAll("[data-str]").forEach(b => b.classList.toggle("active", b === btn));
          this.applyStringOverride(targetStr);
        });
      });

      // Mark Completed button
      const btnDone = trainerBar.querySelector("#btn-mark-done");
      btnDone.addEventListener("click", () => {
        if (this.currentExercise) {
          this.toggleExerciseCompleted(this.currentExercise.id);
        }
      });
    }
  }

  applyStringOverride(targetStr) {
    if (!this.currentExercise || !this.currentExercise.tabData) return;
    const noteMap = {
      1: ["High E", "F", "F#", "G", "G#", "A", "A#", "B", "C", "C#", "D", "D#", "E"],
      2: ["B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"],
      3: ["G", "G#", "A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G"],
      4: ["D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B", "C", "C#", "D"],
      5: ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A"],
      6: ["Low E", "F", "F#", "G", "G#", "A", "A#", "B", "C", "C#", "D", "D#", "E"]
    };
    this.selectedSpiderString = targetStr;
    this.currentExercise.tabData.forEach(m => {
      delete m._timeline;
      m.beats.forEach(b => {
        if (typeof b.string === "number" && b.fret !== null && b.fret !== undefined) {
          b.string = targetStr;
          if (noteMap[targetStr] && b.fret < noteMap[targetStr].length) {
            b.note = noteMap[targetStr][b.fret];
          }
        }
      });
    });
    this.tabStaff.loadExercise(this.currentExercise);
    const firstBeat = this.currentExercise.tabData[0].beats[0];
    this.updateCard(firstBeat, false, 1, this.currentExercise.tabData[0].chordName);
    this.fretboard.update(firstBeat, false, this.currentExercise.tabData[0].chordName);
  }

  updateDoneButtonUI() {
    const btnDone = document.getElementById("btn-mark-done");
    if (!btnDone || !this.currentExercise) return;
    const isDone = this.completedExercises.has(this.currentExercise.id);
    btnDone.classList.toggle("is-completed", isDone);
    btnDone.innerHTML = isDone ? "✓ Completed!" : "✓ Mark Completed";
  }

  updateSpeedPresetsUI() {
    const base = (this.currentExercise && this.currentExercise.defaultBpm) ? this.currentExercise.defaultBpm : 65;
    const slowBpm = Math.max(30, Math.round(base * 0.8));
    const medBpm = base;
    const fastBpm = (this.currentExercise && this.currentExercise.goalBpm) ? this.currentExercise.goalBpm : Math.min(240, Math.round(base * 1.25));

    const btnSlow = document.getElementById("btn-speed-slow");
    const btnMed = document.getElementById("btn-speed-med");
    const btnFast = document.getElementById("btn-speed-fast");
    if (btnSlow && btnMed && btnFast) {
      btnSlow.dataset.bpm = slowBpm;
      btnSlow.textContent = `Slow: ${slowBpm}`;
      btnMed.dataset.bpm = medBpm;
      btnMed.textContent = `Med: ${medBpm}`;
      btnFast.dataset.bpm = fastBpm;
      btnFast.textContent = `Goal: ${fastBpm}`;
      [btnSlow, btnMed, btnFast].forEach(b => {
        b.classList.toggle("active", parseInt(b.dataset.bpm, 10) === this.bpm);
      });
    }
  }

  switchView(viewName) {
    if (this.isPlaying && viewName !== "studio") {
      this.stop();
    }
    this.currentView = viewName;

    // Reset tabs
    [this.tabBtnHome, this.tabBtnBook, this.tabBtnWorkshop, this.tabBtnStudio].forEach(b => {
      if (b) b.classList.remove("active");
    });

    if (viewName === "home") {
      if (this.masterHeader) this.masterHeader.style.display = "flex";
      this.viewHome.style.display = "block";
      this.viewCourseBook.style.display = "none";
      this.viewMetronomeStudio.style.display = "none";
      if (this.tabBtnHome) this.tabBtnHome.classList.add("active");
      if (this.btnMasterBack) this.btnMasterBack.style.display = "none";
      if (this.navModeIndicator) this.navModeIndicator.textContent = "Course Overview & Hub";
    } else if (viewName === "book") {
      if (this.masterHeader) this.masterHeader.style.display = "none";
      this.viewHome.style.display = "none";
      this.viewCourseBook.style.display = "flex";
      this.viewMetronomeStudio.style.display = "none";
      if (this.currentBookCategory === "bonusWorkshop") {
        if (this.choiceWorkshopBook) this.choiceWorkshopBook.classList.add("selected");
        if (this.choiceLessonBook) this.choiceLessonBook.classList.remove("selected");
        if (this.choiceFreeMode) this.choiceFreeMode.classList.remove("selected");
      } else {
        if (this.choiceLessonBook) this.choiceLessonBook.classList.add("selected");
        if (this.choiceWorkshopBook) this.choiceWorkshopBook.classList.remove("selected");
        if (this.choiceFreeMode) this.choiceFreeMode.classList.remove("selected");
      }
      this.renderCourseBookCatalog(this.catalogSearchInput ? this.catalogSearchInput.value : "");
    } else {
      if (this.masterHeader) this.masterHeader.style.display = "none";
      this.viewHome.style.display = "none";
      this.viewCourseBook.style.display = "none";
      this.viewMetronomeStudio.style.display = "block";

      if (this.dial) {
        requestAnimationFrame(() => this.dial.resize());
      }
    }

    this.saveState();
  }

  getSessionChecklist(sessionNum) {
    const map = {
      1: [
        "Memorized the names of all 6 strings (E-A-D-G-B-E)",
        "Play all Finger Exercises (p. 4-5) with steady Down-Up picking",
        "Form the C and G7 chords accurately"
      ],
      2: [
        "Play all 1st & 2nd string exercises (p. 9-13) at 65 BPM",
        "Play 'More 1st & 2nd String' exercises with accurate rests",
        "Play Ode to Joy & Jingle Bells (notes and chords) at 90 BPM"
      ],
      3: [
        "Play Eighth Note Exercises (p. 17) without hesitation at 60 BPM",
        "Play 3rd & 4th String Exercises steadily at 60 BPM",
        "Play Yankee Doodle & Aura Lee at 85 BPM; When the Saints at 120 BPM"
      ],
      4: [
        "Play 5th & 6th String Exercises without hesitation at 60 BPM",
        "Play Minuet in C & Minuet in G consistently at 77 BPM",
        "Play Simple Gifts & The Star-Spangled Banner at 70 BPM"
      ],
      5: [
        "Play Basic Open Chord Exercises 1, 2 & 3 smoothly at 60-70 BPM",
        "Play Morning Has Broken (notes at 85 BPM, chords at 55 BPM)",
        "Play America the Beautiful (notes at 75 BPM, chords at 60 BPM)"
      ],
      6: [
        "Play Minor 7th & Suspended chord exercises (p. 37-41) at 84 BPM",
        "Play Scarborough Fair & Greensleeves at 92 BPM",
        "Play Island Groove with continuous strumming hand motion at 84 BPM"
      ],
      7: [
        "Play 6th String Barre Chord exercises (p. 44) smoothly at 72 BPM",
        "Play Home on the Range & Yellow Rose of Texas at 84 BPM",
        "Completed Major Scales & Ultimate Major Scale Mix-Up worksheets"
      ],
      8: [
        "Switch 5th & 6th string barre chord forms interchangeably",
        "Play 5th String Barre Chord exercises (p. 48-49) at 72 BPM",
        "Play Jamaica Farewell in F & G and memorize all 12 Key Signatures"
      ],
      9: [
        "Play 8th-Note & Tied Strumming exercises (p. 52-53) at 80-100 BPM",
        "Play La Bamba & Blues in E at 92 BPM; Wabash Cannonball at 112 BPM",
        "Completed Diatonic & Harmonic Interval worksheets"
      ],
      10: [
        "Play Fingerstyle P-I-M-A Patterns 1, 2 & 3 (p. 57-59) at 92 BPM",
        "Play Giuliani Studies & House of the Rising Sun at 60 BPM",
        "Play Dm Etude & Canon in D (Revised) cleanly"
      ],
      11: [
        "Play all 5 Pentatonic Forms ascending & descending from memory",
        "Connect Pentatonic Forms across the neck in C/Am and Em/G",
        "Play Common Pentatonic Patterns (p. 64-65) at 80 BPM"
      ],
      12: [
        "Memorized Open & Moveable 2, Major 7th, and Minor 11th chords",
        "Play Advanced Chord & Substitution exercises at 80 BPM"
      ],
      13: [
        "Play all 5 Minor Pentatonic Blues Forms in every key",
        "Memorized 12-Bar Blues progression & 4 Triad Formulas (1-3-5, 1-b3-5...)"
      ],
      14: [
        "Play Major Scale Bending Exercise (p. 77) in tune to pitch",
        "Execute Hammer-Ons, Pull-Offs, Slides, and Natural Harmonics (5th/7th/12th)"
      ],
      15: [
        "Play all Open & Moveable Power Chords, Chicken Pickin' & Sliding 4ths",
        "Completed Harmonized Major Scale Worksheet (I-ii-iii-IV-V-vi-viidim)"
      ],
      16: [
        "Play all 16th-Note & Accented Strumming Exercises at 72 BPM",
        "Play Rolling Along, A Little Bit Rocky & Electric Funk with steady hand flow"
      ],
      17: [
        "Play all 7 Three-Note-on-a-String Scale Forms in F, D, and Bb",
        "Spell all 6 Seventh Chord types (Maj7, m7, 7, aug7, dim7, m7b5)"
      ],
      18: [
        "Play Jazz Major 7th, Minor 7th & 9th moveable forms and Chord Melodies",
        "Apply Color Tones, ii-V-I resolutions, and Altered Dominants"
      ],
      19: [
        "Completed Ear Training Exercises 1-3 and Building a Solo from Ground Up",
        "Play Stevie's Groove melody and chord-tone solo"
      ],
      20: [
        "Mastered Slash/Inversion chords, Drone chords, and Chord Exercises 1 & 2",
        "Play Friend and Funky Groove at Jam-Along band tempo"
      ]
    };
    return map[sessionNum] || [];
  }

  escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  renderCourseBookCatalog(filterQuery = "") {
    const isWorkshop = this.currentBookCategory === "bonusWorkshop";
    const sessionList = isWorkshop ? GUITAR_COURSES.bonusWorkshop : GUITAR_COURSES.lessonBook;
    const query = (filterQuery || "").trim().toLowerCase();

    let html = "";

    sessionList.forEach((session) => {
      let matchingTopics = [];
      let totalExCount = 0;

      session.topics.forEach(t => {
        const matchingExercises = t.exercises.filter(ex => {
          totalExCount++;
          if (!query) return true;
          return ex.title.toLowerCase().includes(query) ||
                 (ex.description && ex.description.toLowerCase().includes(query)) ||
                 t.topicTitle.toLowerCase().includes(query) ||
                 session.sessionTitle.toLowerCase().includes(query);
        });

        if (matchingExercises.length > 0) {
          matchingTopics.push({ topicTitle: t.topicTitle, exercises: matchingExercises });
        }
      });

      if (query && matchingTopics.length === 0) return;

      const topicsToRender = query ? matchingTopics : session.topics;
      const tagText = isWorkshop ? `Workshop ${session.sessionNumber}` : `Session ${session.sessionNumber}`;

      let topicsHtml = "";
      topicsToRender.forEach(topic => {
        let pillsHtml = topic.exercises.map(ex => {
          const isRestDrill = ex.id.includes("rest") || ex.title.toLowerCase().includes("rest");
          const isDone = this.completedExercises.has(ex.id);
          return `
            <button class="exercise-pill-btn ${isRestDrill ? 'has-rest-cue' : ''} ${isDone ? 'is-completed-pill' : ''}" data-ex-id="${ex.id}" title="${this.escapeHtml(ex.title)}">
              ${isDone ? '<span style="color:#34d399;margin-right:3px;">✓</span>' : ''}
              <span>${this.escapeHtml(ex.title.replace(/^Exercise \d+: /, '').replace(/^Finger Exercise \d+: /, '').replace(/^Workshop Drill \d+: /, ''))}</span>
            </button>
          `;
        }).join("");

        topicsHtml += `
          <div class="topic-group-block">
            <div class="topic-title-sub">${this.escapeHtml(topic.topicTitle)}</div>
            <div class="exercise-pills-row">${pillsHtml}</div>
          </div>
        `;
      });

      const checklistItems = this.getSessionChecklist(session.sessionNumber);
      const checklistHtml = checklistItems.length > 0 ? `
        <div class="session-checklist-box">
          <div class="checklist-header">You're Ready to Move On When:</div>
          <div class="checklist-items">
            ${checklistItems.map((item, idx) => {
              const gKey = `${this.currentBookCategory}_s${session.sessionNumber}_g${idx}`;
              const checked = this.checkedGoals.has(gKey) ? "checked" : "";
              return `
                <label class="session-checklist-item" style="display:flex;align-items:center;gap:6px;cursor:pointer;">
                  <input type="checkbox" data-goal-key="${gKey}" ${checked} style="accent-color:var(--color-orange,#f97316);">
                  <span>${this.escapeHtml(item)}</span>
                </label>
              `;
            }).join("")}
          </div>
        </div>
      ` : "";

      html += `
        <div class="session-book-card" data-session-num="${session.sessionNumber}">
          <div class="session-card-header">
            <div>
              <span class="session-card-tag">${tagText}</span>
              <h3 class="session-card-title">${this.escapeHtml(session.sessionTitle)}</h3>
              <div class="session-card-sub">${this.escapeHtml(session.sessionSubtitle || "")}</div>
            </div>
            <div class="session-ex-count-badge">${totalExCount} Exercises</div>
          </div>

          <div class="session-topics-container">
            ${topicsHtml}
          </div>

          ${checklistHtml}

          <div class="session-card-footer">
            <span class="session-card-quick-tip">Click any exercise above to practice with live metronome</span>
            ${(topicsToRender[0] && topicsToRender[0].exercises[0]) ? `
              <button class="btn-open-session-first" data-first-ex="${topicsToRender[0].exercises[0].id}">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style="vertical-align: middle; margin-right: 4px;"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                <span>Practice First Drill</span>
              </button>
            ` : ""}
          </div>
        </div>
      `;
    });

    if (html === "") {
      html = `<div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">No exercises found matching "${this.escapeHtml(filterQuery)}".</div>`;
    }

    this.sessionsCatalogGrid.innerHTML = html;

    // Attach click listeners on exercise pills
    this.sessionsCatalogGrid.querySelectorAll(".exercise-pill-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.exId;
        this.loadExercise(id);
        this.switchView("studio");
      });
    });

    // Attach click on "Practice First Drill"
    this.sessionsCatalogGrid.querySelectorAll(".btn-open-session-first").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.firstEx;
        this.loadExercise(id);
        this.switchView("studio");
      });
    });

    // Attach goal checklist changes
    this.sessionsCatalogGrid.querySelectorAll("input[data-goal-key]").forEach(chk => {
      chk.addEventListener("change", (e) => {
        const key = e.target.dataset.goalKey;
        this.toggleGoalChecked(key);
      });
    });
  }

  populateStudioDropdown() {
    let html = "";
    
    // Lesson Book
    html += '<optgroup label="--- LESSON BOOK (Sessions 1-20) ---">';
    (GUITAR_COURSES.lessonBook || []).forEach(session => {
      session.topics.forEach(topic => {
        topic.exercises.forEach(ex => {
          html += `<option value="${ex.id}">S${session.sessionNumber}: ${this.escapeHtml(ex.title)}</option>`;
        });
      });
    });
    html += '</optgroup>';

    // Bonus Workshop
    html += '<optgroup label="--- BONUS WORKSHOPS (Workshops 1-20) ---">';
    (GUITAR_COURSES.bonusWorkshop || []).forEach(session => {
      session.topics.forEach(topic => {
        topic.exercises.forEach(ex => {
          html += `<option value="${ex.id}">W${session.sessionNumber}: ${this.escapeHtml(ex.title)}</option>`;
        });
      });
    });
    html += '</optgroup>';

    // Free Metronome
    if (GUITAR_COURSES.freeMetronome) {
      html += '<optgroup label="--- FREE STUDIO METRONOME ---">';
      html += `<option value="free-metronome">Free Metronome (All 4 Beats Editable)</option>`;
      html += '</optgroup>';
    }

    this.studioSessionSelect.innerHTML = html;
  }

  loadExercise(exerciseId, keepBpm = false) {
    if (this.isPlaying) this.stop();

    const found = this.findExerciseById(exerciseId);
    if (!found) return;

    this.currentExercise = JSON.parse(JSON.stringify(found));
    this.currentExerciseIndex = this.allExercises.findIndex(e => e.id === found.id);
    this.currentBookCategory = found.bookCategory;
    this.selectedSpiderString = 1;

    // Header & dropdown updates
    this.studioExerciseTitle.textContent = this.currentExercise.title;
    if (this.studioExerciseTopicBadge) {
      this.studioExerciseTopicBadge.textContent = `${found.bookName} • ${found.sessionTitle || ''} • ${found.topicTitle || ''}`;
    }
    this.studioSessionSelect.value = this.currentExercise.id;

    // Update Steve Krenz Instructions Banner
    const instrEl = this.studioInstructionText || document.getElementById("studio-instruction-text");
    if (instrEl) {
      instrEl.textContent = this.currentExercise.description || "Practice slowly and steadily with the metronome. Focus on clean fretting-hand placement right behind the fret wire and consistent picking.";
    }

    if (!keepBpm) {
      this.setBpm(this.currentExercise.defaultBpm || 60);
    }

    const ts = this.currentExercise.timeSignature || [4, 4];
    this.timePillBadge.textContent = `${ts[0]}/${ts[1]} TIME`;

    this.currentMeasureIndex = 0;
    this.currentBeatInMeasure = 0;
    this.currentBeatIndex = 0;
    this.currentMeasureBeatPos = 0.0;

    // Auto-hide TAB numbers by default on "More String Exercises" for sight-reading practice
    const isTabFreeSightReading = /more.*string/i.test(this.currentExercise.title);
    this.showTabNumbers = !isTabFreeSightReading;
    const btnTab = document.getElementById("btn-toggle-tab");
    if (btnTab) {
      btnTab.classList.toggle("active", this.showTabNumbers);
      btnTab.textContent = `TAB Numbers: ${this.showTabNumbers ? "ON" : "HIDDEN"}`;
    }

    // Toggle String selector visibility (only for finger exercises / spider drills)
    const strGroup = document.getElementById("string-selector-group");
    const isFingerDrill = this.currentExercise.id.includes("fe") || /finger exercise/i.test(this.currentExercise.title);
    if (strGroup) {
      strGroup.style.display = isFingerDrill ? "flex" : "none";
      strGroup.querySelectorAll("[data-str]").forEach(b => b.classList.toggle("active", b.dataset.str === "1"));
    }

    // Toggle Chord mode selector visibility
    const chordGroup = document.getElementById("chord-mode-group");
    const hasChords = (this.currentExercise.tabData || []).some(m => m.chordName || (m.beats && m.beats.some(b => b.string === "all" || (typeof b.string === "string" && b.string.includes("-")))));
    if (chordGroup) {
      chordGroup.style.display = hasChords ? "flex" : "none";
    }

    this.updateDoneButtonUI();
    this.updateSpeedPresetsUI();
    this.renderBeatDots();
    this.tabStaff.loadExercise(this.currentExercise);
    this.tabStaff.setSightReadingOptions({
      showNoteNames: this.showNoteNames,
      showTabNumbers: this.showTabNumbers
    });
    this.fretboard.setChordMode(this.chordMode);
    this.fretboard.reset();

    const firstBeat = this.currentExercise.tabData[0].beats[0];
    this.updateCard(firstBeat, false, 1, this.currentExercise.tabData[0].chordName);
    this.fretboard.update(firstBeat, false, this.currentExercise.tabData[0].chordName);

    this.saveState();
  }

  renderBeatDots() {
    const ts = this.currentExercise.timeSignature || [4, 4];
    const numBeats = ts[0] || 4;
    let html = "";
    for (let i = 0; i < numBeats; i++) {
      html += `<div class="beat-dot-item" data-index="${i}" title="Beat ${i + 1} - Click to toggle Play/Rest"></div>`;
    }
    this.beatDotsSequence.innerHTML = html;

    // Attach click to toggle rest/mute on any beat
    const dots = this.beatDotsSequence.querySelectorAll(".beat-dot-item");
    dots.forEach(dot => {
      dot.addEventListener("click", () => {
        const beatIdx = parseInt(dot.dataset.index, 10);
        dot.classList.toggle("configured-as-rest");
        const isRestNow = dot.classList.contains("configured-as-rest");

        this.currentExercise.tabData.forEach(m => {
          delete m._timeline;
          const timeline = this.getMeasureNoteTimeline(m, numBeats);
          timeline.forEach(item => {
            const pBeat = Math.min(numBeats - 1, Math.floor(item.startOffset + 0.01));
            if (pBeat === beatIdx) {
              const b = item.beatData;
              if (b.savedType === undefined) b.savedType = b.type;
              if (b.savedNote === undefined) b.savedNote = b.note;
              if (b.savedIsSustain === undefined) b.savedIsSustain = b.isSustain;

              b.type = isRestNow ? "rest" : b.savedType;
              b.note = isRestNow ? "REST" : b.savedNote;
              b.isSustain = isRestNow ? false : b.savedIsSustain;
            }
          });
        });

        this.tabStaff.loadExercise(this.currentExercise);
      });
    });
  }

  setBpm(newBpm) {
    this.bpm = Math.max(30, Math.min(240, Math.round(newBpm)));
    this.bpmDisplay.textContent = this.bpm;
    if (this.dial) this.dial.setBpm(this.bpm);
    this.updateSpeedPresetsUI();
    this.saveState();
  }

  togglePlay() {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.start();
    }
  }

  async requestWakeLock() {
    try {
      if ("wakeLock" in navigator) {
        this.wakeLock = await navigator.wakeLock.request("screen");
      }
    } catch (e) {}
  }

  releaseWakeLock() {
    if (this.wakeLock) {
      this.wakeLock.release().catch(() => {});
      this.wakeLock = null;
    }
  }

  getMeasureNoteTimeline(curMeasure, numBeats) {
    if (curMeasure._timeline && curMeasure._timeline.length === curMeasure.beats.length) {
      return curMeasure._timeline;
    }
    const beats = curMeasure.beats || [];
    const timeline = [];
    const hasSubBeatOrUnsustainedMultiBeat = beats.some(b => {
      const sym = (b.symbol || "").toLowerCase();
      return sym === "1/8" || sym === "1/16" || b.duration === 0.5 || b.duration === 0.25;
    });

    if (beats.length === numBeats && !hasSubBeatOrUnsustainedMultiBeat) {
      for (let i = 0; i < beats.length; i++) {
        timeline.push({
          beatData: beats[i],
          beatIndex: i,
          startOffset: i * 1.0,
          duration: beats[i].duration || 1.0
        });
      }
    } else {
      let currentPos = 0.0;
      const hasSustainPadding = beats.some(x => x.isSustain || x.type === "sustain");
      for (let i = 0; i < beats.length; i++) {
        const b = beats[i];
        const sym = (b.symbol || "").toLowerCase();
        let dur = b.duration;

        if (b.isSustain || b.type === "sustain") {
          dur = (sym === "1/8" || b.duration === 0.5) ? 0.5 : 1.0;
        } else if (sym === "1/8" || b.duration === 0.5) {
          dur = 0.5;
        } else if (sym === "1/16" || b.duration === 0.25) {
          dur = 0.25;
        } else if (hasSustainPadding && (dur >= 2 || sym === "1/2" || sym === "3/4" || sym === "1/1")) {
          // When sustain objects pad the remaining beats of a half/whole note, each slot advances 1 beat
          dur = 1.0;
        } else if (!dur) {
          if (sym === "1/2") dur = 2.0;
          else if (sym === "3/4") dur = 3.0;
          else if (sym === "1/1") dur = 4.0;
          else dur = 1.0;
        }

        timeline.push({
          beatData: b,
          beatIndex: i,
          startOffset: currentPos,
          duration: dur
        });
        currentPos += dur;
      }
    }
    curMeasure._timeline = timeline;
    return timeline;
  }

  start() {
    this.audio.init();
    this.isPlaying = true;
    this.dial.setPlayState(true);
    this.requestWakeLock();

    this.currentMeasureIndex = 0;
    this.currentBeatInMeasure = 0;
    this.currentBeatIndex = 0;
    this.currentMeasureBeatPos = 0.0;
    this.queue = [];

    const ts = this.currentExercise.timeSignature || [4, 4];
    this.isCountingIn = this.countInEnabled;
    this.countInBeat = 0;
    this.countInTotalBeats = ts[0] || 4;

    this.nextBeatTime = this.audio.audioCtx.currentTime + 0.05;
    this.scheduler();
  }

  stop() {
    this.isPlaying = false;
    this.isCountingIn = false;
    clearTimeout(this.timerId);
    this.releaseWakeLock();

    this.dial.setPlayState(false);
    this.dial.setRestState(false);
    this.currentBeatInMeasure = 0;
    this.currentMeasureBeatPos = 0.0;

    const dots = this.beatDotsSequence.querySelectorAll(".beat-dot-item");
    dots.forEach(d => d.classList.remove("active-play", "active-rest"));

    this.fretboard.reset();
    this.tabStaff.reset();

    const firstMeasure = this.currentExercise.tabData[0];
    const firstBeat = firstMeasure.beats[0];
    this.updateCard(firstBeat, false, 1, firstMeasure.chordName);
    this.fretboard.update(firstBeat, firstBeat.type === "rest", firstMeasure.chordName);
  }

  scheduler() {
    try {
      while (this.isPlaying && this.nextBeatTime < this.audio.audioCtx.currentTime + this.scheduleAheadTime) {
        this.scheduleBeat(this.nextBeatTime);
        this.advanceBeat();
      }
    } catch (e) {
      console.warn("Scheduler cycle error:", e);
    }
    if (this.isPlaying) {
      this.timerId = setTimeout(() => this.scheduler(), this.lookahead);
    }
  }

  scheduleBeat(time) {
    const secondsPerQuarterBeat = 60.0 / this.bpm;

    // 1-Bar Count-In handling
    if (this.isCountingIn) {
      const isAccent = this.countInBeat === 0;
      this.audio.playBeat(time, isAccent, false, true);
      const cBeat = this.countInBeat + 1;
      this.queue.push({
        isCountIn: true,
        countInBeat: cBeat,
        time: time
      });
      return;
    }

    const curMeasure = this.currentExercise.tabData[this.currentMeasureIndex];
    if (!curMeasure) return;

    const ts = this.currentExercise.timeSignature || [4, 4];
    const numBeats = ts[0] || 4;
    const b = this.currentBeatInMeasure;

    const timeline = this.getMeasureNoteTimeline(curMeasure, numBeats);
    const notesInThisBeat = timeline.filter(item => item.startOffset >= (b - 0.02) && item.startOffset < (b + 0.98));

    // Determine if this primary beat has a rest
    let isBeatRest = false;
    if (notesInThisBeat.length > 0) {
      const primaryNote = notesInThisBeat[0];
      isBeatRest = primaryNote.beatData.type === "rest";
    } else {
      const ringingNote = timeline.slice().reverse().find(it => it.startOffset <= (b + 0.01));
      isBeatRest = ringingNote ? (ringingNote.beatData.type === "rest") : false;
    }

    // 1. Audible Metronome Pulse (Clicks on every quarter-note beat: 1, 2, 3, 4)
    const isAccent = (b === 0);
    this.audio.playBeat(time, isAccent, isBeatRest, false);

    // 2. Guitar Note Synthesis & UI Queue Events
    if (notesInThisBeat.length > 0) {
      notesInThisBeat.forEach(item => {
        const offsetBeats = Math.max(0, item.startOffset - b);
        const noteAudioTime = time + offsetBeats * secondsPerQuarterBeat;
        const isRest = item.beatData.type === "rest";
        const isSustain = item.beatData.isSustain || item.beatData.type === "sustain";

        if (!isRest && !isSustain) {
          const noteDurBeats = item.beatData.duration || item.duration || 1.0;
          this.audio.playNoteEvent(noteAudioTime, item.beatData, curMeasure.chordName, noteDurBeats * secondsPerQuarterBeat);
        }

        this.queue.push({
          mIdx: this.currentMeasureIndex,
          bIdx: item.beatIndex,
          primaryBeat: b,
          isDownbeat: (offsetBeats < 0.05),
          beatPos: item.startOffset,
          beatData: item.beatData,
          chordName: curMeasure.chordName,
          isRest: isRest,
          isSustain: isSustain,
          time: noteAudioTime
        });
      });
    } else {
      // Multi-beat note ringing across this beat
      const ringingNote = timeline.slice().reverse().find(it => it.startOffset <= (b + 0.01));
      const isRest = ringingNote ? (ringingNote.beatData.type === "rest") : false;
      this.queue.push({
        mIdx: this.currentMeasureIndex,
        bIdx: ringingNote ? ringingNote.beatIndex : 0,
        primaryBeat: b,
        isDownbeat: true,
        beatPos: b,
        beatData: ringingNote ? ringingNote.beatData : null,
        chordName: curMeasure.chordName,
        isRest: isRest,
        isSustain: true,
        time: time
      });
    }
  }

  advanceBeat() {
    const secondsPerQuarterBeat = 60.0 / this.bpm;

    if (this.isCountingIn) {
      this.countInBeat++;
      if (this.countInBeat >= this.countInTotalBeats) {
        this.isCountingIn = false;
        this.currentMeasureIndex = 0;
        this.currentBeatInMeasure = 0;
      }
      this.nextBeatTime += secondsPerQuarterBeat;
      return;
    }

    const ts = this.currentExercise.timeSignature || [4, 4];
    const numBeats = ts[0] || 4;

    this.currentBeatInMeasure++;
    if (this.currentBeatInMeasure >= numBeats) {
      this.currentBeatInMeasure = 0;
      this.currentMeasureIndex++;

      if (this.currentMeasureIndex >= this.currentExercise.tabData.length) {
        this.currentMeasureIndex = 0; // Loop
      }
    }

    this.nextBeatTime += secondsPerQuarterBeat;
  }

  requestDrawLoop() {
    const draw = () => {
      this.processVisualQueue();
      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
  }

  processVisualQueue() {
    if (!this.isPlaying || !this.audio.audioCtx) return;
    const currentTime = this.audio.audioCtx.currentTime;

    while (this.queue.length > 0 && this.queue[0].time <= currentTime) {
      const ev = this.queue.shift();
      this.updateBeatVisuals(ev);
    }
  }

  updateBeatVisuals(ev) {
    if (ev.isCountIn) {
      this.noteActiveCard.className = "note-active-card mode-play";
      this.noteGlyphLarge.innerHTML = `<span style="font-size:24px;font-weight:900;color:var(--color-orange-light);">${ev.countInBeat}</span>`;
      this.noteHeaderBig.textContent = `COUNT-IN: BEAT ${ev.countInBeat} OF ${this.countInTotalBeats}`;
      this.noteSubInstruction.textContent = "Get ready to play on Beat 1!";
      this.noteRightGuidance.textContent = "COUNT-IN";

      const dots = this.beatDotsSequence.querySelectorAll(".beat-dot-item");
      dots.forEach((d, idx) => {
        d.classList.toggle("active-play", idx === (ev.countInBeat - 1));
        d.classList.remove("active-rest");
      });
      return;
    }

    const { mIdx, bIdx, primaryBeat, isDownbeat, beatData, chordName, isRest } = ev;

    // 1. Update Dial Color
    this.dial.setRestState(isRest);

    // 2. Update Beat Dots
    const dots = this.beatDotsSequence.querySelectorAll(".beat-dot-item");
    dots.forEach((d, idx) => {
      if (idx === primaryBeat) {
        if (isRest) {
          d.classList.remove("active-play");
          d.classList.add("active-rest");
        } else {
          d.classList.remove("active-rest");
          d.classList.add("active-play");
        }
      } else {
        d.classList.remove("active-play", "active-rest");
      }
    });

    // 3. Update Feedback Banner
    const beatLabel = isDownbeat ? (primaryBeat + 1) : `${primaryBeat + 1} &`;
    this.updateCard(beatData, isRest, beatLabel, chordName);

    // 4. Update Fretboard
    this.fretboard.update(beatData, isRest, chordName);

    // 5. Update Tab Staff Playhead Cursor
    this.tabStaff.highlightBeat(mIdx, bIdx, isRest);
  }

  // Crisp Music Engraving SVGs for the Studio Feedback Card
  getGlyphSvg(sym, dur, isRest) {
    if (isRest) {
      // Whole Rest (hangs below 4th line)
      if (dur >= 4) {
        return `<svg viewBox="0 0 28 24" width="26" height="22">
          <line x1="3" y1="8" x2="25" y2="8" stroke="rgba(255,255,255,0.45)" stroke-width="1.8"/>
          <rect x="7" y="8" width="14" height="6.5" fill="var(--color-rest, #f43f5e)" rx="1"/>
        </svg>`;
      }
      // Half Rest (sits on 3rd line)
      if (dur >= 2) {
        return `<svg viewBox="0 0 28 24" width="26" height="22">
          <line x1="3" y1="15" x2="25" y2="15" stroke="rgba(255,255,255,0.45)" stroke-width="1.8"/>
          <rect x="7" y="8.5" width="14" height="6.5" fill="var(--color-rest, #f43f5e)" rx="1"/>
        </svg>`;
      }
      // Eighth Rest
      if (sym === "1/8") {
        return `<svg viewBox="0 0 24 28" width="22" height="26">
          <circle cx="9.5" cy="9" r="3" fill="var(--color-rest, #f43f5e)"/>
          <path d="M 9.5 9 Q 13 11, 15.5 7 L 10 23" fill="none" stroke="var(--color-rest, #f43f5e)" stroke-width="2.3" stroke-linecap="round"/>
        </svg>`;
      }
      // Quarter Rest
      return `<svg viewBox="0 0 24 30" width="22" height="26">
        <path d="M 8 3 L 15 10 L 9 16 L 15 22 C 11 21, 8 24, 11 27" fill="none" stroke="var(--color-rest, #f43f5e)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;
    }

    // Beamed Eighth-Note Pair (♫)
    if (sym === "1/8" || dur <= 0.5) {
      return `<svg viewBox="0 0 36 32" width="32" height="28">
        <ellipse cx="7.5" cy="24" rx="5.2" ry="3.8" fill="var(--color-play, #f97316)" transform="rotate(-18 7.5 24)"/>
        <line x1="12" y1="23" x2="12" y2="6" stroke="var(--color-play, #f97316)" stroke-width="2.3" stroke-linecap="butt"/>
        <ellipse cx="24.5" cy="21" rx="5.2" ry="3.8" fill="var(--color-play, #f97316)" transform="rotate(-18 24.5 21)"/>
        <line x1="29" y1="20" x2="29" y2="3.5" stroke="var(--color-play, #f97316)" stroke-width="2.3" stroke-linecap="butt"/>
        <polygon points="10.8,8.5 30.2,6 30.2,2 10.8,4.5" fill="var(--color-play, #f97316)"/>
      </svg>`;
    }

    // Whole Note
    if (sym === "1/1" || dur >= 4) {
      return `<svg viewBox="0 0 30 28" width="26" height="24">
        <ellipse cx="15" cy="14" rx="8.5" ry="5.5" fill="none" stroke="var(--color-play, #f97316)" stroke-width="3.2" transform="rotate(-15 15 14)"/>
      </svg>`;
    }

    // Dotted Half Note (3 Beats)
    if (sym === "3/4" || dur >= 3) {
      return `<svg viewBox="0 0 32 30" width="28" height="26">
        <ellipse cx="10" cy="22" rx="6" ry="4.2" fill="none" stroke="var(--color-play, #f97316)" stroke-width="2.4" transform="rotate(-18 10 22)"/>
        <line x1="15.2" y1="21" x2="15.2" y2="4" stroke="var(--color-play, #f97316)" stroke-width="2.2" stroke-linecap="round"/>
        <circle cx="22.5" cy="21.5" r="2.3" fill="var(--color-play, #f97316)"/>
      </svg>`;
    }

    // Half Note (2 Beats)
    if (sym === "1/2" || dur >= 2) {
      return `<svg viewBox="0 0 26 30" width="24" height="26">
        <ellipse cx="10.5" cy="22" rx="6" ry="4.2" fill="none" stroke="var(--color-play, #f97316)" stroke-width="2.4" transform="rotate(-18 10.5 22)"/>
        <line x1="15.7" y1="21" x2="15.7" y2="4" stroke="var(--color-play, #f97316)" stroke-width="2.2" stroke-linecap="round"/>
      </svg>`;
    }

    // Quarter Note (1 Beat)
    return `<svg viewBox="0 0 26 30" width="24" height="26">
      <ellipse cx="10.5" cy="22" rx="6" ry="4.2" fill="var(--color-play, #f97316)" transform="rotate(-18 10.5 22)"/>
      <line x1="15.7" y1="21" x2="15.7" y2="4" stroke="var(--color-play, #f97316)" stroke-width="2.2" stroke-linecap="round"/>
    </svg>`;
  }

  updateCard(beatData, isRest, beatNumber, chordName = null) {
    if (!beatData) return;
    const dur = beatData.duration || 1;
    const sym = (beatData.symbol || "1/4").toLowerCase();

    if (isRest) {
      this.noteActiveCard.className = "note-active-card mode-rest";
      this.noteGlyphLarge.innerHTML = this.getGlyphSvg(sym, dur, true);
      this.noteHeaderBig.textContent = `BEAT ${beatNumber}: REST / MUTE`;
      this.noteSubInstruction.textContent = beatData.tip || "Silence all strings with right palm!";
      this.noteRightGuidance.textContent = "DAMP SOUND";
    } else {
      this.noteActiveCard.className = "note-active-card mode-play";
      this.noteGlyphLarge.innerHTML = this.getGlyphSvg(sym, dur, false);

      const isSustain = beatData.isSustain || beatData.type === "sustain";
      const isSingleNoteMelody = typeof beatData.string === "number";

      if (isSingleNoteMelody) {
        const noteName = beatData.note || "NOTE";
        const chordSuffix = chordName ? ` [Chord: ${chordName}]` : "";
        this.noteHeaderBig.textContent = `BEAT ${beatNumber}: ${noteName}${chordSuffix} ${isSustain ? '(Hold)' : ''}`;

        const s = beatData.string ? `String ${beatData.string}` : null;
        const f = (beatData.fret !== null && beatData.fret !== undefined) ? `Fret ${beatData.fret}` : null;
        const fin = (beatData.finger !== null && beatData.finger !== undefined) ? `Finger ${beatData.finger}` : null;
        this.noteSubInstruction.textContent = [s, f, fin].filter(Boolean).join(" • ") || (beatData.tip || "Play cleanly");
      } else if (chordName) {
        this.noteHeaderBig.textContent = `BEAT ${beatNumber}: ${chordName} CHORD ${isSustain ? '(Tie / Keep Hand Going!)' : ''}`;
        this.noteSubInstruction.textContent = isSustain
          ? (beatData.tip || "TIE: Swing hand past strings without touching them (Keep Your Hand Going!)")
          : (beatData.tip || `Strum ${chordName} (${beatData.string === 'all' ? 'All 6 Strings' : 'Strings ' + beatData.string})`);
      } else {
        const noteName = beatData.note || "NOTE";
        this.noteHeaderBig.textContent = `BEAT ${beatNumber}: ${noteName} ${isSustain ? '(Hold)' : ''}`;
        this.noteSubInstruction.textContent = beatData.tip || "Play cleanly on tempo";
      }

      // Visual Strumming Pendulum Guidance ("Keep Your Hand Going!")
      const isUpbeat = String(beatNumber).includes("&");
      if (isSustain && chordName && !isSingleNoteMelody) {
        this.noteRightGuidance.textContent = isUpbeat ? "↑ MISS (Ghost Up)" : "↓ MISS (Ghost Down)";
      } else if (beatData.pick && beatData.pick !== "-") {
        const arrow = beatData.pick === "Up" ? "↑ Up Strum" : (beatData.pick === "Down" ? "↓ Down Strum" : `Finger: ${beatData.pick}`);
        this.noteRightGuidance.textContent = arrow;
      } else {
        this.noteRightGuidance.textContent = isSustain ? "Hold & Ring" : "↓ Down";
      }
    }
  }

  saveState() {
    if (this.isRestoring) return;
    const state = {
      view: this.currentView,
      book: this.currentBookCategory,
      exId: this.currentExercise ? this.currentExercise.id : "lb-s2-str1-ex1",
      bpm: this.bpm,
      soundType: this.audio.soundType,
      soundOnRest: this.audio.soundOnRest,
      guitarTone: this.audio.guitarToneEnabled,
      countIn: this.countInEnabled
    };

    try {
      localStorage.setItem("guitar_master_app_state", JSON.stringify(state));
      const hashStr = `view=${state.view}&book=${state.book}&exId=${state.exId}`;
      if (window.location.hash.substring(1) !== hashStr) {
        if (window.history && window.history.replaceState) {
          window.history.replaceState(null, "", `#${hashStr}`);
        } else {
          window.location.hash = hashStr;
        }
      }
    } catch (e) {}
  }

  restoreState() {
    let savedLocal = null;
    try {
      const raw = localStorage.getItem("guitar_master_app_state");
      if (raw) savedLocal = JSON.parse(raw);
    } catch (e) {}

    let state = {
      view: "home",
      book: "lessonBook",
      exId: "lb-s2-str1-ex1",
      bpm: 60,
      soundType: "woodblock",
      soundOnRest: "click",
      guitarTone: true,
      countIn: false,
      ...(savedLocal || {})
    };

    if (window.location.hash && window.location.hash.length > 1) {
      const params = new URLSearchParams(window.location.hash.substring(1));
      if (params.get("view") || params.get("book") || params.get("exId")) {
        state = {
          ...state,
          view: params.get("view") || state.view,
          book: params.get("book") || state.book,
          exId: params.get("exId") || state.exId
        };
      }
    }

    this.isRestoring = true;

    if (state.soundType && this.selectSound) {
      this.selectSound.value = state.soundType;
      this.audio.setSoundType(state.soundType);
    }
    const restSoundVal = (state.soundOnRest === "muted-thud" || !state.soundOnRest) ? "click" : state.soundOnRest;
    if (this.selectRestSound) {
      this.selectRestSound.value = restSoundVal;
      this.audio.setRestSoundType(restSoundVal);
    }
    if (typeof state.countIn === "boolean" && this.toggleCountIn) {
      this.countInEnabled = state.countIn;
      this.toggleCountIn.checked = state.countIn;
      const lblText = document.getElementById("label-count-in-text");
      if (lblText) lblText.textContent = this.countInEnabled ? "On" : "Off";
    }
    if (typeof state.guitarTone === "boolean") {
      this.audio.setGuitarTone(state.guitarTone);
      if (this.toggleGuitarTone) this.toggleGuitarTone.checked = state.guitarTone;
    }

    this.setBookCategory(state.book || "lessonBook");

    if (state.exId) {
      this.loadExercise(state.exId, true);
    }

    if (state.bpm) {
      this.setBpm(state.bpm);
    }

    this.switchView(state.view || "home");
    this.isRestoring = false;
  }

  setBookCategory(cat) {
    this.currentBookCategory = cat;
    if (this.choiceLessonBook && this.choiceWorkshopBook) {
      if (cat === "bonusWorkshop") {
        this.choiceWorkshopBook.classList.add("selected");
        this.choiceLessonBook.classList.remove("selected");
        if (this.choiceFreeMode) this.choiceFreeMode.classList.remove("selected");
      } else if (cat === "freeMetronome") {
        if (this.choiceFreeMode) this.choiceFreeMode.classList.add("selected");
        this.choiceLessonBook.classList.remove("selected");
        this.choiceWorkshopBook.classList.remove("selected");
      } else {
        this.choiceLessonBook.classList.add("selected");
        this.choiceWorkshopBook.classList.remove("selected");
        if (this.choiceFreeMode) this.choiceFreeMode.classList.remove("selected");
      }
    }
    this.renderCourseBookCatalog(this.catalogSearchInput ? this.catalogSearchInput.value : "");
  }

  getNoteDuration(beatData, curMeasure) {
    if (beatData.duration) return beatData.duration;
    const sym = (beatData.symbol || "1/4").toLowerCase();
    if (sym === "1/1") return 4.0;
    if (sym === "3/4") return 3.0;
    if (sym === "1/2") return 2.0;
    if (sym === "1/4") return 1.0;
    if (sym === "1/8") return 0.5;
    return 1.0;
  }

  attachEvents() {
    // Navigation Back Buttons
    if (this.btnMasterBack) {
      this.btnMasterBack.addEventListener("click", () => this.switchView("home"));
    }
    if (this.btnBookBack) {
      this.btnBookBack.addEventListener("click", () => this.switchView("home"));
    }

    // Top Tabs
    if (this.tabBtnHome) {
      this.tabBtnHome.addEventListener("click", () => this.switchView("home"));
    }
    if (this.tabBtnBook) {
      this.tabBtnBook.addEventListener("click", () => {
        this.setBookCategory("lessonBook");
        this.switchView("book");
      });
    }
    if (this.tabBtnWorkshop) {
      this.tabBtnWorkshop.addEventListener("click", () => {
        this.setBookCategory("bonusWorkshop");
        this.switchView("book");
      });
    }
    if (this.tabBtnStudio) {
      this.tabBtnStudio.addEventListener("click", () => this.switchView("studio"));
    }

    // Home Action Cards
    if (this.portalCardLesson) {
      this.portalCardLesson.addEventListener("click", () => {
        this.setBookCategory("lessonBook");
        this.switchView("book");
      });
    }
    if (this.portalCardWorkshop) {
      this.portalCardWorkshop.addEventListener("click", () => {
        this.setBookCategory("bonusWorkshop");
        this.switchView("book");
      });
    }
    if (this.portalCardStudio) {
      this.portalCardStudio.addEventListener("click", () => {
        this.switchView("studio");
      });
    }

    // Book Filter Tabs
    if (this.choiceLessonBook) {
      this.choiceLessonBook.addEventListener("click", () => this.setBookCategory("lessonBook"));
    }
    if (this.choiceWorkshopBook) {
      this.choiceWorkshopBook.addEventListener("click", () => this.setBookCategory("bonusWorkshop"));
    }
    if (this.choiceFreeMode) {
      this.choiceFreeMode.addEventListener("click", () => {
        this.loadExercise("free-metronome");
        this.switchView("studio");
      });
    }

    // Catalog Search
    if (this.catalogSearchInput) {
      this.catalogSearchInput.addEventListener("input", (e) => {
        this.renderCourseBookCatalog(e.target.value);
      });
    }

    // Studio Header Navigation
    if (this.btnStudioBack) {
      this.btnStudioBack.addEventListener("click", () => {
        if (this.isPlaying) this.stop();
        this.switchView("book");
      });
    }

    window.addEventListener("pagehide", () => {
      if (this.isPlaying) this.stop();
    });
    window.addEventListener("beforeunload", () => {
      if (this.isPlaying) this.stop();
    });

    if (this.studioSessionSelect) {
      this.studioSessionSelect.addEventListener("change", (e) => {
        if (this.isPlaying) this.stop();
        this.loadExercise(e.target.value);
      });
    }

    if (this.btnPrevExercise) {
      this.btnPrevExercise.addEventListener("click", () => {
        let prevIdx = this.currentExerciseIndex - 1;
        if (prevIdx < 0) prevIdx = this.allExercises.length - 1;
        this.loadExercise(this.allExercises[prevIdx].id);
      });
    }

    if (this.btnNextExercise) {
      this.btnNextExercise.addEventListener("click", () => {
        let nextIdx = this.currentExerciseIndex + 1;
        if (nextIdx >= this.allExercises.length) nextIdx = 0;
        this.loadExercise(this.allExercises[nextIdx].id);
      });
    }

    // BPM Steppers
    if (this.btnBpmMinus) {
      this.btnBpmMinus.addEventListener("click", () => this.setBpm(this.bpm - 1));
    }
    if (this.btnBpmPlus) {
      this.btnBpmPlus.addEventListener("click", () => this.setBpm(this.bpm + 1));
    }

    // Sound Pickers
    if (this.selectSound) {
      this.selectSound.addEventListener("change", (e) => {
        this.audio.setSoundType(e.target.value);
        this.saveState();
      });
    }
    if (this.selectRestSound) {
      this.selectRestSound.addEventListener("change", (e) => {
        this.audio.setRestSoundType(e.target.value);
        this.saveState();
      });
    }
    if (this.toggleCountIn) {
      const lblText = document.getElementById("label-count-in-text");
      this.toggleCountIn.addEventListener("change", (e) => {
        this.countInEnabled = e.target.checked;
        if (lblText) lblText.textContent = this.countInEnabled ? "On" : "Off";
        this.saveState();
      });
    }

    // Keyboard shortcuts
    window.addEventListener("keydown", (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "SELECT") return;
      if (e.code === "Space") {
        e.preventDefault();
        this.togglePlay();
      } else if (e.code === "ArrowUp") {
        e.preventDefault();
        this.setBpm(this.bpm + (e.shiftKey ? 5 : 1));
      } else if (e.code === "ArrowDown") {
        e.preventDefault();
        this.setBpm(this.bpm - (e.shiftKey ? 5 : 1));
      } else if (e.code === "ArrowRight" && this.currentView === "studio") {
        e.preventDefault();
        if (this.btnNextExercise) this.btnNextExercise.click();
      } else if (e.code === "ArrowLeft" && this.currentView === "studio") {
        e.preventDefault();
        if (this.btnPrevExercise) this.btnPrevExercise.click();
      } else if (e.code === "Escape") {
        if (this.currentView === "studio") this.switchView("book");
        else if (this.currentView === "book") this.switchView("home");
      }
    });

    window.addEventListener("hashchange", () => this.restoreState());
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("DOMContentLoaded", () => {
    window.guitarApp = new GuitarMasterApp();
  });
}
