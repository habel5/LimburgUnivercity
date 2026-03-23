// Note: All API calls go through custom server
// This file only contains TypeScript types and constants

// Database types
export type Category = 'duurzaamheid' | 'mobiliteit' | 'sociale-cohesie' | 'veiligheid' | 'innovatie' | 'overig';
export type Municipality =
  | 'beek'
  | 'beekdaelen'
  | 'beesel'
  | 'bergen'
  | 'brunssum'
  | 'echt-susteren'
  | 'eijsden-margraten'
  | 'gennep'
  | 'gulpen-wittem'
  | 'heerlen'
  | 'horst-aan-de-maas'
  | 'kerkrade'
  | 'landgraaf'
  | 'leudal'
  | 'maasgouw'
  | 'maastricht'
  | 'meerssen'
  | 'mook-en-middelaar'
  | 'nederweert'
  | 'peel-en-maas'
  | 'roerdalen'
  | 'roermond'
  | 'simpelveld'
  | 'sittard-geleen'
  | 'stein'
  | 'vaals'
  | 'valkenburg-aan-de-geul'
  | 'venlo'
  | 'venray'
  | 'voerendaal'
  | 'weert';

export interface Listing {
  id: string;
  title: string;
  description: string;
  category: Category;
  municipality: Municipality;
  author: string;
  email: string;
  organization?: string;
  created_at: string;
  proposal_count?: number;
}

export interface Proposal {
  id: string;
  challenge_id: string;
  title: string;
  description: string;
  author: string;
  organization: string;
  created_at: string;
}

export const categories: { value: Category; label: string }[] = [
  { value: 'duurzaamheid', label: 'Duurzaamheid' },
  { value: 'mobiliteit', label: 'Mobiliteit' },
  { value: 'sociale-cohesie', label: 'Sociale Cohesie' },
  { value: 'veiligheid', label: 'Veiligheid' },
  { value: 'innovatie', label: 'Innovatie' },
  { value: 'overig', label: 'Overig' },
];

export const municipalities: { value: Municipality; label: string }[] = [
  { value: 'beek', label: 'Beek' },
  { value: 'beekdaelen', label: 'Beekdaelen' },
  { value: 'beesel', label: 'Beesel' },
  { value: 'bergen', label: 'Bergen' },
  { value: 'brunssum', label: 'Brunssum' },
  { value: 'echt-susteren', label: 'Echt-Susteren' },
  { value: 'eijsden-margraten', label: 'Eijsden-Margraten' },
  { value: 'gennep', label: 'Gennep' },
  { value: 'gulpen-wittem', label: 'Gulpen-Wittem' },
  { value: 'heerlen', label: 'Heerlen' },
  { value: 'horst-aan-de-maas', label: 'Horst aan de Maas' },
  { value: 'kerkrade', label: 'Kerkrade' },
  { value: 'landgraaf', label: 'Landgraaf' },
  { value: 'leudal', label: 'Leudal' },
  { value: 'maasgouw', label: 'Maasgouw' },
  { value: 'maastricht', label: 'Maastricht' },
  { value: 'meerssen', label: 'Meerssen' },
  { value: 'mook-en-middelaar', label: 'Mook en Middelaar' },
  { value: 'nederweert', label: 'Nederweert' },
  { value: 'peel-en-maas', label: 'Peel en Maas' },
  { value: 'roerdalen', label: 'Roerdalen' },
  { value: 'roermond', label: 'Roermond' },
  { value: 'simpelveld', label: 'Simpelveld' },
  { value: 'sittard-geleen', label: 'Sittard-Geleen' },
  { value: 'stein', label: 'Stein' },
  { value: 'vaals', label: 'Vaals' },
  { value: 'valkenburg-aan-de-geul', label: 'Valkenburg aan de Geul' },
  { value: 'venlo', label: 'Venlo' },
  { value: 'venray', label: 'Venray' },
  { value: 'voerendaal', label: 'Voerendaal' },
  { value: 'weert', label: 'Weert' },
];

export const municipalityLabels: Record<Municipality, string> = Object.fromEntries(
  municipalities.map((municipality) => [municipality.value, municipality.label]),
) as Record<Municipality, string>;
