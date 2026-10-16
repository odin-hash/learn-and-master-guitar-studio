$port = 5173
$folder = $PSScriptRoot
if (-not $folder) { $folder = "C:\Users\govin\.gemini\antigravity\scratch\guitar-master-metronome" }

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")

try {
    $listener.Start()
    Write-Host "Guitar Studio Server running at http://localhost:$port/" -ForegroundColor Green
    Start-Process "http://localhost:$port/"

    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $requestUrl = $context.Request.Url.AbsolutePath.TrimStart('/')
        if ([string]::IsNullOrEmpty($requestUrl)) { $requestUrl = "index.html" }

        $response = $context.Response
        if ($requestUrl -eq "favicon.ico") {
            $response.StatusCode = 204
            $response.Close()
            continue
        }

        $filePath = Join-Path $folder $requestUrl
        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $mime = switch ($ext) {
                ".html" { "text/html; charset=utf-8" }
                ".js"   { "application/javascript; charset=utf-8" }
                ".css"  { "text/css; charset=utf-8" }
                default { "application/octet-stream" }
            }
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentType = $mime
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
        }
        $response.Close()
    }
} catch {
    Write-Error $_
} finally {
    $listener.Stop()
}
