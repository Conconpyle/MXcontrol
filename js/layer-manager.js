/**
 * Layer Manager for MX Control
 * Handles advanced layer operations and drag-drop functionality
 */

class LayerManager {
    constructor() {
        this.layers = new Map();
        this.draggedInput = null;
        this.dropZone = null;
    }

    /**
     * Initialize layer manager
     */
    init() {
        this.setupDropZone();
        this.setupLayerInteractions();
    }

    /**
     * Setup drop zone for creating layers
     */
    setupDropZone() {
        const canvas = document.getElementById('screenCanvas');
        
        canvas.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
            canvas.style.background = 'linear-gradient(135deg, rgba(79, 172, 254, 0.1) 0%, rgba(0, 242, 254, 0.1) 100%)';
        });
        
        canvas.addEventListener('dragleave', () => {
            canvas.style.background = '';
        });
        
        canvas.addEventListener('drop', async (e) => {
            e.preventDefault();
            canvas.style.background = '';
            
            const inputId = e.dataTransfer.getData('inputId');
            const inputName = e.dataTransfer.getData('inputName');
            
            if (inputId) {
                // Calculate position relative to canvas
                const rect = canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                await this.createLayerFromInput(inputId, inputName, x, y);
            }
        });
    }

    /**
     * Create layer from dropped input
     */
    async createLayerFromInput(inputId, inputName, x, y) {
        const layerData = {
            name: `${inputName} Layer`,
            inputId: inputId,
            x: Math.max(0, x - 200), // Center on drop point
            y: Math.max(0, y - 150),
            width: 400,
            height: 300,
            zOrder: this.getNextZOrder()
        };
        
        uiManager.showLoading('Creating layer...');
        
        const result = await novastarAPI.createLayer(uiManager.currentScreen, layerData);
        
        if (result) {
            await uiManager.loadLayers(uiManager.currentScreen);
            uiManager.updateStatus(`Layer created from ${inputName}`);
        }
        
        uiManager.hideLoading();
    }

    /**
     * Get next available z-order
     */
    getNextZOrder() {
        const layers = document.querySelectorAll('.layer');
        let maxZ = 0;
        
        layers.forEach(layer => {
            const z = parseInt(layer.style.zIndex) || 0;
            maxZ = Math.max(maxZ, z);
        });
        
        return maxZ + 1;
    }

    /**
     * Setup layer interactions
     */
    setupLayerInteractions() {
        // Context menu for layers
        document.addEventListener('contextmenu', (e) => {
            const layer = e.target.closest('.layer');
            if (layer) {
                e.preventDefault();
                this.showLayerContextMenu(layer, e.clientX, e.clientY);
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (uiManager.selectedLayer) {
                switch(e.key) {
                    case 'Delete':
                        uiManager.deleteSelectedLayer();
                        break;
                    case 'ArrowUp':
                        if (e.shiftKey) {
                            this.moveLayerBy(0, -10);
                        } else {
                            this.moveLayerBy(0, -1);
                        }
                        break;
                    case 'ArrowDown':
                        if (e.shiftKey) {
                            this.moveLayerBy(0, 10);
                        } else {
                            this.moveLayerBy(0, 1);
                        }
                        break;
                    case 'ArrowLeft':
                        if (e.shiftKey) {
                            this.moveLayerBy(-10, 0);
                        } else {
                            this.moveLayerBy(-1, 0);
                        }
                        break;
                    case 'ArrowRight':
                        if (e.shiftKey) {
                            this.moveLayerBy(10, 0);
                        } else {
                            this.moveLayerBy(1, 0);
                        }
                        break;
                }
            }
        });
    }

    /**
     * Move selected layer by offset
     */
    async moveLayerBy(dx, dy) {
        if (!uiManager.selectedLayer) return;
        
        const layer = document.getElementById(`layer-${uiManager.selectedLayer}`);
        if (!layer) return;
        
        const currentX = parseInt(layer.style.left) || 0;
        const currentY = parseInt(layer.style.top) || 0;
        
        const newX = Math.max(0, currentX + dx);
        const newY = Math.max(0, currentY + dy);
        
        layer.style.left = `${newX}px`;
        layer.style.top = `${newY}px`;
        
        // Update on server
        await novastarAPI.moveLayer(uiManager.selectedLayer, newX, newY);
        uiManager.updateStatus(`Layer moved to ${newX}, ${newY}`);
    }

    /**
     * Show context menu for layer
     */
    showLayerContextMenu(layer, x, y) {
        // Remove existing menu if any
        const existingMenu = document.querySelector('.context-menu');
        if (existingMenu) existingMenu.remove();
        
        const menu = document.createElement('div');
        menu.className = 'context-menu';
        menu.style.position = 'fixed';
        menu.style.left = `${x}px`;
        menu.style.top = `${y}px`;
        menu.style.zIndex = '9999';
        
        menu.innerHTML = `
            <div class="context-menu-item" data-action="duplicate">
                <i class="fas fa-copy"></i> Duplicate Layer
            </div>
            <div class="context-menu-item" data-action="bring-front">
                <i class="fas fa-arrow-up"></i> Bring to Front
            </div>
            <div class="context-menu-item" data-action="send-back">
                <i class="fas fa-arrow-down"></i> Send to Back
            </div>
            <div class="context-menu-divider"></div>
            <div class="context-menu-item" data-action="properties">
                <i class="fas fa-cog"></i> Properties
            </div>
            <div class="context-menu-item" data-action="delete">
                <i class="fas fa-trash"></i> Delete
            </div>
        `;
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .context-menu {
                background: var(--bg-medium);
                border: 1px solid var(--border-color);
                border-radius: 8px;
                padding: 8px 0;
                box-shadow: var(--shadow-xl);
                min-width: 180px;
            }
            
            .context-menu-item {
                padding: 10px 16px;
                color: var(--text-primary);
                cursor: pointer;
                font-size: 14px;
                display: flex;
                align-items: center;
                gap: 10px;
                transition: all 0.2s ease;
            }
            
            .context-menu-item:hover {
                background: var(--bg-lighter);
                color: var(--accent-color);
            }
            
            .context-menu-divider {
                height: 1px;
                background: var(--border-color);
                margin: 8px 0;
            }
        `;
        
        if (!document.querySelector('#context-menu-styles')) {
            style.id = 'context-menu-styles';
            document.head.appendChild(style);
        }
        
        document.body.appendChild(menu);
        
        // Handle menu item clicks
        menu.addEventListener('click', async (e) => {
            const item = e.target.closest('.context-menu-item');
            if (!item) return;
            
            const action = item.dataset.action;
            const layerId = layer.dataset.layerId;
            
            switch(action) {
                case 'duplicate':
                    await this.duplicateLayer(layerId);
                    break;
                case 'bring-front':
                    await this.bringToFront(layerId);
                    break;
                case 'send-back':
                    await this.sendToBack(layerId);
                    break;
                case 'properties':
                    uiManager.selectLayer(layerId);
                    break;
                case 'delete':
                    uiManager.selectedLayer = layerId;
                    await uiManager.deleteSelectedLayer();
                    break;
            }
            
            menu.remove();
        });
        
        // Remove menu when clicking outside
        setTimeout(() => {
            document.addEventListener('click', () => menu.remove(), { once: true });
        }, 0);
    }

    /**
     * Duplicate layer
     */
    async duplicateLayer(layerId) {
        const layer = document.getElementById(`layer-${layerId}`);
        if (!layer) return;
        
        const layerData = {
            name: `${layer.querySelector('.layer-title').textContent} Copy`,
            x: parseInt(layer.style.left) + 20,
            y: parseInt(layer.style.top) + 20,
            width: parseInt(layer.style.width),
            height: parseInt(layer.style.height),
            zOrder: this.getNextZOrder()
        };
        
        uiManager.showLoading('Duplicating layer...');
        
        await novastarAPI.createLayer(uiManager.currentScreen, layerData);
        await uiManager.loadLayers(uiManager.currentScreen);
        
        uiManager.hideLoading();
        uiManager.updateStatus('Layer duplicated');
    }

    /**
     * Bring layer to front
     */
    async bringToFront(layerId) {
        const maxZ = this.getNextZOrder();
        
        await novastarAPI.updateLayer(layerId, { zOrder: maxZ });
        await uiManager.loadLayers(uiManager.currentScreen);
        
        uiManager.updateStatus('Layer brought to front');
    }

    /**
     * Send layer to back
     */
    async sendToBack(layerId) {
        // Move all other layers up
        const layers = document.querySelectorAll('.layer');
        for (let layer of layers) {
            if (layer.dataset.layerId !== layerId) {
                const currentZ = parseInt(layer.style.zIndex) || 1;
                await novastarAPI.updateLayer(layer.dataset.layerId, { zOrder: currentZ + 1 });
            }
        }
        
        // Set this layer to z-order 1
        await novastarAPI.updateLayer(layerId, { zOrder: 1 });
        await uiManager.loadLayers(uiManager.currentScreen);
        
        uiManager.updateStatus('Layer sent to back');
    }

    /**
     * Snap layer to grid
     */
    snapToGrid(value, gridSize = 20) {
        return Math.round(value / gridSize) * gridSize;
    }

    /**
     * Check layer collision
     */
    checkCollision(layer1, layer2) {
        const rect1 = layer1.getBoundingClientRect();
        const rect2 = layer2.getBoundingClientRect();
        
        return !(rect1.right < rect2.left || 
                rect1.left > rect2.right || 
                rect1.bottom < rect2.top || 
                rect1.top > rect2.bottom);
    }

    /**
     * Auto-arrange layers
     */
    async autoArrangeLayers() {
        const layers = document.querySelectorAll('.layer');
        const canvasWidth = parseInt(document.getElementById('screenCanvas').style.width) || 1920;
        const padding = 20;
        let currentX = padding;
        let currentY = padding;
        let rowHeight = 0;
        
        for (let layer of layers) {
            const width = parseInt(layer.style.width);
            const height = parseInt(layer.style.height);
            
            // Check if layer fits in current row
            if (currentX + width > canvasWidth - padding) {
                currentX = padding;
                currentY += rowHeight + padding;
                rowHeight = 0;
            }
            
            // Position layer
            layer.style.left = `${currentX}px`;
            layer.style.top = `${currentY}px`;
            
            // Update on server
            await novastarAPI.moveLayer(layer.dataset.layerId, currentX, currentY);
            
            // Update position for next layer
            currentX += width + padding;
            rowHeight = Math.max(rowHeight, height);
        }
        
        uiManager.updateStatus('Layers auto-arranged');
    }
}

// Create global instance
const layerManager = new LayerManager();
