# Look for Table of Contents in Lesson Book and Bonus Workshop Book
$code = @"
using System;
using System.IO;
using System.IO.Compression;
using System.Text;
using System.Text.RegularExpressions;
using System.Collections.Generic;

public class PdfScanner {
    public static void ScanTOC(string pdfPath, string outPath) {
        byte[] bytes = File.ReadAllBytes(pdfPath);
        string raw = Encoding.ASCII.GetString(bytes);
        var matches = Regex.Matches(raw, @"stream[\r\n]+");
        var sb = new StringBuilder();

        for (int i = 0; i < matches.Count; i++) {
            int start = matches[i].Index + matches[i].Length;
            int end = raw.IndexOf("endstream", start);
            if (end <= start || end - start <= 2) continue;

            try {
                using (var ms = new MemoryStream(bytes, start + 2, end - start - 2))
                using (var ds = new DeflateStream(ms, CompressionMode.Decompress))
                using (var outMs = new MemoryStream()) {
                    ds.CopyTo(outMs);
                    string text = Encoding.UTF8.GetString(outMs.ToArray());
                    
                    // Look for page headers, session titles, workshop titles, exercise titles
                    var lines = text.Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries);
                    foreach (var line in lines) {
                        if (line.Contains("Session") || line.Contains("Workshop") || line.Contains("Exercise") || line.Contains("PAGE") || line.Contains("Page") || line.Contains("Table of Contents")) {
                            sb.AppendLine(line);
                        }
                    }
                }
            } catch {}
        }
        File.WriteAllText(outPath, sb.ToString());
    }
}
"@

Add-Type -TypeDefinition $code -ErrorAction SilentlyContinue

[PdfScanner]::ScanTOC((Resolve-Path ".\Learn-and-Master-Guitar-Lesson-Book.pdf").Path, "lesson_toc.txt")
[PdfScanner]::ScanTOC((Resolve-Path ".\Learn-and-Master-Guitar-Bonus-Workshop-Book.pdf").Path, "bonus_toc.txt")

Write-Host "Scanned TOC!"
