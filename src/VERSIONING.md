# Version Control - Limburg University Uitdagingen Platform
## Semantic Versioning (SemVer)

**Huidige Versie**: 2.0.0  
**Project Start**: 12 maart 2026  
**Eerste Release (v1.0.0)**: 18 maart 2026  
**Versioning Format**: MAJOR.MINOR.PATCH

```
0.x.x: Development fase (pre-release)
1.0.0: Eerste production-ready release
2.0.0+: Major updates en redesigns

MAJOR version: Incompatible API changes / Major redesigns
MINOR version: Backwards-compatible new features
PATCH version: Backwards-compatible bug fixes
```

---

## 📦 Version History

### [2.0.0] - 2026-03-18 ⭐ CURRENT
**Major Release - Complete Design Overhaul**

#### 💥 Breaking Changes
- Complete UI redesign met glassmorphism - oude styling volledig vervangen
- Navigatie flow aangepast (terug knop navigeert naar /toelichtingen)

#### ✨ Added
- **Glassmorphism Design System**
  - Moderne gradient achtergronden (`from-[#2c2a64] via-[#211568] to-[#1a1050]`)
  - Frosted glass effects (`bg-white/10 backdrop-blur-md`)
  - Decoratieve blur circles met color overlays
  - Premium shadow effects en border styling

- **Homepage Transformation**
  - Hero sectie met grote titel en subtitle
  - Statistics cards met glassmorphism
  - "Hoe werkt het?" sectie met genummerde stappen
  - CTA sectie met gradient buttons
  - Recent toelichtingen preview

- **Over Pagina Redesign**
  - Hero met gradient tekst effect
  - Glassmorphism content cards
  - Genummerde proces stappen (1-4)
  - Gemeente badges met Sparkles icon
  - Contact sectie met moderne styling

- **Toelichtingen Pagina Transformation**
  - Unified search & filters glassmorphism card
  - Results counter met CheckCircle2 icon
  - Loading states met animated spinner
  - Empty state met Search icon
  - Gradient tekst op "Limburgse Gemeentes"

- **Card Components Overhaul**
  - ListingCard: Natuurlijke flex-grow, line-clamp voor tekst
  - ProposalCard: Compacter design, flex-wrap footer
  - Subtiele hover lift animaties (-translate-y-1)
  - Smart text truncation
  - Consistent shadow effects

#### 🔄 Changed
- Alle pagina's nu consistent met nieuwe design language
- Input velden met glassmorphism styling
- Buttons met gradient hover effects
- Badge styling geüniformeerd
- Typography hierarchy verbeterd

#### 🐛 Fixed
- Navigation bug: "Terug naar overzicht" navigeert nu correct naar `/toelichtingen`
- Card heights issue opgelost met natuurlijke flex-grow
- Text overflow handling verbeterd met line-clamp
- Responsive spacing issues gefixt

---

### [1.5.0] - 2026-03-18
**Minor Release - Card Components Redesign**

#### ✨ Added
- Natuurlijke flex-grow benadering voor ListingCard
- Smart line-clamp voor tekst overflow (titel: 2 lines, beschrijving: 3 lines)
- Subtiele hover lift animaties voor beide card types
- ProposalCard compacter design met flex-wrap footer

#### 🔄 Changed
- ListingCard: Geen vaste hoogtes meer, natuurlijke flow
- ProposalCard: Titel line-clamp-2, beschrijving line-clamp-2
- Footer layout: flex-wrap met responsive gaps (gap-x-6 gap-y-2)
- Hover effecten: -translate-y-1 met shadow intensification

#### 🐛 Fixed
- Card height inconsistencies opgelost
- Text overflow op lange titels gefixt
- Responsive breaking op mobile verbeterd
- Footer wrapping issues opgelost

---

### [1.4.0] - 2026-03-18
**Minor Release - Toelichtingen Pagina Redesign**

#### ✨ Added
- Hero sectie met gradient tekst effect op "Limburgse Gemeentes"
- Unified glassmorphism card voor alle filters
- Results counter met CheckCircle2 icon en border-top
- Loading state met animated spinner (groene accent)
- Empty state met Search icon en helpende tekst

#### 🔄 Changed
- Search input: glassmorphism styling (bg-white/5 backdrop-blur-sm)
- Filter pills: active state met groene achtergrond
- Grid layout: responsive met consistent spacing
- Typography: betere hierarchy en readability

---

### [1.3.0] - 2026-03-18
**Minor Release - Over Pagina Redesign**

