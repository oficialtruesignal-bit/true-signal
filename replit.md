# VANTAGE - Sports Betting Intelligence Platform

## Overview

VANTAGE is an AI-powered sports betting intelligence platform that delivers curated betting tips and live match data. It features a public landing page, a protected subscriber dashboard, and an admin panel for managing tips. The platform integrates with the API-Football service for real-time sports data to provide accurate predictions and analysis globally. The business model is freemium, offering a 15-day trial followed by a premium subscription (`Vantage Prime`) for full access, with robust access control and a paywall system.

## Brand Identity

- **Logo**: Diamond V-Shield design
- **Typography**: Sora font (weight 800) for brand name, tracking-wide lettering
- **Color**: Primary green accent `#33b864`
- **Style**: Dark cyberpunk aesthetic with neon accents

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend

- **Technology Stack**: React 18 with TypeScript, Vite, Tailwind CSS, shadcn/ui, Wouter, React Query, React Hook Form with Zod.
- **Design System**: Custom dark theme with `#33b864` green neon accents, Inter and Sora fonts, New York style shadcn/ui components, mobile-first responsive design.
- **Key UI Components**: `BetCard` (betting tips), `Hero` (landing page), `LiveTicker` (recent signals), `LiveGamesList`, `MatchCenterModal` (detailed match stats with SVG graphics), `SignalForm` (admin tip creation), `LockedScreen`, `TrialBanner`, `Thank You Page`, `Subscription Management Page`.
- **Routing**: Comprehensive routing for public pages, authentication, authenticated dashboard sections, admin panel, and legal pages (Terms, Privacy, Risk Disclaimer).
- **Internationalization**: Full site-wide support for 6 languages (PT, EN, ES, FR, IT, CN) with dynamic date localization and `localStorage` persistence.

### Backend

- **Server**: Express.js with TypeScript, supporting development and production environments, with session-based authentication.
- **Database**: Drizzle ORM, Neon serverless Postgres, managing `profiles` (user accounts) and `tips` tables.
- **Authentication**: Supabase Auth (preferred) or custom bcrypt, featuring row-level security and role-based access control.
- **Data Models**: `Profile` (user identity, subscription status, trial dates, Mercado Pago IDs), `Tip` (betting signal with match details, market, outcome, team logos, `fixtureId`).

### System Design Choices

- **Match Center Modal**: Symmetrical layout with a possession gauge, reusable `StatRow` components, and a dynamic 3-column events grid, displaying 13 types of statistics in 6 languages.
- **BetCard Design**: "Vault Card" design with prominent odds, multi-leg support, dynamic vertical timeline, and copy functionality.
- **Dashboard Optimization**: Focus on premium signal feed, core HUD metrics (Assertiveness, Online Now, Total Signals), and a simplified AI Scanner.
- **Admin Panel**: Enables real fixture selection via date picker, integrates with API-Football, and automates push notifications for new tips.
- **Subscription System**: Freemium model with a 15-day trial, `Vantage Prime` subscription (R$ 2,00/mês), and `useAccessControl` hook for managing access based on `subscription_status`, `trial_start_date`, `subscriptionActivatedAt`, and `subscriptionEndsAt`. Implements paywalls (`LockedScreen`, `TrialBanner`, blurred tips) and a dedicated subscription management page.
- **Synchronization**: Achieved through React Query cache invalidation, Supabase Realtime subscriptions for `tips`, and `localStorage` for preferences.
- **Legal Compliance**: Dedicated pages for Terms and Conditions, Privacy Policy (LGPD compliant), and Risk Disclaimer, integrated into the landing page footer.

## External Dependencies

- **API-Football v3 (api-sports.io)**: Primary data source for live match data, fixtures, and statistics.
- **Supabase**: Backend-as-a-Service for authentication, Postgres database, and real-time features.
- **Mercado Pago**: Payment gateway for subscription management, including plan creation, checkout, and webhook processing.
- **OneSignal**: Push notification service for new betting tips.
- **Radix UI**: Headless UI primitives.
- **Lucide React**: Icon library.
- **Tailwind CSS v4**: Utility-first CSS framework.
- **shadcn/ui**: Component library built on Radix UI.
- **Vite**: Frontend build tool.
- **Drizzle Kit**: Database migration and schema management.
- **Axios**: HTTP client.
- **React Query**: Server state management.
- **Zod**: Schema declaration and validation.
- **date-fns**: Date utility library.
