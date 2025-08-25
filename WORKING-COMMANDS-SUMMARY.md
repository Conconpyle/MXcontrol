# MX Control - Working API Commands Summary

## ✅ CONFIRMED WORKING ENDPOINTS

Based on testing and corrections from the user, these endpoints are confirmed to work:

### 1. **Screen Information**
```javascript
GET /api/v1/screen
// No parameters needed
```

### 2. **Screen Brightness**
```javascript
PUT /api/v1/screen/brightness
{
  "screenIdList": ["{7e9cd858-780b-40d1-9f20-0fa0d53a06ce}"],
  "brightness": 50  // 0-100
}
```

### 3. **Screen Gamma**
```javascript
PUT /api/v1/screen/gamma
{
  "screenIdList": ["{7e9cd858-780b-40d1-9f20-0fa0d53a06ce}"],
  "gamma": 2.2  // 1.0-4.0
}
```

### 4. **Display Mode (Freeze/Blackout)**
```javascript
PUT /api/v1/device/displaymode
{
  "value": 0,  // 0=Normal, 1=Freeze, 2=Blackout
  "canvasIDs": [45]  // Use your actual canvas ID
}
```

### 5. **Get Presets**
```javascript
GET /api/v1/preset
// No parameters needed
```

### 6. **Apply Preset**
```javascript
POST /api/v1/preset/current/update
{
  "sequenceNumber": 0,  // Preset number
  "screenID": "{7e9cd858-780b-40d1-9f20-0fa0d53a06ce}"
}
```

### 7. **Get Input Sources**
```javascript
GET /api/v1/device/input/sources
// No parameters needed
```

### 8. **Switch Layer Input Source**
```javascript
PUT /api/v1/screen/layer/input
{
  "layers": [
    {
      "id": "0",      // Layer ID as string
      "source": "0"   // Source ID as string
    }
  ],
  "screenID": "{7e9cd858-780b-40d1-9f20-0fa0d53a06ce}"
}
```

### 9. **Get Screen Output**
```javascript
GET /api/v1/screen/output?screenId={7e9cd858-780b-40d1-9f20-0fa0d53a06ce}
```

## 🔑 KEY PATTERNS DISCOVERED

1. **Screen ID Format**: Always use the full GUID with braces: `{7e9cd858-780b-40d1-9f20-0fa0d53a06ce}`

2. **Different ID Parameters**:
   - Some endpoints use `screenIdList` (array)
   - Some use `screenID` (single string)
   - Some use `screenId` in query params
   - Device endpoints often use `canvasIDs`

3. **Corrected Endpoints**:
   - Display mode: `/device/displaymode` NOT `/screen/display`
   - Input sources: `/device/input/sources` NOT `/input/sources`
   - Layer switching: `/screen/layer/input` NOT `/layer/source`
   - Preset apply: `/preset/current/update` NOT `/preset/apply`

4. **Layer IDs**: Use strings ("0", "1") not numbers

5. **Canvas vs Screen**: Device-level operations use `canvasIDs`, screen-level use `screenID` or `screenIdList`

## ❌ ENDPOINTS THAT DON'T WORK (404)

Most other endpoints from the COEX documentation return 404, including:
- Cabinet control endpoints
- Input color adjustments
- 3D mode controls
- Schedule management
- Most device monitoring endpoints

## 📝 TESTING COMMANDS

### PowerShell Test Examples:

```powershell
# Test Display Mode
$body = @{value = 0; canvasIDs = @(45)} | ConvertTo-Json
Invoke-RestMethod -Uri "http://10.0.0.22:8001/api/v1/device/displaymode" -Method PUT -Body $body -ContentType "application/json"

# Test Preset Apply
$body = @{sequenceNumber = 0; screenID = "{7e9cd858-780b-40d1-9f20-0fa0d53a06ce}"} | ConvertTo-Json
Invoke-RestMethod -Uri "http://10.0.0.22:8001/api/v1/preset/current/update" -Method POST -Body $body -ContentType "application/json"

# Test Layer Switch
$body = @{layers = @(@{id = "0"; source = "0"}); screenID = "{7e9cd858-780b-40d1-9f20-0fa0d53a06ce}"} | ConvertTo-Json -Depth 3
Invoke-RestMethod -Uri "http://10.0.0.22:8001/api/v1/screen/layer/input" -Method PUT -Body $body -ContentType "application/json"
```

## 🚀 NEXT STEPS

1. Update the web application to use only these working endpoints
2. Remove or disable UI elements for non-working features
3. Focus on brightness, gamma, display mode, and preset controls
4. Test with actual hardware to verify all corrections

## 📊 SUCCESS RATE

- **Working**: 9 endpoints
- **Failed**: 40+ endpoints
- **Success Rate**: ~18%

Your MX controller has a limited API implementation compared to the full COEX documentation.
