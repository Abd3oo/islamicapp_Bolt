export const COUNTRIES = [
  'مصر',
  'السعودية',
  'الإمارات',
  'الأردن',
  'المغرب',
  'الجزائر',
  'تونس',
  'العراق',
  'سوريا',
  'لبنان',
  'فلسطين',
  'السودان',
  'ليبيا',
  'اليمن',
  'عمان',
  'قطر',
  'الكويت',
  'البحرين',
  'موريتانيا',
  'الصومال',
] as const;

export type Country = (typeof COUNTRIES)[number];

export type ProductCategory =
  | 'beverages'
  | 'fast_food'
  | 'coffee'
  | 'snacks'
  | 'dairy'
  | 'chocolate'
  | 'personal_care'
  | 'household'
  | 'apparel'
  | 'tech'
  | 'insurance'
  | 'retail'
  | 'general';

export interface CountryAlternative {
  category: ProductCategory;
  brands: string[];
}

const CATEGORY_LABELS: Record<ProductCategory, string> = {
  beverages: 'المشروبات الغازية والعصائر',
  fast_food: 'الوجبات السريعة والمطاعم',
  coffee: 'القهوة والمرطبات الساخنة',
  snacks: 'الشيبس والسناكس',
  dairy: 'الألبان والأجبان والزبادي',
  chocolate: 'الشوكولاتة والحلويات',
  personal_care: 'العناية الشخصية والشامبو',
  household: 'منظفات المنزل والغسيل',
  apparel: 'الملابس والأحذية',
  tech: 'التكنولوجيا والأجهزة',
  insurance: 'التأمين',
  retail: 'الأسواق والمتاجر الكبرى',
  general: 'بدائل عامة',
};

export function categoryLabel(cat: ProductCategory): string {
  return CATEGORY_LABELS[cat] ?? cat;
}

const KEYWORDS: { category: ProductCategory; words: string[] }[] = [
  { category: 'beverages', words: ['كوكا', 'كولا', 'بيبسي', 'سبايت', 'فانتا', 'مشروب', 'عصير', 'مياه', 'غازية', 'صودا', 'soda', 'cola', 'pepsi', 'coca', 'sprite', 'fanta', 'juice', 'drink', 'سفن', '7up', 'دويتو', 'اكوافينا'] },
  { category: 'snacks', words: ['شيبس', 'شيبسي', 'chips', 'lays', 'ليز', 'دوريتو', 'doritos', 'cheetos', 'تشيتوس', 'سناك', 'snack', 'مكسرات', 'بريقلز', 'pringles', 'بوشار', 'popcorn'] },
  { category: 'fast_food', words: ['مكدونالد', 'ماكدونالد', 'mcdonald', 'kfc', 'كنتاكي', 'بيتزا', 'pizza', 'برجر', 'burger', 'king', 'سابوي', 'subway', 'starbucks', 'ستاربكس', 'مطعم', 'كافيه', 'قهوة', 'شاورما', 'فلافل'] },
  { category: 'coffee', words: ['نسكافيه', 'nescafe', 'ماغي', 'maggi', 'قهوة', 'coffee', 'cafe', 'ستاربكس', 'starbucks'] },
  { category: 'dairy', words: ['لبن', 'حليب', 'زبادي', 'ياغورت', 'جبن', 'جبنة', 'ألبان', 'danone', 'دانون', 'اكتيفيا', 'nestle', 'نستله', 'مراعي', 'لبنة', 'كريمه', 'كريمة', 'dairy', 'yogurt', 'milk', 'cheese'] },
  { category: 'chocolate', words: ['شوكولاتة', 'شوكولا', 'chocolate', 'كندر', 'kinder', 'فيريرو', 'ferrero', 'نوتيلا', 'nutella', 'توبلرون', 'toblerone', 'لينت', 'lindt', 'حلوى', 'حلاوة'] },
  { category: 'personal_care', words: ['شامبو', 'shampoo', 'صابون', 'soap', 'كريم', 'cream', 'لوريال', 'loreal', 'نيفيا', 'nivea', 'جيليت', 'gillette', 'بابمرز', 'pampers', 'فوط', 'بانتين', 'pantene', 'هيد اند', 'head', 'sk-ii', 'احمر شفاه', 'مكياج'] },
  { category: 'household', words: ['مسحوق', 'غسيل', 'detergent', 'tide', 'تايد', 'اريال', 'ariel', 'منظف', 'كلين', 'clean', 'كلور', 'ديتول', 'dettol'] },
  { category: 'apparel', words: ['ملابس', 'قميص', 'بنطلون', 'احذية', 'نعل', 'puma', 'بوما', 'نايك', 'nike', 'اديداس', 'adidas', 'زارا', 'zara', 'هاند', 'hm', 'مانجو', 'mango', 'تيشيرت'] },
  { category: 'tech', words: ['لابتوب', 'كمبيوتر', 'حاسوب', 'hp', 'intel', 'انتل', 'microsoft', 'مايكروسوفت', 'google', 'جوجل', 'meta', 'ميتا', 'aws', 'amazon', 'ويكس', 'wix', 'samsung', 'سامسونج', 'lg', 'sony', 'سوني'] },
  { category: 'insurance', words: ['تأمين', 'insurance', 'axa', 'اكسا', 'بوليصة'] },
  { category: 'retail', words: ['كارفور', 'carrefour', 'امازون', 'amazon', 'ايكيا', 'ikea', 'سوق', 'هايبر', 'supermarket', 'بووكينج', 'booking', 'ايربي', 'airbnb'] },
];

