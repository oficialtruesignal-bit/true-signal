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

## Business Model: Freemium with Trial Limitation

**Subscription Tiers:**
- **Trial** (Default for new users): 15 days free access with limited features
- **Ocean Prime** (Active): R$ 99,87/month - unlimited access
- **Expired**: Trial period ended, access blocked

**Trial Limitations:**
- Duration: 15 days from registration (`trial_start_date`)
- Signal Access: Only 1 betting tip visible per day (2nd and 3rd tips are blurred with paywall overlay)
- Dashboard Access: Full dashboard visible with trial countdown banner

**Paywall System:**
- `useAccessControl` hook: Centralized access control logic calculating `daysRemaining`, `isLocked`, `canSeeAllTips`
- `LockedScreen` component: Full-screen paywall blocking access after trial expiration
- `TrialBanner` component: Countdown banner displayed on dashboard for trial users
- Blur overlay on premium tips with "Exclusivo Ocean Prime" message
- All subscription management integrated with `subscription_status` field in `profiles` table

**Database Schema:**
- `profiles.subscription_status`: ENUM('trial', 'active', 'expired') - Default: 'trial'
- `profiles.trial_start_date`: TIMESTAMP - Automatically set on user creation
- Migration executed to convert legacy 'free'→'trial', 'premium'→'active'

## Recent Changes (Nov 26, 2024)

**Freemium System Implementation (COMPLETED):**
- ✅ **Database Schema**: Updated `profiles` table with new subscription model
  - Changed `subscription_status` ENUM from ('free', 'premium') to ('trial', 'active', 'expired')
  - Added `trial_start_date` TIMESTAMP column with DEFAULT now() for accurate trial tracking
  - Migrated existing users: 'free' → 'trial', 'premium' → 'active'
  - All fields properly indexed and accessible
- ✅ **Access Control Logic**: Created `useAccessControl` hook with precise 360-hour trial enforcement
  - Uses `differenceInHours >= 360` for exact 15×24h trial window (not calendar days)
  - Reads `trialStartDate` from profile (fallback to `createdAt` for legacy users)
  - Prioritizes `subscriptionStatus === 'active'` over trial calculations
  - Returns flags: `daysRemaining`, `isLocked`, `canSeeAllTips`, `isPremium`, `isTrial`, `isExpired`
- ✅ **Paywall Components**: 
  - `LockedScreen`: Full-screen blocker after trial expiration with Ocean Prime CTA
  - `TrialBanner`: Countdown banner with urgency messaging (yellow normal, red ≤3 days)
  - Both components include "Assinar Agora" CTAs linking to checkout
  - Tips page blur overlay limited to indices 1-2 only (2nd and 3rd tips)
- ✅ **Type Safety**: Updated `useAuth` hook User interface
  - Added `trialStartDate: string | null` field for trial calculations
  - Changed `subscriptionStatus` type to match new schema ('trial' | 'active' | 'expired')
  - Fixed user data mapping from Supabase profiles (trial_start_date → trialStartDate)
- ✅ **Integration**: Modified App.tsx to render LockedScreen when user is locked (admins bypass)
- ✅ **Architect Approval**: All critical issues resolved, 360-hour trial system validated

## Recent Changes (Nov 26, 2024)

**Team Logo Persistence Implementation:**
- ✅ **Database Schema**: Added `home_team_logo` and `away_team_logo` text columns to `tips` table
  - Executed SQL migration with ALTER TABLE commands
  - Updated Drizzle schema in `shared/schema.ts` with camelCase field names
- ✅ **Architecture Refactor**: Migrated tipsService from direct Supabase to server API routes
  - Changed from Supabase client calls to `/api/tips` REST endpoints
  - All CRUD operations now flow through Drizzle storage layer (`server/storage.ts`)
  - Complete pipeline: Admin → SignalForm → tipsService → Server Routes → Drizzle → Database
- ✅ **Admin Panel Enhancement**: Enhanced tip creation workflow
  - Admin selects match from Football API fixtures (via date picker)
  - Passes `homeTeamLogo`, `awayTeamLogo`, and `fixtureId` to SignalForm via initialData
  - SignalForm preserves match context on form reset for consecutive tip creation
- ✅ **BetCard Optimization**: Implemented intelligent logo rendering
  - Uses `hasFetchedFromAPI` flag to prevent redundant API calls
  - Prioritizes database-saved logos over API fetch
  - Only fetches from Football API when logos missing from database
  - Eliminates unnecessary API requests for tips with persisted logos
- ✅ **Data Type Handling**: Robust type conversions across pipeline
  - `odd` field: number (frontend Signal) → string (Drizzle decimal schema)
  - `fixtureId` field: number (Football API) → string (database) → string (frontend)
  - tipsService.getAll supports both camelCase (Drizzle) and snake_case (legacy) for backward compatibility
- ✅ **Type Safety**: Updated `Signal` interface to include optional `homeTeamLogo`, `awayTeamLogo`, and `fixtureId` fields

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