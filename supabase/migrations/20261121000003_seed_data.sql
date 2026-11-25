-- =============================================================================
-- HEKAYATY (حكاياتي) — CANONICAL UNIVERSE SEED DATA
-- Migration: 20261121000003_seed_data.sql
-- Description: Seeds the core worlds, characters, series, comics, stories, and lore
-- =============================================================================

-- 1. WORLDS
INSERT INTO public.worlds (id, name_ar, name_en, description_ar, description_en, ruler_ar, ruler, alignment, climate_ar, climate, history_ar, history, image_url, cloudinary_image_public_id, notable_locations, organizations)
VALUES
(
    'w1',
    'زلامار',
    'Zalamar',
    'إمبراطورية الكثبان الذهبية، حيث يتعانق السحر الشمسي الأسطوري مع ناطحات السحاب المتقدمة في تناغم استثنائي تحت وهج الشمس الخالدة.',
    'The golden desert empire, where ancient sun magic and futuristic spires exist in harmony amidst endless crystalline dunes.',
    'الإمبراطور زايد الذهبي',
    'Emperor Zayed',
    'light',
    'صحراوي شمسي مشبع برياح البلورات الكونية',
    'Arid Solar / Crystal Winds',
    'تأسست زلامار قبل ستمائة عام عقب استيقاظ خطوط الطاقة الشمسية واندماج القبائل الصحراوية تحت راية حراس النور في معركة التحرير الكبرى.',
    'Founded six centuries ago when the First Sun Prophet awakened the solar leylines.',
    '/assets/generated_images/world_zalamar.jpg',
    'hekayaty/worlds/world_zalamar',
    '[{"nameAr":"برج الشمس الخالد","nameEn":"The Sun Spire","descriptionAr":"أطول برج معماري في زلامار، يمتص طاقة النجوم لتغذية الشبكة الطاقية للإمبراطورية."},{"nameAr":"واحة الأصداء النجمية","nameEn":"Oasis of Echoes","descriptionAr":"بحيرة سرية تحتفظ بذكريات الحضارات البائدة وتعكس أصداء المستقبل."},{"nameAr":"معبد النور الأول","nameEn":"First Light Sanctuary","descriptionAr":"أقدس بقاع زلامار، ومصدر درع النور الذي يحمله الحراس الذهبيون."}]'::jsonb,
    '[{"nameAr":"الطليعة الذهبية","descriptionAr":"فرقة حراس النخبة المدربين على توجيه طاقة البلازما الشمسية والدفاع عن حدود الكثبان."},{"nameAr":"مجلس حكماء الصحراء","descriptionAr":"مجلس تشريعي يضم كبار علماء الفلك والفلسفة لتوجيه بوصلة الإمبراطورية."}]'::jsonb
),
(
    'w2',
    'نوفا قديم',
    'Nova Qadim',
    'حاضرة فلكية فضائية شيدها نساجو النجوم الأوائل، تسبح في الفضاء السحيق بنقوش رونية زرقاء مضيئة ومعابد مدارية معلقة.',
    'An ancient space city built by the first star-weavers, filled with glowing blue runes and floating astronomical observatories.',
    'مجلس الكون الفلكي',
    'Council of the Cosmos',
    'neutral',
    'مداري فراغي محاط بشفق السدم الملونة وتيارات طاقة السوبرنوفا',
    'Orbital Vacuum / Nebula Aurora',
    'بُنيت أثناء التقارب النجمي العظيم على يد رهبان الفلك لتكون ملاذاً محايداً للمعرفة ومركزاً لحفظ علوم الكوزمولوجيا السحرية.',
    'Created during the Great Astral Convergence by mystics seeking pure cosmic knowledge.',
    '/assets/generated_images/world_nova_qadim.jpg',
    'hekayaty/worlds/world_nova_qadim',
    '[{"nameAr":"بوابة النجوم الأزلية","nameEn":"Starlight Nexus","descriptionAr":"محطة العبور البين-كوكبية المركزية التي تربط مسارات الأبعاد السبعة."},{"nameAr":"مرصد النسيج الزمني","nameEn":"Chronos Weave Spire","descriptionAr":"برج مراقبة يحفظ توازنات الخط الزمني للكون من التشوهات."}]'::jsonb,
    '[{"nameAr":"نساجو النجوم","descriptionAr":"علماء ومهندسون يتحكمون في مسارات الطاقة الكوزمية ونسج الجسور بين الكواكب."}]'::jsonb
),
(
    'w3',
    'المارد',
    'Al-Marid',
    'المملكة المائية العميقة في قعر المحيطات الكونية، تتلألأ بالشعاب المرجانية الحيوية المضيئة وتخضع لتيارات السحر البحري القديم.',
    'The deep aquatic abyssal realm, illuminated by bioluminescent corals and governed by ancient tides and elemental currents.',
    'السلطان بحار والأميرة نور القمر',
    'Sultan Bahar & Princess Nour',
    'light',
    'ضغط هيدروليكي سحيق محمي بهالات طاقة مائية نقية صالحة للتنفس',
    'Abyssal Hydro-Pressure',
    'حضارة اختارت الغوص في أعماق المحيط لحماية جوهرة المد الكوني من مطامع الحروب السطحية.',
    'A civilization that sank intentionally to protect the Cosmic Pearl from surface wars.',
    '/assets/generated_images/world_al_marid.jpg',
    'hekayaty/worlds/world_al_marid',
    '[{"nameAr":"قصر اللؤلؤة السوداء","nameEn":"Pearl Palace","descriptionAr":"مقر العرش المائي المنحوت في قلب أصداف عملاقة تعود لعصور ما قبل الطوفان."}]'::jsonb,
    '[{"nameAr":"حماة التيارات","descriptionAr":"فرسان الأعماق الذين يمتطون الوحوش المضيئة ويحرسون شرايين المياه الحيوية."}]'::jsonb
),
(
    'w4',
    'الفراغ الأسود',
    'The Void',
    'البعد المتشظي للمادة المضادة والعواصف الكونية، تسبح فيه قلاع من حجر السج الأسود وتتحكم فيه قوى الظلام العتيقة.',
    'A fractured dimension of anti-matter, cosmic storms, and floating obsidian citadels where reality twists and shadows rule.',
    'فرحان السواد (سيد الظل)',
    'Farhan Al-Sawad',
    'dark',
    'عواصف ظلام مضادة للمادة، تفكك الروابط الكيميائية وتلتهم الضوء',
    'Cosmic Anti-Matter Storms',
    'انبثق هذا البعد إثر الانفجار الكوزمي الأول وتصدع نسيج الفضاء وتحول إلى منفى لكل ما لفظه النظام النجمي.',
    'Formed from the space torn apart during the Prime Cataclysm.',
    '/assets/generated_images/world_the_void.jpg',
    'hekayaty/worlds/world_the_void',
    '[{"nameAr":"عرش السج الأسود","nameEn":"Obsidian Throne","descriptionAr":"برج الحاكم فرحان المشيد من مادة حجرية تمتص كل أطياف الضوء المرئي."}]'::jsonb,
    '[{"nameAr":"فيلق الظل السحيق","descriptionAr":"محاربو الظلام المتخفون القادرون على التنقل بين الظلال وتفكيك دروع الطاقة."}]'::jsonb
),
(
    'w5',
    'سيرا برايم',
    'Syrra Prime',
    'ميتروبوليس سحرية مستقبلية تعمل بمولدات الاندماج البلوري، تحلق في أجوائها المراكب الهوائية وتمتزج فيها الأسواق الشعبية بالأبراج الشاهقة.',
    'A magical cyberpunk megapolis powered by crystal fusion, floating sky-skiffs, bustling neon souks, and relentless corporate ambition.',
    'نقابات التجارة البلورية والمحافظ راكان',
    'The Trade Syndicates',
    'neutral',
    'رياح كهروستاتيكية محملة بغبار بلوري ملون وسحب نيون اصطناعية',
    'Neon Electro-Smog / Sand Skim',
    'ازدهرت كمدينة تجارية حرة عند ملتقى ثلاثة طرق ملاحة فائقة السرعة حتى باتت العاصمة الاقتصادية والتقنية الأولى للكون.',
    'Rose as a free trade refuge at the intersection of three hyperspace lanes.',
    '/assets/generated_images/world_syrra_prime.jpg',
    'hekayaty/worlds/world_syrra_prime',
    '[{"nameAr":"السوق المركزي المعلق","nameEn":"Grand Neon Bazaar","descriptionAr":"أضخم مركز تجاري في المجرة لتبادل التقنيات الهجينة والقطع الأثرية النادرة."}]'::jsonb,
    '[{"nameAr":"تحالف الميكانيكيين الأحرار","descriptionAr":"نقابة الحرفيين والمبتكرين الذين يطورون أحدث العتاد الميكانيكي."}]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
    name_ar = EXCLUDED.name_ar,
    description_ar = EXCLUDED.description_ar;

-- 2. CHARACTERS
INSERT INTO public.characters (id, world_id, name_ar, name_en, alias_ar, alias, alignment, bio_ar, bio_en, origin_ar, origin_en, powers_ar, powers, stats, image_url, cloudinary_image_public_id, classification, created_by, first_appearance)
VALUES
(
    'c1',
    'w1',
    'زايد الذهبي',
    'Zayed Al-Dhahabi',
    'المحارب الذهبي',
    'The Golden Warrior',
    'hero',
    'فارس نبيل يرتدي درعاً شمسياً عريقاً صيغ من بلورات الصحراء النقية، يكرس حياته للدفاع عن المظلومين وصيانة شعلة النور في عوالم حكاياتي.',
    'A noble protector clad in sacred solar armor, channeling the fierce energy of ancient desert suns.',
    'بينما كان يواجه حتفه في قلب الصحراء إثر غارة لجيوش الظل، استيقظت شعلة النواة الشمسية في صدره، لتصنع منه بطلاً متوجاً بنور الشمس الأبدي.',
    'Found dying in the sands after a shadow ambush, the Solar Core chose him as its living champion.',
    '["سيوف الطاقة الشمسية", "الطيران الأسرع من الصوت", "توليد الدروع الضوئية", "انفجار الصدمة الشمسية"]'::jsonb,
    '["Solar Energy Blades", "Superhuman Flight", "Photonic Armor Projection", "Solar Burst"]'::jsonb,
    '{"strength":90,"speed":78,"durability":95,"intelligence":72,"magic":84,"combat":92}'::jsonb,
    '/assets/generated_images/zayed.jpg',
    'hekayaty/characters/zayed',
    'original',
    'فريق حكاياتي الإبداعي',
    'أصول النور #1'
),
(
    'c2',
    'w2',
    'ليلى النجم',
    'Lailat Al-Najm',
    'نساجة النجوم',
    'Starlight Weaver',
    'hero',
    'عالمة وساحرة فلكية بارعة تتحكم في حقول الجاذبية وتتنقل عبر المسارات الكوزمية لحماية التوازن بين أبعاد المجرة.',
    'A brilliant cosmic sorceress who manipulates gravitational fields and navigates quantum astral pathways.',
    'ولدت لحظة انفجار سديمي مزدوج في نوفا قديم، فوهبتها النجوم قدرة فطرية على قراءة وتطويع أوتار الطاقة النجمية.',
    'Born beneath a binary super-nova, she inherited the instinctive ability to weave stellar energy strings.',
    '["تطويع الجاذبية", "فتح بوابات العبور الكوزمية", "الإسقاط الأثيري", "نسج أشعة النجوم"]'::jsonb,
    '["Gravity Distortion", "Quantum Portals", "Astral Projection", "Stellar Energy Weaving"]'::jsonb,
    '{"strength":60,"speed":85,"durability":68,"intelligence":98,"magic":96,"combat":75}'::jsonb,
    '/assets/generated_images/lailat.jpg',
    'hekayaty/characters/lailat',
    'original',
    'فريق حكاياتي الإبداعي',
    'نسيج النجوم #1'
),
(
    'c3',
    'w4',
    'فرحان السواد',
    'Farhan Al-Sawad',
    'سيد الظلال',
    'Lord of Shadows',
    'villain',
    'قائد ظلامي مهيب يتحكم في خيوط الظل المادي، يسعى لإطفاء كل منارة نجمية وإعادة الأكوان إلى سكون العدم المطلق.',
    'A master of anti-light who commands shadow tendrils and seeks to drown all radiant stars in eternal twilight.',
    'كان في ماضيه باحثاً مرموقاً في زلامار، لكن هوسه بكشف أسرار المادة المظلمة ألقى به في جوف الفراغ ليولد من جديد كسيد للظلال.',
    'Once a renowned scholar in Zalamar, his thirst for forbidden cosmic truth caused him to be swallowed by the Void.',
    '["استحضار المادة المعتمة", "القفز عبر الظلال", "سلب الذكريات الحيوية", "تشييد أسلحة السج الأسود"]'::jsonb,
    '["Dark Matter Conjuration", "Shadow Step Teleportation", "Memory Stealing", "Obsidian Constructs"]'::jsonb,
    '{"strength":88,"speed":82,"durability":90,"intelligence":94,"magic":92,"combat":89}'::jsonb,
    '/assets/generated_images/farhan.jpg',
    'hekayaty/characters/farhan',
    'original',
    'فريق حكاياتي الإبداعي',
    'أصول النور #1'
)
ON CONFLICT (id) DO UPDATE SET
    name_ar = EXCLUDED.name_ar,
    bio_ar = EXCLUDED.bio_ar;

-- 3. SERIES
INSERT INTO public.series (id, world_id, title_ar, title_en, description_ar, cover_image_url, cloudinary_cover_public_id, classification, created_by, genres_ar, genres, status, issue_count)
VALUES
(
    's1',
    'w1',
    'أبطال الذهب',
    'Heroes of Gold',
    'الملحمة الشاملة لصعود زايد الذهبي ورفاقه لحماية إمبراطورية زلامار من زحف قوى الظلام العتيدة.',
    '/assets/generated_images/comic_1.jpg',
    'hekayaty/series/heroes_of_gold',
    'original',
    'فريق حكاياتي الإبداعي',
    '["أكشن", "خيال أسطوري", "مغامرة"]'::jsonb,
    '["Action", "Fantasy", "Mythology"]'::jsonb,
    'ongoing',
    3
),
(
    's2',
    'w2',
    'نسيج النجوم',
    'Cosmic Threads',
    'رحلة فضائية عبر بوابات نوفا قديم لاستكشاف التصدعات الزمنية وحفظ أسرار السدم المضيئة.',
    '/assets/generated_images/comic_2.jpg',
    'hekayaty/series/cosmic_threads',
    'original',
    'فريق حكاياتي الإبداعي',
    '["خيال علمي", "كوني", "غموض"]'::jsonb,
    '["Sci-Fi", "Cosmic", "Mystery"]'::jsonb,
    'ongoing',
    2
)
ON CONFLICT (id) DO UPDATE SET
    title_ar = EXCLUDED.title_ar;

-- 4. COMICS
INSERT INTO public.comics (id, series_id, world_id, title_ar, title_en, issue_number, synopsis_ar, synopsis_en, writer, artist, year, month, genres_ar, genres, cover_image_url, cloudinary_cover_public_id, character_ids, rating, page_count, classification, created_by, is_featured, is_new, is_free, price_egp)
VALUES
(
    'comic_1',
    's1',
    'w1',
    'أصول النور: شعلة الصحراء',
    'Origins of Light: Desert Flame',
    1,
    'في قلب صحراء زلامار، يكتشف المحارب الشاب زايد درعاً شمسياً عتيقاً يتزامن مع أول هجوم تشنه فيالق الظل بقيادة فرحان السواد.',
    'In the deep sands of Zalamar, young Zayed discovers an ancient solar relic just as shadow legions launch their first assault.',
    'كريم البوسعيدي',
    'سمر خالد',
    2026,
    1,
    '["أكشن", "خيال", "أصل البطل"]'::jsonb,
    '["Action", "Fantasy", "Origin"]'::jsonb,
    '/assets/generated_images/comic_1.jpg',
    'hekayaty/comics/comic_1',
    '["c1", "c3"]'::jsonb,
    4.90,
    32,
    'original',
    'فريق حكاياتي الإبداعي',
    true,
    false,
    true,
    0.00
),
(
    'comic_2',
    's2',
    'w2',
    'نسيج النجوم: بوابة الأزل',
    'Cosmic Threads: Gate of Eternity',
    1,
    'تستشعر ليلى النجم اضطراباً في تدفق طاقة السدم حول نوفا قديم، مما يقودها إلى بوابة زمنية قديمة تحوي أسرار السقوط الأول.',
    'Lailat detects an anomaly in nebula leylines around Nova Qadim, leading her to a long-sealed gateway holding forgotten truths.',
    'يوسف الأنصاري',
    'نادية العلي',
    2026,
    2,
    '["خيال علمي", "كوني", "سحر"]'::jsonb,
    '["Sci-Fi", "Cosmic", "Magic"]'::jsonb,
    '/assets/generated_images/comic_2.jpg',
    'hekayaty/comics/comic_2',
    '["c2", "c3"]'::jsonb,
    4.80,
    28,
    'original',
    'فريق حكاياتي الإبداعي',
    true,
    false,
    true,
    0.00
)
ON CONFLICT (id) DO UPDATE SET
    title_ar = EXCLUDED.title_ar;

-- 5. STORIES
INSERT INTO public.stories (id, world_id, title_ar, title_en, author, author_ar, synopsis_ar, cover_image_url, cloudinary_cover_public_id, genres_ar, genres, classification, character_ids, word_count, read_time_minutes, year, content, is_featured, is_new, is_free, price_egp)
VALUES
(
    'story_1',
    'w1',
    'قلب الرمال: اعترافات حارس النور',
    'Heart of the Sands: Confessions of the Light Guardian',
    'كريم البوسعيدي',
    'كريم البوسعيدي',
    'يوميات حميمة تكشف اللحظات التي تلت ارتداء زايد للدرع الشمسي لأول مرة، والمشاعر المتضاربة بين الواجب وحنينه لحياته البسيطة.',
    '/assets/generated_images/hero_bg.jpg',
    'hekayaty/stories/story_1',
    '["قصة قصيرة", "سرد وجداني", "دراما"]'::jsonb,
    '["Prose", "Lore", "Drama"]'::jsonb,
    'original',
    '["c1"]'::jsonb,
    3200,
    12,
    2026,
    'كانت الرمال تهمس بلغة لا يفهمها سوى من تماهت روحه مع وهج الظهيرة. عندما انغرس الدرع الذهبي في عظامي لأول مرة، لم أشعر بألم جسدي، بل بشعور مباغت بأن الأفق كله قد صار بيتي ومسؤوليتي...',
    true,
    false,
    true,
    0.00
)
ON CONFLICT (id) DO UPDATE SET
    title_ar = EXCLUDED.title_ar;

-- 6. SUBSCRIPTION PLANS
INSERT INTO public.subscription_plans (id, name_ar, name_en, price_egp_monthly, price_egp_yearly, features, is_active)
VALUES
(
    'monthly',
    'اشتراك حكاياتي بلس الشهري',
    'Hekayaty Plus Monthly',
    65.00,
    NULL,
    '["قراءة غير محدودة لجميع أعداد الكوميكس الأصلية", "الوصول المبكر للفصول قبل النشر بأسبوع", "شارة العضوية الحصرية في المجتمع والمناقشات"]'::jsonb,
    true
),
(
    'yearly',
    'عضوية حكاياتي الأسطورية (سنوية)',
    'Hekayaty Legend Annual',
    NULL,
    590.00,
    '["كل مزايا الاشتراك الشهري", "حزمة بطاقات لعبة الأبطال مجاناً عند التجديد", "دعوات حصرية للقاءات المبدعين ومؤتمرات الرسوم", "توفير 25% مقارنة بالاشتراك الشهري"]'::jsonb,
    true
)
ON CONFLICT (id) DO UPDATE SET
    name_ar = EXCLUDED.name_ar;
