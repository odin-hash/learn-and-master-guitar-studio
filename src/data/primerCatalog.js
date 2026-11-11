/**
 * Interactive Notation & Rhythm Primer Catalog
 * --------------------------------------------
 * Structured data backing the 4-category Theory & Sight-Reading Matrix,
 * VexFlow live symbol engraving specs, Wrong-vs-Right 2-measure comparison demos,
 * and 60-second No-Tab Staff Flashcard Mini-Quizzes.
 */

export const PRIMER_CATEGORIES = [
  {
    id: "staff",
    letter: "a",
    title: "The Staff & Clefs",
    subtitle: "How musical lines, spaces, clefs, tablature, and barlines map the guitar fretboard onto the page."
  },
  {
    id: "rhythm",
    letter: "b",
    title: "Rhythm, Dots, Ties & Rests",
    subtitle: "How note values, +50% augmentation dots, silent rests, and sustained ties organize time."
  },
  {
    id: "pitch",
    letter: "c",
    title: "Pitch, Key & Accidentals",
    subtitle: "Time signatures, key signatures, sharps, flats, naturals, and the barline reset rule."
  },
  {
    id: "guitar",
    letter: "d",
    title: "Guitar-Specific Symbols",
    subtitle: "Picking direction strokes, string & finger numbering, open strings, and rest damping."
  }
];

