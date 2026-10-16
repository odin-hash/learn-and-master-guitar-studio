using System;
using System.IO;
using System.IO.Compression;
using System.Text;

public class StreamInspector {
    public static void Main(string[] args) {
        byte[] data = File.ReadAllBytes(args[0]);
        byte[] marker = Encoding.ASCII.GetBytes("stream");
        byte[] endMarker = Encoding.ASCII.GetBytes("endstream");
        int pos = 0;
        int found = 0;
        while (pos < data.Length && found < 5) {
            int s = IndexOf(data, marker, pos);
            if (s == -1) break;
            int start = s + 6;
            while (start < data.Length && (data[start] == '\r' || data[start] == '\n')) start++;
            int e = IndexOf(data, endMarker, start);
            if (e == -1) break;
            while (e > start && (data[e - 1] == '\r' || data[e - 1] == '\n')) e--;
            int len = e - start;
            if (len > 2) {
                try {
                    using (MemoryStream ms = new MemoryStream(data, start + 2, len - 2))
                    using (DeflateStream ds = new DeflateStream(ms, CompressionMode.Decompress))
                    using (MemoryStream outMs = new MemoryStream()) {
                        ds.CopyTo(outMs);
                        byte[] decomp = outMs.ToArray();
                        string text = Encoding.UTF8.GetString(decomp);
                        if (text.Contains("BT") && text.Contains("ET")) {
                            Console.WriteLine("=== TEXT STREAM {0} (len {1}) ===", found, text.Length);
                            Console.WriteLine(text.Substring(0, Math.Min(text.Length, 1500)));
                            found++;
                        }
                    }
                } catch {}
            }
            pos = e + 9;
        }
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
