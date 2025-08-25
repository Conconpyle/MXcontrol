# Test layer-related endpoints
$CONFIG = @{
    IP = "10.0.0.22"
    PORT = "8001" 
    SCREEN_ID = "{7e9cd858-780b-40d1-9f20-0fa0d53a06ce}"
}

$BASE_URL = "http://$($CONFIG.IP):$($CONFIG.PORT)/api/v1"

Write-Host "Testing Layer Management Endpoints..." -ForegroundColor Cyan

$results = @()

# Test different layer endpoint variations
$layerTests = @(
    @{method="GET"; path="/screen/layer"; desc="Get layers from screen"},
    @{method="GET"; path="/layer"; desc="Get layers direct"},
    @{method="GET"; path="/screen/layer?screenID=$($CONFIG.SCREEN_ID)"; desc="Get layers with screenID param"},
    @{method="POST"; path="/screen/layer"; desc="Create layer"; body=@{screenID=$CONFIG.SCREEN_ID; layer=@{x=100; y=100; width=200; height=150}}},
    @{method="PUT"; path="/screen/layer"; desc="Update layer"; body=@{screenID=$CONFIG.SCREEN_ID; layerId="0"; layer=@{x=150; y=150}}},
    @{method="DELETE"; path="/screen/layer"; desc="Delete layer"; body=@{screenID=$CONFIG.SCREEN_ID; layerId="0"}},
    @{method="PUT"; path="/layer/position"; desc="Move layer"; body=@{layerId="0"; x=200; y=200}},
    @{method="PUT"; path="/layer/size"; desc="Resize layer"; body=@{layerId="0"; width=300; height=200}},
    @{method="GET"; path="/input"; desc="Get inputs direct"},
    @{method="GET"; path="/screen/input"; desc="Get screen inputs"},
    @{method="GET"; path="/screen/input?screenID=$($CONFIG.SCREEN_ID)"; desc="Get inputs with screenID"}
)

foreach ($test in $layerTests) {
    Write-Host "Testing: $($test.desc)" -ForegroundColor Yellow
    
    try {
        $params = @{
            Uri = "$BASE_URL$($test.path)"
            Method = $test.method
        }
        
        if ($test.body) {
            $params.Body = ($test.body | ConvertTo-Json -Depth 5)
            $params.ContentType = "application/json"
        }
        
        $response = Invoke-RestMethod @params
        Write-Host "SUCCESS: $($test.method) $($test.path)" -ForegroundColor Green
        $results += "SUCCESS: $($test.method) $($test.path) - $($test.desc)"
        
        # Show response for GET requests
        if ($test.method -eq "GET") {
            Write-Host "Response keys: $($response.PSObject.Properties.Name -join ', ')" -ForegroundColor Gray
        }
        
    } catch {
        $status = $_.Exception.Response.StatusCode.value__
        Write-Host "FAILED: $($test.method) $($test.path) - $status" -ForegroundColor Red
        $results += "FAILED: $($test.method) $($test.path) - $status - $($test.desc)"
    }
    
    Start-Sleep -Milliseconds 100
}

Write-Host "`nSUMMARY:" -ForegroundColor Cyan
$results | ForEach-Object { 
    if ($_.StartsWith("SUCCESS")) {
        Write-Host $_ -ForegroundColor Green
    } else {
        Write-Host $_ -ForegroundColor Red
    }
}

# Save results
$results | Out-File "layer-test-results.txt"
Write-Host "`nResults saved to layer-test-results.txt" -ForegroundColor Yellow
