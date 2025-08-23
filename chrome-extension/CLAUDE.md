# Chrome Extension - AI Assistant Guide

This is the Chrome extension component of the Sacco Fantasy Football Assistant, providing browser-based draft assistance and real-time data integration.

## 🎯 Component Overview

The Chrome extension serves as the primary interface for fantasy football draft assistance directly in the browser. It provides:
- Side panel interface for draft assistance
- Real-time player recommendations
- Integration with fantasy football platforms
- User authentication and profile management
- Seamless data synchronization with web app

## 🛠️ Technology Stack

### Core Technologies
- **Plasmo Framework 0.90.5** - Modern Chrome extension development
- **React 18.2.0** - Component-based UI framework
- **TypeScript 5.3.3** - Type-safe development
- **Manifest V3** - Latest Chrome extension API

### UI & Styling
- **Mantine Core 7.0.0** - React component library
- **Mantine Hooks 7.0.0** - Utility hooks
- **Mantine Form 7.0.0** - Form handling
- **Mantine Notifications 7.0.0** - Toast notifications
- **Tabler Icons React 2.47.0** - Icon library

### Backend Integration
- **Supabase JS 2.39.0** - Database, auth, and real-time features
- **Plasmo Messaging 0.7.2** - Extension messaging system

### Development Tools
- **Vite 7.1.3** - Build tool and dev server (as alternative)
- **Prettier** - Code formatting
- **TypeScript** - Type checking

## 📁 Project Structure

```
chrome-extension/
├── components/
│   ├── Login.tsx               # Authentication component
│   └── UserProfile.tsx         # User dashboard component
├── contexts/
│   └── AuthContext.tsx         # Global authentication state
├── hooks/
│   └── useAuth.ts             # Authentication hook
├── lib/                       # Utility libraries
├── config/                    # Configuration files
├── assets/                    # Static assets (icons, images)
├── background.ts              # Background script (service worker)
├── content.ts                # Content script
├── sidepanel.tsx             # Side panel entry point
├── sidepanel.css             # Side panel styling
├── plasmo.config.ts          # Plasmo configuration
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── README.md                 # Basic usage documentation
├── AUTHENTICATION_SETUP.md   # Auth setup guide
├── SETUP_API_KEY.md          # API configuration
└── CLAUDE.md                 # This AI guide
```

## 🚀 Development Commands

```bash
# Start development server
npm run dev
# or with pnpm
pnpm dev

# Build for production
npm run build
# or with pnpm
pnpm build

# Package extension for distribution
npm run package
# or with pnpm
pnpm package

# Alternative Vite commands
npm run vite:dev      # Vite dev server
npm run vite:build    # Vite build
npm run vite:preview  # Preview build
```

## 📱 Extension Architecture

### Manifest V3 Configuration
```json
{
  "manifest_version": 3,
  "permissions": [
    "sidePanel",
    "windows", 
    "contextMenus",
    "storage"
  ],
  "host_permissions": ["https://*/*"],
  "side_panel": {
    "default_path": "sidepanel.html"
  },
  "action": {
    "default_title": "Sacco Fantasy Football Assistant"
  }
}
```

### Core Components

#### Background Script (`background.ts`)
- Service worker for Manifest V3
- Handles extension icon clicks
- Manages side panel opening
- Creates context menu items
- Handles inter-component messaging

#### Side Panel (`sidepanel.tsx`)
- Main extension interface
- Authentication flow management
- User profile display
- Draft assistance tools
- Mantine Provider wrapper

#### Content Scripts (`content.ts`)
- Page interaction logic
- DOM manipulation for draft sites
- Data extraction from fantasy platforms
- Real-time page monitoring

### Authentication Flow

#### Login Component (`components/Login.tsx`)
- Email-based authentication
- Magic link integration via Supabase
- Loading states and error handling
- Consistent UI with web app