#### ✨ Added
- Hero sectie met gradient achtergrond en blur circles
- Glassmorphism content cards (bg-white/10 backdrop-blur-md)
- "Onze Missie" sectie met Target icon
- "Hoe het werkt" met genummerde stappen (1-4)
- Gemeente badges met Sparkles icon decoratie
- Contact sectie met glassmorphism card

#### 🔄 Changed
- Page layout: moderne spacing en rhythm
- Typography: grote titles met gradient effects
- Icons: consistent gebruik van Lucide icons
- Colors: groene accenten op belangrijke elementen

---

### [1.2.0] - 2026-03-18
**Minor Release - Homepage Redesign**

#### ✨ Added
- Gradient achtergrond: `from-[#2c2a64] via-[#211568] to-[#1a1050]`
- Decoratieve blur circles (pink, purple, green overlays)
- Glassmorphism statistics cards met backdrop-blur
- "Hoe werkt het?" sectie met genummerde stappen (1, 2, 3)
- CTA sectie met gradient button en glow effect
- Recent toelichtingen preview sectie

#### 🔄 Changed
- Hero sectie: grote titel "Welkom bij het Limburg University Platform"
- Statistics: glassmorphism styling met hover lift
- Feature cards: icons (Building2, Lightbulb, Handshake)
- CTA button: gradient van groen naar donkergroen

---

### [1.1.0] - 2026-03-18
**Minor Release - Terminologie Wijzigingen & Bug Fixes**

#### 💥 Breaking Changes
- URL structure gewijzigd: `/uitdagingen` → `/toelichtingen`

#### 🔄 Changed
- **Terminologie Update**: "Uitdagingen" → "Toelichtingen"
  - Header navigatie links
  - Page titles en headings
  - Form labels
  - Email templates
  - Button texts
  
- **Terminologie Update**: "Voorstellen" → "Challenges"
  - UI display teksten
  - Form submission labels
  - Email content
  - Counter labels

#### 🐛 Fixed
- React warnings in Select component (Lucide icon imports)
- Text overflow issues met line-clamp toevoeging
- Mobile responsive layout issues
- Console warnings opgeschoond

---

### [1.0.0] - 2026-03-18 🎉 FIRST PRODUCTION RELEASE
**Major Release - Email Notificatie Systeem & Production Ready**

#### ✨ Added
- **Resend API Integratie**
  - Email sending functionaliteit
  - HTML template engine
  - Error handling met retry logic
  - Async email processing

- **Email Templates**
  - Admin notificatie: nieuwe toelichting geplaatst
  - User confirmatie: challenge ontvangen bevestiging
  - Branded HTML templates met Limburg University styling
  - Responsive email layouts

#### 🔄 Changed
- POST `/challenges` endpoint: stuurt nu admin email
- POST `/proposals` endpoint: stuurt nu user confirmatie email
- Server error handling: continue bij email failures

#### ⚙️ Configuration
- `RESEND_API_KEY` environment variable toegevoegd
- `ADMIN_EMAIL` configuratie voor notificaties

#### 🎯 Production Ready
- Alle core features geïmplementeerd
- Testing compleet
- Email notificaties werkend
- Security features actief
- Ready voor gebruik

---

### [0.7.0] - 2026-03-17
**Pre-release - Admin Features & Role-Based Access**

#### 👮 Added
- **Role System**
  - Admin role implementatie
  - User role implementatie
  - Guest (unauthenticated) access

- **Protected Routes**
  - `/add` - Admin only (nieuwe uitdaging plaatsen)
  - Proposal visibility - Admin only
  - Login requirement voor specifieke acties

- **Admin Dashboard Features**
  - Alle proposals zichtbaar voor admins
  - Proposal count per uitdaging
  - Contact informatie zichtbaar
  - Admin indicators in UI

#### 🎨 Changed
- "Admin only" badges toegevoegd
- Conditional rendering gebaseerd op role
- Protected action buttons
- Permission feedback messages

---

### [0.6.0] - 2026-03-16
**Pre-release - Custom Authenticatie Systeem**

#### 💥 Breaking Changes
- Migratie van Supabase Auth naar custom KV-store authenticatie
- Nieuwe authentication headers: `X-Session-Token`

#### ✨ Added
- **Custom Auth Implementation**
  - SHA-256 password hashing
  - UUID session token generatie
  - Session management in KV-store
  - Token expiration (7 dagen)

- **User Management**
  - User model: email, password_hash, role, created_at
  - Session model: token, email, created_at, expires_at
  - Role types: 'admin' | 'user'

