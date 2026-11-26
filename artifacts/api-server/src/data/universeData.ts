// =============================================================================
// HEKAYATY UNIVERSE DATA REPOSITORY (Clean Server Data)
// =============================================================================

export interface World {
  id: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  ruler: string;
  rulerAr: string;
  alignment: 'light' | 'neutral' | 'dark';
  climate: string;
  climateAr: string;
  history: string;
  historyAr: string;
  image: string;
  notableLocations: Array<{ nameAr: string; nameEn: string; descriptionAr: string }>;
  organizations: Array<{ nameAr: string; descriptionAr: string }>;
  characterIds: string[];
  comicIds: string[];
  timelineEventIds: string[];
}

export interface Character {
  id: string;
  nameEn: string;
  nameAr: string;
  alias?: string;
  aliasAr?: string;
  alignment: 'hero' | 'villain' | 'antihero' | 'neutral';
  worldId: string;
  bioEn: string;
  bioAr: string;
  originEn: string;
  originAr: string;
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
  };
  image: string;
  classification: 'original' | 'hekayaty_selected' | 'official_collaboration';
  createdBy: string;
  firstAppearance: string;
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
  month: number;
  genres: string[];
  genresAr: string[];
  coverImage: string;
  characterIds: string[];
  worldId: string;
  rating: number;
  pageCount: number;
  classification: 'original' | 'hekayaty_selected' | 'official_collaboration';
  createdBy: string;
  isFeatured: boolean;
  isNew: boolean;
  previousIssueId?: string;
  nextIssueId?: string;
}

export interface Series {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  coverImage: string;
  classification: 'original' | 'hekayaty_selected' | 'official_collaboration';
  createdBy: string;
  worldId: string;
  genres: string[];
  genresAr: string[];
  status: 'ongoing' | 'completed' | 'hiatus';
  issueCount: number;
}

export interface Story {
  id: string;
  titleAr: string;
  titleEn: string;
  author: string;
  authorAr: string;
  synopsisAr: string;
  coverImage: string;
  genres: string[];
  genresAr: string[];
  classification: 'original' | 'hekayaty_selected' | 'official_collaboration';
  characterIds: string[];
  worldId: string;
  wordCount: number;
  readTimeMinutes: number;
  year: number;
  isFeatured: boolean;
  isNew: boolean;
  content?: string;
}

