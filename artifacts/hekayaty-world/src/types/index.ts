export type ContentClassification =
  | 'original'
  | 'official_collaboration'
  | 'hekayaty_selected'
  | 'community_creation';

export type Alignment = 'hero' | 'villain' | 'antihero' | 'neutral';

export interface Character {
  id: string;
  nameAr: string;
  nameEn: string;
  alias: string;
  aliasAr: string;
  alignment: Alignment;
  worldId: string;
  bioAr: string;
  bioEn: string;
  originAr: string;
  originEn: string;
  powers: string[];
  powersAr: string[];
  weaknesses: string[];
  weaknessesAr: string[];
  affiliations: string[];
  affiliationsAr: string[];
  relatedCharacterIds: string[];
  comicIds: string[];
  timelineEventIds: string[];
  stats: {
    strength: number;
    speed: number;
    durability: number;
    intelligence: number;
    magic: number;
    combat: number;
    powerRating?: number;
  };
  powerRating?: number;
  image: string;
  classification: ContentClassification;
  createdBy?: string;
  firstAppearance?: string;
}

export interface World {
  id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  ruler: string;
  rulerAr: string;
  notableLocations: Array<{
    nameAr: string;
    nameEn: string;
    descriptionAr: string;
  }>;
  history: string;
  historyAr: string;
  organizations: Array<{
    nameAr: string;
    descriptionAr: string;
  }>;
  characterIds: string[];
  comicIds: string[];
  timelineEventIds: string[];
  image: string;
  alignment: 'light' | 'dark' | 'neutral';
  climate?: string;
  climateAr?: string;
}

export interface Series {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  coverImage: string;
  classification: ContentClassification;
  createdBy?: string;
  worldId?: string;
  genres: string[];
  genresAr: string[];
  status: 'ongoing' | 'completed' | 'upcoming';
  issueCount: number;
}

export interface Comic {
  id: string;
  seriesId: string;
  titleAr: string;
  titleEn: string;
  issueNumber: number;
  synopsisAr: string;
  synopsisEn: string;
  writer: string;
  artist: string;
  year: number;
  month?: number;
  genres: string[];
  genresAr: string[];
  coverImage: string;
  characterIds: string[];
  worldId: string;
  rating: number;
  pageCount: number;
  pages?: string[];
  classification: ContentClassification;
  createdBy?: string;
  originalCreator?: string;
  previousIssueId?: string;
  nextIssueId?: string;
  isFeatured?: boolean;
  isNew?: boolean;
}

export interface Story {
  id: string;
  titleAr: string;
  titleEn: string;
  author: string;
  authorAr: string;
  synopsisAr: string;
  content?: string;
  coverImage: string;
  genres: string[];
  genresAr: string[];
  classification: ContentClassification;
  characterIds: string[];
  worldId?: string;
  wordCount?: number;
  readTimeMinutes?: number;
  year: number;
  isFeatured?: boolean;
  isNew?: boolean;
  seriesName?: string;
  seriesNameAr?: string;
  partNumber?: number;
  originalCreator?: string;
}

export interface TimelineEvent {
  id: string;
  titleAr: string;
  titleEn: string;
  year: string;
  era: 'ancient' | 'classical' | 'modern' | 'future';
  descriptionAr: string;
  descriptionEn: string;
  category:
    | 'conflict'
    | 'creation'
    | 'expansion'
    | 'resurgence'
    | 'discovery'
    | 'catastrophe'
    | 'political';
  characterIds: string[];
  worldIds: string[];
  comicIds: string[];
  image?: string;
  impact: 'major' | 'minor' | 'legendary';
}

export interface EncyclopediaEntry {
  id: string;
  titleAr: string;
  titleEn: string;
  category:
    | 'artifact'
    | 'organization'
    | 'location'
    | 'creature'
    | 'technology'
    | 'concept'
    | 'power';
  descriptionAr: string;
  descriptionEn: string;
  tags: string[];
  relatedEntryIds: string[];
  relatedCharacterIds: string[];
  relatedWorldIds: string[];
  image?: string;
}

export interface NewsArticle {
  id: string;
  titleAr: string;
  titleEn: string;
  date: string;
  author: string;
  summaryAr: string;
  summaryEn: string;
  contentAr: string;
  image: string;
  category:
    | 'comics'
    | 'characters'
    | 'events'
    | 'announcements'
    | 'selected'
    | 'community';
  isFeatured?: boolean;
  relatedComicIds?: string[];
  relatedCharacterIds?: string[];
}

export interface Event {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  date: string;
  endDate?: string;
  type: 'release' | 'community' | 'collaboration' | 'competition';
  image: string;
  isUpcoming: boolean;
  relatedIds?: string[];
}

export interface CardGameCard {
  id: string;
  nameAr: string;
  nameEn: string;
  characterId?: string;
  type: 'hero' | 'villain' | 'location' | 'event' | 'artifact';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  attack?: number;
  defense?: number;
  magic?: number;
  abilityAr: string;
  image: string;
  worldId?: string;
  flavorTextAr?: string;
}

export interface Creator {
  id: string;
  nameAr: string;
  nameEn: string;
  bio: string;
  bioAr: string;
  avatar: string;
  speciality: string[];
  works: string[];
  profileId?: string;
  role?: 'writer' | 'publishing_house' | 'creator';
}

export interface ReadingProgress {
  comicId: string;
  lastPage: number;
  totalPages: number;
  lastRead: string;
  completed: boolean;
}

export interface CollectionItem {
  id: string;
  type: 'comic' | 'character' | 'world' | 'story';
  addedAt: string;
}