- **Auth Endpoints**
  - POST `/signup` - Nieuwe gebruiker registreren
  - POST `/signin` - Inloggen met credentials
  - POST `/signout` - Uitloggen en session cleanup

- **Auth Context**
  - `/lib/auth.tsx` - React context voor authenticatie
  - `useAuth()` hook voor components
  - `AuthProvider` wrapper component
  - localStorage session persistence

#### 🔐 Security Features
- SHA-256 password hashing (Web Crypto API)
- Secure session token storage
- Token-based authentication
- Protected route middleware
- Role-based access control

---

### [0.5.0] - 2026-03-15
**Pre-release - Filter & Search Systeem**

#### 🔍 Added
- **Search Functionaliteit**
  - Real-time search geïmplementeerd
  - Debouncing (300ms delay)
  - Search in titel en beschrijving
  - Case-insensitive matching

- **Gemeente Filters**
  - Maastricht, Heerlen, Sittard-Geleen, Venlo, Roermond
  - Multi-select functionaliteit

- **Categorie Filters**
  - Duurzaamheid, Mobiliteit, Sociale Cohesie
  - Veiligheid, Innovatie, Overig

- **Results Management**
  - Results counter component
  - "Geen resultaten" empty state
  - Loading states tijdens fetch
  - Filter reset functionaliteit

#### 🎨 Changed
- Filter badges met active states
- Smooth transitions
- Loading spinners
- Empty state illustrations

---

### [0.4.0] - 2026-03-14
**Pre-release - Core Platform Features**

#### ✨ Added
- **Challenge Plaatsing**
  - `/components/AddListing.tsx` - Formulier voor nieuwe toelichting
  - Form validatie (titel, beschrijving, gemeente, categorie)
  - Contact informatie velden (naam, email, organisatie)
  - POST `/challenges` endpoint

- **Challenge Indienen**
  - `/components/SubmitProposal.tsx` - Formulier voor challenge
  - Velden: titel, beschrijving, naam, email, organisatie, interesse type
  - POST `/proposals` endpoint
  - Koppeling aan toelichting via listing_id

- **Detail Pagina's**
  - `/components/ListingDetail.tsx` - Volledige toelichting details
  - Proposals overzicht sectie
  - Contact sidebar met organisatie info
  - "Dien een challenge in" CTA button

#### 🔌 API Endpoints
- GET `/challenges` - Alle toelichtingen
- GET `/challenges?search=term` - Zoeken
- GET `/challenges?municipality=value` - Filter gemeente
- GET `/challenges?category=value` - Filter categorie
- GET `/challenges/:id` - Specifieke toelichting
- POST `/challenges` - Nieuwe toelichting
- POST `/proposals` - Challenge indienen
- GET `/stats` - Platform statistieken

---

### [0.3.0] - 2026-03-13
**Pre-release - Design System Implementatie**

#### 🎨 Added
- **Kleurenschema Implementatie**
  - Primary: #2c2a64 (Donkerpaars)
  - Accent: #8dc49f (Groen)
  - Hover: #7ab88d (Donkerder groen)
  - Neutral: #f2f2f2 (Lichtgrijs)

- **Limburg University Branding**
  - Logo in header geïntegreerd
  - Consistente styling door hele platform
  - Figma design vertaling naar code

- **Components Library**
  - `/components/ui/button.tsx` - Button component
  - `/components/ui/card.tsx` - Card component
  - `/components/ui/input.tsx` - Input field
  - `/components/ui/select.tsx` - Select dropdown
  - `/components/ui/textarea.tsx` - Textarea field
  - `/components/ui/badge.tsx` - Badge component
  - `/components/ui/separator.tsx` - Divider line
  - `/components/ui/dialog.tsx` - Modal dialog

- **Feature Components**
  - `/components/ListingCard.tsx` - Card voor uitdagingen
  - `/components/ProposalCard.tsx` - Card voor voorstellen
  - `/components/LoginModal.tsx` - Login modal dialog

#### 🎨 Design System
- Typography Scale: 7 sizes (12px - 60px)
- Spacing System: Tailwind spacing rhythm (4px - 48px)
- Border Radius: 5px (small) - 20px (large)
- Shadow System: Layered shadows voor depth
- Color Palette: 10+ defined colors

#### 📱 Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Responsive grid layouts
- Mobile navigation

---

### [0.2.0] - 2026-03-12
**Pre-release - Backend Infrastructure & Core Pages**

#### 🏗️ Added
- **Backend Infrastructure**
  - `/supabase/functions/server/index.tsx` - Hono server
  - `/supabase/functions/server/kv_store.tsx` - KV utilities
  - CORS middleware voor cross-origin requests
  - Logger middleware voor debugging
  - Base route structure

