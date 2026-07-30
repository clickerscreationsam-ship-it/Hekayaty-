export interface Character {
  id: string;
  name: string;
  arabicName: string;
  alias: string;
  alignment: 'Hero' | 'Villain' | 'Antihero' | 'Neutral';
  worldId: string;
  shortBio: string;
  fullBio: string;
  originStory: string;
  powers: string[];
  weaknesses: string[];
  affiliations: string[];
  stats: {
    strength: number;
    speed: number;
    durability: number;
    intelligence: number;
    magic: number;
    combat: number;
  };
  image: string;
}

export interface World {
  id: string;
  name: string;
  arabicName: string;
  description: string;
  ruler: string;
  notableLocations: string[];
  image: string;
}

export interface Comic {
  id: string;
  title: string;
  issueNumber: number;
  series: string;
  worldId: string;
  writer: string;
  artist: string;
  year: number;
  genre: string[];
  synopsis: string;
  coverImage: string;
  characters: string[]; // character IDs
  rating: number;
}

export interface TimelineEvent {
  id: string;
  title: string;
  year: string; // E.g. "3000 B.C.", "2050 A.D."
  description: string;
  category: 'War' | 'Discovery' | 'Birth' | 'Cataclysm';
  relatedCharacters: string[];
  relatedWorlds: string[];
}

export interface EncyclopediaEntry {
  id: string;
  title: string;
  category: 'Power' | 'Artifact' | 'Creature' | 'Organization' | 'Place';
  description: string;
  tags: string[];
}

export interface NewsArticle {
  id: string;
  title: string;
  date: string;
  author: string;
  summary: string;
  content: string;
  image: string;
  category: string;
}
