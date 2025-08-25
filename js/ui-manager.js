/**
 * UI Manager for MX Control
 * Handles all UI interactions and updates
 */

class UIManager {
    constructor() {
        this.currentScreen = null;
        this.currentZoom = 100;
        this.gridEnabled = false;
        this.selectedLayer = null;
    }

    /**
     * Initialize UI components
     */
    init() {
        this.setupEventListeners();
        this.updateStatus('Ready');
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Connection
        document.getElementById('connectBtn').addEventListener('click', () => this.handleConnect());
        document.getElementById('disconnectBtn').addEventListener('click', () => this.handleDisconnect());
        
        // Screen selection
        document.getElementById('screenSelect').addEventListener('change', (e) => this.handleScreenChange(e.target.value));
        
        // Refresh
        document.getElementById('refreshBtn').addEventListener('click', () => this.refreshAll());
        
        // API Documentation
        document.getElementById('apiDocsBtn').addEventListener('click', () => this.showAPIDocumentation());
        document.getElementById('closeApiDocsBtn').addEventListener('click', () => this.hideAPIDocumentation());
        
        // Quick Controls
        document.getElementById('brightnessSlider').addEventListener('input', (e) => this.handleBrightnessChange(e.target.value));
        document.getElementById('gammaSlider').addEventListener('input', (e) => this.handleGammaChange(e.target.value));
        
        // Display Mode
        document.getElementById('normalBtn').addEventListener('click', () => this.setDisplayMode('normal'));
        document.getElementById('freezeBtn').addEventListener('click', () => this.setDisplayMode('freeze'));
        document.getElementById('blackoutBtn').addEventListener('click', () => this.setDisplayMode('blackout'));
        
        // Canvas Toolbar
        document.getElementById('fitToScreenBtn').addEventListener('click', () => this.fitToScreen());
        document.getElementById('gridToggleBtn').addEventListener('click', () => this.toggleGrid());
        document.getElementById('zoomInBtn').addEventListener('click', () => this.zoomIn());
        document.getElementById('zoomOutBtn').addEventListener('click', () => this.zoomOut());
        
        // Layer Management
        document.getElementById('addLayerBtn').addEventListener('click', () => this.addNewLayer());
        document.getElementById('addInputBtn').addEventListener('click', () => this.addNewInput());
        
        // Layer Properties
        document.getElementById('closePropertiesBtn').addEventListener('click', () => this.hideLayerProperties());
        document.getElementById('applyLayerBtn').addEventListener('click', () => this.applyLayerChanges());
        document.getElementById('deleteLayerBtn').addEventListener('click', () => this.deleteSelectedLayer());
    }

    /**
     * Handle connection to controller
     */
    async handleConnect() {
        const ip = document.getElementById('ipAddress').value;
        const port = document.getElementById('port').value;
        
        if (!ip || !port) {
            this.showConnectionError('Please enter IP address and port');
            return;
        }
        
        this.showLoading('Connecting to controller...');
        
        const result = await novastarAPI.connect(ip, port);
        
        if (result.success) {
            this.showConnectionSuccess('Connected successfully!');
            setTimeout(() => {
                document.getElementById('connectionPanel').classList.add('hidden');
                document.getElementById('mainApp').classList.remove('hidden');
                document.getElementById('connectedIP').textContent = `${ip}:${port}`;
                this.populateScreens(result.screens);
                this.hideLoading();
            }, 1000);
        } else {
            this.hideLoading();
            this.showConnectionError(`Connection failed: ${result.error}`);
        }
    }

    /**
     * Handle disconnection from controller
     */
    handleDisconnect() {
        if (confirm('Are you sure you want to disconnect?')) {
            document.getElementById('mainApp').classList.add('hidden');
            document.getElementById('connectionPanel').classList.remove('hidden');
            this.updateStatus('Disconnected');
        }
    }

    /**
     * Populate screens dropdown
     */
    populateScreens(screens) {
        const select = document.getElementById('screenSelect');
        select.innerHTML = '';
        
        if (screens && screens.length > 0) {
            screens.forEach(screen => {
                const option = document.createElement('option');
                // Handle different possible ID fields
                const screenId = screen.id || screen.screenId || novastarAPI.currentScreenId;
                option.value = screenId;
                option.textContent = screen.name || `Screen ${screenId}`;
                select.appendChild(option);
            });
            
            // Auto-select first screen or use the detected screen ID
            const firstScreenId = screens[0].id || screens[0].screenId || novastarAPI.currentScreenId;
            if (firstScreenId) {
                this.handleScreenChange(firstScreenId);
            }
        } else if (novastarAPI.currentScreenId) {
            // If no screens array but we have a screen ID from connection
            const option = document.createElement('option');
            option.value = novastarAPI.currentScreenId;
            option.textContent = `Screen ${novastarAPI.currentScreenId}`;
            select.appendChild(option);
            this.handleScreenChange(novastarAPI.currentScreenId);
        } else {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'No screens found';
            select.appendChild(option);
        }
    }