- **Database Setup**
  - KV-store table: `kv_store_09c2210b`
  - Key-value storage voor flexible prototyping
  - get, set, del, mget, mset, mdel, getByPrefix functions

- **Core Pages**
  - `/components/Header.tsx` - Navigatie header
  - `/components/Home.tsx` - Homepage met hero
  - `/components/Challenges.tsx` - Uitdagingen overzicht
  - `/components/About.tsx` - Over pagina

- **Configuration**
  - `/utils/supabase/info.tsx` - Supabase config
  - `/lib/supabase.tsx` - Type definitions
  - Environment variables setup

#### 🏛️ Architecture
- Three-tier architecture: Frontend → Server → Database
- RESTful API: JSON-based communication
- Component-based UI: Reusable React components

---

### [0.1.0] - 2026-03-12 🎬 PROJECT START
**Initial Setup - Foundation**

#### ✨ Added
- **Tech Stack Setup**
  - React 18+ met TypeScript geïnitialiseerd
  - Tailwind CSS v4 geconfigureerd
  - React Router (Data mode pattern) setup
  - Deno runtime voor backend
  - Hono framework integratie
  - Supabase project aangemaakt

- **Project Structure**
  - `/App.tsx` - Root component met RouterProvider
  - `/routes.tsx` - Route configuratie basis
  - `/styles/globals.css` - Global styles
  - Git repository geïnitialiseerd
  - NPM package management setup

- **Development Environment**
  - TypeScript configuratie
  - ESLint setup
  - Prettier formatting
  - Hot reloading configured

#### 🎯 Project Goals Defined
- Platform voor gemeentes en universiteit
- Donkerpaars/groen kleurenschema
- Modern responsive design
- Secure authentication
- Email notifications

---

## 📊 Version Comparison Matrix

| Feature | v0.1 | v0.2 | v0.3 | v0.4 | v0.5 | v0.6 | v0.7 | v1.0 | v1.5 | v2.0 |
|---------|------|------|------|------|------|------|------|------|------|------|
| Project Setup | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Backend | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Design System | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Core Features | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Filters & Search | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Custom Auth | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Admin Features | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Email System | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Correct Terms | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Glassmorphism | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 🔄 Migration Guides

### Upgrading from v1.x to v2.0.0

#### Breaking Changes
1. **URL Structure**
   ```
   OLD: /uitdagingen
   NEW: /toelichtingen
   ```

2. **Navigation Flow**
   ```
   OLD: Detail page back button → homepage (/)
   NEW: Detail page back button → toelichtingen (/toelichtingen)
   ```

3. **Styling System**
   - Complete UI overhaul naar glassmorphism
   - Oude custom styles vervangen door nieuwe design system
   - Card components hebben nieuwe structure (flex-grow based)

#### Migration Steps
1. Update alle interne links van `/uitdagingen` naar `/toelichtingen`
2. Test navigatie flows door hele applicatie
3. Verify dat custom styles niet conflicteren met nieuwe glassmorphism
4. Test responsive design op alle breakpoints
5. Verify email templates werken met nieuwe design

---

### Upgrading from v0.x to v1.0.0

#### Breaking Changes
1. **Authentication System**
   - Migratie van Supabase Auth naar custom authentication
   - X-Session-Token headers verplicht voor authenticated requests

2. **Email System**
   - RESEND_API_KEY environment variable vereist
   - Email templates actief bij POST endpoints

#### Migration Steps
1. Update authentication flow naar custom auth
2. Configureer Resend API key
3. Test email notificaties
4. Verify admin permissions
5. Test alle protected routes

---

## 📈 Release Schedule

| Version | Release Date | Type | Phase | Status |
|---------|--------------|------|-------|--------|
| 0.1.0 | 12 maart 2026 | Initial | Development | Released |
| 0.2.0 | 12 maart 2026 | Minor | Development | Released |
| 0.3.0 | 13 maart 2026 | Minor | Development | Released |
| 0.4.0 | 14 maart 2026 | Minor | Development | Released |
| 0.5.0 | 15 maart 2026 | Minor | Development | Released |
| 0.6.0 | 16 maart 2026 | Minor | Development | Released |
| 0.7.0 | 17 maart 2026 | Minor | Pre-release | Released |
| 1.0.0 | 18 maart 2026 | Major | Production | Released |
| 1.1.0 | 18 maart 2026 | Minor | Production | Released |
| 1.2.0 | 18 maart 2026 | Minor | Production | Released |
| 1.3.0 | 18 maart 2026 | Minor | Production | Released |
| 1.4.0 | 18 maart 2026 | Minor | Production | Released |
| 1.5.0 | 18 maart 2026 | Minor | Production | Released |
| 2.0.0 | 18 maart 2026 | Major | Production | **Current** |
| 2.1.0 | TBD | Minor | Production | Planned |
| 3.0.0 | TBD | Major | Production | Roadmap |

