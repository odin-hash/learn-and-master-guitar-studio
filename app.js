import { GUITAR_COURSES } from "./exercises.js";
import { mergeVerifiedCurriculumIntoCourses } from "./src/data/curriculumExercises.js";
import { MetronomeAudioEngine } from "./audio.js";
import { GuitarSpeedDial } from "./dial.js";
import { FretboardVisualizer } from "./fretboard.js";
import { FoundationsPrimer } from "./src/components/FoundationsPrimer.js";
import { ScoreRenderer } from "./src/components/ScoreRenderer.js";
import { PdfAiExtractor } from "./src/components/PdfAiExtractor.js";

export class GuitarMasterApp {
  constructor() {
    if (typeof mergeVerifiedCurriculumIntoCourses === "function") {
      mergeVerifiedCurriculumIntoCourses(GUITAR_COURSES);
    }
    this.pdfAiExtractor = new PdfAiExtractor();
    this.audio = new MetronomeAudioEngine();
    this.currentBookCategory = "lessonBook"; // "lessonBook" | "bonusWorkshop"
    // Apply any persisted AI-extracted pages synchronously before flattening catalog
    this.applyAllSavedAiExtractions(this.pdfAiExtractor.loadExtractedStoreSync(), true);
    this.allExercises = this.buildFlatExerciseList();
    this.currentExercise = this.findExerciseById("lb-s2-str1-ex1") || this.allExercises[0];
    this.currentExerciseIndex = this.allExercises.findIndex(e => e.id === this.currentExercise.id);
    this.bpm = 60;
    this.isPlaying = false;
    this.isMetronomeOnlyActive = false;
    this._needsTimeAnchor = false;
    this.appMode = "primer"; // "primer" | "studio"
    this.foundationsPrimer = null;
    this.currentView = "home"; // "home" | "book" | "studio"
    this.isRestoring = false;
    this.wakeLock = null;

    // Timing state
    this.lookahead = 25.0; // ms
    this.scheduleAheadTime = 0.20; // seconds (200ms lookahead for rock-solid mobile scheduling)
    this.currentMeasureIndex = 0;
    this.currentBeatInMeasure = 0;
    this.currentSubBeatIndex = 0;
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
    this.noteNameMode = "above"; // "off" | "above" | "inside"
    this.tabVisibilityMode = "both"; // "both" | "staff-only" | "blur"
    this.showRhythmGuide = true;
    this.showCoachBanner = true;
    this.showNoteNames = true;
    this.showTabNumbers = true;
    this.activeTopicRenderers = new Map();
    this.currentTopicId = null;
    this.currentTopicExercises = [];
    this.chordMode = "full"; // "full" | "easy4" | "easy3"
    this.selectedSpiderString = 1;
    this.freeMetTimeSignature = "4/4";
    this.freeMetSubdivision = 1; // 1 = Quarter, 2 = Eighth, 3 = Triplets
    this.freeMetBeatModes = ["accent", "normal", "normal", "normal"];
    this._tapTimes = [];
    this._tapFlashTimer = null;

    // Migrate / auto-reset incompatible v1 localStorage before reading progress or state
    this.ensureStorageVersion();

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
    this.hydrateIndexedDbExtractions();
  }

