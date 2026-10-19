import { useState } from 'react'
import type { Campaign } from '../types'
import CampaignThumbnail from './CampaignThumbnail'
import Sparkline from './Sparkline'

/* ── Area chart (7-day performance) ────────────────────────────────── */
function AreaChart({ data }: { data: number[] }) {
  const W = 260, H = 100
  const marginL = 32, marginR = 10, marginT = 10, marginB = 28

  const chartW = W - marginL - marginR
  const chartH = H - marginT - marginB

  const max = Math.max(...data)
  const steps = [0, Math.round(max * 0.5), max]

  const pts = data.map((v, i) => ({
    x: marginL + (i / (data.length - 1)) * chartW,
    y: marginT + chartH - (v / max) * chartH,
  }))

  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const areaPath = `${linePath} L${pts[pts.length - 1].x.toFixed(1)},${marginT + chartH} L${pts[0].x.toFixed(1)},${marginT + chartH} Z`

  const xLabels = ['10 سبتمبر', '12', '14', '16 سبتمبر']

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="var(--primary)" stopOpacity="0.3"/>
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0"/>
        </linearGradient>
      </defs>

      {/* Y-axis grid lines + labels */}
      {steps.map((step, i) => {
        const y = marginT + chartH - (step / max) * chartH
        const label = step === 0 ? '0' : step >= 1000 ? `${(step / 1000).toFixed(1)}K` : step.toString()
        return (
          <g key={i}>
            <line x1={marginL} y1={y} x2={W - marginR} y2={y} stroke="var(--border)" strokeWidth="0.6" strokeDasharray="3,3"/>
            <text x={marginL - 4} y={y + 4} fill="var(--muted-foreground)" fontSize="7" textAnchor="end">{label}</text>
          </g>
        )
      })}

      {/* Area fill */}
      <path d={areaPath} fill="url(#area-grad)"/>

      {/* Line */}
      <path d={linePath} fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>

      {/* X-axis labels */}
      {xLabels.map((label, i) => {
        const xi = Math.round(i * (data.length - 1) / (xLabels.length - 1))
        const x = marginL + (xi / (data.length - 1)) * chartW
        return (
          <text key={i} x={x} y={H - 4} fill="var(--muted-foreground)" fontSize="6.5" textAnchor="middle"
            fontFamily="system-ui">{label}</text>
        )
      })}

      {/* End-point dot */}
      <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r="4" fill="var(--primary)" opacity="0.25"/>
      <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r="2.5" fill="var(--primary)"/>
    </svg>
  )
}

/* ── Stat block ─────────────────────────────────────────────────────── */
function StatBlock({
  icon, label, value, change, up, accent,
}: {
  icon: React.ReactNode; label: string; value: string; change: string; up: boolean; accent?: boolean
}) {
  return (
    <div className="bg-[var(--secondary)] border border-[var(--border)] rounded-xl p-3 flex flex-col gap-1.5">
      <div className={`${accent ? 'text-[var(--primary)]' : 'text-[var(--muted-foreground)]'}`}>{icon}</div>
      <p className={`text-lg font-bold leading-none ${accent ? 'text-[var(--primary)]' : 'text-[var(--foreground)]'}`}>
        {value}
      </p>
      <p className="text-[10px] text-[var(--muted-foreground)]">{label}</p>
      <div className="flex items-center gap-1">
        <svg
          className={`w-2.5 h-2.5 flex-shrink-0 ${up ? 'text-[var(--primary)]' : 'text-[var(--danger)]'}`}
          viewBox="0 0 24 24" fill="currentColor"
        >
          {up ? <path d="M12 4l8 8H4z"/> : <path d="M12 20l-8-8h16z"/>}
        </svg>
        <span className={`text-[10px] font-medium ${up ? 'text-[var(--primary)]' : 'text-[var(--danger)]'}`}>
          {change}
        </span>
      </div>
    </div>
  )
}

const panels = [
  { id: 'overview',  label: 'نظرة عامة' },
  { id: 'views',     label: 'المشاهدات' },
  { id: 'clicks',    label: 'النقرات' },
]

