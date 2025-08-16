// Background service worker for Sacco Chrome Extension
class BackgroundService {
    constructor() {
        this.isEnabled = true;
        this.init();
    }

    async init() {
        await this.loadState();
        this.setupMessageListeners();
        this.setupTabListeners();
        this.log('Background service initialized');
    }

    async loadState() {
        try {
            const result = await chrome.storage.local.get(['saccoEnabled']);
            this.isEnabled = result.saccoEnabled !== undefined ? result.saccoEnabled : true;
        } catch (error) {
            console.error('Error loading state in background:', error);
            this.isEnabled = true; // Default to enabled
        }
    }

    async saveState() {
        try {
            await chrome.storage.local.set({ saccoEnabled: this.isEnabled });
        } catch (error) {
            console.error('Error saving state in background:', error);
        }
    }

    setupMessageListeners() {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            this.handleMessage(message, sender, sendResponse);
            return true; // Keep message channel open for async responses
        });
    }

    setupTabListeners() {
        // Listen for tab updates
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            if (changeInfo.status === 'complete' && tab.url) {
                this.onTabUpdated(tabId, tab);
            }
        });

        // Listen for tab activation
        chrome.tabs.onActivated.addListener((activeInfo) => {
            this.onTabActivated(activeInfo);
        });
    }

    async handleMessage(message, sender, sendResponse) {
        try {
            switch (message.action) {
                case 'toggleExtension':
                    await this.toggleExtension(message.enabled);
                    sendResponse({ success: true });
                    break;

                case 'getStatus':
                    sendResponse({ enabled: this.isEnabled });
                    break;

                case 'getTabInfo':
                    const tabInfo = await this.getTabInfo(sender.tab?.id);
                    sendResponse(tabInfo);
                    break;

                case 'executeScript':
                    await this.executeScript(sender.tab?.id, message.script);
                    sendResponse({ success: true });
                    break;

                default:
                    console.log('Unknown message received:', message);
                    sendResponse({ error: 'Unknown action' });
            }
        } catch (error) {
            console.error('Error handling message:', error);
            sendResponse({ error: error.message });
        }
    }

    async toggleExtension(enabled) {
        this.isEnabled = enabled;
        await this.saveState();
        
        // Update all tabs
        const tabs = await chrome.tabs.query({});
        for (const tab of tabs) {
            try {
                await chrome.tabs.sendMessage(tab.id, {
                    action: 'toggleExtension',
                    enabled: this.isEnabled
                });
            } catch (error) {
                // Tab might not have content script loaded yet
                console.log(`Could not update tab ${tab.id}:`, error.message);
            }
        }

        this.log(`Extension ${this.isEnabled ? 'enabled' : 'disabled'}`);
    }

    async onTabUpdated(tabId, tab) {
        if (!this.isEnabled) return;

        try {
            // Inject content script if needed
            await chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: ['content/content.js']
            });

            // Inject CSS if needed
            await chrome.scripting.insertCSS({
                target: { tabId: tabId },
                files: ['content/content.css']
            });

            this.log(`Content script injected into tab ${tabId}`);
        } catch (error) {
            console.error(`Error injecting scripts into tab ${tabId}:`, error);
        }
    }

    async onTabActivated(activeInfo) {
        // Handle tab activation if needed
        this.log(`Tab ${activeInfo.tabId} activated`);
    }

    async getTabInfo(tabId) {
        if (!tabId) return null;

        try {
            const tab = await chrome.tabs.get(tabId);
            return {
                id: tab.id,
                url: tab.url,
                title: tab.title,
                active: tab.active
            };
        } catch (error) {
            console.error('Error getting tab info:', error);
            return null;
        }
    }

    async executeScript(tabId, script) {
        if (!tabId) return;

        try {
            await chrome.scripting.executeScript({
                target: { tabId: tabId },
                func: (scriptCode) => {
                    // Execute the script in the context of the page
                    eval(scriptCode);
                },
                args: [script]
            });
        } catch (error) {
            console.error('Error executing script:', error);
        }
    }

    log(message) {
        console.log(`[Sacco Background] ${message}`);
    }

    // Utility methods
    async getAllTabs() {
        return await chrome.tabs.query({});
    }

    async getCurrentTab() {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        return tab;
    }

    async sendMessageToTab(tabId, message) {
        try {
            return await chrome.tabs.sendMessage(tabId, message);
        } catch (error) {
            console.error(`Error sending message to tab ${tabId}:`, error);
            return null;
        }
    }
}

// Initialize background service
const backgroundService = new BackgroundService();

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        console.log('Sacco extension installed');
        // Set default settings
        chrome.storage.local.set({
            saccoEnabled: true,
            version: '1.0.0'
        });
    } else if (details.reason === 'update') {
        console.log('Sacco extension updated');
    }
});

// Handle extension startup
chrome.runtime.onStartup.addListener(() => {
    console.log('Sacco extension started');
});
