# Quick endpoint test that writes directly to file
$results = @()

# Test endpoints
$endpoints = @(
    @{method="GET"; path="/canvas"},
    @{method="GET"; path="/device/info"},
    @{method="GET"; path="/device/status"},
    @{method="GET"; path="/device/cabinet"},
    @{method="GET"; path="/screen/layers?screenID={7e9cd858-780b-40d1-9f20-0fa0d53a06ce}"}
)

foreach ($ep in $endpoints) {
    try {
        $null = Invoke-RestMethod -Uri "http://10.0.0.22:8001/api/v1$($ep.path)" -Method $ep.method
        $results += "SUCCESS: $($ep.method) $($ep.path)"
    } catch {
        $results += "FAILED: $($ep.method) $($ep.path) - $($_.Exception.Response.StatusCode.value__)"
    }
}

# Write to file
$results | Out-File "quick-test-results.txt"
"Test complete - check quick-test-results.txt"
