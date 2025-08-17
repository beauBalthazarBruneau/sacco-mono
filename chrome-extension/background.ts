// Set up the extension icon to open the side panel when clicked
chrome.runtime.onInstalled.addListener(() => {
  // Configure the action to open the side panel when clicked
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => {
      console.error("Failed to set panel behavior:", error)
    })
})
