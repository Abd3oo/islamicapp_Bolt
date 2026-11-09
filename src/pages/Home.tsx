import { Star, BookOpen, ScanLine, ShieldCheck, Sparkles, ArrowLeft, HandHeart, Quote } from 'lucide-react';
import type { Page } from '../components/Layout';

interface HomeProps {
  onNavigate: (page: Page) => void;
}

const features = [
  {
    icon: BookOpen,
    title: 'فحص الأحاديث',
    desc: 'اكتب أي حديث واعرف حالته: صحيح، حسن، ضعيف، أو موضوع، مع المصدر والشرح.',
    page: 'hadith' as Page,
  },
  {
    icon: ScanLine,
    title: 'فحص المنتجات',
    desc: 'صوّر بالكاميرا لأي منتج ونجمة تخبرك إن كان من المنتجات المقاطعة أو الأجنبية أو العربية.',
    page: 'scanner' as Page,
  },
];

export default function Home({ onNavigate }: HomeProps) {
  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl glass-strong px-5 py-12 sm:px-12 sm:py-20 mb-8">
        <div className="relative z-10 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-6">
            <Sparkles className="w-4 h-4" style={{ color: '#c89a32' }} />
            <span className="text-sm font-medium" style={{ color: '#dcbb6e' }}>ذكاء اصطناعي في خدمة دينك</span>
          </div>
          <div className="flex items-center justify-center mb-5">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl flex items-center justify-center shadow-2xl" style={{ background: 'linear-gradient(135deg, #dcbb6e, #9a6e1c)', boxShadow: '0 8px 32px -8px rgba(184,132,32,0.4)' }}>
              <Star className="w-10 h-10 sm:w-12 sm:h-12 text-white fill-white" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-7xl font-extrabold text-white leading-tight text-balance mb-4 font-display">
            <span className="text-gradient">نجمة</span>
          </h1>
          <p className="text-base sm:text-xl text-slate-300 leading-relaxed mb-8 text-balance">
            مرجعك الديني الذكي للتحقق من الأحاديث النبوية
            ومعرفة المنتجات المقاطعة — في ثوانٍ معدودة
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => onNavigate('hadith')}
              className="group inline-flex items-center gap-2 text-white font-bold px-5 py-3 sm:px-6 rounded-2xl hover:opacity-90 transition-all hover:scale-105 text-sm sm:text-base"
              style={{ background: 'linear-gradient(135deg, #b68420, #7c5718)' }}
            >
              <BookOpen className="w-5 h-5" />
              ابدأ فحص الأحاديث
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => onNavigate('scanner')}
              className="inline-flex items-center gap-2 glass text-white font-bold px-5 py-3 sm:px-6 rounded-2xl hover:bg-white/5 transition-all text-sm sm:text-base"
            >
              <ScanLine className="w-5 h-5" />
              فحص المنتجات
            </button>
          </div>
        </div>
      </section>

      {/* Palestine support banner */}
      <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl glass px-5 py-6 sm:px-8 mb-8 border-r-4" style={{ borderRightColor: '#28b088' }}>
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg" style={{ background: 'linear-gradient(135deg, #28b088, #0a7858)' }}>
            <HandHeart className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-extrabold text-white mb-2 flex items-center gap-2 font-display">
              فلسطين في قلوبنا
              <span className="inline-block w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#28b088' }} />
            </h3>
            <p className="text-slate-300 leading-relaxed mb-3">
              منصة نجمة وُلدت لخدمة الأمة العربية والإسلامية، وتقف إلى جانب شعب
              فلسطين الصامد. كل عملية فحص لمنتج هي خطوة في دعم الاقتصاد العربي
              ومقاطعة كل ما يمول الاحتلال.
            </p>
            <div className="glass rounded-2xl p-4 border-r-2" style={{ borderRightColor: 'rgba(40,176,136,0.5)' }}>
              <Quote className="w-5 h-5 mb-2" style={{ color: '#28b088' }} />
              <p className="font-arabic text-lg text-white leading-loose text-right">
                «إن تنصروا الله ينصركم ويثبت أقدامكم»
              </p>
              <p className="text-sm mt-1" style={{ color: 'rgba(40,176,136,0.7)' }}>سورة محمد — آية 7</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values strip */}
      <section className="rounded-2xl glass mb-8 py-4 px-2">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-slate-300 font-medium text-sm">
          <span className="flex items-center gap-2"><Star className="w-4 h-4 fill-current" style={{ color: '#c89a32' }} /> ندعم فلسطين</span>
          <span style={{ color: '#28b088' }}>●</span>
          <span className="flex items-center gap-2"><HandHeart className="w-4 h-4" style={{ color: '#28b088' }} /> قاطعوا من يمول الاحتلال</span>
          <span style={{ color: '#28b088' }}>●</span>
          <span className="flex items-center gap-2"><Sparkles className="w-4 h-4" style={{ color: '#c89a32' }} /> المعرفة نور</span>
          <span style={{ color: '#28b088' }}>●</span>
          <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4" style={{ color: '#dcbb6e' }} /> تحقق قبل أن تنشر</span>
        </div>
      </section>

      {/* Features */}
      <section className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-10">
        {features.map((f) => {
          const Icon = f.icon;
          return (
            <button
              key={f.page}
              onClick={() => onNavigate(f.page)}
              className="group text-right glass rounded-2xl sm:rounded-3xl p-5 sm:p-7 hover:border-white/20 hover:shadow-2xl transition-all hover:-translate-y-1"
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg mb-5 group-hover:scale-110 transition-transform" style={{ background: 'linear-gradient(135deg, #c89a32, #7c5718)' }}>
                <Icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 font-display">{f.title}</h3>
              <p className="text-slate-300 leading-relaxed mb-4">{f.desc}</p>
              <span className="inline-flex items-center gap-1.5 font-semibold group-hover:gap-3 transition-all" style={{ color: '#c89a32' }}>
                ابدأ الآن
                <ArrowLeft className="w-4 h-4" />
              </span>
            </button>
          );
        })}
      </section>

      {/* Trust banner */}
      <section className="glass rounded-2xl sm:rounded-3xl p-5 sm:p-7">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #b68420, #7c5718)' }}>
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white mb-1 font-display">نصيحة مهمة</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              نجمة أداة مساعدة تعتمد على الذكاء الاصطناعي، ولا تُغني عن الرجوع لأهل العلم
              والتحقق من المصادر الموثوقة في المسائل الشرعية.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
