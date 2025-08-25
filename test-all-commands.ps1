# COEX API Comprehensive Test Script
# Tests all API endpoints and logs results

# Configuration
$CONFIG = @{
    IP = "10.0.0.22"
    PORT = "8001"
    SCREEN_ID = "{7e9cd858-780b-40d1-9f20-0fa0d53a06ce}"
    CABINET_ID = 8098577582653440
    INPUT_ID = 256
    LAYER_ID = 1
    PRESET_ID = 1
}

$BASE_URL = "http://$($CONFIG.IP):$($CONFIG.PORT)/api/v1"

# Results storage
$results = @{
    successful = @()
    failed = @()
    timestamp = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
}

# All commands to test
$COMMANDS = @(
    # ============ GENERAL SECTION ============
    @{
        name = "getScreenInfo"
        method = "GET"
        endpoint = "/screen"
        description = "Retrieve Screen Information"
    },
    @{
        name = "setScreenBrightness"
        method = "PUT"
        endpoint = "/screen/brightness"
        body = @{
            screenIdList = @($CONFIG.SCREEN_ID)
            brightness = 50
        }
        description = "Set Screen Brightness"
    },
    @{
        name = "setScreenGamma"
        method = "PUT"
        endpoint = "/screen/gamma"
        body = @{
            screenIdList = @($CONFIG.SCREEN_ID)
            gamma = 2.2
        }
        description = "Set Screen Gamma"
    },
    @{
        name = "setDisplayMode"
        method = "PUT"
        endpoint = "/device/displaymode"
        body = @{
            value = 0  # 0=Normal, 1=Freeze, 2=Blackout
            canvasIDs = @(45)  # Use actual canvas ID
        }
        description = "Set Display Mode (0=Normal, 1=Freeze, 2=Blackout)"
    },
    @{
        name = "getPresets"
        method = "GET"
        endpoint = "/preset"
        description = "Retrieve Preset Information"
    },
    @{
        name = "applyPreset"
        method = "POST"
        endpoint = "/preset/current/update"
        body = @{
            sequenceNumber = 0
            screenID = $CONFIG.SCREEN_ID
        }
        description = "Apply Preset"
    },
    @{
        name = "getCabinets"
        method = "GET"
        endpoint = "/cabinet?screenID=$($CONFIG.SCREEN_ID)"
        description = "Retrieve All Cabinet Information"
    },
    @{
        name = "enableCabinetMapping"
        method = "PUT"
        endpoint = "/cabinet/mapping"
        body = @{
            screenID = $CONFIG.SCREEN_ID
            enable = $false
        }
        description = "Enable Cabinet Mapping"
    },
    @{
        name = "getInputSources"
        method = "GET"
        endpoint = "/device/input/sources"
        description = "Retrieve Input Source List"
    },
    @{
        name = "switchLayerSource"
        method = "PUT"
        endpoint = "/screen/layer/input"
        body = @{
            layers = @(
                @{
                    id = "0"
                    source = "0"
                }
            )
            screenID = $CONFIG.SCREEN_ID
        }
        description = "Switch Layer Input Source"
    },
    @{
        name = "setEDID"
        method = "PUT"
        endpoint = "/input/edid"
        body = @{
            screenID = $CONFIG.SCREEN_ID
            inputId = $CONFIG.INPUT_ID
            edidMode = 0
        }
        description = "Set EDID"
    },
    @{
        name = "setColorTemperature"
        method = "PUT"
        endpoint = "/screen/colorTemperature"
        body = @{
            screenID = $CONFIG.SCREEN_ID
            colorTemperature = 6500
        }
        description = "Set Screen Color Temperature"
    },
    # ============ INPUT SECTION ============
    @{
        name = "getInputData"
        method = "GET"
        endpoint = "/input?screenID=$($CONFIG.SCREEN_ID)"
        description = "Retrieve Input Data"
    },
    @{
        name = "setSaturation"
        method = "PUT"
        endpoint = "/input/saturation"
        body = @{
            screenID = $CONFIG.SCREEN_ID
            inputId = $CONFIG.INPUT_ID
            saturation = 50
        }
        description = "Set Saturation"
    },
    @{
        name = "setColorHighlight"
        method = "PUT"
        endpoint = "/input/colorHighlight"
        body = @{
            screenId = $CONFIG.SCREEN_ID
            inputId = $CONFIG.INPUT_ID
            highlight = 50
        }
        description = "Set Color Highlight"
    },
    @{
        name = "setColorShadow"
        method = "PUT"
        endpoint = "/input/colorShadow"
        body = @{
            screenId = $CONFIG.SCREEN_ID
            inputId = $CONFIG.INPUT_ID
            shadow = 50
        }
        description = "Set Color Shadow"
    },
    @{
        name = "adjustHue"
        method = "PUT"
        endpoint = "/input/hue"
        body = @{
            screenId = $CONFIG.SCREEN_ID
            inputId = $CONFIG.INPUT_ID
            hue = 0
        }
        description = "Adjust Hue"
    },
    @{
        name = "resetColorAdjustment"
        method = "POST"
        endpoint = "/input/colorReset"
        body = @{
            screenId = $CONFIG.SCREEN_ID
            inputId = $CONFIG.INPUT_ID
        }
        description = "Reset Color Adjustment"
    },
    @{
        name = "setSendingCardTestPattern"
        method = "PUT"
        endpoint = "/device/testpattern"
        body = @{
            pattern = 1
            canvasIDs = @($CONFIG.CANVAS_ID)
        }
        description = "Set Test Pattern"
    },
    @{
        name = "setHDRMode"
        method = "PUT"
        endpoint = "/input/hdr"
        body = @{
            screenId = $CONFIG.SCREEN_ID
            inputId = $CONFIG.INPUT_ID
            hdrMode = 0
        }
        description = "Set HDR Mode"
    },
    # ============ SCREEN SECTION ============
    @{
        name = "setCustomGamut"
        method = "PUT"
        endpoint = "/screen/gamut/custom"
        body = @{
            screenID = $CONFIG.SCREEN_ID
            gamutData = @{
                redX = 0.640
                redY = 0.330
                greenX = 0.300
                greenY = 0.600
                blueX = 0.150
                blueY = 0.060
            }
        }
        description = "Set Custom Gamut"
    },
    @{
        name = "switchColorGamut"
        method = "PUT"
        endpoint = "/screen/gamut"
        body = @{
            screenIdList = @($CONFIG.SCREEN_ID)
            gamutType = 0
        }
        description = "Switch Color Gamut"
    },
    @{
        name = "getDisplayEffectParams"
        method = "GET"
        endpoint = "/screen/displayEffect?screenId=$($CONFIG.SCREEN_ID)"
        description = "Retrieve Screen Display Effect Parameters"
    },
    @{
        name = "setCanvasMapping"
        method = "PUT"
        endpoint = "/screen/canvas/mapping"
        body = @{
            screenId = $CONFIG.SCREEN_ID
            canvasId = 2048
            mappingData = @{}
        }
        description = "Canvas Mapping"
    },
    @{
        name = "modifyPreset"
        method = "PUT"
        endpoint = "/preset/modify"
        body = @{
            screenId = $CONFIG.SCREEN_ID
            presetId = $CONFIG.PRESET_ID
            presetName = "Test Preset"
            presetData = @{}
        }
        description = "Modify Preset"
    },
    @{
        name = "getSchedules"
        method = "GET"
        endpoint = "/screen/schedules?screenId=$($CONFIG.SCREEN_ID)"
        description = "Retrieve All Schedule Information"
    },
    @{
        name = "setScheduleState"
        method = "PUT"
        endpoint = "/screen/schedule/state"
        body = @{
            screenId = $CONFIG.SCREEN_ID
            scheduleId = 1
            enable = $false
        }
        description = "Set Schedule On/Off"
    },
    @{
        name = "deleteBrightnessSchedule"
        method = "DELETE"
        endpoint = "/screen/schedule/brightness"
        body = @{
            screenId = $CONFIG.SCREEN_ID
            scheduleId = 1
        }
        description = "Delete Brightness Schedule"
    },
    @{
        name = "enable3DEmitter"
        method = "PUT"
        endpoint = "/screen/3d/emitter"
        body = @{
            screenIdList = @($CONFIG.SCREEN_ID)
            enable = $false
        }
        description = "Enable 3D Emitter"
    },
    @{
        name = "set3DMode"
        method = "PUT"
        endpoint = "/screen/3d"
        body = @{
            screenIdList = @($CONFIG.SCREEN_ID)
            enable = $false
            mode = 0
        }
        description = "Enable/Disable 3D"
    },
    @{
        name = "getScreenOutputData"
        method = "GET"
        endpoint = "/screen/output?screenId=$($CONFIG.SCREEN_ID)"
        description = "Retrieve Screen Output Data"
    },
    @{
        name = "setMultiModeByScreens"
        method = "PUT"
        endpoint = "/screen/multiMode"
        body = @{
            screenIdList = @($CONFIG.SCREEN_ID)
            multiMode = 0
        }
        description = "Set Multi-mode by Screens"
    },
    @{
        name = "getDisplayStatus"
        method = "GET"
        endpoint = "/screen/displayStatus?screenId=$($CONFIG.SCREEN_ID)"
        description = "Retrieve Display Status"
    },
    @{
        name = "setOutputBitDepth"
        method = "PUT"
        endpoint = "/screen/output/bitDepth"
        body = @{
            screenIdList = @($CONFIG.SCREEN_ID)
            bitDepth = 8
        }
        description = "Set Output Bit Depth"
    },
    @{
        name = "getScreenProperties"
        method = "GET"
        endpoint = "/screen/properties?screenId=$($CONFIG.SCREEN_ID)"
        description = "Retrieve Screen Properties Information"
    },
    @{
        name = "getNumberOfCabinets"
        method = "GET"
        endpoint = "/screen/cabinets/count?screenId=$($CONFIG.SCREEN_ID)"
        description = "Retrieve Number of Cabinets"
    },
    # ============ DEVICE SECTION ============
    @{
        name = "deviceIdentify"
        method = "PUT"
        endpoint = "/device/identify"
        body = @{
            enable = $false
            duration = 5
        }
        description = "Device Identify"
    },
    @{
        name = "getMonitoringInfo"
        method = "GET"
        endpoint = "/device/monitoring"
        description = "Retrieve Real-Time Monitoring Information"
    },
    # ============ CABINET SECTION ============
    @{
        name = "setCabinetRGBBrightness"
        method = "PUT"
        endpoint = "/cabinet/brightness/rgb"
        body = @{
            screenId = $CONFIG.SCREEN_ID
            cabinetId = $CONFIG.CABINET_ID
            red = 100
            green = 100
            blue = 100
        }
        description = "Set Cabinet RGB Brightness"
    },
    @{
        name = "setCabinetBrightness"
        method = "PUT"
        endpoint = "/cabinet/brightness"
        body = @{
            screenId = $CONFIG.SCREEN_ID
            cabinetId = $CONFIG.CABINET_ID
            brightness = 50
        }
        description = "Set Cabinet Brightness"
    },
    @{
        name = "setCabinetColorTemperature"
        method = "PUT"
        endpoint = "/cabinet/colorTemperature"
        body = @{
            screenId = $CONFIG.SCREEN_ID
            cabinetId = $CONFIG.CABINET_ID
            colorTemperature = 6500
        }
        description = "Adjust Cabinet Color Temperature"
    },
    @{
        name = "setReceivingCardTestPattern"
        method = "PUT"
        endpoint = "/cabinet/testPattern"
        body = @{
            screenId = $CONFIG.SCREEN_ID
            cabinetId = $CONFIG.CABINET_ID
            enable = $false
            patternType = 1
        }
        description = "Set Receiving Card Test Pattern"
    },
    @{
        name = "setMultiModeByCabinets"
        method = "PUT"
        endpoint = "/cabinet/multiMode"
        body = @{
            screenId = $CONFIG.SCREEN_ID
            cabinetIdList = @($CONFIG.CABINET_ID)
            multiMode = 0
        }
        description = "Set Multi-mode by Cabinets"
    },
    @{
        name = "moveCabinet"
        method = "PUT"
        endpoint = "/cabinet/move"
        body = @{
            screenId = $CONFIG.SCREEN_ID
            cabinetId = $CONFIG.CABINET_ID
            x = 100
            y = 200
        }
        description = "Move Cabinet"
    },
    # ============ 3D LUT SECTION ============
    @{
        name = "set3DLUTStrength"
        method = "PUT"
        endpoint = "/screen/3dlut/strength"
        body = @{
            screenIdList = @($CONFIG.SCREEN_ID)
            strength = 50
        }
        description = "Set 3D LUT Strength"
    },
    @{
        name = "enable3DLUT"
        method = "PUT"
        endpoint = "/screen/3dlut/enable"
        body = @{
            screenIdList = @($CONFIG.SCREEN_ID)
            enable = $false
        }
        description = "Enable 3D LUT"
    }
)

