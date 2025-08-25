/**
 * COMPLETE COEX API COMMAND REFERENCE
 * All commands from https://api.coex.en.novastar.tech/
 * 
 * Variables to replace:
 * - {IP} = Controller IP (e.g., "10.0.0.22")
 * - {PORT} = Controller Port (e.g., "8001")
 * - {SCREEN_ID} = Screen ID with braces (e.g., "{7e9cd858-780b-40d1-9f20-0fa0d53a06ce}")
 */

const COEX_API_COMMANDS = {
    
    // ============================================
    // GENERAL SECTION
    // ============================================
    
    // 1. Retrieve Screen Information
    getScreenInfo: {
        method: 'GET',
        url: 'http://{IP}:{PORT}/api/v1/screen',
        description: 'Retrieve Screen Information',
        response: 'Returns complete screen data including layers, cabinets, inputs'
    },

    // 2. Set Screen Brightness
    setScreenBrightness: {
        method: 'PUT',
        url: 'http://{IP}:{PORT}/api/v1/screen/brightness',
        description: 'Set Screen Brightness',
        data: {
            "screenIdList": ["{SCREEN_ID}"],
            "brightness": 50  // 0-100
        }
    },

    // 3. Set Screen Gamma
    setScreenGamma: {
        method: 'PUT',
        url: 'http://{IP}:{PORT}/api/v1/screen/gamma',
        description: 'Set Screen Gamma',
        data: {
            "screenIdList": ["{SCREEN_ID}"],
            "gamma": 2.2  // 1.0-4.0
        }
    },

    // 4. Set Display Mode (Corrected)
    setDisplayMode: {
        method: 'PUT',
        url: 'http://{IP}:{PORT}/api/v1/device/displaymode',
        description: 'Set Display Mode (0=Normal, 1=Freeze, 2=Blackout)',
        data: {
            "value": 0,  // 0=Normal, 1=Freeze, 2=Blackout
            "canvasIDs": [45]  // Use actual canvas ID from your setup
        }
    },

    // 5. Retrieve Preset Information
    getPresets: {
        method: 'GET',
        url: 'http://{IP}:{PORT}/api/v1/preset',
        description: 'Retrieve Preset Information',
        response: 'Returns all presets for all screens'
    },

    // 6. Apply Preset
    applyPreset: {
        method: 'POST',
        url: 'http://{IP}:{PORT}/api/v1/preset/apply',
        description: 'Apply Preset',
        data: {
            "screenIdList": ["{SCREEN_ID}"],
            "presetId": 1  // Preset number
        }
    },

    // 7. Retrieve All Cabinet Information
    getCabinets: {
        method: 'GET',
        url: 'http://{IP}:{PORT}/api/v1/screen/cabinets',
        description: 'Retrieve All Cabinet Information',
        params: {
            "screenId": "{SCREEN_ID}"
        }
    },

    // 8. Enable Cabinet Mapping
    enableCabinetMapping: {
        method: 'PUT',
        url: 'http://{IP}:{PORT}/api/v1/cabinet/mapping',
        description: 'Enable Cabinet Mapping',
        data: {
            "screenIdList": ["{SCREEN_ID}"],
            "enable": true
        }
    },

    // 9. Retrieve Input Source List (Corrected)
    getInputSources: {
        method: 'GET',
        url: 'http://{IP}:{PORT}/api/v1/device/input/sources',
        description: 'Retrieve Input Source List',
        // No params needed
    },

    // 10. Switch Layer Input Source (Corrected)
    switchLayerSource: {
        method: 'PUT',
        url: 'http://{IP}:{PORT}/api/v1/screen/layer/input',
        description: 'Switch Layer Input Source',
        data: {
            "layers": [
                {
                    "id": "0",  // Layer ID as string
                    "source": "0"  // Source ID as string
                }
            ],
            "screenID": "{SCREEN_ID}"  // Note: screenID not screenIdList
        }
    },

    // 11. Set EDID
    setEDID: {
        method: 'PUT',
        url: 'http://{IP}:{PORT}/api/v1/input/edid',
        description: 'Set EDID',
        data: {
            "screenId": "{SCREEN_ID}",
            "inputId": 256,
            "edidType": 0  // EDID type value
        }
    },

    // 12. Set Screen Color Temperature
    setColorTemperature: {
        method: 'PUT',
        url: 'http://{IP}:{PORT}/api/v1/screen/colorTemperature',
        description: 'Set Screen Color Temperature',
        data: {
            "screenIdList": ["{SCREEN_ID}"],
            "colorTemperature": 6500  // Temperature in Kelvin
        }
    },

    // ============================================
    // INPUT SECTION
    // ============================================

    // 13. Retrieve Input Data
    getInputData: {
        method: 'GET',
        url: 'http://{IP}:{PORT}/api/v1/input/data',
        description: 'Retrieve Input Data',
        params: {
            "screenId": "{SCREEN_ID}",
            "inputId": 256
        }
    },

    // 14. Set Saturation
    setSaturation: {
        method: 'PUT',
        url: 'http://{IP}:{PORT}/api/v1/input/saturation',
        description: 'Set Saturation',
        data: {
            "screenId": "{SCREEN_ID}",
            "inputId": 256,
            "saturation": 50  // 0-100
        }
    },

    // 15. Set Color Highlight
    setColorHighlight: {
        method: 'PUT',
        url: 'http://{IP}:{PORT}/api/v1/input/colorHighlight',
        description: 'Set Color Highlight',
        data: {
            "screenId": "{SCREEN_ID}",
            "inputId": 256,
            "highlight": 50  // 0-100
        }
    },

    // 16. Set Color Shadow
    setColorShadow: {
        method: 'PUT',
        url: 'http://{IP}:{PORT}/api/v1/input/colorShadow',
        description: 'Set Color Shadow',
        data: {
            "screenId": "{SCREEN_ID}",
            "inputId": 256,
            "shadow": 50  // 0-100
        }
    },

    // 17. Adjust Hue
    adjustHue: {
        method: 'PUT',
        url: 'http://{IP}:{PORT}/api/v1/input/hue',
        description: 'Adjust Hue',
        data: {
            "screenId": "{SCREEN_ID}",
            "inputId": 256,
            "hue": 0  // -180 to 180
        }
    },

    // 18. Reset Color Adjustment
    resetColorAdjustment: {
        method: 'POST',
        url: 'http://{IP}:{PORT}/api/v1/input/colorReset',
        description: 'Reset Color Adjustment',
        data: {
            "screenId": "{SCREEN_ID}",
            "inputId": 256
        }
    },

    // 19. Set Sending Card Test Pattern
    setSendingCardTestPattern: {
        method: 'PUT',
        url: 'http://{IP}:{PORT}/api/v1/input/testPattern',
        description: 'Set Sending Card Test Pattern',
        data: {
            "screenId": "{SCREEN_ID}",
            "enable": true,
            "patternType": 1  // Pattern type
        }
    },

    // 20. Set HDR Mode
    setHDRMode: {
        method: 'PUT',
        url: 'http://{IP}:{PORT}/api/v1/input/hdr',
        description: 'Set HDR Mode',
        data: {
            "screenId": "{SCREEN_ID}",
            "inputId": 256,
            "hdrMode": 0  // 0=SDR, 1=HDR10, 2=HLG, etc.
        }
    },

    // ============================================
    // SCREEN SECTION
    // ============================================

    // 21. Set Custom Gamut on Screen-Basis
    setCustomGamut: {
        method: 'PUT',
        url: 'http://{IP}:{PORT}/api/v1/screen/gamut/custom',
        description: 'Set Custom Gamut on a Screen-Basis',
        data: {
            "screenIdList": ["{SCREEN_ID}"],
            "gamutData": {
                "redX": 0.640,
                "redY": 0.330,
                "greenX": 0.300,
                "greenY": 0.600,
                "blueX": 0.150,
                "blueY": 0.060
            }
        }
    },

    // 22. Switch Color Gamut
    switchColorGamut: {
        method: 'PUT',
        url: 'http://{IP}:{PORT}/api/v1/screen/gamut',
        description: 'Switch Color Gamut',
        data: {
            "screenIdList": ["{SCREEN_ID}"],
            "gamutType": 0  // 0=sRGB, 1=Adobe RGB, 2=DCI-P3, etc.
        }
    },

    // 23. Retrieve Screen Display Effect Parameters
    getDisplayEffectParams: {
        method: 'GET',
        url: 'http://{IP}:{PORT}/api/v1/screen/displayEffect',
        description: 'Retrieve Screen Display Effect Parameters',
        params: {
            "screenId": "{SCREEN_ID}"
        }
    },

    // 24. Set Custom Gamma for Screen
    setCustomGamma: {
        method: 'PUT',
        url: 'http://{IP}:{PORT}/api/v1/screen/gamma/custom',
        description: 'Set Custom Gamma for the Screen',
        data: {
            "screenIdList": ["{SCREEN_ID}"],
            "gammaTable": [/* Array of gamma values */]
        }
    },

    // 25. Canvas Mapping
    setCanvasMapping: {
        method: 'PUT',
        url: 'http://{IP}:{PORT}/api/v1/screen/canvas/mapping',
        description: 'Canvas Mapping',
        data: {
            "screenId": "{SCREEN_ID}",
            "canvasId": 2048,
            "mappingData": {/* Mapping configuration */}
        }
    },

    // 26. Modify Preset
    modifyPreset: {
        method: 'PUT',
        url: 'http://{IP}:{PORT}/api/v1/preset/modify',
        description: 'Modify Preset',
        data: {
            "screenId": "{SCREEN_ID}",
            "presetId": 1,
            "presetName": "New Name",
            "presetData": {/* Preset configuration */}
        }
    },

    // 27. Retrieve All Schedule Information
    getSchedules: {
        method: 'GET',
        url: 'http://{IP}:{PORT}/api/v1/screen/schedules',
        description: 'Retrieve All Schedule Information of the Screens',
        params: {
            "screenId": "{SCREEN_ID}"
        }
    },

    // 28. Set Schedule On/Off
    setScheduleState: {
        method: 'PUT',
        url: 'http://{IP}:{PORT}/api/v1/screen/schedule/state',
        description: 'Set Schedule On/Off',
        data: {
            "screenId": "{SCREEN_ID}",
            "scheduleId": 1,
            "enable": true
        }
    },

    // 29. Delete Brightness Schedule
    deleteBrightnessSchedule: {
        method: 'DELETE',
        url: 'http://{IP}:{PORT}/api/v1/screen/schedule/brightness',
        description: 'Delete Brightness Schedule',
        data: {
            "screenId": "{SCREEN_ID}",
            "scheduleId": 1
        }
    },

    // 30. Enable 3D Emitter
    enable3DEmitter: {
        method: 'PUT',
        url: 'http://{IP}:{PORT}/api/v1/screen/3d/emitter',
        description: 'Enable 3D Emitter',
        data: {
            "screenIdList": ["{SCREEN_ID}"],
            "enable": true
        }
    },

    // 31. Enable/Disable 3D
    set3DMode: {
        method: 'PUT',
        url: 'http://{IP}:{PORT}/api/v1/screen/3d',
        description: 'Enable/Disable 3D',
        data: {
            "screenIdList": ["{SCREEN_ID}"],
            "enable": true,
            "mode": 0  // 3D mode type
        }
    },

    // 32. Retrieve Screen Output Data
    getScreenOutputData: {
        method: 'GET',
        url: 'http://{IP}:{PORT}/api/v1/screen/output',
        description: 'Retrieve Screen Output Data',
        params: {
            "screenId": "{SCREEN_ID}"
        }
    },

    // 33. Set Multi-mode by Screens
    setMultiModeByScreens: {
        method: 'PUT',
        url: 'http://{IP}:{PORT}/api/v1/screen/multiMode',
        description: 'Set Multi-mode by Screens',
        data: {
            "screenIdList": ["{SCREEN_ID}"],
            "multiMode": 0  // Multi-mode type
        }
    },

    // 34. Retrieve Display Status
    getDisplayStatus: {
        method: 'GET',
        url: 'http://{IP}:{PORT}/api/v1/screen/displayStatus',
        description: 'Retrieve Display Status',
        params: {
            "screenId": "{SCREEN_ID}"
        }
    },

    // 35. Set Output Bit Depth
    setOutputBitDepth: {
        method: 'PUT',
        url: 'http://{IP}:{PORT}/api/v1/screen/output/bitDepth',
        description: 'Set Output Bit Depth',
        data: {
            "screenIdList": ["{SCREEN_ID}"],
            "bitDepth": 8  // 8, 10, 12 bit
        }
    },

    // 36. Retrieve Screen Properties Information
    getScreenProperties: {
        method: 'GET',
        url: 'http://{IP}:{PORT}/api/v1/screen/properties',
        description: 'Retrieve Screen Properties Information',
        params: {
            "screenId": "{SCREEN_ID}"
        }
    },

    // 37. Retrieve Number of Cabinets
    getNumberOfCabinets: {
        method: 'GET',
        url: 'http://{IP}:{PORT}/api/v1/screen/cabinets/count',
        description: 'Retrieve the Number of Cabinets of the Screen',
        params: {
            "screenId": "{SCREEN_ID}"
        }
    },

    // ============================================
    // DEVICE SECTION
    // ============================================

    // 38. Device Identify
    deviceIdentify: {
        method: 'PUT',
        url: 'http://{IP}:{PORT}/api/v1/device/identify',
        description: 'Device Identify',
        data: {
            "enable": true,
            "duration": 5  // Duration in seconds
        }
    },

    // 39. Retrieve Real-Time Monitoring Information
    getMonitoringInfo: {
        method: 'GET',
        url: 'http://{IP}:{PORT}/api/v1/device/monitoring',
        description: 'Retrieve Real-Time Monitoring Information',
        response: 'Returns device status, temperature, voltage, etc.'
    },

    // ============================================
    // CABINET SECTION
    // ============================================

    // 40. Set Cabinet RGB Brightness
    setCabinetRGBBrightness: {
        method: 'PUT',
        url: 'http://{IP}:{PORT}/api/v1/cabinet/brightness/rgb',
        description: 'Set Cabinet RGB Brightness',
        data: {
            "screenId": "{SCREEN_ID}",
            "cabinetId": 8098577582653440,
            "red": 100,
            "green": 100,
            "blue": 100
        }
    },

    // 41. Set Cabinet Brightness
    setCabinetBrightness: {
        method: 'PUT',
        url: 'http://{IP}:{PORT}/api/v1/cabinet/brightness',
        description: 'Set Cabinet Brightness',
        data: {
            "screenId": "{SCREEN_ID}",
            "cabinetId": 8098577582653440,
            "brightness": 50  // 0-100
        }
    },

    // 42. Adjust Cabinet Color Temperature
    setCabinetColorTemperature: {
        method: 'PUT',
        url: 'http://{IP}:{PORT}/api/v1/cabinet/colorTemperature',
        description: 'Adjust Cabinet Color Temperature',
        data: {
            "screenId": "{SCREEN_ID}",
            "cabinetId": 8098577582653440,
            "colorTemperature": 6500  // Temperature in Kelvin
        }
    },

    // 43. Set Receiving Card Test Pattern
    setReceivingCardTestPattern: {
        method: 'PUT',
        url: 'http://{IP}:{PORT}/api/v1/cabinet/testPattern',
        description: 'Set Receiving Card Test Pattern',
        data: {
            "screenId": "{SCREEN_ID}",
            "cabinetId": 8098577582653440,
            "enable": true,
            "patternType": 1  // Pattern type
        }
    },

    // 44. Set Multi-mode by Cabinets
    setMultiModeByCabinets: {
        method: 'PUT',
        url: 'http://{IP}:{PORT}/api/v1/cabinet/multiMode',
        description: 'Set Multi-mode by Cabinets',
        data: {
            "screenId": "{SCREEN_ID}",
            "cabinetIdList": [8098577582653440],
            "multiMode": 0  // Multi-mode type
        }
    },

    // 45. Move Cabinet
    moveCabinet: {
        method: 'PUT',
        url: 'http://{IP}:{PORT}/api/v1/cabinet/move',
        description: 'Move Cabinet',
        data: {
            "screenId": "{SCREEN_ID}",
            "cabinetId": 8098577582653440,
            "x": 100,
            "y": 200
        }
    },

    // ============================================
    // PROCESSING SECTION (3D LUT)
    // ============================================

    // 46. Delete 3D LUT File
    delete3DLUT: {
        method: 'DELETE',
        url: 'http://{IP}:{PORT}/api/v1/screen/3dlut',
        description: 'Delete 3D LUT File',
        data: {
            "screenId": "{SCREEN_ID}",
            "lutId": 1
        }
    },

    // 47. Import 3D LUT File
    import3DLUT: {
        method: 'POST',
        url: 'http://{IP}:{PORT}/api/v1/screen/3dlut/import',
        description: 'Import 3D LUT File',
        data: {
            "screenId": "{SCREEN_ID}",
            "lutName": "MyLUT",
            "lutData": "base64_encoded_lut_data"
        }
    },

    // 48. Set 3D LUT Strength
    set3DLUTStrength: {
        method: 'PUT',
        url: 'http://{IP}:{PORT}/api/v1/screen/3dlut/strength',
        description: 'Set 3D LUT Strength',
        data: {
            "screenIdList": ["{SCREEN_ID}"],
            "strength": 50  // 0-100
        }
    },

    // 49. Enable 3D LUT
    enable3DLUT: {
        method: 'PUT',
        url: 'http://{IP}:{PORT}/api/v1/screen/3dlut/enable',
        description: 'Enable 3D LUT',
        data: {
            "screenIdList": ["{SCREEN_ID}"],
            "enable": true
        }
    }
};