    /**
     * Handle screen selection change
     */
    async handleScreenChange(screenId) {
        if (!screenId) {
            // Use the screen ID from API if available
            screenId = novastarAPI.currentScreenId;
        }
        
        if (!screenId) return;
        
        this.currentScreen = screenId;
        novastarAPI.currentScreenId = screenId; // Ensure API has the current screen ID
        this.showLoading('Loading screen data...');
        
        // Load all screen data
        await Promise.all([
            this.loadInputSources(screenId),
            this.loadLayers(screenId),
            this.loadPresets(screenId),
            this.loadCabinets(screenId)
        ]);
        
        this.hideLoading();
        this.updateStatus(`Screen ${screenId} loaded`);
    }

    /**
     * Load input sources
     */
    async loadInputSources(screenId) {
        const inputs = await novastarAPI.getInputSources(screenId);
        const container = document.getElementById('inputsList');
        container.innerHTML = '';
        
        if (inputs && inputs.length > 0) {
            inputs.forEach(input => {
                const element = this.createInputElement(input);
                container.appendChild(element);
            });
        } else {
            container.innerHTML = '<div class="empty-state">No input sources</div>';
        }
    }

    /**
     * Create input element
     */
    createInputElement(input) {
        const div = document.createElement('div');
        div.className = 'input-item';
        div.draggable = true;
        div.dataset.inputId = input.id;
        
        div.innerHTML = `
            <div class="input-name">${input.name || `Input ${input.id}`}</div>
            <div class="input-info">${input.type || 'Unknown'} - ${input.resolution || 'N/A'}</div>
        `;
        
        // Add drag event listeners
        div.addEventListener('dragstart', (e) => {
            e.dataTransfer.effectAllowed = 'copy';
            e.dataTransfer.setData('inputId', input.id);
            e.dataTransfer.setData('inputName', input.name || `Input ${input.id}`);
            div.classList.add('dragging');
        });
        
        div.addEventListener('dragend', () => {
            div.classList.remove('dragging');
        });
        
        return div;
    }

    /**
     * Load layers
     */
    async loadLayers(screenId) {
        const layers = await novastarAPI.getLayers(screenId);
        
        // Update layers list
        const listContainer = document.getElementById('layersList');
        listContainer.innerHTML = '';
        
        // Update canvas
        const canvas = document.getElementById('screenCanvas');
        // Clear existing layers (keep grid if present)
        canvas.querySelectorAll('.layer').forEach(layer => layer.remove());
        
        if (layers && layers.length > 0) {
            layers.forEach(layer => {
                // Add to list
                const listItem = this.createLayerListItem(layer);
                listContainer.appendChild(listItem);
                
                // Add to canvas
                const canvasLayer = this.createCanvasLayer(layer);
                canvas.appendChild(canvasLayer);
            });
        } else {
            listContainer.innerHTML = '<div class="empty-state">No active layers</div>';
        }
    }

    /**
     * Create layer list item
     */
    createLayerListItem(layer) {
        const div = document.createElement('div');
        div.className = 'layer-list-item';
        div.dataset.layerId = layer.id;
        
        div.innerHTML = `
            <div class="layer-list-info">
                <div class="layer-list-name">${layer.name || `Layer ${layer.id}`}</div>
                <div class="layer-list-details">
                    ${layer.inputName || 'No Input'} | ${layer.width}x${layer.height}
                </div>
            </div>
            <button class="layer-visibility" title="Toggle Visibility">
                <i class="fas fa-eye"></i>
            </button>
        `;
        
        div.addEventListener('click', () => this.selectLayer(layer.id));
        
        return div;
    }

