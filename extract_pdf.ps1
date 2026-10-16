# WinRT PDF or FlateDecode test
$path = (Resolve-Path ".\Learn-and-Master-Guitar-Lesson-Book.pdf").Path
$bytes = [System.IO.File]::ReadAllBytes($path)

# Let's find FlateDecode streams
$streamMatches = [System.Text.RegularExpressions.Regex]::Matches([System.Text.Encoding]::ASCII.GetString($bytes), "stream\r?\n")
Write-Host "Found $($streamMatches.Count) streams"

# Let's write a small zlib / deflate reader
function Decompress-Zlib($bytes, $offset, $length) {
    if ($length -le 2) { return "" }
    # zlib header is 2 bytes (usually 0x78 0x9c or 0x78 0x01 etc)
    $ms = New-Object System.IO.MemoryStream($bytes, $offset + 2, $length - 2)
    $ds = New-Object System.IO.Compression.DeflateStream($ms, [System.IO.Compression.CompressionMode]::Decompress)
    $out = New-Object System.IO.MemoryStream
    try {
        $ds.CopyTo($out)
        return [System.Text.Encoding]::UTF8.GetString($out.ToArray())
    } catch {
        return ""
    } finally {
        $ds.Dispose()
        $ms.Dispose()
        $out.Dispose()
    }
}

# Let's search for BT ... ET text blocks
$allText = New-Object System.Text.StringBuilder
for ($i = 0; $i -lt $streamMatches.Count; $i++) {
    $start = $streamMatches[$i].Index + $streamMatches[$i].Length
    $end = [System.Text.Encoding]::ASCII.GetString($bytes, $start, [Math]::Min(100000, $bytes.Length - $start)).IndexOf("endstream")
    if ($end -gt 0) {
        $decomp = Decompress-Zlib $bytes $start $end
        if ($decomp -match "\((.*?)\)\s*Tj|\[(.*?)\]\s*TJ") {
            [void]$allText.AppendLine($decomp)
        }
    }
}

$extracted = $allText.ToString()
Write-Host "Extracted text stream length: $($extracted.Length)"

# Extract all text in parentheses before Tj or TJ
$textMatches = [regex]::Matches($extracted, '\(([^)]+)\)\s*Tj')
Write-Host "Found $($textMatches.Count) text tokens"
$lines = $textMatches | ForEach-Object { $_.Groups[1].Value }
$fullText = $lines -join " "

# Look for Session or Workshop or Table of contents
Write-Host "Sample text:"
$lines | Select-Object -First 100 | ForEach-Object { $_ }
