// Note: All API calls go through custom server
// This file only contains TypeScript types and constants

// Database types
export type Category = 'duurzaamheid' | 'mobiliteit' | 'sociale-cohesie' | 'veiligheid' | 'innovatie' | 'overig';
export type Municipality = 'maastricht' | 'heerlen' | 'sittard-geleen' | 'venlo' | 'roermond';

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
  { value: 'maastricht', label: 'Maastricht' },
  { value: 'heerlen', label: 'Heerlen' },
  { value: 'sittard-geleen', label: 'Sittard-Geleen' },
  { value: 'venlo', label: 'Venlo' },
  { value: 'roermond', label: 'Roermond' },
];