export const worlds: World[] = [
  {
    id: 'w1',
    nameEn: 'Zalamar',
    nameAr: 'زلامار',
    descriptionEn: 'The golden desert empire, where ancient sun magic and futuristic spires exist in harmony amidst endless crystalline dunes.',
    descriptionAr: 'إمبراطورية الكثبان الذهبية، حيث يتعانق السحر الشمسي الأسطوري مع ناطحات السحاب المتقدمة في تناغم استثنائي تحت وهج الشمس الخالدة.',
    ruler: 'Emperor Zayed',
    rulerAr: 'الإمبراطور زايد الذهبي',
    alignment: 'light',
    climate: 'Arid Solar / Crystal Winds',
    climateAr: 'صحراوي شمسي مشبع برياح البلورات الكونية',
    notableLocations: [
      { nameAr: 'برج الشمس الخالد', nameEn: 'The Sun Spire', descriptionAr: 'أطول برج معماري في زلامار، يمتص طاقة النجوم لتغذية الشبكة الطاقية للإمبراطورية.' },
      { nameAr: 'واحة الأصداء النجمية', nameEn: 'Oasis of Echoes', descriptionAr: 'بحيرة سرية تحتفظ بذكريات الحضارات البائدة وتعكس أصداء المستقبل.' },
      { nameAr: 'معبد النور الأول', nameEn: 'First Light Sanctuary', descriptionAr: 'أقدس بقاع زلامار، ومصدر درع النور الذي يحمله الحراس الذهبيون.' },
    ],
    history: 'Founded six centuries ago when the First Sun Prophet awakened the solar leylines.',
    historyAr: 'تأسست زلامار قبل ستمائة عام عقب استيقاظ خطوط الطاقة الشمسية واندماج القبائل الصحراوية تحت راية حراس النور في معركة التحرير الكبرى.',
    organizations: [
      { nameAr: 'الطليعة الذهبية', descriptionAr: 'فرقة حراس النخبة المدربين على توجيه طاقة البلازما الشمسية والدفاع عن حدود الكثبان.' },
      { nameAr: 'مجلس حكماء الصحراء', descriptionAr: 'مجلس تشريعي يضم كبار علماء الفلك والفلسفة لتوجيه بوصلة الإمبراطورية.' },
    ],
    characterIds: ['c1', 'c7'],
    comicIds: ['comic_1', 'comic_5'],
    timelineEventIds: ['t1', 't4', 't7'],
    image: '/assets/generated_images/world_zalamar.jpg',
  },
  {
    id: 'w2',
    nameEn: 'Nova Qadim',
    nameAr: 'نوفا قديم',
    descriptionEn: 'An ancient space city built by the first star-weavers, filled with glowing blue runes and floating astronomical observatories.',
    descriptionAr: 'حاضرة فلكية فضائية شيدها نساجو النجوم الأوائل، تسبح في الفضاء السحيق بنقوش رونية زرقاء مضيئة ومعابد مدارية معلقة.',
    ruler: 'Council of the Cosmos',
    rulerAr: 'مجلس الكون الفلكي',
    alignment: 'neutral',
    climate: 'Orbital Vacuum / Nebula Aurora',
    climateAr: 'مداري فراغي محاط بشفق السدم الملونة وتيارات طاقة السوبرنوفا',
    notableLocations: [
      { nameAr: 'بوابة النجوم الأزلية', nameEn: 'Starlight Nexus', descriptionAr: 'محطة العبور البين-كوكبية المركزية التي تربط مسارات الأبعاد السبعة.' },
      { nameAr: 'مرصد النسيج الزمني', nameEn: 'Chronos Weave Spire', descriptionAr: 'برج مراقبة يحفظ توازنات الخط الزمني للكون من التشوهات.' },
    ],
    history: 'Created during the Great Astral Convergence by mystics seeking pure cosmic knowledge.',
    historyAr: 'بُنيت أثناء التقارب النجمي العظيم على يد رهبان الفلك لتكون ملاذاً محايداً للمعرفة ومركزاً لحفظ علوم الفلك والأسرار الكونية السحرية.',
    organizations: [
      { nameAr: 'نساجو النجوم', descriptionAr: 'علماء ومهندسون يتحكمون في مسارات الطاقة السحرية ونسج الجسور بين الكواكب.' },
    ],
    characterIds: ['c2', 'c8'],
    comicIds: ['comic_2', 'comic_6'],
    timelineEventIds: ['t2', 't5', 't8'],
    image: '/assets/generated_images/world_nova_qadim.jpg',
  },
  {
    id: 'w3',
    nameEn: 'Al-Marid',
    nameAr: 'المارد',
    descriptionEn: 'The deep aquatic abyssal realm, illuminated by bioluminescent corals and governed by ancient tides and elemental currents.',
    descriptionAr: 'المملكة المائية العميقة في قعر المحيطات الكونية، تتلألأ بالشعاب المرجانية الحيوية المضيئة وتخضع لتيارات السحر البحري القديم.',
    ruler: 'Sultan Bahar & Princess Nour',
    rulerAr: 'السلطان بحار والأميرة نور القمر',
    alignment: 'light',
    climate: 'Abyssal Hydro-Pressure',
    climateAr: 'ضغط هيدروليكي سحيق محمي بهالات طاقة مائية نقية صالحة للتنفس',
    notableLocations: [
      { nameAr: 'قصر اللؤلؤة السوداء', nameEn: 'Pearl Palace', descriptionAr: 'مقر العرش المائي المنحوت في قلب أصداف عملاقة تعود لعصور ما قبل الطوفان.' },
    ],
    history: 'A civilization that sank intentionally to protect the Cosmic Pearl from surface wars.',
    historyAr: 'حضارة اختارت الغوص في أعماق المحيط لحماية جوهرة المد الكوني من مطامع الحروب السطحية.',
    organizations: [
      { nameAr: 'حماة التيارات', descriptionAr: 'فرسان الأعماق الذين يمتطون الوحوش المضيئة ويحرسون شرايين المياه الحيوية.' },
    ],
    characterIds: ['c5'],
    comicIds: ['comic_3'],
    timelineEventIds: ['t3', 't9'],
    image: '/assets/generated_images/world_al_marid.jpg',
  },
  {
    id: 'w4',
    nameEn: 'The Void',
    nameAr: 'الفراغ الأسود',
    descriptionEn: 'A fractured dimension of anti-matter, cosmic storms, and floating obsidian citadels where reality twists and shadows rule.',
    descriptionAr: 'البعد المتشظي للمادة المضادة والعواصف الكونية، تسبح فيه قلاع من حجر السج الأسود وتتحكم فيه قوى الظلام العتيقة.',
    ruler: 'Farhan Al-Sawad',
    rulerAr: 'فرحان السواد (سيد الظل)',
    alignment: 'dark',
    climate: 'Cosmic Anti-Matter Storms',
    climateAr: 'عواصف ظلام مضادة للمادة، تفكك الروابط الكيميائية وتلتهم الضوء',
    notableLocations: [
      { nameAr: 'عرش السج الأسود', nameEn: 'Obsidian Throne', descriptionAr: 'برج الحاكم فرحان المشيد من مادة حجرية تمتص كل أطياف الضوء المرئي.' },
    ],
    history: 'Formed from the space torn apart during the Prime Cataclysm.',
    historyAr: 'انبثق هذا البعد إثر الانفجار الكوني الأول وتصدع نسيج الفضاء.',
    organizations: [
      { nameAr: 'فيلق الظل السحيق', descriptionAr: 'محاربو الظلام المتخفون القادرون على التنقل بين الظلال.' },
    ],
    characterIds: ['c3', 'c4'],
    comicIds: ['comic_2', 'comic_7'],
    timelineEventIds: ['t1', 't6', 't10'],
    image: '/assets/generated_images/world_the_void.jpg',
  },
  {
    id: 'w5',
    nameEn: 'Syrra Prime',
    nameAr: 'سيرا برايم',
    descriptionEn: 'A magical cyberpunk megapolis powered by crystal fusion, floating sky-skiffs, bustling neon souks, and relentless corporate ambition.',
    descriptionAr: 'ميتروبوليس سحرية مستقبلية تعمل بمولدات الاندماج البلوري، تحلق في أجوائها المراكب الهوائية وتمتزج فيها الأسواق الشعبية بالأبراج الشاهقة.',
    ruler: 'The Trade Syndicates',
    rulerAr: 'نقابات التجارة البلورية والمحافظ راكان',
    alignment: 'neutral',
    climate: 'Neon Electro-Smog / Sand Skim',
    climateAr: 'رياح كهروستاتيكية محملة بغبار بلوري ملون وسحب نيون اصطناعية',
    notableLocations: [
      { nameAr: 'السوق المركزي المعلق', nameEn: 'Grand Neon Bazaar', descriptionAr: 'أضخم مركز تجاري في المجرة لتبادل التقنيات الهجينة والقطع الأثرية النادرة.' },
    ],
    history: 'Rose as a free trade refuge at the intersection of three hyperspace lanes.',
    historyAr: 'ازدهرت كمدينة تجارية حرة عند ملتقى ثلاثة طرق ملاحة فائقة السرعة.',
    organizations: [
      { nameAr: 'تحالف الميكانيكيين الأحرار', descriptionAr: 'نقابة الحرفيين والمبتكرين الذين يطورون أحدث العتاد الميكانيكي.' },
    ],
    characterIds: ['c6'],
    comicIds: ['comic_4', 'comic_8'],
    timelineEventIds: ['t5', 't9'],
    image: '/assets/generated_images/world_syrra_prime.jpg',
  },
];

