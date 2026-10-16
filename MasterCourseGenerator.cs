using System;
using System.IO;
using System.Text;
using System.Collections.Generic;

public class MasterCourseGenerator {
    public static void Main(string[] args) {
        string outFile = args.Length > 0 ? args[0] : "exercises.js";
        Generate(outFile);
        Console.WriteLine("MasterCourseGenerator complete: " + outFile);
    }

    public static void Generate(string outFile) {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine("// Steve Krenz - Learn & Master Guitar Official Course Companion");
        sb.AppendLine("// Complete 20 Lesson Sessions & 20 Bonus Workshops");
        sb.AppendLine("// 100% Faithful to Official Lesson Book and Bonus Workshop Book Tables of Contents\n");
        sb.AppendLine("export const GUITAR_COURSES = {");

        // 1. LESSON BOOK
        sb.AppendLine("  lessonBook: [");
        for (int s = 1; s <= 20; s++) {
            BuildLessonSession(sb, s);
            if (s < 20) sb.AppendLine(",");
        }
        sb.AppendLine("\n  ],");

        // 2. BONUS WORKSHOP BOOK
        sb.AppendLine("  bonusWorkshop: [");
        for (int w = 1; w <= 20; w++) {
            BuildBonusWorkshop(sb, w);
            if (w < 20) sb.AppendLine(",");
        }
        sb.AppendLine("\n  ],");

        // 3. FREE METRONOME
        sb.AppendLine("  freeMetronome: {");
        sb.AppendLine("    id: 'free-metronome',");
        sb.AppendLine("    title: 'Guitar Studio Free Metronome',");
        sb.AppendLine("    timeSignature: [4, 4],");
        sb.AppendLine("    defaultBpm: 60,");
        sb.AppendLine("    description: 'Unrestricted studio metronome. All 4 beats play by default. Click any beat cell to toggle between Play and Rest.',");
        sb.AppendLine("    concepts: ['Unrestricted Tempo (30-240 BPM)', 'Click-to-Toggle Rest Beats', 'Green Note / Red Rest Alerts', 'Precision Practice HUD'],");
        sb.AppendLine("    tabData: [");
        sb.AppendLine("      {");
        sb.AppendLine("        measure: 1,");
        sb.AppendLine("        beats: [");
        sb.AppendLine("          { beat: 1, note: 'Beat 1', symbol: '1/4', type: 'play', string: 6, fret: 0, finger: 0, pick: 'Down', duration: 1, isStart: true, isSustain: false, tip: 'Primary Downbeat' },");
        sb.AppendLine("          { beat: 2, note: 'Beat 2', symbol: '1/4', type: 'play', string: 5, fret: 0, finger: 0, pick: 'Up', duration: 1, isStart: true, isSustain: false, tip: 'Upbeat pulse' },");
        sb.AppendLine("          { beat: 3, note: 'Beat 3', symbol: '1/4', type: 'play', string: 4, fret: 0, finger: 0, pick: 'Down', duration: 1, isStart: true, isSustain: false, tip: 'Secondary downbeat' },");
        sb.AppendLine("          { beat: 4, note: 'Beat 4', symbol: '1/4', type: 'play', string: 3, fret: 0, finger: 0, pick: 'Up', duration: 1, isStart: true, isSustain: false, tip: 'Pickup pulse' }");
        sb.AppendLine("        ]");
        sb.AppendLine("      }");
        sb.AppendLine("    ]");
        sb.AppendLine("  }");
        sb.AppendLine("};");

        File.WriteAllText(outFile, sb.ToString(), Encoding.ASCII);
    }

    // =========================================================================
    // LESSON BOOK SESSIONS 1-20
    // =========================================================================
    private static void BuildLessonSession(StringBuilder sb, int s) {
        sb.AppendLine("    {");
        sb.AppendLine(string.Format("      sessionNumber: {0},", s));
        sb.AppendLine(string.Format("      sessionTitle: \"Session {0}: {1}\",", s, Escape(GetLessonTitle(s))));
        sb.AppendLine(string.Format("      sessionSubtitle: \"{0}\",", Escape(GetLessonSubtitle(s))));
        sb.AppendLine("      topics: [");
        BuildLessonTopics(sb, s);
        sb.AppendLine("      ]");
        sb.Append("    }");
    }