interface CampaignDetailsPanelProps {
  campaign: Campaign
  onClose: () => void
}

export default function CampaignDetailsPanel({ campaign: c, onClose }: CampaignDetailsPanelProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [period, setPeriod] = useState('آخر 7 أيام')

  const fmtViews = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : n.toString()

  return (
    <div className="w-[290px] flex-shrink-0 bg-[var(--card)] border-r border-[var(--border)] flex flex-col overflow-hidden animate-slide-in" dir="rtl">

      {/* Panel header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] flex-shrink-0">
        <p className="text-[13px] font-semibold text-[var(--foreground)]">أداء الحملة المحددة</p>
        <div className="flex items-center gap-2">
          {/* Period dropdown */}
          <button
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[var(--secondary)] border border-[var(--border)] text-[11px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            onClick={() => setPeriod(p => p === 'آخر 7 أيام' ? 'آخر 30 يوم' : 'آخر 7 أيام')}
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
            {period}
          </button>
          {/* Close */}
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Campaign identity */}
      <div className="flex items-start gap-3 px-4 py-3 border-b border-[var(--border)] flex-shrink-0">
        <CampaignThumbnail type={c.imageType} className="w-20 h-12 flex-shrink-0"/>
        <div className="flex-1 min-w-0 text-right">
          <p className="text-sm font-bold text-[var(--foreground)] leading-tight">{c.name}</p>
          <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">{c.subtitle}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--border)] flex-shrink-0 px-2 pt-1">
        {panels.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 text-[11px] font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'border-[var(--primary)] text-[var(--primary)]'
                : 'border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* Stat blocks */}
        <div className="grid grid-cols-3 gap-2">
          <StatBlock
            icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
            label="مشاهدة"
            value={fmtViews(c.views)}
            change={`${c.viewsChange}%`}
            up={c.viewsChange > 0}
            accent
          />
          <StatBlock
            icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M5 3l14 9-14 9V3z" strokeLinejoin="round"/></svg>}
            label="نفرة"
            value={c.clicks.toString()}
            change={`${c.clicksChange}%`}
            up={c.clicksChange > 0}
          />
          <StatBlock
            icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>}
            label="معدل النقر"
            value={`${c.ctr}%`}
            change={`${Math.abs(c.ctrChange)}%`}
            up={c.ctrChange > 0}
          />
        </div>

        {/* Area chart */}
        <div>
          <div className="h-[100px] w-full">
            <AreaChart data={c.sparkline}/>
          </div>
        </div>

        {/* Mini sparkline row for tabs */}
        {activeTab !== 'overview' && (
          <div className="h-12 w-full animate-fade-in-up">
            <Sparkline
              data={activeTab === 'views' ? c.sparkline : c.sparkline.map(v => v * (c.ctr / 100))}
              color="var(--primary)"
              gradientId={`panel-spark-${c.id}-${activeTab}`}
              height={48}
              strokeWidth={2}
            />
          </div>
        )}

        {/* Channel info */}
        <div className="bg-[var(--secondary)] border border-[var(--border)] rounded-xl p-3 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[11px] text-[var(--muted-foreground)]">القناة</span>
            <span className="text-[11px] font-medium text-[var(--foreground)]">{c.channel}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[11px] text-[var(--muted-foreground)]">الميزانية</span>
            <span className="text-[11px] font-medium text-[var(--foreground)]">{c.budget.toLocaleString()} ريال</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[11px] text-[var(--muted-foreground)]">تاريخ الإطلاق</span>
            <span className="text-[11px] font-medium text-[var(--foreground)]">{c.date}</span>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="border-t border-[var(--border)] p-3 flex-shrink-0">
        <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[color-mix(in_srgb,var(--primary)_8%,transparent)] border border-[color-mix(in_srgb,var(--primary)_20%,transparent)] text-[13px] font-medium text-[var(--primary)] hover:bg-[color-mix(in_srgb,var(--primary)_14%,transparent)] transition-colors">
          عرض التفاصيل الكاملة
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