export const characters: Character[] = [
  {
    id: 'c1',
    nameEn: 'Zayed Al-Dhahabi',
    nameAr: 'زايد الذهبي',
    alias: 'The Golden Warrior',
    aliasAr: 'المحارب الذهبي',
    alignment: 'hero',
    worldId: 'w1',
    bioEn: 'A noble protector clad in sacred solar armor, channeling the fierce energy of ancient desert suns.',
    bioAr: 'فارس نبيل يرتدي درعاً شمسياً عريقاً صيغ من بلورات الصحراء النقية، يكرس حياته للدفاع عن المظلومين وصيانة شعلة النور في عوالم حكاياتي.',
    originEn: 'Found dying in the sands after a shadow ambush, the Solar Core chose him as its living champion.',
    originAr: 'بينما كان يواجه حتفه في قلب الصحراء إثر غارة لجيوش الظل، استيقظت شعلة النواة الشمسية في صدره، لتصنع منه بطلاً متوجاً بنور الشمس الأبدي.',
    powers: ['Solar Energy Blades', 'Superhuman Flight', 'Photonic Armor Projection', 'Solar Burst'],
    powersAr: ['سيوف الطاقة الشمسية', 'الطيران الأسرع من الصوت', 'توليد الدروع الضوئية', 'انفجار الصدمة الشمسية'],
    weaknesses: ['Solar Eclipses', 'Extreme Cryo Environments', 'Compassion for Former Allies'],
    weaknessesAr: ['الكسوف الشمسي الكلي', 'البيئات الجليدية السحيقة', 'الإفراط في الثقة بالخصوم'],
    affiliations: ['The Golden Vanguard', 'Guardians of Zalamar'],
    affiliationsAr: ['الطليعة الذهبية', 'حماة زلامار'],
    relatedCharacterIds: ['c2', 'c3', 'c7'],
    comicIds: ['comic_1', 'comic_5'],
    timelineEventIds: ['t1', 't4', 't7'],
    stats: { strength: 90, speed: 78, durability: 95, intelligence: 72, magic: 84, combat: 92 },
    image: '/assets/generated_images/zayed.jpg',
    classification: 'original',
    createdBy: 'فريق حكاياتي الإبداعي',
    firstAppearance: 'أصول النور #1',
  },
  {
    id: 'c2',
    nameEn: 'Lailat Al-Najm',
    nameAr: 'ليلى النجم',
    alias: 'Starlight Weaver',
    aliasAr: 'نساجة النجوم',
    alignment: 'hero',
    worldId: 'w2',
    bioEn: 'A brilliant cosmic sorceress who manipulates gravitational fields and navigates quantum astral pathways.',
    bioAr: 'عالمة وساحرة فلكية بارعة تتحكم في حقول الجاذبية وتتنقل عبر المسارات الفلكية لحماية التوازن بين أبعاد المجرة.',
    originEn: 'Born beneath a binary super-nova, she inherited the instinctive ability to weave stellar energy strings.',
    originAr: 'ولدت لحظة انفجار سديمي مزدوج في نوفا قديم، فوهبتها النجوم قدرة فطرية على قراءة وتطويع أوتار الطاقة النجمية.',
    powers: ['Gravity Distortion', 'Quantum Portals', 'Astral Projection', 'Stellar Energy Weaving'],
    powersAr: ['تطويع الجاذبية', 'فتح بوابات العبور السحرية', 'الإسقاط الأثيري', 'نسج أشعة النجوم'],
    weaknesses: ['Dark Energy Wells', 'Gravitational Resonance Disruption'],
    weaknessesAr: ['آبار الطاقة المظلمة', 'اضطراب التردد الجاذبي'],
    affiliations: ['Star-Weavers Guild', 'Council of the Cosmos'],
    affiliationsAr: ['نقابة نساجي النجوم', 'مجلس الكون الفلكي'],
    relatedCharacterIds: ['c1', 'c8'],
    comicIds: ['comic_2', 'comic_6'],
    timelineEventIds: ['t2', 't5', 't8'],
    stats: { strength: 60, speed: 85, durability: 68, intelligence: 98, magic: 96, combat: 75 },
    image: '/assets/generated_images/lailat.jpg',
    classification: 'original',
    createdBy: 'فريق حكاياتي الإبداعي',
    firstAppearance: 'نسيج النجوم #1',
  },
  {
    id: 'c3',
    nameEn: 'Farhan Al-Sawad',
    nameAr: 'فرحان السواد',
    alias: 'Lord of Shadows',
    aliasAr: 'سيد الظلال',
    alignment: 'villain',
    worldId: 'w4',
    bioEn: 'A master of anti-light who commands shadow tendrils and seeks to drown all radiant stars in eternal twilight.',
    bioAr: 'قائد ظلامي مهيب يتحكم في خيوط الظل المادي، يسعى لإطفاء كل منارة نجمية وإعادة الأكوان إلى سكون العدم المطلق.',
    originEn: 'Once a renowned scholar in Zalamar, his thirst for forbidden cosmic truth caused him to be swallowed by the Void.',
    originAr: 'كان في ماضيه باحثاً مرموقاً في زلامار، لكن هوسه بكشف أسرار المادة المظلمة ألقى به في جوف الفراغ ليولد من جديد كسيد للظلال.',
    powers: ['Dark Matter Conjuration', 'Shadow Step Teleportation', 'Memory Stealing', 'Obsidian Constructs'],
    powersAr: ['استحضار المادة المعتمة', 'القفز عبر الظلال', 'سلب الذكريات الحيوية', 'تشييد أسلحة السج الأسود'],
    weaknesses: ['Pure Concentrated Sunlight', 'Sacred Crystal Resonance'],
    weaknessesAr: ['أشعة النواة الشمسية المركزة', 'رنين البلورات الكونية النقية'],
    affiliations: ['Void Legions', 'Eclipse Covenant'],
    affiliationsAr: ['فيالق الفراغ', 'ميثاق الكسوف'],
    relatedCharacterIds: ['c1', 'c4'],
    comicIds: ['comic_1', 'comic_7'],
    timelineEventIds: ['t1', 't6', 't10'],
    stats: { strength: 88, speed: 82, durability: 90, intelligence: 94, magic: 92, combat: 89 },
    image: '/assets/generated_images/farhan.jpg',
    classification: 'original',
    createdBy: 'فريق حكاياتي الإبداعي',
    firstAppearance: 'أصول النور #1',
  },
];

