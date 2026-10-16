using System;
using System.IO;
using System.Text.RegularExpressions;
using System.Collections.Generic;

public class SimScheduler {
    public static void Main() {
        string txt = File.ReadAllText("exercises.js");
        
        // Let's test lb-s1-tour and lb-s2-rest-ex1 and lb-s2-rest-ex2
        string[] testIds = new string[] { "lb-s1-tour", "lb-s2-rest-ex1", "lb-s2-rest-ex2", "lb-s2-rest-ex3", "lb-s3-rests-ex1", "lb-s3-8th-ex2", "lb-s3-8th-ex6" };
        
        foreach (string id in testIds) {
            Console.WriteLine("=== Testing ID: " + id + " ===");
            Regex exRegex = new Regex(@"id:\s*'" + id + @"'.*?tabData:\s*\[(.*?)\n\s*\]\s*\}", RegexOptions.Singleline);
            Match exMatch = exRegex.Match(txt);
            if (!exMatch.Success) {
                Console.WriteLine("Not found!");
                continue;
            }
            string tabData = exMatch.Groups[1].Value;
            Regex mRegex = new Regex(@"\{\s*measure:\s*(\d+).*?beats:\s*\[(.*?)\]\s*\}", RegexOptions.Singleline);
            MatchCollection mMatches = mRegex.Matches(tabData);
            
            int mIdx = 0;
            int bInMeasure = 0;
            int numBeats = 4;
            
            // Run 16 beats of simulation
            for (int step = 0; step < 16; step++) {
                if (mIdx >= mMatches.Count) mIdx = 0;
                string bStr = mMatches[mIdx].Groups[2].Value;
                Regex bRegex = new Regex(@"\{\s*beat:\s*(\d+).*?note:\s*'([^']*)'.*?symbol:\s*'([^']*)'.*?type:\s*'([^']*)'.*?duration:\s*([0-9\.]+)", RegexOptions.Singleline);
                MatchCollection bMatches = bRegex.Matches(bStr);
                
                // Timeline
                List<double> startOffsets = new List<double>();
                List<string> types = new List<string>();
                List<string> notes = new List<string>();
                
                if (bMatches.Count == numBeats) {
                    for (int i = 0; i < bMatches.Count; i++) {
                        startOffsets.Add(i * 1.0);
                        types.Add(bMatches[i].Groups[4].Value);
                        notes.Add(bMatches[i].Groups[2].Value);
                    }
                } else {
                    double pos = 0;
                    for (int i = 0; i < bMatches.Count; i++) {
                        startOffsets.Add(pos);
                        types.Add(bMatches[i].Groups[4].Value);
                        notes.Add(bMatches[i].Groups[2].Value);
                        double dur = double.Parse(bMatches[i].Groups[5].Value, System.Globalization.CultureInfo.InvariantCulture);
                        pos += dur;
                    }
                }
                
                // notesInThisBeat
                bool isBeatRest = false;
                List<int> matched = new List<int>();
                for (int i = 0; i < startOffsets.Count; i++) {
                    if (startOffsets[i] >= (bInMeasure - 0.02) && startOffsets[i] < (bInMeasure + 0.98)) {
                        matched.Add(i);
                    }
                }
                if (matched.Count > 0) {
                    isBeatRest = (types[matched[0]] == "rest");
                }
                
                string noteNames = "";
                foreach (int mi in matched) noteNames += notes[mi] + "(" + types[mi] + ") ";
                Console.WriteLine(string.Format("Step {0:00} | Bar {1} Beat {2} | isBeatRest={3} | notes: {4}",
                    step, mIdx + 1, bInMeasure + 1, isBeatRest, noteNames));
                
                // advanceBeat
                bInMeasure++;
                if (bInMeasure >= numBeats) {
                    bInMeasure = 0;
                    mIdx++;
                    if (mIdx >= mMatches.Count) mIdx = 0;
                }
            }
        }
    }
}