  ensureStorageVersion() {
    const TARGET_VERSION = "2.0.0";
    try {
      const storedVersion = localStorage.getItem("lmgs_app_version");
      if (storedVersion !== TARGET_VERSION) {
        const validIds = new Set((this.allExercises || []).map(e => e.id));

        try {
          const rawCompleted = localStorage.getItem("guitar_completed_exercises");
          if (rawCompleted) {
            const parsed = JSON.parse(rawCompleted);
            if (Array.isArray(parsed)) {
              const cleaned = parsed.filter(id => typeof id === "string" && validIds.has(id));
              localStorage.setItem("guitar_completed_exercises", JSON.stringify(cleaned));
            } else {
              localStorage.removeItem("guitar_completed_exercises");
            }
          }
        } catch (e) {
          localStorage.removeItem("guitar_completed_exercises");
        }

        try {
          const rawGoals = localStorage.getItem("guitar_checked_goals");
          if (rawGoals) {
            const parsed = JSON.parse(rawGoals);
            if (!Array.isArray(parsed) || parsed.some(g => typeof g !== "string")) {
              localStorage.removeItem("guitar_checked_goals");
            }
          }
        } catch (e) {
          localStorage.removeItem("guitar_checked_goals");
        }

        // Remove incompatible legacy v1 app state object & obsolete keys
        const preservedKeys = new Set([
          "lmgs_app_version",
          "guitar_completed_exercises",
          "guitar_checked_goals",
          "lmgs_gemini_api_key",
          "lmgs_gemini_model_pref",
          "lmgs_ai_extracted_pages_v1"
        ]);
        Object.keys(localStorage).forEach(k => {
          if (!preservedKeys.has(k) && (k.startsWith("guitar_") || k.startsWith("lmgs_"))) {
            localStorage.removeItem(k);
          }
        });
        localStorage.removeItem("guitar_master_app_state");
        localStorage.setItem("lmgs_app_version", TARGET_VERSION);
      }
    } catch (e) {}
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
    (GUITAR_COURSES.lessonBook || []).forEach((session, sIdx) => {
      (session.topics || []).forEach((topic, tIdx) => {
        const topicId = topic.topicId || `lessonBook_s${session.sessionNumber}_t${tIdx}`;
        (topic.exercises || []).forEach((ex, eIdx) => {
          list.push({
            ...ex,
            topicId,
            topicPdfPage: topic.pdfPage || ex.pdfPage || 1,
            exerciseNumberInTopic: ex.exerciseNumberInTopic || (eIdx + 1),
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
    (GUITAR_COURSES.bonusWorkshop || []).forEach((session, sIdx) => {
      (session.topics || []).forEach((topic, tIdx) => {
        const topicId = topic.topicId || `bonusWorkshop_s${session.sessionNumber}_t${tIdx}`;
        (topic.exercises || []).forEach((ex, eIdx) => {
          list.push({
            ...ex,
            topicId,
            topicPdfPage: topic.pdfPage || ex.pdfPage || 1,
            exerciseNumberInTopic: ex.exerciseNumberInTopic || (eIdx + 1),
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
        topicId: "freeMetronome_s0_t0",
        topicPdfPage: 1,
        exerciseNumberInTopic: 1,
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
    const aliasMap = {
      "bw-w3-ties-dots": "bw-w3-tdr-ex1"
    };
    const lookupId = aliasMap[id] || id;
    return this.allExercises.find(e => e.id === lookupId) || this.allExercises.find(e => e.id === id);
  }

  isCompactFretboardViewport() {
    return typeof window !== "undefined" && (window.innerWidth <= 768 || window.innerHeight <= 540);
  }

  initDOM() {
    this.paneMode = "score"; // "score" | "pdf" | "split"
    this.loopMode = "all"; // "all" | "bar" | "once"
    this.loopMeasureIndex = 0;
    this.drawerOpen = window.innerWidth > 1024;
    this._lastCompactViewport = this.isCompactFretboardViewport();
    this.fretboardVisible = !this._lastCompactViewport;
    this.expandedSessions = new Set(["lessonBook_1", "lessonBook_2"]);
    this.pdfBookCategory = "lessonBook";
    this.pdfCurrentPage = 1;
    this.customPdfUrls = {};
    this._pdfDocCache = new Map();
    this._pdfJsPromise = null;
    this._pdfRenderTask = null;

    // Zone 1: Top Bar & App Mode Navigation
    this.workspaceBody = document.getElementById("workspace-body");
    this.appModeTabs = document.getElementById("app-mode-tabs");
    this.primerViewEl = document.getElementById("primer-view");
    this.btnMobileMenu = document.getElementById("btn-mobile-menu");
    this.drawerBackdrop = document.getElementById("drawer-backdrop");
    this.btnToggleDrawer = document.getElementById("btn-toggle-drawer");
    this.navCrumbSession = document.getElementById("nav-crumb-session");
    this.studioExerciseTitle = document.getElementById("studio-exercise-title");
    this.workspaceViewTabs = document.getElementById("workspace-view-tabs");
    this.btnPrevExercise = document.getElementById("btn-prev-exercise");
    this.btnNextExercise = document.getElementById("btn-next-exercise");
    this.btnMarkDone = document.getElementById("btn-mark-done");
    this.btnToggleGuide = document.getElementById("btn-toggle-guide");

    // Zone 2: Left Collapsible Drawer
    this.choiceLessonBook = document.getElementById("choice-lesson-book");
    this.choiceWorkshopBook = document.getElementById("choice-workshop-book");
    this.choiceFreeMode = document.getElementById("choice-free-mode");
    this.sessionsAccordion = document.getElementById("sessions-accordion");
    this.catalogSearchInput = document.getElementById("catalog-search-input");

    // Zone 3: Score & PDF Panes
    this.studioGuidePanel = document.getElementById("studio-guide-panel");
    this.btnCloseGuide = document.getElementById("btn-close-guide");
    this.studioExerciseTopicBadge = document.getElementById("studio-exercise-topic-badge");
    this.studioInstructionText = document.getElementById("studio-instruction-text");
    this.activeSessionChecklist = document.getElementById("active-session-checklist");

    this.noteActiveCard = document.getElementById("note-active-card");
    this.noteGlyphLarge = document.getElementById("note-glyph-large");
    this.noteHeaderBig = document.getElementById("note-header-big");
    this.noteSubInstruction = document.getElementById("note-sub-instruction");
    this.noteRightGuidance = document.getElementById("note-right-guidance");

    this.btnToggleFretboard = document.getElementById("btn-toggle-fretboard");
    this.fretboardWrapper = document.getElementById("fretboard-wrapper");
    this.studioScoreViewport = document.getElementById("studio-score-viewport");
    this.freeMetronomeStage = document.getElementById("free-metronome-stage");
    this.freeMetBpmVal = document.getElementById("free-met-bpm-val");
    this.freeMetBpmMinus5 = document.getElementById("free-met-bpm-minus5");
    this.freeMetBpmMinus = document.getElementById("free-met-bpm-minus");
    this.freeMetBpmPlus = document.getElementById("free-met-bpm-plus");
    this.freeMetBpmPlus5 = document.getElementById("free-met-bpm-plus5");
    this.freeMetBpmSlider = document.getElementById("free-met-bpm-slider");
    this.freeMetTapBtn = document.getElementById("free-met-tap-btn");
    this.freeMetTimesigGroup = document.getElementById("free-met-timesig-group");
    this.freeMetSubdivGroup = document.getElementById("free-met-subdiv-group");
    this.freeMetDotsRow = document.getElementById("free-met-dots-row");
    this.freeMetStatusCue = document.getElementById("free-met-status-cue");

    // Printed Book Page & Tutor Scaffolding Elements
    this.bookPageSession = document.getElementById("book-page-session");
    this.bookVerificationBadge = document.getElementById("book-verification-badge");
    this.bookPageTitle = document.getElementById("book-page-title");
    this.bookTopicCountPill = document.getElementById("book-topic-count-pill");
    this.bookPageDesc = document.getElementById("book-page-desc");
    this.bookTempoBpm = document.getElementById("book-tempo-bpm");
    this.bookTempoGlyph = document.getElementById("book-tempo-glyph");
    this.topicExercisesStack = document.getElementById("topic-exercises-stack");
    this.tutorNoteModeGroup = document.getElementById("tutor-note-mode-group");
    this.tutorTabModeGroup = document.getElementById("tutor-tab-mode-group");
    this.btnTutorRhythmGuide = document.getElementById("btn-tutor-rhythm-guide");
    this.tutorRhythmState = document.getElementById("tutor-rhythm-state");
    this.btnTutorCoachBanner = document.getElementById("btn-tutor-coach-banner");
    this.tutorCoachState = document.getElementById("tutor-coach-state");
    this._glyphCache = new Map();
    this._pdfLoadSeq = 0;
    this.renderBookTempoGlyph();

    // PDF Pane Elements
    this.btnPdfLesson = document.getElementById("btn-pdf-lesson");
    this.btnPdfWorkshop = document.getElementById("btn-pdf-workshop");
    this.pdfPageInput = document.getElementById("pdf-page-input");
    this.btnPdfSync = document.getElementById("btn-pdf-sync");
    this.pdfFileInput = document.getElementById("pdf-file-input");
    this.pdfFileInputFallback = document.getElementById("pdf-file-input-fallback");
    this.pdfOpenNewTab = document.getElementById("pdf-open-newtab");
    this.pdfViewerFrame = document.getElementById("pdf-viewer-frame");
    this.pdfMobileCanvasWrap = document.getElementById("pdf-mobile-canvas-wrap");
    this.pdfCanvasScroller = document.getElementById("pdf-canvas-scroller");
    this.pdfMobileCanvas = document.getElementById("pdf-mobile-canvas");
    this.pdfMobilePageStatus = document.getElementById("pdf-mobile-page-status");
    this.btnPdfPrevPage = document.getElementById("btn-pdf-prev-page");
    this.btnPdfNextPage = document.getElementById("btn-pdf-next-page");
    this.pdfMobileLoading = document.getElementById("pdf-mobile-loading");
    this.pdfFallbackCard = document.getElementById("pdf-fallback-card");
    this.pdfMissingFilename = document.getElementById("pdf-missing-filename");

    // PDF AI Extractor Toolbar & Drawers
    this.btnGeminiApiKey = document.getElementById("btn-gemini-api-key");
    this.aiKeyDot = document.getElementById("ai-key-dot");
    this.geminiKeyBar = document.getElementById("gemini-key-bar");
    this.geminiApiKeyInput = document.getElementById("gemini-api-key-input");
    this.geminiModelSelect = document.getElementById("gemini-model-select");
    this.btnSaveGeminiKey = document.getElementById("btn-save-gemini-key");
    this.btnClearGeminiKey = document.getElementById("btn-clear-gemini-key");
    this.btnCloseGeminiKey = document.getElementById("btn-close-gemini-key");
    this.btnExtractPdfPage = document.getElementById("btn-extract-pdf-page");
    this.btnBatchExtractToggle = document.getElementById("btn-batch-extract-toggle");
    this.btnExportCurriculumJson = document.getElementById("btn-export-curriculum-json");
    this.pdfBatchBar = document.getElementById("pdf-batch-bar");
    this.batchFromPageInput = document.getElementById("batch-from-page");
    this.batchToPageInput = document.getElementById("batch-to-page");
    this.btnStartBatchExtract = document.getElementById("btn-start-batch-extract");
    this.btnCancelBatchExtract = document.getElementById("btn-cancel-batch-extract");
    this.btnCloseBatchExtract = document.getElementById("btn-close-batch-extract");
    this.aiExtractProgressWrap = document.getElementById("ai-extract-progress-wrap");
    this.aiExtractProgressFill = document.getElementById("ai-extract-progress-fill");
    this.aiExtractProgressPct = document.getElementById("ai-extract-progress-pct");
    this.aiExtractStatusBar = document.getElementById("ai-extract-status-bar");
    this.aiExtractThumb = document.getElementById("ai-extract-thumb");
    this.aiExtractStatusText = document.getElementById("ai-extract-status-text");
    this.btnClearAiPages = document.getElementById("btn-clear-ai-pages");
    this.btnDismissAiStatus = document.getElementById("btn-dismiss-ai-status");
    this.syncGeminiKeyUI();

    // Zone 4: Fixed Bottom Transport Dock
    this.transportDock = document.getElementById("transport-dock");
    this.btnDockMobileSettings = document.getElementById("btn-dock-mobile-settings");
    this.btnPlayToggle = document.getElementById("btn-play-toggle");
    this.playBtnLabel = document.getElementById("play-btn-label");
    this.btnMetronomeToggle = document.getElementById("btn-metronome-toggle");
    this.metronomeBtnLabel = document.getElementById("metronome-btn-label");
    this.beatDotsSequence = document.getElementById("beat-dots-sequence");
    this.btnLoopMode = document.getElementById("btn-loop-mode");
    this.loopModeLabel = document.getElementById("loop-mode-label");
    this.bpmNumberInput = document.getElementById("bpm-number-input");
    this.btnBpmMinus = document.getElementById("btn-bpm-minus");
    this.btnBpmPlus = document.getElementById("btn-bpm-plus");
    this.timePillBadge = document.getElementById("time-pill-badge");

    this.selectSound = document.getElementById("select-sound");
    this.selectRestSound = document.getElementById("select-rest-sound");
    this.toggleGuitarTone = document.getElementById("toggle-guitar-tone");
    this.toggleCountIn = document.getElementById("toggle-count-in");

    if (this.workspaceBody) {
      this.workspaceBody.classList.toggle("drawer-collapsed", !this.drawerOpen);
    }
    this.syncFretboardVisibilityUI();
  }

  initDial() {
    const canvas = document.getElementById("speed-dial-canvas");
    if (canvas) {
      this.dial = new GuitarSpeedDial(
        canvas,
        (newBpm) => this.setBpm(newBpm),
        () => this.togglePlay()
      );
      this.dial.setBpm(this.bpm);
      return;
    }

    // Minimalist Transport Dock Adapter (replaces bulky rotary canvas while preserving all playback calls)
    const app = this;
    this.dial = {
      setPlayState(playing) {
        if (!app.btnPlayToggle) return;
        app.btnPlayToggle.classList.toggle("is-playing", !!playing);
        const playSvg = app.btnPlayToggle.querySelector(".icon-play");
        const stopSvg = app.btnPlayToggle.querySelector(".icon-stop");
        if (playSvg) playSvg.style.display = playing ? "none" : "block";
        if (stopSvg) stopSvg.style.display = playing ? "block" : "none";
        if (app.playBtnLabel) app.playBtnLabel.textContent = playing ? "Stop" : "Play";
      },
      setRestState(isRest) {
        if (app.btnPlayToggle && app.isPlaying) {
          app.btnPlayToggle.style.borderColor = isRest ? "var(--color-rest)" : "var(--accent)";
          app.btnPlayToggle.style.backgroundColor = isRest ? "var(--color-rest)" : "var(--accent)";
        } else if (app.btnPlayToggle) {
          app.btnPlayToggle.style.borderColor = "";
          app.btnPlayToggle.style.backgroundColor = "";
        }
      },
      setBpm(val) {
        if (app.bpmNumberInput && document.activeElement !== app.bpmNumberInput) {
          app.bpmNumberInput.value = val;
        }
      },
      resize() {}
    };
    this.dial.setBpm(this.bpm);
  }

  initVisualizers() {
    this.fretboard = new FretboardVisualizer(document.getElementById("fretboard-container"));
    if (this.primerViewEl && typeof FoundationsPrimer !== "undefined") {
      this.foundationsPrimer = new FoundationsPrimer(this.primerViewEl, this.audio, {
        onNavigateToExercise: (exId) => {
          this.setAppMode("studio");
          if (exId) this.loadExercise(exId);
        },
        onEnterStudio: () => this.setAppMode("studio")
      });
    }
    const app = this;
    this.tabStaff = {
      loadExercise(ex) {
        const entry = ex && app.activeTopicRenderers.get(ex.id);
        if (entry && entry.renderer) {
          entry.renderer.loadExercise(ex, {
            noteNameMode: app.noteNameMode,
            tabVisibilityMode: app.tabVisibilityMode,
            showRhythmGuide: app.showRhythmGuide,
            showCoachBanner: app.showCoachBanner
          });
        }
      },
      setSightReadingOptions(opts) {
        app.activeTopicRenderers.forEach(entry => {
          if (entry.renderer) entry.renderer.setTutorOptions(opts);
        });
      },
      setTutorOptions(opts) {
        app.activeTopicRenderers.forEach(entry => {
          if (entry.renderer) entry.renderer.setTutorOptions(opts);
        });
      },
      setLoopMeasure(mIdxOrNull) {
        const activeId = app.currentExercise && app.currentExercise.id;
        app.activeTopicRenderers.forEach((entry, exId) => {
          if (entry.renderer) {
            entry.renderer.setLoopMeasure(exId === activeId ? mIdxOrNull : null);
          }
        });
      },
      highlightBeat(mIdx, bIdx, isRest, coachMeta = null) {
        const activeId = app.currentExercise && app.currentExercise.id;
        app.activeTopicRenderers.forEach((entry, exId) => {
          if (!entry.renderer) return;
          if (exId === activeId) {
            entry.renderer.highlightBeat(mIdx, bIdx, isRest, coachMeta);
          } else {
            entry.renderer.reset();
          }
        });
      },
      reset() {
        app.activeTopicRenderers.forEach(entry => {
          if (entry.renderer) entry.renderer.reset();
        });
      },
      hasStandardStaff(ex) {
        const entry = ex && app.activeTopicRenderers.get(ex.id);
        if (entry && entry.renderer) return entry.renderer.hasStandardStaff(ex);
        return true;
      }
    };
  }

  ordinal(n) {
    const num = parseInt(n, 10);
    if (!Number.isFinite(num)) return String(n || "");
    const mod100 = num % 100;
    if (mod100 >= 11 && mod100 <= 13) return `${num}th`;
    const last = num % 10;
    if (last === 1) return `${num}st`;
    if (last === 2) return `${num}nd`;
    if (last === 3) return `${num}rd`;
    return `${num}th`;
  }

  buildLiveCoachMeta(ev) {
    if (!ev || !ev.beatData) return null;
    const { mIdx, primaryBeat, isDownbeat, beatData, chordName, isRest } = ev;
    const beatLabel = isDownbeat ? String(primaryBeat + 1) : `${primaryBeat + 1} &`;
    const dur = beatData.duration || 1;
    const isTieCont = Boolean(ev.isTieCont || beatData.isTieContinuation || beatData.tieFromPrev);
    const isSustain = Boolean(ev.isSustain || beatData.isSustain || beatData.type === "sustain");
    const shortNote = (beatData.note || "Note").replace(/^High\s+/i, "").replace(/^Low\s+/i, "").trim();

    if (isRest) {
      if (dur >= 4) {
        return { variant: "rest", text: `Silence All Strings (Whole Rest — Bar ${mIdx + 1})` };
      }
      if (dur >= 2) {
        return { variant: "rest", text: `Mute Strings Cleanly (Half Rest on Beat ${beatLabel})` };
      }
      if (dur <= 0.5) {
        return { variant: "rest", text: `Quick Palm Mute (Eighth Rest on ${beatLabel})` };
      }
      return { variant: "rest", text: `Mute String with Palm (Quarter Rest on Beat ${beatLabel})` };
    }

    if (isTieCont || (isSustain && beatData.tieFromPrev)) {
      return { variant: "hold", text: `Keep Holding (Tied across Beat ${beatLabel})` };
    }

    if (isSustain) {
      if (beatData.isDotted) {
        return { variant: "hold", text: `Keep Holding (Dotted +1/2 beat across Beat ${beatLabel})` };
      }
      if (chordName && typeof beatData.string !== "number") {
        return { variant: "hold", text: `Keep Hand Moving (Hold ${chordName} across Beat ${beatLabel})` };
      }
      return { variant: "hold", text: `Let ${shortNote} Ring (Hold across Beat ${beatLabel})` };
    }

    if (typeof beatData.string === "number") {
      const strOrd = this.ordinal(beatData.string);
      const fretNum = beatData.fret;
      if (fretNum === 0 || fretNum === null || fretNum === undefined) {
        return { variant: "play", text: `Pluck ${strOrd} String (${shortNote}, Open String)` };
      }
      const fretOrd = this.ordinal(fretNum);
      return { variant: "play", text: `Pluck ${strOrd} String (${shortNote}, ${fretOrd} Fret)` };
    }

    const chordLbl = chordName || shortNote || "Chord";
    const pickTxt = beatData.pick && beatData.pick !== "-" ? `${beatData.pick} Strum` : "Strum";
    const spanTxt = beatData.string === "all" ? "All 6 Strings" : (beatData.string ? `Strings ${beatData.string}` : "Chord");
    return { variant: "play", text: `${pickTxt} ${chordLbl} (${spanTxt})` };
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
    this.loopMeasureIndex = mIdx;
    this.currentBeatInMeasure = primaryBeat;
    this.currentBeatIndex = safeBeatIdx;
    this.currentMeasureBeatPos = item.startOffset;
    this.queue = [];
    this.updateLoopHighlightUI();

    if (this.isPlaying && this.audio.audioCtx) {
      this.nextBeatTime = this.audio.audioCtx.currentTime + 0.05;
    }

    const beatData = item.beatData;
    const isRest = beatData.type === "rest";
    const isTieCont = Boolean(beatData.isTieContinuation || beatData.tieFromPrev);
    const isSustain = Boolean(beatData.isSustain || beatData.type === "sustain");

    this.updateBeatVisuals({
      mIdx: mIdx,
      bIdx: safeBeatIdx,
      primaryBeat: primaryBeat,
      isDownbeat: isDownbeat,
      beatPos: item.startOffset,
      beatData: beatData,
      chordName: measure.chordName,
      isRest: isRest,
      isTieCont,
      isSustain
    });
  }

  setTutorScaffolding(opts = {}) {
    if (opts.noteNameMode && ["off", "above", "inside"].includes(opts.noteNameMode)) {
      this.noteNameMode = opts.noteNameMode;
      this.showNoteNames = opts.noteNameMode !== "off";
    }
    if (opts.tabVisibilityMode && ["both", "staff-only", "blur"].includes(opts.tabVisibilityMode)) {
      this.tabVisibilityMode = opts.tabVisibilityMode;
      this.showTabNumbers = opts.tabVisibilityMode !== "staff-only";
    }
    if (opts.showRhythmGuide !== undefined) {
      this.showRhythmGuide = Boolean(opts.showRhythmGuide);
    }
    if (opts.showCoachBanner !== undefined) {
      this.showCoachBanner = Boolean(opts.showCoachBanner);
    }

    this.syncTutorToolbarUI();
    this.tabStaff.setTutorOptions({
      noteNameMode: this.noteNameMode,
      tabVisibilityMode: this.tabVisibilityMode,
      showRhythmGuide: this.showRhythmGuide,
      showCoachBanner: this.showCoachBanner
    });
    this.saveState();
  }

  syncTutorToolbarUI() {
    if (this.tutorNoteModeGroup) {
      this.tutorNoteModeGroup.querySelectorAll("[data-note-mode]").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.noteMode === this.noteNameMode);
      });
    }
    if (this.tutorTabModeGroup) {
      this.tutorTabModeGroup.querySelectorAll("[data-tab-mode]").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.tabMode === this.tabVisibilityMode);
      });
    }
    if (this.btnTutorRhythmGuide) {
      this.btnTutorRhythmGuide.classList.toggle("active", this.showRhythmGuide);
      this.btnTutorRhythmGuide.setAttribute("aria-pressed", this.showRhythmGuide ? "true" : "false");
    }
    if (this.tutorRhythmState) {
      this.tutorRhythmState.textContent = this.showRhythmGuide ? "ON" : "OFF";
    }
    if (this.btnTutorCoachBanner) {
      this.btnTutorCoachBanner.classList.toggle("active", this.showCoachBanner);
      this.btnTutorCoachBanner.setAttribute("aria-pressed", this.showCoachBanner ? "true" : "false");
    }
    if (this.tutorCoachState) {
      this.tutorCoachState.textContent = this.showCoachBanner ? "ON" : "OFF";
    }
  }

  injectStudioTrainerToolbar() {
    // 1. Guitar Pitch Synth toggle in Bottom Transport Dock
    if (this.toggleGuitarTone) {
      this.toggleGuitarTone.addEventListener("change", (e) => {
        this.audio.setGuitarTone(e.target.checked);
        this.saveState();
      });
    }

    // 2. Slow / Med / Goal Tempo Presets
    const presetBar = document.getElementById("jam-speed-presets");
    if (presetBar) {
      presetBar.querySelectorAll(".speed-preset-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const targetBpm = parseInt(btn.dataset.bpm, 10);
          if (targetBpm) this.setBpm(targetBpm);
        });
      });
    }

    // 3. Tutor Scaffolding Header Bar (Note Names | Tab Visibility | Rhythm Guide | Live Coach)
    if (this.tutorNoteModeGroup) {
      this.tutorNoteModeGroup.querySelectorAll("[data-note-mode]").forEach(btn => {
        btn.addEventListener("click", () => {
          this.setTutorScaffolding({ noteNameMode: btn.dataset.noteMode });
        });
      });
    }
    if (this.tutorTabModeGroup) {
      this.tutorTabModeGroup.querySelectorAll("[data-tab-mode]").forEach(btn => {
        btn.addEventListener("click", () => {
          this.setTutorScaffolding({ tabVisibilityMode: btn.dataset.tabMode });
        });
      });
    }
    if (this.btnTutorRhythmGuide) {
      this.btnTutorRhythmGuide.addEventListener("click", () => {
        this.setTutorScaffolding({ showRhythmGuide: !this.showRhythmGuide });
      });
    }
    if (this.btnTutorCoachBanner) {
      this.btnTutorCoachBanner.addEventListener("click", () => {
        this.setTutorScaffolding({ showCoachBanner: !this.showCoachBanner });
      });
    }
    this.syncTutorToolbarUI();

    // 4. Chord Voicing, String Drill, Mark Done & Fretboard Visibility
    const trainerBar = document.getElementById("studio-trainer-bar");
    if (trainerBar) {
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

      trainerBar.querySelectorAll("[data-str]").forEach(btn => {
        btn.addEventListener("click", () => {
          const targetStr = parseInt(btn.dataset.str, 10);
          trainerBar.querySelectorAll("[data-str]").forEach(b => b.classList.toggle("active", b === btn));
          this.applyStringOverride(targetStr);
        });
      });

      if (this.btnToggleFretboard) {
        this.btnToggleFretboard.addEventListener("click", () => {
          this.fretboardVisible = !this.fretboardVisible;
          this.syncFretboardVisibilityUI();
        });
      }
    }

    if (this.btnMarkDone) {
      this.btnMarkDone.addEventListener("click", () => {
        if (this.currentExercise) {
          this.toggleExerciseCompleted(this.currentExercise.id);
        }
      });
    }
  }

  syncFretboardVisibilityUI() {
    if (this.btnToggleFretboard) {
      this.btnToggleFretboard.classList.toggle("active", this.fretboardVisible);
      this.btnToggleFretboard.setAttribute("aria-expanded", this.fretboardVisible ? "true" : "false");
      if (this.isCompactFretboardViewport()) {
        this.btnToggleFretboard.textContent = this.fretboardVisible ? "Hide Fretboard \u25B4" : "Show Fretboard \u25BE";
      } else {
        this.btnToggleFretboard.textContent = "Fretboard";
      }
    }
    if (this.fretboardWrapper) {
      this.fretboardWrapper.classList.toggle("is-hidden", !this.fretboardVisible);
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
    if (Array.isArray(this.currentExercise.measures)) {
      this.currentExercise.measures.forEach(m => {
        (m.events || []).forEach(ev => {
          if (typeof ev.string === "number" && ev.fret !== null && ev.fret !== undefined) {
            ev.string = targetStr;
            ev.positions = [{ str: targetStr, fret: ev.fret }];
            if (noteMap[targetStr] && ev.fret < noteMap[targetStr].length) {
              ev.note = noteMap[targetStr][ev.fret];
            }
          }
        });
      });
    }
    this.tabStaff.loadExercise(this.currentExercise);
    const firstBeat = this.currentExercise.tabData[0].beats[0];
    this.updateCard(firstBeat, false, 1, this.currentExercise.tabData[0].chordName);
    if (this.currentExercise.id !== "free-metronome" && !this.currentExercise.isMetronomeOnly) {
      this.fretboard.update(firstBeat, false, this.currentExercise.tabData[0].chordName);
    }
  }

  updateDoneButtonUI() {
    const btnDone = this.btnMarkDone || document.getElementById("btn-mark-done");
    if (!btnDone || !this.currentExercise) return;
    const isDone = this.completedExercises.has(this.currentExercise.id);
    btnDone.classList.toggle("is-completed", isDone);
    const lbl = btnDone.querySelector(".done-label");
    if (lbl) lbl.textContent = isDone ? "Completed" : "Mark Done";
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
      btnSlow.textContent = `Slow ${slowBpm}`;
      btnMed.dataset.bpm = medBpm;
      btnMed.textContent = `Med ${medBpm}`;
      btnFast.dataset.bpm = fastBpm;
      btnFast.textContent = `Goal ${fastBpm}`;
      [btnSlow, btnMed, btnFast].forEach(b => {
        b.classList.toggle("active", parseInt(b.dataset.bpm, 10) === this.bpm);
      });
    }
  }

  setDrawerOpen(open) {
    this.drawerOpen = !!open;
    if (this.workspaceBody) {
      this.workspaceBody.classList.toggle("drawer-collapsed", !this.drawerOpen);
    }
    if (this.btnToggleDrawer) {
      this.btnToggleDrawer.classList.toggle("active", this.drawerOpen);
    }
    if (this.btnMobileMenu) {
      this.btnMobileMenu.classList.toggle("active", this.drawerOpen);
      this.btnMobileMenu.setAttribute("aria-expanded", this.drawerOpen ? "true" : "false");
    }
    if (this.drawerOpen && this.transportDock) {
      this.transportDock.classList.remove("mobile-settings-open");
      if (this.btnDockMobileSettings) {
        this.btnDockMobileSettings.setAttribute("aria-expanded", "false");
      }
    }
    this.saveState();
  }

  setAppMode(mode) {
    if (!["primer", "studio"].includes(mode)) mode = "primer";
    this.appMode = mode;

    if (mode === "primer" && this.isPlaying) {
      this.stop();
    }
    if (mode === "studio" && this.foundationsPrimer) {
      this.foundationsPrimer.closeSandbox();
    }

    if (typeof document !== "undefined" && document.body) {
      document.body.dataset.appMode = mode;
    }

    if (this.appModeTabs) {
      this.appModeTabs.querySelectorAll(".seg-btn").forEach(btn => {
        const isActive = btn.dataset.appMode === mode;
        btn.classList.toggle("active", isActive);
        btn.setAttribute("aria-selected", isActive ? "true" : "false");
      });
    }

    if (mode === "primer" && this.foundationsPrimer) {
      requestAnimationFrame(() => {
        this.foundationsPrimer.refreshSymbolsIfNeeded();
      });
    } else if (mode === "studio") {
      requestAnimationFrame(() => {
        this.activeTopicRenderers.forEach(entry => {
          if (entry.renderer) entry.renderer.render();
        });
      });
    }

    this.saveState();
  }

  setPaneMode(mode) {
    if (!["score", "pdf", "split"].includes(mode)) mode = "score";
    this.paneMode = mode;
    const isFreeMet = Boolean(
      this.currentExercise &&
      (this.currentExercise.bookCategory === "freeMetronome" || this.currentExercise.id === "free-metronome" || this.currentExercise.isMetronomeOnly)
    );
    if (this.workspaceBody) {
      this.workspaceBody.dataset.paneMode = isFreeMet ? "score" : mode;
    }
    if (this.workspaceViewTabs) {
      this.workspaceViewTabs.querySelectorAll(".seg-btn").forEach(btn => {
        const isActive = btn.dataset.pane === mode;
        btn.classList.toggle("active", isActive);
        btn.setAttribute("aria-selected", isActive ? "true" : "false");
      });
    }
    if (!isFreeMet && (mode === "pdf" || mode === "split")) {
      this.loadPdfFrame();
    }
    this.saveState();
  }

  cycleLoopMode() {
    const order = ["all", "bar", "once"];
    const nextIdx = (order.indexOf(this.loopMode) + 1) % order.length;
    this.loopMode = order[nextIdx];
    this.updateLoopModeUI();
    this.saveState();
  }

  updateLoopModeUI() {
    if (!this.btnLoopMode || !this.loopModeLabel) return;
    this.btnLoopMode.classList.toggle("active", this.loopMode !== "once");
    this.btnLoopMode.classList.toggle("loop-bar", this.loopMode === "bar");
    if (this.loopMode === "bar") {
      this.loopModeLabel.textContent = `Loop Bar ${this.loopMeasureIndex + 1}`;
    } else if (this.loopMode === "once") {
      this.loopModeLabel.textContent = "Play Once";
    } else {
      this.loopModeLabel.textContent = "Loop All";
    }
    this.updateLoopHighlightUI();
  }

  updateLoopHighlightUI() {
    document.querySelectorAll(".score-measure-panel").forEach(el => el.classList.remove("is-looped-measure"));
    if (this.loopMode === "bar") {
      const mPanel = document.getElementById(`score-measure-${this.loopMeasureIndex}`);
      if (mPanel) mPanel.classList.add("is-looped-measure");
      if (this.loopModeLabel) this.loopModeLabel.textContent = `Loop Bar ${this.loopMeasureIndex + 1}`;
      if (this.tabStaff && this.tabStaff.setLoopMeasure) {
        this.tabStaff.setLoopMeasure(this.loopMeasureIndex);
      }
    } else if (this.tabStaff && this.tabStaff.setLoopMeasure) {
      this.tabStaff.setLoopMeasure(null);
    }
  }

  extractPageNumberFromExercise(ex) {
    if (!ex) return 1;
    if (typeof ex.pdfPage === "number" && Number.isFinite(ex.pdfPage) && ex.pdfPage >= 1) {
      return Math.floor(ex.pdfPage);
    }
    const sources = [ex.topicTitle, ex.sessionSubtitle, ex.description, ex.title];
    for (const s of sources) {
      if (!s) continue;
      const m = String(s).match(/\bp\.\s*(\d+)/i);
      if (m) return parseInt(m[1], 10);
    }
    return 1;
  }

  bookPageToPdfPage(bookPage, bookCategory = "lessonBook") {
    const cleanBookPage = Math.max(1, parseInt(bookPage, 10) || 1);
    // Lesson Book has 3 unnumbered front-matter pages; Bonus Workshop Book has 2 front-matter pages.
    const offset = bookCategory === "bonusWorkshop" ? 2 : 3;
    return cleanBookPage + offset;
  }

  resolveAssetUrl(relativePath, locationLike = null) {
    const clean = String(relativePath || "").replace(/^\.\//, "").replace(/^\/+/, "");
    const explicitBase = (typeof window !== "undefined" && typeof window.__APP_BASE_URL__ === "string" && window.__APP_BASE_URL__)
      ? window.__APP_BASE_URL__
      : null;
    const loc = locationLike || ((typeof window !== "undefined" && window.location) ? window.location : null);

    if (explicitBase && loc) {
      const normalizedBase = explicitBase.endsWith("/") ? explicitBase : `${explicitBase}/`;
      return new URL(clean, new URL(normalizedBase, loc.origin || loc.href)).href;
    }
    if (loc) {
      const protocol = loc.protocol || "";
      const pathname = loc.pathname || "/";
      if (protocol === "http:" || protocol === "https:") {
        // Ensure GitHub Pages repo subpaths (/learn-and-master-guitar-studio without trailing /) preserve the repo base
        const hasFileExt = /\/[^/]+\.[a-z0-9]+$/i.test(pathname);
        const basePath = (pathname.endsWith("/") || hasFileExt) ? pathname : `${pathname}/`;
        return new URL(`./${clean}`, `${loc.origin}${basePath}`).href;
      }
      return new URL(`./${clean}`, loc.href).href;
    }
    return `./${clean}`;
  }

  syncPdfToExercise(ex) {
    if (!ex) return;
    this.pdfBookCategory = (ex.bookCategory === "bonusWorkshop") ? "bonusWorkshop" : "lessonBook";
    const bookPage = this.extractPageNumberFromExercise(ex);
    this.pdfBookPage = bookPage;
    this.pdfCurrentPage = this.bookPageToPdfPage(bookPage, this.pdfBookCategory);
    const pdfHref = `${this.resolveAssetUrl(this.getPdfFilename(this.pdfBookCategory))}#page=${Math.max(1, this.pdfCurrentPage)}&view=FitH&navpanes=0`;
    if (this.pdfOpenNewTab) {
      this.pdfOpenNewTab.href = pdfHref;
    }
    if (this.pdfPageInput) {
      this.pdfPageInput.value = this.pdfCurrentPage;
      this.pdfPageInput.title = `PDF page ${this.pdfCurrentPage} (Book p. ${bookPage})`;
    }
    if (this.btnPdfSync) {
      this.btnPdfSync.title = `Jump to Book p. ${bookPage} (PDF p. ${this.pdfCurrentPage})`;
    }
    if (this.btnPdfLesson) this.btnPdfLesson.classList.toggle("active", this.pdfBookCategory === "lessonBook");
    if (this.btnPdfWorkshop) this.btnPdfWorkshop.classList.toggle("active", this.pdfBookCategory === "bonusWorkshop");
    if (this.paneMode === "pdf" || this.paneMode === "split") {
      this.loadPdfFrame();
    }
  }

  getPdfFilename(cat) {
    return cat === "bonusWorkshop"
      ? "assets/Learn-and-Master-Guitar-Bonus-Workshop-Book.pdf"
      : "assets/Learn-and-Master-Guitar-Lesson-Book.pdf";
  }

  isMobileOrTouchPdfDevice() {
    if (typeof window === "undefined") return false;
    const isNarrow = window.innerWidth <= 1024;
    const hasTouchTablet = (navigator.maxTouchPoints > 0 || "ontouchstart" in window) && window.innerWidth <= 1280;
    const uaMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || "");
    return isNarrow || hasTouchTablet || uaMobile;
  }

  ensurePdfJsLoaded() {
    if (typeof window !== "undefined" && window.pdfjsLib) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      return Promise.resolve(window.pdfjsLib);
    }
    if (this._pdfJsPromise) return this._pdfJsPromise;
    this._pdfJsPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
      script.async = true;
      script.onload = () => {
        if (window.pdfjsLib) {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc =
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
          resolve(window.pdfjsLib);
        } else {
          reject(new Error("pdfjsLib not defined"));
        }
      };
      script.onerror = () => reject(new Error("Failed to load pdf.js CDN"));
      document.head.appendChild(script);
    });
    return this._pdfJsPromise;
  }

  async renderMobilePdfPage(baseSrc, page, seq) {
    if (!this.pdfMobileCanvas) return false;
    if (this.pdfMobileLoading) this.pdfMobileLoading.hidden = false;
    try {
      const pdfjsLib = await this.ensurePdfJsLoaded();
      if (seq !== this._pdfLoadSeq) return true;

      let pdfDoc = this._pdfDocCache.get(baseSrc);
      if (!pdfDoc) {
        pdfDoc = await pdfjsLib.getDocument(baseSrc).promise;
        this._pdfDocCache.set(baseSrc, pdfDoc);
      }
      if (seq !== this._pdfLoadSeq) return true;

      const totalPages = pdfDoc.numPages || 1;
      const safePage = Math.max(1, Math.min(page, totalPages));
      this.pdfCurrentPage = safePage;
      if (this.pdfPageInput) this.pdfPageInput.value = safePage;
      if (this.pdfMobilePageStatus) {
        this.pdfMobilePageStatus.textContent = `Page ${safePage} / ${totalPages}`;
      }
      if (this.btnPdfPrevPage) this.btnPdfPrevPage.disabled = safePage <= 1;
      if (this.btnPdfNextPage) this.btnPdfNextPage.disabled = safePage >= totalPages;

      const pdfPage = await pdfDoc.getPage(safePage);
      if (seq !== this._pdfLoadSeq) return true;

      const baseVp = pdfPage.getViewport({ scale: 1 });
      const scrollerW = (this.pdfCanvasScroller && this.pdfCanvasScroller.clientWidth)
        ? Math.max(260, this.pdfCanvasScroller.clientWidth - 20)
        : Math.max(280, window.innerWidth - 28);
      const cssScale = scrollerW / baseVp.width;
      const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      const vp = pdfPage.getViewport({ scale: cssScale * dpr });

      if (this._pdfRenderTask && typeof this._pdfRenderTask.cancel === "function") {
        try { this._pdfRenderTask.cancel(); } catch (e) {}
      }

      const canvas = this.pdfMobileCanvas;
      const ctx = canvas.getContext("2d");
      canvas.width = Math.floor(vp.width);
      canvas.height = Math.floor(vp.height);
      canvas.style.width = `${Math.floor(vp.width / dpr)}px`;
      canvas.style.height = `${Math.floor(vp.height / dpr)}px`;

      this._pdfRenderTask = pdfPage.render({ canvasContext: ctx, viewport: vp });
      await this._pdfRenderTask.promise;
      if (seq !== this._pdfLoadSeq) return true;

      if (this.pdfCanvasScroller) this.pdfCanvasScroller.scrollTop = 0;
      if (this.pdfMobileLoading) this.pdfMobileLoading.hidden = true;
      return true;
    } catch (err) {
      if (err && err.name === "RenderingCancelledException") return true;
      if (this.pdfMobileLoading) this.pdfMobileLoading.hidden = true;
      return false;
    }
  }

  async loadPdfFrame() {
    if (!this.pdfViewerFrame) return;
    const seq = ++this._pdfLoadSeq;
    const filename = this.getPdfFilename(this.pdfBookCategory);
    const displayFilename = filename.replace(/^assets\//, "");
    const customUrl = this.customPdfUrls[this.pdfBookCategory];
    const baseSrc = customUrl || this.resolveAssetUrl(filename);
    const page = Math.max(1, parseInt(this.pdfCurrentPage, 10) || 1);
    const fullUrl = `${baseSrc}#page=${page}&view=FitH&navpanes=0`;

    if (this.pdfOpenNewTab) this.pdfOpenNewTab.href = fullUrl;
    if (this.pdfMissingFilename) this.pdfMissingFilename.textContent = displayFilename;

    if (!customUrl && (window.location.protocol === "http:" || window.location.protocol === "https:")) {
      try {
        const res = await fetch(baseSrc, { method: "HEAD" });
        if (seq !== this._pdfLoadSeq) return;
        if (!res.ok) {
          if (this.pdfFallbackCard) this.pdfFallbackCard.style.display = "flex";
          if (this.pdfMobileCanvasWrap) this.pdfMobileCanvasWrap.style.display = "none";
          this.pdfViewerFrame.removeAttribute("src");
          this._loadedPdfUrl = null;
          return;
        }
      } catch (e) {}
    }

    if (seq !== this._pdfLoadSeq) return;
    if (this.pdfFallbackCard) this.pdfFallbackCard.style.display = "none";

    // Mobile & Tablet browsers render PDF pages inline via pdf.js canvas instead of native embed "Open" box
    if (this.isMobileOrTouchPdfDevice() && this.pdfMobileCanvasWrap && this.pdfMobileCanvas) {
      this.pdfViewerFrame.style.display = "none";
      this.pdfMobileCanvasWrap.style.display = "flex";
      const ok = await this.renderMobilePdfPage(baseSrc, page, seq);
      if (ok || seq !== this._pdfLoadSeq) return;
      // Graceful fallback to iframe if pdf.js CDN fails offline
      this.pdfMobileCanvasWrap.style.display = "none";
      this.pdfViewerFrame.style.display = "block";
    } else if (this.pdfMobileCanvasWrap) {
      this.pdfMobileCanvasWrap.style.display = "none";
      this.pdfViewerFrame.style.display = "block";
    }

    const currentAttr = this.pdfViewerFrame.getAttribute("src") || "";
    if (currentAttr === fullUrl || this._loadedPdfUrl === fullUrl) {
      this.pdfViewerFrame.style.display = "block";
      return;
    }

    const currentBase = currentAttr.split("#")[0];
    this._loadedPdfUrl = fullUrl;
    this._pendingPdfUrl = fullUrl;
    if (currentAttr && currentBase === baseSrc) {
      // Chromium PDF viewer ignores fragment-only #page= changes unless src resets cleanly first
      clearTimeout(this._pdfFrameReloadTimer);
      this.pdfViewerFrame.src = "about:blank";
      this._pdfFrameReloadTimer = setTimeout(() => {
        if (!this.pdfViewerFrame || !this._pendingPdfUrl) return;
        this.pdfViewerFrame.style.display = "block";
        this.pdfViewerFrame.src = this._pendingPdfUrl;
      }, 24);
    } else {
      this.pdfViewerFrame.style.display = "block";
      this.pdfViewerFrame.src = fullUrl;
    }
  }

  pdfPageToBookPage(pdfPage, bookCategory = "lessonBook") {
    const raw = Math.max(1, parseInt(pdfPage, 10) || 1);
    if (this.customPdfUrls && this.customPdfUrls[bookCategory]) return raw;
    const offset = bookCategory === "bonusWorkshop" ? 2 : 3;
    return raw > offset ? (raw - offset) : raw;
  }

  syncGeminiKeyUI() {
    const hasKey = Boolean(this.pdfAiExtractor && this.pdfAiExtractor.getApiKey());
    if (this.aiKeyDot) {
      this.aiKeyDot.classList.toggle("is-saved", hasKey);
    }
    if (this.btnGeminiApiKey) {
      this.btnGeminiApiKey.classList.toggle("has-key", hasKey);
      this.btnGeminiApiKey.title = hasKey
        ? "Gemini API Key & Model saved locally (click to view/update)"
        : "Set Gemini API Key & Model for PDF OMR Extraction";
    }
    if (this.geminiApiKeyInput && hasKey && document.activeElement !== this.geminiApiKeyInput) {
      this.geminiApiKeyInput.value = this.pdfAiExtractor.getApiKey();
    }
    if (this.geminiModelSelect && this.pdfAiExtractor) {
      this.geminiModelSelect.value = this.pdfAiExtractor.getModelPreference();
    }
  }

  setAiExtractStatus(msg, variant = "info", thumbDataUrl = undefined) {
    if (!this.aiExtractStatusBar || !this.aiExtractStatusText) return;
    this.aiExtractStatusBar.hidden = false;
    this.aiExtractStatusBar.dataset.variant = variant;
    this.aiExtractStatusText.textContent = msg;
    if (this.aiExtractThumb) {
      if (typeof thumbDataUrl === "string" && thumbDataUrl.length > 0) {
        this.aiExtractThumb.src = thumbDataUrl;
        this.aiExtractThumb.hidden = false;
      } else if (thumbDataUrl === null) {
        this.aiExtractThumb.removeAttribute("src");
        this.aiExtractThumb.hidden = true;
      }
    }
  }

  _extractTopicPageSpan(topic, sessionFallback = 1) {
    const nums = [];
    if (typeof topic.pdfPage === "number") nums.push(topic.pdfPage);
    const titleStr = String(topic.topicTitle || "");
    const rangeMatch = titleStr.match(/p\.\s*(\d+)\s*[-–]\s*(\d+)/i);
    if (rangeMatch) {
      return { min: parseInt(rangeMatch[1], 10), max: parseInt(rangeMatch[2], 10) };
    }
    const singleMatch = titleStr.match(/p\.\s*(\d+)/i);
    if (singleMatch) {
      const p = parseInt(singleMatch[1], 10);
      return { min: p, max: p };
    }
    (topic.exercises || []).forEach(ex => {
      if (typeof ex.pdfPage === "number") nums.push(ex.pdfPage);
    });
    if (nums.length > 0) {
      return { min: Math.min(...nums), max: Math.max(...nums) };
    }
    return { min: sessionFallback, max: sessionFallback };
  }

  applyExtractedEntryToCourses(entry) {
    if (!entry || !Array.isArray(entry.exercises) || entry.exercises.length === 0) return null;
    const bookCat = entry.bookCategory === "bonusWorkshop" ? "bonusWorkshop" : "lessonBook";
    const sessions = bookCat === "bonusWorkshop" ? GUITAR_COURSES.bonusWorkshop : GUITAR_COURSES.lessonBook;
    if (!Array.isArray(sessions) || sessions.length === 0) return null;

    const targetBookPage = entry.bookPage || entry.rawPdfPage || 1;
    let matchedSession = null;
    let matchedTopic = null;

    // 1. Direct binding to active curriculum lesson/topic when triggered from current PDF page
    if (entry.targetTopicId || entry.targetExerciseId) {
      for (const session of sessions) {
        const tList = session.topics || [];
        for (let tIdx = 0; tIdx < tList.length; tIdx++) {
          const topic = tList[tIdx];
          const computedTopicId = topic.topicId || `${bookCat}_s${session.sessionNumber}_t${tIdx}`;
          const topicMatches = entry.targetTopicId && computedTopicId === entry.targetTopicId;
          const exIdx = entry.targetExerciseId
            ? (topic.exercises || []).findIndex(ex => ex.id === entry.targetExerciseId)
            : -1;

          if (topicMatches || exIdx >= 0) {
            const exList = topic.exercises || [];
            if (exList.length <= 1 || !entry.targetExerciseId || exIdx < 0) {
              topic.exercises = entry.exercises.map(ex => ({ ...ex }));
            } else {
              const allSamePage = exList.every(ex => this.extractPageNumberFromExercise(ex) === targetBookPage);
              if (allSamePage) {
                topic.exercises = entry.exercises.map(ex => ({ ...ex }));
              } else {
                const updated = [...exList];
                updated.splice(exIdx, 1, ...entry.exercises.map(ex => ({ ...ex })));
                topic.exercises = updated;
              }
            }
            topic.pdfPage = targetBookPage;
            topic.aiExtracted = true;
            return {
              bookCategory: bookCat,
              sessionNumber: session.sessionNumber,
              firstExerciseId: entry.exercises[0].id
            };
          }
        }
      }
    }

    // 2. Exact/range topic match for that book page
    for (const session of sessions) {
      for (const topic of (session.topics || [])) {
        if (topic.topicId === `${bookCat}_ai_p${entry.rawPdfPage}`) {
          matchedSession = session;
          matchedTopic = topic;
          break;
        }
        const span = this._extractTopicPageSpan(topic, -1);
        if (span.min > 0 && targetBookPage >= span.min && targetBookPage <= span.max) {
          matchedSession = session;
          matchedTopic = topic;
          break;
        }
      }
      if (matchedTopic) break;
    }

    if (matchedTopic) {
      matchedTopic.exercises = entry.exercises.map(ex => ({ ...ex }));
      matchedTopic.pdfPage = targetBookPage;
      matchedTopic.aiExtracted = true;
      return {
        bookCategory: bookCat,
        sessionNumber: matchedSession.sessionNumber,
        firstExerciseId: entry.exercises[0].id
      };
    }

    // 2. Fallback: attach new topic under nearest preceding session by printed page
    let fallbackSession = sessions[0];
    let bestStartPage = -1;
    for (const session of sessions) {
      const m = String(session.sessionSubtitle || "").match(/p\.\s*(\d+)/i);
      const sStart = m ? parseInt(m[1], 10) : 1;
      if (sStart <= targetBookPage && sStart >= bestStartPage) {
        bestStartPage = sStart;
        fallbackSession = session;
      }
    }

    const newTopic = {
      topicId: `${bookCat}_ai_p${entry.rawPdfPage}`,
      topicTitle: `${entry.pageTitle || "Extracted Lesson"} (p. ${targetBookPage})`,
      pdfPage: targetBookPage,
      aiExtracted: true,
      exercises: entry.exercises.map(ex => ({ ...ex }))
    };
    fallbackSession.topics = fallbackSession.topics || [];
    fallbackSession.topics.push(newTopic);
    return {
      bookCategory: bookCat,
      sessionNumber: fallbackSession.sessionNumber,
      firstExerciseId: entry.exercises[0].id
    };
  }

  applyAllSavedAiExtractions(storeMap, skipUiRefresh = false) {
    if (!storeMap || typeof storeMap !== "object") return 0;
    const entries = Object.values(storeMap).sort((a, b) => (a.rawPdfPage || 0) - (b.rawPdfPage || 0));
    let count = 0;
    entries.forEach(entry => {
      if (this.applyExtractedEntryToCourses(entry)) count++;
    });
    if (count > 0 && !skipUiRefresh) {
      this.allExercises = this.buildFlatExerciseList();
      this.renderCourseBookCatalog(this.catalogSearchInput ? this.catalogSearchInput.value : "");
      if (this.currentExercise) {
        const refreshed = this.findExerciseById(this.currentExercise.id);
        if (refreshed) {
          this.loadExercise(refreshed.id, true, { forceTopicRebuild: true, noScroll: true, noPdfReload: true });
        }
      }
    }
    return count;
  }

  async hydrateIndexedDbExtractions() {
    if (!this.pdfAiExtractor) return;
    try {
      const localKeys = new Set(Object.keys(this.pdfAiExtractor.loadExtractedStoreSync()));
      const fullStore = await this.pdfAiExtractor.loadExtractedStoreAsync();
      const idbOnly = {};
      Object.entries(fullStore).forEach(([k, v]) => {
        if (!localKeys.has(k)) idbOnly[k] = v;
      });
      if (Object.keys(idbOnly).length > 0) {
        this.applyAllSavedAiExtractions(idbOnly, false);
      }
    } catch (e) {}
  }

  async getPdfDocumentForExtraction() {
    const pdfjsLib = await this.ensurePdfJsLoaded();
    const filename = this.getPdfFilename(this.pdfBookCategory);
    const customUrl = this.customPdfUrls[this.pdfBookCategory];
    const baseSrc = customUrl || this.resolveAssetUrl(filename);
    let pdfDoc = this._pdfDocCache.get(baseSrc);
    if (!pdfDoc) {
      pdfDoc = await pdfjsLib.getDocument(baseSrc).promise;
      this._pdfDocCache.set(baseSrc, pdfDoc);
    }
    return { pdfDoc, baseSrc };
  }

  async extractSinglePdfPage(rawPdfPage, { switchExercise = true, bindToActive = true } = {}) {
    const apiKey = this.pdfAiExtractor.getApiKey();
    if (!apiKey) {
      if (this.geminiKeyBar) {
        this.geminiKeyBar.hidden = false;
        if (this.geminiApiKeyInput) this.geminiApiKeyInput.focus();
      }
      this.setAiExtractStatus("Enter and save your Gemini API key first (key icon in toolbar).", "error", null);
      return null;
    }

    const pageNum = Math.max(1, parseInt(rawPdfPage, 10) || 1);
    const bookCat = this.pdfBookCategory || "lessonBook";
    const bookPage = this.pdfPageToBookPage(pageNum, bookCat);
    const activeEx = this.currentExercise;
    const shouldBindActive = Boolean(
      bindToActive &&
      activeEx &&
      activeEx.bookCategory === bookCat &&
      !activeEx.isMetronomeOnly
    );
    const targetTopicId = shouldBindActive ? activeEx.topicId : null;
    const targetExerciseId = shouldBindActive ? activeEx.id : null;

    this.setAiExtractStatus(`Rendering PDF p. ${pageNum} at 2.5x via pdf.js...`, "busy", null);
    const { pdfDoc } = await this.getPdfDocumentForExtraction();
    const clampedPage = Math.max(1, Math.min(pageNum, pdfDoc.numPages || pageNum));
    const snap = await this.pdfAiExtractor.renderPdfPageToBase64Png(pdfDoc, clampedPage, 2.5);

    const bookLabel = bookCat === "bonusWorkshop" ? "Bonus Workshop Book" : "Lesson Book";
    const { omrJson, modelUsed } = await this.pdfAiExtractor.callGeminiVision(
      snap.base64,
      apiKey,
      `${bookLabel}, PDF page ${clampedPage}, Printed page ${bookPage}`,
      (activeModel, fallbackNote) => {
        const msg = fallbackNote
          ? fallbackNote
          : `Extracting PDF p. ${clampedPage} (Book p. ${bookPage}) with ${activeModel}...`;
        this.setAiExtractStatus(msg, "busy", snap.dataUrl);
      }
    );

    const entry = this.pdfAiExtractor.normalizeExtractedPage({
      omrJson,
      bookCategory: bookCat,
      rawPdfPage: clampedPage,
      bookPage,
      targetTopicId,
      targetExerciseId,
      modelUsed
    });

    if (!entry.exercises || entry.exercises.length === 0) {
      this.setAiExtractStatus(`No musical exercises detected on PDF p. ${clampedPage}.`, "warn", snap.dataUrl);
      return entry;
    }

    await this.pdfAiExtractor.savePageEntry(entry);
    const applied = this.applyExtractedEntryToCourses(entry);
    this.allExercises = this.buildFlatExerciseList();

    if (applied) {
      this.currentBookCategory = applied.bookCategory;
      this.expandedSessions.add(`${applied.bookCategory}_${applied.sessionNumber}`);
      this.renderCourseBookCatalog(this.catalogSearchInput ? this.catalogSearchInput.value : "");
      if (switchExercise) {
        if (this.paneMode === "pdf") {
          this.setPaneMode("split");
        }
        this.loadExercise(applied.firstExerciseId, false, {
          forceTopicRebuild: true,
          scrollTopicTop: true,
          noPdfReload: true
        });
      }
    }

    const warnNote = entry.mathWarnings && entry.mathWarnings.length > 0
      ? ` · Math note: ${entry.mathWarnings.slice(0, 2).join("; ")}`
      : "";
    this.setAiExtractStatus(
      `Extracted ${entry.exercises.length} exercise${entry.exercises.length === 1 ? "" : "s"} from PDF p. ${clampedPage} via ${modelUsed} — bound & live!${warnNote}`,
      entry.mathWarnings && entry.mathWarnings.length > 0 ? "warn" : "success",
      snap.dataUrl
    );
    return entry;
  }

  async extractCurrentPdfPage() {
    if (this.pdfAiExtractor._isBusy) return;
    const rawPage = (this.pdfPageInput && parseInt(this.pdfPageInput.value, 10)) || this.pdfCurrentPage || 1;
    this.pdfAiExtractor._isBusy = true;
    if (this.btnExtractPdfPage) this.btnExtractPdfPage.disabled = true;
    try {
      await this.extractSinglePdfPage(rawPage, { switchExercise: true });
    } catch (err) {
      this.setAiExtractStatus(`Extraction failed: ${err && err.message ? err.message : String(err)}`, "error");
    } finally {
      this.pdfAiExtractor._isBusy = false;
      if (this.btnExtractPdfPage) this.btnExtractPdfPage.disabled = false;
    }
  }

  async runBatchPdfExtract() {
    if (this.pdfAiExtractor._isBusy) return;
    const apiKey = this.pdfAiExtractor.getApiKey();
    if (!apiKey) {
      if (this.geminiKeyBar) {
        this.geminiKeyBar.hidden = false;
        if (this.geminiApiKeyInput) this.geminiApiKeyInput.focus();
      }
      this.setAiExtractStatus("Enter and save your Gemini API key before starting Batch Extract.", "error");
      return;
    }

    const fromRaw = Math.max(1, parseInt(this.batchFromPageInput && this.batchFromPageInput.value, 10) || 1);
    const toRaw = Math.max(fromRaw, parseInt(this.batchToPageInput && this.batchToPageInput.value, 10) || fromRaw);
    const total = toRaw - fromRaw + 1;

    this.pdfAiExtractor._isBusy = true;
    this.pdfAiExtractor._batchCancelled = false;
    if (this.btnStartBatchExtract) this.btnStartBatchExtract.disabled = true;
    if (this.btnExtractPdfPage) this.btnExtractPdfPage.disabled = true;
    if (this.btnCancelBatchExtract) this.btnCancelBatchExtract.hidden = false;
    if (this.aiExtractProgressWrap) this.aiExtractProgressWrap.hidden = false;

    let completedPages = 0;
    let totalExercises = 0;
    let firstAppliedId = null;

    try {
      for (let p = fromRaw; p <= toRaw; p++) {
        if (this.pdfAiExtractor._batchCancelled) {
          this.setAiExtractStatus(`Batch stopped after ${completedPages}/${total} pages (${totalExercises} exercises saved).`, "warn");
          break;
        }
        const pctBefore = Math.round(((p - fromRaw) / total) * 100);
        if (this.aiExtractProgressFill) this.aiExtractProgressFill.style.width = `${pctBefore}%`;
        if (this.aiExtractProgressPct) this.aiExtractProgressPct.textContent = `${p - fromRaw}/${total}`;

        this.pdfCurrentPage = p;
        if (this.pdfPageInput) this.pdfPageInput.value = p;
        const entry = await this.extractSinglePdfPage(p, { switchExercise: false, bindToActive: false });
        completedPages++;
        if (entry && Array.isArray(entry.exercises) && entry.exercises.length > 0) {
          totalExercises += entry.exercises.length;
          if (!firstAppliedId) firstAppliedId = entry.exercises[0].id;
        }

        const pctAfter = Math.round((completedPages / total) * 100);
        if (this.aiExtractProgressFill) this.aiExtractProgressFill.style.width = `${pctAfter}%`;
        if (this.aiExtractProgressPct) this.aiExtractProgressPct.textContent = `${completedPages}/${total}`;
      }

      if (!this.pdfAiExtractor._batchCancelled) {
        if (firstAppliedId) {
          if (this.paneMode === "pdf") this.setPaneMode("split");
          this.loadExercise(firstAppliedId, false, {
            forceTopicRebuild: true,
            scrollTopicTop: true,
            noPdfReload: true
          });
        }
        this.setAiExtractStatus(
          `Batch complete: ${completedPages} pages processed, ${totalExercises} exercises extracted & saved!`,
          "success"
        );
      }
    } catch (err) {
      this.setAiExtractStatus(`Batch stopped on error: ${err && err.message ? err.message : String(err)}`, "error");
    } finally {
      this.pdfAiExtractor._isBusy = false;
      if (this.btnStartBatchExtract) this.btnStartBatchExtract.disabled = false;
      if (this.btnExtractPdfPage) this.btnExtractPdfPage.disabled = false;
      if (this.btnCancelBatchExtract) this.btnCancelBatchExtract.hidden = true;
    }
  }

  async exportCurriculumJson() {
    const store = await this.pdfAiExtractor.loadExtractedStoreAsync();
    const pageList = Object.values(store).sort((a, b) => (a.rawPdfPage || 0) - (b.rawPdfPage || 0));
    const exportPayload = {
      schemaVersion: "2.0.0",
      exportedAt: new Date().toISOString(),
      modelPreference: this.pdfAiExtractor.getModelPreference(),
      extractedPageCount: pageList.length,
      extractedPages: pageList,
      courses: {
        lessonBook: GUITAR_COURSES.lessonBook,
        bonusWorkshop: GUITAR_COURSES.bonusWorkshop
      }
    };
    const jsonStr = JSON.stringify(exportPayload, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lmgs-curriculum-${pageList.length > 0 ? `${pageList.length}-extracted-pages` : "snapshot"}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    this.setAiExtractStatus(
      `Exported JSON (${pageList.length} AI-extracted PDF page${pageList.length === 1 ? "" : "s"} + full curriculum).`,
      "success"
    );
  }

  async clearAiExtractedData() {
    await this.pdfAiExtractor.clearAllExtractedPages();
    this.setAiExtractStatus("Cleared all saved AI-extracted pages. Reloading built-in curriculum...", "info");
    setTimeout(() => window.location.reload(), 450);
  }

  switchView(viewName) {
    // Legacy compatibility: maps view requests into the unified 3-Zone Workspace
    this.currentView = "studio";
    if (viewName === "book") {
      this.setDrawerOpen(true);
    }
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
    if (!this.sessionsAccordion) return;

    if (this.currentBookCategory === "freeMetronome") {
      const activeId = this.currentExercise ? this.currentExercise.id : "";
      this.sessionsAccordion.innerHTML = `
        <div class="acc-session is-open">
          <div class="acc-topic-label">Free Metronome Studio</div>
          <button class="acc-ex-item ${activeId === 'free-metronome' ? 'is-active' : ''}" data-ex-id="free-metronome">
            <span class="acc-ex-title">Free 4/4 Programmable Metronome</span>
          </button>
        </div>
      `;
      this.sessionsAccordion.querySelectorAll(".acc-ex-item").forEach(btn => {
        btn.addEventListener("click", () => this.loadExercise(btn.dataset.exId));
      });
      return;
    }

    const isWorkshop = this.currentBookCategory === "bonusWorkshop";
    const sessionList = isWorkshop ? GUITAR_COURSES.bonusWorkshop : GUITAR_COURSES.lessonBook;
    const query = (filterQuery || "").trim().toLowerCase();
    const activeId = this.currentExercise ? this.currentExercise.id : "";

    let html = "";

    sessionList.forEach((session) => {
      const sessionKey = `${this.currentBookCategory}_${session.sessionNumber}`;
      let matchingTopics = [];
      let totalExCount = 0;
      let doneCount = 0;
      let containsActive = false;

      session.topics.forEach(t => {
        const matchingExercises = t.exercises.filter(ex => {
          totalExCount++;
          if (this.completedExercises.has(ex.id)) doneCount++;
          if (ex.id === activeId) containsActive = true;
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
      const prefix = isWorkshop ? `W${session.sessionNumber}` : `S${session.sessionNumber}`;
      const isOpen = !!query || containsActive || this.expandedSessions.has(sessionKey);

      let topicsHtml = "";
      topicsToRender.forEach(topic => {
        const cleanTopic = topic.topicTitle.replace(/\s*\([^)]*p\.\s*[\d\u2013-]+\)/i, "");
        const isCurrentTopic = Boolean(
          this.currentTopicId &&
          topic.exercises.some(e => (e.topicId || topic.topicId) === this.currentTopicId || e.id === activeId)
        );
        const firstExId = topic.exercises[0] ? topic.exercises[0].id : "";
        const exRows = topic.exercises.map(ex => {
          const isRestDrill = ex.id.includes("rest") || ex.id.includes("tdr") || ex.title.toLowerCase().includes("rest");
          const isDone = this.completedExercises.has(ex.id);
          const isActive = ex.id === activeId;
          const shortTitle = ex.title
            .replace(/^Exercise \d+:\s*/i, "")
            .replace(/^Finger Exercise \d+:\s*/i, "")
            .replace(/^Workshop Drill \d+:\s*/i, "");
          return `
            <button class="acc-ex-item ${isActive ? 'is-active' : ''}" data-ex-id="${ex.id}" title="${this.escapeHtml(ex.title)}">
              <span class="acc-ex-title">${this.escapeHtml(shortTitle)}</span>
              <span class="acc-ex-meta">
                ${isRestDrill ? '<span class="acc-rest-dot" title="Contains Rest / Damp Cue"></span>' : ''}
                ${isDone ? '<span class="acc-done-mark" title="Completed">&#10003;</span>' : ''}
              </span>
            </button>
          `;
        }).join("");

        topicsHtml += `
          <button type="button" class="acc-topic-label acc-topic-btn ${isCurrentTopic ? 'is-active-topic' : ''}" data-first-ex="${firstExId}" title="Show all exercises in ${this.escapeHtml(topic.topicTitle)}">
            <span>${this.escapeHtml(cleanTopic)}</span>
            ${topic.exercises.length > 1 ? `<span class="acc-topic-count">${topic.exercises.length}</span>` : ""}
          </button>
          ${exRows}
        `;
      });

      html += `
        <div class="acc-session ${isOpen ? 'is-open' : ''}" data-session-key="${sessionKey}">
          <button class="acc-session-trigger" type="button" aria-expanded="${isOpen ? 'true' : 'false'}">
            <svg class="acc-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            <span class="acc-session-num">${prefix}</span>
            <span class="acc-session-name" title="${this.escapeHtml(session.sessionTitle)}">${this.escapeHtml(session.sessionTitle)}</span>
            <span class="acc-session-count">${doneCount}/${totalExCount}</span>
          </button>
          <div class="acc-session-body">
            ${topicsHtml}
          </div>
        </div>
      `;
    });

    if (html === "") {
      html = `<div class="drawer-empty">No exercises matching "${this.escapeHtml(filterQuery)}".</div>`;
    }

    this.sessionsAccordion.innerHTML = html;

    // Accordion expand / collapse
    this.sessionsAccordion.querySelectorAll(".acc-session-trigger").forEach(btn => {
      btn.addEventListener("click", () => {
        const parent = btn.closest(".acc-session");
        const key = parent.dataset.sessionKey;
        const willOpen = !parent.classList.contains("is-open");
        parent.classList.toggle("is-open", willOpen);
        btn.setAttribute("aria-expanded", willOpen ? "true" : "false");
        if (willOpen) this.expandedSessions.add(key);
        else this.expandedSessions.delete(key);
      });
    });

    // Topic button click -> open full topic at Exercise 1
    this.sessionsAccordion.querySelectorAll(".acc-topic-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const firstId = btn.dataset.firstEx;
        if (firstId) {
          this.loadExercise(firstId, false, { scrollTopicTop: true });
          if (window.innerWidth <= 1024) {
            this.setDrawerOpen(false);
          }
        }
      });
    });

    // Exercise click
    this.sessionsAccordion.querySelectorAll(".acc-ex-item").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.exId;
        this.loadExercise(id);
        if (window.innerWidth <= 1024) {
          this.setDrawerOpen(false);
        }
      });
    });
  }

  renderActiveSessionChecklist(found) {
    if (!this.activeSessionChecklist || !found || !found.sessionNumber) {
      if (this.activeSessionChecklist) this.activeSessionChecklist.innerHTML = "";
      return;
    }
    const items = this.getSessionChecklist(found.sessionNumber);
    if (!items || items.length === 0) {
      this.activeSessionChecklist.innerHTML = "";
      return;
    }
    const bookCat = found.bookCategory || "lessonBook";
    this.activeSessionChecklist.innerHTML = `
      <div class="guide-check-title">Session ${found.sessionNumber} Goals</div>
      ${items.map((item, idx) => {
        const gKey = `${bookCat}_s${found.sessionNumber}_g${idx}`;
        const checked = this.checkedGoals.has(gKey) ? "checked" : "";
        return `
          <label class="guide-check-item">
            <input type="checkbox" data-goal-key="${gKey}" ${checked}>
            <span>${this.escapeHtml(item)}</span>
          </label>
        `;
      }).join("")}
    `;
    this.activeSessionChecklist.querySelectorAll("input[data-goal-key]").forEach(chk => {
      chk.addEventListener("change", (e) => {
        this.toggleGoalChecked(e.target.dataset.goalKey);
      });
    });
  }

  populateStudioDropdown() {
    if (!this.studioSessionSelect) return;
  }

  renderTopicExercisesFor(found) {
    if (!this.topicExercisesStack || !found) return;

    const topicExercises = this.allExercises.filter(e => e.topicId === found.topicId);
    const list = topicExercises.length > 0 ? topicExercises : [found];
    this.currentTopicId = found.topicId;
    this.currentTopicExercises = list;
    this.activeTopicRenderers.clear();

    this.topicExercisesStack.innerHTML = list.map((ex, idx) => {
      const isSelected = ex.id === found.id;
      const ts = ex.timeSignature || [4, 4];
      const tsLabel = Array.isArray(ts) ? `${ts[0]}/${ts[1]}` : String(ts);
      const exPage = ex.pdfPage || this.extractPageNumberFromExercise(ex);
      const isSong = /song:/i.test(ex.title);
      return `
        <section class="topic-exercise-block ${isSelected ? "is-selected" : ""}" id="topic-ex-${ex.id}" data-ex-id="${ex.id}">
          <div class="topic-ex-head" data-select-header="${ex.id}" title="Click to select for Bottom Dock playback">
            <div class="topic-ex-head-left">
              <span class="topic-ex-badge">${idx + 1}</span>
              <div class="topic-ex-title-wrap">
                <div class="topic-ex-title">${this.escapeHtml(ex.title)}</div>
                ${ex.description ? `<div class="topic-ex-sub">${this.escapeHtml(ex.description)}</div>` : ""}
              </div>
            </div>
            <div class="topic-ex-head-right">
              ${ex.bookCategory !== "freeMetronome" && exPage ? `<span class="topic-ex-meta-pill">p. ${exPage}</span>` : ""}
              <span class="topic-ex-meta-pill">${tsLabel}</span>
              <span class="topic-ex-meta-pill">&#9833; ${ex.defaultBpm || 60}</span>
              <button class="topic-ex-select-btn" type="button" data-select-ex="${ex.id}">${isSelected ? "Active" : "Select"}</button>
              <button class="topic-ex-play-btn" type="button" data-play-ex="${ex.id}" title="Select and play this exercise">&#9654;</button>
            </div>
          </div>
          <div class="topic-ex-score-host" data-score-ex="${ex.id}"></div>
        </section>
      `;
    }).join("");

    list.forEach((ex) => {
      const blockEl = this.topicExercisesStack.querySelector(`#topic-ex-${ex.id}`);
      const scoreHost = blockEl ? blockEl.querySelector(".topic-ex-score-host") : null;
      const selectBtn = blockEl ? blockEl.querySelector(`[data-select-ex="${ex.id}"]`) : null;
      const playBtn = blockEl ? blockEl.querySelector(`[data-play-ex="${ex.id}"]`) : null;
      const headEl = blockEl ? blockEl.querySelector(`[data-select-header="${ex.id}"]`) : null;

      let renderer = null;
      if (scoreHost && typeof ScoreRenderer !== "undefined") {
        renderer = new ScoreRenderer(scoreHost, (mIdx, bIdx) => {
          if (!this.currentExercise || this.currentExercise.id !== ex.id) {
            this.loadExercise(ex.id, false, { noScroll: true });
          }
          this.seekToMeasureBeat(mIdx, bIdx);
        });
        renderer.loadExercise(ex, {
          noteNameMode: this.noteNameMode,
          tabVisibilityMode: this.tabVisibilityMode,
          showRhythmGuide: this.showRhythmGuide,
          showCoachBanner: this.showCoachBanner
        });
      }

      if (headEl) {
        headEl.addEventListener("click", (e) => {
          if (e.target.closest("[data-play-ex]")) return;
          if (!this.currentExercise || this.currentExercise.id !== ex.id) {
            this.loadExercise(ex.id, false, { noScroll: true });
          }
        });
      }

      if (playBtn) {
        playBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          if (!this.currentExercise || this.currentExercise.id !== ex.id) {
            this.loadExercise(ex.id, false, { noScroll: true });
          }
          this.start();
        });
      }

      this.activeTopicRenderers.set(ex.id, { renderer, blockEl, selectBtn, playBtn });
    });
  }

