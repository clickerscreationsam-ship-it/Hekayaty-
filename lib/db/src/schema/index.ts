// =============================================================================
// HEKAYATY — COMPLETE DATABASE SCHEMA
// Drizzle ORM · PostgreSQL
// =============================================================================

import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  pgEnum,
  serial,
  json,
  decimal,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

// ---------------------------------------------------------------------------
// ENUMS
// ---------------------------------------------------------------------------
export const userRoleEnum = pgEnum('user_role', [
  'reader',
  'writer',
  'publishing_house',
  'admin',
]);

export const contentClassificationEnum = pgEnum('content_classification', [
  'original',
  'hekayaty_selected',
  'official_collaboration',
]);

export const alignmentEnum = pgEnum('alignment', [
  'hero',
  'villain',
  'antihero',
  'neutral',
]);

export const worldAlignmentEnum = pgEnum('world_alignment', [
  'light',
  'dark',
  'neutral',
]);

export const comicStatusEnum = pgEnum('comic_status', [
  'ongoing',
  'completed',
  'hiatus',
]);

export const orderStatusEnum = pgEnum('order_status', [
  'pending',
  'paid',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
]);

export const subscriptionStatusEnum = pgEnum('subscription_status', [
  'active',
  'cancelled',
  'expired',
  'trial',
]);

export const timelineEraEnum = pgEnum('timeline_era', [
  'ancient',
  'classical',
  'modern',
  'future',
]);

export const timelineCategoryEnum = pgEnum('timeline_category', [
  'catastrophe',
  'creation',
  'conflict',
  'political',
  'discovery',
  'resurgence',
  'expansion',
]);

export const timelineImpactEnum = pgEnum('timeline_impact', [
  'minor',
  'major',
  'legendary',
]);

export const encyclopediaCategoryEnum = pgEnum('encyclopedia_category', [
  'artifact',
  'technology',
  'organization',
  'creature',
  'location',
]);

export const notificationTypeEnum = pgEnum('notification_type', [
  'new_chapter',
  'new_comic',
  'new_story',
  'system',
  'promotion',
]);

// ---------------------------------------------------------------------------
// USERS & AUTH
// ---------------------------------------------------------------------------
export const users = pgTable(
  'users',
  {
    id: serial('id').primaryKey(),
    email: text('email').notNull(),
    passwordHash: text('password_hash').notNull(),
    role: userRoleEnum('role').notNull().default('reader'),
    displayName: text('display_name').notNull(),
    avatarUrl: text('avatar_url'),
    bio: text('bio'),
    isEmailVerified: boolean('is_email_verified').notNull().default(false),
    emailVerificationToken: text('email_verification_token'),
    passwordResetToken: text('password_reset_token'),
    passwordResetExpiresAt: timestamp('password_reset_expires_at'),
    isActive: boolean('is_active').notNull().default(true),
    lastLoginAt: timestamp('last_login_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => ({
    emailIdx: uniqueIndex('users_email_idx').on(t.email),
  })
);

export const sessions = pgTable(
  'sessions',
  {
    id: text('id').primaryKey(), // UUID
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    token: text('token').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
  },
  (t) => ({
    tokenIdx: uniqueIndex('sessions_token_idx').on(t.token),
    userIdx: index('sessions_user_idx').on(t.userId),
  })
);

