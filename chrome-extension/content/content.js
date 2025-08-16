// Content script for Sacco Chrome Extension
class ContentScript {
    constructor() {
        this.isEnabled = true;
        this.init();
    }

    async init() {
        await this.loadState();
        this.setupMessageListener();
        this.setupMutationObserver();
        this.log('Content script initialized');
    }

    async loadState() {
        try {
            const result = await chrome.storage.local.get(['saccoEnabled']);
            this.isEnabled = result.saccoEnabled !== undefined ? result.saccoEnabled : true;
        } catch (error) {
            console.error('Error loading state in content script:', error);
            this.isEnabled = true; // Default to enabled
        }
    }

    setupMessageListener() {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            switch (message.action) {
                case 'toggleExtension':
                    this.isEnabled = message.enabled;
                    this.onToggleChange();
                    break;
                case 'getStatus':
                    sendResponse({ enabled: this.isEnabled });
                    break;
                default:
                    console.log('Unknown message received:', message);
            }
        });
    }

    setupMutationObserver() {
        // Watch for DOM changes to apply Sacco functionality
        const observer = new MutationObserver((mutations) => {
            if (!this.isEnabled) return;
            
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            this.processNewElements(node);
                        }
                    });
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    processNewElements(element) {
        // Process new elements added to the DOM
        // This is where Sacco-specific functionality will be implemented
        if (element.tagName) {
            this.log(`New element detected: ${element.tagName}`);
        }
    }

    onToggleChange() {
        if (this.isEnabled) {
            this.enable();
        } else {
            this.disable();
        }
    }

    enable() {
        this.log('Sacco enabled on this page');
        // Add any enable-specific functionality here
        document.body.classList.add('sacco-enabled');
    }

    disable() {
        this.log('Sacco disabled on this page');
        // Add any disable-specific functionality here
        document.body.classList.remove('sacco-enabled');
    }

    log(message) {
        console.log(`[Sacco] ${message}`);
    }

    // Utility methods for future functionality
    getPageInfo() {
        return {
            url: window.location.href,
            title: document.title,
            domain: window.location.hostname,
            timestamp: Date.now()
        };
    }

    injectStyles() {
        // Inject any necessary styles
        const style = document.createElement('style');
        style.textContent = `
            .sacco-enabled {
                /* Sacco-specific styles */
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize content script
const contentScript = new ContentScript();

// Expose to window for debugging (development only)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.saccoContentScript = contentScript;
}
