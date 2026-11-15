$port = 5173
$folder = if ($PSScriptRoot) { Split-Path -Parent $PSScriptRoot } else { "C:\Users\govin\.gemini\antigravity\scratch\guitar-master-metronome" }

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")

try {
    $listener.Start()
    Write-Host "Guitar Studio Server running at http://localhost:$port/" -ForegroundColor Green

    while ($listener.IsListening) {
        try {
            $context = $listener.GetContext()
            $rawPath = $context.Request.Url.AbsolutePath.TrimStart('/')
            $requestUrl = [System.Uri]::UnescapeDataString($rawPath)
            if ([string]::IsNullOrEmpty($requestUrl)) { $requestUrl = "index.html" }

            $response = $context.Response
            $response.AddHeader("Access-Control-Allow-Origin", "*")
            $response.AddHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS")
            $response.AddHeader("Access-Control-Allow-Headers", "*")

            if ($context.Request.HttpMethod -eq "OPTIONS") {
                $response.StatusCode = 200
                $response.Close()
                continue
            }

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
                    ".json" { "application/json; charset=utf-8" }
                    ".pdf"  { "application/pdf" }
                    default { "application/octet-stream" }
                }
                $bytes = [System.IO.File]::ReadAllBytes($filePath)
                $response.ContentType = $mime
                $response.ContentLength64 = $bytes.Length
                $response.AddHeader("Accept-Ranges", "bytes")

                if ($context.Request.HttpMethod -ne "HEAD") {
                    $response.OutputStream.Write($bytes, 0, $bytes.Length)
                    $response.OutputStream.Flush()
                }
                $response.Close()
            } else {
                $response.StatusCode = 404
                $response.Close()
            }
        } catch {
            Write-Host "Request error: $_" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Error $_
} finally {
    $listener.Stop()
}
