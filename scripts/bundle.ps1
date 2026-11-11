$ErrorActionPreference = "Stop"
$root = if ($PSScriptRoot) { Split-Path -Parent $PSScriptRoot } else { "C:\Users\govin\.gemini\antigravity\scratch\guitar-master-metronome" }
$artifactFile = "C:\Users\govin\.gemini\antigravity\brain\8def1509-2011-4df8-b8fc-420615ecf64f\guitar_metronome_companion.html"

Write-Host "--- Starting Bundle Compilation ---" -ForegroundColor Cyan

$requiredFiles = @(
    "style.css",
    "exercises.js",
    "src\vendor\vexflow.min.js",
    "src\data\curriculumExercises.js",
    "src\components\ScoreRenderer.js",
    "audio.js",
    "dial.js",
    "fretboard.js",
    "src\data\primerCatalog.js",
    "src\components\FoundationsPrimer.js",
    "app.js"
)
foreach ($f in $requiredFiles) {
    $fullPath = Join-Path $root $f
    if (-not (Test-Path $fullPath)) {
        throw "Required file missing: $fullPath"
    }
}

Write-Host "Reading style.css..."
$css = [System.IO.File]::ReadAllText((Join-Path $root "style.css"), [System.Text.Encoding]::UTF8)

Write-Host "Reading VexFlow library..."
$vexflowJs = [System.IO.File]::ReadAllText((Join-Path $root "src\vendor\vexflow.min.js"), [System.Text.Encoding]::UTF8)
$vexflowJs = $vexflowJs -replace "</script>", "<\/script>"

Write-Host "Reading exercises.js..."
$exercisesJs = [System.IO.File]::ReadAllText((Join-Path $root "exercises.js"), [System.Text.Encoding]::UTF8)
$exercisesJs = $exercisesJs -replace "export\s+const\s+GUITAR_COURSES", "const GUITAR_COURSES"

Write-Host "Reading src/data/curriculumExercises.js..."
$curriculumJs = [System.IO.File]::ReadAllText((Join-Path $root "src\data\curriculumExercises.js"), [System.Text.Encoding]::UTF8)
$curriculumJs = $curriculumJs -replace "export\s+(const|function|class)\s+", '$1 '

Write-Host "Reading src/components/ScoreRenderer.js..."
$scoreRendererJs = [System.IO.File]::ReadAllText((Join-Path $root "src\components\ScoreRenderer.js"), [System.Text.Encoding]::UTF8)
$scoreRendererJs = $scoreRendererJs -replace "export\s+(const|function|class)\s+", '$1 '

Write-Host "Reading audio.js..."
$audioJs = [System.IO.File]::ReadAllText((Join-Path $root "audio.js"), [System.Text.Encoding]::UTF8)
$audioJs = $audioJs -replace "export\s+class\s+MetronomeAudioEngine", "class MetronomeAudioEngine"

Write-Host "Reading dial.js..."
$dialJs = [System.IO.File]::ReadAllText((Join-Path $root "dial.js"), [System.Text.Encoding]::UTF8)
$dialJs = $dialJs -replace "export\s+class\s+GuitarSpeedDial", "class GuitarSpeedDial"

Write-Host "Reading fretboard.js..."
$fretboardJs = [System.IO.File]::ReadAllText((Join-Path $root "fretboard.js"), [System.Text.Encoding]::UTF8)
$fretboardJs = $fretboardJs -replace "export\s+class\s+FretboardVisualizer", "class FretboardVisualizer"

Write-Host "Reading src/data/primerCatalog.js..."
$primerCatalogJs = [System.IO.File]::ReadAllText((Join-Path $root "src\data\primerCatalog.js"), [System.Text.Encoding]::UTF8)
$primerCatalogJs = $primerCatalogJs -replace "export\s+(const|function|class)\s+", '$1 '

Write-Host "Reading src/components/FoundationsPrimer.js..."
$primerJs = [System.IO.File]::ReadAllText((Join-Path $root "src\components\FoundationsPrimer.js"), [System.Text.Encoding]::UTF8)
$primerJs = $primerJs -replace 'import\s*\{[^}]+\}\s*from\s*["''][^"'']+["''];?', ''
$primerJs = $primerJs -replace "export\s+(const|function|class)\s+", '$1 '

