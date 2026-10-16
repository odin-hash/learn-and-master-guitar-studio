using System;
using System.IO;
using System.IO.Compression;
using System.Text;

public class TestObj4 {
    public static void Main() {
        byte[] data = File.ReadAllBytes(@"C:\Users\govin\Downloads\convo2.pdf");
        byte[] marker = Encoding.ASCII.GetBytes("stream");
        int s = 0;
        int found = 0;
        while ((s = IndexOf(data, marker, s)) != -1 && found < 5) {
            int start = s + 6;
            while (start < data.Length && (data[start] == 13 || data[start] == 10)) start++;
            if (start < data.Length && data[start] == 0x78) {
                int e = IndexOf(data, Encoding.ASCII.GetBytes("endstream"), start);
                int end = e;
                while (end > start && (data[end - 1] == 13 || data[end - 1] == 10)) end--;
                int len = end - start;
                try {
                    using (MemoryStream ms = new MemoryStream(data, start + 2, len - 2))
                    using (DeflateStream ds = new DeflateStream(ms, CompressionMode.Decompress))
                    using (MemoryStream outMs = new MemoryStream()) {
                        ds.CopyTo(outMs);
                        byte[] decomp = outMs.ToArray();
                        string text = Encoding.UTF8.GetString(decomp);
                        Console.WriteLine("=== STREAM at {0}, len={1}, decompLen={2} ===", s, len, decomp.Length);
                        Console.WriteLine(text.Substring(0, Math.Min(text.Length, 600)));
                        found++;
                    }
                } catch (Exception ex) {
                    Console.WriteLine("Failed at {0}: {1}", s, ex.Message);
                }
            }
            s += 6;
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
