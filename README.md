
# Vraag en aanbod website

Deze app is geëxporteerd uit Figma AI en opgeschoond zodat je er gewoon in een code editor aan kunt werken en hem kunt uploaden naar GitHub.

De originele Figma-file staat hier:
[Vraag en aanbod website](https://www.figma.com/design/2pl4grdIbv6arH9lSLAvi9/Vraag-en-aanbod-website)

## Project starten

1. Installeer dependencies:

```bash
npm install
```

2. Maak een lokaal `.env` bestand op basis van `.env.example`.

3. Start de development server:

```bash
npm run dev
```

## Handige scripts

- `npm run dev` start Vite lokaal
- `npm run build` maakt een productiebuild
- `npm run preview` previewt de build lokaal
- `npm run typecheck` controleert TypeScript in je editor/CI

## Klaarmaken voor GitHub

Deze export is aangepast zodat:

- er nog maar een hoofdproject op root-niveau is
- editor-configuratie op root staat
- gevoelige Supabase-config via `.env` loopt
- `.gitignore` voorkomt dat lokale bestanden mee gecommit worden

Gebruik daarna:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <jouw-github-repo-url>
git push -u origin main
```

## Database koppelen

Deze app praat met een Supabase Edge Function en die slaat data op in een eenvoudige `kv_store_09c2210b` tabel.

1. Maak in Supabase een project aan.
2. Voer de SQL uit uit [supabase/setup.sql](/Users/dannyhabel/Downloads/Vraag en aanbod website (4)/supabase/setup.sql).
3. Zet in je lokale `.env`:

```bash
VITE_SUPABASE_PROJECT_ID=je-project-id
VITE_SUPABASE_ANON_KEY=je-anon-key
```

4. Deploy de edge function uit [supabase/functions/make-server-09c2210b/index.ts](/Users/dannyhabel/Downloads/Vraag en aanbod website (4)/supabase/functions/make-server-09c2210b/index.ts) met Supabase CLI.
5. Zet deze secrets op de function:

```bash
SUPABASE_URL=https://<project-id>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
ADMIN_EMAIL=<jouw-admin-email>
ADMIN_PASSWORD=<jouw-admin-wachtwoord>
RESEND_API_KEY=<optioneel>
```

Voorbeeldcommando's:

```bash
supabase login
supabase link --project-ref <project-id>
supabase db push
supabase secrets set SUPABASE_URL=https://<project-id>.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
supabase secrets set ADMIN_EMAIL=<jouw-admin-email>
supabase secrets set ADMIN_PASSWORD=<jouw-admin-wachtwoord>
supabase functions deploy make-server-09c2210b
```

Voor het deployen heb je ook een persoonlijke Supabase access token nodig voor de CLI:
`Supabase Dashboard > Account > Access Tokens`.
  
