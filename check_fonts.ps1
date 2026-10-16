$raw = [System.IO.File]::ReadAllText('.\Learn-and-Master-Guitar-Bonus-Workshop-Book.pdf', [System.Text.Encoding]::ASCII)
$fonts = [regex]::Matches($raw, '/BaseFont\s*/([^\s/]+)|/Encoding\s*/([^\s/]+)')
Write-Host "Found $($fonts.Count) font references:"
$fonts | ForEach-Object { $_.Value } | Select-Object -Unique | Select-Object -First 30