    /**
     * Create canvas layer
     */
    createCanvasLayer(layer) {
        const div = document.createElement('div');
        div.className = 'layer';
        div.id = `layer-${layer.id}`;
        div.dataset.layerId = layer.id;
        
        // Set position and size
        div.style.left = `${layer.x || 0}px`;
        div.style.top = `${layer.y || 0}px`;
        div.style.width = `${layer.width || 200}px`;
        div.style.height = `${layer.height || 150}px`;
        div.style.zIndex = layer.zOrder || 1;
        
        div.innerHTML = `
            <div class="layer-content">
                <div class="layer-title">${layer.name || `Layer ${layer.id}`}</div>
                <div class="layer-source">${layer.inputName || 'No Input'}</div>
            </div>
            <div class="layer-resize-handle bottom-right"></div>
        `;
        
        // Make layer draggable
        this.makeLayerDraggable(div);
        
        // Make layer resizable
        this.makeLayerResizable(div);
        
        // Add click handler
        div.addEventListener('click', () => this.selectLayer(layer.id));
        
        return div;
    }

    /**
     * Make layer draggable
     */
    makeLayerDraggable(element) {
        let isDragging = false;
        let startX, startY, initialX, initialY;
        
        element.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('layer-resize-handle')) return;
            
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            initialX = element.offsetLeft;
            initialY = element.offsetTop;
            