    private static string GetLessonTitle(int s) {
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
            case 19: return "Soloing";
            case 20: return "All the Chords You Need To Know";
            default: return "Session " + s;
        }
    }

    private static string GetLessonSubtitle(int s) {
        switch (s) {
            case 1: return "String Names, Tuning, Finger Exercises 1-5, C & G7 Chords (p. 2)";
            case 2: return "Music Reading, 1st & 2nd Strings, Note Values, Rests, Ode to Joy & Jingle Bells (p. 7)";
            case 3: return "Ties, Dots, Repeat Signs, Eighth Note Exercises 1-6, Yankee Doodle, Saints & Aura Lee (p. 16)";
            case 4: return "5th & 6th Strings, Sharps, Flats, Naturals, Minuet in C/G, Simple Gifts, Star-Spangled Banner (p. 23)";
            case 5: return "Open Chords & Exercises 1-7, Morning Has Broken, America the Beautiful (p. 31)";
            case 6: return "Minor 7th & Suspended Chords, Strumming Patterns, Scarborough Fair, Greensleeves, Wind Bound (p. 37)";
            case 7: return "Root 6 Barre Chords, Chromatics, Major Scales, Home on the Range, Yellow Rose of Texas (p. 43)";
            case 8: return "Root 5 Barre Chords, Key Signatures, Relative Minor, Jamaica Farewell in F & G (p. 49)";
            case 9: return "Strumming Technique, The Motor Motion, Intervals, La Bamba, The Water is Wide, Blues in E (p. 57)";
            case 10: return "Fingerstyle P-I-M-A Technique, Arpeggios, House of the Rising Sun, Canon in D (p. 63)";
            case 11: return "Pentatonic Scales, Forms & Patterns, A Minor Blues, G Major, Around the Pentatonic World (p. 69)";
            case 12: return "Two Chords, Major 7th, Minor 11th, Chord Substitution, Suspended Smooth, Acoustic Groove (p. 73)";
            case 13: return "Blues Scale, Minor Pentatonic with Blues Notes, Triads, Jammin' the Blues, Johnny's E Blues (p. 77)";
            case 14: return "Sliding, Bends, Harmonics, Hammer-ons, Pull-offs, Bending the Blues, Jazz Octaves, Funky Mute (p. 82)";
            case 15: return "Power Chords, Chicken Pickin', Country Bends, Sliding 4ths, Power Chord Rock, Rockin' (p. 86)";
            case 16: return "16th Notes, Scratching, Funk Strumming, Rolling Along, Pop Ballad Groove, Electric Funk (p. 90)";
            case 17: return "Notes on a String, Octaves, 7th Chords, Triplet Scale, A Little Bit Rockin', 5th Fret Blues (p. 95)";
            case 18: return "Jazz Chords, Progressions, Freddie Green Voicings, Swingin' the Blues (p. 99)";
            case 19: return "Soloing Techniques, Ear Training Exercises 1-3, Steve's Jam (p. 104)";
            case 20: return "Chord Formulas, Abbreviations, Inversions, Chord Exercises 1 & 2, Friend, Funky Groove (p. 108)";
            default: return "Steve Krenz Master Guitar Curriculum";
        }
    }

    private static string GetBonusTitle(int w) {
        switch (w) {
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
            case 11: return "Pentatonic Scales - The Foundation of Soloing";
            case 12: return "Advanced Chords";
            case 13: return "Playing the Blues";
            case 14: return "Giving Your Playing Some Style";
            case 15: return "Electric Guitars - The Heart of Rock & Roll";
            case 16: return "Advanced Strumming";
            case 17: return "Going Beyond the First Position";
            case 18: return "Jazz";
            case 19: return "Soloing";
            case 20: return "All the Chords You Need To Know";
            default: return "Workshop " + w;
        }
    }

    private static string GetBonusSubtitle(int w) {
        switch (w) {
            case 1: return "Finger Exercises 1-3 Across All Strings, Alternating Finger Exercise, C & G7 Chord Exercise (p. 3-9)";
            case 2: return "1st & 2nd String Exercises, Rests, London Bridge is Falling Down, Skip To My Lou (p. 10-19)";
            case 3: return "3rd & 4th String Exercises, Ties, Dots & Rests!, Amazing Grace, We Wish You A Merry Christmas (p. 20-28)";
            case 4: return "5th & 6th Strings, Sharps, Flats & Naturals, Fur Elise, The Entertainer, Am & E Chord Exercise (p. 29-38)";
            case 5: return "Open Chords Groupings, All Basic Open Chords, He's a Jolly Good Fellow, Turkey in the Straw (p. 39-46)";
            case 6: return "Open Minor 7th & Suspended Chords, Strumming Patterns #1, #2, #3 Practice (p. 47-53)";
            case 7: return "6th String Barre Chords, Major Scales Worksheets, The Ultimate Major Scale Mix Up (p. 54-62)";
            case 8: return "5th String Barre Chords, Mixed Barre Chords, Key Signatures Worksheet & Flashcards (p. 63-71)";
            case 9: return "Strumming with 8th Notes & Ties, Diatonic & Harmonic Intervals, Ultimate Interval Challenge (p. 74-87)";
            case 10: return "Correct Fingerstyle Hand Position, Finger Patterns #1-3, Dm Etude, Canon in D Revised (p. 88-98)";
            case 11: return "Pentatonic Scales Worksheet & Ultimate Mix Up, Connected Pentatonic Boxes C, Am, Fm, Ab (p. 100-106)";
            case 12: return "Two Chord Exercises & Modern Voicing Transitions (p. 108-110)";
            case 13: return "Pentatonic Blues Forms in A, Triads & Triads Worksheets (p. 111-116)";
            case 14: return "Sliding Exercises & Arpeggio Exercises (p. 117-120)";
            case 15: return "Power Chord Exercises & Harmonized Major Scales Worksheet (p. 124-127)";
            case 16: return "Basic Strumming Exercises & Advanced 16th Note Strumming Exercises (p. 128-131)";
            case 17: return "3-Note on a String Scales in F, D, Bb with Hammer-Ons, Seventh Chords Worksheet (p. 132-145)";
            case 18: return "Chord Melody, Color Tones, ii-V Progressions, Ninth Chords Table & Worksheets (p. 146-153)";
            case 19: return "Building a Solo from the Ground Up (p. 154-156)";
            case 20: return "Chords Bonus Exercises (p. 159-161)";
            default: return "Steve Krenz Bonus Workshop Book Curriculum";
        }
    }

    // =========================================================================
    // BUILD LESSON TOPICS (SESSIONS 1-20)
    // =========================================================================
    private static void BuildLessonTopics(StringBuilder sb, int s) {
        if (s == 1) {
            BuildLesson1(sb);
        } else if (s == 2) {
            BuildLesson2(sb);
        } else if (s == 3) {
            BuildLesson3(sb);
        } else if (s == 4) {
            BuildLesson4(sb);
        } else if (s == 5) {
            BuildLesson5(sb);
        } else if (s == 6) {
            BuildLesson6(sb);
        } else if (s == 7) {
            BuildLesson7(sb);
        } else if (s == 8) {
            BuildLesson8(sb);
        } else if (s == 9) {
            BuildLesson9(sb);
        } else if (s == 10) {
            BuildLesson10(sb);
        } else if (s == 11) {
            BuildLesson11(sb);
        } else if (s == 12) {
            BuildLesson12(sb);
        } else if (s == 13) {
            BuildLesson13(sb);
        } else if (s == 14) {
            BuildLesson14(sb);
        } else if (s == 15) {
            BuildLesson15(sb);
        } else if (s == 16) {
            BuildLesson16(sb);
        } else if (s == 17) {
            BuildLesson17(sb);
        } else if (s == 18) {
            BuildLesson18(sb);
        } else if (s == 19) {
            BuildLesson19(sb);
        } else if (s == 20) {
            BuildLesson20(sb);
        }
    }

    // SESSION 1 (Exact Lesson Book Engravings p. 2-6)
    private static void BuildLesson1(StringBuilder sb) {
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"String Names, Tuning & Open Strings (p. 2)\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            " + MakeOpenStringTour("lb-s1-tour", "Open String Tour (E-A-D-G-B-E) with Beat 4 Damping", 60));
        sb.AppendLine("          ]");
        sb.AppendLine("        },");
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Finger Exercises 1-5 (Lesson Book p. 4-5)\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            " + MakeFingerEx("lb-s1-fe1", "Finger Exercise 1: 1-1-1-1 2-2-2-2 (4 picks per finger, Down-Up)", 1, new int[]{1,1,1,1, 2,2,2,2, 3,3,3,3, 4,4,4,4}, 60) + ",");
        sb.AppendLine("            " + MakeFingerEx("lb-s1-fe2", "Finger Exercise 2: 1-1 2-2 3-3 4-4 (2 picks per finger, Down-Up)", 1, new int[]{1,1, 2,2, 3,3, 4,4, 3,3, 2,2, 1,1, 1,1}, 60) + ",");
        sb.AppendLine("            " + MakeMultiStringMelody("lb-s1-fe3", "Finger Exercise 3: 1-2-3-4-3-2-1 (1 pick per finger, All Downstrokes)", 60, new string[]{
            "F:1:1:quarter","F#:1:2:quarter","G:1:3:quarter","G#:1:4:quarter",
            "G:1:3:quarter","F#:1:2:quarter","F:1:1:half"
        }) + ",");
        sb.AppendLine("            " + MakeFingerEx("lb-s1-fe4", "Finger Exercise 4: 1-2-1-3-1-4-1-3-1-2-1 (1st String)", 1, new int[]{1,2,1,3, 1,4,1,3, 1,2,1,2}, 60) + ",");
        sb.AppendLine("            " + MakeFingerEx("lb-s1-fe5", "Finger Exercise 5: 4-3-4-2-4-1 Reverse Stretch (6th String)", 6, new int[]{4,3,4,2, 4,1,4,3, 4,2,4,1}, 65));
        sb.AppendLine("          ]");
        sb.AppendLine("        },");
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"The C and G7 Chords (Lesson Book p. 6)\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            " + MakeChordEx("lb-s1-ch1", "Chord Exercise 1: C & G7 Whole-Note Diamonds (5 Bars)", 60, new string[]{"C:5-1", "G7:all", "C:5-1", "G7:all", "C:5-1"}, 4, "Whole") + ",");
        sb.AppendLine("            " + MakeChordEx("lb-s1-ch2", "Chord Exercise 2: C & G7 Four Strums Per Measure", 65, new string[]{"C:5-1", "G7:all", "C:5-1", "G7:all"}, 4, "Quarter") + ",");
        sb.AppendLine("            " + MakeChordEx("lb-s1-ch3", "Chord Exercise 3: 6-Bar C & G7 Progression", 70, new string[]{"C:5-1", "C:5-1", "G7:all", "C:5-1", "G7:all", "C:5-1"}, 4, "Quarter"));
        sb.AppendLine("          ]");
        sb.AppendLine("        }");
    }

    // SESSION 2 (100% Complete & Exact Lesson Book Engravings p. 9-15)
    private static void BuildLesson2(StringBuilder sb) {
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"First String Exercises (E - F - G) (Lesson Book p. 9-10)\",");
        sb.AppendLine("          exercises: [");
        // Page 9 Ex 1: 7 Whole-Note bars: E, F, G, F, E, G, E
        sb.AppendLine("            " + MakeMelody("lb-s2-str1-ex1", "Exercise 1: First String Whole Notes (7 Bars: E, F, G)", 1, new int[]{0,1,3,1,0,3,0}, 60, "Whole") + ",");
        // Page 9 Ex 2: 4 Half-Note bars: E-F | E-G | F-G | F-E
        sb.AppendLine("            " + MakeMelody("lb-s2-str1-ex2", "Exercise 2: First String Half Notes (4 Bars)", 1, new int[]{0,1, 0,3, 1,3, 1,0}, 65, "Half") + ",");
        // Page 9 Ex 3: 5 Bars mixing Quarter, Half, and Whole notes
        sb.AppendLine("            " + MakeMultiStringMelody("lb-s2-str1-ex3", "Exercise 3: First String Quarter, Half & Whole Notes (5 Bars)", 65, new string[]{
            "High E:1:0:quarter","High E:1:0:quarter","F:1:1:quarter","F:1:1:quarter",
            "G:1:3:quarter","F:1:1:quarter","High E:1:0:half",
            "High E:1:0:quarter","F:1:1:quarter","G:1:3:half",
            "G:1:3:quarter","F:1:1:quarter","High E:1:0:quarter","F:1:1:quarter",
            "High E:1:0:whole"
        }) + ",");
        // Page 9 Ex 4: 6 Bars mixing Quarter and Half notes
        sb.AppendLine("            " + MakeMultiStringMelody("lb-s2-str1-ex4", "Exercise 4: First String Mixed Rhythm (6 Bars)", 65, new string[]{
            "G:1:3:quarter","High E:1:0:quarter","F:1:1:half",
            "High E:1:0:quarter","High E:1:0:quarter","High E:1:0:half",
            "F:1:1:quarter","F:1:1:quarter","F:1:1:half",
            "High E:1:0:quarter","High E:1:0:quarter","High E:1:0:half",
            "G:1:3:quarter","F:1:1:quarter","High E:1:0:quarter","F:1:1:quarter",
            "G:1:3:quarter","High E:1:0:quarter","G:1:3:half"
        }) + ",");
        // Page 10: More First String Exercises (Sight-Reading without TAB)
        sb.AppendLine("            " + MakeMultiStringMelody("lb-s2-m1-ex1", "More First String Exercises 1 & 2 (Sight-Reading p. 10)", 65, new string[]{
            "High E:1:0:quarter","F:1:1:quarter","G:1:3:quarter","F:1:1:quarter",
            "High E:1:0:half","G:1:3:half",
            "F:1:1:quarter","High E:1:0:quarter","F:1:1:quarter","G:1:3:quarter",
            "High E:1:0:whole"
        }) + ",");
        sb.AppendLine("            " + MakeMultiStringMelody("lb-s2-m1-ex2", "More First String Exercises 3, 4 & 5 (Sight-Reading p. 10)", 68, new string[]{
            "G:1:3:quarter","F:1:1:quarter","High E:1:0:quarter","G:1:3:quarter",
            "F:1:1:half","High E:1:0:half",
            "High E:1:0:quarter","G:1:3:quarter","F:1:1:quarter","High E:1:0:quarter",
            "G:1:3:whole"
        }));
        sb.AppendLine("          ]");
        sb.AppendLine("        },");

        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Second String Exercises (B - C - D) (Lesson Book p. 11)\",");
        sb.AppendLine("          exercises: [");
        // Page 11 Ex 1: 7 Whole-Note bars: B, C, D, B, D, B, C
        sb.AppendLine("            " + MakeMelody("lb-s2-str2-ex1", "Exercise 1: Second String Whole Notes (7 Bars: B, C, D)", 2, new int[]{0,1,3,0,3,0,1}, 60, "Whole") + ",");
        // Page 11 Ex 2: 4 Half-Note bars: B-C | B-D | C-D | C-B
        sb.AppendLine("            " + MakeMelody("lb-s2-str2-ex2", "Exercise 2: Second String Half Notes (4 Bars)", 2, new int[]{0,1, 0,3, 1,3, 1,0}, 65, "Half") + ",");
        // Page 11 Ex 3: 5 Bars mixing Quarter, Half, and Whole notes
        sb.AppendLine("            " + MakeMultiStringMelody("lb-s2-str2-ex3", "Exercise 3: Second String Quarter, Half & Whole Notes (5 Bars)", 65, new string[]{
            "B:2:0:quarter","B:2:0:quarter","C:2:1:quarter","C:2:1:quarter",
            "D:2:3:quarter","C:2:1:quarter","B:2:0:half",
            "B:2:0:quarter","C:2:1:quarter","D:2:3:half",
            "D:2:3:quarter","C:2:1:quarter","B:2:0:quarter","C:2:1:quarter",
            "D:2:3:whole"
        }) + ",");
        // Page 11 Ex 4: 6 Bars mixing Quarter and Half notes
        sb.AppendLine("            " + MakeMultiStringMelody("lb-s2-str2-ex4", "Exercise 4: Second String Mixed Rhythm (6 Bars)", 65, new string[]{
            "D:2:3:quarter","B:2:0:quarter","C:2:1:half",
            "B:2:0:quarter","B:2:0:quarter","B:2:0:half",
            "C:2:1:quarter","C:2:1:quarter","C:2:1:half",
            "B:2:0:quarter","B:2:0:quarter","B:2:0:half",
            "D:2:3:quarter","C:2:1:quarter","B:2:0:quarter","C:2:1:quarter",
            "D:2:3:quarter","B:2:0:quarter","D:2:3:half"
        }) + ",");
        // Page 11 bottom: More Second String Exercises (Sight-Reading without TAB)
        sb.AppendLine("            " + MakeMultiStringMelody("lb-s2-m2-ex1", "More Second String Exercises 1-5 (Sight-Reading p. 11)", 65, new string[]{
            "B:2:0:quarter","C:2:1:quarter","D:2:3:quarter","C:2:1:quarter",
            "B:2:0:half","D:2:3:half",
            "D:2:3:quarter","C:2:1:quarter","B:2:0:quarter","D:2:3:quarter",
            "C:2:1:whole"
        }));
        sb.AppendLine("          ]");
        sb.AppendLine("        },");

        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"First & Second String Combined (Lesson Book p. 12)\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            " + MakeMultiStringMelody("lb-s2-comb-ex1", "Combined Exercise 1: Ascending & Descending (p. 12)", 65, new string[]{
            "High E:1:0:quarter","F:1:1:quarter","G:1:3:quarter","F:1:1:quarter",
            "High E:1:0:half","D:2:3:half",
            "C:2:1:quarter","D:2:3:quarter","High E:1:0:quarter","F:1:1:quarter",
            "C:2:1:whole"
        }) + ",");
        sb.AppendLine("            " + MakeMultiStringMelody("lb-s2-comb-ex2", "Combined Exercise 2: Melodic Arches (p. 12)", 65, new string[]{
            "C:2:1:quarter","C:2:1:quarter","High E:1:0:quarter","High E:1:0:quarter",
            "G:1:3:quarter","G:1:3:quarter","F:1:1:half",
            "F:1:1:quarter","High E:1:0:quarter","D:2:3:quarter","C:2:1:quarter",
            "B:2:0:whole"
        }) + ",");
        sb.AppendLine("            " + MakeMultiStringMelody("lb-s2-comb-ex3", "Combined Exercise 3: Stepwise Treble Flow (p. 12)", 65, new string[]{
            "B:2:0:quarter","C:2:1:quarter","D:2:3:quarter","High E:1:0:quarter",
            "F:1:1:quarter","G:1:3:quarter","F:1:1:quarter","High E:1:0:quarter",
            "D:2:3:quarter","C:2:1:quarter","B:2:0:half",
            "High E:1:0:whole"
        }));
        sb.AppendLine("          ]");
        sb.AppendLine("        },");

        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"More 1st & 2nd String Exercises with Rests (Lesson Book p. 13)\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            " + MakeMultiStringMelody("lb-s2-rest-ex1", "Exercise 1: Quarter Rests on Strings 1 & 2 (p. 13)", 65, new string[]{
            "High E:1:0:quarter","F:1:1:quarter","G:1:3:quarter","REST:0:0:quarter",
            "G:1:3:quarter","F:1:1:quarter","High E:1:0:quarter","REST:0:0:quarter",
            "D:2:3:quarter","C:2:1:quarter","B:2:0:quarter","REST:0:0:quarter",
            "C:2:1:quarter","D:2:3:quarter","High E:1:0:quarter","REST:0:0:quarter"
        }) + ",");
        sb.AppendLine("            " + MakeMultiStringMelody("lb-s2-rest-ex2", "Exercise 2: Half Rests (2 Beats Silence, p. 13)", 65, new string[]{
            "High E:1:0:quarter","F:1:1:quarter","REST:0:0:half",
            "G:1:3:quarter","High E:1:0:quarter","REST:0:0:half",
            "D:2:3:quarter","B:2:0:quarter","REST:0:0:half",
            "C:2:1:half","REST:0:0:half"
        }) + ",");
        sb.AppendLine("            " + MakeMultiStringMelody("lb-s2-rest-ex3", "Exercise 3: Alternating Quarter Rests & Whole Rest (p. 13)", 65, new string[]{
            "High E:1:0:quarter","REST:0:0:quarter","F:1:1:quarter","REST:0:0:quarter",
            "G:1:3:quarter","REST:0:0:quarter","High E:1:0:quarter","REST:0:0:quarter",
            "REST:0:0:whole",
            "C:2:1:quarter","D:2:3:quarter","High E:1:0:half"
        }));
        sb.AppendLine("          ]");
        sb.AppendLine("        },");

        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Repertoire Songs (Lesson Book p. 14-15)\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            " + MakeMultiStringMelody("lb-s2-song-ode", "Song: Ode to Joy - Full 16-Bar Arrangement (CD #1 Tracks 2, 3, 4)", 75, new string[]{
            // System 1
            "High E:1:0:quarter","High E:1:0:quarter","F:1:1:quarter","G:1:3:quarter",
            "G:1:3:quarter","F:1:1:quarter","High E:1:0:quarter","D:2:3:quarter",
            "C:2:1:quarter","C:2:1:quarter","D:2:3:quarter","High E:1:0:quarter",
            "High E:1:0:quarter","D:2:3:quarter","D:2:3:half",
            // System 2
            "High E:1:0:quarter","High E:1:0:quarter","F:1:1:quarter","G:1:3:quarter",
            "G:1:3:quarter","F:1:1:quarter","High E:1:0:quarter","D:2:3:quarter",
            "C:2:1:quarter","C:2:1:quarter","D:2:3:quarter","High E:1:0:quarter",
            "D:2:3:quarter","C:2:1:quarter","C:2:1:half",
            // System 3
            "D:2:3:quarter","D:2:3:quarter","High E:1:0:quarter","C:2:1:quarter",
            "D:2:3:quarter","F:1:1:quarter","High E:1:0:quarter","C:2:1:quarter",
            "D:2:3:quarter","F:1:1:quarter","High E:1:0:quarter","D:2:3:quarter",
            "C:2:1:quarter","D:2:3:quarter","D:2:3:half",
            // System 4
            "High E:1:0:quarter","High E:1:0:quarter","F:1:1:quarter","G:1:3:quarter",
            "G:1:3:quarter","F:1:1:quarter","High E:1:0:quarter","D:2:3:quarter",
            "C:2:1:quarter","C:2:1:quarter","D:2:3:quarter","High E:1:0:quarter",
            "D:2:3:quarter","C:2:1:quarter","C:2:1:half"
        }, 4, new string[]{"C","G7","C","G7", "C","G7","C","C", "G7","G7","G7","G7", "C","G7","C","C"}) + ",");
        sb.AppendLine("            " + MakeMultiStringMelody("lb-s2-song-jingle", "Song: Jingle Bells - Full 16-Bar Arrangement (CD #1 Tracks 5, 6, 7)", 80, new string[]{
            // System 1
            "High E:1:0:quarter","High E:1:0:quarter","High E:1:0:half",
            "High E:1:0:quarter","High E:1:0:quarter","High E:1:0:half",
            "High E:1:0:quarter","G:1:3:quarter","C:2:1:quarter","D:2:3:quarter",
            "High E:1:0:whole",
            // System 2
            "F:1:1:quarter","F:1:1:quarter","F:1:1:quarter","F:1:1:quarter",
            "F:1:1:quarter","High E:1:0:quarter","High E:1:0:quarter","High E:1:0:quarter",
            "High E:1:0:quarter","D:2:3:quarter","D:2:3:quarter","High E:1:0:quarter",
            "D:2:3:half","G:1:3:half",
            // System 3
            "High E:1:0:quarter","High E:1:0:quarter","High E:1:0:half",
            "High E:1:0:quarter","High E:1:0:quarter","High E:1:0:half",
            "High E:1:0:quarter","G:1:3:quarter","C:2:1:quarter","D:2:3:quarter",
            "High E:1:0:whole",
            // System 4
            "F:1:1:quarter","F:1:1:quarter","F:1:1:quarter","F:1:1:quarter",
            "F:1:1:quarter","High E:1:0:quarter","High E:1:0:quarter","High E:1:0:quarter",
            "G:1:3:quarter","G:1:3:quarter","F:1:1:quarter","D:2:3:quarter",
            "C:2:1:whole"
        }, 4, new string[]{"C","C","C","C", "G7","C","G7","G7", "C","C","C","C", "G7","C","G7","C"}));
        sb.AppendLine("          ]");
        sb.AppendLine("        }");
    }

    // SESSION 3: Notes on 3rd & 4th Strings, Ties, Dots, 8th Notes (Lesson Book p. 16-22)
    private static void BuildLesson3(StringBuilder sb) {
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Ties, Dots, Repeat Signs & Rests (Lesson Book p. 16)\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            " + MakeTiedExercise("lb-s3-ties-ex1", "Exercise 1: Ties Across Barlines", 65) + ",");
        sb.AppendLine("            " + MakeDottedWaltz("lb-s3-dot-ex1", "Exercise 2: Dotted Half Notes in 3/4 Time", 60) + ",");
        sb.AppendLine("            " + MakeRestExercise("lb-s3-rests-ex1", "Exercise 3: Quarter Rests & Damping", 65, 1));
        sb.AppendLine("          ]");
        sb.AppendLine("        },");
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Eighth Note Exercises 1-6 (Lesson Book p. 17 - Strings 1 & 2)\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            " + MakeMultiStringMelody("lb-s3-8th-ex1", "Exercise 1: Eighth Notes on 1st String (E & F)", 60, new string[]{
            "High E:1:0:quarter","High E:1:0:quarter","High E:1:0:eighth","High E:1:0:eighth","High E:1:0:eighth","High E:1:0:eighth",
            "High E:1:0:quarter","High E:1:0:quarter","High E:1:0:eighth","High E:1:0:eighth","High E:1:0:eighth","High E:1:0:eighth",
            "F:1:1:quarter","F:1:1:eighth","F:1:1:eighth","F:1:1:eighth","F:1:1:eighth","F:1:1:eighth","F:1:1:eighth",
            "F:1:1:quarter","F:1:1:eighth","F:1:1:eighth","High E:1:0:half"
        }, 4) + ",");
        sb.AppendLine("            " + MakeMultiStringMelody("lb-s3-8th-ex2", "Exercise 2: Eighth Pairs & Quarters with Rests (C, D, E)", 60, new string[]{
            "C:2:1:quarter","C:2:1:eighth","C:2:1:eighth","C:2:1:quarter","C:2:1:eighth","C:2:1:eighth",
            "D:2:3:eighth","D:2:3:eighth","D:2:3:eighth","D:2:3:eighth","D:2:3:quarter","REST:0:0:quarter",
            "High E:1:0:eighth","High E:1:0:eighth","High E:1:0:eighth","High E:1:0:eighth","High E:1:0:eighth","High E:1:0:eighth","High E:1:0:eighth","High E:1:0:eighth",
            "High E:1:0:quarter","REST:0:0:quarter","High E:1:0:half"
        }, 4) + ",");
        sb.AppendLine("            " + MakeMultiStringMelody("lb-s3-8th-ex3", "Exercise 3: Mixed Quarter, Eighth & Half Notes (Strings 1 & 2)", 60, new string[]{
            "C:2:1:eighth","C:2:1:eighth","C:2:1:eighth","C:2:1:eighth","C:2:1:half",
            "D:2:3:eighth","D:2:3:eighth","D:2:3:eighth","D:2:3:eighth","D:2:3:half",
            "C:2:1:quarter","D:2:3:quarter","High E:1:0:eighth","High E:1:0:eighth","High E:1:0:eighth","High E:1:0:eighth",
            "F:1:1:quarter","G:1:3:quarter","C:2:1:half"
        }, 4) + ",");
        sb.AppendLine("            " + MakeMultiStringMelody("lb-s3-8th-ex4", "Exercise 4: Ascending & Descending Eighth-Note Scale Run", 60, new string[]{
            "B:2:0:eighth","C:2:1:eighth","D:2:3:eighth","High E:1:0:eighth","F:1:1:eighth","G:1:3:eighth","F:1:1:eighth","High E:1:0:eighth",
            "D:2:3:eighth","C:2:1:eighth","B:2:0:eighth","C:2:1:eighth","D:2:3:eighth","High E:1:0:eighth","F:1:1:eighth","D:2:3:eighth",
            "B:2:0:eighth","C:2:1:eighth","D:2:3:quarter","High E:1:0:eighth","F:1:1:eighth","G:1:3:quarter",
            "C:2:1:whole"
        }, 4) + ",");
        sb.AppendLine("            " + MakeMultiStringMelody("lb-s3-8th-ex5", "Exercise 5: Scalewise Melodic Eighths with Half Notes", 60, new string[]{
            "B:2:0:eighth","C:2:1:eighth","D:2:3:eighth","High E:1:0:eighth","F:1:1:eighth","G:1:3:eighth","F:1:1:eighth","High E:1:0:eighth",
            "D:2:3:eighth","C:2:1:eighth","B:2:0:eighth","D:2:3:eighth","C:2:1:half",
            "B:2:0:eighth","C:2:1:eighth","D:2:3:eighth","High E:1:0:eighth","F:1:1:eighth","G:1:3:eighth","F:1:1:eighth","High E:1:0:eighth",
            "D:2:3:eighth","F:1:1:eighth","High E:1:0:eighth","D:2:3:eighth","C:2:1:half"
        }, 4) + ",");
        sb.AppendLine("            " + MakeMultiStringMelody("lb-s3-8th-ex6", "Exercise 6: Melodic Line with Quarter Rests", 60, new string[]{
            "G:1:3:quarter","High E:1:0:quarter","F:1:1:eighth","D:2:3:eighth","C:2:1:quarter",
            "REST:0:0:quarter","D:2:3:quarter","High E:1:0:eighth","C:2:1:eighth","B:2:0:quarter",
            "REST:0:0:quarter","C:2:1:quarter","REST:0:0:quarter","High E:1:0:quarter",
            "D:2:3:eighth","High E:1:0:eighth","F:1:1:eighth","G:1:3:eighth","C:2:1:quarter","REST:0:0:quarter"
        }, 4));
        sb.AppendLine("          ]");
        sb.AppendLine("        },");
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Third String Notes & Exercises (G - A) (Lesson Book p. 18)\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            " + MakeMelody("lb-s3-str3-ex1", "Exercise 1: 3rd String Whole Notes (7 Bars: G, A)", 3, new int[]{0,2,0,2,0,2,0}, 60, "Whole") + ",");
        sb.AppendLine("            " + MakeMelody("lb-s3-str3-ex2", "Exercise 2: 3rd String Half Notes (4 Bars)", 3, new int[]{0,2, 0,2, 2,0, 2,0}, 65, "Half") + ",");
        sb.AppendLine("            " + MakeMultiStringMelody("lb-s3-str3-ex3", "Exercise 3: 3rd String Quarter, Half & Whole Notes (5 Bars)", 65, new string[]{
            "G:3:0:quarter","G:3:0:quarter","A:3:2:quarter","A:3:2:quarter",
            "G:3:0:quarter","A:3:2:quarter","G:3:0:half",
            "A:3:2:quarter","G:3:0:quarter","A:3:2:half",
            "G:3:0:quarter","A:3:2:quarter","G:3:0:quarter","A:3:2:quarter",
            "G:3:0:whole"
        }) + ",");
        sb.AppendLine("            " + MakeMultiStringMelody("lb-s3-str3-ex4", "Exercise 4: More Third String Exercises (Sight-Reading p. 18)", 65, new string[]{
            "A:3:2:quarter","G:3:0:quarter","A:3:2:half",
            "G:3:0:quarter","G:3:0:quarter","A:3:2:half",
            "A:3:2:quarter","G:3:0:quarter","A:3:2:quarter","G:3:0:quarter",
            "A:3:2:whole"
        }));
        sb.AppendLine("          ]");
        sb.AppendLine("        },");
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Fourth String Notes & Exercises (D - E - F) (Lesson Book p. 19-20)\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            " + MakeMelody("lb-s3-str4-ex1", "Exercise 1: 4th String Whole Notes (7 Bars: D, E, F)", 4, new int[]{0,2,3,2,0,2,3}, 60, "Whole") + ",");
        sb.AppendLine("            " + MakeMelody("lb-s3-str4-ex2", "Exercise 2: 4th String Half Notes (4 Bars)", 4, new int[]{0,2, 3,2, 0,3, 2,0}, 65, "Half") + ",");
        sb.AppendLine("            " + MakeMultiStringMelody("lb-s3-str4-ex3", "Exercise 3: 4th String Quarter, Half & Whole Notes (5 Bars)", 65, new string[]{
            "D:4:0:quarter","D:4:0:quarter","E:4:2:quarter","E:4:2:quarter",
            "F:4:3:quarter","E:4:2:quarter","D:4:0:half",
            "D:4:0:quarter","E:4:2:quarter","F:4:3:half",
            "F:4:3:quarter","E:4:2:quarter","D:4:0:quarter","E:4:2:quarter",
            "D:4:0:whole"
        }) + ",");
        sb.AppendLine("            " + MakeMultiStringMelody("lb-s3-str4-ex4", "Exercise 4: More Fourth String Exercises (Sight-Reading p. 19)", 65, new string[]{
            "F:4:3:quarter","D:4:0:quarter","E:4:2:half",
            "D:4:0:quarter","E:4:2:quarter","F:4:3:half",
            "F:4:3:quarter","E:4:2:quarter","D:4:0:quarter","E:4:2:quarter",
            "F:4:3:whole"
        }) + ",");
        sb.AppendLine("            " + MakeMultiStringMelody("lb-s3-comb-ex1", "Third & Fourth String Combined Exercises (p. 20)", 65, new string[]{
            "D:4:0:quarter","E:4:2:quarter","F:4:3:quarter","G:3:0:quarter",
            "A:3:2:quarter","G:3:0:quarter","F:4:3:quarter","E:4:2:quarter",
            "D:4:0:half","G:3:0:half",
            "D:4:0:whole"
        }));
        sb.AppendLine("          ]");
        sb.AppendLine("        },");
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Repertoire Songs (Lesson Book p. 21-22)\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            " + MakeMultiStringMelody("lb-s3-song-yankee", "Song: Yankee Doodle (CD #1 Tracks 8, 9, 10)", 90, new string[]{
            "G:3:0:quarter","G:3:0:quarter","A:3:2:quarter","B:2:0:quarter",
            "G:3:0:quarter","B:2:0:quarter","A:3:2:half",
            "G:3:0:quarter","G:3:0:quarter","A:3:2:quarter","B:2:0:quarter",
            "G:3:0:half","D:4:0:half",
            "G:3:0:quarter","G:3:0:quarter","A:3:2:quarter","B:2:0:quarter",
            "C:2:1:quarter","B:2:0:quarter","A:3:2:quarter","G:3:0:quarter",
            "F#:4:4:quarter","D:4:0:quarter","E:4:2:quarter","F#:4:4:quarter",
            "G:3:0:half","G:3:0:half"
        }, 4, new string[]{"G","G","G","D7", "G","C","D7","G"}) + ",");
        sb.AppendLine("            " + MakeMultiStringMelody("lb-s3-song-saints", "Song: When the Saints Go Marchin' In (CD #1 Tracks 11, 12, 13)", 120, new string[]{
            "REST:0:0:quarter","C:2:1:quarter","High E:1:0:quarter","F:1:1:quarter",
            "G:1:3:whole",
            "REST:0:0:quarter","C:2:1:quarter","High E:1:0:quarter","F:1:1:quarter",
            "G:1:3:whole",
            "REST:0:0:quarter","C:2:1:quarter","High E:1:0:quarter","F:1:1:quarter",
            "G:1:3:half","High E:1:0:half",
            "C:2:1:half","High E:1:0:half",
            "D:2:3:whole",
            "REST:0:0:quarter","High E:1:0:quarter","High E:1:0:quarter","D:2:3:quarter",
            "C:2:1:half","C:2:1:quarter","High E:1:0:quarter",
            "G:1:3:half","F:1:1:half",
            "F:1:1:whole",
            "REST:0:0:quarter","C:2:1:quarter","High E:1:0:quarter","F:1:1:quarter",
            "G:1:3:half","High E:1:0:half",
            "D:2:3:half","D:2:3:half",
            "C:2:1:whole"
        }, 4, new string[]{"","C","","C", "","C","C","G7", "G7","C","F","F", "C","G7","G7","C"}) + ",");
        sb.AppendLine("            " + MakeMultiStringMelody("lb-s3-song-auralie", "Song: Aura Lee (CD #1 Tracks 14, 15, 16)", 90, new string[]{
            "G:3:0:quarter","C:2:1:quarter","B:2:0:quarter","C:2:1:quarter",
            "D:2:3:half","A:3:2:half",
            "C:2:1:quarter","B:2:0:quarter","A:3:2:quarter","B:2:0:quarter",
            "C:2:1:whole",
            "G:3:0:quarter","C:2:1:quarter","B:2:0:quarter","C:2:1:quarter",
            "D:2:3:half","A:3:2:half",
            "C:2:1:quarter","B:2:0:quarter","A:3:2:quarter","B:2:0:quarter",
            "C:2:1:whole",
            "High E:1:0:quarter","High E:1:0:quarter","High E:1:0:quarter","High E:1:0:quarter",
            "High E:1:0:half","D:2:3:half",
            "C:2:1:quarter","C:2:1:quarter","B:2:0:quarter","A:3:2:quarter",
            "B:2:0:whole",
            "G:3:0:quarter","C:2:1:quarter","B:2:0:quarter","C:2:1:quarter",
            "D:2:3:half","A:3:2:half",
            "C:2:1:quarter","B:2:0:quarter","A:3:2:quarter","B:2:0:quarter",
            "C:2:1:whole"
        }, 4, new string[]{"C","D7","G7","C", "C","D7","G7","C", "C","E7","Am","G7", "C","D7","G7","C"}));
        sb.AppendLine("          ]");
        sb.AppendLine("        }");
    }

    // SESSION 4: Notes on 5th & 6th Strings, Sharps, Flats, Naturals, Minuets (Lesson Book p. 23-30)
    private static void BuildLesson4(StringBuilder sb) {
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Fifth String Notes & Exercises (A - B - C) (Lesson Book p. 23)\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            " + MakeMelody("lb-s4-str5-ex1", "Exercise 1: 5th String Whole Notes (7 Bars: A, B, C)", 5, new int[]{0,2,3,2,0,2,3}, 60, "Whole") + ",");
        sb.AppendLine("            " + MakeMelody("lb-s4-str5-ex2", "Exercise 2: 5th String Half Notes (4 Bars)", 5, new int[]{0,2, 3,2, 0,3, 2,0}, 60, "Half") + ",");
        sb.AppendLine("            " + MakeMultiStringMelody("lb-s4-str5-ex3", "Exercise 3: 5th String Quarter, Half & Whole Notes (5 Bars)", 60, new string[]{
            "A:5:0:quarter","A:5:0:quarter","B:5:2:quarter","B:5:2:quarter",
            "C:5:3:quarter","B:5:2:quarter","A:5:0:half",
            "A:5:0:quarter","B:5:2:quarter","C:5:3:half",
            "C:5:3:quarter","B:5:2:quarter","A:5:0:quarter","B:5:2:quarter",
            "A:5:0:whole"
        }) + ",");
        sb.AppendLine("            " + MakeMultiStringMelody("lb-s4-str5-ex4", "Exercise 4: More Fifth String Exercises (Sight-Reading p. 23)", 60, new string[]{
            "C:5:3:quarter","A:5:0:quarter","B:5:2:half",
            "A:5:0:quarter","B:5:2:quarter","C:5:3:half",
            "C:5:3:quarter","B:5:2:quarter","A:5:0:quarter","B:5:2:quarter",
            "C:5:3:whole"
        }));
        sb.AppendLine("          ]");
        sb.AppendLine("        },");
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Sixth String Notes & Exercises (Low E - F - G) (Lesson Book p. 24-25)\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            " + MakeMelody("lb-s4-str6-ex1", "Exercise 1: 6th String Whole Notes (7 Bars: Low E, F, G)", 6, new int[]{0,1,3,1,0,1,3}, 60, "Whole") + ",");
        sb.AppendLine("            " + MakeMelody("lb-s4-str6-ex2", "Exercise 2: 6th String Half Notes (4 Bars)", 6, new int[]{0,1, 3,1, 0,3, 1,0}, 60, "Half") + ",");
        sb.AppendLine("            " + MakeMultiStringMelody("lb-s4-str6-ex3", "Exercise 3: 6th String Quarter, Half & Whole Notes (5 Bars)", 60, new string[]{
            "Low E:6:0:quarter","Low E:6:0:quarter","F:6:1:quarter","F:6:1:quarter",
            "G:6:3:quarter","F:6:1:quarter","Low E:6:0:half",
            "Low E:6:0:quarter","F:6:1:quarter","G:6:3:half",
            "G:6:3:quarter","F:6:1:quarter","Low E:6:0:quarter","F:6:1:quarter",
            "Low E:6:0:whole"
        }) + ",");
        sb.AppendLine("            " + MakeMultiStringMelody("lb-s4-str6-ex4", "Exercise 4: More Sixth String & Combined Bass Exercises (p. 24-25)", 60, new string[]{
            "Low E:6:0:quarter","F:6:1:quarter","G:6:3:quarter","A:5:0:quarter",
            "B:5:2:quarter","C:5:3:quarter","B:5:2:quarter","A:5:0:quarter",
            "G:6:3:half","F:6:1:half",
            "Low E:6:0:whole"
        }));
        sb.AppendLine("          ]");
        sb.AppendLine("        },");
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Sharps, Flats, Naturals & Am/E Chords (Lesson Book p. 27-28)\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            " + MakeMultiStringMelody("lb-s4-acc-ex1", "Exercise 1: Sharp (#) & Natural Signs (F#, C#, G#)", 65, new string[]{
            "Low E:6:0:quarter","F:6:1:quarter","F#:6:2:quarter","G:6:3:quarter",
            "A:5:0:quarter","A#:5:1:quarter","B:5:2:quarter","C:5:3:quarter",
            "C#:5:4:half","D:4:0:half",
            "Low E:6:0:whole"
        }) + ",");
        sb.AppendLine("            " + MakeMultiStringMelody("lb-s4-acc-ex2", "Exercise 2: Flat (b) & Natural Signs (Bb, Eb, Ab)", 65, new string[]{
            "A:5:0:quarter","A#:5:1:quarter","A:5:0:quarter","G:6:3:quarter",
            "D:4:0:quarter","D#:4:1:quarter","D:4:0:quarter","C:5:3:quarter",
            "Low E:6:0:whole"
        }) + ",");
        sb.AppendLine("            " + MakeChordEx("lb-s4-ch-am-e", "Am and E Open Chord Switch Workout", 65, new string[]{"Am:5-1", "E:all", "Am:5-1", "E:all"}));
        sb.AppendLine("          ]");
        sb.AppendLine("        },");
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Repertoire Songs (Lesson Book p. 26, 28-30)\",");
        sb.AppendLine("          exercises: [");
        // Minuet in C (Lesson Book p. 26 - with exact eighth notes from J.S. Bach / book engraving)
        sb.AppendLine("            " + MakeMultiStringMelody("lb-s4-song-minuet-c", "Song: Minuet in C (CD #1 Tracks 17, 18, 19)", 77, new string[]{
            "G:1:3:quarter","C:2:1:eighth","D:2:3:eighth","High E:1:0:eighth","F:1:1:eighth",
            "G:1:3:quarter","C:2:1:quarter","C:2:1:quarter",
            "A:3:2:quarter","F:1:1:quarter","C:2:1:quarter",
            "G:1:3:dotted-half",
            "F:1:1:quarter","D:2:3:eighth","High E:1:0:eighth","F:1:1:eighth","D:2:3:eighth",
            "High E:1:0:quarter","C:2:1:eighth","D:2:3:eighth","High E:1:0:eighth","C:2:1:eighth",
            "D:2:3:quarter","G:1:3:quarter","B:2:0:quarter",
            "C:2:1:dotted-half"
        }, 3, new string[]{"C","C","F","G", "Dm","C","G7","C"}) + ",");
        sb.AppendLine("            " + MakeMultiStringMelody("lb-s4-song-simple-gifts", "Song: Simple Gifts (CD #1 Tracks 20, 21, 22)", 70, new string[]{
            "D:4:0:quarter","G:3:0:quarter","G:3:0:quarter","A:3:2:quarter",
            "B:2:0:quarter","G:3:0:quarter","B:2:0:quarter","C:2:1:quarter",
            "D:2:3:quarter","D:2:3:quarter","C:2:1:quarter","B:2:0:quarter",
            "A:3:2:half","G:3:0:half",
            "D:4:0:quarter","G:3:0:quarter","G:3:0:quarter","A:3:2:quarter",
            "B:2:0:quarter","A:3:2:quarter","G:3:0:quarter","B:2:0:quarter",
            "A:3:2:quarter","A:3:2:quarter","B:2:0:quarter","A:3:2:quarter",
            "D:4:0:whole",
            "D:2:3:half","B:2:0:quarter","A:3:2:quarter",
            "B:2:0:half","G:3:0:half",
            "C:2:1:quarter","D:2:3:quarter","C:2:1:quarter","B:2:0:quarter",
            "A:3:2:half","G:3:0:half",
            "G:3:0:quarter","A:3:2:quarter","B:2:0:quarter","C:2:1:quarter",
            "D:2:3:quarter","C:2:1:quarter","B:2:0:quarter","A:3:2:quarter",
            "G:3:0:half","A:3:2:half",
            "G:3:0:whole"
        }, 4, new string[]{"G","G","C","G", "G","Em","D","D", "G","G","C","G", "G","D7","G","G"}) + ",");
        sb.AppendLine("            " + MakeMultiStringMelody("lb-s4-song-star-spangled", "Song: The Star-Spangled Banner (CD #1 Tracks 23, 24, 25)", 70, new string[]{
            "D:4:0:half","B:2:0:quarter",
            "G:3:0:quarter","B:2:0:quarter","D:2:3:quarter",
            "G:1:3:dotted-half",
            "High E:1:0:half","D:2:3:quarter",
            "B:2:0:quarter","C:2:1:quarter","D:2:3:quarter",
            "G:3:0:dotted-half",
            "D:4:0:quarter","D:4:0:quarter","G:3:0:quarter",
            "B:2:0:half","G:3:0:quarter",
            "D:4:0:half","B:2:0:quarter",
            "G:3:0:quarter","B:2:0:quarter","D:2:3:quarter",
            "G:1:3:dotted-half",
            "High E:1:0:half","D:2:3:quarter",
            "B:2:0:quarter","C:2:1:quarter","D:2:3:quarter",
            "G:3:0:dotted-half",
            "D:4:0:quarter","D:4:0:quarter","G:3:0:quarter",
            "B:2:0:dotted-half",
            "D:2:3:quarter","D:2:3:quarter","D:2:3:quarter",
            "High E:1:0:half","High E:1:0:quarter",
            "F#:1:2:quarter","High E:1:0:quarter","D:2:3:quarter",
            "D:2:3:quarter","C:2:1:quarter","B:2:0:quarter",
            "C:2:1:half","D:2:3:quarter",
            "High E:1:0:dotted-half",
            "D:2:3:quarter","B:2:0:quarter","G:3:0:quarter",
            "G:3:0:dotted-half"
        }, 3, new string[]{"G","D","G","C","G","D","G","G", "G","D","G","C","G","D","G","G", "G","G","D","D","G","C","G","G"}) + ",");
        sb.AppendLine("            " + MakeMultiStringMelody("lb-s4-song-minuet-g", "Song: Minuet in G (CD #1 Tracks 26, 27, 28)", 77, new string[]{
            "D:2:3:quarter","G:3:0:eighth","A:3:2:eighth","B:2:0:eighth","C:2:1:eighth",
            "D:2:3:quarter","G:3:0:quarter","G:3:0:quarter",
            "High E:1:0:quarter","C:2:1:eighth","D:2:3:eighth","High E:1:0:eighth","F#:1:2:eighth",
            "G:1:3:quarter","G:3:0:quarter","G:3:0:quarter",
            "C:2:1:quarter","D:2:3:eighth","C:2:1:eighth","B:2:0:eighth","A:3:2:eighth",
            "B:2:0:quarter","C:2:1:eighth","B:2:0:eighth","A:3:2:eighth","G:3:0:eighth",
            "F#:4:4:quarter","G:3:0:eighth","A:3:2:eighth","B:2:0:eighth","G:3:0:eighth",
            "A:3:2:dotted-half",
            "D:2:3:quarter","G:3:0:eighth","A:3:2:eighth","B:2:0:eighth","C:2:1:eighth",
            "D:2:3:quarter","G:3:0:quarter","G:3:0:quarter",
            "High E:1:0:quarter","C:2:1:eighth","D:2:3:eighth","High E:1:0:eighth","F#:1:2:eighth",
            "G:1:3:quarter","G:3:0:quarter","G:3:0:quarter",
            "C:2:1:quarter","D:2:3:eighth","C:2:1:eighth","B:2:0:eighth","A:3:2:eighth",
            "B:2:0:quarter","C:2:1:eighth","B:2:0:eighth","A:3:2:eighth","G:3:0:eighth",
            "A:3:2:quarter","B:2:0:eighth","A:3:2:eighth","G:3:0:eighth","F#:4:4:eighth",
            "G:3:0:dotted-half"
        }, 3, new string[]{"G","G","C","G", "C","G","D","D", "G","G","C","G", "C","G","D7","G"}));
        sb.AppendLine("          ]");
        sb.AppendLine("        }");
    }

    // SESSION 5: Basic Open Chords & Repertoire (Lesson Book p. 31-36)
    private static void BuildLesson5(StringBuilder sb) {
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Open Chords & Chord Exercises 1-7 (Lesson Book p. 31-34)\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            " + MakeChordEx("lb-s5-ch-c-g", "Chord Exercise 1: C, Am, Dm, G7 Progression", 65, new string[]{"C:5-1","Am:5-1","Dm:4-1","G7:all","C:5-1","Am:5-1","Dm:4-1","C:5-1"}) + ",");
        sb.AppendLine("            " + MakeChordEx("lb-s5-ch-g-d7", "Chord Exercise 2: G, Em, C, D7 Progression", 68, new string[]{"G:all","Em:all","C:5-1","D7:4-1","G:all","Em:all","D7:4-1","G:all"}) + ",");
        sb.AppendLine("            " + MakeChordEx("lb-s5-ch-d-a7", "Chord Exercise 3: D, G, A, A7 Progression", 70, new string[]{"D:4-1","G:all","D:4-1","A7:5-1","D:4-1","G:all","A7:5-1","D:4-1"}) + ",");
        sb.AppendLine("            " + MakeChordEx("lb-s5-ch-em-am", "Chord Exercise 4: Em, Am, D7, G Progression", 65, new string[]{"Em:all","Am:5-1","D7:4-1","G:all","Em:all","Am:5-1","B7:5-1","Em:all"}) + ",");
        sb.AppendLine("            " + MakeChordEx("lb-s5-ch-e-a", "Chord Exercise 5: A, D, E, E7 Progression", 70, new string[]{"A:5-1","D:4-1","A:5-1","E7:all","A:5-1","D:4-1","E7:all","A:5-1"}) + ",");
        sb.AppendLine("            " + MakeChordEx("lb-s5-ch-dm-a7", "Chord Exercise 6: Dm, Gm, A7 Progression", 65, new string[]{"Dm:4-1","A7:5-1","Dm:4-1","A7:5-1"}) + ",");
        sb.AppendLine("            " + MakeChordEx("lb-s5-ch-all", "Chord Exercise 7: All Open Chords Master Workout", 72, new string[]{"C:5-1","G:all","Em:all","D:4-1","Am:5-1","E:all","A:5-1","Dm:4-1"}));
        sb.AppendLine("          ]");
        sb.AppendLine("        },");
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Repertoire Songs - Melody & Chords (Lesson Book p. 35-36)\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            " + MakeMultiStringMelody("lb-s5-song-morning-mel", "Song: Morning Has Broken - Melody in C (3/4 Waltz, p. 35)", 85, new string[]{
            "C:5:3:quarter","E:4:2:quarter","G:3:0:quarter",
            "C:2:1:dotted-half",
            "D:2:3:dotted-half",
            "B:2:0:quarter","G:3:0:quarter","A:3:2:quarter",
            "G:3:0:dotted-half",
            "C:5:3:quarter","D:4:0:quarter","E:4:2:quarter",
            "G:3:0:dotted-half",
            "A:3:2:quarter","G:3:0:quarter","E:4:2:quarter",
            "D:4:0:dotted-half",
            "G:3:0:quarter","E:4:2:quarter","G:3:0:quarter",
            "C:2:1:dotted-half",
            "A:3:2:dotted-half",
            "G:3:0:quarter","E:4:2:quarter","C:5:3:quarter",
            "C:5:3:dotted-half",
            "D:4:0:quarter","E:4:2:quarter","G:3:0:quarter",
            "E:4:2:dotted-half",
            "D:4:0:quarter","C:5:3:quarter","D:4:0:quarter",
            "C:5:3:dotted-half"
        }, 3, new string[]{"","C","Dm","G","F","C","Em","Am","D7","G","C","F","C","Am","Dm","G","F","C"}) + ",");
        sb.AppendLine("            " + MakeChordEx("lb-s5-song-morning", "Song: Morning Has Broken - Chords (CD #2 Tracks 2, 3, 4)", 55, new string[]{
            "C:5-1","Dm:4-1","G:all","F:all","C:5-1","Em:all","Am:5-1","D7:4-1",
            "G:all","C:5-1","F:all","C:5-1","Am:5-1","Dm:4-1","G:all","F:all","C:5-1"
        }, 3) + ",");
        sb.AppendLine("            " + MakeMultiStringMelody("lb-s5-song-america-mel", "Song: America the Beautiful - Melody in G (p. 36)", 75, new string[]{
            "D:4:0:quarter","D:4:0:quarter","B:5:2:quarter","B:5:2:quarter",
            "D:4:0:quarter","D:4:0:quarter","A:5:0:half",
            "B:5:2:quarter","C:5:3:quarter","D:4:0:quarter","E:4:2:quarter",
            "F#:4:4:half","D:4:0:half",
            "D:4:0:quarter","D:4:0:quarter","B:5:2:quarter","B:5:2:quarter",
            "D:4:0:quarter","D:4:0:quarter","A:3:2:half",
            "A:3:2:quarter","G#:3:1:quarter","A:3:2:quarter","B:2:0:quarter",
            "E:4:2:whole",
            "B:2:0:quarter","B:2:0:quarter","A:3:2:quarter","G:3:0:quarter",
            "G:3:0:quarter","F#:4:4:quarter","G:3:0:half",
            "A:3:2:quarter","G:3:0:quarter","F#:4:4:quarter","E:4:2:quarter",
            "D:4:0:whole",
            "G:3:0:quarter","G:3:0:quarter","F#:4:4:quarter","E:4:2:quarter",
            "G:3:0:quarter","G:3:0:quarter","D:4:0:half",
            "D:4:0:quarter","E:4:2:quarter","G:3:0:quarter","D:4:0:quarter",
            "A:3:2:half","G:3:0:half"
        }, 4, new string[]{"G","D7","G","D7", "G","D7","E7","A7", "G","C","G","D7", "G","C","G","G"}) + ",");
        sb.AppendLine("            " + MakeChordEx("lb-s5-song-america", "Song: America the Beautiful - Chords (CD #2 Tracks 5, 6, 7)", 60, new string[]{
            "G:all","D7:4-1","G:all","D7:4-1","G:all","D7:4-1","E7:all","A7:5-1",
            "D7:4-1","G:all","C:5-1","G:all","D7:4-1","G:all","C:5-1","D7:4-1","G:all"
        }));
        sb.AppendLine("          ]");
        sb.AppendLine("        }");
    }

    // SESSION 6: Minor 7th & Suspended Chords, Strumming Patterns 1-3, Songs (Lesson Book p. 37-42)
    private static void BuildLesson6(StringBuilder sb) {
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Minor Seventh Chords (Am7, Dm7, Em7, Fm7) (Lesson Book p. 37-39)\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            " + MakeChordEx("lb-s6-m7-ex1", "Minor 7th Exercise 1: Am7, Dm7, Em7, C", 84, new string[]{"C:5-1","Am7:5-1","Dm7:4-1","G7:all","Em7:all","Am7:5-1","Dm7:4-1","C:5-1"}) + ",");
        sb.AppendLine("            " + MakeChordEx("lb-s6-m7-ex2", "Minor 7th Exercise 2: G, Em7, Am7, D7", 84, new string[]{"G:all","Em7:all","Am7:5-1","D7:4-1","G:all","Em7:all","Am7:5-1","G:all"}));
        sb.AppendLine("          ]");
        sb.AppendLine("        },");
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Suspended Chords (Asus, Dsus, Esus, Csus, Gsus) (Lesson Book p. 39-41)\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            " + MakeChordEx("lb-s6-sus-ex1", "Suspended Exercise 1: D - Dsus - D & A - Asus - A", 84, new string[]{"D:4-1","Dsus:4-1","D:4-1","A:5-1","Asus:5-1","A:5-1","G:all","D:4-1"}) + ",");
        sb.AppendLine("            " + MakeChordEx("lb-s6-sus-ex2", "Suspended Exercise 2: E - Esus - E & C - Csus - C", 84, new string[]{"E:all","Esus:all","E:all","A:5-1","C:5-1","Csus:5-1","C:5-1","G7:all"}));
        sb.AppendLine("          ]");
        sb.AppendLine("        },");
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Three Basic Strumming Patterns (Lesson Book p. 38)\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            " + MakeSyncopatedStrumPattern("lb-s6-pat-1", "Strumming Pattern #1: Down (1) - Down-Up (2&) - [Tie 3] - Up-Down (&4)", 75, 1, new string[]{"G:all","Em7:all","Am7:5-1","D7:4-1"}) + ",");
        sb.AppendLine("            " + MakeSyncopatedStrumPattern("lb-s6-pat-2", "Strumming Pattern #2: Down-Up (1&) - Down-Up (2&) - [Tie 3] - Up-Down (&4)", 78, 2, new string[]{"C:5-1","Am7:5-1","Dm7:4-1","G7:all"}) + ",");
        sb.AppendLine("            " + MakeSyncopatedStrumPattern("lb-s6-pat-3", "Strumming Pattern #3: Down-Up (1&) - [Tie 2] - Up (&) - [Tie 3] - Up-Down (&4)", 82, 3, new string[]{"G:all","C:5-1","Dsus:4-1","D:4-1"}));
        sb.AppendLine("          ]");
        sb.AppendLine("        },");
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Repertoire Songs - Melody & Chords (Lesson Book p. 41-42)\",");
        sb.AppendLine("          exercises: [");
        // Scarborough Fair (Lesson Book p. 41 - Key of E Minor!)
        sb.AppendLine("            " + MakeMultiStringMelody("lb-s6-song-scarborough-mel", "Song: Scarborough Fair - Melody in E Minor (3/4 Waltz, p. 41)", 92, new string[]{
            "E:4:2:half","E:4:2:quarter",
            "B:2:0:half","B:2:0:quarter",
            "F#:4:4:half","G:3:0:quarter",
            "F#:4:4:quarter","E:4:2:half",
            "REST:0:0:quarter","B:2:0:quarter","D:2:3:quarter",
            "High E:1:0:half","D:2:3:quarter",
            "B:2:0:quarter","C#:2:2:quarter","A:3:2:quarter",
            "B:2:0:dotted-half",
            "REST:0:0:quarter","High E:1:0:quarter","High E:1:0:quarter",
            "High E:1:0:half","D:2:3:quarter",
            "B:2:0:half","B:2:0:quarter",
            "A:3:2:quarter","G:3:0:quarter","F#:4:4:quarter",
            "E:4:2:dotted-half",
            "E:4:2:half","B:2:0:quarter",
            "A:3:2:half","G:3:0:quarter",
            "F#:4:4:quarter","E:4:2:quarter","D:4:0:quarter",
            "E:4:2:dotted-half"
        }, 3, new string[]{"Em","Em","D","Em", "Em","G","A","Em7", "Em","G","G","D", "Em","G","D","Em","Em"}) + ",");
        sb.AppendLine("            " + MakeChordEx("lb-s6-song-scarborough", "Song: Scarborough Fair - Chords in Em (CD #2 Tracks 8, 9, 10)", 92, new string[]{
            "Em:all","Em7:all","D:4-1","Em:all","G:all","A:5-1","Em7:all","G:all","D:4-1","Em:all","D:4-1","Em:all"
        }, 3) + ",");
        // Greensleeves (Lesson Book p. 42 - Am7, D7, G, Em, Am7, E7)
        sb.AppendLine("            " + MakeMultiStringMelody("lb-s6-song-greensleeves-mel", "Song: Greensleeves - Melody in A Minor (3/4 Waltz, p. 42)", 92, new string[]{
            "A:3:2:quarter","C:2:1:half",
            "D:2:3:quarter","High E:1:0:quarter","F:1:1:quarter",
            "High E:1:0:half","D:2:3:quarter",
            "B:2:0:half","G:3:0:quarter",
            "A:3:2:quarter","B:2:0:quarter","C:2:1:quarter",
            "A:3:2:half","A:3:2:quarter",
            "G#:3:1:half","E:4:2:quarter",
            "B:2:0:dotted-half",
            "G:1:3:dotted-half",
            "G:1:3:quarter","F#:1:2:quarter","High E:1:0:quarter",
            "D:2:3:half","B:2:0:quarter",
            "G:3:0:quarter","A:3:2:quarter","B:2:0:quarter",
            "C:2:1:half","A:3:2:quarter",
            "A:3:2:quarter","G#:3:1:quarter","A:3:2:quarter",
            "B:2:0:half","G#:3:1:quarter",
            "A:3:2:dotted-half"
        }, 3, new string[]{"Am7","D7","G","Em", "Am7","F","E7","E7", "G","D7","G","Em", "Am7","Dm7","E7","Am"}) + ",");
        sb.AppendLine("            " + MakeChordEx("lb-s6-song-greensleeves", "Song: Greensleeves - Chords (CD #2 Tracks 11, 12, 13)", 92, new string[]{
            "Am7:5-1","D7:4-1","G:all","Em:all","Am7:5-1","F:all","E7:all","E7:all",
            "G:all","D7:4-1","G:all","Em:all","Am7:5-1","Dm7:4-1","E7:all","Am:5-1"
        }, 3) + ",");
        // Island Groove (Lesson Book p. 42 - G and D7)
        sb.AppendLine("            " + MakeMultiStringMelody("lb-s6-song-wind-bound", "Song: Island Groove - Melody & Chords (CD #2 Tracks 14, 15, 16)", 84, new string[]{
            "B:2:0:quarter","D:2:3:quarter","B:2:0:quarter","G:3:0:quarter",
            "A:3:2:half","D:4:0:half",
            "B:2:0:quarter","D:2:3:quarter","G:1:3:quarter","D:2:3:quarter",
            "F#:1:2:whole",
            "G:1:3:quarter","D:2:3:quarter","B:2:0:quarter","G:3:0:quarter",
            "A:3:2:quarter","B:2:0:quarter","C:2:1:half",
            "B:2:0:quarter","A:3:2:quarter","G:3:0:quarter","F#:4:4:quarter",
            "G:3:0:whole"
        }, 4, new string[]{"G","D7","G","D7", "G","D7","D7","G"}));
        sb.AppendLine("          ]");
        sb.AppendLine("        }");
    }

    // SESSION 7: Barre Chords on 6th String, Half/Whole Steps, Major Scales, Songs in C (Lesson Book p. 43-47)
    private static void BuildLesson7(StringBuilder sb) {
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Half Steps, Whole Steps & Major Scale Formula (Lesson Book p. 43-46)\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            " + MakeMultiStringMelody("lb-s7-steps-ex1", "Exercise 1: Chromatic Half Steps & Whole Steps on 6th String", 60, new string[]{
            "Low E:6:0:quarter","F:6:1:quarter","F#:6:2:quarter","G:6:3:quarter",
            "G#:6:4:quarter","A:6:5:quarter","G:6:3:half",
            "Low E:6:0:whole"
        }) + ",");
        sb.AppendLine("            " + MakeMultiStringMelody("lb-s7-scale-g", "Exercise 2: C & G Major Scales (W-W-H-W-W-W-H)", 68, new string[]{
            "C:5:3:quarter","D:4:0:quarter","E:4:2:quarter","F:4:3:quarter",
            "G:3:0:quarter","A:3:2:quarter","B:2:0:quarter","C:2:1:quarter",
            "G:6:3:quarter","A:6:5:quarter","B:5:2:quarter","C:5:3:quarter",
            "D:5:5:quarter","E:4:2:quarter","F#:4:4:quarter","G:4:5:quarter"
        }));
        sb.AppendLine("          ]");
        sb.AppendLine("        },");
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"6th String Barre Chords & Exercises 1-3 (Lesson Book p. 44)\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            " + MakeChordEx("lb-s7-barre-f", "Barre Exercise 1: C, Am, Dm7, F Barre, G7 (p. 44)", 72, new string[]{"C:5-1","Am:5-1","F Barre:all","G7:all","C:5-1","F Barre:all","G7:all","C:5-1"}) + ",");
        sb.AppendLine("            " + MakeChordEx("lb-s7-barre-g", "Barre Exercise 2: Moveable 6th String Barre Chords (F, Gm, Ab, Bb)", 72, new string[]{"F Barre:all","Gm:all","Ab Barre:all","G7:all","F Barre:all","Gm:all","C:5-1","F Barre:all"}));
        sb.AppendLine("          ]");
        sb.AppendLine("        },");
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Repertoire Songs in Key of C - Melody & Barre Chords (Lesson Book p. 47)\",");
        sb.AppendLine("          exercises: [");
        // Home on the Range (Lesson Book p. 47 - Key of C: C, F, C, G7)
        sb.AppendLine("            " + MakeMultiStringMelody("lb-s7-song-home-mel", "Song: Home on the Range - Melody in C (3/4 Waltz, p. 47)", 84, new string[]{
            "G:3:0:quarter","G:3:0:quarter","C:2:1:quarter",
            "D:2:3:quarter","High E:1:0:half",
            "C:2:1:quarter","B:2:0:quarter","A:3:2:quarter",
            "F:1:1:half","F:1:1:quarter",
            "F:1:1:quarter","F:1:1:quarter","High E:1:0:quarter",
            "D:2:3:quarter","C:2:1:quarter","D:2:3:quarter",
            "High E:1:0:quarter","D:2:3:quarter","C:2:1:quarter",
            "D:2:3:dotted-half",
            "G:3:0:quarter","G:3:0:quarter","C:2:1:quarter",
            "D:2:3:quarter","High E:1:0:half",
            "C:2:1:quarter","B:2:0:quarter","A:3:2:quarter",
            "F:1:1:half","F:1:1:quarter",
            "F:1:1:quarter","High E:1:0:quarter","D:2:3:quarter",
            "C:2:1:quarter","D:2:3:quarter","B:2:0:quarter",
            "C:2:1:dotted-half",
            "C:2:1:dotted-half"
        }, 3, new string[]{"","C","C","F", "F","C","Am","D7", "G7","C","C","F", "F","C","G7","C","C"}) + ",");
        sb.AppendLine("            " + MakeChordEx("lb-s7-song-home", "Song: Home on the Range - Chords in C (CD #2 Tracks 17, 18, 19)", 84, new string[]{
            "C:5-1","C:5-1","F Barre:all","F Barre:all","C:5-1","Am:5-1","D7:4-1","G7:all",
            "C:5-1","C:5-1","F Barre:all","F Barre:all","C:5-1","G7:all","C:5-1","C:5-1"
        }, 3) + ",");
        // Yellow Rose of Texas (Lesson Book p. 47 - Key of C: C, F, G, G7)
        sb.AppendLine("            " + MakeMultiStringMelody("lb-s7-song-yellow-mel", "Song: Yellow Rose of Texas - Melody in C (p. 47)", 84, new string[]{
            "G:3:0:quarter","C:2:1:quarter","B:2:0:quarter","C:2:1:quarter",
            "D:2:3:quarter","C:2:1:quarter","High E:1:0:half",
            "G:1:3:quarter","G:1:3:quarter","F:1:1:quarter","High E:1:0:quarter",
            "D:2:3:whole",
            "G:3:0:quarter","B:2:0:quarter","D:2:3:quarter","F:1:1:quarter",
            "High E:1:0:quarter","D:2:3:quarter","C:2:1:half",
            "D:2:3:quarter","High E:1:0:quarter","D:2:3:quarter","B:2:0:quarter",
            "C:2:1:whole"
        }, 4, new string[]{"C","C","F Barre","G", "G7","C","G7","C"}) + ",");
        sb.AppendLine("            " + MakeChordEx("lb-s7-song-yellow-rose", "Song: Yellow Rose of Texas - Chords in C (CD #2 Tracks 20, 21, 22)", 84, new string[]{
            "C:5-1","C:5-1","F Barre:all","G:all","G7:all","C:5-1","G7:all","C:5-1"
        }));
        sb.AppendLine("          ]");
        sb.AppendLine("        }");
    }

    // SESSION 8: Barre Chords on 5th String, Keys & Signatures, Jamaica Farewell (Lesson Book p. 48-51)
    private static void BuildLesson8(StringBuilder sb) {
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"5th String Barre Chords & Exercises (Lesson Book p. 48-49)\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            " + MakeChordEx("lb-s8-barre-bb", "Exercise 1: Bb Major Root 5 Barre (Fret 1) to F Barre", 72, new string[]{"F Barre:all","Bb Barre:5-1","C Barre:5-1","F Barre:all"}) + ",");
        sb.AppendLine("            " + MakeChordEx("lb-s8-barre-c", "Exercise 2: Mixing 5th & 6th String Barre Chords (G, C, D)", 72, new string[]{"G Barre:all","C Barre:5-1","D Barre:5-1","G Barre:all"}));
        sb.AppendLine("          ]");
        sb.AppendLine("        },");
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Keys, Key Signatures & Relative Major/Minor (Lesson Book p. 50)\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            " + MakeChordEx("lb-s8-rel-prog", "Exercise 1: Relative Major & Minor Progressions (C/Am & G/Em)", 72, new string[]{"C:5-1","Am:5-1","F Barre:all","G7:all","G:all","Em:all","C:5-1","D7:4-1"}));
        sb.AppendLine("          ]");
        sb.AppendLine("        },");
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Repertoire Songs - Jamaica Farewell in F & G (Lesson Book p. 51)\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            " + MakeMultiStringMelody("lb-s8-song-jamaica-mel", "Song: Jamaica Farewell - Melody in G (p. 51)", 84, new string[]{
            "B:2:0:half","D:2:3:quarter","B:2:0:quarter",
            "A:3:2:quarter","G:3:0:quarter","E:4:2:half",
            "G:3:0:quarter","G:3:0:quarter","A:3:2:quarter","B:2:0:quarter",
            "A:3:2:whole",
            "C:2:1:half","High E:1:0:quarter","C:2:1:quarter",
            "B:2:0:quarter","D:2:3:quarter","G:3:0:half",
            "A:3:2:quarter","A:3:2:quarter","B:2:0:quarter","A:3:2:quarter",
            "G:3:0:whole"
        }, 4, new string[]{"G","C","G","D7","C","G","D7","G"}) + ",");
        sb.AppendLine("            " + MakeChordEx("lb-s8-song-jamaica-f", "Song: Jamaica Farewell in F - Barre Chords (CD #2 Tracks 23, 24, 25)", 80, new string[]{"F Barre:all","Bb Barre:5-1","C7 Barre:5-1","F Barre:all","F Barre:all","Bb Barre:5-1","C7 Barre:5-1","F Barre:all"}) + ",");
        sb.AppendLine("            " + MakeChordEx("lb-s8-song-jamaica-g", "Song: Jamaica Farewell in G - Open & Barre Chords (CD #2 Tracks 26, 27, 28)", 85, new string[]{"G:all","C:5-1","D7:4-1","G:all","G:all","C:5-1","D7:4-1","G:all"}));
        sb.AppendLine("          ]");
        sb.AppendLine("        }");
    }

    // SESSION 9: The Secret to Great Strumming, Intervals, La Bamba, Wabash Cannonball, Blues in E (Lesson Book p. 52-56)
    private static void BuildLesson9(StringBuilder sb) {
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Strumming Technique - Keep Your Hand Going (Lesson Book p. 52-53)\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            " + Make8thMotorStrum("lb-s9-motor-1", "Strumming Exercise 1: Continuous 8th-Note Motor Motion", 80, "G") + ",");
        sb.AppendLine("            " + MakeSyncopatedStrumPattern("lb-s9-motor-2", "Strumming Exercise 2: Syncopated Ties & Ghost Strums", 85, 2, new string[]{"G:all","C:5-1","D:4-1","G:all"}));
        sb.AppendLine("          ]");
        sb.AppendLine("        },");
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Major Scale Intervals (2nds, 3rds, 4ths, 5ths, 6ths, 7ths) (Lesson Book p. 54)\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            " + MakeMultiStringMelody("lb-s9-intervals-ex", "Exercise 1: Diatonic Intervals in C Major (2nds through Octave)", 68, new string[]{
            "C:5:3:half","D:4:0:half",
            "C:5:3:half","E:4:2:half",
            "C:5:3:half","F:4:3:half",
            "C:5:3:half","G:3:0:half",
            "C:5:3:half","A:3:2:half",
            "C:5:3:half","B:2:0:half",
            "C:5:3:half","C:2:1:half"
        }));
        sb.AppendLine("          ]");
        sb.AppendLine("        },");
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Repertoire Songs - La Bamba, Wabash Cannonball & Blues in E (Lesson Book p. 55-56)\",");
        sb.AppendLine("          exercises: [");
        // La Bamba (Lesson Book p. 55 - Key of A: A, D, E)
        sb.AppendLine("            " + MakeMultiStringMelody("lb-s9-song-labamba-mel", "Song: La Bamba - Melody in Key of A (p. 55)", 92, new string[]{
            "E:4:2:quarter","E:4:2:quarter","C#:2:2:quarter","A:3:2:quarter",
            "D:2:3:quarter","C#:2:2:quarter","B:2:0:half",
            "B:2:0:quarter","D:2:3:quarter","C#:2:2:quarter","A:3:2:quarter",
            "E:1:0:half","C#:2:2:half"
        }, 4, new string[]{"A","D","E","A"}) + ",");
        sb.AppendLine("            " + MakeChordEx("lb-s9-song-labamba", "Song: La Bamba - Chords in Key of A (CD #3 Tracks 2, 3, 4)", 92, new string[]{
            "A:5-1","D:4-1","E:all","E:all","A:5-1","D:4-1","E:all","E:all"
        }) + ",");
        // The Wabash Cannonball (Lesson Book p. 56 - Key of G: G, G7, C, D7, G)
        sb.AppendLine("            " + MakeMultiStringMelody("lb-s9-song-water", "Song: The Wabash Cannonball - Melody & Chords in G (CD #3 Tracks 5, 6, 7)", 112, new string[]{
            "D:4:0:quarter","G:3:0:quarter","G:3:0:quarter","A:3:2:quarter",
            "B:2:0:quarter","B:2:0:quarter","A:3:2:quarter","B:2:0:quarter",
            "C:2:1:quarter","C:2:1:quarter","B:2:0:quarter","G:3:0:quarter",
            "A:3:2:half","D:4:0:half",
            "F#:4:4:quarter","A:3:2:quarter","A:3:2:quarter","B:2:0:quarter",
            "C:2:1:quarter","B:2:0:quarter","A:3:2:quarter","G:3:0:quarter",
            "F#:4:4:quarter","D:4:0:quarter","E:4:2:quarter","F#:4:4:quarter",
            "G:3:0:whole"
        }, 4, new string[]{"G","G7","C","D7","D7","D7","D7","G"}) + ",");
        // Blues in E (Lesson Book p. 56)
        sb.AppendLine("            " + MakeChordEx("lb-s9-song-blues-e", "Song: Blues in E (CD #3 Tracks 8, 9)", 92, new string[]{
            "E7:all","E7:all","E7:all","E7:all","A7:5-1","A7:5-1","E7:all","E7:all","B7:5-1","A7:5-1","E7:all","B7:5-1"
        }));
        sb.AppendLine("          ]");
        sb.AppendLine("        }");
    }

    // SESSION 10: Fingerstyle Guitar (Lesson Book p. 57-62)
    private static void BuildLesson10(StringBuilder sb) {
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Fingerstyle Technique & Patterns 1, 2, 3 (Lesson Book p. 57-60)\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            " + MakePimaExercise("lb-s10-pima-1", "Finger Pattern 1: Thumb - 1st - 2nd - 3rd (P-I-M-A, p. 57)", 92, 1) + ",");
        sb.AppendLine("            " + MakePimaExercise("lb-s10-pima-2", "Finger Pattern 2: Thumb - 3rd - 2nd - 1st (P-A-M-I, p. 58)", 92, 2) + ",");
        sb.AppendLine("            " + MakePimaExercise("lb-s10-pima-3", "Finger Pattern 3: Thumb - 2nd - 1st - 3rd (P-M-I-A, p. 59)", 92, 3));
        sb.AppendLine("          ]");
        sb.AppendLine("        },");
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Repertoire Songs - House of the Rising Sun & Canon in D (Lesson Book p. 61-62)\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            " + MakeChordEx("lb-s10-song-house", "Song: House of the Rising Sun (CD #3 Tracks 10, 11, 12, 13)", 60, new string[]{
            "Am:5-1","C:5-1","D:4-1","F:all","Am:5-1","C:5-1","E:all","E:all",
            "Am:5-1","C:5-1","D:4-1","F:all","Am:5-1","E:all","Am:5-1","E:all"
        }, 3) + ",");
        sb.AppendLine("            " + MakeChordEx("lb-s10-song-canon", "Song: Canon in D (CD #3 Tracks 14, 15, 16)", 65, new string[]{
            "D:4-1","A:5-1","Bm:5-1","F#m:all","G:all","D:4-1","G:all","A:5-1"
        }));
        sb.AppendLine("          ]");
        sb.AppendLine("        }");
    }

    // SESSION 11: Pentatonic Scales (Lesson Book p. 63-66)
    private static void BuildLesson11(StringBuilder sb) {
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Five Pentatonic Scale Forms & Common Patterns (Lesson Book p. 63-65)\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            " + MakePentatonicBox1("lb-s11-penta-box1", "A Minor Pentatonic Form 1 (5th Fret)", 100) + ",");
        sb.AppendLine("            " + MakePentatonicBox2("lb-s11-penta-box2", "A Minor Pentatonic Form 2 (8th Fret)", 100));
        sb.AppendLine("          ]");
        sb.AppendLine("        },");
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Pentatonic Jam-Along Tracks (Lesson Book p. 66)\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            " + MakeMultiStringMelody("lb-s11-solo-aminor", "Solo 1: A Minor Pentatonic Blues (CD #3 Track 17)", 80, new string[]{
            "A:6:5:quarter","C:6:8:quarter","D:5:5:quarter","E:5:7:quarter",
            "G:4:5:quarter","A:4:7:quarter","C:3:5:quarter","D:3:7:quarter",
            "E:2:5:quarter","G:2:8:quarter","A:1:5:half",
            "A:4:7:whole"
        }) + ",");
        sb.AppendLine("            " + MakeMultiStringMelody("lb-s11-solo-gmajor", "Solo 2: G Major Pentatonic (CD #3 Track 18)", 80, new string[]{
            "G:6:3:quarter","A:6:5:quarter","B:5:2:quarter","D:5:5:quarter",
            "E:4:2:quarter","G:4:5:quarter","A:3:2:quarter","B:3:4:quarter",
            "G:4:5:whole"
        }) + ",");
        sb.AppendLine("            " + MakeMultiStringMelody("lb-s11-solo-around", "Solo 3: Around the Pentatonic World (CD #3 Track 19)", 85, new string[]{
            "A:6:5:quarter","C:6:8:quarter","D:5:5:quarter","E:5:7:quarter",
            "G:5:10:quarter","A:4:7:quarter","C:4:10:quarter","D:3:7:quarter",
            "A:4:7:whole"
        }));
        sb.AppendLine("          ]");
        sb.AppendLine("        }");
    }

    // SESSION 12: Advanced Chords - Two, Maj7, m11, Substitutions (Lesson Book p. 67-70)
    private static void BuildLesson12(StringBuilder sb) {
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Two Chords, Major 7th, Minor 11th & Substitutions (Lesson Book p. 67-69)\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            " + MakeChordEx("lb-s12-ch-maj7", "Exercise 1: Two Chords & Major 7th Progression (Cadd9, Gadd9, Cmaj7, Fmaj7)", 80, new string[]{"Cadd9:5-1","Gadd9:all","Cmaj7:5-1","Fmaj7:4-1"}) + ",");
        sb.AppendLine("            " + MakeChordEx("lb-s12-ch-m11", "Exercise 2: Minor 11th & Chord Substitution Exercise (p. 69)", 80, new string[]{"Cmaj7:5-1","Am7:5-1","Dm11:4-1","G7:all","Em7:all","Am9:5-1","Dm9:4-1","G13:all"}));
        sb.AppendLine("          ]");
        sb.AppendLine("        },");
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Repertoire Songs - Rockin', Suspended Smooth & Acoustic Groove (Lesson Book p. 70)\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            " + MakeChordEx("lb-s12-song-rockin", "Song: Rockin' (CD #3 Track 20, p. 70)", 80, new string[]{"D:4-1","Cadd9:5-1","Gadd9:all","A:5-1","Bm7:5-1","Gadd9:all","A:5-1","D:4-1"}) + ",");
        sb.AppendLine("            " + MakeChordEx("lb-s12-song-smooth", "Song: Suspended Smooth (CD #3 Track 21, p. 70)", 80, new string[]{"Dsus:4-1","D:4-1","Asus:5-1","A:5-1","Gadd9:all","Dsus:4-1","D:4-1","A:5-1"}) + ",");
        sb.AppendLine("            " + MakeChordEx("lb-s12-song-groove", "Song: Acoustic Groove (CD #3 Track 22, p. 70)", 80, new string[]{"E:all","F#m7:all","A:5-1","B7:5-1","E:all","F#m7:all","A:5-1","E:all"}));
        sb.AppendLine("          ]");
        sb.AppendLine("        }");
    }

    // SESSION 13: Playing the Blues (Lesson Book p. 71-75)
    private static void BuildLesson13(StringBuilder sb) {
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Blues Scale, Minor Pentatonic with Blues Notes & Triads (Lesson Book p. 71-74)\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            " + MakeBluesScaleA("lb-s13-scale-blues", "A Blues Scale with Blue Note (Eb)", 75) + ",");
        sb.AppendLine("            " + MakeChordEx("lb-s13-triads", "Major & Minor Triad Inversions Workout (1-3-5 / 1-b3-5)", 72, new string[]{"A Triad:3-1","D Triad:3-1","E Triad:3-1","A Triad:3-1"}));
        sb.AppendLine("          ]");
        sb.AppendLine("        },");
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Repertoire Songs - Jammin' the Blues in C & Johnny's E Blues (Lesson Book p. 75)\",");
        sb.AppendLine("          exercises: [");
        // Jammin' the Blues (Lesson Book p. 75 - 12-Bar Blues in C!)
        sb.AppendLine("            " + MakeChordEx("lb-s13-song-jammin", "Song: Jammin' the Blues in C (CD #4 Tracks 2, 3, p. 75)", 80, new string[]{
            "C7:5-1","F7:all","C7:5-1","C7:5-1",
            "F7:all","F7:all","C7:5-1","C7:5-1",
            "G7:all","F7:all","C7:5-1","G7:all"
        }) + ",");
        sb.AppendLine("            " + MakeChordEx("lb-s13-song-johnny", "Song: Johnny's E Blues (CD #4 Tracks 4, 5, p. 75)", 88, new string[]{
            "E7:all","A7:5-1","E7:all","E7:all",
            "A7:5-1","A7:5-1","E7:all","E7:all",
            "B7:5-1","A7:5-1","E7:all","B7:5-1"
        }));
        sb.AppendLine("          ]");
        sb.AppendLine("        }");
    }

    // SESSION 14: Giving Your Playing Some Style (Lesson Book p. 76-79)
    private static void BuildLesson14(StringBuilder sb) {
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Sliding, Bends, Harmonics, Hammer-ons & Pull-offs (Lesson Book p. 76-78)\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            " + MakeMultiStringMelody("lb-s14-tech-sl-ho", "Exercise 1: Major Scale Bending, Hammer-ons & Pull-offs (p. 77-78)", 70, new string[]{
            "G:3:0:quarter","A:3:2:quarter","B:2:0:quarter","C:2:1:quarter",
            "D:2:3:half","High E:1:0:half",
            "Low E:6:0:whole"
        }));
        sb.AppendLine("          ]");
        sb.AppendLine("        },");
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Repertoire Songs - Bending the Blues, Jazz Octaves & Funky Mute (Lesson Book p. 79)\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            " + MakeChordEx("lb-s14-song-bending", "Song: Bending the Blues (CD #4 Track 6, p. 79)", 75, new string[]{
            "A7:5-1","D7:4-1","A7:5-1","A7:5-1","D7:4-1","D7:4-1","A7:5-1","A7:5-1","E7:all","D7:4-1","A7:5-1","E7:all"
        }) + ",");
        sb.AppendLine("            " + MakeMultiStringMelody("lb-s14-song-octaves", "Song: Jazz Octaves (CD #4 Track 7, p. 79)", 80, new string[]{
            "G:5:10:quarter","G:3:12:quarter","A:5:12:quarter","A:3:14:quarter",
            "G:5:10:whole"
        }) + ",");
        sb.AppendLine("            " + MakeChordEx("lb-s14-song-funky-mute", "Song: The Funky Mute (CD #4 Track 8, p. 79)", 90, new string[]{"E9:5-1","A9:5-1","E9:5-1","B9:5-1"}));
        sb.AppendLine("          ]");
        sb.AppendLine("        }");
    }

    // SESSION 15: Electric Guitars - The Heart of Rock & Roll (Lesson Book p. 80-84)
    private static void BuildLesson15(StringBuilder sb) {
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Power Chords, Chicken Pickin', Country Bends & Sliding 4ths (Lesson Book p. 80-83)\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            " + MakeChordEx("lb-s15-power-chords", "Power Chord Exercises 1 & 2 (E5, G5, A5, C5, D5, p. 81)", 85, new string[]{"E5:6-5","G5:6-5","A5:5-4","C5:5-4","D5:5-4","E5:6-5"}) + ",");
        sb.AppendLine("            " + MakeChordEx("lb-s15-sliding-4ths", "Sliding 4ths & Harmonized Major Scale Exercise (p. 82-83)", 80, new string[]{"G 4ths:4-3","A 4ths:4-3","B 4ths:4-3","C 4ths:4-3"}));
        sb.AppendLine("          ]");
        sb.AppendLine("        },");
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Repertoire Songs - Power Chord Rock & Power Riffs (Lesson Book p. 84)\",");
        sb.AppendLine("          exercises: [");
        // Power Chord Rock (Lesson Book p. 84 - G5, D5, Em, C5)
        sb.AppendLine("            " + MakeChordEx("lb-s15-song-power-rock", "Song: Power Chord Rock (CD #4 Track 9, p. 84)", 95, new string[]{
            "G5:6-5","D5:5-4","Em:all","C5:5-4","G5:6-5","D5:5-4","C5:5-4","G5:6-5"
        }) + ",");
        // Power Riffs (Lesson Book p. 84 - E5, D5, C5)
        sb.AppendLine("            " + MakeChordEx("lb-s15-song-rockin", "Song: Power Riffs (CD #4 Track 10, p. 84)", 100, new string[]{
            "E5:6-5","D5:5-4","E5:6-5","E5:6-5","D5:5-4","C5:5-4","D5:5-4","E5:6-5"
        }));
        sb.AppendLine("          ]");
        sb.AppendLine("        }");
    }

    // SESSION 16: Advanced Strumming (Lesson Book p. 85-88)
    private static void BuildLesson16(StringBuilder sb) {
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Sixteenth-Note Strumming, Accents & Ties (Lesson Book p. 85-87)\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            " + Make16thStrumExercise("lb-s16-16th-strum", "16th-Note Continuous Subdivision Workout (1 e & a, p. 85)", 72, new string[]{"Em","G","C","D"}) + ",");
        sb.AppendLine("            " + MakeChordEx("lb-s16-scratch", "16th-Note Accents & Percussive Scratching (p. 86-87)", 72, new string[]{"G:all","Cadd9:5-1","Em7:all","D:4-1"}));
        sb.AppendLine("          ]");
        sb.AppendLine("        },");
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Repertoire Songs - Rolling Along, A Little Bit Rocky & Electric Funk (Lesson Book p. 87-88)\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            " + MakeChordEx("lb-s16-song-rolling", "Song: Rolling Along (CD #4 Track 11, p. 87)", 88, new string[]{
            "Cadd9:5-1","Gadd9:all","D:4-1","Cadd9:5-1","Em7:all","D:4-1","Cadd9:5-1","Gadd9:all"
        }) + ",");
        sb.AppendLine("            " + MakeChordEx("lb-s16-song-ballad", "Song: A Little Bit Rocky (CD #4 Track 12, p. 88)", 85, new string[]{
            "E:all","Aadd9:5-1","B7:5-1","E:all","C#m7:5-1","Aadd9:5-1","B7:5-1","E:all"
        }) + ",");
        sb.AppendLine("            " + MakeChordEx("lb-s16-song-funk", "Song: Electric Funk (CD #4 Track 13, p. 88)", 95, new string[]{
            "G5:6-5","F Barre:all","G5:6-5","F Barre:all","Bb Barre:5-1","C5:5-4","G5:6-5","F Barre:all"
        }));
        sb.AppendLine("          ]");
        sb.AppendLine("        }");
    }

    // SESSION 17: Going Beyond the First Position (Lesson Book p. 89-92)
    private static void BuildLesson17(StringBuilder sb) {
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Three-Note-on-a-String Scales & Seventh Chords (Lesson Book p. 89-91)\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            " + MakeMultiStringMelody("lb-s17-octaves", "Exercise 1: 3-Note-on-a-String Scale Form #1 in F (p. 89)", 75, new string[]{
            "F:6:1:quarter","G:6:3:quarter","A:6:5:quarter","Bb:5:1:quarter",
            "C:5:3:quarter","D:5:5:quarter","E:4:2:quarter","F:4:3:quarter",
            "F:4:3:whole"
        }));
        sb.AppendLine("          ]");
        sb.AppendLine("        },");
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Repertoire Songs - Triplet Scale Practice, Pop Ballad Groove & ZZ Shuffle (Lesson Book p. 91-92)\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            " + MakeChordEx("lb-s17-song-triplet", "Song: Triplet Scale Practice (CD #5 Tracks 2, 3, 4, p. 91)", 80, new string[]{
            "F Barre:all","Gm:all","Am7:5-1","Bb Barre:5-1","Am7:5-1","Gm:all","C7:5-1","F Barre:all"
        }) + ",");
        sb.AppendLine("            " + MakeChordEx("lb-s17-song-rockin", "Song: Pop Ballad Groove (CD #5 Tracks 5, 6, 7, p. 92)", 76, new string[]{
            "D:4-1","A/C#:5-1","Bm7:5-1","G:all","D/F#:all","Em7:all","Asus:5-1","D:4-1"
        }) + ",");
        sb.AppendLine("            " + MakeChordEx("lb-s17-song-5th-fret", "Song: ZZ Shuffle (CD #5 Tracks 8, 9, p. 92)", 92, new string[]{
            "E5:6-5","E5:6-5","C5:5-4","D5:5-4","E5:6-5","E5:6-5","A5:5-4","B5:5-4"
        }));
        sb.AppendLine("          ]");
        sb.AppendLine("        }");
    }

    // SESSION 18: Jazz (Lesson Book p. 93-97)
    private static void BuildLesson18(StringBuilder sb) {
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Jazz Chords, ii-V-I Progressions & Color Tones (Lesson Book p. 93-95)\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            " + MakeChordEx("lb-s18-ii-v-i", "Exercise 1: Major ii-V-I Jazz Progression (Dm7 - G7 - Cmaj7)", 72, new string[]{"Dm7:4-1","G7:all","Cmaj7:5-1","Cmaj7:5-1"}) + ",");
        sb.AppendLine("            " + MakeChordEx("lb-s18-freddie-green", "Exercise 2: Jazz Ninth & Thirteenth Voicings (C9, F9, G13)", 75, new string[]{"C9:5-1","F9:all","C9:5-1","G13:all"}));
        sb.AppendLine("          ]");
        sb.AppendLine("        },");
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Repertoire Songs - Swingin' & Jazz Blues (Lesson Book p. 96-97)\",");
        sb.AppendLine("          exercises: [");
        // Swingin' (Lesson Book p. 96 - Cmaj7, A7, Dm7, G7)
        sb.AppendLine("            " + MakeChordEx("lb-s18-song-swingin", "Song: Swingin' (CD #5 Track 10, p. 96)", 85, new string[]{
            "Cmaj7:5-1","A7:5-1","Dm7:4-1","G7:all","Em7:all","A7:5-1","Dm7:4-1","G7:all",
            "Cmaj7:5-1","C7:5-1","Fmaj7:4-1","Fm:all","Cmaj7:5-1","A7:5-1","Dm7:4-1","G7:all","Cmaj7:5-1"
        }) + ",");
        // Jazz Blues (Lesson Book p. 97 - F, Bb9, F, Cm7, F7, Bb9, G7, C7)
        sb.AppendLine("            " + MakeChordEx("lb-s18-song-jazz-blues", "Song: Jazz Blues in F (p. 97)", 88, new string[]{
            "F Barre:all","Bb Barre:5-1","F Barre:all","F Barre:all",
            "Bb Barre:5-1","Bb Barre:5-1","F Barre:all","D7:4-1",
            "Gm:all","C7:5-1","F Barre:all","C7:5-1"
        }));
        sb.AppendLine("          ]");
        sb.AppendLine("        }");
    }

    // SESSION 19: Soloing & Ear Training (Lesson Book p. 98-101)
    private static void BuildLesson19(StringBuilder sb) {
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Soloing Techniques & Target Tones (Lesson Book p. 98-99)\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            " + MakeMultiStringMelody("lb-s19-target-tones", "Exercise 1: Target Tone Phrasing to Root, 3rd, 5th & 7th", 75, new string[]{
            "G:3:0:quarter","A:3:2:quarter","B:2:0:quarter","C:2:1:quarter",
            "High E:1:0:half","G:1:3:half",
            "C:2:1:whole"
        }));
        sb.AppendLine("          ]");
        sb.AppendLine("        },");
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Ear Training Exercises 1, 2, 3 (Lesson Book p. 100)\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            " + MakeMultiStringMelody("lb-s19-ear-1", "Ear Training Exercise 1 (CD #5 Track 11, p. 100)", 60, new string[]{"C:5:3:half","E:4:2:half","G:3:0:half","C:2:1:half","C:5:3:whole"}) + ",");
        sb.AppendLine("            " + MakeMultiStringMelody("lb-s19-ear-2", "Ear Training Exercise 2 (CD #5 Track 12, p. 100)", 60, new string[]{"A:5:0:half","C:2:1:half","High E:1:0:half","A:3:2:half","A:5:0:whole"}) + ",");
        sb.AppendLine("            " + MakeMultiStringMelody("lb-s19-ear-3", "Ear Training Exercise 3 (CD #5 Track 13, p. 100)", 65, new string[]{"D:4:0:quarter","F#:4:4:quarter","A:3:2:quarter","D:2:3:quarter","D:4:0:whole"}));
        sb.AppendLine("          ]");
        sb.AppendLine("        },");
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Repertoire Song - Stevie's Groove (Lesson Book p. 101)\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            " + MakeChordEx("lb-s19-song-steve-jam", "Song: Stevie's Groove (CD #5 Track 14, p. 101)", 88, new string[]{
            "A7:5-1","D7:4-1","A7:5-1","A7:5-1","D7:4-1","D7:4-1","A7:5-1","A7:5-1","E7:all","D7:4-1","A7:5-1","E7:all"
        }));
        sb.AppendLine("          ]");
        sb.AppendLine("        }");
    }

    // SESSION 20: All the Chords You Need To Know (Lesson Book p. 102-106)
    private static void BuildLesson20(StringBuilder sb) {
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Chord Formulas, Abbreviations & Slash Inversions (Lesson Book p. 102-104)\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            " + MakeChordEx("lb-s20-formulas", "Exercise 1: Major, Minor, Dominant & Altered Chord Formulas", 68, new string[]{"C:5-1","Cm:5-1","G:all","Gm:all"}) + ",");
        sb.AppendLine("            " + MakeChordEx("lb-s20-inversions", "Exercise 2: Slash Chords & Bass Inversions (C, C/E, C/G, G/B, D/F#)", 70, new string[]{"C:5-1","C/E:all","C/G:all","G:all","D/F#:all","Em7:all","G/B:5-1","C:5-1"}));
        sb.AppendLine("          ]");
        sb.AppendLine("        },");
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Chord Exercises 1 & 2 (Lesson Book p. 105)\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            " + MakeChordEx("lb-s20-ch-ex1", "Chord Exercise 1: Drone & Open-String Voicings (CD #5 Track 15, p. 105)", 75, new string[]{"E:all","Aadd9:5-1","B7:5-1","E:all","C#m7:5-1","F#m7:all","B7:5-1","E:all"}) + ",");
        sb.AppendLine("            " + MakeChordEx("lb-s20-ch-ex2", "Chord Exercise 2: Acoustic Slash Chord Walkdown (CD #5 Track 16, p. 105)", 78, new string[]{"G:all","D/F#:all","Em7:all","Cadd9:5-1","G/B:5-1","Am7:5-1","Dsus:4-1","G:all"}));
        sb.AppendLine("          ]");
        sb.AppendLine("        },");
        sb.AppendLine("        {");
        sb.AppendLine("          topicTitle: \"Repertoire Songs - Friend & Funky Groove (Lesson Book p. 106)\",");
        sb.AppendLine("          exercises: [");
        sb.AppendLine("            " + MakeChordEx("lb-s20-song-friend", "Song: Friend (CD #5 Track 17, p. 106)", 72, new string[]{
            "E:all","Aadd9:5-1","B7:5-1","Aadd9:5-1","E:all","C#m7:5-1","F#m7:all","B7:5-1","E:all"
        }) + ",");
        sb.AppendLine("            " + MakeChordEx("lb-s20-song-funky", "Song: Funky Groove (CD #5 Track 18, p. 106)", 95, new string[]{
            "E9:5-1","A13:all","E9:5-1","B7#9:5-1","E9:5-1","A13:all","E9:5-1","B7#9:5-1"
        }));
        sb.AppendLine("          ]");
        sb.AppendLine("        }");
    }

    // =========================================================================
    // BONUS WORKSHOPS 1-20 (100% Faithful to Bonus Resources Book v1.2)
    // =========================================================================
    private static void BuildBonusWorkshop(StringBuilder sb, int w) {
        sb.AppendLine("    {");
        sb.AppendLine(string.Format("      sessionNumber: {0},", w));
        sb.AppendLine(string.Format("      sessionTitle: \"Workshop {0}: {1}\",", w, Escape(GetBonusTitle(w))));
        sb.AppendLine(string.Format("      sessionSubtitle: \"{0}\",", Escape(GetBonusSubtitle(w))));
        sb.AppendLine("      topics: [");
        BuildBonusWorkshopTopics(sb, w);
        sb.AppendLine("      ]");
        sb.Append("    }");
    }

    private static void BuildBonusWorkshopTopics(StringBuilder sb, int w) {
        if (w == 1) {
            sb.AppendLine("        {");
            sb.AppendLine("          topicTitle: \"Finger Exercise 1 Across All 6 Strings (Bonus Book p. 5)\",");
            sb.AppendLine("          exercises: [");
            for (int str = 1; str <= 6; str++) {
                sb.AppendLine("            " + MakeFingerEx("bw-w1-fe1-s" + str, "Finger Exercise 1 on String " + str + " (1-1-1-1 2-2-2-2 3-3-3-3 4-4-4-4)", str, new int[]{1,1,1,1, 2,2,2,2, 3,3,3,3, 4,4,4,4}, 60) + (str < 6 ? "," : ""));
            }
            sb.AppendLine("          ]");
            sb.AppendLine("        },");
            sb.AppendLine("        {");
            sb.AppendLine("          topicTitle: \"Finger Exercises 2, 3 & Alternating Finger Exercise (Bonus Book p. 6-8)\",");
            sb.AppendLine("          exercises: [");
            sb.AppendLine("            " + MakeFingerEx("bw-w1-fe2", "Finger Exercise 2: Two Picks Per Finger (1-1 2-2 3-3 4-4, p. 6)", 1, new int[]{1,1, 2,2, 3,3, 4,4, 3,3, 2,2, 1,1, 1,1}, 60) + ",");
            sb.AppendLine("            " + MakeMultiStringMelody("bw-w1-fe3", "Finger Exercise 3: One Pick Per Finger (1-2-3-4-3-2-1, All Down, p. 7)", 60, new string[]{
                "F:1:1:quarter","F#:1:2:quarter","G:1:3:quarter","G#:1:4:quarter",
                "G:1:3:quarter","F#:1:2:quarter","F:1:1:half"
            }) + ",");
            sb.AppendLine("            " + MakeFingerEx("bw-w1-alt", "Alternating Finger Exercise: 1-3-2-4 & 4-2-3-1 (p. 8)", 1, new int[]{1,3,2,4, 4,2,3,1, 1,3,2,4, 4,2,3,1}, 65));
            sb.AppendLine("          ]");
            sb.AppendLine("        },");
            sb.AppendLine("        {");
            sb.AppendLine("          topicTitle: \"C & G7 Chord Exercise - Full, 4-Note & 3-Note Forms (Bonus Book p. 9)\",");
            sb.AppendLine("          exercises: [");
            sb.AppendLine("            " + MakeChordEx("bw-w1-ch-speed", "C & G7 Chord Switching Exercise (Use Full, 4-Note, or 3-Note Mode, p. 9)", 65, new string[]{"C:5-1","G7:all","C:5-1","G7:all","C:5-1","C:5-1","G7:all","C:5-1"}));
            sb.AppendLine("          ]");
            sb.AppendLine("        }");
        } else if (w == 2) {
            sb.AppendLine("        {");
            sb.AppendLine("          topicTitle: \"First & Second String Exercises (Bonus Book p. 12-17)\",");
            sb.AppendLine("          exercises: [");
            // Bonus p. 12 Ex 1: 7 Whole notes (G, F, E, G, E, F, E)
            sb.AppendLine("            " + MakeMelody("bw-w2-s1", "First String Exercise 1: Whole Notes (7 Bars: G, F, E, p. 12)", 1, new int[]{3,1,0,3,0,1,0}, 65, "Whole") + ",");
            // Bonus p. 12 Ex 2: 4 Half-Note bars (G-E | G-E | F-E | F-G)
            sb.AppendLine("            " + MakeMelody("bw-w2-s1-ex2", "First String Exercise 2: Half Notes (4 Bars, p. 12)", 1, new int[]{3,0, 3,0, 1,0, 1,3}, 65, "Half") + ",");
            // Bonus p. 12 Ex 3 & p. 13: Quarter/Half agility & More First String
            sb.AppendLine("            " + MakeMultiStringMelody("bw-w2-s1-more", "First String Exercises 3, 4 & More First String (p. 12-13)", 65, new string[]{
                "High E:1:0:quarter","F:1:1:quarter","G:1:3:quarter","F:1:1:quarter",
                "High E:1:0:quarter","F:1:1:quarter","High E:1:0:half",
                "High E:1:0:quarter","G:1:3:quarter","F:1:1:quarter","F:1:1:quarter",
                "High E:1:0:whole"
            }) + ",");
            // Bonus p. 14 Ex 1: 7 Whole notes on 2nd String (D, C, B, D, B, C, B)
            sb.AppendLine("            " + MakeMelody("bw-w2-s2", "Second String Exercise 1: Whole Notes (7 Bars: D, C, B, p. 14)", 2, new int[]{3,1,0,3,0,1,0}, 65, "Whole") + ",");
            // Bonus p. 14 Ex 2-4 & p. 15: More Second String Exercises
            sb.AppendLine("            " + MakeMultiStringMelody("bw-w2-s2-more", "Second String Exercises 2-4 & More Second String (p. 14-15)", 65, new string[]{
                "D:2:3:half","B:2:0:half",
                "C:2:1:half","D:2:3:half",
                "B:2:0:quarter","C:2:1:quarter","D:2:3:quarter","C:2:1:quarter",
                "B:2:0:whole"
            }) + ",");
            sb.AppendLine("            " + MakeMultiStringMelody("bw-w2-comb", "First and Second String Combined (p. 16)", 65, new string[]{
                "B:2:0:quarter","C:2:1:quarter","D:2:3:quarter","High E:1:0:quarter",
                "F:1:1:quarter","G:1:3:quarter","F:1:1:quarter","High E:1:0:quarter",
                "D:2:3:half","C:2:1:half",
                "B:2:0:whole"
            }) + ",");
            sb.AppendLine("            " + MakeMultiStringMelody("bw-w2-rests", "More 1st & 2nd String Exercises with Rests (p. 17)", 65, new string[]{
                "High E:1:0:quarter","F:1:1:quarter","G:1:3:quarter","REST:0:0:quarter",
                "D:2:3:quarter","C:2:1:quarter","B:2:0:quarter","REST:0:0:quarter",
                "C:2:1:half","REST:0:0:half",
                "High E:1:0:whole"
            }));
            sb.AppendLine("          ]");
            sb.AppendLine("        },");
            sb.AppendLine("        {");
            sb.AppendLine("          topicTitle: \"Bonus Repertoire Songs - London Bridge & Skip to My Lou (Bonus Book p. 18-19)\",");
            sb.AppendLine("          exercises: [");
            sb.AppendLine("            " + MakeMultiStringMelody("bw-w2-song-london", "Song: London Bridge is Falling Down (p. 18)", 80, new string[]{
                "High E:1:0:quarter","D:2:3:quarter","C:2:1:quarter","D:2:3:quarter",
                "High E:1:0:quarter","High E:1:0:quarter","High E:1:0:half",
                "D:2:3:quarter","D:2:3:quarter","D:2:3:half",
                "High E:1:0:quarter","G:1:3:quarter","G:1:3:half",
                "High E:1:0:quarter","D:2:3:quarter","C:2:1:quarter","D:2:3:quarter",
                "High E:1:0:quarter","High E:1:0:quarter","High E:1:0:half",
                "D:2:3:half","High E:1:0:half",
                "C:2:1:whole"
            }, 4, new string[]{"C","C","G7","C", "C","C","G7","C"}) + ",");
            sb.AppendLine("            " + MakeMultiStringMelody("bw-w2-song-skip", "Song: Skip To My Lou (p. 19)", 80, new string[]{
                "High E:1:0:half","C:2:1:quarter","High E:1:0:quarter",
                "C:2:1:quarter","C:2:1:quarter","G:1:3:half",
                "D:2:3:half","B:2:0:quarter","D:2:3:quarter",
                "B:2:0:quarter","B:2:0:quarter","F:1:1:half",
                "High E:1:0:half","C:2:1:quarter","High E:1:0:quarter",
                "C:2:1:quarter","C:2:1:quarter","G:1:3:half",
                "D:2:3:quarter","D:2:3:quarter","High E:1:0:quarter","D:2:3:quarter",
                "C:2:1:whole"
            }, 4, new string[]{"C","C","G7","G7", "C","C","G7","C"}));
            sb.AppendLine("          ]");
            sb.AppendLine("        }");
        } else if (w == 3) {
            sb.AppendLine("        {");
            sb.AppendLine("          topicTitle: \"Third & Fourth String Exercises (Bonus Book p. 22-25)\",");
            sb.AppendLine("          exercises: [");
            sb.AppendLine("            " + MakeMelody("bw-w3-s3", "Third String Exercises (p. 22)", 3, new int[]{0,2,0,2, 0,2,0,0}, 60, "Quarter") + ",");
            sb.AppendLine("            " + MakeMelody("bw-w3-s3-more", "More Third String Exercises (Sight-Reading p. 23)", 3, new int[]{2,0,2,0, 2,2,0,0}, 60, "Quarter") + ",");
            sb.AppendLine("            " + MakeMelody("bw-w3-s4", "Fourth String Exercises (p. 24)", 4, new int[]{0,2,3,2, 0,3,2,0}, 60, "Quarter") + ",");
            sb.AppendLine("            " + MakeMelody("bw-w3-s4-more", "More Fourth String Exercises (Sight-Reading p. 25)", 4, new int[]{3,2,0,2, 3,3,2,0}, 60, "Quarter"));
            sb.AppendLine("          ]");
            sb.AppendLine("        },");
            sb.AppendLine("        {");
            sb.AppendLine("          topicTitle: \"Ties, Dots & Rests! (Bonus Book p. 26)\",");
            sb.AppendLine("          exercises: [");
            sb.AppendLine("            " + MakeTiedExercise("bw-w3-ties-dots", "Ties, Dots & Rests Workout (p. 26)", 60));
            sb.AppendLine("          ]");
            sb.AppendLine("        },");
            sb.AppendLine("        {");
            sb.AppendLine("          topicTitle: \"Bonus Repertoire Songs - Amazing Grace & Merry Christmas (Bonus Book p. 27-28)\",");
            sb.AppendLine("          exercises: [");
            sb.AppendLine("            " + MakeMultiStringMelody("bw-w3-song-amazing-grace", "Song: Amazing Grace (p. 27)", 70, new string[]{
                "D:4:0:quarter","G:3:0:half",
                "B:2:0:quarter","B:2:0:half",
                "A:3:2:quarter","G:3:0:half",
                "E:4:2:quarter","D:4:0:half",
                "D:4:0:quarter","G:3:0:half",
                "B:2:0:quarter","B:2:0:half",
                "A:3:2:quarter","D:2:3:half",
                "D:2:3:dotted-half",
                "B:2:0:quarter","D:2:3:half",
                "B:2:0:quarter","B:2:0:half",
                "A:3:2:quarter","G:3:0:half",
                "E:4:2:quarter","D:4:0:half",
                "D:4:0:quarter","G:3:0:half",
                "B:2:0:quarter","B:2:0:half",
                "A:3:2:quarter","G:3:0:half",
                "G:3:0:dotted-half"
            }, 3, new string[]{"G","G","C","G","G","Em","D","D","G","G","C","G","Em","D","G","G"}) + ",");
            sb.AppendLine("            " + MakeMultiStringMelody("bw-w3-song-merry-christmas", "Song: We Wish You A Merry Christmas (p. 28)", 75, new string[]{
                "D:4:0:quarter","G:3:0:quarter","G:3:0:quarter",
                "A:3:2:quarter","G:3:0:quarter","F#:4:4:quarter",
                "E:4:2:quarter","E:4:2:quarter","E:4:2:quarter",
                "A:3:2:quarter","A:3:2:quarter","B:2:0:quarter",
                "A:3:2:quarter","G:3:0:quarter","F#:4:4:quarter",
                "D:4:0:quarter","D:4:0:quarter","D:4:0:quarter",
                "B:2:0:quarter","B:2:0:quarter","C:2:1:quarter",
                "B:2:0:quarter","A:3:2:quarter","G:3:0:quarter",
                "E:4:2:quarter","D:4:0:quarter","D:4:0:quarter",
                "E:4:2:quarter","A:3:2:quarter","F#:4:4:quarter",
                "G:3:0:dotted-half"
            }, 3, new string[]{"G","C","A7","D","B7","Em","C","D","G","D7","G"}));
            sb.AppendLine("          ]");
            sb.AppendLine("        }");
        } else if (w == 4) {
            sb.AppendLine("        {");
            sb.AppendLine("          topicTitle: \"Fifth & Sixth String Exercises, Sharps, Flats & Naturals (Bonus Book p. 31-35)\",");
            sb.AppendLine("          exercises: [");
            sb.AppendLine("            " + MakeMelody("bw-w4-s5", "Fifth String Exercises (p. 31)", 5, new int[]{0,2,3,2, 0,3,2,0}, 60, "Quarter") + ",");
            sb.AppendLine("            " + MakeMelody("bw-w4-s5-more", "More Fifth String Exercises (Sight-Reading p. 32)", 5, new int[]{3,2,0,2, 3,3,2,0}, 60, "Quarter") + ",");
            sb.AppendLine("            " + MakeMelody("bw-w4-s6", "Sixth String Exercises (p. 33)", 6, new int[]{0,1,3,1, 0,3,1,0}, 60, "Quarter") + ",");
            sb.AppendLine("            " + MakeMelody("bw-w4-s6-more", "More Sixth String Exercises (Sight-Reading p. 34)", 6, new int[]{3,1,0,1, 3,3,1,0}, 60, "Quarter") + ",");
            sb.AppendLine("            " + MakeMultiStringMelody("bw-w4-accidentals", "Sharps, Flats & Naturals Drills (p. 35)", 60, new string[]{"Low E:6:0:quarter","F#:6:2:quarter","G:6:3:quarter","G#:6:4:quarter","A:5:0:quarter","Bb:5:1:quarter","B:5:2:quarter","C:5:3:quarter","Low E:6:0:whole"}));
            sb.AppendLine("          ]");
            sb.AppendLine("        },");
            sb.AppendLine("        {");
            sb.AppendLine("          topicTitle: \"Bonus Songs & Am/E Chord Exercise (Bonus Book p. 36-38)\",");
            sb.AppendLine("          exercises: [");
            sb.AppendLine("            " + MakeMultiStringMelody("bw-w4-song-fur-elise", "Song: Fur Elise (p. 36)", 75, new string[]{
                "High E:1:0:quarter","D#:2:4:quarter","High E:1:0:quarter",
                "D#:2:4:quarter","High E:1:0:quarter","B:2:0:quarter",
                "D:2:3:quarter","C:2:1:quarter","A:3:2:quarter",
                "C:5:3:quarter","E:4:2:quarter","A:3:2:quarter",
                "B:2:0:dotted-half",
                "E:4:2:quarter","G#:3:1:quarter","B:2:0:quarter",
                "C:2:1:dotted-half",
                "High E:1:0:quarter","D#:2:4:quarter","High E:1:0:quarter",
                "D#:2:4:quarter","High E:1:0:quarter","B:2:0:quarter",
                "D:2:3:quarter","C:2:1:quarter","A:3:2:quarter",
                "C:5:3:quarter","E:4:2:quarter","A:3:2:quarter",
                "B:2:0:dotted-half",
                "E:4:2:quarter","C:2:1:quarter","B:2:0:quarter",
                "A:3:2:dotted-half"
            }, 3, new string[]{"Am","E7","Am","Am","E7","E7","Am","Am","Am","E7","Am","Am","E7","E7","Am"}) + ",");
            sb.AppendLine("            " + MakeMultiStringMelody("bw-w4-song-entertainer", "Song: The Entertainer (p. 37)", 80, new string[]{
                "D:4:0:quarter","D#:4:1:quarter","E:4:2:quarter","C:2:1:quarter",
                "E:4:2:quarter","C:2:1:quarter","E:4:2:half",
                "C:2:1:quarter","D:2:3:quarter","D#:2:4:quarter","High E:1:0:quarter",
                "C:2:1:quarter","D:2:3:quarter","High E:1:0:half",
                "D:4:0:quarter","D#:4:1:quarter","E:4:2:quarter","C:2:1:quarter",
                "E:4:2:quarter","C:2:1:quarter","E:4:2:half",
                "A:3:2:quarter","B:2:0:quarter","C:2:1:quarter","D:2:3:quarter",
                "G:3:0:whole"
            }, 4, new string[]{"C","C","C","G7","C","C","D7","G7"}) + ",");
            sb.AppendLine("            " + MakeChordEx("bw-w4-ch-am-e", "Am & E Chord Exercise (Use Full, 4-Note, or 3-Note Mode, p. 38)", 70, new string[]{"Am:5-1","E:all","Am:5-1","E:all"}));
            sb.AppendLine("          ]");
            sb.AppendLine("        }");
        } else if (w == 5) {
            sb.AppendLine("        {");
            sb.AppendLine("          topicTitle: \"Basic Open Chords & Groupings (Bonus Book p. 41-44)\",");
            sb.AppendLine("          exercises: [");
            sb.AppendLine("            " + MakeChordEx("bw-w5-grp1", "The C, G7, Am, E & Dm Chords (p. 41)", 68, new string[]{"C:5-1","G7:all","Am:5-1","E:all","Dm:4-1","C:5-1"}) + ",");
            sb.AppendLine("            " + MakeChordEx("bw-w5-grp2", "The G, D7, Em & B7 Chords (p. 42)", 70, new string[]{"G:all","D7:4-1","Em:all","B7:5-1","G:all"}) + ",");
            sb.AppendLine("            " + MakeChordEx("bw-w5-grp3", "The D, C7, A, A7 & E7 Chords (p. 43)", 72, new string[]{"D:4-1","C7:5-1","A:5-1","A7:5-1","E7:all","D:4-1"}) + ",");
            sb.AppendLine("            " + MakeChordEx("bw-w5-grp4", "All Basic Open Chords Mastery (p. 44)", 75, new string[]{"C:5-1","G:all","D:4-1","A:5-1","E:all","Am:5-1","Dm:4-1","Em:all"}));
            sb.AppendLine("          ]");
            sb.AppendLine("        },");
            sb.AppendLine("        {");
            sb.AppendLine("          topicTitle: \"Bonus Songs - Jolly Good Fellow & Turkey in the Straw (Bonus Book p. 45-46)\",");
            sb.AppendLine("          exercises: [");
            sb.AppendLine("            " + MakeChordEx("bw-w5-song-jolly", "Song: He's a Jolly Good Fellow (p. 45)", 80, new string[]{"G:all","C:5-1","G:all","D7:4-1","G:all","C:5-1","D7:4-1","G:all"}, 3) + ",");
            sb.AppendLine("            " + MakeChordEx("bw-w5-song-turkey", "Song: Turkey in the Straw (p. 46)", 85, new string[]{"G:all","G:all","C:5-1","D7:4-1","G:all","G:all","D7:4-1","G:all"}));
            sb.AppendLine("          ]");
            sb.AppendLine("        }");
        } else if (w == 6) {
            sb.AppendLine("        {");
            sb.AppendLine("          topicTitle: \"Open Minor 7th & Suspended Chords (Bonus Book p. 49-50)\",");
            sb.AppendLine("          exercises: [");
            sb.AppendLine("            " + MakeChordEx("bw-w6-m7", "Open Minor Seventh Chords Practice (p. 49)", 84, new string[]{"Am7:5-1","Dm7:4-1","Em7:all","Am7:5-1"}) + ",");
            sb.AppendLine("            " + MakeChordEx("bw-w6-sus", "Open Suspended Chords Practice (p. 50)", 84, new string[]{"Asus:5-1","Dsus:4-1","Esus:all","Csus:5-1"}));
            sb.AppendLine("          ]");
            sb.AppendLine("        },");
            sb.AppendLine("        {");
            sb.AppendLine("          topicTitle: \"Strumming Patterns #1, #2, #3 Practice (Bonus Book p. 51-53)\",");
            sb.AppendLine("          exercises: [");
            sb.AppendLine("            " + MakeSyncopatedStrumPattern("bw-w6-pat1", "Strumming Pattern #1 Practice (p. 51)", 84, 1, new string[]{"G:all","Em7:all","C:5-1","D:4-1"}) + ",");
            sb.AppendLine("            " + MakeSyncopatedStrumPattern("bw-w6-pat2", "Strumming Pattern #2 Practice (p. 52)", 84, 2, new string[]{"Am:5-1","C:5-1","G:all","D:4-1"}) + ",");
            sb.AppendLine("            " + MakeSyncopatedStrumPattern("bw-w6-pat3", "Strumming Pattern #3 Practice (p. 53)", 84, 3, new string[]{"C:5-1","G:all","Am:5-1","F:all"}));
            sb.AppendLine("          ]");
            sb.AppendLine("        }");
        } else if (w == 7) {
            sb.AppendLine("        {");
            sb.AppendLine("          topicTitle: \"Sixth String Barre Chords (Bonus Book p. 56-58)\",");
            sb.AppendLine("          exercises: [");
            sb.AppendLine("            " + MakeChordEx("bw-w7-barre-6", "Sixth String Barre Chords (p. 56)", 72, new string[]{"F Barre:all","G Barre:all","A Barre:all","F Barre:all"}) + ",");
            sb.AppendLine("            " + MakeChordEx("bw-w7-more-barre", "More Sixth String Barre Chords (p. 57)", 72, new string[]{"Bb Barre:all","C Barre:all","D Barre:all","Bb Barre:all"}) + ",");
            sb.AppendLine("            " + MakeChordEx("bw-w7-even-more", "Even More Sixth String Barre Chords (p. 58)", 72, new string[]{"Ab Barre:all","Eb Barre:all","Db Barre:all","Ab Barre:all"}));
            sb.AppendLine("          ]");
            sb.AppendLine("        },");
            sb.AppendLine("        {");
            sb.AppendLine("          topicTitle: \"Major Scales Worksheets & Mix Up (Bonus Book p. 59-62)\",");
            sb.AppendLine("          exercises: [");
            sb.AppendLine("            " + MakeMultiStringMelody("bw-w7-scale-drills", "Major Scales Worksheet Drills (p. 59)", 72, new string[]{"G:6:3:quarter","A:6:5:quarter","B:5:2:quarter","C:5:3:quarter","D:5:5:quarter","E:4:2:quarter","F#:4:4:quarter","G:4:5:quarter","G:4:5:whole"}) + ",");
            sb.AppendLine("            " + MakeMultiStringMelody("bw-w7-scale-mix", "The Ultimate Major Scale Mix Up (p. 62)", 75, new string[]{"C:5:3:quarter","D:5:5:quarter","E:4:2:quarter","F:4:3:quarter","G:4:5:quarter","A:3:2:quarter","B:3:4:quarter","C:3:5:quarter","C:3:5:whole"}));
            sb.AppendLine("          ]");
            sb.AppendLine("        }");
        } else if (w == 8) {
            sb.AppendLine("        {");
            sb.AppendLine("          topicTitle: \"Fifth String Barre Chords & Mixed Chords (Bonus Book p. 65-67)\",");
            sb.AppendLine("          exercises: [");
            sb.AppendLine("            " + MakeChordEx("bw-w8-barre-5", "Fifth String Barre Chords (p. 65)", 72, new string[]{"Bb Barre:5-1","C Barre:5-1","D Barre:5-1","Bb Barre:5-1"}) + ",");
            sb.AppendLine("            " + MakeChordEx("bw-w8-mixed", "Mixed Open and Barre Chords (p. 67)", 72, new string[]{"G:all","C Barre:5-1","D Barre:5-1","G:all"}));
            sb.AppendLine("          ]");
            sb.AppendLine("        },");
            sb.AppendLine("        {");
            sb.AppendLine("          topicTitle: \"Keys & Key Signatures Worksheet (Bonus Book p. 68-71)\",");
            sb.AppendLine("          exercises: [");
            sb.AppendLine("            " + MakeChordEx("bw-w8-keys", "Determining a Key & Progressions (p. 69)", 72, new string[]{"D:4-1","G:all","A:5-1","D:4-1"}));
            sb.AppendLine("          ]");
            sb.AppendLine("        }");
        } else if (w == 9) {
            sb.AppendLine("        {");
            sb.AppendLine("          topicTitle: \"Strumming with Eighth Notes & Ties (Bonus Book p. 76-77)\",");
            sb.AppendLine("          exercises: [");
            sb.AppendLine("            " + Make8thMotorStrum("bw-w9-8th-strum", "Strumming with Eighth Notes (p. 76)", 80, "G") + ",");
            sb.AppendLine("            " + MakeSyncopatedStrumPattern("bw-w9-8th-ties", "Strumming with Eighth Notes & Ties (p. 77)", 85, 2, new string[]{"C:5-1","Am:5-1","F Barre:all","G:all"}));
            sb.AppendLine("          ]");
            sb.AppendLine("        },");
            sb.AppendLine("        {");
            sb.AppendLine("          topicTitle: \"Interval Naming, Diatonic & Harmonic Intervals (Bonus Book p. 78-87)\",");
            sb.AppendLine("          exercises: [");
            sb.AppendLine("            " + MakeMultiStringMelody("bw-w9-diatonic", "Diatonic Intervals Worksheet (p. 79)", 70, new string[]{"C:5:3:half","D:5:5:half","C:5:3:half","E:4:2:half","C:5:3:whole"}) + ",");
            sb.AppendLine("            " + MakeMultiStringMelody("bw-w9-harmonic", "Harmonic Intervals & Ultimate Challenge (p. 87)", 75, new string[]{"G:6:3:half","B:5:2:half","G:6:3:half","D:5:5:half","G:6:3:whole"}));
            sb.AppendLine("          ]");
            sb.AppendLine("        }");
        } else if (w == 10) {
            sb.AppendLine("        {");
            sb.AppendLine("          topicTitle: \"Finger Patterns #1-3 & Dm Etude (Bonus Book p. 90-95)\",");
            sb.AppendLine("          exercises: [");
            sb.AppendLine("            " + MakePimaExercise("bw-w10-fp1", "Finger Pattern #1 Exercises (P-I-M-A, p. 92)", 92, 1) + ",");
            sb.AppendLine("            " + MakePimaExercise("bw-w10-fp2", "Finger Pattern #2 Exercises (P-A-M-I, p. 93)", 92, 2) + ",");
            sb.AppendLine("            " + MakePimaExercise("bw-w10-fp3", "Finger Pattern #3 Exercises (P-M-I-A, p. 94)", 92, 3) + ",");
            sb.AppendLine("            " + MakeChordEx("bw-w10-dm-etude", "Dm Etude (p. 95)", 75, new string[]{"Dm:4-1","A7:5-1","Dm:4-1","Gm:all","A7:5-1","Dm:4-1"}));
            sb.AppendLine("          ]");
            sb.AppendLine("        },");
            sb.AppendLine("        {");
            sb.AppendLine("          topicTitle: \"Canon in D Revised (Bonus Book p. 98)\",");
            sb.AppendLine("          exercises: [");
            sb.AppendLine("            " + MakeChordEx("bw-w10-canon-rev", "Canon in D Revised (p. 98)", 70, new string[]{"D:4-1","A:5-1","Bm:5-1","F#m:all","G:all","D:4-1","G:all","A:5-1"}));
            sb.AppendLine("          ]");
            sb.AppendLine("        }");
        } else if (w == 11) {
            sb.AppendLine("        {");
            sb.AppendLine("          topicTitle: \"Pentatonic Scales Worksheet & Connected Boxes (Bonus Book p. 102-106)\",");
            sb.AppendLine("          exercises: [");
            sb.AppendLine("            " + MakePentatonicBox1("bw-w11-mix", "Pentatonic Scales Ultimate Mix Up (p. 103)", 85) + ",");
            sb.AppendLine("            " + MakePentatonicBox2("bw-w11-conn-c", "Connected Pentatonic Scales in C & Am (p. 104)", 85));
            sb.AppendLine("          ]");
            sb.AppendLine("        }");
        } else if (w == 12) {
            sb.AppendLine("        {");
            sb.AppendLine("          topicTitle: \"Two Chord Exercises (Bonus Book p. 110)\",");
            sb.AppendLine("          exercises: [");
            sb.AppendLine("            " + MakeChordEx("bw-w12-two-chords", "Two Chord Exercises (p. 110)", 80, new string[]{"C:5-1","Cadd9:5-1","G:all","Gadd9:all"}));
            sb.AppendLine("          ]");
            sb.AppendLine("        }");
        } else if (w == 13) {
            sb.AppendLine("        {");
            sb.AppendLine("          topicTitle: \"Pentatonic Blues Forms in A & Triads (Bonus Book p. 113-116)\",");
            sb.AppendLine("          exercises: [");
            sb.AppendLine("            " + MakeBluesScaleA("bw-w13-blues-forms", "Pentatonic Blues Forms in A (p. 113)", 80) + ",");
            sb.AppendLine("            " + MakeChordEx("bw-w13-triads-wk", "Triads & Triads Worksheet (p. 114)", 75, new string[]{"A Triad:3-1","D Triad:3-1","E Triad:3-1","A Triad:3-1"}));
            sb.AppendLine("          ]");
            sb.AppendLine("        }");
        } else if (w == 14) {
            sb.AppendLine("        {");
            sb.AppendLine("          topicTitle: \"Sliding Exercises & Arpeggio Exercises (Bonus Book p. 119-120)\",");
            sb.AppendLine("          exercises: [");
            sb.AppendLine("            " + MakeMultiStringMelody("bw-w14-slides", "Sliding Exercises (p. 119)", 75, new string[]{"Low E:6:3:quarter","Low E:6:5:quarter","A:5:5:quarter","A:5:7:quarter","D:4:7:half","Low E:6:3:whole"}) + ",");
            sb.AppendLine("            " + MakePimaExercise("bw-w14-arpeggios", "Arpeggio Exercises (p. 120)", 78));
            sb.AppendLine("          ]");
            sb.AppendLine("        }");
        } else if (w == 15) {
            sb.AppendLine("        {");
            sb.AppendLine("          topicTitle: \"Power Chord Exercises & Harmonized Scales (Bonus Book p. 126-127)\",");
            sb.AppendLine("          exercises: [");
            sb.AppendLine("            " + MakeChordEx("bw-w15-power", "Power Chord Exercises (p. 126)", 85, new string[]{"E5:6-5","G5:6-5","A5:5-4","B5:5-4","E5:6-5"}) + ",");
            sb.AppendLine("            " + MakeChordEx("bw-w15-harm-scale", "Harmonized Major Scales Worksheet (I-ii-iii-IV-V-vi-viidim, p. 127)", 80, new string[]{"G:all","Am:5-1","Bm:5-1","C:5-1","D:4-1","Em:all","G:all"}));
            sb.AppendLine("          ]");
            sb.AppendLine("        }");
        } else if (w == 16) {
            sb.AppendLine("        {");
            sb.AppendLine("          topicTitle: \"Basic & Advanced 16th-Note Strumming Exercises (Bonus Book p. 130-131)\",");
            sb.AppendLine("          exercises: [");
            sb.AppendLine("            " + Make16thStrumExercise("bw-w16-basic-strum", "Basic 16th-Note Strumming Exercises (p. 130)", 72, new string[]{"C","G","Am","F"}) + ",");
            sb.AppendLine("            " + Make16thStrumExercise("bw-w16-adv-strum", "Advanced 16th-Note Strumming Exercises (p. 131)", 76, new string[]{"Em","C","G","D"}));
            sb.AppendLine("          ]");
            sb.AppendLine("        }");
        } else if (w == 17) {
            sb.AppendLine("        {");
            sb.AppendLine("          topicTitle: \"Three Note on a String Scales & 7th Chords (Bonus Book p. 134-145)\",");
            sb.AppendLine("          exercises: [");
            sb.AppendLine("            " + MakeMultiStringMelody("bw-w17-scales-f", "Three Note on a String Scales in F (p. 134)", 75, new string[]{
                "Low E:6:1:quarter","Low E:6:3:quarter","Low E:6:5:quarter",
                "A:5:1:quarter","A:5:3:quarter","A:5:5:quarter",
                "Low E:6:1:whole"
            }) + ",");
            sb.AppendLine("            " + MakeMultiStringMelody("bw-w17-scales-d", "Three Note on a String Scales in D (p. 137)", 75, new string[]{
                "Low E:6:10:quarter","Low E:6:12:quarter","Low E:6:14:quarter",
                "A:5:10:quarter","A:5:12:quarter","A:5:14:quarter",
                "Low E:6:10:whole"
            }) + ",");
            sb.AppendLine("            " + MakeChordEx("bw-w17-7th-chords", "Seventh Chords Worksheet (Maj7, m7, 7, m7b5, dim7, p. 145)", 72, new string[]{"Cmaj7:5-1","Dm7:4-1","Em7:all","Fmaj7:4-1","G7:all","Am7:5-1"}));
            sb.AppendLine("          ]");
            sb.AppendLine("        }");
        } else if (w == 18) {
            sb.AppendLine("        {");
            sb.AppendLine("          topicTitle: \"Chord Melody, Color Tones & Ninth Chords (Bonus Book p. 148-153)\",");
            sb.AppendLine("          exercises: [");
            sb.AppendLine("            " + MakeChordEx("bw-w18-chord-melody", "Chord Melody & ii-V-I Exercises (p. 148)", 72, new string[]{"Cmaj7:5-1","Am9:5-1","Dm9:4-1","G13:all"}) + ",");
            sb.AppendLine("            " + MakeChordEx("bw-w18-ninth-table", "Ninth Chord Explanation & Table (p. 152)", 75, new string[]{"C9:5-1","F9:all","G9:all","C9:5-1"}));
            sb.AppendLine("          ]");
            sb.AppendLine("        }");
        } else if (w == 19) {
            sb.AppendLine("        {");
            sb.AppendLine("          topicTitle: \"Building a Solo from the Ground Up (Bonus Book p. 156)\",");
            sb.AppendLine("          exercises: [");
            sb.AppendLine("            " + MakeMultiStringMelody("bw-w19-solo-ground", "Building a Solo from the Ground Up (p. 156)", 75, new string[]{
                "A:3:2:quarter","C:2:1:quarter","D:2:3:quarter","High E:1:0:quarter",
                "G:1:3:half","High E:1:0:half",
                "D:2:3:quarter","C:2:1:quarter","A:3:2:half",
                "A:3:2:whole"
            }));
            sb.AppendLine("          ]");
            sb.AppendLine("        }");
        } else if (w == 20) {
            sb.AppendLine("        {");
            sb.AppendLine("          topicTitle: \"Chords Bonus Exercises (Bonus Book p. 161)\",");
            sb.AppendLine("          exercises: [");
            sb.AppendLine("            " + MakeChordEx("bw-w20-chords-bonus", "Chords Bonus Exercises (p. 161)", 80, new string[]{"Cmaj7:5-1","G13:all","Am9:5-1","Dm11:4-1","Fmaj7#11:4-1","E7#9:all","A13:all","D9:5-1"}));
            sb.AppendLine("          ]");
            sb.AppendLine("        }");
        }
    }

    // =========================================================================
    // EXERCISE GENERATOR PRIMITIVES (Concise, robust, mathematically exact)
    // =========================================================================

    private static string MakeOpenStringTour(string id, string title, int bpm) {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine("{");
        sb.AppendLine(string.Format("  id: '{0}', title: '{1}',", EscapeSingleQuote(id), EscapeSingleQuote(title)));
        sb.AppendLine("  description: 'Instructions: Strike each open string cleanly with a downward pick stroke. Let it ring for 3 beats, then mute completely on beat 4 using the side of your picking hand.',");
        sb.AppendLine(string.Format("  timeSignature: [4, 4], defaultBpm: {0}, concepts: ['Tuning EADGBE', 'Beat 4 Rest', 'Palm Muting', 'Open Strings'],", bpm));
        sb.AppendLine("  tabData: [");
        sb.AppendLine("    { measure: 1, beats: [ " + MakeB(1,"Low E","3/4","play",6,0,0,"Down",3,"6th String Open") + ", " + MakeSustainB(2,"Low E","3/4",6,0,0,3,"Hold") + ", " + MakeSustainB(3,"Low E","3/4",6,0,0,3,"Hold") + ", " + MakeRestB(4,"REST",1,"Damp 6th string!") + " ] },");
        sb.AppendLine("    { measure: 2, beats: [ " + MakeB(1,"A","3/4","play",5,0,0,"Down",3,"5th String Open") + ", " + MakeSustainB(2,"A","3/4",5,0,0,3,"Hold") + ", " + MakeSustainB(3,"A","3/4",5,0,0,3,"Hold") + ", " + MakeRestB(4,"REST",1,"Damp 5th string!") + " ] },");
        sb.AppendLine("    { measure: 3, beats: [ " + MakeB(1,"D","3/4","play",4,0,0,"Down",3,"4th String Open") + ", " + MakeSustainB(2,"D","3/4",4,0,0,3,"Hold") + ", " + MakeSustainB(3,"D","3/4",4,0,0,3,"Hold") + ", " + MakeRestB(4,"REST",1,"Damp 4th string!") + " ] },");
        sb.AppendLine("    { measure: 4, beats: [ " + MakeB(1,"G","3/4","play",3,0,0,"Down",3,"3rd String Open") + ", " + MakeSustainB(2,"G","3/4",3,0,0,3,"Hold") + ", " + MakeSustainB(3,"G","3/4",3,0,0,3,"Hold") + ", " + MakeRestB(4,"REST",1,"Damp 3rd string!") + " ] },");
        sb.AppendLine("    { measure: 5, beats: [ " + MakeB(1,"B","3/4","play",2,0,0,"Down",3,"2nd String Open") + ", " + MakeSustainB(2,"B","3/4",2,0,0,3,"Hold") + ", " + MakeSustainB(3,"B","3/4",2,0,0,3,"Hold") + ", " + MakeRestB(4,"REST",1,"Damp 2nd string!") + " ] },");
        sb.AppendLine("    { measure: 6, beats: [ " + MakeB(1,"High E","3/4","play",1,0,0,"Down",3,"1st String Open") + ", " + MakeSustainB(2,"High E","3/4",1,0,0,3,"Hold") + ", " + MakeSustainB(3,"High E","3/4",1,0,0,3,"Hold") + ", " + MakeRestB(4,"REST",1,"Silence All Strings!") + " ] }");
        sb.AppendLine("  ]");
        sb.Append("}");
        return sb.ToString();
    }

    private static string MakeFingerEx(string id, string title, int str, int[] frets, int bpm) {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine("{");
        sb.AppendLine(string.Format("  id: '{0}', title: '{1}',", EscapeSingleQuote(id), EscapeSingleQuote(title)));
        sb.AppendLine("  description: 'Instructions: Place your thumb in the back of the neck behind your 2nd finger. Press down with the tip of each finger right behind the fret wire. Use alternate picking (Down-Up-Down-Up). Keep fingers arched on string " + str + ".',");
        sb.AppendLine(string.Format("  timeSignature: [4, 4], defaultBpm: {0}, concepts: ['String {1}', 'Alternate Picking', 'Finger Independence'],", bpm, str));
        sb.AppendLine("  tabData: [");

        int totalBeats = frets.Length;
        int numMeasures = (totalBeats + 3) / 4;
        for (int m = 0; m < numMeasures; m++) {
            sb.Append(string.Format("    {{ measure: {0}, beats: [ ", m + 1));
            for (int b = 0; b < 4; b++) {
                int idx = m * 4 + b;
                if (idx < frets.Length) {
                    int f = frets[idx];
                    string pick = (idx % 2 == 0) ? "Down" : "Up";
                    sb.Append(MakeB(b + 1, GetNoteName(str, f), "1/4", "play", str, f, GetFinger(f), pick, 1, "Fret " + f));
                } else {
                    sb.Append(MakeRestB(b + 1, "1/4", 1, "Rest"));
                }
                if (b < 3) sb.Append(", ");
            }
            sb.Append(" ] }" + (m < numMeasures - 1 ? ",\n" : "\n"));
        }
        sb.AppendLine("  ]");
        sb.Append("}");
        return sb.ToString();
    }

    private static string MakeChordEx(string id, string title, int bpm, string[] chords, int beatsPerMeasure = 4, string mode = "Quarter") {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine("{");
        sb.AppendLine(string.Format("  id: '{0}', title: '{1}',", EscapeSingleQuote(id), EscapeSingleQuote(title)));
        sb.AppendLine("  description: 'Instructions: Strum down cleanly across all indicated strings. Keep fingertips upright so they don\\'t mute adjacent open strings. Transition smoothly on beat 1 without hesitating.',");
        sb.AppendLine(string.Format("  timeSignature: [{0}, 4], defaultBpm: {1}, concepts: ['Chords', 'Rhythm Strumming', 'Smooth Transitions'],", beatsPerMeasure, bpm));
        sb.AppendLine("  tabData: [");
        for (int m = 0; m < chords.Length; m++) {
            string[] parts = chords[m].Split(':');
            string chord = parts[0];
            string strRange = parts.Length > 1 ? parts[1] : "all";
            sb.Append(string.Format("    {{ measure: {0}, chordName: '{1}', beats: [ ", m + 1, chord));
            if (mode == "Whole" && beatsPerMeasure == 4) {
                sb.Append(string.Format("{{ beat: 1, note: '{0}', symbol: '1/1', type: 'play', string: '{1}', fret: null, finger: null, pick: 'Down', duration: 4, isStart: true, isSustain: false, tip: 'Strum {0}' }}, ", chord, strRange));
                sb.Append(string.Format("{{ beat: 2, note: '{0}', symbol: '1/1', type: 'sustain', string: '{1}', fret: null, finger: null, pick: '-', duration: 4, isStart: false, isSustain: true, tip: 'Hold' }}, ", chord, strRange));
                sb.Append(string.Format("{{ beat: 3, note: '{0}', symbol: '1/1', type: 'sustain', string: '{1}', fret: null, finger: null, pick: '-', duration: 4, isStart: false, isSustain: true, tip: 'Hold' }}, ", chord, strRange));
                sb.Append(string.Format("{{ beat: 4, note: '{0}', symbol: '1/1', type: 'sustain', string: '{1}', fret: null, finger: null, pick: '-', duration: 4, isStart: false, isSustain: true, tip: 'Hold' }}", chord, strRange));
            } else if (mode == "Half" && beatsPerMeasure == 4) {
                sb.Append(string.Format("{{ beat: 1, note: '{0}', symbol: '1/2', type: 'play', string: '{1}', fret: null, finger: null, pick: 'Down', duration: 2, isStart: true, isSustain: false, tip: 'Strum {0}' }}, ", chord, strRange));
                sb.Append(string.Format("{{ beat: 2, note: '{0}', symbol: '1/2', type: 'sustain', string: '{1}', fret: null, finger: null, pick: '-', duration: 2, isStart: false, isSustain: true, tip: 'Hold' }}, ", chord, strRange));
                sb.Append(string.Format("{{ beat: 3, note: '{0}', symbol: '1/2', type: 'play', string: '{1}', fret: null, finger: null, pick: 'Down', duration: 2, isStart: true, isSustain: false, tip: 'Strum {0}' }}, ", chord, strRange));
                sb.Append(string.Format("{{ beat: 4, note: '{0}', symbol: '1/2', type: 'sustain', string: '{1}', fret: null, finger: null, pick: '-', duration: 2, isStart: false, isSustain: true, tip: 'Hold' }}", chord, strRange));
            } else {
                for (int b = 1; b <= beatsPerMeasure; b++) {
                    sb.Append(string.Format("{{ beat: {0}, note: '{1}', symbol: '1/4', type: 'play', string: '{2}', fret: null, finger: null, pick: '{3}', duration: 1, isStart: true, isSustain: false, tip: '{1} Strum' }}",
                        b, chord, strRange, b % 2 == 1 ? "Down" : "Up"));
                    if (b < beatsPerMeasure) sb.Append(", ");
                }
            }
            sb.Append(" ] }" + (m < chords.Length - 1 ? ",\n" : "\n"));
        }
        sb.AppendLine("  ]");
        sb.Append("}");
        return sb.ToString();
    }

    private static string MakeSyncopatedStrumPattern(string id, string title, int bpm, int patNum, string[] chords) {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine("{");
        sb.AppendLine(string.Format("  id: '{0}', title: '{1}',", EscapeSingleQuote(id), EscapeSingleQuote(title)));
        sb.AppendLine("  description: 'Instructions: The Secret to Great Strumming is KEEP YOUR HAND GOING! On tied beats, swing your hand down past the strings without touching them so your up-strum stays in rhythm.',");
        sb.AppendLine(string.Format("  timeSignature: [4, 4], defaultBpm: {0}, goalBpm: 84, concepts: ['Strumming Pattern #{1}', 'Syncopation', 'Keep Your Hand Going'],", bpm, patNum));
        sb.AppendLine("  tabData: [");
        for (int m = 0; m < chords.Length; m++) {
            string[] parts = chords[m].Split(':');
            string chord = parts[0];
            string strRange = parts.Length > 1 ? parts[1] : "all";
            sb.Append(string.Format("    {{ measure: {0}, chordName: '{1}', beats: [ ", m + 1, chord));
            if (patNum == 1) {
                // Pattern #1 (Lesson Book p. 38): 1 (Down), 2 (Down), 2& (Up tied to 3), 3 (Tie - Ghost Down), 3& (Up), 4 (Down)
                sb.Append(string.Format("{{ beat: 1, note: '{0}', symbol: '1/4', type: 'play', string: '{1}', fret: null, finger: null, pick: 'Down', duration: 1, isStart: true, isSustain: false, tip: 'Beat 1: Down' }}, ", chord, strRange));
                sb.Append(string.Format("{{ beat: 2, note: '{0}', symbol: '1/8', type: 'play', string: '{1}', fret: null, finger: null, pick: 'Down', duration: 0.5, isStart: true, isSustain: false, tip: 'Beat 2: Down' }}, ", chord, strRange));
                sb.Append(string.Format("{{ beat: 2, note: '{0}', symbol: '1/8', type: 'play', string: '{1}', fret: null, finger: null, pick: 'Up', duration: 0.5, isStart: true, isSustain: false, tip: '2-and: Up (tied to 3)' }}, ", chord, strRange));
                sb.Append(string.Format("{{ beat: 3, note: '{0}', symbol: '1/8', type: 'sustain', string: '{1}', fret: null, finger: null, pick: '-', duration: 0.5, isStart: false, isSustain: true, tip: 'Beat 3: TIE (Miss strings on Down!)' }}, ", chord, strRange));
                sb.Append(string.Format("{{ beat: 3, note: '{0}', symbol: '1/8', type: 'play', string: '{1}', fret: null, finger: null, pick: 'Up', duration: 0.5, isStart: true, isSustain: false, tip: '3-and: Up' }}, ", chord, strRange));
                sb.Append(string.Format("{{ beat: 4, note: '{0}', symbol: '1/4', type: 'play', string: '{1}', fret: null, finger: null, pick: 'Down', duration: 1, isStart: true, isSustain: false, tip: 'Beat 4: Down' }}", chord, strRange));
            } else if (patNum == 2) {
                // Pattern #2 (Lesson Book p. 38): 1 (Down), 1& (Up), 2 (Down), 2& (Up tied to 3), 3 (Tie - Ghost Down), 3& (Up), 4 (Down)
                sb.Append(string.Format("{{ beat: 1, note: '{0}', symbol: '1/8', type: 'play', string: '{1}', fret: null, finger: null, pick: 'Down', duration: 0.5, isStart: true, isSustain: false, tip: 'Beat 1: Down' }}, ", chord, strRange));
                sb.Append(string.Format("{{ beat: 1, note: '{0}', symbol: '1/8', type: 'play', string: '{1}', fret: null, finger: null, pick: 'Up', duration: 0.5, isStart: true, isSustain: false, tip: '1-and: Up' }}, ", chord, strRange));
                sb.Append(string.Format("{{ beat: 2, note: '{0}', symbol: '1/8', type: 'play', string: '{1}', fret: null, finger: null, pick: 'Down', duration: 0.5, isStart: true, isSustain: false, tip: 'Beat 2: Down' }}, ", chord, strRange));
                sb.Append(string.Format("{{ beat: 2, note: '{0}', symbol: '1/8', type: 'play', string: '{1}', fret: null, finger: null, pick: 'Up', duration: 0.5, isStart: true, isSustain: false, tip: '2-and: Up (tied to 3)' }}, ", chord, strRange));
                sb.Append(string.Format("{{ beat: 3, note: '{0}', symbol: '1/8', type: 'sustain', string: '{1}', fret: null, finger: null, pick: '-', duration: 0.5, isStart: false, isSustain: true, tip: 'Beat 3: TIE (Miss strings on Down!)' }}, ", chord, strRange));
                sb.Append(string.Format("{{ beat: 3, note: '{0}', symbol: '1/8', type: 'play', string: '{1}', fret: null, finger: null, pick: 'Up', duration: 0.5, isStart: true, isSustain: false, tip: '3-and: Up' }}, ", chord, strRange));
                sb.Append(string.Format("{{ beat: 4, note: '{0}', symbol: '1/4', type: 'play', string: '{1}', fret: null, finger: null, pick: 'Down', duration: 1, isStart: true, isSustain: false, tip: 'Beat 4: Down' }}", chord, strRange));
            } else {
                // Pattern #3 (Lesson Book p. 38): 1 (Down), 1& (Up tied to 2), 2 (Tie - Ghost Down), 2& (Up tied to 3), 3 (Tie - Ghost Down), 3& (Up), 4 (Down)
                sb.Append(string.Format("{{ beat: 1, note: '{0}', symbol: '1/8', type: 'play', string: '{1}', fret: null, finger: null, pick: 'Down', duration: 0.5, isStart: true, isSustain: false, tip: 'Beat 1: Down' }}, ", chord, strRange));
                sb.Append(string.Format("{{ beat: 1, note: '{0}', symbol: '1/8', type: 'play', string: '{1}', fret: null, finger: null, pick: 'Up', duration: 0.5, isStart: true, isSustain: false, tip: '1-and: Up (tied to 2)' }}, ", chord, strRange));
                sb.Append(string.Format("{{ beat: 2, note: '{0}', symbol: '1/8', type: 'sustain', string: '{1}', fret: null, finger: null, pick: '-', duration: 0.5, isStart: false, isSustain: true, tip: 'Beat 2: TIE (Miss strings on Down!)' }}, ", chord, strRange));
                sb.Append(string.Format("{{ beat: 2, note: '{0}', symbol: '1/8', type: 'play', string: '{1}', fret: null, finger: null, pick: 'Up', duration: 0.5, isStart: true, isSustain: false, tip: '2-and: Up (tied to 3)' }}, ", chord, strRange));
                sb.Append(string.Format("{{ beat: 3, note: '{0}', symbol: '1/8', type: 'sustain', string: '{1}', fret: null, finger: null, pick: '-', duration: 0.5, isStart: false, isSustain: true, tip: 'Beat 3: TIE (Miss strings on Down!)' }}, ", chord, strRange));
                sb.Append(string.Format("{{ beat: 3, note: '{0}', symbol: '1/8', type: 'play', string: '{1}', fret: null, finger: null, pick: 'Up', duration: 0.5, isStart: true, isSustain: false, tip: '3-and: Up' }}, ", chord, strRange));
                sb.Append(string.Format("{{ beat: 4, note: '{0}', symbol: '1/4', type: 'play', string: '{1}', fret: null, finger: null, pick: 'Down', duration: 1, isStart: true, isSustain: false, tip: 'Beat 4: Down' }}", chord, strRange));
            }
            sb.Append(" ] }" + (m < chords.Length - 1 ? ",\n" : "\n"));
        }
        sb.AppendLine("  ]");
        sb.Append("}");
        return sb.ToString();
    }

    private static string MakePimaExercise(string id, string title, int bpm, int patternNum) {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine("{");
        sb.AppendLine(string.Format("  id: '{0}', title: '{1}',", EscapeSingleQuote(id), EscapeSingleQuote(title)));
        sb.AppendLine("  description: 'Instructions: Fingerstyle arpeggio drill. Plant your right forearm on the guitar edge, keep fingers curved like holding a tennis ball. Rest your thumb on the bass string and pluck with P (Thumb), I (Index), M (Middle), A (Ring).',");
        sb.AppendLine(string.Format("  timeSignature: [4, 4], defaultBpm: {0}, goalBpm: 92, concepts: ['Fingerstyle Arpeggios', 'P-I-M-A', 'Right Hand Technique'],", bpm));
        sb.AppendLine("  tabData: [");

        string[] chords = new string[] { "G", "C", "D7", "G" };
        int[] bassStrings = new int[] { 6, 5, 4, 6 };
        int[] bassFrets = new int[] { 3, 3, 0, 3 };

        for (int m = 0; m < 4; m++) {
            string ch = chords[m];
            int bStr = bassStrings[m];
            int bFret = bassFrets[m];
            sb.Append(string.Format("    {{ measure: {0}, chordName: '{1}', beats: [ ", m + 1, ch));
            if (patternNum == 2) {
                // P - A - M - I
                sb.Append(MakeB(1, GetNoteName(bStr, bFret), "1/4", "play", bStr, bFret, GetFinger(bFret), "P", 1, "Thumb (P)") + ", ");
                sb.Append(MakeB(2, "High E", "1/4", "play", 1, ch == "G" ? 3 : (ch == "D7" ? 2 : 0), 1, "A", 1, "Ring (A)") + ", ");
                sb.Append(MakeB(3, "B", "1/4", "play", 2, ch == "G" ? 0 : 1, 1, "M", 1, "Middle (M)") + ", ");
                sb.Append(MakeB(4, "G", "1/4", "play", 3, ch == "D7" ? 2 : 0, 1, "I", 1, "Index (I)"));
            } else if (patternNum == 3) {
                // P - M - I - A
                sb.Append(MakeB(1, GetNoteName(bStr, bFret), "1/4", "play", bStr, bFret, GetFinger(bFret), "P", 1, "Thumb (P)") + ", ");
                sb.Append(MakeB(2, "B", "1/4", "play", 2, ch == "G" ? 0 : 1, 1, "M", 1, "Middle (M)") + ", ");
                sb.Append(MakeB(3, "G", "1/4", "play", 3, ch == "D7" ? 2 : 0, 1, "I", 1, "Index (I)") + ", ");
                sb.Append(MakeB(4, "High E", "1/4", "play", 1, ch == "G" ? 3 : (ch == "D7" ? 2 : 0), 1, "A", 1, "Ring (A)"));
            } else {
                // P - I - M - A
                sb.Append(MakeB(1, GetNoteName(bStr, bFret), "1/4", "play", bStr, bFret, GetFinger(bFret), "P", 1, "Thumb (P)") + ", ");
                sb.Append(MakeB(2, "G", "1/4", "play", 3, ch == "D7" ? 2 : 0, 1, "I", 1, "Index (I)") + ", ");
                sb.Append(MakeB(3, "B", "1/4", "play", 2, ch == "G" ? 0 : 1, 1, "M", 1, "Middle (M)") + ", ");
                sb.Append(MakeB(4, "High E", "1/4", "play", 1, ch == "G" ? 3 : (ch == "D7" ? 2 : 0), 1, "A", 1, "Ring (A)"));
            }
            sb.Append(" ] }" + (m < 3 ? ",\n" : "\n"));
        }
        sb.AppendLine("  ]");
        sb.Append("}");
        return sb.ToString();
    }

    private static string MakeMelody(string id, string title, int str, int[] frets, int bpm, string noteVal = "Quarter") {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine("{");
        sb.AppendLine(string.Format("  id: '{0}', title: '{1}',", EscapeSingleQuote(id), EscapeSingleQuote(title)));
        sb.AppendLine("  description: 'Instructions: Read and play each note in an even rhythm on string " + str + ". Count aloud with the metronome. Press firmly with the correct left-hand finger and use alternate picking.',");
        sb.AppendLine(string.Format("  timeSignature: [4, 4], defaultBpm: {0}, concepts: ['String {1}', '{2} Notes', 'Reading'],", bpm, str, noteVal));
        sb.AppendLine("  tabData: [");
        if (noteVal == "Whole") {
            for (int m = 0; m < frets.Length; m++) {
                int f = frets[m];
                string n = GetNoteName(str, f);
                sb.AppendLine(string.Format("    {{ measure: {0}, beats: [ {1}, {2}, {3}, {4} ] }}{5}",
                    m + 1,
                    MakeB(1, n, "1/1", "play", str, f, GetFinger(f), "Down", 4, n + " Whole Note"),
                    MakeSustainB(2, n, "1/1", str, f, GetFinger(f), 4, "Hold"),
                    MakeSustainB(3, n, "1/1", str, f, GetFinger(f), 4, "Hold"),
                    MakeSustainB(4, n, "1/1", str, f, GetFinger(f), 4, "Hold"),
                    m < frets.Length - 1 ? "," : ""));
            }
        } else if (noteVal == "Half") {
            int mCount = frets.Length / 2;
            for (int m = 0; m < mCount; m++) {
                int f1 = frets[m * 2];
                int f2 = frets[m * 2 + 1];
                string n1 = GetNoteName(str, f1);
                string n2 = GetNoteName(str, f2);
                sb.AppendLine(string.Format("    {{ measure: {0}, beats: [ {1}, {2}, {3}, {4} ] }}{5}",
                    m + 1,
                    MakeB(1, n1, "1/2", "play", str, f1, GetFinger(f1), "Down", 2, n1 + " (2 Beats)"),
                    MakeSustainB(2, n1, "1/2", str, f1, GetFinger(f1), 2, "Hold"),
                    MakeB(3, n2, "1/2", "play", str, f2, GetFinger(f2), "Down", 2, n2 + " (2 Beats)"),
                    MakeSustainB(4, n2, "1/2", str, f2, GetFinger(f2), 2, "Hold"),
                    m < mCount - 1 ? "," : ""));
            }
        } else {
            int mCount = frets.Length / 4;
            for (int m = 0; m < mCount; m++) {
                sb.Append(string.Format("    {{ measure: {0}, beats: [ ", m + 1));
                for (int b = 1; b <= 4; b++) {
                    int f = frets[m * 4 + (b - 1)];
                    string n = GetNoteName(str, f);
                    sb.Append(MakeB(b, n, "1/4", "play", str, f, GetFinger(f), b % 2 == 1 ? "Down" : "Up", 1, n));
                    if (b < 4) sb.Append(", ");
                }
                sb.Append(" ] }" + (m < mCount - 1 ? ",\n" : "\n"));
            }
        }
        sb.AppendLine("  ]");
        sb.Append("}");
        return sb.ToString();
    }

    private static string MakeMultiStringMelody(string id, string title, int bpm, string[] noteItems, int beatsPerMeasure = 4, string[] measureChords = null) {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine("{");
        sb.AppendLine(string.Format("  id: '{0}', title: '{1}',", EscapeSingleQuote(id), EscapeSingleQuote(title)));
        sb.AppendLine("  description: 'Instructions: Play through the single-note melody first with clean fretting and steady timing, then practice strumming the chord changes above each measure.',");
        sb.AppendLine(string.Format("  timeSignature: [{0}, 4], defaultBpm: {1}, concepts: ['Repertoire Melody', 'Sight-Reading', 'Chord Accompaniment'],", beatsPerMeasure, bpm));
        sb.AppendLine("  tabData: [");

        List<string> expandedBeats = new List<string>();
        List<double> expandedDurs = new List<double>();
        bool nextEighthUp = false;

        foreach (string item in noteItems) {
            string[] p = item.Split(':');
            string n = p[0];
            int s = int.Parse(p[1]);
            int f = int.Parse(p[2]);
            string durStr = p.Length > 3 ? p[3].ToLower() : "quarter";

            if (n.Equals("REST", StringComparison.OrdinalIgnoreCase)) {
                nextEighthUp = false;
                if (durStr == "whole") {
                    expandedBeats.Add(MakeRestB(1, "1/1", 4, "Rest")); expandedDurs.Add(1.0);
                    for (int b = 2; b <= 4; b++) { expandedBeats.Add(MakeRestSustainB(b, "1/1", 4, "Rest")); expandedDurs.Add(1.0); }
                } else if (durStr == "dotted-half") {
                    expandedBeats.Add(MakeRestB(1, "3/4", 3, "Rest")); expandedDurs.Add(1.0);
                    for (int b = 2; b <= 3; b++) { expandedBeats.Add(MakeRestSustainB(b, "3/4", 3, "Rest")); expandedDurs.Add(1.0); }
                } else if (durStr == "half") {
                    expandedBeats.Add(MakeRestB(1, "1/2", 2, "Rest")); expandedDurs.Add(1.0);
                    expandedBeats.Add(MakeRestSustainB(2, "1/2", 2, "Rest")); expandedDurs.Add(1.0);
                } else if (durStr == "eighth") {
                    expandedBeats.Add(MakeRestB(1, "1/8", 0.5, "Eighth Rest")); expandedDurs.Add(0.5);
                } else {
                    expandedBeats.Add(MakeRestB(1, "1/4", 1, "Rest")); expandedDurs.Add(1.0);
                }
                continue;
            }

            if (durStr == "whole") {
                nextEighthUp = false;
                expandedBeats.Add(MakeB(1, n, "1/1", "play", s, f, GetFinger(f), "Down", 4, n)); expandedDurs.Add(1.0);
                expandedBeats.Add(MakeSustainB(2, n, "1/1", s, f, GetFinger(f), 4, "Hold")); expandedDurs.Add(1.0);
                expandedBeats.Add(MakeSustainB(3, n, "1/1", s, f, GetFinger(f), 4, "Hold")); expandedDurs.Add(1.0);
                expandedBeats.Add(MakeSustainB(4, n, "1/1", s, f, GetFinger(f), 4, "Hold")); expandedDurs.Add(1.0);
            } else if (durStr == "dotted-half") {
                nextEighthUp = false;
                expandedBeats.Add(MakeB(1, n, "3/4", "play", s, f, GetFinger(f), "Down", 3, n)); expandedDurs.Add(1.0);
                expandedBeats.Add(MakeSustainB(2, n, "3/4", s, f, GetFinger(f), 3, "Hold")); expandedDurs.Add(1.0);
                expandedBeats.Add(MakeSustainB(3, n, "3/4", s, f, GetFinger(f), 3, "Hold")); expandedDurs.Add(1.0);
            } else if (durStr == "half") {
                nextEighthUp = false;
                expandedBeats.Add(MakeB(1, n, "1/2", "play", s, f, GetFinger(f), "Down", 2, n)); expandedDurs.Add(1.0);
                expandedBeats.Add(MakeSustainB(2, n, "1/2", s, f, GetFinger(f), 2, "Hold")); expandedDurs.Add(1.0);
            } else if (durStr == "eighth") {
                string pickDir = nextEighthUp ? "Up" : "Down";
                nextEighthUp = !nextEighthUp;
                expandedBeats.Add(MakeB(1, n, "1/8", "play", s, f, GetFinger(f), pickDir, 0.5, n)); expandedDurs.Add(0.5);
            } else {
                nextEighthUp = false;
                expandedBeats.Add(MakeB(1, n, "1/4", "play", s, f, GetFinger(f), "Down", 1, n)); expandedDurs.Add(1.0);
            }
        }

        // Group into measures summing to beatsPerMeasure
        List<List<string>> measures = new List<List<string>>();
        List<string> curM = new List<string>();
        double curSum = 0.0;

        for (int i = 0; i < expandedBeats.Count; i++) {
            double d = expandedDurs[i];
            int beatNum = Math.Min(beatsPerMeasure, (int)Math.Floor(curSum + 0.01) + 1);
            string fixedBeat = System.Text.RegularExpressions.Regex.Replace(expandedBeats[i], @"beat:\s*\d+", "beat: " + beatNum);
            curM.Add(fixedBeat);
            curSum += d;
            if (curSum >= beatsPerMeasure - 0.01) {
                measures.Add(curM);
                curM = new List<string>();
                curSum = 0.0;
            }
        }
        if (curM.Count > 0) {
            while (curSum < beatsPerMeasure - 0.01) {
                int beatNum = Math.Min(beatsPerMeasure, (int)Math.Floor(curSum + 0.01) + 1);
                curM.Add(MakeRestB(beatNum, "1/4", 1, "Rest"));
                curSum += 1.0;
            }
            measures.Add(curM);
        }

        for (int mIdx = 0; mIdx < measures.Count; mIdx++) {
            string chordAttr = "";
            if (measureChords != null && mIdx < measureChords.Length && !string.IsNullOrEmpty(measureChords[mIdx])) {
                chordAttr = string.Format(" chordName: '{0}',", EscapeSingleQuote(measureChords[mIdx]));
            }
            sb.Append(string.Format("    {{ measure: {0},{1} beats: [ ", mIdx + 1, chordAttr));
            sb.Append(string.Join(", ", measures[mIdx].ToArray()));
            sb.Append(" ] }" + (mIdx < measures.Count - 1 ? ",\n" : "\n"));
        }
        sb.AppendLine("  ]");
        sb.Append("}");
        return sb.ToString();
    }

    // =========================================================================
    // EIGHTH NOTE EXERCISES 1-6 (EXACTLY AS ON PAGE 20)
    // =========================================================================

    // Exercise 1: Lesson Book p. 17 Ex 1 - 3rd string (G, A)
    private static string Make8thExercise1(string id, string title, int bpm) {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine("{");
        sb.AppendLine(string.Format("  id: '{0}', title: '{1}',", EscapeSingleQuote(id), EscapeSingleQuote(title)));
        sb.AppendLine("  description: 'Instructions: Play slowly in an even rhythm. Write in the notes if needed. Play through each exercise. Try not to hesitate between notes. When you have several eighth notes of the same pitch in a row, then alternate your picking (Down-Up-Down-Up).',");
        sb.AppendLine(string.Format("  timeSignature: [4, 4], defaultBpm: {0}, concepts: ['Eighth Notes', 'Beamed Pairs', 'Alternate Picking (Down-Up)', '3rd String (G - A)'],", bpm));
        sb.AppendLine("  tabData: [");
        // Measure 1: G(1/4), G(1/4), G G(1/8 pair), G G(1/8 pair)
        sb.AppendLine("    { measure: 1, beats: [ " +
            MakeB(1, "G", "1/4", "play", 3, 0, 0, "Down", 1.0, "G (1)") + ", " +
            MakeB(2, "G", "1/4", "play", 3, 0, 0, "Down", 1.0, "G (2)") + ", " +
            MakeB(3, "G", "1/8", "play", 3, 0, 0, "Down", 0.5, "G (3)") + ", " +
            MakeB(3, "G", "1/8", "play", 3, 0, 0, "Up",   0.5, "and") + ", " +
            MakeB(4, "G", "1/8", "play", 3, 0, 0, "Down", 0.5, "G (4)") + ", " +
            MakeB(4, "G", "1/8", "play", 3, 0, 0, "Up",   0.5, "and") + " ] },");
        // Measure 2: G(1/4), G(1/4), G G(1/8 pair), G G(1/8 pair)
        sb.AppendLine("    { measure: 2, beats: [ " +
            MakeB(1, "G", "1/4", "play", 3, 0, 0, "Down", 1.0, "G (1)") + ", " +
            MakeB(2, "G", "1/4", "play", 3, 0, 0, "Down", 1.0, "G (2)") + ", " +
            MakeB(3, "G", "1/8", "play", 3, 0, 0, "Down", 0.5, "G (3)") + ", " +
            MakeB(3, "G", "1/8", "play", 3, 0, 0, "Up",   0.5, "and") + ", " +
            MakeB(4, "G", "1/8", "play", 3, 0, 0, "Down", 0.5, "G (4)") + ", " +
            MakeB(4, "G", "1/8", "play", 3, 0, 0, "Up",   0.5, "and") + " ] },");
        // Measure 3: A(1/4), A A(1/8 pair), A A(1/8 pair), A A(1/8 pair)
        sb.AppendLine("    { measure: 3, beats: [ " +
            MakeB(1, "A", "1/4", "play", 3, 2, 2, "Down", 1.0, "A (1)") + ", " +
            MakeB(2, "A", "1/8", "play", 3, 2, 2, "Down", 0.5, "A (2)") + ", " +
            MakeB(2, "A", "1/8", "play", 3, 2, 2, "Up",   0.5, "and") + ", " +
            MakeB(3, "A", "1/8", "play", 3, 2, 2, "Down", 0.5, "A (3)") + ", " +
            MakeB(3, "A", "1/8", "play", 3, 2, 2, "Up",   0.5, "and") + ", " +
            MakeB(4, "A", "1/8", "play", 3, 2, 2, "Down", 0.5, "A (4)") + ", " +
            MakeB(4, "A", "1/8", "play", 3, 2, 2, "Up",   0.5, "and") + " ] },");
        // Measure 4: A(1/4), A A(1/8 pair), G(1/2)
        sb.AppendLine("    { measure: 4, beats: [ " +
            MakeB(1, "A", "1/4", "play", 3, 2, 2, "Down", 1.0, "A (1)") + ", " +
            MakeB(2, "A", "1/8", "play", 3, 2, 2, "Down", 0.5, "A (2)") + ", " +
            MakeB(2, "A", "1/8", "play", 3, 2, 2, "Up",   0.5, "and") + ", " +
            MakeB(3, "G", "1/2", "play", 3, 0, 0, "Down", 2.0, "G (Half Note)") + " ] }");
        sb.AppendLine("  ]");
        sb.Append("}");
        return sb.ToString();
    }

    // Exercise 2: Lesson Book p. 17 Ex 2 - Eighth Notes & Quarter Notes with Rests (G, A, B)
    private static string Make8thExercise2(string id, string title, int bpm) {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine("{");
        sb.AppendLine(string.Format("  id: '{0}', title: '{1}',", EscapeSingleQuote(id), EscapeSingleQuote(title)));
        sb.AppendLine("  description: 'Instructions: Practice switching between solid quarter notes and pairs of eighth notes. Watch the quarter rest on beat 4 of measures 2 and 4. Keep picking even and rhythmic.',");
        sb.AppendLine(string.Format("  timeSignature: [4, 4], defaultBpm: {0}, concepts: ['8th Pairs + Quarters', 'Quarter Rests', 'Alternate Picking', 'Strings 2 & 3 (G - A - B)'],", bpm));
        sb.AppendLine("  tabData: [");
        // Measure 1: G(1/4), G G(1/8 pair), G(1/4), G G(1/8 pair)
        sb.AppendLine("    { measure: 1, beats: [ " +
            MakeB(1, "G", "1/4", "play", 3, 0, 0, "Down", 1.0, "G (1)") + ", " +
            MakeB(2, "G", "1/8", "play", 3, 0, 0, "Down", 0.5, "G (2)") + ", " +
            MakeB(2, "G", "1/8", "play", 3, 0, 0, "Up",   0.5, "and") + ", " +
            MakeB(3, "G", "1/4", "play", 3, 0, 0, "Down", 1.0, "G (3)") + ", " +
            MakeB(4, "G", "1/8", "play", 3, 0, 0, "Down", 0.5, "G (4)") + ", " +
            MakeB(4, "G", "1/8", "play", 3, 0, 0, "Up",   0.5, "and") + " ] },");
        // Measure 2: A A(1/8 pair), A A(1/8 pair), A(1/4), Rest(1/4)
        sb.AppendLine("    { measure: 2, beats: [ " +
            MakeB(1, "A", "1/8", "play", 3, 2, 2, "Down", 0.5, "A (1)") + ", " +
            MakeB(1, "A", "1/8", "play", 3, 2, 2, "Up",   0.5, "and") + ", " +
            MakeB(2, "A", "1/8", "play", 3, 2, 2, "Down", 0.5, "A (2)") + ", " +
            MakeB(2, "A", "1/8", "play", 3, 2, 2, "Up",   0.5, "and") + ", " +
            MakeB(3, "A", "1/4", "play", 3, 2, 2, "Down", 1.0, "A (3)") + ", " +
            MakeRestB(4, "1/4", 1.0, "Quarter Rest (4)") + " ] },");
        // Measure 3: 4 pairs of 8ths on B (2nd string fret 0)
        sb.AppendLine("    { measure: 3, beats: [ " +
            MakeB(1, "B", "1/8", "play", 2, 0, 0, "Down", 0.5, "B (1)") + ", " +
            MakeB(1, "B", "1/8", "play", 2, 0, 0, "Up",   0.5, "and") + ", " +
            MakeB(2, "B", "1/8", "play", 2, 0, 0, "Down", 0.5, "B (2)") + ", " +
            MakeB(2, "B", "1/8", "play", 2, 0, 0, "Up",   0.5, "and") + ", " +
            MakeB(3, "B", "1/8", "play", 2, 0, 0, "Down", 0.5, "B (3)") + ", " +
            MakeB(3, "B", "1/8", "play", 2, 0, 0, "Up",   0.5, "and") + ", " +
            MakeB(4, "B", "1/8", "play", 2, 0, 0, "Down", 0.5, "B (4)") + ", " +
            MakeB(4, "B", "1/8", "play", 2, 0, 0, "Up",   0.5, "and") + " ] },");
        // Measure 4: B(1/4), Rest(1/4), B(1/2)
        sb.AppendLine("    { measure: 4, beats: [ " +
            MakeB(1, "B", "1/4", "play", 2, 0, 0, "Down", 1.0, "B (1)") + ", " +
            MakeRestB(2, "1/4", 1.0, "Quarter Rest (2)") + ", " +
            MakeB(3, "B", "1/2", "play", 2, 0, 0, "Down", 2.0, "B (Half Note)") + " ] }");
        sb.AppendLine("  ]");
        sb.Append("}");
        return sb.ToString();
    }

    // Exercise 3: Lesson Book p. 17 Ex 3 - Mixed Quarter, Eighth & Half Notes (G, A, B, C, D)
    private static string Make8thExercise3(string id, string title, int bpm) {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine("{");
        sb.AppendLine(string.Format("  id: '{0}', title: '{1}',", EscapeSingleQuote(id), EscapeSingleQuote(title)));
        sb.AppendLine("  description: 'Instructions: Keep the rhythm steady as eighth note pairs alternate with half notes and quarter notes across strings 2 and 3. Try not to hesitate between notes.',");
        sb.AppendLine(string.Format("  timeSignature: [4, 4], defaultBpm: {0}, concepts: ['Eighth Pairs', 'Half Notes', 'Strings 2 & 3', 'Rhythm Precision'],", bpm));
        sb.AppendLine("  tabData: [");
        // Measure 1: G G(1/8 pair), G G(1/8 pair), G(1/2)
        sb.AppendLine("    { measure: 1, beats: [ " +
            MakeB(1, "G", "1/8", "play", 3, 0, 0, "Down", 0.5, "G (1)") + ", " +
            MakeB(1, "G", "1/8", "play", 3, 0, 0, "Up",   0.5, "and") + ", " +
            MakeB(2, "G", "1/8", "play", 3, 0, 0, "Down", 0.5, "G (2)") + ", " +
            MakeB(2, "G", "1/8", "play", 3, 0, 0, "Up",   0.5, "and") + ", " +
            MakeB(3, "G", "1/2", "play", 3, 0, 0, "Down", 2.0, "G (Half Note)") + " ] },");
        // Measure 2: A A(1/8 pair), A A(1/8 pair), A(1/2)
        sb.AppendLine("    { measure: 2, beats: [ " +
            MakeB(1, "A", "1/8", "play", 3, 2, 2, "Down", 0.5, "A (1)") + ", " +
            MakeB(1, "A", "1/8", "play", 3, 2, 2, "Up",   0.5, "and") + ", " +
            MakeB(2, "A", "1/8", "play", 3, 2, 2, "Down", 0.5, "A (2)") + ", " +
            MakeB(2, "A", "1/8", "play", 3, 2, 2, "Up",   0.5, "and") + ", " +
            MakeB(3, "A", "1/2", "play", 3, 2, 2, "Down", 2.0, "A (Half Note)") + " ] },");
        // Measure 3: G(1/4), A(1/4), B B(1/8 pair), B B(1/8 pair)
        sb.AppendLine("    { measure: 3, beats: [ " +
            MakeB(1, "G", "1/4", "play", 3, 0, 0, "Down", 1.0, "G (1)") + ", " +
            MakeB(2, "A", "1/4", "play", 3, 2, 2, "Down", 1.0, "A (2)") + ", " +
            MakeB(3, "B", "1/8", "play", 2, 0, 0, "Down", 0.5, "B (3)") + ", " +
            MakeB(3, "B", "1/8", "play", 2, 0, 0, "Up",   0.5, "and") + ", " +
            MakeB(4, "B", "1/8", "play", 2, 0, 0, "Down", 0.5, "B (4)") + ", " +
            MakeB(4, "B", "1/8", "play", 2, 0, 0, "Up",   0.5, "and") + " ] },");
        // Measure 4: C(1/4), D(1/4), G(1/2)
        sb.AppendLine("    { measure: 4, beats: [ " +
            MakeB(1, "C", "1/4", "play", 2, 1, 1, "Down", 1.0, "C (1)") + ", " +
            MakeB(2, "D", "1/4", "play", 2, 3, 3, "Down", 1.0, "D (2)") + ", " +
            MakeB(3, "G", "1/2", "play", 3, 0, 0, "Down", 2.0, "G (Half Note)") + " ] }");
        sb.AppendLine("  ]");
        sb.Append("}");
        return sb.ToString();
    }

    // Exercise 4: Lesson Book p. 17 Ex 4 - Ascending & Descending Eighth Note Scale Run (D, E, F, G, A, B, C, D)
    private static string Make8thExercise4(string id, string title, int bpm) {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine("{");
        sb.AppendLine(string.Format("  id: '{0}', title: '{1}',", EscapeSingleQuote(id), EscapeSingleQuote(title)));
        sb.AppendLine("  description: 'Instructions: Scale run spanning string 4 up to string 2. Play every eighth note cleanly with alternate picking (Down-Up). Conclude with a solid whole note.',");
        sb.AppendLine(string.Format("  timeSignature: [4, 4], defaultBpm: {0}, concepts: ['Ascending Scale', 'Descending Scale', 'Strings 2, 3 & 4', 'Alternate Picking'],", bpm));
        sb.AppendLine("  tabData: [");
        // Measure 1: D E (8ths), F G (8ths), A B (8ths), C D (8ths)
        sb.AppendLine("    { measure: 1, beats: [ " +
            MakeB(1, "D", "1/8", "play", 4, 0, 0, "Down", 0.5, "D (1)") + ", " +
            MakeB(1, "E", "1/8", "play", 4, 2, 2, "Up",   0.5, "and") + ", " +
            MakeB(2, "F", "1/8", "play", 4, 3, 3, "Down", 0.5, "F (2)") + ", " +
            MakeB(2, "G", "1/8", "play", 3, 0, 0, "Up",   0.5, "and") + ", " +
            MakeB(3, "A", "1/8", "play", 3, 2, 2, "Down", 0.5, "A (3)") + ", " +
            MakeB(3, "B", "1/8", "play", 2, 0, 0, "Up",   0.5, "and") + ", " +
            MakeB(4, "C", "1/8", "play", 2, 1, 1, "Down", 0.5, "C (4)") + ", " +
            MakeB(4, "D", "1/8", "play", 2, 3, 3, "Up",   0.5, "and") + " ] },");
        // Measure 2: D C (8ths), B A (8ths), G F (8ths), E D (8ths)
        sb.AppendLine("    { measure: 2, beats: [ " +
            MakeB(1, "D", "1/8", "play", 2, 3, 3, "Down", 0.5, "D (1)") + ", " +
            MakeB(1, "C", "1/8", "play", 2, 1, 1, "Up",   0.5, "and") + ", " +
            MakeB(2, "B", "1/8", "play", 2, 0, 0, "Down", 0.5, "B (2)") + ", " +
            MakeB(2, "A", "1/8", "play", 3, 2, 2, "Up",   0.5, "and") + ", " +
            MakeB(3, "G", "1/8", "play", 3, 0, 0, "Down", 0.5, "G (3)") + ", " +
            MakeB(3, "F", "1/8", "play", 4, 3, 3, "Up",   0.5, "and") + ", " +
            MakeB(4, "E", "1/8", "play", 4, 2, 2, "Down", 0.5, "E (4)") + ", " +
            MakeB(4, "D", "1/8", "play", 4, 0, 0, "Up",   0.5, "and") + " ] },");
        // Measure 3: D E (8ths), F (1/4), G A (8ths), B (1/4)
        sb.AppendLine("    { measure: 3, beats: [ " +
            MakeB(1, "D", "1/8", "play", 4, 0, 0, "Down", 0.5, "D (1)") + ", " +
            MakeB(1, "E", "1/8", "play", 4, 2, 2, "Up",   0.5, "and") + ", " +
            MakeB(2, "F", "1/4", "play", 4, 3, 3, "Down", 1.0, "F (2)") + ", " +
            MakeB(3, "G", "1/8", "play", 3, 0, 0, "Down", 0.5, "G (3)") + ", " +
            MakeB(3, "A", "1/8", "play", 3, 2, 2, "Up",   0.5, "and") + ", " +
            MakeB(4, "B", "1/4", "play", 2, 0, 0, "Down", 1.0, "B (4)") + " ] },");
        // Measure 4: C (1/1 whole note)
        sb.AppendLine("    { measure: 4, beats: [ " +
            MakeB(1, "C", "1/1", "play", 2, 1, 1, "Down", 4.0, "C (Whole Note)") + ", " +
            MakeSustainB(2, "C", "1/1", 2, 1, 1, 4, "Hold") + ", " +
            MakeSustainB(3, "C", "1/1", 2, 1, 1, 4, "Hold") + ", " +
            MakeSustainB(4, "C", "1/1", 2, 1, 1, 4, "Hold") + " ] }");
        sb.AppendLine("  ]");
        sb.Append("}");
        return sb.ToString();
    }

    // Exercise 5: Lesson Book p. 17 Ex 5 - Scalewise Melodic Eighth Patterns with Half Notes
    private static string Make8thExercise5(string id, string title, int bpm) {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine("{");
        sb.AppendLine(string.Format("  id: '{0}', title: '{1}',", EscapeSingleQuote(id), EscapeSingleQuote(title)));
        sb.AppendLine("  description: 'Instructions: Ascending and descending scale patterns across strings 2, 3, and 4. Hold the half note on beat 3 of measures 2 and 4 for 2 full beats.',");
        sb.AppendLine(string.Format("  timeSignature: [4, 4], defaultBpm: {0}, concepts: ['Scalewise Patterns', 'Half Note Endings', 'Strings 2, 3 & 4', 'Alternate Picking'],", bpm));
        sb.AppendLine("  tabData: [");
        // Measure 1: D E (8ths), F G (8ths), A B (8ths), C D (8ths)
        sb.AppendLine("    { measure: 1, beats: [ " +
            MakeB(1, "D", "1/8", "play", 4, 0, 0, "Down", 0.5, "D (1)") + ", " +
            MakeB(1, "E", "1/8", "play", 4, 2, 2, "Up",   0.5, "and") + ", " +
            MakeB(2, "F", "1/8", "play", 4, 3, 3, "Down", 0.5, "F (2)") + ", " +
            MakeB(2, "G", "1/8", "play", 3, 0, 0, "Up",   0.5, "and") + ", " +
            MakeB(3, "A", "1/8", "play", 3, 2, 2, "Down", 0.5, "A (3)") + ", " +
            MakeB(3, "B", "1/8", "play", 2, 0, 0, "Up",   0.5, "and") + ", " +
            MakeB(4, "C", "1/8", "play", 2, 1, 1, "Down", 0.5, "C (4)") + ", " +
            MakeB(4, "D", "1/8", "play", 2, 3, 3, "Up",   0.5, "and") + " ] },");
        // Measure 2: D C (8ths), B A (8ths), G (1/2 half note)
        sb.AppendLine("    { measure: 2, beats: [ " +
            MakeB(1, "D", "1/8", "play", 2, 3, 3, "Down", 0.5, "D (1)") + ", " +
            MakeB(1, "C", "1/8", "play", 2, 1, 1, "Up",   0.5, "and") + ", " +
            MakeB(2, "B", "1/8", "play", 2, 0, 0, "Down", 0.5, "B (2)") + ", " +
            MakeB(2, "A", "1/8", "play", 3, 2, 2, "Up",   0.5, "and") + ", " +
            MakeB(3, "G", "1/2", "play", 3, 0, 0, "Down", 2.0, "G (Half Note)") + " ] },");
        // Measure 3: D E (8ths), F G (8ths), A B (8ths), C D (8ths)
        sb.AppendLine("    { measure: 3, beats: [ " +
            MakeB(1, "D", "1/8", "play", 4, 0, 0, "Down", 0.5, "D (1)") + ", " +
            MakeB(1, "E", "1/8", "play", 4, 2, 2, "Up",   0.5, "and") + ", " +
            MakeB(2, "F", "1/8", "play", 4, 3, 3, "Down", 0.5, "F (2)") + ", " +
            MakeB(2, "G", "1/8", "play", 3, 0, 0, "Up",   0.5, "and") + ", " +
            MakeB(3, "A", "1/8", "play", 3, 2, 2, "Down", 0.5, "A (3)") + ", " +
            MakeB(3, "B", "1/8", "play", 2, 0, 0, "Up",   0.5, "and") + ", " +
            MakeB(4, "C", "1/8", "play", 2, 1, 1, "Down", 0.5, "C (4)") + ", " +
            MakeB(4, "D", "1/8", "play", 2, 3, 3, "Up",   0.5, "and") + " ] },");
        // Measure 4: D C (8ths), B A (8ths), G (1/2 half note)
        sb.AppendLine("    { measure: 4, beats: [ " +
            MakeB(1, "D", "1/8", "play", 2, 3, 3, "Down", 0.5, "D (1)") + ", " +
            MakeB(1, "C", "1/8", "play", 2, 1, 1, "Up",   0.5, "and") + ", " +
            MakeB(2, "B", "1/8", "play", 2, 0, 0, "Down", 0.5, "B (2)") + ", " +
            MakeB(2, "A", "1/8", "play", 3, 2, 2, "Up",   0.5, "and") + ", " +
            MakeB(3, "G", "1/2", "play", 3, 0, 0, "Down", 2.0, "G (Half Note)") + " ] }");
        sb.AppendLine("  ]");
        sb.Append("}");
        return sb.ToString();
    }

    // Exercise 6: Lesson Book p. 17 Ex 6 - Melodic Line Across Strings 1, 2, 3 & 4 with Quarter Rests
    private static string Make8thExercise6(string id, string title, int bpm) {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine("{");
        sb.AppendLine(string.Format("  id: '{0}', title: '{1}',", EscapeSingleQuote(id), EscapeSingleQuote(title)));
        sb.AppendLine("  description: 'Instructions: Melodic line with quarter rests across strings 1, 2, 3, and 4. Do not rush through the rests; give them their full beat value while maintaining alternate picking on eighth note pairs.',");
        sb.AppendLine(string.Format("  timeSignature: [4, 4], defaultBpm: {0}, concepts: ['Strings 1, 2, 3 & 4', 'Quarter Rests', 'Melodic Eighths', 'Alternate Picking'],", bpm));
        sb.AppendLine("  tabData: [");
        // Measure 1: High G(1/4), High E(1/4), F D(1/8 pair), C(1/4)
        sb.AppendLine("    { measure: 1, beats: [ " +
            MakeB(1, "High G", "1/4", "play", 1, 3, 3, "Down", 1.0, "G (1)") + ", " +
            MakeB(2, "High E", "1/4", "play", 1, 0, 0, "Down", 1.0, "E (2)") + ", " +
            MakeB(3, "F", "1/8", "play", 1, 1, 1, "Down", 0.5, "F (3)") + ", " +
            MakeB(3, "D", "1/8", "play", 2, 3, 3, "Up",   0.5, "and") + ", " +
            MakeB(4, "C", "1/4", "play", 2, 1, 1, "Down", 1.0, "C (4)") + " ] },");
        // Measure 2: Rest(1/4), D(1/4), E C(1/8 pair), B(1/4)
        sb.AppendLine("    { measure: 2, beats: [ " +
            MakeRestB(1, "1/4", 1.0, "Quarter Rest (1)") + ", " +
            MakeB(2, "D", "1/4", "play", 2, 3, 3, "Down", 1.0, "D (2)") + ", " +
            MakeB(3, "High E", "1/8", "play", 1, 0, 0, "Down", 0.5, "E (3)") + ", " +
            MakeB(3, "C", "1/8", "play", 2, 1, 1, "Up",   0.5, "and") + ", " +
            MakeB(4, "B", "1/4", "play", 2, 0, 0, "Down", 1.0, "B (4)") + " ] },");
        // Measure 3: Rest(1/4), A(1/4), Rest(1/4), G(1/4)
        sb.AppendLine("    { measure: 3, beats: [ " +
            MakeRestB(1, "1/4", 1.0, "Quarter Rest (1)") + ", " +
            MakeB(2, "A", "1/4", "play", 3, 2, 2, "Down", 1.0, "A (2)") + ", " +
            MakeRestB(3, "1/4", 1.0, "Quarter Rest (3)") + ", " +
            MakeB(4, "G", "1/4", "play", 3, 0, 0, "Down", 1.0, "G (4)") + " ] },");
        // Measure 4: D E(1/8 pair), F G(1/8 pair), A(1/4), Rest(1/4)
        sb.AppendLine("    { measure: 4, beats: [ " +
            MakeB(1, "D", "1/8", "play", 4, 0, 0, "Down", 0.5, "D (1)") + ", " +
            MakeB(1, "E", "1/8", "play", 4, 2, 2, "Up",   0.5, "and") + ", " +
            MakeB(2, "F", "1/8", "play", 4, 3, 3, "Down", 0.5, "F (2)") + ", " +
            MakeB(2, "G", "1/8", "play", 3, 0, 0, "Up",   0.5, "and") + ", " +
            MakeB(3, "A", "1/4", "play", 3, 2, 2, "Down", 1.0, "A (3)") + ", " +
            MakeRestB(4, "1/4", 1.0, "Quarter Rest (4)") + " ] }");
        sb.AppendLine("  ]");
        sb.Append("}");
        return sb.ToString();
    }

    private static string Make8thMotorStrum(string id, string title, int bpm, string chord) {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine("{");
        sb.AppendLine(string.Format("  id: '{0}', title: '{1}',", EscapeSingleQuote(id), EscapeSingleQuote(title)));
        sb.AppendLine("  description: 'Instructions: The Motor Motion: Right arm moves continuously down-up in eighth notes. Keep picking arm relaxed and maintain steady momentum.',");
        sb.AppendLine(string.Format("  timeSignature: [4, 4], defaultBpm: {0}, concepts: ['The Motor Motion', '8th Note Strum', 'Continuous Arm Movement'],", bpm));
        sb.AppendLine("  tabData: [");
        for (int m = 1; m <= 2; m++) {
            sb.Append(string.Format("    {{ measure: {0}, chordName: '{1}', beats: [ ", m, chord));
            for (int b = 1; b <= 8; b++) {
                string pick = b % 2 == 1 ? "Down" : "Up";
                sb.Append(string.Format("{{ beat: {0}, note: '{1}', symbol: '1/8', type: 'play', string: 'all', fret: null, finger: null, pick: '{2}', duration: 0.5, isStart: true, isSustain: false, tip: '{1} {2}' }}",
                    (b + 1) / 2, chord, pick));
                if (b < 8) sb.Append(", ");
            }
            sb.Append(" ] }" + (m < 2 ? ",\n" : "\n"));
        }
        sb.AppendLine("  ]");
        sb.Append("}");
        return sb.ToString();
    }

    private static string Make16thStrumExercise(string id, string title, int bpm, string[] chords) {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine("{");
        sb.AppendLine(string.Format("  id: '{0}', title: '{1}',", EscapeSingleQuote(id), EscapeSingleQuote(title)));
        sb.AppendLine("  description: 'Instructions: 16th-Note Continuous Subdivision Workout (1-e-&-a 2-e-&-a 3-e-&-a 4-e-&-a). Right hand maintains fluid Down-Up-Down-Up 16th momentum across chord changes.',");
        sb.AppendLine(string.Format("  timeSignature: [4, 4], defaultBpm: {0}, concepts: ['16th Notes', 'Subdivisions (1 e & a)', 'Continuous Hand Motion'],", bpm));
        sb.AppendLine("  tabData: [");
        string[] subs = new string[] { "1", "e", "&", "a" };
        for (int m = 0; m < chords.Length; m++) {
            string ch = chords[m];
            sb.Append(string.Format("    {{ measure: {0}, chordName: '{1}', beats: [ ", m + 1, ch));
            for (int sub = 0; sub < 16; sub++) {
                int beatNum = (sub / 4) + 1;
                string subName = subs[sub % 4];
                string pick = sub % 2 == 0 ? "Down" : "Up";
                sb.Append(string.Format("{{ beat: {0}, note: '{1}', symbol: '1/16', type: 'play', string: 'all', fret: null, finger: null, pick: '{2}', duration: 0.25, isStart: true, isSustain: false, tip: '{1} ({0}{3}) {2}' }}",
                    beatNum, ch, pick, subName));
                if (sub < 15) sb.Append(", ");
            }
            sb.Append(" ] }" + (m < chords.Length - 1 ? ",\n" : "\n"));
        }
        sb.AppendLine("  ]");
        sb.Append("}");
        return sb.ToString();
    }

    private static string MakeTiedExercise(string id, string title, int bpm) {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine("{");
        sb.AppendLine(string.Format("  id: '{0}', title: '{1}',", EscapeSingleQuote(id), EscapeSingleQuote(title)));
        sb.AppendLine("  description: 'Instructions: A tie connects notes of the same pitch across barlines. Pluck note once and hold through the tied beat.',");
        sb.AppendLine(string.Format("  timeSignature: [4, 4], defaultBpm: {0}, concepts: ['Ties Across Barlines', 'Sustain', '3rd String'],", bpm));
        sb.AppendLine("  tabData: [");
        sb.AppendLine("    { measure: 1, beats: [ " +
            MakeB(1, "G", "1/4", "play", 3, 0, 0, "Down", 1, "G") + ", " +
            MakeB(2, "G", "1/4", "play", 3, 0, 0, "Up", 1, "G") + ", " +
            MakeB(3, "G", "1/2", "play", 3, 0, 0, "Down", 2, "G tied to next bar") + ", " +
            MakeSustainB(4, "G", "1/2", 3, 0, 0, 2, "Hold") + " ] },");
        sb.AppendLine("    { measure: 2, beats: [ " +
            MakeSustainB(1, "G", "1/2", 3, 0, 0, 2, "Tied from previous bar") + ", " +
            MakeSustainB(2, "G", "1/2", 3, 0, 0, 2, "Hold") + ", " +
            MakeB(3, "A", "1/4", "play", 3, 2, 2, "Down", 1, "A") + ", " +
            MakeB(4, "G", "1/4", "play", 3, 0, 0, "Up", 1, "G") + " ] },");
        sb.AppendLine("    { measure: 3, beats: [ " +
            MakeB(1, "G", "1/1", "play", 3, 0, 0, "Down", 4, "Final G Whole") + ", " +
            MakeSustainB(2, "G", "1/1", 3, 0, 0, 4, "Hold") + ", " +
            MakeSustainB(3, "G", "1/1", 3, 0, 0, 4, "Hold") + ", " +
            MakeSustainB(4, "G", "1/1", 3, 0, 0, 4, "Hold") + " ] }");
        sb.AppendLine("  ]");
        sb.Append("}");
        return sb.ToString();
    }

    private static string MakeDottedWaltz(string id, string title, int bpm) {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine("{");
        sb.AppendLine(string.Format("  id: '{0}', title: '{1}',", EscapeSingleQuote(id), EscapeSingleQuote(title)));
        sb.AppendLine("  description: 'Instructions: Dotted half note = 3 beats in 3/4 waltz time. Pluck on beat 1 and ring through beats 2 and 3.',");
        sb.AppendLine(string.Format("  timeSignature: [3, 4], defaultBpm: {0}, concepts: ['3/4 Time', 'Dotted Half Note = 3 Beats', 'Waltz'],", bpm));
        sb.AppendLine("  tabData: [");
        sb.AppendLine("    { measure: 1, beats: [ " + MakeB(1, "G", "3/4", "play", 3, 0, 0, "Down", 3, "G Dotted Half") + ", " + MakeSustainB(2, "G", "3/4", 3, 0, 0, 3, "Hold 2") + ", " + MakeSustainB(3, "G", "3/4", 3, 0, 0, 3, "Hold 3") + " ] },");
        sb.AppendLine("    { measure: 2, beats: [ " + MakeB(1, "A", "3/4", "play", 3, 2, 2, "Down", 3, "A Dotted Half") + ", " + MakeSustainB(2, "A", "3/4", 3, 2, 2, 3, "Hold 2") + ", " + MakeSustainB(3, "A", "3/4", 3, 2, 2, 3, "Hold 3") + " ] },");
        sb.AppendLine("    { measure: 3, beats: [ " + MakeB(1, "D", "3/4", "play", 4, 0, 0, "Down", 3, "D Dotted Half") + ", " + MakeSustainB(2, "D", "3/4", 4, 0, 0, 3, "Hold 2") + ", " + MakeSustainB(3, "D", "3/4", 4, 0, 0, 3, "Hold 3") + " ] },");
        sb.AppendLine("    { measure: 4, beats: [ " + MakeB(1, "G", "3/4", "play", 3, 0, 0, "Down", 3, "Final G") + ", " + MakeSustainB(2, "G", "3/4", 3, 0, 0, 3, "Hold 2") + ", " + MakeSustainB(3, "G", "3/4", 3, 0, 0, 3, "Hold 3") + " ] }");
        sb.AppendLine("  ]");
        sb.Append("}");
        return sb.ToString();
    }

    private static string MakeRestExercise(string id, string title, int bpm, int restDur) {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine("{");
        sb.AppendLine(string.Format("  id: '{0}', title: '{1}',", EscapeSingleQuote(id), EscapeSingleQuote(title)));
        sb.AppendLine("  description: 'Instructions: String damping and muting practice with rests. Stop string vibration immediately on rest beats.',");
        sb.AppendLine(string.Format("  timeSignature: [4, 4], defaultBpm: {0}, concepts: ['Rests', 'String Muting', 'Silence on Beat'],", bpm));
        sb.AppendLine("  tabData: [");
        if (restDur == 4) {
            sb.AppendLine("    { measure: 1, beats: [ " + MakeB(1, "G", "1/1", "play", 3, 0, 0, "Down", 4, "G Ring") + ", " + MakeSustainB(2, "G", "1/1", 3, 0, 0, 4, "Hold") + ", " + MakeSustainB(3, "G", "1/1", 3, 0, 0, 4, "Hold") + ", " + MakeSustainB(4, "G", "1/1", 3, 0, 0, 4, "Hold") + " ] },");
            sb.AppendLine("    { measure: 2, beats: [ " + MakeRestB(1, "1/1", 4, "Whole Rest - Silence 4 beats") + ", " + MakeRestSustainB(2, "1/1", 4, "Mute") + ", " + MakeRestSustainB(3, "1/1", 4, "Mute") + ", " + MakeRestSustainB(4, "1/1", 4, "Mute") + " ] },");
            sb.AppendLine("    { measure: 3, beats: [ " + MakeB(1, "G", "1/1", "play", 3, 0, 0, "Down", 4, "G Final Whole") + ", " + MakeSustainB(2, "G", "1/1", 3, 0, 0, 4, "Hold") + ", " + MakeSustainB(3, "G", "1/1", 3, 0, 0, 4, "Hold") + ", " + MakeSustainB(4, "G", "1/1", 3, 0, 0, 4, "Hold") + " ] }");
        } else if (restDur == 2) {
            sb.AppendLine("    { measure: 1, beats: [ " + MakeB(1, "G", "1/2", "play", 3, 0, 0, "Down", 2, "G Sound") + ", " + MakeSustainB(2, "G", "1/2", 3, 0, 0, 2, "Hold") + ", " + MakeRestB(3, "1/2", 2, "Half Rest - 2 beats mute") + ", " + MakeRestSustainB(4, "1/2", 2, "Mute") + " ] },");
            sb.AppendLine("    { measure: 2, beats: [ " + MakeRestB(1, "1/2", 2, "Half Rest") + ", " + MakeRestSustainB(2, "1/2", 2, "Mute") + ", " + MakeB(3, "A", "1/2", "play", 3, 2, 2, "Down", 2, "A Sound") + ", " + MakeSustainB(4, "A", "1/2", 3, 2, 2, 2, "Hold") + " ] }");
        } else {
            sb.AppendLine("    { measure: 1, beats: [ " + MakeB(1, "G", "1/4", "play", 3, 0, 0, "Down", 1, "Play G") + ", " + MakeRestB(2, "1/4", 1, "Damp string!") + ", " + MakeB(3, "A", "1/4", "play", 3, 2, 2, "Down", 1, "Play A") + ", " + MakeRestB(4, "1/4", 1, "Damp string!") + " ] },");
            sb.AppendLine("    { measure: 2, beats: [ " + MakeB(1, "D", "1/4", "play", 4, 0, 0, "Down", 1, "Play D") + ", " + MakeRestB(2, "1/4", 1, "Damp string!") + ", " + MakeB(3, "E", "1/4", "play", 4, 2, 2, "Down", 1, "Play E") + ", " + MakeRestB(4, "1/4", 1, "Damp string!") + " ] }");
        }
        sb.AppendLine("  ]");
        sb.Append("}");
        return sb.ToString();
    }

    private static string MakePimaExercise(string id, string title, int bpm) {
        return MakePimaExercise(id, title, bpm, 1);
    }

    private static string MakePentatonicBox1(string id, string title, int bpm) {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine("{");
        sb.AppendLine(string.Format("  id: '{0}', title: '{1}',", EscapeSingleQuote(id), EscapeSingleQuote(title)));
        sb.AppendLine("  description: 'Instructions: A Minor Pentatonic Box 1 form rooted on 6th string fret 5 (A). Play ascending and descending with alternate picking.',");
        sb.AppendLine(string.Format("  timeSignature: [4, 4], defaultBpm: {0}, concepts: ['Minor Pentatonic', 'Box 1', 'Solo Foundation'],", bpm));
        sb.AppendLine("  tabData: [");
        sb.AppendLine("    { measure: 1, beats: [ " +
            MakeB(1, "A", "1/4", "play", 6, 5, 1, "Down", 1, "A Root") + ", " +
            MakeB(2, "C", "1/4", "play", 6, 8, 4, "Up", 1, "C") + ", " +
            MakeB(3, "D", "1/4", "play", 5, 5, 1, "Down", 1, "D") + ", " +
            MakeB(4, "E", "1/4", "play", 5, 7, 3, "Up", 1, "E") + " ] },");
        sb.AppendLine("    { measure: 2, beats: [ " +
            MakeB(1, "G", "1/4", "play", 4, 5, 1, "Down", 1, "G") + ", " +
            MakeB(2, "A", "1/4", "play", 4, 7, 3, "Up", 1, "A") + ", " +
            MakeB(3, "C", "1/4", "play", 3, 5, 1, "Down", 1, "C") + ", " +
            MakeB(4, "D", "1/4", "play", 3, 7, 3, "Up", 1, "D") + " ] },");
        sb.AppendLine("    { measure: 3, beats: [ " +
            MakeB(1, "E", "1/4", "play", 2, 5, 1, "Down", 1, "E") + ", " +
            MakeB(2, "G", "1/4", "play", 2, 8, 4, "Up", 1, "G") + ", " +
            MakeB(3, "A", "1/4", "play", 1, 5, 1, "Down", 1, "A Root") + ", " +
            MakeB(4, "C", "1/4", "play", 1, 8, 4, "Up", 1, "C") + " ] },");
        sb.AppendLine("    { measure: 4, beats: [ " +
            MakeB(1, "A", "1/1", "play", 1, 5, 1, "Down", 4, "Final A Root") + ", " +
            MakeSustainB(2, "A", "1/1", 1, 5, 1, 4, "Hold") + ", " +
            MakeSustainB(3, "A", "1/1", 1, 5, 1, 4, "Hold") + ", " +
            MakeSustainB(4, "A", "1/1", 1, 5, 1, 4, "Hold") + " ] }");
        sb.AppendLine("  ]");
        sb.Append("}");
        return sb.ToString();
    }

    private static string MakePentatonicBox2(string id, string title, int bpm) {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine("{");
        sb.AppendLine(string.Format("  id: '{0}', title: '{1}',", EscapeSingleQuote(id), EscapeSingleQuote(title)));
        sb.AppendLine("  description: 'Instructions: A Minor Pentatonic Box 2 form rooted around fret 8. Seamlessly connects to Box 1 for expanded soloing.',");
        sb.AppendLine(string.Format("  timeSignature: [4, 4], defaultBpm: {0}, concepts: ['Minor Pentatonic', 'Box 2', 'Scale Connecting'],", bpm));
        sb.AppendLine("  tabData: [");
        sb.AppendLine("    { measure: 1, beats: [ " +
            MakeB(1, "C", "1/4", "play", 6, 8, 2, "Down", 1, "C") + ", " +
            MakeB(2, "D", "1/4", "play", 6, 10, 4, "Up", 1, "D") + ", " +
            MakeB(3, "E", "1/4", "play", 5, 7, 1, "Down", 1, "E") + ", " +
            MakeB(4, "G", "1/4", "play", 5, 10, 4, "Up", 1, "G") + " ] },");
        sb.AppendLine("    { measure: 2, beats: [ " +
            MakeB(1, "A", "1/4", "play", 4, 7, 1, "Down", 1, "A") + ", " +
            MakeB(2, "C", "1/4", "play", 4, 10, 4, "Up", 1, "C") + ", " +
            MakeB(3, "A", "1/2", "play", 4, 7, 1, "Down", 2, "A Root") + ", " +
            MakeSustainB(4, "A", "1/2", 4, 7, 1, 2, "Hold") + " ] }");
        sb.AppendLine("  ]");
        sb.Append("}");
        return sb.ToString();
    }

    private static string MakeBluesScaleA(string id, string title, int bpm) {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine("{");
        sb.AppendLine(string.Format("  id: '{0}', title: '{1}',", EscapeSingleQuote(id), EscapeSingleQuote(title)));
        sb.AppendLine("  description: 'Instructions: The Blues Scale in A with the diminished 5th Blue Note (Eb) at 5th string fret 6 and 3rd string fret 8.',");
        sb.AppendLine(string.Format("  timeSignature: [4, 4], defaultBpm: {0}, concepts: ['Blues Scale', 'Blue Note Eb', '12-Bar Blues'],", bpm));
        sb.AppendLine("  tabData: [");
        sb.AppendLine("    { measure: 1, beats: [ " +
            MakeB(1, "A", "1/4", "play", 6, 5, 1, "Down", 1, "A Root") + ", " +
            MakeB(2, "C", "1/4", "play", 6, 8, 4, "Up", 1, "C") + ", " +
            MakeB(3, "D", "1/4", "play", 5, 5, 1, "Down", 1, "D") + ", " +
            MakeB(4, "Eb", "1/4", "play", 5, 6, 2, "Up", 1, "Eb Blue Note!") + " ] },");
        sb.AppendLine("    { measure: 2, beats: [ " +
            MakeB(1, "E", "1/4", "play", 5, 7, 3, "Down", 1, "E") + ", " +
            MakeB(2, "G", "1/4", "play", 4, 5, 1, "Up", 1, "G") + ", " +
            MakeB(3, "A", "1/2", "play", 4, 7, 3, "Down", 2, "A Root") + ", " +
            MakeSustainB(4, "A", "1/2", 4, 7, 3, 2, "Hold") + " ] }");
        sb.AppendLine("  ]");
        sb.Append("}");
        return sb.ToString();
    }

    // =========================================================================
    // HELPER PRIMITIVES
    // =========================================================================
    private static string MakeB(int b, string n, string sym, string type, int s, int f, int fin, string p, double dur, string tip) {
        return string.Format(System.Globalization.CultureInfo.InvariantCulture,
            "{{ beat: {0}, note: '{1}', symbol: '{2}', type: '{3}', string: {4}, fret: {5}, finger: {6}, pick: '{7}', duration: {8:0.#}, isStart: true, isSustain: false, tip: '{9}' }}",
            b, n, sym, type, s, f, fin, p, dur, Escape(tip));
    }

    private static string MakeSustainB(int b, string n, string sym, int s, int f, int fin, double dur, string tip) {
        return string.Format(System.Globalization.CultureInfo.InvariantCulture,
            "{{ beat: {0}, note: '{1}', symbol: '{2}', type: 'sustain', string: {3}, fret: {4}, finger: {5}, pick: '-', duration: {6:0.#}, isStart: false, isSustain: true, tip: '{7}' }}",
            b, n, sym, s, f, fin, dur, Escape(tip));
    }

    private static string MakeRestB(int b, string sym, double dur, string tip) {
        return string.Format(System.Globalization.CultureInfo.InvariantCulture,
            "{{ beat: {0}, note: 'REST', symbol: '{1}', type: 'rest', string: null, fret: null, finger: null, pick: '-', duration: {2:0.#}, isStart: true, isSustain: false, tip: '{3}' }}",
            b, sym, dur, Escape(tip));
    }

    private static string MakeRestSustainB(int b, string sym, double dur, string tip) {
        return string.Format(System.Globalization.CultureInfo.InvariantCulture,
            "{{ beat: {0}, note: 'REST', symbol: '{1}', type: 'rest', string: null, fret: null, finger: null, pick: '-', duration: {2:0.#}, isStart: false, isSustain: true, tip: '{3}' }}",
            b, sym, dur, Escape(tip));
    }

    private static int GetFinger(int f) {
        if (f <= 0) return 0;
        if (f <= 4) return f;
        return ((f - 1) % 4) + 1;
    }

    private static string GetNoteName(int str, int f) {
        string[][] notes = new string[][] {
            new string[] { "High E", "F", "F#", "G", "G#", "A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A" },
            new string[] { "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B", "C", "C#", "D", "D#", "E" },
            new string[] { "G", "G#", "A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B", "C" },
            new string[] { "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G" },
            new string[] { "A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B", "C", "C#", "D" },
            new string[] { "Low E", "F", "F#", "G", "G#", "A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A" }
        };
        if (str >= 1 && str <= 6 && f >= 0 && f < notes[str - 1].Length) {
            return notes[str - 1][f];
        }
        return "Note";
    }

    private static string EscapeSingleQuote(string s) {
        if (s == null) return "";
        return s.Replace("\\", "\\\\").Replace("'", "\\'");
    }

    private static string EscapeDoubleQuote(string s) {
        if (s == null) return "";
        return s.Replace("\\", "\\\\").Replace("\"", "\\\"");
    }

    private static string Escape(string s) {
        if (s == null) return "";
        return s.Replace("\\", "\\\\").Replace("'", "\\'").Replace("\"", "\\\"");
    }
}



