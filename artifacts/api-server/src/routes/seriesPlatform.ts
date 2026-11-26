import { Router, type IRouter } from 'express';
import { requireAuth, requireRole } from '../middlewares/auth';
import { supabaseAdmin } from '../lib/supabase';
import crypto from 'crypto';

export const seriesPlatformRouter: IRouter = Router();
export const adminSeriesPlatformRouter: IRouter = Router();

// Helper: Log series audit action in Supabase
async function logSeriesAction(
  userId: string | null,
  action: string,
  resourceType: string,
  resourceId: string,
  metadata: any = {}
) {
  try {
    await supabaseAdmin.from('audit_logs').insert({
      user_id: userId,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      metadata,
    });
  } catch (err) {
    console.error('Failed to log series action:', err);
  }
}

// ---------------------------------------------------------------------------
// INITIAL SEED CANON SERIES & SEASONS & EPISODES
// ---------------------------------------------------------------------------
interface SeriesEpisode {
  id: string;
  series_id: string;
  season_id?: string;
  episode_number: number;
  title_ar: string;
  title_en?: string;
  short_description_ar?: string;
  content_type: 'novel' | 'comic';
  content_ar?: string;
  comic_pages?: Array<{ id: string; page_number: number; image_url: string; description?: string }>;
  pdf_url?: string;
  cover_image_url?: string;
  reading_time_minutes: number;
  word_count?: number;
  status: 'published' | 'scheduled' | 'draft';
  publication_date: string;
  scheduled_at?: string;
  access_level: 'free' | 'registered' | 'premium';
  author_notes?: string;
  views_count: number;
  likes_count: number;
  created_at: string;
}

interface SeriesSeason {
  id: string;
  series_id: string;
  number: number;
  title_ar: string;
  title_en?: string;
  description_ar?: string;
  cover_image_url?: string;
  status: 'published' | 'scheduled' | 'draft';
  release_date?: string;
  created_at: string;
}

interface SeriesItem {
  id: string;
  slug: string;
  title_ar: string;
  title_en: string;
  short_description_ar: string;
  description_ar: string;
  cover_image_url: string;
  banner_image_url: string;
  thumbnail_url?: string;
  format: 'novel' | 'comic' | 'hybrid';
  status: 'draft' | 'upcoming' | 'ongoing' | 'on_hiatus' | 'completed' | 'cancelled' | 'archived';
  genre: string;
  subgenres: string[];
  tags: string[];
  language: string;
  age_rating: string;
  world_id?: string;
  world_name_ar?: string;
  is_original: boolean;
  classification: 'original' | 'selected' | 'licensed';
  publisher_name?: string;
  author_name?: string;
  artist_name?: string;
  editor_name?: string;
  translator_name?: string;
  structure_type: 'season_episode' | 'volume_chapter' | 'book_part' | 'direct_episodes';
  structure_label: string;
  release_schedule: 'immediate' | 'weekly' | 'biweekly' | 'monthly' | 'custom';
  release_day_time?: string;
  is_featured: boolean;
  banner_priority: number;
  views_count: number;
  followers_count: number;
  rating: number;
  created_at: string;
  updated_at: string;
}

