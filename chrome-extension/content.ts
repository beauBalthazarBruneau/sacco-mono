// Content script for future ESPN fantasy football page reading
// This will be activated only when user grants permission

console.log("Sacco content script loaded")

// Listen for messages from popup or background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "READ_ESPN_PAGE") {
    // Future functionality: Read ESPN fantasy football page data
    const pageData = {
      url: window.location.href,
      title: document.title,
      timestamp: new Date().toISOString()
    }
    
    // For now, just return basic page info
    // Later this will extract fantasy football specific data
    sendResponse({ success: true, data: pageData })
  }
})

// Check if we're on an ESPN fantasy football page
const isESPNFantasyPage = () => {
  return window.location.hostname.includes('espn.com') && 
         window.location.pathname.includes('fantasy')
}

// Log when on ESPN fantasy pages (for debugging)
if (isESPNFantasyPage()) {
  console.log("Sacco: ESPN fantasy page detected")
}
