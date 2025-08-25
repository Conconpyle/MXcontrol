# Background test runner that writes progress to files
# Run this in a separate PowerShell window

$global:TestStatus = @{
    running = $true
    currentTest = ""
    completed = 0
    failed = 0
    results = @()
}

function Update-Status {
    $global:TestStatus | ConvertTo-Json -Depth 5 | Out-File "test-status.json"
}

function Test-Endpoint {
    param($Method, $Path, $Body = $null)
    
    $global:TestStatus.currentTest = "$Method $Path"
    Update-Status
    
    try {
        $params = @{
            Uri = "http://10.0.0.22:8001/api/v1$Path"
            Method = $Method
        }
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json -Depth 5)
            $params.ContentType = "application/json"
        }
        
        $response = Invoke-RestMethod @params
        $global:TestStatus.completed++
        $global:TestStatus.results += @{
            endpoint = $Path
            method = $Method
            status = "SUCCESS"
            response = $response
        }
        Write-Host "SUCCESS: $Method $Path" -ForegroundColor Green
        return $true
    } catch {
        $global:TestStatus.failed++
        $global:TestStatus.results += @{
            endpoint = $Path
            method = $Method
            status = "FAILED"
            error = $_.Exception.Message
            code = $_.Exception.Response.StatusCode.value__
        }
        Write-Host "FAILED: $Method $Path - $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
        return $false
    } finally {
        Update-Status
    }
}

Write-Host "Test Runner Service Started" -ForegroundColor Cyan
Write-Host "Check test-status.json for real-time updates" -ForegroundColor Yellow

# Quick tests
Test-Endpoint -Method "GET" -Path "/canvas"
Test-Endpoint -Method "GET" -Path "/device/info"
Test-Endpoint -Method "GET" -Path "/device/status"
Test-Endpoint -Method "GET" -Path "/screen/layers?screenID={7e9cd858-780b-40d1-9f20-0fa0d53a06ce}"

$global:TestStatus.running = $false
$global:TestStatus.currentTest = "Complete"
Update-Status

Write-Host ""
Write-Host "Test Complete!" -ForegroundColor Green
Write-Host "Results saved to test-status.json" -ForegroundColor Cyan