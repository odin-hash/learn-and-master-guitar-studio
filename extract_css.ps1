$content = Get-Content "convo2_ocr_full.txt" -Raw
$pages = $content -split '==================== PAGE \d+ ===================='

$cssLines = @()
for ($i = 21; $i -le 40; $i++) {
    $pText = $pages[$i]
    $lines = $pText -split '\r?\n'
    foreach ($line in $lines) {
        if ($line -match 'Continuing Previous Conversation|https://gemini|10/15/26,') { continue }
        if ($line -match 'Summary of What These Updates Add' -or $line -match '1\. style\.css \(Complete Replacement\)' -or $line -match 'Save this over your style\.css') { continue }
        if ($line -match '^\s*\d+\.\s+[A-Z]') { continue }
        $cssLines += $line
    }
}

$cssText = $cssLines -join "`n"
[System.IO.File]::WriteAllText("style_extracted.css", $cssText, [System.Text.Encoding]::UTF8)
Write-Host "Wrote style_extracted.css ($($cssText.Length) chars)"
