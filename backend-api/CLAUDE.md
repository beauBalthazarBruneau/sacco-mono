# Backend API - AI Assistant Guide

This is the backend API component of the Sacco Fantasy Football Assistant, designed to handle custom business logic and data processing.

## 🎯 Component Overview

The backend API serves as the middleware layer between the frontend/extension and the Supabase database. Currently in early development with minimal implementation, it's designed to handle:
- Custom API endpoints for complex business logic
- Data processing and aggregation
- Third-party integrations (ESPN, FantasyPros, etc.)
- Advanced analytics and calculations
- Background jobs and scheduled tasks

## ⚠️ Current Status

**MINIMAL IMPLEMENTATION** - This component currently contains:
- Basic package.json with placeholder scripts
- TypeScript type definitions generated from Supabase
- Data processing scripts for player information
- Prototype scrapers and utilities

## 🛠️ Technology Stack

### Planned Technologies
- **Express.js 4.18.2** - Web framework
- **TypeScript 5.3.0** - Type-safe development
- **Node.js 18+** - Runtime environment

### Development Tools
- **ESLint** - Code linting
- **TypeScript ESLint** - TS-specific linting rules

### Current Dependencies
- **express**: Web framework (installed but not implemented)
- **@types/express**: TypeScript definitions
- **@types/node**: Node.js type definitions

## 📁 Project Structure

```
backend-api/
├── src/
│   └── types/
│       └── supabase.ts          # Generated Supabase types
├── scripts/                     # Data processing scripts
│   ├── scrape_espn_projections.ts
│   ├── create_global_player_pool.ts
│   ├── upload_to_supabase.ts
│   └── ...                      # Various utility scripts
├── data/                        # Raw data files
├── proto/                       # Prototype implementations
├── package.json                 # Dependencies and scripts
└── CLAUDE.md                    # This AI guide
```

## 🚀 Planned Architecture

### Express Server Structure
```
src/
├── app.ts                      # Express app configuration
├── server.ts                   # Server entry point
├── routes/
│   ├── auth.ts                 # Authentication routes
│   ├── players.ts              # Player data endpoints
│   ├── drafts.ts               # Draft management
│   └── analytics.ts            # User analytics
├── middleware/
│   ├── auth.ts                 # JWT authentication
│   ├── cors.ts                 # CORS configuration
│   └── error.ts                # Error handling
├── services/
│   ├── playerService.ts        # Player data logic
│   ├── draftService.ts         # Draft management
│   └── analyticsService.ts     # Analytics processing
├── utils/
│   ├── supabase.ts            # Supabase client
│   └── validation.ts          # Input validation
└── types/
    ├── supabase.ts            # Generated DB types
    └── api.ts                 # API-specific types
```

## 📊 Database Integration

### Supabase Types
The `src/types/supabase.ts` file contains generated TypeScript types for all database tables:

#### Key Tables
- **user_profiles**: Extended user information
- **user_preferences**: Draft settings and strategies
- **draft_sessions**: Active and completed drafts
- **draft_picks**: Individual pick tracking
- **player_rankings**: Current player rankings and ADP
- **player_stats**: Historical statistics
- **user_analytics**: Performance tracking
- **payment_history**: Subscription management

#### Custom Enums
- `subscription_tier`: Free, Basic, Premium
- `league_type`: PPR, Standard, Half-PPR, Superflex
- `draft_strategy`: Various draft approaches
- `draft_status`: Active, Completed, Cancelled
- `player_position`: QB, RB, WR, TE, K, DEF, DST

## 🔧 Current Scripts

### Data Processing Scripts

#### `scrape_espn_projections.ts`
- Scrapes player projections from ESPN
- Multiple implementation approaches (network, playwright)
- Handles different scoring systems (PPR, Standard, Half-PPR)

#### `create_global_player_pool.ts`
- Combines player data from multiple sources
- Standardizes player names and positions
- Creates unified player pool

#### `upload_to_supabase.ts`
- Uploads processed data to Supabase
- Handles batch operations
- Manages data synchronization

#### `merge_projections_by_position.ts`
- Combines projections by player position
- Calculates aggregated statistics
- Handles duplicate player entries

## 🚀 Development Commands

```bash
# Currently placeholder scripts - to be implemented

# Development server (planned)
npm run dev

# Build for production (planned)
npm run build

# Start production server (planned)
npm start

# Linting (planned)
npm run lint
npm run lint:fix

# Type checking (planned)
npm run type-check

# Testing (planned)
npm run test

# Clean build artifacts (planned)
npm run clean
```

## 🔧 Planned API Endpoints

### Authentication & User Management
```
POST   /api/auth/login           # User authentication
POST   /api/auth/logout          # Session termination
GET    /api/auth/profile         # User profile data
PUT    /api/auth/profile         # Update profile
```

### Player Data
```
GET    /api/players              # Player list with filters
GET    /api/players/:id          # Individual player data
GET    /api/players/rankings     # Current rankings
GET    /api/players/projections  # Season projections
POST   /api/players/search       # Advanced player search
```

### Draft Management
```
GET    /api/drafts               # User's draft sessions
POST   /api/drafts               # Create new draft
GET    /api/drafts/:id           # Draft session details
PUT    /api/drafts/:id           # Update draft settings
DELETE /api/drafts/:id           # Delete draft session
```

