Add-Type -AssemblyName System.Runtime.WindowsRuntime
[Windows.Storage.StorageFile, Windows.Storage, ContentType=WindowsRuntime] | Out-Null
[Windows.Data.Pdf.PdfDocument, Windows.Data.Pdf, ContentType=WindowsRuntime] | Out-Null
[Windows.Media.Ocr.OcrEngine, Windows.Media.Ocr, ContentType=WindowsRuntime] | Out-Null
[Windows.Graphics.Imaging.BitmapDecoder, Windows.Graphics.Imaging, ContentType=WindowsRuntime] | Out-Null

$asTaskGeneric = ([System.WindowsRuntimeSystemExtensions].GetMethods() | ? { $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' })[0]
$asTaskVoid = ([System.WindowsRuntimeSystemExtensions].GetMethods() | ? { $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncAction' })[0]

function Await($op, $t) {
    $m = $asTaskGeneric.MakeGenericMethod($t)
    $task = $m.Invoke($null, @($op))
    $task.Wait(-1) | Out-Null
    return $task.Result
}

function AwaitVoid($op) {
    $netVoidTask = $asTaskVoid.Invoke($null, @($op))
    $netVoidTask.Wait(-1) | Out-Null
}

$pdfPath = (Resolve-Path "C:\Users\govin\Downloads\convo2.pdf").Path
$file = Await ([Windows.Storage.StorageFile]::GetFileFromPathAsync($pdfPath)) ([Windows.Storage.StorageFile])
$doc = Await ([Windows.Data.Pdf.PdfDocument]::LoadFromFileAsync($file)) ([Windows.Data.Pdf.PdfDocument])

Write-Host "Total PDF Pages: $($doc.PageCount)"
$engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromUserProfileLanguages()

$outDir = (Resolve-Path "convo2_pages").Path
$outFile = "convo2_ocr_full.txt"
if (Test-Path $outFile) { Remove-Item $outFile }

for ($p = 0; $p -lt $doc.PageCount; $p++) {
    $pageNum = $p + 1
    $pngPath = Join-Path $outDir "page_$pageNum.png"
    if (!(Test-Path $pngPath)) {
        $page = $doc.GetPage($p)
        $pngFile = Await ([Windows.Storage.StorageFile]::GetFileFromPathAsync((New-Item -ItemType File -Path $pngPath -Force).FullName)) ([Windows.Storage.StorageFile])
        $stream = Await ($pngFile.OpenAsync([Windows.Storage.FileAccessMode]::ReadWrite)) ([Windows.Storage.Streams.IRandomAccessStream])
        $renderOptions = New-Object Windows.Data.Pdf.PdfPageRenderOptions
        $renderOptions.DestinationWidth = 1200
        $renderTask = $page.RenderToStreamAsync($stream, $renderOptions)
        AwaitVoid $renderTask
        $stream.Dispose()
    }

    # OCR the image
    $imgFile = Await ([Windows.Storage.StorageFile]::GetFileFromPathAsync($pngPath)) ([Windows.Storage.StorageFile])
    $imgStream = Await ($imgFile.OpenAsync([Windows.Storage.FileAccessMode]::Read)) ([Windows.Storage.Streams.IRandomAccessStream])
    $decoder = Await ([Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($imgStream)) ([Windows.Graphics.Imaging.BitmapDecoder])
    $bitmap = Await ($decoder.GetSoftwareBitmapAsync()) ([Windows.Graphics.Imaging.SoftwareBitmap])
    $ocrResult = Await ($engine.RecognizeAsync($bitmap)) ([Windows.Media.Ocr.OcrResult])
    $imgStream.Dispose()

    $header = "`n`n==================== PAGE $pageNum ====================`n`n"
    [System.IO.File]::AppendAllText($outFile, $header + $ocrResult.Text, [System.Text.Encoding]::UTF8)
    if ($pageNum % 5 -eq 0 -or $pageNum -eq $doc.PageCount) {
        Write-Host "Processed page $pageNum / $($doc.PageCount)"
    }
}

Write-Host "Done! Full OCR saved to $outFile"
