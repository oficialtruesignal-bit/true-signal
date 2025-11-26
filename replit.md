# Ocean Signal - Sports Betting Intelligence Platform

## Overview

Ocean Signal is an AI-powered sports betting intelligence platform providing curated betting tips and live match data. It features a public landing page, a protected subscriber dashboard, and an admin panel for managing tips. The platform integrates with the API-Football service for real-time sports data, aiming to deliver accurate predictions and analysis to a global audience.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend

- **Technology Stack**: React 18 with TypeScript, Vite, Tailwind CSS, shadcn/ui, Wouter, React Query, React Hook Form with Zod.
- **Design System**: Custom dark theme (`#33b864` green neon accents), Inter and Saira fonts, New York style shadcn/ui components, mobile-first responsive design with bottom navigation.
- **Key UI Components**: BetCard (betting tips), Hero (landing page), LiveTicker (recent signals), LiveGamesList, MatchCenterModal (detailed match stats with SVG graphics), SignalForm (admin tip creation).
- **Routing**: `/` (landing), `/auth`, `/app` (dashboard), `/tips`, `/live`, `/pregame`, `/settings`, `/admin` (role-based).
- **Internationalization**: Full site-wide support for 6 languages (PT, EN, ES, FR, IT, CN) with dynamic date localization via `date-fns` and `localStorage` persistence.

### Backend

- **Server**: Express.js with TypeScript, dual setup for dev/prod, session-based authentication.
- **Database**: Drizzle ORM, Neon serverless Postgres, `profiles` (user accounts) and `tips` tables.
- **Authentication**: Supabase Auth (preferred) or custom bcrypt, row-level security, role-based access control.
- **Data Models**: Profile (user identity), Tip (betting signal with match details, market, outcome).

### System Design Choices

- **Match Center Modal**: Features a symmetrical layout with a centered possession gauge, a reusable `StatRow` component for mirrored stat bars, and a dynamic 3-column events grid. Displays 13 types of statistics across 6 languages, with zero-value suppression.
- **BetCard Redesign**: "Vault Card" design with prominent total odds, support for multi-leg bets, dynamic vertical timeline, and copy functionality.
- **Dashboard Optimization**: Streamlined layout focusing on premium signal feed, core HUD metrics (Assertiveness, Online Now, Total Signals), and a simplified AI Scanner.
- **Admin Panel**: Enables real fixture selection via date picker, integrates with the Football API for scheduled matches, and automates push notifications upon tip creation.
- **Synchronization**: Achieved through React Query cache invalidation, Supabase Realtime subscriptions for `tips` table, and `localStorage` for language preferences.

## External Dependencies

- **API-Football v3 (api-sports.io)**: Primary data source for live match data, fixtures, and statistics (`/v3/fixtures`, `/v3/fixtures/statistics`). Accessed via a secure backend proxy (`FOOTBALL_API_KEY`).
- **Supabase**: Backend-as-a-Service for authentication, Postgres database, and real-time features.
- **OneSignal**: Push notification service for new betting tips alerts.
- **Radix UI**: Headless UI primitives.
- **Lucide React**: Icon library.
- **Tailwind CSS v4**: Utility-first CSS framework.
- **shadcn/ui**: Component library built on Radix UI.
- **Vite**: Frontend build tool.
- **Drizzle Kit**: Database migration and schema management.
- **Axios**: HTTP client for external API requests.
- **React Query**: Server state management for caching and data synchronization.
- **Zod**: Schema declaration and validation library.

## Recent Changes (Nov 26, 2024)

**Team Logo Persistence Fix:**
- ✅ **Database Schema**: Added `homeTeamLogo` and `awayTeamLogo` columns to `tips` table
  - Migrated database with ALTER TABLE to add logo URL fields
  - Updated Drizzle schema in `shared/schema.ts`
- ✅ **Backend Integration**: Fixed tipsService to use server routes instead of direct Supabase
  - Changed from Supabase client to `/api/tips` REST endpoints
  - Ensures proper data flow through Drizzle storage layer
  - Logos now persist correctly: Admin → SignalForm → tipsService → Database → BetCard
- ✅ **Admin Panel**: Enhanced tip creation flow
  - Passes `homeTeamLogo`, `awayTeamLogo`, and `fixtureId` from selected Football API match
  - SignalForm schema updated to handle nullable logo values
- ✅ **BetCard Optimization**: Improved logo rendering logic
  - Prioritizes database-saved logos over API fetch
  - Falls back to API only when logos missing from database
  - Eliminates redundant API calls for tips with persisted logos
- ✅ **Type Safety**: Updated `Signal` interface to include optional logo fields

**Search Functionality Added to Pre-Game Page:**
- ✅ **Search Feature**: Implemented search toggle button and input field in Pre-Game page
  - Toggle button in header (Search/X icon animation)
  - Collapsible search input with smooth fade-in animation
  - Filters matches by home team, away team, or league name (case-insensitive)
  - Empty state differentiation: "No games scheduled" vs "No search results"
  - Clear search button to reset query
- ✅ **i18n Support**: Added 3 new translation keys to `pregame` section
  - `searchPlaceholder`: Search input placeholder text
  - `noResults`: Message when search returns no matches
  - `clearSearch`: Clear search button label
  - All 6 languages updated: PT, EN, ES, FR, IT, CN
- ✅ **Consistent Pattern**: Mirrors Live page search implementation for UX consistency