# Ocean Signal - Sports Betting Intelligence Platform

## Overview

Ocean Signal is a comprehensive sports betting intelligence platform that combines AI-powered analysis with expert curation. The platform consists of a public landing page for conversion, a protected dashboard for subscribers to view betting tips and live match data, and an admin panel for managing tips. The system integrates with the API-Football service to provide real-time match data and statistics.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React 18 with TypeScript via Vite build system
- Tailwind CSS for styling with custom dark theme (ultra dark backgrounds with green neon accents #33b864)
- shadcn/ui component library for consistent UI patterns
- Wouter for client-side routing
- React Query (TanStack Query) for server state management
- React Hook Form with Zod for form validation

**Design System:**
- Custom dark theme with primary color: `#33b864` (Green Neon)
- Background colors: `#0a0a0a` (main), `#121212` (cards)
- Typography: Inter font for body text, Saira for display headings
- Component library follows New York style variant of shadcn/ui
- Mobile-first responsive design with bottom navigation on mobile, sidebar on desktop

**Key UI Components:**
- BetCard: Displays betting tips with match info, odds, and status indicators
- Hero: Landing page hero section with generated imagery
- LiveTicker: Animated ticker showing recent betting signals
- LiveGamesList: Real-time match data display with Match Center modal
- MatchCenterModal: Advanced match statistics with donut charts (possession/attacks/shots), stat panels (cards/corners), and SVG pitch heatmap
- SignalForm: Admin interface for creating betting tips from real fixtures
- Layout: Main app shell with responsive navigation (desktop sidebar + mobile bottom nav with 5 icons)

**Routing Structure:**
- `/` - Public landing page
- `/auth` - Authentication (login/register)
- `/app` - Protected dashboard for users (main hub)
- `/tips` - Tips feed page showing all betting signals
- `/live` - Live matches page with real-time data
- `/pregame` - Pre-game matches (72-hour window)
- `/settings` - User settings and language preferences
- `/admin` - Protected admin panel (role-based access)

### Backend Architecture

**Server Framework:**
- Express.js server with TypeScript
- Dual server setup: development (index-dev.ts with Vite middleware) and production (index-prod.ts serving static build)
- Session-based authentication with request/response logging middleware

**Database Layer:**
- Drizzle ORM for type-safe database operations
- Neon serverless Postgres database
- Two primary tables:
  - `profiles`: User accounts with email, password hash, first name, role (user/admin), subscription status
  - `tips`: Betting signals with fixture ID, league, teams, market, odds, status (pending/green/red), bet link

**Authentication:**
- Dual authentication strategy: Supabase Auth (preferred) with fallback to custom bcrypt implementation
- Row-level security policies on database tables
- Role-based access control (user vs admin)
- Protected routes with automatic redirection

**Data Models:**
- Profile: User identity with authentication and authorization data
- Tip: Betting signal with match details, market analysis, and outcome tracking
- Status workflow: pending → green (win) or red (loss)

### External Dependencies

**Third-Party APIs:**
- **Sportmonks API v3 (api.sportmonks.com)**: Primary data source for live match data, fixtures, and real statistics
  - Endpoints: `/v3/football/livescores/inplay` (live), `/v3/football/fixtures/date/{date}` (scheduled), `/v3/football/fixtures/{id}` (stats)
  - Authentication: Backend proxy with `SPORTMONKS_API_TOKEN` environment variable (secure, no client exposure)
  - Includes: `participants;league;scores;periods;statistics` (semicolon separated)
  - Free plan: Danish Superliga (ID:271) and Scottish Premiership (ID:501)
  - Type IDs (Official): attacks (43), dangerous_attacks (44), possession (45), shots_on_target (86), corners (42), saves (57)
  - Participant mapping: Uses `meta.location` ("home"/"away") for accurate team identification
  - Live time: Calculated from `periods` data (counts_from + minutes)
  - Graceful degradation with skeleton loaders and fallback messaging on API failures

**Authentication & Database Services:**
- **Supabase**: Backend-as-a-Service providing authentication, Postgres database, and real-time subscriptions
  - Configuration via `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
  - Row-level security policies for data access control
  - Real-time updates for collaborative features

**Notification Services:**
- **OneSignal**: Push notification system for alerting users about new betting tips
  - React SDK integration with permission prompts
  - Configured via `VITE_ONESIGNAL_APP_ID` environment variable
  - Fallback to Browser Notification API when OneSignal not configured
  - Triggers notification when admin creates new tip

**UI & Component Libraries:**
- **Radix UI**: Headless UI primitives (dialogs, dropdowns, accordions, etc.)
- **Lucide React**: Icon library for consistent iconography
- **Tailwind CSS v4**: Utility-first CSS framework with custom theme configuration
- **shadcn/ui**: Pre-built component patterns built on Radix UI

**Development Tools:**
- **Vite**: Build tool with HMR and custom plugins for development
  - Custom meta images plugin for OpenGraph image handling
  - Replit-specific plugins (cartographer, dev banner, runtime error overlay)
- **Drizzle Kit**: Database migration and schema management
- **TypeScript**: Type safety across frontend and backend

**Data Fetching:**
- Axios for external API requests (Football API)
- Native fetch for internal API communication
- React Query for caching, refetching, and request deduplication

**Form & Validation:**
- React Hook Form for performant form state management
- Zod for runtime type validation and schema definition
- @hookform/resolvers for integration between the two libraries

### Internationalization (i18n)

**Language Support:**
- 6 languages: Portuguese (PT), English (EN), Spanish (ES), French (FR), Italian (IT), Chinese (CN)
- Context API-based language provider with hook (`useLanguage`)
- Translation files in `client/src/i18n/translations.ts`
- Language preference persisted in localStorage
- HTML lang attribute updates automatically with language changes
- Currently implemented in Settings page, expandable to other pages as needed

### Recent Changes (Nov 25, 2024)

**Sportmonks API v3 Complete Migration (Final):**
- ✅ **Backend Proxy**: Created Express endpoints (`/api/sportmonks/*`) to handle CORS and secure API key management
  - Endpoints: `/api/sportmonks/livescores/inplay`, `/api/sportmonks/fixtures/date/:date`, `/api/sportmonks/fixtures/:id`
  - Uses semicolon separators for includes: `participants;league;scores;periods;statistics`
  - API token stored securely as `SPORTMONKS_API_TOKEN` environment variable (backend only)
- ✅ **Participant Mapping**: Fixed home/away team identification using `meta.location` field (not array index)
  - Prevents team flipping when API returns teams in non-standard order
  - Extended TypeScript interfaces to include `meta` field with location/winner/position data
- ✅ **Official Type IDs**: Corrected all statistics Type IDs to match Sportmonks v3 documentation
  - Attacks: Type ID 43 (was 83)
  - Dangerous Attacks: Type ID 44 (was 84)
  - Ball Possession: Type ID 45 (was 42)
  - Shots On Target: Type ID 86 ✓
  - Corners: Type ID 42 ✓
  - Yellow Cards: Type ID 84 ✓
  - Red Cards: Type ID 83 ✓
  - Goalkeeper Saves: Type ID 57 (was 91)
- ✅ **Live Match Time**: Implemented elapsed minute calculation from `periods` data
  - Parses `ticking` period with `counts_from + minutes` formula
  - Supports 1st half, 2nd half, extra time, and penalties
- ✅ **State Mapping**: Fixed fixture state_id mapping for accurate match status
  - 1: Not Started (NS), 2: Live - 1st Half (1H), 3: Halftime (HT), 4: Live - Break (BRK)
  - 5: Match Finished (FT), 14: Live - Extra Time (ET), 18: Finished After Extra Time (AET)
  - 7: Live - Penalties (PEN), 8: Finished After Penalties (FT (PEN))
  - 9: Postponed (POSTP), 11: Cancelled (CANC), 17: Interrupted (INT)
- **Testing Notes**: Free plan limited to Danish Superliga (ID:271) and Scottish Premiership (ID:501)
- **Known Issue**: Nested `<a>` tags warning in Layout/Sidebar (non-critical, doesn't affect functionality)

### Recent Changes (Nov 2024)

**Mobile Navigation:**
- Bottom navigation on mobile with 5 icons: Home, Tips, Live, Pre-Game, Settings
- Desktop sidebar includes all pages + Admin link (for admin users only)

**Match Center Modal:**
- Circular donut charts for attacks, shots on target, and ball possession
- Stat panels displaying yellow cards, red cards, and corners
- SVG-based pitch heatmap visualization
- Integrated with Football API statistics endpoint

**Admin Panel Enhancements:**
- Real fixture selection via date picker
- Integrates with Football API to fetch scheduled matches
- Automatic notification sending when creating new tip
- Role-based access control prevents non-admin access