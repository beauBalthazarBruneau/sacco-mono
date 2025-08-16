# Sacco Monorepo

A comprehensive web application with Chrome extension, React frontend, and backend API.

## 🏗️ Project Structure

```
sacco/
├── chrome-extension/     # Chrome extension (Manifest V3)
├── react-frontend/       # React web application
├── backend-api/          # Backend API server
├── package.json          # Root monorepo configuration
└── README.md            # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)
- Google Chrome browser

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-repo/sacco.git
   cd sacco
   ```

2. **Install all dependencies**
   ```bash
   npm run install:all
   ```

3. **Start all services in development mode**
   ```bash
   npm run dev
   ```

This will start:
- Chrome extension development server
- React frontend (typically on http://localhost:3000)
- Backend API server (typically on http://localhost:8000)

## 📁 Individual Components

### Chrome Extension
- **Location**: `chrome-extension/`
- **Technology**: Manifest V3, Vanilla JavaScript
- **Development**: `npm run dev:extension`
- **Build**: `npm run build:extension`

### React Frontend
- **Location**: `react-frontend/`
- **Technology**: React, TypeScript, Vite
- **Development**: `npm run dev:frontend`
- **Build**: `npm run build:frontend`

### Backend API
- **Location**: `backend-api/`
- **Technology**: Node.js, Express, TypeScript
- **Development**: `npm run dev:backend`
- **Build**: `npm run build:backend`

## 🛠️ Development

### Available Scripts

#### Root Level (Monorepo)
- `npm run dev` - Start all services in development mode
- `npm run build` - Build all components
- `npm run test` - Run tests for all components
- `npm run lint` - Lint all components
- `npm run clean` - Clean all build artifacts

#### Individual Components
- `npm run dev:extension` - Start Chrome extension development
- `npm run dev:frontend` - Start React frontend development
- `npm run dev:backend` - Start backend API development

### Development Workflow

1. **Start development**
   ```bash
   npm run dev
   ```

2. **Make changes** to any component

3. **Hot reload** will automatically update the relevant service

4. **Test changes** across all components

### Environment Configuration

Each component has its own environment configuration:
- `chrome-extension/.env` - Extension-specific settings
- `react-frontend/.env` - Frontend environment variables
- `backend-api/.env` - Backend environment variables

## 🔧 Configuration

### Chrome Extension
- Load the `chrome-extension/dist/` folder in Chrome extensions page
- Enable developer mode in Chrome
- Extension will be available in the browser toolbar

### React Frontend
- Runs on http://localhost:3000 by default
- Hot module replacement enabled
- TypeScript support with strict mode

### Backend API
- Runs on http://localhost:8000 by default
- RESTful API endpoints
- Database integration ready

## 🧪 Testing

### Run all tests
```bash
npm run test
```

### Run tests for specific component
```bash
npm run test --workspace=react-frontend
npm run test --workspace=backend-api
```

## 📦 Building for Production

### Build all components
```bash
npm run build
```

### Build specific component
```bash
npm run build:extension
npm run build:frontend
npm run build:backend
```

## 🚀 Deployment

### Chrome Extension
1. Build the extension: `npm run build:extension`
2. Package for Chrome Web Store: `npm run zip --workspace=chrome-extension`
3. Upload to Chrome Developer Dashboard

### React Frontend
1. Build the frontend: `npm run build:frontend`
2. Deploy the `react-frontend/dist/` folder to your hosting service

### Backend API
1. Build the backend: `npm run build:backend`
2. Deploy to your server or cloud platform

## 🔗 Component Communication

### Frontend ↔ Backend
- RESTful API calls
- WebSocket connections for real-time features
- Shared TypeScript interfaces

### Extension ↔ Backend
- API calls for data synchronization
- Message passing for real-time updates

### Extension ↔ Frontend
- Shared authentication tokens
- Data synchronization via backend

## 🐛 Debugging

### Chrome Extension
- Check console in popup window (right-click → Inspect)
- Check browser console on web pages
- Check extension background page console

### React Frontend
- Browser developer tools
- React Developer Tools extension
- Console logs in browser

### Backend API
- Server console logs
- API testing with tools like Postman
- Database query logs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test all components
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- Create an issue on GitHub
- Check component-specific documentation
- Review the development guides

## 🔗 Resources

- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)
- [React Documentation](https://react.dev/)
- [Node.js Documentation](https://nodejs.org/docs/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