export const series: Series[] = [
  {
    id: 's1',
    titleAr: 'أبطال الذهب',
    titleEn: 'Heroes of Gold',
    descriptionAr: 'الملحمة الشاملة لصعود زايد الذهبي ورفاقه لحماية إمبراطورية زلامار من زحف قوى الظلام العتيدة.',
    coverImage: '/assets/generated_images/comic_1.jpg',
    classification: 'original',
    createdBy: 'فريق حكاياتي الإبداعي',
    worldId: 'w1',
    genres: ['Action', 'Fantasy', 'Mythology'],
    genresAr: ['أكشن', 'خيال أسطوري', 'مغامرة'],
    status: 'ongoing',
    issueCount: 3,
  },
  {
    id: 's2',
    titleAr: 'نسيج النجوم',
    titleEn: 'Cosmic Threads',
    descriptionAr: 'رحلة فضائية عبر بوابات نوفا قديم لاستكشاف التصدعات الزمنية وحفظ أسرار السدم المضيئة.',
    coverImage: '/assets/generated_images/comic_2.jpg',
    classification: 'original',
    createdBy: 'فريق حكاياتي الإبداعي',
    worldId: 'w2',
    genres: ['Sci-Fi', 'Cosmic', 'Mystery'],
    genresAr: ['خيال علمي', 'كوني', 'غموض'],
    status: 'ongoing',
    issueCount: 2,
  },
];

