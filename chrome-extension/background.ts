import type { PlasmoMessaging } from "@plasmohq/messaging"

// Handle messages from popup to open side panel
export const handler: PlasmoMessaging.MessageHandler<"openSidePanel"> = async (req, res) => {
  // Open the side panel
  await chrome.sidePanel.open({ windowId: req.sender.tab.windowId })
  res.send({ success: true })
}

// Initialize side panel when extension loads
chrome.runtime.onInstalled.addListener(() => {
  // Set up the side panel to open when extension icon is clicked
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
  
  // Create context menu item
  chrome.contextMenus.create({
    id: "openSidePanel",
    title: "Open Sacco Side Panel",
    contexts: ["page"]
  })
})

// Handle extension icon click to open side panel
chrome.action.onClicked.addListener(async (tab) => {
  // Open the side panel when the extension icon is clicked
  await chrome.sidePanel.open({ windowId: tab.windowId })
})

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "openSidePanel") {
    chrome.sidePanel.open({ windowId: tab.windowId })
  }
})
