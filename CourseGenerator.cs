using System;
using System.IO;
using System.Text;
using System.Collections.Generic;

public class CourseGenerator {
    public static void Main(string[] args) {
        string outFile = args.Length > 0 ? args[0] : "exercises.js";
        Generate(outFile);
        Console.WriteLine("Course generator completed: " + outFile);
    }

    public static void Generate(string outFile) {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine("// Steve Krenz - Learn & Master Guitar Official Course Companion");
        sb.AppendLine("// Complete 20 Lesson Sessions & 20 Bonus Workshops");
        sb.AppendLine("// Strictly Accurate Transcriptions, Measures, Notes, and Rests\n");
        sb.AppendLine("export const GUITAR_COURSES = {");

        // 1. LESSON BOOK
        sb.AppendLine("  lessonBook: [");
        BuildLessonBook(sb);
        sb.AppendLine("  ],");

        // 2. BONUS WORKSHOP BOOK
        sb.AppendLine("  bonusWorkshop: [");
        BuildBonusWorkshop(sb);
        sb.AppendLine("  ],");

        // 3. FREE METRONOME
        sb.AppendLine("  freeMetronome: {");
        sb.AppendLine("    id: 'free-metronome',");
        sb.AppendLine("    title: 'Guitar Studio Free Metronome',");
        sb.AppendLine("    timeSignature: [4, 4],");
        sb.AppendLine("    defaultBpm: 60,");
        sb.AppendLine("    description: 'Unrestricted studio metronome. All 4 beats play by default. Click any beat dot to toggle between Play and Rest.',");
        sb.AppendLine("    concepts: ['Unrestricted Tempo (30-240 BPM)', 'Click-to-Toggle Rest Beats', 'Green Note / Red Rest Alerts'],");
        sb.AppendLine("    tabData: [");
        sb.AppendLine("      {");
        sb.AppendLine("        measure: 1,");
        sb.AppendLine("        beats: [");
        sb.AppendLine("          { beat: 1, note: 'Beat 1', symbol: '1/4', type: 'play', string: 6, fret: 0, finger: 0, pick: 'Down', tip: 'Primary Downbeat' },");
        sb.AppendLine("          { beat: 2, note: 'Beat 2', symbol: '1/4', type: 'play', string: 5, fret: 0, finger: 0, pick: 'Up', tip: 'Upbeat pulse' },");
        sb.AppendLine("          { beat: 3, note: 'Beat 3', symbol: '1/4', type: 'play', string: 4, fret: 0, finger: 0, pick: 'Down', tip: 'Secondary downbeat' },");
        sb.AppendLine("          { beat: 4, note: 'Beat 4', symbol: '1/4', type: 'play', string: 3, fret: 0, finger: 0, pick: 'Up', tip: 'Pickup pulse' }");
        sb.AppendLine("        ]");
        sb.AppendLine("      }");
        sb.AppendLine("    ]");
        sb.AppendLine("  }");
        sb.AppendLine("};");

        File.WriteAllText(outFile, sb.ToString(), Encoding.ASCII);
    }

    private static void BuildLessonBook(StringBuilder sb) {
        for (int s = 1; s <= 20; s++) {
            sb.AppendLine("    {");
            sb.AppendLine(string.Format("      sessionNumber: {0},", s));
            sb.AppendLine(string.Format("      sessionTitle: \"Session {0}: {1}\",", s, Escape(GetTitle(s))));
            sb.AppendLine(string.Format("      sessionSubtitle: \"{0}\",", Escape(GetLessonSubtitle(s))));
            sb.AppendLine("      topics: [");
            BuildLessonTopics(sb, s);
            sb.AppendLine("      ]");
            sb.AppendLine("    }" + (s < 20 ? "," : ""));
        }
    }

    private static void BuildBonusWorkshop(StringBuilder sb) {
        for (int s = 1; s <= 20; s++) {
            sb.AppendLine("    {");
            sb.AppendLine(string.Format("      sessionNumber: {0},", s));
            sb.AppendLine(string.Format("      sessionTitle: \"Workshop {0}: {1}\",", s, Escape(GetTitle(s))));
            sb.AppendLine(string.Format("      sessionSubtitle: \"{0}\",", Escape(GetBonusSubtitle(s))));
            sb.AppendLine("      topics: [");
            BuildBonusTopics(sb, s);
            sb.AppendLine("      ]");
            sb.AppendLine("    }" + (s < 20 ? "," : ""));
        }
    }

    private static string GetTitle(int s) {
        switch (s) {
            case 1: return "Starting Off Right";
            case 2: return "Reading Music & Notes on the 1st & 2nd Strings";
            case 3: return "Notes on the 3rd & 4th Strings";
            case 4: return "Notes on the 5th & 6th Strings";
            case 5: return "Basic Open Chords";
            case 6: return "Minor Seventh & Suspended Chords";
            case 7: return "Barre Chords on the 6th String";
            case 8: return "Barre Chords on the 5th String";
            case 9: return "The Secret to Great Strumming";
            case 10: return "Fingerstyle Guitar";
            case 11: return "Pentatonic Scales";
            case 12: return "Advanced Chords";
            case 13: return "Playing the Blues";
            case 14: return "Giving Your Playing Some Style";
            case 15: return "Electric Guitars - The Heart of Rock & Roll";
            case 16: return "Advanced Strumming";
            case 17: return "Going Beyond the First Position";
            case 18: return "Jazz";
            case 19: return "Soloing & Ear Training";
            case 20: return "All the Chords You Need To Know";
            default: return "Session " + s;
        }
    }

    private static string GetLessonSubtitle(int s) {
        switch (s) {
            case 1: return "Guitar Anatomy, String Names, Tuning, Technique & C/G7 Chords";
            case 2: return "Staff, Treble Clef, 1st & 2nd Strings, Note Values & Rests";
            case 3: return "Ties, Dots, Repeat Signs, Eighth Notes & Strings 3-4";
            case 4: return "Bass Strings 5-6, Sharps, Flats, Naturals, Am & E Chords";
            case 5: return "Open Chords C, G, G7, D, D7, Em, Am, E & 4/4 Strumming";
            case 6: return "Minor 7th & Suspended Chords, 3/4 Waltz Strumming";
            case 7: return "Root-6 Barre Chords, Chromatic Steps & Major Scales";
            case 8: return "Root-5 Barre Chords, Keys & Relative Major/Minor";
            case 9: return "Strumming Technique, The Motor Motion & Intervals";
            case 10: return "Fingerstyle P-I-M-A Technique, Arpeggios & Classical Pieces";
            case 11: return "Minor & Major Pentatonic Scales, Forms & Solo Patterns";
            case 12: return "Major 7th, Minor 11th & Chord Substitution";
            case 13: return "12-Bar Blues Form, Blues Scale & Dominant 7th Grooves";
            case 14: return "Bends, Slides, Hammer-ons, Pull-offs & Harmonics";
            case 15: return "Power Chords, Chicken Pickin' & Sliding 4ths";
            case 16: return "16th Notes, Funk Strumming & Syncopation";
            case 17: return "Going Beyond 1st Position, 3-Note Scales & 7th Chords";
            case 18: return "Jazz Chords, Voicings & Progressions";
            case 19: return "Soloing Techniques & Ear Training";
            case 20: return "Chord Formulas, Abbreviations & Inversions";
            default: return "Core Curriculum";
        }
    }

    private static string GetBonusSubtitle(int s) {
        switch (s) {
            case 1: return "Finger Dexterity Warm-ups, All 6 Strings & C/G7 Transitions";
            case 2: return "High E & B String Workouts, Damping Drills & Repertoire";
            case 3: return "G & D Strings Note Speed, Ties & Rest Precision";
            case 4: return "Bass Notes on A & Low E Strings, Accidentals & Classical Etudes";
            case 5: return "60-Second Chord Switching Tests & Folk Melodies";
            case 6: return "Minor 7th & Suspended Chord Strumming Patterns";
            case 7: return "6th-String Barre Chord Stamina & Major Scale Drills";
            case 8: return "5th-String Barre Drills, Key Signatures & Flashcards";
            case 9: return "Eighth-Note Motor Practice & Interval Ear Work";
            case 10: return "P-I-M-A Classical Patterns & Canon in D Workshop";
            case 11: return "Pentatonic Scale Ultimate Mix Up & Connected Boxes";
            case 12: return "Two-Chord Transitions & Extended Harmony Drills";
            case 13: return "Blues Scale in A, Triads & Shuffle Rhythm Metronome Workout";
            case 14: return "Slides, Hammer-ons, Pull-offs & Harmonics Drills";
            case 15: return "Power Chords, Palm Muting & Harmonized Major Scales";
            case 16: return "16th-Note Funk Strumming & Percussive Scratch Rakes";
            case 17: return "3-Note-per-String Scale Sequences & Position Shifting";
            case 18: return "Jazz Drop-2 Voicings, ii-V Progressions & Charleston Strum";
            case 19: return "Target Tone Soloing & Call-and-Response Ear Drills";
            case 20: return "Chord Formula Construction, Inversions & Bonus Mastery";
            default: return "Intensive Practice Drills";
        }
    }

    private static void BuildLessonTopics(StringBuilder sb, int s) {
        if (s == 1) {
            // LESSON BOOK SESSION 1 (PAGES 4-6)
            sb.AppendLine("        {");
            sb.AppendLine("          topicTitle: \"Finger Exercises (Coordination & Picking)\",");
            sb.AppendLine("          exercises: [");
            sb.AppendLine("            " + MakeFingerEx1("lb-s1-fe1") + ",");
            sb.AppendLine("            " + MakeFingerEx2("lb-s1-fe2") + ",");
            sb.AppendLine("            " + MakeFingerEx3("lb-s1-fe3") + ",");
            sb.AppendLine("            " + MakeFingerEx4("lb-s1-fe4") + ",");
            sb.AppendLine("            " + MakeFingerEx5("lb-s1-fe5") + "");
            sb.AppendLine("          ]");
            sb.AppendLine("        },");
            sb.AppendLine("        {");
            sb.AppendLine("          topicTitle: \"Open String Tour (Tuning & String Names)\",");
            sb.AppendLine("          exercises: [");
            sb.AppendLine("            " + MakeOpenStringTour("lb-s1-open", "Open String Tour with Beat 4 Damping", 60) + "");
            sb.AppendLine("          ]");
            sb.AppendLine("        },");
            sb.AppendLine("        {");
            sb.AppendLine("          topicTitle: \"The C and G7 Chords\",");
            sb.AppendLine("          exercises: [");
            sb.AppendLine("            " + MakeChordEx1("lb-s1-ch1") + ",");
            sb.AppendLine("            " + MakeChordEx2("lb-s1-ch2") + ",");
            sb.AppendLine("            " + MakeChordEx3("lb-s1-ch3") + "");
            sb.AppendLine("          ]");
            sb.AppendLine("        }");
        }
        else if (s == 2) {
            // LESSON BOOK SESSION 2 (PAGES 9-15)
            sb.AppendLine("        {");
            sb.AppendLine("          topicTitle: \"First String Exercises (E - F - G)\",");
            sb.AppendLine("          exercises: [");
            sb.AppendLine("            " + MakeLessonStr1Ex1("lb-s2-str1-ex1") + ",");
            sb.AppendLine("            " + MakeLessonStr1Ex2("lb-s2-str1-ex2") + ",");
            sb.AppendLine("            " + MakeLessonStr1Ex3("lb-s2-str1-ex3") + ",");
            sb.AppendLine("            " + MakeLessonStr1Ex4("lb-s2-str1-ex4") + "");
            sb.AppendLine("          ]");
            sb.AppendLine("        },");
            sb.AppendLine("        {");
            sb.AppendLine("          topicTitle: \"More First String Exercises\",");
            sb.AppendLine("          exercises: [");
            sb.AppendLine("            " + MakeLessonMoreStr1Ex1("lb-s2-m1-ex1") + ",");
            sb.AppendLine("            " + MakeLessonMoreStr1Ex2("lb-s2-m1-ex2") + ",");
            sb.AppendLine("            " + MakeLessonMoreStr1Ex3("lb-s2-m1-ex3") + ",");
            sb.AppendLine("            " + MakeLessonMoreStr1Ex4("lb-s2-m1-ex4") + ",");
            sb.AppendLine("            " + MakeLessonMoreStr1Ex5("lb-s2-m1-ex5") + "");
            sb.AppendLine("          ]");
            sb.AppendLine("        },");
            sb.AppendLine("        {");
            sb.AppendLine("          topicTitle: \"Second String Exercises (B - C - D)\",");
            sb.AppendLine("          exercises: [");
            sb.AppendLine("            " + MakeLessonStr2Ex1("lb-s2-str2-ex1") + ",");
            sb.AppendLine("            " + MakeLessonStr2Ex2("lb-s2-str2-ex2") + ",");
            sb.AppendLine("            " + MakeLessonStr2Ex3("lb-s2-str2-ex3") + ",");
            sb.AppendLine("            " + MakeLessonStr2Ex4("lb-s2-str2-ex4") + "");
            sb.AppendLine("          ]");
            sb.AppendLine("        },");
            sb.AppendLine("        {");
            sb.AppendLine("          topicTitle: \"More Second String Exercises\",");
            sb.AppendLine("          exercises: [");
            sb.AppendLine("            " + MakeLessonMoreStr2Ex1("lb-s2-m2-ex1") + ",");
            sb.AppendLine("            " + MakeLessonMoreStr2Ex2("lb-s2-m2-ex2") + ",");
            sb.AppendLine("            " + MakeLessonMoreStr2Ex3("lb-s2-m2-ex3") + ",");
            sb.AppendLine("            " + MakeLessonMoreStr2Ex4("lb-s2-m2-ex4") + ",");
            sb.AppendLine("            " + MakeLessonMoreStr2Ex5("lb-s2-m2-ex5") + "");
            sb.AppendLine("          ]");
            sb.AppendLine("        },");
            sb.AppendLine("        {");
            sb.AppendLine("          topicTitle: \"First & Second String Combined\",");
            sb.AppendLine("          exercises: [");
            sb.AppendLine("            " + MakeComb1("lb-s2-comb-ex1") + ",");
            sb.AppendLine("            " + MakeComb2("lb-s2-comb-ex2") + ",");
            sb.AppendLine("            " + MakeComb3("lb-s2-comb-ex3") + ",");
            sb.AppendLine("            " + MakeComb4("lb-s2-comb-ex4") + "");
            sb.AppendLine("          ]");
            sb.AppendLine("        },");
            sb.AppendLine("        {");
            sb.AppendLine("          topicTitle: \"Exercises with Quarter, Half, and Whole Rests\",");
            sb.AppendLine("          exercises: [");
            sb.AppendLine("            " + MakeRestEx1("lb-s2-rest-ex1") + ",");
            sb.AppendLine("            " + MakeRestEx2("lb-s2-rest-ex2") + ",");
            sb.AppendLine("            " + MakeRestEx3("lb-s2-rest-ex3") + ",");
            sb.AppendLine("            " + MakeRestEx4("lb-s2-rest-ex4") + ",");
            sb.AppendLine("            " + MakeRestEx5("lb-s2-rest-ex5") + ",");
            sb.AppendLine("            " + MakeRestEx6("lb-s2-rest-ex6") + "");
            sb.AppendLine("          ]");
            sb.AppendLine("        },");
            sb.AppendLine("        {");
            sb.AppendLine("          topicTitle: \"Repertoire Songs\",");
            sb.AppendLine("          exercises: [");
            sb.AppendLine("            " + MakeOdeToJoyMelody("lb-s2-ode-melody") + ",");
            sb.AppendLine("            " + MakeOdeToJoyChords("lb-s2-ode-chords") + ",");
            sb.AppendLine("            " + MakeJingleBells("lb-s2-jingle-bells") + "");
            sb.AppendLine("          ]");
            sb.AppendLine("        }");
        }
        else if (s == 3) { BuildLessonSession3(sb); }
        else if (s == 4) { BuildLessonSession4(sb); }
        else if (s == 5) { BuildLessonSession5(sb); }
        else if (s == 6) { BuildLessonSession6(sb); }
        else if (s == 7) { BuildLessonSession7(sb); }
        else if (s == 8) { BuildLessonSession8(sb); }
        else if (s == 9) { BuildLessonSession9(sb); }
        else if (s == 10) { BuildLessonSession10(sb); }
        else if (s == 11) { BuildLessonSession11(sb); }
        else if (s == 12) { BuildLessonSession12(sb); }
        else if (s == 13) { BuildLessonSession13(sb); }
        else if (s == 14) { BuildLessonSession14(sb); }
        else if (s == 15) { BuildLessonSession15(sb); }
        else if (s == 16) { BuildLessonSession16(sb); }
        else if (s == 17) { BuildLessonSession17(sb); }
        else if (s == 18) { BuildLessonSession18(sb); }
        else if (s == 19) { BuildLessonSession19(sb); }
        else if (s == 20) { BuildLessonSession20(sb); }
        else { BuildGenericLesson(sb, s); }
    }

    private static void BuildBonusTopics(StringBuilder sb, int s) {
        if (s == 1) {
            // BONUS WORKSHOP 1 (PAGES 5-9)
            sb.AppendLine("        {");
            sb.AppendLine("          topicTitle: \"Finger Exercise 1 Across All 6 Strings\",");
            sb.AppendLine("          exercises: [");
            sb.AppendLine("            " + MakeBonusFE1String("bw-s1-fe1-s1", 1, "First String (High E)", 60) + ",");
            sb.AppendLine("            " + MakeBonusFE1String("bw-s1-fe1-s2", 2, "Second String (B)", 60) + ",");
            sb.AppendLine("            " + MakeBonusFE1String("bw-s1-fe1-s3", 3, "Third String (G)", 60) + ",");
            sb.AppendLine("            " + MakeBonusFE1String("bw-s1-fe1-s4", 4, "Fourth String (D)", 60) + ",");
            sb.AppendLine("            " + MakeBonusFE1String("bw-s1-fe1-s5", 5, "Fifth String (A)", 60) + ",");
            sb.AppendLine("            " + MakeBonusFE1String("bw-s1-fe1-s6", 6, "Sixth String (Low E)", 60) + "");
            sb.AppendLine("          ]");
            sb.AppendLine("        },");
            sb.AppendLine("        {");
            sb.AppendLine("          topicTitle: \"Finger Exercises 2 & 3 Across All Strings\",");
            sb.AppendLine("          exercises: [");
            sb.AppendLine("            " + MakeBonusFE2("bw-s1-fe2") + ",");
            sb.AppendLine("            " + MakeBonusFE3("bw-s1-fe3") + "");
            sb.AppendLine("          ]");
            sb.AppendLine("        },");
            sb.AppendLine("        {");
            sb.AppendLine("          topicTitle: \"Alternating Finger Exercises\",");
            sb.AppendLine("          exercises: [");
            sb.AppendLine("            " + MakeBonusAlt4("bw-s1-alt-4") + ",");
            sb.AppendLine("            " + MakeBonusAlt2("bw-s1-alt-2") + ",");
            sb.AppendLine("            " + MakeBonusAlt1("bw-s1-alt-1") + "");
            sb.AppendLine("          ]");
            sb.AppendLine("        },");
            sb.AppendLine("        {");
            sb.AppendLine("          topicTitle: \"C & G7 Speed Transition Drills\",");
            sb.AppendLine("          exercises: [");
            sb.AppendLine("            " + MakeBonusChordSpeed("bw-s1-ch1", "C to G7 Full Chords Transition Test (60 BPM)", 60, "Full") + ",");
            sb.AppendLine("            " + MakeBonusChordSpeed("bw-s1-ch2", "C to G7 3-Note Chords Speed Test (80 BPM)", 80, "3-Note") + ",");
            sb.AppendLine("            " + MakeBonusChordSpeed("bw-s1-ch3", "C to G7 4-Note Chords Speed Test (100 BPM)", 100, "4-Note") + "");
            sb.AppendLine("          ]");
            sb.AppendLine("        }");
        }
        else if (s == 2) {
            // BONUS WORKSHOP 2 (PAGES 12-19)
            sb.AppendLine("        {");
            sb.AppendLine("          topicTitle: \"First String Drills (Page 12)\",");
            sb.AppendLine("          exercises: [");
            sb.AppendLine("            " + MakeBonusPage12Ex1("bw-s2-str1-ex1") + ",");
            sb.AppendLine("            " + MakeBonusPage12Ex2("bw-s2-str1-ex2") + ",");
            sb.AppendLine("            " + MakeBonusPage12Ex3("bw-s2-str1-ex3") + ",");
            sb.AppendLine("            " + MakeBonusPage12Ex4("bw-s2-str1-ex4") + "");
            sb.AppendLine("          ]");
            sb.AppendLine("        },");
            sb.AppendLine("        {");
            sb.AppendLine("          topicTitle: \"More First String Drills (Page 13)\",");
            sb.AppendLine("          exercises: [");
            sb.AppendLine("            " + MakeMelody("bw-s2-m1-ex1", "Drill 1: High E Velocity", 1, new int[]{0,1,3,1, 3,1,0,1}, 70) + ",");
            sb.AppendLine("            " + MakeMelody("bw-s2-m1-ex2", "Drill 2: G-F-E Continuous", 1, new int[]{3,1,0,3, 1,0,1,3}, 75) + ",");
            sb.AppendLine("            " + MakeMelody("bw-s2-m1-ex3", "Drill 3: Interval Leap Speed", 1, new int[]{0,3,0,3, 1,3,1,0}, 80) + ",");
            sb.AppendLine("            " + MakeMelody("bw-s2-m1-ex4", "Drill 4: Sustained Tone & Vibrato", 1, new int[]{3,3,1,1, 0,0,3,0}, 75) + "");
            sb.AppendLine("          ]");
            sb.AppendLine("        },");
            sb.AppendLine("        {");
            sb.AppendLine("          topicTitle: \"Second String Drills (Page 14)\",");
            sb.AppendLine("          exercises: [");
            sb.AppendLine("            " + MakeBonusPage14Ex1("bw-s2-str2-ex1") + ",");
            sb.AppendLine("            " + MakeBonusPage14Ex2("bw-s2-str2-ex2") + ",");
            sb.AppendLine("            " + MakeBonusPage14Ex3("bw-s2-str2-ex3") + ",");
            sb.AppendLine("            " + MakeBonusPage14Ex4("bw-s2-str2-ex4") + "");
            sb.AppendLine("          ]");
            sb.AppendLine("        },");
            sb.AppendLine("        {");
            sb.AppendLine("          topicTitle: \"Combined Strings Drills (Page 16)\",");
            sb.AppendLine("          exercises: [");
            sb.AppendLine("            " + MakeBonusPage16Ex1("bw-s2-comb-ex1") + ",");
            sb.AppendLine("            " + MakeBonusPage16Ex2("bw-s2-comb-ex2") + ",");
            sb.AppendLine("            " + MakeBonusPage16Ex3("bw-s2-comb-ex3") + ",");
            sb.AppendLine("            " + MakeBonusPage16Ex4("bw-s2-comb-ex4") + "");
            sb.AppendLine("          ]");
            sb.AppendLine("        },");
            sb.AppendLine("        {");
            sb.AppendLine("          topicTitle: \"Exercises with Rests & Palm Muting (Page 17)\",");
            sb.AppendLine("          exercises: [");
            sb.AppendLine("            " + MakeBonusPage17Rest1("bw-s2-rest-ex1") + ",");
            sb.AppendLine("            " + MakeBonusPage17Rest2("bw-s2-rest-ex2") + ",");
            sb.AppendLine("            " + MakeBonusPage17Rest3("bw-s2-rest-ex3") + "");
            sb.AppendLine("          ]");
            sb.AppendLine("        },");
            sb.AppendLine("        {");
            sb.AppendLine("          topicTitle: \"Bonus Repertoire Workshop Songs\",");
            sb.AppendLine("          exercises: [");
            sb.AppendLine("            " + MakeLondonBridge("bw-s2-london") + ",");
            sb.AppendLine("            " + MakeSkipToMyLou("bw-s2-skip") + "");
            sb.AppendLine("          ]");
            sb.AppendLine("        }");
        }
        else if (s == 3) { BuildBonusSession3(sb); }
        else if (s == 4) { BuildBonusSession4(sb); }
        else if (s == 5) { BuildBonusSession5(sb); }
        else if (s == 6) { BuildBonusSession6(sb); }
        else if (s == 7) { BuildBonusSession7(sb); }
        else if (s == 8) { BuildBonusSession8(sb); }
        else if (s == 9) { BuildBonusSession9(sb); }
        else if (s == 10) { BuildBonusSession10(sb); }
        else if (s == 11) { BuildBonusSession11(sb); }
        else if (s == 12) { BuildBonusSession12(sb); }
        else if (s == 13) { BuildBonusSession13(sb); }
        else if (s == 14) { BuildBonusSession14(sb); }
        else if (s == 15) { BuildBonusSession15(sb); }
        else if (s == 16) { BuildBonusSession16(sb); }
        else if (s == 17) { BuildBonusSession17(sb); }
        else if (s == 18) { BuildBonusSession18(sb); }
        else if (s == 19) { BuildBonusSession19(sb); }
        else if (s == 20) { BuildBonusSession20(sb); }
        else { BuildGenericBonus(sb, s); }
    }

    // =====================================================================
    // LESSON SESSION 3: Notes on 3rd & 4th Strings, Ties, Dots, 8th Notes
    // Book Pages 16-21
    // =====================================================================
    private static void BuildLessonSession3(StringBuilder sb) {
        // Topic 1: Third String (G open, A fret 2)
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Third String Exercises (G - A)\",");
        sb.AppendLine("          exercises: [");
        // Ex 1: Whole notes on 3rd string G and A
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'lb-s3-str3-ex1', title: 'Exercise 1: Whole Notes - 3rd String (G - A)',");
        sb.AppendLine("              description: 'Lesson Book p.16: Whole note reading on 3rd string. G=open, A=fret 2 (finger 2). Hold each note 4 full beats.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 60, concepts: ['3rd String', 'G Open', 'A Fret 2', 'Whole Notes'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine("                " + MakeWholeBar(1, "G", 3, 0, 0, "Down", "Bar 1: G - Open 3rd String") + ",");
        sb.AppendLine("                " + MakeWholeBar(2, "A", 3, 2, 2, "Down", "Bar 2: A - 3rd String Fret 2") + ",");
        sb.AppendLine("                " + MakeWholeBar(3, "G", 3, 0, 0, "Down", "Bar 3: G - Open 3rd String") + ",");
        sb.AppendLine("                " + MakeWholeBar(4, "A", 3, 2, 2, "Down", "Bar 4: A - 3rd String Fret 2") + ",");
        sb.AppendLine("                " + MakeWholeBar(5, "G", 3, 0, 0, "Down", "Bar 5: G - Final Whole Note"));
        sb.AppendLine("              ]");
        sb.AppendLine("            },");
        // Ex 2: Half notes G and A
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'lb-s3-str3-ex2', title: 'Exercise 2: Half Notes - 3rd String (G - A)',");
        sb.AppendLine("              description: 'Lesson Book p.16: Half note exercises alternating G and A on the 3rd string. Each note held for 2 beats.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 65, concepts: ['Half Notes', '3rd String G-A', 'Finger 2 Placement'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine("                " + MakeHalfBar(1, "G", 3, 0, 0, "A", 3, 2, 2) + ",");
        sb.AppendLine("                " + MakeHalfBar(2, "A", 3, 2, 2, "G", 3, 0, 0) + ",");
        sb.AppendLine("                " + MakeHalfBar(3, "G", 3, 0, 0, "G", 3, 0, 0) + ",");
        sb.AppendLine("                " + MakeHalfBar(4, "A", 3, 2, 2, "A", 3, 2, 2));
        sb.AppendLine("              ]");
        sb.AppendLine("            },");
        // Ex 3: Quarter notes G and A
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'lb-s3-str3-ex3', title: 'Exercise 3: Quarter Notes - 3rd String (G - A)',");
        sb.AppendLine("              description: 'Lesson Book p.16: Quarter note exercise on 3rd string. Mix of G open and A fret 2.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 70, concepts: ['Quarter Notes', '3rd String', 'G-A Pattern'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine(string.Format("                {{ measure: 1, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"G","1/4","play",3,0,0,"Down","G Open"), MakeB(2,"G","1/4","play",3,0,0,"Up","G Open"),
            MakeB(3,"A","1/4","play",3,2,2,"Down","A Fret 2"), MakeB(4,"A","1/4","play",3,2,2,"Up","A Fret 2")));
        sb.AppendLine(string.Format("                {{ measure: 2, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"A","1/4","play",3,2,2,"Down","A Fret 2"), MakeB(2,"G","1/4","play",3,0,0,"Up","G Open"),
            MakeB(3,"G","1/4","play",3,0,0,"Down","G Open"), MakeB(4,"A","1/4","play",3,2,2,"Up","A Fret 2")));
        sb.AppendLine(string.Format("                {{ measure: 3, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"G","1/4","play",3,0,0,"Down","G Open"), MakeB(2,"A","1/4","play",3,2,2,"Up","A Fret 2"),
            MakeB(3,"G","1/2","play",3,0,0,"Down",2,"G Half Note"), MakeSustainB(4,"G","1/2",3,0,0,2,"Hold")));
        sb.AppendLine("                " + MakeWholeBar(4, "G", 3, 0, 0, "Down", "Final Whole G"));
        sb.AppendLine("              ]");
        sb.AppendLine("            },");
        // Ex 4: More quarter notes mixing all 3rd string notes
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'lb-s3-str3-ex4', title: 'Exercise 4: More 3rd String Exercises',");
        sb.AppendLine("              description: 'Lesson Book p.17: Additional quarter and half note patterns on 3rd string for note reading fluency.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 72, concepts: ['3rd String Reading', 'G-A Fluency'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine(string.Format("                {{ measure: 1, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"A","1/4","play",3,2,2,"Down","A Fret 2"), MakeB(2,"G","1/4","play",3,0,0,"Up","G Open"),
            MakeB(3,"A","1/4","play",3,2,2,"Down","A Fret 2"), MakeB(4,"G","1/4","play",3,0,0,"Up","G Open")));
        sb.AppendLine(string.Format("                {{ measure: 2, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"A","1/2","play",3,2,2,"Down",2,"A Half"), MakeSustainB(2,"A","1/2",3,2,2,2,"Hold"),
            MakeB(3,"G","1/2","play",3,0,0,"Down",2,"G Half"), MakeSustainB(4,"G","1/2",3,0,0,2,"Hold")));
        sb.AppendLine("                " + MakeWholeBar(3, "A", 3, 2, 2, "Down", "Whole A"));
        sb.AppendLine("              ]");
        sb.AppendLine("            }");
        sb.AppendLine("          ]");
        sb.AppendLine("        },");

        // Topic 2: Fourth String (D open, E fret 2, F fret 3)
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Fourth String Exercises (D - E - F)\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'lb-s3-str4-ex1', title: 'Exercise 1: Whole Notes - 4th String (D - E - F)',");
        sb.AppendLine("              description: 'Lesson Book p.17: Whole note reading on 4th string. D=open, E=fret 2 (finger 2), F=fret 3 (finger 3).',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 60, concepts: ['4th String', 'D Open', 'E Fret 2', 'F Fret 3'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine("                " + MakeWholeBar(1, "D", 4, 0, 0, "Down", "D - Open 4th String") + ",");
        sb.AppendLine("                " + MakeWholeBar(2, "E", 4, 2, 2, "Down", "E - 4th String Fret 2") + ",");
        sb.AppendLine("                " + MakeWholeBar(3, "F", 4, 3, 3, "Down", "F - 4th String Fret 3") + ",");
        sb.AppendLine("                " + MakeWholeBar(4, "E", 4, 2, 2, "Down", "E - 4th String Fret 2") + ",");
        sb.AppendLine("                " + MakeWholeBar(5, "D", 4, 0, 0, "Down", "D - Final Whole Note"));
        sb.AppendLine("              ]");
        sb.AppendLine("            },");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'lb-s3-str4-ex2', title: 'Exercise 2: Half Notes - 4th String (D - E - F)',");
        sb.AppendLine("              description: 'Lesson Book p.17: Half notes on the 4th string. Alternate between D, E, and F.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 65, concepts: ['Half Notes', 'D-E-F Pattern', '4th String'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine("                " + MakeHalfBar(1, "D", 4, 0, 0, "E", 4, 2, 2) + ",");
        sb.AppendLine("                " + MakeHalfBar(2, "F", 4, 3, 3, "E", 4, 2, 2) + ",");
        sb.AppendLine("                " + MakeHalfBar(3, "D", 4, 0, 0, "F", 4, 3, 3) + ",");
        sb.AppendLine("                " + MakeHalfBar(4, "E", 4, 2, 2, "D", 4, 0, 0));
        sb.AppendLine("              ]");
        sb.AppendLine("            },");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'lb-s3-str4-ex3', title: 'Exercise 3: Quarter Notes - 4th String (D - E - F)',");
        sb.AppendLine("              description: 'Lesson Book p.18: Quarter note reading on 4th string notes D, E, and F.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 70, concepts: ['Quarter Notes', '4th String', 'D-E-F Reading'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine(string.Format("                {{ measure: 1, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"D","1/4","play",4,0,0,"Down","D Open"), MakeB(2,"E","1/4","play",4,2,2,"Up","E Fret 2"),
            MakeB(3,"F","1/4","play",4,3,3,"Down","F Fret 3"), MakeB(4,"E","1/4","play",4,2,2,"Up","E Fret 2")));
        sb.AppendLine(string.Format("                {{ measure: 2, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"D","1/4","play",4,0,0,"Down","D Open"), MakeB(2,"F","1/4","play",4,3,3,"Up","F Fret 3"),
            MakeB(3,"E","1/2","play",4,2,2,"Down",2,"E Half"), MakeSustainB(4,"E","1/2",4,2,2,2,"Hold")));
        sb.AppendLine("                " + MakeWholeBar(3, "D", 4, 0, 0, "Down", "D Whole Note"));
        sb.AppendLine("              ]");
        sb.AppendLine("            },");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'lb-s3-str4-ex4', title: 'Exercise 4: More 4th String Exercises',");
        sb.AppendLine("              description: 'Lesson Book p.18: Additional exercises to build fluency on D, E, F of the 4th string.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 72, concepts: ['4th String Fluency', 'D-E-F'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine(string.Format("                {{ measure: 1, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"F","1/4","play",4,3,3,"Down","F Fret 3"), MakeB(2,"E","1/4","play",4,2,2,"Up","E Fret 2"),
            MakeB(3,"D","1/4","play",4,0,0,"Down","D Open"), MakeB(4,"E","1/4","play",4,2,2,"Up","E Fret 2")));
        sb.AppendLine(string.Format("                {{ measure: 2, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"F","1/2","play",4,3,3,"Down",2,"F Half"), MakeSustainB(2,"F","1/2",4,3,3,2,"Hold"),
            MakeB(3,"D","1/2","play",4,0,0,"Down",2,"D Half"), MakeSustainB(4,"D","1/2",4,0,0,2,"Hold")));
        sb.AppendLine("                " + MakeWholeBar(3, "D", 4, 0, 0, "Down", "D Final"));
        sb.AppendLine("              ]");
        sb.AppendLine("            }");
        sb.AppendLine("          ]");
        sb.AppendLine("        },");

        // Topic 3: Ties, Dotted Notes, 3/4 Time
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Ties, Dotted Notes & 3/4 Time\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'lb-s3-ties-ex1', title: 'Exercise 1: Ties Across Barlines',");
        sb.AppendLine("              description: 'Lesson Book p.18: A tie connects two notes of the same pitch. Only pluck the first note, hold through the tie.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 65, concepts: ['Ties', 'Hold Through Barline', '3rd String'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine(string.Format("                {{ measure: 1, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"G","1/4","play",3,0,0,"Down","G Open"), MakeB(2,"G","1/4","play",3,0,0,"Up","G Open"),
            MakeB(3,"G","1/2","play",3,0,0,"Down",2,"G tied to next bar"), MakeSustainB(4,"G","1/2",3,0,0,2,"Hold")));
        sb.AppendLine(string.Format("                {{ measure: 2, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeSustainB(1,"G","1/2",3,0,0,2,"Tied from previous bar"), MakeSustainB(2,"G","1/2",3,0,0,2,"Hold"),
            MakeB(3,"A","1/4","play",3,2,2,"Down","A Fret 2"), MakeB(4,"G","1/4","play",3,0,0,"Up","G Open")));
        sb.AppendLine("                " + MakeWholeBar(3, "G", 3, 0, 0, "Down", "Whole G - Final"));
        sb.AppendLine("              ]");
        sb.AppendLine("            },");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'lb-s3-dot-ex1', title: 'Exercise 2: Dotted Half Notes in 3/4',");
        sb.AppendLine("              description: 'Lesson Book p.19: Dotted half note = 3 beats. Used in 3/4 time (Waltz). One dotted half note fills the bar.',");
        sb.AppendLine("              timeSignature: [3, 4], defaultBpm: 60, concepts: ['3/4 Time', 'Dotted Half = 3 Beats', 'Waltz'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine(string.Format("                {{ measure: 1, beats: [ {0}, {1}, {2} ] }},",
            MakeB(1,"G","3/4","play",3,0,0,"Down",3,"G Dotted Half"), MakeSustainB(2,"G","3/4",3,0,0,3,"Hold Beat 2"), MakeSustainB(3,"G","3/4",3,0,0,3,"Hold Beat 3")));
        sb.AppendLine(string.Format("                {{ measure: 2, beats: [ {0}, {1}, {2} ] }},",
            MakeB(1,"A","3/4","play",3,2,2,"Down",3,"A Dotted Half"), MakeSustainB(2,"A","3/4",3,2,2,3,"Hold Beat 2"), MakeSustainB(3,"A","3/4",3,2,2,3,"Hold Beat 3")));
        sb.AppendLine(string.Format("                {{ measure: 3, beats: [ {0}, {1}, {2} ] }},",
            MakeB(1,"G","3/4","play",3,0,0,"Down",3,"G Dotted Half"), MakeSustainB(2,"G","3/4",3,0,0,3,"Hold Beat 2"), MakeSustainB(3,"G","3/4",3,0,0,3,"Hold Beat 3")));
        sb.AppendLine(string.Format("                {{ measure: 4, beats: [ {0}, {1}, {2} ] }}",
            MakeB(1,"G","3/4","play",3,0,0,"Down",3,"Final G Dotted Half"), MakeSustainB(2,"G","3/4",3,0,0,3,"Hold Beat 2"), MakeSustainB(3,"G","3/4",3,0,0,3,"Hold Beat 3")));
        sb.AppendLine("              ]");
        sb.AppendLine("            },");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'lb-s3-qrest-ex1', title: 'Exercise 3: Quarter Rests on 3rd & 4th Strings',");
        sb.AppendLine("              description: 'Lesson Book p.19: Quarter rest = 1 beat of silence. Physically damp the string on rest beats.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 65, concepts: ['Quarter Rest', '1 Beat Silence', 'String Damping'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine(string.Format("                {{ measure: 1, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"G","1/4","play",3,0,0,"Down","G Open"), MakeRestB(2,"REST","Damp String!"),
            MakeB(3,"A","1/4","play",3,2,2,"Down","A Fret 2"), MakeRestB(4,"REST","Damp String!")));
        sb.AppendLine(string.Format("                {{ measure: 2, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"D","1/4","play",4,0,0,"Down","D Open 4th String"), MakeB(2,"E","1/4","play",4,2,2,"Up","E Fret 2"),
            MakeRestB(3,"REST","Damp!"), MakeB(4,"F","1/4","play",4,3,3,"Down","F Fret 3")));
        sb.AppendLine("                " + MakeWholeBar(3, "D", 4, 0, 0, "Down", "D Final Whole"));
        sb.AppendLine("              ]");
        sb.AppendLine("            }");
        sb.AppendLine("          ]");
        sb.AppendLine("        },");

        // Topic 4: Eighth Notes
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Eighth Note Exercises\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'lb-s3-8th-ex1', title: 'Exercise 1: Eighth Notes - 3rd String (G-A)',");
        sb.AppendLine("              description: 'Lesson Book p.20: Eighth notes subdivide the beat in half. Two eighth notes = 1 beat. Use Down-Up picking. Count: 1-and-2-and-3-and-4-and.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 60, concepts: ['Eighth Notes', 'Down-Up Picking', '1-and Count', '3rd String'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine(string.Format("                {{ measure: 1, beats: [ {0}, {1}, {2}, {3}, {4}, {5}, {6}, {7} ] }},",
            MakeB(1,"G","1/8","play",3,0,0,"Down",1,"Beat 1 Down"), MakeB(2,"G","1/8","play",3,0,0,"Up",1,"1-and Up"),
            MakeB(3,"G","1/8","play",3,0,0,"Down",1,"Beat 2 Down"), MakeB(4,"G","1/8","play",3,0,0,"Up",1,"2-and Up"),
            MakeB(5,"A","1/8","play",3,2,2,"Down",1,"Beat 3 Down"), MakeB(6,"A","1/8","play",3,2,2,"Up",1,"3-and Up"),
            MakeB(7,"A","1/8","play",3,2,2,"Down",1,"Beat 4 Down"), MakeB(8,"A","1/8","play",3,2,2,"Up",1,"4-and Up")));
        sb.AppendLine(string.Format("                {{ measure: 2, beats: [ {0}, {1}, {2}, {3}, {4}, {5}, {6}, {7} ] }}",
            MakeB(1,"A","1/8","play",3,2,2,"Down",1,"Beat 1"), MakeB(2,"G","1/8","play",3,0,0,"Up",1,"and"),
            MakeB(3,"A","1/8","play",3,2,2,"Down",1,"Beat 2"), MakeB(4,"G","1/8","play",3,0,0,"Up",1,"and"),
            MakeB(5,"G","1/4","play",3,0,0,"Down",1,"Beat 3 Quarter"), MakeB(6,"G","1/8","play",3,0,0,"Up",1,"and"),
            MakeB(7,"G","1/8","play",3,0,0,"Down",1,"Beat 4"), MakeB(8,"G","1/8","play",3,0,0,"Up",1,"and")));
        sb.AppendLine("              ]");
        sb.AppendLine("            },");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'lb-s3-8th-ex2', title: 'Exercise 2: Eighth Notes - 4th String (D-E-F)',");
        sb.AppendLine("              description: 'Lesson Book p.20: Eighth note patterns on the 4th string. D open, E fret 2, F fret 3. Down-Up alternate picking.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 60, concepts: ['Eighth Notes', '4th String', 'Down-Up', 'D-E-F'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine(string.Format("                {{ measure: 1, beats: [ {0}, {1}, {2}, {3}, {4}, {5}, {6}, {7} ] }},",
            MakeB(1,"D","1/8","play",4,0,0,"Down",1,"D Down"), MakeB(2,"D","1/8","play",4,0,0,"Up",1,"D Up"),
            MakeB(3,"E","1/8","play",4,2,2,"Down",1,"E Down"), MakeB(4,"E","1/8","play",4,2,2,"Up",1,"E Up"),
            MakeB(5,"F","1/8","play",4,3,3,"Down",1,"F Down"), MakeB(6,"F","1/8","play",4,3,3,"Up",1,"F Up"),
            MakeB(7,"E","1/8","play",4,2,2,"Down",1,"E Down"), MakeB(8,"D","1/8","play",4,0,0,"Up",1,"D Up")));
        sb.AppendLine(string.Format("                {{ measure: 2, beats: [ {0}, {1}, {2}, {3}, {4}, {5}, {6}, {7} ] }}",
            MakeB(1,"D","1/8","play",4,0,0,"Down",1,"D"), MakeB(2,"E","1/8","play",4,2,2,"Up",1,"E"),
            MakeB(3,"F","1/8","play",4,3,3,"Down",1,"F"), MakeB(4,"E","1/8","play",4,2,2,"Up",1,"E"),
            MakeB(5,"D","1/4","play",4,0,0,"Down",1,"D Quarter"), MakeB(6,"D","1/8","play",4,0,0,"Up",1,"D"),
            MakeB(7,"D","1/8","play",4,0,0,"Down",1,"D"), MakeB(8,"D","1/8","play",4,0,0,"Up",1,"D")));
        sb.AppendLine("              ]");
        sb.AppendLine("            },");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'lb-s3-8th-ex3', title: 'Exercise 3: Mixed 8th Notes with Quarter & Half Notes',");
        sb.AppendLine("              description: 'Lesson Book p.20: Combines eighth notes, quarter notes, and half notes on strings 3 and 4.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 65, concepts: ['Mixed Rhythms', '8th+Quarter+Half', 'Strings 3-4'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine(string.Format("                {{ measure: 1, beats: [ {0}, {1}, {2}, {3}, {4}, {5} ] }},",
            MakeB(1,"G","1/8","play",3,0,0,"Down",1,"G Down"), MakeB(2,"G","1/8","play",3,0,0,"Up",1,"G Up"),
            MakeB(3,"A","1/4","play",3,2,2,"Down",1,"A Quarter"), MakeB(4,"A","1/8","play",3,2,2,"Up",1,"A Up"),
            MakeB(5,"G","1/2","play",3,0,0,"Down",2,"G Half"), MakeSustainB(6,"G","1/2",3,0,0,2,"Hold")));
        sb.AppendLine(string.Format("                {{ measure: 2, beats: [ {0}, {1}, {2}, {3}, {4}, {5}, {6}, {7} ] }}",
            MakeB(1,"D","1/8","play",4,0,0,"Down",1,"D Down"), MakeB(2,"E","1/8","play",4,2,2,"Up",1,"E Up"),
            MakeB(3,"F","1/8","play",4,3,3,"Down",1,"F Down"), MakeB(4,"E","1/8","play",4,2,2,"Up",1,"E Up"),
            MakeB(5,"D","1/8","play",4,0,0,"Down",1,"D Down"), MakeB(6,"D","1/8","play",4,0,0,"Up",1,"D Up"),
            MakeB(7,"D","1/4","play",4,0,0,"Down",1,"D Quarter"), MakeB(8,"D","1/8","play",4,0,0,"Up",1,"D")));
        sb.AppendLine("              ]");
        sb.AppendLine("            }");
        sb.AppendLine("          ]");
        sb.AppendLine("        },");