            element.style.cursor = 'grabbing';
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            e.preventDefault();
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            
            element.style.left = `${initialX + dx}px`;
            element.style.top = `${initialY + dy}px`;
        });
        
        document.addEventListener('mouseup', async () => {
            if (!isDragging) return;
            
            isDragging = false;
            element.style.cursor = 'move';
            
            // Update position on server
            const layerId = element.dataset.layerId;
            const x = parseInt(element.style.left);
            const y = parseInt(element.style.top);
            
            await novastarAPI.moveLayer(layerId, x, y);
            this.updateStatus(`Layer moved to ${x}, ${y}`);
        });
    }

    /**
     * Make layer resizable
     */
    makeLayerResizable(element) {
        const handle = element.querySelector('.layer-resize-handle');
        let isResizing = false;
        let startX, startY, startWidth, startHeight;
        
        handle.addEventListener('mousedown', (e) => {
            isResizing = true;
            startX = e.clientX;
            startY = e.clientY;
            startWidth = parseInt(element.style.width);
            startHeight = parseInt(element.style.height);
            
            e.stopPropagation();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;
            
            const width = startWidth + e.clientX - startX;
            const height = startHeight + e.clientY - startY;
            
            element.style.width = `${Math.max(50, width)}px`;
            element.style.height = `${Math.max(50, height)}px`;
        });
        
        document.addEventListener('mouseup', async () => {
            if (!isResizing) return;
            
            isResizing = false;
            
            // Update size on server
            const layerId = element.dataset.layerId;
            const width = parseInt(element.style.width);
            const height = parseInt(element.style.height);
            
            await novastarAPI.resizeLayer(layerId, width, height);
            this.updateStatus(`Layer resized to ${width}x${height}`);
        });
    }

    /**
     * Select layer
     */
    selectLayer(layerId) {
        // Remove previous selection
        document.querySelectorAll('.layer').forEach(l => l.classList.remove('selected'));
        document.querySelectorAll('.layer-list-item').forEach(l => l.classList.remove('active'));
        
        // Add selection
        const canvasLayer = document.getElementById(`layer-${layerId}`);
        const listItem = document.querySelector(`.layer-list-item[data-layer-id="${layerId}"]`);
        
        if (canvasLayer) canvasLayer.classList.add('selected');
        if (listItem) listItem.classList.add('active');
        
        this.selectedLayer = layerId;
        this.showLayerProperties(layerId);
    }

    /**
     * Show layer properties panel
     */
    async showLayerProperties(layerId) {
        const panel = document.getElementById('layerProperties');
        panel.classList.remove('hidden');
        
        // Get layer data
        const layer = document.getElementById(`layer-${layerId}`);
        if (!layer) return;
        
        // Populate properties
        document.getElementById('layerName').value = layer.querySelector('.layer-title').textContent;
        document.getElementById('layerX').value = parseInt(layer.style.left);
        document.getElementById('layerY').value = parseInt(layer.style.top);
        document.getElementById('layerWidth').value = parseInt(layer.style.width);
        document.getElementById('layerHeight').value = parseInt(layer.style.height);
        document.getElementById('layerZOrder').value = layer.style.zIndex || 1;
        
        // Populate input sources
        const select = document.getElementById('layerInputSource');
        select.innerHTML = '<option value="">Select Input</option>';
        
        const inputs = novastarAPI.inputSources;
        inputs.forEach(input => {
            const option = document.createElement('option');
            option.value = input.id;
            option.textContent = input.name || `Input ${input.id}`;
            select.appendChild(option);
        });
    }

    /**
     * Hide layer properties panel
     */
    hideLayerProperties() {
        document.getElementById('layerProperties').classList.add('hidden');
        this.selectedLayer = null;
    }

    /**
     * Apply layer changes
     */
    async applyLayerChanges() {
        if (!this.selectedLayer) return;
        
        const layerData = {
            name: document.getElementById('layerName').value,
            x: parseInt(document.getElementById('layerX').value),
            y: parseInt(document.getElementById('layerY').value),
            width: parseInt(document.getElementById('layerWidth').value),
            height: parseInt(document.getElementById('layerHeight').value),
            zOrder: parseInt(document.getElementById('layerZOrder').value)
        };
        
        const inputId = document.getElementById('layerInputSource').value;
        
        this.showLoading('Updating layer...');
        
        // Update layer
        await novastarAPI.updateLayer(this.selectedLayer, layerData);
        
        // Switch input if changed
        if (inputId) {
            await novastarAPI.switchLayerSource(this.selectedLayer, inputId);
        }
        
        // Refresh layers
        await this.loadLayers(this.currentScreen);
        
        this.hideLoading();
        this.hideLayerProperties();
        this.updateStatus('Layer updated successfully');
    }

    /**
     * Delete selected layer
     */
    async deleteSelectedLayer() {
        if (!this.selectedLayer) return;
        
        if (confirm('Are you sure you want to delete this layer?')) {
            this.showLoading('Deleting layer...');
            
            await novastarAPI.deleteLayer(this.selectedLayer);
            await this.loadLayers(this.currentScreen);
            
            this.hideLoading();
            this.hideLayerProperties();
            this.updateStatus('Layer deleted successfully');
        }
    }

    /**
     * Add new layer
     */
    async addNewLayer() {
        const layerData = {
            name: `Layer ${Date.now()}`,
            x: 100,
            y: 100,
            width: 400,
            height: 300,
            zOrder: 1
        };
        
        this.showLoading('Creating layer...');
        
        await novastarAPI.createLayer(this.currentScreen, layerData);
        await this.loadLayers(this.currentScreen);
        
        this.hideLoading();
        this.updateStatus('Layer created successfully');
    }

    /**
     * Load presets
     */
    async loadPresets(screenId) {
        const presets = await novastarAPI.getPresets(screenId);
        const container = document.getElementById('presetsList');
        container.innerHTML = '';
        
        if (presets && presets.length > 0) {
            presets.forEach(preset => {
                const element = this.createPresetElement(preset);
                container.appendChild(element);
            });
        } else {
            container.innerHTML = '<div class="empty-state">No presets available</div>';
        }
    }

    /**
     * Create preset element
     */
    createPresetElement(preset) {
        const div = document.createElement('div');
        div.className = 'preset-item';
        
        div.innerHTML = `
            <span class="preset-name">${preset.name}</span>
            <button class="preset-apply-btn" data-preset-id="${preset.id}">Apply</button>
        `;
        
        div.querySelector('.preset-apply-btn').addEventListener('click', async (e) => {
            e.stopPropagation();
            await this.applyPreset(preset.id);
        });
        
        return div;
    }

    /**
     * Apply preset
     */
    async applyPreset(presetId) {
        this.showLoading('Applying preset...');
        
        await novastarAPI.applyPreset(this.currentScreen, presetId);
        await this.loadLayers(this.currentScreen);
        
        this.hideLoading();
        this.updateStatus('Preset applied successfully');
    }

    /**
     * Load cabinet information
     */
    async loadCabinets(screenId) {
        const cabinets = await novastarAPI.getCabinets(screenId);
        
        if (cabinets && cabinets.length > 0) {
            document.getElementById('totalCabinets').textContent = cabinets.length;
            
            // Calculate total resolution
            let maxX = 0, maxY = 0;
            cabinets.forEach(cabinet => {
                maxX = Math.max(maxX, (cabinet.x || 0) + (cabinet.width || 0));
                maxY = Math.max(maxY, (cabinet.y || 0) + (cabinet.height || 0));
            });
            
            document.getElementById('screenResolution').textContent = `${maxX}x${maxY}`;
            document.getElementById('canvasResolution').textContent = `${maxX}x${maxY}`;
            
            // Set canvas size
            const canvas = document.getElementById('screenCanvas');
            canvas.style.width = `${maxX}px`;
            canvas.style.height = `${maxY}px`;
        } else {
            document.getElementById('totalCabinets').textContent = '0';
            document.getElementById('screenResolution').textContent = 'N/A';
        }
        
        document.getElementById('screenStatus').textContent = 'Online';
    }

    /**
     * Handle brightness change
     */
    async handleBrightnessChange(value) {
        document.getElementById('brightnessValue').textContent = `${value}%`;
        
        if (this.currentScreen) {
            await novastarAPI.setScreenBrightness(this.currentScreen, value);
            this.updateStatus(`Brightness set to ${value}%`);
        }
    }

    /**
     * Handle gamma change
     */
    async handleGammaChange(value) {
        const gamma = value / 10;
        document.getElementById('gammaValue').textContent = gamma.toFixed(1);
        
        if (this.currentScreen) {
            await novastarAPI.setScreenGamma(this.currentScreen, gamma);
            this.updateStatus(`Gamma set to ${gamma}`);
        }
    }

    /**
     * Set display mode
     */
    async setDisplayMode(mode) {
        // Update UI
        document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
        
        if (mode === 'normal') {
            document.getElementById('normalBtn').classList.add('active');
        } else if (mode === 'freeze') {
            document.getElementById('freezeBtn').classList.add('active');
        } else if (mode === 'blackout') {
            document.getElementById('blackoutBtn').classList.add('active');
        }
        
        // Send to controller
        if (this.currentScreen) {
            await novastarAPI.setDisplayMode(this.currentScreen, mode);
            this.updateStatus(`Display mode: ${mode}`);
        }
    }

    /**
     * Refresh all data
     */
    async refreshAll() {
        if (this.currentScreen) {
            this.showLoading('Refreshing...');
            await this.handleScreenChange(this.currentScreen);
            this.hideLoading();
        }
    }

    /**
     * Canvas controls
     */
    fitToScreen() {
        this.currentZoom = 100;
        document.getElementById('zoomLevel').textContent = '100%';
        document.getElementById('screenCanvas').style.transform = 'scale(1)';
    }

    toggleGrid() {
        this.gridEnabled = !this.gridEnabled;
        const grid = document.querySelector('.canvas-grid');
        if (this.gridEnabled) {
            grid.classList.remove('hidden');
        } else {
            grid.classList.add('hidden');
        }
    }

    zoomIn() {
        this.currentZoom = Math.min(200, this.currentZoom + 10);
        this.updateZoom();
    }

    zoomOut() {
        this.currentZoom = Math.max(50, this.currentZoom - 10);
        this.updateZoom();
    }

    updateZoom() {
        document.getElementById('zoomLevel').textContent = `${this.currentZoom}%`;
        const scale = this.currentZoom / 100;
        document.getElementById('screenCanvas').style.transform = `scale(${scale})`;
    }

    /**
     * Show API documentation
     */
    showAPIDocumentation() {
        const modal = document.getElementById('apiDocsModal');
        const list = document.getElementById('apiDocsList');
        
        list.innerHTML = '';
        
        const docs = novastarAPI.getAPIDocumentation();
        docs.forEach(doc => {
            const div = document.createElement('div');
            div.className = 'api-doc-item';
            
            const methodClass = doc.method.toLowerCase();
            div.innerHTML = `
                <div>
                    <span class="api-method ${methodClass}">${doc.method}</span>
                    <span class="api-endpoint">${doc.endpoint}</span>
                </div>
                <div class="api-description">${doc.description}</div>
            `;
            
            list.appendChild(div);
        });
        
        modal.classList.remove('hidden');
    }

    hideAPIDocumentation() {
        document.getElementById('apiDocsModal').classList.add('hidden');
    }

    /**
     * UI Helper Methods
     */
    showLoading(message) {
        const overlay = document.getElementById('loadingOverlay');
        overlay.querySelector('p').textContent = message || 'Loading...';
        overlay.classList.remove('hidden');
    }

    hideLoading() {
        document.getElementById('loadingOverlay').classList.add('hidden');
    }

    showConnectionError(message) {
        const status = document.getElementById('connectionStatus');
        status.textContent = message;
        status.className = 'connection-status error';
    }

    showConnectionSuccess(message) {
        const status = document.getElementById('connectionStatus');
        status.textContent = message;
        status.className = 'connection-status success';
    }

    updateStatus(message) {
        document.getElementById('statusMessage').textContent = message;
        document.getElementById('lastUpdate').textContent = `Last update: ${new Date().toLocaleTimeString()}`;
    }
}

// Create global instance
const uiManager = new UIManager();
