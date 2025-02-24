# LIBRAlab Tech Stack Documentation

## Core Services

### 1. Hosting & Analytics (Vercel)
- **Purpose**: Application hosting and performance analytics
- **Features**:
  - Zero-configuration deployment
  - Built-in analytics
  - Automatic HTTPS
  - Edge network distribution
- **Setup Required**:
  - Vercel account creation
  - GitHub repository connection
  - Environment variables configuration

### 2. Database (Supabase)
- **Purpose**: Data storage and real-time updates
- **Features**:
  - PostgreSQL database
  - Real-time subscriptions
  - Row level security
  - Built-in authentication
- **Setup Required**:
  - Supabase project creation
  - Database schema design
  - API keys configuration
  - Row level security policies

### 3. Authentication (NextAuth.js)
- **Purpose**: User authentication and session management
- **Features**:
  - Multiple authentication providers
  - JWT sessions
  - Custom login pages
  - Secure by default
- **Implementation**:
  - OAuth provider setup
  - Custom session handling
  - Protected API routes
  - User profile management

### 4. API Management (Next.js API Routes)
- **Purpose**: Backend API functionality
- **Features**:
  - Serverless functions
  - API route handlers
  - Middleware support
  - TypeScript integration
- **Structure**:
  - `/api/v1/*` - API endpoints
  - Request validation
  - Error handling
  - Rate limiting

### 5. Visualization (Recharts & Tremor)
- **Purpose**: Data visualization and dashboard components
- **Features**:
  - Responsive charts
  - Interactive components
  - Custom theming
  - TypeScript support
- **Components**:
  - Charts: Line, Bar, Pie, Area
  - Dashboard: Cards, Metrics, Lists
  - Custom visualizations

## Development Setup

### TypeScript Configuration
```typescript
// tsconfig.json base configuration
{
  "compilerOptions": {
    "target": "es2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

## Environment Variables
Required environment variables:
```bash
# Vercel
NEXT_PUBLIC_VERCEL_URL=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# NextAuth.js
NEXTAUTH_URL=
NEXTAUTH_SECRET=
GOOGLE_ID=
GOOGLE_SECRET=
GITHUB_ID=
GITHUB_SECRET=
```

## Getting Started
1. Clone repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run development server: `npm run dev`
5. Build for production: `npm run build`

## Best Practices
- Follow TypeScript strict mode guidelines
- Implement proper error handling
- Use proper type definitions
- Follow component guidelines
- Maintain consistent code style
- Document API endpoints
- Test critical functionality

## Deployment
1. Push to main branch
2. Vercel automatically deploys
3. Monitor analytics
4. Check error logs

## Maintenance
- Regular dependency updates
- Performance monitoring
- Security patches
- Database backups
- Analytics review
