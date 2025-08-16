# Sacco Chrome Extension

A Chrome extension built with Manifest V3 for enhanced browsing experience.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- Google Chrome browser

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-repo/sacco.git
   cd sacco
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the extension**
   ```bash
   npm run dev
   ```

4. **Load in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `dist/` folder from this project

## 📁 Project Structure

```
sacco/
├── manifest.json          # Extension manifest (Manifest V3)
├── popup/                 # Extension popup interface
│   ├── popup.html        # Popup HTML
│   ├── popup.css         # Popup styles
│   └── popup.js          # Popup functionality
├── content/              # Content scripts
│   ├── content.js        # Main content script
│   └── content.css       # Content script styles
├── background/           # Background service worker
│   └── background.js     # Background script
├── icons/                # Extension icons
│   ├── icon16.png        # 16x16 icon
│   ├── icon32.png        # 32x32 icon
│   ├── icon48.png        # 48x48 icon
│   └── icon128.png       # 128x128 icon
├── dist/                 # Built extension (generated)
├── package.json          # Build scripts and dependencies
└── README.md            # This file
```

## 🛠️ Development

### Available Scripts

- `npm run dev` - Build for development and load in Chrome
- `npm run build:dev` - Build development version
- `npm run build:prod` - Build production version
- `npm run watch` - Watch for changes and rebuild automatically
- `npm run clean` - Clean build directory
- `npm run zip` - Create production zip file

### Development Workflow

1. **Start development**
   ```bash
   npm run watch
   ```

2. **Make changes** to files in `popup/`, `content/`, or `background/`

3. **Reload extension** in Chrome extensions page

4. **Test changes** by clicking the extension icon

### File Structure Guidelines

- **Popup**: User interface that appears when clicking the extension icon
- **Content Scripts**: Run on web pages to interact with page content
- **Background**: Service worker that handles extension lifecycle and messaging
- **Icons**: Extension icons in various sizes (replace placeholder files)

## 🔧 Configuration

### Manifest Permissions

The extension uses the following permissions:
- `activeTab` - Access to the currently active tab
- `storage` - Store extension settings
- `scripting` - Inject scripts into pages

### Host Permissions

- `http://*/*` - Access to HTTP sites
- `https://*/*` - Access to HTTPS sites

## 🎨 Customization

### Styling
- Modify `popup/popup.css` for popup appearance
- Modify `content/content.css` for content script styles

### Functionality
- Edit `popup/popup.js` for popup behavior
- Edit `content/content.js` for page interactions
- Edit `background/background.js` for background processes

### Icons
Replace the placeholder icon files in `icons/` with your own:
- `icon16.png` (16x16)
- `icon32.png` (32x32)
- `icon48.png` (48x48)
- `icon128.png` (128x128)

## 📦 Building for Production

1. **Create production build**
   ```bash
   npm run build:prod
   ```

2. **Package extension**
   ```bash
   npm run zip
   ```

3. **Upload to Chrome Web Store** (optional)
   - Go to [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
   - Upload the generated `sacco-extension.zip` file

## 🐛 Debugging

### Console Logs
- **Popup**: Check console in popup window (right-click → Inspect)
- **Content Scripts**: Check browser console on web pages
- **Background**: Check console in extension background page

### Common Issues

1. **Extension not loading**
   - Check manifest.json syntax
   - Verify all referenced files exist
   - Check Chrome extension errors page

2. **Content script not working**
   - Verify content script is injected
   - Check for JavaScript errors in console
   - Ensure permissions are correct

3. **Popup not appearing**
   - Check popup.html syntax
   - Verify popup.js is loading
   - Check for CSS conflicts

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- Create an issue on GitHub
- Check the documentation
- Review Chrome Extension documentation

## 🔗 Resources

- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Guide](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Chrome Extension APIs](https://developer.chrome.com/docs/extensions/reference/)