  updateTopicSelectionUI(activeId) {
    this.activeTopicRenderers.forEach((entry, exId) => {
      const isSelected = exId === activeId;
      if (entry.blockEl) entry.blockEl.classList.toggle("is-selected", isSelected);
      if (entry.selectBtn) entry.selectBtn.textContent = isSelected ? "Active" : "Select";
      if (!isSelected && entry.renderer) {
        entry.renderer.reset();
        entry.renderer.setLoopMeasure(null);
      }
    });
  }

  loadExercise(exerciseId, keepBpm = false, uiOpts = {}) {
    if (this.isPlaying) this.stop();

    const found = this.findExerciseById(exerciseId) || this.findExerciseById("lb-s2-str1-ex1") || this.allExercises[0];
    if (!found) return;

    const prevTopicId = this.currentTopicId;
    this.currentExercise = JSON.parse(JSON.stringify(found));
    this.currentExerciseIndex = this.allExercises.findIndex(e => e.id === found.id);
    this.currentBookCategory = found.bookCategory;
    this.selectedSpiderString = 1;
    this.loopMeasureIndex = 0;

    // Top bar breadcrumb & Guide drawer updates
    if (this.navCrumbSession) {
      const bookShort = found.bookCategory === "bonusWorkshop"
        ? `Workshop ${found.sessionNumber || ''}`
        : (found.bookCategory === "freeMetronome" ? "Free Studio" : `Session ${found.sessionNumber || ''}`);
      this.navCrumbSession.textContent = bookShort.trim();
    }
    if (this.studioExerciseTitle) {
      this.studioExerciseTitle.textContent = this.currentExercise.title;
    }
    if (this.studioExerciseTopicBadge) {
      this.studioExerciseTopicBadge.textContent = `${found.bookName} \u00B7 ${found.sessionTitle || ''} \u00B7 ${found.topicTitle || ''}`;
    }

    const defaultInstrText = "Practice slowly and steadily with the metronome. Focus on clean fretting-hand placement right behind the fret wire and consistent picking.";
    const instrCopy = this.currentExercise.description || defaultInstrText;

    const instrEl = this.studioInstructionText || document.getElementById("studio-instruction-text");
    if (instrEl) {
      instrEl.textContent = instrCopy;
    }

    const topicExercises = this.allExercises.filter(e => e.topicId === found.topicId);
    const topicCount = topicExercises.length;
    const cleanTopicHeading = (found.topicTitle || found.title)
      .replace(/\s*\([^)]*p\.\s*[\d\u2013-]+\)/i, "")
      .trim();

