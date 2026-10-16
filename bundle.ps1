$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
if (-not $root) { $root = "C:\Users\govin\.gemini\antigravity\scratch\guitar-master-metronome" }
$artifactFile = "C:\Users\govin\.gemini\antigravity\brain\8def1509-2011-4df8-b8fc-420615ecf64f\guitar_metronome_companion.html"

Write-Host "--- Starting Bundle Compilation ---" -ForegroundColor Cyan

$requiredFiles = @("style.css", "exercises.js", "audio.js", "dial.js", "fretboard.js", "tab.js", "app.js")
foreach ($f in $requiredFiles) {
    $fullPath = Join-Path $root $f
    if (-not (Test-Path $fullPath)) {
        throw "Required file missing: $fullPath"
    }
}

Write-Host "Reading style.css..."
$css = [System.IO.File]::ReadAllText((Join-Path $root "style.css"), [System.Text.Encoding]::UTF8)

Write-Host "Reading exercises.js..."
$exercisesJs = [System.IO.File]::ReadAllText((Join-Path $root "exercises.js"), [System.Text.Encoding]::UTF8)
$exercisesJs = $exercisesJs -replace "export\s+const\s+GUITAR_COURSES", "const GUITAR_COURSES"

Write-Host "Reading audio.js..."
$audioJs = [System.IO.File]::ReadAllText((Join-Path $root "audio.js"), [System.Text.Encoding]::UTF8)
$audioJs = $audioJs -replace "export\s+class\s+MetronomeAudioEngine", "class MetronomeAudioEngine"

Write-Host "Reading dial.js..."
$dialJs = [System.IO.File]::ReadAllText((Join-Path $root "dial.js"), [System.Text.Encoding]::UTF8)
$dialJs = $dialJs -replace "export\s+class\s+GuitarSpeedDial", "class GuitarSpeedDial"

Write-Host "Reading fretboard.js..."
$fretboardJs = [System.IO.File]::ReadAllText((Join-Path $root "fretboard.js"), [System.Text.Encoding]::UTF8)
$fretboardJs = $fretboardJs -replace "export\s+class\s+FretboardVisualizer", "class FretboardVisualizer"

Write-Host "Reading tab.js..."
$tabJs = [System.IO.File]::ReadAllText((Join-Path $root "tab.js"), [System.Text.Encoding]::UTF8)
$tabJs = $tabJs -replace "export\s+class\s+TabStaffVisualizer", "class TabStaffVisualizer"

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
  <title>Learn &amp; Master Guitar - Studio Companion &amp; Metronome</title>
  <style>
$css
  </style>