export const PRIMER_ITEMS = [
  // =========================================================================
  // a) THE STAFF & CLEFS
  // =========================================================================
  {
    id: "staff-five-line",
    categoryId: "staff",
    name: "Five-Line Staff",
    whatItMeans: "Five horizontal lines and four spaces represent pitch height. Higher vertically = higher sounding pitch. Treble lines (bottom to top): E–G–B–D–F; spaces: F–A–C–E.",
    howToPlay: "As notes climb up the lines and spaces, play closer to the 1st (thinnest) string or higher up the fretboard.",
    linkedExerciseId: "lb-s2-str1-ex1",
    symbolSpec: {
      kind: "stave-lines-spaces",
      notes: ["e/4/q", "f/4/q", "g/4/q", "e/5/q"],
      labels: ["E", "F", "G", "E"]
    },
    sandbox: {
      headline: "Reading Lines & Spaces Upward",
      tip: "Count lines and spaces strictly from bottom (Line 1 = E4) to top (Line 5 = F5). Skipping even one line changes the string or fret.",
      bpm: 64,
      wrongExample: {
        label: "Wrong Way: Confusing Line vs. Space",
        summary: "Confusing Space 4 (E, Open 1st String) with Line 5 (F, 1st Fret) shifts the melody by a fret.",
        timeSignature: "4/4",
        measures: [
          "E4/q@1:0[Down], F4/q@1:1[Down], F4/q@1:1[Down], E4/q@1:0[Down]",
          "E4/h@1:0[Down], E4/h@1:0[Down]"
        ],
        cues: ["Bar 1 Beat 1: Line/Space E", "Beat 2: F", "Beat 3: Oops—wrongly repeated F instead of G!", "Beat 4: Back down to E"]
      },
      rightExample: {
        label: "Right Way: Clean Stepwise Tracking (E–F–G)",
        summary: "Step cleanly from Space 4 (E) to Line 5 (F) to Above Top Line (G) along the 1st string.",
        timeSignature: "4/4",
        measures: [
          "E4/q@1:0[Down], F4/q@1:1[Down], G4/q@1:3[Down], F4/q@1:1[Down]",
          "E4/w@1:0[Down]"
        ],
        cues: ["Bar 1 Beat 1: Pluck E (Open)", "Beat 2: Pluck F (1st Fret)", "Beat 3: Pluck G (3rd Fret)", "Beat 4: Pluck F (1st Fret)"]
      }
    }
  },
  {
    id: "staff-ledger",
    categoryId: "staff",
    name: "Ledger Lines",
    whatItMeans: "Short horizontal extension lines added above or below the 5-line staff for notes outside its range (like Middle C below the staff or High A above).",
    howToPlay: "Low ledger lines reach down to the open 5th string (A) and 6th string (E); top ledger lines reach frets 5+ on the 1st string.",
    linkedExerciseId: "lb-s1-tour",
    symbolSpec: {
      kind: "ledger",
      notes: ["a/3/q", "c/4/q", "e/5/q", "a/5/q"]
    },
    sandbox: {
      headline: "Extending the Staff with Ledger Lines",
      tip: "Ledger lines follow the same alternating line–space alphabet below Line 1 (D, C, B, A) and above Line 5 (G, A, B, C).",
      bpm: 64,
      wrongExample: {
        label: "Wrong Way: Playing Inside Staff Instead of Ledger C",
        summary: "Guessing an inside-staff B or G when the note sits on a ledger line below the bottom line.",
        timeSignature: "4/4",
        measures: [
          "E3/q@4:2[Down], D3/q@4:0[Down], E3/q@4:2[Down], D3/q@4:0[Down]",
          "E3/w@4:2[Down]"
        ],
        cues: ["Oops: Stayed on E/D", "Missed the ledger line drop", "Bass root C3 missed", "Stuck in wrong octave"]
      },
      rightExample: {
        label: "Right Way: Stepping Down onto Ledger C (5th String Fret 3)",
        summary: "Track accurately from 4th-string E and D down to the first ledger line below the staff (C3, 5th string fret 3).",
        timeSignature: "4/4",
        measures: [
          "E3/q@4:2[Down], D3/q@4:0[Down], C3/q@5:3[Down], D3/q@4:0[Down]",
          "C3/w@5:3[Down]"
        ],
        cues: ["Bar 1 Beat 1: 4th String Fret 2 (E)", "Beat 2: Open 4th (D)", "Beat 3: Ledger Line! 5th String Fret 3 (C)", "Beat 4: Open 4th (D)"]
      }
    }
  },
  {
    id: "staff-treble-clef",
    categoryId: "staff",
    name: "Treble (G) Clef",
    whatItMeans: "The ornate spiral wraps directly around Line 2 from the bottom, locking Line 2 as the pitch G4 (written G4, sounding G3 on guitar).",
    howToPlay: "Guitar music uses Treble Clef sounding one octave lower than written. Whenever you see the spiral on Line 2, that note is your open 3rd string (G).",
    linkedExerciseId: "lb-s2-comb-ex1",
    symbolSpec: {
      kind: "treble-clef"
    },
    sandbox: {
      headline: "Line 2 Anchor = Open 3rd String (G)",
      tip: "Find the loop around Line 2 to orient every pitch instantly: go up to Space 2 for A (3rd str fret 2) or down to Space 1 for F.",
      bpm: 64,
      wrongExample: {
        label: "Wrong Way: Anchoring to Line 1 Instead of Line 2",
        summary: "Confusing Line 2 (G) with Line 1 (E) shifts the reference off by a string.",
        timeSignature: "4/4",
        measures: [
          "E3/q@4:2[Down], E3/q@4:2[Down], A3/q@3:2[Down], E3/q@4:2[Down]",
          "E3/w@4:2[Down]"
        ],
        cues: ["Wrong anchor (E on L1)", "Repeated wrong note", "Skipped open G", "Wrong root E"]
      },
      rightExample: {
        label: "Right Way: G Clef Line 2 -> A -> G",
        summary: "Lock Line 2 to open 3rd string G, then step up one fret to A (Line 2 -> Space 2).",
        timeSignature: "4/4",
        measures: [
          "G3/q@3:0[Down], G3/q@3:0[Down], A3/q@3:2[Down], G3/q@3:0[Down]",
          "G3/w@3:0[Down]"
        ],
        cues: ["Beat 1: Open 3rd String G (Line 2)", "Beat 2: Open 3rd String G", "Beat 3: 3rd Str Fret 2 (A, Space 2)", "Beat 4: Back to Open G"]
      }
    }
  },
  {
    id: "staff-tab-vs-std",
    categoryId: "staff",
    name: "Guitar TAB vs. Standard Staff",
    whatItMeans: "Standard Staff (5 lines) shows exact rhythm and musical pitch. TAB (6 lines) maps the 6 physical strings (top line = 1st High E) and exact fret numbers.",
    howToPlay: "Use TAB to locate string and fret quickly, and read stems/beams/dots on the Standard Staff above to know exact timing and hold lengths.",
    linkedExerciseId: "lb-s2-song-ode",
    symbolSpec: {
      kind: "tab-vs-std"
    },
    sandbox: {
      headline: "Combining Standard Rhythm with TAB Frets",
      tip: "TAB tells you WHERE (string & fret), while Standard Notation tells you WHEN and HOW LONG (half note vs quarter note).",
      bpm: 68,
      wrongExample: {
        label: "Wrong Way: Reading TAB Numbers with Uniform Quarter Timing",
        summary: "Ignoring note stems and turning a 2-beat half note into a clipped 1-beat note.",
        timeSignature: "4/4",
        measures: [
          "E4/q@1:0[Down], F4/q@1:1[Down], G4/q@1:3[Down], R/q",
          "E4/q@1:0[Down], R/q, R/h"
        ],
        cues: ["Beat 1: Open 1st (0)", "Beat 2: Fret 1", "Beat 3: Clipping G short!", "Beat 4: Oops—gap before bar 2"]
      },
      rightExample: {
        label: "Right Way: Half Note Sustain + Exact TAB Frets (0–1–3)",
        summary: "Read frets 0–1–3 from TAB while honoring the half-note ring across beats 3 and 4.",
        timeSignature: "4/4",
        measures: [
          "E4/q@1:0[Down], F4/q@1:1[Down], G4/h@1:3[Down]",
          "E4/w@1:0[Down]"
        ],
        cues: ["Beat 1: Pluck 1st String Open (0)", "Beat 2: Fret 1 (F)", "Beat 3: Fret 3 (G) — Ring 2 beats!", "Beat 4: Keep Holding G!"]
      }
    }
  },
  {
    id: "staff-barlines",
    categoryId: "staff",
    name: "Barlines & Double Barlines",
    whatItMeans: "Single vertical barlines divide music into equal measures. A thin-plus-thick Double Barline signals the final end of a piece or exercise.",
    howToPlay: "Never pause or hesitate at a single barline—keep counting steadily ('4 -> 1') right across it until you reach the ending Double Barline.",
    linkedExerciseId: "lb-s2-str1-ex2",
    symbolSpec: {
      kind: "barlines"
    },
    sandbox: {
      headline: "Steady Flow Across Single Barlines",
      tip: "Treat single barlines as visual rulers, not stop signs. Beat 4 moves seamlessly into Beat 1 of the next measure.",
      bpm: 68,
      wrongExample: {
        label: "Wrong Way: Pausing at the Barline Between Measures",
        summary: "Dropping the groove by silencing Beat 4 before crossing the barline.",
        timeSignature: "4/4",
        measures: [
          "E4/q@1:0[Down], F4/q@1:1[Down], G4/q@1:3[Down], R/q",
          "E4/w@1:0[Down]"
        ],
        cues: ["Beat 1: E", "Beat 2: F", "Beat 3: G", "Beat 4: Oops—hesitated/muted before barline"]
      },
      rightExample: {
        label: "Right Way: Connected Beat 4 -> Beat 1 Ending on Double Bar",
        summary: "Play evenly through Beat 4 directly into Measure 2's final double-bar resolution.",
        timeSignature: "4/4",
        measures: [
          "E4/q@1:0[Down], F4/q@1:1[Down], G4/q@1:3[Down], F4/q@1:1[Down]",
          "E4/w@1:0[Down]"
        ],
        cues: ["Beat 1: E", "Beat 2: F", "Beat 3: G", "Beat 4: F straight across barline to final E!"]
      }
    }
  },
  {
    id: "staff-repeat",
    categoryId: "staff",
    name: "Repeat Signs",
    whatItMeans: "Double barlines with two dots send you back to play a section again (either back to the facing forward repeat dots, or all the way to Measure 1).",
    howToPlay: "Keep your tempo locked as you jump from the final repeat barline straight back to Beat 1 of the repeated phrase without dropping a beat.",
    linkedExerciseId: "lb-s1-fe1",
    symbolSpec: {
      kind: "repeat"
    },
    sandbox: {
      headline: "Clean Loops Without Dropping a Beat",
      tip: "Look ahead to Beat 1 of the repeat start during Beat 4 so your left-hand finger lands right on time.",
      bpm: 72,
      wrongExample: {
        label: "Wrong Way: Stopping on the Last Note Before Looping",
        summary: "Leaving an extra rest gap after Beat 4 instead of snapping back to Beat 1.",
        timeSignature: "4/4",
        measures: [
          "C4/q@2:1[Down], D4/q@2:3[Down], E4/q@1:0[Down], R/q",
          "C4/q@2:1[Down], D4/q@2:3[Down], E4/h@1:0[Down]"
        ],
        cues: ["Bar 1: C–D–E", "Stalled on Beat 4!", "Late jump back", "Out of groove"]
      },
      rightExample: {
        label: "Right Way: Seamless Measure-to-Measure Loop",
        summary: "Play both bars cleanly and imagine jumping directly from Measure 2 Beat 4 back into Measure 1 Beat 1.",
        timeSignature: "4/4",
        measures: [
          "C4/q@2:1[Down], D4/q@2:3[Down], E4/q@1:0[Down], D4/q@2:3[Down]",
          "C4/q@2:1[Down], D4/q@2:3[Down], C4/h@2:1[Down]"
        ],
        cues: ["Bar 1 Beat 1: C", "Beat 2: D", "Beat 3: E", "Beat 4: D -> smooth repeat!"]
      }
    }
  },

  // =========================================================================
  // b) RHYTHM, DOTS, TIES & RESTS
  // =========================================================================
  {
    id: "rhythm-whole-half",
    categoryId: "rhythm",
    name: "Whole & Half Notes",
    whatItMeans: "A Whole Note (hollow oval, no stem) lasts 4 beats in 4/4 time. A Half Note (hollow oval + stem) lasts 2 beats.",
    howToPlay: "Pluck once on the starting beat and keep your fretting finger pressed firmly down until all 4 (or 2) beats finish counting.",
    linkedExerciseId: "lb-s2-str1-ex1",
    symbolSpec: {
      kind: "notes",
      notes: ["g/4/w", "g/4/h"]
    },
    sandbox: {
      headline: "Sustaining Whole (4) and Half (2) Notes Full Value",
      tip: "Don't lift your fretting finger early! Keep fingertip pressure steady for every counted beat.",
      bpm: 64,
      wrongExample: {
        label: "Wrong Way: Lifting Finger Early After Beat 1",
        summary: "Cutting a 4-beat whole note and 2-beat half notes short after just 1 beat of sound.",
        timeSignature: "4/4",
        measures: [
          "F4/q@1:1[Down], R/q, R/h",
          "G4/q@1:3[Down], R/q, F4/q@1:1[Down], R/q"
        ],
        cues: ["Beat 1: Pluck F", "Beat 2: Oops—lifted finger!", "Beat 3: Dead silence", "Beat 4: Empty gap"]
      },
      rightExample: {
        label: "Right Way: Full 4-Beat Whole + 2-Beat Half Ring",
        summary: "Let Bar 1 ring all 4 beats, then let each Bar 2 half note ring smoothly for 2 full beats.",
        timeSignature: "4/4",
        measures: [
          "F4/w@1:1[Down]",
          "G4/h@1:3[Down], F4/h@1:1[Down]"
        ],
        cues: ["Bar 1 Beat 1: Pluck F (Whole)", "Beat 2: Keep holding 2", "Beat 3: Keep holding 3", "Beat 4: Keep holding 4"]
      }
    }
  },
  {
    id: "rhythm-quarter-eighth",
    categoryId: "rhythm",
    name: "Quarter & Eighth Notes",
    whatItMeans: "A Quarter Note (solid black head + stem) gets 1 full beat. An Eighth Note gets 1/2 beat; pairs connect with a single horizontal beam (count '1 & 2 &').",
    howToPlay: "Use Downstrokes on numbered beats (1, 2, 3, 4) and crisp alternate Upstrokes on the '&' upbeats between clicks.",
    linkedExerciseId: "lb-s3-8th-ex1",
    symbolSpec: {
      kind: "quarter-eighth"
    },
    sandbox: {
      headline: "Even Down–Up Subdivisions ('1 & 2 &')",
      tip: "Keep your picking arm moving continuously like a pendulum: down on the click, up right halfway between clicks.",
      bpm: 68,
      wrongExample: {
        label: "Wrong Way: Playing Uneven / Stiff All-Down Quarter Pace",
        summary: "Missing the '&' subdivision and playing choppy quarter notes instead of smooth eighth-note pairs.",
        timeSignature: "4/4",
        measures: [
          "E4/q@1:0[Down], E4/q@1:0[Down], R/q, E4/q@1:0[Down]",
          "F4/h@1:1[Down], E4/h@1:0[Down]"
        ],
        cues: ["Beat 1: E", "Beat 2: E (missed &!)", "Beat 3: Stumbled rest", "Beat 4: Late E"]
      },
      rightExample: {
        label: "Right Way: Quarter + Beamed Eighth Pairs (Down–Up)",
        summary: "Lock beats 1 & 2 on quarters, then subdivide beats 3 & 4 cleanly with even Down–Up eighths.",
        timeSignature: "4/4",
        measures: [
          "E4/q@1:0[Down], E4/q@1:0[Down], E4/8@1:0[Down], E4/8@1:0[Up], E4/8@1:0[Down], E4/8@1:0[Up]",
          "F4/h@1:1[Down], E4/h@1:0[Down]"
        ],
        cues: ["Beat 1: Down E", "Beat 2: Down E", "Beat 3 &: Down–Up (1/2 + 1/2)", "Beat 4 &: Down–Up into Bar 2"]
      }
    }
  },
  {
    id: "rhythm-whole-half-rests",
    categoryId: "rhythm",
    name: "Whole & Half Rests",
    whatItMeans: "A Whole Rest hangs BELOW Line 4 (4 beats complete bar silence). A Half Rest sits ON TOP OF Line 3 (2 beats silence — looks like a top hat).",
    howToPlay: "Mnemonic: Whole rests are heavier so they hang below Line 4; Half rests sit like a hat on Line 3. Touch strings with your palm to enforce silence.",
    linkedExerciseId: "lb-s2-mc-rest3",
    symbolSpec: {
      kind: "whole-half-rests"
    },
    sandbox: {
      headline: "Hearing True Silence on Half & Whole Rests",
      tip: "Never let earlier notes bleed into a rest measure! Lightly lay your picking-hand side across all 6 strings on Beat 1 of the rest.",
      bpm: 64,
      wrongExample: {
        label: "Wrong Way: Letting Bar 1 Ring Right Over the Half Rest",
        summary: "Forgetting to mute Strings 1–6 makes the guitar keep ringing loudly through beats 3 and 4.",
        timeSignature: "4/4",
        measures: [
          "G4/w@1:3[Down]",
          "E4/w@1:0[Down]"
        ],
        cues: ["Bar 1: G (whole)", "Stretched through Beat 3!", "Bar 2: Whole note bleed", "Zero rest contrast"]
      },
      rightExample: {
        label: "Right Way: Half Note -> Clean Palm Mute on Half Rest",
        summary: "Hold G4 cleanly for Beats 1–2, then silence the string completely during Beats 3–4's Half Rest.",
        timeSignature: "4/4",
        measures: [
          "G4/h@1:3[Down], R/h",
          "E4/h@1:0[Down], R/h"
        ],
        cues: ["Beat 1: Pluck G4", "Beat 2: Hold G4", "Beat 3: Mute! (Half Rest begins)", "Beat 4: Complete Silence"]
      }
    }
  },
  {
    id: "rhythm-quarter-rest",
    categoryId: "rhythm",
    name: "Quarter Rest & Eighth Rest",
    whatItMeans: "A Quarter Rest (lightning bolt) commands 1 beat of complete silence. An Eighth Rest (slanted single flag) commands 1/2 beat of silence.",
    howToPlay: "Touch the vibrating string immediately on the exact beat of the rest using your picking palm or lifted fretting finger.",
    linkedExerciseId: "bw-w3-tdr-ex5",
    symbolSpec: {
      kind: "quarter-eighth-rests"
    },
    sandbox: {
      headline: "Crisp Beat-by-Beat Rest Damping",
      tip: "Precision rest muting turns messy beginner strumming into tight, musical phrasing.",
      bpm: 64,
      wrongExample: {
        label: "Wrong Way: Ignored Quarter Rests (Bleed-Through)",
        summary: "Holding Beat 1 & Beat 3 right through the rests as half notes instead of silencing.",
        timeSignature: "4/4",
        measures: [
          "F4/h@1:1[Down], E4/h@1:0[Down]",
          "G4/w@1:3[Down]"
        ],
        cues: ["Beat 1: Pluck F", "Beat 2: Bled over rest!", "Beat 3: Pluck E", "Beat 4: Bled over rest!"]
      },
      rightExample: {
        label: "Right Way: Play – Mute! – Play – Mute! (Quarter Rests)",
        summary: "Mute cleanly on Beats 2 and 4 so every note pops with crisp rhythmic separation.",
        timeSignature: "4/4",
        measures: [
          "F4/q@1:1[Down], R/q, E4/q@1:0[Down], R/q",
          "G4/h@1:3[Down], R/h"
        ],
        cues: ["Beat 1: Pluck F (1st Fret)", "Beat 2: Palm Mute! (Quarter Rest)", "Beat 3: Pluck E (Open)", "Beat 4: Palm Mute! (Quarter Rest)"]
      }
    }
  },
  {
    id: "rhythm-dotted-half",
    categoryId: "rhythm",
    name: "Dotted Half Note (+50% Rule)",
    whatItMeans: "A dot right after any note adds +50% of its original value. Half Note (2) + 50% (1) = 3 full beats total.",
    howToPlay: "Hold the note for 3 full metronome clicks before changing chords or muting on Beat 4 (or filling an entire 3/4 waltz bar).",
    linkedExerciseId: "lb-s3-dot-ex1",
    symbolSpec: {
      kind: "dotted-half"
    },
    sandbox: {
      headline: "The +50% Dot Rule: Half (2) + Dot (+1) = 3 Beats",
      tip: "Every dot means: original duration + half of original duration. For a Half Note (2), +1 beat gives 3 full beats.",
      bpm: 64,
      wrongExample: {
        label: "Wrong Way: Treating Dotted Half as Regular 2-Beat Half Note",
        summary: "Cutting off or jumping early on Beat 3 drops a beat from the phrase.",
        timeSignature: "4/4",
        measures: [
          "G3/h@3:0[Down], D3/q@4:0[Down], R/q",
          "G3/w@3:0[Down]"
        ],
        cues: ["Beat 1: Pluck G", "Beat 2: Hold", "Beat 3: Jumped too early to D!", "Beat 4: Out of sync"]
      },
      rightExample: {
        label: "Right Way: 3 Full Beats (1–2–3) Then Eighth/Quarter Pickup",
        summary: "Hold G cleanly through Beat 3 before playing Beat 4, completing 3 + 1 = 4 beats.",
        timeSignature: "4/4",
        measures: [
          "G3/h.@3:0[Down], D3/8@4:0[Down], D3/8@4:0[Up]",
          "G3/h.@3:0[Down], R/q"
        ],
        cues: ["Beat 1: Pluck G3", "Beat 2: Hold (+0)", "Beat 3: Keep Holding (+1 dot beat!)", "Beat 4 &: Down–Up D3!"]
      }
    }
  },
  {
    id: "rhythm-dotted-quarter",
    categoryId: "rhythm",
    name: "Dotted Quarter Note (+50% Rule)",
    whatItMeans: "Quarter Note (1 beat) + 50% (1/2 beat) = 1 1/2 beats. Almost always followed by a single eighth note landing on the '&' upbeat of Beat 2.",
    howToPlay: "Count '1 - 2 - &' while holding through click 2, then pluck the following eighth note right BETWEEN clicks 2 and 3.",
    linkedExerciseId: "bw-w3-tdr-ex4",
    symbolSpec: {
      kind: "dotted-quarter"
    },
    sandbox: {
      headline: "Holding Through Click 2 to Nail the '&' Upbeat",
      tip: "Think: Beat 1 (Pluck) -> Beat 2 Click (Hold!) -> '&' (Upstroke next note) -> Beat 3 (Land cleanly!).",
      bpm: 60,
      wrongExample: {
        label: "Wrong Way: Playing Straight Quarter + Quarter (1 + 1)",
        summary: "Plucking the second note ON Beat 2 instead of waiting the extra +1/2 beat removes the syncopation.",
        timeSignature: "4/4",
        measures: [
          "G3/q@3:0[Down], A3/q@3:2[Down], G3/h@3:0[Down]",
          "C4/q@2:1[Down], D4/q@2:3[Down], C4/h@2:1[Down]"
        ],
        cues: ["Beat 1: G", "Beat 2: Too early! Picked A on click 2", "Beat 3: G", "Beat 4: G"]
      },
      rightExample: {
        label: "Right Way: Dotted Quarter (1.5) + Eighth on '2 &' (1 – Hold 2 – & – 3)",
        summary: "Hold G across Beat 2's click, then pick A with an Upstroke on '2 &' before landing back on G on Beat 3.",
        timeSignature: "4/4",
        measures: [
          "G3/q.@3:0[Down], A3/8@3:2[Up], G3/h@3:0[Down]",
          "C4/q.@2:1[Down], D4/8@2:3[Up], C4/h@2:1[Down]"
        ],
        cues: ["Beat 1: Pluck G3", "Beat 2 &: HOLD Beat 2, then Upstroke A3 on '&'!", "Beat 3: Land G3 Half Note", "Beat 4: Hold G3"]
      }
    }
  },
  {
    id: "rhythm-ties-vs-slurs",
    categoryId: "rhythm",
    name: "Ties vs. Slurs",
    whatItMeans: "A TIE curves between two identical pitches: add their values together and do NOT pluck the second note. A SLUR curves between two different pitches: play smoothly (hammer-on/pull-off or legato).",
    howToPlay: "Same pitch + curved line = TIE (hold string down, let ring, skip second pick). Different pitches = SLUR (connect notes smoothly without gaps).",
    linkedExerciseId: "bw-w3-tdr-ex1",
    symbolSpec: {
      kind: "tie-vs-slur"
    },
    sandbox: {
      headline: "Never Re-Pluck the Second Note of a Tie!",
      tip: "Look at both noteheads under a curved arc: if they sit on the EXACT same line/space, it is a Tie—hold right across the barline.",
      bpm: 64,
      wrongExample: {
        label: "Wrong Way: Mistakenly Re-Plucking Beat 1 After the Barline",
        summary: "Re-striking D3 on Bar 2 Beat 1 breaks the smooth syncopated sustain.",
        timeSignature: "4/4",
        measures: [
          "D3/h@4:0[Down], D3/q@4:0[Down], D3/q@4:0[Up]",
          "D3/q@4:0[Down], G3/q@3:0[Down], D3/h@4:0[Down]"
        ],
        cues: ["Beat 1: D3", "Beat 3: D3", "Beat 4: D3", "Bar 2 Beat 1: Oops—re-plucked D3!"]
      },
      rightExample: {
        label: "Right Way: Tied Beat 4 -> Bar 2 Beat 1 Held Without Re-Picking",
        summary: "Pluck D3 on Beat 4, then let it ring straight through Beat 1 of Bar 2 (no pick on Beat 1!).",
        timeSignature: "4/4",
        measures: [
          "D3/h@4:0[Down], D3/q@4:0[Down], D3/q~@4:0[Up]",
          "~D3/q@4:0, G3/q@3:0[Down], D3/h@4:0[Down]"
        ],
        cues: ["Beat 1: D3", "Beat 3: D3", "Beat 4: Pluck D3~ (Ring across barline!)", "Bar 2 Beat 1: HOLD Tied D3 — Don't Re-Pluck!"]
      }
    }
  },

  // =========================================================================
  // c) PITCH, KEY & ACCIDENTALS
  // =========================================================================
  {
    id: "pitch-time-sigs",
    categoryId: "pitch",
    name: "Time Signatures (4/4, 3/4, C)",
    whatItMeans: "Top number = beats per measure (4 or 3). Bottom number = which note gets 1 beat (4 = quarter note). 'C' (Common Time) is shorthand for 4/4.",
    howToPlay: "In 4/4 (or C) accent Beat 1 ('ONE-2-3-4'); in 3/4 waltz time reset back to Beat 1 after Beat 3 ('ONE-2-3 | ONE-2-3').",
    linkedExerciseId: "lb-s3-dot-ex1",
    symbolSpec: {
      kind: "time-sigs"
    },
    sandbox: {
      headline: "3/4 Waltz Pulse vs. 4/4 Common Time",
      tip: "Never accidentally add a '4th beat' at the end of a 3/4 measure! Reset directly back to Beat 1 after count 3.",
      bpm: 66,
      wrongExample: {
        label: "Wrong Way: Adding an Accidental 4th Beat into 3/4 Waltz Time",
        summary: "Waiting an extra beat before starting Measure 2 turns a 3/4 waltz into sluggish 4/4.",
        timeSignature: "4/4",
        measures: [
          "G3/q@3:0[Down], B3/q@2:0[Down], D4/q@2:3[Down], R/q",
          "G3/h.@3:0[Down], R/q"
        ],
        cues: ["Beat 1: G", "Beat 2: B", "Beat 3: D", "Oops—extra pause Beat 4!"]
      },
      rightExample: {
        label: "Right Way: Crisp 3/4 Waltz Cycle (1–2–3 | 1–2–3)",
        summary: "Count 1–2–3 evenly across Bar 1 straight into Beat 1 of Bar 2.",
        timeSignature: "3/4",
        measures: [
          "G3/q@3:0[Down], B3/q@2:0[Down], D4/q@2:3[Down]",
          "G3/h.@3:0[Down]"
        ],
        cues: ["Beat 1: Accent G3", "Beat 2: B3", "Beat 3: D4 -> Straight back to Beat 1!"]
      }
    }
  },
  {
    id: "pitch-key-sigs",
    categoryId: "pitch",
    name: "Key Signatures",
    whatItMeans: "Sharps (#) or flats (b) placed between the Clef and Time Signature apply automatically to ALL notes of that letter name across the entire piece.",
    howToPlay: "In Key of G (one # on the F line), automatically play every F at Fret 2 (F#) instead of Fret 1—even if no # sits right next to the notehead.",
    linkedExerciseId: "lb-s4-acc-ex1",
    symbolSpec: {
      kind: "key-sigs"
    },
    sandbox: {
      headline: "Key of G Automatic F# Rule",
      tip: "Scan the key signature BEFORE playing Beat 1! In Key of G, circle every F mentally—it lives on 1st String Fret 2 (F#).",
      bpm: 64,
      wrongExample: {
        label: "Wrong Way: Forgetting the Key Signature and Playing F Natural",
        summary: "Playing 1st-fret F instead of F# creates an immediate sour clash in G Major.",
        timeSignature: "4/4",
        measures: [
          "G4/q@1:3[Down], F4/q@1:1[Down], E4/q@1:0[Down], F4/q@1:1[Down]",
          "G4/w@1:3[Down]"
        ],
        cues: ["Beat 1: G (3rd Fret)", "Beat 2: Clashed F♮!", "Beat 3: Open E", "Beat 4: Clashed F♮!"]
      },
      rightExample: {
        label: "Right Way: Honoring Key of G (Automatic F# on 2nd Fret)",
        summary: "Play F# cleanly on 1st String Fret 2 throughout G–F#–E–F#–G.",
        timeSignature: "4/4",
        measures: [
          "G4/q@1:3[Down], F#4/q@1:2[Down], E4/q@1:0[Down], F#4/q@1:2[Down]",
          "G4/w@1:3[Down]"
        ],
        cues: ["Beat 1: G (Fret 3)", "Beat 2: F# (Key Sig! Fret 2)", "Beat 3: Open E", "Beat 4: F# (Fret 2) -> Home to G!"]
      }
    }
  },
  {
    id: "pitch-sharp",
    categoryId: "pitch",
    name: "Sharp (# = +1 Fret)",
    whatItMeans: "Raises the pitch of a note by one half-step (semitone). Applies to that letter name for the rest of that single measure.",
    howToPlay: "Move one fret HIGHER toward the guitar body (+1 fret toward the soundhole). F (1st fret) becomes F# (2nd fret).",
    linkedExerciseId: "lb-s4-acc-ex1",
    symbolSpec: {
      kind: "accidental",
      vexKey: "f#/4",
      acc: "#"
    },
    sandbox: {
      headline: "Shifting +1 Fret Higher for Sharps (#)",
      tip: "Sharp always means move UP the neck (+1 fret toward the body). Keep middle finger (2) poised over Fret 2 for F#.",
      bpm: 64,
      wrongExample: {
        label: "Wrong Way: Ignoring # and Staying on 1st-Fret F",
        summary: "Failing to shift up 1 fret leaves F natural unchanged.",
        timeSignature: "4/4",
        measures: [
          "E4/q@1:0[Down], F4/q@1:1[Down], F4/q@1:1[Down], G4/q@1:3[Down]",
          "F4/h@1:1[Down], E4/h@1:0[Down]"
        ],
        cues: ["Beat 1: E", "Beat 2: F (Fret 1)", "Beat 3: Oops—stayed on Fret 1!", "Beat 4: G"]
      },
      rightExample: {
        label: "Right Way: E -> F -> F# (+1 Fret!) -> G",
        summary: "Climb chromatically one fret at a time: Open (0) -> 1st Fret (F) -> 2nd Fret (F#) -> 3rd Fret (G).",
        timeSignature: "4/4",
        measures: [
          "E4/q@1:0[Down], F4/q@1:1[Down], F#4/q@1:2[Down], G4/q@1:3[Down]",
          "F#4/h@1:2[Down], G4/h@1:3[Down]"
        ],
        cues: ["Beat 1: Open E (0)", "Beat 2: F (1st Fret)", "Beat 3: F# (+1 Fret = 2nd Fret!)", "Beat 4: G (3rd Fret)"]
      }
    }
  },
  {
    id: "pitch-flat",
    categoryId: "pitch",
    name: "Flat (b = −1 Fret)",
    whatItMeans: "Lowers the pitch of a note by one half-step (semitone). Applies to that note letter for the remainder of that measure.",
    howToPlay: "Move one fret LOWER toward the tuning pegs/nut (−1 fret). Example: B (2nd str open / 3rd str 4th fret) drops down 1 fret to Bb (3rd string 3rd fret).",
    linkedExerciseId: "lb-s4-acc-ex2",
    symbolSpec: {
      kind: "accidental",
      vexKey: "bb/4",
      acc: "b"
    },
    sandbox: {
      headline: "Lowering −1 Fret Toward the Nut for Flats (b)",
      tip: "Because you can't go below fret 0 on an open B string, Bb moves down one fret on the next thicker string: 3rd string, Fret 3!",
      bpm: 64,
      wrongExample: {
        label: "Wrong Way: Playing Open B Natural Instead of Bb",
        summary: "Using open 2nd string B instead of lowering −1 fret to 3rd-string 3rd-fret Bb.",
        timeSignature: "4/4",
        measures: [
          "C4/q@2:1[Down], B3/q@2:0[Down], A3/q@3:2[Down], G3/q@3:0[Down]",
          "B3/w@2:0[Down]"
        ],
        cues: ["Beat 1: C", "Beat 2: Played B♮ instead of Bb!", "Beat 3: A", "Beat 4: G"]
      },
      rightExample: {
        label: "Right Way: C -> Bb (−1 Fret on 3rd String Fret 3) -> A -> G",
        summary: "Step smoothly downward in pitch using 3rd-string 3rd-fret Bb.",
        timeSignature: "4/4",
        measures: [
          "C4/q@2:1[Down], Bb3/q@3:3[Down], A3/q@3:2[Down], G3/q@3:0[Down]",
          "Bb3/h@3:3[Down], A3/h@3:2[Down]"
        ],
        cues: ["Beat 1: C (2nd Str Fret 1)", "Beat 2: Bb (3rd Str Fret 3!)", "Beat 3: A (3rd Str Fret 2)", "Beat 4: Open G"]
      }
    }
  },
  {
    id: "pitch-natural",
    categoryId: "pitch",
    name: "Natural (♮ = Cancel)",
    whatItMeans: "Cancels any previous sharp (#) or flat (b)—whether from earlier in the same measure or from the Key Signature—returning the note to its natural state.",
    howToPlay: "Shift back to the unaltered fret (e.g. from F# Fret 2 back −1 fret to F♮ Fret 1).",
    linkedExerciseId: "lb-s4-acc-ex1",
    symbolSpec: {
      kind: "natural-pair"
    },
    sandbox: {
      headline: "Canceling an Accidental Mid-Measure with ♮",
      tip: "Treat ♮ as a 'reset to normal' switch inside a measure before reaching the next barline.",
      bpm: 64,
      wrongExample: {
        label: "Wrong Way: Staying on F# After ♮ Appears",
        summary: "Ignoring the natural sign and repeating 2nd-fret F#.",
        timeSignature: "4/4",
        measures: [
          "F#4/q@1:2[Down], G4/q@1:3[Down], F#4/q@1:2[Down], E4/q@1:0[Down]",
          "E4/w@1:0[Down]"
        ],
        cues: ["Beat 1: F# (2)", "Beat 2: G (3)", "Beat 3: Oops—stayed on F# instead of F♮!", "Beat 4: E"]
      },
      rightExample: {
        label: "Right Way: F# (2) -> G (3) -> F♮ (1!) -> E (0)",
        summary: "Step cleanly back to 1st Fret on Beat 3 as soon as the ♮ symbol cancels F#.",
        timeSignature: "4/4",
        measures: [
          "F#4/q@1:2[Down], G4/q@1:3[Down], Fn4/q@1:1[Down], E4/q@1:0[Down]",
          "E4/w@1:0[Down]"
        ],
        cues: ["Beat 1: F# (2nd Fret)", "Beat 2: G (3rd Fret)", "Beat 3: F♮! Drop back to 1st Fret", "Beat 4: Open E -> Bar 2"]
      }
    }
  },
  {
    id: "pitch-barline-reset",
    categoryId: "pitch",
    name: "Barline Reset Rule",
    whatItMeans: "Accidentals carry ONLY until the next barline! In Bar 1, a later F after F# stays sharp automatically. Once you cross a barline into Bar 2, it resets to F♮.",
    howToPlay: "Keep playing the sharp/flat on repeats inside the SAME bar; drop back to natural immediately on the other side of the barline (unless a Key Signature governs it).",
    linkedExerciseId: "lb-s4-acc-ex1",
    symbolSpec: {
      kind: "barline-reset"
    },
    sandbox: {
      headline: "Inside Same Bar = Carries; Across Barline = Resets!",
      tip: "Remember the rule: Bar 1's Beat 3 F inherits Beat 1's F#, then the barline wipes the slate clean for Bar 2.",
      bpm: 60,
      wrongExample: {
        label: "Wrong Way: Forgetting Inside-Bar Carry OR Carrying Past Barline",
        summary: "Playing F natural too early inside Bar 1, then wrongly playing F# after the barline.",
        timeSignature: "4/4",
        measures: [
          "F#4/q@1:2[Down], G4/q@1:3[Down], F4/q@1:1[Down], E4/q@1:0[Down]",
          "F#4/h@1:2[Down], E4/h@1:0[Down]"
        ],
        cues: ["Bar 1 Beat 1: F#", "Bar 1 Beat 3: Forgot F# STILL carries here!", "Bar 2 Beat 1: Oops—carried F# past barline!", "Hold wrong note"]
      },
      rightExample: {
        label: "Right Way: F# -> G -> (Still F#) -> E | Bar 2 Resets to F♮!",
        summary: "Bar 1 keeps F# on Beat 3 (2nd Fret); crossing the barline automatically resets Beat 1 of Bar 2 to F♮ (1st Fret)!",
        timeSignature: "4/4",
        measures: [
          "F#4/q@1:2[Down], G4/q@1:3[Down], F#4/q@1:2[Down], E4/q@1:0[Down]",
          "F4/h@1:1[Down], E4/h@1:0[Down]"
        ],
        cues: ["Bar 1 Beat 1: F# (2)", "Beat 3: Still F# (2) — same bar!", "Bar 2 Beat 1: Barline Reset -> F♮ (1st Fret)!", "Beat 3: Open E"]
      }
    }
  },

  // =========================================================================
  // d) GUITAR-SPECIFIC SYMBOLS
  // =========================================================================
  {
    id: "guitar-picks",
    categoryId: "guitar",
    name: "Downstroke (∏) vs. Upstroke (V)",
    whatItMeans: "Table/bracket symbol (∏) indicates a Downstroke toward the floor; V indicates an Upstroke toward the ceiling.",
    howToPlay: "Strike downward on main beats (1, 2, 3, 4) and use crisp alternate upstrokes on '&' upbeats or repeated eighth notes for relaxed speed.",
    linkedExerciseId: "lb-s1-fe2",
    symbolSpec: {
      kind: "picks"
    },
    sandbox: {
      headline: "Alternate Picking Fluidity (∏ Down / V Up)",
      tip: "Never lift your pick way off the string between strokes—stay just millimeters from the string plane and alternate Down–Up.",
      bpm: 72,
      wrongExample: {
        label: "Wrong Way: Choppy Uneven Picking Losing Beat 4",
        summary: "Hesitating between rapid repeated notes instead of rocking smoothly Down–Up–Down–Up.",
        timeSignature: "4/4",
        measures: [
          "E4/q@1:0[Down], R/q, F4/q@1:1[Down], R/q",
          "E4/w@1:0[Down]"
        ],
        cues: ["Beat 1: Choppy Down", "Missed subdivision", "Late fret change", "Restarting"]
      },
      rightExample: {
        label: "Right Way: Relaxed ∏ V ∏ V Alternate Picking",
        summary: "Alternate Down (∏) and Up (V) strokes evenly on every pair of eighth notes.",
        timeSignature: "4/4",
        measures: [
          "E4/8@1:0[Down], E4/8@1:0[Up], F4/8@1:1[Down], F4/8@1:1[Up], G4/8@1:3[Down], G4/8@1:3[Up], F4/q@1:1[Down]",
          "E4/w@1:0[Down]"
        ],
        cues: ["Beat 1 &: Down–Up E", "Beat 2 &: Down–Up F", "Beat 3 &: Down–Up G", "Beat 4: Down F -> Resolve E"]
      }
    }
  },
  {
    id: "guitar-strings",
    categoryId: "guitar",
    name: "String Numbers (Circled ①–⑥)",
    whatItMeans: "A number inside a circle above or below a note identifies the exact string to play: ① = thinnest High E string down to ⑥ = thickest Low E string.",
    howToPlay: "① is closest to the floor; ⑥ is closest to your chin. Look at the string circle whenever the same pitch could be fretted in multiple neck positions.",
    linkedExerciseId: "lb-s1-tour",
    symbolSpec: {
      kind: "string-circles"
    },
    sandbox: {
      headline: "Mapping Thinnest ① to Thickest ⑥ Strings",
      tip: "Remember: Numbering starts from the floor UP! 1st String = thinnest (High E), 6th String = thickest bass (Low E).",
      bpm: 64,
      wrongExample: {
        label: "Wrong Way: Reversing Top-to-Bottom String Order",
        summary: "Confusing 1st string (High E) with 6th string (Low E) reverses bass and melody registers.",
        timeSignature: "4/4",
        measures: [
          "E2/q@6:0[Down], A2/q@5:0[Down], D3/q@4:0[Down], G3/q@3:0[Down]",
          "E2/w@6:0[Down]"
        ],
        cues: ["Oops: Hit Low E (6) instead of High E (1)!", "Wrong bass climb", "Upside-down strings", "Low register"]
      },
      rightExample: {
        label: "Right Way: Targeting ② B String & ③ G String Cleanly",
        summary: "Move purposefully between ① High E, ② B, and ③ G strings as directed by circled indicators.",
        timeSignature: "4/4",
        measures: [
          "E4/q@1:0[Down], B3/q@2:0[Down], G3/q@3:0[Down], B3/q@2:0[Down]",
          "E4/w@1:0[Down]"
        ],
        cues: ["Beat 1: String ① Open (High E)", "Beat 2: String ② Open (B)", "Beat 3: String ③ Open (G)", "Beat 4: String ② Open -> ①"]
      }
    }
  },
  {
    id: "guitar-fingers",
    categoryId: "guitar",
    name: "Left-Hand Finger Numbers (1–4)",
    whatItMeans: "Plain numbers 1–4 next to a note tell you which fretting finger to press: 1 = Index, 2 = Middle, 3 = Ring, 4 = Pinky.",
    howToPlay: "Assign one finger per fret in Open Position (Fret 1 = Finger 1, Fret 2 = Finger 2, Fret 3 = Finger 3, Fret 4 = Finger 4) instead of sliding 1 finger around.",
    linkedExerciseId: "lb-s1-fe3",
    symbolSpec: {
      kind: "finger-numbers"
    },
    sandbox: {
      headline: "One-Finger-Per-Fret Economy (1–2–3–4)",
      tip: "Keep fingertips curved directly behind each fret wire—your thumb isn't counted as 1–4 unless labeled 'T'.",
      bpm: 64,
      wrongExample: {
        label: "Wrong Way: Playing Slowly with Gaps While Sliding One Finger",
        summary: "Shifting your Index finger up every fret breaks smooth note connection.",
        timeSignature: "4/4",
        measures: [
          "F4/8@1:1[Down], R/8, F#4/8@1:2[Down], R/8, G4/8@1:3[Down], R/8, G#4/8@1:4[Down], R/8",
          "F4/h@1:1[Down], R/h"
        ],
        cues: ["Finger 1 gap...", "Sliding gap...", "Dropped sustain...", "Missed pinky reach"]
      },
      rightExample: {
        label: "Right Way: Smooth 1–2–3–4 Finger Walk",
        summary: "Walk cleanly up Frets 1 -> 2 -> 3 -> 4 using Index, Middle, Ring, and Pinky fingers in sequence.",
        timeSignature: "4/4",
        measures: [
          "F4/q@1:1[Down], F#4/q@1:2[Down], G4/q@1:3[Down], G#4/q@1:4[Down]",
          "G4/q@1:3[Down], F#4/q@1:2[Down], F4/h@1:1[Down]"
        ],
        cues: ["Beat 1: Finger 1 (Fret 1)", "Beat 2: Finger 2 (Fret 2)", "Beat 3: Finger 3 (Fret 3)", "Beat 4: Finger 4 Pinky (Fret 4)"]
      }
    }
  },
  {
    id: "guitar-open",
    categoryId: "guitar",
    name: "Open Strings (0)",
    whatItMeans: "'0' above a note or on a TAB string line means pluck that string completely open—with ZERO left-hand fingers pressing down.",
    howToPlay: "Keep left-hand fingers arched and hovering cleanly above the fretboard so they don't brush or accidentally mute the open string.",
    linkedExerciseId: "lb-s1-tour",
    symbolSpec: {
      kind: "open-strings"
    },
    sandbox: {
      headline: "Arched Fingers for Clear Open String (0) Resonance",
      tip: "Check your palm underside! Keep space beneath the guitar neck so your hand doesn't brush open String ① (High E) or ② (B).",
      bpm: 64,
      wrongExample: {
        label: "Wrong Way: Brushing Adjacent String During Fret Transition",
        summary: "Choking the open string early on Beat 2 instead of letting open '0' strings ring clearly.",
        timeSignature: "4/4",
        measures: [
          "B3/q@2:0[Down], R/q, E4/q@1:0[Down], R/q",
          "G3/h@3:0[Down], R/h"
        ],
        cues: ["Beat 1: B (0)", "Accidental finger touch mute!", "Beat 3: E (0)", "Cut off early!"]
      },
      rightExample: {
        label: "Right Way: Singing Open Strings ③G – ②B – ①E",
        summary: "Let every '0' string ring cleanly across open-string transitions.",
        timeSignature: "4/4",
        measures: [
          "G3/q@3:0[Down], B3/q@2:0[Down], E4/q@1:0[Down], B3/q@2:0[Down]",
          "G3/w@3:0[Down]"
        ],
        cues: ["Beat 1: Open ③ (0) G", "Beat 2: Open ② (0) B", "Beat 3: Open ① (0) High E", "Beat 4: Open ② (0) B"]
      }
    }
  },
  {
    id: "guitar-muting",
    categoryId: "guitar",
    name: "Right-Hand Palm / Finger Muting",
    whatItMeans: "Stopping active string vibration on a rest beat by lightly touching the strings with the picking palm heel or right-hand fingers (or relaxing left-hand pressure).",
    howToPlay: "Avoid slamming onto the strings! Gently set the edge of your picking hand across the string surface right on the beat of the rest.",
    linkedExerciseId: "lb-s3-rests-ex1",
    symbolSpec: {
      kind: "muting"
    },
    sandbox: {
      headline: "Clean Right-Hand Damping on Rest Beats",
      tip: "Practice plucking Beat 1 -> dropping picking palm edge right onto the string on Beat 2 ('Pluck — Touch!').",
      bpm: 64,
      wrongExample: {
        label: "Wrong Way: Open Strings Bleeding Together Without Muting",
        summary: "Letting G3 and D3 ring together right through beats 2 and 4.",
        timeSignature: "4/4",
        measures: [
          "G3/h@3:0[Down], A3/h@3:2[Down]",
          "G3/w@3:0[Down]"
        ],
        cues: ["Beat 1: G", "Still ringing into Beat 2 rest!", "Beat 3: A", "Still ringing into Beat 4 rest!"]
      },
      rightExample: {
        label: "Right Way: Pluck Beat 1 -> Soft Palm Touch Beat 2",
        summary: "Instant, noise-free damping on Beats 2 and 4 creates crisp rhythmic clarity.",
        timeSignature: "4/4",
        measures: [
          "G3/q@3:0[Down], R/q, A3/q@3:2[Down], R/q",
          "G3/h@3:0[Down], R/h"
        ],
        cues: ["Beat 1: Pluck Open G (0)", "Beat 2: Mute String with Palm!", "Beat 3: Pluck A (2nd Fret)", "Beat 4: Mute String with Palm!"]
      }
    }
  }
];

