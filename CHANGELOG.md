# Changelog

Alle noemenswaardige wijzigingen in dit project worden hier bijgehouden.

## [Unreleased]

## [0.2.0] - 2026-03-20

### Added
- Supabase projectkoppeling voor frontend via `.env`
- Deploybare Supabase Edge Function in `supabase/functions/make-server-09c2210b/`
- Database-migratie voor `kv_store_09c2210b`
- E-mailflow voor adminmelding en gebruikersbevestiging bij nieuwe cases

### Changed
- Figma AI export opgeschoond naar een normale Vite/React projectstructuur
- TypeScript- en Vite-config naar rootniveau verplaatst
- Imports met Figma-versies omgezet naar standaard npm-imports
- Gevoelige configuratie verplaatst naar environment variables

### Verified
- `npm run build`
- `npm run typecheck`
- Live login naar Supabase Edge Function
- Live schrijftest naar de gekoppelde database

## [0.1.0] - 2026-03-20

### Added
- Eerste opgeschoonde projectversie geschikt voor lokaal ontwikkelen
- Git-repository en GitHub-koppeling
