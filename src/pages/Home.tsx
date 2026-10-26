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
    accent: 'from-navy-500 to-sky-400',
    glow: 'hover:shadow-navy-500/30',
  },
  {
    icon: ScanLine,
    title: 'فحص المنتجات',
    desc: 'صوّر بالكاميرا لأي منتج ونجمة تخبرك إن كان من المنتجات المقاطعة أو الأجنبية أو العربية.',
    page: 'scanner' as Page,
    accent: 'from-sky-500 to-navy-400',
    glow: 'hover:shadow-sky-500/30',
  },
];

export default function Home({ onNavigate }: HomeProps) {
  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl glass-strong px-6 py-16 sm:px-12 sm:py-24 mb-8 glow-blue">
        <div className="absolute inset-0 opacity-40 pointer-events-none">
          <div className="absolute top-10 right-10 w-72 h-72 bg-sky-500/40 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-navy-600/40 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        </div>
        <div className="relative z-10 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-6">
            <Sparkles className="w-4 h-4 text-sky-300" />
            <span className="text-sm text-sky-100 font-medium">ذكاء اصطناعي في خدمة دينك</span>
          </div>
          <div className="flex items-center justify-center mb-5">
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-sky-400 via-navy-500 to-navy-700 flex items-center justify-center shadow-2xl shadow-navy-500/50 animate-float glow-sky">
                <Star className="w-10 h-10 sm:w-12 sm:h-12 text-white fill-white" />
              </div>
            </div>
          </div>
          <h1 className="text-5xl sm:text-7xl font-extrabold text-white leading-tight text-balance mb-4">
            <span className="text-gradient">نجمة</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 leading-relaxed mb-8 text-balance">
            مرجعك الديني الذكي للتحقق من الأحاديث النبوية
            ومعرفة المنتجات المقاطعة — في ثوانٍ معدودة
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => onNavigate('hadith')}
              className="group inline-flex items-center gap-2 bg-gradient-to-br from-navy-500 to-navy-700 text-white font-bold px-6 py-3 rounded-2xl hover:shadow-xl hover:shadow-navy-500/40 transition-all hover:scale-105"
            >
              <BookOpen className="w-5 h-5" />
              ابدأ فحص الأحاديث
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => onNavigate('scanner')}
              className="inline-flex items-center gap-2 glass text-white font-bold px-6 py-3 rounded-2xl hover:bg-white/10 transition-all"
            >
              <ScanLine className="w-5 h-5" />
              فحص المنتجات
            </button>
          </div>
        </div>
      </section>

      {/* Palestine support banner */}
      <section className="relative overflow-hidden rounded-3xl glass px-6 py-7 sm:px-8 mb-8 border-l-4 border-l-emerald-500">
        <div className="absolute top-0 left-0 w-1/3 h-1 bg-gradient-to-r from-black via-emerald-500 to-white" />
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/30">
            <HandHeart className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-extrabold text-white mb-2 flex items-center gap-2">
              فلسطين في قلوبنا
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </h3>
            <p className="text-slate-300 leading-relaxed mb-3">
              منصة نجمة وُلدت لخدمة الأمة العربية والإسلامية، وتقف إلى جانب شعب
              فلسطين الصامد. كل عملية فحص لمنتج هي خطوة في دعم الاقتصاد العربي
              ومقاطعة كل ما يمول الاحتلال.
            </p>
            <div className="glass rounded-2xl p-4 border-r-2 border-emerald-500/50">
              <Quote className="w-5 h-5 text-emerald-400 mb-2" />
              <p className="font-arabic text-lg text-white leading-loose text-right">
                «إن تنصروا الله ينصركم ويثبت أقدامكم»
              </p>
              <p className="text-emerald-300/70 text-sm mt-1">سورة محمد — آية 7</p>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee support strip */}
      <section className="relative overflow-hidden rounded-2xl glass mb-8 py-3">
        <div className="flex whitespace-nowrap animate-marquee">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex items-center gap-8 px-4 text-slate-300 font-medium">
              <span className="flex items-center gap-2"><Star className="w-4 h-4 text-sky-300 fill-sky-300" /> ندعم فلسطين</span>
              <span className="text-emerald-400">●</span>
              <span className="flex items-center gap-2"><HandHeart className="w-4 h-4 text-emerald-400" /> قاطعوا من يمول الاحتلال</span>
              <span className="text-emerald-400">●</span>
              <span className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-sky-300" /> المعرفة نور</span>
              <span className="text-emerald-400">●</span>
              <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-navy-300" /> تحقق قبل أن تنشر</span>
              <span className="text-emerald-400">●</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="grid md:grid-cols-2 gap-6 mb-10">
        {features.map((f) => {
          const Icon = f.icon;
          return (
            <button
              key={f.page}
              onClick={() => onNavigate(f.page)}
              className={`group text-right glass rounded-3xl p-7 hover:border-white/20 hover:shadow-2xl ${f.glow} transition-all hover:-translate-y-1`}
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.accent} flex items-center justify-center shadow-lg mb-5 group-hover:scale-110 transition-transform`}>
                <Icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{f.title}</h3>
              <p className="text-slate-300 leading-relaxed mb-4">{f.desc}</p>
              <span className="inline-flex items-center gap-1.5 text-sky-300 font-semibold group-hover:gap-3 transition-all">
                ابدأ الآن
                <ArrowLeft className="w-4 h-4" />
              </span>
            </button>
          );
        })}
      </section>

      {/* Trust banner */}
      <section className="glass rounded-3xl p-7">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-navy-500 to-navy-700 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white mb-1">نصيحة مهمة</h3>
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