/**
 * 60-Second Sight-Reading & Rhythm Flashcard Quiz Bank (Zero TABs rendered on cards)
 */
export const PRIMER_QUIZ_BANK = [
  // Open-position Treble Staff pitch flashcards (Standard Staff only, NO TAB!)
  {
    id: "q-pitch-e4",
    categoryId: "staff",
    tag: "Treble Staff · 1st String",
    prompt: "Identify this note on the Standard Staff (No TAB):",
    spec: { kind: "single-pitch", vexKey: "e/5", acc: null, duration: "q" },
    audioEvent: { note: "High E", string: 1, fret: 0, pick: "Down", type: "play" },
    options: ["E — 1st String Open (Space 4)", "F — 1st String Fret 1 (Line 5)", "D — 2nd String Fret 3 (Line 4)", "C — 2nd String Fret 1 (Space 3)"],
    correctIndex: 0,
    explanation: "4th space from the bottom is E (High E), played on the Open 1st String."
  },
  {
    id: "q-pitch-f4",
    categoryId: "staff",
    tag: "Treble Staff · 1st String",
    prompt: "Identify this note sitting on Line 5 (top line):",
    spec: { kind: "single-pitch", vexKey: "f/5", acc: null, duration: "q" },
    audioEvent: { note: "F", string: 1, fret: 1, pick: "Down", type: "play" },
    options: ["G — 1st String Fret 3", "F — 1st String Fret 1 (Line 5)", "E — 1st String Open", "D — 2nd String Fret 3"],
    correctIndex: 1,
    explanation: "Top line (Line 5: E-G-B-D-F) is F, fretted on 1st String, Fret 1."
  },
  {
    id: "q-pitch-g4",
    categoryId: "staff",
    tag: "Treble Staff · 1st String",
    prompt: "Identify this note sitting directly above Line 5:",
    spec: { kind: "single-pitch", vexKey: "g/5", acc: null, duration: "q" },
    audioEvent: { note: "G", string: 1, fret: 3, pick: "Down", type: "play" },
    options: ["F — 1st String Fret 1", "A — 1st String Fret 5", "G — 1st String Fret 3", "E — 1st String Open"],
    correctIndex: 2,
    explanation: "Space directly atop Line 5 is G, played on 1st String, Fret 3."
  },
  {
    id: "q-pitch-b3",
    categoryId: "staff",
    tag: "Treble Staff · 2nd String",
    prompt: "Identify this note centered on Line 3 (middle line):",
    spec: { kind: "single-pitch", vexKey: "b/4", acc: null, duration: "q" },
    audioEvent: { note: "B", string: 2, fret: 0, pick: "Down", type: "play" },
    options: ["C — 2nd String Fret 1", "A — 3rd String Fret 2", "D — 2nd String Fret 3", "B — 2nd String Open (Line 3)"],
    correctIndex: 3,
    explanation: "Middle line (Line 3: E-G-B-D-F) is B, played Open on the 2nd String."
  },
  {
    id: "q-pitch-c4",
    categoryId: "staff",
    tag: "Treble Staff · 2nd String",
    prompt: "Identify this note inside Space 3:",
    spec: { kind: "single-pitch", vexKey: "c/5", acc: null, duration: "q" },
    audioEvent: { note: "C", string: 2, fret: 1, pick: "Down", type: "play" },
    options: ["C — 2nd String Fret 1 (Space 3)", "E — 1st String Open (Space 4)", "A — 3rd String Fret 2 (Space 2)", "B — 2nd String Open (Line 3)"],
    correctIndex: 0,
    explanation: "Space 3 (F-A-C-E) is C, fretted on 2nd String, Fret 1."
  },
  {
    id: "q-pitch-d4",
    categoryId: "staff",
    tag: "Treble Staff · 2nd String",
    prompt: "Identify this note on Line 4:",
    spec: { kind: "single-pitch", vexKey: "d/5", acc: null, duration: "q" },
    audioEvent: { note: "D", string: 2, fret: 3, pick: "Down", type: "play" },
    options: ["C — 2nd String Fret 1", "D — 2nd String Fret 3 (Line 4)", "E — 1st String Open", "B — 2nd String Open"],
    correctIndex: 1,
    explanation: "Line 4 (E-G-B-D-F) is D, played on 2nd String, Fret 3."
  },
  {
    id: "q-pitch-g3",
    categoryId: "staff",
    tag: "Treble Clef Anchor · 3rd String",
    prompt: "The Treble G Clef loops around this line. What note is it?",
    spec: { kind: "single-pitch", vexKey: "g/4", acc: null, duration: "q" },
    audioEvent: { note: "G", string: 3, fret: 0, pick: "Down", type: "play" },
    options: ["F — 4th String Fret 3", "E — 4th String Fret 2", "G — 3rd String Open (Line 2)", "A — 3rd String Fret 2"],
    correctIndex: 2,
    explanation: "Line 2 is G (open 3rd string)—marked directly by the spiral of the Treble Clef."
  },
  {
    id: "q-pitch-c3-ledger",
    categoryId: "staff",
    tag: "Ledger Line · 5th String",
    prompt: "Identify this note sitting on the first ledger line below the staff:",
    spec: { kind: "single-pitch", vexKey: "c/4", acc: null, duration: "q" },
    audioEvent: { note: "C", string: 5, fret: 3, pick: "Down", type: "play" },
    options: ["D — 4th String Open", "C — 5th String Fret 3 (Middle C)", "E — 4th String Fret 2", "A — 5th String Open"],
    correctIndex: 1,
    explanation: "One ledger line below Treble staff is written Middle C (C3 on 5th String Fret 3)."
  },
  // Rhythm, Dots, Ties & Rests questions
  {
    id: "q-rhythm-whole-rest",
    categoryId: "rhythm",
    tag: "Rests & Silence",
    prompt: "This red block hangs BELOW Line 4. What does it require?",
    spec: { kind: "single-rest", duration: "wr", vexKey: "d/5" },
    audioEvent: null,
    options: ["Half Rest — 2 beats silence", "Whole Rest — 4 beats silence (mute all)", "Quarter Rest — 1 beat silence", "Hold note across barline"],
    correctIndex: 1,
    explanation: "A block hanging below Line 4 is a Whole Rest = 4 full beats of silence."
  },
  {
    id: "q-rhythm-half-rest",
    categoryId: "rhythm",
    tag: "Rests & Silence",
    prompt: "This red block sits ON TOP OF Line 3 (like a hat). What is it?",
    spec: { kind: "single-rest", duration: "hr", vexKey: "b/4" },
    audioEvent: null,
    options: ["Whole Rest (4 beats)", "Dotted Half Note (3 beats)", "Half Rest — 2 beats silence", "Eighth Rest (1/2 beat)"],
    correctIndex: 2,
    explanation: "Sits on Line 3 like a hat = Half Rest (2 full beats of palm-muted silence)."
  },
  {
    id: "q-rhythm-dotted-quarter",
    categoryId: "rhythm",
    tag: "Dots & +50% Rule",
    prompt: "How many beats does this Dotted Quarter Note receive in 4/4?",
    spec: { kind: "single-pitch", vexKey: "g/4", acc: null, duration: "q", isDotted: true },
    audioEvent: { note: "G", string: 3, fret: 0, pick: "Down", type: "play" },
    options: ["3 beats", "1 1/2 beats (1 + 1/2)", "2 beats", "1/2 beat"],
    correctIndex: 1,
    explanation: "A dot adds +50%: Quarter (1) + 1/2 = 1 1/2 beats."
  },
  {
    id: "q-rhythm-tie",
    categoryId: "rhythm",
    tag: "Ties vs. Slurs",
    prompt: "How do you play the second G4 connected by this Tie?",
    spec: { kind: "tie-pair", key1: "g/4", key2: "g/4" },
    audioEvent: { note: "G", string: 3, fret: 0, pick: "Down", type: "play" },
    options: ["Re-pluck the second note louder", "Mute on Beat 2", "Do NOT pluck — keep holding seamlessly!", "Hammer-on 1 fret higher"],
    correctIndex: 2,
    explanation: "Both noteheads share the exact same pitch—it's a Tie, so pluck once and hold without re-picking!"
  },
  // Pitch, Key & Accidentals
  {
    id: "q-pitch-fsharp",
    categoryId: "pitch",
    tag: "Accidentals · # Sharp",
    prompt: "How do you play this F# on the 1st string?",
    spec: { kind: "single-pitch", vexKey: "f#/5", acc: "#", duration: "q" },
    audioEvent: { note: "F#", string: 1, fret: 2, pick: "Down", type: "play" },
    options: ["1st String Fret 1 (Natural)", "1st String Fret 2 (+1 fret higher!)", "1st String Open (0)", "1st String Fret 3"],
    correctIndex: 1,
    explanation: "A sharp (#) raises pitch by +1 fret toward the soundhole: F (Fret 1) becomes F# (Fret 2)."
  },
  {
    id: "q-pitch-bflat",
    categoryId: "pitch",
    tag: "Accidentals · b Flat",
    prompt: "How do you fret this Bb in open position?",
    spec: { kind: "single-pitch", vexKey: "bb/4", acc: "b", duration: "q" },
    audioEvent: { note: "Bb", string: 3, fret: 3, pick: "Down", type: "play" },
    options: ["2nd String Open", "2nd String Fret 1", "3rd String Fret 3 (−1 fret below B)", "3rd String Open"],
    correctIndex: 2,
    explanation: "Flat (b) lowers B by 1 half-step to Bb: play 3rd String Fret 3."
  },
  // Guitar-Specific
  {
    id: "q-guitar-downstroke",
    categoryId: "guitar",
    tag: "Picking Direction",
    prompt: "What right-hand stroke does the (∏) symbol command?",
    spec: { kind: "pick-symbol", stroke: "down" },
    audioEvent: { note: "High E", string: 1, fret: 0, pick: "Down", type: "play" },
    options: ["Upstroke (V)", "Hammer-On", "Downstroke toward the floor", "Palm Mute Rest"],
    correctIndex: 2,
    explanation: "∏ = Downstroke toward the floor; V = Upstroke back toward the ceiling."
  }
];