export function detectCategory(brand: string): ProductCategory {
  const k = (brand ?? '').toLowerCase();
  for (const { category, words } of KEYWORDS) {
    if (words.some((w) => k.includes(w.toLowerCase()))) return category;
  }
  return 'general';
}

export const ALTERNATIVES_BY_COUNTRY: Record<Country, CountryAlternative[]> = {
  'مصر': [
    { category: 'beverages', brands: ['جهينة', 'مياه نعناع', 'مشروب زهور', 'مياه باراكا', 'عصير كها', 'عصير لوز'] },
    { category: 'snacks', brands: ['شيبسي', 'مولتو سناك', 'رولو', 'تي في', 'كريسبي', 'مكسرات سيتي'] },
    { category: 'fast_food', brands: ['البيك مصر', 'كوك دور', 'مطاعم كشري', 'فلافل حمدى', 'شاورما رجل'] },
    { category: 'coffee', brands: ['قهوة التحرير', 'قهوة الحجاز', 'بن الشاذلي', 'مقهى ريش'] },
    { category: 'dairy', brands: ['جهينة', 'دومتي', 'بيشوب', 'لايف', 'كها', 'جبنة بيضاء محلية'] },
    { category: 'chocolate', brands: ['شوكولاتة كريستال', 'تيموثي', 'ميراندا', 'شوكولاتة عماد'] },
    { category: 'personal_care', brands: ['صابون غار محلي', 'كير مصر', 'فيكتوريا', 'شامبو نعومة'] },
    { category: 'household', brands: ['مسحوق برسيل مصر', 'كلينكس', 'فيروز', 'أول'] },
    { category: 'apparel', brands: ['مصانع المعصرة', 'مصر للملابس', 'جلابية محلية'] },
    { category: 'tech', brands: ['سينا للإلكترونيات', 'بنها للإلكترونيات', 'ايرام'] },
    { category: 'insurance', brands: ['شركة مصر للتأمين', 'جي آي سي مصر', 'مصر لتأمين الحياة'] },
    { category: 'retail', brands: ['هايبر وان', 'سبينيس', 'فيفا', 'متجر أولاد رجب'] },
    { category: 'general', brands: ['منتجات مصرية بديلة'] },
  ],
  'السعودية': [
    { category: 'beverages', brands: ['المراعي', 'نادك', 'مرسية', 'عصائر المراعي', 'مياه المراعي', 'لبنة المراعي'] },
    { category: 'snacks', brands: ['شيبس المراعي', 'لولو', 'سناكس المراعي', 'تعمير سناك'] },
    { category: 'fast_food', brands: ['البيك', 'الطازج', 'هرفي', 'كنتاكي السعودية (مرخص)'] },
    { category: 'coffee', brands: ['بن ممتاز', 'تمرة', 'قهوة الدرب', 'قهوة الجبل', 'بن فالتع'] },
    { category: 'dairy', brands: ['المراعي', 'نادك', 'صدق', 'لبنة المراعي'] },
    { category: 'chocolate', brands: ['شوكولاتة التعمير', 'شوكولاتة بوني', 'حلاوة سعودية'] },
    { category: 'personal_care', brands: ['صابون غار', 'محمد العبدالله', 'منتجات طبيعية'] },
    { category: 'household', brands: ['منظفات سعودية', 'مسحوق محلي'] },
    { category: 'apparel', brands: ['النعيمي', 'محلّي سعودي', 'الدريوش'] },
    { category: 'tech', brands: ['حلول سعودية', 'تطبيقات محلية'] },
    { category: 'insurance', brands: ['تكافل سعودي', 'تأمين تعاوني', 'الراجحي تكافل'] },
    { category: 'retail', brands: ['العثيم', 'بانوراما', 'تموين', 'دانوب'] },
    { category: 'general', brands: ['منتجات سعودية بديلة'] },
  ],
  'الإمارات': [
    { category: 'beverages', brands: ['المراعي الإمارات', 'عصير الفلاح', 'مياه نفية', 'مشروبات المراعي'] },
    { category: 'snacks', brands: ['سناكس إماراتية', 'مكسرات محلّية', 'تمر سناك'] },
    { category: 'fast_food', brands: ['مطاعم إقليمية', 'شاورما محلية', 'كباب محلي'] },
    { category: 'coffee', brands: ['محامص إماراتية', 'قهوة بدوية', 'بن الإمارات'] },
    { category: 'dairy', brands: ['المراعي الإمارات', 'ألبان العين', 'لبنة محلّية'] },
    { category: 'chocolate', brands: ['شوكولاتة محلّية', 'تمر بالشوكولاتة'] },
    { category: 'personal_care', brands: ['منتجات طبيعية', 'صابون محلي'] },
    { category: 'household', brands: ['منظفات محلية'] },
    { category: 'apparel', brands: ['علامات إماراتية', 'محلّي'] },
    { category: 'tech', brands: ['حلول إماراتية'] },
    { category: 'insurance', brands: ['تكافل إماراتي', 'أمان تكافل'] },
    { category: 'retail', brands: ['لولو هايبر ماركت', 'يونيكو', 'كارفور الإمارات (مرخص)'] },
    { category: 'general', brands: ['منتجات إماراتية بديلة'] },
  ],
  'الأردن': [
    { category: 'beverages', brands: ['المراعي الأردن', 'عصير ميرنا', 'مياه تنور', 'لبنة الأردن'] },
    { category: 'snacks', brands: ['سناكس أردنية', 'مكسرات محلّية'] },
    { category: 'fast_food', brands: ['مطاعم محلية', 'شاورما أردنية', 'فلافل الأردن'] },
    { category: 'coffee', brands: ['قهوة أردنية', 'محامص عمّان', 'بن الجبل'] },
    { category: 'dairy', brands: ['المراعي الأردن', 'ألبان محلية', 'لبنة البيضاء'] },
    { category: 'chocolate', brands: ['شوكولاتة محلّية'] },
    { category: 'personal_care', brands: ['منتجات طبيعية', 'صابون نابلسي'] },
    { category: 'household', brands: ['منظفات محلية'] },
    { category: 'apparel', brands: ['علامات أردنية'] },
    { category: 'tech', brands: ['حلول محلية'] },
    { category: 'insurance', brands: ['تكافل أردني', 'أمان للتأمين'] },
    { category: 'retail', brands: ['أسواق محلية', 'مول الأردن'] },
    { category: 'general', brands: ['منتجات أردنية بديلة'] },
  ],
  'المغرب': [
    { category: 'beverages', brands: ['مياه أولماس', 'عصير محلي', 'مشروب أتانة', 'مياه سيدي علي'] },
    { category: 'snacks', brands: ['سناكس مغربية', 'مكسرات محلّية'] },
    { category: 'fast_food', brands: ['مطاعم مغربية', 'طاجين محلي'] },
    { category: 'coffee', brands: ['قهوة مغربية', 'بن الجبل'] },
    { category: 'dairy', brands: ['السنابل', 'كوباك', 'ألبان مغربية'] },
    { category: 'chocolate', brands: ['شوكولاتة مغربية'] },
    { category: 'personal_care', brands: ['منتجات طبيعية', 'صابون الغار'] },
    { category: 'household', brands: ['منظفات محلية'] },
    { category: 'apparel', brands: ['علامات مغربية'] },
    { category: 'tech', brands: ['حلول محلية'] },
    { category: 'insurance', brands: ['تكافل مغربي', 'WAA AutoMapper'] },
    { category: 'retail', brands: ['مرجان', 'أسواق عتيقة'] },
    { category: 'general', brands: ['منتجات مغربية بديلة'] },
  ],
  'الجزائر': [
    { category: 'beverages', brands: ['مياه بنى عزيز', 'عصير جزائري', 'حمضيات محلّية', 'مياه الحرشة'] },
    { category: 'snacks', brands: ['سناكس جزائرية', 'مكسرات محلّية'] },
    { category: 'fast_food', brands: ['مطاعم جزائرية', 'طاجين محلي'] },
    { category: 'coffee', brands: ['قهوة جزائرية', 'بن الأطلس'] },
    { category: 'dairy', brands: ['ألبان جزائرية', 'دانهون', 'لبن محلّي'] },
    { category: 'chocolate', brands: ['شوكولاتة جزائرية', 'حلاوة تركية'] },
    { category: 'personal_care', brands: ['منتجات طبيعية'] },
    { category: 'household', brands: ['منظفات محلية'] },
    { category: 'apparel', brands: ['علامات جزائرية'] },
    { category: 'tech', brands: ['حلول محلية'] },
    { category: 'insurance', brands: ['تكافل جزائري', 'SAA الجزائر'] },
    { category: 'retail', brands: ['أسواق محلية', 'أرديس'] },
    { category: 'general', brands: ['منتجات جزائرية بديلة'] },
  ],
  'تونس': [
    { category: 'beverages', brands: ['مياه تونسية', 'عصير محلي', 'مياه صفاقس'] },
    { category: 'snacks', brands: ['سناكس تونسية', 'مكسرات محلّية'] },
    { category: 'fast_food', brands: ['مطاعم تونسية', 'كسكسي محلي'] },
    { category: 'coffee', brands: ['قهوة تونسية', 'بن المنار'] },
    { category: 'dairy', brands: ['ألبان تونسية', 'دالة', 'لبن محلّي'] },
    { category: 'chocolate', brands: ['شوكولاتة تونسية'] },
    { category: 'personal_care', brands: ['منتجات طبيعية', 'صابون تونسي'] },
    { category: 'household', brands: ['منظفات محلية'] },
    { category: 'apparel', brands: ['علامات تونسية'] },
    { category: 'tech', brands: ['حلول محلية'] },
    { category: 'insurance', brands: ['تكافل تونسي', 'STAR التأمين'] },
    { category: 'retail', brands: ['مونوبري تونس', 'أسواق محلية'] },
    { category: 'general', brands: ['منتجات تونسية بديلة'] },
  ],
  'العراق': [
    { category: 'beverages', brands: ['عصير محلي', 'مياه عراقية', 'مياه الفرات'] },
    { category: 'snacks', brands: ['سناكس عراقية', 'مكسرات محلّية'] },
    { category: 'fast_food', brands: ['مطاعم عراقية', 'كباب محلي'] },
    { category: 'coffee', brands: ['قهوة عراقية', 'بن الموصل'] },
    { category: 'dairy', brands: ['ألبان عراقية', 'لبن محلّي'] },
    { category: 'chocolate', brands: ['شوكولاتة محلّية'] },
    { category: 'personal_care', brands: ['منتجات طبيعية'] },
    { category: 'household', brands: ['منظفات محلية'] },
    { category: 'apparel', brands: ['علامات عراقية'] },
    { category: 'tech', brands: ['حلول محلية'] },
    { category: 'insurance', brands: ['تكافل عراقي'] },
    { category: 'retail', brands: ['أسواق محلية'] },
    { category: 'general', brands: ['منتجات عراقية بديلة'] },
  ],
  'سوريا': [
    { category: 'beverages', brands: ['عصير محلي', 'مياه سورية', 'مياه الفيجة'] },
    { category: 'snacks', brands: ['سناكس سورية', 'مكسرات محلّية'] },
    { category: 'fast_food', brands: ['مطاعم سورية', 'شاورما سورية'] },
    { category: 'coffee', brands: ['قهوة سورية', 'بن حلب'] },
    { category: 'dairy', brands: ['ألبان سورية', 'لبنة محلية'] },
    { category: 'chocolate', brands: ['شوكولاتة محلّية', 'حلاوة سورية'] },
    { category: 'personal_care', brands: ['صابون حلب', 'منتجات طبيعية'] },
    { category: 'household', brands: ['منظفات محلية'] },
    { category: 'apparel', brands: ['علامات سورية'] },
    { category: 'tech', brands: ['حلول محلية'] },
    { category: 'insurance', brands: ['تكافل سوري'] },
    { category: 'retail', brands: ['أسواق محلية'] },
    { category: 'general', brands: ['منتجات سورية بديلة'] },
  ],
  'لبنان': [
    { category: 'beverages', brands: ['عصير محلي', 'مياه لبنانية', 'مياه ضهر الصفرا'] },
    { category: 'snacks', brands: ['سناكس لبنانية', 'مكسرات محلّية'] },
    { category: 'fast_food', brands: ['مطاعم لبنانية', 'شاورما لبنانية'] },
    { category: 'coffee', brands: ['قهوة لبنانية', 'بن بيروت'] },
    { category: 'dairy', brands: ['ألبان لبنانية', 'لبنة', 'جبنة عكاوي'] },
    { category: 'chocolate', brands: ['شوكولاتة محلّية', 'حلاوة لبنانية'] },
    { category: 'personal_care', brands: ['منتجات طبيعية', 'صابون محلي'] },
    { category: 'household', brands: ['منظفات محلية'] },
    { category: 'apparel', brands: ['علامات لبنانية'] },
    { category: 'tech', brands: ['حلول محلية'] },
    { category: 'insurance', brands: ['تكافل لبناني'] },
    { category: 'retail', brands: ['أسواق محلية'] },
    { category: 'general', brands: ['منتجات لبنانية بديلة'] },
  ],
  'فلسطين': [
    { category: 'beverages', brands: ['مياه جنين', 'عصير أرض', 'زيتون فلسطيني', 'مياه تامون'] },
    { category: 'snacks', brands: ['سناكس فلسطينية', 'مكسرات محلّية'] },
    { category: 'fast_food', brands: ['مطاعم فلسطينية', 'فلافل فلسطيني', 'شاورما'] },
    { category: 'coffee', brands: ['قهوة فلسطينية', 'بن القدس'] },
    { category: 'dairy', brands: ['ألبان النقاء', 'لبنة فلسطينية', 'جبنة فلسطينية'] },
    { category: 'chocolate', brands: ['شوكولاتة الحنين', 'حلاوة فلسطينية'] },
    { category: 'personal_care', brands: ['صابون نابلسي', 'منتجات طبيعية'] },
    { category: 'household', brands: ['منظفات محلية'] },
    { category: 'apparel', brands: ['علامات فلسطينية'] },
    { category: 'tech', brands: ['حلول محلية'] },
    { category: 'insurance', brands: ['تكافل محلي'] },
    { category: 'retail', brands: ['أسواق محلية'] },
    { category: 'general', brands: ['منتجات فلسطينية بديلة'] },
  ],
  'السودان': [
    { category: 'beverages', brands: ['عصير محلي', 'مياه سودانية', 'كركديه'] },
    { category: 'snacks', brands: ['سناكس سودانية', 'مكسرات محلّية'] },
    { category: 'fast_food', brands: ['مطاعم سودانية', 'كباب محلي'] },
    { category: 'coffee', brands: ['قهوة سودانية', 'بن السودان'] },
    { category: 'dairy', brands: ['ألبان سودانية', 'لبن محلّي'] },
    { category: 'chocolate', brands: ['شوكولاتة محلّية'] },
    { category: 'personal_care', brands: ['منتجات طبيعية'] },
    { category: 'household', brands: ['منظفات محلية'] },
    { category: 'apparel', brands: ['علامات سودانية'] },
    { category: 'tech', brands: ['حلول محلية'] },
    { category: 'insurance', brands: ['تكافل سوداني'] },
    { category: 'retail', brands: ['أسواق محلية'] },
    { category: 'general', brands: ['منتجات سودانية بديلة'] },
  ],
  'ليبيا': [
    { category: 'beverages', brands: ['عصير محلي', 'مياه ليبية', 'مياه عين'] },
    { category: 'snacks', brands: ['سناكس ليبية', 'مكسرات محلّية'] },
    { category: 'fast_food', brands: ['مطاعم ليبية', 'كسكسي محلي'] },
    { category: 'coffee', brands: ['قهوة ليبية', 'بن ليبيا'] },
    { category: 'dairy', brands: ['ألبان ليبية', 'لبن محلّي'] },
    { category: 'chocolate', brands: ['شوكولاتة محلّية'] },
    { category: 'personal_care', brands: ['منتجات طبيعية'] },
    { category: 'household', brands: ['منظفات محلية'] },
    { category: 'apparel', brands: ['علامات ليبية'] },
    { category: 'tech', brands: ['حلول محلية'] },
    { category: 'insurance', brands: ['تكافل ليبي', 'ليبيا للتأمين'] },
    { category: 'retail', brands: ['أسواق محلية'] },
    { category: 'general', brands: ['منتجات ليبية بديلة'] },
  ],
  'اليمن': [
    { category: 'beverages', brands: ['عصير محلي', 'مياه يمنية', 'مياه تعز'] },
    { category: 'snacks', brands: ['سناكس يمنية', 'مكسرات محلّية'] },
    { category: 'fast_food', brands: ['مطاعم يمنية', 'كباب محلي'] },
    { category: 'coffee', brands: ['قهوة يمنية موكا', 'بن حاراز', 'بن حراز'] },
    { category: 'dairy', brands: ['ألبان يمنية', 'لبن محلّي'] },
    { category: 'chocolate', brands: ['شوكولاتة محلّية'] },
    { category: 'personal_care', brands: ['منتجات طبيعية'] },
    { category: 'household', brands: ['منظفات محلية'] },
    { category: 'apparel', brands: ['علامات يمنية'] },
    { category: 'tech', brands: ['حلول محلية'] },
    { category: 'insurance', brands: ['تكافل يمني'] },
    { category: 'retail', brands: ['أسواق محلية'] },
    { category: 'general', brands: ['منتجات يمنية بديلة'] },
  ],
  'عمان': [
    { category: 'beverages', brands: ['عصير محلي', 'مياه عمانية', 'مياه صحار'] },
    { category: 'snacks', brands: ['سناكس عمانية', 'مكسرات محلّية'] },
    { category: 'fast_food', brands: ['مطاعم عمانية', 'شاورما محلية'] },
    { category: 'coffee', brands: ['قهوة عمانية', 'بن عمان'] },
    { category: 'dairy', brands: ['ألبان عمانية', 'لبن محلّي'] },
    { category: 'chocolate', brands: ['شوكولاتة محلّية'] },
    { category: 'personal_care', brands: ['منتجات طبيعية'] },
    { category: 'household', brands: ['منظفات محلية'] },
    { category: 'apparel', brands: ['علامات عمانية'] },
    { category: 'tech', brands: ['حلول محلية'] },
    { category: 'insurance', brands: ['تكافل عماني'] },
    { category: 'retail', brands: ['أسواق محلية'] },
    { category: 'general', brands: ['منتجات عمانية بديلة'] },
  ],
  'قطر': [
    { category: 'beverages', brands: ['عصير محلي', 'مياه قطرية', 'مياه قطر'] },
    { category: 'snacks', brands: ['سناكس قطرية', 'مكسرات محلّية'] },
    { category: 'fast_food', brands: ['مطاعم قطرية', 'شاورما محلية'] },
    { category: 'coffee', brands: ['قهوة قطرية', 'بن قطر'] },
    { category: 'dairy', brands: ['ألبان بالبن', 'لبن محلّي'] },
    { category: 'chocolate', brands: ['شوكولاتة محلّية'] },
    { category: 'personal_care', brands: ['منتجات طبيعية'] },
    { category: 'household', brands: ['منظفات محلية'] },
    { category: 'apparel', brands: ['علامات قطرية'] },
    { category: 'tech', brands: ['حلول محلية'] },
    { category: 'insurance', brands: ['تكافل قطري', 'قطر للتأمين'] },
    { category: 'retail', brands: ['لولو قطر', 'أسواق محلية'] },
    { category: 'general', brands: ['منتجات قطرية بديلة'] },
  ],
  'الكويت': [
    { category: 'beverages', brands: ['عصير محلي', 'مياه كويتية', 'مياه الكويت'] },
    { category: 'snacks', brands: ['سناكس كويتية', 'مكسرات محلّية'] },
    { category: 'fast_food', brands: ['مطاعم كويتية', 'شاورما محلية'] },
    { category: 'coffee', brands: ['قهوة كويتية', 'بن الكويت'] },
    { category: 'dairy', brands: ['ألبان كويتية', 'لبن محلّي'] },
    { category: 'chocolate', brands: ['شوكولاتة محلّية'] },
    { category: 'personal_care', brands: ['منتجات طبيعية'] },
    { category: 'household', brands: ['منظفات محلية'] },
    { category: 'apparel', brands: ['علامات كويتية'] },
    { category: 'tech', brands: ['حلول محلية'] },
    { category: 'insurance', brands: ['تكافل كويتي', 'الكويت للتأمين'] },
    { category: 'retail', brands: ['أسواق محلية', 'السلطان'] },
    { category: 'general', brands: ['منتجات كويتية بديلة'] },
  ],
  'البحرين': [
    { category: 'beverages', brands: ['عصير محلي', 'مياه بحرينية'] },
    { category: 'snacks', brands: ['سناكس بحرينية', 'مكسرات محلّية'] },
    { category: 'fast_food', brands: ['مطاعم بحرينية', 'شاورما محلية'] },
    { category: 'coffee', brands: ['قهوة بحرينية', 'بن البحرين'] },
    { category: 'dairy', brands: ['ألبان بحرينية', 'لبن محلّي'] },
    { category: 'chocolate', brands: ['شوكولاتة محلّية'] },
    { category: 'personal_care', brands: ['منتجات طبيعية'] },
    { category: 'household', brands: ['منظفات محلية'] },
    { category: 'apparel', brands: ['علامات بحرينية'] },
    { category: 'tech', brands: ['حلول محلية'] },
    { category: 'insurance', brands: ['تكافل بحريني', 'البحرين للتأمين'] },
    { category: 'retail', brands: ['أسواق محلية'] },
    { category: 'general', brands: ['منتجات بحرينية بديلة'] },
  ],
  'موريتانيا': [
    { category: 'beverages', brands: ['عصير محلي', 'مياه محلية', 'مياه نواكشوط'] },
    { category: 'snacks', brands: ['سناكس محلية', 'مكسرات محلّية'] },
    { category: 'fast_food', brands: ['مطاعم محلية', 'ثieboudienne'] },
    { category: 'coffee', brands: ['قهوة محلية'] },
    { category: 'dairy', brands: ['ألبان محلية', 'لبن محلّي'] },
    { category: 'chocolate', brands: ['شوكولاتة محلّية'] },
    { category: 'personal_care', brands: ['منتجات طبيعية'] },
    { category: 'household', brands: ['منظفات محلية'] },
    { category: 'apparel', brands: ['علامات محلية'] },
    { category: 'tech', brands: ['حلول محلية'] },
    { category: 'insurance', brands: ['تكافل محلي'] },
    { category: 'retail', brands: ['أسواق محلية'] },
    { category: 'general', brands: ['منتجات موريتانية بديلة'] },
  ],
  'الصومال': [
    { category: 'beverages', brands: ['عصير محلي', 'مياه محلية', 'مياه مقديشو'] },
    { category: 'snacks', brands: ['سناكس محلية', 'مكسرات محلّية'] },
    { category: 'fast_food', brands: ['مطاعم محلية', 'كباب محلي'] },
    { category: 'coffee', brands: ['قهوة محلية', 'بن الصومال'] },
    { category: 'dairy', brands: ['ألبان محلية', 'لبن محلّي'] },
    { category: 'chocolate', brands: ['شوكولاتة محلّية'] },
    { category: 'personal_care', brands: ['منتجات طبيعية'] },
    { category: 'household', brands: ['منظفات محلية'] },
    { category: 'apparel', brands: ['علامات محلية'] },
    { category: 'tech', brands: ['حلول محلية'] },
    { category: 'insurance', brands: ['تكافل محلي'] },
    { category: 'retail', brands: ['أسواق محلية'] },
    { category: 'general', brands: ['منتجات صومالية بديلة'] },
  ],
};

