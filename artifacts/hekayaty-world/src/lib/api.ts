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
  ReadingProgress,
  CollectionItem,
} from '../types';
import { getAuthToken } from './localStorage';

const BASE_URL = '/api';

async function safeFetch<T>(url: string, options?: RequestInit, fallback?: T): Promise<T> {
  try {
    const token = typeof window !== 'undefined' ? getAuthToken() : null;
    const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

    const res = await fetch(url, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...(options?.headers || {}),
      },
      ...options,
    });
    if (!res.ok) {
      if (fallback !== undefined) return fallback;
      throw new Error(`API error: ${res.status} ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    if (fallback !== undefined) return fallback;
    throw err;
  }
}

export const api = {
  // Worlds
  async getWorlds(): Promise<World[]> {
    return safeFetch<World[]>(`${BASE_URL}/worlds`, {}, []);
  },
  async getWorld(id: string): Promise<World | undefined> {
    return safeFetch<World>(`${BASE_URL}/worlds/${id}`, {}, undefined);
  },

  // Characters
  async getCharacters(params?: { worldId?: string; alignment?: string; classification?: string }): Promise<Character[]> {
    const query = new URLSearchParams(params as any).toString();
    const url = `${BASE_URL}/characters${query ? `?${query}` : ''}`;
    return safeFetch<Character[]>(url, {}, []);
  },
  async getCharacter(id: string): Promise<Character | undefined> {
    return safeFetch<Character>(`${BASE_URL}/characters/${id}`, {}, undefined);
  },

  // Series
  async getSeries(): Promise<Series[]> {
    return safeFetch<Series[]>(`${BASE_URL}/series`, {}, []);
  },
  async getSeriesById(id: string): Promise<Series | undefined> {
    return safeFetch<Series>(`${BASE_URL}/series/${id}`, {}, undefined);
  },

  // Comics
  async getComics(params?: { seriesId?: string; worldId?: string; featured?: boolean }): Promise<Comic[]> {
    const query = new URLSearchParams(params as any).toString();
    const url = `${BASE_URL}/comics${query ? `?${query}` : ''}`;
    return safeFetch<Comic[]>(url, {}, []);
  },
  async getComic(id: string): Promise<Comic | undefined> {
    return safeFetch<Comic>(`${BASE_URL}/comics/${id}`, {}, undefined);
  },
  async getComicPages(id: string) {
    return safeFetch<{ comicId: string; titleAr: string; totalPages: number; pages: any[] }>(
      `${BASE_URL}/comics/${id}/pages`,
      {},
      { comicId: id, titleAr: '', totalPages: 0, pages: [] }
    );
  },

  // Stories
  async getStories(params?: { worldId?: string; featured?: boolean }): Promise<Story[]> {
    const query = new URLSearchParams(params as any).toString();
    const url = `${BASE_URL}/stories${query ? `?${query}` : ''}`;
    return safeFetch<Story[]>(url, {}, []);
  },
  async getStory(id: string): Promise<Story | undefined> {
    return safeFetch<Story>(`${BASE_URL}/stories/${id}`, {}, undefined);
  },

  // Timeline
  async getTimeline(params?: { era?: string; category?: string }): Promise<TimelineEvent[]> {
    const query = new URLSearchParams(params as any).toString();
    const url = `${BASE_URL}/timeline${query ? `?${query}` : ''}`;
    return safeFetch<TimelineEvent[]>(url, {}, []);
  },

  // Encyclopedia
  async getEncyclopedia(params?: { category?: string }): Promise<EncyclopediaEntry[]> {
    const query = new URLSearchParams(params as any).toString();
    const url = `${BASE_URL}/encyclopedia${query ? `?${query}` : ''}`;
    return safeFetch<EncyclopediaEntry[]>(url, {}, []);
  },
  async getEncyclopediaById(id: string): Promise<EncyclopediaEntry | undefined> {
    return safeFetch<EncyclopediaEntry>(`${BASE_URL}/encyclopedia/${id}`, {}, undefined);
  },

  // News & Events (legacy events - kept for news page compatibility)
  async getNews(): Promise<NewsArticle[]> {
    return safeFetch<NewsArticle[]>(`${BASE_URL}/news`, {}, []);
  },
  async getEventsLegacy(): Promise<Event[]> {
    return safeFetch<Event[]>(`${BASE_URL}/events`, {}, []);
  },

  // Card Game
  async getCards(): Promise<CardGameCard[]> {
    return safeFetch<CardGameCard[]>(`${BASE_URL}/cards`, {}, []);
  },

  // Creators
  async getCreators(): Promise<Creator[]> {
    return safeFetch<Creator[]>(`${BASE_URL}/creators`, {}, []);
  },

  // Store & Commerce
  async getProducts() {
    return safeFetch<any[]>(`${BASE_URL}/shop/products`, {}, []);
  },
  async checkout(payload: { items: any[]; shippingAddress?: any; paymentMethod?: string }) {
    return safeFetch<any>(`${BASE_URL}/orders/checkout`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  async getOrders() {
    return safeFetch<any[]>(`${BASE_URL}/orders`, {}, []);
  },
  async getPlans() {
    return safeFetch<any[]>(`${BASE_URL}/subscriptions/plans`, {}, []);
  },
  async subscribe(planId: string) {
    return safeFetch<any>(`${BASE_URL}/subscriptions/subscribe`, {
      method: 'POST',
      body: JSON.stringify({ planId }),
    });
  },

  // Auth
  async register(data: { email: string; password: string; displayName: string; role?: string }) {
    return safeFetch<any>(`${BASE_URL}/auth/register`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async login(data: { email: string; password: string }) {
    return safeFetch<any>(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async getMe() {
    return safeFetch<{ user: any; isAuthenticated: boolean; subscription?: any }>(
      `${BASE_URL}/auth/me`,
      {},
      { user: null, isAuthenticated: false }
    );
  },
  async logout() {
    return safeFetch<any>(`${BASE_URL}/auth/logout`, { method: 'POST' });
  },
  async forgotPassword(email: string) {
    return safeFetch<any>(`${BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },
  async resetPassword(data: { newPassword: string; accessToken?: string }) {
    return safeFetch<any>(`${BASE_URL}/auth/reset-password`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async changePassword(data: { currentPassword: string; newPassword: string }) {
    return safeFetch<any>(`${BASE_URL}/auth/change-password`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async updateProfile(data: { displayName?: string; bio?: string; avatarUrl?: string }) {
    return safeFetch<any>(`${BASE_URL}/auth/profile`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  async deactivateAccount() {
    return safeFetch<any>(`${BASE_URL}/auth/account`, {
      method: 'DELETE',
    });
  },

  // Editorial & Submissions (Writers & Admin)
  async getSubmissions() {
    return safeFetch<any[]>(`${BASE_URL}/editorial/submissions`, {}, []);
  },
  async createSubmission(data: { title: string; type: 'comic' | 'story'; synopsis: string }) {
    return safeFetch<any>(`${BASE_URL}/editorial/submissions`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async updateSubmissionStatus(id: string, status: string, feedback?: string) {
    return safeFetch<any>(`${BASE_URL}/editorial/submissions/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, feedback }),
    });
  },

  // Admin User & Permissions Management
  async getAdminUsers() {
    return safeFetch<any[]>(`${BASE_URL}/admin/users`, {}, []);
  },
  async updateUserRole(id: string, role: string) {
    return safeFetch<any>(`${BASE_URL}/admin/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  },
  async updateAdminUserStatus(id: string, isActive: boolean) {
    return safeFetch<any>(`${BASE_URL}/admin/users/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ isActive }),
    });
  },

  // Enterprise Admin Command Center & Operations
  async getAdminOverview() {
    return safeFetch<any>(`${BASE_URL}/admin/overview`, {}, null);
  },
  async getAdminWorlds() {
    return safeFetch<any[]>(`${BASE_URL}/admin/worlds`, {}, []);
  },
  async createAdminWorld(data: any) {
    return safeFetch<any>(`${BASE_URL}/admin/worlds`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async updateAdminWorld(id: string, data: any) {
    return safeFetch<any>(`${BASE_URL}/admin/worlds/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  async deleteAdminWorld(id: string) {
    return safeFetch<any>(`${BASE_URL}/admin/worlds/${id}`, { method: 'DELETE' });
  },

  async getAdminCharacters() {
    return safeFetch<any[]>(`${BASE_URL}/admin/characters`, {}, []);
  },
  async createAdminCharacter(data: any) {
    return safeFetch<any>(`${BASE_URL}/admin/characters`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async updateAdminCharacter(id: string, data: any) {
    return safeFetch<any>(`${BASE_URL}/admin/characters/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  async deleteAdminCharacter(id: string) {
    return safeFetch<any>(`${BASE_URL}/admin/characters/${id}`, { method: 'DELETE' });
  },

  async getAdminComics() {
    return safeFetch<any[]>(`${BASE_URL}/admin/comics`, {}, []);
  },
  async createAdminComic(data: any) {
    return safeFetch<any>(`${BASE_URL}/admin/comics`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async updateAdminComic(id: string, data: any) {
    return safeFetch<any>(`${BASE_URL}/admin/comics/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  async deleteAdminComic(id: string) {
    return safeFetch<any>(`${BASE_URL}/admin/comics/${id}`, { method: 'DELETE' });
  },

  async getAdminStories() {
    return safeFetch<any[]>(`${BASE_URL}/admin/stories`, {}, []);
  },
  async createAdminStory(data: any) {
    return safeFetch<any>(`${BASE_URL}/admin/stories`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async updateAdminStory(id: string, data: any) {
    return safeFetch<any>(`${BASE_URL}/admin/stories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  async deleteAdminStory(id: string) {
    return safeFetch<any>(`${BASE_URL}/admin/stories/${id}`, { method: 'DELETE' });
  },

  // Chapter Management for Novels & Books
  async getAdminChapters(storyId: string) {
    return safeFetch<any>(`${BASE_URL}/admin/stories/${storyId}/chapters`, {}, { storyId, totalChapters: 0, chapters: [] });
  },
  async createAdminChapter(storyId: string, data: any) {
    return safeFetch<any>(`${BASE_URL}/admin/stories/${storyId}/chapters`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async updateAdminChapter(storyId: string, chapterId: string, data: any) {
    return safeFetch<any>(`${BASE_URL}/admin/stories/${storyId}/chapters/${chapterId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  async deleteAdminChapter(storyId: string, chapterId: string) {
    return safeFetch<any>(`${BASE_URL}/admin/stories/${storyId}/chapters/${chapterId}`, {
      method: 'DELETE',
    });
  },
  async reorderAdminChapters(storyId: string, orderedChapterIds: string[]) {
    return safeFetch<any>(`${BASE_URL}/admin/stories/${storyId}/chapters/reorder`, {
      method: 'PUT',
      body: JSON.stringify({ orderedChapterIds }),
    });
  },
  async reorderAdminComicPages(comicId: string, pageOrders: { id: number; page_number: number }[]) {
    return safeFetch<any>(`${BASE_URL}/admin/comics/${comicId}/pages/reorder`, {
      method: 'PUT',
      body: JSON.stringify({ pageOrders }),
    });
  },
  async bulkUpdatePublicationStatus(ids: string[], status: string, type: 'comic' | 'story') {
    return safeFetch<any>(`${BASE_URL}/admin/publications/bulk-status`, {
      method: 'POST',
      body: JSON.stringify({ ids, status, type }),
    });
  },
  async getPublicStoryChapters(storyId: string) {
    return safeFetch<any>(`${BASE_URL}/stories/${storyId}/chapters`, {}, { storyId, totalChapters: 0, chapters: [] });
  },

  async getAdminIpRecords() {
    return safeFetch<any[]>(`${BASE_URL}/admin/ip-records`, {}, []);
  },
  async createAdminIpRecord(data: any) {
    return safeFetch<any>(`${BASE_URL}/admin/ip-records`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getAdminCreatorApplications() {
    return safeFetch<any[]>(`${BASE_URL}/admin/creator-applications`, {}, []);
  },
  async resolveAdminCreatorApplication(userId: string, data: { decision: string; requestedType: string; feedbackNotes?: string }) {
    return safeFetch<any>(`${BASE_URL}/admin/creator-applications/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async getAdminFinancials() {
    return safeFetch<any>(`${BASE_URL}/admin/financials/overview`, {}, null);
  },
  async createAdminExpense(data: any) {
    return safeFetch<any>(`${BASE_URL}/admin/financials/expenses`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getAdminProducts() {
    return safeFetch<any[]>(`${BASE_URL}/admin/products`, {}, []);
  },
  async createAdminProduct(data: any) {
    return safeFetch<any>(`${BASE_URL}/admin/products`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async updateAdminProduct(id: string, data: any) {
    return safeFetch<any>(`${BASE_URL}/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  async deleteAdminProduct(id: string) {
    return safeFetch<any>(`${BASE_URL}/admin/products/${id}`, { method: 'DELETE' });
  },

  async getAdminAuditLogs() {
    return safeFetch<any[]>(`${BASE_URL}/admin/audit-logs`, {}, []);
  },
  async adminGlobalSearch(q: string) {
    return safeFetch<any>(`${BASE_URL}/admin/search?q=${encodeURIComponent(q)}`, {}, {
      users: [],
      comics: [],
      stories: [],
      characters: [],
      worlds: [],
    });
  },

  // Series Studio
  async getAdminSeries() {
    return safeFetch<any[]>(`${BASE_URL}/admin/series`, {}, []);
  },
  async createAdminSeries(data: any) {
    return safeFetch<any>(`${BASE_URL}/admin/series`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async updateAdminSeries(id: string, data: any) {
    return safeFetch<any>(`${BASE_URL}/admin/series/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  async deleteAdminSeries(id: string) {
    return safeFetch<any>(`${BASE_URL}/admin/series/${id}`, { method: 'DELETE' });
  },

  // Comic Pages Studio
  async getAdminComicPages(comicId: string) {
    return safeFetch<any[]>(`${BASE_URL}/admin/comics/${comicId}/pages`, {}, []);
  },
  async createAdminComicPages(comicId: string, data: any) {
    return safeFetch<any>(`${BASE_URL}/admin/comics/${comicId}/pages`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async deleteAdminComicPage(comicId: string, pageId: string) {
    return safeFetch<any>(`${BASE_URL}/admin/comics/${comicId}/pages/${pageId}`, { method: 'DELETE' });
  },

  // Powers Studio
  async getAdminPowers() {
    return safeFetch<any[]>(`${BASE_URL}/admin/powers`, {}, []);
  },
  async createAdminPower(data: any) {
    return safeFetch<any>(`${BASE_URL}/admin/powers`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Timeline Studio
  async getAdminTimeline() {
    return safeFetch<any[]>(`${BASE_URL}/admin/timeline`, {}, []);
  },
  async createAdminTimeline(data: any) {
    return safeFetch<any>(`${BASE_URL}/admin/timeline`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async updateAdminTimeline(id: string, data: any) {
    return safeFetch<any>(`${BASE_URL}/admin/timeline/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  async deleteAdminTimeline(id: string) {
    return safeFetch<any>(`${BASE_URL}/admin/timeline/${id}`, { method: 'DELETE' });
  },

  // Creators & Accounts Directory
  async getAdminCreatorsDirectory() {
    return safeFetch<{
      registeredAccounts: any[];
      standaloneCreators: any[];
      allWriters: any[];
      allPublishingHouses: any[];
    }>(`${BASE_URL}/admin/creators-directory`, {}, {
      registeredAccounts: [],
      standaloneCreators: [],
      allWriters: [],
      allPublishingHouses: [],
    });
  },

  // Creator Onboarding Application
  async applyCreator(data: { type: string; portfolioUrl?: string; bio?: string }) {
    return safeFetch<any>(`${BASE_URL}/creators/apply`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // User Data Sync (Reading Progress & Favorites)
  async getProgress(): Promise<ReadingProgress[]> {
    return safeFetch<ReadingProgress[]>(`${BASE_URL}/user/progress`, {}, []);
  },
  async saveProgress(entry: { contentType: string; contentId: string; progress: number; isCompleted?: boolean }) {
    return safeFetch<any>(`${BASE_URL}/user/progress`, {
      method: 'POST',
      body: JSON.stringify(entry),
    });
  },
  async saveReadingProgress(entry: { contentType: string; contentId: string; progress: number; isCompleted?: boolean }) {
    return this.saveProgress(entry);
  },
  async getFavorites(): Promise<CollectionItem[]> {
    return safeFetch<CollectionItem[]>(`${BASE_URL}/user/favorites`, {}, []);
  },
  async toggleFavorite(contentType: string, contentId: string) {
    return safeFetch<{ favorited: boolean; count: number }>(`${BASE_URL}/user/favorites/toggle`, {
      method: 'POST',
      body: JSON.stringify({ contentType, contentId }),
    });
  },
  async getCollections() {
    return safeFetch<any[]>(`${BASE_URL}/user/collections`, {}, []);
  },
  async getNotifications() {
    return safeFetch<any[]>(`${BASE_URL}/user/notifications`, {}, []);
  },
  async markNotificationAsRead(id: string) {
    return safeFetch<any>(`${BASE_URL}/user/notifications/${id}/read`, { method: 'POST', body: JSON.stringify({}) });
  },
  async markAllNotificationsAsRead() {
    return safeFetch<any>(`${BASE_URL}/user/notifications/read-all`, { method: 'POST', body: JSON.stringify({}) });
  },
  async updateAdminComicStatus(id: string, status: string) {
    return safeFetch<any>(`${BASE_URL}/admin/comics/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },
  async updateAdminStoryStatus(id: string, status: string) {
    return safeFetch<any>(`${BASE_URL}/admin/stories/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  // Cloudinary Direct Upload
  async uploadMedia(image: string, folder = 'general'): Promise<{ url: string; publicId: string } | null> {
    return safeFetch<{ url: string; publicId: string }>(`${BASE_URL}/upload`, {
      method: 'POST',
      body: JSON.stringify({ image, folder }),
    });
  },

  // ── Events & Carnivals ──────────────────────────────────────────────────────
  async getEvents(filters?: { type?: string; status?: string }): Promise<any[]> {
    const q = filters ? new URLSearchParams(filters as any).toString() : '';
    return safeFetch<any[]>(`${BASE_URL}/events${q ? `?${q}` : ''}`, {}, []);
  },
  async getEventDetail(slug: string): Promise<any | null> {
    return safeFetch<any>(`${BASE_URL}/events/${slug}`, {}, null);
  },
  async registerForEvent(slug: string): Promise<any> {
    return safeFetch<any>(`${BASE_URL}/events/${slug}/register`, { method: 'POST', body: JSON.stringify({}) });
  },
  async submitCompetitionEntry(slug: string, compId: string, data: any): Promise<any> {
    return safeFetch<any>(`${BASE_URL}/events/${slug}/competitions/${compId}/submit`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async castVote(slug: string, roundId: string, optionId: string): Promise<any> {
    return safeFetch<any>(`${BASE_URL}/events/${slug}/voting/${roundId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ optionId }),
    });
  },
  async verifyCertificate(certId: string): Promise<any> {
    return safeFetch<any>(`${BASE_URL}/events/awards/verify/${certId}`, {}, null);
  },

  // ── Admin Events ────────────────────────────────────────────────────────────
  async adminCreateEvent(data: any): Promise<any> {
    return safeFetch<any>(`${BASE_URL}/admin/events`, { method: 'POST', body: JSON.stringify(data) });
  },
  async adminListEvents(): Promise<any[]> {
    return safeFetch<any[]>(`${BASE_URL}/events`, {}, []);
  },
  async adminCreateCompetition(eventId: string, data: any): Promise<any> {
    return safeFetch<any>(`${BASE_URL}/admin/events/${eventId}/competitions`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async adminCreateVotingRound(eventId: string, data: any): Promise<any> {
    return safeFetch<any>(`${BASE_URL}/admin/events/${eventId}/voting-rounds`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async adminIssueAward(eventId: string, data: any): Promise<any> {
    return safeFetch<any>(`${BASE_URL}/admin/events/${eventId}/awards`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async adminPublishAnnouncement(eventId: string, data: any): Promise<any> {
    return safeFetch<any>(`${BASE_URL}/admin/events/${eventId}/announcements`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async publishAdminPublication(id: string, type: 'story' | 'comic'): Promise<any> {
    return safeFetch<any>(`${BASE_URL}/admin/publications/${id}/publish`, {
      method: 'POST',
      body: JSON.stringify({ type }),
    });
  },
};