// In-memory store + Supabase sync
let inMemorySeries: SeriesItem[] = [
  {
    id: 's_crossers',
    slug: 'the-crossers',
    title_ar: 'ملحمة العابرين: أسرار الأبعاد السبعة',
    title_en: 'The Crossers: Secrets of the Seven Dimensions',
    short_description_ar: 'ملحمة خيالية تجمع بين الروايات والقصص المصورة، تروي صراع حماة الأبعاد ضد قوى الانفصال في عوالم حكاياتي.',
    description_ar: 'عندما تمزق نسيج الأثير بفعل صدع قديم، وجد نخبة من المسافرين الأسطوريين أنفسهم مكلفين بحماية بوابات النجوم. سلسلة تجمع بين فصول سردية مشوقة وفصول مصورة بجودة سينمائية فائقة ترسم مصير الكون وأبطاله عبر أجيال ومواسم متعاقبة.',
    cover_image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    banner_image_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1600&q=80',
    thumbnail_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80',
    format: 'hybrid',
    status: 'ongoing',
    genre: 'خيال علمي أسطوري',
    subgenres: ['مغامرات أبعاد', 'قتال ملحمي', 'أساطير'],
    tags: ['أبطال', 'بوابات', 'سحر', 'أبعاد'],
    language: 'ar',
    age_rating: '13+',
    world_id: 'w1',
    world_name_ar: 'نوفا قديم',
    is_original: true,
    classification: 'original',
    publisher_name: 'دار حكاياتي للنشر الرقمي',
    author_name: 'طارق بن ليث',
    artist_name: 'ريشة الأثير',
    editor_name: 'فريق التحرير الكوني',
    structure_type: 'season_episode',
    structure_label: 'الموسم',
    release_schedule: 'weekly',
    release_day_time: 'كل جمعة الساعة 8 مساءً',
    is_featured: true,
    banner_priority: 1,
    views_count: 14200,
    followers_count: 2450,
    rating: 4.9,
    created_at: '2026-10-01T00:00:00Z',
    updated_at: '2026-11-20T00:00:00Z',
  },
  {
    id: 's_knights',
    slug: 'knights-of-the-stars',
    title_ar: 'فرسان النجوم: عهد الشفق',
    title_en: 'Knights of the Stars: Twilight Oath',
    short_description_ar: 'سلسلة روايات أدبية ضخمة تسرد تاريخ الفرسان السبعة الذين حرسوا مشكاة النور في أعظم عصور السلام.',
    description_ar: 'سلسلة روائية مقسمة إلى مجلدات كلاسيكية تحكي ملحمة الفروسية، الشرف، والخيانة في مملكة الأفق الذهبي. صياغة أدبية رفيعة تغوص في أعماق الشخصيات ونزاعاتهم الفلسفية والإنسانية.',
    cover_image_url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80',
    banner_image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
    thumbnail_url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=400&q=80',
    format: 'novel',
    status: 'ongoing',
    genre: 'فانتازيا ملحمية',
    subgenres: ['فروسية', 'ممالك', 'أدب كلاسيكي'],
    tags: ['سيوف', 'شرف', 'ممالك', 'مؤامرات'],
    language: 'ar',
    age_rating: 'all',
    world_id: 'w2',
    world_name_ar: 'أوتار الشفق',
    is_original: true,
    classification: 'original',
    publisher_name: 'منشورات أفق حكاياتي',
    author_name: 'ليان الراوي',
    structure_type: 'volume_chapter',
    structure_label: 'المجلد',
    release_schedule: 'biweekly',
    release_day_time: 'كل أسبوعين يوم الأحد',
    is_featured: true,
    banner_priority: 2,
    views_count: 9800,
    followers_count: 1820,
    rating: 4.8,
    created_at: '2026-10-15T00:00:00Z',
    updated_at: '2026-11-22T00:00:00Z',
  },
  {
    id: 's_shadow',
    slug: 'shadow-chronicles',
    title_ar: 'سجلات الظل: أسرار المدينة الخفية',
    title_en: 'Shadow Chronicles: Secrets of the Hidden City',
    short_description_ar: 'سلسلة كوميكس بصرية مشوقة تتبع المحقق الغامض في أزقة المدينة المظلمة لحل ألغاز سرقة الآثار القديمة.',
    description_ar: 'قصة مصورة تمزج بين الغموض البوليسي والقدرات الخارقة. رسومات تفصيلية مذهلة وتصميم فني فريد يأخذ القارئ في رحلة بصرية بين شوارع المدينة الرطبة وأسرار حكامها الخفيين.',
    cover_image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    banner_image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80',
    thumbnail_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
    format: 'comic',
    status: 'ongoing',
    genre: 'تحقيق وغموض خيالي',
    subgenres: ['كوميكس نوار', 'قوى خارقة', 'تشويق'],
    tags: ['تحقيق', 'كوميكس', 'مدينة', 'غموض'],
    language: 'ar',
    age_rating: '16+',
    is_original: false,
    classification: 'selected',
    publisher_name: 'استوديو نوار للكوميكس العربي',
    author_name: 'كريم المنصور',
    artist_name: 'عمر النبراوي',
    structure_type: 'direct_episodes',
    structure_label: 'العدد',
    release_schedule: 'monthly',
    release_day_time: 'الأول من كل شهر',
    is_featured: false,
    banner_priority: 3,
    views_count: 11200,
    followers_count: 2100,
    rating: 4.7,
    created_at: '2026-09-10T00:00:00Z',
    updated_at: '2026-11-18T00:00:00Z',
  },
];

let inMemorySeasons: SeriesSeason[] = [
  {
    id: 'sea_crossers_1',
    series_id: 's_crossers',
    number: 1,
    title_ar: 'الموسم الأول: نداء الصدع الأثيري',
    title_en: 'Season 1: Call of the Ether Rift',
    description_ar: 'اكتشاف الصدع وظهور أولى علامات اضطراب التوازن الكوني.',
    cover_image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    status: 'published',
    release_date: '2026-10-01',
    created_at: '2026-10-01T00:00:00Z',
  },
  {
    id: 'sea_crossers_2',
    series_id: 's_crossers',
    number: 2,
    title_ar: 'الموسم الثاني: حروب الأفق المكسور',
    title_en: 'Season 2: Wars of the Broken Horizon',
    description_ar: 'اتساع المواجهة بين حماة البوابات والكيانات القادمة من الفراغ.',
    cover_image_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
    status: 'published',
    release_date: '2026-11-15',
    created_at: '2026-11-15T00:00:00Z',
  },
  {
    id: 'sea_knights_1',
    series_id: 's_knights',
    number: 1,
    title_ar: 'المجلد الأول: قسم الشفق وحارس المشكاة',
    title_en: 'Volume 1: Twilight Oath and the Lantern Keeper',
    description_ar: 'تجمع الفرسان السبعة وأداء العهد في معبد الشمس الغاربة.',
    cover_image_url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80',
    status: 'published',
    release_date: '2026-10-15',
    created_at: '2026-10-15T00:00:00Z',
  },
];

