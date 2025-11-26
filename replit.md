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
- **API-Football v3 (api-sports.io)**: Primary data source for live match data, fixtures, and real statistics
  - Endpoints: `/v3/fixtures` (live & scheduled), `/v3/fixtures/statistics` (detailed stats)
  - Authentication: Backend proxy with `FOOTBALL_API_KEY` environment variable (secure, no client exposure)
  - Headers: `x-rapidapi-key` and `x-rapidapi-host` for authentication
  - Free plan: 100 requests/day, 1200+ leagues including Premier League, La Liga, Champions League
  - Statistics: Total attacks, dangerous attacks, ball possession, shots on goal, corners, cards, saves
  - Update frequency: Every 15 seconds for live matches
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
- **100% SITE-WIDE IMPLEMENTATION** across all pages: Layout, Tips, Live, Dashboard, PreGame, Settings
- Date localization via date-fns locale mapping (localeMap: pt→ptBR, en→enUS, es, fr, it, cn→zhCN)

**Synchronization:**
- React Query: queryClient.invalidateQueries after all mutations (tips create/update/delete)
- Supabase Realtime: Active subscriptions on tips table (INSERT/UPDATE/DELETE events)
- localStorage: Persists language selection across sessions
- HTML attribute: document.documentElement.lang syncs with selected language for accessibility
- Toast notifications: Fully localized with dynamic content
- Zero hardcoded strings remaining in UI

### Recent Changes (Nov 26, 2024)

**Complete i18n Implementation & Total Synchronization (Nov 26, 2024):**
- ✅ **Site-Wide Internationalization**: System i18n aplicado em 100% das páginas do app
  - Layout: Navigation items, welcome message, notifications, logout
  - Tips: Title, subtitle, error states, toast notifications, empty states
  - Live: Title, search placeholder, no matches message, error states
  - Dashboard: Title, performance metrics, AI Scanner messages
  - PreGame: Title, subtitle, date locales, error messages, empty states
  - Settings: Language selector (já implementado anteriormente)
- ✅ **Date Localization**: date-fns locale mapping for all supported languages
  - Weekday labels adapt to language: SEG (PT) → MON (EN) → LUN (ES) → LUN (FR) → LUN (IT) → 周一 (CN)
  - Dynamic locale selection via `localeMap` tied to active language
- ✅ **Complete Synchronization Audit (5x Review)**:
  - **i18n**: ✅ All UI text translates instantly when language changes
  - **Data Sync**: ✅ React Query cache invalidation after all mutations
  - **State Persistence**: ✅ Language preference persists in localStorage
  - **Realtime Updates**: ✅ Supabase subscriptions active for tips table
  - **Component Communication**: ✅ Context API + React Query for seamless data flow
- ✅ **Zero Hardcoded Strings**: All Portuguese text replaced with translation keys
- ✅ **Architect Reviewed**: All changes approved, no blocking issues identified

### Recent Changes (Nov 25, 2024)

**BetCard Premium Redesign & Dashboard Updates (Nov 25, 2024):**
- ✅ **Bilhete Tip Premium Redesign**: Novo design "Cartão de Cofre" com container #0a0a0a, borda verde neon
  - ODD TOTAL gigante centralizada (5xl) com double text-shadow para brilho intenso
  - Suporte a apostas múltiplas (multi-leg): campo opcional `legs` em Signal
  - Timeline vertical dinâmica: linha verde conectando dots apenas entre legs (não após o último)
  - Cálculo automático de ODD TOTAL: multiplica odds de todas as pernas
  - Badges: ID do sinal, contador de cópias (Users)
  - Botão COPIAR ENTRADA: copia texto formatado + abre betLink em background
- ✅ **Dashboard (Central de Operações) Otimizado**:
  - Feed de Sinais Premium: renderiza BetCards no sidebar (40% layout)
  - Removido: Gráfico de Consistência e Calendário de Atividade (foco em simplicidade)
  - 3 círculos HUD mantidos horizontais: Assertividade, Online Agora, Total de Sinais
  - AIScanner simplificado: sem referências a jogos específicos (evita confusão com partidas irreais)
  - Layout 5-7 (40% sidebar BetCards + 60% métricas/AIScanner)
- ✅ **Página /tips**: Grid de BetCards (1 coluna mobile, 2 colunas desktop)
- ✅ **BetLeg Interface**: homeTeam, awayTeam, league, market, odd, time para suporte multi-leg

**Localização 100% PT-BR (Nov 25, 2024):**
- ✅ **Interface Completa em Português**: Todos os textos visíveis ao usuário traduzidos
  - Navegação: Painel, Sinais, Ao Vivo, Pré-Jogo, Configurações, Gestão, Sair
  - Mobile nav: labels completos ("Configurações" em vez de "Config")
  - Dashboard CRM: Assertividade, Unidades, Sequência, ROI, status (PENDENTE/AO VIVO/VERDE/VERMELHO)
  - Página Sinais: layout compacto tabela-style sem decorações
- ✅ **AIScanner Traduzido**: Templates dinâmicos 100% PT-BR
  - Ligas: Liga Inglesa, Campeonato Espanhol, Série A Italiana, Liga dos Campeões
  - Mercados: "Mais de 0.5 gols 1T", "Ambas Marcam", "Vitória Casa"
  - "cotações" em vez de "odds", "jogos" em vez de "games"
  - Times com contexto: Liverpool (ING), Real Madrid (ESP), Bayern Munique (ALE)
- ✅ **Componentes Traduzidos**:
  - ActivityHeatmap: Matriz de Atividade, "verdes", Menos/Mais
  - Calendar: locale pt-BR para formatação de datas
  - Toasts: "Link copiado! Boa sorte 🍀", "Novo Sinal Disponível!"
  - Erros: "Credenciais inválidas", "E-mail já cadastrado"
- ✅ **Dados Simulados Realistas**:
  - Total de sinais fixo: 151 (não 18.9K)
  - Usuários online oscilando: 340-900 (não 3400-3500)

**API-Football v3 Integration (Current - Nov 25, 2024):**
- ✅ **Backend Proxy**: Express endpoints (`/api/football/*`) using RapidAPI correctly
  - Base URL: `https://api-football-v1.p.rapidapi.com/v3`
  - Endpoints: `/fixtures` (live & scheduled), `/fixtures/statistics` (detailed stats)
  - Authentication: `x-rapidapi-key` and `x-rapidapi-host` headers with `FOOTBALL_API_KEY` environment variable
  - Backend-only API key storage (secure, no client exposure)
- ✅ **Coverage**: 1200+ leagues including all major competitions (Premier League, La Liga, Champions League, etc.)
  - Real-world testing: 200+ fixtures per day vs 1-2 with Sportmonks
- ✅ **Statistics**: Real data for attacks, dangerous attacks, possession, shots, corners, cards, saves
  - Team identification via team_id matching (prevents home/away inversion)
  - Mapper function extracts values and handles percentage strings (e.g., "52%")
  - Resilient mapping: verifies team_id before assigning stats to home/away
- ✅ **Rate Limits**: Free tier provides 100 requests/day (sufficient for MVP testing)
- ✅ **Update Frequency**: Live matches update every 15 seconds
- ✅ **Accessibility**: DialogTitle/DialogDescription added to Match Center modal for screen readers
- ✅ **HTML Compliance**: Fixed nested `<a>` tags in Layout component (Wouter Link pattern)

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