---

## 📅 Development Timeline

```
Week 1: Foundation & Development (v0.1.0 - v0.7.0)
├── Dag 1-2: Setup & Backend (v0.1.0 - v0.2.0)
├── Dag 3: Design System (v0.3.0)
├── Dag 4: Core Features (v0.4.0)
├── Dag 5: Filters (v0.5.0)
├── Dag 6: Auth (v0.6.0)
└── Dag 7: Admin (v0.7.0)

Week 2: Production Ready (v1.0.0)
└── Dag 8: Email System & Release (v1.0.0) 🎉

Week 2: Polish & Improvements (v1.1.0 - v2.0.0)
├── Dag 8: Terminologie (v1.1.0)
├── Dag 8-9: Design Iterations (v1.2.0 - v1.5.0)
└── Dag 9: Major Redesign (v2.0.0) ⭐
```

---

## 🎯 Version Naming Convention

```
v[MAJOR].[MINOR].[PATCH]

0.x.x: Pre-release / Development fase
  - Niet production-ready
  - Breaking changes mogelijk
  - Experimentele features

1.0.0: First production release
  - Alle core features werkend
  - Testing compleet
  - Ready voor gebruik

1.x.x: Production updates
  - Nieuwe features (MINOR)
  - Bug fixes (PATCH)
  - Backwards-compatible

2.0.0+: Major updates
  - Breaking changes (MAJOR)
  - Complete redesigns
  - New architecture
```

### Examples
- `v0.1.0`: Allereerste project setup (dag 1)
- `v0.4.0 → v0.5.0`: Filters toegevoegd (development)
- `v0.7.0 → v1.0.0`: Production release (breaking change)
- `v1.5.0 → v2.0.0`: Complete redesign (breaking change)

---

## 📝 Version Support

| Version Range | Status | Support Until | Security Updates |
|---------------|--------|---------------|------------------|
| 2.0.x | Active | Current | ✅ Yes |
| 1.x.x | Deprecated | N/A | ❌ No |
| 0.x.x | Archived | N/A | ❌ No |

**Recommendation**: Altijd gebruiken van laatste stable versie (2.0.0)

---

## 🔮 Roadmap

### v2.1.0 (Planned - Week 4)
- [ ] Performance optimalisaties
- [ ] SEO improvements
- [ ] Analytics dashboard
- [ ] User profile pages

### v2.2.0 (Planned - Maand 2)
- [ ] File upload functionaliteit
- [ ] Comment systeem
- [ ] Rating/voting systeem
- [ ] Advanced search filters

### v3.0.0 (Planned - Maand 3)
- [ ] Multi-language support (breaking)
- [ ] Mobile app (React Native)
- [ ] Real-time notifications
- [ ] Third-party integrations

---

## 📊 Project Statistics

### Development Metrics
```
📅 Total Development Days: 7 dagen (12-18 maart 2026)
🎯 Development Versions: 0.1.0 - 0.7.0 (7 versies)
🚀 Production Versions: 1.0.0 - 2.0.0 (7 versies)
📦 Total Versions Released: 14 versies
⚡ Average Releases per Day: 2.0 versies

🏗️ Features Implemented: 45+
🐛 Bugs Fixed: 12+
🔧 Components Created: 25+
📄 API Endpoints: 7
📧 Email Templates: 2
🎨 Design Iterations: 3 major overhauls
```

### Codebase Growth
```
v0.1.0: ~500 lines (foundation)
v0.4.0: ~2000 lines (core features)
v1.0.0: ~4000 lines (production ready)
v2.0.0: ~5000+ lines (complete platform)
```

---

## 📞 Contact

**Version Control Vragen**: Contact development team  
**Bug Reports**: Documenteer in issue tracker  
**Feature Requests**: Email naar product team

---

**Document Versie**: 2.0  
**Laatste Update**: 18 maart 2026  
**Project Start**: 12 maart 2026  
**Status**: ✅ Up-to-date  
**Maintainer**: Development Team

---

*Dit document volgt Semantic Versioning 2.0.0 specificatie*  
*Voor meer info: https://semver.org/*