export function getCountryAlternatives(country: Country): CountryAlternative[] {
  return ALTERNATIVES_BY_COUNTRY[country] ?? ALTERNATIVES_BY_COUNTRY['مصر'];
}

export function getCountryCategoryAlternatives(
  country: Country,
  category: ProductCategory
): string[] {
  const groups = getCountryAlternatives(country);
  const found = groups.find((g) => g.category === category);
  if (found) return found.brands;
  const general = groups.find((g) => g.category === 'general');
  return general?.brands ?? ['منتج محلي بديل'];
}

// DB-merged lookup: combines hard-coded alternatives with admin-managed ones.
let dbAlternatives: { country: string; category: string; brand_name: string }[] = [];
let dbFetched = false;

export async function loadDbAlternatives(): Promise<void> {
  if (dbFetched) return;
  try {
    const { fetchPublicAlternatives } = await import('./admin');
    const rows = await fetchPublicAlternatives();
    dbAlternatives = rows.map((r) => ({ country: r.country, category: r.category, brand_name: r.brand_name }));
    dbFetched = true;
  } catch {
    dbFetched = true;
  }
}

export function getCountryCategoryAlternativesMerged(
  country: Country,
  category: ProductCategory
): string[] {
  const hardcoded = getCountryCategoryAlternatives(country, category);
  const dbMatches = dbAlternatives
    .filter((r) => r.country === country && r.category === category)
    .map((r) => r.brand_name);
  const combined = [...new Set([...hardcoded, ...dbMatches])];
  return combined;
}
