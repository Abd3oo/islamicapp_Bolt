import { ShieldX } from 'lucide-react';

export default function BlockedScreen({ reason }: { reason?: string | null }) {
  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center p-6 text-center">
      <div className="absolute inset-0 bg-grid-pattern [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)] opacity-20" />
      <div className="relative animate-slide-up">
        <div className="inline-flex w-24 h-24 rounded-3xl bg-rose-500/10 border border-rose-500/30 items-center justify-center mb-6 mx-auto">
          <ShieldX className="w-12 h-12 text-rose-500" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 leading-tight">
          عذراً، تم حظر جهازك
        </h1>
        <p className="text-slate-400 text-lg max-w-md mx-auto leading-relaxed mb-2">
          تم حظر جهازك من دخول الموقع لأسباب أمنية.
        </p>
        {reason && (
          <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed">
            السبب: {reason}
          </p>
        )}
        <p className="text-slate-600 text-xs mt-8 max-w-sm mx-auto">
          إن كنت تعتقد أن هذا خطأ، تواصل مع إدارة الموقع لإلغاء الحظر.
        </p>
      </div>
    </div>
  );
}