# Test a single command
function Test-Command {
    param($command)
    
    $startTime = Get-Date
    $url = $BASE_URL + $command.endpoint
    
    try {
        $params = @{
            Uri = $url
            Method = $command.method
            ContentType = "application/json"
            TimeoutSec = 5
        }
        
        if ($command.body) {
            $params.Body = ($command.body | ConvertTo-Json -Depth 10)
        }
        
        $response = Invoke-RestMethod @params
        $duration = ((Get-Date) - $startTime).TotalMilliseconds
        
        $result = @{
            name = $command.name
            endpoint = $command.endpoint
            method = $command.method
            description = $command.description
            duration = "$([int]$duration)ms"
            status = "200"
            response = $response
            timestamp = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
        }
        
        $results.successful += $result
        Write-Host "✅ SUCCESS: $($command.name) - $($command.endpoint)" -ForegroundColor Green
        
        return @{ success = $true; result = $result }
        
    } catch {
        $duration = ((Get-Date) - $startTime).TotalMilliseconds
        $errorDetails = $_.Exception.Response
        
        $result = @{
            name = $command.name
            endpoint = $command.endpoint
            method = $command.method
            description = $command.description
            duration = "$([int]$duration)ms"
            error = @{
                status = $_.Exception.Response.StatusCode.value__
                statusText = $_.Exception.Response.StatusDescription
                message = $_.Exception.Message
            }
            timestamp = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
        }
        
        $results.failed += $result
        Write-Host "❌ FAILED: $($command.name) - $($command.endpoint) - $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
        
        return @{ success = $false; result = $result }
    }
}

