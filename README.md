# LimburgUnivercity

LimburgUnivercity is een website waarop organisaties een case of vraag kunnen plaatsen. Andere gebruikers kunnen daarop reageren met een voorstel of idee.

De website heeft:
- een homepage
- een overzicht van alle cases
- een detailpagina per case
- een formulier om een nieuwe case te plaatsen
- een formulier om een voorstel in te dienen
- een admingedeelte voor beheer

## Waarvoor is dit project?

Dit project is bedoeld als online platform voor vraag en aanbod rondom maatschappelijke of organisatorische uitdagingen. Een organisatie plaatst een case en bezoekers kunnen daarop reageren.

Bij een nieuwe case gebeurt het volgende:
- de case wordt opgeslagen
- de beheerder kan daar een melding van krijgen
- de gebruiker kan een bevestigingsmail ontvangen

## Hoe open je de website lokaal op je eigen computer?

Als je de website lokaal wilt bekijken, volg dan deze stappen.

### Stap 1. Open het project in je code editor

Open de map van dit project in bijvoorbeeld Visual Studio Code.

### Stap 2. Open de terminal

Open in je editor de terminal.

### Stap 3. Installeer de benodigde bestanden

Voer dit commando uit:

```bash
npm install
```

Dit zorgt ervoor dat alle benodigde onderdelen van het project worden binnengehaald.

### Stap 4. Controleer het `.env` bestand

In de hoofdmap van het project hoort een `.env` bestand te staan.

Daarin staan de gegevens om verbinding te maken met de database:

```bash
VITE_SUPABASE_PROJECT_ID=je-project-id
VITE_SUPABASE_ANON_KEY=je-anon-key
```

Je kunt ook `.env.example` als voorbeeld gebruiken.

### Stap 5. Start de website

Voer dit commando uit:

```bash
npm run dev
```

Daarna verschijnt in de terminal een lokaal webadres, meestal:

```bash
http://localhost:3000/
```

Soms is poort `3000` al in gebruik. Dan kiest het project automatisch bijvoorbeeld:

```bash
http://localhost:3001/
```

Open dat adres in je browser om de website te bekijken.

## Handige commando's

```bash
npm run dev
```
Start de website lokaal.

```bash
npm run build
```
Controleert of het project klaar is om als productieversie gebouwd te worden.

```bash
npm run preview
```
Toont de gebouwde versie lokaal.

```bash
npm run typecheck
```
Controleert of er fouten in de code zitten.

## Belangrijke mappen

- `src/` bevat de website zelf
- `src/components/` bevat de pagina’s en onderdelen van de interface
- `supabase/` bevat de koppeling met de database en backendlogica

## Belangrijke pagina’s

- `/` homepage
- `/cases` overzichtspagina
- `/listing/:id` detailpagina van een case
- `/add` pagina om een case toe te voegen
- `/listing/:id/submit-proposal` pagina om een voorstel in te dienen
- `/admin` beheerpagina

## Extra documentatie

- [CHANGELOG.md](/Users/dannyhabel/Downloads/Vraag en aanbod website (4)/CHANGELOG.md)
- [EVIDENCE.md](/Users/dannyhabel/Downloads/Vraag en aanbod website (4)/EVIDENCE.md)