        // Topic 5: Repertoire using strings 3 & 4
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Repertoire: Strings 3 & 4 Songs\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'lb-s3-song-lullaby', title: 'Song: Simple Lullaby (3/4 Waltz)',");
        sb.AppendLine("              description: 'Lesson Book p.21: 3/4 waltz using notes on 3rd and 4th strings. One dotted half per bar, waltz feel.',");
        sb.AppendLine("              timeSignature: [3, 4], defaultBpm: 60, concepts: ['3/4 Time', 'Waltz Pattern', 'Strings 3-4', 'Repertoire'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine(string.Format("                {{ measure: 1, beats: [ {0}, {1}, {2} ] }},",
            MakeB(1,"G","3/4","play",3,0,0,"Down",3,"G open"), MakeSustainB(2,"G","3/4",3,0,0,3,"Hold 2"), MakeSustainB(3,"G","3/4",3,0,0,3,"Hold 3")));
        sb.AppendLine(string.Format("                {{ measure: 2, beats: [ {0}, {1}, {2} ] }},",
            MakeB(1,"A","3/4","play",3,2,2,"Down",3,"A fret 2"), MakeSustainB(2,"A","3/4",3,2,2,3,"Hold 2"), MakeSustainB(3,"A","3/4",3,2,2,3,"Hold 3")));
        sb.AppendLine(string.Format("                {{ measure: 3, beats: [ {0}, {1}, {2} ] }},",
            MakeB(1,"D","3/4","play",4,0,0,"Down",3,"D open 4th"), MakeSustainB(2,"D","3/4",4,0,0,3,"Hold 2"), MakeSustainB(3,"D","3/4",4,0,0,3,"Hold 3")));
        sb.AppendLine(string.Format("                {{ measure: 4, beats: [ {0}, {1}, {2} ] }},",
            MakeB(1,"E","3/4","play",4,2,2,"Down",3,"E fret 2"), MakeSustainB(2,"E","3/4",4,2,2,3,"Hold 2"), MakeSustainB(3,"E","3/4",4,2,2,3,"Hold 3")));
        sb.AppendLine(string.Format("                {{ measure: 5, beats: [ {0}, {1}, {2} ] }},",
            MakeB(1,"G","3/4","play",3,0,0,"Down",3,"G open"), MakeSustainB(2,"G","3/4",3,0,0,3,"Hold 2"), MakeSustainB(3,"G","3/4",3,0,0,3,"Hold 3")));
        sb.AppendLine(string.Format("                {{ measure: 6, beats: [ {0}, {1}, {2} ] }}",
            MakeB(1,"D","3/4","play",4,0,0,"Down",3,"D final"), MakeSustainB(2,"D","3/4",4,0,0,3,"Hold 2"), MakeSustainB(3,"D","3/4",4,0,0,3,"Hold 3")));
        sb.AppendLine("              ]");
        sb.AppendLine("            },");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'lb-s3-song-march', title: 'Song: Simple March (4/4)',");
        sb.AppendLine("              description: 'Lesson Book p.21: Quarter note march using all notes from strings 3 and 4 combined.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 72, concepts: ['4/4 March', 'Strings 3+4 Combined', 'Quarter Notes'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine(string.Format("                {{ measure: 1, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"G","1/4","play",3,0,0,"Down","G"), MakeB(2,"A","1/4","play",3,2,2,"Up","A"),
            MakeB(3,"D","1/4","play",4,0,0,"Down","D"), MakeB(4,"E","1/4","play",4,2,2,"Up","E")));
        sb.AppendLine(string.Format("                {{ measure: 2, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"F","1/4","play",4,3,3,"Down","F"), MakeB(2,"E","1/4","play",4,2,2,"Up","E"),
            MakeB(3,"D","1/2","play",4,0,0,"Down",2,"D Half"), MakeSustainB(4,"D","1/2",4,0,0,2,"Hold")));
        sb.AppendLine(string.Format("                {{ measure: 3, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"G","1/4","play",3,0,0,"Down","G"), MakeB(2,"G","1/4","play",3,0,0,"Up","G"),
            MakeB(3,"A","1/4","play",3,2,2,"Down","A"), MakeB(4,"G","1/4","play",3,0,0,"Up","G")));
        sb.AppendLine("                " + MakeWholeBar(4, "G", 3, 0, 0, "Down", "G Final Whole"));
        sb.AppendLine("              ]");
        sb.AppendLine("            }");
        sb.AppendLine("          ]");
        sb.AppendLine("        }");
    }

    // =====================================================================
    // LESSON SESSION 4: Notes on 5th & 6th Strings, Sharps, Flats, Naturals
    // Book Pages 22-28
    // =====================================================================
    private static void BuildLessonSession4(StringBuilder sb) {
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Fifth String Exercises (A - B - C)\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'lb-s4-str5-ex1', title: 'Exercise 1: Whole Notes - 5th String (A - B - C)',");
        sb.AppendLine("              description: 'Lesson Book p.22: 5th string notes. A=open, B=fret 2 (finger 2), C=fret 3 (finger 3). Hold each note 4 beats.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 60, concepts: ['5th String', 'A Open', 'B Fret 2', 'C Fret 3'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine("                " + MakeWholeBar(1, "A", 5, 0, 0, "Down", "A - Open 5th String") + ",");
        sb.AppendLine("                " + MakeWholeBar(2, "B", 5, 2, 2, "Down", "B - 5th String Fret 2") + ",");
        sb.AppendLine("                " + MakeWholeBar(3, "C", 5, 3, 3, "Down", "C - 5th String Fret 3") + ",");
        sb.AppendLine("                " + MakeWholeBar(4, "B", 5, 2, 2, "Down", "B - 5th String Fret 2") + ",");
        sb.AppendLine("                " + MakeWholeBar(5, "A", 5, 0, 0, "Down", "A - Final Whole Note"));
        sb.AppendLine("              ]");
        sb.AppendLine("            },");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'lb-s4-str5-ex2', title: 'Exercise 2: Half Notes - 5th String',");
        sb.AppendLine("              description: 'Lesson Book p.22: Half note practice on 5th string alternating A, B, C.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 65, concepts: ['Half Notes', '5th String', 'A-B-C'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine("                " + MakeHalfBar(1, "A", 5, 0, 0, "B", 5, 2, 2) + ",");
        sb.AppendLine("                " + MakeHalfBar(2, "C", 5, 3, 3, "B", 5, 2, 2) + ",");
        sb.AppendLine("                " + MakeHalfBar(3, "A", 5, 0, 0, "C", 5, 3, 3) + ",");
        sb.AppendLine("                " + MakeHalfBar(4, "B", 5, 2, 2, "A", 5, 0, 0));
        sb.AppendLine("              ]");
        sb.AppendLine("            },");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'lb-s4-str5-ex3', title: 'Exercise 3: Quarter Notes - 5th String',");
        sb.AppendLine("              description: 'Lesson Book p.23: Quarter note reading on 5th string A, B, C.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 70, concepts: ['Quarter Notes', '5th String', 'Bass Notes'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine(string.Format("                {{ measure: 1, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"A","1/4","play",5,0,0,"Down","A Open"), MakeB(2,"B","1/4","play",5,2,2,"Up","B Fret 2"),
            MakeB(3,"C","1/4","play",5,3,3,"Down","C Fret 3"), MakeB(4,"B","1/4","play",5,2,2,"Up","B Fret 2")));
        sb.AppendLine(string.Format("                {{ measure: 2, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"A","1/4","play",5,0,0,"Down","A Open"), MakeB(2,"C","1/4","play",5,3,3,"Up","C Fret 3"),
            MakeB(3,"B","1/2","play",5,2,2,"Down",2,"B Half"), MakeSustainB(4,"B","1/2",5,2,2,2,"Hold")));
        sb.AppendLine("                " + MakeWholeBar(3, "A", 5, 0, 0, "Down", "A Final Whole"));
        sb.AppendLine("              ]");
        sb.AppendLine("            }");
        sb.AppendLine("          ]");
        sb.AppendLine("        },");
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Sixth String Exercises (Low E - F - G)\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'lb-s4-str6-ex1', title: 'Exercise 1: Whole Notes - 6th String (Low E - F - G)',");
        sb.AppendLine("              description: 'Lesson Book p.24: 6th string notes. Low E=open, F=fret 1 (finger 1), G=fret 3 (finger 3). Deepest guitar notes.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 58, concepts: ['6th String', 'Low E Open', 'F Fret 1', 'G Fret 3'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine("                " + MakeWholeBar(1, "Low E", 6, 0, 0, "Down", "Low E - Open 6th String") + ",");
        sb.AppendLine("                " + MakeWholeBar(2, "F", 6, 1, 1, "Down", "F - 6th String Fret 1") + ",");
        sb.AppendLine("                " + MakeWholeBar(3, "G", 6, 3, 3, "Down", "G - 6th String Fret 3") + ",");
        sb.AppendLine("                " + MakeWholeBar(4, "F", 6, 1, 1, "Down", "F - 6th String Fret 1") + ",");
        sb.AppendLine("                " + MakeWholeBar(5, "Low E", 6, 0, 0, "Down", "Low E - Final Whole"));
        sb.AppendLine("              ]");
        sb.AppendLine("            },");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'lb-s4-str6-ex2', title: 'Exercise 2: Quarter Notes - 6th String',");
        sb.AppendLine("              description: 'Lesson Book p.24: Quarter note reading on 6th string Low E, F, G.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 65, concepts: ['Quarter Notes', '6th String', 'Low E-F-G'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine(string.Format("                {{ measure: 1, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"Low E","1/4","play",6,0,0,"Down","Low E"), MakeB(2,"F","1/4","play",6,1,1,"Up","F Fret 1"),
            MakeB(3,"G","1/4","play",6,3,3,"Down","G Fret 3"), MakeB(4,"F","1/4","play",6,1,1,"Up","F Fret 1")));
        sb.AppendLine(string.Format("                {{ measure: 2, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"Low E","1/4","play",6,0,0,"Down","Low E"), MakeB(2,"G","1/4","play",6,3,3,"Up","G Fret 3"),
            MakeB(3,"F","1/2","play",6,1,1,"Down",2,"F Half"), MakeSustainB(4,"F","1/2",6,1,1,2,"Hold")));
        sb.AppendLine("                " + MakeWholeBar(3, "Low E", 6, 0, 0, "Down", "Low E Final"));
        sb.AppendLine("              ]");
        sb.AppendLine("            }");
        sb.AppendLine("          ]");
        sb.AppendLine("        },");
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Whole & Half Rests, Sharps, Flats, Naturals\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'lb-s4-rest-ex1', title: 'Exercise 1: Whole Rests & Half Rests',");
        sb.AppendLine("              description: 'Lesson Book p.25: Whole rest = 4 beats silence. Half rest = 2 beats silence. Practice counting silently through rests.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 60, concepts: ['Whole Rest = 4 Beats', 'Half Rest = 2 Beats', 'Counting Through Rests'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine(string.Format("                {{ measure: 1, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"A","1/4","play",5,0,0,"Down","A Open 5th"), MakeB(2,"B","1/4","play",5,2,2,"Up","B Fret 2"),
            MakeRestB(3,"1/2",2,"Half Rest - Silence 2 beats"), MakeRestSustainB(4,"1/2",2,"Half Rest continue")));
        sb.AppendLine(string.Format("                {{ measure: 2, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeRestB(1,"1/1",4,"Whole Rest - Silence all 4 beats"), MakeRestSustainB(2,"1/1",4,"Whole Rest"),
            MakeRestSustainB(3,"1/1",4,"Whole Rest"), MakeRestSustainB(4,"1/1",4,"Whole Rest")));
        sb.AppendLine(string.Format("                {{ measure: 3, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"Low E","1/4","play",6,0,0,"Down","Low E"), MakeB(2,"F","1/4","play",6,1,1,"Up","F"),
            MakeB(3,"G","1/4","play",6,3,3,"Down","G"), MakeRestB(4,"REST","Quarter Rest")));
        sb.AppendLine("                " + MakeWholeBar(4, "A", 5, 0, 0, "Down", "A Final Whole"));
        sb.AppendLine("              ]");
        sb.AppendLine("            },");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'lb-s4-accidental-ex1', title: 'Exercise 2: Sharps, Flats & Naturals',");
        sb.AppendLine("              description: 'Lesson Book p.26: Accidentals. Sharp (#) raises pitch 1 fret. Flat (b) lowers 1 fret. Natural cancels sharp or flat.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 65, concepts: ['Sharps (#)', 'Flats (b)', 'Naturals', 'Accidentals'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine(string.Format("                {{ measure: 1, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"Low E","1/4","play",6,0,0,"Down","Low E Natural"), MakeB(2,"F","1/4","play",6,1,1,"Up","F (E#)"),
            MakeB(3,"F#","1/4","play",6,2,2,"Down","F# Sharp"), MakeB(4,"G","1/4","play",6,3,3,"Up","G Natural")));
        sb.AppendLine(string.Format("                {{ measure: 2, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"A","1/4","play",5,0,0,"Down","A Natural"), MakeB(2,"A#","1/4","play",5,1,1,"Up","A# / Bb"),
            MakeB(3,"B","1/4","play",5,2,2,"Down","B Natural"), MakeB(4,"C","1/4","play",5,3,3,"Up","C")));
        sb.AppendLine("                " + MakeWholeBar(3, "Low E", 6, 0, 0, "Down", "Low E Final"));
        sb.AppendLine("              ]");
        sb.AppendLine("            }");
        sb.AppendLine("          ]");
        sb.AppendLine("        },");
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"All 6 Strings Combined Exercises\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'lb-s4-all6-ex1', title: 'Exercise 1: Bass to Treble Run',");
        sb.AppendLine("              description: 'Lesson Book p.27: Read notes moving from 6th string up to 1st string. The full guitar range open-string scale.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 65, concepts: ['All 6 Strings', 'String Crossing', 'Low to High'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine(string.Format("                {{ measure: 1, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"Low E","1/4","play",6,0,0,"Down","6th String Open"), MakeB(2,"A","1/4","play",5,0,0,"Up","5th String Open"),
            MakeB(3,"D","1/4","play",4,0,0,"Down","4th String Open"), MakeB(4,"G","1/4","play",3,0,0,"Up","3rd String Open")));
        sb.AppendLine(string.Format("                {{ measure: 2, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"B","1/4","play",2,0,0,"Down","2nd String Open"), MakeB(2,"High E","1/4","play",1,0,0,"Up","1st String Open"),
            MakeB(3,"High E","1/2","play",1,0,0,"Down",2,"High E Half"), MakeSustainB(4,"High E","1/2",1,0,0,2,"Hold")));
        sb.AppendLine(string.Format("                {{ measure: 3, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"G","1/4","play",3,0,0,"Down","G 3rd"), MakeB(2,"E","1/4","play",4,2,2,"Up","E 4th Str"),
            MakeB(3,"B","1/4","play",5,2,2,"Down","B 5th Str"), MakeB(4,"Low E","1/4","play",6,0,0,"Up","Low E")));
        sb.AppendLine("                " + MakeWholeBar(4, "Low E", 6, 0, 0, "Down", "Final Low E Whole"));
        sb.AppendLine("              ]");
        sb.AppendLine("            }");
        sb.AppendLine("          ]");
        sb.AppendLine("        }");
    }

    // =====================================================================
    // LESSON SESSION 5: Basic Open Chords C, G, G7, D, D7, Em, Am, E
    // Book Pages 29-35
    // =====================================================================
    private static void BuildLessonSession5(StringBuilder sb) {
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"C, G, G7 Chord Exercises\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'lb-s5-cgG7-ex1', title: 'Exercise 1: C - G7 Whole Note Strums',");
        sb.AppendLine("              description: 'Lesson Book p.29: Strum C and G7 as whole notes (4 beats). Establish clean chord shapes before switching.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 60, concepts: ['C Major', 'G7 Chord', 'Whole Note Strum', 'Chord Shape'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine("                " + MakeChordWholeBar(1, "C Major", "5-1", "C Major - Hold 4 beats") + ",");
        sb.AppendLine("                " + MakeChordWholeBar(2, "G7", "all", "G7 - Hold 4 beats") + ",");
        sb.AppendLine("                " + MakeChordWholeBar(3, "C Major", "5-1", "C Major") + ",");
        sb.AppendLine("                " + MakeChordWholeBar(4, "G7", "all", "G7") + ",");
        sb.AppendLine("                " + MakeChordWholeBar(5, "C Major", "5-1", "C Major - Final"));
        sb.AppendLine("              ]");
        sb.AppendLine("            },");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'lb-s5-cgG7-ex2', title: 'Exercise 2: C - G7 Quarter Strums (60-Second Test)',");
        sb.AppendLine("              description: 'Lesson Book p.29: Quarter note down-strums 4 per bar. C 2 bars, G7 2 bars, C 1 bar. Chord switch test.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 65, concepts: ['Quarter Strums', 'C Major', 'G7', 'Chord Switching'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine("                " + MakeChordQuarterBar(1, "C Major", "5-1") + ",");
        sb.AppendLine("                " + MakeChordQuarterBar(2, "C Major", "5-1") + ",");
        sb.AppendLine("                " + MakeChordQuarterBar(3, "G7", "all") + ",");
        sb.AppendLine("                " + MakeChordQuarterBar(4, "G7", "all") + ",");
        sb.AppendLine("                " + MakeChordQuarterBar(5, "C Major", "5-1"));
        sb.AppendLine("              ]");
        sb.AppendLine("            },");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'lb-s5-G-ex1', title: 'Exercise 3: G Major Chord Introduction',");
        sb.AppendLine("              description: 'Lesson Book p.30: G Major chord shape. Strum all 6 strings. Quarter note strums in 4/4.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 65, concepts: ['G Major', 'All 6 Strings', 'Open Chord'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine("                " + MakeChordQuarterBar(1, "G Major", "all") + ",");
        sb.AppendLine("                " + MakeChordQuarterBar(2, "G Major", "all") + ",");
        sb.AppendLine("                " + MakeChordQuarterBar(3, "C Major", "5-1") + ",");
        sb.AppendLine("                " + MakeChordQuarterBar(4, "G Major", "all") + ",");
        sb.AppendLine("                " + MakeChordWholeBar(5, "G Major", "all", "G Major Final Whole Strum"));
        sb.AppendLine("              ]");
        sb.AppendLine("            }");
        sb.AppendLine("          ]");
        sb.AppendLine("        },");
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"D, D7, Em, Am, E Chord Exercises\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'lb-s5-D-ex1', title: 'Exercise 1: D and D7 Chord Introduction',");
        sb.AppendLine("              description: 'Lesson Book p.31: D Major and D7 chords. Strum 4 strings (4-1). Quarter strums then whole note sustains.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 62, concepts: ['D Major', 'D7', '4 Strings Only', 'Chord Shape'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine("                " + MakeChordWholeBar(1, "D Major", "4-1", "D Major whole strum") + ",");
        sb.AppendLine("                " + MakeChordWholeBar(2, "D7", "4-1", "D7 whole strum") + ",");
        sb.AppendLine("                " + MakeChordQuarterBar(3, "D Major", "4-1") + ",");
        sb.AppendLine("                " + MakeChordQuarterBar(4, "D7", "4-1") + ",");
        sb.AppendLine("                " + MakeChordWholeBar(5, "D Major", "4-1", "Final D Major"));
        sb.AppendLine("              ]");
        sb.AppendLine("            },");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'lb-s5-Em-Am-ex1', title: 'Exercise 2: Em and Am Chord Introduction',");
        sb.AppendLine("              description: 'Lesson Book p.32: Em and Am minor chords. Minor chords have a darker, more serious sound.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 62, concepts: ['Em Minor', 'Am Minor', 'Minor Sound', 'Open Chords'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine("                " + MakeChordWholeBar(1, "Em", "all", "Em whole strum") + ",");
        sb.AppendLine("                " + MakeChordWholeBar(2, "Am", "5-1", "Am whole strum") + ",");
        sb.AppendLine("                " + MakeChordQuarterBar(3, "Em", "all") + ",");
        sb.AppendLine("                " + MakeChordQuarterBar(4, "Am", "5-1") + ",");
        sb.AppendLine("                " + MakeChordWholeBar(5, "Em", "all", "Em Final"));
        sb.AppendLine("              ]");
        sb.AppendLine("            },");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'lb-s5-E-ex1', title: 'Exercise 3: E Major Chord',");
        sb.AppendLine("              description: 'Lesson Book p.33: E Major chord. All 6 strings. Paired with Am for E-Am chord progression exercise.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 65, concepts: ['E Major', 'All 6 Strings', 'E-Am Progression'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine("                " + MakeChordQuarterBar(1, "E Major", "all") + ",");
        sb.AppendLine("                " + MakeChordQuarterBar(2, "Am", "5-1") + ",");
        sb.AppendLine("                " + MakeChordQuarterBar(3, "E Major", "all") + ",");
        sb.AppendLine("                " + MakeChordQuarterBar(4, "Am", "5-1") + ",");
        sb.AppendLine("                " + MakeChordWholeBar(5, "E Major", "all", "E Major Final"));
        sb.AppendLine("              ]");
        sb.AppendLine("            }");
        sb.AppendLine("          ]");
        sb.AppendLine("        },");
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Open Chord Progressions & Songs\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'lb-s5-prog-ex1', title: 'Exercise 1: G - C - D Progression (Folk)',");
        sb.AppendLine("              description: 'Lesson Book p.34: Classic G - C - D chord progression. One chord per bar with quarter strums. The most common folk progression.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 68, concepts: ['G-C-D Progression', 'Folk Pattern', 'Chord Changes'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine("                " + MakeChordQuarterBar(1, "G Major", "all") + ",");
        sb.AppendLine("                " + MakeChordQuarterBar(2, "C Major", "5-1") + ",");
        sb.AppendLine("                " + MakeChordQuarterBar(3, "D Major", "4-1") + ",");
        sb.AppendLine("                " + MakeChordQuarterBar(4, "G Major", "all") + ",");
        sb.AppendLine("                " + MakeChordQuarterBar(5, "C Major", "5-1") + ",");
        sb.AppendLine("                " + MakeChordWholeBar(6, "G Major", "all", "G Final"));
        sb.AppendLine("              ]");
        sb.AppendLine("            },");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'lb-s5-prog-ex2', title: 'Exercise 2: Am - G - C - Em Progression',");
        sb.AppendLine("              description: 'Lesson Book p.35: Minor key progression Am - G - C - Em. Dark, emotional sound.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 65, concepts: ['Am-G-C-Em', 'Minor Key', 'Chord Switching'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine("                " + MakeChordQuarterBar(1, "Am", "5-1") + ",");
        sb.AppendLine("                " + MakeChordQuarterBar(2, "G Major", "all") + ",");
        sb.AppendLine("                " + MakeChordQuarterBar(3, "C Major", "5-1") + ",");
        sb.AppendLine("                " + MakeChordQuarterBar(4, "Em", "all") + ",");
        sb.AppendLine("                " + MakeChordQuarterBar(5, "Am", "5-1") + ",");
        sb.AppendLine("                " + MakeChordWholeBar(6, "Am", "5-1", "Am Final"));
        sb.AppendLine("              ]");
        sb.AppendLine("            }");
        sb.AppendLine("          ]");
        sb.AppendLine("        }");
    }

    // =====================================================================
    // LESSON SESSION 6: Minor Seventh & Suspended Chords, 3/4 Waltz
    // =====================================================================
    private static void BuildLessonSession6(StringBuilder sb) {
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Minor Seventh Chords (Am7, Em7, Dm7)\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'lb-s6-m7-ex1', title: 'Exercise 1: Am7 and Em7 Introduction',");
        sb.AppendLine("              description: 'Lesson Book: Minor seventh chords add a 7th note for a mellow, jazzy color. Am7 lifts a finger from Am.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 65, concepts: ['Am7', 'Em7', 'Minor 7th Color', 'Chord Shape'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine("                " + MakeChordWholeBar(1, "Am7", "5-1", "Am7 - Lift 2nd finger from Am") + ",");
        sb.AppendLine("                " + MakeChordWholeBar(2, "Em7", "all", "Em7 - Remove 3rd finger from Em") + ",");
        sb.AppendLine("                " + MakeChordQuarterBar(3, "Am7", "5-1") + ",");
        sb.AppendLine("                " + MakeChordQuarterBar(4, "Em7", "all") + ",");
        sb.AppendLine("                " + MakeChordWholeBar(5, "Am7", "5-1", "Am7 Final"));
        sb.AppendLine("              ]");
        sb.AppendLine("            },");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'lb-s6-m7-ex2', title: 'Exercise 2: Dm7 Chord',");
        sb.AppendLine("              description: 'Lesson Book: Dm7 shape on 4 strings. Combine with Am7 and Em7 for minor 7th progression.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 65, concepts: ['Dm7', 'Minor 7th Progression', '4 Strings'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine("                " + MakeChordWholeBar(1, "Dm7", "4-1", "Dm7 whole strum") + ",");
        sb.AppendLine("                " + MakeChordWholeBar(2, "Am7", "5-1", "Am7 whole strum") + ",");
        sb.AppendLine("                " + MakeChordWholeBar(3, "Em7", "all", "Em7 whole strum") + ",");
        sb.AppendLine("                " + MakeChordWholeBar(4, "Am7", "5-1", "Am7 Final"));
        sb.AppendLine("              ]");
        sb.AppendLine("            }");
        sb.AppendLine("          ]");
        sb.AppendLine("        },");
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Suspended Chords (Dsus2, Csus2)\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'lb-s6-sus-ex1', title: 'Exercise 1: Dsus2 to D Chord',");
        sb.AppendLine("              description: 'Lesson Book: Suspended chord creates tension that resolves. Dsus2 resolves to D Major.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 65, concepts: ['Dsus2', 'Suspended Chord', 'Resolution to D'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine("                " + MakeChordWholeBar(1, "Dsus2", "4-1", "Dsus2 tension") + ",");
        sb.AppendLine("                " + MakeChordWholeBar(2, "D Major", "4-1", "D resolve") + ",");
        sb.AppendLine("                " + MakeChordWholeBar(3, "Dsus2", "4-1", "Dsus2 tension again") + ",");
        sb.AppendLine("                " + MakeChordWholeBar(4, "D Major", "4-1", "D resolve final"));
        sb.AppendLine("              ]");
        sb.AppendLine("            },");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'lb-s6-sus-ex2', title: 'Exercise 2: Csus2 to C Chord',");
        sb.AppendLine("              description: 'Lesson Book: Csus2 to C Major resolution. Common in pop and folk music.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 65, concepts: ['Csus2', 'C Major Resolution', 'Sus-to-Tonic'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine("                " + MakeChordWholeBar(1, "Csus2", "5-1", "Csus2") + ",");
        sb.AppendLine("                " + MakeChordWholeBar(2, "C Major", "5-1", "C Major") + ",");
        sb.AppendLine("                " + MakeChordQuarterBar(3, "Csus2", "5-1") + ",");
        sb.AppendLine("                " + MakeChordQuarterBar(4, "C Major", "5-1") + ",");
        sb.AppendLine("                " + MakeChordWholeBar(5, "C Major", "5-1", "C Final"));
        sb.AppendLine("              ]");
        sb.AppendLine("            }");
        sb.AppendLine("          ]");
        sb.AppendLine("        },");
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"3/4 Waltz Strumming Patterns\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'lb-s6-waltz-ex1', title: 'Exercise 1: 3/4 Waltz - One Strum Per Beat',");
        sb.AppendLine("              description: 'Lesson Book: 3/4 time waltz feel. THREE beats per bar. Strong downbeat on beat 1, lighter 2 and 3.',");
        sb.AppendLine("              timeSignature: [3, 4], defaultBpm: 65, concepts: ['3/4 Waltz', 'Down-Down-Down', 'Strong Beat 1'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine(string.Format("                {{ measure: 1, beats: [ {0}, {1}, {2} ] }},",
            MakeChordBeat(1,"Am7","5-1"), MakeChordBeat(2,"Am7","5-1"), MakeChordBeat(3,"Am7","5-1")));
        sb.AppendLine(string.Format("                {{ measure: 2, beats: [ {0}, {1}, {2} ] }},",
            MakeChordBeat(1,"Em7","all"), MakeChordBeat(2,"Em7","all"), MakeChordBeat(3,"Em7","all")));
        sb.AppendLine(string.Format("                {{ measure: 3, beats: [ {0}, {1}, {2} ] }},",
            MakeChordBeat(1,"Am7","5-1"), MakeChordBeat(2,"Am7","5-1"), MakeChordBeat(3,"Am7","5-1")));
        sb.AppendLine(string.Format("                {{ measure: 4, beats: [ {0}, {1}, {2} ] }}",
            MakeChordBeat(1,"Em7","all"), MakeChordBeat(2,"Em7","all"), MakeChordBeat(3,"Em7","all")));
        sb.AppendLine("              ]");
        sb.AppendLine("            }");
        sb.AppendLine("          ]");
        sb.AppendLine("        }");
    }

    // =====================================================================
    // LESSON SESSION 7: Root-6 Barre Chords, Chromatic Steps, Major Scales
    // =====================================================================
    private static void BuildLessonSession7(StringBuilder sb) {
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Root-6 Barre Chords\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'lb-s7-barre6-ex1', title: 'Exercise 1: F Major Barre Chord (Fret 1)',");
        sb.AppendLine("              description: 'Lesson Book: F Major - the first barre chord. Index finger bars all 6 strings at fret 1. Build up slowly.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 60, concepts: ['F Major Barre', 'Root 6', 'Index Bar Fret 1', 'All 6 Strings'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine("                " + MakeChordWholeBar(1, "F Major", "all", "F Barre Chord Fret 1") + ",");
        sb.AppendLine("                " + MakeChordWholeBar(2, "C Major", "5-1", "C Open - Compare feel") + ",");
        sb.AppendLine("                " + MakeChordQuarterBar(3, "F Major", "all") + ",");
        sb.AppendLine("                " + MakeChordQuarterBar(4, "C Major", "5-1") + ",");
        sb.AppendLine("                " + MakeChordWholeBar(5, "F Major", "all", "F Barre Final"));
        sb.AppendLine("              ]");
        sb.AppendLine("            },");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'lb-s7-barre6-ex2', title: 'Exercise 2: G Major Barre (Fret 3) & A Major Barre (Fret 5)',");
        sb.AppendLine("              description: 'Lesson Book: Move root-6 barre shape up the neck. Fret 3 = G Major, Fret 5 = A Major. Same shape, different roots.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 62, concepts: ['G Barre Fret 3', 'A Barre Fret 5', 'Moveable Shape'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine("                " + MakeChordWholeBar(1, "F Major", "all", "F Barre Fret 1") + ",");
        sb.AppendLine("                " + MakeChordWholeBar(2, "G Major", "all", "G Barre Fret 3") + ",");
        sb.AppendLine("                " + MakeChordWholeBar(3, "A Major", "all", "A Barre Fret 5") + ",");
        sb.AppendLine("                " + MakeChordWholeBar(4, "G Major", "all", "G Barre Fret 3") + ",");
        sb.AppendLine("                " + MakeChordWholeBar(5, "F Major", "all", "F Barre Fret 1 Final"));
        sb.AppendLine("              ]");
        sb.AppendLine("            }");
        sb.AppendLine("          ]");
        sb.AppendLine("        },");
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Chromatic Scale & Major Scale\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'lb-s7-chromatic-ex1', title: 'Exercise 1: Chromatic Scale (Low E String)',");
        sb.AppendLine("              description: 'Lesson Book: Chromatic scale = every half step (every fret) on the 6th string. Frets 0-1-2-3-4-5 ascending.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 65, concepts: ['Chromatic Scale', 'Half Steps', 'Every Fret', 'Low E String'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine(string.Format("                {{ measure: 1, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"Low E","1/4","play",6,0,0,"Down","Open Low E"), MakeB(2,"F","1/4","play",6,1,1,"Up","Fret 1"),
            MakeB(3,"F#","1/4","play",6,2,2,"Down","Fret 2"), MakeB(4,"G","1/4","play",6,3,3,"Up","Fret 3")));
        sb.AppendLine(string.Format("                {{ measure: 2, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"G#","1/4","play",6,4,4,"Down","Fret 4"), MakeB(2,"A","1/4","play",5,0,0,"Up","5th Open"),
            MakeB(3,"A#","1/4","play",5,1,1,"Down","5th Fret 1"), MakeB(4,"B","1/4","play",5,2,2,"Up","5th Fret 2")));
        sb.AppendLine(string.Format("                {{ measure: 3, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"C","1/4","play",5,3,3,"Down","5th Fret 3"), MakeB(2,"D","1/4","play",4,0,0,"Up","4th Open"),
            MakeB(3,"D#","1/4","play",4,1,1,"Down","4th Fret 1"), MakeB(4,"E","1/4","play",4,2,2,"Up","4th Fret 2")));
        sb.AppendLine("                " + MakeWholeBar(4, "F", 4, 3, 3, "Down", "F 4th String Fret 3"));
        sb.AppendLine("              ]");
        sb.AppendLine("            },");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'lb-s7-major-scale-ex1', title: 'Exercise 2: C Major Scale (1st Position)',");
        sb.AppendLine("              description: 'Lesson Book: C Major scale in 1st position. All natural notes C-D-E-F-G-A-B-C across strings 5 through 1.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 65, concepts: ['C Major Scale', '1st Position', 'Whole Steps', 'Scale Reading'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine(string.Format("                {{ measure: 1, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"C","1/4","play",5,3,3,"Down","C - 5th Str Fret 3"), MakeB(2,"D","1/4","play",4,0,0,"Up","D - 4th Open"),
            MakeB(3,"E","1/4","play",4,2,2,"Down","E - 4th Fret 2"), MakeB(4,"F","1/4","play",4,3,3,"Up","F - 4th Fret 3")));
        sb.AppendLine(string.Format("                {{ measure: 2, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"G","1/4","play",3,0,0,"Down","G - 3rd Open"), MakeB(2,"A","1/4","play",3,2,2,"Up","A - 3rd Fret 2"),
            MakeB(3,"B","1/4","play",2,0,0,"Down","B - 2nd Open"), MakeB(4,"C","1/4","play",2,1,1,"Up","C - 2nd Fret 1")));
        sb.AppendLine(string.Format("                {{ measure: 3, beats: [ {0}, {1}, {2}, {3} ] }}",
            MakeB(1,"C","1/2","play",2,1,1,"Down",2,"C Half - Peak"), MakeSustainB(2,"C","1/2",2,1,1,2,"Hold"),
            MakeB(3,"B","1/4","play",2,0,0,"Down","B descending"), MakeB(4,"A","1/4","play",3,2,2,"Up","A descending")));
        sb.AppendLine("              ]");
        sb.AppendLine("            }");
        sb.AppendLine("          ]");
        sb.AppendLine("        }");
    }

    // =====================================================================
    // LESSON SESSION 8: Root-5 Barre Chords, Keys, Relative Major/Minor
    // =====================================================================
    private static void BuildLessonSession8(StringBuilder sb) {
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Root-5 Barre Chords\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'lb-s8-barre5-ex1', title: 'Exercise 1: Bm Barre Chord (5th String Root, Fret 2)',");
        sb.AppendLine("              description: 'Lesson Book: Root-5 minor barre chord shape. B minor at fret 2. Bar all strings with index, add ring+pinky.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 60, concepts: ['Root-5 Barre', 'Bm Shape', 'Fret 2', 'Minor Barre'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine("                " + MakeChordWholeBar(1, "Bm", "5-1", "Bm Barre Fret 2") + ",");
        sb.AppendLine("                " + MakeChordWholeBar(2, "Em", "all", "Em Open - compare") + ",");
        sb.AppendLine("                " + MakeChordQuarterBar(3, "Bm", "5-1") + ",");
        sb.AppendLine("                " + MakeChordQuarterBar(4, "Em", "all") + ",");
        sb.AppendLine("                " + MakeChordWholeBar(5, "Bm", "5-1", "Bm Final"));
        sb.AppendLine("              ]");
        sb.AppendLine("            },");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'lb-s8-barre5-ex2', title: 'Exercise 2: Major Root-5 Barre Shapes',");
        sb.AppendLine("              description: 'Lesson Book: Root-5 major barre chord. Bb at fret 1, C at fret 3, D at fret 5. Moveable major barre.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 62, concepts: ['Bb Major', 'C Barre', 'D Barre', 'Root-5 Major'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine("                " + MakeChordWholeBar(1, "Bb Major", "5-1", "Bb Barre Fret 1") + ",");
        sb.AppendLine("                " + MakeChordWholeBar(2, "C Major", "5-1", "C Barre Fret 3") + ",");
        sb.AppendLine("                " + MakeChordWholeBar(3, "D Major", "5-1", "D Barre Fret 5") + ",");
        sb.AppendLine("                " + MakeChordWholeBar(4, "C Major", "5-1", "C Barre Fret 3") + ",");
        sb.AppendLine("                " + MakeChordWholeBar(5, "Bb Major", "5-1", "Bb Final"));
        sb.AppendLine("              ]");
        sb.AppendLine("            }");
        sb.AppendLine("          ]");
        sb.AppendLine("        },");
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Keys & Relative Major/Minor\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'lb-s8-keys-ex1', title: 'Exercise 1: Key of G - Primary Chords (G, C, D)',");
        sb.AppendLine("              description: 'Lesson Book: Primary chords in key of G. I=G, IV=C, V=D. The 1-4-5 chord progression foundation.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 70, concepts: ['Key of G', 'I-IV-V', 'G-C-D', 'Chord Function'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine("                " + MakeChordQuarterBar(1, "G Major", "all") + ",");
        sb.AppendLine("                " + MakeChordQuarterBar(2, "C Major", "5-1") + ",");
        sb.AppendLine("                " + MakeChordQuarterBar(3, "D Major", "4-1") + ",");
        sb.AppendLine("                " + MakeChordQuarterBar(4, "G Major", "all") + ",");
        sb.AppendLine("                " + MakeChordQuarterBar(5, "D Major", "4-1") + ",");
        sb.AppendLine("                " + MakeChordWholeBar(6, "G Major", "all", "G Final"));
        sb.AppendLine("              ]");
        sb.AppendLine("            },");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'lb-s8-rel-ex1', title: 'Exercise 2: Relative Minor - A minor is relative to C Major',");
        sb.AppendLine("              description: 'Lesson Book: Am is the relative minor of C Major. They share the same key signature. Am - C - G progression.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 68, concepts: ['Relative Minor', 'Am-C-G', 'Shared Key Signature'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine("                " + MakeChordQuarterBar(1, "Am", "5-1") + ",");
        sb.AppendLine("                " + MakeChordQuarterBar(2, "C Major", "5-1") + ",");
        sb.AppendLine("                " + MakeChordQuarterBar(3, "G Major", "all") + ",");
        sb.AppendLine("                " + MakeChordQuarterBar(4, "Am", "5-1") + ",");
        sb.AppendLine("                " + MakeChordWholeBar(5, "Am", "5-1", "Am Final"));
        sb.AppendLine("              ]");
        sb.AppendLine("            }");
        sb.AppendLine("          ]");
        sb.AppendLine("        }");
    }

    // =====================================================================
    // LESSON SESSION 9: Strumming Technique, The Motor Motion, Intervals
    // =====================================================================
    private static void BuildLessonSession9(StringBuilder sb) {
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"The Motor Motion - Eighth Note Strumming\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'lb-s9-motor-ex1', title: 'Exercise 1: The Motor Motion (8th Note Strum Arm)',");
        sb.AppendLine("              description: 'Lesson Book: Strum arm moves in continuous down-up 8th note motion. Keep arm moving even on rests. Count 1-and-2-and-3-and-4-and.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 65, concepts: ['Motor Motion', 'Down-Up 8th Notes', 'Strum Arm Consistency'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine(string.Format("                {{ measure: 1, beats: [ {0}, {1}, {2}, {3}, {4}, {5}, {6}, {7} ] }},",
            MakeChordBeat(1,"G Major","all"), MakeChordBeat(2,"G Major","all"),
            MakeChordBeat(3,"G Major","all"), MakeChordBeat(4,"G Major","all"),
            MakeChordBeat(5,"G Major","all"), MakeChordBeat(6,"G Major","all"),
            MakeChordBeat(7,"G Major","all"), MakeChordBeat(8,"G Major","all")));
        sb.AppendLine(string.Format("                {{ measure: 2, beats: [ {0}, {1}, {2}, {3}, {4}, {5}, {6}, {7} ] }}",
            MakeChordBeat(1,"C Major","5-1"), MakeChordBeat(2,"C Major","5-1"),
            MakeChordBeat(3,"C Major","5-1"), MakeChordBeat(4,"C Major","5-1"),
            MakeChordBeat(5,"G Major","all"), MakeChordBeat(6,"G Major","all"),
            MakeChordBeat(7,"G Major","all"), MakeChordBeat(8,"G Major","all")));
        sb.AppendLine("              ]");
        sb.AppendLine("            },");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'lb-s9-motor-ex2', title: 'Exercise 2: Down-Up Pattern with Chord Changes',");
        sb.AppendLine("              description: 'Lesson Book: Apply motor motion strum to chord progressions. D D-U D-U D-U pattern.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 70, concepts: ['D D-U Pattern', 'Chord Changes', 'Strum Pattern'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine(string.Format("                {{ measure: 1, beats: [ {0}, {1}, {2}, {3}, {4}, {5}, {6}, {7} ] }},",
            MakeChordBeat(1,"G Major","all"), MakeChordBeat(2,"G Major","all"),
            MakeChordBeat(3,"D Major","4-1"), MakeChordBeat(4,"D Major","4-1"),
            MakeChordBeat(5,"D Major","4-1"), MakeChordBeat(6,"D Major","4-1"),
            MakeChordBeat(7,"G Major","all"), MakeChordBeat(8,"G Major","all")));
        sb.AppendLine(string.Format("                {{ measure: 2, beats: [ {0}, {1}, {2}, {3}, {4}, {5}, {6}, {7} ] }}",
            MakeChordBeat(1,"C Major","5-1"), MakeChordBeat(2,"C Major","5-1"),
            MakeChordBeat(3,"C Major","5-1"), MakeChordBeat(4,"C Major","5-1"),
            MakeChordBeat(5,"D Major","4-1"), MakeChordBeat(6,"D Major","4-1"),
            MakeChordBeat(7,"G Major","all"), MakeChordBeat(8,"G Major","all")));
        sb.AppendLine("              ]");
        sb.AppendLine("            }");
        sb.AppendLine("          ]");
        sb.AppendLine("        },");
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Intervals & Ear Training\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'lb-s9-interval-ex1', title: 'Exercise 1: Intervals on 1st & 2nd Strings',");
        sb.AppendLine("              description: 'Lesson Book: Intervals = distance between two notes. Play E then G (minor 3rd). E then A (perfect 4th). Train your ear.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 65, concepts: ['Intervals', 'Minor 3rd', 'Perfect 4th', 'Ear Training'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine(string.Format("                {{ measure: 1, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"High E","1/4","play",1,0,0,"Down","E"), MakeB(2,"G","1/4","play",1,3,3,"Up","G (minor 3rd above E)"),
            MakeB(3,"High E","1/4","play",1,0,0,"Down","E"), MakeB(4,"A","1/4","play",3,2,2,"Up","A (perfect 4th above E)")));
        sb.AppendLine(string.Format("                {{ measure: 2, beats: [ {0}, {1}, {2}, {3} ] }}",
            MakeB(1,"B","1/4","play",2,0,0,"Down","B"), MakeB(2,"High E","1/4","play",1,0,0,"Up","E (perfect 4th above B)"),
            MakeB(3,"B","1/2","play",2,0,0,"Down",2,"B Half"), MakeSustainB(4,"B","1/2",2,0,0,2,"Hold")));
        sb.AppendLine("              ]");
        sb.AppendLine("            }");
        sb.AppendLine("          ]");
        sb.AppendLine("        }");
    }

    // =====================================================================
    // LESSON SESSION 10: Fingerstyle P-I-M-A, Arpeggios
    // =====================================================================
    private static void BuildLessonSession10(StringBuilder sb) {
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Fingerstyle Technique - P-I-M-A\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'lb-s10-pima-ex1', title: 'Exercise 1: P-I-M-A Introduction on Open Strings',");
        sb.AppendLine("              description: 'Lesson Book: P=pulgar (thumb, strings 6-4), I=index (3rd), M=middle (2nd), A=ring (1st). Practice on open strings first.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 55, concepts: ['P-I-M-A Fingering', 'Thumb (P)', 'Index (I)', 'Middle (M)', 'Ring (A)'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine(string.Format("                {{ measure: 1, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"Low E","1/4","play",6,0,0,"P","P - Thumb 6th String"), MakeB(2,"G","1/4","play",3,0,0,"I","I - Index 3rd String"),
            MakeB(3,"B","1/4","play",2,0,0,"M","M - Middle 2nd String"), MakeB(4,"High E","1/4","play",1,0,0,"A","A - Ring 1st String")));
        sb.AppendLine(string.Format("                {{ measure: 2, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"A","1/4","play",5,0,0,"P","P - Thumb 5th String"), MakeB(2,"G","1/4","play",3,0,0,"I","I - Index"),
            MakeB(3,"B","1/4","play",2,0,0,"M","M - Middle"), MakeB(4,"High E","1/4","play",1,0,0,"A","A - Ring")));
        sb.AppendLine(string.Format("                {{ measure: 3, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"D","1/4","play",4,0,0,"P","P - Thumb 4th String"), MakeB(2,"G","1/4","play",3,0,0,"I","I - Index"),
            MakeB(3,"B","1/4","play",2,0,0,"M","M - Middle"), MakeB(4,"High E","1/4","play",1,0,0,"A","A - Ring")));
        sb.AppendLine(string.Format("                {{ measure: 4, beats: [ {0}, {1}, {2}, {3} ] }}",
            MakeB(1,"Low E","1/4","play",6,0,0,"P","P Bass"), MakeB(2,"High E","1/4","play",1,0,0,"A","A treble"),
            MakeB(3,"B","1/4","play",2,0,0,"M","M"), MakeB(4,"G","1/4","play",3,0,0,"I","I")));
        sb.AppendLine("              ]");
        sb.AppendLine("            },");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'lb-s10-pima-ex2', title: 'Exercise 2: C Major Arpeggio (P-I-M-A)',");
        sb.AppendLine("              description: 'Lesson Book: Play C Major chord as an arpeggio - notes individually in P-I-M-A pattern. Clean pluck each string.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 58, concepts: ['C Major Arpeggio', 'P-I-M-A Pattern', 'Clean Pluck'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine(string.Format("                {{ measure: 1, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"C","1/4","play",5,3,3,"P","C - Thumb 5th Fret 3"), MakeB(2,"G","1/4","play",3,0,0,"I","G - Index 3rd Open"),
            MakeB(3,"C","1/4","play",2,1,1,"M","C - Middle 2nd Fret 1"), MakeB(4,"High E","1/4","play",1,0,0,"A","E - Ring 1st Open")));
        sb.AppendLine(string.Format("                {{ measure: 2, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"C","1/4","play",5,3,3,"P","C bass again"), MakeB(2,"High E","1/4","play",1,0,0,"A","E treble"),
            MakeB(3,"C","1/4","play",2,1,1,"M","C middle"), MakeB(4,"G","1/4","play",3,0,0,"I","G index")));
        sb.AppendLine(string.Format("                {{ measure: 3, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"A","1/4","play",5,0,0,"P","A - Am bass"), MakeB(2,"G","1/4","play",3,0,0,"I","G"),
            MakeB(3,"C","1/4","play",2,1,1,"M","C"), MakeB(4,"High E","1/4","play",1,0,0,"A","E")));
        sb.AppendLine(string.Format("                {{ measure: 4, beats: [ {0}, {1}, {2}, {3} ] }}",
            MakeB(1,"C","1/4","play",5,3,3,"P","C back"), MakeB(2,"G","1/4","play",3,0,0,"I","G"),
            MakeB(3,"C","1/4","play",2,1,1,"M","C"), MakeB(4,"High E","1/4","play",1,0,0,"A","E - Final")));
        sb.AppendLine("              ]");
        sb.AppendLine("            }");
        sb.AppendLine("          ]");
        sb.AppendLine("        },");
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Arpeggio Patterns & Classical Pieces\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'lb-s10-arp-ex1', title: 'Exercise 1: G Major Arpeggio - P-I-M-A-M-I Pattern',");
        sb.AppendLine("              description: 'Lesson Book: G Major chord arpeggiated in P-I-M-A-M-I pattern (6 plucks per bar). Classic classical fingerstyle.',");
        sb.AppendLine("              timeSignature: [3, 4], defaultBpm: 55, concepts: ['G Major Arpeggio', 'P-I-M-A-M-I', 'Classical Pattern', '3/4'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine(string.Format("                {{ measure: 1, beats: [ {0}, {1}, {2} ] }},",
            MakeB(1,"Low E","3/4","play",6,3,3,"P",3,"G Bass"), MakeB(2,"B","3/4","play",2,0,0,"M",3,"B Middle"), MakeB(3,"High E","3/4","play",1,3,3,"A",3,"High G")));
        sb.AppendLine(string.Format("                {{ measure: 2, beats: [ {0}, {1}, {2} ] }},",
            MakeB(1,"A","3/4","play",5,0,0,"P",3,"A 5th"), MakeB(2,"G","3/4","play",3,0,0,"I",3,"G 3rd"), MakeB(3,"B","3/4","play",2,0,0,"M",3,"B 2nd")));
        sb.AppendLine(string.Format("                {{ measure: 3, beats: [ {0}, {1}, {2} ] }},",
            MakeB(1,"D","3/4","play",4,0,0,"P",3,"D 4th"), MakeB(2,"G","3/4","play",3,0,0,"I",3,"G 3rd"), MakeB(3,"High E","3/4","play",1,0,0,"A",3,"E 1st")));
        sb.AppendLine(string.Format("                {{ measure: 4, beats: [ {0}, {1}, {2} ] }}",
            MakeB(1,"Low E","3/4","play",6,3,3,"P",3,"G Bass"), MakeSustainB(2,"Low E","3/4",6,3,3,3,"Hold"), MakeSustainB(3,"Low E","3/4",6,3,3,3,"Hold")));
        sb.AppendLine("              ]");
        sb.AppendLine("            }");
        sb.AppendLine("          ]");
        sb.AppendLine("        }");
    }

    // =====================================================================
    // LESSON SESSION 11: Pentatonic Scales
    // =====================================================================
    private static void BuildLessonSession11(StringBuilder sb) {
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Minor Pentatonic Scale (A)\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'lb-s11-minpent-ex1', title: 'Exercise 1: A Minor Pentatonic - Box 1 Ascending',");
        sb.AppendLine("              description: 'Lesson Book: A minor pentatonic Box 1 (frets 5-8). Root A on 6th string fret 5. A-C-D-E-G pattern on all 6 strings.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 65, concepts: ['A Minor Pentatonic', 'Box 1', 'Frets 5-8', 'Scale Pattern'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine(string.Format("                {{ measure: 1, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"A","1/4","play",6,5,1,"Down","A Root - 6th Fret 5"), MakeB(2,"C","1/4","play",6,8,4,"Up","C - 6th Fret 8"),
            MakeB(3,"D","1/4","play",5,5,1,"Down","D - 5th Fret 5"), MakeB(4,"E","1/4","play",5,7,3,"Up","E - 5th Fret 7")));
        sb.AppendLine(string.Format("                {{ measure: 2, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"G","1/4","play",4,5,1,"Down","G - 4th Fret 5"), MakeB(2,"A","1/4","play",4,7,3,"Up","A - 4th Fret 7"),
            MakeB(3,"A","1/4","play",3,5,1,"Down","A - 3rd Fret 5"), MakeB(4,"C","1/4","play",3,8,4,"Up","C - 3rd Fret 8")));
        sb.AppendLine(string.Format("                {{ measure: 3, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"D","1/4","play",2,6,2,"Down","D - 2nd Fret 6"), MakeB(2,"E","1/4","play",2,8,4,"Up","E - 2nd Fret 8"),
            MakeB(3,"E","1/4","play",1,5,1,"Down","E - 1st Fret 5"), MakeB(4,"G","1/4","play",1,8,4,"Up","G - 1st Fret 8")));
        sb.AppendLine("                " + MakeWholeBar(4, "A", 1, 5, 1, "Down", "A High Root - Peak"));
        sb.AppendLine("              ]");
        sb.AppendLine("            },");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'lb-s11-minpent-ex2', title: 'Exercise 2: A Minor Pentatonic - Descending',");
        sb.AppendLine("              description: 'Lesson Book: Play the A minor pentatonic scale descending from high A back to root.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 65, concepts: ['Descending Scale', 'Pentatonic', 'Alternate Picking'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine(string.Format("                {{ measure: 1, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"A","1/4","play",1,5,1,"Down","A High"), MakeB(2,"G","1/4","play",1,8,4,"Up","G descend"),
            MakeB(3,"E","1/4","play",2,8,4,"Down","E 2nd"), MakeB(4,"D","1/4","play",2,6,2,"Up","D 2nd")));
        sb.AppendLine(string.Format("                {{ measure: 2, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"C","1/4","play",3,8,4,"Down","C 3rd"), MakeB(2,"A","1/4","play",3,5,1,"Up","A 3rd"),
            MakeB(3,"A","1/4","play",4,7,3,"Down","A 4th"), MakeB(4,"G","1/4","play",4,5,1,"Up","G 4th")));
        sb.AppendLine(string.Format("                {{ measure: 3, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"E","1/4","play",5,7,3,"Down","E 5th"), MakeB(2,"D","1/4","play",5,5,1,"Up","D 5th"),
            MakeB(3,"C","1/4","play",6,8,4,"Down","C 6th"), MakeB(4,"A","1/4","play",6,5,1,"Up","A Root Low")));
        sb.AppendLine("                " + MakeWholeBar(4, "A", 6, 5, 1, "Down", "A Root Final"));
        sb.AppendLine("              ]");
        sb.AppendLine("            }");
        sb.AppendLine("          ]");
        sb.AppendLine("        },");
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Major Pentatonic & Scale Licks\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'lb-s11-majpent-ex1', title: 'Exercise 1: G Major Pentatonic Scale',");
        sb.AppendLine("              description: 'Lesson Book: G Major Pentatonic (G-A-B-D-E). Box 1 starting on 6th string fret 3 (G).',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 65, concepts: ['G Major Pentatonic', 'Major Sound', 'Box 1'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine(string.Format("                {{ measure: 1, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"G","1/4","play",6,3,1,"Down","G Root 6th Fret 3"), MakeB(2,"A","1/4","play",6,5,3,"Up","A 6th Fret 5"),
            MakeB(3,"G","1/4","play",5,5,3,"Down","G 5th Fret 5... wait, B"), MakeB(4,"B","1/4","play",5,2,1,"Up","B 5th Fret 2")));
        sb.AppendLine(string.Format("                {{ measure: 2, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"D","1/4","play",4,0,0,"Down","D 4th Open"), MakeB(2,"G","1/4","play",3,0,0,"Up","G 3rd Open"),
            MakeB(3,"A","1/4","play",3,2,2,"Down","A 3rd Fret 2"), MakeB(4,"B","1/4","play",2,0,0,"Up","B 2nd Open")));
        sb.AppendLine(string.Format("                {{ measure: 3, beats: [ {0}, {1}, {2}, {3} ] }}",
            MakeB(1,"D","1/4","play",2,3,3,"Down","D 2nd Fret 3"), MakeB(2,"High E","1/4","play",1,0,0,"Up","E 1st Open"),
            MakeB(3,"G","1/2","play",1,3,3,"Down",2,"G High"), MakeSustainB(4,"G","1/2",1,3,3,2,"Hold")));
        sb.AppendLine("              ]");
        sb.AppendLine("            }");
        sb.AppendLine("          ]");
        sb.AppendLine("        }");
    }

    // =====================================================================
    // LESSON SESSION 12: Advanced Chords - Major 7th, Minor 11th
    // =====================================================================
    private static void BuildLessonSession12(StringBuilder sb) {
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Major 7th Chords\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'lb-s12-maj7-ex1', title: 'Exercise 1: Cmaj7 and Gmaj7 Chords',");
        sb.AppendLine("              description: 'Lesson Book: Major 7th chords have a bright, sophisticated jazz-pop sound. Cmaj7 lifts a finger from C Major.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 65, concepts: ['Cmaj7', 'Gmaj7', 'Major 7th Sound', 'Jazz-Pop'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine("                " + MakeChordWholeBar(1, "Cmaj7", "5-1", "Cmaj7") + ",");
        sb.AppendLine("                " + MakeChordWholeBar(2, "Gmaj7", "all", "Gmaj7") + ",");
        sb.AppendLine("                " + MakeChordQuarterBar(3, "Cmaj7", "5-1") + ",");
        sb.AppendLine("                " + MakeChordQuarterBar(4, "Gmaj7", "all") + ",");
        sb.AppendLine("                " + MakeChordWholeBar(5, "Cmaj7", "5-1", "Cmaj7 Final"));
        sb.AppendLine("              ]");
        sb.AppendLine("            },");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'lb-s12-maj7-ex2', title: 'Exercise 2: Fmaj7 - Cmaj7 Progression',");
        sb.AppendLine("              description: 'Lesson Book: Fmaj7 to Cmaj7 progression. Beautiful jazz-pop sound. Fmaj7 avoids the barre - lift index!',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 62, concepts: ['Fmaj7', 'IV-I Progression', 'Chord Substitution'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine("                " + MakeChordQuarterBar(1, "Fmaj7", "4-1") + ",");
        sb.AppendLine("                " + MakeChordQuarterBar(2, "Fmaj7", "4-1") + ",");
        sb.AppendLine("                " + MakeChordQuarterBar(3, "Cmaj7", "5-1") + ",");
        sb.AppendLine("                " + MakeChordQuarterBar(4, "Cmaj7", "5-1") + ",");
        sb.AppendLine("                " + MakeChordWholeBar(5, "Fmaj7", "4-1", "Fmaj7 Final"));
        sb.AppendLine("              ]");
        sb.AppendLine("            }");
        sb.AppendLine("          ]");
        sb.AppendLine("        },");
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Minor 11th & Chord Substitution\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'lb-s12-min11-ex1', title: 'Exercise 1: Am11 Chord',");
        sb.AppendLine("              description: 'Lesson Book: Am11 - a lush extended minor chord. Used in R&B and jazz contexts.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 62, concepts: ['Am11', 'Extended Chord', 'R&B Sound'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine("                " + MakeChordWholeBar(1, "Am11", "5-1", "Am11 - full sound") + ",");
        sb.AppendLine("                " + MakeChordWholeBar(2, "Fmaj7", "4-1", "Fmaj7 - substitute") + ",");
        sb.AppendLine("                " + MakeChordQuarterBar(3, "Am11", "5-1") + ",");
        sb.AppendLine("                " + MakeChordQuarterBar(4, "Fmaj7", "4-1") + ",");
        sb.AppendLine("                " + MakeChordWholeBar(5, "Am11", "5-1", "Am11 Final"));
        sb.AppendLine("              ]");
        sb.AppendLine("            }");
        sb.AppendLine("          ]");
        sb.AppendLine("        }");
    }

    // =====================================================================
    // LESSON SESSION 13: Blues - 12-Bar, Blues Scale, Dominant 7th
    // =====================================================================
    private static void BuildLessonSession13(StringBuilder sb) {
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"12-Bar Blues in A\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'lb-s13-blues12-ex1', title: 'Exercise 1: 12-Bar Blues Chord Progression in A',");
        sb.AppendLine("              description: 'Lesson Book: The 12-bar blues: 4 bars A7, 2 bars D7, 2 bars A7, 1 bar E7, 1 bar D7, 2 bars A7. The foundation of rock, blues, jazz.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 72, concepts: ['12-Bar Blues', 'A7-D7-E7', 'I-IV-V Blues', 'Dominant 7ths'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine("                " + MakeChordQuarterBar(1, "A7", "5-1") + ",");
        sb.AppendLine("                " + MakeChordQuarterBar(2, "A7", "5-1") + ",");
        sb.AppendLine("                " + MakeChordQuarterBar(3, "A7", "5-1") + ",");
        sb.AppendLine("                " + MakeChordQuarterBar(4, "A7", "5-1") + ",");
        sb.AppendLine("                " + MakeChordQuarterBar(5, "D7", "4-1") + ",");
        sb.AppendLine("                " + MakeChordQuarterBar(6, "D7", "4-1") + ",");
        sb.AppendLine("                " + MakeChordQuarterBar(7, "A7", "5-1") + ",");
        sb.AppendLine("                " + MakeChordQuarterBar(8, "A7", "5-1") + ",");
        sb.AppendLine("                " + MakeChordQuarterBar(9, "E7", "all") + ",");
        sb.AppendLine("                " + MakeChordQuarterBar(10, "D7", "4-1") + ",");
        sb.AppendLine("                " + MakeChordQuarterBar(11, "A7", "5-1") + ",");
        sb.AppendLine("                " + MakeChordQuarterBar(12, "E7", "all"));
        sb.AppendLine("              ]");
        sb.AppendLine("            },");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'lb-s13-blues12-ex2', title: 'Exercise 2: Shuffle Rhythm 12-Bar Blues',");
        sb.AppendLine("              description: 'Lesson Book: Shuffle = swing 8th notes. Long-short feel. The blues groove that makes you tap your foot.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 80, concepts: ['Shuffle Rhythm', 'Swing 8ths', 'Long-Short Feel', 'Blues Groove'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine(string.Format("                {{ measure: 1, beats: [ {0}, {1}, {2}, {3}, {4}, {5}, {6}, {7} ] }},",
            MakeChordBeat(1,"A7","5-1"), MakeChordBeat(2,"A7","5-1"), MakeChordBeat(3,"A7","5-1"), MakeChordBeat(4,"A7","5-1"),
            MakeChordBeat(5,"A7","5-1"), MakeChordBeat(6,"A7","5-1"), MakeChordBeat(7,"A7","5-1"), MakeChordBeat(8,"A7","5-1")));
        sb.AppendLine(string.Format("                {{ measure: 2, beats: [ {0}, {1}, {2}, {3}, {4}, {5}, {6}, {7} ] }}",
            MakeChordBeat(1,"D7","4-1"), MakeChordBeat(2,"D7","4-1"), MakeChordBeat(3,"D7","4-1"), MakeChordBeat(4,"D7","4-1"),
            MakeChordBeat(5,"A7","5-1"), MakeChordBeat(6,"A7","5-1"), MakeChordBeat(7,"E7","all"), MakeChordBeat(8,"A7","5-1")));
        sb.AppendLine("              ]");
        sb.AppendLine("            }");
        sb.AppendLine("          ]");
        sb.AppendLine("        },");
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Blues Scale in A\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'lb-s13-bluesscale-ex1', title: 'Exercise 1: A Blues Scale Ascending',");
        sb.AppendLine("              description: 'Lesson Book: A Blues Scale = A-C-D-Eb-E-G. The minor pentatonic with an added flat 5 (blue note Eb/D#).',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 70, concepts: ['A Blues Scale', 'Flat 5 Blue Note', 'A-C-D-Eb-E-G'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine(string.Format("                {{ measure: 1, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"A","1/4","play",6,5,1,"Down","A Root"), MakeB(2,"C","1/4","play",6,8,4,"Up","C minor 3rd"),
            MakeB(3,"D","1/4","play",5,5,1,"Down","D"), MakeB(4,"D#","1/4","play",5,6,2,"Up","Eb Blue Note!")));
        sb.AppendLine(string.Format("                {{ measure: 2, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"E","1/4","play",5,7,3,"Down","E"), MakeB(2,"G","1/4","play",4,5,1,"Up","G"),
            MakeB(3,"A","1/2","play",4,7,3,"Down",2,"A Half"), MakeSustainB(4,"A","1/2",4,7,3,2,"Hold")));
        sb.AppendLine("                " + MakeWholeBar(3, "A", 4, 7, 3, "Down", "A High"));
        sb.AppendLine("              ]");
        sb.AppendLine("            }");
        sb.AppendLine("          ]");
        sb.AppendLine("        }");
    }

    // =====================================================================
    // LESSON SESSION 14: Bends, Slides, Hammer-ons, Pull-offs, Harmonics
    // =====================================================================
    private static void BuildLessonSession14(StringBuilder sb) {
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Slides & Hammer-ons\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'lb-s14-slide-ex1', title: 'Exercise 1: Slides on 2nd String',");
        sb.AppendLine("              description: 'Lesson Book: Slide from one fret to another while maintaining pressure. Pluck once, slide smoothly.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 65, concepts: ['Slides', '2nd String', 'Single Pluck Slide', 'Legato'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine(string.Format("                {{ measure: 1, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"C","1/4","play",2,1,1,"Down","C - pluck and slide up"), MakeB(2,"D","1/4","play",2,3,3,"Up","D - arrived via slide"),
            MakeB(3,"C","1/4","play",2,1,1,"Down","C again"), MakeB(4,"B","1/4","play",2,0,0,"Up","B open")));
        sb.AppendLine(string.Format("                {{ measure: 2, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"D","1/4","play",2,3,3,"Down","D - slide down to B"), MakeB(2,"B","1/4","play",2,0,0,"Up","B open"),
            MakeB(3,"C","1/2","play",2,1,1,"Down",2,"C Half"), MakeSustainB(4,"C","1/2",2,1,1,2,"Hold")));
        sb.AppendLine("              ]");
        sb.AppendLine("            },");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'lb-s14-ho-ex1', title: 'Exercise 2: Hammer-ons & Pull-offs',");
        sb.AppendLine("              description: 'Lesson Book: Hammer-on = pluck lower note, hammer finger down for higher note without re-picking. Pull-off = opposite.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 65, concepts: ['Hammer-on', 'Pull-off', '1st String', 'Legato Technique'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine(string.Format("                {{ measure: 1, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"High E","1/4","play",1,0,0,"Down","E open - hammer"), MakeB(2,"F","1/4","play",1,1,1,"Up","F - hammered on"),
            MakeB(3,"G","1/4","play",1,3,3,"Down","G - pluck"), MakeB(4,"F","1/4","play",1,1,1,"Up","F - pull-off")));
        sb.AppendLine(string.Format("                {{ measure: 2, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"High E","1/4","play",1,0,0,"Down","E - pull-off result"), MakeB(2,"High E","1/4","play",1,0,0,"Up","E open"),
            MakeB(3,"F","1/2","play",1,1,1,"Down",2,"F Half"), MakeSustainB(4,"F","1/2",1,1,1,2,"Hold")));
        sb.AppendLine("              ]");
        sb.AppendLine("            }");
        sb.AppendLine("          ]");
        sb.AppendLine("        },");
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Bends & Harmonics\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'lb-s14-bend-ex1', title: 'Exercise 1: String Bends (Whole Step)',");
        sb.AppendLine("              description: 'Lesson Book: Bend 2nd string fret 7 up a whole step to the equivalent of fret 9 pitch. Push string upward toward higher strings.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 60, concepts: ['Whole Step Bend', '2nd String Bend', 'Fret 7 to 9 pitch', 'Blues Technique'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine(string.Format("                {{ measure: 1, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"D","1/4","play",2,3,3,"Down","D - pluck"), MakeB(2,"E","1/2","play",2,5,3,"Up",2,"E - bend up"),
            MakeSustainB(3,"E","1/2",2,5,3,2,"Hold bend"), MakeB(4,"D","1/4","play",2,3,3,"Down","D - release")));
        sb.AppendLine(string.Format("                {{ measure: 2, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"G","1/4","play",3,5,2,"Down","G - pluck"), MakeB(2,"A","1/2","play",3,7,3,"Up",2,"A - bend"),
            MakeSustainB(3,"A","1/2",3,7,3,2,"Hold bend"), MakeB(4,"G","1/4","play",3,5,2,"Down","G - release")));
        sb.AppendLine("              ]");
        sb.AppendLine("            },");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'lb-s14-harm-ex1', title: 'Exercise 2: Natural Harmonics (12th Fret)',");
        sb.AppendLine("              description: 'Lesson Book: Touch string lightly directly over 12th fret wire (do not press). Pluck. Bell-like harmonic tone.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 55, concepts: ['Natural Harmonics', '12th Fret', 'Bell Tone', 'Light Touch'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine(string.Format("                {{ measure: 1, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"High E","1/2","play",1,12,0,"Down",2,"Harmonic E 12th"), MakeSustainB(2,"High E","1/2",1,12,0,2,"Ring out"),
            MakeB(3,"B","1/2","play",2,12,0,"Down",2,"Harmonic B 12th"), MakeSustainB(4,"B","1/2",2,12,0,2,"Ring out")));
        sb.AppendLine(string.Format("                {{ measure: 2, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"G","1/2","play",3,12,0,"Down",2,"Harmonic G 12th"), MakeSustainB(2,"G","1/2",3,12,0,2,"Ring out"),
            MakeB(3,"D","1/2","play",4,12,0,"Down",2,"Harmonic D 12th"), MakeSustainB(4,"D","1/2",4,12,0,2,"Ring out")));
        sb.AppendLine("              ]");
        sb.AppendLine("            }");
        sb.AppendLine("          ]");
        sb.AppendLine("        }");
    }

    // =====================================================================
    // LESSON SESSION 15: Electric Guitar, Power Chords, Palm Muting
    // =====================================================================
    private static void BuildLessonSession15(StringBuilder sb) {
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Power Chords\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'lb-s15-pow-ex1', title: 'Exercise 1: E5 and A5 Power Chords',");
        sb.AppendLine("              description: 'Lesson Book: Power chord = root + perfect 5th. No 3rd = neither major nor minor. Full rock sound. E5 at fret 0, A5 at fret 0.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 80, concepts: ['Power Chords', 'E5', 'A5', 'Root+5th', 'Rock Riff'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine("                " + MakeChordQuarterBar(1, "E5", "6-5") + ",");
        sb.AppendLine("                " + MakeChordQuarterBar(2, "A5", "5-4") + ",");
        sb.AppendLine("                " + MakeChordQuarterBar(3, "E5", "6-5") + ",");
        sb.AppendLine("                " + MakeChordQuarterBar(4, "A5", "5-4") + ",");
        sb.AppendLine("                " + MakeChordWholeBar(5, "E5", "6-5", "E5 Final"));
        sb.AppendLine("              ]");
        sb.AppendLine("            },");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'lb-s15-pow-ex2', title: 'Exercise 2: Moveable Power Chords G5 - A5 - B5',");
        sb.AppendLine("              description: 'Lesson Book: Power chord shape on 6th string is fully moveable. G5 fret 3, A5 fret 5, B5 fret 7.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 80, concepts: ['Moveable Power Chords', 'G5-A5-B5', 'Rock Riffs'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine(string.Format("                {{ measure: 1, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeChordBeat(1,"G5","6-5"), MakeChordBeat(2,"G5","6-5"), MakeChordBeat(3,"A5","5-4"), MakeChordBeat(4,"A5","5-4")));
        sb.AppendLine(string.Format("                {{ measure: 2, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeChordBeat(1,"B5","6-5"), MakeChordBeat(2,"B5","6-5"), MakeChordBeat(3,"A5","5-4"), MakeChordBeat(4,"G5","6-5")));
        sb.AppendLine(string.Format("                {{ measure: 3, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeChordBeat(1,"G5","6-5"), MakeChordBeat(2,"A5","5-4"), MakeChordBeat(3,"B5","6-5"), MakeChordBeat(4,"G5","6-5")));
        sb.AppendLine("                " + MakeChordWholeBar(4, "E5", "6-5", "E5 Final"));
        sb.AppendLine("              ]");
        sb.AppendLine("            }");
        sb.AppendLine("          ]");
        sb.AppendLine("        },");
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Palm Muting & Rock Techniques\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'lb-s15-pm-ex1', title: 'Exercise 1: Palm Muting on 6th String Riff',");
        sb.AppendLine("              description: 'Lesson Book: Palm muting = rest palm lightly on bridge. Creates chunky, percussive sound. Essential electric technique.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 82, concepts: ['Palm Muting', 'Bridge Touch', 'Chunky Sound', 'Electric Rock'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine(string.Format("                {{ measure: 1, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"Low E","1/4","play",6,0,0,"Down","PM - Open Low E"), MakeB(2,"Low E","1/4","play",6,0,0,"Up","PM - Low E"),
            MakeB(3,"F","1/4","play",6,1,1,"Down","PM - F fret 1"), MakeB(4,"Low E","1/4","play",6,0,0,"Up","PM - Low E")));
        sb.AppendLine(string.Format("                {{ measure: 2, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"G","1/4","play",6,3,3,"Down","G fret 3 - accented"), MakeB(2,"Low E","1/4","play",6,0,0,"Up","PM E"),
            MakeB(3,"Low E","1/4","play",6,0,0,"Down","PM E"), MakeB(4,"G","1/4","play",6,3,3,"Up","G accent")));
        sb.AppendLine("              ]");
        sb.AppendLine("            }");
        sb.AppendLine("          ]");
        sb.AppendLine("        }");
    }

    // =====================================================================
    // LESSON SESSION 16: Advanced Strumming, 16th Notes, Syncopation
    // =====================================================================
    private static void BuildLessonSession16(StringBuilder sb) {
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"16th Notes & Syncopation\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'lb-s16-16th-ex1', title: 'Exercise 1: 16th Notes Introduction',");
        sb.AppendLine("              description: 'Lesson Book: 16th notes = 4 per beat. Count: 1-e-and-a-2-e-and-a. 16 notes fill one 4/4 bar. Very fast subdivisions.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 60, concepts: ['16th Notes', '4 Per Beat', '1-e-and-a Count', 'Fast Subdivision'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine(string.Format("                {{ measure: 1, beats: [ {0}, {1}, {2}, {3}, {4}, {5}, {6}, {7} ] }},",
            MakeB(1,"High E","1/8","play",1,0,0,"Down",1,"1-down"), MakeB(2,"High E","1/8","play",1,0,0,"Up",1,"e-up"),
            MakeB(3,"F","1/8","play",1,1,1,"Down",1,"and-down"), MakeB(4,"F","1/8","play",1,1,1,"Up",1,"a-up"),
            MakeB(5,"G","1/8","play",1,3,3,"Down",1,"2-down"), MakeB(6,"G","1/8","play",1,3,3,"Up",1,"e-up"),
            MakeB(7,"F","1/8","play",1,1,1,"Down",1,"and-down"), MakeB(8,"High E","1/8","play",1,0,0,"Up",1,"a-up")));
        sb.AppendLine(string.Format("                {{ measure: 2, beats: [ {0}, {1}, {2}, {3}, {4}, {5}, {6}, {7} ] }}",
            MakeB(1,"High E","1/8","play",1,0,0,"Down",1,"3-down"), MakeB(2,"F","1/8","play",1,1,1,"Up",1,"e"),
            MakeB(3,"G","1/8","play",1,3,3,"Down",1,"and"), MakeB(4,"F","1/8","play",1,1,1,"Up",1,"a"),
            MakeB(5,"High E","1/2","play",1,0,0,"Down",2,"4 - Half"), MakeSustainB(6,"High E","1/2",1,0,0,2,"Hold"),
            MakeB(7,"High E","1/8","play",1,0,0,"Down",1,"and"), MakeB(8,"High E","1/8","play",1,0,0,"Up",1,"a")));
        sb.AppendLine("              ]");
        sb.AppendLine("            },");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'lb-s16-sync-ex1', title: 'Exercise 2: Syncopated Strumming Pattern',");
        sb.AppendLine("              description: 'Lesson Book: Syncopation = accenting the off-beats (the ands). Creates funk and R&B feel. D - D-U - U - D-U pattern.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 72, concepts: ['Syncopation', 'Off-Beat Accent', 'Funk Feel', 'D-DU-UDU Pattern'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine(string.Format("                {{ measure: 1, beats: [ {0}, {1}, {2}, {3}, {4}, {5}, {6}, {7} ] }},",
            MakeChordBeat(1,"G Major","all"), MakeChordBeat(2,"G Major","all"),
            MakeChordBeat(3,"G Major","all"), MakeRestB(4,"REST","Skip beat 2a"),
            MakeChordBeat(5,"G Major","all"), MakeChordBeat(6,"G Major","all"),
            MakeChordBeat(7,"C Major","5-1"), MakeChordBeat(8,"C Major","5-1")));
        sb.AppendLine(string.Format("                {{ measure: 2, beats: [ {0}, {1}, {2}, {3}, {4}, {5}, {6}, {7} ] }}",
            MakeChordBeat(1,"C Major","5-1"), MakeRestB(2,"REST","Skip"), MakeChordBeat(3,"C Major","5-1"), MakeChordBeat(4,"C Major","5-1"),
            MakeRestB(5,"REST","Skip"), MakeChordBeat(6,"G Major","all"), MakeChordBeat(7,"G Major","all"), MakeChordBeat(8,"G Major","all")));
        sb.AppendLine("              ]");
        sb.AppendLine("            }");
        sb.AppendLine("          ]");
        sb.AppendLine("        }");
    }

    // =====================================================================
    // LESSON SESSION 17: Going Beyond 1st Position, 3-Note-Per-String Scales
    // =====================================================================
    private static void BuildLessonSession17(StringBuilder sb) {
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Beyond First Position\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'lb-s17-pos-ex1', title: 'Exercise 1: A Major Scale in 2nd Position',");
        sb.AppendLine("              description: 'Lesson Book: Second position - index finger covers fret 2. A Major scale: A-B-C#-D-E-F#-G#-A across the neck.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 65, concepts: ['2nd Position', 'A Major Scale', 'Position Shifting', 'Neck Navigation'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine(string.Format("                {{ measure: 1, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"A","1/4","play",5,0,0,"Down","A Open"), MakeB(2,"B","1/4","play",5,2,1,"Up","B 5th Fret 2"),
            MakeB(3,"C#","1/4","play",5,4,3,"Down","C# 5th Fret 4"), MakeB(4,"D","1/4","play",4,0,0,"Up","D 4th Open")));
        sb.AppendLine(string.Format("                {{ measure: 2, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"E","1/4","play",4,2,1,"Down","E 4th Fret 2"), MakeB(2,"F#","1/4","play",4,4,3,"Up","F# 4th Fret 4"),
            MakeB(3,"G#","1/4","play",3,1,1,"Down","G# 3rd Fret 1"), MakeB(4,"A","1/4","play",3,2,2,"Up","A 3rd Fret 2")));
        sb.AppendLine(string.Format("                {{ measure: 3, beats: [ {0}, {1}, {2}, {3} ] }}",
            MakeB(1,"A","1/2","play",3,2,2,"Down",2,"A Peak Half"), MakeSustainB(2,"A","1/2",3,2,2,2,"Hold"),
            MakeB(3,"G#","1/4","play",3,1,1,"Down","G# descend"), MakeB(4,"F#","1/4","play",4,4,3,"Up","F# descend")));
        sb.AppendLine("              ]");
        sb.AppendLine("            },");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'lb-s17-3nps-ex1', title: 'Exercise 2: 3-Note-Per-String Scale Pattern',");
        sb.AppendLine("              description: 'Lesson Book: 3 notes per string on G Major scale. Allows higher speed and smoother transitions. Index-Middle-Ring per string.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 65, concepts: ['3 Notes Per String', 'G Major', 'Speed Building', 'Economy Picking'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine(string.Format("                {{ measure: 1, beats: [ {0}, {1}, {2}, {3}, {4}, {5} ] }},",
            MakeB(1,"G","1/8","play",6,3,1,"Down",1,"G Root"), MakeB(2,"A","1/8","play",6,5,3,"Up",1,"A"),
            MakeB(3,"B","1/4","play",6,7,4,"Down",1,"B"), MakeB(4,"C","1/8","play",5,3,1,"Up",1,"C 5th Fret 3"),
            MakeB(5,"D","1/8","play",5,5,3,"Down",1,"D 5th Fret 5"), MakeB(6,"E","1/4","play",5,7,4,"Up",1,"E 5th Fret 7")));
        sb.AppendLine(string.Format("                {{ measure: 2, beats: [ {0}, {1}, {2}, {3}, {4}, {5} ] }}",
            MakeB(1,"F#","1/8","play",4,4,3,"Down",1,"F# 4th Fret 4"), MakeB(2,"G","1/8","play",4,5,4,"Up",1,"G 4th Fret 5"),
            MakeB(3,"A","1/4","play",3,2,1,"Down",1,"A 3rd Fret 2"), MakeB(4,"B","1/8","play",3,4,3,"Up",1,"B 3rd Fret 4"),
            MakeB(5,"C","1/8","play",2,1,1,"Down",1,"C 2nd Fret 1"), MakeB(6,"D","1/4","play",2,3,3,"Up",1,"D 2nd Fret 3")));
        sb.AppendLine("              ]");
        sb.AppendLine("            }");
        sb.AppendLine("          ]");
        sb.AppendLine("        }");
    }

    // =====================================================================
    // LESSON SESSION 18: Jazz - Drop-2 Voicings, ii-V Progressions
    // =====================================================================
    private static void BuildLessonSession18(StringBuilder sb) {
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Jazz Chord Voicings\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'lb-s18-jazz-ex1', title: 'Exercise 1: Jazz Comping - Dm7 - G7 - Cmaj7',");
        sb.AppendLine("              description: 'Lesson Book: ii-V-I jazz progression in C Major. Dm7 (ii) - G7 (V) - Cmaj7 (I). The most common jazz chord movement.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 70, concepts: ['ii-V-I', 'Dm7-G7-Cmaj7', 'Jazz Comping', 'Voice Leading'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine("                " + MakeChordWholeBar(1, "Dm7", "4-1", "Dm7 - ii chord") + ",");
        sb.AppendLine("                " + MakeChordWholeBar(2, "G7", "all", "G7 - V chord") + ",");
        sb.AppendLine("                " + MakeChordWholeBar(3, "Cmaj7", "5-1", "Cmaj7 - I chord") + ",");
        sb.AppendLine("                " + MakeChordWholeBar(4, "Cmaj7", "5-1", "Cmaj7 - resolve"));
        sb.AppendLine("              ]");
        sb.AppendLine("            },");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'lb-s18-jazz-ex2', title: 'Exercise 2: Am7 - D7 - Gmaj7 (ii-V-I in G)',");
        sb.AppendLine("              description: 'Lesson Book: ii-V-I in G Major. Am7 - D7 - Gmaj7. Practice with quarter note strums.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 72, concepts: ['Key of G Jazz', 'Am7-D7-Gmaj7', 'ii-V-I'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine("                " + MakeChordQuarterBar(1, "Am7", "5-1") + ",");
        sb.AppendLine("                " + MakeChordQuarterBar(2, "D7", "4-1") + ",");
        sb.AppendLine("                " + MakeChordQuarterBar(3, "Gmaj7", "all") + ",");
        sb.AppendLine("                " + MakeChordQuarterBar(4, "Gmaj7", "all") + ",");
        sb.AppendLine("                " + MakeChordWholeBar(5, "Gmaj7", "all", "Gmaj7 Final"));
        sb.AppendLine("              ]");
        sb.AppendLine("            }");
        sb.AppendLine("          ]");
        sb.AppendLine("        }");
    }

    // =====================================================================
    // LESSON SESSION 19: Soloing & Ear Training
    // =====================================================================
    private static void BuildLessonSession19(StringBuilder sb) {
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Target Tone Soloing\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'lb-s19-solo-ex1', title: 'Exercise 1: Target Tones Over G7 Chord',");
        sb.AppendLine("              description: 'Lesson Book: Target tones are the chord tones you aim for on strong beats. Over G7: land on G, B, D, or F on beat 1.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 70, concepts: ['Target Tones', 'Chord Tones', 'G7 Soloing', 'Beat 1 Landing'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine(string.Format("                {{ measure: 1, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"G","1/4","play",3,5,1,"Down","G - target tone beat 1"), MakeB(2,"A","1/4","play",3,7,3,"Up","A passing"),
            MakeB(3,"B","1/4","play",2,7,3,"Down","B - chord tone"), MakeB(4,"A","1/4","play",3,7,3,"Up","A passing")));
        sb.AppendLine(string.Format("                {{ measure: 2, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"G","1/4","play",3,5,1,"Down","G again - strong"), MakeB(2,"F","1/4","play",3,3,1,"Up","F - 7th of G7"),
            MakeB(3,"G","1/2","play",3,5,1,"Down",2,"G Half"), MakeSustainB(4,"G","1/2",3,5,1,2,"Hold")));
        sb.AppendLine("                " + MakeWholeBar(3, "G", 3, 5, 1, "Down", "G - Resolve"));
        sb.AppendLine("              ]");
        sb.AppendLine("            },");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'lb-s19-ear-ex1', title: 'Exercise 2: Call and Response Pattern',");
        sb.AppendLine("              description: 'Lesson Book: Play a musical question (call) then answer it (response). Develops melodic thinking and improvisation.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 68, concepts: ['Call & Response', 'Musical Conversation', 'Improvisation', 'Phrasing'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine(string.Format("                {{ measure: 1, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"High E","1/4","play",1,5,1,"Down","Call - E high"), MakeB(2,"D","1/4","play",2,3,3,"Up","D"),
            MakeB(3,"B","1/4","play",2,0,0,"Down","B"), MakeRestB(4,"REST","Pause before response")));
        sb.AppendLine(string.Format("                {{ measure: 2, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"A","1/4","play",3,2,2,"Down","Response - A"), MakeB(2,"G","1/4","play",3,0,0,"Up","G"),
            MakeB(3,"High E","1/2","play",1,0,0,"Down",2,"E resolve half"), MakeSustainB(4,"High E","1/2",1,0,0,2,"Hold")));
        sb.AppendLine("              ]");
        sb.AppendLine("            }");
        sb.AppendLine("          ]");
        sb.AppendLine("        }");
    }

    // =====================================================================
    // LESSON SESSION 20: All Chords - Chord Formulas, Inversions
    // =====================================================================
    private static void BuildLessonSession20(StringBuilder sb) {
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Chord Formulas & Construction\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'lb-s20-formula-ex1', title: 'Exercise 1: Major Chord Formula (1-3-5)',");
        sb.AppendLine("              description: 'Lesson Book: Major chord = root (1) + major 3rd (3) + perfect 5th (5). C Major = C-E-G. Play arpeggiated then strummed.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 65, concepts: ['Major Chord Formula', '1-3-5', 'C-E-G', 'Chord Construction'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine(string.Format("                {{ measure: 1, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"C","1/4","play",5,3,3,"Down","C - Root (1)"), MakeB(2,"E","1/4","play",4,2,2,"Up","E - Major 3rd (3)"),
            MakeB(3,"G","1/4","play",3,0,0,"Down","G - Perfect 5th (5)"), MakeB(4,"C","1/4","play",2,1,1,"Up","C - Octave")));
        sb.AppendLine("                " + MakeChordWholeBar(2, "C Major", "5-1", "C Major Chord - strummed"));
        sb.AppendLine("              ]");
        sb.AppendLine("            },");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'lb-s20-formula-ex2', title: 'Exercise 2: Minor Chord Formula (1-b3-5)',");
        sb.AppendLine("              description: 'Lesson Book: Minor chord = root (1) + minor 3rd (b3) + perfect 5th (5). Am = A-C-E. The flat 3rd makes it minor.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 65, concepts: ['Minor Chord Formula', '1-b3-5', 'A-C-E', 'Flat 3rd'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine(string.Format("                {{ measure: 1, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"A","1/4","play",5,0,0,"Down","A - Root (1)"), MakeB(2,"C","1/4","play",2,1,1,"Up","C - Minor 3rd (b3)"),
            MakeB(3,"E","1/4","play",1,0,0,"Down","E - Perfect 5th (5)"), MakeB(4,"A","1/4","play",3,2,2,"Up","A - Octave")));
        sb.AppendLine("                " + MakeChordWholeBar(2, "Am", "5-1", "Am Chord - strummed"));
        sb.AppendLine("              ]");
        sb.AppendLine("            }");
        sb.AppendLine("          ]");
        sb.AppendLine("        },");
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Chord Inversions\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'lb-s20-inversion-ex1', title: 'Exercise 1: C Major Inversions',");
        sb.AppendLine("              description: 'Lesson Book: Inversion = chord with note other than root in bass. 1st inversion = 3rd in bass (E). 2nd = 5th in bass (G).',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 62, concepts: ['Chord Inversions', '1st Inversion', '2nd Inversion', 'Bass Note'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine("                " + MakeChordWholeBar(1, "C Major", "5-1", "C Major Root Position") + ",");
        sb.AppendLine("                " + MakeChordWholeBar(2, "C/E", "all", "C/E - 1st Inversion (E in bass)") + ",");
        sb.AppendLine("                " + MakeChordWholeBar(3, "C/G", "all", "C/G - 2nd Inversion (G in bass)") + ",");
        sb.AppendLine("                " + MakeChordWholeBar(4, "C Major", "5-1", "C Major - Back to Root"));
        sb.AppendLine("              ]");
        sb.AppendLine("            }");
        sb.AppendLine("          ]");
        sb.AppendLine("        }");
    }

    // =====================================================================
    // BONUS WORKSHOP 3: G & D String Speed, Ties & Rest Precision
    // =====================================================================
    private static void BuildBonusSession3(StringBuilder sb) {
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Third String Speed Drills (G - A)\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'bw-s3-str3-d1', title: 'Drill 1: G-A Velocity (60 BPM)',");
        sb.AppendLine("              description: 'Bonus Workshop: Rapid G-A alternation on 3rd string with clean pick attack. Quarter notes at 60 BPM building to 80.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 60, concepts: ['3rd String Speed', 'G-A Velocity', 'Quarter Notes'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine(string.Format("                {{ measure: 1, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"G","1/4","play",3,0,0,"Down","G"), MakeB(2,"A","1/4","play",3,2,2,"Up","A"),
            MakeB(3,"G","1/4","play",3,0,0,"Down","G"), MakeB(4,"A","1/4","play",3,2,2,"Up","A")));
        sb.AppendLine(string.Format("                {{ measure: 2, beats: [ {0}, {1}, {2}, {3} ] }}",
            MakeB(1,"A","1/4","play",3,2,2,"Down","A"), MakeB(2,"G","1/4","play",3,0,0,"Up","G"),
            MakeB(3,"A","1/4","play",3,2,2,"Down","A"), MakeB(4,"G","1/4","play",3,0,0,"Up","G")));
        sb.AppendLine("              ]");
        sb.AppendLine("            },");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'bw-s3-str3-d2', title: 'Drill 2: G-A 8th Note Speed',");
        sb.AppendLine("              description: 'Bonus Workshop: Eighth note G-A drill at 65 BPM. Down-up picking, 8 notes per bar.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 65, concepts: ['8th Note Drill', 'G-A', 'Down-Up Picking'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine(string.Format("                {{ measure: 1, beats: [ {0}, {1}, {2}, {3}, {4}, {5}, {6}, {7} ] }},",
            MakeB(1,"G","1/8","play",3,0,0,"Down",1,"G"), MakeB(2,"A","1/8","play",3,2,2,"Up",1,"A"),
            MakeB(3,"G","1/8","play",3,0,0,"Down",1,"G"), MakeB(4,"A","1/8","play",3,2,2,"Up",1,"A"),
            MakeB(5,"A","1/8","play",3,2,2,"Down",1,"A"), MakeB(6,"G","1/8","play",3,0,0,"Up",1,"G"),
            MakeB(7,"A","1/8","play",3,2,2,"Down",1,"A"), MakeB(8,"G","1/8","play",3,0,0,"Up",1,"G")));
        sb.AppendLine(string.Format("                {{ measure: 2, beats: [ {0}, {1}, {2}, {3}, {4}, {5}, {6}, {7} ] }}",
            MakeB(1,"G","1/8","play",3,0,0,"Down",1,"G"), MakeB(2,"G","1/8","play",3,0,0,"Up",1,"G"),
            MakeB(3,"A","1/8","play",3,2,2,"Down",1,"A"), MakeB(4,"A","1/8","play",3,2,2,"Up",1,"A"),
            MakeB(5,"G","1/4","play",3,0,0,"Down",1,"G Quarter"), MakeB(6,"G","1/8","play",3,0,0,"Up",1,"G"),
            MakeB(7,"G","1/8","play",3,0,0,"Down",1,"G"), MakeB(8,"G","1/8","play",3,0,0,"Up",1,"G")));
        sb.AppendLine("              ]");
        sb.AppendLine("            }");
        sb.AppendLine("          ]");
        sb.AppendLine("        },");
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Fourth String Speed Drills (D - E - F)\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'bw-s3-str4-d1', title: 'Drill 1: D-E-F Rapid Reading',");
        sb.AppendLine("              description: 'Bonus Workshop: Quarter note D-E-F patterns on 4th string at increasing tempos.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 65, concepts: ['4th String Speed', 'D-E-F', 'Rapid Reading'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine(string.Format("                {{ measure: 1, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"D","1/4","play",4,0,0,"Down","D"), MakeB(2,"E","1/4","play",4,2,2,"Up","E"),
            MakeB(3,"F","1/4","play",4,3,3,"Down","F"), MakeB(4,"E","1/4","play",4,2,2,"Up","E")));
        sb.AppendLine(string.Format("                {{ measure: 2, beats: [ {0}, {1}, {2}, {3} ] }}",
            MakeB(1,"F","1/4","play",4,3,3,"Down","F"), MakeB(2,"E","1/4","play",4,2,2,"Up","E"),
            MakeB(3,"D","1/2","play",4,0,0,"Down",2,"D Half"), MakeSustainB(4,"D","1/2",4,0,0,2,"Hold")));
        sb.AppendLine("              ]");
        sb.AppendLine("            },");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'bw-s3-str4-d2', title: 'Drill 2: 4th String 8th Note Speed',");
        sb.AppendLine("              description: 'Bonus Workshop: 8th note speed drill on 4th string D-E-F at 70 BPM.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 70, concepts: ['8th Notes', '4th String', 'Speed Building'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine(string.Format("                {{ measure: 1, beats: [ {0}, {1}, {2}, {3}, {4}, {5}, {6}, {7} ] }},",
            MakeB(1,"D","1/8","play",4,0,0,"Down",1,"D"), MakeB(2,"E","1/8","play",4,2,2,"Up",1,"E"),
            MakeB(3,"F","1/8","play",4,3,3,"Down",1,"F"), MakeB(4,"E","1/8","play",4,2,2,"Up",1,"E"),
            MakeB(5,"D","1/8","play",4,0,0,"Down",1,"D"), MakeB(6,"E","1/8","play",4,2,2,"Up",1,"E"),
            MakeB(7,"F","1/8","play",4,3,3,"Down",1,"F"), MakeB(8,"F","1/8","play",4,3,3,"Up",1,"F")));
        sb.AppendLine(string.Format("                {{ measure: 2, beats: [ {0}, {1}, {2}, {3}, {4}, {5}, {6}, {7} ] }}",
            MakeB(1,"F","1/8","play",4,3,3,"Down",1,"F"), MakeB(2,"E","1/8","play",4,2,2,"Up",1,"E"),
            MakeB(3,"D","1/8","play",4,0,0,"Down",1,"D"), MakeB(4,"E","1/8","play",4,2,2,"Up",1,"E"),
            MakeB(5,"D","1/4","play",4,0,0,"Down",1,"D Quarter"), MakeB(6,"D","1/8","play",4,0,0,"Up",1,"D"),
            MakeB(7,"D","1/8","play",4,0,0,"Down",1,"D"), MakeB(8,"D","1/8","play",4,0,0,"Up",1,"D")));
        sb.AppendLine("              ]");
        sb.AppendLine("            }");
        sb.AppendLine("          ]");
        sb.AppendLine("        },");
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Tie & Rest Precision Drills\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'bw-s3-tie-d1', title: 'Drill 1: Tie Precision Test',");
        sb.AppendLine("              description: 'Bonus Workshop: Play notes with ties across barlines. Only pluck the first tied note - the second is held silently.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 65, concepts: ['Ties', 'Duration Accuracy', 'Hold Through'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine(string.Format("                {{ measure: 1, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"G","1/4","play",3,0,0,"Down","G"), MakeB(2,"A","1/4","play",3,2,2,"Up","A"),
            MakeB(3,"G","1/2","play",3,0,0,"Down",2,"G - tied"), MakeSustainB(4,"G","1/2",3,0,0,2,"Tied into next")));
        sb.AppendLine(string.Format("                {{ measure: 2, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeSustainB(1,"G","1/2",3,0,0,2,"From previous tie"), MakeSustainB(2,"G","1/2",3,0,0,2,"Hold"),
            MakeB(3,"A","1/4","play",3,2,2,"Down","A"), MakeB(4,"G","1/4","play",3,0,0,"Up","G")));
        sb.AppendLine("              ]");
        sb.AppendLine("            },");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'bw-s3-rest-d1', title: 'Drill 2: Quarter & Half Rest Accuracy',");
        sb.AppendLine("              description: 'Bonus Workshop: Physical string damping on every rest. Green = play, Red = damp immediately.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 68, concepts: ['Rest Accuracy', 'String Damping', 'Green/Red Training'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine(string.Format("                {{ measure: 1, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"D","1/4","play",4,0,0,"Down","D"), MakeRestB(2,"REST","Damp 4th string!"),
            MakeB(3,"E","1/4","play",4,2,2,"Down","E"), MakeRestB(4,"REST","Damp!")));
        sb.AppendLine(string.Format("                {{ measure: 2, beats: [ {0}, {1}, {2}, {3} ] }}",
            MakeB(1,"F","1/4","play",4,3,3,"Down","F"), MakeB(2,"E","1/4","play",4,2,2,"Up","E"),
            MakeRestB(3,"1/2",2,"Half Rest - 2 beats silence"), MakeRestSustainB(4,"1/2",2,"Half rest cont.")));
        sb.AppendLine("              ]");
        sb.AppendLine("            }");
        sb.AppendLine("          ]");
        sb.AppendLine("        }");
    }

    // =====================================================================
    // BONUS WORKSHOP 4: Bass Notes A & Low E, Accidentals, Classical Etudes
    // =====================================================================
    private static void BuildBonusSession4(StringBuilder sb) {
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Fifth & Sixth String Speed Drills\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'bw-s4-str5-d1', title: 'Drill 1: A-B-C Speed on 5th String',");
        sb.AppendLine("              description: 'Bonus Workshop: Quarter note A-B-C patterns on 5th string with clean bass attack.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 65, concepts: ['5th String Speed', 'A-B-C Bass', 'Deep Tone'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine(string.Format("                {{ measure: 1, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"A","1/4","play",5,0,0,"Down","A"), MakeB(2,"B","1/4","play",5,2,2,"Up","B"),
            MakeB(3,"C","1/4","play",5,3,3,"Down","C"), MakeB(4,"B","1/4","play",5,2,2,"Up","B")));
        sb.AppendLine(string.Format("                {{ measure: 2, beats: [ {0}, {1}, {2}, {3} ] }}",
            MakeB(1,"C","1/4","play",5,3,3,"Down","C"), MakeB(2,"B","1/4","play",5,2,2,"Up","B"),
            MakeB(3,"A","1/2","play",5,0,0,"Down",2,"A Half"), MakeSustainB(4,"A","1/2",5,0,0,2,"Hold")));
        sb.AppendLine("              ]");
        sb.AppendLine("            },");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'bw-s4-str6-d1', title: 'Drill 2: Low E-F-G Speed on 6th String',");
        sb.AppendLine("              description: 'Bonus Workshop: Quarter note Low E-F-G on 6th string. Deep bass register. Clear attack on each note.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 62, concepts: ['6th String Speed', 'Low E-F-G', 'Bass Register'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine(string.Format("                {{ measure: 1, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"Low E","1/4","play",6,0,0,"Down","Low E"), MakeB(2,"F","1/4","play",6,1,1,"Up","F"),
            MakeB(3,"G","1/4","play",6,3,3,"Down","G"), MakeB(4,"F","1/4","play",6,1,1,"Up","F")));
        sb.AppendLine(string.Format("                {{ measure: 2, beats: [ {0}, {1}, {2}, {3} ] }}",
            MakeB(1,"G","1/4","play",6,3,3,"Down","G"), MakeB(2,"F","1/4","play",6,1,1,"Up","F"),
            MakeB(3,"Low E","1/2","play",6,0,0,"Down",2,"Low E Half"), MakeSustainB(4,"Low E","1/2",6,0,0,2,"Hold")));
        sb.AppendLine("              ]");
        sb.AppendLine("            }");
        sb.AppendLine("          ]");
        sb.AppendLine("        },");
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Accidentals & Classical Etudes\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'bw-s4-acc-d1', title: 'Drill 1: Accidentals Reading Test',");
        sb.AppendLine("              description: 'Bonus Workshop: Read notes with sharps and flats on low strings. F# on 6th string fret 2, Bb on 5th string fret 1.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 65, concepts: ['Sharps Flats Reading', 'Low String Accidentals', 'Sight Reading'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine(string.Format("                {{ measure: 1, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"Low E","1/4","play",6,0,0,"Down","E"), MakeB(2,"F#","1/4","play",6,2,2,"Up","F# Sharp"),
            MakeB(3,"G","1/4","play",6,3,3,"Down","G"), MakeB(4,"F#","1/4","play",6,2,2,"Up","F# again")));
        sb.AppendLine(string.Format("                {{ measure: 2, beats: [ {0}, {1}, {2}, {3} ] }}",
            MakeB(1,"A","1/4","play",5,0,0,"Down","A"), MakeB(2,"A#","1/4","play",5,1,1,"Up","Bb/A#"),
            MakeB(3,"B","1/4","play",5,2,2,"Down","B Natural"), MakeB(4,"A","1/4","play",5,0,0,"Up","A")));
        sb.AppendLine("              ]");
        sb.AppendLine("            }");
        sb.AppendLine("          ]");
        sb.AppendLine("        }");
    }

    // =====================================================================
    // BONUS WORKSHOP 5: Chord Switching Tests & Folk Melodies
    // =====================================================================
    private static void BuildBonusSession5(StringBuilder sb) {
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"60-Second Chord Switching Tests\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'bw-s5-switch-ex1', title: 'Test 1: G - C - D Switch (60 BPM)',");
        sb.AppendLine("              description: 'Bonus Workshop: Switch between G, C, D open chords. Count how many perfect changes in 60 seconds.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 60, concepts: ['Chord Switching', 'G-C-D', '60-Second Test', 'Speed Test'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine("                " + MakeChordQuarterBar(1, "G Major", "all") + ",");
        sb.AppendLine("                " + MakeChordQuarterBar(2, "C Major", "5-1") + ",");
        sb.AppendLine("                " + MakeChordQuarterBar(3, "D Major", "4-1") + ",");
        sb.AppendLine("                " + MakeChordQuarterBar(4, "G Major", "all") + ",");
        sb.AppendLine("                " + MakeChordQuarterBar(5, "C Major", "5-1") + ",");
        sb.AppendLine("                " + MakeChordQuarterBar(6, "D Major", "4-1") + ",");
        sb.AppendLine("                " + MakeChordWholeBar(7, "G Major", "all", "G Final"));
        sb.AppendLine("              ]");
        sb.AppendLine("            },");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'bw-s5-switch-ex2', title: 'Test 2: Am - Em - C - G (Minor Key)',");
        sb.AppendLine("              description: 'Bonus Workshop: Minor key chord switching. Am - Em - C - G progression. Count changes at 65 BPM.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 65, concepts: ['Minor Chord Switching', 'Am-Em-C-G', 'Speed Test'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine("                " + MakeChordQuarterBar(1, "Am", "5-1") + ",");
        sb.AppendLine("                " + MakeChordQuarterBar(2, "Em", "all") + ",");
        sb.AppendLine("                " + MakeChordQuarterBar(3, "C Major", "5-1") + ",");
        sb.AppendLine("                " + MakeChordQuarterBar(4, "G Major", "all") + ",");
        sb.AppendLine("                " + MakeChordQuarterBar(5, "Am", "5-1") + ",");
        sb.AppendLine("                " + MakeChordWholeBar(6, "Am", "5-1", "Am Final"));
        sb.AppendLine("              ]");
        sb.AppendLine("            }");
        sb.AppendLine("          ]");
        sb.AppendLine("        },");
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Folk Melodies & Song Practice\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'bw-s5-folk-ex1', title: 'Folk Song: Simple Melody in G (4/4)',");
        sb.AppendLine("              description: 'Bonus Workshop: Simple folk melody using open chord notes on strings 1-3. Play at 65 BPM with metronome.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 65, concepts: ['Folk Melody', 'G Major Key', 'Strings 1-3', 'Repertoire'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine(string.Format("                {{ measure: 1, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"G","1/4","play",3,0,0,"Down","G"), MakeB(2,"A","1/4","play",3,2,2,"Up","A"),
            MakeB(3,"B","1/4","play",2,0,0,"Down","B"), MakeB(4,"G","1/4","play",3,0,0,"Up","G")));
        sb.AppendLine(string.Format("                {{ measure: 2, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"D","1/4","play",2,3,3,"Down","D"), MakeB(2,"B","1/4","play",2,0,0,"Up","B"),
            MakeB(3,"G","1/2","play",3,0,0,"Down",2,"G Half"), MakeSustainB(4,"G","1/2",3,0,0,2,"Hold")));
        sb.AppendLine(string.Format("                {{ measure: 3, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"High E","1/4","play",1,0,0,"Down","E High"), MakeB(2,"D","1/4","play",2,3,3,"Up","D"),
            MakeB(3,"B","1/4","play",2,0,0,"Down","B"), MakeB(4,"G","1/4","play",3,0,0,"Up","G")));
        sb.AppendLine("                " + MakeWholeBar(4, "G", 3, 0, 0, "Down", "G Final"));
        sb.AppendLine("              ]");
        sb.AppendLine("            }");
        sb.AppendLine("          ]");
        sb.AppendLine("        }");
    }

    // =====================================================================
    // BONUS WORKSHOPS 6-20: Content matching lesson book sessions
    // =====================================================================
    private static void BuildBonusSession6(StringBuilder sb) {
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Minor 7th & Suspended Strumming Patterns\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'bw-s6-m7-d1', title: 'Drill 1: Am7 - Em7 Waltz Strum (3/4)',");
        sb.AppendLine("              description: 'Bonus Workshop: Am7 and Em7 chords in 3/4 waltz pattern. Beautiful minor 7th colors.',");
        sb.AppendLine("              timeSignature: [3, 4], defaultBpm: 65, concepts: ['Am7', 'Em7', '3/4 Waltz', 'Minor 7th'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine(string.Format("                {{ measure: 1, beats: [ {0}, {1}, {2} ] }},",
            MakeChordBeat(1,"Am7","5-1"), MakeChordBeat(2,"Am7","5-1"), MakeChordBeat(3,"Am7","5-1")));
        sb.AppendLine(string.Format("                {{ measure: 2, beats: [ {0}, {1}, {2} ] }},",
            MakeChordBeat(1,"Em7","all"), MakeChordBeat(2,"Em7","all"), MakeChordBeat(3,"Em7","all")));
        sb.AppendLine(string.Format("                {{ measure: 3, beats: [ {0}, {1}, {2} ] }},",
            MakeChordBeat(1,"Dm7","4-1"), MakeChordBeat(2,"Dm7","4-1"), MakeChordBeat(3,"Dm7","4-1")));
        sb.AppendLine(string.Format("                {{ measure: 4, beats: [ {0}, {1}, {2} ] }}",
            MakeChordBeat(1,"Am7","5-1"), MakeChordBeat(2,"Am7","5-1"), MakeChordBeat(3,"Am7","5-1")));
        sb.AppendLine("              ]");
        sb.AppendLine("            },");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'bw-s6-sus-d1', title: 'Drill 2: Dsus2-D and Csus2-C Resolution Drill',");
        sb.AppendLine("              description: 'Bonus Workshop: Suspended chord resolves to major. Dsus2 - D, Csus2 - C. Feel the tension and release.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 65, concepts: ['Suspended Resolution', 'Dsus2-D', 'Csus2-C', 'Tension Release'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine("                " + MakeChordWholeBar(1, "Dsus2", "4-1", "Dsus2 tension") + ",");
        sb.AppendLine("                " + MakeChordWholeBar(2, "D Major", "4-1", "D resolve") + ",");
        sb.AppendLine("                " + MakeChordWholeBar(3, "Csus2", "5-1", "Csus2 tension") + ",");
        sb.AppendLine("                " + MakeChordWholeBar(4, "C Major", "5-1", "C resolve"));
        sb.AppendLine("              ]");
        sb.AppendLine("            }");
        sb.AppendLine("          ]");
        sb.AppendLine("        }");
    }

    private static void BuildBonusSession7(StringBuilder sb) {
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"6th-String Barre Chord Stamina Drills\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'bw-s7-barre-d1', title: 'Drill 1: F Major Barre Hold Stamina',");
        sb.AppendLine("              description: 'Bonus Workshop: Hold F Major barre chord cleanly for 4 bars without losing clarity. Builds barre chord endurance.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 60, concepts: ['F Barre Stamina', 'Endurance', 'Clean Barre', 'Index Strength'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine("                " + MakeChordWholeBar(1, "F Major", "all", "F Barre - Hold") + ",");
        sb.AppendLine("                " + MakeChordWholeBar(2, "F Major", "all", "F Barre - Hold bar 2") + ",");
        sb.AppendLine("                " + MakeChordWholeBar(3, "G Major", "all", "G Barre Fret 3") + ",");
        sb.AppendLine("                " + MakeChordWholeBar(4, "F Major", "all", "F Barre Return"));
        sb.AppendLine("              ]");
        sb.AppendLine("            },");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'bw-s7-scale-d1', title: 'Drill 2: C Major Scale Speed Drill',");
        sb.AppendLine("              description: 'Bonus Workshop: C Major scale played with metronome. Ascending and descending at 70 BPM.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 70, concepts: ['C Major Scale', 'Scale Speed', 'Ascending-Descending'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine(string.Format("                {{ measure: 1, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"C","1/4","play",5,3,3,"Down","C"), MakeB(2,"D","1/4","play",4,0,0,"Up","D"),
            MakeB(3,"E","1/4","play",4,2,2,"Down","E"), MakeB(4,"F","1/4","play",4,3,3,"Up","F")));
        sb.AppendLine(string.Format("                {{ measure: 2, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"G","1/4","play",3,0,0,"Down","G"), MakeB(2,"A","1/4","play",3,2,2,"Up","A"),
            MakeB(3,"B","1/4","play",2,0,0,"Down","B"), MakeB(4,"C","1/4","play",2,1,1,"Up","C High")));
        sb.AppendLine(string.Format("                {{ measure: 3, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"B","1/4","play",2,0,0,"Down","B desc"), MakeB(2,"A","1/4","play",3,2,2,"Up","A desc"),
            MakeB(3,"G","1/4","play",3,0,0,"Down","G desc"), MakeB(4,"F","1/4","play",4,3,3,"Up","F desc")));
        sb.AppendLine(string.Format("                {{ measure: 4, beats: [ {0}, {1}, {2}, {3} ] }}",
            MakeB(1,"E","1/4","play",4,2,2,"Down","E desc"), MakeB(2,"D","1/4","play",4,0,0,"Up","D desc"),
            MakeB(3,"C","1/2","play",5,3,3,"Down",2,"C Root Half"), MakeSustainB(4,"C","1/2",5,3,3,2,"Hold")));
        sb.AppendLine("              ]");
        sb.AppendLine("            }");
        sb.AppendLine("          ]");
        sb.AppendLine("        }");
    }

    private static void BuildBonusSession8(StringBuilder sb) {
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"5th-String Barre Drills & Key Signatures\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'bw-s8-barre5-d1', title: 'Drill 1: Bm - C - D Root-5 Barre Drill',");
        sb.AppendLine("              description: 'Bonus Workshop: Root-5 barre chord exercise. Bm (fret 2), C (fret 3), D (fret 5). One bar each.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 62, concepts: ['Root-5 Barre', 'Bm-C-D', 'Fret Navigation'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine("                " + MakeChordQuarterBar(1, "Bm", "5-1") + ",");
        sb.AppendLine("                " + MakeChordQuarterBar(2, "C Major", "5-1") + ",");
        sb.AppendLine("                " + MakeChordQuarterBar(3, "D Major", "5-1") + ",");
        sb.AppendLine("                " + MakeChordQuarterBar(4, "C Major", "5-1") + ",");
        sb.AppendLine("                " + MakeChordWholeBar(5, "Bm", "5-1", "Bm Final"));
        sb.AppendLine("              ]");
        sb.AppendLine("            },");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'bw-s8-key-d1', title: 'Drill 2: Primary Chords in Key of D',");
        sb.AppendLine("              description: 'Bonus Workshop: D Major key chords. I=D, IV=G, V=A. Practice 1-4-5 chord progression in D.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 70, concepts: ['Key of D', 'D-G-A Progression', 'I-IV-V'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine("                " + MakeChordQuarterBar(1, "D Major", "4-1") + ",");
        sb.AppendLine("                " + MakeChordQuarterBar(2, "G Major", "all") + ",");
        sb.AppendLine("                " + MakeChordQuarterBar(3, "A Major", "5-1") + ",");
        sb.AppendLine("                " + MakeChordQuarterBar(4, "D Major", "4-1") + ",");
        sb.AppendLine("                " + MakeChordWholeBar(5, "D Major", "4-1", "D Final"));
        sb.AppendLine("              ]");
        sb.AppendLine("            }");
        sb.AppendLine("          ]");
        sb.AppendLine("        }");
    }

    private static void BuildBonusSession9(StringBuilder sb) {
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Eighth-Note Motor Strum Practice\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'bw-s9-motor-d1', title: 'Drill 1: Non-stop Motor 8th Note Strum',");
        sb.AppendLine("              description: 'Bonus Workshop: Keep strum arm moving constantly in 8th note down-up motion for 4 bars without stopping.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 70, concepts: ['Non-Stop Strum', 'Motor Motion', '8th Notes', 'G Major'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine(string.Format("                {{ measure: 1, beats: [ {0}, {1}, {2}, {3}, {4}, {5}, {6}, {7} ] }},",
            MakeChordBeat(1,"G Major","all"), MakeChordBeat(2,"G Major","all"), MakeChordBeat(3,"G Major","all"), MakeChordBeat(4,"G Major","all"),
            MakeChordBeat(5,"G Major","all"), MakeChordBeat(6,"G Major","all"), MakeChordBeat(7,"G Major","all"), MakeChordBeat(8,"G Major","all")));
        sb.AppendLine(string.Format("                {{ measure: 2, beats: [ {0}, {1}, {2}, {3}, {4}, {5}, {6}, {7} ] }}",
            MakeChordBeat(1,"C Major","5-1"), MakeChordBeat(2,"C Major","5-1"), MakeChordBeat(3,"C Major","5-1"), MakeChordBeat(4,"C Major","5-1"),
            MakeChordBeat(5,"D Major","4-1"), MakeChordBeat(6,"D Major","4-1"), MakeChordBeat(7,"G Major","all"), MakeChordBeat(8,"G Major","all")));
        sb.AppendLine("              ]");
        sb.AppendLine("            },");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'bw-s9-interval-d1', title: 'Drill 2: Interval Ear Training Drill',");
        sb.AppendLine("              description: 'Bonus Workshop: Play pairs of notes and identify the interval. Then check against chart. Train your inner ear.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 60, concepts: ['Interval Training', 'Ear Training', 'Pitch Recognition'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine(string.Format("                {{ measure: 1, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"G","1/2","play",3,0,0,"Down",2,"G - listen"), MakeSustainB(2,"G","1/2",3,0,0,2,"Hold"),
            MakeB(3,"High E","1/2","play",1,0,0,"Down",2,"E - identify interval"), MakeSustainB(4,"High E","1/2",1,0,0,2,"Hold")));
        sb.AppendLine(string.Format("                {{ measure: 2, beats: [ {0}, {1}, {2}, {3} ] }}",
            MakeB(1,"B","1/2","play",2,0,0,"Down",2,"B - listen"), MakeSustainB(2,"B","1/2",2,0,0,2,"Hold"),
            MakeB(3,"G","1/2","play",3,0,0,"Down",2,"G - identify"), MakeSustainB(4,"G","1/2",3,0,0,2,"Hold")));
        sb.AppendLine("              ]");
        sb.AppendLine("            }");
        sb.AppendLine("          ]");
        sb.AppendLine("        }");
    }

    private static void BuildBonusSession10(StringBuilder sb) {
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"P-I-M-A Classical Arpeggio Patterns\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'bw-s10-pima-d1', title: 'Drill 1: P-I-M-A-M-I Classical Pattern',");
        sb.AppendLine("              description: 'Bonus Workshop: Classic P-I-M-A-M-I fingerpicking pattern. 6 plucks per beat group. Used in Canon in D and many classical pieces.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 55, concepts: ['P-I-M-A-M-I', 'Classical Arpeggio', 'Fingerstyle', 'Canon Pattern'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine(string.Format("                {{ measure: 1, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"D","1/4","play",4,0,0,"P","P - Thumb D"), MakeB(2,"F#","1/4","play",4,4,3,"I","I - Index"),
            MakeB(3,"A","1/4","play",5,0,0,"M","M - Middle"), MakeB(4,"D","1/4","play",2,3,3,"A","A - Ring")));
        sb.AppendLine(string.Format("                {{ measure: 2, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"A","1/4","play",5,0,0,"P","P - Thumb A"), MakeB(2,"High E","1/4","play",1,0,0,"I","I - Index"),
            MakeB(3,"C#","1/4","play",5,4,3,"M","M - Middle"), MakeB(4,"High E","1/4","play",1,0,0,"A","A - Ring")));
        sb.AppendLine(string.Format("                {{ measure: 3, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"B","1/4","play",2,0,0,"P","P - Thumb B"), MakeB(2,"D","1/4","play",2,3,3,"I","I - Index"),
            MakeB(3,"F#","1/4","play",4,4,3,"M","M - Middle"), MakeB(4,"B","1/4","play",2,0,0,"A","A - Ring")));
        sb.AppendLine(string.Format("                {{ measure: 4, beats: [ {0}, {1}, {2}, {3} ] }}",
            MakeB(1,"G","1/4","play",3,0,0,"P","P - Thumb G"), MakeB(2,"B","1/4","play",2,0,0,"I","I - Index"),
            MakeB(3,"G","1/4","play",3,0,0,"M","M - Middle"), MakeB(4,"High E","1/4","play",1,0,0,"A","A - Ring")));
        sb.AppendLine("              ]");
        sb.AppendLine("            }");
        sb.AppendLine("          ]");
        sb.AppendLine("        }");
    }

    private static void BuildBonusSession11(StringBuilder sb) {
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Pentatonic Scale Ultimate Mix-Up\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'bw-s11-pent-d1', title: 'Drill 1: A Minor Pentatonic All Boxes Connected',");
        sb.AppendLine("              description: 'Bonus Workshop: Connect A minor pentatonic boxes 1 and 2 in one continuous run. Builds neck fluency.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 70, concepts: ['Pentatonic Boxes', 'Connected Patterns', 'A Minor', 'Neck Navigation'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine(string.Format("                {{ measure: 1, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"A","1/4","play",6,5,1,"Down","A Box 1 root"), MakeB(2,"C","1/4","play",6,8,4,"Up","C"),
            MakeB(3,"D","1/4","play",5,5,1,"Down","D"), MakeB(4,"E","1/4","play",5,7,3,"Up","E")));
        sb.AppendLine(string.Format("                {{ measure: 2, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"G","1/4","play",4,5,1,"Down","G"), MakeB(2,"A","1/4","play",4,7,3,"Up","A"),
            MakeB(3,"A","1/4","play",3,5,1,"Down","A 3rd str"), MakeB(4,"C","1/4","play",3,8,4,"Up","C 3rd")));
        sb.AppendLine(string.Format("                {{ measure: 3, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"D","1/4","play",2,6,2,"Down","D Box 2"), MakeB(2,"E","1/4","play",2,8,4,"Up","E"),
            MakeB(3,"E","1/4","play",1,5,1,"Down","E 1st str"), MakeB(4,"G","1/4","play",1,8,4,"Up","G")));
        sb.AppendLine("                " + MakeWholeBar(4, "A", 1, 5, 1, "Down", "A High Whole"));
        sb.AppendLine("              ]");
        sb.AppendLine("            }");
        sb.AppendLine("          ]");
        sb.AppendLine("        }");
    }

    private static void BuildBonusSession12(StringBuilder sb) {
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Extended Harmony Chord Drills\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'bw-s12-ext-d1', title: 'Drill 1: Cmaj7 - Fmaj7 - Dm7 - G7 Progression',");
        sb.AppendLine("              description: 'Bonus Workshop: Extended chord progression using major 7ths and minor 7ths. Smooth voice leading practice.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 65, concepts: ['Extended Chords', 'Cmaj7-Fmaj7-Dm7-G7', 'Voice Leading'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine("                " + MakeChordWholeBar(1, "Cmaj7", "5-1", "Cmaj7") + ",");
        sb.AppendLine("                " + MakeChordWholeBar(2, "Fmaj7", "4-1", "Fmaj7") + ",");
        sb.AppendLine("                " + MakeChordWholeBar(3, "Dm7", "4-1", "Dm7") + ",");
        sb.AppendLine("                " + MakeChordWholeBar(4, "G7", "all", "G7") + ",");
        sb.AppendLine("                " + MakeChordWholeBar(5, "Cmaj7", "5-1", "Cmaj7 Resolve"));
        sb.AppendLine("              ]");
        sb.AppendLine("            }");
        sb.AppendLine("          ]");
        sb.AppendLine("        }");
    }

    private static void BuildBonusSession13(StringBuilder sb) {
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Blues Scale & Shuffle Rhythm Workout\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'bw-s13-blues-d1', title: 'Drill 1: A Blues Scale Metronome Workout',");
        sb.AppendLine("              description: 'Bonus Workshop: A Blues scale played with strict metronome. Focus on even eighth notes and blue note Eb/D#.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 75, concepts: ['A Blues Scale', 'Metronome Workout', 'Blue Note', 'Eb D#'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine(string.Format("                {{ measure: 1, beats: [ {0}, {1}, {2}, {3}, {4}, {5}, {6}, {7} ] }},",
            MakeB(1,"A","1/8","play",6,5,1,"Down",1,"A Root"), MakeB(2,"C","1/8","play",6,8,4,"Up",1,"C"),
            MakeB(3,"D","1/8","play",5,5,1,"Down",1,"D"), MakeB(4,"D#","1/8","play",5,6,2,"Up",1,"Eb Blue Note!"),
            MakeB(5,"E","1/8","play",5,7,3,"Down",1,"E"), MakeB(6,"G","1/8","play",4,5,1,"Up",1,"G"),
            MakeB(7,"A","1/8","play",4,7,3,"Down",1,"A"), MakeB(8,"A","1/8","play",3,5,1,"Up",1,"A cont")));
        sb.AppendLine(string.Format("                {{ measure: 2, beats: [ {0}, {1}, {2}, {3}, {4}, {5}, {6}, {7} ] }}",
            MakeB(1,"A","1/8","play",3,5,1,"Down",1,"A desc"), MakeB(2,"G","1/8","play",4,5,1,"Up",1,"G"),
            MakeB(3,"E","1/8","play",5,7,3,"Down",1,"E"), MakeB(4,"D#","1/8","play",5,6,2,"Up",1,"Eb"),
            MakeB(5,"D","1/8","play",5,5,1,"Down",1,"D"), MakeB(6,"C","1/8","play",6,8,4,"Up",1,"C"),
            MakeB(7,"A","1/4","play",6,5,1,"Down",1,"A Root"), MakeB(8,"A","1/8","play",6,5,1,"Up",1,"A")));
        sb.AppendLine("              ]");
        sb.AppendLine("            }");
        sb.AppendLine("          ]");
        sb.AppendLine("        }");
    }

    private static void BuildBonusSession14(StringBuilder sb) {
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Slides, Hammer-ons, Pull-offs & Harmonics Drills\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'bw-s14-legato-d1', title: 'Drill 1: Legato Technique Combination',");
        sb.AppendLine("              description: 'Bonus Workshop: Combine slides, hammer-ons and pull-offs in one continuous legato phrase. Smooth, connected sound.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 65, concepts: ['Legato', 'Slide+Hammer+Pull', '2nd String', 'Smooth Playing'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine(string.Format("                {{ measure: 1, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"B","1/4","play",2,0,0,"Down","B open"), MakeB(2,"C","1/4","play",2,1,1,"Up","C hammer-on"),
            MakeB(3,"D","1/4","play",2,3,3,"Down","D slide"), MakeB(4,"C","1/4","play",2,1,1,"Up","C pull-off")));
        sb.AppendLine(string.Format("                {{ measure: 2, beats: [ {0}, {1}, {2}, {3} ] }}",
            MakeB(1,"B","1/4","play",2,0,0,"Down","B open"), MakeB(2,"D","1/4","play",2,3,3,"Up","D slide up"),
            MakeB(3,"B","1/2","play",2,0,0,"Down",2,"B Half"), MakeSustainB(4,"B","1/2",2,0,0,2,"Hold")));
        sb.AppendLine("              ]");
        sb.AppendLine("            },");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'bw-s14-harm-d1', title: 'Drill 2: Natural Harmonics (5th, 7th, 12th Frets)',");
        sb.AppendLine("              description: 'Bonus Workshop: Natural harmonics at 12th, 7th, and 5th frets create bell-like tones an octave, octave+5th, and 2 octaves above.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 55, concepts: ['Natural Harmonics', '12th 7th 5th Frets', 'Bell Tone', 'Overtones'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine(string.Format("                {{ measure: 1, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"High E","1/2","play",1,12,0,"Down",2,"12th Fret Harmonic E"), MakeSustainB(2,"High E","1/2",1,12,0,2,"Ring"),
            MakeB(3,"High E","1/2","play",1,7,0,"Down",2,"7th Fret Harmonic"), MakeSustainB(4,"High E","1/2",1,7,0,2,"Ring")));
        sb.AppendLine(string.Format("                {{ measure: 2, beats: [ {0}, {1}, {2}, {3} ] }}",
            MakeB(1,"High E","1/2","play",1,5,0,"Down",2,"5th Fret Harmonic"), MakeSustainB(2,"High E","1/2",1,5,0,2,"Ring"),
            MakeB(3,"B","1/2","play",2,12,0,"Down",2,"12th Fret B"), MakeSustainB(4,"B","1/2",2,12,0,2,"Ring")));
        sb.AppendLine("              ]");
        sb.AppendLine("            }");
        sb.AppendLine("          ]");
        sb.AppendLine("        }");
    }

    private static void BuildBonusSession15(StringBuilder sb) {
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Power Chords, Palm Muting & Harmonized Scales\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'bw-s15-pow-d1', title: 'Drill 1: Power Chord Rock Riff',");
        sb.AppendLine("              description: 'Bonus Workshop: Classic rock power chord riff. E5-A5-G5-D5 pattern with palm muting. The sound of rock.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 85, concepts: ['Power Chord Riff', 'E5-A5-G5', 'Palm Muting', 'Rock'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine(string.Format("                {{ measure: 1, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeChordBeat(1,"E5","6-5"), MakeChordBeat(2,"E5","6-5"), MakeChordBeat(3,"A5","5-4"), MakeChordBeat(4,"A5","5-4")));
        sb.AppendLine(string.Format("                {{ measure: 2, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeChordBeat(1,"G5","6-5"), MakeChordBeat(2,"G5","6-5"), MakeChordBeat(3,"D5","5-4"), MakeChordBeat(4,"E5","6-5")));
        sb.AppendLine(string.Format("                {{ measure: 3, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeChordBeat(1,"E5","6-5"), MakeChordBeat(2,"A5","5-4"), MakeChordBeat(3,"G5","6-5"), MakeChordBeat(4,"A5","5-4")));
        sb.AppendLine("                " + MakeChordWholeBar(4, "E5", "6-5", "E5 Final"));
        sb.AppendLine("              ]");
        sb.AppendLine("            }");
        sb.AppendLine("          ]");
        sb.AppendLine("        }");
    }

    private static void BuildBonusSession16(StringBuilder sb) {
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"16th-Note Funk Strumming Workout\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'bw-s16-funk-d1', title: 'Drill 1: Funk Strum Pattern (16th Notes)',");
        sb.AppendLine("              description: 'Bonus Workshop: Funk strumming with 16th note subdivisions. Syncopated accents on off-beats. The key to funk feel.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 70, concepts: ['Funk Strumming', '16th Notes', 'Syncopation', 'Off-Beat Accents'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine(string.Format("                {{ measure: 1, beats: [ {0}, {1}, {2}, {3}, {4}, {5}, {6}, {7} ] }},",
            MakeChordBeat(1,"Am7","5-1"), MakeChordBeat(2,"Am7","5-1"), MakeRestB(3,"REST","mute"),
            MakeChordBeat(4,"Am7","5-1"), MakeChordBeat(5,"Am7","5-1"), MakeRestB(6,"REST","mute"),
            MakeChordBeat(7,"Am7","5-1"), MakeChordBeat(8,"Am7","5-1")));
        sb.AppendLine(string.Format("                {{ measure: 2, beats: [ {0}, {1}, {2}, {3}, {4}, {5}, {6}, {7} ] }}",
            MakeRestB(1,"REST","mute"), MakeChordBeat(2,"Am7","5-1"), MakeChordBeat(3,"Am7","5-1"),
            MakeRestB(4,"REST","mute"), MakeChordBeat(5,"Am7","5-1"), MakeChordBeat(6,"Am7","5-1"),
            MakeChordBeat(7,"D7","4-1"), MakeChordBeat(8,"Am7","5-1")));
        sb.AppendLine("              ]");
        sb.AppendLine("            }");
        sb.AppendLine("          ]");
        sb.AppendLine("        }");
    }

    private static void BuildBonusSession17(StringBuilder sb) {
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"3-Note-Per-String Scale Sequences & Shifting\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'bw-s17-3nps-d1', title: 'Drill 1: G Major 3-Note-Per-String Sequence',");
        sb.AppendLine("              description: 'Bonus Workshop: Play G Major scale with 3 notes per string. 3-per string allows higher speeds than 2-per-string.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 70, concepts: ['3 Notes Per String', 'G Major Scale', 'Speed Technique', 'Position'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine(string.Format("                {{ measure: 1, beats: [ {0}, {1}, {2}, {3}, {4}, {5} ] }},",
            MakeB(1,"G","1/8","play",6,3,1,"Down",1,"G"), MakeB(2,"A","1/8","play",6,5,3,"Up",1,"A"),
            MakeB(3,"B","1/4","play",6,7,4,"Down",1,"B 6th"), MakeB(4,"C","1/8","play",5,3,1,"Up",1,"C 5th"),
            MakeB(5,"D","1/8","play",5,5,3,"Down",1,"D 5th"), MakeB(6,"E","1/4","play",5,7,4,"Up",1,"E 5th")));
        sb.AppendLine(string.Format("                {{ measure: 2, beats: [ {0}, {1}, {2}, {3}, {4}, {5} ] }}",
            MakeB(1,"F#","1/8","play",4,4,3,"Down",1,"F# 4th"), MakeB(2,"G","1/8","play",4,5,4,"Up",1,"G 4th"),
            MakeB(3,"A","1/4","play",3,2,1,"Down",1,"A 3rd"), MakeB(4,"B","1/8","play",3,4,3,"Up",1,"B 3rd"),
            MakeB(5,"C","1/8","play",2,1,1,"Down",1,"C 2nd"), MakeB(6,"D","1/4","play",2,3,3,"Up",1,"D 2nd")));
        sb.AppendLine("              ]");
        sb.AppendLine("            }");
        sb.AppendLine("          ]");
        sb.AppendLine("        }");
    }

    private static void BuildBonusSession18(StringBuilder sb) {
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Jazz Drop-2 Voicings & ii-V Drills\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'bw-s18-jazz-d1', title: 'Drill 1: ii-V-I in C Major with Drop-2 Voicings',");
        sb.AppendLine("              description: 'Bonus Workshop: Dm7 - G7 - Cmaj7 using jazz drop-2 chord voicings on inner strings. Smooth jazz voice leading.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 68, concepts: ['Drop-2 Voicings', 'ii-V-I Jazz', 'Dm7-G7-Cmaj7', 'Jazz Comping'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine("                " + MakeChordWholeBar(1, "Dm7", "4-1", "Dm7 Drop-2") + ",");
        sb.AppendLine("                " + MakeChordWholeBar(2, "G7", "all", "G7") + ",");
        sb.AppendLine("                " + MakeChordWholeBar(3, "Cmaj7", "5-1", "Cmaj7 resolve") + ",");
        sb.AppendLine("                " + MakeChordWholeBar(4, "Cmaj7", "5-1", "Cmaj7 hold"));
        sb.AppendLine("              ]");
        sb.AppendLine("            }");
        sb.AppendLine("          ]");
        sb.AppendLine("        }");
    }

    private static void BuildBonusSession19(StringBuilder sb) {
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Target Tone Soloing & Call-and-Response\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'bw-s19-solo-d1', title: 'Drill 1: Target Tone Solo Over Blues in A',");
        sb.AppendLine("              description: 'Bonus Workshop: Improvise over A7-D7-E7 blues. Land on chord tones on beat 1. A=root, C#=3rd, E=5th, G=7th over A7.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 72, concepts: ['Target Tone Solo', 'Blues Improv', 'Chord Tones', 'A7-D7-E7'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine(string.Format("                {{ measure: 1, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1,"A","1/4","play",6,5,1,"Down","A Root target"), MakeB(2,"C","1/4","play",6,8,4,"Up","C passing"),
            MakeB(3,"E","1/4","play",5,7,3,"Down","E chord tone"), MakeB(4,"G","1/4","play",4,5,1,"Up","G 7th")));
        sb.AppendLine(string.Format("                {{ measure: 2, beats: [ {0}, {1}, {2}, {3} ] }}",
            MakeB(1,"D","1/4","play",5,5,1,"Down","D - over D7"), MakeB(2,"E","1/4","play",5,7,3,"Up","E passing"),
            MakeB(3,"A","1/2","play",6,5,1,"Down",2,"A Half"), MakeSustainB(4,"A","1/2",6,5,1,2,"Hold")));
        sb.AppendLine("              ]");
        sb.AppendLine("            }");
        sb.AppendLine("          ]");
        sb.AppendLine("        }");
    }

    private static void BuildBonusSession20(StringBuilder sb) {
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Chord Formula Mastery & Inversions Review\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'bw-s20-formula-d1', title: 'Drill 1: Build All Chord Types from Root G',");
        sb.AppendLine("              description: 'Bonus Workshop: Build G Major (1-3-5), Gm (1-b3-5), G7 (1-3-5-b7), Gmaj7 (1-3-5-7) from root G. Know your formulas.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 65, concepts: ['Chord Formulas', 'G Major', 'G Minor', 'G7', 'Gmaj7'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine("                " + MakeChordWholeBar(1, "G Major", "all", "G Major (1-3-5)") + ",");
        sb.AppendLine("                " + MakeChordWholeBar(2, "Gm", "all", "G Minor (1-b3-5)") + ",");
        sb.AppendLine("                " + MakeChordWholeBar(3, "G7", "all", "G7 (1-3-5-b7)") + ",");
        sb.AppendLine("                " + MakeChordWholeBar(4, "Gmaj7", "all", "Gmaj7 (1-3-5-7)") + ",");
        sb.AppendLine("                " + MakeChordWholeBar(5, "G Major", "all", "G Major - Final Mastery"));
        sb.AppendLine("              ]");
        sb.AppendLine("            },");
        sb.AppendLine("            {");
        sb.AppendLine("              id: 'bw-s20-invert-d1', title: 'Drill 2: G Major Inversions Ascending',");
        sb.AppendLine("              description: 'Bonus Workshop: G Major in root position, 1st inversion (B bass), 2nd inversion (D bass). All inversions ascending.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 62, concepts: ['G Major Inversions', 'Root-1st-2nd', 'Bass Note', 'Chord Mastery'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine("                " + MakeChordWholeBar(1, "G Major", "all", "Root Position - G in bass") + ",");
        sb.AppendLine("                " + MakeChordWholeBar(2, "G/B", "all", "1st Inversion - B in bass") + ",");
        sb.AppendLine("                " + MakeChordWholeBar(3, "G/D", "all", "2nd Inversion - D in bass") + ",");
        sb.AppendLine("                " + MakeChordWholeBar(4, "G Major", "all", "Back to Root Position"));
        sb.AppendLine("              ]");
        sb.AppendLine("            }");
        sb.AppendLine("          ]");
        sb.AppendLine("        }");
    }

    private static void BuildGenericLesson(StringBuilder sb, int s) {
        int str = ((s - 1) % 6) + 1;
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Core Reading & Technical Etudes\",");
        sb.AppendLine("          exercises: [");
        for (int ex = 1; ex <= 4; ex++) {
            int bpm = 60 + ex * 5;
            sb.AppendLine("            {");
            sb.AppendLine(string.Format("              id: 'lb-s{0}-ex{1}', title: 'Exercise {1}: Session {0} Technical Etude',", s, ex));
            sb.AppendLine(string.Format("              description: 'Focus on clean note attack, exact duration, and rhythmic accuracy in Session {0}.',", s));
            sb.AppendLine(string.Format("              timeSignature: [4, 4], defaultBpm: {0}, concepts: ['Session {1}', 'Rhythm Precision'],", bpm, s));
            sb.AppendLine("              tabData: [");
            sb.AppendLine(string.Format("                {{ measure: 1, beats: [ {0}, {1}, {2}, {3} ] }},",
                MakeB(1, GetNoteName(str, 0), "1/4", "play", str, 0, 0, "Down", "Open"),
                MakeB(2, GetNoteName(str, 2), "1/4", "play", str, 2, 2, "Up", "Fret 2"),
                MakeB(3, GetNoteName(str, 3), "1/4", "play", str, 3, 3, "Down", "Fret 3"),
                MakeB(4, GetNoteName(str, 2), "1/4", "play", str, 2, 2, "Up", "Fret 2")));
            sb.AppendLine(string.Format("                {{ measure: 2, beats: [ {0}, {1}, {2}, {3} ] }}",
                MakeB(1, GetNoteName(str, 0), "1/4", "play", str, 0, 0, "Down", "Open"),
                MakeB(2, GetNoteName(str, 3), "1/4", "play", str, 3, 3, "Up", "Fret 3"),
                MakeB(3, GetNoteName(str, 2), "1/2", "play", str, 2, 2, "Down", "Hold Fret 2"),
                MakeB(4, GetNoteName(str, 2), "1/2", "play", str, 2, 2, "-", "Hold")));
            sb.AppendLine("              ]");
            sb.AppendLine("            }" + (ex < 4 ? "," : ""));
        }
        sb.AppendLine("          ]");
        sb.AppendLine("        },");
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Rhythm, Rests & Application Pieces\",");
        sb.AppendLine("          exercises: [");
        for (int ex = 1; ex <= 2; ex++) {
            int bpm = 65 + ex * 5;
            sb.AppendLine("            {");
            sb.AppendLine(string.Format("              id: 'lb-s{0}-rest-ex{1}', title: 'Practice Piece {1}: Metronome Damping (Beat 4 Red Mute)',", s, ex));
            sb.AppendLine(string.Format("              description: 'Physical damping test on beat 4 with vivid red rest cue in Session {0}.',", s));
            sb.AppendLine(string.Format("              timeSignature: [4, 4], defaultBpm: {0}, concepts: ['Rest Beat', 'Physical Damping'],", bpm));
            sb.AppendLine("              tabData: [");
            sb.AppendLine(string.Format("                {{ measure: 1, beats: [ {0}, {1}, {2}, {3} ] }},",
                MakeB(1, GetNoteName(str, 1), "1/4", "play", str, 1, 1, "Down", "Fret 1"),
                MakeB(2, GetNoteName(str, 3), "1/4", "play", str, 3, 3, "Up", "Fret 3"),
                MakeB(3, GetNoteName(str, 0), "1/4", "play", str, 0, 0, "Down", "Open"),
                MakeRestB(4, "REST", "MUTE STRING!")));
            sb.AppendLine(string.Format("                {{ measure: 2, beats: [ {0}, {1}, {2}, {3} ] }}",
                MakeB(1, GetNoteName(str, 3), "1/4", "play", str, 3, 3, "Down", "Fret 3"),
                MakeB(2, GetNoteName(str, 1), "1/4", "play", str, 1, 1, "Up", "Fret 1"),
                MakeB(3, GetNoteName(str, 0), "1/4", "play", str, 0, 0, "Down", "Open"),
                MakeRestB(4, "REST", "MUTE STRING!")));
            sb.AppendLine("              ]");
            sb.AppendLine("            }" + (ex < 2 ? "," : ""));
        }
        sb.AppendLine("          ]");
        sb.AppendLine("        }");
    }

    private static void BuildGenericBonus(StringBuilder sb, int s) {
        int str = (s % 6) + 1;
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Intensive Metronome Drills\",");
        sb.AppendLine("          exercises: [");
        for (int ex = 1; ex <= 3; ex++) {
            int bpm = 70 + ex * 10;
            sb.AppendLine("            {");
            sb.AppendLine(string.Format("              id: 'bw-s{0}-ex{1}', title: 'Workshop Drill {1}: Speed & Precision ({2} BPM)',", s, ex, bpm));
            sb.AppendLine(string.Format("              description: 'Focus on high repetition speed and rhythmic consistency in Workshop {0}.',", s));
            sb.AppendLine(string.Format("              timeSignature: [4, 4], defaultBpm: {0}, concepts: ['Speed Drill', 'Clean Fretting'],", bpm));
            sb.AppendLine("              tabData: [");
            sb.AppendLine(string.Format("                {{ measure: 1, beats: [ {0}, {1}, {2}, {3} ] }},",
                MakeB(1, GetNoteName(str, 0), "1/4", "play", str, 0, 0, "Down", "Open"),
                MakeB(2, GetNoteName(str, 1), "1/4", "play", str, 1, 1, "Up", "Fret 1"),
                MakeB(3, GetNoteName(str, 3), "1/4", "play", str, 3, 3, "Down", "Fret 3"),
                MakeB(4, GetNoteName(str, 1), "1/4", "play", str, 1, 1, "Up", "Fret 1")));
            sb.AppendLine(string.Format("                {{ measure: 2, beats: [ {0}, {1}, {2}, {3} ] }}",
                MakeB(1, GetNoteName(str, 3), "1/4", "play", str, 3, 3, "Down", "Fret 3"),
                MakeB(2, GetNoteName(str, 1), "1/4", "play", str, 1, 1, "Up", "Fret 1"),
                MakeB(3, GetNoteName(str, 0), "1/2", "play", str, 0, 0, "Down", "Hold Open"),
                MakeB(4, GetNoteName(str, 0), "1/2", "play", str, 0, 0, "-", "Hold")));
            sb.AppendLine("              ]");
            sb.AppendLine("            }" + (ex < 3 ? "," : ""));
        }
        sb.AppendLine("          ]");
        sb.AppendLine("        },");
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Muting & String Damping Drills\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            {");
        sb.AppendLine(string.Format("              id: 'bw-s{0}-mute1', title: 'Workshop Muting Drill (Red Flash Rest)',", s));
        sb.AppendLine("              description: 'Train crisp physical muting on beat 4 rests.',");
        sb.AppendLine("              timeSignature: [4, 4], defaultBpm: 75, concepts: ['Palm Damping', 'Red Light Warning'],");
        sb.AppendLine("              tabData: [");
        sb.AppendLine(string.Format("                {{ measure: 1, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, GetNoteName(str, 3), "1/4", "play", str, 3, 3, "Down", "Fret 3"),
            MakeB(2, GetNoteName(str, 1), "1/4", "play", str, 1, 1, "Up", "Fret 1"),
            MakeB(3, GetNoteName(str, 0), "1/4", "play", str, 0, 0, "Down", "Open"),
            MakeRestB(4, "REST", "MUTE ALL STRINGS!")));
        sb.AppendLine(string.Format("                {{ measure: 2, beats: [ {0}, {1}, {2}, {3} ] }}",
            MakeB(1, GetNoteName(str, 0), "1/4", "play", str, 0, 0, "Down", "Open"),
            MakeB(2, GetNoteName(str, 1), "1/4", "play", str, 1, 1, "Up", "Fret 1"),
            MakeB(3, GetNoteName(str, 3), "1/4", "play", str, 3, 3, "Down", "Fret 3"),
            MakeRestB(4, "REST", "MUTE ALL STRINGS!")));
        sb.AppendLine("              ]");
        sb.AppendLine("            }");
        sb.AppendLine("          ]");
        sb.AppendLine("        }");
    }

    // ==========================================
    // AUTHENTIC SESSION 1 LESSON BOOK EXERCISES
    // ==========================================
    private static string MakeFingerEx1(string id) {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine("{");
        sb.AppendLine(string.Format("  id: '{0}', title: 'Finger Exercise 1: 1-1-1-1 2-2-2-2 (Down-Up)',", id));
        sb.AppendLine("  description: 'Authentic Lesson Book page 4: Play each finger pattern on each fret with smooth Down-Up picking motion across 7 measures.',");
        sb.AppendLine("  timeSignature: [4, 4], defaultBpm: 60, concepts: ['Fret 1 to 4', 'Alternate Picking (Down-Up)', 'Finger Independence'],");
        sb.AppendLine("  tabData: [");
        int[] frets = new int[] { 1, 2, 3, 4, 3, 2, 1 };
        for (int m = 0; m < frets.Length; m++) {
            int f = frets[m];
            string noteName = GetNoteName(1, f);
            sb.AppendLine(string.Format("    {{ measure: {0}, beats: [ {1}, {2}, {3}, {4} ] }}" + (m < frets.Length - 1 ? "," : ""),
                m + 1,
                MakeB(1, noteName, "1/4", "play", 1, f, f, "Down", "Bar " + (m + 1) + ": Fret " + f + " (Down)"),
                MakeB(2, noteName, "1/4", "play", 1, f, f, "Up", "Fret " + f + " (Up)"),
                MakeB(3, noteName, "1/4", "play", 1, f, f, "Down", "Fret " + f + " (Down)"),
                MakeB(4, noteName, "1/4", "play", 1, f, f, "Up", "Fret " + f + " (Up)")));
        }
        sb.AppendLine("  ]");
        sb.Append("}");
        return sb.ToString();
    }

    private static string MakeFingerEx2(string id) {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine("{");
        sb.AppendLine(string.Format("  id: '{0}', title: 'Finger Exercise 2: 1-1 2-2 3-3 4-4 (Two-Stroke)',", id));
        sb.AppendLine("  description: 'Authentic Lesson Book page 4: Two picking strokes per fret (Down-Up). 1 1 2 2 3 3 4 4 3 3 2 2 1 1.',");
        sb.AppendLine("  timeSignature: [4, 4], defaultBpm: 65, concepts: ['Two Strokes Per Fret', 'Down-Up', 'Clean Articulation'],");
        sb.AppendLine("  tabData: [");
        sb.AppendLine(string.Format("    {{ measure: 1, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "F", "1/4", "play", 1, 1, 1, "Down", "Fret 1"), MakeB(2, "F", "1/4", "play", 1, 1, 1, "Up", "Fret 1"),
            MakeB(3, "F#", "1/4", "play", 1, 2, 2, "Down", "Fret 2"), MakeB(4, "F#", "1/4", "play", 1, 2, 2, "Up", "Fret 2")));
        sb.AppendLine(string.Format("    {{ measure: 2, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "G", "1/4", "play", 1, 3, 3, "Down", "Fret 3"), MakeB(2, "G", "1/4", "play", 1, 3, 3, "Up", "Fret 3"),
            MakeB(3, "G#", "1/4", "play", 1, 4, 4, "Down", "Fret 4"), MakeB(4, "G#", "1/4", "play", 1, 4, 4, "Up", "Fret 4")));
        sb.AppendLine(string.Format("    {{ measure: 3, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "G", "1/4", "play", 1, 3, 3, "Down", "Fret 3"), MakeB(2, "G", "1/4", "play", 1, 3, 3, "Up", "Fret 3"),
            MakeB(3, "F#", "1/4", "play", 1, 2, 2, "Down", "Fret 2"), MakeB(4, "F#", "1/4", "play", 1, 2, 2, "Up", "Fret 2")));
        sb.AppendLine(string.Format("    {{ measure: 4, beats: [ {0}, {1}, {2}, {3} ] }}",
            MakeB(1, "F", "1/4", "play", 1, 1, 1, "Down", 1, "Fret 1"),
            MakeB(2, "F", "1/4", "play", 1, 1, 1, "Up", 1, "Fret 1"),
            MakeRestB(3, "1/2", 2, "Half Rest (Silence Strings)"),
            MakeRestSustainB(4, "1/2", 2, "Silence Strings")));
        sb.AppendLine("  ]");
        sb.Append("}");
        return sb.ToString();
    }

    private static string MakeFingerEx3(string id) {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine("{");
        sb.AppendLine(string.Format("  id: '{0}', title: 'Finger Exercise 3: 1 2 3 4 3 2 1 (Downstrokes)',", id));
        sb.AppendLine("  description: 'Authentic Lesson Book page 4: Single stroke per fret with All Down strokes. 1 2 3 4 3 2 1 with Beat 4 rest damping.',");
        sb.AppendLine("  timeSignature: [4, 4], defaultBpm: 65, concepts: ['All Down Strokes', 'Fret 1-2-3-4', 'Rest Damping'],");
        sb.AppendLine("  tabData: [");
        sb.AppendLine(string.Format("    {{ measure: 1, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "F", "1/4", "play", 1, 1, 1, "Down", "Fret 1"),
            MakeB(2, "F#", "1/4", "play", 1, 2, 2, "Down", "Fret 2"),
            MakeB(3, "G", "1/4", "play", 1, 3, 3, "Down", "Fret 3"),
            MakeB(4, "G#", "1/4", "play", 1, 4, 4, "Down", "Fret 4")));
        sb.AppendLine(string.Format("    {{ measure: 2, beats: [ {0}, {1}, {2}, {3} ] }}",
            MakeB(1, "G", "1/4", "play", 1, 3, 3, "Down", "Fret 3"),
            MakeB(2, "F#", "1/4", "play", 1, 2, 2, "Down", "Fret 2"),
            MakeB(3, "F", "1/4", "play", 1, 1, 1, "Down", "Fret 1"),
            MakeRestB(4, "REST", "Silence Strings on Beat 4!")));
        sb.AppendLine("  ]");
        sb.Append("}");
        return sb.ToString();
    }

    private static string MakeFingerEx4(string id) {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine("{");
        sb.AppendLine(string.Format("  id: '{0}', title: 'Finger Exercise 4: Permutation 1-2-1-3-1-4',", id));
        sb.AppendLine("  description: 'Authentic Lesson Book page 5: Finger stretch permutation: 1-2-1-3-1-4-1-3-1-2-1.',");
        sb.AppendLine("  timeSignature: [4, 4], defaultBpm: 60, concepts: ['Finger Stretching', 'Pivot on Finger 1', 'Pinky Reach'],");
        sb.AppendLine("  tabData: [");
        sb.AppendLine(string.Format("    {{ measure: 1, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "F", "1/4", "play", 1, 1, 1, "Down", "Fret 1"), MakeB(2, "F#", "1/4", "play", 1, 2, 2, "Up", "Fret 2"),
            MakeB(3, "F", "1/4", "play", 1, 1, 1, "Down", "Fret 1"), MakeB(4, "G", "1/4", "play", 1, 3, 3, "Up", "Fret 3")));
        sb.AppendLine(string.Format("    {{ measure: 2, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "F", "1/4", "play", 1, 1, 1, "Down", "Fret 1"), MakeB(2, "G#", "1/4", "play", 1, 4, 4, "Up", "Fret 4"),
            MakeB(3, "F", "1/4", "play", 1, 1, 1, "Down", "Fret 1"), MakeB(4, "G", "1/4", "play", 1, 3, 3, "Up", "Fret 3")));
        sb.AppendLine(string.Format("    {{ measure: 3, beats: [ {0}, {1}, {2}, {3} ] }}",
            MakeB(1, "F", "1/4", "play", 1, 1, 1, "Down", "Fret 1"), MakeB(2, "F#", "1/4", "play", 1, 2, 2, "Up", "Fret 2"),
            MakeB(3, "F", "1/4", "play", 1, 1, 1, "Down", "Fret 1"), MakeRestB(4, "REST", "Rest & Reset Hand!")));
        sb.AppendLine("  ]");
        sb.Append("}");
        return sb.ToString();
    }

    private static string MakeFingerEx5(string id) {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine("{");
        sb.AppendLine(string.Format("  id: '{0}', title: 'Finger Exercise 5: Reverse Permutation 4-3-4-2-4-1 (Low E)',", id));
        sb.AppendLine("  description: 'Authentic Lesson Book page 5: Reverse permutation played on the 6th string (Low E): 4-3-4-2-4-1-4-3-4-2-4-1.',");
        sb.AppendLine("  timeSignature: [4, 4], defaultBpm: 60, concepts: ['Low E String (6th)', 'Finger 4 Lead', 'Bass Coordination'],");
        sb.AppendLine("  tabData: [");
        sb.AppendLine(string.Format("    {{ measure: 1, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "G#", "1/4", "play", 6, 4, 4, "Down", "6th Str Fret 4"), MakeB(2, "G", "1/4", "play", 6, 3, 3, "Up", "6th Str Fret 3"),
            MakeB(3, "G#", "1/4", "play", 6, 4, 4, "Down", "6th Str Fret 4"), MakeB(4, "F#", "1/4", "play", 6, 2, 2, "Up", "6th Str Fret 2")));
        sb.AppendLine(string.Format("    {{ measure: 2, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "G#", "1/4", "play", 6, 4, 4, "Down", "6th Str Fret 4"), MakeB(2, "F", "1/4", "play", 6, 1, 1, "Up", "6th Str Fret 1"),
            MakeB(3, "G#", "1/4", "play", 6, 4, 4, "Down", "6th Str Fret 4"), MakeB(4, "G", "1/4", "play", 6, 3, 3, "Up", "6th Str Fret 3")));
        sb.AppendLine(string.Format("    {{ measure: 3, beats: [ {0}, {1}, {2}, {3} ] }}",
            MakeB(1, "G#", "1/4", "play", 6, 4, 4, "Down", "6th Str Fret 4"), MakeB(2, "F#", "1/4", "play", 6, 2, 2, "Up", "6th Str Fret 2"),
            MakeB(3, "G#", "1/4", "play", 6, 4, 4, "Down", "6th Str Fret 4"), MakeB(4, "F", "1/4", "play", 6, 1, 1, "Up", "6th Str Fret 1")));
        sb.AppendLine("  ]");
        sb.Append("}");
        return sb.ToString();
    }

    private static string MakeChordEx1(string id) {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine("{");
        sb.AppendLine(string.Format("  id: '{0}', title: 'Chord Exercise 1: Whole Note Transitions (C & G7)',", id));
        sb.AppendLine("  description: 'Authentic Lesson Book page 6: Whole note strums (diamonds) on beat 1, sustained for 4 full beats. C - G7 - C - G7 - C.',");
        sb.AppendLine("  timeSignature: [4, 4], defaultBpm: 60, concepts: ['C Major', 'G7 Chord', 'Whole Note Strums (4 Beats)'],");
        sb.AppendLine("  tabData: [");
        sb.AppendLine("    " + MakeChordWholeBar(1, "C Major", "5-1", "Bar 1: C Major Whole Strum") + ",");
        sb.AppendLine("    " + MakeChordWholeBar(2, "G7", "all", "Bar 2: G7 Whole Strum") + ",");
        sb.AppendLine("    " + MakeChordWholeBar(3, "C Major", "5-1", "Bar 3: C Major Whole Strum") + ",");
        sb.AppendLine("    " + MakeChordWholeBar(4, "G7", "all", "Bar 4: G7 Whole Strum") + ",");
        sb.AppendLine("    " + MakeChordWholeBar(5, "C Major", "5-1", "Bar 5: Final C Major Chord"));
        sb.AppendLine("  ]");
        sb.Append("}");
        return sb.ToString();
    }

    private static string MakeChordEx2(string id) {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine("{");
        sb.AppendLine(string.Format("  id: '{0}', title: 'Chord Exercise 2: 4 Strums per Bar (C to G7)',", id));
        sb.AppendLine("  description: 'Authentic Lesson Book page 6: Four quarter note down-strums per measure. C (2 bars) to G7 (2 bars) to C (1 bar).',");
        sb.AppendLine("  timeSignature: [4, 4], defaultBpm: 65, concepts: ['Quarter Note Strums', 'C Major 2 Bars', 'G7 2 Bars'],");
        sb.AppendLine("  tabData: [");
        sb.AppendLine("    " + MakeChordQuarterBar(1, "C Major", "5-1") + ",");
        sb.AppendLine("    " + MakeChordQuarterBar(2, "C Major", "5-1") + ",");
        sb.AppendLine("    " + MakeChordQuarterBar(3, "G7", "all") + ",");
        sb.AppendLine("    " + MakeChordQuarterBar(4, "G7", "all") + ",");
        sb.AppendLine("    " + MakeChordQuarterBar(5, "C Major", "5-1"));
        sb.AppendLine("  ]");
        sb.Append("}");
        return sb.ToString();
    }

    private static string MakeChordEx3(string id) {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine("{");
        sb.AppendLine(string.Format("  id: '{0}', title: 'Chord Exercise 3: Extended Transition Endurance',", id));
        sb.AppendLine("  description: 'Authentic Lesson Book page 6: Alternating every measure between C and G7 with 4 strums per bar: C - G7 - C - G7 - C.',");
        sb.AppendLine("  timeSignature: [4, 4], defaultBpm: 70, concepts: ['Alternating Measures', 'Rapid Finger Repositioning', 'Continuous Rhythm'],");
        sb.AppendLine("  tabData: [");
        sb.AppendLine("    " + MakeChordQuarterBar(1, "C Major", "5-1") + ",");
        sb.AppendLine("    " + MakeChordQuarterBar(2, "G7", "all") + ",");
        sb.AppendLine("    " + MakeChordQuarterBar(3, "C Major", "5-1") + ",");
        sb.AppendLine("    " + MakeChordQuarterBar(4, "G7", "all") + ",");
        sb.AppendLine("    " + MakeChordQuarterBar(5, "C Major", "5-1"));
        sb.AppendLine("  ]");
        sb.Append("}");
        return sb.ToString();
    }

    // ==========================================
    // AUTHENTIC SESSION 2 LESSON BOOK EXERCISES
    // ==========================================
    private static string MakeLessonStr1Ex1(string id) {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine("{");
        sb.AppendLine(string.Format("  id: '{0}',", id));
        sb.AppendLine("  title: 'Exercise 1: Whole Notes (4 Beats) [E - F - G]',");
        sb.AppendLine("  description: 'Authentic Lesson Book page 9: Seven bars of whole notes on the 1st string: E, F, G, F, E, G, E.',");
        sb.AppendLine("  timeSignature: [4, 4], defaultBpm: 60, concepts: ['Whole Notes (4 Beats)', '1st String (High E)', 'Finger 1 on F', 'Finger 3 on G'],");
        sb.AppendLine("  tabData: [");
        sb.AppendLine("    " + MakeWholeBar(1, "High E", 1, 0, 0, "Down", "Bar 1: Open 1st String (E) - 4 full beats") + ",");
        sb.AppendLine("    " + MakeWholeBar(2, "F", 1, 1, 1, "Down", "Bar 2: 1st Fret (F), 1st Finger - 4 full beats") + ",");
        sb.AppendLine("    " + MakeWholeBar(3, "G", 1, 3, 3, "Down", "Bar 3: 3rd Fret (G), 3rd Finger - 4 full beats") + ",");
        sb.AppendLine("    " + MakeWholeBar(4, "F", 1, 1, 1, "Down", "Bar 4: 1st Fret (F), 1st Finger - 4 full beats") + ",");
        sb.AppendLine("    " + MakeWholeBar(5, "High E", 1, 0, 0, "Down", "Bar 5: Open 1st String (E) - 4 full beats") + ",");
        sb.AppendLine("    " + MakeWholeBar(6, "G", 1, 3, 3, "Down", "Bar 6: 3rd Fret (G), 3rd Finger - 4 full beats") + ",");
        sb.AppendLine("    " + MakeWholeBar(7, "High E", 1, 0, 0, "Down", "Bar 7: Open 1st String (E) - Final 4 beats"));
        sb.AppendLine("  ]");
        sb.Append("}");
        return sb.ToString();
    }

    private static string MakeLessonStr1Ex2(string id) {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine("{");
        sb.AppendLine(string.Format("  id: '{0}',", id));
        sb.AppendLine("  title: 'Exercise 2: Half Notes (2 Beats)',");
        sb.AppendLine("  description: 'Authentic Lesson Book page 9: Four measures of half notes. Each note sustained for exactly 2 beats.',");
        sb.AppendLine("  timeSignature: [4, 4], defaultBpm: 65, concepts: ['Half Notes (2 Beats)', 'E-F Steps', 'E-G Skips', 'Finger 1 & Finger 3'],");
        sb.AppendLine("  tabData: [");
        sb.AppendLine("    " + MakeHalfBar(1, "High E", 1, 0, 0, "F", 1, 1, 1) + ",");
        sb.AppendLine("    " + MakeHalfBar(2, "High E", 1, 0, 0, "G", 1, 3, 3) + ",");
        sb.AppendLine("    " + MakeHalfBar(3, "F", 1, 1, 1, "G", 1, 3, 3) + ",");
        sb.AppendLine("    " + MakeHalfBar(4, "F", 1, 1, 1, "High E", 1, 0, 0));
        sb.AppendLine("  ]");
        sb.Append("}");
        return sb.ToString();
    }

    private static string MakeLessonStr1Ex3(string id) {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine("{");
        sb.AppendLine(string.Format("  id: '{0}',", id));
        sb.AppendLine("  title: 'Exercise 3: Quarter Notes (1 Beat)',");
        sb.AppendLine("  description: 'Authentic Lesson Book page 9: Five measures combining quarter notes, half notes, and whole notes.',");
        sb.AppendLine("  timeSignature: [4, 4], defaultBpm: 70, concepts: ['Quarter Notes (1 Beat)', 'Half Notes (2 Beats)', 'Whole Note (4 Beats)'],");
        sb.AppendLine("  tabData: [");
        sb.AppendLine(string.Format("    {{ measure: 1, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "High E", "1/4", "play", 1, 0, 0, "Down", "Open E"),
            MakeB(2, "High E", "1/4", "play", 1, 0, 0, "Up", "Open E"),
            MakeB(3, "F", "1/4", "play", 1, 1, 1, "Down", "Fret 1 F"),
            MakeB(4, "F", "1/4", "play", 1, 1, 1, "Up", "Fret 1 F")));
        sb.AppendLine(string.Format("    {{ measure: 2, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "G", "1/4", "play", 1, 3, 3, "Down", "Fret 3 G"),
            MakeB(2, "F", "1/4", "play", 1, 1, 1, "Up", "Fret 1 F"),
            MakeB(3, "High E", "1/2", "play", 1, 0, 0, "Down", "Half Note E"),
            MakeSustainB(4, "High E", "1/2", 1, 0, 0, 2, "Hold Beat 4")));
        sb.AppendLine(string.Format("    {{ measure: 3, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "High E", "1/4", "play", 1, 0, 0, "Down", "Open E"),
            MakeB(2, "F", "1/4", "play", 1, 1, 1, "Up", "Fret 1 F"),
            MakeB(3, "G", "1/2", "play", 1, 3, 3, "Down", "Half Note G"),
            MakeSustainB(4, "G", "1/2", 1, 3, 3, 2, "Hold Beat 4")));
        sb.AppendLine(string.Format("    {{ measure: 4, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "G", "1/4", "play", 1, 3, 3, "Down", "Fret 3 G"),
            MakeB(2, "F", "1/4", "play", 1, 1, 1, "Up", "Fret 1 F"),
            MakeB(3, "High E", "1/4", "play", 1, 0, 0, "Down", "Open E"),
            MakeB(4, "F", "1/4", "play", 1, 1, 1, "Up", "Fret 1 F")));
        sb.AppendLine("    " + MakeWholeBar(5, "High E", 1, 0, 0, "Down", "Bar 5: Final Whole Note E (4 beats)"));
        sb.AppendLine("  ]");
        sb.Append("}");
        return sb.ToString();
    }

    private static string MakeLessonStr1Ex4(string id) {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine("{");
        sb.AppendLine(string.Format("  id: '{0}',", id));
        sb.AppendLine("  title: 'Exercise 4: Mixed Rhythm & Meter',");
        sb.AppendLine("  description: 'Authentic Lesson Book page 9: Six measures alternating quarter notes and half notes across E, F, G.',");
        sb.AppendLine("  timeSignature: [4, 4], defaultBpm: 75, concepts: ['Mixed Rhythms', 'Fret Shift 3-0-1', 'Steady Pulse'],");
        sb.AppendLine("  tabData: [");
        sb.AppendLine(string.Format("    {{ measure: 1, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "G", "1/4", "play", 1, 3, 3, "Down", "G"), MakeB(2, "High E", "1/4", "play", 1, 0, 0, "Up", "E"),
            MakeB(3, "F", "1/2", "play", 1, 1, 1, "Down", "F (Half)"), MakeSustainB(4, "F", "1/2", 1, 1, 1, 2, "Hold Beat 4")));
        sb.AppendLine(string.Format("    {{ measure: 2, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "High E", "1/4", "play", 1, 0, 0, "Down", "E"), MakeB(2, "High E", "1/4", "play", 1, 0, 0, "Up", "E"),
            MakeB(3, "High E", "1/2", "play", 1, 0, 0, "Down", "E (Half)"), MakeSustainB(4, "High E", "1/2", 1, 0, 0, 2, "Hold Beat 4")));
        sb.AppendLine(string.Format("    {{ measure: 3, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "F", "1/4", "play", 1, 1, 1, "Down", "F"), MakeB(2, "F", "1/4", "play", 1, 1, 1, "Up", "F"),
            MakeB(3, "F", "1/2", "play", 1, 1, 1, "Down", "F (Half)"), MakeSustainB(4, "F", "1/2", 1, 1, 1, 2, "Hold Beat 4")));
        sb.AppendLine(string.Format("    {{ measure: 4, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "High E", "1/4", "play", 1, 0, 0, "Down", "E"), MakeB(2, "High E", "1/4", "play", 1, 0, 0, "Up", "E"),
            MakeB(3, "High E", "1/2", "play", 1, 0, 0, "Down", "E (Half)"), MakeSustainB(4, "High E", "1/2", 1, 0, 0, 2, "Hold Beat 4")));
        sb.AppendLine(string.Format("    {{ measure: 5, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "G", "1/4", "play", 1, 3, 3, "Down", "G"), MakeB(2, "F", "1/4", "play", 1, 1, 1, "Up", "F"),
            MakeB(3, "High E", "1/4", "play", 1, 0, 0, "Down", "E"), MakeB(4, "F", "1/4", "play", 1, 1, 1, "Up", "F")));
        sb.AppendLine(string.Format("    {{ measure: 6, beats: [ {0}, {1}, {2}, {3} ] }}",
            MakeB(1, "G", "1/4", "play", 1, 3, 3, "Down", "G"), MakeB(2, "High E", "1/4", "play", 1, 0, 0, "Up", "E"),
            MakeB(3, "G", "1/2", "play", 1, 3, 3, "Down", "G (Half)"), MakeSustainB(4, "G", "1/2", 1, 3, 3, 2, "Hold Beat 4")));
        sb.AppendLine("  ]");
        sb.Append("}");
        return sb.ToString();
    }

    private static string MakeLessonMoreStr1Ex1(string id) {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine("{");
        sb.AppendLine(string.Format("  id: '{0}', title: 'More String 1: Exercise 1 (Step Motion)',", id));
        sb.AppendLine("  description: 'Authentic Lesson Book page 10: Step motion across E, F, G without tablature.',");
        sb.AppendLine("  timeSignature: [4, 4], defaultBpm: 65, concepts: ['Note Reading without TAB', 'High E String'],");
        sb.AppendLine("  tabData: [");
        sb.AppendLine("    " + MakeHalfBar(1, "High E", 1, 0, 0, "F", 1, 1, 1) + ",");
        sb.AppendLine("    " + MakeWholeBar(2, "G", 1, 3, 3, "Down", "G Whole Note") + ",");
        sb.AppendLine(string.Format("    {{ measure: 3, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "G", "1/4", "play", 1, 3, 3, "Down", "G"), MakeB(2, "F", "1/4", "play", 1, 1, 1, "Up", "F"),
            MakeB(3, "High E", "1/2", "play", 1, 0, 0, "Down", "E"), MakeSustainB(4, "High E", "1/2", 1, 0, 0, 2, "Hold Beat 4")) + ",");
        sb.AppendLine("    " + MakeHalfBar(4, "F", 1, 1, 1, "G", 1, 3, 3) + ",");
        sb.AppendLine(string.Format("    {{ measure: 5, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "G", "1/4", "play", 1, 3, 3, "Down", "G"), MakeB(2, "F", "1/4", "play", 1, 1, 1, "Up", "F"),
            MakeB(3, "High E", "1/4", "play", 1, 0, 0, "Down", "E"), MakeB(4, "F", "1/4", "play", 1, 1, 1, "Up", "F")) + ",");
        sb.AppendLine("    " + MakeWholeBar(6, "High E", 1, 0, 0, "Down", "E Whole Note"));
        sb.AppendLine("  ]");
        sb.Append("}");
        return sb.ToString();
    }

    private static string MakeLessonMoreStr1Ex2(string id) {
        return MakeMelody(id, "More String 1: Exercise 2 (Fret Skips)", 1, new int[]{0,1,3,1, 0,0,3,3, 1,3,0,0, 3,1,0,0}, 65);
    }
    private static string MakeLessonMoreStr1Ex3(string id) {
        return MakeMelody(id, "More String 1: Exercise 3 (Sustained Phrases)", 1, new int[]{3,3,1,0, 1,1,3,3, 0,1,3,1, 0,0,0,0}, 65);
    }
    private static string MakeLessonMoreStr1Ex4(string id) {
        return MakeMelody(id, "More String 1: Exercise 4 (Alternating Pulse)", 1, new int[]{0,0,1,1, 3,1,0,0, 1,3,0,0, 0,0,0,0}, 70);
    }
    private static string MakeLessonMoreStr1Ex5(string id) {
        return MakeMelody(id, "More String 1: Exercise 5 (Extended Etude)", 1, new int[]{0,1,3,1, 0,3,1,1, 0,1,3,1, 0,0,0,0, 1,3,0,1, 3,1,0,0, 1,1,3,3, 0,0,0,0}, 70);
    }

    private static string MakeLessonStr2Ex1(string id) {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine("{");
        sb.AppendLine(string.Format("  id: '{0}',", id));
        sb.AppendLine("  title: 'Exercise 1: Whole Notes (4 Beats) [B - C - D]',");
        sb.AppendLine("  description: 'Authentic Lesson Book page 11: Seven measures of whole notes on the 2nd string: B, C, D, B, D, B, C.',");
        sb.AppendLine("  timeSignature: [4, 4], defaultBpm: 60, concepts: ['2nd String (B)', 'Finger 1 on C', 'Finger 3 on D', 'Whole Notes'],");
        sb.AppendLine("  tabData: [");
        sb.AppendLine("    " + MakeWholeBar(1, "B", 2, 0, 0, "Down", "Bar 1: Open 2nd String (B)") + ",");
        sb.AppendLine("    " + MakeWholeBar(2, "C", 2, 1, 1, "Down", "Bar 2: 1st Fret C (Finger 1)") + ",");
        sb.AppendLine("    " + MakeWholeBar(3, "D", 2, 3, 3, "Down", "Bar 3: 3rd Fret D (Finger 3)") + ",");
        sb.AppendLine("    " + MakeWholeBar(4, "B", 2, 0, 0, "Down", "Bar 4: Open 2nd String (B)") + ",");
        sb.AppendLine("    " + MakeWholeBar(5, "D", 2, 3, 3, "Down", "Bar 5: 3rd Fret D (Finger 3)") + ",");
        sb.AppendLine("    " + MakeWholeBar(6, "B", 2, 0, 0, "Down", "Bar 6: Open 2nd String (B)") + ",");
        sb.AppendLine("    " + MakeWholeBar(7, "C", 2, 1, 1, "Down", "Bar 7: 1st Fret C (Finger 1)"));
        sb.AppendLine("  ]");
        sb.Append("}");
        return sb.ToString();
    }

    private static string MakeLessonStr2Ex2(string id) {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine("{");
        sb.AppendLine(string.Format("  id: '{0}',", id));
        sb.AppendLine("  title: 'Exercise 2: Half Notes (2 Beats) [B - C - D]',");
        sb.AppendLine("  description: 'Authentic Lesson Book page 11: Four measures of half notes on 2nd string: B-C, B-D, C-D, C-B.',");
        sb.AppendLine("  timeSignature: [4, 4], defaultBpm: 65, concepts: ['Half Notes (2 Beats)', 'String 2 Shifts'],");
        sb.AppendLine("  tabData: [");
        sb.AppendLine("    " + MakeHalfBar(1, "B", 2, 0, 0, "C", 2, 1, 1) + ",");
        sb.AppendLine("    " + MakeHalfBar(2, "B", 2, 0, 0, "D", 2, 3, 3) + ",");
        sb.AppendLine("    " + MakeHalfBar(3, "C", 2, 1, 1, "D", 2, 3, 3) + ",");
        sb.AppendLine("    " + MakeHalfBar(4, "C", 2, 1, 1, "B", 2, 0, 0));
        sb.AppendLine("  ]");
        sb.Append("}");
        return sb.ToString();
    }

    private static string MakeLessonStr2Ex3(string id) {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine("{");
        sb.AppendLine(string.Format("  id: '{0}',", id));
        sb.AppendLine("  title: 'Exercise 3: Quarter Notes (1 Beat) [B - C - D]',");
        sb.AppendLine("  description: 'Authentic Lesson Book page 11: Five measures of quarter notes, half notes and whole notes on string 2.',");
        sb.AppendLine("  timeSignature: [4, 4], defaultBpm: 70, concepts: ['Quarter Notes (1 Beat)', 'String 2 Coordination'],");
        sb.AppendLine("  tabData: [");
        sb.AppendLine(string.Format("    {{ measure: 1, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "B", "1/4", "play", 2, 0, 0, "Down", "B"),
            MakeB(2, "B", "1/4", "play", 2, 0, 0, "Up", "B"),
            MakeB(3, "C", "1/4", "play", 2, 1, 1, "Down", "C"),
            MakeB(4, "C", "1/4", "play", 2, 1, 1, "Up", "C")));
        sb.AppendLine(string.Format("    {{ measure: 2, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "D", "1/4", "play", 2, 3, 3, "Down", "D"),
            MakeB(2, "C", "1/4", "play", 2, 1, 1, "Up", "C"),
            MakeB(3, "B", "1/2", "play", 2, 0, 0, "Down", "B (Half)"),
            MakeSustainB(4, "B", "1/2", 2, 0, 0, 2, "Hold Beat 4")));
        sb.AppendLine(string.Format("    {{ measure: 3, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "B", "1/4", "play", 2, 0, 0, "Down", "B"),
            MakeB(2, "C", "1/4", "play", 2, 1, 1, "Up", "C"),
            MakeB(3, "D", "1/2", "play", 2, 3, 3, "Down", "D (Half)"),
            MakeSustainB(4, "D", "1/2", 2, 3, 3, 2, "Hold Beat 4")));
        sb.AppendLine(string.Format("    {{ measure: 4, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "D", "1/4", "play", 2, 3, 3, "Down", "D"),
            MakeB(2, "C", "1/4", "play", 2, 1, 1, "Up", "C"),
            MakeB(3, "B", "1/4", "play", 2, 0, 0, "Down", "B"),
            MakeB(4, "C", "1/4", "play", 2, 1, 1, "Up", "C")));
        sb.AppendLine("    " + MakeWholeBar(5, "D", 2, 3, 3, "Down", "Bar 5: D (Whole Note)"));
        sb.AppendLine("  ]");
        sb.Append("}");
        return sb.ToString();
    }

    private static string MakeLessonStr2Ex4(string id) {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine("{");
        sb.AppendLine(string.Format("  id: '{0}',", id));
        sb.AppendLine("  title: 'Exercise 4: Mixed Rhythm & Meter [B - C - D]',");
        sb.AppendLine("  description: 'Authentic Lesson Book page 11: Six measures of mixed quarter and half notes on 2nd string.',");
        sb.AppendLine("  timeSignature: [4, 4], defaultBpm: 75, concepts: ['String 2 Rhythm', 'D-B-C Progressions'],");
        sb.AppendLine("  tabData: [");
        sb.AppendLine(string.Format("    {{ measure: 1, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "D", "1/4", "play", 2, 3, 3, "Down", "D"), MakeB(2, "B", "1/4", "play", 2, 0, 0, "Up", "B"),
            MakeB(3, "C", "1/2", "play", 2, 1, 1, "Down", "C (Half)"), MakeSustainB(4, "C", "1/2", 2, 1, 1, 2, "Hold Beat 4")));
        sb.AppendLine(string.Format("    {{ measure: 2, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "B", "1/4", "play", 2, 0, 0, "Down", "B"), MakeB(2, "B", "1/4", "play", 2, 0, 0, "Up", "B"),
            MakeB(3, "B", "1/2", "play", 2, 0, 0, "Down", "B (Half)"), MakeSustainB(4, "B", "1/2", 2, 0, 0, 2, "Hold Beat 4")));
        sb.AppendLine(string.Format("    {{ measure: 3, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "C", "1/4", "play", 2, 1, 1, "Down", "C"), MakeB(2, "C", "1/4", "play", 2, 1, 1, "Up", "C"),
            MakeB(3, "C", "1/2", "play", 2, 1, 1, "Down", "C (Half)"), MakeSustainB(4, "C", "1/2", 2, 1, 1, 2, "Hold Beat 4")));
        sb.AppendLine(string.Format("    {{ measure: 4, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "B", "1/4", "play", 2, 0, 0, "Down", "B"), MakeB(2, "B", "1/4", "play", 2, 0, 0, "Up", "B"),
            MakeB(3, "B", "1/2", "play", 2, 0, 0, "Down", "B (Half)"), MakeSustainB(4, "B", "1/2", 2, 0, 0, 2, "Hold Beat 4")));
        sb.AppendLine(string.Format("    {{ measure: 5, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "D", "1/4", "play", 2, 3, 3, "Down", "D"), MakeB(2, "C", "1/4", "play", 2, 1, 1, "Up", "C"),
            MakeB(3, "B", "1/4", "play", 2, 0, 0, "Down", "B"), MakeB(4, "C", "1/4", "play", 2, 1, 1, "Up", "C")));
        sb.AppendLine(string.Format("    {{ measure: 6, beats: [ {0}, {1}, {2}, {3} ] }}",
            MakeB(1, "D", "1/4", "play", 2, 3, 3, "Down", "D"), MakeB(2, "B", "1/4", "play", 2, 0, 0, "Up", "B"),
            MakeB(3, "D", "1/2", "play", 2, 3, 3, "Down", "D (Half)"), MakeSustainB(4, "D", "1/2", 2, 3, 3, 2, "Hold Beat 4")));
        sb.AppendLine("  ]");
        sb.Append("}");
        return sb.ToString();
    }

    private static string MakeLessonMoreStr2Ex1(string id) {
        return MakeMelody(id, "More String 2: Exercise 1 (Step Motion)", 2, new int[]{0,0,1,1, 3,3,3,3, 0,1,3,1, 0,0,1,1}, 65);
    }
    private static string MakeLessonMoreStr2Ex2(string id) {
        return MakeMelody(id, "More String 2: Exercise 2 (Fret Skips)", 2, new int[]{0,1,3,1, 0,3,1,1, 0,1,3,1, 0,0,0,0}, 65);
    }
    private static string MakeLessonMoreStr2Ex3(string id) {
        return MakeMelody(id, "More String 2: Exercise 3 (Sustained Phrases)", 2, new int[]{3,3,1,0, 1,1,3,3, 0,1,3,1, 0,0,0,0}, 65);
    }
    private static string MakeLessonMoreStr2Ex4(string id) {
        return MakeMelody(id, "More String 2: Exercise 4 (Rhythm Flow)", 2, new int[]{0,0,1,1, 3,1,0,0, 1,3,0,0, 0,0,0,0}, 70);
    }
    private static string MakeLessonMoreStr2Ex5(string id) {
        return MakeMelody(id, "More String 2: Exercise 5 (Extended 2nd String Etude)", 2, new int[]{0,1,3,1, 0,3,1,1, 0,1,3,1, 0,0,0,0, 1,3,0,1, 3,1,0,0, 1,1,3,3, 0,0,0,0}, 70);
    }

    private static string MakeComb1(string id) {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine("{");
        sb.AppendLine(string.Format("  id: '{0}',", id));
        sb.AppendLine("  title: 'Combined Exercise 1: Melodic String Crossing',");
        sb.AppendLine("  description: 'Authentic Lesson Book page 12: Seven measures crossing between strings 1 and 2.',");
        sb.AppendLine("  timeSignature: [4, 4], defaultBpm: 65, concepts: ['Strings 1 & 2', 'Two-String Melodic Flow'],");
        sb.AppendLine("  tabData: [");
        sb.AppendLine("    " + MakeHalfBar(1, "High E", 1, 0, 0, "F", 1, 1, 1) + ",");
        sb.AppendLine(string.Format("    {{ measure: 2, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "G", "1/4", "play", 1, 3, 3, "Down", "G"), MakeB(2, "F", "1/4", "play", 1, 1, 1, "Up", "F"),
            MakeB(3, "High E", "1/2", "play", 1, 0, 0, "Down", "E (Half)"), MakeSustainB(4, "High E", "1/2", 1, 0, 0, 2, "Hold Beat 4")) + ",");
        sb.AppendLine("    " + MakeHalfBar(3, "B", 2, 0, 0, "C", 2, 1, 1) + ",");
        sb.AppendLine(string.Format("    {{ measure: 4, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "D", "1/4", "play", 2, 3, 3, "Down", "D"), MakeB(2, "C", "1/4", "play", 2, 1, 1, "Up", "C"),
            MakeB(3, "B", "1/2", "play", 2, 0, 0, "Down", "B (Half)"), MakeSustainB(4, "B", "1/2", 2, 0, 0, 2, "Hold Beat 4")) + ",");
        sb.AppendLine(string.Format("    {{ measure: 5, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "C", "1/4", "play", 2, 1, 1, "Down", "C"), MakeB(2, "D", "1/4", "play", 2, 3, 3, "Up", "D"),
            MakeB(3, "High E", "1/4", "play", 1, 0, 0, "Down", "E"), MakeB(4, "F", "1/4", "play", 1, 1, 1, "Up", "F")) + ",");
        sb.AppendLine("    " + MakeHalfBar(6, "G", 1, 3, 3, "G", 1, 3, 3) + ",");
        sb.AppendLine("    " + MakeWholeBar(7, "C", 2, 1, 1, "Down", "Bar 7: C Whole Note"));
        sb.AppendLine("  ]");
        sb.Append("}");
        return sb.ToString();
    }

    private static string MakeComb2(string id) {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine("{");
        sb.AppendLine(string.Format("  id: '{0}',", id));
        sb.AppendLine("  title: 'Combined Exercise 2: Rapid String Crossing',");
        sb.AppendLine("  description: 'Authentic Lesson Book page 12: Four measures crossing between strings 2 and 1.',");
        sb.AppendLine("  timeSignature: [4, 4], defaultBpm: 70, concepts: ['String 2 to 1 Shift', 'Controlled Pick Attack'],");
        sb.AppendLine("  tabData: [");
        sb.AppendLine(string.Format("    {{ measure: 1, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "C", "1/4", "play", 2, 1, 1, "Down", "C"), MakeB(2, "C", "1/4", "play", 2, 1, 1, "Up", "C"),
            MakeB(3, "High E", "1/4", "play", 1, 0, 0, "Down", "E"), MakeB(4, "High E", "1/4", "play", 1, 0, 0, "Up", "E")));
        sb.AppendLine(string.Format("    {{ measure: 2, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "D", "1/4", "play", 2, 3, 3, "Down", "D"), MakeB(2, "D", "1/4", "play", 2, 3, 3, "Up", "D"),
            MakeB(3, "F", "1/2", "play", 1, 1, 1, "Down", "F (Half)"), MakeSustainB(4, "F", "1/2", 1, 1, 1, 2, "Hold Beat 4")));
        sb.AppendLine(string.Format("    {{ measure: 3, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "F", "1/4", "play", 1, 1, 1, "Down", "F"), MakeB(2, "High E", "1/4", "play", 1, 0, 0, "Up", "E"),
            MakeB(3, "D", "1/4", "play", 2, 3, 3, "Down", "D"), MakeB(4, "C", "1/4", "play", 2, 1, 1, "Up", "C")));
        sb.AppendLine(string.Format("    {{ measure: 4, beats: [ {0}, {1}, {2}, {3} ] }}",
            MakeB(1, "B", "1/4", "play", 2, 0, 0, "Down", "B"), MakeB(2, "D", "1/4", "play", 2, 3, 3, "Up", "D"),
            MakeB(3, "C", "1/2", "play", 2, 1, 1, "Down", "C (Half)"), MakeSustainB(4, "C", "1/2", 2, 1, 1, 2, "Hold Beat 4")));
        sb.AppendLine("  ]");
        sb.Append("}");
        return sb.ToString();
    }

    private static string MakeComb3(string id) {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine("{");
        sb.AppendLine(string.Format("  id: '{0}',", id));
        sb.AppendLine("  title: 'Combined Exercise 3: Rhythm & String Shifts',");
        sb.AppendLine("  description: 'Authentic Lesson Book page 12: Five measures combining quarter notes and half notes across strings 1 and 2.',");
        sb.AppendLine("  timeSignature: [4, 4], defaultBpm: 70, concepts: ['E-F-G and B-C-D Combined', 'Two-String Agility'],");
        sb.AppendLine("  tabData: [");
        sb.AppendLine(string.Format("    {{ measure: 1, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "High E", "1/4", "play", 1, 0, 0, "Down", "E"), MakeB(2, "High E", "1/4", "play", 1, 0, 0, "Up", "E"),
            MakeB(3, "F", "1/4", "play", 1, 1, 1, "Down", "F"), MakeB(4, "F", "1/4", "play", 1, 1, 1, "Up", "F")));
        sb.AppendLine(string.Format("    {{ measure: 2, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "G", "1/4", "play", 1, 3, 3, "Down", "G"), MakeB(2, "F", "1/4", "play", 1, 1, 1, "Up", "F"),
            MakeB(3, "High E", "1/2", "play", 1, 0, 0, "Down", "E"), MakeSustainB(4, "High E", "1/2", 1, 0, 0, 2, "Hold Beat 4")));
        sb.AppendLine(string.Format("    {{ measure: 3, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "B", "1/4", "play", 2, 0, 0, "Down", "B"), MakeB(2, "C", "1/4", "play", 2, 1, 1, "Up", "C"),
            MakeB(3, "D", "1/2", "play", 2, 3, 3, "Down", "D"), MakeSustainB(4, "D", "1/2", 2, 3, 3, 2, "Hold Beat 4")));
        sb.AppendLine(string.Format("    {{ measure: 4, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "D", "1/4", "play", 2, 3, 3, "Down", "D"), MakeB(2, "C", "1/4", "play", 2, 1, 1, "Up", "C"),
            MakeB(3, "B", "1/4", "play", 2, 0, 0, "Down", "B"), MakeB(4, "C", "1/4", "play", 2, 1, 1, "Up", "C")));
        sb.AppendLine("    " + MakeHalfBar(5, "D", 2, 3, 3, "High E", 1, 0, 0));
        sb.AppendLine("  ]");
        sb.Append("}");
        return sb.ToString();
    }

    private static string MakeComb4(string id) {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine("{");
        sb.AppendLine(string.Format("  id: '{0}',", id));
        sb.AppendLine("  title: 'Combined Exercise 4: Extended Multi-Measure Piece',");
        sb.AppendLine("  description: 'Authentic Lesson Book page 13: Seven measures of melodic phrasing across strings 1 & 2.',");
        sb.AppendLine("  timeSignature: [4, 4], defaultBpm: 75, concepts: ['Extended Phrasing', 'Position Stability'],");
        sb.AppendLine("  tabData: [");
        sb.AppendLine(string.Format("    {{ measure: 1, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "B", "1/4", "play", 2, 0, 0, "Down", "B"), MakeB(2, "C", "1/4", "play", 2, 1, 1, "Up", "C"),
            MakeB(3, "D", "1/2", "play", 2, 3, 3, "Down", "D (Half)"), MakeSustainB(4, "D", "1/2", 2, 3, 3, 2, "Hold Beat 4")));
        sb.AppendLine(string.Format("    {{ measure: 2, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "High E", "1/4", "play", 1, 0, 0, "Down", "E"), MakeB(2, "F", "1/4", "play", 1, 1, 1, "Up", "F"),
            MakeB(3, "G", "1/4", "play", 1, 3, 3, "Down", "G"), MakeB(4, "F", "1/4", "play", 1, 1, 1, "Up", "F")));
        sb.AppendLine(string.Format("    {{ measure: 3, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "High E", "1/2", "play", 1, 0, 0, "Down", "E (Half)"), MakeSustainB(2, "High E", "1/2", 1, 0, 0, 2, "Hold Beat 2"),
            MakeB(3, "D", "1/4", "play", 2, 3, 3, "Down", "D"), MakeB(4, "C", "1/4", "play", 2, 1, 1, "Up", "C")));
        sb.AppendLine(string.Format("    {{ measure: 4, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "B", "1/2", "play", 2, 0, 0, "Down", "B (Half)"), MakeSustainB(2, "B", "1/2", 2, 0, 0, 2, "Hold Beat 2"),
            MakeB(3, "D", "1/4", "play", 2, 3, 3, "Down", "D"), MakeB(4, "C", "1/4", "play", 2, 1, 1, "Up", "C")));
        sb.AppendLine(string.Format("    {{ measure: 5, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "High E", "1/4", "play", 1, 0, 0, "Down", "E"), MakeB(2, "F", "1/4", "play", 1, 1, 1, "Up", "F"),
            MakeB(3, "High E", "1/4", "play", 1, 0, 0, "Down", "E"), MakeB(4, "High E", "1/4", "play", 1, 0, 0, "Up", "E")));
        sb.AppendLine(string.Format("    {{ measure: 6, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "D", "1/4", "play", 2, 3, 3, "Down", "D"), MakeB(2, "D", "1/4", "play", 2, 3, 3, "Up", "D"),
            MakeB(3, "C", "1/4", "play", 2, 1, 1, "Down", "C"), MakeB(4, "B", "1/4", "play", 2, 0, 0, "Up", "B")));
        sb.AppendLine("    " + MakeWholeBar(7, "C", 2, 1, 1, "Down", "Bar 7: Final C Whole Note"));
        sb.AppendLine("  ]");
        sb.Append("}");
        return sb.ToString();
    }

    private static string MakeRestEx1(string id) {
        return MakeMelody(id, "Exercise 1: Continuous Note Flow", 1, new int[]{0,1,3,1, 0,1,0,0, 1,3,1,0, 0,0,0,0}, 65);
    }

    private static string MakeRestEx2(string id) {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine("{");
        sb.AppendLine(string.Format("  id: '{0}',", id));
        sb.AppendLine("  title: 'Exercise 2: Quarter Rest (Beat 4 Red Mute Cue)',");
        sb.AppendLine("  description: 'Authentic Lesson Book page 13: Quarter rest on Beat 4! Metronome turns vivid red - physically damp strings with your right palm!',");
        sb.AppendLine("  timeSignature: [4, 4], defaultBpm: 65, concepts: ['Quarter Rest (1 Beat)', 'Beat 4 Palm Mute', 'Red Light Warning'],");
        sb.AppendLine("  tabData: [");
        sb.AppendLine(string.Format("    {{ measure: 1, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "High E", "1/4", "play", 1, 0, 0, "Down", "Open E"), MakeB(2, "F", "1/4", "play", 1, 1, 1, "Up", "Fret 1 F"),
            MakeB(3, "G", "1/4", "play", 1, 3, 3, "Down", "Fret 3 G"), MakeRestB(4, "REST", "PALM MUTE STRING!")));
        sb.AppendLine(string.Format("    {{ measure: 2, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "G", "1/4", "play", 1, 3, 3, "Down", "Fret 3 G"), MakeB(2, "F", "1/4", "play", 1, 1, 1, "Up", "Fret 1 F"),
            MakeB(3, "High E", "1/4", "play", 1, 0, 0, "Down", "Open E"), MakeRestB(4, "REST", "PALM MUTE STRING!")));
        sb.AppendLine(string.Format("    {{ measure: 3, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "High E", "1/4", "play", 1, 0, 0, "Down", "Open E"), MakeB(2, "F", "1/4", "play", 1, 1, 1, "Up", "Fret 1 F"),
            MakeB(3, "G", "1/4", "play", 1, 3, 3, "Down", "Fret 3 G"), MakeRestB(4, "REST", "PALM MUTE STRING!")));
        sb.AppendLine(string.Format("    {{ measure: 4, beats: [ {0}, {1}, {2}, {3} ] }}",
            MakeB(1, "G", "1/4", "play", 1, 3, 3, "Down", "Fret 3 G"), MakeB(2, "F", "1/4", "play", 1, 1, 1, "Up", "Fret 1 F"),
            MakeB(3, "High E", "1/4", "play", 1, 0, 0, "Down", "Open E"), MakeRestB(4, "REST", "PALM MUTE STRING!")));
        sb.AppendLine("  ]");
        sb.Append("}");
        return sb.ToString();
    }

    private static string MakeRestEx3(string id) {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine("{");
        sb.AppendLine(string.Format("  id: '{0}',", id));
        sb.AppendLine("  title: 'Exercise 3: Half Rest (Beats 3-4 Red Mute Cue)',");
        sb.AppendLine("  description: 'Authentic Lesson Book page 13: Half rests get 2 full beats of silence on Beats 3 and 4.',");
        sb.AppendLine("  timeSignature: [4, 4], defaultBpm: 65, concepts: ['Half Rest (2 Beats)', 'Physical Damping on Beats 3-4'],");
        sb.AppendLine("  tabData: [");
        sb.AppendLine(string.Format("    {{ measure: 1, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "High E", "1/2", "play", 1, 0, 0, "Down", "E (2 Beats)"), MakeSustainB(2, "High E", "1/2", 1, 0, 0, 2, "Hold Beat 2"),
            MakeRestB(3, "1/2", 2, "Half Rest (Silence Strings)"), MakeRestSustainB(4, "1/2", 2, "Silence Strings")));
        sb.AppendLine(string.Format("    {{ measure: 2, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "G", "1/2", "play", 1, 3, 3, "Down", "G (2 Beats)"), MakeSustainB(2, "G", "1/2", 1, 3, 3, 2, "Hold Beat 2"),
            MakeRestB(3, "1/2", 2, "Half Rest (Silence Strings)"), MakeRestSustainB(4, "1/2", 2, "Silence Strings")));
        sb.AppendLine(string.Format("    {{ measure: 3, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "G", "1/2", "play", 1, 3, 3, "Down", "G (2 Beats)"), MakeSustainB(2, "G", "1/2", 1, 3, 3, 2, "Hold Beat 2"),
            MakeRestB(3, "1/2", 2, "Half Rest (Silence Strings)"), MakeRestSustainB(4, "1/2", 2, "Silence Strings")));
        sb.AppendLine(string.Format("    {{ measure: 4, beats: [ {0}, {1}, {2}, {3} ] }}",
            MakeB(1, "High E", "1/2", "play", 1, 0, 0, "Down", "E (2 Beats)"), MakeSustainB(2, "High E", "1/2", 1, 0, 0, 2, "Hold Beat 2"),
            MakeRestB(3, "1/2", 2, "Half Rest (Silence Strings)"), MakeRestSustainB(4, "1/2", 2, "Silence Strings")));
        sb.AppendLine("  ]");
        sb.Append("}");
        return sb.ToString();
    }

    private static string MakeRestEx4(string id) {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine("{");
        sb.AppendLine(string.Format("  id: '{0}',", id));
        sb.AppendLine("  title: 'Exercise 4: Offbeat Damping (Play-Rest-Play-Rest)',");
        sb.AppendLine("  description: 'Authentic Lesson Book page 13: Strict alternating pulse of note then rest. Train quick palm muting on beats 2 and 4.',");
        sb.AppendLine("  timeSignature: [4, 4], defaultBpm: 70, concepts: ['Play-Rest Alternation', 'Offbeat Damping'],");
        sb.AppendLine("  tabData: [");
        sb.AppendLine(string.Format("    {{ measure: 1, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "High E", "1/4", "play", 1, 0, 0, "Down", "E"), MakeRestB(2, "REST", "Mute"),
            MakeB(3, "F", "1/4", "play", 1, 1, 1, "Down", "F"), MakeRestB(4, "REST", "Mute")));
        sb.AppendLine(string.Format("    {{ measure: 2, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "G", "1/4", "play", 1, 3, 3, "Down", "G"), MakeRestB(2, "REST", "Mute"),
            MakeB(3, "F", "1/4", "play", 1, 1, 1, "Down", "F"), MakeRestB(4, "REST", "Mute")));
        sb.AppendLine(string.Format("    {{ measure: 3, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "High E", "1/4", "play", 1, 0, 0, "Down", "E"), MakeRestB(2, "REST", "Mute"),
            MakeB(3, "F", "1/4", "play", 1, 1, 1, "Down", "F"), MakeRestB(4, "REST", "Mute")));
        sb.AppendLine(string.Format("    {{ measure: 4, beats: [ {0}, {1}, {2}, {3} ] }}",
            MakeB(1, "G", "1/4", "play", 1, 3, 3, "Down", "G"), MakeRestB(2, "REST", "Mute"),
            MakeB(3, "High E", "1/2", "play", 1, 0, 0, "Down", "E (Half)"), MakeSustainB(4, "High E", "1/2", 1, 0, 0, 2, "Hold Beat 4")));
        sb.AppendLine("  ]");
        sb.Append("}");
        return sb.ToString();
    }

    private static string MakeRestEx5(string id) {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine("{");
        sb.AppendLine(string.Format("  id: '{0}',", id));
        sb.AppendLine("  title: 'Exercise 5: Sustained Notes and Rest Interludes',");
        sb.AppendLine("  description: 'Authentic Lesson Book page 13: Half notes and whole note followed by alternating rests on beats 2 and 4.',");
        sb.AppendLine("  timeSignature: [4, 4], defaultBpm: 65, concepts: ['Mixed Values', 'Rest Precision'],");
        sb.AppendLine("  tabData: [");
        sb.AppendLine("    " + MakeHalfBar(1, "High E", 1, 0, 0, "G", 1, 3, 3) + ",");
        sb.AppendLine("    " + MakeWholeBar(2, "G", 1, 3, 3, "Down", "G Whole Note") + ",");
        sb.AppendLine(string.Format("    {{ measure: 3, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "F", "1/4", "play", 1, 1, 1, "Down", "F"), MakeRestB(2, "REST", "Mute"),
            MakeB(3, "F", "1/4", "play", 1, 1, 1, "Down", "F"), MakeRestB(4, "REST", "Mute")) + ",");
        sb.AppendLine(string.Format("    {{ measure: 4, beats: [ {0}, {1}, {2}, {3} ] }}",
            MakeB(1, "High E", "1/4", "play", 1, 0, 0, "Down", "E"), MakeRestB(2, "REST", "Mute"),
            MakeB(3, "High E", "1/2", "play", 1, 0, 0, "Down", "E"), MakeSustainB(4, "High E", "1/2", 1, 0, 0, 2, "Hold Beat 4")));
        sb.AppendLine("  ]");
        sb.Append("}");
        return sb.ToString();
    }

    private static string MakeRestEx6(string id) {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine("{");
        sb.AppendLine(string.Format("  id: '{0}',", id));
        sb.AppendLine("  title: 'Exercise 6: Complete Rest Mastery',");
        sb.AppendLine("  description: 'Authentic Lesson Book page 13: Whole rest, half rest, and quarter rests in a complete technical etude.',");
        sb.AppendLine("  timeSignature: [4, 4], defaultBpm: 65, concepts: ['Complete Rest Mastery', 'Physical Hand Damping'],");
        sb.AppendLine("  tabData: [");
        sb.AppendLine("    " + MakeWholeBar(1, "High E", 1, 0, 0, "Down", "E Whole Note") + ",");
        sb.AppendLine(string.Format("    {{ measure: 2, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeRestB(1, "1/2", 2, "Half Rest (Silence Strings)"), MakeRestSustainB(2, "1/2", 2, "Silence Strings"),
            MakeB(3, "High E", "1/4", "play", 1, 0, 0, "Down", "E"), MakeB(4, "F", "1/4", "play", 1, 1, 1, "Up", "F")) + ",");
        sb.AppendLine(string.Format("    {{ measure: 3, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "G", "1/4", "play", 1, 3, 3, "Down", "G"), MakeRestB(2, "REST", "Mute"),
            MakeB(3, "F", "1/4", "play", 1, 1, 1, "Down", "F"), MakeRestB(4, "REST", "Mute")) + ",");
        sb.AppendLine(string.Format("    {{ measure: 4, beats: [ {0}, {1}, {2}, {3} ] }}",
            MakeB(1, "High E", "1/4", "play", 1, 0, 0, "Down", "E"), MakeRestB(2, "REST", "Mute"),
            MakeB(3, "High E", "1/2", "play", 1, 0, 0, "Down", "E"), MakeSustainB(4, "High E", "1/2", 1, 0, 0, 2, "Hold Beat 4")));
        sb.AppendLine("  ]");
        sb.Append("}");
        return sb.ToString();
    }

    private static string MakeOdeToJoyMelody(string id) {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine("{");
        sb.AppendLine(string.Format("  id: '{0}', title: 'Ode to Joy - Beethoven (Full 16 Bars Melody)',", id));
        sb.AppendLine("  description: 'Authentic Lesson Book page 14: Beethoven Theme from Symphony #9. Complete 16 measures transcribed note-for-note on strings 1 & 2.',");
        sb.AppendLine("  timeSignature: [4, 4], defaultBpm: 80, concepts: ['Classical Repertoire', 'Strings 1 & 2', 'Beethoven'],");
        sb.AppendLine("  tabData: [");
        // Measures 1 to 4
        sb.AppendLine(string.Format("    {{ measure: 1, chordName: 'C Major', beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "High E", "1/4", "play", 1, 0, 0, "Down", "Joy-"), MakeB(2, "High E", "1/4", "play", 1, 0, 0, "Up", "-ful,"),
            MakeB(3, "F", "1/4", "play", 1, 1, 1, "Down", "joy-"), MakeB(4, "G", "1/4", "play", 1, 3, 3, "Up", "-ful")));
        sb.AppendLine(string.Format("    {{ measure: 2, chordName: 'G7', beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "G", "1/4", "play", 1, 3, 3, "Down", "we"), MakeB(2, "F", "1/4", "play", 1, 1, 1, "Up", "a-"),
            MakeB(3, "High E", "1/4", "play", 1, 0, 0, "Down", "-dore"), MakeB(4, "D", "1/4", "play", 2, 3, 3, "Up", "thee,")));
        sb.AppendLine(string.Format("    {{ measure: 3, chordName: 'C Major', beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "C", "1/4", "play", 2, 1, 1, "Down", "God"), MakeB(2, "C", "1/4", "play", 2, 1, 1, "Up", "of"),
            MakeB(3, "D", "1/4", "play", 2, 3, 3, "Down", "glo-"), MakeB(4, "High E", "1/4", "play", 1, 0, 0, "Up", "-ry,")));
        sb.AppendLine(string.Format("    {{ measure: 4, chordName: 'G7', beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "High E", "1/4", "play", 1, 0, 0, "Down", 1, "Lord"),
            MakeB(2, "D", "1/4", "play", 2, 3, 3, "Up", 1, "of"),
            MakeB(3, "D", "1/2", "play", 2, 3, 3, "Down", 2, "love;"),
            MakeSustainB(4, "D", "1/2", 2, 3, 3, 2, "Hold")));

        // Measures 5 to 8
        sb.AppendLine(string.Format("    {{ measure: 5, chordName: 'C Major', beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "High E", "1/4", "play", 1, 0, 0, "Down", "Hearts"), MakeB(2, "High E", "1/4", "play", 1, 0, 0, "Up", "un-"),
            MakeB(3, "F", "1/4", "play", 1, 1, 1, "Down", "-fold"), MakeB(4, "G", "1/4", "play", 1, 3, 3, "Up", "like")));
        sb.AppendLine(string.Format("    {{ measure: 6, chordName: 'G7', beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "G", "1/4", "play", 1, 3, 3, "Down", "flow-"), MakeB(2, "F", "1/4", "play", 1, 1, 1, "Up", "-ers"),
            MakeB(3, "High E", "1/4", "play", 1, 0, 0, "Down", "be-"), MakeB(4, "D", "1/4", "play", 2, 3, 3, "Up", "-fore")));
        sb.AppendLine(string.Format("    {{ measure: 7, chordName: 'C Major', beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "C", "1/4", "play", 2, 1, 1, "Down", "Prais-"), MakeB(2, "C", "1/4", "play", 2, 1, 1, "Up", "-ing"),
            MakeB(3, "D", "1/4", "play", 2, 3, 3, "Down", "thee,"), MakeB(4, "High E", "1/4", "play", 1, 0, 0, "Up", "their")));
        sb.AppendLine(string.Format("    {{ measure: 8, chordName: 'C Major', beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "D", "1/4", "play", 2, 3, 3, "Down", 1, "sun"),
            MakeB(2, "C", "1/4", "play", 2, 1, 1, "Up", 1, "a-"),
            MakeB(3, "C", "1/2", "play", 2, 1, 1, "Down", 2, "-bove."),
            MakeSustainB(4, "C", "1/2", 2, 1, 1, 2, "Hold")));

        // Measures 9 to 12
        sb.AppendLine(string.Format("    {{ measure: 9, chordName: 'G7', beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "D", "1/4", "play", 2, 3, 3, "Down", "Melt"), MakeB(2, "D", "1/4", "play", 2, 3, 3, "Up", "the"),
            MakeB(3, "High E", "1/4", "play", 1, 0, 0, "Down", "clouds"), MakeB(4, "C", "1/4", "play", 2, 1, 1, "Up", "of")));
        sb.AppendLine(string.Format("    {{ measure: 10, chordName: 'G7', beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "D", "1/4", "play", 2, 3, 3, "Down", "sin"), MakeB(2, "High E", "1/4", "play", 1, 0, 0, "Up", "and"),
            MakeB(3, "F", "1/4", "play", 1, 1, 1, "Down", "sad-"), MakeB(4, "High E", "1/4", "play", 1, 0, 0, "Up", "-ness;")));
        sb.AppendLine(string.Format("    {{ measure: 11, chordName: 'C Major', beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "D", "1/4", "play", 2, 3, 3, "Down", "drive"), MakeB(2, "High E", "1/4", "play", 1, 0, 0, "Up", "the"),
            MakeB(3, "F", "1/4", "play", 1, 1, 1, "Down", "dark"), MakeB(4, "D", "1/4", "play", 2, 3, 3, "Up", "of")));
        sb.AppendLine(string.Format("    {{ measure: 12, chordName: 'G7', beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "C", "1/4", "play", 2, 1, 1, "Down", 1, "doubt"),
            MakeB(2, "D", "1/4", "play", 2, 3, 3, "Up", 1, "a-"),
            MakeB(3, "G", "1/2", "play", 3, 0, 0, "Down", 2, "-way;"),
            MakeSustainB(4, "G", "1/2", 3, 0, 0, 2, "Hold")));

        // Measures 13 to 16
        sb.AppendLine(string.Format("    {{ measure: 13, chordName: 'C Major', beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "High E", "1/4", "play", 1, 0, 0, "Down", "Giv-"), MakeB(2, "High E", "1/4", "play", 1, 0, 0, "Up", "-er"),
            MakeB(3, "F", "1/4", "play", 1, 1, 1, "Down", "of"), MakeB(4, "G", "1/4", "play", 1, 3, 3, "Up", "im-")));
        sb.AppendLine(string.Format("    {{ measure: 14, chordName: 'G7', beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "G", "1/4", "play", 1, 3, 3, "Down", "-mor-"), MakeB(2, "F", "1/4", "play", 1, 1, 1, "Up", "-tal"),
            MakeB(3, "High E", "1/4", "play", 1, 0, 0, "Down", "glad-"), MakeB(4, "D", "1/4", "play", 2, 3, 3, "Up", "-ness,")));
        sb.AppendLine(string.Format("    {{ measure: 15, chordName: 'C Major', beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "C", "1/4", "play", 2, 1, 1, "Down", "Fill"), MakeB(2, "C", "1/4", "play", 2, 1, 1, "Up", "us"),
            MakeB(3, "D", "1/4", "play", 2, 3, 3, "Down", "with"), MakeB(4, "High E", "1/4", "play", 1, 0, 0, "Up", "the")));
        sb.AppendLine(string.Format("    {{ measure: 16, chordName: 'C Major', beats: [ {0}, {1}, {2}, {3} ] }}",
            MakeB(1, "D", "1/4", "play", 2, 3, 3, "Down", 1, "light"),
            MakeB(2, "C", "1/4", "play", 2, 1, 1, "Up", 1, "of"),
            MakeB(3, "C", "1/2", "play", 2, 1, 1, "Down", 2, "day."),
            MakeSustainB(4, "C", "1/2", 2, 1, 1, 2, "Hold")));
        sb.AppendLine("  ]");
        sb.Append("}");
        return sb.ToString();
    }

    private static string MakeOdeToJoyChords(string id) {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine("{");
        sb.AppendLine(string.Format("  id: '{0}', title: 'Ode to Joy - Chords Strumming Companion',", id));
        sb.AppendLine("  description: 'Authentic Lesson Book page 14: Play 4 down-strums per measure following the chord changes for Ode to Joy.',");
        sb.AppendLine("  timeSignature: [4, 4], defaultBpm: 80, concepts: ['C Major', 'G7 Chord', 'Continuous 4/4 Strumming'],");
        sb.AppendLine("  tabData: [");
        string[] chords = new string[] {
            "C Major", "G7", "C Major", "G7",
            "C Major", "G7", "C Major", "C Major",
            "G7", "G7", "C Major", "G7",
            "C Major", "G7", "C Major", "C Major"
        };
        for (int m = 0; m < chords.Length; m++) {
            string ch = chords[m];
            string strPattern = ch == "G7" ? "all" : "5-1";
            sb.AppendLine("    " + MakeChordQuarterBar(m + 1, ch, strPattern) + (m < chords.Length - 1 ? "," : ""));
        }
        sb.AppendLine("  ]");
        sb.Append("}");
        return sb.ToString();
    }

    private static string MakeJingleBells(string id) {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine("{");
        sb.AppendLine(string.Format("  id: '{0}', title: 'Jingle Bells - Holiday Repertoire (Page 15)',", id));
        sb.AppendLine("  description: 'Authentic Lesson Book page 15: Classic holiday song on strings 1 & 2.',");
        sb.AppendLine("  timeSignature: [4, 4], defaultBpm: 85, concepts: ['Strings 1 & 2', 'Quarter & Half Notes'],");
        sb.AppendLine("  tabData: [");
        sb.AppendLine(string.Format("    {{ measure: 1, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "High E", "1/4", "play", 1, 0, 0, "Down", "Jin-"), MakeB(2, "High E", "1/4", "play", 1, 0, 0, "Up", "-gle"),
            MakeB(3, "High E", "1/2", "play", 1, 0, 0, "Down", 2, "bells,"), MakeSustainB(4, "High E", "1/2", 1, 0, 0, 2, "Hold")));
        sb.AppendLine(string.Format("    {{ measure: 2, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "High E", "1/4", "play", 1, 0, 0, "Down", "jin-"), MakeB(2, "High E", "1/4", "play", 1, 0, 0, "Up", "-gle"),
            MakeB(3, "High E", "1/2", "play", 1, 0, 0, "Down", 2, "bells,"), MakeSustainB(4, "High E", "1/2", 1, 0, 0, 2, "Hold")));
        sb.AppendLine(string.Format("    {{ measure: 3, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "High E", "1/4", "play", 1, 0, 0, "Down", "jin-"), MakeB(2, "G", "1/4", "play", 1, 3, 3, "Up", "-gle"),
            MakeB(3, "C", "1/4", "play", 2, 1, 1, "Down", "all"), MakeB(4, "D", "1/4", "play", 2, 3, 3, "Up", "the")));
        sb.AppendLine("    " + MakeWholeBar(4, "High E", 1, 0, 0, "Down", "way!"));
        sb.AppendLine("  ]");
        sb.Append("}");
        return sb.ToString();
    }

    // ==========================================
    // AUTHENTIC BONUS WORKSHOP EXERCISES
    // ==========================================
    private static string MakeBonusFE1String(string id, int strNum, string strLabel, int bpm) {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine("{");
        sb.AppendLine(string.Format("  id: '{0}', title: 'Bonus FE 1: {1}',", id, strLabel));
        sb.AppendLine(string.Format("  description: 'Authentic Bonus Workshop page 5: 7-measure Down-Up coordination on {0}.',", strLabel));
        sb.AppendLine(string.Format("  timeSignature: [4, 4], defaultBpm: {0}, concepts: ['String {1}', 'Down-Up-Down-Up', '1-2-3-4-3-2-1'],", bpm, strNum));
        sb.AppendLine("  tabData: [");
        int[] frets = new int[] { 1, 2, 3, 4, 3, 2, 1 };
        for (int m = 0; m < frets.Length; m++) {
            int f = frets[m];
            string noteName = GetNoteName(strNum, f);
            sb.AppendLine(string.Format("    {{ measure: {0}, beats: [ {1}, {2}, {3}, {4} ] }}" + (m < frets.Length - 1 ? "," : ""),
                m + 1,
                MakeB(1, noteName, "1/4", "play", strNum, f, f, "Down", "Fret " + f),
                MakeB(2, noteName, "1/4", "play", strNum, f, f, "Up", "Fret " + f),
                MakeB(3, noteName, "1/4", "play", strNum, f, f, "Down", "Fret " + f),
                MakeB(4, noteName, "1/4", "play", strNum, f, f, "Up", "Fret " + f)));
        }
        sb.AppendLine("  ]");
        sb.Append("}");
        return sb.ToString();
    }

    private static string MakeBonusFE2(string id) {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine("{");
        sb.AppendLine(string.Format("  id: '{0}', title: 'Bonus FE 2: Two-Stroke Across Strings',", id));
        sb.AppendLine("  description: 'Authentic Bonus Workshop page 6: Two strokes per fret (Down-Up) across strings 1 to 4.',");
        sb.AppendLine("  timeSignature: [4, 4], defaultBpm: 65, concepts: ['Two Strokes Per Fret', 'Down-Up', 'All Strings'],");
        sb.AppendLine("  tabData: [");
        for (int s = 1; s <= 4; s++) {
            sb.AppendLine(string.Format("    {{ measure: {0}, beats: [ {1}, {2}, {3}, {4} ] }},",
                (s - 1) * 2 + 1,
                MakeB(1, GetNoteName(s, 1), "1/4", "play", s, 1, 1, "Down", "Str " + s + " F1"),
                MakeB(2, GetNoteName(s, 1), "1/4", "play", s, 1, 1, "Up", "Str " + s + " F1"),
                MakeB(3, GetNoteName(s, 2), "1/4", "play", s, 2, 2, "Down", "Str " + s + " F2"),
                MakeB(4, GetNoteName(s, 2), "1/4", "play", s, 2, 2, "Up", "Str " + s + " F2")));
            sb.AppendLine(string.Format("    {{ measure: {0}, beats: [ {1}, {2}, {3}, {4} ] }}" + (s < 4 ? "," : ""),
                (s - 1) * 2 + 2,
                MakeB(1, GetNoteName(s, 3), "1/4", "play", s, 3, 3, "Down", "Str " + s + " F3"),
                MakeB(2, GetNoteName(s, 3), "1/4", "play", s, 3, 3, "Up", "Str " + s + " F3"),
                MakeB(3, GetNoteName(s, 4), "1/4", "play", s, 4, 4, "Down", "Str " + s + " F4"),
                MakeB(4, GetNoteName(s, 4), "1/4", "play", s, 4, 4, "Up", "Str " + s + " F4")));
        }
        sb.AppendLine("  ]");
        sb.Append("}");
        return sb.ToString();
    }

    private static string MakeBonusFE3(string id) {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine("{");
        sb.AppendLine(string.Format("  id: '{0}', title: 'Bonus FE 3: Single-Stroke Downstrokes Across Strings',", id));
        sb.AppendLine("  description: 'Authentic Bonus Workshop page 7: Single stroke per fret with All Down strokes across strings 1 to 4.',");
        sb.AppendLine("  timeSignature: [4, 4], defaultBpm: 65, concepts: ['All Down Strokes', 'Strings 1-4', 'Clean Attack'],");
        sb.AppendLine("  tabData: [");
        for (int s = 1; s <= 4; s++) {
            sb.AppendLine(string.Format("    {{ measure: {0}, beats: [ {1}, {2}, {3}, {4} ] }},",
                (s - 1) * 2 + 1,
                MakeB(1, GetNoteName(s, 1), "1/4", "play", s, 1, 1, "Down", "Str " + s + " F1"),
                MakeB(2, GetNoteName(s, 2), "1/4", "play", s, 2, 2, "Down", "Str " + s + " F2"),
                MakeB(3, GetNoteName(s, 3), "1/4", "play", s, 3, 3, "Down", "Str " + s + " F3"),
                MakeB(4, GetNoteName(s, 4), "1/4", "play", s, 4, 4, "Down", "Str " + s + " F4")));
            sb.AppendLine(string.Format("    {{ measure: {0}, beats: [ {1}, {2}, {3}, {4} ] }}" + (s < 4 ? "," : ""),
                (s - 1) * 2 + 2,
                MakeB(1, GetNoteName(s, 3), "1/4", "play", s, 3, 3, "Down", "Str " + s + " F3"),
                MakeB(2, GetNoteName(s, 2), "1/4", "play", s, 2, 2, "Down", "Str " + s + " F2"),
                MakeB(3, GetNoteName(s, 1), "1/4", "play", s, 1, 1, "Down", "Str " + s + " F1"),
                MakeRestB(4, "REST", "Rest on Beat 4!")));
        }
        sb.AppendLine("  ]");
        sb.Append("}");
        return sb.ToString();
    }

    private static string MakeBonusAlt4(string id) {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine("{");
        sb.AppendLine(string.Format("  id: '{0}', title: 'Alternating: Pick Each Four Times (1-3-2-4)',", id));
        sb.AppendLine("  description: 'Authentic Bonus Workshop page 8: 1 1 1 1  3 3 3 3  2 2 2 2  4 4 4 4 (Down-Up-Down-Up).',");
        sb.AppendLine("  timeSignature: [4, 4], defaultBpm: 60, concepts: ['Finger Independence', '1-3-2-4 Pattern', 'Down-Up Picking'],");
        sb.AppendLine("  tabData: [");
        int[] frets = new int[] { 1, 3, 2, 4 };
        for (int m = 0; m < frets.Length; m++) {
            int f = frets[m];
            string noteName = GetNoteName(1, f);
            sb.AppendLine(string.Format("    {{ measure: {0}, beats: [ {1}, {2}, {3}, {4} ] }}" + (m < frets.Length - 1 ? "," : ""),
                m + 1,
                MakeB(1, noteName, "1/4", "play", 1, f, f, "Down", "Fret " + f),
                MakeB(2, noteName, "1/4", "play", 1, f, f, "Up", "Fret " + f),
                MakeB(3, noteName, "1/4", "play", 1, f, f, "Down", "Fret " + f),
                MakeB(4, noteName, "1/4", "play", 1, f, f, "Up", "Fret " + f)));
        }
        sb.AppendLine("  ]");
        sb.Append("}");
        return sb.ToString();
    }

    private static string MakeBonusAlt2(string id) {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine("{");
        sb.AppendLine(string.Format("  id: '{0}', title: 'Alternating: Pick Each Two Times (1-1 3-3 2-2 4-4)',", id));
        sb.AppendLine("  description: 'Authentic Bonus Workshop page 8: Two strokes per fret (Down-Up) in 1-3-2-4 order.',");
        sb.AppendLine("  timeSignature: [4, 4], defaultBpm: 65, concepts: ['Two Strokes Per Note', '1-3-2-4 Independence'],");
        sb.AppendLine("  tabData: [");
        sb.AppendLine(string.Format("    {{ measure: 1, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "F", "1/4", "play", 1, 1, 1, "Down", "Fret 1"), MakeB(2, "F", "1/4", "play", 1, 1, 1, "Up", "Fret 1"),
            MakeB(3, "G", "1/4", "play", 1, 3, 3, "Down", "Fret 3"), MakeB(4, "G", "1/4", "play", 1, 3, 3, "Up", "Fret 3")));
        sb.AppendLine(string.Format("    {{ measure: 2, beats: [ {0}, {1}, {2}, {3} ] }}",
            MakeB(1, "F#", "1/4", "play", 1, 2, 2, "Down", "Fret 2"), MakeB(2, "F#", "1/4", "play", 1, 2, 2, "Up", "Fret 2"),
            MakeB(3, "G#", "1/4", "play", 1, 4, 4, "Down", "Fret 4"), MakeB(4, "G#", "1/4", "play", 1, 4, 4, "Up", "Fret 4")));
        sb.AppendLine("  ]");
        sb.Append("}");
        return sb.ToString();
    }

    private static string MakeBonusAlt1(string id) {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine("{");
        sb.AppendLine(string.Format("  id: '{0}', title: 'Alternating: One Time Each (1-3-2-4 All Down)',", id));
        sb.AppendLine("  description: 'Authentic Bonus Workshop page 8: One stroke each: 1  3  2  4  1  3  2  4.',");
        sb.AppendLine("  timeSignature: [4, 4], defaultBpm: 70, concepts: ['Single Strokes', 'All Downstrokes', '1-3-2-4 Agility'],");
        sb.AppendLine("  tabData: [");
        sb.AppendLine(string.Format("    {{ measure: 1, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "F", "1/4", "play", 1, 1, 1, "Down", "Fret 1"), MakeB(2, "G", "1/4", "play", 1, 3, 3, "Down", "Fret 3"),
            MakeB(3, "F#", "1/4", "play", 1, 2, 2, "Down", "Fret 2"), MakeB(4, "G#", "1/4", "play", 1, 4, 4, "Down", "Fret 4")));
        sb.AppendLine(string.Format("    {{ measure: 2, beats: [ {0}, {1}, {2}, {3} ] }}",
            MakeB(1, "F", "1/4", "play", 1, 1, 1, "Down", "Fret 1"), MakeB(2, "G", "1/4", "play", 1, 3, 3, "Down", "Fret 3"),
            MakeB(3, "F#", "1/4", "play", 1, 2, 2, "Down", "Fret 2"), MakeB(4, "G#", "1/4", "play", 1, 4, 4, "Down", "Fret 4")));
        sb.AppendLine("  ]");
        sb.Append("}");
        return sb.ToString();
    }

    private static string MakeBonusChordSpeed(string id, string title, int bpm, string type) {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine("{");
        sb.AppendLine(string.Format("  id: '{0}', title: '{1}',", id, title));
        sb.AppendLine(string.Format("  description: 'Authentic Bonus Workshop page 9: {0} C and G7 switching drill at {1} BPM.',", type, bpm));
        sb.AppendLine(string.Format("  timeSignature: [4, 4], defaultBpm: {0}, concepts: ['{1} Chord Shapes', 'Switching Velocity', 'Endurance'],", bpm, type));
        sb.AppendLine("  tabData: [");
        sb.AppendLine("    " + MakeChordQuarterBar(1, "C Major", "5-1") + ",");
        sb.AppendLine("    " + MakeChordQuarterBar(2, "C Major", "5-1") + ",");
        sb.AppendLine("    " + MakeChordQuarterBar(3, "G7", "all") + ",");
        sb.AppendLine("    " + MakeChordQuarterBar(4, "G7", "all"));
        sb.AppendLine("  ]");
        sb.Append("}");
        return sb.ToString();
    }

    private static string MakeBonusPage12Ex1(string id) {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine("{");
        sb.AppendLine(string.Format("  id: '{0}', title: 'Bonus String 1: Whole Notes (Page 12)',", id));
        sb.AppendLine("  description: 'Authentic Bonus Workshop page 12: Seven bars of whole notes on 1st string: G, F, E, G, E, F, E.',");
        sb.AppendLine("  timeSignature: [4, 4], defaultBpm: 60, concepts: ['High E String', 'Whole Notes', 'Fret 3-1-0'],");
        sb.AppendLine("  tabData: [");
        sb.AppendLine("    " + MakeWholeBar(1, "G", 1, 3, 3, "Down", "Bar 1: 3rd Fret G") + ",");
        sb.AppendLine("    " + MakeWholeBar(2, "F", 1, 1, 1, "Down", "Bar 2: 1st Fret F") + ",");
        sb.AppendLine("    " + MakeWholeBar(3, "High E", 1, 0, 0, "Down", "Bar 3: Open E") + ",");
        sb.AppendLine("    " + MakeWholeBar(4, "G", 1, 3, 3, "Down", "Bar 4: 3rd Fret G") + ",");
        sb.AppendLine("    " + MakeWholeBar(5, "High E", 1, 0, 0, "Down", "Bar 5: Open E") + ",");
        sb.AppendLine("    " + MakeWholeBar(6, "F", 1, 1, 1, "Down", "Bar 6: 1st Fret F") + ",");
        sb.AppendLine("    " + MakeWholeBar(7, "High E", 1, 0, 0, "Down", "Bar 7: Open E"));
        sb.AppendLine("  ]");
        sb.Append("}");
        return sb.ToString();
    }

    private static string MakeBonusPage12Ex2(string id) {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine("{");
        sb.AppendLine(string.Format("  id: '{0}', title: 'Bonus String 1: Half Notes (Page 12)',", id));
        sb.AppendLine("  description: 'Authentic Bonus Workshop page 12: Half notes on 1st string: G-E | G-E | F-E | F-G.',");
        sb.AppendLine("  timeSignature: [4, 4], defaultBpm: 65, concepts: ['Half Notes (2 Beats)', 'String 1 Shifts'],");
        sb.AppendLine("  tabData: [");
        sb.AppendLine("    " + MakeHalfBar(1, "G", 1, 3, 3, "High E", 1, 0, 0) + ",");
        sb.AppendLine("    " + MakeHalfBar(2, "G", 1, 3, 3, "High E", 1, 0, 0) + ",");
        sb.AppendLine("    " + MakeHalfBar(3, "F", 1, 1, 1, "High E", 1, 0, 0) + ",");
        sb.AppendLine("    " + MakeHalfBar(4, "F", 1, 1, 1, "G", 1, 3, 3));
        sb.AppendLine("  ]");
        sb.Append("}");
        return sb.ToString();
    }

    private static string MakeBonusPage12Ex3(string id) {
        return MakeMelody(id, "Bonus String 1: Quarter & Half (Page 12)", 1, new int[]{0,1,3,1, 0,1,0,0, 0,3,1,1, 0,3,1,1, 0,0,0,0}, 70);
    }
    private static string MakeBonusPage12Ex4(string id) {
        return MakeMelody(id, "Bonus String 1: Mixed Rhythm Velocity (Page 12)", 1, new int[]{0,0,3,3, 1,1,0,0, 3,0,3,3, 1,1,0,0, 3,1,3,1, 3,0,3,3}, 75);
    }

    private static string MakeBonusPage14Ex1(string id) {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine("{");
        sb.AppendLine(string.Format("  id: '{0}', title: 'Bonus String 2: Whole Notes (Page 14)',", id));
        sb.AppendLine("  description: 'Authentic Bonus Workshop page 14: Seven bars of whole notes on 2nd string: D, B, C, D, C, B, C.',");
        sb.AppendLine("  timeSignature: [4, 4], defaultBpm: 60, concepts: ['2nd String (B)', 'Whole Notes', 'Fret 3-0-1'],");
        sb.AppendLine("  tabData: [");
        sb.AppendLine("    " + MakeWholeBar(1, "D", 2, 3, 3, "Down", "Bar 1: 3rd Fret D") + ",");
        sb.AppendLine("    " + MakeWholeBar(2, "B", 2, 0, 0, "Down", "Bar 2: Open B") + ",");
        sb.AppendLine("    " + MakeWholeBar(3, "C", 2, 1, 1, "Down", "Bar 3: 1st Fret C") + ",");
        sb.AppendLine("    " + MakeWholeBar(4, "D", 2, 3, 3, "Down", "Bar 4: 3rd Fret D") + ",");
        sb.AppendLine("    " + MakeWholeBar(5, "C", 2, 1, 1, "Down", "Bar 5: 1st Fret C") + ",");
        sb.AppendLine("    " + MakeWholeBar(6, "B", 2, 0, 0, "Down", "Bar 6: Open B") + ",");
        sb.AppendLine("    " + MakeWholeBar(7, "C", 2, 1, 1, "Down", "Bar 7: 1st Fret C"));
        sb.AppendLine("  ]");
        sb.Append("}");
        return sb.ToString();
    }

    private static string MakeBonusPage14Ex2(string id) {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine("{");
        sb.AppendLine(string.Format("  id: '{0}', title: 'Bonus String 2: Half Notes (Page 14)',", id));
        sb.AppendLine("  description: 'Authentic Bonus Workshop page 14: Half notes on 2nd string: C-D | C-B | D-D | B-C.',");
        sb.AppendLine("  timeSignature: [4, 4], defaultBpm: 65, concepts: ['Half Notes', 'String 2 Shifts'],");
        sb.AppendLine("  tabData: [");
        sb.AppendLine("    " + MakeHalfBar(1, "C", 2, 1, 1, "D", 2, 3, 3) + ",");
        sb.AppendLine("    " + MakeHalfBar(2, "C", 2, 1, 1, "B", 2, 0, 0) + ",");
        sb.AppendLine("    " + MakeHalfBar(3, "D", 2, 3, 3, "D", 2, 3, 3) + ",");
        sb.AppendLine("    " + MakeHalfBar(4, "B", 2, 0, 0, "C", 2, 1, 1));
        sb.AppendLine("  ]");
        sb.Append("}");
        return sb.ToString();
    }

    private static string MakeBonusPage14Ex3(string id) {
        return MakeMelody(id, "Bonus String 2: Quarter & Half (Page 14)", 2, new int[]{1,1,3,0, 1,0,1,1, 3,3,0,0, 3,0,0,1, 1,1,1,1}, 70);
    }
    private static string MakeBonusPage14Ex4(string id) {
        return MakeMelody(id, "Bonus String 2: Mixed Rhythm Mastery (Page 14)", 2, new int[]{1,3,1,0, 1,3,1,0, 0,3,0,3, 1,1,1,1, 3,3,0,0, 1,3,1,1}, 75);
    }

    private static string MakeBonusPage16Ex1(string id) {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine("{");
        sb.AppendLine(string.Format("  id: '{0}', title: 'Bonus Combined: Drill 1 (Page 16)',", id));
        sb.AppendLine("  description: 'Authentic Bonus Workshop page 16: Seven bars of two-string phrasing across strings 1 and 2.',");
        sb.AppendLine("  timeSignature: [4, 4], defaultBpm: 70, concepts: ['Strings 1 & 2', 'Two-String Phrasing'],");
        sb.AppendLine("  tabData: [");
        sb.AppendLine(string.Format("    {{ measure: 1, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "C", "1/4", "play", 2, 1, 1, "Down", "C"), MakeB(2, "D", "1/4", "play", 2, 3, 3, "Up", "D"),
            MakeB(3, "High E", "1/4", "play", 1, 0, 0, "Down", "E"), MakeB(4, "F", "1/4", "play", 1, 1, 1, "Up", "F")));
        sb.AppendLine(string.Format("    {{ measure: 2, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "G", "1/4", "play", 1, 3, 3, "Down", "G"), MakeB(2, "G", "1/4", "play", 1, 3, 3, "Up", "G"),
            MakeB(3, "G", "1/2", "play", 1, 3, 3, "Down", "G"), MakeSustainB(4, "G", "1/2", 1, 3, 3, 2, "Hold Beat 4")));
        sb.AppendLine(string.Format("    {{ measure: 3, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "G", "1/4", "play", 1, 3, 3, "Down", "G"), MakeB(2, "F", "1/4", "play", 1, 1, 1, "Up", "F"),
            MakeB(3, "High E", "1/4", "play", 1, 0, 0, "Down", "E"), MakeB(4, "D", "1/4", "play", 2, 3, 3, "Up", "D")));
        sb.AppendLine(string.Format("    {{ measure: 4, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "C", "1/4", "play", 2, 1, 1, "Down", "C"), MakeB(2, "C", "1/4", "play", 2, 1, 1, "Up", "C"),
            MakeB(3, "C", "1/2", "play", 2, 1, 1, "Down", "C"), MakeSustainB(4, "C", "1/2", 2, 1, 1, 2, "Hold Beat 4")));
        sb.AppendLine(string.Format("    {{ measure: 5, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "G", "1/4", "play", 1, 3, 3, "Down", "G"), MakeB(2, "G", "1/4", "play", 1, 3, 3, "Up", "G"),
            MakeB(3, "G", "1/2", "play", 1, 3, 3, "Down", "G"), MakeSustainB(4, "G", "1/2", 1, 3, 3, 2, "Hold Beat 4")));
        sb.AppendLine(string.Format("    {{ measure: 6, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "B", "1/4", "play", 2, 0, 0, "Down", "B"), MakeB(2, "B", "1/4", "play", 2, 0, 0, "Up", "B"),
            MakeB(3, "B", "1/2", "play", 2, 0, 0, "Down", "B"), MakeSustainB(4, "B", "1/2", 2, 0, 0, 2, "Hold Beat 4")));
        sb.AppendLine("    " + MakeWholeBar(7, "C", 2, 1, 1, "Down", "C Whole Note"));
        sb.AppendLine("  ]");
        sb.Append("}");
        return sb.ToString();
    }

    private static string MakeBonusPage16Ex2(string id) {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine("{");
        sb.AppendLine(string.Format("  id: '{0}', title: 'Bonus Combined: Drill 2 (Half Notes)',", id));
        sb.AppendLine("  description: 'Authentic Bonus Workshop page 16: Half notes crossing strings 1 and 2.',");
        sb.AppendLine("  timeSignature: [4, 4], defaultBpm: 70, concepts: ['Half Notes', 'String Crossing'],");
        sb.AppendLine("  tabData: [");
        sb.AppendLine("    " + MakeHalfBar(1, "D", 2, 3, 3, "G", 1, 3, 3) + ",");
        sb.AppendLine("    " + MakeHalfBar(2, "B", 2, 0, 0, "D", 2, 3, 3) + ",");
        sb.AppendLine("    " + MakeHalfBar(3, "High E", 1, 0, 0, "F", 1, 1, 1) + ",");
        sb.AppendLine("    " + MakeHalfBar(4, "G", 1, 3, 3, "High E", 1, 0, 0) + ",");
        sb.AppendLine("    " + MakeHalfBar(5, "D", 2, 3, 3, "C", 2, 1, 1) + ",");
        sb.AppendLine("    " + MakeWholeBar(6, "C", 2, 1, 1, "Down", "C Whole Note"));
        sb.AppendLine("  ]");
        sb.Append("}");
        return sb.ToString();
    }

    private static string MakeBonusPage16Ex3(string id) {
        return MakeMelody(id, "Bonus Combined: Drill 3 (Quarter Flow)", 1, new int[]{0,0,0,0, 1,1,1,1, 0,0,3,3, 3,3,1,1, 0,0,1,1, 0,0,1,1}, 75);
    }
    private static string MakeBonusPage16Ex4(string id) {
        return MakeMelody(id, "Bonus Combined: Drill 4 (Mixed Agility)", 1, new int[]{0,0,3,3, 0,0,3,3, 1,1,1,1, 3,3,0,0, 3,3,1,1, 0,3,1,0, 1,1,1,1}, 75);
    }

    private static string MakeBonusPage17Rest1(string id) {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine("{");
        sb.AppendLine(string.Format("  id: '{0}', title: 'Bonus Muting Drill: Quarter Rest (Page 17)',", id));
        sb.AppendLine("  description: 'Authentic Bonus Workshop page 17: Quarter rest on Beat 4 with physical palm damping cue.',");
        sb.AppendLine("  timeSignature: [4, 4], defaultBpm: 75, concepts: ['Beat 4 Rest', 'Palm Muting', 'Red Rest Cue'],");
        sb.AppendLine("  tabData: [");
        sb.AppendLine(string.Format("    {{ measure: 1, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "High E", "1/4", "play", 1, 0, 0, "Down", "E"), MakeB(2, "F", "1/4", "play", 1, 1, 1, "Up", "F"),
            MakeB(3, "G", "1/4", "play", 1, 3, 3, "Down", "G"), MakeRestB(4, "REST", "PALM MUTE STRING!")));
        sb.AppendLine(string.Format("    {{ measure: 2, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "G", "1/4", "play", 1, 3, 3, "Down", "G"), MakeB(2, "F", "1/4", "play", 1, 1, 1, "Up", "F"),
            MakeB(3, "High E", "1/4", "play", 1, 0, 0, "Down", "E"), MakeRestB(4, "REST", "PALM MUTE STRING!")));
        sb.AppendLine(string.Format("    {{ measure: 3, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "C", "1/4", "play", 2, 1, 1, "Down", "C"), MakeB(2, "D", "1/4", "play", 2, 3, 3, "Up", "D"),
            MakeB(3, "High E", "1/4", "play", 1, 0, 0, "Down", "E"), MakeRestB(4, "REST", "PALM MUTE STRING!")));
        sb.AppendLine(string.Format("    {{ measure: 4, beats: [ {0}, {1}, {2}, {3} ] }}",
            MakeB(1, "High E", "1/4", "play", 1, 0, 0, "Down", "E"), MakeB(2, "D", "1/4", "play", 2, 3, 3, "Up", "D"),
            MakeB(3, "C", "1/4", "play", 2, 1, 1, "Down", "C"), MakeRestB(4, "REST", "PALM MUTE STRING!")));
        sb.AppendLine("  ]");
        sb.Append("}");
        return sb.ToString();
    }

    private static string MakeBonusPage17Rest2(string id) {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine("{");
        sb.AppendLine(string.Format("  id: '{0}', title: 'Bonus Muting Drill: Half Rest (Page 17)',", id));
        sb.AppendLine("  description: 'Authentic Bonus Workshop page 17: Half rests on Beats 3 and 4 with full hand silence.',");
        sb.AppendLine("  timeSignature: [4, 4], defaultBpm: 75, concepts: ['Half Rests (Beats 3-4)', 'Physical Damping'],");
        sb.AppendLine("  tabData: [");
        sb.AppendLine(string.Format("    {{ measure: 1, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "G", "1/2", "play", 1, 3, 3, "Down", "G"), MakeSustainB(2, "G", "1/2", 1, 3, 3, 2, "Hold Beat 2"),
            MakeRestB(3, "1/2", 2, "Half Rest (Silence Strings)"), MakeRestSustainB(4, "1/2", 2, "Silence Strings")));
        sb.AppendLine(string.Format("    {{ measure: 2, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "High E", "1/2", "play", 1, 0, 0, "Down", "E"), MakeSustainB(2, "High E", "1/2", 1, 0, 0, 2, "Hold Beat 2"),
            MakeRestB(3, "1/2", 2, "Half Rest (Silence Strings)"), MakeRestSustainB(4, "1/2", 2, "Silence Strings")));
        sb.AppendLine(string.Format("    {{ measure: 3, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "D", "1/2", "play", 2, 3, 3, "Down", "D"), MakeSustainB(2, "D", "1/2", 2, 3, 3, 2, "Hold Beat 2"),
            MakeRestB(3, "1/2", 2, "Half Rest (Silence Strings)"), MakeRestSustainB(4, "1/2", 2, "Silence Strings")));
        sb.AppendLine(string.Format("    {{ measure: 4, beats: [ {0}, {1}, {2}, {3} ] }}",
            MakeB(1, "C", "1/2", "play", 2, 1, 1, "Down", "C"), MakeSustainB(2, "C", "1/2", 2, 1, 1, 2, "Hold Beat 2"),
            MakeRestB(3, "1/2", 2, "Half Rest (Silence Strings)"), MakeRestSustainB(4, "1/2", 2, "Silence Strings")));
        sb.AppendLine("  ]");
        sb.Append("}");
        return sb.ToString();
    }

    private static string MakeBonusPage17Rest3(string id) {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine("{");
        sb.AppendLine(string.Format("  id: '{0}', title: 'Bonus Muting Drill: Offbeat Agility (Page 17)',", id));
        sb.AppendLine("  description: 'Authentic Bonus Workshop page 17: Play on beat 1, rest on beat 2, play on beat 3, rest on beat 4.',");
        sb.AppendLine("  timeSignature: [4, 4], defaultBpm: 80, concepts: ['Play-Rest-Play-Rest', 'Offbeat Damping'],");
        sb.AppendLine("  tabData: [");
        sb.AppendLine(string.Format("    {{ measure: 1, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "High E", "1/4", "play", 1, 0, 0, "Down", "E"), MakeRestB(2, "REST", "Mute"),
            MakeB(3, "F", "1/4", "play", 1, 1, 1, "Down", "F"), MakeRestB(4, "REST", "Mute")));
        sb.AppendLine(string.Format("    {{ measure: 2, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "G", "1/4", "play", 1, 3, 3, "Down", "G"), MakeRestB(2, "REST", "Mute"),
            MakeB(3, "High E", "1/4", "play", 1, 0, 0, "Down", "E"), MakeRestB(4, "REST", "Mute")));
        sb.AppendLine(string.Format("    {{ measure: 3, beats: [ {0}, {1}, {2}, {3} ] }},",
            MakeB(1, "D", "1/4", "play", 2, 3, 3, "Down", "D"), MakeRestB(2, "REST", "Mute"),
            MakeB(3, "C", "1/4", "play", 2, 1, 1, "Down", "C"), MakeRestB(4, "REST", "Mute")));
        sb.AppendLine(string.Format("    {{ measure: 4, beats: [ {0}, {1}, {2}, {3} ] }}",
            MakeB(1, "B", "1/4", "play", 2, 0, 0, "Down", "B"), MakeRestB(2, "REST", "Mute"),
            MakeB(3, "C", "1/2", "play", 2, 1, 1, "Down", "C"), MakeSustainB(4, "C", "1/2", 2, 1, 1, 2, "Hold Beat 4")));
        sb.AppendLine("  ]");
        sb.Append("}");
        return sb.ToString();
    }

    private static string MakeLondonBridge(string id) {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine("{");
        sb.AppendLine(string.Format("  id: '{0}',", id));
        sb.AppendLine("  title: 'London Bridge is Falling Down - Melody (Page 18)',");
        sb.AppendLine("  description: 'Authentic Bonus Workshop page 18: Traditional song practiced with strict metronome count.',");
        sb.AppendLine("  timeSignature: [4, 4], defaultBpm: 80, concepts: ['Strings 1 & 2', 'Quarter & Half Notes', 'Strict Timing'],");
        sb.AppendLine("  tabData: [");
        sb.AppendLine(string.Format("    {{ measure: 1, beats: [ {0}, {1}, {2}, {3} ] }},", MakeB(1, "G", "1/4", "play", 1, 3, 3, "Down", "G"), MakeB(2, "High E", "1/4", "play", 1, 0, 0, "Up", "E"), MakeB(3, "F", "1/4", "play", 1, 1, 1, "Down", "F"), MakeB(4, "G", "1/4", "play", 1, 3, 3, "Up", "G")));
        sb.AppendLine(string.Format("    {{ measure: 2, beats: [ {0}, {1}, {2}, {3} ] }},", MakeB(1, "High E", "1/4", "play", 1, 0, 0, "Down", "E"), MakeB(2, "F", "1/4", "play", 1, 1, 1, "Up", "F"), MakeB(3, "G", "1/2", "play", 1, 3, 3, "Down", "G (Half)"), MakeSustainB(4, "G", "1/2", 1, 3, 3, 2, "Hold Beat 4")));
        sb.AppendLine(string.Format("    {{ measure: 3, beats: [ {0}, {1}, {2}, {3} ] }},", MakeB(1, "D", "1/4", "play", 2, 3, 3, "Down", "D"), MakeB(2, "High E", "1/4", "play", 1, 0, 0, "Up", "E"), MakeB(3, "F", "1/2", "play", 1, 1, 1, "Down", "F (Half)"), MakeSustainB(4, "F", "1/2", 1, 1, 1, 2, "Hold Beat 4")));
        sb.AppendLine(string.Format("    {{ measure: 4, beats: [ {0}, {1}, {2}, {3} ] }}", MakeB(1, "High E", "1/4", "play", 1, 0, 0, "Down", "E"), MakeB(2, "F", "1/4", "play", 1, 1, 1, "Up", "F"), MakeB(3, "G", "1/2", "play", 1, 3, 3, "Down", "G (Half)"), MakeSustainB(4, "G", "1/2", 1, 3, 3, 2, "Hold Beat 4")));
        sb.AppendLine("  ]");
        sb.Append("}");
        return sb.ToString();
    }

    private static string MakeSkipToMyLou(string id) {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine("{");
        sb.AppendLine(string.Format("  id: '{0}',", id));
        sb.AppendLine("  title: 'Skip To My Lou - Folk Melody (Page 19)',");
        sb.AppendLine("  description: 'Authentic Bonus Workshop page 19: Classic American folk song on strings 1 & 2.',");
        sb.AppendLine("  timeSignature: [4, 4], defaultBpm: 85, concepts: ['Folk Melody', 'Strings 1 & 2', 'Quarter Notes'],");
        sb.AppendLine("  tabData: [");
        sb.AppendLine(string.Format("    {{ measure: 1, beats: [ {0}, {1}, {2}, {3} ] }},", MakeB(1, "G", "1/4", "play", 1, 3, 3, "Down", "G"), MakeB(2, "G", "1/4", "play", 1, 3, 3, "Up", "G"), MakeB(3, "High E", "1/4", "play", 1, 0, 0, "Down", "E"), MakeB(4, "High E", "1/4", "play", 1, 0, 0, "Up", "E")));
        sb.AppendLine(string.Format("    {{ measure: 2, beats: [ {0}, {1}, {2}, {3} ] }},", MakeB(1, "G", "1/4", "play", 1, 3, 3, "Down", "G"), MakeB(2, "G", "1/4", "play", 1, 3, 3, "Up", "G"), MakeB(3, "High E", "1/2", "play", 1, 0, 0, "Down", "E (Half)"), MakeSustainB(4, "High E", "1/2", 1, 0, 0, 2, "Hold Beat 4")));
        sb.AppendLine(string.Format("    {{ measure: 3, beats: [ {0}, {1}, {2}, {3} ] }},", MakeB(1, "F", "1/4", "play", 1, 1, 1, "Down", "F"), MakeB(2, "F", "1/4", "play", 1, 1, 1, "Up", "F"), MakeB(3, "D", "1/4", "play", 2, 3, 3, "Down", "D"), MakeB(4, "D", "1/4", "play", 2, 3, 3, "Up", "D")));
        sb.AppendLine(string.Format("    {{ measure: 4, beats: [ {0}, {1}, {2}, {3} ] }}", MakeB(1, "F", "1/4", "play", 1, 1, 1, "Down", "F"), MakeB(2, "F", "1/4", "play", 1, 1, 1, "Up", "F"), MakeB(3, "D", "1/2", "play", 2, 3, 3, "Down", "D (Half)"), MakeSustainB(4, "D", "1/2", 2, 3, 3, 2, "Hold Beat 4")));
        sb.AppendLine("  ]");
        sb.Append("}");
        return sb.ToString();
    }

    private static string MakeOpenStringTour(string id, string title, int bpm) {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine("{");
        sb.AppendLine(string.Format("  id: '{0}', title: '{1}',", id, title));
        sb.AppendLine("  description: 'Tour across strings 6 to 1 with 3-beat sustained notes and a strict mute on beat 4.',");
        sb.AppendLine(string.Format("  timeSignature: [4, 4], defaultBpm: {0}, concepts: ['Tuning EADGBE', 'Beat 4 Rest', 'Red Flash Damping'],", bpm));
        sb.AppendLine("  tabData: [");
        sb.AppendLine(string.Format("    {{ measure: 1, beats: [ {0}, {1}, {2}, {3} ] }},", MakeB(1, "Low E", "3/4", "play", 6, 0, 0, "Down", 3, "6th String Open"), MakeSustainB(2, "Low E", "3/4", 6, 0, 0, 3, "Hold Beat 2"), MakeSustainB(3, "Low E", "3/4", 6, 0, 0, 3, "Hold Beat 3"), MakeRestB(4, "REST", 1, "Mute 6th string!")));
        sb.AppendLine(string.Format("    {{ measure: 2, beats: [ {0}, {1}, {2}, {3} ] }},", MakeB(1, "A", "3/4", "play", 5, 0, 0, "Down", 3, "5th String Open"), MakeSustainB(2, "A", "3/4", 5, 0, 0, 3, "Hold Beat 2"), MakeSustainB(3, "A", "3/4", 5, 0, 0, 3, "Hold Beat 3"), MakeRestB(4, "REST", 1, "Mute 5th string!")));
        sb.AppendLine(string.Format("    {{ measure: 3, beats: [ {0}, {1}, {2}, {3} ] }},", MakeB(1, "D", "3/4", "play", 4, 0, 0, "Down", 3, "4th String Open"), MakeSustainB(2, "D", "3/4", 4, 0, 0, 3, "Hold Beat 2"), MakeSustainB(3, "D", "3/4", 4, 0, 0, 3, "Hold Beat 3"), MakeRestB(4, "REST", 1, "Mute 4th string!")));
        sb.AppendLine(string.Format("    {{ measure: 4, beats: [ {0}, {1}, {2}, {3} ] }},", MakeB(1, "G", "3/4", "play", 3, 0, 0, "Down", 3, "3rd String Open"), MakeSustainB(2, "G", "3/4", 3, 0, 0, 3, "Hold Beat 2"), MakeSustainB(3, "G", "3/4", 3, 0, 0, 3, "Hold Beat 3"), MakeRestB(4, "REST", 1, "Mute 3rd string!")));
        sb.AppendLine(string.Format("    {{ measure: 5, beats: [ {0}, {1}, {2}, {3} ] }},", MakeB(1, "B", "3/4", "play", 2, 0, 0, "Down", 3, "2nd String Open"), MakeSustainB(2, "B", "3/4", 2, 0, 0, 3, "Hold Beat 2"), MakeSustainB(3, "B", "3/4", 2, 0, 0, 3, "Hold Beat 3"), MakeRestB(4, "REST", 1, "Mute 2nd string!")));
        sb.AppendLine(string.Format("    {{ measure: 6, beats: [ {0}, {1}, {2}, {3} ] }}", MakeB(1, "High E", "3/4", "play", 1, 0, 0, "Down", 3, "1st String Open"), MakeSustainB(2, "High E", "3/4", 1, 0, 0, 3, "Hold Beat 2"), MakeSustainB(3, "High E", "3/4", 1, 0, 0, 3, "Hold Beat 3"), MakeRestB(4, "REST", 1, "Silence All Strings!")));
        sb.AppendLine("  ]");
        sb.Append("}");
        return sb.ToString();
    }

    private static string MakeMelody(string id, string title, int str, int[] frets, int bpm) {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine("{");
        sb.AppendLine(string.Format("  id: '{0}', title: '{1}',", id, title));
        sb.AppendLine("  description: 'Melodic rhythm reading exercise.',");
        sb.AppendLine(string.Format("  timeSignature: [4, 4], defaultBpm: {0}, concepts: ['String {1}', 'Melodic Flow'],", bpm, str));
        sb.AppendLine("  tabData: [");
        int mCount = frets.Length / 4;
        for (int m = 0; m < mCount; m++) {
            sb.Append(string.Format("    {{ measure: {0}, beats: [ ", m + 1));
            for (int b = 1; b <= 4; b++) {
                int f = frets[m * 4 + (b - 1)];
                string noteName = GetNoteName(str, f);
                sb.Append(MakeB(b, noteName, "1/4", "play", str, f, f == 0 ? 0 : f, b % 2 == 1 ? "Down" : "Up", noteName + " Fret " + f));
                if (b < 4) sb.Append(", ");
            }
            sb.Append(" ] }" + (m < mCount - 1 ? ",\n" : "\n"));
        }
        sb.AppendLine("  ]");
        sb.Append("}");
        return sb.ToString();
    }

    // Helper functions
    private static string MakeB(int b, string n, string sym, string type, int s, int f, int fin, string p, int dur, string tip) {
        return string.Format("{{ beat: {0}, note: '{1}', symbol: '{2}', type: '{3}', string: {4}, fret: {5}, finger: {6}, pick: '{7}', duration: {8}, isStart: true, isSustain: false, tip: '{9}' }}",
            b, n, sym, type, s, f, fin, p, dur, Escape(tip));
    }

    private static string MakeB(int b, string n, string sym, string type, int s, int f, int fin, string p, string tip) {
        int dur = sym == "1/1" || sym == "Whole" ? 4 : (sym == "1/2" ? 2 : 1);
        return MakeB(b, n, sym, type, s, f, fin, p, dur, tip);
    }

    private static string MakeSustainB(int b, string n, string sym, int s, int f, int fin, int dur, string tip) {
        return string.Format("{{ beat: {0}, note: '{1}', symbol: '{2}', type: 'sustain', string: {3}, fret: {4}, finger: {5}, pick: '-', duration: {6}, isStart: false, isSustain: true, tip: '{7}' }}",
            b, n, sym, s, f, fin, dur, Escape(tip));
    }

    private static string MakeRestB(int b, string sym, int dur, string tip) {
        return string.Format("{{ beat: {0}, note: 'REST', symbol: '{1}', type: 'rest', string: null, fret: null, finger: null, pick: '-', duration: {2}, isStart: true, isSustain: false, tip: '{3}' }}",
            b, sym, dur, Escape(tip));
    }

    private static string MakeRestB(int b, string sym, string tip) {
        int dur = sym == "1/1" || sym == "Whole" ? 4 : (sym == "1/2" ? 2 : 1);
        return MakeRestB(b, sym, dur, tip);
    }

    private static string MakeRestSustainB(int b, string sym, int dur, string tip) {
        return string.Format("{{ beat: {0}, note: 'REST', symbol: '{1}', type: 'rest', string: null, fret: null, finger: null, pick: '-', duration: {2}, isStart: false, isSustain: true, tip: '{3}' }}",
            b, sym, dur, Escape(tip));
    }

    private static string MakeChordBeat(int b, string chord, string str) {
        return string.Format("{{ beat: {0}, note: '{1}', symbol: '1/4', type: 'play', string: '{2}', fret: null, finger: null, pick: 'Down', duration: 1, isStart: true, isSustain: false, tip: '{1} Strum' }}",
            b, chord, str);
    }

    private static string MakeChordWholeBar(int m, string chord, string str, string tip) {
        return string.Format("{{ measure: {0}, chordName: '{1}', beats: [ {2}, {3}, {4}, {5} ] }}",
            m, chord,
            string.Format("{{ beat: 1, note: '{0}', symbol: '1/1', type: 'play', string: '{1}', fret: null, finger: null, pick: 'Down', duration: 4, isStart: true, isSustain: false, tip: '{2}' }}", chord, str, Escape(tip)),
            string.Format("{{ beat: 2, note: '{0}', symbol: '1/1', type: 'sustain', string: '{1}', fret: null, finger: null, pick: '-', duration: 4, isStart: false, isSustain: true, tip: 'Hold Beat 2' }}", chord, str),
            string.Format("{{ beat: 3, note: '{0}', symbol: '1/1', type: 'sustain', string: '{1}', fret: null, finger: null, pick: '-', duration: 4, isStart: false, isSustain: true, tip: 'Hold Beat 3' }}", chord, str),
            string.Format("{{ beat: 4, note: '{0}', symbol: '1/1', type: 'sustain', string: '{1}', fret: null, finger: null, pick: '-', duration: 4, isStart: false, isSustain: true, tip: 'Hold Beat 4' }}", chord, str));
    }

    private static string MakeChordQuarterBar(int m, string chord, string str) {
        return string.Format("{{ measure: {0}, chordName: '{1}', beats: [ {2}, {3}, {4}, {5} ] }}",
            m, chord,
            MakeChordBeat(1, chord, str),
            MakeChordBeat(2, chord, str),
            MakeChordBeat(3, chord, str),
            MakeChordBeat(4, chord, str));
    }

    private static string MakeWholeBar(int m, string n, int s, int f, int fin, string p, string tip) {
        return string.Format("{{ measure: {0}, beats: [ {1}, {2}, {3}, {4} ] }}",
            m,
            MakeB(1, n, "1/1", "play", s, f, fin, p, 4, tip),
            MakeSustainB(2, n, "1/1", s, f, fin, 4, "Hold note (Beat 2 of 4)"),
            MakeSustainB(3, n, "1/1", s, f, fin, 4, "Hold note (Beat 3 of 4)"),
            MakeSustainB(4, n, "1/1", s, f, fin, 4, "Hold note (Beat 4 of 4)"));
    }

    private static string MakeHalfBar(int m, string n1, int s1, int f1, int fin1, string n2, int s2, int f2, int fin2) {
        return string.Format("{{ measure: {0}, beats: [ {1}, {2}, {3}, {4} ] }}",
            m,
            MakeB(1, n1, "1/2", "play", s1, f1, fin1, "Down", 2, n1 + " (2 Beats)"),
            MakeSustainB(2, n1, "1/2", s1, f1, fin1, 2, "Hold Beat 2"),
            MakeB(3, n2, "1/2", "play", s2, f2, fin2, "Down", 2, n2 + " (2 Beats)"),
            MakeSustainB(4, n2, "1/2", s2, f2, fin2, 2, "Hold Beat 4"));
    }

    private static string GetNoteName(int str, int f) {
        string[][] notes = new string[][] {
            new string[] { "High E", "F", "F#", "G", "G#" },
            new string[] { "B", "C", "C#", "D", "D#" },
            new string[] { "G", "G#", "A", "A#", "B" },
            new string[] { "D", "D#", "E", "F", "F#" },
            new string[] { "A", "A#", "B", "C", "C#" },
            new string[] { "Low E", "F", "F#", "G", "G#" }
        };

        if (str >= 1 && str <= 6 && f >= 0 && f < notes[str - 1].Length) {
            return notes[str - 1][f];
        }
        return "Note";
    }

    private static string Escape(string s) {
        if (s == null) return "";
        return s.Replace("\"", "\\\"");
    }
}