export const comics: Comic[] = [
  {
    id: 'comic_1',
    seriesId: 's1',
    titleAr: 'أصول النور: شعلة الصحراء',
    titleEn: 'Origins of Light: Desert Flame',
    issueNumber: 1,
    synopsisAr: 'في قلب صحراء زلامار، يكتشف المحارب الشاب زايد درعاً شمسياً عتيقاً يتزامن مع أول هجوم تشنه فيالق الظل بقيادة فرحان السواد.',
    synopsisEn: 'In the deep sands of Zalamar, young Zayed discovers an ancient solar relic just as shadow legions launch their first assault.',
    writer: 'كريم البوسعيدي',
    artist: 'سمر خالد',
    year: 2026,
    month: 1,
    genres: ['Action', 'Fantasy', 'Origin'],
    genresAr: ['أكشن', 'خيال', 'أصل البطل'],
    coverImage: '/assets/generated_images/comic_1.jpg',
    characterIds: ['c1', 'c3'],
    worldId: 'w1',
    rating: 4.9,
    pageCount: 32,
    classification: 'original',
    createdBy: 'فريق حكاياتي الإبداعي',
    isFeatured: true,
    isNew: false,
  },
  {
    id: 'comic_2',
    seriesId: 's2',
    titleAr: 'نسيج النجوم: بوابة الأزل',
    titleEn: 'Cosmic Threads: Gate of Eternity',
    issueNumber: 1,
    synopsisAr: 'تستشعر ليلى النجم اضطراباً في تدفق طاقة السدم حول نوفا قديم، مما يقودها إلى بوابة زمنية قديمة تحوي أسرار السقوط الأول.',
    synopsisEn: 'Lailat detects an anomaly in nebula leylines around Nova Qadim, leading her to a long-sealed gateway holding forgotten truths.',
    writer: 'يوسف الأنصاري',
    artist: 'نادية العلي',
    year: 2026,
    month: 2,
    genres: ['Sci-Fi', 'Cosmic', 'Magic'],
    genresAr: ['خيال علمي', 'كوني', 'سحر'],
    coverImage: '/assets/generated_images/comic_2.jpg',
    characterIds: ['c2', 'c3'],
    worldId: 'w2',
    rating: 4.8,
    pageCount: 28,
    classification: 'original',
    createdBy: 'فريق حكاياتي الإبداعي',
    isFeatured: true,
    isNew: false,
  },
];