// ---------------------------------------------------------------------------
// CONTENT — WORLDS
// ---------------------------------------------------------------------------
export const worlds = pgTable('worlds', {
  id: text('id').primaryKey(), // e.g. 'w1'
  nameEn: text('name_en').notNull(),
  nameAr: text('name_ar').notNull(),
  descriptionEn: text('description_en').notNull(),
  descriptionAr: text('description_ar').notNull(),
  ruler: text('ruler'),
  rulerAr: text('ruler_ar'),
  alignment: worldAlignmentEnum('alignment').notNull().default('neutral'),
  climate: text('climate'),
  climateAr: text('climate_ar'),
  history: text('history'),
  historyAr: text('history_ar'),
  imageUrl: text('image_url'),
  notableLocations: json('notable_locations').$type<
    Array<{ nameAr: string; nameEn: string; descriptionAr: string }>
  >(),
  organizations: json('organizations').$type<
    Array<{ nameAr: string; descriptionAr: string }>
  >(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// CONTENT — CHARACTERS
// ---------------------------------------------------------------------------
export const characters = pgTable('characters', {
  id: text('id').primaryKey(),
  nameEn: text('name_en').notNull(),
  nameAr: text('name_ar').notNull(),
  alias: text('alias'),
  aliasAr: text('alias_ar'),
  alignment: alignmentEnum('alignment').notNull().default('hero'),
  worldId: text('world_id').references(() => worlds.id),
  bioEn: text('bio_en'),
  bioAr: text('bio_ar'),
  originEn: text('origin_en'),
  originAr: text('origin_ar'),
  powers: json('powers').$type<string[]>(),
  powersAr: json('powers_ar').$type<string[]>(),
  weaknesses: json('weaknesses').$type<string[]>(),
  weaknessesAr: json('weaknesses_ar').$type<string[]>(),
  affiliations: json('affiliations').$type<string[]>(),
  affiliationsAr: json('affiliations_ar').$type<string[]>(),
  relatedCharacterIds: json('related_character_ids').$type<string[]>(),
  stats: json('stats').$type<{
    strength: number;
    speed: number;
    durability: number;
    intelligence: number;
    magic: number;
    combat: number;
  }>(),
  imageUrl: text('image_url'),
  classification: contentClassificationEnum('classification').notNull().default('original'),
  createdBy: text('created_by'),
  firstAppearance: text('first_appearance'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// CONTENT — SERIES
// ---------------------------------------------------------------------------
export const series = pgTable('series', {
  id: text('id').primaryKey(),
  titleAr: text('title_ar').notNull(),
  titleEn: text('title_en').notNull(),
  descriptionAr: text('description_ar'),
  coverImageUrl: text('cover_image_url'),
  classification: contentClassificationEnum('classification').notNull().default('original'),
  createdBy: text('created_by'),
  worldId: text('world_id').references(() => worlds.id),
  genres: json('genres').$type<string[]>(),
  genresAr: json('genres_ar').$type<string[]>(),
  status: comicStatusEnum('status').notNull().default('ongoing'),
  issueCount: integer('issue_count').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// CONTENT — COMICS
// ---------------------------------------------------------------------------
export const comics = pgTable('comics', {
  id: text('id').primaryKey(),
  seriesId: text('series_id').references(() => series.id),
  titleAr: text('title_ar').notNull(),
  titleEn: text('title_en').notNull(),
  issueNumber: integer('issue_number').notNull().default(1),
  synopsisAr: text('synopsis_ar'),
  synopsisEn: text('synopsis_en'),
  writer: text('writer'),
  artist: text('artist'),
  year: integer('year'),
  month: integer('month'),
  genres: json('genres').$type<string[]>(),
  genresAr: json('genres_ar').$type<string[]>(),
  coverImageUrl: text('cover_image_url'),
  characterIds: json('character_ids').$type<string[]>(),
  worldId: text('world_id').references(() => worlds.id),
  rating: decimal('rating', { precision: 3, scale: 2 }),
  pageCount: integer('page_count').notNull().default(0),
  classification: contentClassificationEnum('classification').notNull().default('original'),
  createdBy: text('created_by'),
  previousIssueId: text('previous_issue_id'),
  nextIssueId: text('next_issue_id'),
  isFeatured: boolean('is_featured').notNull().default(false),
  isNew: boolean('is_new').notNull().default(false),
  // Access control
  isFree: boolean('is_free').notNull().default(true),
  priceEgp: decimal('price_egp', { precision: 10, scale: 2 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Comic pages (each page is an image URL)
export const comicPages = pgTable(
  'comic_pages',
  {
    id: serial('id').primaryKey(),
    comicId: text('comic_id')
      .notNull()
      .references(() => comics.id, { onDelete: 'cascade' }),
    pageNumber: integer('page_number').notNull(),
    imageUrl: text('image_url').notNull(),
  },
  (t) => ({
    comicPageIdx: index('comic_pages_comic_idx').on(t.comicId),
  })
);

// ---------------------------------------------------------------------------
// CONTENT — STORIES (Illustrated Prose)
// ---------------------------------------------------------------------------
export const stories = pgTable('stories', {
  id: text('id').primaryKey(),
  titleAr: text('title_ar').notNull(),
  titleEn: text('title_en').notNull(),
  author: text('author'),
  authorAr: text('author_ar'),
  synopsisAr: text('synopsis_ar'),
  coverImageUrl: text('cover_image_url'),
  genres: json('genres').$type<string[]>(),
  genresAr: json('genres_ar').$type<string[]>(),
  classification: contentClassificationEnum('classification').notNull().default('original'),
  characterIds: json('character_ids').$type<string[]>(),
  worldId: text('world_id').references(() => worlds.id),
  wordCount: integer('word_count'),
  readTimeMinutes: integer('read_time_minutes'),
  year: integer('year'),
  isFeatured: boolean('is_featured').notNull().default(false),
  isNew: boolean('is_new').notNull().default(false),
  content: text('content'),
  // Access control
  isFree: boolean('is_free').notNull().default(true),
  priceEgp: decimal('price_egp', { precision: 10, scale: 2 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// CONTENT — TIMELINE EVENTS
// ---------------------------------------------------------------------------
export const timelineEvents = pgTable('timeline_events', {
  id: text('id').primaryKey(),
  titleAr: text('title_ar').notNull(),
  titleEn: text('title_en').notNull(),
  year: text('year').notNull(),
  era: timelineEraEnum('era').notNull(),
  descriptionAr: text('description_ar'),
  descriptionEn: text('description_en'),
  category: timelineCategoryEnum('category').notNull(),
  characterIds: json('character_ids').$type<string[]>(),
  worldIds: json('world_ids').$type<string[]>(),
  comicIds: json('comic_ids').$type<string[]>(),
  imageUrl: text('image_url'),
  impact: timelineImpactEnum('impact').notNull().default('minor'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// CONTENT — ENCYCLOPEDIA
// ---------------------------------------------------------------------------
export const encyclopediaEntries = pgTable('encyclopedia_entries', {
  id: text('id').primaryKey(),
  titleAr: text('title_ar').notNull(),
  titleEn: text('title_en').notNull(),
  category: encyclopediaCategoryEnum('category').notNull(),
  descriptionAr: text('description_ar'),
  descriptionEn: text('description_en'),
  tags: json('tags').$type<string[]>(),
  relatedEntryIds: json('related_entry_ids').$type<string[]>(),
  relatedCharacterIds: json('related_character_ids').$type<string[]>(),
  relatedWorldIds: json('related_world_ids').$type<string[]>(),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// CONTENT — NEWS & EVENTS
// ---------------------------------------------------------------------------
export const newsArticles = pgTable('news_articles', {
  id: text('id').primaryKey(),
  titleAr: text('title_ar').notNull(),
  titleEn: text('title_en'),
  summaryAr: text('summary_ar'),
  contentAr: text('content_ar'),
  imageUrl: text('image_url'),
  tags: json('tags').$type<string[]>(),
  publishedAt: timestamp('published_at').notNull().defaultNow(),
  isFeatured: boolean('is_featured').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const events = pgTable('events', {
  id: text('id').primaryKey(),
  titleAr: text('title_ar').notNull(),
  titleEn: text('title_en'),
  descriptionAr: text('description_ar'),
  imageUrl: text('image_url'),
  eventDate: timestamp('event_date'),
  location: text('location'),
  registrationUrl: text('registration_url'),
  isOnline: boolean('is_online').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// CARD GAME
// ---------------------------------------------------------------------------
export const cardGameCards = pgTable('card_game_cards', {
  id: text('id').primaryKey(),
  nameAr: text('name_ar').notNull(),
  nameEn: text('name_en').notNull(),
  type: text('type').notNull(), // hero, villain, spell, artifact
  rarity: text('rarity').notNull(), // common, rare, epic, legendary
  characterId: text('character_id').references(() => characters.id),
  imageUrl: text('image_url'),
  stats: json('stats').$type<Record<string, number>>(),
  abilities: json('abilities').$type<string[]>(),
  flavorTextAr: text('flavor_text_ar'),
  priceEgp: decimal('price_egp', { precision: 10, scale: 2 }),
  stockCount: integer('stock_count').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// CREATORS (Writers / Publishing Houses)
// ---------------------------------------------------------------------------
export const creators = pgTable('creators', {
  id: text('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  nameAr: text('name_ar').notNull(),
  nameEn: text('name_en').notNull(),
  type: text('type').notNull(), // writer | publishing_house
  bio: text('bio'),
  avatarUrl: text('avatar_url'),
  isVerified: boolean('is_verified').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// USER ENGAGEMENT
// ---------------------------------------------------------------------------
export const readingProgress = pgTable(
  'reading_progress',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    contentType: text('content_type').notNull(), // 'comic' | 'story'
    contentId: text('content_id').notNull(),
    progress: integer('progress').notNull().default(0), // page number or percentage
    isCompleted: boolean('is_completed').notNull().default(false),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => ({
    userContentIdx: uniqueIndex('reading_progress_user_content_idx').on(
      t.userId,
      t.contentType,
      t.contentId
    ),
  })
);

export const favorites = pgTable(
  'favorites',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    contentType: text('content_type').notNull(),
    contentId: text('content_id').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => ({
    userContentFavIdx: uniqueIndex('favorites_user_content_idx').on(
      t.userId,
      t.contentType,
      t.contentId
    ),
  })
);

export const collections = pgTable('collections', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  nameAr: text('name_ar').notNull(),
  contentIds: json('content_ids').$type<{ type: string; id: string }[]>(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// COMMERCE — ORDERS
// ---------------------------------------------------------------------------
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  contentType: text('content_type').notNull(), // 'comic' | 'story' | 'card' | 'subscription_plan'
  contentId: text('content_id').notNull(),
  nameAr: text('name_ar').notNull(),
  nameEn: text('name_en'),
  priceEgp: decimal('price_egp', { precision: 10, scale: 2 }).notNull(),
  isDigital: boolean('is_digital').notNull().default(true),
  stockCount: integer('stock_count'), // null = unlimited digital
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  status: orderStatusEnum('status').notNull().default('pending'),
  totalEgp: decimal('total_egp', { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text('payment_method'),
  paymentRef: text('payment_ref'),
  shippingAddress: json('shipping_address').$type<Record<string, string>>(),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const orderItems = pgTable(
  'order_items',
  {
    id: serial('id').primaryKey(),
    orderId: integer('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    productId: integer('product_id')
      .notNull()
      .references(() => products.id),
    quantity: integer('quantity').notNull().default(1),
    unitPriceEgp: decimal('unit_price_egp', { precision: 10, scale: 2 }).notNull(),
  },
  (t) => ({
    orderIdx: index('order_items_order_idx').on(t.orderId),
  })
);

// Content entitlements (what user owns/can access)
export const entitlements = pgTable(
  'entitlements',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    contentType: text('content_type').notNull(),
    contentId: text('content_id').notNull(),
    source: text('source').notNull(), // 'purchase' | 'subscription' | 'free' | 'admin_grant'
    expiresAt: timestamp('expires_at'), // null = permanent
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => ({
    userContentEntIdx: uniqueIndex('entitlements_user_content_idx').on(
      t.userId,
      t.contentType,
      t.contentId
    ),
  })
);

// ---------------------------------------------------------------------------
// SUBSCRIPTIONS
// ---------------------------------------------------------------------------
export const subscriptionPlans = pgTable('subscription_plans', {
  id: serial('id').primaryKey(),
  nameAr: text('name_ar').notNull(),
  nameEn: text('name_en').notNull(),
  priceEgpMonthly: decimal('price_egp_monthly', { precision: 10, scale: 2 }).notNull(),
  priceEgpYearly: decimal('price_egp_yearly', { precision: 10, scale: 2 }),
  features: json('features').$type<string[]>(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const subscriptions = pgTable('subscriptions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  planId: integer('plan_id')
    .notNull()
    .references(() => subscriptionPlans.id),
  status: subscriptionStatusEnum('status').notNull().default('active'),
  currentPeriodStart: timestamp('current_period_start').notNull(),
  currentPeriodEnd: timestamp('current_period_end').notNull(),
  cancelledAt: timestamp('cancelled_at'),
  paymentRef: text('payment_ref'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// NOTIFICATIONS
// ---------------------------------------------------------------------------
export const notifications = pgTable(
  'notifications',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: notificationTypeEnum('type').notNull(),
    titleAr: text('title_ar').notNull(),
    bodyAr: text('body_ar'),
    linkUrl: text('link_url'),
    isRead: boolean('is_read').notNull().default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => ({
    userNotifIdx: index('notifications_user_idx').on(t.userId, t.isRead),
  })
);

// ---------------------------------------------------------------------------
// AUDIT LOG
// ---------------------------------------------------------------------------
export const auditLogs = pgTable(
  'audit_logs',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id),
    action: text('action').notNull(),
    resourceType: text('resource_type'),
    resourceId: text('resource_id'),
    metadata: json('metadata'),
    ipAddress: text('ip_address'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => ({
    auditUserIdx: index('audit_logs_user_idx').on(t.userId),
    auditCreatedIdx: index('audit_logs_created_idx').on(t.createdAt),
  })
);

// ---------------------------------------------------------------------------
// INSERT/SELECT SCHEMAS (Zod)
// ---------------------------------------------------------------------------
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const selectUserSchema = createSelectSchema(users);
export type InsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const insertWorldSchema = createInsertSchema(worlds).omit({ createdAt: true, updatedAt: true });
export type InsertWorld = typeof worlds.$inferInsert;
export type World = typeof worlds.$inferSelect;

export const insertCharacterSchema = createInsertSchema(characters).omit({ createdAt: true, updatedAt: true });
export type InsertCharacter = typeof characters.$inferInsert;
export type Character = typeof characters.$inferSelect;

export const insertComicSchema = createInsertSchema(comics).omit({ createdAt: true, updatedAt: true });
export type InsertComic = typeof comics.$inferInsert;
export type Comic = typeof comics.$inferSelect;

export const insertStorySchema = createInsertSchema(stories).omit({ createdAt: true, updatedAt: true });
export type InsertStory = typeof stories.$inferInsert;
export type Story = typeof stories.$inferSelect;

export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertOrder = typeof orders.$inferInsert;
export type Order = typeof orders.$inferSelect;

export { };
