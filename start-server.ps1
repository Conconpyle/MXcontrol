# Simple HTTP Server for MX Control
# This script starts a local web server to properly serve the MX Control application

$port = 8080
$root = Get-Location

Write-Host "Starting MX Control Web Server..." -ForegroundColor Green
Write-Host "Server root: $root" -ForegroundColor Cyan
Write-Host "Server URL: http://localhost:$port" -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""

# Create HTTP listener
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Prefixes.Add("http://127.0.0.1:$port/")
$listener.Start()

Write-Host "Server is running at http://localhost:$port" -ForegroundColor Green
Write-Host "Opening browser..." -ForegroundColor Cyan
Start-Process "http://localhost:$port"

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        # Get the requested file path
        $requestedFile = $request.Url.LocalPath
        if ($requestedFile -eq "/") {
            $requestedFile = "/index.html"
        }
        
        $filePath = Join-Path $root $requestedFile.TrimStart('/')
        
        Write-Host "Request: $requestedFile" -ForegroundColor Gray
        
        if (Test-Path $filePath) {
            # Determine content type
            $contentType = switch ([System.IO.Path]::GetExtension($filePath)) {
                ".html" { "text/html" }
                ".css" { "text/css" }
                ".js" { "application/javascript" }
                ".json" { "application/json" }
                ".png" { "image/png" }
                ".jpg" { "image/jpeg" }
                ".gif" { "image/gif" }
                ".svg" { "image/svg+xml" }
                ".ico" { "image/x-icon" }
                default { "application/octet-stream" }
            }
            
            # Read and send file
            $buffer = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentType = $contentType
            $response.ContentLength64 = $buffer.Length
            
            # Add CORS headers for API access
            $response.Headers.Add("Access-Control-Allow-Origin", "*")
            $response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
            $response.Headers.Add("Access-Control-Allow-Headers", "Content-Type")
            
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
            $response.StatusCode = 200
        }
        else {
            # File not found
            $response.StatusCode = 404
            $errorMessage = "404 - File not found: $requestedFile"
            $buffer = [System.Text.Encoding]::UTF8.GetBytes($errorMessage)
            $response.ContentType = "text/plain"
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
            Write-Host $errorMessage -ForegroundColor Red
        }
        
        $response.Close()
    }
}
finally {
    $listener.Stop()
    Write-Host "Server stopped" -ForegroundColor Red
}