export const stories: Story[] = [
  {
    id: 'story_1',
    titleAr: 'قلب الرمال: اعترافات حارس النور',
    titleEn: 'Heart of the Sands: Confessions of the Light Guardian',
    author: 'كريم البوسعيدي',
    authorAr: 'كريم البوسعيدي',
    synopsisAr: 'يوميات حميمة تكشف اللحظات التي تلت ارتداء زايد للدرع الشمسي لأول مرة.',
    coverImage: '/assets/generated_images/hero_bg.jpg',
    genres: ['Prose', 'Lore', 'Drama'],
    genresAr: ['قصة قصيرة', 'سرد وجداني', 'دراما'],
    classification: 'original',
    characterIds: ['c1'],
    worldId: 'w1',
    wordCount: 3200,
    readTimeMinutes: 12,
    year: 2026,
    isFeatured: true,
    isNew: false,
    content: 'كانت الرمال تهمس بلغة لا يفهمها سوى من تماهت روحه مع وهج الظهيرة...',
  },
];

export const timelineEvents = [
  {
    id: 't1',
    titleAr: 'الكسوف الأول وتصدع الفضاء',
    titleEn: 'The Prime Eclipse & The Rift',
    year: 'العصر القديم — سنة 120 ق.م',
    era: 'ancient',
    descriptionAr: 'تزامن اصطفاف ثلاثة شموس مع انفجار في النواة المركزية لمجرة حكاياتي.',
    category: 'catastrophe',
    image: '/assets/generated_images/timeline_artifact.png',
    impact: 'legendary',
  },
];

export const encyclopediaEntries = [
  {
    id: 'enc_1',
    titleAr: 'الدرع الشمسي الأبدي',
    titleEn: 'The Eternal Solar Armor',
    category: 'artifact',
    descriptionAr: 'قطعة عسكرية وأثرية فريدة من نوعها صيغت من بلازما الرمال المتصلبة ونواة الشمس الأولى.',
    tags: ['سلاح', 'زلامار', 'زايد', 'شمسي', 'أثر'],
    image: '/assets/generated_images/timeline_artifact.png',
  },
];

export const newsArticles = [
  {
    id: 'news_1',
    titleAr: 'الإعلان الرسمي عن إطلاق سلسلة "أبطال الذهب" الجزء الثاني',
    summaryAr: 'فريق حكاياتي يكشف عن الملحمة القادمة في معرض القاهرة الدولي للكتاب.',
    publishedAt: '2026-11-15T10:00:00Z',
    isFeatured: true,
    imageUrl: '/assets/generated_images/comic_1.jpg',
  },
];

export const events = [
  {
    id: 'ev_1',
    titleAr: 'مؤتمر حكاياتي للقصص المصورة والرسوم المتحركة 2027',
    descriptionAr: 'أضخم ملتقى يجمع رسامي الكوميكس وكُتّاب الخيال العربي في الوطن العربي.',
    eventDate: '2027-02-10T10:00:00Z',
    location: 'مركز المعارض الدولي — الرياض / القاهرة',
    isOnline: false,
    imageUrl: '/assets/generated_images/hero_bg_2.jpg',
  },
];

export const cardGameCards = [
  {
    id: 'card_1',
    nameAr: 'زايد — درع الشمس الخالد',
    nameEn: 'Zayed — Aegis of Sol',
    type: 'hero',
    rarity: 'legendary',
    imageUrl: '/assets/generated_images/card_art_1.jpg',
    stats: { attack: 9, defense: 10, energy: 8 },
    flavorTextAr: 'ما دامت الشمس تشرق، فلن تسقط زلامار.',
  },
  {
    id: 'card_2',
    nameAr: 'ليلى — نساجة المدارات',
    nameEn: 'Lailat — Orbital Weaver',
    type: 'hero',
    rarity: 'epic',
    imageUrl: '/assets/generated_images/card_art_2.jpg',
    stats: { attack: 7, defense: 8, energy: 10 },
    flavorTextAr: 'النجوم لا تخطئ مساراتها، وكذلك سهامي.',
  },
];