    // Printed Book Page header metadata
    if (this.bookPageSession) {
      const bookKicker = found.bookCategory === "bonusWorkshop"
        ? `BONUS WORKSHOP BOOK \u00B7 WORKSHOP ${found.sessionNumber || ''}`
        : (found.bookCategory === "freeMetronome"
          ? "PRACTICE WORKSTATION \u00B7 FREE METRONOME"
          : `LEARN & MASTER GUITAR \u00B7 SESSION ${found.sessionNumber || ''}`);
      this.bookPageSession.textContent = bookKicker.trim();
    }
    if (this.bookVerificationBadge) {
      const isVerified = found.verificationStatus === "pdf-verified";
      const pageNum = found.pdfPage || this.extractPageNumberFromExercise(found);
      this.bookVerificationBadge.className = `book-verified-pill ${isVerified ? "is-verified" : "is-pending"}`;
      this.bookVerificationBadge.textContent = isVerified
        ? `PDF Transcribed \u00B7 p. ${pageNum}`
        : `Legacy Preview \u00B7 Pending PDF p. ${pageNum}`;
      this.bookVerificationBadge.style.display = found.bookCategory === "freeMetronome" ? "none" : "inline-flex";
    }
    if (this.bookPageTitle) {
      this.bookPageTitle.textContent = topicCount > 1 ? cleanTopicHeading : this.currentExercise.title;
    }
    if (this.bookTopicCountPill) {
      if (topicCount > 1) {
        const isSongsTopic = /song/i.test(cleanTopicHeading);
        this.bookTopicCountPill.textContent = `${topicCount} ${isSongsTopic ? "Pieces" : "Exercises"}`;
        this.bookTopicCountPill.hidden = false;
      } else {
        this.bookTopicCountPill.hidden = true;
      }
    }
    if (this.bookPageDesc) {
      this.bookPageDesc.textContent = instrCopy;
    }
    if (this.bookTempoBpm) {
      this.bookTempoBpm.textContent = this.bpm;
    }

