$raw = [System.IO.File]::ReadAllBytes('.\Learn-and-Master-Guitar-Bonus-Workshop-Book.pdf')
$ascii = [System.Text.Encoding]::ASCII.GetString($raw)

$regex = [regex]'/Title\s*\((.*?)\)|/Author\s*\((.*?)\)|/Type\s*/Outlines|/Type\s*/Page\b'
$matches = $regex.Matches($ascii)
Write-Host "Matches count: $($matches.Count)"
foreach ($m in $matches) {
    if ($m.Value -notmatch '/Page') {
        Write-Host $m.Value
    }
}

# Count number of pages
$pageMatches = [regex]::Matches($ascii, '/Type\s*/Page\b')
Write-Host "Total Pages: $($pageMatches.Count)"
