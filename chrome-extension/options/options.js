// Options page script for Sacco Chrome Extension
class OptionsManager {
    constructor() {
        this.defaultSettings = {
            saccoEnabled: true,
            autoStart: false,
            theme: 'auto',
            notifications: 'all',
            debugMode: false
        };
        this.init();
    }

    async init() {
        await this.loadSettings();
        this.setupEventListeners();
        this.showStatus('Settings loaded successfully', 'success');
    }

    async loadSettings() {
        try {
            const result = await chrome.storage.sync.get(this.defaultSettings);
            
            // Apply settings to form elements
            document.getElementById('enableExtension').checked = result.saccoEnabled;
            document.getElementById('autoStart').checked = result.autoStart;
            document.getElementById('themeSelect').value = result.theme;
            document.getElementById('notificationsSelect').value = result.notifications;
            document.getElementById('debugMode').checked = result.debugMode;
            
            this.log('Settings loaded from storage');
        } catch (error) {
            console.error('Error loading settings:', error);
            this.showStatus('Error loading settings', 'error');
        }
    }

    async saveSettings() {
        try {
            const settings = {
                saccoEnabled: document.getElementById('enableExtension').checked,
                autoStart: document.getElementById('autoStart').checked,
                theme: document.getElementById('themeSelect').value,
                notifications: document.getElementById('notificationsSelect').value,
                debugMode: document.getElementById('debugMode').checked
            };

            await chrome.storage.sync.set(settings);
            
            // Notify background script of settings change
            await chrome.runtime.sendMessage({
                action: 'settingsUpdated',
                settings: settings
            });

            this.log('Settings saved successfully');
            this.showStatus('Settings saved successfully!', 'success');
            
            // Auto-hide success message after 3 seconds
            setTimeout(() => {
                this.hideStatus();
            }, 3000);
            
        } catch (error) {
            console.error('Error saving settings:', error);
            this.showStatus('Error saving settings', 'error');
        }
    }

    async resetSettings() {
        try {
            await chrome.storage.sync.clear();
            await chrome.storage.sync.set(this.defaultSettings);
            
            // Reload the form with default values
            await this.loadSettings();
            
            this.log('Settings reset to defaults');
            this.showStatus('Settings reset to defaults', 'info');
            
            // Auto-hide info message after 3 seconds
            setTimeout(() => {
                this.hideStatus();
            }, 3000);
            
        } catch (error) {
            console.error('Error resetting settings:', error);
            this.showStatus('Error resetting settings', 'error');
        }
    }

    setupEventListeners() {
        // Form submission
        const form = document.getElementById('settingsForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveSettings();
            });
        }

        // Reset button
        const resetBtn = document.getElementById('resetSettings');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to reset all settings to defaults?')) {
                    this.resetSettings();
                }
            });
        }

        // Cancel button
        const cancelBtn = document.getElementById('cancelBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                window.close();
            });
        }

        // Auto-save on change (optional)
        const formElements = form.querySelectorAll('input, select');
        formElements.forEach(element => {
            element.addEventListener('change', () => {
                // Auto-save after a short delay
                clearTimeout(this.autoSaveTimeout);
                this.autoSaveTimeout = setTimeout(() => {
                    this.saveSettings();
                }, 1000);
            });
        });
    }

    showStatus(message, type = 'info') {
        // Remove existing status messages
        this.hideStatus();
        
        // Create new status message
        const statusDiv = document.createElement('div');
        statusDiv.className = `status-message ${type}`;
        statusDiv.textContent = message;
        statusDiv.id = 'statusMessage';
        
        // Insert at the top of the form
        const form = document.getElementById('settingsForm');
        form.insertBefore(statusDiv, form.firstChild);
    }

    hideStatus() {
        const statusMessage = document.getElementById('statusMessage');
        if (statusMessage) {
            statusMessage.remove();
        }
    }

    log(message) {
        if (this.defaultSettings.debugMode) {
            console.log(`[Sacco Options] ${message}`);
        }
    }

    // Utility methods
    async getCurrentSettings() {
        return await chrome.storage.sync.get(this.defaultSettings);
    }

    async exportSettings() {
        const settings = await this.getCurrentSettings();
        const dataStr = JSON.stringify(settings, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = 'sacco-settings.json';
        link.click();
    }

    async importSettings(file) {
        try {
            const text = await file.text();
            const settings = JSON.parse(text);
            
            // Validate settings
            const validSettings = {};
            for (const [key, defaultValue] of Object.entries(this.defaultSettings)) {
                validSettings[key] = settings[key] !== undefined ? settings[key] : defaultValue;
            }
            
            await chrome.storage.sync.set(validSettings);
            await this.loadSettings();
            
            this.showStatus('Settings imported successfully', 'success');
        } catch (error) {
            console.error('Error importing settings:', error);
            this.showStatus('Error importing settings', 'error');
        }
    }
}

// Initialize options page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new OptionsManager();
});

// Handle messages from other parts of the extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'updateSettings') {
        // Reload settings if requested
        window.location.reload();
    }
});
