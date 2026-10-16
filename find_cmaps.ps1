# Inspect Bonus Workshop Book fonts and ToUnicode
$code = @"
using System;
using System.IO;
using System.IO.Compression;
using System.Text;
using System.Text.RegularExpressions;
using System.Collections.Generic;

public class CMapInspector {
    public static void FindCMaps(string pdfPath) {
        byte[] bytes = File.ReadAllBytes(pdfPath);
        string raw = Encoding.ASCII.GetString(bytes);
        var matches = Regex.Matches(raw, @"stream[\r\n]+");
        
        Console.WriteLine("Streams count: " + matches.Count);
        int cmapCount = 0;
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
                    if (text.Contains("beginbfrange") || text.Contains("beginbfchar")) {
                        cmapCount++;
                        Console.WriteLine("Found ToUnicode CMap: len=" + text.Length);
                        File.WriteAllText("cmap_" + cmapCount + ".txt", text);
                    }
                }
            } catch {}
        }
        Console.WriteLine("Total CMaps: " + cmapCount);
    }
}
"@

Add-Type -TypeDefinition $code -ErrorAction SilentlyContinue
[CMapInspector]::FindCMaps((Resolve-Path ".\Learn-and-Master-Guitar-Bonus-Workshop-Book.pdf").Path)
