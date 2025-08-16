// Popup script for Sacco Chrome Extension
class PopupManager {
    constructor() {
        this.isEnabled = false;
        this.init();
    }

    async init() {
        await this.loadState();
        this.setupEventListeners();
        this.updateUI();
    }

    async loadState() {
        try {
            const result = await chrome.storage.local.get(['saccoEnabled']);
            this.isEnabled = result.saccoEnabled !== undefined ? result.saccoEnabled : true;
        } catch (error) {
            console.error('Error loading state:', error);
            this.isEnabled = true; // Default to enabled
        }
    }

    async saveState() {
        try {
            await chrome.storage.local.set({ saccoEnabled: this.isEnabled });
        } catch (error) {
            console.error('Error saving state:', error);
        }
    }

    setupEventListeners() {
        // Toggle button
        const toggleBtn = document.getElementById('toggleBtn');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggleExtension());
        }

        // Settings button
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.openSettings());
        }

        // Footer links
        const helpLink = document.getElementById('helpLink');
        if (helpLink) {
            helpLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.openHelp();
            });
        }

        const aboutLink = document.getElementById('aboutLink');
        if (aboutLink) {
            aboutLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.openAbout();
            });
        }
    }

    async toggleExtension() {
        this.isEnabled = !this.isEnabled;
        await this.saveState();
        this.updateUI();
        
        // Notify background script
        try {
            await chrome.runtime.sendMessage({
                action: 'toggleExtension',
                enabled: this.isEnabled
            });
        } catch (error) {
            console.error('Error sending message to background:', error);
        }

        // Update content scripts on current tab
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab) {
                await chrome.tabs.sendMessage(tab.id, {
                    action: 'toggleExtension',
                    enabled: this.isEnabled
                });
            }
        } catch (error) {
            console.error('Error updating content script:', error);
        }
    }

    updateUI() {
        const toggleBtn = document.getElementById('toggleBtn');
        const statusDot = document.querySelector('.status-dot');
        const statusText = document.querySelector('.status-text');
        const btnText = document.querySelector('.btn-text');

        if (toggleBtn && statusDot && statusText && btnText) {
            if (this.isEnabled) {
                statusDot.classList.add('active');
                statusText.textContent = 'Active';
                btnText.textContent = 'Disable';
                toggleBtn.classList.remove('btn-danger');
                toggleBtn.classList.add('btn-primary');
            } else {
                statusDot.classList.remove('active');
                statusText.textContent = 'Inactive';
                btnText.textContent = 'Enable';
                toggleBtn.classList.remove('btn-primary');
                toggleBtn.classList.add('btn-danger');
            }
        }
    }

    openSettings() {
        chrome.runtime.openOptionsPage();
    }

    openHelp() {
        chrome.tabs.create({
            url: 'https://github.com/your-repo/sacco#readme'
        });
    }

    openAbout() {
        chrome.tabs.create({
            url: 'https://github.com/your-repo/sacco'
        });
    }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PopupManager();
});

// Handle messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'updateStatus') {
        // Update status if needed
        console.log('Status update received:', message);
    }
});
