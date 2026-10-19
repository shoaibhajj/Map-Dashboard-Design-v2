interface PromoCardProps {
  onCreateCampaign?: () => void
}

export default function PromoCard({ onCreateCampaign }: PromoCardProps) {
  return (
    <div
      className="relative flex-shrink-0 rounded-xl overflow-hidden flex flex-col justify-between p-5 min-h-[200px]"
      style={{
        background: 'linear-gradient(135deg, color-mix(in srgb,var(--primary-deep) 80%,var(--background)) 0%, var(--background) 100%)',
        border: '1px solid color-mix(in srgb,var(--primary) 20%,var(--border))',
      }}
      dir="rtl"
    >
      {/* Decorative background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 80% at 80% 20%, color-mix(in srgb,var(--primary) 12%,transparent), transparent)',
        }}
      />

      {/* Decorative SVG: megaphone + charts + truck */}
      <div className="absolute left-2 bottom-2 opacity-15 pointer-events-none">
        <svg viewBox="0 0 160 120" className="w-40 h-30" fill="none">
          {/* Bar chart */}
          <rect x="4"  y="50" width="14" height="60" rx="2" fill="currentColor" className="text-[var(--primary)]"/>
          <rect x="22" y="30" width="14" height="80" rx="2" fill="currentColor" className="text-[var(--primary)]"/>
          <rect x="40" y="40" width="14" height="70" rx="2" fill="currentColor" className="text-[var(--primary)]"/>
          <rect x="58" y="10" width="14" height="100" rx="2" fill="currentColor" className="text-[var(--primary)]"/>
          {/* Trend line */}
          <polyline points="8,80 30,55 48,65 66,30" stroke="currentColor" className="text-[var(--primary)]" strokeWidth="2" fill="none"/>
          {/* Simple van/truck */}
          <path d="M80,90 L80,70 L85,60 L100,55 L118,55 L125,65 L130,72 L130,90 Z" fill="currentColor" className="text-[var(--primary)]" opacity="0.6"/>
          <circle cx="90" cy="92" r="6" fill="currentColor" className="text-[var(--primary)]"/>
          <circle cx="120" cy="92" r="6" fill="currentColor" className="text-[var(--primary)]"/>
          <rect x="85" y="62" width="30" height="16" rx="2" fill="currentColor" className="text-[var(--background)]" opacity="0.3"/>
        </svg>
      </div>

      {/* Megaphone icon - large decorative */}
      <div className="absolute left-1/2 top-4 opacity-10 pointer-events-none">
        <svg viewBox="0 0 80 80" className="w-20 h-20" fill="none">
          <path d="M60 10 L20 30 L10 30 L10 50 L20 50 L20 65 L32 65 L32 50 L60 70 Z" fill="var(--primary)"/>
          <path d="M65 25 Q75 40 65 55" stroke="var(--primary)" strokeWidth="4" strokeLinecap="round"/>
          <path d="M70 18 Q85 40 70 62" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" opacity="0.5"/>
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <h2 className="text-xl font-bold text-[var(--foreground)] leading-tight mb-1.5">
          روّج لخدماتك
        </h2>
        <p className="text-xs text-[var(--muted-foreground)] leading-relaxed max-w-[200px]">
          صل إلى عملاء جدد وزد من نمو أعمالك مع حملات إعلانية مميزة.
        </p>
      </div>

      <button
        onClick={onCreateCampaign}
        className="
          relative z-10 mt-4 flex items-center gap-2
          px-4 py-2.5 rounded-lg
          bg-[var(--primary)] text-[var(--primary-foreground)]
          text-sm font-semibold
          hover:opacity-90
          hover:shadow-[0_0_20px_color-mix(in_srgb,var(--primary)_40%,transparent)]
          active:scale-95
          transition-all duration-200
          w-fit
        "
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        إنشاء حملة جديدة
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>
    </div>
  )
}
