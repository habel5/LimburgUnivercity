# Changelog

Alle noemenswaardige wijzigingen in dit project worden hier bijgehouden.

## [Unreleased]

## [0.3.1] - 2026-05-12

### Changed
- Paginatitel gewijzigd naar "Limburg Univercity" in `index.html`
- Terminologie "challenge" consequent vervangen door "voorstel" door de hele applicatie
  - `Home.tsx`: stats balk, "Hoe werkt het?" sectie en "Voor wie" sectie
  - `ListingDetail.tsx`: teller, sectietitel, lege states en knopteksten
  - `SubmitProposal.tsx`: paginatitel, formulierlabels, knopteksten en toastmeldingen
  - `ListingCard.tsx`: voorstelenteller op de kaartjes
  - `About.tsx`: stats balk label

### Verified
- `npm run typecheck` — geen fouten

## [0.3.0] - 2026-04-17

### Added
- Rolgebaseerde accounts voor admin, gemeente en onderwijs (`Add role-based accounts`)
- Cases bewerken vanuit het adminpanel (`Add case editing in admin panel`)
- Limburgse gemeenten toegevoegd als filteropties (`Add Limburg municipalities`)

### Changed
- Vista-thema toegepast op de volledige UI (`Apply Vista theme`)
- Navbar volledig herontworpen met responsief gedrag (`Redesign navbar layout`)
- Vista-kleuren en gemeente-terminologie verfijnd (`Refine Vista colors`)
- Over-pagina banner bijgewerkt en knoppen verbeterd (`Update about banner`)
- Login placeholder en onderwijs-label verfijnd (`Refine login placeholder`)
- Lichtere stijl en homepage aanpassingen (`Lighter style, homepage aanpassingen`)
- "Toelichtingen" hernoemd naar "cases" door de hele applicatie

### Fixed
- Admin sessiebeheer en het verwijderen van cases gehardend (`Harden admin session handling`)
- Laadprestaties verbeterd en admin dataloading gehardend (`Improve load performance`)
- Casenavigatie en scrollgedrag verbeterd (`Polish case navigation`)

### Verified
- `npm run typecheck`
- `npm run build`

## [0.2.0] - 2026-03-20

### Added
- Supabase projectkoppeling voor frontend via `.env`
- Deploybare Supabase Edge Function in `supabase/functions/make-server-09c2210b/`
- Database-migratie voor `kv_store_09c2210b`
- E-mailflow voor adminmelding en gebruikersbevestiging bij nieuwe cases

### Changed
- Projectstructuur opgeschoond naar een normale Vite/React structuur
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