Write-Host "Reading app.js..."
$appJs = [System.IO.File]::ReadAllText((Join-Path $root "app.js"), [System.Text.Encoding]::UTF8)
$appJs = $appJs -replace 'import\s*\{[^}]+\}\s*from\s*["''][^"'']+["''];?', ''
$appJs = $appJs -replace "export\s+class\s+GuitarMasterApp", "class GuitarMasterApp"
$appJs = $appJs -replace '(?s)// Auto-boot.*', ''
$appJs = $appJs -replace '(?s)if\s*\(\s*typeof window !== "undefined"\s*\)[\s\S]*', ''

$htmlHeader = @"
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Learn &amp; Master Guitar &mdash; Practice Workspace</title>
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%2318181B'/%3E%3Cpath d='M18.5 7v11.2a4.2 4.2 0 1 1-2.2-3.7V9.4l7-1.9V11l-4.8 1.3z' fill='%23FFFEFC'/%3E%3C/svg%3E">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400&display=swap" rel="stylesheet">
  <style>
$css
  </style>
</head>
<body data-app-mode="primer">

  <!-- ZONE 1: TOP BAR (48px) -->
  <header class="topbar" id="workspace-topbar">
    <div class="topbar-left">
      <div class="segmented-control app-mode-switch" id="app-mode-tabs" role="tablist" aria-label="Workspace Section">
        <button class="seg-btn active" data-app-mode="primer" id="btn-mode-primer" role="tab" aria-selected="true">Foundations Primer</button>
        <button class="seg-btn" data-app-mode="studio" id="btn-mode-studio" role="tab" aria-selected="false">Curriculum Studio</button>
      </div>

      <div class="topbar-studio-only topbar-studio-crumb">
        <button class="icon-btn" id="btn-toggle-drawer" title="Toggle Curriculum Sidebar" aria-label="Toggle Curriculum Sidebar">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2"></rect>
            <line x1="9" y1="3" x2="9" y2="21"></line>
          </svg>
        </button>
        <nav class="breadcrumb" aria-label="Current Exercise">
          <span class="crumb-session" id="nav-crumb-session">Lesson Book &middot; S2</span>
          <span class="crumb-sep">/</span>
          <span class="crumb-exercise" id="studio-exercise-title">First String Notes</span>
        </nav>
      </div>
    </div>

    <div class="topbar-center">
      <div class="segmented-control topbar-studio-only" id="workspace-view-tabs" role="tablist" aria-label="Workspace View Mode">
        <button class="seg-btn active" data-pane="score" id="btn-pane-score" role="tab" aria-selected="true">Interactive Score</button>
        <button class="seg-btn" data-pane="pdf" id="btn-pane-pdf" role="tab" aria-selected="false">PDF Reference</button>
        <button class="seg-btn" data-pane="split" id="btn-pane-split" role="tab" aria-selected="false">Split View</button>
      </div>
    </div>

    <div class="topbar-right">
      <div class="topbar-studio-only topbar-studio-actions">
        <div class="topbar-steppers">
          <button class="icon-btn" id="btn-prev-exercise" title="Previous Exercise (&larr;)" aria-label="Previous Exercise">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <button class="icon-btn" id="btn-next-exercise" title="Next Exercise (&rarr;)" aria-label="Next Exercise">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
        <button class="topbar-action-btn" id="btn-mark-done" title="Mark this exercise completed">
          <svg class="done-check-svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          <span class="done-label">Mark Done</span>
        </button>
        <button class="icon-btn" id="btn-toggle-guide" title="Steve Krenz Notes &amp; Session Goals" aria-label="Playing Instructions">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        </button>
      </div>
    </div>
  </header>

  <!-- FOUNDATIONS PRIMER (Landing / Home View) -->
  <section class="primer-view" id="primer-view" aria-label="Notation & Rhythm Primer"></section>

  <!-- MIDDLE WORKSPACE: DRAWER + MAIN CANVAS (calc(100vh - 104px)) -->
  <div class="workspace-body" id="workspace-body" data-pane-mode="score">

    <!-- ZONE 2: LEFT COLLAPSIBLE DRAWER (240px) -->
    <aside class="left-drawer" id="workspace-sidebar" aria-label="Curriculum Navigation">
      <div class="drawer-header">
        <div class="drawer-book-tabs">
          <button class="drawer-book-btn active" id="choice-lesson-book" data-book="lessonBook">Lessons</button>
          <button class="drawer-book-btn" id="choice-workshop-book" data-book="bonusWorkshop">Workshops</button>
          <button class="drawer-book-btn" id="choice-free-mode" data-book="freeMode">Free</button>
        </div>
        <div class="drawer-search-wrap">
          <svg class="drawer-search-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" id="catalog-search-input" class="drawer-search-input" placeholder="Search sessions, drills..." autocomplete="off">
        </div>
      </div>

      <nav class="drawer-scroll" id="sessions-accordion"></nav>
    </aside>

    <!-- ZONE 3: MAIN CANVAS -->
    <main class="main-canvas" id="main-canvas">

      <!-- INTERACTIVE SCORE PANE -->
      <section class="canvas-pane canvas-score-pane" id="score-pane">

        <!-- Collapsible Instructions & Session Goals Panel -->
        <div class="guide-drawer" id="studio-guide-panel" hidden>
          <div class="guide-header">
            <span class="guide-title">Playing Notes &middot; <span id="studio-exercise-topic-badge">Session</span></span>
            <button class="guide-close-btn" id="btn-close-guide" aria-label="Close Notes">&times;</button>
          </div>
          <p class="guide-body" id="studio-instruction-text">Select any exercise to view playing instructions and technique tips.</p>
          <div class="guide-checklist" id="active-session-checklist"></div>
        </div>

        <!-- Subtle Inline Telemetry & Notation Toggles Bar -->
        <div class="canvas-subbar">
          <div class="telemetry-inline mode-play" id="note-active-card">
            <div class="telemetry-glyph" id="note-glyph-large"></div>
            <div class="telemetry-text">
              <span class="telemetry-primary" id="note-header-big">E (High E Open)</span>
              <span class="telemetry-sep">&middot;</span>
              <span class="telemetry-secondary" id="note-sub-instruction">String 1 | Open Position</span>
            </div>
            <span class="telemetry-pick-badge" id="note-right-guidance">Pick: Down | Beat 1</span>
          </div>

          <div class="notation-toggles" id="studio-trainer-bar">
            <div class="toggle-group" id="chord-mode-group" style="display:none;">
              <button class="micro-pill active" data-chord-mode="full" title="Full Chord Form">Full</button>
              <button class="micro-pill" data-chord-mode="easy4" title="4-Note Beginner Voicing">4-Note</button>
              <button class="micro-pill" data-chord-mode="easy3" title="3-Note Easy Voicing">3-Note</button>
            </div>
            <div class="toggle-group" id="string-selector-group" style="display:none;">
              <span class="toggle-lbl">String</span>
              <button class="micro-pill active" data-str="1">1</button>
              <button class="micro-pill" data-str="2">2</button>
              <button class="micro-pill" data-str="3">3</button>
              <button class="micro-pill" data-str="4">4</button>
              <button class="micro-pill" data-str="5">5</button>
              <button class="micro-pill" data-str="6">6</button>
            </div>
            <button class="micro-pill active" id="btn-toggle-fretboard" title="Show/Hide Fretboard">Fretboard</button>
          </div>
        </div>

        <!-- Fretboard Visualizer -->
        <div class="fretboard-stage" id="fretboard-wrapper">
          <div id="fretboard-container"></div>
        </div>

        <!-- Printed Book Page Container ("Sheet-on-Desk") -->
        <article class="book-page-sheet" id="book-page-sheet">
          <header class="book-page-header">
            <div class="book-page-top-meta">
              <div class="book-page-session" id="book-page-session">LEARN &amp; MASTER GUITAR &middot; SESSION 2</div>
              <span class="book-verified-pill is-verified" id="book-verification-badge">PDF Transcribed &middot; p. 9</span>
            </div>
            <div class="book-page-title-row">
              <h1 class="book-page-title" id="book-page-title">First String Exercises</h1>
              <span class="book-topic-count-pill" id="book-topic-count-pill" hidden>1 Exercise</span>
            </div>
            <p class="book-page-desc" id="book-page-desc">Select any exercise to view playing instructions and technique tips.</p>

            <!-- TUTOR SCAFFOLDING HEADER CONTROLS -->
            <div class="tutor-scaffolding-bar" id="tutor-scaffolding-bar" role="region" aria-label="Tutor Scaffolding Assists">
              <div class="tutor-assist-group">
                <span class="tutor-assist-label">Note Names</span>
                <div class="tutor-seg-group" id="tutor-note-mode-group" role="group" aria-label="Note Name Display">
                  <button type="button" class="tutor-seg-btn" data-note-mode="off">Off</button>
                  <button type="button" class="tutor-seg-btn active" data-note-mode="above">Above Note</button>
                  <button type="button" class="tutor-seg-btn" data-note-mode="inside">Inside Notehead</button>
                </div>
              </div>

              <div class="tutor-assist-group">
                <span class="tutor-assist-label">Tab Visibility</span>
                <div class="tutor-seg-group" id="tutor-tab-mode-group" role="group" aria-label="Tab Visibility Mode">
                  <button type="button" class="tutor-seg-btn active" data-tab-mode="both">Show Both</button>
                  <button type="button" class="tutor-seg-btn" data-tab-mode="staff-only">Staff Only</button>
                  <button type="button" class="tutor-seg-btn" data-tab-mode="blur">Blur Tab</button>
                </div>
              </div>

              <div class="tutor-assist-group tutor-assist-bools">
                <button type="button" class="tutor-toggle-pill active" id="btn-tutor-rhythm-guide" aria-pressed="true" title="Toggle beat numbers, Hold continuation arrows, +1/2 beat and Rest / Mute cues">
                  <span class="tutor-pill-dot"></span>
                  <span>Rhythm Guide: <strong id="tutor-rhythm-state">ON</strong></span>
                </button>
                <button type="button" class="tutor-toggle-pill active" id="btn-tutor-coach-banner" aria-pressed="true" title="Toggle real-time Live Action Coach pill above the active measure during playback">
                  <span class="tutor-pill-dot"></span>
                  <span>Live Coach: <strong id="tutor-coach-state">ON</strong></span>
                </button>
              </div>
            </div>
          </header>

          <div class="book-tempo-row" id="book-tempo-marking">
            <span class="tempo-glyph-slot" id="book-tempo-glyph" aria-hidden="true"></span>
            <span class="tempo-eq">=</span>
            <span class="tempo-bpm-val" id="book-tempo-bpm">60</span>
          </div>

          <div class="notation-stage">
            <div id="topic-exercises-stack" class="topic-exercises-stack">
              <div id="tab-container"></div>
            </div>
          </div>
        </article>

      </section>

      <!-- PDF REFERENCE PANE -->
      <section class="canvas-pane canvas-pdf-pane" id="pdf-pane">
        <div class="pdf-toolbar">
          <div class="pdf-toolbar-left">
            <button class="micro-pill active" id="btn-pdf-lesson" data-pdf-book="lessonBook">Lesson Book</button>
            <button class="micro-pill" id="btn-pdf-workshop" data-pdf-book="bonusWorkshop">Workshop Book</button>
            <div class="pdf-page-group">
              <span>p.</span>
              <input type="number" id="pdf-page-input" class="mono-input" min="1" max="160" value="1" aria-label="PDF Page Number">
            </div>
            <button class="micro-pill" id="btn-pdf-sync" title="Jump to this exercise's book page">Sync</button>
          </div>
          <div class="pdf-toolbar-right">
            <label class="micro-pill pdf-upload-label" title="Load a local PDF copy from your computer">
              Open Local PDF
              <input type="file" id="pdf-file-input" accept="application/pdf" style="display:none;">
            </label>
            <a class="micro-pill" id="pdf-open-newtab" href="./assets/Learn-and-Master-Guitar-Lesson-Book.pdf" target="_blank" rel="noopener">New Tab &nearr;</a>
          </div>
        </div>
        <div class="pdf-frame-wrap">
          <iframe id="pdf-viewer-frame" title="Course Reference PDF"></iframe>
          <div class="pdf-fallback-card" id="pdf-fallback-card" style="display:none;">
            <div class="pdf-fallback-inner">
              <div class="pdf-fallback-title">Course PDF not bundled on this server</div>
              <p class="pdf-fallback-desc">
                Large PDF textbooks are excluded from public git hosting. Load your local copy of
                <strong id="pdf-missing-filename">Learn-and-Master-Guitar-Lesson-Book.pdf</strong>
                to inspect it side-by-side here.
              </p>
              <label class="topbar-action-btn" style="cursor:pointer;display:inline-flex;">
                Choose PDF File
                <input type="file" id="pdf-file-input-fallback" accept="application/pdf" style="display:none;">
              </label>
            </div>
          </div>
        </div>
      </section>

    </main>
  </div>

  <!-- ZONE 4: FIXED BOTTOM TRANSPORT DOCK (56px) -->
  <footer class="transport-dock" id="transport-dock">
    <div class="transport-left">
      <button class="transport-play-btn" id="btn-play-toggle" title="Play / Pause Exercise (Space)">
        <svg class="icon-play" width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg>
        <svg class="icon-stop" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style="display:none;"><rect x="4" y="4" width="16" height="16" rx="2"></rect></svg>
        <span id="play-btn-label">Play</span>
      </button>

      <div class="dock-metronome-cluster">
        <button type="button" class="dock-pill-btn dock-metronome-btn" id="btn-metronome-toggle" aria-pressed="false" title="Start / Stop Continuous Percussive Metronome Click (1200 Hz Beat 1 / 800 Hz Beats 2-4)">
          <span class="met-dot-status"></span>
          <span id="metronome-btn-label">Metronome</span>
        </button>
        <div class="beat-dots-sequence" id="beat-dots-sequence" title="Visual Beat Indicator (Click any dot to mute/unmute beat)"></div>
      </div>

      <button class="dock-pill-btn active" id="btn-loop-mode" title="Click to switch: Loop All &rarr; Loop Bar &rarr; Play Once">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>
        <span id="loop-mode-label">Loop All</span>
      </button>
    </div>

    <div class="transport-center">
      <div class="bpm-control-cluster">
        <button class="dock-step-btn" id="btn-bpm-minus" title="Decrease BPM (-1)">&minus;</button>
        <div class="bpm-readout-wrap">
          <input type="number" id="bpm-number-input" class="bpm-mono-input" min="30" max="240" value="60" aria-label="Tempo BPM">
          <span class="bpm-unit">BPM</span>
        </div>
        <button class="dock-step-btn" id="btn-bpm-plus" title="Increase BPM (+1)">+</button>
      </div>

      <div class="jam-speed-presets" id="jam-speed-presets">
        <button class="speed-preset-btn" id="btn-speed-slow" data-speed="slow">Slow: 48</button>
        <button class="speed-preset-btn active" id="btn-speed-med" data-speed="med">Med: 60</button>
        <button class="speed-preset-btn" id="btn-speed-fast" data-speed="fast">Goal: 84</button>
      </div>

      <span class="time-pill-badge" id="time-pill-badge" title="Time Signature">4/4</span>
    </div>

    <div class="transport-right">
      <label class="dock-select-wrap" title="Percussive Metronome Click Voice">
        <span class="dock-lbl">Click</span>
        <select id="select-sound" class="dock-select">
          <option value="woodblock" selected>Woodblock (1200/800 Hz)</option>
          <option value="click">Crisp Click</option>
          <option value="drum">Rim Tick</option>
          <option value="silent">Mute Click</option>
        </select>
      </label>

      <label class="dock-select-wrap" title="Audio Cue on Rests">
        <span class="dock-lbl">Rest</span>
        <select id="select-rest-sound" class="dock-select">
          <option value="click" selected>Click</option>
          <option value="muted-thud">Mute Thud</option>
          <option value="silent">Silent</option>
        </select>
      </label>

      <label class="dock-toggle-pill" title="Synthesize guitar pitch for exercise notation (never used for metronome clicks)">
        <input type="checkbox" id="toggle-guitar-tone" checked>
        <span>Synth</span>
      </label>

      <label class="dock-toggle-pill" title="Play 1-Bar Percussive Count-In before exercise playback starts">
        <input type="checkbox" id="toggle-count-in">
        <span>Count-In: 1 Bar</span>
      </label>
    </div>
  </footer>

  <script>
