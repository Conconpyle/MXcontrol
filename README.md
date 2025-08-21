# MX Control - Professional Novastar Controller

A modern, web-based control interface for Novastar MX LED controllers. This HTML5 application provides an intuitive drag-and-drop interface for managing LED screens, layers, inputs, and presets.

![MX Control Interface](https://img.shields.io/badge/Version-1.0.0-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Platform](https://img.shields.io/badge/Platform-Web-orange)

## Features

### 🎯 Core Functionality
- **Dynamic Connection**: Connect to any Novastar MX controller via IP and port
- **Visual Layer Management**: Drag-and-drop interface for creating and positioning layers
- **Input Source Control**: Manage and assign input sources to layers
- **Preset Management**: Apply and save screen presets
- **Real-time Control**: Brightness, gamma, and display mode adjustments

### 🎨 User Interface
- **Modern Design**: Beautiful blue gradient theme with glassmorphism effects
- **Responsive Layout**: Works on desktop and tablet devices
- **Visual Canvas**: See your screen layout in real-time
- **Drag & Drop**: Intuitive layer creation from input sources

### 🔧 Advanced Features
- **Layer Properties**: Fine-tune position, size, and z-order
- **Cabinet Information**: View connected cabinet details and resolution
- **API Documentation**: Built-in API reference viewer
- **Keyboard Shortcuts**: Quick controls for power users
- **Auto-arrange**: Automatically organize layers on screen

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Conconpyle/MXcontrol.git
cd MXcontrol
```

2. Open `index.html` in a modern web browser (Chrome, Firefox, Edge, Safari)

3. Or host on a web server:
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx http-server

# Using PHP
php -S localhost:8000
```

## Usage

### Quick Start

1. **Connect to Controller**
   - Enter your controller's IP address (e.g., 192.168.1.100)
   - Enter the port (default: 9999)
   - Click "Connect"

2. **Create Layers**
   - Drag an input source from the left sidebar onto the canvas
   - Or click the "+" button next to "Active Layers"

3. **Manage Layers**
   - Click a layer to select it
   - Drag to move, resize using corner handles
   - Right-click for context menu options

4. **Apply Presets**
   - Click on any preset in the sidebar to apply it
   - Current layout can be saved as a new preset

### Keyboard Shortcuts

- `Ctrl + Enter` - Quick connect (when on connection screen)
- `Delete` - Delete selected layer
- `Arrow Keys` - Move selected layer (hold Shift for 10px increments)

### Console Commands

Open browser console (F12) for advanced commands:

```javascript
// Connect to controller
mxControl.connect('192.168.1.100', '9999')

// Create a layer programmatically
mxControl.createLayer('My Layer', 100, 100, 400, 300)

// Auto-arrange all layers
mxControl.autoArrange()

// Set brightness
mxControl.setBrightness(75)

// Set display mode
mxControl.setDisplayMode('normal') // or 'freeze', 'blackout'

// Export current layout
mxControl.exportLayout()

// Enable auto-refresh (every 30 seconds)
enableAutoRefresh(30)

// Enable debug mode
enableDebugMode()
```

## API Integration

The application uses the Novastar COEX API. Key endpoints include:

- **Screen Management**: Brightness, gamma, display modes
- **Layer Operations**: Create, update, delete, move, resize
- **Input Sources**: List, assign to layers
- **Presets**: Load, apply, save
- **Cabinet Info**: Resolution, count, status

For detailed API documentation, click the book icon in the app header.

## Browser Compatibility

- Chrome 90+ (Recommended)
- Firefox 88+
- Safari 14+
- Edge 90+

## CORS Configuration

If you encounter CORS issues when connecting to your controller:

1. **Option 1**: Use a browser with disabled security (development only)
```bash
chrome --disable-web-security --user-data-dir=/tmp/chrome_dev
```

2. **Option 2**: Configure your controller to allow CORS

3. **Option 3**: Use a proxy server or host the app on the same network

## Development

### Project Structure
```
MXcontrol/
├── index.html          # Main application HTML
├── css/
│   └── styles.css      # Complete styling with blue gradients
├── js/
│   ├── api-client.js   # Novastar API communication layer
│   ├── ui-manager.js   # UI state and interaction management
│   ├── layer-manager.js # Layer operations and drag-drop
│   └── app.js          # Application initialization
└── README.md           # Documentation
```

### Customization

- **Colors**: Edit CSS variables in `css/styles.css`
- **API Endpoints**: Modify `js/api-client.js` for custom endpoints
- **UI Layout**: Adjust panels in `index.html`

## Troubleshooting

### Connection Issues
- Verify controller IP and port are correct
- Ensure controller is on same network
- Check firewall settings
- Try disabling CORS in browser for testing

### Layer Issues
- Refresh the screen data with the refresh button
- Check console for API errors
- Verify input sources are properly configured

### Performance
- Limit number of active layers (recommended < 20)
- Use Chrome for best performance
- Disable auto-refresh if experiencing lag

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues.

## License

MIT License - feel free to use this in your projects!

## Support

For issues or questions:
- Open an issue on GitHub
- Contact: c@connorpyle.com

## Acknowledgments

- Built for Novastar MX series controllers
- Uses Font Awesome icons
- Inspired by professional broadcast control surfaces

---

**Note**: This is an independent project and is not officially affiliated with Novastar.