#### Auth Context (`contexts/AuthContext.tsx`)
- Global authentication state
- Session persistence in Chrome storage
- Automatic token refresh
- User session management

#### Auth Hook (`hooks/useAuth.ts`)
- Simplified auth state access
- Login/logout functionality
- User data retrieval
- Loading and error states

## 🔐 Authentication & Security

### Supabase Integration
- Magic link authentication
- JWT token storage in Chrome storage
- Automatic session refresh
- Row Level Security compliance

### Chrome Storage
```typescript
// Example auth state persistence
chrome.storage.local.set({
  'supabase.auth.token': session.access_token,
  'supabase.auth.expires_at': session.expires_at
})
```

### Security Features
- Content Security Policy (CSP) compliance
- Secure token handling
- HTTPS-only communication
- Minimal permissions requested

## 🎮 Draft Platform Integration

### Supported Platforms
- ESPN Fantasy Football
- Yahoo Fantasy Sports
- NFL.com Fantasy
- Sleeper (planned)
- Other platforms via content scripts

### Data Extraction
- Player information parsing
- Draft board state monitoring
- Pick timing detection
- League settings recognition

### Real-time Features
- Live draft updates
- Player recommendations
- ADP comparisons
- Tier-based suggestions

## 🎨 UI/UX Design

### Side Panel Interface
- Compact, efficient layout
- Consistent with Mantine design system
- Dark mode support
- Responsive to different screen sizes

### Key UI Elements
- **Header**: User profile and settings
- **Draft Board**: Current pick visualization
- **Recommendations**: Player suggestions
- **Analytics**: Draft performance metrics
- **Settings**: User preferences

### Component Patterns
```typescript
// Example component structure
function DraftAssistant() {
  const { user, loading } = useAuth()
  
  if (loading) return <Loader />
  if (!user) return <Login />
  
  return (
    <Stack>
      <Header user={user} />
      <DraftBoard />
      <PlayerRecommendations />
      <Analytics />
    </Stack>
  )
}
```

## 🔧 Plasmo Framework Features

### File-based Routing
- `sidepanel.tsx` → Side panel interface
- `background.ts` → Background service worker
- `content.ts` → Content scripts
- `popup.tsx` → Extension popup (if needed)

### Messaging System
```typescript
// Background to side panel communication
import { sendToBackground } from "@plasmohq/messaging"

const response = await sendToBackground({
  name: "getDraftData",
  body: { draftId: "123" }
})
```

### Auto-reload Development
- Hot module replacement
- Automatic extension reload
- Live updates during development
- Source map support for debugging

## 📊 Data Management

### Local Storage Strategy
- Chrome storage for extension data
- Supabase for persistent user data
- Caching for performance optimization
- Offline functionality planning

### Data Synchronization
```typescript
// Example sync pattern
const syncUserData = async () => {
  const localData = await chrome.storage.local.get(['userPreferences'])
  const remoteData = await supabase.from('user_preferences').select()
  
  // Merge and resolve conflicts
  const mergedData = mergeData(localData, remoteData)
  
  // Update both stores
  await chrome.storage.local.set(mergedData)
  await supabase.from('user_preferences').upsert(mergedData)
}
```

### Real-time Updates
- Supabase real-time subscriptions
- WebSocket connections for live data
- Cross-tab synchronization
- Background sync capabilities

## 🧪 Development Guidelines

### Code Organization
- Components in `/components` directory
- Hooks in `/hooks` directory
- Contexts in `/contexts` directory
- Utilities in `/lib` directory

### TypeScript Patterns
- Strict type checking enabled
- Chrome APIs type definitions
- Supabase generated types
- Custom extension types

### Error Handling
```typescript
// Extension-specific error handling
try {
  const result = await chrome.sidePanel.open({ windowId })
} catch (error) {
  console.error('Failed to open side panel:', error)
  // Fallback or user notification
}
```