$vexflowJs
  </script>

  <script>
  (function() {
"@

$htmlFooter = @"

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", function() {
        window.guitarApp = new GuitarMasterApp();
      });
    } else {
      window.guitarApp = new GuitarMasterApp();
    }
  })();
  </script>
</body>
</html>
"@

Write-Host "Assembling final bundle..."
$sb = New-Object System.Text.StringBuilder
[void]$sb.AppendLine($htmlHeader)
[void]$sb.AppendLine($exercisesJs)
[void]$sb.AppendLine($curriculumJs)
[void]$sb.AppendLine($scoreRendererJs)
[void]$sb.AppendLine($audioJs)
[void]$sb.AppendLine($dialJs)
[void]$sb.AppendLine($fretboardJs)
[void]$sb.AppendLine($primerCatalogJs)
[void]$sb.AppendLine($primerJs)
[void]$sb.AppendLine($appJs)
[void]$sb.AppendLine($htmlFooter)

$finalHtml = $sb.ToString()
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

Write-Host "Writing to $(Join-Path $root 'index.html')..."
[System.IO.File]::WriteAllText((Join-Path $root "index.html"), $finalHtml, $utf8NoBom)

if (Test-Path (Split-Path $artifactFile -Parent)) {
    Write-Host "Writing to $artifactFile..."
    [System.IO.File]::WriteAllText($artifactFile, $finalHtml, $utf8NoBom)
}

Write-Host "Successfully generated standalone bundle! Size: $([math]::Round($finalHtml.Length / 1024, 2)) KB" -ForegroundColor Green
