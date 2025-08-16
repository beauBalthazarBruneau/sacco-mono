// Content script for Sacco Chrome Extension
// Use IIFE to prevent global scope pollution and duplicate initialization
(function() {
    // Use a more unique identifier to prevent conflicts
    const SACCO_ID = 'sacco_fantasy_football_extension_v1';
    
    // Check if already initialized with a more robust check
    if (window[SACCO_ID] && window[SACCO_ID].initialized) {
        console.log('[Sacco] Content script already initialized, skipping');
        return;
    }

    // Initialize the global object if it doesn't exist
    if (!window[SACCO_ID]) {
        window[SACCO_ID] = {};
    }

    // Mark as initialized immediately
    window[SACCO_ID].initialized = true;

    class ContentScript {
        constructor() {
            this.isEnabled = true;
            this.extensionId = SACCO_ID;
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

    // Initialize content script and store reference
    const contentScript = new ContentScript();
    window[SACCO_ID].contentScript = contentScript;
    
    // Also store a reference for backward compatibility
    window.saccoContentScript = contentScript;
})();