// ============================================
// HELPER FUNCTION TO GENERATE AXIOS REQUESTS
// ============================================

function generateAxiosRequest(commandName, ip, port, screenId, additionalParams = {}) {
    const command = COEX_API_COMMANDS[commandName];
    if (!command) {
        console.error(`Command ${commandName} not found`);
        return null;
    }

    // Replace placeholders
    let url = command.url
        .replace('{IP}', ip)
        .replace('{PORT}', port);

    let data = null;
    let params = null;

    if (command.data) {
        data = JSON.parse(JSON.stringify(command.data));
        // Replace screen ID in data
        if (data.screenIdList) {
            data.screenIdList = data.screenIdList.map(id => 
                id.replace('{SCREEN_ID}', screenId)
            );
        }
        if (data.screenId) {
            data.screenId = data.screenId.replace('{SCREEN_ID}', screenId);
        }
        // Merge additional parameters
        Object.assign(data, additionalParams);
    }

    if (command.params) {
        params = JSON.parse(JSON.stringify(command.params));
        // Replace screen ID in params
        if (params.screenId) {
            params.screenId = params.screenId.replace('{SCREEN_ID}', screenId);
        }
        // Merge additional parameters
        Object.assign(params, additionalParams);
    }

    const axiosConfig = {
        method: command.method,
        url: url,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    if (data) axiosConfig.data = data;
    if (params) axiosConfig.params = params;

    return axiosConfig;
}

// ============================================
// EXAMPLE USAGE
// ============================================

/*
// Example 1: Set brightness to 75%
const brightnessRequest = generateAxiosRequest(
    'setScreenBrightness',
    '10.0.0.22',
    '8001',
    '{7e9cd858-780b-40d1-9f20-0fa0d53a06ce}',
    { brightness: 75 }
);

axios(brightnessRequest)
    .then(response => console.log('Success:', response.data))
    .catch(error => console.error('Error:', error));

// Example 2: Set display mode to freeze
const displayModeRequest = generateAxiosRequest(
    'setDisplayMode',
    '10.0.0.22',
    '8001',
    '{7e9cd858-780b-40d1-9f20-0fa0d53a06ce}',
    { value: 1, canvasIDs: [45] }  // 1 = Freeze, 45 = canvas ID
);

axios(displayModeRequest)
    .then(response => console.log('Success:', response.data))
    .catch(error => console.error('Error:', error));
*/

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { COEX_API_COMMANDS, generateAxiosRequest };
}
