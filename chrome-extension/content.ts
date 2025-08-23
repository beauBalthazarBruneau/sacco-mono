import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}

// This content script runs on all web pages
// You can add page-specific functionality here if needed
console.log("Sacco extension content script loaded")
