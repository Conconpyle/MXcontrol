/**
 * Main Application Entry Point
 * MX Control - Professional Novastar Controller
 */

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('MX Control Application Starting...');
    
    // Initialize managers
    uiManager.init();
    layerManager.init();
    
    // Set default values
    document.getElementById('ipAddress').value = localStorage.getItem('lastIP') || '192.168.1.100';
    document.getElementById('port').value = localStorage.getItem('lastPort') || '9999';
    
    // Save connection details on successful connection
    const originalConnect = uiManager.handleConnect.bind(uiManager);
    uiManager.handleConnect = async function() {
        const result = await originalConnect();
        if (result !== false) {
            localStorage.setItem('lastIP', document.getElementById('ipAddress').value);
            localStorage.setItem('lastPort', document.getElementById('port').value);
        }
        return result;
    };
    
    // Add keyboard shortcut for quick connect
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            const connectBtn = document.getElementById('connectBtn');
            if (connectBtn && !connectBtn.disabled) {
                connectBtn.click();
            }
        }
    });
    
    // Add auto-refresh capability
    let autoRefreshInterval = null;
    
    window.enableAutoRefresh = (seconds = 30) => {
        if (autoRefreshInterval) {
            clearInterval(autoRefreshInterval);
        }
        
        autoRefreshInterval = setInterval(() => {
            if (uiManager.currentScreen) {
                uiManager.refreshAll();
            }
        }, seconds * 1000);
        
        console.log(`Auto-refresh enabled: every ${seconds} seconds`);
    };
    
    window.disableAutoRefresh = () => {
        if (autoRefreshInterval) {
            clearInterval(autoRefreshInterval);
            autoRefreshInterval = null;
            console.log('Auto-refresh disabled');
        }
    };
    
    // Add debug mode
    window.enableDebugMode = () => {
        window.novastarAPI = novastarAPI;
        window.uiManager = uiManager;
        window.layerManager = layerManager;
        console.log('Debug mode enabled. Access objects via window.novastarAPI, window.uiManager, window.layerManager');
    };
    
    // Add custom commands
    window.mxControl = {
        connect: (ip, port) => {
            document.getElementById('ipAddress').value = ip;
            document.getElementById('port').value = port;
            document.getElementById('connectBtn').click();
        },
        
        disconnect: () => {
            document.getElementById('disconnectBtn').click();
        },
        
        createLayer: (name, x, y, width, height) => {
            return novastarAPI.createLayer(uiManager.currentScreen, {
                name, x, y, width, height,
                zOrder: layerManager.getNextZOrder()
            });
        },
        
        autoArrange: () => {
            layerManager.autoArrangeLayers();
        },
        
        savePreset: (name) => {
            return novastarAPI.savePreset(uiManager.currentScreen, name);
        },
        
        setBrightness: (value) => {
            document.getElementById('brightnessSlider').value = value;
            document.getElementById('brightnessSlider').dispatchEvent(new Event('input'));
        },
        
        setDisplayMode: (mode) => {
            uiManager.setDisplayMode(mode);
        },
        
        exportLayout: () => {
            const layers = [];
            document.querySelectorAll('.layer').forEach(layer => {
                layers.push({
                    id: layer.dataset.layerId,
                    name: layer.querySelector('.layer-title').textContent,
                    x: parseInt(layer.style.left),
                    y: parseInt(layer.style.top),
                    width: parseInt(layer.style.width),
                    height: parseInt(layer.style.height),
                    zOrder: parseInt(layer.style.zIndex) || 1
                });
            });
            
            const data = {
                screen: uiManager.currentScreen,
                layers: layers,
                exportDate: new Date().toISOString()
            };
            
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `mx-control-layout-${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);
            
            console.log('Layout exported');
            return data;
        },
        
        importLayout: (file) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    console.log('Importing layout:', data);
                    
                    // Import layers
                    for (let layer of data.layers) {
                        await novastarAPI.createLayer(uiManager.currentScreen, layer);
                    }
                    
                    await uiManager.loadLayers(uiManager.currentScreen);
                    console.log('Layout imported successfully');
                } catch (error) {
                    console.error('Failed to import layout:', error);
                }
            };
            reader.readAsText(file);
        }
    };
    
    // Log startup complete
    console.log('MX Control Application Ready');
    console.log('Quick commands available via window.mxControl');
    console.log('Enable debug mode: window.enableDebugMode()');
    console.log('Enable auto-refresh: window.enableAutoRefresh(seconds)');
    
    // Show welcome message
    uiManager.updateStatus('Welcome to MX Control - Ready to connect');
});