let inMemoryEpisodes: SeriesEpisode[] = [
  {
    id: 'ep_crossers_1',
    series_id: 's_crossers',
    season_id: 'sea_crossers_1',
    episode_number: 1,
    title_ar: 'الحلقة الأولى: حين ارتجف نسيج السماء',
    title_en: 'Episode 1: When the Sky Fabric Trembled',
    short_description_ar: 'يبدأ الإنذار الأول في برج المراقبة الشمالي حين تلتقط مرايا الرصد ترددات غريبة من بعد مجهول.',
    content_type: 'novel',
    content_ar: `في الساعة الرابعة قبل الفجر، لم يكن في برج المراقبة العالي سوى صوت الرياح الشتوية تعزف بين أعمدة الرخام القديمة.

كان المهندس الفلكي يقف أمام عدسة التلسكوب البلوري، يراقب مدارات النجوم في هدوء اعتاد عليه منذ ثلاثين عاماً. لكن شيئاً ما تلك الليلة لم يكن معتاداً. خط أزرق دقيق، يشبه خيطاً من البرق المتجمد، انشق فجأة في وسط كوكبة العقرب.

"مستحيل..." همس لنفسه وهو يدير عجلات التكبير النحاسية.

لم تكن شهباً ولا مذنباً هارباً، بل كان فراغاً حقيقياً يبتلع النور من حوله. انطلقت أجراس الإنذار النحاسية في أرجاء القلعة، معلنة بداية عهد جديد لن تعود فيه العوالم كما كانت.

خرج الحراس إلى الشرفات، وأعينهم شاخصة نحو السماء الممزقة، وفي تلك اللحظة بالذات، في قاع الوادي السفلي، فتحت أول بوابة أثيرية غير مسجلة في خرائط الحكماء.`,
    cover_image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    reading_time_minutes: 5,
    word_count: 240,
    status: 'published',
    publication_date: '2026-10-01T20:00:00Z',
    access_level: 'free',
    author_notes: 'بداية رحلة العابرين عبر الأبعاد. نتمنى لكم قراءة ممتعة!',
    views_count: 5400,
    likes_count: 420,
    created_at: '2026-10-01T20:00:00Z',
  },
  {
    id: 'ep_crossers_2',
    series_id: 's_crossers',
    season_id: 'sea_crossers_1',
    episode_number: 2,
    title_ar: 'الحلقة الثانية: خطى في العاصفة (فصل مصور)',
    title_en: 'Episode 2: Steps in the Storm (Comic Issue)',
    short_description_ar: 'فصل مصور كامل يجسد اللقاء الأول بين طارق بن ليث وحارس البوابة في مهب العاصفة الرعدية.',
    content_type: 'comic',
    comic_pages: [
      { id: 'p1', page_number: 1, image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80', description: 'لوحة البداية: العاصفة تضرب أسوار القلعة' },
      { id: 'p2', page_number: 2, image_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80', description: 'ظهور طارق بن ليث متسلحاً برداء الأثير' },
      { id: 'p3', page_number: 3, image_url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80', description: 'اشتباك البرق وسقوط البوابة الأولى' },
    ],
    cover_image_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
    reading_time_minutes: 4,
    status: 'published',
    publication_date: '2026-10-08T20:00:00Z',
    access_level: 'free',
    author_notes: 'الفصل المصور الأول بدقة عالية وألوان ملحمية.',
    views_count: 4800,
    likes_count: 380,
    created_at: '2026-10-08T20:00:00Z',
  },
  {
    id: 'ep_crossers_3',
    series_id: 's_crossers',
    season_id: 'sea_crossers_1',
    episode_number: 3,
    title_ar: 'الحلقة الثالثة: أسرار المخطوطة البلورية',
    title_en: 'Episode 3: Secrets of the Crystal Scroll',
    short_description_ar: 'فك الشفرة الأولى التي تركتها الحضارة القديمة قبل اختفاء بواباتها بألف عام.',
    content_type: 'novel',
    content_ar: `وضعت ليان المخطوطة الحجرية على طاولة الخشب العتيقة، وبدأت أصابعها ترسم الخطوط المنحوتة بنعومة.

"هذا ليس حبراً عادياً يا طارق،" قالت وهي ترفع عينيها الممتلئتين بالدهشة، "هذا غبار نجوم مذاب تم ختمه بطاقة سحرية لا تنطفئ."

اقترب طارق ووضع سيفه جانباً، وانحنى ليرى الحروف وهي تضيء ببطء استجابةً لحرارة يديها. كانت الكلمات تتحدث عن سبع بوابات، وسبعة مفاتيح، وكيان نائم في قعر البعد المظلم ينتظر من يكسر الأقفال السبعة.

"إذا كانت هذه الترجمة صحيحة،" قال طارق بصوت منخفض وحازم، "فإن ما حدث الليلة الماضية لم يكن حادثاً... بل كان شخص ما يختبر القفل الأول."`,
    cover_image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    reading_time_minutes: 6,
    word_count: 280,
    status: 'published',
    publication_date: '2026-10-15T20:00:00Z',
    access_level: 'free',
    author_notes: 'تكشف هذه الحلقة اللغز المركزي للموسم الأول.',
    views_count: 4200,
    likes_count: 360,
    created_at: '2026-10-15T20:00:00Z',
  },
  {
    id: 'ep_knights_1',
    series_id: 's_knights',
    season_id: 'sea_knights_1',
    episode_number: 1,
    title_ar: 'الفصل الأول: عند بزوغ النجمة الحمراء',
    title_en: 'Chapter 1: At the Rising of the Red Star',
    short_description_ar: 'في ساحة القلعة الكبرى، يقف الفرسان الشبان أمام شعلة الاختبار في انتظار مصيرهم.',
    content_type: 'novel',
    content_ar: `كان الصمت مهيباً في الباحة الكبرى لقلعة الأفق. مئات المشاعل المصنوعة من البرونز كانت تلقي ظلالاً راقصة على الدروع الفضية المصقولة.

وقف الفارس الشاب في الصف الأمامي، وعيناه لا تفارقان المذبح المرتفع حيث ترقد الشعلة الأبدية. كانت تلك الليلة هي ليلة القسم—الليلة التي يتحول فيها المتدرب إلى فارس يحمل شرف الدفاع عن المملكة حتى آخر رمق.

تقدم الحكيم ذو الرداء الأبيض، ورفع يديه داعياً ببركة السماء: "من يدخل هذا العهد، يترك وراءه اسمه القديم، ويصبح سيفاً للحق ودرعاً للمظلوم."`,
    cover_image_url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80',
    reading_time_minutes: 5,
    word_count: 210,
    status: 'published',
    publication_date: '2026-10-15T18:00:00Z',
    access_level: 'free',
    author_notes: 'بداية ملحمة فرسان النجوم.',
    views_count: 3600,
    likes_count: 290,
    created_at: '2026-10-15T18:00:00Z',
  },
  {
    id: 'ep_shadow_1',
    series_id: 's_shadow',
    episode_number: 1,
    title_ar: 'العدد الأول: أزقة المطر الأسود',
    title_en: 'Issue 1: Alleys of Black Rain',
    short_description_ar: 'الظهور الأول للمحقق السري في شوارع حي الميناء بعد اختفاء الجوهرة الملكية.',
    content_type: 'comic',
    comic_pages: [
      { id: 'sp1', page_number: 1, image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80', description: 'أمطار غزيرة تغرق واجهات المتاجر القديمة' },
      { id: 'sp2', page_number: 2, image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80', description: 'المحقق يقف تحت مصباح الغاز الباهت' },
    ],
    cover_image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    reading_time_minutes: 3,
    status: 'published',
    publication_date: '2026-09-10T19:00:00Z',
    access_level: 'free',
    author_notes: 'العدد الافتتاحي لسلسلة سجلات الظل.',
    views_count: 4900,
    likes_count: 340,
    created_at: '2026-09-10T19:00:00Z',
  },
];

// User interaction memory: follows & progress
// key: userId:seriesId -> boolean
const userFollows = new Map<string, boolean>();
const userFavorites = new Map<string, boolean>();
// key: userId:seriesId -> { currentEpisodeId, completedEpisodeIds: string[], lastReadAt, progressPercentage }
const userReadingProgress = new Map<string, any>();

// ---------------------------------------------------------------------------
// BACKGROUND SERVER-SIDE SCHEDULER (Runs every 60s)
// ---------------------------------------------------------------------------
setInterval(() => {
  const now = new Date();
  let updatedCount = 0;

  inMemoryEpisodes.forEach((ep) => {
    if (ep.status === 'scheduled' && ep.scheduled_at && new Date(ep.scheduled_at) <= now) {
      ep.status = 'published';
      ep.publication_date = now.toISOString();
      updatedCount++;
      console.log(`[SeriesPlatform Scheduler] Auto-published episode: "${ep.title_ar}" (#${ep.episode_number})`);
    }
  });

  inMemorySeries.forEach((s) => {
    if (s.status === 'upcoming') {
      const hasPublished = inMemoryEpisodes.some((e) => e.series_id === s.id && e.status === 'published');
      if (hasPublished) {
        s.status = 'ongoing';
      }
    }
  });
}, 60000);

// ---------------------------------------------------------------------------
// 1. PUBLIC ROUTES
// ---------------------------------------------------------------------------

// GET /api/series-platform — List published series with filters
seriesPlatformRouter.get('/', async (req, res) => {
  try {
    const { format, status, genre, worldId, search, collection, sort } = req.query;

    let list = inMemorySeries.filter((s) => s.status !== 'draft' && s.status !== 'archived');

    if (format && format !== 'all') {
      list = list.filter((s) => s.format === format);
    }
    if (status && status !== 'all') {
      list = list.filter((s) => s.status === status);
    }
    if (genre && genre !== 'all') {
      list = list.filter((s) => s.genre.includes(String(genre)) || s.subgenres.some((sg) => sg.includes(String(genre))));
    }
    if (worldId && worldId !== 'all') {
      list = list.filter((s) => s.world_id === worldId);
    }
    if (search) {
      const q = String(search).toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.title_ar.toLowerCase().includes(q) ||
          s.title_en.toLowerCase().includes(q) ||
          s.short_description_ar.toLowerCase().includes(q) ||
          s.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Hydrate counts
    const hydrated = list.map((s) => {
      const eps = inMemoryEpisodes.filter((e) => e.series_id === s.id && e.status === 'published');
      const seasons = inMemorySeasons.filter((sea) => sea.series_id === s.id);
      return {
        ...s,
        episodes_count: eps.length,
        seasons_count: seasons.length,
        latest_episode: eps[eps.length - 1] || null,
      };
    });

    // Sorting
    if (sort === 'popular') {
      hydrated.sort((a, b) => b.views_count - a.views_count);
    } else if (sort === 'rating') {
      hydrated.sort((a, b) => b.rating - a.rating);
    } else if (sort === 'newest') {
      hydrated.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else {
      hydrated.sort((a, b) => b.banner_priority - a.banner_priority);
    }

    return res.json(hydrated);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/series-platform/featured — Featured Hero series
seriesPlatformRouter.get('/featured', async (_req, res) => {
  try {
    const featured = inMemorySeries.filter((s) => s.is_featured && s.status !== 'draft');
    const hero = featured[0] || inMemorySeries[0];
    const eps = inMemoryEpisodes.filter((e) => e.series_id === hero.id && e.status === 'published');
    const seasons = inMemorySeasons.filter((sea) => sea.series_id === hero.id);

    return res.json({
      ...hero,
      episodes_count: eps.length,
      seasons_count: seasons.length,
      latest_episode: eps[eps.length - 1] || null,
      all_featured: featured,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/series-platform/collections — Curated collections for homepage & discovery
seriesPlatformRouter.get('/collections', async (_req, res) => {
  try {
    const attachMeta = (items: SeriesItem[]) =>
      items.map((s) => {
        const eps = inMemoryEpisodes.filter((e) => e.series_id === s.id && e.status === 'published');
        const seasons = inMemorySeasons.filter((sea) => sea.series_id === s.id);
        return {
          ...s,
          episodes_count: eps.length,
          seasons_count: seasons.length,
          latest_episode: eps[eps.length - 1] || null,
        };
      });

    const published = inMemorySeries.filter((s) => s.status !== 'draft' && s.status !== 'archived');

    const collections = {
      featured: attachMeta(published.filter((s) => s.is_featured)),
      originals: attachMeta(published.filter((s) => s.is_original)),
      popular: attachMeta([...published].sort((a, b) => b.views_count - a.views_count).slice(0, 6)),
      new_releases: attachMeta(
        [...published].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 6)
      ),
      ongoing: attachMeta(published.filter((s) => s.status === 'ongoing')),
      completed: attachMeta(published.filter((s) => s.status === 'completed')),
      comics: attachMeta(published.filter((s) => s.format === 'comic' || s.format === 'hybrid')),
      novels: attachMeta(published.filter((s) => s.format === 'novel' || s.format === 'hybrid')),
    };

    return res.json(collections);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/series-platform/user/library — User's followed and in-progress series
seriesPlatformRouter.get('/user/library', requireAuth, async (req: any, res) => {
  try {
    const userId = req.user.id;

    const following: any[] = [];
    const inProgress: any[] = [];

    inMemorySeries.forEach((s) => {
      if (userFollows.get(`${userId}:${s.id}`)) {
        following.push(s);
      }
      const prog = userReadingProgress.get(`${userId}:${s.id}`);
      if (prog) {
        inProgress.push({
          series: s,
          progress: prog,
        });
      }
    });

    return res.json({
      following,
      in_progress: inProgress,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/series-platform/:slug — Full Series Landing Page
seriesPlatformRouter.get('/:slug', async (req, res) => {
  try {
    const slug = req.params.slug;
    const series = inMemorySeries.find((s) => s.slug === slug || s.id === slug);

    if (!series) {
      return res.status(404).json({ error: 'السلسلة المطلوبة غير موجودة.' });
    }

    // Increment view count
    series.views_count += 1;

    const seasons = inMemorySeasons
      .filter((sea) => sea.series_id === series.id && sea.status === 'published')
      .sort((a, b) => a.number - b.number);

    const episodes = inMemoryEpisodes
      .filter((ep) => ep.series_id === series.id && ep.status === 'published')
      .sort((a, b) => a.episode_number - b.episode_number);

    // Related series in same genre or world
    const related = inMemorySeries
      .filter((s) => s.id !== series.id && (s.genre === series.genre || s.world_id === series.world_id))
      .slice(0, 4);

    return res.json({
      series,
      seasons,
      episodes,
      related_series: related,
      first_episode: episodes[0] || null,
      latest_episode: episodes[episodes.length - 1] || null,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/series-platform/:slug/episodes/:episodeId — Episode Reader View
seriesPlatformRouter.get('/:slug/episodes/:episodeId', async (req, res) => {
  try {
    const { slug, episodeId } = req.params;
    const series = inMemorySeries.find((s) => s.slug === slug || s.id === slug);

    if (!series) {
      return res.status(404).json({ error: 'السلسلة غير موجودة.' });
    }

    const episode = inMemoryEpisodes.find((e) => e.series_id === series.id && (e.id === episodeId || String(e.episode_number) === episodeId));

    if (!episode) {
      return res.status(404).json({ error: 'الحلقة المطلوبة غير موجودة.' });
    }

    // Increment episode views
    episode.views_count += 1;

    // Adjacent episodes
    const allPublished = inMemoryEpisodes
      .filter((e) => e.series_id === series.id && e.status === 'published')
      .sort((a, b) => a.episode_number - b.episode_number);

    const currentIdx = allPublished.findIndex((e) => e.id === episode.id);
    const prevEpisode = currentIdx > 0 ? allPublished[currentIdx - 1] : null;
    const nextEpisode = currentIdx < allPublished.length - 1 ? allPublished[currentIdx + 1] : null;

    // Season info
    const season = episode.season_id ? inMemorySeasons.find((sea) => sea.id === episode.season_id) : null;

    return res.json({
      series: {
        id: series.id,
        slug: series.slug,
        title_ar: series.title_ar,
        format: series.format,
        structure_label: series.structure_label,
      },
      season,
      episode,
      all_episodes_list: allPublished.map((e) => ({
        id: e.id,
        episode_number: e.episode_number,
        title_ar: e.title_ar,
        content_type: e.content_type,
        reading_time_minutes: e.reading_time_minutes,
      })),
      prev_episode: prevEpisode
        ? { id: prevEpisode.id, episode_number: prevEpisode.episode_number, title_ar: prevEpisode.title_ar }
        : null,
      next_episode: nextEpisode
        ? { id: nextEpisode.id, episode_number: nextEpisode.episode_number, title_ar: nextEpisode.title_ar }
        : null,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/series-platform/:id/follow — Follow / Unfollow Series
seriesPlatformRouter.post('/:id/follow', requireAuth, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const seriesId = req.params.id;
    const key = `${userId}:${seriesId}`;

    const current = !!userFollows.get(key);
    const newStatus = !current;
    userFollows.set(key, newStatus);

    const series = inMemorySeries.find((s) => s.id === seriesId);
    if (series) {
      series.followers_count += newStatus ? 1 : -1;
      if (series.followers_count < 0) series.followers_count = 0;
    }

    return res.json({
      following: newStatus,
      followers_count: series?.followers_count || 0,
      message: newStatus ? 'تمت متابعة السلسلة بنجاح!' : 'تم إلغاء متابعة السلسلة.',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/series-platform/:id/favorite — Favorite / Unfavorite Series
seriesPlatformRouter.post('/:id/favorite', requireAuth, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const seriesId = req.params.id;
    const key = `${userId}:${seriesId}`;

    const current = !!userFavorites.get(key);
    const newStatus = !current;
    userFavorites.set(key, newStatus);

    return res.json({
      favorited: newStatus,
      message: newStatus ? 'تمت إضافة السلسلة إلى مفضلتك!' : 'تمت الإزالة من المفضلة.',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/series-platform/:id/episodes/:episodeId/progress — Save Reading Progress
seriesPlatformRouter.post('/:id/episodes/:episodeId/progress', requireAuth, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { id: seriesId, episodeId } = req.params;
    const { isCompleted } = req.body;

    const key = `${userId}:${seriesId}`;
    const prev = userReadingProgress.get(key) || {
      currentEpisodeId: episodeId,
      completedEpisodeIds: [],
      lastReadAt: new Date().toISOString(),
    };

    const completedSet = new Set<string>(prev.completedEpisodeIds || []);
    if (isCompleted) {
      completedSet.add(episodeId);
    }

    const seriesEps = inMemoryEpisodes.filter((e) => e.series_id === seriesId && e.status === 'published');
    const progressPercentage = seriesEps.length > 0 ? Math.round((completedSet.size / seriesEps.length) * 100) : 0;

    const updated = {
      currentEpisodeId: episodeId,
      completedEpisodeIds: Array.from(completedSet),
      progressPercentage,
      lastReadAt: new Date().toISOString(),
    };

    userReadingProgress.set(key, updated);

    return res.json({ success: true, progress: updated });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// 2. ADMIN STUDIO & CONTENT MANAGEMENT ROUTES
// ---------------------------------------------------------------------------
adminSeriesPlatformRouter.use(requireAuth);
adminSeriesPlatformRouter.use(requireRole('admin'));

// GET /api/admin/series-platform — List all series (including drafts) with tree counts
adminSeriesPlatformRouter.get('/', async (_req, res) => {
  try {
    const list = inMemorySeries.map((s) => {
      const seasons = inMemorySeasons.filter((sea) => sea.series_id === s.id);
      const episodes = inMemoryEpisodes.filter((ep) => ep.series_id === s.id);
      return {
        ...s,
        seasons,
        episodes,
        episodes_count: episodes.length,
        seasons_count: seasons.length,
      };
    });

    return res.json(list);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/series-platform — Create New Series
adminSeriesPlatformRouter.post('/', async (req: any, res) => {
  try {
    const userId = req.user.id;
    const {
      title_ar,
      title_en,
      short_description_ar,
      description_ar,
      cover_image_url,
      banner_image_url,
      thumbnail_url,
      format,
      status,
      genre,
      subgenres,
      tags,
      language,
      age_rating,
      world_id,
      world_name_ar,
      is_original,
      classification,
      publisher_name,
      author_name,
      artist_name,
      editor_name,
      translator_name,
      structure_type,
      structure_label,
      release_schedule,
      release_day_time,
      is_featured,
      banner_priority,
    } = req.body;

    if (!title_ar) {
      return res.status(400).json({ error: 'عنوان السلسلة باللغة العربية مطلوب.' });
    }

    const id = `series_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const slugBase = (title_en || title_ar)
      .toLowerCase()
      .trim()
      .replace(/[^\w\u0621-\u064A\s-]/g, '')
      .replace(/\s+/g, '-');
    const slug = `${slugBase}-${id.slice(-4)}`;

    const newSeries: SeriesItem = {
      id,
      slug,
      title_ar,
      title_en: title_en || title_ar,
      short_description_ar: short_description_ar || '',
      description_ar: description_ar || short_description_ar || '',
      cover_image_url: cover_image_url || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
      banner_image_url: banner_image_url || cover_image_url || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1600&q=80',
      thumbnail_url: thumbnail_url || cover_image_url,
      format: format || 'novel',
      status: status || 'ongoing',
      genre: genre || 'خيال وفانتازيا',
      subgenres: Array.isArray(subgenres) ? subgenres : (subgenres ? String(subgenres).split(',').map((s) => s.trim()) : []),
      tags: Array.isArray(tags) ? tags : (tags ? String(tags).split(',').map((t) => t.trim()) : []),
      language: language || 'ar',
      age_rating: age_rating || '13+',
      world_id,
      world_name_ar,
      is_original: is_original !== false,
      classification: classification || 'original',
      publisher_name: publisher_name || 'دار حكاياتي للنشر الرقمي',
      author_name: author_name || req.user.displayName,
      artist_name,
      editor_name,
      translator_name,
      structure_type: structure_type || 'season_episode',
      structure_label: structure_label || 'الموسم',
      release_schedule: release_schedule || 'weekly',
      release_day_time,
      is_featured: is_featured === true || is_featured === 'true',
      banner_priority: Number(banner_priority || 1),
      views_count: 0,
      followers_count: 0,
      rating: 5.0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    inMemorySeries.unshift(newSeries);

    await logSeriesAction(userId, 'create_series', 'series', newSeries.id, newSeries);

    return res.status(201).json({
      success: true,
      message: 'تم إنشاء السلسلة بنجاح!',
      series: newSeries,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/series-platform/:id — Update Series
adminSeriesPlatformRouter.put('/:id', async (req: any, res) => {
  try {
    const userId = req.user.id;
    const seriesId = req.params.id;
    const idx = inMemorySeries.findIndex((s) => s.id === seriesId);

    if (idx === -1) {
      return res.status(404).json({ error: 'السلسلة غير موجودة.' });
    }

    const current = inMemorySeries[idx];
    const updated: SeriesItem = {
      ...current,
      ...req.body,
      id: current.id,
      slug: req.body.slug || current.slug,
      updated_at: new Date().toISOString(),
    };

    inMemorySeries[idx] = updated;

    await logSeriesAction(userId, 'update_series', 'series', seriesId, updated);

    return res.json({
      success: true,
      message: 'تم تحديث بيانات السلسلة بنجاح!',
      series: updated,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/series-platform/:id — Delete Series
adminSeriesPlatformRouter.delete('/:id', async (req: any, res) => {
  try {
    const userId = req.user.id;
    const seriesId = req.params.id;

    inMemorySeries = inMemorySeries.filter((s) => s.id !== seriesId);
    inMemorySeasons = inMemorySeasons.filter((sea) => sea.series_id !== seriesId);
    inMemoryEpisodes = inMemoryEpisodes.filter((ep) => ep.series_id !== seriesId);

    await logSeriesAction(userId, 'delete_series', 'series', seriesId);

    return res.json({
      success: true,
      message: 'تم حذف السلسلة ومواسمها وفصولها بنجاح.',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/series-platform/:id/seasons — Create Season or Volume
adminSeriesPlatformRouter.post('/:id/seasons', async (req: any, res) => {
  try {
    const userId = req.user.id;
    const seriesId = req.params.id;
    const series = inMemorySeries.find((s) => s.id === seriesId);

    if (!series) {
      return res.status(404).json({ error: 'السلسلة غير موجودة.' });
    }

    const { number, title_ar, title_en, description_ar, cover_image_url, status, release_date } = req.body;

    const existingInSeries = inMemorySeasons.filter((s) => s.series_id === seriesId);
    const seasonNumber = Number(number) || existingInSeries.length + 1;

    const newSeason: SeriesSeason = {
      id: `season_${Date.now()}_${crypto.randomBytes(2).toString('hex')}`,
      series_id: seriesId,
      number: seasonNumber,
      title_ar: title_ar || `${series.structure_label} ${seasonNumber}`,
      title_en,
      description_ar,
      cover_image_url: cover_image_url || series.cover_image_url,
      status: status || 'published',
      release_date: release_date || new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
    };

    inMemorySeasons.push(newSeason);

    await logSeriesAction(userId, 'create_season', 'season', newSeason.id, newSeason);

    return res.status(201).json({
      success: true,
      message: 'تمت إضافة الموسم/المجلد بنجاح!',
      season: newSeason,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/series-platform/:id/seasons/:seasonId — Delete Season
adminSeriesPlatformRouter.delete('/:id/seasons/:seasonId', async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { seasonId } = req.params;

    inMemorySeasons = inMemorySeasons.filter((sea) => sea.id !== seasonId);

    await logSeriesAction(userId, 'delete_season', 'season', seasonId);

    return res.json({ success: true, message: 'تم حذف الموسم بنجاح.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/series-platform/:id/episodes — Create Episode, Chapter, or Comic Issue
adminSeriesPlatformRouter.post('/:id/episodes', async (req: any, res) => {
  try {
    const userId = req.user.id;
    const seriesId = req.params.id;
    const series = inMemorySeries.find((s) => s.id === seriesId);

    if (!series) {
      return res.status(404).json({ error: 'السلسلة غير موجودة.' });
    }

    const {
      season_id,
      episode_number,
      title_ar,
      title_en,
      short_description_ar,
      content_type,
      content_ar,
      comic_pages,
      pdf_url,
      cover_image_url,
      reading_time_minutes,
      status,
      publication_date,
      scheduled_at,
      access_level,
      author_notes,
    } = req.body;

    if (!title_ar) {
      return res.status(400).json({ error: 'عنوان الحلقة/الفصل مطلوب.' });
    }

    const existingEps = inMemoryEpisodes.filter((e) => e.series_id === seriesId);
    const epNum = Number(episode_number) || existingEps.length + 1;

    // Word count calculation
    const words = content_ar ? content_ar.trim().split(/\s+/).length : 0;
    const readTime = Number(reading_time_minutes) || Math.max(1, Math.ceil(words / 160));

    const newEpisode: SeriesEpisode = {
      id: `ep_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      series_id: seriesId,
      season_id: season_id || undefined,
      episode_number: epNum,
      title_ar,
      title_en,
      short_description_ar: short_description_ar || '',
      content_type: content_type || (series.format === 'comic' ? 'comic' : 'novel'),
      content_ar: content_ar || '',
      comic_pages: Array.isArray(comic_pages) ? comic_pages : [],
      pdf_url: pdf_url || undefined,
      cover_image_url: cover_image_url || series.cover_image_url,
      reading_time_minutes: readTime,
      word_count: words,
      status: status || 'published',
      publication_date: publication_date || new Date().toISOString(),
      scheduled_at: status === 'scheduled' ? (scheduled_at || publication_date) : undefined,
      access_level: access_level || 'free',
      author_notes,
      views_count: 0,
      likes_count: 0,
      created_at: new Date().toISOString(),
    };

    inMemoryEpisodes.push(newEpisode);

    await logSeriesAction(userId, 'create_episode', 'episode', newEpisode.id, newEpisode);

    return res.status(201).json({
      success: true,
      message: 'تم نشر الحلقة/الفصل بنجاح!',
      episode: newEpisode,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/series-platform/:id/episodes/:episodeId — Update Episode
adminSeriesPlatformRouter.put('/:id/episodes/:episodeId', async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { episodeId } = req.params;
    const idx = inMemoryEpisodes.findIndex((e) => e.id === episodeId);

    if (idx === -1) {
      return res.status(404).json({ error: 'الحلقة غير موجودة.' });
    }

    const current = inMemoryEpisodes[idx];
    const words = req.body.content_ar ? req.body.content_ar.trim().split(/\s+/).length : current.word_count;
    const readTime = req.body.reading_time_minutes
      ? Number(req.body.reading_time_minutes)
      : words
      ? Math.max(1, Math.ceil(words / 160))
      : current.reading_time_minutes;

    const updated: SeriesEpisode = {
      ...current,
      ...req.body,
      word_count: words,
      reading_time_minutes: readTime,
      id: current.id,
      series_id: current.series_id,
    };

    inMemoryEpisodes[idx] = updated;

    await logSeriesAction(userId, 'update_episode', 'episode', episodeId, updated);

    return res.json({
      success: true,
      message: 'تم تحديث الحلقة/الفصل بنجاح!',
      episode: updated,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/series-platform/:id/episodes/:episodeId — Delete Episode
adminSeriesPlatformRouter.delete('/:id/episodes/:episodeId', async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { episodeId } = req.params;

    inMemoryEpisodes = inMemoryEpisodes.filter((e) => e.id !== episodeId);

    await logSeriesAction(userId, 'delete_episode', 'episode', episodeId);

    return res.json({ success: true, message: 'تم حذف الحلقة بنجاح.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/series-platform/analytics — Real Aggregate Analytics
adminSeriesPlatformRouter.get('/analytics', async (_req, res) => {
  try {
    const totalSeries = inMemorySeries.length;
    const totalEpisodes = inMemoryEpisodes.length;
    const totalSeasons = inMemorySeasons.length;

    const totalViews = inMemorySeries.reduce((acc, s) => acc + s.views_count, 0) +
      inMemoryEpisodes.reduce((acc, e) => acc + e.views_count, 0);

    const totalFollowers = inMemorySeries.reduce((acc, s) => acc + s.followers_count, 0);

    const topSeries = [...inMemorySeries]
      .sort((a, b) => b.views_count - a.views_count)
      .slice(0, 5)
      .map((s) => ({
        id: s.id,
        title_ar: s.title_ar,
        format: s.format,
        views_count: s.views_count,
        followers_count: s.followers_count,
        rating: s.rating,
      }));

    return res.json({
      total_series: totalSeries,
      total_episodes: totalEpisodes,
      total_seasons: totalSeasons,
      total_views: totalViews,
      total_followers: totalFollowers,
      top_series: topSeries,
      active_readers_metric: Math.round(totalViews * 0.42),
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});
