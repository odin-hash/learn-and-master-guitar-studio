Add-Type -AssemblyName System.Drawing
[Windows.Storage.StorageFile, Windows.Storage, ContentType = WindowsRuntime] | Out-Null
[Windows.Data.Pdf.PdfDocument, Windows.Data.Pdf, ContentType = WindowsRuntime] | Out-Null

async function RenderPages($pdfPath, $outDir, $pageIndices) {
    $file = [Windows.Storage.StorageFile]::GetFileFromPathAsync($pdfPath).GetAwaiter().GetResult()
    $doc = [Windows.Data.Pdf.PdfDocument]::LoadFromFileAsync($file).GetAwaiter().GetResult()
    
    if (!(Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir -Force | Out-Null }
    
    foreach ($idx in $pageIndices) {
        if ($idx -lt $doc.PageCount) {
            $page = $doc.GetPage($idx)
            $outPath = Join-Path $outDir "page_$($idx + 1).png"
            $stream = New-Object Windows.Storage.Streams.InMemoryRandomAccessStream
            $page.RenderToStreamAsync($stream).GetAwaiter().GetResult()
            
            $netStream = $stream.AsStreamForRead()
            $bmp = [System.Drawing.Bitmap]::FromStream($netStream)
            $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
            $bmp.Dispose()
            $netStream.Dispose()
            $stream.Dispose()
            Write-Host "Rendered page $($idx + 1) to $outPath"
        }
    }
}

RenderPages "$pwd\Learn-and-Master-Guitar-Lesson-Book.pdf" "$pwd\lesson_pages" @(3, 4, 5, 6, 7, 8, 9, 10)