    this.renderActiveSessionChecklist(found);

    if (found.sessionNumber) {
      this.expandedSessions.add(`${found.bookCategory}_${found.sessionNumber}`);
    }

    const isFreeMet = found.bookCategory === "freeMetronome" || found.id === "free-metronome" || Boolean(found.isMetronomeOnly);
    if (isFreeMet) {
      this.applyFreeTimeSignatureToExercise(this.currentExercise);
    }

    if (!keepBpm) {
      this.setBpm(this.currentExercise.defaultBpm || 60);
    }

    const ts = this.currentExercise.timeSignature || [4, 4];
    if (this.timePillBadge) {
      this.timePillBadge.textContent = `${ts[0]}/${ts[1]}`;
      this.timePillBadge.classList.toggle("is-clickable", isFreeMet);
      this.timePillBadge.title = isFreeMet
        ? "Click to cycle Time Signature (2/4, 3/4, 4/4, 5/4, 6/8)"
        : `Time Signature: ${ts[0]}/${ts[1]}`;
    }

    this.currentMeasureIndex = 0;
    this.currentBeatInMeasure = 0;
    this.currentSubBeatIndex = 0;
    this.currentBeatIndex = 0;
    this.currentMeasureBeatPos = 0.0;

    // Toggle String selector visibility (only for finger exercises / spider drills)
    const strGroup = document.getElementById("string-selector-group");
    const isFingerDrill = this.currentExercise.id.includes("fe") || /finger exercise/i.test(this.currentExercise.title);
    if (strGroup) {
      strGroup.style.display = isFingerDrill ? "inline-flex" : "none";
      strGroup.querySelectorAll("[data-str]").forEach(b => b.classList.toggle("active", b.dataset.str === "1"));
    }

    // Toggle Chord mode selector visibility
    const chordGroup = document.getElementById("chord-mode-group");
    const hasChords = (this.currentExercise.tabData || []).some(m => m.chordName || (m.beats && m.beats.some(b => b.string === "all" || (typeof b.string === "string" && b.string.includes("-")))));
    if (chordGroup) {
      chordGroup.style.display = hasChords ? "inline-flex" : "none";
    }

    if (typeof document !== "undefined" && document.body) {
      document.body.dataset.freeMetronome = isFreeMet ? "true" : "false";
    }
    if (this.workspaceBody) {
      this.workspaceBody.dataset.paneMode = isFreeMet ? "score" : (this.paneMode || "score");
    }

    this.updateDoneButtonUI();
    this.updateSpeedPresetsUI();
    this.updateLoopModeUI();
    this.renderBeatDots();
    this.renderFreeMetronomeDots();
    this.syncFreeMetronomeToolbarUI();

    if (isFreeMet) {
      this.currentTopicId = found.topicId;
      this.currentTopicExercises = [this.currentExercise];
      this.activeTopicRenderers.clear();
      if (this.topicExercisesStack) {
        this.topicExercisesStack.innerHTML = "";
      }
      if (this.freeMetBpmVal) {
        this.freeMetBpmVal.textContent = this.bpm;
      }
      if (this.freeMetBpmSlider) {
        this.freeMetBpmSlider.value = this.bpm;
      }
    } else {
      const needsTopicRebuild = (
        Boolean(uiOpts && uiOpts.forceTopicRebuild) ||
        prevTopicId !== found.topicId ||
        this.activeTopicRenderers.size === 0 ||
        !this.activeTopicRenderers.has(found.id)
      );
      if (needsTopicRebuild) {
        this.renderTopicExercisesFor(found);
      } else {
        this.updateTopicSelectionUI(found.id);
      }
    }

    this.syncTutorToolbarUI();
    this.fretboard.setChordMode(this.chordMode);
    this.fretboard.reset();

    const firstBeat = this.currentExercise.tabData[0].beats[0];
    this.updateCard(firstBeat, false, 1, this.currentExercise.tabData[0].chordName);
    if (!isFreeMet) {
      this.fretboard.update(firstBeat, false, this.currentExercise.tabData[0].chordName);
    }

    this.syncBookTabsUI();
    this.renderCourseBookCatalog(this.catalogSearchInput ? this.catalogSearchInput.value : "");
    if (!isFreeMet && !(uiOpts && uiOpts.noPdfReload)) {
      this.syncPdfToExercise(found);
    }
    this.saveState();

