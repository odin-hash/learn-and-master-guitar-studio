using System;
using System.IO;
using System.Text;
using System.Text.RegularExpressions;
using System.Collections.Generic;

public class ProcessConvo {
    public static void Main(string[] args) {
        string text = File.ReadAllText("convo2_ocr_full.txt", Encoding.UTF8);
        string pattern = @"==================== PAGE (\d+) ====================";
        var matches = Regex.Matches(text, pattern);
        Console.WriteLine("Total page headers found: " + matches.Count);

        var pages = new Dictionary<int, string>();
        for (int i = 0; i < matches.Count; i++) {
            int pageNum = int.Parse(matches[i].Groups[1].Value);
            int start = matches[i].Index + matches[i].Length;
            int end = (i + 1 < matches.Count) ? matches[i + 1].Index : text.Length;
            pages[pageNum] = text.Substring(start, end - start);
        }

        if (args.Length > 0 && args[0] == "page" && args.Length > 1) {
            int p = int.Parse(args[1]);
            if (pages.ContainsKey(p)) {
                Console.WriteLine("=== PAGE " + p + " ===");
                Console.WriteLine(pages[p]);
            }
            return;
        }

        if (args.Length > 0 && args[0] == "extract-css") {
            StringBuilder css = new StringBuilder();
            for (int p = 21; p <= 40; p++) {
                if (!pages.ContainsKey(p)) continue;
                string pText = pages[p];
                string[] lines = pText.Split(new[] { "\r\n", "\r", "\n" }, StringSplitOptions.None);
                foreach (string line in lines) {
                    if (line.Contains("Continuing Previous Conversation") || line.Contains("https://gemini") || line.Contains("10/15/26,")) continue;
                    if (line.Contains("Summary of What These Updates Add") || line.Contains("style.css (Complete Replacement)")) continue;
                    if (line.Contains("Save this over your style.css")) continue;
                    css.AppendLine(line);
                }
            }
            File.WriteAllText("style_extracted.css", css.ToString(), Encoding.UTF8);
            Console.WriteLine("Saved style_extracted.css: " + css.Length + " bytes");
            return;
        }

        if (args.Length > 0 && args[0] == "extract-app") {
            StringBuilder app = new StringBuilder();
            for (int p = 40; p <= 70; p++) {
                if (!pages.ContainsKey(p)) continue;
                string pText = pages[p];
                string[] lines = pText.Split(new[] { "\r\n", "\r", "\n" }, StringSplitOptions.None);
                bool inCode = false;
                foreach (string line in lines) {
                    string trimmed = line.Trim();
                    if (trimmed.Contains("Continuing Previous Conversation") || trimmed.Contains("https://gemini") || trimmed.Contains("10/15/26,")) continue;
                    if (trimmed.Contains("2. Additional CSS Rules for style.css")) break;
                    if (trimmed.Contains("import { GUITAR_COURSES }")) inCode = true;
                    if (inCode || p > 40) {
                        app.AppendLine(line);
                    }
                }
            }
            File.WriteAllText("app_extracted.js", app.ToString(), Encoding.UTF8);
            Console.WriteLine("Saved app_extracted.js: " + app.Length + " bytes");
            return;
        }

        if (args.Length > 0 && args[0] == "range" && args.Length > 2) {
            int startP = int.Parse(args[1]);
            int endP = int.Parse(args[2]);
            for (int p = startP; p <= endP; p++) {
                if (pages.ContainsKey(p)) {
                    Console.WriteLine("\n\n------------------- PAGE " + p + " -------------------");
                    Console.WriteLine(pages[p].Substring(0, Math.Min(pages[p].Length, 400)));
                }
            }
        }
    }
}
