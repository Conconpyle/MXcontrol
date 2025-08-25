/**
 * API Client for Novastar MX Controller
 * Uses Axios for HTTP requests and COEX API v1 structure
 */

class NovastarAPI {
    constructor() {
        this.axios = null;
        this.baseUrl = '';
        this.screenData = null;
        this.currentScreenId = null;
        this.inputSources = [];
        this.presets = [];
        this.cabinets = [];
        this.layers = [];
    }

    /**
     * Initialize connection to the controller
     */
    async connect(ip, port) {
        this.baseUrl = `http://${ip}:${port}/api/v1`;
        
        // Create axios instance with defaults
        this.axios = axios.create({
            baseURL: this.baseUrl,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Add response interceptor for debugging
        this.axios.interceptors.response.use(
            response => {
                console.log('API Response:', response.config.url, response.data);
                return response;
            },
            error => {
                console.error('API Error:', error.config?.url, error.message);
                return Promise.reject(error);
            }
        );
        
        try {
            // Get screen information - this is the main endpoint
            const response = await this.axios.get('/screen');
            
            if (response.data && response.data.code === 0) {
                const data = response.data.data;
                
                // Extract screen ID from the nested structure
                if (data.screens && data.screens.length > 0) {
                    const screen = data.screens[0];
                    this.currentScreenId = screen.screenID;
                    this.screenData = screen;
                    
                    // Store layers from the screen data
                    if (screen.layersInWorkingMode && screen.layersInWorkingMode.length > 0) {
                        // Get layers from current working mode
                        const workingMode = screen.layersInWorkingMode.find(m => m.workingMode === screen.workingMode) || screen.layersInWorkingMode[0];
                        this.layers = workingMode.layers || [];
                    }
                    
                    // Store canvases/cabinets
                    if (screen.canvases && screen.canvases.length > 0) {
                        this.cabinets = screen.canvases[0].cabinets || [];
                    }
                    
                    console.log('Connected successfully. Screen ID:', this.currentScreenId);
                    console.log('Layers found:', this.layers.length);
                    console.log('Cabinets found:', this.cabinets.length);
                    
                    return { 
                        success: true, 
                        screens: [screen], 
                        screenId: this.currentScreenId 
                    };
                }
            }
            
            throw new Error('Invalid response from controller');
        } catch (error) {
            console.error('Connection failed:', error);
            return { success: false, error: error.message };
        }
    }

    // ========== Screen Management ==========

    /**
     * Get screen information (already fetched during connect)
     */
    async getScreens() {
        if (this.screenData) {
            return [this.screenData];
        }
        
        try {
            const response = await this.axios.get('/screen');
            if (response.data.code === 0 && response.data.data.screens) {
                return response.data.data.screens;
            }
            return [];
        } catch (error) {
            console.error('Failed to get screens:', error);
            return [];
        }
    }

    /**
     * Get specific screen information
     */
    async getScreenInfo(screenId) {
        // Return cached data since COEX returns all data in one call
        return this.screenData;
    }

    /**
     * Set screen brightness
     * COEX API expects screenIdList with the actual screen ID
     */
    async setScreenBrightness(screenId, brightness) {
        try {
            const id = screenId || this.currentScreenId;
            
            // COEX expects screenIdList as an array with the screen ID
            const response = await this.axios.put('/screen/brightness', {
                screenIdList: [id],
                brightness: parseInt(brightness)
            });
            
            if (response.data.code === 0) {
                console.log('Brightness set successfully to', brightness);
                return response.data;
            }
            throw new Error(response.data.message || 'Failed to set brightness');
        } catch (error) {
            console.error('Failed to set brightness:', error);
            return null;
        }
    }

    /**
     * Set screen gamma
     * COEX API expects screenIdList with the actual screen ID
     */
    async setScreenGamma(screenId, gamma) {
        try {
            const id = screenId || this.currentScreenId;
            
            const response = await this.axios.put('/screen/gamma', {
                screenIdList: [id],
                gamma: parseFloat(gamma)
            });
            
            if (response.data.code === 0) {
                console.log('Gamma set successfully to', gamma);
                return response.data;
            }
            throw new Error(response.data.message || 'Failed to set gamma');
        } catch (error) {
            console.error('Failed to set gamma:', error);
            return null;
        }
    }

    /**
     * Set display mode (blackout/freeze/normal)
     * Note: Despite being in documentation, these endpoints return 404 on actual hardware
     */
    async setDisplayMode(screenId, mode) {
        try {
            // CORRECTED: Use /device/displaymode with canvasIDs
            const response = await this.axios.put('/device/displaymode', {
                value: mode,  // 0=Normal, 1=Freeze, 2=Blackout
                canvasIDs: [45]  // TODO: Get actual canvas ID dynamically
            });
            
            if (response.data.code === 0) {
                return { 
                    success: true, 
                    message: `Display mode set to ${mode === 0 ? 'Normal' : mode === 1 ? 'Freeze' : 'Blackout'}` 
                };
            }
            return { success: false, message: 'Failed to set display mode' };
        } catch (error) {
            console.error('Failed to set display mode:', error);
            return { success: false, message: error.message };
        }
    }

    // ========== Input Management ==========

    /**
     * Get all input sources
     * Input sources are embedded in the screen data
     */
    async getInputSources(screenId) {
        try {
            // CORRECTED: Use /device/input/sources endpoint
            const response = await this.axios.get('/device/input/sources');
            
            if (response.data.code === 0 && response.data.data) {
                const sources = response.data.data.sources || [];
                
                // Map sources to consistent format
                const inputs = sources.map((source, index) => ({
                    id: source.id || index,
                    name: source.name || `Input ${index + 1}`,
                    type: source.type || 'Unknown',
                    resolution: source.resolution || 'N/A',
                    status: source.status || 'Unknown'
                }));
                
                this.inputSources = inputs;
                return inputs;
            }
            
            // Fallback to screen data if new endpoint doesn't work
            return this.getInputSourcesFromScreen(screenId);
        } catch (error) {
            console.error('Failed to get input sources, falling back:', error);
            // Fallback to original method
            return this.getInputSourcesFromScreen(screenId);
        }
    }
    
    async getInputSourcesFromScreen(screenId) {
        try {
            const response = await this.axios.get('/screen');
            
            if (response.data.code === 0 && response.data.data.screens) {
                const screen = response.data.data.screens[0];
                const inputs = [];
                
                if (screen.inputPort) {
                    inputs.push({
                        id: screen.inputPort.LogicId,
                        name: `Input ${screen.inputPort.Order + 1}`,
                        type: screen.inputPort.InputDetailInfo?.Type || 'Unknown',
                        resolution: `${screen.inputPort.InputSrcInfo?.SourceDetInColPixel || 0}x${screen.inputPort.InputSrcInfo?.SourceDetInRowPixel || 0}`,
                        status: screen.inputPort.InputSrcInfo?.SourceStatus === 1 ? 'Active' : 'Inactive'
                    });
                }
                
                this.inputSources = inputs;
                return inputs;
            }
            return [];
        } catch (error) {
            console.error('Failed to get input sources from screen:', error);
            return [];
        }
    }

    // ========== Layer Management ==========

    /**
     * Get all layers for a screen
     * Layers are embedded in the screen data
     */
    async getLayers(screenId) {
        try {
            // Refresh screen data to get latest layers
            const response = await this.axios.get('/screen');
            
            if (response.data.code === 0 && response.data.data.screens) {
                const screen = response.data.data.screens[0];
                
                // Extract layers from current working mode
                if (screen.layersInWorkingMode && screen.layersInWorkingMode.length > 0) {
                    const workingMode = screen.layersInWorkingMode.find(m => m.workingMode === screen.workingMode) || screen.layersInWorkingMode[0];
                    const layers = workingMode.layers || [];
                    
                    // Transform layers to our format
                    this.layers = layers.map(layer => ({
                        id: layer.id,
                        name: `Layer ${layer.layerIndex}`,
                        x: layer.position?.x || 0,
                        y: layer.position?.y || 0,
                        width: layer.scaler?.width || layer.sourceSize?.width || 100,
                        height: layer.scaler?.height || layer.sourceSize?.height || 100,
                        zOrder: layer.zOrder,
                        inputId: layer.source,
                        inputName: `Source ${layer.source}`,
                        locked: layer.lock || false
                    }));
                    
                    return this.layers;
                }
            }
            return [];
        } catch (error) {
            console.error('Failed to get layers:', error);
            return [];
        }
    }

    /**
     * Create new layer
     */
    async createLayer(screenId, layerData) {
        try {
            const id = screenId || this.currentScreenId;
            
            // COEX API structure for creating layers
            const response = await this.axios.post('/screen/layer', {
                screenId: id,
                layer: {
                    source: layerData.inputId || 0,
                    position: {
                        x: layerData.x || 0,
                        y: layerData.y || 0
                    },
                    scaler: {
                        width: layerData.width || 400,
                        height: layerData.height || 300
                    },
                    zOrder: layerData.zOrder || 1
                }
            });
            
            if (response.data.code === 0) {
                console.log('Layer created successfully');
                return response.data;
            }
            throw new Error(response.data.message || 'Failed to create layer');
        } catch (error) {
            console.error('Failed to create layer:', error);
            return null;
        }
    }

    /**
     * Update layer properties
     */
    async updateLayer(layerId, layerData) {
        try {
            const response = await this.axios.put('/screen/layer', {
                screenId: this.currentScreenId,
                layerId: layerId,
                layer: {
                    position: {
                        x: layerData.x,
                        y: layerData.y
                    },
                    scaler: {
                        width: layerData.width,
                        height: layerData.height
                    },
                    zOrder: layerData.zOrder
                }
            });
            
            if (response.data.code === 0) {
                console.log('Layer updated successfully');
                return response.data;
            }
            throw new Error(response.data.message || 'Failed to update layer');
        } catch (error) {
            console.error('Failed to update layer:', error);
            return null;
        }
    }

    /**
     * Delete layer
     */
    async deleteLayer(layerId) {
        try {
            const response = await this.axios.delete('/screen/layer', {
                data: {
                    screenId: this.currentScreenId,
                    layerId: layerId
                }
            });
            
            if (response.data.code === 0) {
                console.log('Layer deleted successfully');
                return response.data;
            }
            throw new Error(response.data.message || 'Failed to delete layer');
        } catch (error) {
            console.error('Failed to delete layer:', error);
            return null;
        }
    }

    /**
     * Move layer position
     */
    async moveLayer(layerId, x, y) {
        return this.updateLayer(layerId, { x, y });
    }

    /**
     * Resize layer
     */
    async resizeLayer(layerId, width, height) {
        return this.updateLayer(layerId, { width, height });
    }
    
    /**
     * Switch layer input source
     * CORRECTED: Uses the proper endpoint and structure
     */
    async switchLayerSource(layerId, sourceId) {
        try {
            const response = await this.axios.put('/screen/layer/input', {
                layers: [
                    {
                        id: String(layerId),
                        source: String(sourceId)
                    }
                ],
                screenID: this.currentScreenId
            });
            
            if (response.data.code === 0) {
                console.log(`Layer ${layerId} switched to source ${sourceId}`);
                return { 
                    success: true, 
                    message: `Layer switched to source ${sourceId}` 
                };
            }
            
            return { 
                success: false, 
                message: 'Failed to switch layer source' 
            };
        } catch (error) {
            console.error('Failed to switch layer source:', error);
            return { 
                success: false, 
                message: error.message 
            };
        }
    }

    // ========== Preset Management ==========

    /**
     * Get all presets
     */
    async getPresets(screenId) {
        try {
            const response = await this.axios.get('/preset');
            
            if (response.data.code === 0 && response.data.data?.screenPresets) {
                // Find presets for our screen
                const screenPresets = response.data.data.screenPresets.find(
                    sp => sp.screenID === (screenId || this.currentScreenId)
                );
                
                if (screenPresets && screenPresets.presets) {
                    this.presets = screenPresets.presets;
                    return this.presets;
                }
            }
            return [];
        } catch (error) {
            console.error('Failed to get presets:', error);
            return [];
        }
    }

    /**
     * Apply preset
     * Note: Despite being in documentation, this endpoint returns 404 on actual hardware
     */
    async applyPreset(screenId, presetId) {
        try {
            // CORRECTED: Use /preset/current/update endpoint
            const id = screenId || this.currentScreenId;
            
            const response = await this.axios.post('/preset/current/update', {
                sequenceNumber: presetId,
                screenID: id
            });
            
            if (response.data.code === 0) {
                console.log('Preset applied successfully:', presetId);
                return { 
                    success: true, 
                    message: `Preset ${presetId} applied successfully` 
                };
            }
            
            return { 
                success: false, 
                message: 'Failed to apply preset' 
            };
        } catch (error) {
            console.error('Failed to apply preset:', error);
            return { 
                success: false, 
                message: error.message 
            };
        }
    }

    // ========== Cabinet Management ==========

    /**
     * Get all cabinet information
     * Cabinets are embedded in the screen data
     */
    async getCabinets(screenId) {
        try {
            // Refresh screen data to get latest cabinet info
            const response = await this.axios.get('/screen');
            
            if (response.data.code === 0 && response.data.data.screens) {
                const screen = response.data.data.screens[0];
                
                // Extract cabinets from canvases
                const cabinets = [];
                if (screen.canvases) {
                    screen.canvases.forEach(canvas => {
                        if (canvas.cabinets) {
                            cabinets.push(...canvas.cabinets);
                        }
                    });
                }
                
                this.cabinets = cabinets;
                return cabinets;
            }
            return [];
        } catch (error) {
            console.error('Failed to get cabinets:', error);
            return [];
        }
    }

    // ========== Utility Methods ==========

    /**
     * Get all API endpoints documentation
     */
    getAPIDocumentation() {
        return [
            // CONFIRMED WORKING on YOUR Controller (10.0.0.22:8001)
            { method: 'GET', endpoint: '/api/v1/screen', description: '✅ WORKS: Get complete screen information' },
            { method: 'GET', endpoint: '/api/v1/preset', description: '✅ WORKS: Get all presets (read-only)' },
            { method: 'PUT', endpoint: '/api/v1/screen/brightness', description: '✅ WORKS: Set brightness (body: {screenIdList: ["{screen-id}"], brightness: 0-100})' },
            { method: 'PUT', endpoint: '/api/v1/screen/gamma', description: '✅ WORKS: Set gamma (body: {screenIdList: ["{screen-id}"], gamma: 1.0-4.0})' },
            
            // Critical Implementation Notes
            { method: 'INFO', endpoint: '⚠️ IMPORTANT', description: 'Use "screenIdList" NOT "ids" or "id"' },
            { method: 'INFO', endpoint: '⚠️ IMPORTANT', description: 'Screen ID must include braces: {7e9cd858-780b-40d1-9f20-0fa0d53a06ce}' },
            { method: 'INFO', endpoint: '⚠️ IMPORTANT', description: 'All IDs must be in an array, even for single screen' },
            
            // API Limitations on YOUR Controller
            { method: 'WARNING', endpoint: 'Limited API', description: '⚠️ Your controller has a limited API implementation' },
            { method: 'WARNING', endpoint: 'Documentation Mismatch', description: '⚠️ Many documented endpoints return 404 on your hardware' },
            
            // Documented but NOT WORKING on YOUR Controller
            { method: 'ERROR', endpoint: '/api/v1/screen/blackout', description: '❌ Returns 404 (not implemented)' },
            { method: 'ERROR', endpoint: '/api/v1/screen/freeze', description: '❌ Returns 404 (not implemented)' },
            { method: 'ERROR', endpoint: '/api/v1/screen/display', description: '❌ Returns 404 (not implemented)' },
            { method: 'ERROR', endpoint: '/api/v1/preset/apply', description: '❌ Returns 404 (not implemented)' },
            { method: 'ERROR', endpoint: '/api/v1/screen/displayMode', description: '❌ Returns 404 (not implemented)' },
            { method: 'ERROR', endpoint: '/api/v1/screen/outputMode', description: '❌ Returns 404 (not implemented)' },
            { method: 'ERROR', endpoint: '/api/v1/screen/workingMode', description: '❌ Returns 404 (not implemented)' },
            { method: 'ERROR', endpoint: '/api/v1/device', description: '❌ Returns 404 (not implemented)' },
            
            // What You CAN Do
            { method: 'SUCCESS', endpoint: 'Brightness', description: '✅ Adjust screen brightness (0-100%)' },
            { method: 'SUCCESS', endpoint: 'Gamma', description: '✅ Adjust screen gamma (1.0-4.0)' },
            { method: 'SUCCESS', endpoint: 'Monitor', description: '✅ View layers, inputs, cabinets, configuration' },
            { method: 'SUCCESS', endpoint: 'View Presets', description: '✅ See saved presets (cannot apply them via API)' }
        ];
    }
}

// Export for use in other modules
const novastarAPI = new NovastarAPI();