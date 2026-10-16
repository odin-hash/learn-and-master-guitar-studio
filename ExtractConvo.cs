using System;
using System.IO;
using System.IO.Compression;
using System.Text;
using System.Text.RegularExpressions;
using System.Collections.Generic;

public class PdfExtractor {
    public static void Main(string[] args) {
        string path = args[0];
        string outPath = args[1];
        byte[] data = File.ReadAllBytes(path);
        StringBuilder allText = new StringBuilder();

        byte[] streamMarker = Encoding.ASCII.GetBytes("stream");
        byte[] endMarker = Encoding.ASCII.GetBytes("endstream");

        int pos = 0;
        int streamCount = 0;
        while (pos < data.Length) {
            int sIdx = IndexOf(data, streamMarker, pos);
            if (sIdx == -1) break;
            
            int start = sIdx + 6;
            while (start < data.Length && (data[start] == '\r' || data[start] == '\n')) start++;
            
            int eIdx = IndexOf(data, endMarker, start);
            if (eIdx == -1) break;
            
            int end = eIdx;
            while (end > start && (data[end - 1] == '\r' || data[end - 1] == '\n')) end--;

            int len = end - start;
            if (len > 2) {
                try {
                    using (MemoryStream ms = new MemoryStream(data, start + 2, len - 2))
                    using (DeflateStream ds = new DeflateStream(ms, CompressionMode.Decompress))
                    using (MemoryStream outMs = new MemoryStream()) {
                        ds.CopyTo(outMs);
                        byte[] decomp = outMs.ToArray();
                        string s = Encoding.UTF8.GetString(decomp);
                        
                        ExtractTextFromPdfStream(s, allText);
                        streamCount++;
                    }
                } catch {
                }
            }
            pos = eIdx + 9;
        }

        File.WriteAllText(outPath, allText.ToString(), Encoding.UTF8);
        Console.WriteLine("Extracted from {0} streams, total chars: {1}", streamCount, allText.Length);
    }

    private static void ExtractTextFromPdfStream(string s, StringBuilder sb) {
        // Find text commands in PDF stream
        // In Chrome PDFs, text is typically in (string) Tj or [(string) num (string)] TJ
        int idx = 0;
        while (idx < s.Length) {
            int tjIdx = s.IndexOf("Tj", idx, StringComparison.Ordinal);
            int bigTjIdx = s.IndexOf("TJ", idx, StringComparison.Ordinal);
            
            if (tjIdx == -1 && bigTjIdx == -1) break;
            
            int nextOp = -1;
            bool isBig = false;
            if (tjIdx != -1 && (bigTjIdx == -1 || tjIdx < bigTjIdx)) {
                nextOp = tjIdx;
                isBig = false;
            } else {
                nextOp = bigTjIdx;
                isBig = true;
            }

            int lineStart = s.LastIndexOf('\n', nextOp);
            if (lineStart < idx) lineStart = idx;
            string chunk = s.Substring(lineStart, nextOp - lineStart);

            if (isBig) {
                // Parse array [ ... ]
                int bOpen = chunk.LastIndexOf('[');
                if (bOpen != -1) {
                    string arrayBody = chunk.Substring(bOpen);
                    var matches = Regex.Matches(arrayBody, @"\((.*?)\)");
                    StringBuilder line = new StringBuilder();
                    foreach (Match m in matches) {
                        line.Append(UnescapePdfString(m.Groups[1].Value));
                    }
                    if (line.Length > 0) sb.AppendLine(line.ToString());
                }
            } else {
                // Parse ( ... )
                int pOpen = chunk.LastIndexOf('(');
                int pClose = chunk.LastIndexOf(')');
                if (pOpen != -1 && pClose > pOpen) {
                    string text = UnescapePdfString(chunk.Substring(pOpen + 1, pClose - pOpen - 1));
                    if (!string.IsNullOrWhiteSpace(text)) sb.AppendLine(text);
                }
            }

            idx = nextOp + 2;
        }
    }

    private static string UnescapePdfString(string s) {
        return s.Replace("\\r", "").Replace("\\n", "").Replace("\\(", "(").Replace("\\)", ")").Replace("\\\\", "\\");
    }

    private static int IndexOf(byte[] haystack, byte[] needle, int start) {
        for (int i = start; i <= haystack.Length - needle.Length; i++) {
            bool match = true;
            for (int j = 0; j < needle.Length; j++) {
                if (haystack[i + j] != needle[j]) { match = false; break; }
            }
            if (match) return i;
        }
        return -1;
    }
}