</head>
<body>

  <!-- Master Top Navigation Bar -->
  <header class="master-header">
    <div class="nav-left-group">
      <button class="back-btn-pill" id="btn-master-back" title="Back to Previous View" style="display: none;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
      </button>
      <div>
        <h1 class="brand-title">LEARN &amp; MASTER GUITAR</h1>
        <span class="brand-subtitle" id="nav-mode-indicator">Steve Krenz Course Studio</span>
      </div>
    </div>
  </header>

  <!-- VIEW 1: WELCOME & LANDING PAGE -->
  <main class="landing-home-view" id="view-home">
    <section class="hero-welcome-card">
      <div class="hero-gold-badge">STEVE KRENZ &bull; LEARN &amp; MASTER GUITAR STUDIO COMPANION</div>
      <h2 class="hero-main-title">Master the Guitar with Precision Timing</h2>
      <p class="hero-description">
        Comprehensive interactive companion for Steve Krenz&#39;s <em>Learn &amp; Master Guitar</em>.
        Follow along with the authentic curriculum from both textbook volumes, develop sight-reading on the 5-line staff and fretboard, and master jam-along tracks with tempo-graded metronome feedback.
      </p>

      <div class="specs-strip">
        <div>
          <div class="spec-item-num">20</div>
          <div class="spec-item-lbl">Lesson Sessions</div>
        </div>
        <div>
          <div class="spec-item-num">20</div>
          <div class="spec-item-lbl">Bonus Workshops</div>
        </div>
        <div>
          <div class="spec-item-num">135+</div>
          <div class="spec-item-lbl">Songs &amp; Drills</div>
        </div>
        <div>
          <div class="spec-item-num">Slow / Med / Goal</div>
          <div class="spec-item-lbl">Jam-Along Presets</div>
        </div>
      </div>
    </section>

    <section class="portal-cards-grid">
      <div class="portal-choice-card" id="portal-card-lesson">
        <div>
          <div class="portal-card-badge-line">
            <span class="portal-card-tag">CORE CURRICULUM</span>
            <span class="portal-card-metric">20 SESSIONS</span>
          </div>
          <h3 class="portal-card-title">Lesson Book</h3>
          <p class="portal-card-desc">
            Complete step-by-step textbook sessions: reading music on strings 1-6 (E-F-G, B-C-D), note values, rests, chords, first position melodies (<em>Ode to Joy</em>, <em>Morning Has Broken</em>), barre chords, and jazz theory.
          </p>
        </div>
        <div class="portal-btn-action">
          <span>Explore Sessions 1-20</span> &rarr;
        </div>
      </div>

      <div class="portal-choice-card" id="portal-card-workshop">
        <div>
          <div class="portal-card-badge-line">
            <span class="portal-card-tag">PRACTICE WORKSHOPS</span>
            <span class="portal-card-metric">20 WORKSHOPS</span>
          </div>
          <h3 class="portal-card-title">Bonus Workshop Book</h3>
          <p class="portal-card-desc">
            Hands-on technical workouts accompanying every session: chromatic spider finger coordination (1-2-3-4 alternate picking), simplified 3-note and 4-note beginner chords, sight-reading pieces, and palm muting drills.
          </p>
        </div>
        <div class="portal-btn-action">
          <span>Explore Workshops 1-20</span> &rarr;
        </div>
      </div>

      <div class="portal-choice-card" id="portal-card-studio">
        <div>
          <div class="portal-card-badge-line">
            <span class="portal-card-tag">PRO AUDIO WORKSTATION</span>
            <span class="portal-card-metric">30-240 BPM</span>
          </div>
          <h3 class="portal-card-title">Metronome Studio</h3>
          <p class="portal-card-desc">
            Rotary speed dial, draggable BPM needle, interactive tab and 5-line staff notation, 15-fret note locator, synchronized guitar pitch synthesizer, and visual rest tracking to practice clean damping.
          </p>
        </div>
        <div class="portal-btn-action">
          <span>Launch Metronome Studio</span> &rarr;
        </div>
      </div>
    </section>
  </main>

  <!-- VIEW 2: COURSE BOOKS CHAPTER HUB -->
  <main class="course-book-view" id="view-course-book" style="display: none;">
    <section class="book-selection-banner">
      <div style="display: flex; align-items: center; gap: 14px; flex-wrap: wrap;">
        <button class="back-btn-pill" id="btn-book-back" title="Back to Overview">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>
        <div class="book-tab-group">
          <button class="book-pill-choice selected" id="choice-lesson-book" data-book="lessonBook">
            Lesson Book (Sessions 1-20)
          </button>
          <button class="book-pill-choice" id="choice-workshop-book" data-book="bonusWorkshop">
            Bonus Workshop (Workshops 1-20)
          </button>
          <button class="book-pill-choice" id="choice-free-mode" data-book="freeMode">
            Free Metronome Studio
          </button>
        </div>
      </div>
      <div class="catalog-filter-bar">
        <input type="text" id="catalog-search-input" class="luxury-search-input" placeholder="Search sessions, topics, exercises, or songs (e.g. First String, Ode to Joy, Scarborough)..." />
      </div>
    </section>

    <section class="sessions-catalog-grid" id="sessions-catalog-grid"></section>
  </main>

  <!-- VIEW 3: METRONOME & NOTATION STUDIO -->
  <main class="metronome-studio-view" id="view-metronome-studio" style="display: none;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <button class="back-btn-pill" id="btn-studio-back" title="Back to Courses">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>
        <div>
          <span style="font-size: 11px; text-transform: uppercase; color: var(--gold-light); font-weight: 800;" id="studio-exercise-topic-badge">Current Session</span>
          <h2 style="font-size: 18px; font-weight: 800; color: #fff;" id="studio-exercise-title">Session 2</h2>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 10px;">
        <button id="btn-prev-exercise" class="btn-stepper-round" style="width: auto; padding: 6px 14px; border-radius: 8px; font-size: 12px;" title="Previous Exercise">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px;"><polyline points="15 18 9 12 15 6"></polyline></svg>Prev
        </button>
        <select id="studio-session-select" class="luxury-select" style="max-width: 380px; font-weight: 700;"></select>
        <button id="btn-next-exercise" class="btn-stepper-round" style="width: auto; padding: 6px 14px; border-radius: 8px; font-size: 12px;" title="Next Exercise">
          Next<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-left: 4px;"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
      </div>
    </div>

    <div class="studio-instruction-banner" id="studio-exercise-instruction">
      <div class="instruction-header">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
        <span>Steve Krenz Instructions</span>
      </div>
      <div class="instruction-body" id="studio-instruction-text">
        Select any exercise to view playing instructions and technique tips.
      </div>
    </div>

    <div class="studio-grid-layout">
      <section class="dial-studio-panel">
        <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: var(--gold-light); letter-spacing: 1px; margin-bottom: 8px;">Guitar Metronome</div>

        <div class="bpm-stepper-row">
          <button id="btn-bpm-minus" class="btn-stepper-round" title="Decrease BPM by 1">-</button>
          <div id="bpm-number-display" class="bpm-big-readout">60</div>
          <button id="btn-bpm-plus" class="btn-stepper-round" title="Increase BPM by 1">+</button>
        </div>
        <div class="bpm-label-sub">Beats per min</div>

        <div class="canvas-dial-holder">
          <canvas id="speed-dial-canvas" width="270" height="270"></canvas>
        </div>

        <div class="beat-dots-sequence" id="beat-dots-sequence" title="Click any beat to toggle Play or Rest"></div>

        <div class="time-pill-badge" id="time-pill-badge">4/4</div>
        <div class="time-pill-label">Time signature</div>

        <div class="studio-audio-options">
          <div class="setting-item-row">
            <span>Metronome Sound:</span>
            <select id="select-sound" class="luxury-select">
              <option value="woodblock" selected>Acoustic Woodblock</option>
              <option value="beep">Precision Beep</option>
              <option value="drum">Studio Drum</option>
            </select>
          </div>
          <div class="setting-item-row">
            <span>Rest Audio:</span>
            <select id="select-rest-sound" class="luxury-select">
              <option value="click" selected>Metronome Click (Always Count Rests)</option>
              <option value="muted-thud">Muted Thud (Palm Mute Cue)</option>
              <option value="silent">Complete Silence on Rest</option>
            </select>
          </div>
          <div class="setting-item-row">
            <span>1-Bar Count-In:</span>
            <label style="cursor: pointer; color: var(--gold-light); font-weight: 600; display: inline-flex; align-items: center; gap: 6px;">
              <input type="checkbox" id="toggle-count-in" style="accent-color: var(--color-orange, #f97316);">
              <span id="label-count-in-text">Off</span>
            </label>
          </div>
        </div>
      </section>

      <section class="course-display-panel">
        <div class="note-active-card mode-play" id="note-active-card">
          <div style="display: flex; align-items: center; gap: 16px;">
            <div class="note-glyph-large" id="note-glyph-large">1/4</div>
            <div>
              <div class="note-header-big" id="note-header-big">E (High E Open)</div>
              <div class="note-sub-instruction" id="note-sub-instruction">String 1 | Open Position</div>
            </div>
          </div>
          <div class="note-right-guidance" id="note-right-guidance">Pick: Down | Beat 1</div>
        </div>

        <div class="luxury-section-box">
          <div class="box-title-row">
            <span class="box-title-text">Fretboard Visualizer</span>
            <span class="box-meta-text">Frets 0 to 14 (Fingerings &amp; Muted String Markers)</span>
          </div>
          <div id="fretboard-container"></div>
        </div>

        <div class="luxury-section-box">
          <div class="box-title-row">
            <span class="box-title-text">5-Line Standard Notation &amp; TAB</span>
            <span class="box-meta-text">Click Any Beat to Seek Playhead</span>
          </div>
          <div id="tab-container"></div>
        </div>
      </section>
    </div>
  </main>

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
[void]$sb.AppendLine($audioJs)
[void]$sb.AppendLine($dialJs)
[void]$sb.AppendLine($fretboardJs)
[void]$sb.AppendLine($tabJs)
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
