import type { PlasmoConfig } from "plasmo"

export const config: PlasmoConfig = {
  // Enable Vite as the bundler
  bundler: "vite",
  
  // Optional: Configure Vite options
  vite: {
    // Add any Vite-specific configurations here
    build: {
      rollupOptions: {
        output: {
          // Ensure proper chunk naming for browser extensions
          chunkFileNames: "assets/[name]-[hash].js",
          entryFileNames: "assets/[name]-[hash].js",
          assetFileNames: "assets/[name]-[hash].[ext]"
        }
      }
    }
  },
  
  // Add side panel permissions to manifest
  manifest: {
    permissions: ["sidePanel", "contextMenus"],
    side_panel: {
      default_path: "sidepanel.html"
    },
    action: {
      default_title: "Open Sacco Side Panel"
    }
  }
}
