param([int]$startP, [int]$endP, [string]$outFile)
Add-Type -AssemblyName System.Runtime.WindowsRuntime
[Windows.Storage.StorageFile, Windows.Storage, ContentType=WindowsRuntime] | Out-Null
[Windows.Media.Ocr.OcrEngine, Windows.Media.Ocr, ContentType=WindowsRuntime] | Out-Null
[Windows.Graphics.Imaging.BitmapDecoder, Windows.Graphics.Imaging, ContentType=WindowsRuntime] | Out-Null

$asTaskGeneric = [System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object { 
    $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' 
}

function Await($op, $t) {
    $m = $asTaskGeneric[0].MakeGenericMethod($t)
    $task = $m.Invoke($null, @($op))
    $task.Wait()
    return $task.Result
}

$engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromUserProfileLanguages()

$sb = New-Object System.Text.StringBuilder

foreach ($p in $startP..$endP) {
    $imgPath = (Resolve-Path "convo2_pages\page_$p.png").Path
    $file = Await ([Windows.Storage.StorageFile]::GetFileFromPathAsync($imgPath)) ([Windows.Storage.StorageFile])
    $stream = Await ($file.OpenAsync([Windows.Storage.FileAccessMode]::Read)) ([Windows.Storage.Streams.IRandomAccessStream])
    $decoder = Await ([Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($stream)) ([Windows.Graphics.Imaging.BitmapDecoder])
    $bitmap = Await ($decoder.GetSoftwareBitmapAsync()) ([Windows.Graphics.Imaging.SoftwareBitmap])
    $result = Await ($engine.RecognizeAsync($bitmap)) ([Windows.Media.Ocr.OcrResult])
    $stream.Dispose()
    
    [void]$sb.AppendLine("// ==================== PAGE $p ====================")
    foreach ($line in $result.Lines) {
        $text = $line.Text
        if ($text -match 'Continuing Previous Conversation Context|https://gemini\.google|10/15/26, 11:40 PM') {
            continue
        }
        [void]$sb.AppendLine($text)
    }
}

[System.IO.File]::WriteAllText($outFile, $sb.ToString(), [System.Text.Encoding]::UTF8)
Write-Host "Wrote pages $startP to $endP to $outFile ($($sb.Length) chars)"
