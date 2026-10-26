export type LocalStatus = 'boycott' | 'not_boycotted' | 'local';

export interface LocalProduct {
  brand: string;
  status: LocalStatus;
  parentCompany: string;
  country: string;
  reason: string;
  alternatives: string[];
}

// Normalized match keys (lowercase, alphanumeric only) for fast offline lookup.
function key(s: string): string {
  return (s ?? '').toLowerCase().replace(/[^a-z0-9\u0600-\u06ff]/g, '');
}

const PRODUCTS: LocalProduct[] = [
  // --- BOYCOTT (direct support / BDS-listed) ---
  { brand: 'Coca-Cola', status: 'boycott', parentCompany: 'The Coca-Cola Company, USA', country: 'الولايات المتحدة', reason: 'شركة مدرجة في قوائم المقاطعة لدعمها المالي للكيان الصهيوني.', alternatives: ['بيبسي (محلي مرخص)', 'أبو قلندي', 'شوكولاتة بنكهة المياه الغازية المحلية', 'عصائر طبيعية محلية'] },
  { brand: 'Pepsi', status: 'boycott', parentCompany: 'PepsiCo, USA', country: 'الولايات المتحدة', reason: 'مدرجة في قوائم المقاطعة لتورطها ودعمها غير المباشر.', alternatives: ['مشروبات غازية محلية', 'عصير طبيعي', 'مياه فوارة بنكهة'] },
  { brand: 'Sprite', status: 'boycott', parentCompany: 'The Coca-Cola Company, USA', country: 'الولايات المتحدة', reason: 'تابعة لكوكاكولا المدرجة في قوائم المقاطعة.', alternatives: ['سبايت محلي', 'ليموناضة طبيعية', 'مشروب ليمون بنعناع'] },
  { brand: 'Fanta', status: 'boycott', parentCompany: 'The Coca-Cola Company, USA', country: 'الولايات المتحدة', reason: 'تابعة لكوكاكولا المدرجة في قوائم المقاطعة.', alternatives: ['مشروب برتقال محلي', 'عصير برتقال طبيعي'] },
  { brand: 'McDonald\'s', status: 'boycott', parentCompany: 'McDonald\'s Corporation, USA', country: 'الولايات المتحدة', reason: 'امتيازاتها في الكيان الصهيوني تبرعت للجيش.', alternatives: ['مطاعم محلية للوجبات السريعة', 'شاورما محلية', 'فلافل'] },
  { brand: 'Starbucks', status: 'boycott', parentCompany: 'Starbucks Corporation, USA', country: 'الولايات المتحدة', reason: 'دعم مالي للكيان الصهيوني ومواقف مؤيدة.', alternatives: ['مقاهي محلية', 'قهوة عربية من محامص محلية'] },
  { brand: 'KFC', status: 'boycott', parentCompany: 'Yum! Brands, USA', country: 'الولايات المتحدة', reason: 'امتيازاتها دعمت الجيش الصهيوني.', alternatives: ['دجاج محلي', 'مطاعم محلية للوجبات السريعة'] },
  { brand: 'Pizza Hut', status: 'boycott', parentCompany: 'Yum! Brands, USA', country: 'الولايات المتحدة', reason: 'تابعة لـ Yum! Brands المدرجة في المقاطعة.', alternatives: ['بيتزا من مطاعم محلية', 'بيتزا منزلية'] },
  { brand: 'Burger King', status: 'boycott', parentCompany: 'Restaurant Brands International, USA', country: 'الولايات المتحدة', reason: 'امتيازاتها في الكيان قدمت وجبات مجانية للجيش.', alternatives: ['برجر محلي', 'مطاعم محلية'] },
  { brand: 'Subway', status: 'boycott', parentCompany: 'Subway IP LLC, USA', country: 'الولايات المتحدة', reason: 'فرعها في الكيان يدعم الجيش.', alternatives: ['ساندويتشات محلية', 'فول وطعمية'] },
  { brand: 'Nestlé', status: 'boycott', parentCompany: 'Nestlé S.A., Switzerland', country: 'سويسرا', reason: 'شراكة مع شركة Osem الصهيونية ودعم الاقتصاد الصهيوني.', alternatives: ['منتجات ألبان محلية', 'أطعمة محلية'] },
  { brand: 'Nescafé', status: 'boycott', parentCompany: 'Nestlé S.A., Switzerland', country: 'سويسرا', reason: 'علامة تابعة لـ Nestlé المدرجة في المقاطعة.', alternatives: ['قهوة محلية محمصة', 'قهوة عربية'] },
  { brand: 'Maggi', status: 'boycott', parentCompany: 'Nestlé S.A., Switzerland', country: 'سويسرا', reason: 'علامة تابعة لـ Nestlé.', alternatives: ['شوربات محلية', 'بهارات محلية'] },
  { brand: 'L\'Oréal', status: 'boycott', parentCompany: 'L\'Oréal S.A., France', country: 'فرنسا', reason: 'تعاون مع الكيان الصهيوني في الأبحاث.', alternatives: ['منتجات عناية محلية', 'مستحضرات طبيعية'] },
  { brand: 'PepsiCo', status: 'boycott', parentCompany: 'PepsiCo, USA', country: 'الولايات المتحدة', reason: 'مدرجة في قوائم المقاطعة.', alternatives: ['منتجات محلية', 'سناكس محلية'] },
  { brand: 'Lay\'s', status: 'boycott', parentCompany: 'PepsiCo, USA', country: 'الولايات المتحدة', reason: 'تابعة لـ PepsiCo المدرجة في المقاطعة.', alternatives: ['شيبس محلي', 'مكسرات محلية'] },
  { brand: 'Doritos', status: 'boycott', parentCompany: 'PepsiCo (Frito-Lay), USA', country: 'الولايات المتحدة', reason: 'تابعة لـ PepsiCo.', alternatives: ['شيبس محلي', 'سناكس محلية'] },
  { brand: 'Cheetos', status: 'boycott', parentCompany: 'PepsiCo (Frito-Lay), USA', country: 'الولايات المتحدة', reason: 'تابعة لـ PepsiCo.', alternatives: ['سناكس محلية', 'مكسرات'] },
  { brand: 'Häagen-Dazs', status: 'boycott', parentCompany: 'Nestlé (formerly General Mills), USA', country: 'الولايات المتحدة', reason: 'ارتباط بـ Nestlé.', alternatives: ['آيس كريم محلي'] },
  { brand: 'Danone', status: 'boycott', parentCompany: 'Danone S.A., France', country: 'فرنسا', reason: 'استثمار في الكيان الصهيوني.', alternatives: ['زبادي محلي', 'ألبان محلية'] },
  { brand: 'Activia', status: 'boycott', parentCompany: 'Danone S.A., France', country: 'فرنسا', reason: 'تابعة لـ Danone.', alternatives: ['زبادي محلي'] },
  { brand: 'Puma', status: 'boycott', parentCompany: 'Puma SE, Germany', country: 'ألمانيا', reason: 'رعاية اتحاد كرة القدم الصهيوني.', alternatives: ['ملابس رياضية محلية', 'علامات عربية'] },
  { brand: 'HP', status: 'boycott', parentCompany: 'HP Inc. / Hewlett Packard Enterprise, USA', country: 'الولايات المتحدة', reason: 'أنظمة للجيش والاحتلال.', alternatives: ['أجهزة محلية', 'علامات أخرى غير متورطة'] },
  { brand: 'Intel', status: 'boycott', parentCompany: 'Intel Corporation, USA', country: 'الولايات المتحدة', reason: 'استثمار ضخم في الكيان.', alternatives: ['معالجات AMD غير متورطة', 'أجهزة بمعالجات بديلة'] },
  { brand: 'Chevron', status: 'boycott', parentCompany: 'Chevron Corporation, USA', country: 'الولايات المتحدة', reason: 'استثمار في حقول غاز الكيان.', alternatives: ['شركات طاقة محلية'] },
  { brand: 'Unilever', status: 'boycott', parentCompany: 'Unilever plc, UK', country: 'المملكة المتحدة', reason: 'استثمار وتمويل للكيان.', alternatives: ['منتجات محلية', 'علامات غير متورطة'] },
  { brand: 'AXA', status: 'boycott', parentCompany: 'AXA S.A., France', country: 'فرنسا', reason: 'استثمار في البنوك والشركات الصهيونية.', alternatives: ['تأمين محلي', 'شركات تأمين إقليمية'] },
  { brand: 'SodaStream', status: 'boycott', parentCompany: 'PepsiCo, USA', country: 'إسرائيل', reason: 'مصانعها في الكيان الصهيوني.', alternatives: ['مياه فوارة محلية'] },
  { brand: 'Ahava', status: 'boycott', parentCompany: 'Ahava Dead Sea Laboratories, Israel', country: 'إسرائيل', reason: 'منتجات من الموارد الفلسطينية المحتلة.', alternatives: ['منتجات عناية محلية', 'مستحضرات طبيعية'] },
  { brand: 'Osem', status: 'boycott', parentCompany: 'Nestlé (Osem Investments), Israel', country: 'إسرائيل', reason: 'شركة صهيونية مملوكة لـ Nestlé.', alternatives: ['أطعمة محلية'] },
  { brand: 'Strauss', status: 'boycott', parentCompany: 'Strauss Group, Israel', country: 'إسرائيل', reason: 'تبرعات للجيش الصهيوني.', alternatives: ['قهوة محلية', 'ألبان محلية'] },
  { brand: 'Pringles', status: 'boycott', parentCompany: 'Kellanova (formerly Kellogg\'s), USA', country: 'الولايات المتحدة', reason: 'ارتباط بشركاء في الكيان.', alternatives: ['شيبس محلي', 'سناكس محلية'] },
  { brand: 'Kellogg\'s', status: 'boycott', parentCompany: 'Kellanova, USA', country: 'الولايات المتحدة', reason: 'استثمار في الكيان.', alternatives: ['حبوب إفطار محلية', 'شوفان محلي'] },
  { brand: 'Carrefour', status: 'boycott', parentCompany: 'Carrefour S.A., France', country: 'فرنسا', reason: 'شراكة مع شركة Yenot Bitran الصهيونية.', alternatives: ['أسواق محلية', 'هايبر ماركت محلي'] },
  { brand: 'Disney', status: 'boycott', parentCompany: 'The Walt Disney Company, USA', country: 'الولايات المتحدة', reason: 'تبرعات للكيان الصهيوني.', alternatives: ['محتوى عربي', 'منتجات ترفيه محلية'] },
  { brand: 'Amazon', status: 'boycott', parentCompany: 'Amazon.com Inc., USA', country: 'الولايات المتحدة', reason: 'تعاون مع الكيان عبر أنظمة سحابية.', alternatives: ['متاجر محلية إلكترونية', 'أسواق محلية'] },
  { brand: 'AWS', status: 'boycott', parentCompany: 'Amazon.com Inc., USA', country: 'الولايات المتحدة', reason: 'خدمات سحابية للجيش الصهيوني.', alternatives: ['مزودات سحابية إقليمية'] },
  { brand: 'Google', status: 'boycott', parentCompany: 'Alphabet Inc., USA', country: 'الولايات المتحدة', reason: 'تعاون مع الجيش الصهيوني في الذكاء الاصطناعي.', alternatives: ['محركات بحث بديلة', 'خدمات محلية'] },
  { brand: 'Microsoft', status: 'boycott', parentCompany: 'Microsoft Corporation, USA', country: 'الولايات المتحدة', reason: 'تعاون مع الجيش الصهيوني.', alternatives: ['أنظمة مفتوحة المصدر', 'حلول محلية'] },
  { brand: 'Meta', status: 'boycott', parentCompany: 'Meta Platforms Inc., USA', country: 'الولايات المتحدة', reason: 'سياسات مؤيدة للكيان.', alternatives: ['منصات تواصل بديلة'] },
  { brand: 'Bumble', status: 'boycott', parentCompany: 'Bumble Inc., USA', country: 'الولايات المتحدة', reason: 'استثمار صهيوني.', alternatives: ['منصات محلية'] },
  { brand: 'Wix', status: 'boycott', parentCompany: 'Wix.com Ltd., Israel', country: 'إسرائيل', reason: 'شركة صهيونية.', alternatives: ['منصات بناء مواقع بديلة'] },
  { brand: 'Monday.com', status: 'boycott', parentCompany: 'monday.com Ltd., Israel', country: 'إسرائيل', reason: 'شركة صهيونية.', alternatives: ['أدوات إدارة مشاريع بديلة'] },
  { brand: 'Booking.com', status: 'boycott', parentCompany: 'Booking Holdings Inc., USA', country: 'الولايات المتحدة', reason: 'قائمة فلسطين المحتلة كـ "إسرائيل".', alternatives: ['منصات حجز إقليمية', 'حجز مباشر من الفنادق'] },
  { brand: 'Airbnb', status: 'boycott', parentCompany: 'Airbnb Inc., USA', country: 'الولايات المتحدة', reason: 'إدراج المستوطنات.', alternatives: ['منصات حجز بديلة', 'فنادق محلية'] },
  { brand: 'Tezenis', status: 'boycott', parentCompany: 'Calzedonia Group, Italy', country: 'إيطاليا', reason: 'متاجر في المستوطنات.', alternatives: ['ملابس داخلية محلية'] },
  { brand: 'Calzedonia', status: 'boycott', parentCompany: 'Calzedonia Group, Italy', country: 'إيطاليا', reason: 'متاجر في المستوطنات.', alternatives: ['ملابس محلية'] },
  { brand: 'Intimissimi', status: 'boycott', parentCompany: 'Calzedonia Group, Italy', country: 'إيطاليا', reason: 'متاجر في المستوطنات.', alternatives: ['ملابس داخلية محلية'] },
  { brand: 'Sabra', status: 'boycott', parentCompany: 'PepsiCo + Strauss Group, Israel/USA', country: 'إسرائيل', reason: 'شراكة مع Strauss الصهيونية.', alternatives: ['حمص محلي', 'متبلات محلية'] },
  { brand: 'Tribe', status: 'boycott', parentCompany: 'Tribe Mediterranean Foods, USA', country: 'الولايات المتحدة', reason: 'ارتباط بالكيان.', alternatives: ['حمص محلي'] },
  { brand: 'Bimax', status: 'boycott', parentCompany: 'Elbit Systems, Israel', country: 'إسرائيل', reason: 'أنظمة مراقبة للاحتلال.', alternatives: ['حلول محلية'] },
  { brand: 'Elbit', status: 'boycott', parentCompany: 'Elbit Systems Ltd., Israel', country: 'إسرائيل', reason: 'صناعة أسلحة للكيان.', alternatives: ['منتجات محلية'] },
  { brand: 'SK-II', status: 'boycott', parentCompany: 'Procter & Gamble, USA', country: 'الولايات المتحدة', reason: 'ارتباط بالكيان.', alternatives: ['منتجات عناية محلية'] },
  { brand: 'Pampers', status: 'boycott', parentCompany: 'Procter & Gamble, USA', country: 'الولايات المتحدة', reason: 'ارتباط بالكيان عبر مصانع.', alternatives: ['حفاضات محلية', 'علامات إقليمية'] },
  { brand: 'Gillette', status: 'boycott', parentCompany: 'Procter & Gamble, USA', country: 'الولايات المتحدة', reason: 'تابعة لـ P&G.', alternatives: ['شفرات محلية', 'علامات إقليمية'] },
  { brand: 'Head & Shoulders', status: 'boycott', parentCompany: 'Procter & Gamble, USA', country: 'الولايات المتحدة', reason: 'تابعة لـ P&G.', alternatives: ['شامبو محلي', 'منتجات طبيعية'] },
  { brand: 'Pantene', status: 'boycott', parentCompany: 'Procter & Gamble, USA', country: 'الولايات المتحدة', reason: 'تابعة لـ P&G.', alternatives: ['شامبو محلي'] },
  { brand: 'Tide', status: 'boycott', parentCompany: 'Procter & Gamble, USA', country: 'الولايات المتحدة', reason: 'تابعة لـ P&G.', alternatives: ['مسحوق غسيل محلي'] },
  { brand: 'Ariel', status: 'boycott', parentCompany: 'Procter & Gamble, USA', country: 'الولايات المتحدة', reason: 'تابعة لـ P&G.', alternatives: ['مسحوق غسيل محلي'] },
  { brand: 'Always', status: 'boycott', parentCompany: 'Procter & Gamble, USA', country: 'الولايات المتحدة', reason: 'تابعة لـ P&G.', alternatives: ['فوط محلية'] },

  // --- NOT BOYCOTTED (foreign, no direct involvement) ---
  { brand: 'McVitie\'s', status: 'not_boycotted', parentCompany: 'pladis (Yıldız Holding), Turkey', country: 'تركيا', reason: 'مملوكة لشركة تركية غير متورطة في دعم الكيان.', alternatives: [] },
  { brand: 'Ulker', status: 'not_boycotted', parentCompany: 'Yıldız Holding, Turkey', country: 'تركيا', reason: 'شركة تركية غير متورطة.', alternatives: [] },
  { brand: 'Toblerone', status: 'not_boycotted', parentCompany: 'Mondelez International, USA', country: 'سويسرا', reason: 'غير مدرجة في قوائم المقاطعة الرسمية.', alternatives: [] },
  { brand: 'Kinder', status: 'not_boycotted', parentCompany: 'Ferrero SpA, Italy', country: 'إيطاليا', reason: 'غير متورطة في دعم الكيان.', alternatives: [] },
  { brand: 'Ferrero', status: 'not_boycotted', parentCompany: 'Ferrero SpA, Italy', country: 'إيطاليا', reason: 'غير متورطة في دعم الكيان.', alternatives: [] },
  { brand: 'Nutella', status: 'not_boycotted', parentCompany: 'Ferrero SpA, Italy', country: 'إيطاليا', reason: 'غير متورطة في دعم الكيان.', alternatives: [] },
  { brand: 'Lindt', status: 'not_boycotted', parentCompany: 'Lindt & Sprüngli AG, Switzerland', country: 'سويسرا', reason: 'غير متورطة في دعم الكيان.', alternatives: [] },
  { brand: 'Samsung', status: 'not_boycotted', parentCompany: 'Samsung Electronics, South Korea', country: 'كوريا الجنوبية', reason: 'غير مدرجة في قوائم المقاطعة الرسمية.', alternatives: [] },
  { brand: 'LG', status: 'not_boycotted', parentCompany: 'LG Electronics, South Korea', country: 'كوريا الجنوبية', reason: 'غير متورطة في دعم الكيان.', alternatives: [] },
  { brand: 'Sony', status: 'not_boycotted', parentCompany: 'Sony Group, Japan', country: 'اليابان', reason: 'غير متورطة في دعم الكيان.', alternatives: [] },
  { brand: 'Toyota', status: 'not_boycotted', parentCompany: 'Toyota Motor Corporation, Japan', country: 'اليابان', reason: 'غير متورطة في دعم الكيان.', alternatives: [] },
  { brand: 'Honda', status: 'not_boycotted', parentCompany: 'Honda Motor Co., Japan', country: 'اليابان', reason: 'غير متورطة في دعم الكيان.', alternatives: [] },
  { brand: 'Hyundai', status: 'not_boycotted', parentCompany: 'Hyundai Motor Group, South Korea', country: 'كوريا الجنوبية', reason: 'غير متورطة في دعم الكيان.', alternatives: [] },
  { brand: 'Adidas', status: 'not_boycotted', parentCompany: 'Adidas AG, Germany', country: 'ألمانيا', reason: 'غير مدرجة رسمياً في قوائم المقاطعة.', alternatives: [] },
  { brand: 'Nike', status: 'not_boycotted', parentCompany: 'Nike Inc., USA', country: 'الولايات المتحدة', reason: 'غير مدرجة رسمياً في قوائم المقاطعة المعتمدة.', alternatives: [] },
  { brand: 'Zara', status: 'not_boycotted', parentCompany: 'Inditex, Spain', country: 'إسبانيا', reason: 'غير مدرجة رسمياً في قوائم المقاطعة.', alternatives: [] },
  { brand: 'H&M', status: 'not_boycotted', parentCompany: 'H&M Hennes & Mauritz AB, Sweden', country: 'السويد', reason: 'غير مدرجة رسمياً في قوائم المقاطعة.', alternatives: [] },
  { brand: 'Mango', status: 'not_boycotted', parentCompany: 'Mango Fashion, Spain', country: 'إسبانيا', reason: 'غير مدرجة رسمياً.', alternatives: [] },
  { brand: 'IKEA', status: 'not_boycotted', parentCompany: 'Inter IKEA Group, Sweden', country: 'السويد', reason: 'غير متورطة في دعم الكيان.', alternatives: [] },
  { brand: 'Nivea', status: 'not_boycotted', parentCompany: 'Beiersdorf AG, Germany', country: 'ألمانيا', reason: 'غير متورطة في دعم الكيان.', alternatives: [] },
  { brand: 'Vichy', status: 'not_boycotted', parentCompany: 'L\'Oréal S.A., France', country: 'فرنسا', reason: 'تابعة لـ L\'Oréal المدرجة، حسب التحديث قد تُقاطع.', alternatives: [] },

  // --- LOCAL / ARABIC ---
  { brand: 'Almarai', status: 'local', parentCompany: 'المراعي، السعودية', country: 'السعودية', reason: 'شركة سعودية رائدة في الألبان.', alternatives: [] },
  { brand: 'المراعي', status: 'local', parentCompany: 'المراعي، السعودية', country: 'السعودية', reason: 'شركة سعودية رائدة في الألبان.', alternatives: [] },
  { brand: 'Nadec', status: 'local', parentCompany: 'النادك، السعودية', country: 'السعودية', reason: 'شركة سعودية للألبان والغذاء.', alternatives: [] },
  { brand: 'النادك', status: 'local', parentCompany: 'النادك، السعودية', country: 'السعودية', reason: 'شركة سعودية للألبان والغذاء.', alternatives: [] },
  { brand: 'SADAFCO', status: 'local', parentCompany: 'السعودية للأغذية، السعودية', country: 'السعودية', reason: 'شركة سعودية للأغذية.', alternatives: [] },
  { brand: 'صدق', status: 'local', parentCompany: 'السعودية للأغذية، السعودية', country: 'السعودية', reason: 'شركة سعودية.', alternatives: [] },
  { brand: 'Al Kabeer', status: 'local', parentCompany: 'الكبير، السعودية', country: 'السعودية', reason: 'شركة سعودية للأغذية المجمدة.', alternatives: [] },
  { brand: 'الكبير', status: 'local', parentCompany: 'الكبير، السعودية', country: 'السعودية', reason: 'شركة سعودية للأغذية المجمدة.', alternatives: [] },
  { brand: 'Americana', status: 'local', parentCompany: 'أمريكانا، مصر/الإمارات', country: 'مصر', reason: 'شركة إقليمية للأغذية المجمدة.', alternatives: [] },
  { brand: 'أمريكانا', status: 'local', parentCompany: 'أمريكانا، مصر/الإمارات', country: 'مصر', reason: 'شركة إقليمية للأغذية المجمدة.', alternatives: [] },
  { brand: 'Tahina', status: 'local', parentCompany: 'محلية، مصر/بلاد الشام', country: 'مصر', reason: 'منتج عربي تقليدي.', alternatives: [] },
  { brand: 'طحينة', status: 'local', parentCompany: 'محلية، مصر/بلاد الشام', country: 'مصر', reason: 'منتج عربي تقليدي.', alternatives: [] },
  { brand: 'Bimbo', status: 'local', parentCompany: 'مرخص محلياً، مصر/الإمارات', country: 'الإمارات', reason: 'إنتاج محلي بترخيص.', alternatives: [] },
  { brand: 'Edita', status: 'local', parentCompany: 'إيديتا، مصر', country: 'مصر', reason: 'شركة مصرية للأغذية (مولتو، تي في، رولو).', alternatives: [] },
  { brand: 'إيديتا', status: 'local', parentCompany: 'إيديتا، مصر', country: 'مصر', reason: 'شركة مصرية للأغذية.', alternatives: [] },
  { brand: 'Molto', status: 'local', parentCompany: 'إيديتا، مصر', country: 'مصر', reason: 'منتج مصري من إيديتا.', alternatives: [] },
  { brand: 'مولتو', status: 'local', parentCompany: 'إيديتا، مصر', country: 'مصر', reason: 'منتج مصري من إيديتا.', alternatives: [] },
  { brand: 'Rollo', status: 'local', parentCompany: 'إيديتا، مصر', country: 'مصر', reason: 'منتج مصري.', alternatives: [] },
  { brand: 'Tee Vee', status: 'local', parentCompany: 'إيديتا، مصر', country: 'مصر', reason: 'منتج مصري.', alternatives: [] },
  { brand: 'Chipsy', status: 'local', parentCompany: 'بيبسيكو (مرخص محلياً) - مراجعة الحالة', country: 'مصر', reason: 'مُنتَج محلياً بترخيص، الحالة قد تتطلب مراجعة.', alternatives: ['شيبس محلي مستقل'] },
  { brand: 'Cairo Poultry', status: 'local', parentCompany: 'دواجن القاهرة، مصر', country: 'مصر', reason: 'شركة مصرية.', alternatives: [] },
  { brand: 'Cairo Oil', status: 'local', parentCompany: 'زيوت القاهرة، مصر', country: 'مصر', reason: 'شركة مصرية.', alternatives: [] },
  { brand: 'Crème Bonjour', status: 'local', parentCompany: 'بيشوب (إيديتا) مرخص، مصر', country: 'مصر', reason: 'إنتاج محلي بترخيص.', alternatives: ['جبن محلي مستقل'] },
  { brand: 'Domty', status: 'local', parentCompany: 'دومتي، مصر', country: 'مصر', reason: 'شركة مصرية للأجبان.', alternatives: [] },
  { brand: 'دومتي', status: 'local', parentCompany: 'دومتي، مصر', country: 'مصر', reason: 'شركة مصرية للأجبان.', alternatives: [] },
  { brand: 'Juhayna', status: 'local', parentCompany: 'جهينة، مصر', country: 'مصر', reason: 'شركة مصرية للألبان والعصائر.', alternatives: [] },
  { brand: 'جهينة', status: 'local', parentCompany: 'جهينة، مصر', country: 'مصر', reason: 'شركة مصرية للألبان والعصائر.', alternatives: [] },
  { brand: 'Faragallah', status: 'local', parentCompany: 'فرج الله، مصر', country: 'مصر', reason: 'شركة مصرية للأغذية.', alternatives: [] },
  { brand: 'فرج الله', status: 'local', parentCompany: 'فرج الله، مصر', country: 'مصر', reason: 'شركة مصرية للأغذية.', alternatives: [] },
  { brand: 'Kaha', status: 'local', parentCompany: 'كها، مصر', country: 'مصر', reason: 'شركة مصرية للمعلبات والعصائر.', alternatives: [] },
  { brand: 'كها', status: 'local', parentCompany: 'كها، مصر', country: 'مصر', reason: 'شركة مصرية للمعلبات والعصائر.', alternatives: [] },
  { brand: 'Heinz (local license)', status: 'local', parentCompany: 'Tama Group (مرخص)، مصر', country: 'مصر', reason: 'إنتاج محلي بترخيص.', alternatives: ['كاتشب محلي مستقل'] },
  { brand: 'Checkers', status: 'local', parentCompany: 'تشيوكرز، مصر', country: 'مصر', reason: 'شركة مصرية للأغذية.', alternatives: [] },
  { brand: 'Yaght', status: 'local', parentCompany: 'محلية، مصر', country: 'مصر', reason: 'منتج محلي.', alternatives: [] },
];

const PRODUCTS_BY_KEY: Record<string, LocalProduct> = (() => {
  const map: Record<string, LocalProduct> = {};
  for (const p of PRODUCTS) {
    map[key(p.brand)] = p;
  }
  return map;
})();

export function findLocalProduct(brandName: string): LocalProduct | null {
  if (!brandName) return null;
  const k = key(brandName);
  if (!k) return null;
  if (PRODUCTS_BY_KEY[k]) return PRODUCTS_BY_KEY[k];
  for (const [mapKey, p] of Object.entries(PRODUCTS_BY_KEY)) {
    if (mapKey.includes(k) || k.includes(mapKey)) return p;
  }
  return null;
}
