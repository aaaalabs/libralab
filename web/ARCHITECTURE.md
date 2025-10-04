# LIBRA Web Application Architecture

## Project Structure

```
web/
├── src/
│   ├── app/                    # Next.js App Router pages and layouts
│   ├── components/             # React components
│   │   ├── sections/          # Large page sections (e.g., CommunalAreas, AvailableRooms)
│   │   ├── ui/               # Reusable UI components (e.g., RoomCardInline)
│   │   └── navigation/       # Navigation components (TopNav)
│   ├── context/              # React Context providers (Translation)
│   ├── data/                 # Static data files (e.g., epicwg.json)
│   ├── translations/         # Translation files and types
│   ├── types/               # TypeScript type definitions
│   └── utils/               # Utility functions and helpers
```

## Key Components

### Navigation
- `TopNav.tsx`: Main navigation component used across all pages
  - Handles language switching
  - Responsive design for mobile/desktop
  - Integrated with Next.js App Router

### Room Display
- `RoomCardInline.tsx`: Optimized room display component
  - Uses Tremor UI for consistent styling
  - Lazy-loaded images with next/image
  - Responsive design
  - Motion animations for interactions

### Sections
- `AvailableRooms.tsx` & `FeaturedRooms.tsx`: Room listing sections
  - Grid-based layout
  - Filtered room displays
  - Optimized for performance with pagination

### Translations
- Centralized in `translations/translations.ts`
- Type-safe translations with TypeScript
- Supports English and German
- Context-based language switching

## Performance Optimizations

### 1. Image Optimization
- Using `next/image` for automatic:
  - WebP conversion
  - Responsive sizes
  - Lazy loading
  - Image optimization

### 2. Component Loading
- Client components marked with 'use client'
- Server components used by default for better performance
- Dynamic imports for heavy components

### 3. State Management
- React Context for global states (translations)
- Local state for component-specific data
- Optimized re-renders with proper memoization

### 4. Styling
- Tailwind CSS for zero-runtime styles
- Tremor UI components for consistent design
- CSS-in-JS avoided for better performance

### 5. Data Handling
- Static data stored in JSON files
- Type-safe data structures
- Efficient data transformations with utility functions

## Best Practices

### Component Creation
1. Use TypeScript interfaces for props
2. Implement proper error boundaries
3. Follow atomic design principles
4. Keep components focused and single-responsibility

### Performance Guidelines
1. Lazy load below-the-fold content
2. Optimize images and media
3. Minimize JavaScript bundles
4. Use proper caching strategies

### Code Style
1. Use TypeScript for type safety
2. Follow ESLint rules
3. Maintain consistent naming conventions
4. Document complex logic

## Future Improvements

1. Implement proper error boundaries
2. Add more comprehensive testing
3. Optimize bundle sizes further
4. Implement proper analytics
5. Add performance monitoring

## Development Workflow

1. Follow component-first development
2. Use TypeScript strictly
3. Test components in isolation
4. Document changes and improvements
5. Review performance impacts

## Deployment

- Vercel deployment
- Automatic preview deployments
- Production optimizations enabled
- Environment-based configuration

## Monitoring

1. Performance metrics to track:
   - First Contentful Paint (FCP)
   - Largest Contentful Paint (LCP)
   - Time to Interactive (TTI)
   - First Input Delay (FID)

2. Error tracking:
   - Client-side errors
   - API errors
   - Performance bottlenecks

## Security

1. Proper input sanitization
2. XSS prevention
3. CORS policies
4. Content Security Policy
5. Secure data handling

This documentation should be updated as the project evolves.
