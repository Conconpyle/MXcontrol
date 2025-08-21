/**
 * API Client for Novastar MX Controller
 * Handles all communication with the COEX API
 */

class NovastarAPI {
    constructor() {
        this.baseUrl = '';
        this.timeout = 10000;
        this.screenData = null;
        this.inputSources = [];
        this.presets = [];
        this.cabinets = [];
        this.layers = [];
    }

    /**
     * Initialize connection to the controller
     */
    async connect(ip, port) {
        this.baseUrl = `http://${ip}:${port}/api`;
        
        try {
            // Test connection by getting screen info
            const screens = await this.getScreens();
            if (screens) {
                console.log('Connected successfully to controller');
                return { success: true, screens };
            }
        } catch (error) {
            console.error('Connection failed:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Make API request with error handling
     */
    async makeRequest(method, endpoint, data = null) {
        const url = `${this.baseUrl}${endpoint}`;
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            mode: 'cors'
        };

        if (data && (method === 'POST' || method === 'PUT')) {
            options.body = JSON.stringify(data);
        }

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);
            
            const response = await fetch(url, { ...options, signal: controller.signal });
            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            }
            return response.text();
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('Request timeout');
            }
            throw error;
        }
    }

    // ========== Screen Management ==========

    /**
     * Get all screens information
     */
    async getScreens() {
        try {
            const response = await this.makeRequest('GET', '/screens');
            this.screenData = response;
            return response;
        } catch (error) {
            console.error('Failed to get screens:', error);
            return null;
        }
    }

    /**
     * Get specific screen information
     */
    async getScreenInfo(screenId) {
        try {
            return await this.makeRequest('GET', `/screens/${screenId}`);
        } catch (error) {
            console.error('Failed to get screen info:', error);
            return null;
        }
    }

    /**
     * Set screen brightness
     */
    async setScreenBrightness(screenId, brightness) {
        try {
            return await this.makeRequest('PUT', `/screens/${screenId}/brightness`, {
                brightness: brightness
            });
        } catch (error) {
            console.error('Failed to set brightness:', error);
            return null;
        }
    }

    /**
     * Set screen gamma
     */
    async setScreenGamma(screenId, gamma) {
        try {
            return await this.makeRequest('PUT', `/screens/${screenId}/gamma`, {
                gamma: gamma
            });
        } catch (error) {
            console.error('Failed to set gamma:', error);
            return null;
        }
    }

    /**
     * Set display mode (blackout/freeze/normal)
     */
    async setDisplayMode(screenId, mode) {
        try {
            const endpoint = `/screens/${screenId}/display-mode`;
            const data = {
                blackout: mode === 'blackout',
                freeze: mode === 'freeze'
            };
            return await this.makeRequest('PUT', endpoint, data);
        } catch (error) {
            console.error('Failed to set display mode:', error);
            return null;
        }
    }

    // ========== Input Management ==========

    /**
     * Get all input sources
     */
    async getInputSources(screenId) {
        try {
            const response = await this.makeRequest('GET', `/screens/${screenId}/inputs`);
            this.inputSources = response;
            return response;
        } catch (error) {
            console.error('Failed to get input sources:', error);
            return [];
        }
    }

    /**
     * Get input information
     */
    async getInputInfo(inputId) {
        try {
            return await this.makeRequest('GET', `/inputs/${inputId}`);
        } catch (error) {
            console.error('Failed to get input info:', error);
            return null;
        }
    }

    /**
     * Create new input source
     */
    async createInput(screenId, inputData) {
        try {
            return await this.makeRequest('POST', `/screens/${screenId}/inputs`, inputData);
        } catch (error) {
            console.error('Failed to create input:', error);
            return null;
        }
    }

    /**
     * Delete input source
     */
    async deleteInput(inputId) {
        try {
            return await this.makeRequest('DELETE', `/inputs/${inputId}`);
        } catch (error) {
            console.error('Failed to delete input:', error);
            return null;
        }
    }

    // ========== Layer Management ==========

    /**
     * Get all layers for a screen
     */
    async getLayers(screenId) {
        try {
            const response = await this.makeRequest('GET', `/screens/${screenId}/layers`);
            this.layers = response;
            return response;
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
            return await this.makeRequest('POST', `/screens/${screenId}/layers`, layerData);
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
            return await this.makeRequest('PUT', `/layers/${layerId}`, layerData);
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
            return await this.makeRequest('DELETE', `/layers/${layerId}`);
        } catch (error) {
            console.error('Failed to delete layer:', error);
            return null;
        }
    }

    /**
     * Switch input source for layer
     */
    async switchLayerSource(layerId, inputId) {
        try {
            return await this.makeRequest('PUT', `/layers/${layerId}/source`, {
                inputId: inputId
            });
        } catch (error) {
            console.error('Failed to switch layer source:', error);
            return null;
        }
    }

    /**
     * Move layer position
     */
    async moveLayer(layerId, x, y) {
        try {
            return await this.makeRequest('PUT', `/layers/${layerId}/position`, {
                x: x,
                y: y
            });
        } catch (error) {
            console.error('Failed to move layer:', error);
            return null;
        }
    }

    /**
     * Resize layer
     */
    async resizeLayer(layerId, width, height) {
        try {
            return await this.makeRequest('PUT', `/layers/${layerId}/size`, {
                width: width,
                height: height
            });
        } catch (error) {
            console.error('Failed to resize layer:', error);
            return null;
        }
    }

    // ========== Preset Management ==========

    /**
     * Get all presets
     */
    async getPresets(screenId) {
        try {
            const response = await this.makeRequest('GET', `/screens/${screenId}/presets`);
            this.presets = response;
            return response;
        } catch (error) {
            console.error('Failed to get presets:', error);
            return [];
        }
    }

    /**
     * Apply preset
     */
    async applyPreset(screenId, presetId) {
        try {
            return await this.makeRequest('POST', `/screens/${screenId}/presets/${presetId}/apply`);
        } catch (error) {
            console.error('Failed to apply preset:', error);
            return null;
        }
    }

    /**
     * Save current layout as preset
     */
    async savePreset(screenId, presetName) {
        try {
            return await this.makeRequest('POST', `/screens/${screenId}/presets`, {
                name: presetName
            });
        } catch (error) {
            console.error('Failed to save preset:', error);
            return null;
        }
    }

    // ========== Cabinet Management ==========

    /**
     * Get all cabinet information
     */
    async getCabinets(screenId) {
        try {
            const response = await this.makeRequest('GET', `/screens/${screenId}/cabinets`);
            this.cabinets = response;
            return response;
        } catch (error) {
            console.error('Failed to get cabinets:', error);
            return [];
        }
    }

    /**
     * Set cabinet brightness
     */
    async setCabinetBrightness(cabinetId, brightness) {
        try {
            return await this.makeRequest('PUT', `/cabinets/${cabinetId}/brightness`, {
                brightness: brightness
            });
        } catch (error) {
            console.error('Failed to set cabinet brightness:', error);
            return null;
        }
    }

    // ========== Monitoring ==========

    /**
     * Get real-time monitoring information
     */
    async getMonitoringInfo(screenId) {
        try {
            return await this.makeRequest('GET', `/screens/${screenId}/monitoring`);
        } catch (error) {
            console.error('Failed to get monitoring info:', error);
            return null;
        }
    }

    // ========== Utility Methods ==========

    /**
     * Get all API endpoints documentation
     */
    getAPIDocumentation() {
        return [
            // Screen Management
            { method: 'GET', endpoint: '/screens', description: 'Retrieve all screens information' },
            { method: 'GET', endpoint: '/screens/{id}', description: 'Retrieve specific screen information' },
            { method: 'PUT', endpoint: '/screens/{id}/brightness', description: 'Set screen brightness (0-100)' },
            { method: 'PUT', endpoint: '/screens/{id}/gamma', description: 'Set screen gamma value' },
            { method: 'PUT', endpoint: '/screens/{id}/display-mode', description: 'Set blackout/freeze screen mode' },
            
            // Input Management
            { method: 'GET', endpoint: '/screens/{id}/inputs', description: 'Retrieve input source list' },
            { method: 'POST', endpoint: '/screens/{id}/inputs', description: 'Create new input source' },
            { method: 'DELETE', endpoint: '/inputs/{id}', description: 'Delete input source' },
            
            // Layer Management
            { method: 'GET', endpoint: '/screens/{id}/layers', description: 'Get all layers for a screen' },
            { method: 'POST', endpoint: '/screens/{id}/layers', description: 'Create new layer' },
            { method: 'PUT', endpoint: '/layers/{id}', description: 'Update layer properties' },
            { method: 'DELETE', endpoint: '/layers/{id}', description: 'Delete layer' },
            { method: 'PUT', endpoint: '/layers/{id}/source', description: 'Switch input source for layer' },
            { method: 'PUT', endpoint: '/layers/{id}/position', description: 'Move layer position' },
            { method: 'PUT', endpoint: '/layers/{id}/size', description: 'Resize layer' },
            
            // Preset Management
            { method: 'GET', endpoint: '/screens/{id}/presets', description: 'Retrieve preset information' },
            { method: 'POST', endpoint: '/screens/{id}/presets/{presetId}/apply', description: 'Apply preset to screen' },
            { method: 'POST', endpoint: '/screens/{id}/presets', description: 'Save current layout as preset' },
            
            // Cabinet Management
            { method: 'GET', endpoint: '/screens/{id}/cabinets', description: 'Retrieve all cabinet information' },
            { method: 'PUT', endpoint: '/cabinets/{id}/brightness', description: 'Set cabinet brightness' },
            
            // Monitoring
            { method: 'GET', endpoint: '/screens/{id}/monitoring', description: 'Get real-time monitoring information' }
        ];
    }
}

// Export for use in other modules
const novastarAPI = new NovastarAPI();
