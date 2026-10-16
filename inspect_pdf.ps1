# Inspect PDF contents
param([string]$pdfPath)

$stream = [System.IO.File]::OpenRead($pdfPath)
$reader = New-Object System.IO.StreamReader($stream, [System.Text.Encoding]::ASCII)
$content = $reader.ReadToEnd()
$reader.Close()
$stream.Close()

Write-Host "File size: $($content.Length) chars"

# Search for /Title or outlines or text
$matches = [regex]::Matches($content, 'Session \d+[:\w\s\-]+|Workshop \d+[:\w\s\-]+')
Write-Host "Found matches: $($matches.Count)"
$matches | Select-Object -First 40 | ForEach-Object { $_.Value.Trim() } | Select-Object -Unique