### Draft Picks
```
GET    /api/drafts/:id/picks     # Draft picks for session
POST   /api/drafts/:id/picks     # Record new pick
PUT    /api/picks/:id            # Update pick details
DELETE /api/picks/:id            # Remove pick
```

### Analytics
```
GET    /api/analytics/dashboard  # User dashboard stats
GET    /api/analytics/performance # Draft performance
GET    /api/analytics/trends     # Player trends
POST   /api/analytics/simulate   # Draft simulation
```

### Real-time Features
```
WebSocket /ws/drafts/:id         # Real-time draft updates
WebSocket /ws/notifications      # User notifications
```

## 🔐 Authentication Strategy

### JWT Token Validation
- Validate Supabase JWT tokens
- Extract user information from tokens
- Refresh token handling
- Session management

### Middleware Authentication
```typescript
// Planned implementation
import { verifySupabaseToken } from './utils/supabase'

export const authenticateToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.sendStatus(401)
  
  try {
    const user = await verifySupabaseToken(token)
    req.user = user
    next()
  } catch (error) {
    res.sendStatus(403)
  }
}
```

## 🔌 Integration Points

### Supabase Integration
- Service role connections for admin operations
- Row Level Security bypass where needed
- Direct database operations for complex queries
- Real-time subscriptions for live updates

### Frontend & Extension
- RESTful API for data operations
- WebSocket connections for real-time features
- Shared TypeScript interfaces
- Consistent error handling

### Third-party Services
- **ESPN API**: Player projections and stats
- **FantasyPros API**: Consensus rankings
- **Stripe API**: Payment processing
- **SendGrid**: Email notifications

## 📊 Data Processing Pipeline

### Player Data Pipeline
1. **Scraping**: ESPN, FantasyPros, etc.
2. **Processing**: Standardize names, positions
3. **Aggregation**: Combine multiple sources
4. **Validation**: Data quality checks
5. **Storage**: Upload to Supabase
6. **Caching**: In-memory caching for performance

### Analytics Pipeline
1. **Data Collection**: User interactions, draft picks
2. **Processing**: Calculate metrics and trends
3. **Aggregation**: Generate insights
4. **Storage**: Analytics tables in Supabase
5. **API Delivery**: Serve via analytics endpoints

## 🧪 Testing Strategy (Planned)

### Unit Testing
- Jest for test framework
- Service layer testing
- Utility function testing
- Database operation mocking

### Integration Testing
- API endpoint testing
- Database integration testing
- Third-party service mocking
- End-to-end workflow testing

### Performance Testing
- Load testing with Artillery
- Database query optimization
- Memory usage monitoring
- Response time benchmarking

## 🔧 Configuration

### Environment Variables (Planned)
```env
# Server Configuration
NODE_ENV=development
PORT=8000
API_BASE_URL=http://localhost:8000

# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_JWT_SECRET=your_jwt_secret

# Third-party APIs
ESPN_API_KEY=your_espn_api_key
FANTASYPROS_API_KEY=your_fantasypros_key

# Payment Processing
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# Email Service
SENDGRID_API_KEY=your_sendgrid_key
FROM_EMAIL=noreply@your-domain.com
```

## 🚀 Implementation Roadmap

### Phase 1: Core Infrastructure
- [x] Basic package.json setup
- [x] TypeScript configuration
- [x] Supabase type definitions
- [ ] Express server setup
- [ ] Basic middleware implementation
- [ ] Authentication middleware

### Phase 2: Data API
- [ ] Player endpoints
- [ ] Draft management endpoints
- [ ] User profile endpoints
- [ ] Error handling middleware
- [ ] Input validation

### Phase 3: Advanced Features
- [ ] Real-time WebSocket connections
- [ ] Background job processing
- [ ] Analytics endpoints
- [ ] Third-party integrations
- [ ] Caching layer

### Phase 4: Production Ready
- [ ] Comprehensive testing
- [ ] Performance optimization
- [ ] Security hardening
- [ ] Monitoring and logging
- [ ] Documentation

## 🔍 Debugging & Development

### Development Tools
- **Node.js Inspector**: Built-in debugging
- **Postman**: API endpoint testing
- **Supabase Dashboard**: Database monitoring
- **Console Logging**: Development debugging

### Common Issues (Anticipated)
- **CORS Configuration**: Frontend/extension access
- **JWT Token Validation**: Supabase token handling
- **Database Connections**: Connection pool management
- **Rate Limiting**: Third-party API limits
- **Memory Management**: Large dataset processing

## 🤖 AI Assistant Notes

### Current State Considerations
1. **Minimal Implementation**: Most functionality is planned, not implemented
2. **Placeholder Scripts**: Current package.json has echo statements
3. **Data Scripts Available**: Various processing scripts exist in `/scripts`
4. **Type Definitions Ready**: Supabase types are generated and available

### Development Priorities
1. **Basic Server Setup**: Implement Express server with middleware
2. **Authentication**: JWT validation and user management
3. **Core Endpoints**: Player data and draft management APIs
4. **Database Integration**: Service role connections to Supabase
5. **Error Handling**: Comprehensive error middleware

### Integration Considerations
- Ensure API endpoints match frontend/extension expectations
- Maintain TypeScript type consistency across components
- Implement proper CORS for cross-origin requests
- Plan for real-time features via WebSockets
- Consider caching strategies for performance

---

*This backend API will provide custom business logic and advanced features for the Sacco Fantasy Football Assistant once fully implemented.*