# Main test function
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "COEX API COMPREHENSIVE TEST" -ForegroundColor Cyan
Write-Host "Testing $($COMMANDS.Count) commands" -ForegroundColor Cyan
Write-Host "Controller: $($CONFIG.IP):$($CONFIG.PORT)" -ForegroundColor Cyan
Write-Host "Screen ID: $($CONFIG.SCREEN_ID)" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Test each command
$counter = 1
foreach ($command in $COMMANDS) {
    Write-Host "[$counter/$($COMMANDS.Count)] Testing: $($command.name)" -ForegroundColor Yellow
    Test-Command -command $command | Out-Null
    $counter++
    Start-Sleep -Milliseconds 100
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "TEST SUMMARY" -ForegroundColor Cyan
Write-Host "Total Commands Tested: $($COMMANDS.Count)" -ForegroundColor Cyan
Write-Host "✅ Successful: $($results.successful.Count)" -ForegroundColor Green
Write-Host "❌ Failed: $($results.failed.Count)" -ForegroundColor Red
Write-Host "========================================`n" -ForegroundColor Cyan

# Write results to files
$timestamp = (Get-Date -Format "yyyy-MM-dd-HH-mm-ss")

# Write successful commands
$successFile = "test-results-success-$timestamp.json"
$results.successful | ConvertTo-Json -Depth 10 | Out-File $successFile -Encoding UTF8
Write-Host "✅ Successful commands written to: $successFile" -ForegroundColor Green

# Write failed commands
$failFile = "test-results-failed-$timestamp.json"
$results.failed | ConvertTo-Json -Depth 10 | Out-File $failFile -Encoding UTF8
Write-Host "❌ Failed commands written to: $failFile" -ForegroundColor Red

# Write summary
$summaryFile = "test-results-summary-$timestamp.json"
$summary = @{
    timestamp = $results.timestamp
    controller = "$($CONFIG.IP):$($CONFIG.PORT)"
    screenId = $CONFIG.SCREEN_ID
    totalTested = $COMMANDS.Count
    successful = $results.successful.Count
    failed = $results.failed.Count
    successRate = "$([math]::Round(($results.successful.Count / $COMMANDS.Count) * 100, 1))%"
    workingEndpoints = $results.successful | ForEach-Object { "$($_.method) $($_.endpoint)" }
    failedEndpoints = $results.failed | ForEach-Object { "$($_.method) $($_.endpoint) ($($_.error.status))" }
}
$summary | ConvertTo-Json -Depth 10 | Out-File $summaryFile -Encoding UTF8
Write-Host "Summary written to: $summaryFile" -ForegroundColor Cyan

# Additional test for potential working endpoints based on patterns
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "TESTING ADDITIONAL DEVICE ENDPOINTS" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Test device-based cabinet endpoint
Write-Host "Testing /device/cabinet..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/device/cabinet" -Method GET
    Write-Host "SUCCESS: Device cabinet info retrieved!" -ForegroundColor Green
} catch {
    Write-Host "FAILED: Device cabinet - $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
}

# Test device info endpoint
Write-Host "Testing /device/info..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/device/info" -Method GET
    Write-Host "SUCCESS: Device info retrieved!" -ForegroundColor Green
} catch {
    Write-Host "FAILED: Device info - $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
}

# Test device status endpoint
Write-Host "Testing /device/status..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/device/status" -Method GET
    Write-Host "SUCCESS: Device status retrieved!" -ForegroundColor Green
} catch {
    Write-Host "FAILED: Device status - $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
}

# Test screen layers endpoint
Write-Host "Testing /screen/layers..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/screen/layers?screenID=$($CONFIG.SCREEN_ID)" -Method GET
    Write-Host "SUCCESS: Screen layers retrieved!" -ForegroundColor Green
} catch {
    Write-Host "FAILED: Screen layers - $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
}

# Test canvas endpoint
Write-Host "Testing /canvas..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/canvas" -Method GET
    Write-Host "SUCCESS: Canvas info retrieved!" -ForegroundColor Green
} catch {
    Write-Host "FAILED: Canvas - $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
}
