import { useQuery } from '@tanstack/react-query';
import { api } from './api';
import type {
  World,
  Character,
  Series,
  Comic,
  Story,
  TimelineEvent,
  EncyclopediaEntry,
  NewsArticle,
  Event,
  CardGameCard,
  Creator,
} from '@/types';

export function useWorlds() {
  return useQuery<World[]>({
    queryKey: ['worlds'],
    queryFn: () => api.getWorlds(),
    staleTime: 1000 * 60,
  });
}

export function useWorld(id: string) {
  return useQuery<World | undefined>({
    queryKey: ['world', id],
    queryFn: () => api.getWorld(id),
    staleTime: 1000 * 60,
  });
}

export function useCharacters(params?: { worldId?: string; alignment?: string; classification?: string }) {
  return useQuery<Character[]>({
    queryKey: ['characters', params],
    queryFn: () => api.getCharacters(params),
    staleTime: 1000 * 60,
  });
}

export function useCharacter(id: string) {
  return useQuery<Character | undefined>({
    queryKey: ['character', id],
    queryFn: () => api.getCharacter(id),
    staleTime: 1000 * 60,
  });
}

export function useComics(params?: { seriesId?: string; worldId?: string; featured?: boolean }) {
  return useQuery<Comic[]>({
    queryKey: ['comics', params],
    queryFn: () => api.getComics(params),
    staleTime: 1000 * 60,
  });
}

export function useComic(id: string) {
  return useQuery<Comic | undefined>({
    queryKey: ['comic', id],
    queryFn: () => api.getComic(id),
    staleTime: 1000 * 60,
  });
}

export function useSeries() {
  return useQuery<Series[]>({
    queryKey: ['series'],
    queryFn: () => api.getSeries(),
    staleTime: 1000 * 60,
  });
}

export function useSeriesById(id: string) {
  return useQuery<Series | undefined>({
    queryKey: ['series', id],
    queryFn: () => api.getSeriesById(id),
    staleTime: 1000 * 60,
  });
}

export function useStories(params?: { worldId?: string; featured?: boolean }) {
  return useQuery<Story[]>({
    queryKey: ['stories', params],
    queryFn: () => api.getStories(params),
    staleTime: 1000 * 60,
  });
}

export function useStory(id: string) {
  return useQuery<Story | undefined>({
    queryKey: ['story', id],
    queryFn: () => api.getStory(id),
    staleTime: 1000 * 60,
  });
}

export function useTimeline(params?: { era?: string; category?: string }) {
  return useQuery<TimelineEvent[]>({
    queryKey: ['timeline', params],
    queryFn: () => api.getTimeline(params),
    staleTime: 1000 * 60,
  });
}

export function useEncyclopedia(params?: { category?: string }) {
  return useQuery<EncyclopediaEntry[]>({
    queryKey: ['encyclopedia', params],
    queryFn: () => api.getEncyclopedia(params),
    staleTime: 1000 * 60,
  });
}

export function useEncyclopediaById(id: string) {
  return useQuery<EncyclopediaEntry | undefined>({
    queryKey: ['encyclopedia', id],
    queryFn: () => api.getEncyclopediaById(id),
    staleTime: 1000 * 60,
  });
}

export function useNews() {
  return useQuery<NewsArticle[]>({
    queryKey: ['news'],
    queryFn: () => api.getNews(),
    staleTime: 1000 * 60,
  });
}

export function useEvents() {
  return useQuery<Event[]>({
    queryKey: ['events'],
    queryFn: () => api.getEvents(),
    staleTime: 1000 * 60,
  });
}

export function useCards() {
  return useQuery<CardGameCard[]>({
    queryKey: ['cards'],
    queryFn: () => api.getCards(),
    staleTime: 1000 * 60,
  });
}

export function useCreators() {
  return useQuery<Creator[]>({
    queryKey: ['creators'],
    queryFn: () => api.getCreators(),
    staleTime: 1000 * 60,
  });
}
