# CLAUDE.md - Gym Sweat & Tears

## Project Overview

A React Native + Expo fitness tracking app with AI-powered workout generation via Google Gemini. Supports iOS, Android, and Web.

## Quick Commands

```bash
npm start          # Start Expo dev server
npm run ios        # Run on iOS simulator
npm run android    # Run on Android emulator
npm run web        # Run in browser
npm test           # Run tests
npm run test:watch # Watch mode
npm run test:coverage # Coverage report
npm run lint       # ESLint
npm run format     # Prettier
```

## Architecture

### Directory Structure

```
app/                    # Expo Router screens (file-based routing)
  (tabs)/               # Tab navigation (home, workouts, history, analytics, settings)
  workout.tsx           # Active workout session screen
  workout-editor.tsx    # Workout creation/editing screen
  workout-preview.tsx   # Workout preview screen
components/             # React components (organized by feature)
  ui/                   # Base UI components (IconSymbol, TabBarBackground)
  home/                 # Home screen components
  workout/              # Workout session components
  workout-editor/       # Workout creation components (AI + manual)
  workout-preview/      # Workout preview components
  history/              # History screen components
  analytics/            # Charts (PR, weight progression, frequency)
  settings/             # Settings screen components
  landing/              # Landing/empty state components
database/
  database.ts           # Core DB utilities (QueryBuilder, withTransaction)
  schema.ts             # SQLite table schemas
  types.ts              # TypeScript interfaces
  services/             # CRUD operations per entity
hooks/                  # Custom React hooks
  service/              # React Query wrapper hooks for DB services
contexts/               # React Context providers (Settings, WorkoutTimer)
services/               # External APIs (Gemini, YouTube)
validation/             # Zod schemas (workout, session, session sets)
constants/              # Colors, theme values
```

### Tech Stack

- **Framework**: React Native 0.81 + Expo 54 + React 19
- **Routing**: Expo Router (file-based, typed routes enabled)
- **State**: TanStack React Query + React Context
- **Database**: SQLite via expo-sqlite
- **Charts**: Victory Native + @shopify/react-native-skia
- **Validation**: Zod
- **AI**: Google Gemini API
- **Testing**: Jest + React Testing Library (jsdom environment)
- **Code Quality**: ESLint (flat config), Prettier, Husky + lint-staged
- **Build**: EAS Build (development, preview, production profiles)

### Database Tables

1. `settings` - Key-value app preferences
2. `workouts` - Workout programs
3. `exercises` - Exercises within workouts (FK to workouts)
4. `workout_sessions` - Completed workout records (FK to workouts)
5. `session_set` - Individual sets within sessions (FK to sessions, exercises)
6. `workout_schedules` - Day-of-week workout scheduling (FK to workouts)

## Development Guidelines

### Code Changes

1. **Read before modifying** - Always understand existing code first
2. **Keep changes minimal** - Only change what's necessary
3. **Write tests** - Every change needs accompanying tests
4. **Small components** - Break large components into smaller, focused pieces
5. **Minimal comments** - Only comment on very difficult to understand sections; code should be self-documenting

### Testing Requirements

- Tests live in `__tests__/` directories alongside code
- Test file naming: `*.test.ts` or `*.test.tsx`
- Keep tests focused: 1-2 unit tests per file, covering only the main functionality
- Run tests before committing: `npm test`
- Coverage report: `npm run test:coverage`

Example test structure:
```typescript
describe('ComponentName', () => {
  it('should do specific thing', () => {
    // Arrange
    // Act
    // Assert
  });
});
```

### Component Guidelines

- Keep components under 150 lines
- Extract reusable logic into hooks
- Use TypeScript strictly (no `any`)
- Validate external data with Zod schemas

### Database Operations

Use service layer in `database/services/`:
```typescript
import { workoutService } from '@/database/services/workoutService';

// All DB operations return promises
const workouts = await workoutService.getAll();
```

### Path Aliases

Use `@/` for root imports:
```typescript
import { Button } from '@/components/ui/Button';
import { useSettings } from '@/hooks';
```

### Database Services

One service per entity in `database/services/`:
- `settingsService.ts` - Key-value app preferences
- `workoutService.ts` - Workout programs CRUD
- `exerciseService.ts` - Exercises within workouts
- `sessionService.ts` - Completed workout session records
- `sessionSetService.ts` - Individual sets within sessions
- `workoutScheduleService.ts` - Day-of-week scheduling

### Hooks

Custom hooks are split into two categories:

**Feature hooks** (`hooks/`): Screen-level data and logic
- `useHomeData`, `useHistoryData`, `useAnalyticsData` - Screen data aggregation
- `useWorkoutSession` - Active workout session management
- `useWorkoutEditor` - Workout editor logic
- `useRestTimer`, `useCountdown` - Timer hooks
- `useExerciseStats`, `useSessionSetStats` - Statistics
- `useTodaysWorkoutCompletion`, `useWorkoutRenewalNotice` - Scheduling logic

**Service hooks** (`hooks/service/`): React Query wrappers around DB services
- `workouts.ts`, `exercise.ts`, `session.ts`, `sessionSet.ts`

## Key Files

- `app/_layout.tsx` - Root layout with providers
- `database/schema.ts` - All table definitions
- `database/types.ts` - TypeScript interfaces for DB entities
- `contexts/SettingsContext.tsx` - App settings state
- `contexts/WorkoutTimerContext.tsx` - Rest timer state
- `services/geminiService.ts` - AI workout generation
- `services/youtubeVerificationService.ts` - YouTube URL verification for exercise videos

## Environment Variables

Required in `.env.local`:
```
EXPO_PUBLIC_GEMINI_API_KEY=your_key_here
```

## CI/CD

GitHub Actions (`.github/workflows/github-ci.yml`) runs on push:
1. Jest tests (Node.js 22.9.0, `yarn test`)
2. Android preview build via EAS (on main branch only)

## Known Patterns

### React Query Usage
```typescript
const { data, isLoading } = useQuery({
  queryKey: ['workouts'],
  queryFn: () => workoutService.getAll(),
});
```

### Database Transactions
```typescript
import { withTransaction } from '@/database/database';

await withTransaction(async () => {
  // Multiple DB operations
});
```

### Zod Validation
```typescript
import { workoutSchema } from '@/validation/schemas';

const result = workoutSchema.safeParse(data);
if (!result.success) {
  // Handle validation error
}
```

## Node & TypeScript

- Node version: v22.14.0 (see `.nvmrc`)
- TypeScript: strict mode, extends `expo/tsconfig.base`
- Path alias: `@/*` maps to project root

## Jest Setup

- Config: `jest.config.js` (jsdom environment, ts-jest transform)
- Setup: `jest.setup.js` (imports @testing-library/jest-dom, mocks expo-sqlite)
- Test pattern: `**/__tests__/**/*.(test|spec).(ts|tsx|js)`
- Timeout: 10000ms

## Refactoring Notes

This codebase was AI-generated and needs cleanup:
- Large components should be split into smaller pieces
- Each refactor needs corresponding tests
- Focus on single-responsibility principle
- Extract shared logic into hooks or utilities
