# Extract PDF Bookmarks / Outline tree
$code = @"
using System;
using System.IO;
using System.Text;
using System.Text.RegularExpressions;
using System.Collections.Generic;

public class OutlineReader {
    public static void ReadOutlines(string pdfPath) {
        Console.WriteLine("=== Outline for: " + Path.GetFileName(pdfPath) + " ===");
        byte[] bytes = File.ReadAllBytes(pdfPath);
        string raw = Encoding.ASCII.GetString(bytes);

        // Find all bookmark titles /Title (...)
        var matches = Regex.Matches(raw, @"/Title\s*\(([^)]+)\)");
        foreach (Match m in matches) {
            Console.WriteLine("Bookmark: " + m.Groups[1].Value);
        }
    }
}
"@

Add-Type -TypeDefinition $code -ErrorAction SilentlyContinue

[OutlineReader]::ReadOutlines((Resolve-Path ".\Learn-and-Master-Guitar-Bonus-Workshop-Book.pdf").Path)
[OutlineReader]::ReadOutlines((Resolve-Path ".\Learn-and-Master-Guitar-Lesson-Book.pdf").Path)
