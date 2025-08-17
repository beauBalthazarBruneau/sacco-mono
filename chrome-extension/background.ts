import { supabase } from "./lib/supabase"

// Listen for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  console.log("Auth state changed:", event, session?.user?.email)
  
  // Update extension badge based on auth status
  if (session) {
    chrome.action.setBadgeText({ text: "✓" })
    chrome.action.setBadgeBackgroundColor({ color: "#28a745" })
  } else {
    chrome.action.setBadgeText({ text: "" })
  }
  
  // Store auth state in chrome storage for popup access
  chrome.storage.local.set({ 
    authState: { 
      isAuthenticated: !!session, 
      user: session?.user || null 
    } 
  })
})

// Handle extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log("Sacco extension installed")
  
  // Check initial auth status
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session) {
      chrome.action.setBadgeText({ text: "✓" })
      chrome.action.setBadgeBackgroundColor({ color: "#28a745" })
    }
  })
})

// Handle messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "GET_AUTH_STATUS") {
    supabase.auth.getSession().then(({ data: { session } }) => {
      sendResponse({ 
        isAuthenticated: !!session, 
        user: session?.user || null 
      })
    })
    return true // Keep message channel open for async response
  }
})
