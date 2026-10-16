# Render PDF pages to PNG using Windows.Data.Pdf
param(
    [string]$pdfPath,
    [string]$pagesStr,
    [string]$outDir = "rendered_pages"
)

$pages = $pagesStr.Split(',') | ForEach-Object { [int]$_.Trim() }

Add-Type -AssemblyName System.Runtime.WindowsRuntime
$asTaskGeneric = ([System.WindowsRuntimeSystemExtensions].GetMethods() | ? { $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' })[0]

function Await($WinRtTask, $ResultType) {
    $asTask = $asTaskGeneric.MakeGenericMethod($ResultType)
    $netTask = $asTask.Invoke($null, @($WinRtTask))
    $netTask.Wait(-1) | Out-Null
    $netTask.Result
}

[Windows.Storage.StorageFile, Windows.Storage, ContentType = WindowsRuntime] | Out-Null
[Windows.Data.Pdf.PdfDocument, Windows.Data.Pdf, ContentType = WindowsRuntime] | Out-Null

$file = Await ([Windows.Storage.StorageFile]::GetFileFromPathAsync((Resolve-Path $pdfPath).Path)) ([Windows.Storage.StorageFile])
$doc = Await ([Windows.Data.Pdf.PdfDocument]::LoadFromFileAsync($file)) ([Windows.Data.Pdf.PdfDocument])

Write-Host "Total pages: $($doc.PageCount)"
if (!(Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir | Out-Null }

foreach ($p in $pages) {
    if ($p -ge 0 -and $p -lt $doc.PageCount) {
        $page = $doc.GetPage($p)
        $outPath = Join-Path (Resolve-Path $outDir).Path "page_$($p+1).png"
        
        $outFile = Await ([Windows.Storage.StorageFile]::GetFileFromPathAsync((New-Item -ItemType File -Path $outPath -Force).FullName)) ([Windows.Storage.StorageFile])
        $stream = Await ($outFile.OpenAsync([Windows.Storage.FileAccessMode]::ReadWrite)) ([Windows.Storage.Streams.IRandomAccessStream])
        
        $renderOptions = New-Object Windows.Data.Pdf.PdfPageRenderOptions
        # Normal resolution
        $renderOptions.DestinationWidth = 1000
        
        $renderTask = $page.RenderToStreamAsync($stream, $renderOptions)
        $asTaskVoid = ([System.WindowsRuntimeSystemExtensions].GetMethods() | ? { $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncAction' })[0]
        $netVoidTask = $asTaskVoid.Invoke($null, @($renderTask))
        $netVoidTask.Wait(-1) | Out-Null
        
        $stream.Dispose()
        Write-Host "Rendered page $($p+1) -> $outPath"
    }
}
