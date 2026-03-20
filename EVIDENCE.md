# Evidence Overview

Dit document bundelt de belangrijkste opleverpunten van het project voor demonstratie, beoordeling of verantwoording.

## Projectstatus

- Projectnaam: `LimburgUnivercity`
- Repository: `https://github.com/habel5/LimburgUnivercity`
- Frontend: Vite + React + TypeScript
- Backend: Supabase Edge Function
- Databaseopslag: `kv_store_09c2210b`

## Opgeleverde onderdelen

### 1. Project opgeschoond voor lokaal ontwikkelen
- Figma AI export opgeschoond naar een bruikbare codebase
- Rootconfiguratie ingericht voor Vite en TypeScript
- Project lokaal buildbaar en typecheckbaar gemaakt

### 2. Git en GitHub ingericht
- Lokale git repository geïnitialiseerd
- Remote repository gekoppeld aan GitHub
- Project gepusht naar `main`

### 3. Databasekoppeling ingericht
- Frontend gekoppeld aan Supabase project `usabeotxmrcwcfrrzmkv`
- Supabase function gedeployed naar het gekoppelde project
- Database-migratie toegevoegd voor sleutel-waarde opslag

### 4. Authenticatie ingericht
- Admin login gekoppeld aan Supabase Edge Function
- Sessies worden opgeslagen in de database

### 5. E-mailflow ingericht
- Nieuwe toelichting verstuurt een notificatie naar de admin
- Nieuwe toelichting verstuurt een bevestiging naar de opgegeven contactpersoon
- Backend ondersteunt Resend secrets voor live e-mailverzending

## Uitgevoerde controles

- Lokale frontend gestart via Vite
- Productiebouw succesvol uitgevoerd met `npm run build`
- TypeScript-controle succesvol uitgevoerd met `npm run typecheck`
- Health-check van de live function succesvol
- Live login-test succesvol
- Live schrijftest naar Supabase succesvol

## Relevante bestanden

- `README.md`
- `CHANGELOG.md`
- `supabase/functions/make-server-09c2210b/index.ts`
- `supabase/migrations/20260320092300_create_kv_store.sql`
- `src/config/env.ts`

## Bewijslast in git

De voortgang is zichtbaar in afzonderlijke commits, waaronder:

- opschonen van de Figma-export
- toevoegen van de Supabase backend en mailflow
- toevoegen van projectdocumentatie en bewijsdocumenten

Voor volgende wijzigingen geldt: elke functionele wijziging wordt als aparte commit vastgelegd.
