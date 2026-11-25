import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const supabaseJsPath = require.resolve('@supabase/supabase-js', { paths: [process.cwd() + '/artifacts/api-server'] });
const { createClient } = require(supabaseJsPath);

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://naxqsbyupqrljciubvyx.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SECRET_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5heHFzYnl1cHFybGpjaXVidnl4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5NTI0MzE3NiwiZXhwIjoyMTEwODE5MTc2fQ.1CcbMsJGoU48F2w4v1TU7Kle3jq_Jyx-LU3HCTGPL0Y';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function syncUniverse() {
  console.log('🚀 Starting Canonical Universe Data Sync to Supabase...');

  // 1. WORLDS
  const worlds = [
    {
      id: 'w1',
      name_ar: 'زلامار',
      name_en: 'Zalamar',
      description_ar: 'إمبراطورية الكثبان الذهبية، حيث يتعانق السحر الشمسي الأسطوري مع ناطحات السحاب المتقدمة في تناغم استثنائي تحت وهج الشمس الخالدة.',
      description_en: 'The golden desert empire, where ancient sun magic and futuristic spires exist in harmony amidst endless crystalline dunes.',
      ruler: 'Emperor Zayed',
      ruler_ar: 'الإمبراطور زايد الذهبي',
      alignment: 'light',
      climate: 'Arid Solar / Crystal Winds',
      climate_ar: 'صحراوي شمسي مشبع برياح البلورات الكونية',
      history: 'Founded six centuries ago when the First Sun Prophet awakened the solar leylines.',
      history_ar: 'تأسست زلامار قبل ستمائة عام عقب استيقاظ خطوط الطاقة الشمسية واندماج القبائل الصحراوية تحت راية حراس النور في معركة التحرير الكبرى.',
      image_url: '/assets/generated_images/world_zalamar.jpg',
      cloudinary_image_public_id: 'hekayaty/worlds/world_zalamar',
      notable_locations: [
        { nameAr: 'برج الشمس الخالد', nameEn: 'The Sun Spire', descriptionAr: 'أطول برج معماري في زلامار، يمتص طاقة النجوم لتغذية الشبكة الطاقية للإمبراطورية.' },
        { nameAr: 'واحة الأصداء النجمية', nameEn: 'Oasis of Echoes', descriptionAr: 'بحيرة سرية تحتفظ بذكريات الحضارات البائدة وتعكس أصداء المستقبل.' },
        { nameAr: 'معبد النور الأول', nameEn: 'First Light Sanctuary', descriptionAr: 'أقدس بقاع زلامار، ومصدر درع النور الذي يحمله الحراس الذهبيون.' },
      ],
      organizations: [
        { nameAr: 'الطليعة الذهبية', descriptionAr: 'فرقة حراس النخبة المدربين على توجيه طاقة البلازما الشمسية والدفاع عن حدود الكثبان.' },
        { nameAr: 'مجلس حكماء الصحراء', descriptionAr: 'مجلس تشريعي يضم كبار علماء الفلك والفلسفة لتوجيه بوصلة الإمبراطورية.' },
      ],
    },
    {
      id: 'w2',
      name_ar: 'نوفا قديم',
      name_en: 'Nova Qadim',
      description_ar: 'حاضرة فلكية فضائية شيدها نساجو النجوم الأوائل، تسبح في الفضاء السحيق بنقوش رونية زرقاء مضيئة ومعابد مدارية معلقة.',
      description_en: 'An ancient space city built by the first star-weavers, filled with glowing blue runes and floating astronomical observatories.',
      ruler: 'Council of the Cosmos',
      ruler_ar: 'مجلس الكون الفلكي',
      alignment: 'neutral',
      climate: 'Orbital Vacuum / Nebula Aurora',
      climate_ar: 'مداري فراغي محاط بشفق السدم الملونة وتيارات طاقة السوبرنوفا',
      history: 'Created during the Great Astral Convergence by mystics seeking pure cosmic knowledge.',
      history_ar: 'بُنيت أثناء التقارب النجمي العظيم على يد رهبان الفلك لتكون ملاذاً محايداً للمعرفة ومركزاً لحفظ علوم الكوزمولوجيا السحرية.',
      image_url: '/assets/generated_images/world_nova_qadim.jpg',
      cloudinary_image_public_id: 'hekayaty/worlds/world_nova_qadim',
      notable_locations: [
        { nameAr: 'بوابة النجوم الأزلية', nameEn: 'Starlight Nexus', descriptionAr: 'محطة العبور البين-كوكبية المركزية التي تربط مسارات الأبعاد السبعة.' },
        { nameAr: 'مرصد النسيج الزمني', nameEn: 'Chronos Weave Spire', descriptionAr: 'برج مراقبة يحفظ توازنات الخط الزمني للكون من التشوهات.' },
      ],
      organizations: [
        { nameAr: 'نساجو النجوم', descriptionAr: 'علماء ومهندسون يتحكمون في مسارات الطاقة الكوزمية ونسج الجسور بين الكواكب.' },
      ],
    },
    {
      id: 'w3',
      name_ar: 'المارد',
      name_en: 'Al-Marid',
      description_ar: 'المملكة المائية العميقة في قعر المحيطات الكونية، تتلألأ بالشعاب المرجانية الحيوية المضيئة وتخضع لتيارات السحر البحري القديم.',
      description_en: 'The deep aquatic abyssal realm, illuminated by bioluminescent corals and governed by ancient tides and elemental currents.',
      ruler: 'Sultan Bahar & Princess Nour',
      ruler_ar: 'السلطان بحار والأميرة نور القمر',
      alignment: 'light',
      climate: 'Abyssal Hydro-Pressure',
      climate_ar: 'ضغط هيدروليكي سحيق محمي بهالات طاقة مائية نقية صالحة للتنفس',
      history: 'A civilization that sank intentionally to protect the Cosmic Pearl from surface wars.',
      history_ar: 'حضارة اختارت الغوص في أعماق المحيط لحماية جوهرة المد الكوني من مطامع الحروب السطحية.',
      image_url: '/assets/generated_images/world_al_marid.jpg',
      cloudinary_image_public_id: 'hekayaty/worlds/world_al_marid',
      notable_locations: [
        { nameAr: 'قصر اللؤلؤة السوداء', nameEn: 'Pearl Palace', descriptionAr: 'مقر العرش المائي المنحوت في قلب أصداف عملاقة تعود لعصور ما قبل الطوفان.' },
      ],
      organizations: [
        { nameAr: 'حماة التيارات', descriptionAr: 'فرسان الأعماق الذين يمتطون الوحوش المضيئة ويحرسون شرايين المياه الحيوية.' },
      ],
    },
    {
      id: 'w4',
      name_ar: 'الفراغ الأسود',
      name_en: 'The Void',
      description_ar: 'البعد المتشظي للمادة المضادة والعواصف الكونية، تسبح فيه قلاع من حجر السج الأسود وتتحكم فيه قوى الظلام العتيقة.',
      description_en: 'A fractured dimension of anti-matter, cosmic storms, and floating obsidian citadels where reality twists and shadows rule.',
      ruler: 'Farhan Al-Sawad',
      ruler_ar: 'فرحان السواد (سيد الظل)',
      alignment: 'dark',
      climate: 'Cosmic Anti-Matter Storms',
      climate_ar: 'عواصف ظلام مضادة للمادة، تفكك الروابط الكيميائية وتلتهم الضوء',
      history: 'Formed from the space torn apart during the Prime Cataclysm.',
      history_ar: 'انبثق هذا البعد إثر الانفجار الكوزمي الأول وتصدع نسيج الفضاء.',
      image_url: '/assets/generated_images/world_the_void.jpg',
      cloudinary_image_public_id: 'hekayaty/worlds/world_the_void',
      notable_locations: [
        { nameAr: 'عرش السج الأسود', nameEn: 'Obsidian Throne', descriptionAr: 'برج الحاكم فرحان المشيد من مادة حجرية تمتص كل أطياف الضوء المرئي.' },
      ],
      organizations: [
        { nameAr: 'فيلق الظل السحيق', descriptionAr: 'محاربو الظلام المتخفون القادرون على التنقل بين الظلال.' },
      ],
    },
    {
      id: 'w5',
      name_ar: 'سيرا برايم',
      name_en: 'Syrra Prime',
      description_ar: 'ميتروبوليس سحرية مستقبلية تعمل بمولدات الاندماج البلوري، تحلق في أجوائها المراكب الهوائية وتمتزج فيها الأسواق الشعبية بالأبراج الشاهقة.',
      description_en: 'A magical cyberpunk megapolis powered by crystal fusion, floating sky-skiffs, bustling neon souks, and relentless corporate ambition.',
      ruler: 'The Trade Syndicates',
      ruler_ar: 'نقابات التجارة البلورية والمحافظ راكان',
      alignment: 'neutral',
      climate: 'Neon Electro-Smog / Sand Skim',
      climate_ar: 'رياح كهروستاتيكية محملة بغبار بلوري ملون وسحب نيون اصطناعية',
      history: 'Rose as a free trade refuge at the intersection of three hyperspace lanes.',
      history_ar: 'ازدهرت كمدينة تجارية حرة عند ملتقى ثلاثة طرق ملاحة فائقة السرعة.',
      image_url: '/assets/generated_images/world_syrra_prime.jpg',
      cloudinary_image_public_id: 'hekayaty/worlds/world_syrra_prime',
      notable_locations: [
        { nameAr: 'السوق المركزي المعلق', nameEn: 'Grand Neon Bazaar', descriptionAr: 'أضخم مركز تجاري في المجرة لتبادل التقنيات الهجينة والقطع الأثرية النادرة.' },
      ],
      organizations: [
        { nameAr: 'تحالف الميكانيكيين الأحرار', descriptionAr: 'نقابة الحرفيين والمبتكرين الذين يطورون أحدث العتاد الميكانيكي.' },
      ],
    },
  ];

  console.log(`- Upserting ${worlds.length} worlds...`);
  const { error: wErr } = await supabase.from('worlds').upsert(worlds);
  if (wErr) console.error('Error upserting worlds:', wErr);
  else console.log('✓ Worlds synchronized successfully.');

  // 2. CHARACTERS
  const characters = [
    {
      id: 'c1',
      world_id: 'w1',
      name_ar: 'زايد الذهبي',
      name_en: 'Zayed Al-Dhahabi',
      alias: 'The Golden Warrior',
      alias_ar: 'المحارب الذهبي',
      alignment: 'hero',
      bio_ar: 'فارس نبيل يرتدي درعاً شمسياً عريقاً صيغ من بلورات الصحراء النقية، يكرس حياته للدفاع عن المظلومين وصيانة شعلة النور في عوالم حكاياتي.',
      bio_en: 'A noble protector clad in sacred solar armor, channeling the fierce energy of ancient desert suns.',
      origin_ar: 'بينما كان يواجه حتفه في قلب الصحراء إثر غارة لجيوش الظل، استيقظت شعلة النواة الشمسية في صدره، لتصنع منه بطلاً متوجاً بنور الشمس الأبدي.',
      origin_en: 'Found dying in the sands after a shadow ambush, the Solar Core chose him as its living champion.',
      powers: ['Solar Energy Blades', 'Superhuman Flight', 'Photonic Armor Projection', 'Solar Burst'],
      powers_ar: ['سيوف الطاقة الشمسية', 'الطيران الأسرع من الصوت', 'توليد الدروع الضوئية', 'انفجار الصدمة الشمسية'],
      weaknesses: ['Solar Eclipses', 'Extreme Cryo Environments', 'Compassion for Former Allies'],
      weaknesses_ar: ['الكسوف الشمسي الكلي', 'البيئات الجليدية السحيقة', 'الإفراط في الثقة بالخصوم'],
      affiliations: ['The Golden Vanguard', 'Guardians of Zalamar'],
      affiliations_ar: ['الطليعة الذهبية', 'حماة زلامار'],
      related_character_ids: ['c2', 'c3'],
      stats: { strength: 90, speed: 78, durability: 95, intelligence: 72, magic: 84, combat: 92 },
      image_url: '/assets/generated_images/zayed.jpg',
      cloudinary_image_public_id: 'hekayaty/characters/zayed',
      classification: 'original',
      created_by: 'فريق حكاياتي الإبداعي',
      first_appearance: 'أصول النور #1',
    },
    {
      id: 'c2',
      world_id: 'w2',
      name_ar: 'ليلى النجم',
      name_en: 'Lailat Al-Najm',
      alias: 'Starlight Weaver',
      alias_ar: 'نساجة النجوم',
      alignment: 'hero',
      bio_ar: 'عالمة وساحرة فلكية بارعة تتحكم في حقول الجاذبية وتتنقل عبر المسارات الكوزمية لحماية التوازن بين أبعاد المجرة.',
      bio_en: 'A brilliant cosmic sorceress who manipulates gravitational fields and navigates quantum astral pathways.',
      origin_ar: 'ولدت لحظة انفجار سديمي مزدوج في نوفا قديم، فوهبتها النجوم قدرة فطرية على قراءة وتطويع أوتار الطاقة النجمية.',
      origin_en: 'Born beneath a binary super-nova, she inherited the instinctive ability to weave stellar energy strings.',
      powers: ['Gravity Distortion', 'Quantum Portals', 'Astral Projection', 'Stellar Energy Weaving'],
      powers_ar: ['تطويع الجاذبية', 'فتح بوابات العبور الكوزمية', 'الإسقاط الأثيري', 'نسج أشعة النجوم'],
      weaknesses: ['Dark Energy Wells', 'Gravitational Resonance Disruption'],
      weaknesses_ar: ['آبار الطاقة المظلمة', 'اضطراب التردد الجاذبي'],
      affiliations: ['Star-Weavers Guild', 'Council of the Cosmos'],
      affiliations_ar: ['نقابة نساجي النجوم', 'مجلس الكون الفلكي'],
      related_character_ids: ['c1'],
      stats: { strength: 60, speed: 85, durability: 68, intelligence: 98, magic: 96, combat: 75 },
      image_url: '/assets/generated_images/lailat.jpg',
      cloudinary_image_public_id: 'hekayaty/characters/lailat',
      classification: 'original',
      created_by: 'فريق حكاياتي الإبداعي',
      first_appearance: 'نسيج النجوم #1',
    },
    {
      id: 'c3',
      world_id: 'w4',
      name_ar: 'فرحان السواد',
      name_en: 'Farhan Al-Sawad',
      alias: 'Lord of Shadows',
      alias_ar: 'سيد الظلال',
      alignment: 'villain',
      bio_ar: 'قائد ظلامي مهيب يتحكم في خيوط الظل المادي، يسعى لإطفاء كل منارة نجمية وإعادة الأكوان إلى سكون العدم المطلق.',
      bio_en: 'A master of anti-light who commands shadow tendrils and seeks to drown all radiant stars in eternal twilight.',
      origin_ar: 'كان في ماضيه باحثاً مرموقاً في زلامار، لكن هوسه بكشف أسرار المادة المظلمة ألقى به في جوف الفراغ ليولد من جديد كسيد للظلال.',
      origin_en: 'Once a renowned scholar in Zalamar, his thirst for forbidden cosmic truth caused him to be swallowed by the Void.',
      powers: ['Dark Matter Conjuration', 'Shadow Step Teleportation', 'Memory Stealing', 'Obsidian Constructs'],
      powers_ar: ['استحضار المادة المعتمة', 'القفز عبر الظلال', 'سلب الذكريات الحيوية', 'تشييد أسلحة السج الأسود'],
      weaknesses: ['Pure Concentrated Sunlight', 'Sacred Crystal Resonance'],
      weaknesses_ar: ['أشعة النواة الشمسية المركزة', 'رنين البلورات الكونية النقية'],
      affiliations: ['Void Legions', 'Eclipse Covenant'],
      affiliations_ar: ['فيالق الفراغ', 'ميثاق الكسوف'],
      related_character_ids: ['c1'],
      stats: { strength: 88, speed: 82, durability: 90, intelligence: 94, magic: 92, combat: 89 },
      image_url: '/assets/generated_images/farhan.jpg',
      cloudinary_image_public_id: 'hekayaty/characters/farhan',
      classification: 'original',
      created_by: 'فريق حكاياتي الإبداعي',
      first_appearance: 'أصول النور #1',
    },
  ];

  console.log(`- Upserting ${characters.length} characters...`);
  const { error: cErr } = await supabase.from('characters').upsert(characters);
  if (cErr) console.error('Error upserting characters:', cErr);
  else console.log('✓ Characters synchronized successfully.');

  // 3. SERIES
  const series = [
    {
      id: 's1',
      world_id: 'w1',
      title_ar: 'أبطال الذهب',
      title_en: 'Heroes of Gold',
      description_ar: 'الملحمة الشاملة لصعود زايد الذهبي ورفاقه لحماية إمبراطورية زلامار من زحف قوى الظلام العتيدة.',
      cover_image_url: '/assets/generated_images/comic_1.jpg',
      cloudinary_cover_public_id: 'hekayaty/series/heroes_of_gold',
      classification: 'original',
      created_by: 'فريق حكاياتي الإبداعي',
    },
    {
      id: 's2',
      world_id: 'w2',
      title_ar: 'نسيج النجوم',
      title_en: 'Cosmic Threads',
      description_ar: 'رحلة فضائية عبر بوابات نوفا قديم لاستكشاف التصدعات الزمنية وحفظ أسرار السدم المضيئة.',
      cover_image_url: '/assets/generated_images/comic_2.jpg',
      cloudinary_cover_public_id: 'hekayaty/series/cosmic_threads',
      classification: 'original',
      created_by: 'فريق حكاياتي الإبداعي',
    },
  ];

  console.log(`- Upserting ${series.length} series...`);
  const { error: sErr } = await supabase.from('series').upsert(series);
  if (sErr) console.error('Error upserting series:', sErr);
  else console.log('✓ Series synchronized successfully.');

  // 4. COMICS
  const comics = [
    {
      id: 'comic_1',
      series_id: 's1',
      world_id: 'w1',
      title_ar: 'أصول النور: شعلة الصحراء',
      title_en: 'Origins of Light: Desert Flame',
      issue_number: 1,
      synopsis_ar: 'في قلب صحراء زلامار، يكتشف المحارب الشاب زايد درعاً شمسياً عتيقاً يتزامن مع أول هجوم تشنه فيالق الظل بقيادة فرحان السواد.',
      synopsis_en: 'In the deep sands of Zalamar, young Zayed discovers an ancient solar relic just as shadow legions launch their first assault.',
      writer: 'كريم البوسعيدي',
      artist: 'سمر خالد',
      cover_image_url: '/assets/generated_images/comic_1.jpg',
      cloudinary_cover_public_id: 'hekayaty/comics/origins_of_light_1',
      page_count: 32,
      character_ids: ['c1', 'c3'],
      is_free: true,
      is_featured: true,
      classification: 'original',
      created_by: 'فريق حكاياتي الإبداعي'
    },
    {
      id: 'comic_2',
      series_id: 's2',
      world_id: 'w2',
      title_ar: 'نسيج النجوم: بوابة الأزل',
      title_en: 'Cosmic Threads: Gate of Eternity',
      issue_number: 1,
      synopsis_ar: 'تستشعر ليلى النجم اضطراباً في تدفق طاقة السدم حول نوفا قديم، مما يقودها إلى بوابة زمنية قديمة تحوي أسرار السقوط الأول.',
      synopsis_en: 'Lailat detects an anomaly in nebula leylines around Nova Qadim, leading her to a long-sealed gateway holding forgotten truths.',
      writer: 'يوسف الأنصاري',
      artist: 'نادية العلي',
      cover_image_url: '/assets/generated_images/comic_2.jpg',
      cloudinary_cover_public_id: 'hekayaty/comics/cosmic_threads_1',
      page_count: 28,
      character_ids: ['c2', 'c3'],
      is_free: true,
      is_featured: true,
      classification: 'original',
      created_by: 'فريق حكاياتي الإبداعي'
    },
  ];

  console.log(`- Upserting ${comics.length} comics...`);
  const { error: comErr } = await supabase.from('comics').upsert(comics);
  if (comErr) console.error('Error upserting comics:', comErr);
  else console.log('✓ Comics synchronized successfully.');

  // 5. STORIES
  const stories = [
    {
      id: 'story_1',
      world_id: 'w1',
      title_ar: 'قلب الرمال: اعترافات حارس النور',
      title_en: 'Heart of the Sands: Confessions of the Light Guardian',
      author: 'كريم البوسعيدي',
      author_ar: 'كريم البوسعيدي',
      synopsis_ar: 'يوميات حميمة تكشف اللحظات التي تلت ارتداء زايد للدرع الشمسي لأول مرة.',
      content: 'كانت الرمال تهمس بلغة لا يفهمها سوى من تماهت روحه مع وهج الظهيرة. عندما انغرزت شظايا البلورة الشمسية في صفائح الدرع، لم أشعر بألم، بل بتدفق ستة قرون من العزة والمسؤولية في عروقي...',
      cover_image_url: '/assets/generated_images/hero_bg.jpg',
      word_count: 3200,
      read_time_minutes: 12,
      character_ids: ['c1'],
      is_free: true,
      is_featured: true,
      genres_ar: ['قصة قصيرة', 'سرد وجداني', 'دراما'],
      classification: 'original'
    }
  ];

  console.log(`- Upserting ${stories.length} stories...`);
  const { error: stErr } = await supabase.from('stories').upsert(stories);
  if (stErr) console.error('Error upserting stories:', stErr);
  else console.log('✓ Stories synchronized successfully.');

  // 6. TIMELINE EVENTS
  const timelineEvents = [
    {
      id: 't1',
      title_ar: 'الكسوف الأول وتصدع الفضاء',
      title_en: 'The Prime Eclipse & The Rift',
      year: 'العصر القديم — سنة 120 ق.م',
      era: 'ancient',
      description_ar: 'تزامن اصطفاف ثلاثة شموس مع انفجار في النواة المركزية لمجرة حكاياتي، مما أدى لانشطار بُعد الفراغ الأسود وظهور أول بلورات الطاقة الشمسية.',
      description_en: 'The triple sun alignment triggered a cosmic core reaction, rupturing reality and unleashing solar crystal leylines.',
      category: 'catastrophe',
      image_url: '/assets/generated_images/timeline_artifact.png',
      impact: 'legendary',
      character_ids: ['c1', 'c3'],
      world_ids: ['w1', 'w4']
    }
  ];

  console.log(`- Upserting ${timelineEvents.length} timeline events...`);
  const { error: tErr } = await supabase.from('timeline_events').upsert(timelineEvents);
  if (tErr) console.error('Error upserting timeline events:', tErr);
  else console.log('✓ Timeline events synchronized successfully.');

  // 7. ENCYCLOPEDIA ENTRIES
  const encyclopedia = [
    {
      id: 'enc_1',
      title_ar: 'الدرع الشمسي الأبدي',
      title_en: 'The Eternal Solar Armor',
      category: 'artifact',
      description_ar: 'قطعة عسكرية وأثرية فريدة من نوعها صيغت من بلازما الرمال المتصلبة ونواة الشمس الأولى، وتمنح مرتديها القدرة على امتصاص وتوجيه الإشعاع الضوئي الفتاك.',
      description_en: 'A supreme relic forged from solidified sand plasma and the First Sun spark, channeling pure photonic force.',
      tags: ['سلاح', 'زلامار', 'زايد', 'شمسي', 'أثر'],
      image_url: '/assets/generated_images/timeline_artifact.png',
      related_character_ids: ['c1'],
      related_world_ids: ['w1']
    }
  ];

  console.log(`- Upserting ${encyclopedia.length} encyclopedia entries...`);
  const { error: eErr } = await supabase.from('encyclopedia_entries').upsert(encyclopedia);
  if (eErr) console.error('Error upserting encyclopedia:', eErr);
  else console.log('✓ Encyclopedia entries synchronized successfully.');

  // 8. NEWS ARTICLES
  const news = [
    {
      id: 'news_1',
      title_ar: 'الإعلان الرسمي عن إطلاق سلسلة "أبطال الذهب" الجزء الثاني',
      title_en: 'Official Announcement: Heroes of Gold Volume II',
      summary_ar: 'فريق حكاياتي يكشف عن الملحمة القادمة في معرض القاهرة الدولي للكتاب بتعاون فني استثنائي.',
      content_ar: 'يسر دار حكاياتي للنشر والإنتاج الإبداعي أن تعلن لجمهورها الوفي عن اكتمال الرسوم الخاصة بالجزء الثاني من السلسلة الأسطورية...',
      image_url: '/assets/generated_images/comic_1.jpg',
      is_featured: true,
      tags: ['إعلانات', 'أبطال الذهب', 'كوميكس', 'معارض']
    }
  ];

  console.log(`- Upserting ${news.length} news articles...`);
  const { error: nErr } = await supabase.from('news_articles').upsert(news);
  if (nErr) console.error('Error upserting news:', nErr);
  else console.log('✓ News articles synchronized successfully.');

  // 9. EVENTS
  const events = [
    {
      id: 'ev_1',
      title_ar: 'مؤتمر حكاياتي للقصص المصورة والرسوم المتحركة 2027',
      title_en: 'Hekayaty Comics & Animation Summit 2027',
      description_ar: 'أضخم ملتقى يجمع رسامي الكوميكس وكُتّاب الخيال العربي مع ورش عمل تفاعلية ومعارض حصرية.',
      event_date: '2027-02-10T10:00:00Z',
      location: 'مركز المعارض الدولي — الرياض / القاهرة',
      is_online: false,
      image_url: '/assets/generated_images/hero_bg_2.jpg'
    }
  ];

  console.log(`- Upserting ${events.length} events...`);
  const { error: evErr } = await supabase.from('events').upsert(events);
  if (evErr) console.error('Error upserting events:', evErr);
  else console.log('✓ Events synchronized successfully.');

  // 10. CARD GAME CARDS
  const cards = [
    {
      id: 'card_1',
      name_ar: 'زايد — درع الشمس الخالد',
      name_en: 'Zayed — Aegis of Sol',
      type: 'hero',
      rarity: 'legendary',
      character_id: 'c1',
      image_url: '/assets/generated_images/card_art_1.jpg',
      stats: { attack: 9, defense: 10, energy: 8 },
      abilities: [
        { nameAr: 'انفجار الصدمة الشمسية', descriptionAr: 'يلحق 5 نقاط ضرر بكافة وحوش الظل في الميدان.' }
      ]
    },
    {
      id: 'card_2',
      name_ar: 'ليلى — نساجة المدارات',
      name_en: 'Lailat — Orbital Weaver',
      type: 'hero',
      rarity: 'epic',
      character_id: 'c2',
      image_url: '/assets/generated_images/card_art_2.jpg',
      stats: { attack: 7, defense: 8, energy: 10 },
      abilities: [
        { nameAr: 'بوابة الجاذبية', descriptionAr: 'تعيد بطاقة العدو إلى يده وتمنح حليفاً درعاً كوزمياً.' }
      ]
    }
  ];

  console.log(`- Upserting ${cards.length} card game cards...`);
  const { error: cGameErr } = await supabase.from('card_game_cards').upsert(cards);
  if (cGameErr) console.error('Error upserting cards:', cGameErr);
  else console.log('✓ Card game cards synchronized successfully.');

  // 11. SUBSCRIPTION PLANS
  const subscriptionPlans = [
    {
      id: 'monthly',
      name_ar: 'اشتراك حكاياتي بلس الشهري',
      name_en: 'Hekayaty Plus Monthly',
      price_egp_monthly: 65.0,
      price_egp_yearly: 590.0,
      features: [
        'قراءة غير محدودة لجميع أعداد الكوميكس الأصلية',
        'الوصول المبكر للفصول قبل النشر بأسبوع',
        'شارة العضوية الحصرية في المجتمع والمناقشات',
      ],
      is_active: true
    },
    {
      id: 'yearly',
      name_ar: 'عضوية حكاياتي الأسطورية (سنوية)',
      name_en: 'Hekayaty Legendary Annual',
      price_egp_monthly: 49.17,
      price_egp_yearly: 590.0,
      features: [
        'كل مزايا الاشتراك الشهري',
        'حزمة بطاقات لعبة الأبطال مجاناً عند التجديد',
        'دعوات حصرية للقاءات المبدعين ومؤتمرات الرسوم',
      ],
      is_active: true
    }
  ];

  console.log(`- Upserting ${subscriptionPlans.length} subscription plans...`);
  const { error: planErr } = await supabase.from('subscription_plans').upsert(subscriptionPlans);
  if (planErr) console.error('Error upserting subscription plans:', planErr);
  else console.log('✓ Subscription plans synchronized successfully.');

  // 12. PRODUCTS
  const products = [
    {
      id: 1,
      content_type: 'comic',
      name_ar: 'مجلة أبطال الذهب — العدد الأول (نسخة ورقية فاخرة)',
      name_en: 'Heroes of Gold #1 (Deluxe Print Edition)',
      description_ar: 'طبعة ورقية فاخرة بغلاف مقوى مع بوستر حصري موقع من فريق الرسامين.',
      price_egp: 120.0,
      is_digital: false,
      stock_count: 45
    },
    {
      id: 2,
      content_type: 'card',
      name_ar: 'حزمة بطاقات لعبة أبطال حكاياتي (مجموعة المبتدئين)',
      name_en: 'Hekayaty Champions Card Game (Starter Pack)',
      description_ar: 'تحتوي على 40 بطاقة ملونة تشمل بطاقة نادرة مضمونة وقواعد اللعبة الرسمية.',
      price_egp: 250.0,
      is_digital: false,
      stock_count: 30
    },
    {
      id: 3,
      content_type: 'subscription_plan',
      name_ar: 'الوصول الرقمي الشامل لجميع الأعداد والقصص',
      name_en: 'Digital All-Access Pass',
      description_ar: 'اشتراك رقمي يتيح قراءة غير محدودة بدقة فائقة وبدون إعلانات.',
      price_egp: 80.0,
      is_digital: true,
      stock_count: null
    }
  ];

  console.log(`- Upserting ${products.length} products...`);
  const { error: prodErr } = await supabase.from('products').upsert(products);
  if (prodErr) console.error('Error upserting products:', prodErr);
  else console.log('✓ Products synchronized successfully.');

  console.log('🎉 ALL CANONICAL UNIVERSE ENTITIES SYNCHRONIZED TO SUPABASE!');
}

syncUniverse().catch(err => {
  console.error('Fatal sync error:', err);
  process.exit(1);
});