    if (uiOpts && uiOpts.scrollTopicTop) {
      if (this.studioScoreViewport) {
        this.studioScoreViewport.scrollTo({ top: 0, behavior: "smooth" });
      } else if (this.bookPageTitle) {
        this.bookPageTitle.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else if (!uiOpts.noScroll && topicCount > 1) {
      const selCard = document.getElementById(`topic-ex-${found.id}`);
      if (selCard && this.studioScoreViewport) {
        const vpRect = this.studioScoreViewport.getBoundingClientRect();
        const cardRect = selCard.getBoundingClientRect();
        if (cardRect.top < vpRect.top + 8 || cardRect.bottom > vpRect.bottom - 8) {
          const targetTop = this.studioScoreViewport.scrollTop + (cardRect.top - vpRect.top) - 14;
          this.studioScoreViewport.scrollTo({ top: Math.max(0, targetTop), behavior: "smooth" });
        }
      } else if (selCard) {
        selCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }

  syncBookTabsUI() {
    const tabs = [
      [this.choiceLessonBook, "lessonBook"],
      [this.choiceWorkshopBook, "bonusWorkshop"],
      [this.choiceFreeMode, "freeMetronome"]
    ];
    tabs.forEach(([el, cat]) => {
      if (!el) return;
      const isActive = this.currentBookCategory === cat;
      el.classList.toggle("selected", isActive);
      el.classList.toggle("active", isActive);
      el.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  }

  renderBeatDots() {
    const ts = this.currentExercise.timeSignature || [4, 4];
    const numBeats = ts[0] || 4;
    const isFreeMet = Boolean(this.currentExercise && (this.currentExercise.id === "free-metronome" || this.currentExercise.isMetronomeOnly));
    let html = "";
    for (let i = 0; i < numBeats; i++) {
      const mode = isFreeMet ? (this.freeMetBeatModes[i] || (i === 0 ? "accent" : "normal")) : "normal";
      const restCls = mode === "muted" ? " configured-as-rest" : "";
      html += `<div class="beat-dot-item${restCls}" data-index="${i}" title="Beat ${i + 1} - Click to toggle Mute"></div>`;
    }
    this.beatDotsSequence.innerHTML = html;

    // Attach click to toggle rest/mute (or cycle Accent/Normal/Muted in Free Metronome)
    const dots = this.beatDotsSequence.querySelectorAll(".beat-dot-item");
    dots.forEach(dot => {
      dot.addEventListener("click", () => {
        const beatIdx = parseInt(dot.dataset.index, 10);
        if (this.currentExercise && (this.currentExercise.id === "free-metronome" || this.currentExercise.isMetronomeOnly)) {
          this.cycleFreeBeatMode(beatIdx);
          return;
        }
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

  getFreeMetTimeSignatureConfig(tsStr) {
    const presets = {
      "2/4": { ts: [2, 4], modes: ["accent", "normal"] },
      "3/4": { ts: [3, 4], modes: ["accent", "normal", "normal"] },
      "4/4": { ts: [4, 4], modes: ["accent", "normal", "normal", "normal"] },
      "5/4": { ts: [5, 4], modes: ["accent", "normal", "normal", "normal", "normal"] },
      "6/8": { ts: [6, 8], modes: ["accent", "normal", "normal", "secondary", "normal", "normal"] }
    };
    return presets[tsStr] || presets["4/4"];
  }

  applyFreeTimeSignatureToExercise(targetEx) {
    const cfg = this.getFreeMetTimeSignatureConfig(this.freeMetTimeSignature);
    const numBeats = cfg.ts[0];
    const beats = [];
    for (let i = 0; i < numBeats; i++) {
      const m = this.freeMetBeatModes[i] || cfg.modes[i] || (i === 0 ? "accent" : "normal");
      this.freeMetBeatModes[i] = m;
      beats.push({
        beat: i + 1,
        note: m === "muted" ? "REST" : `Beat ${i + 1}`,
        symbol: cfg.ts[1] === 8 ? "1/8" : "1/4",
        type: m === "muted" ? "rest" : "metronome"
      });
    }
    this.freeMetBeatModes.length = numBeats;

    const applyTo = (ex) => {
      if (!ex) return;
      ex.timeSignature = [...cfg.ts];
      ex.tabData = [{ measure: 1, beats: beats.map(b => ({ ...b })) }];
    };

    applyTo(targetEx);
    if (GUITAR_COURSES.freeMetronome) {
      applyTo(GUITAR_COURSES.freeMetronome);
    }
    const storedEx = this.findExerciseById("free-metronome");
    if (storedEx && storedEx !== targetEx) {
      applyTo(storedEx);
    }
  }

  setFreeTimeSignature(tsStr) {
    const validTs = ["2/4", "3/4", "4/4", "5/4", "6/8"];
    const normalized = validTs.includes(tsStr) ? tsStr : "4/4";
    const cfg = this.getFreeMetTimeSignatureConfig(normalized);

    this.freeMetTimeSignature = normalized;
    this.freeMetBeatModes = [...cfg.modes];
    this.currentBeatInMeasure = 0;
    this.currentSubBeatIndex = 0;
    this.currentMeasureBeatPos = 0.0;

    if (this.isPlaying && this.audio && this.audio.audioCtx) {
      this.nextBeatTime = this.audio.audioCtx.currentTime + 0.05;
      this.queue = [];
    }

    const isFreeMet = Boolean(
      this.currentExercise &&
      (this.currentExercise.bookCategory === "freeMetronome" ||
        this.currentExercise.id === "free-metronome" ||
        this.currentExercise.isMetronomeOnly)
    );

    this.applyFreeTimeSignatureToExercise(isFreeMet ? this.currentExercise : null);

    if (isFreeMet) {
      if (this.timePillBadge) {
        this.timePillBadge.textContent = normalized;
      }
      this.renderBeatDots();
      if (this.freeMetStatusCue && !this.isPlaying) {
        const extraHint = normalized === "6/8" ? " · Beats 1 & 4 accented" : "";
        this.freeMetStatusCue.textContent = `Time Signature set to ${normalized} (${cfg.ts[0]} beats/bar${extraHint})`;
      }
    }

    this.renderFreeMetronomeDots();
    this.syncFreeMetronomeToolbarUI();
    this.saveState();
  }

  setFreeSubdivision(subdiv) {
    const n = parseInt(subdiv, 10);
    this.freeMetSubdivision = [1, 2, 3].includes(n) ? n : 1;
    this.currentSubBeatIndex = 0;

    if (this.isPlaying && this.audio && this.audio.audioCtx) {
      this.nextBeatTime = this.audio.audioCtx.currentTime + 0.05;
      this.queue = [];
    }

    this.renderFreeMetronomeDots();
    this.syncFreeMetronomeToolbarUI();

    if (this.freeMetStatusCue && !this.isPlaying) {
      const label = this.freeMetSubdivision === 1
        ? "Quarter Pulse"
        : (this.freeMetSubdivision === 2 ? "Eighth Notes (1 & 2 &)" : "Triplets (3 per beat)");
      this.freeMetStatusCue.textContent = `Subdivision: ${label}`;
    }

    this.saveState();
  }

  syncFreeMetronomeToolbarUI() {
    if (this.freeMetBpmVal) {
      this.freeMetBpmVal.textContent = this.bpm;
    }
    if (this.freeMetBpmSlider) {
      this.freeMetBpmSlider.value = this.bpm;
    }
    if (this.freeMetTimesigGroup) {
      this.freeMetTimesigGroup.querySelectorAll("[data-ts]").forEach(btn => {
        const isSel = btn.dataset.ts === this.freeMetTimeSignature;
        btn.classList.toggle("active", isSel);
        btn.setAttribute("aria-pressed", isSel ? "true" : "false");
      });
    }
    if (this.freeMetSubdivGroup) {
      const targetSub = String(this.freeMetSubdivision || 1);
      this.freeMetSubdivGroup.querySelectorAll("[data-subdiv]").forEach(btn => {
        const isSel = btn.dataset.subdiv === targetSub;
        btn.classList.toggle("active", isSel);
        btn.setAttribute("aria-pressed", isSel ? "true" : "false");
      });
    }
  }

  handleTapTempo() {
    const now = performance.now();
    if (this._tapTimes.length > 0 && now - this._tapTimes[this._tapTimes.length - 1] > 2500) {
      this._tapTimes = [];
    }
    this._tapTimes.push(now);
    if (this._tapTimes.length > 6) {
      this._tapTimes.shift();
    }

    if (this.freeMetTapBtn) {
      this.freeMetTapBtn.classList.add("is-tapped");
      clearTimeout(this._tapFlashTimer);
      this._tapFlashTimer = setTimeout(() => {
        if (this.freeMetTapBtn) this.freeMetTapBtn.classList.remove("is-tapped");
      }, 110);
    }

    if (this._tapTimes.length >= 2) {
      let sum = 0;
      for (let i = 1; i < this._tapTimes.length; i++) {
        sum += this._tapTimes[i] - this._tapTimes[i - 1];
      }
      const avgMs = sum / (this._tapTimes.length - 1);
      if (avgMs > 0) {
        const detectedBpm = Math.round(60000 / avgMs);
        this.setBpm(detectedBpm);
        if (this.freeMetStatusCue && !this.isPlaying) {
          this.freeMetStatusCue.textContent = `Tap Tempo detected: ${this.bpm} BPM`;
        }
      }
    } else if (this.freeMetStatusCue && !this.isPlaying) {
      this.freeMetStatusCue.textContent = "Keep tapping steadily to set BPM...";
    }
  }

  renderFreeMetronomeDots() {
    if (!this.freeMetDotsRow) return;
    const cfg = this.getFreeMetTimeSignatureConfig(this.freeMetTimeSignature);
    const ts = (this.currentExercise && (this.currentExercise.id === "free-metronome" || this.currentExercise.isMetronomeOnly))
      ? (this.currentExercise.timeSignature || cfg.ts)
      : cfg.ts;
    const numBeats = ts[0] || 4;
    const subdiv = this.freeMetSubdivision || 1;

    while (this.freeMetBeatModes.length < numBeats) {
      const idx = this.freeMetBeatModes.length;
      this.freeMetBeatModes.push(cfg.modes[idx] || (idx === 0 ? "accent" : "normal"));
    }

    this.freeMetDotsRow.classList.toggle("has-subdiv", subdiv > 1);

    let html = "";
    for (let i = 0; i < numBeats; i++) {
      const mode = this.freeMetBeatModes[i] || (i === 0 ? "accent" : "normal");
      const modeLabel = mode === "secondary" ? "Secondary Accent" : (mode.charAt(0).toUpperCase() + mode.slice(1));
      html += `
        <div class="free-met-dot-col" data-beat-col="${i}">
          <button type="button" class="free-met-dot mode-${mode}" data-free-beat="${i}" title="Beat ${i + 1} (${modeLabel}) — Click to cycle Accent / Normal / Muted" aria-label="Beat ${i + 1}: ${modeLabel}"></button>
          <span class="free-met-dot-num">${i + 1}</span>
        </div>
      `;
      if (subdiv > 1) {
        for (let s = 1; s < subdiv; s++) {
          const subLbl = subdiv === 2 ? "&amp;" : "&middot;";
          html += `
            <div class="free-met-subdot-col" data-sub-parent="${i}" data-sub-idx="${s}">
              <span class="free-met-subdot" data-sub-parent="${i}" data-sub-idx="${s}" aria-hidden="true"></span>
              <span class="free-met-subdot-lbl">${subLbl}</span>
            </div>
          `;
        }
      }
    }
    this.freeMetDotsRow.innerHTML = html;

    this.freeMetDotsRow.querySelectorAll(".free-met-dot").forEach(btn => {
      btn.addEventListener("click", () => {
        const beatIdx = parseInt(btn.dataset.freeBeat, 10);
        this.cycleFreeBeatMode(beatIdx);
      });
    });
  }

  cycleFreeBeatMode(beatIdx) {
    const order = ["accent", "normal", "muted"];
    const cur = this.freeMetBeatModes[beatIdx] || (beatIdx === 0 ? "accent" : "normal");
    const next = cur === "secondary"
      ? "normal"
      : order[(order.indexOf(cur) + 1) % order.length];
    this.freeMetBeatModes[beatIdx] = next;

    // Sync beat mode into tabData & bottom dock beat dot
    if (this.currentExercise && this.currentExercise.tabData && this.currentExercise.tabData[0]) {
      const beatObj = this.currentExercise.tabData[0].beats[beatIdx];
      if (beatObj) {
        beatObj.type = next === "muted" ? "rest" : "metronome";
        beatObj.note = next === "muted" ? "REST" : `Beat ${beatIdx + 1}`;
      }
    }

    if (this.freeMetDotsRow) {
      const dotBtn = this.freeMetDotsRow.querySelector(`.free-met-dot[data-free-beat="${beatIdx}"]`);
      if (dotBtn) {
        dotBtn.classList.remove("mode-accent", "mode-secondary", "mode-normal", "mode-muted");
        dotBtn.classList.add(`mode-${next}`);
        const modeLabel = next.charAt(0).toUpperCase() + next.slice(1);
        dotBtn.setAttribute("aria-label", `Beat ${beatIdx + 1}: ${modeLabel}`);
        dotBtn.title = `Beat ${beatIdx + 1} (${modeLabel}) — Click to cycle Accent / Normal / Muted`;
      }
    }
    if (this.beatDotsSequence) {
      const dockDot = this.beatDotsSequence.querySelector(`.beat-dot-item[data-index="${beatIdx}"]`);
      if (dockDot) {
        dockDot.classList.toggle("configured-as-rest", next === "muted");
      }
    }
    if (this.freeMetStatusCue && !this.isPlaying) {
      const desc = next === "accent" ? "1200 Hz Accent" : (next === "muted" ? "Muted (Silent Drill)" : "800 Hz Normal Pulse");
      this.freeMetStatusCue.textContent = `Beat ${beatIdx + 1} set to ${desc}`;
    }
  }

  setBpm(newBpm) {
    this.bpm = Math.max(30, Math.min(240, Math.round(newBpm)));
    if (this.bpmDisplay) this.bpmDisplay.textContent = this.bpm;
    if (this.bookTempoBpm) this.bookTempoBpm.textContent = this.bpm;
    if (this.freeMetBpmVal) this.freeMetBpmVal.textContent = this.bpm;
    if (this.freeMetBpmSlider) this.freeMetBpmSlider.value = this.bpm;
    if (this.bpmNumberInput && document.activeElement !== this.bpmNumberInput) {
      this.bpmNumberInput.value = this.bpm;
    }
    if (this.dial) this.dial.setBpm(this.bpm);
    this.updateSpeedPresetsUI();
    this.saveState();
  }

  togglePlay() {
    if (this.isPlaying && this.isMetronomeOnlyActive && !(this.currentExercise && this.currentExercise.isMetronomeOnly)) {
      this.stop();
      this.start(false);
      return;
    }
    if (this.isPlaying) {
      this.stop();
    } else {
      this.start(false);
    }
  }

  toggleMetronome() {
    if (this.isPlaying && this.isMetronomeOnlyActive) {
      this.stop();
      return;
    }
    if (this.isPlaying) {
      this.stop();
    }
    this.start(true);
  }

  updateMetronomeButtonUI() {
    const isMetOn = Boolean(this.isPlaying && this.isMetronomeOnlyActive);
    if (this.btnMetronomeToggle) {
      this.btnMetronomeToggle.classList.toggle("active", isMetOn);
      this.btnMetronomeToggle.setAttribute("aria-pressed", isMetOn ? "true" : "false");
    }
    if (this.metronomeBtnLabel) {
      this.metronomeBtnLabel.textContent = isMetOn ? "Metronome: ON" : "Metronome";
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
      return sym === "1/8" || sym === "1/16" || sym === "3/8" || b.duration === 0.5 || b.duration === 0.25 || Math.abs((b.duration || 0) - 1.5) < 0.05;
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

  start(metronomeStandalone = false) {
    this.audio.init();
    const isFreeEx = Boolean(this.currentExercise && (this.currentExercise.id === "free-metronome" || this.currentExercise.isMetronomeOnly));
    this.isMetronomeOnlyActive = Boolean(metronomeStandalone || isFreeEx);
    this.isPlaying = true;
    this.stopAtEndTime = null;
    this.dial.setPlayState(!metronomeStandalone || isFreeEx);
    this.updateMetronomeButtonUI();
    this.requestWakeLock();

    this.currentMeasureIndex = (!this.isMetronomeOnlyActive && this.loopMode === "bar" && this.currentExercise && this.currentExercise.tabData[this.loopMeasureIndex])
      ? this.loopMeasureIndex
      : 0;
    this.currentBeatInMeasure = 0;
    this.currentSubBeatIndex = 0;
    this.currentBeatIndex = 0;
    this.currentMeasureBeatPos = 0.0;
    this.queue = [];

    const ts = this.currentExercise.timeSignature || [4, 4];
    this.isCountingIn = !this.isMetronomeOnlyActive && this.countInEnabled;
    this.countInBeat = 0;
    this.countInTotalBeats = ts[0] || 4;

    const ctx = this.audio.audioCtx;
    if (ctx && ctx.state === "running") {
      this.nextBeatTime = ctx.currentTime + 0.05;
      this._needsTimeAnchor = false;
    } else {
      this._needsTimeAnchor = true;
      this.nextBeatTime = 0;
    }

    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.scheduler();
  }

  stop() {
    this.isPlaying = false;
    this.isMetronomeOnlyActive = false;
    this.isCountingIn = false;
    this.stopAtEndTime = null;
    this._needsTimeAnchor = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.releaseWakeLock();
    if (this.audio && typeof this.audio.dampAllStrings === "function") {
      this.audio.dampAllStrings();
    }

    this.dial.setPlayState(false);
    this.dial.setRestState(false);
    this.updateMetronomeButtonUI();
    this.currentBeatInMeasure = 0;
    this.currentSubBeatIndex = 0;
    this.currentMeasureBeatPos = 0.0;

    const dots = this.beatDotsSequence.querySelectorAll(".beat-dot-item");
    dots.forEach(d => d.classList.remove("active-play", "active-rest"));

    if (this.freeMetDotsRow) {
      this.freeMetDotsRow.querySelectorAll(".free-met-dot, .free-met-subdot").forEach(d => d.classList.remove("is-active"));
      this.freeMetDotsRow.querySelectorAll(".free-met-dot-col, .free-met-subdot-col").forEach(c => c.classList.remove("is-active-col"));
    }
    if (this.freeMetStatusCue) {
      this.freeMetStatusCue.innerHTML = "Click any beat dot to cycle Accent &middot; Normal &middot; Muted";
    }

    this.fretboard.reset();
    this.tabStaff.reset();

    const firstMeasure = this.currentExercise.tabData[0];
    const firstBeat = firstMeasure.beats[0];
    this.updateCard(firstBeat, false, 1, firstMeasure.chordName);
    if (!(this.currentExercise.id === "free-metronome" || this.currentExercise.isMetronomeOnly)) {
      this.fretboard.update(firstBeat, firstBeat.type === "rest", firstMeasure.chordName);
    }
  }

  scheduler() {
    try {
      const ctx = this.audio.audioCtx;
      if (!ctx) return;

      if (ctx.state === "suspended" || ctx.state === "interrupted") {
        ctx.resume().catch(() => {});
        this._needsTimeAnchor = true;
      } else {
        const curTime = ctx.currentTime;
        const secondsPerQuarterBeat = 60.0 / this.bpm;
        const isFreeExLoop = Boolean(
          this.isMetronomeOnlyActive &&
          this.currentExercise &&
          (this.currentExercise.id === "free-metronome" || this.currentExercise.isMetronomeOnly)
        );
        const catchupStepSec = isFreeExLoop
          ? secondsPerQuarterBeat / (this.freeMetSubdivision || 1)
          : secondsPerQuarterBeat;

        if (this._needsTimeAnchor) {
          this.nextBeatTime = curTime + 0.05;
          this._needsTimeAnchor = false;
        } else if (this.nextBeatTime < curTime - catchupStepSec * 2) {
          // Phase-locked drift recovery on wake/background throttle (snaps by integer steps)
          const missedBeats = Math.ceil((curTime - this.nextBeatTime) / catchupStepSec);
          this.nextBeatTime += missedBeats * catchupStepSec;
        }

        while (this.isPlaying && !this.stopAtEndTime && this.nextBeatTime < curTime + this.scheduleAheadTime) {
          this.scheduleBeat(this.nextBeatTime);
          this.advanceBeat();
        }
      }
    } catch (e) {
      console.warn("Scheduler cycle error:", e);
      const secondsPerQuarterBeat = 60.0 / this.bpm;
      this.nextBeatTime += secondsPerQuarterBeat;
    }
    if (this.isPlaying) {
      this.timerId = setTimeout(() => this.scheduler(), this.lookahead);
    }
  }

  scheduleBeat(time) {
    const secondsPerQuarterBeat = 60.0 / this.bpm;

    // Dedicated Decoupled Percussive Metronome Loop (supports custom N-beat meters & subdivisions)
    if (this.isMetronomeOnlyActive) {
      const ts = (this.currentExercise && this.currentExercise.timeSignature) || [4, 4];
      const numBeats = ts[0] || 4;
      const b = this.currentBeatInMeasure % numBeats;
      const isFreeEx = Boolean(this.currentExercise && (this.currentExercise.id === "free-metronome" || this.currentExercise.isMetronomeOnly));
      const subdiv = isFreeEx ? (this.freeMetSubdivision || 1) : 1;
      const subBeat = this.currentSubBeatIndex % subdiv;

      const freeBeat = isFreeEx && this.currentExercise.tabData && this.currentExercise.tabData[0]
        ? this.currentExercise.tabData[0].beats[b]
        : null;
      const beatMode = isFreeEx
        ? (this.freeMetBeatModes[b] || (b === 0 ? "accent" : "normal"))
        : (b === 0 ? "accent" : "normal");
      const isBeatMuted = (beatMode === "muted") || Boolean(freeBeat && freeBeat.type === "rest");
      const isAccent = (beatMode === "accent");
      const isSecondary = (beatMode === "secondary");

      // Strictly play ONLY Web Audio percussive click — never touch guitar string synth
      // Muted beats skip playBeat completely so silence holds even when soundOnRest === "click"
      if (!isBeatMuted) {
        if (subBeat === 0) {
          this.audio.playBeat(time, beatMode, false, false);
        } else {
          this.audio.playBeat(time, "sub", false, false);
        }
      }

      this.queue.push({
        isMetronomeOnlyBeat: true,
        isFreeExPage: isFreeEx,
        mIdx: 0,
        bIdx: b,
        primaryBeat: b,
        subBeat,
        subdiv,
        beatMode: isBeatMuted ? "muted" : beatMode,
        isAccent,
        isSecondary,
        isDownbeat: subBeat === 0,
        beatData: freeBeat || {
          beat: b + 1,
          note: isAccent ? `Beat ${b + 1} (Accent)` : (isSecondary ? `Beat ${b + 1} (Secondary)` : `Beat ${b + 1}`),
          symbol: "1/4",
          type: isBeatMuted ? "rest" : "metronome",
          tip: isAccent ? "Downbeat Accent (1200 Hz Click)" : (isSecondary ? "Secondary Accent (1000 Hz Click)" : "Steady Pulse (800 Hz Click)")
        },
        chordName: null,
        isRest: isBeatMuted,
        time
      });
      return;
    }

    // 1-Bar Percussive Count-In handling before Exercise Measure 1
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

    // Determine if this primary beat starts inside a hold/rest
    let isBeatRest = false;
    if (notesInThisBeat.length > 0 && notesInThisBeat[0].startOffset <= (b + 0.05)) {
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
      // If Beat downbeat falls inside an ongoing dotted/tied hold before an upbeat (e.g. Beat 2 before 2 &)
      if (notesInThisBeat[0].startOffset > b + 0.05) {
        const carryNote = timeline.slice().reverse().find(it => it.startOffset < (b - 0.01));
        if (carryNote) {
          const carryRest = carryNote.beatData.type === "rest";
          if (carryRest && typeof this.audio.dampAllStrings === "function") {
            this.audio.dampAllStrings(time);
          }
          this.queue.push({
            mIdx: this.currentMeasureIndex,
            bIdx: carryNote.beatIndex,
            primaryBeat: b,
            isDownbeat: true,
            beatPos: b,
            beatData: carryNote.beatData,
            chordName: curMeasure.chordName,
            isRest: carryRest,
            isSustain: true,
            isTieCont: Boolean(carryNote.beatData.isTieContinuation || carryNote.beatData.tieFromPrev),
            time: time
          });
        }
      }

      notesInThisBeat.forEach(item => {
        const offsetBeats = Math.max(0, item.startOffset - b);
        const noteAudioTime = time + offsetBeats * secondsPerQuarterBeat;
        const isRest = item.beatData.type === "rest";
        const isTieCont = Boolean(item.beatData.isTieContinuation || item.beatData.tieFromPrev);
        const isSustain = item.beatData.isSustain || item.beatData.type === "sustain";

        if (isRest) {
          if (typeof this.audio.dampAllStrings === "function") {
            this.audio.dampAllStrings(noteAudioTime);
          }
        } else if (!isSustain && !isTieCont) {
          let noteDurBeats = item.beatData.duration || item.duration || 1.0;
          if (item.beatData.tieToNext) {
            const nextInBar = curMeasure.beats[item.beatIndex + 1];
            const nextBarFirst = (!nextInBar && this.currentExercise.tabData[this.currentMeasureIndex + 1])
              ? this.currentExercise.tabData[this.currentMeasureIndex + 1].beats[0]
              : null;
            const tiedTarget = nextInBar || nextBarFirst;
            if (tiedTarget && (tiedTarget.tieFromPrev || tiedTarget.isTieContinuation || tiedTarget.isSustain)) {
              noteDurBeats += (tiedTarget.duration || 1.0);
            }
          }
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
          isTieCont: isTieCont,
          time: noteAudioTime
        });
      });
    } else {
      // Multi-beat note ringing across this beat (or sustaining rest silence)
      const ringingNote = timeline.slice().reverse().find(it => it.startOffset <= (b + 0.01));
      const isRest = ringingNote ? (ringingNote.beatData.type === "rest") : false;
      if (isRest && typeof this.audio.dampAllStrings === "function") {
        this.audio.dampAllStrings(time);
      }
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
        isTieCont: ringingNote ? Boolean(ringingNote.beatData.isTieContinuation || ringingNote.beatData.tieFromPrev) : false,
        time: time
      });
    }
  }

  advanceBeat() {
    const secondsPerQuarterBeat = 60.0 / this.bpm;

    if (this.isMetronomeOnlyActive) {
      const ts = (this.currentExercise && this.currentExercise.timeSignature) || [4, 4];
      const numBeats = ts[0] || 4;
      const isFreeEx = Boolean(this.currentExercise && (this.currentExercise.id === "free-metronome" || this.currentExercise.isMetronomeOnly));
      const subdiv = isFreeEx ? (this.freeMetSubdivision || 1) : 1;
      const stepSeconds = secondsPerQuarterBeat / subdiv;

      this.currentSubBeatIndex++;
      if (this.currentSubBeatIndex >= subdiv) {
        this.currentSubBeatIndex = 0;
        this.currentBeatInMeasure = (this.currentBeatInMeasure + 1) % numBeats;
      }
      this.nextBeatTime += stepSeconds;
      return;
    }

    if (this.isCountingIn) {
      this.countInBeat++;
      if (this.countInBeat >= this.countInTotalBeats) {
        this.isCountingIn = false;
        this.currentMeasureIndex = (this.loopMode === "bar" && this.currentExercise && this.currentExercise.tabData[this.loopMeasureIndex])
          ? this.loopMeasureIndex
          : 0;
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
      if (this.loopMode === "bar") {
        this.currentMeasureIndex = Math.min(this.loopMeasureIndex, this.currentExercise.tabData.length - 1);
      } else {
        this.currentMeasureIndex++;

        if (this.currentMeasureIndex >= this.currentExercise.tabData.length) {
          if (this.loopMode === "once") {
            this.stopAtEndTime = this.nextBeatTime + secondsPerQuarterBeat;
            return;
          }
          this.currentMeasureIndex = 0; // Loop
        }
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

    if (this.stopAtEndTime && currentTime >= this.stopAtEndTime && this.queue.length === 0) {
      this.stop();
    }
  }

  updateBeatVisuals(ev) {
    if (ev.isCountIn) {
      this.noteActiveCard.className = "telemetry-inline mode-play";
      this.noteGlyphLarge.innerHTML = `<span style="font-family:var(--font-mono);font-size:15px;font-weight:700;color:var(--accent);">${ev.countInBeat}</span>`;
      this.noteHeaderBig.textContent = `Count-In ${ev.countInBeat} / ${this.countInTotalBeats}`;
      this.noteSubInstruction.textContent = "Prepare hands for Beat 1";
      this.noteRightGuidance.textContent = "COUNT-IN";

      const dots = this.beatDotsSequence.querySelectorAll(".beat-dot-item");
      dots.forEach((d, idx) => {
        d.classList.toggle("active-play", idx === (ev.countInBeat - 1));
        d.classList.remove("active-rest");
      });
      return;
    }

    if (ev.isMetronomeOnlyBeat) {
      const { primaryBeat, subBeat = 0, subdiv = 1, isFreeExPage, isRest, isAccent, isSecondary, beatMode } = ev;
      const dots = this.beatDotsSequence.querySelectorAll(".beat-dot-item");
      dots.forEach((d, idx) => {
        if (idx === primaryBeat) {
          d.classList.toggle("active-rest", isRest);
          d.classList.toggle("active-play", !isRest);
        } else {
          d.classList.remove("active-play", "active-rest");
        }
      });

      if (this.freeMetDotsRow && isFreeExPage) {
        this.freeMetDotsRow.querySelectorAll(".free-met-dot-col").forEach((col, idx) => {
          const isCurMain = idx === primaryBeat && subBeat === 0;
          col.classList.toggle("is-active-col", isCurMain);
          const dotBtn = col.querySelector(".free-met-dot");
          if (dotBtn) {
            dotBtn.classList.toggle("is-active", isCurMain);
          }
        });
        this.freeMetDotsRow.querySelectorAll(".free-met-subdot-col").forEach(col => {
          const isCurSub = subBeat > 0 &&
            Number(col.dataset.subParent) === primaryBeat &&
            Number(col.dataset.subIdx) === subBeat;
          col.classList.toggle("is-active-col", isCurSub);
          const subDot = col.querySelector(".free-met-subdot");
          if (subDot) {
            subDot.classList.toggle("is-active", isCurSub);
          }
        });
      }

      const subLabel = subdiv === 2 ? "&" : `Triplet ${subBeat + 1}/3`;
      if (this.freeMetStatusCue && isFreeExPage) {
        if (isRest || beatMode === "muted") {
          this.freeMetStatusCue.textContent = subBeat > 0
            ? `Beat ${primaryBeat + 1} (${subLabel}) · Muted (Silent Timing Drill)`
            : `Beat ${primaryBeat + 1} · Muted (Silent Timing Drill)`;
        } else if (subBeat > 0) {
          this.freeMetStatusCue.textContent = `Beat ${primaryBeat + 1} ${subLabel} · 660 Hz Subdivision`;
        } else if (isAccent || beatMode === "accent") {
          this.freeMetStatusCue.textContent = `Beat ${primaryBeat + 1} · 1200 Hz Accent`;
        } else if (isSecondary || beatMode === "secondary") {
          this.freeMetStatusCue.textContent = `Beat ${primaryBeat + 1} · 1000 Hz Secondary Accent`;
        } else {
          this.freeMetStatusCue.textContent = `Beat ${primaryBeat + 1} · 800 Hz Pulse`;
        }
      }

      this.noteActiveCard.className = `telemetry-inline ${isRest ? "mode-rest" : "mode-play"}`;
      this.noteGlyphLarge.innerHTML = this.getGlyphSvg(subBeat > 0 ? "1/8" : "1/4", 1, isRest);
      if (isRest) {
        this.noteHeaderBig.textContent = `Beat ${primaryBeat + 1}: Muted`;
        this.noteSubInstruction.textContent = "Click beat dot to unmute";
        this.noteRightGuidance.textContent = "MUTED";
      } else if (subBeat > 0) {
        this.noteHeaderBig.textContent = `Beat ${primaryBeat + 1} ${subLabel}`;
        this.noteSubInstruction.textContent = "660 Hz Subdivision Click";
        this.noteRightGuidance.textContent = "660 Hz";
      } else if (isAccent) {
        this.noteHeaderBig.textContent = `Beat ${primaryBeat + 1}: Accent`;
        this.noteSubInstruction.textContent = "1200 Hz Percussive Click";
        this.noteRightGuidance.textContent = "1200 Hz";
      } else if (isSecondary) {
        this.noteHeaderBig.textContent = `Beat ${primaryBeat + 1}: Secondary`;
        this.noteSubInstruction.textContent = "1000 Hz Secondary Click";
        this.noteRightGuidance.textContent = "1000 Hz";
      } else {
        this.noteHeaderBig.textContent = `Beat ${primaryBeat + 1}: Pulse`;
        this.noteSubInstruction.textContent = "800 Hz Percussive Click";
        this.noteRightGuidance.textContent = "800 Hz";
      }
      return;
    }

    const { mIdx, bIdx, primaryBeat, isDownbeat, beatData, chordName, isRest } = ev;

    // 1. Update Dial / Transport Color
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
    this.updateCard(beatData, isRest, beatLabel, chordName, ev);

    // 4. Update Fretboard
    this.fretboard.update(beatData, isRest, chordName);

    // 5. Update Tab Staff Playhead Cursor + Live Action Coach Pill
    const coachMeta = this.buildLiveCoachMeta(ev);
    this.tabStaff.highlightBeat(mIdx, bIdx, isRest, coachMeta);
  }

  renderBookTempoGlyph() {
    if (!this.bookTempoGlyph || typeof ScoreRenderer === "undefined" || !ScoreRenderer.renderInlineBravuraNote) {
      return;
    }
    ScoreRenderer.renderInlineBravuraNote(this.bookTempoGlyph, {
      sym: "1/4",
      dur: 1,
      isRest: false,
      color: "#18181B",
      width: 22,
      height: 24
    });
  }

  // Real VexFlow Bravura glyphs for the Studio Feedback Card (cached per symbol/state)
  getGlyphSvg(sym, dur, isRest) {
    const color = isRest ? "#DC2626" : "#C2410C";
    const cacheKey = `${sym || "1/4"}|${dur || 1}|${isRest ? 1 : 0}|${color}`;
    if (this._glyphCache && this._glyphCache.has(cacheKey)) {
      return this._glyphCache.get(cacheKey);
    }
    if (typeof ScoreRenderer !== "undefined" && ScoreRenderer.renderInlineBravuraNote) {
      const tmp = document.createElement("span");
      ScoreRenderer.renderInlineBravuraNote(tmp, {
        sym,
        dur,
        isRest,
        color,
        width: 34,
        height: 30
      });
      const svgMarkup = tmp.innerHTML;
      if (svgMarkup && this._glyphCache) {
        this._glyphCache.set(cacheKey, svgMarkup);
      }
      return svgMarkup;
    }
    return isRest ? "<span>REST</span>" : "<span>NOTE</span>";
  }

  updateCard(beatData, isRest, beatNumber, chordName = null, ev = null) {
    if (!beatData) return;
    const dur = beatData.duration || 1;
    const sym = (beatData.symbol || "1/4").toLowerCase();

    if (isRest) {
      this.noteActiveCard.className = "telemetry-inline mode-rest";
      this.noteGlyphLarge.innerHTML = this.getGlyphSvg(sym, dur, true);
      this.noteHeaderBig.textContent = `Beat ${beatNumber}: Rest`;
      this.noteSubInstruction.textContent = beatData.tip || "Silence strings cleanly";
      this.noteRightGuidance.textContent = "DAMP";
    } else {
      this.noteActiveCard.className = "telemetry-inline mode-play";
      this.noteGlyphLarge.innerHTML = this.getGlyphSvg(sym, dur, false);

      if (beatData.type === "metronome") {
        this.noteHeaderBig.textContent = beatNumber === 1 ? "Beat 1: Downbeat Accent" : `Beat ${beatNumber}: Metronome Pulse`;
        this.noteSubInstruction.textContent = beatNumber === 1 ? "1200 Hz Percussive Click" : "800 Hz Percussive Click";
        this.noteRightGuidance.textContent = beatNumber === 1 ? "1200 Hz" : "800 Hz";
        return;
      }

      const isTieCont = Boolean((ev && ev.isTieCont) || beatData.isTieContinuation || beatData.tieFromPrev);
      const isSustain = isTieCont || Boolean((ev && ev.isSustain) || beatData.isSustain || beatData.type === "sustain");
      const isSingleNoteMelody = typeof beatData.string === "number";

      if (isSingleNoteMelody) {
        const noteName = beatData.note || "NOTE";
        const chordSuffix = chordName ? ` [${chordName}]` : "";
        const holdTag = isTieCont ? " (Tied Hold)" : (isSustain ? " (Hold)" : "");
        this.noteHeaderBig.textContent = `Beat ${beatNumber}: ${noteName}${chordSuffix}${holdTag}`;

        const s = beatData.string ? `String ${beatData.string}` : null;
        const f = (beatData.fret !== null && beatData.fret !== undefined) ? `Fret ${beatData.fret}` : null;
        const fin = (beatData.finger !== null && beatData.finger !== undefined) ? `Finger ${beatData.finger}` : null;
        this.noteSubInstruction.textContent = isTieCont
          ? `Keep holding ${[s, f].filter(Boolean).join(" • ")} across Beat ${beatNumber}`
          : ([s, f, fin].filter(Boolean).join(" • ") || (beatData.tip || "Play cleanly"));
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
      } else if (isTieCont) {
        this.noteRightGuidance.textContent = "TIED · HOLD";
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
      appMode: this.appMode || "primer",
      paneMode: this.paneMode || "score",
      drawerOpen: !!this.drawerOpen,
      loopMode: this.loopMode || "all",
      book: this.currentBookCategory,
      exId: this.currentExercise ? this.currentExercise.id : "lb-s2-str1-ex1",
      bpm: this.bpm,
      soundType: this.audio.soundType,
      soundOnRest: this.audio.soundOnRest,
      guitarTone: this.audio.guitarToneEnabled,
      countIn: this.countInEnabled,
      noteNameMode: this.noteNameMode,
      tabVisibilityMode: this.tabVisibilityMode,
      showRhythmGuide: this.showRhythmGuide,
      showCoachBanner: this.showCoachBanner,
      freeMetTs: this.freeMetTimeSignature,
      freeMetSubdiv: this.freeMetSubdivision
    };

    try {
      localStorage.setItem("guitar_master_app_state", JSON.stringify(state));
      const hashStr = `mode=${state.appMode}&pane=${state.paneMode}&book=${state.book}&exId=${state.exId}`;
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
      appMode: "primer",
      paneMode: "score",
      drawerOpen: window.innerWidth > 1024,
      loopMode: "all",
      book: "lessonBook",
      exId: "lb-s2-str1-ex1",
      bpm: 60,
      soundType: "woodblock",
      soundOnRest: "click",
      guitarTone: true,
      countIn: false,
      noteNameMode: "above",
      tabVisibilityMode: "both",
      showRhythmGuide: true,
      showCoachBanner: true,
      ...(savedLocal || {})
    };

    if (!savedLocal || !savedLocal.appMode) {
      state.appMode = "primer";
    }

    if (window.location.hash && window.location.hash.length > 1) {
      const params = new URLSearchParams(window.location.hash.substring(1));
      const paramMode = params.get("mode");
      if (paramMode || params.get("pane") || params.get("view") || params.get("book") || params.get("exId")) {
        state = {
          ...state,
          appMode: paramMode || (params.get("exId") || params.get("pane") ? "studio" : state.appMode),
          paneMode: params.get("pane") || state.paneMode,
          book: params.get("book") || state.book,
          exId: params.get("exId") || state.exId
        };
      }
    }

    this.isRestoring = true;

    if (["off", "above", "inside"].includes(state.noteNameMode)) {
      this.noteNameMode = state.noteNameMode;
      this.showNoteNames = state.noteNameMode !== "off";
    }
    if (["both", "staff-only", "blur"].includes(state.tabVisibilityMode)) {
      this.tabVisibilityMode = state.tabVisibilityMode;
      this.showTabNumbers = state.tabVisibilityMode !== "staff-only";
    }
    if (typeof state.showRhythmGuide === "boolean") {
      this.showRhythmGuide = state.showRhythmGuide;
    }
    if (typeof state.showCoachBanner === "boolean") {
      this.showCoachBanner = state.showCoachBanner;
    }
    this.syncTutorToolbarUI();

    if (state.soundType && this.selectSound) {
      const normalizedSound = state.soundType === "beep" ? "click" : state.soundType;
      const hasOpt = Array.from(this.selectSound.options).some(o => o.value === normalizedSound);
      const finalSound = hasOpt ? normalizedSound : "woodblock";
      this.selectSound.value = finalSound;
      this.audio.setSoundType(finalSound);
    }
    const restSoundVal = state.soundOnRest || "click";
    if (this.selectRestSound) {
      this.selectRestSound.value = restSoundVal;
      this.audio.setRestSoundType(restSoundVal);
    }
    if (typeof state.countIn === "boolean" && this.toggleCountIn) {
      this.countInEnabled = state.countIn;
      this.toggleCountIn.checked = state.countIn;
    }
    if (typeof state.guitarTone === "boolean") {
      this.audio.setGuitarTone(state.guitarTone);
      if (this.toggleGuitarTone) this.toggleGuitarTone.checked = state.guitarTone;
    }

    if (state.loopMode && ["all", "bar", "once"].includes(state.loopMode)) {
      this.loopMode = state.loopMode;
    }

    const validBooks = ["lessonBook", "bonusWorkshop", "freeMetronome", "freeMode"];
    if (!validBooks.includes(state.book)) {
      state.book = "lessonBook";
    }
    if (state.book === "freeMode") state.book = "freeMetronome";
    const validPanes = ["score", "pdf", "split"];
    if (!validPanes.includes(state.paneMode)) {
      state.paneMode = "score";
    }
    const validModes = ["primer", "studio"];
    if (!validModes.includes(state.appMode)) {
      state.appMode = "primer";
    }

    const validTs = ["2/4", "3/4", "4/4", "5/4", "6/8"];
    if (state.freeMetTs && validTs.includes(state.freeMetTs)) {
      this.freeMetTimeSignature = state.freeMetTs;
      const cfg = this.getFreeMetTimeSignatureConfig(this.freeMetTimeSignature);
      this.freeMetBeatModes = [...cfg.modes];
    }
    const validSubdiv = [1, 2, 3];
    if (state.freeMetSubdiv && validSubdiv.includes(Number(state.freeMetSubdiv))) {
      this.freeMetSubdivision = Number(state.freeMetSubdiv);
    }

    const initialDrawerOpen = window.innerWidth <= 1024
      ? false
      : (typeof state.drawerOpen === "boolean" ? state.drawerOpen : true);
    this.setDrawerOpen(initialDrawerOpen);
    this.setBookCategory(state.book || "lessonBook");

    this.loadExercise(state.exId || "lb-s2-str1-ex1", true);

    if (state.bpm) {
      this.setBpm(state.bpm);
    }

    this.setPaneMode(state.paneMode || "score");
    this.setAppMode(state.appMode || "primer");
    this.updateLoopModeUI();
    this.isRestoring = false;
  }

  setBookCategory(cat) {
    this.currentBookCategory = cat;
    this.syncBookTabsUI();
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
    // Zone 1: Top Bar Controls & Primary App Mode Switch
    if (this.appModeTabs) {
      this.appModeTabs.querySelectorAll(".seg-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          this.setAppMode(btn.dataset.appMode);
        });
      });
    }

    if (this.btnToggleDrawer) {
      this.btnToggleDrawer.addEventListener("click", () => {
        this.setDrawerOpen(!this.drawerOpen);
      });
    }

    if (this.btnMobileMenu) {
      this.btnMobileMenu.addEventListener("click", () => {
        if (this.appMode !== "studio") {
          this.setAppMode("studio");
          this.setDrawerOpen(true);
        } else {
          this.setDrawerOpen(!this.drawerOpen);
        }
      });
    }

    if (this.drawerBackdrop) {
      this.drawerBackdrop.addEventListener("click", () => {
        this.setDrawerOpen(false);
      });
    }

    if (this.workspaceViewTabs) {
      this.workspaceViewTabs.querySelectorAll(".seg-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          this.setPaneMode(btn.dataset.pane);
        });
      });
    }

    if (this.btnToggleGuide && this.studioGuidePanel) {
      this.btnToggleGuide.addEventListener("click", () => {
        const willShow = this.studioGuidePanel.hasAttribute("hidden");
        if (willShow) {
          this.studioGuidePanel.removeAttribute("hidden");
        } else {
          this.studioGuidePanel.setAttribute("hidden", "");
        }
        this.btnToggleGuide.classList.toggle("active", willShow);
      });
    }

    if (this.btnCloseGuide && this.studioGuidePanel) {
      this.btnCloseGuide.addEventListener("click", () => {
        this.studioGuidePanel.setAttribute("hidden", "");
        if (this.btnToggleGuide) this.btnToggleGuide.classList.remove("active");
      });
    }

    // Zone 2: Left Drawer Book Tabs & Search
    if (this.choiceLessonBook) {
      this.choiceLessonBook.addEventListener("click", () => this.setBookCategory("lessonBook"));
    }
    if (this.choiceWorkshopBook) {
      this.choiceWorkshopBook.addEventListener("click", () => this.setBookCategory("bonusWorkshop"));
    }
    if (this.choiceFreeMode) {
      this.choiceFreeMode.addEventListener("click", () => {
        this.setBookCategory("freeMetronome");
        this.loadExercise("free-metronome");
        if (window.innerWidth <= 1024) {
          this.setDrawerOpen(false);
        }
      });
    }

    if (this.catalogSearchInput) {
      this.catalogSearchInput.addEventListener("input", (e) => {
        this.renderCourseBookCatalog(e.target.value);
      });
    }

    // Zone 3: PDF Controls
    if (this.btnPdfLesson) {
      this.btnPdfLesson.addEventListener("click", () => {
        this.pdfBookCategory = "lessonBook";
        this.btnPdfLesson.classList.add("active");
        if (this.btnPdfWorkshop) this.btnPdfWorkshop.classList.remove("active");
        this.loadPdfFrame();
      });
    }
    if (this.btnPdfWorkshop) {
      this.btnPdfWorkshop.addEventListener("click", () => {
        this.pdfBookCategory = "bonusWorkshop";
        this.btnPdfWorkshop.classList.add("active");
        if (this.btnPdfLesson) this.btnPdfLesson.classList.remove("active");
        this.loadPdfFrame();
      });
    }
    if (this.pdfPageInput) {
      this.pdfPageInput.addEventListener("change", () => {
        this.pdfCurrentPage = Math.max(1, parseInt(this.pdfPageInput.value, 10) || 1);
        this.loadPdfFrame();
      });
    }
    if (this.btnPdfSync) {
      this.btnPdfSync.addEventListener("click", () => {
        if (this.currentExercise) this.syncPdfToExercise(this.currentExercise);
      });
    }
    if (this.btnPdfPrevPage) {
      this.btnPdfPrevPage.addEventListener("click", () => {
        this.pdfCurrentPage = Math.max(1, (parseInt(this.pdfCurrentPage, 10) || 1) - 1);
        if (this.pdfPageInput) this.pdfPageInput.value = this.pdfCurrentPage;
        this.loadPdfFrame();
      });
    }
    if (this.btnPdfNextPage) {
      this.btnPdfNextPage.addEventListener("click", () => {
        this.pdfCurrentPage = (parseInt(this.pdfCurrentPage, 10) || 1) + 1;
        if (this.pdfPageInput) this.pdfPageInput.value = this.pdfCurrentPage;
        this.loadPdfFrame();
      });
    }

    // PDF AI OMR Extractor Controls
    if (this.btnGeminiApiKey && this.geminiKeyBar) {
      this.btnGeminiApiKey.addEventListener("click", () => {
        const nextHidden = !this.geminiKeyBar.hidden;
        this.geminiKeyBar.hidden = nextHidden;
        if (!nextHidden) {
          if (this.pdfBatchBar) this.pdfBatchBar.hidden = true;
          this.syncGeminiKeyUI();
          if (this.geminiApiKeyInput) this.geminiApiKeyInput.focus();
        }
      });
    }
    if (this.btnCloseGeminiKey && this.geminiKeyBar) {
      this.btnCloseGeminiKey.addEventListener("click", () => {
        this.geminiKeyBar.hidden = true;
      });
    }
    if (this.btnSaveGeminiKey) {
      this.btnSaveGeminiKey.addEventListener("click", () => {
        const val = this.geminiApiKeyInput ? this.geminiApiKeyInput.value : "";
        const saved = this.pdfAiExtractor.saveApiKey(val);
        if (this.geminiModelSelect) {
          this.pdfAiExtractor.saveModelPreference(this.geminiModelSelect.value);
        }
        this.syncGeminiKeyUI();
        if (saved) {
          if (this.geminiKeyBar) this.geminiKeyBar.hidden = true;
          this.setAiExtractStatus(
            `Gemini API Key & model (${this.pdfAiExtractor.getModelPreference()}) saved in localStorage.`,
            "success",
            null
          );
        } else {
          this.setAiExtractStatus("API Key cleared.", "info", null);
        }
      });
    }
    if (this.geminiModelSelect) {
      this.geminiModelSelect.addEventListener("change", () => {
        const chosen = this.pdfAiExtractor.saveModelPreference(this.geminiModelSelect.value);
        this.setAiExtractStatus(`Gemini model set to: ${chosen}`, "info", null);
      });
    }
    if (this.btnClearGeminiKey) {
      this.btnClearGeminiKey.addEventListener("click", () => {
        this.pdfAiExtractor.saveApiKey("");
        if (this.geminiApiKeyInput) this.geminiApiKeyInput.value = "";
        this.syncGeminiKeyUI();
        this.setAiExtractStatus("Gemini API Key removed.", "info");
      });
    }
    if (this.btnExtractPdfPage) {
      this.btnExtractPdfPage.addEventListener("click", () => {
        this.extractCurrentPdfPage();
      });
    }
    if (this.btnBatchExtractToggle && this.pdfBatchBar) {
      this.btnBatchExtractToggle.addEventListener("click", () => {
        const nextHidden = !this.pdfBatchBar.hidden;
        this.pdfBatchBar.hidden = nextHidden;
        if (!nextHidden) {
          if (this.geminiKeyBar) this.geminiKeyBar.hidden = true;
          const cur = (this.pdfPageInput && parseInt(this.pdfPageInput.value, 10)) || this.pdfCurrentPage || 1;
          if (this.batchFromPageInput) this.batchFromPageInput.value = cur;
          if (this.batchToPageInput) this.batchToPageInput.value = cur + 4;
        }
      });
    }
    if (this.btnCloseBatchExtract && this.pdfBatchBar) {
      this.btnCloseBatchExtract.addEventListener("click", () => {
        this.pdfBatchBar.hidden = true;
      });
    }
    if (this.btnStartBatchExtract) {
      this.btnStartBatchExtract.addEventListener("click", () => {
        this.runBatchPdfExtract();
      });
    }
    if (this.btnCancelBatchExtract) {
      this.btnCancelBatchExtract.addEventListener("click", () => {
        this.pdfAiExtractor._batchCancelled = true;
        this.setAiExtractStatus("Stopping batch after current page...", "warn");
      });
    }
    if (this.btnExportCurriculumJson) {
      this.btnExportCurriculumJson.addEventListener("click", () => {
        this.exportCurriculumJson();
      });
    }
    if (this.btnClearAiPages) {
      this.btnClearAiPages.addEventListener("click", () => {
        this.clearAiExtractedData();
      });
    }
    if (this.btnDismissAiStatus && this.aiExtractStatusBar) {
      this.btnDismissAiStatus.addEventListener("click", () => {
        this.aiExtractStatusBar.hidden = true;
      });
    }

    if (this.btnDockMobileSettings && this.transportDock) {
      this.btnDockMobileSettings.addEventListener("click", (e) => {
        e.stopPropagation();
        const isOpen = this.transportDock.classList.toggle("mobile-settings-open");
        this.btnDockMobileSettings.setAttribute("aria-expanded", isOpen ? "true" : "false");
      });
      document.addEventListener("click", (e) => {
        if (
          this.transportDock.classList.contains("mobile-settings-open") &&
          !this.transportDock.contains(e.target)
        ) {
          this.transportDock.classList.remove("mobile-settings-open");
          this.btnDockMobileSettings.setAttribute("aria-expanded", "false");
        }
      });
    }

    this._lastIsNarrowDrawer = window.innerWidth <= 1024;
    this._lastPdfRenderWidth = window.innerWidth;
    let resizeSyncTimer = null;
    window.addEventListener("resize", () => {
      clearTimeout(resizeSyncTimer);
      resizeSyncTimer = setTimeout(() => {
        const activeTag = document.activeElement ? document.activeElement.tagName : "";
        const isTypingInput = /^(INPUT|TEXTAREA|SELECT)$/.test(activeTag);
        if (!isTypingInput) {
          const isCompact = this.isCompactFretboardViewport();
          if (isCompact !== this._lastCompactViewport) {
            this._lastCompactViewport = isCompact;
            this.fretboardVisible = !isCompact;
          }
          this.syncFretboardVisibilityUI();

          const isNarrow = window.innerWidth <= 1024;
          if (isNarrow && !this._lastIsNarrowDrawer && this.drawerOpen) {
            this.setDrawerOpen(false);
          }
          this._lastIsNarrowDrawer = isNarrow;
        }
        if (
          (this.paneMode === "pdf" || this.paneMode === "split") &&
          this.isMobileOrTouchPdfDevice() &&
          Math.abs(window.innerWidth - this._lastPdfRenderWidth) > 24
        ) {
          this._lastPdfRenderWidth = window.innerWidth;
          this.loadPdfFrame();
        }
      }, 120);
    });

    const handleLocalPdfFile = (file) => {
      if (!file) return;
      const objUrl = URL.createObjectURL(file);
      this.customPdfUrls[this.pdfBookCategory] = objUrl;
      this.loadPdfFrame();
    };
    if (this.pdfFileInput) {
      this.pdfFileInput.addEventListener("change", (e) => handleLocalPdfFile(e.target.files[0]));
    }
    if (this.pdfFileInputFallback) {
      this.pdfFileInputFallback.addEventListener("change", (e) => handleLocalPdfFile(e.target.files[0]));
    }

    // Lifecycle Cleanup
    window.addEventListener("pagehide", () => {
      if (this.isPlaying) this.stop();
    });
    window.addEventListener("beforeunload", () => {
      if (this.isPlaying) this.stop();
    });

    // Prev / Next Exercise
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

    // Zone 4: Transport Dock Controls
    if (this.btnPlayToggle) {
      this.btnPlayToggle.addEventListener("click", () => this.togglePlay());
    }
    if (this.btnMetronomeToggle) {
      this.btnMetronomeToggle.addEventListener("click", () => this.toggleMetronome());
    }

    if (this.btnLoopMode) {
      this.btnLoopMode.addEventListener("click", () => this.cycleLoopMode());
    }

    if (this.btnBpmMinus) {
      this.btnBpmMinus.addEventListener("click", () => this.setBpm(this.bpm - 1));
    }
    if (this.btnBpmPlus) {
      this.btnBpmPlus.addEventListener("click", () => this.setBpm(this.bpm + 1));
    }
    if (this.freeMetBpmMinus5) {
      this.freeMetBpmMinus5.addEventListener("click", () => this.setBpm(this.bpm - 5));
    }
    if (this.freeMetBpmMinus) {
      this.freeMetBpmMinus.addEventListener("click", () => this.setBpm(this.bpm - 1));
    }
    if (this.freeMetBpmPlus) {
      this.freeMetBpmPlus.addEventListener("click", () => this.setBpm(this.bpm + 1));
    }
    if (this.freeMetBpmPlus5) {
      this.freeMetBpmPlus5.addEventListener("click", () => this.setBpm(this.bpm + 5));
    }
    if (this.freeMetBpmSlider) {
      this.freeMetBpmSlider.addEventListener("input", () => {
        const val = parseInt(this.freeMetBpmSlider.value, 10);
        if (!isNaN(val)) this.setBpm(val);
      });
    }
    if (this.freeMetTapBtn) {
      this.freeMetTapBtn.addEventListener("click", () => this.handleTapTempo());
    }
    if (this.freeMetTimesigGroup) {
      this.freeMetTimesigGroup.querySelectorAll("[data-ts]").forEach(btn => {
        btn.addEventListener("click", () => this.setFreeTimeSignature(btn.dataset.ts));
      });
    }
    if (this.freeMetSubdivGroup) {
      this.freeMetSubdivGroup.querySelectorAll("[data-subdiv]").forEach(btn => {
        btn.addEventListener("click", () => this.setFreeSubdivision(btn.dataset.subdiv));
      });
    }
    if (this.timePillBadge) {
      this.timePillBadge.addEventListener("click", () => {
        const isFreeMet = Boolean(
          this.currentExercise &&
          (this.currentExercise.bookCategory === "freeMetronome" ||
            this.currentExercise.id === "free-metronome" ||
            this.currentExercise.isMetronomeOnly)
        );
        if (!isFreeMet) return;
        const order = ["2/4", "3/4", "4/4", "5/4", "6/8"];
        const idx = order.indexOf(this.freeMetTimeSignature);
        const nextTs = order[(idx + 1) % order.length];
        this.setFreeTimeSignature(nextTs);
      });
    }
    if (this.bpmNumberInput) {
      this.bpmNumberInput.addEventListener("change", () => {
        const val = parseInt(this.bpmNumberInput.value, 10);
        if (!isNaN(val)) {
          this.setBpm(val);
        } else {
          this.bpmNumberInput.value = this.bpm;
        }
      });
      this.bpmNumberInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          this.bpmNumberInput.blur();
        }
      });
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
      this.toggleCountIn.addEventListener("change", (e) => {
        this.countInEnabled = e.target.checked;
        this.saveState();
      });
    }

    // Keyboard shortcuts (active only inside Curriculum Studio)
    window.addEventListener("keydown", (e) => {
      if (this.appMode !== "studio") return;
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
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        if (this.btnNextExercise) this.btnNextExercise.click();
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        if (this.btnPrevExercise) this.btnPrevExercise.click();
      } else if (e.key === "b" || e.key === "B" || e.key === "\\") {
        e.preventDefault();
        this.setDrawerOpen(!this.drawerOpen);
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
