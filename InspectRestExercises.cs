using System;
using System.IO;
using System.Text.RegularExpressions;

public class InspectRestExercises {
    public static void Main() {
        string txt = File.ReadAllText("exercises.js");
        Regex exRegex = new Regex(@"id:\s*'([^']*)'.*?title:\s*'([^']*)'.*?tabData:\s*\[(.*?)\n\s*\]\s*\}", RegexOptions.Singleline);
        MatchCollection exMatches = exRegex.Matches(txt);
        
        foreach (Match em in exMatches) {
            string id = em.Groups[1].Value;
            string title = em.Groups[2].Value;
            string tab = em.Groups[3].Value;
            if (tab.Contains("type: 'rest'")) {
                Console.WriteLine("--------------------------------------------------");
                Console.WriteLine("ID: " + id + " | " + title);
                Regex mRegex = new Regex(@"\{\s*measure:\s*(\d+).*?beats:\s*\[(.*?)\]\s*\}", RegexOptions.Singleline);
                MatchCollection mMatches = mRegex.Matches(tab);
                foreach (Match m in mMatches) {
                    Console.WriteLine("  Measure " + m.Groups[1].Value + ": " + m.Groups[2].Value.Trim());
                }
            }
        }
    }
}