### Performance Optimization
- Lazy loading for components
- Efficient Chrome storage usage
- Minimal background script activity
- Optimized content script injection

## 🔍 Debugging & Testing

### Development Tools
- Chrome DevTools for extension debugging
- Plasmo development server
- Console logging in different contexts
- Network monitoring for API calls

### Extension Debugging
```bash
# Access different extension contexts
chrome://extensions/ → Developer mode → Inspect views

# Background script console
Service Worker → Inspect

# Side panel console  
Side panel → Right-click → Inspect

# Content script console
Page → DevTools → Console
```

### Common Debugging Scenarios
- **Permission Issues**: Check manifest.json permissions
- **Storage Problems**: Verify Chrome storage API usage
- **Authentication Errors**: Debug Supabase token handling
- **Content Script Issues**: Check injection and DOM access

## 📦 Build & Distribution

### Development Build
```bash
# Creates build/chrome-mv3-dev
npm run dev

# Load in Chrome
# 1. Go to chrome://extensions/
# 2. Enable Developer mode
# 3. Click "Load unpacked"
# 4. Select build/chrome-mv3-dev
```

### Production Build
```bash
# Creates optimized build
npm run build

# Package for Chrome Web Store
npm run package
```

### Distribution Options
- **Chrome Web Store**: Official distribution
- **Manual Installation**: Enterprise deployment
- **Developer Mode**: Testing and development

## 🔌 Integration Points

### Web Application
- Shared authentication via Supabase
- Synchronized user preferences
- Consistent data across platforms
- Real-time draft updates

### Backend API
- Future custom endpoint integration
- Advanced analytics processing
- Third-party data enrichment
- Custom business logic

### Fantasy Platforms
- Content script integration
- DOM manipulation and data extraction
- Platform-specific adaptation
- Real-time draft monitoring

## 🎯 Key Features Implementation

### Draft Assistance
- **Player Rankings**: Real-time ADP and tier data
- **Recommendations**: Context-aware suggestions
- **Analytics**: Performance tracking and insights
- **Alerts**: Important draft events and opportunities

### User Experience
- **Seamless Auth**: One-click login via magic links
- **Responsive Design**: Adaptive to side panel constraints
- **Real-time Updates**: Live data synchronization
- **Offline Support**: Cached data for connectivity issues

### Platform Integration
- **Auto-detection**: Recognize fantasy football sites
- **Data Extraction**: Parse draft boards and player lists
- **Injection**: Add assistance UI to existing pages
- **Compatibility**: Work across different fantasy platforms

## 🤖 AI Assistant Notes

### Development Patterns
1. **Plasmo Framework**: Leverage file-based architecture
2. **Manifest V3**: Use service workers instead of background pages
3. **Mantine UI**: Maintain consistency with web app design
4. **Type Safety**: Full TypeScript integration throughout
5. **Chrome APIs**: Proper permission handling and API usage

### Common Tasks
- **Adding Components**: Create in `/components` with proper imports
- **Extension Permissions**: Update manifest.json for new APIs
- **Storage Operations**: Use Chrome storage API for persistence
- **Messaging**: Implement communication between extension parts
- **Content Scripts**: Add page interaction capabilities

### Testing Considerations
- **Multi-context Testing**: Background, content, and side panel
- **Permission Testing**: Verify all required permissions work
- **Platform Compatibility**: Test across different fantasy sites
- **Performance Testing**: Monitor extension impact on browsing
- **Update Testing**: Verify extension updates work properly

### Security Considerations
- **Minimal Permissions**: Request only necessary permissions
- **Content Security**: Proper CSP implementation
- **Token Security**: Secure handling of authentication tokens
- **HTTPS Only**: Ensure all communications are secure
- **Data Privacy**: Respect user data and privacy requirements

---

*This Chrome extension provides seamless fantasy football draft assistance directly in the browser, integrating with the Sacco ecosystem for a comprehensive user experience.*
