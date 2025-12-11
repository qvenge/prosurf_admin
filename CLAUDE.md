# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `pnpm dev` - Start the development server with hot module reloading
- `pnpm build` - Build the application for production (runs TypeScript compiler first, then Vite build)
- `pnpm preview` - Preview the production build locally
- `pnpm lint` - Run ESLint to check code quality and style

### Package Management
- This project uses `pnpm` as the package manager
- Use `pnpm install` to install dependencies
- Use `pnpm add <package>` to add new dependencies

## Architecture

### Tech Stack
- **Frontend Framework**: React 19.1.1 with TypeScript
- **Build Tool**: Vite 7.1.2 with SWC plugin for fast compilation
- **Routing**: React Router 7.8.1
- **UI Library**: Telegram Apps UI components
- **Styling**: SASS with embedded compiler and global imports:
  - `@/shared/lib/style-utils` as `utils` - Utility functions and mixins
  - `@/shared/ds` as `ds` - Design system tokens and variables
- **Linting**: ESLint with TypeScript support and React hooks/refresh plugins
- **API Integration**: TanStack Query 5.85.5 for data fetching and state management
- **HTTP Client**: Axios 1.11.0 with request/response interceptors
- **Validation**: Zod 4.1.3 for runtime type validation and schema parsing

### Project Structure
```
src/
├── app/           # Application entry point and global styles
│   ├── main.tsx   # App initialization with React Router and API provider
│   └── index.css  # Global styles
├── pages/         # Page components following FSD methodology
├── features/      # Feature-specific logic and components
├── entities/      # Business entities and their logic
├── shared/        # Shared utilities, components, and API layer
│   ├── api/       # Complete API integration layer
│   │   ├── config.ts           # Axios client configuration
│   │   ├── schemas.ts          # Zod validation schemas
│   │   ├── error-handler.ts    # Centralized error handling
│   │   ├── auth.ts            # Authentication API functions
│   │   ├── event-sessions.ts  # Event sessions API
│   │   ├── users.ts           # User profile API
│   │   ├── hooks/             # TanStack Query custom hooks
│   │   ├── providers/         # React context providers
│   │   └── examples/          # Usage examples and documentation
│   ├── lib/       # Utility functions and helpers
│   ├── ui/        # Reusable UI components
│   └── ds/        # Design system tokens and variables
├── widgets/       # Complex UI widgets composed of features
└── vite-env.d.ts  # Vite environment type definitions
```

### Configuration Files
- **TypeScript**: Uses project references with separate configs for app (`tsconfig.app.json`) and Node (`tsconfig.node.json`)
- **ESLint**: Configured with TypeScript, React hooks, and React refresh plugins
- **Vite**: Configuration includes:
  - React SWC plugin for fast compilation
  - Path alias `@` pointing to `src/` directory for imports
  - SCSS preprocessor with globally imported utilities and design system tokens
  - Asset inlining disabled for SVG icons

### Current Router Setup
The application uses React Router with browser routing. Router configuration is in `src/app/routes.ts` and integrated in `src/app/main.tsx:9-14` with the API provider wrapping the entire application.

## API Integration

### Overview
The application implements a comprehensive API layer for the ProSurf backend following Feature-Sliced Design principles. The API integration provides:

- **Type-Safe API Calls**: All API interactions use Zod schemas for runtime validation
- **JWT Authentication**: Automatic token management with localStorage persistence
- **Error Handling**: Centralized error handling with custom error types
- **Query Caching**: TanStack Query for efficient data fetching and caching
- **Request Interceptors**: Automatic Bearer token injection for authenticated requests

### Backend API Documentation
The backend API follows OpenAPI 3.0.3 specification defined in `api-documentation.yaml`. Key endpoints:

**Authentication:**
- `POST /auth/register` - User registration (rate limited: 5 req/min)
- `POST /auth/login` - User authentication (rate limited: 10 req/min) 
- `POST /auth/logout` - Token revocation

**Event Sessions:**
- `GET /event-sessions` - List sessions with filtering and pagination
- `GET /event-sessions/{id}` - Get single session details

**User Profile:**
- `GET /users/profile` - Get authenticated user profile (requires Bearer token)

### API Usage Examples

**Authentication:**
```typescript
import { useLogin, useUserProfile } from '@/shared/api';

const { mutate: login, isPending } = useLogin();
const { data: user } = useUserProfile();

// Login
login({ email: 'user@example.com', password: 'password123' });
```

**Event Sessions:**
```typescript
import { useEventSessions } from '@/shared/api';

const { data: sessions, isLoading } = useEventSessions({
  filters: { 
    types: ['surfingTraining', 'tour'],
    minRemainingSeats: 2 
  },
  limit: 20
});
```

### Environment Configuration
Create `.env` file based on `.env.example`:
```
VITE_API_URL=http://localhost:3000
```

### API Error Handling
All API errors are typed and centrally handled:
```typescript
import { isAuthError, isValidationError, getErrorMessage } from '@/shared/api';

// Check specific error types and handle accordingly
if (isAuthError(error)) {
  // Redirect to login
} else if (isValidationError(error)) {
  // Show validation messages
}
```

## Styling Guidelines

### Design System Usage
In SCSS files, always use design system functions for colors and typography:

- **Colors**: Use `ds.color('token-name')` function
- **Typography**: Use `@include ds.typo('token-name')` mixin

**Example:**
```scss
.title {
  @include ds.typo('header/h4/semibold');
  color: ds.color('text/primary');
  margin: 0;
}
```

### Token References
- **Color tokens**: `src/shared/ds/colors/_color-tokens.scss`
- **Typography tokens**: `src/shared/ds/typography/_typo-tokens.scss`

## Development Notes
- The project follows Feature-Sliced Design architectural methodology strictly
- Uses Telegram Apps UI library, indicating this may be a Telegram Web App
- Path alias `@` configured for `src/` directory imports in Vite config
- SCSS files have automatic access to style utilities and design system tokens
- API provider is integrated at application root level for global access
- No testing framework is currently configured
- All API schemas are validated at runtime with Zod for type safety