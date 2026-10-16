$code = @"
using System;
using System.IO;
using System.IO.Compression;
using System.Text;
using System.Text.RegularExpressions;
using System.Collections.Generic;

public class PdfExtractor {
    public static List<string> ExtractStrings(string pdfPath) {
        byte[] bytes = File.ReadAllBytes(pdfPath);
        string raw = Encoding.ASCII.GetString(bytes);
        var matches = Regex.Matches(raw, @"stream[\r\n]+");
        var results = new List<string>();

        foreach (Match m in matches) {
            int start = m.Index + m.Length;
            int end = raw.IndexOf("endstream", start);
            if (end <= start) continue;
            int len = end - start;
            if (len <= 2) continue;

            try {
                // Skip 2-byte zlib header (0x78 ...)
                using (var ms = new MemoryStream(bytes, start + 2, len - 2))
                using (var ds = new DeflateStream(ms, CompressionMode.Decompress))
                using (var outMs = new MemoryStream()) {
                    ds.CopyTo(outMs);
                    string text = Encoding.UTF8.GetString(outMs.ToArray());
                    var textMatches = Regex.Matches(text, @"\(([^)\\]*(?:\\.[^)\\]*)*)\)\s*T[jJ]");
                    foreach (Match tm in textMatches) {
                        string val = tm.Groups[1].Value;
                        if (!string.IsNullOrWhiteSpace(val)) {
                            results.Add(val);
                        }
                    }
                }
            } catch {
                // Ignore non-zlib streams or images
            }
        }
        return results;
    }
}
"@

Add-Type -TypeDefinition $code

$tokens1 = [PdfExtractor]::ExtractStrings((Resolve-Path ".\Learn-and-Master-Guitar-Lesson-Book.pdf").Path)
Write-Host "Lesson Book extracted tokens: $($tokens1.Count)"
$text1 = $tokens1 -join " "
[System.IO.File]::WriteAllText("lesson_book_text.txt", $text1)

$tokens2 = [PdfExtractor]::ExtractStrings((Resolve-Path ".\Learn-and-Master-Guitar-Bonus-Workshop-Book.pdf").Path)
Write-Host "Bonus Workshop Book extracted tokens: $($tokens2.Count)"
$text2 = $tokens2 -join " "
[System.IO.File]::WriteAllText("bonus_book_text.txt", $text2)

Write-Host "Done dumping text!"
