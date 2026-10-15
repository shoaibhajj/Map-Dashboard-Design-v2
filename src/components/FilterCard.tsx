import { useEffect, useState } from 'react'
import { FleetFilter, defaultFilter } from '../types'
import { VehicleType } from '../data/vehicles'
import { useLanguage } from '../contexts/LanguageContext'
import type { FleetGroup } from '../data/fleetEntities'
import GroupTreeFilter from './GroupTreeFilter'

interface Props {
  groups: FleetGroup[]
  filter: FleetFilter
  onFilterChange: (f: FleetFilter) => void
  minimized: boolean
  onMinimize: () => void
  onClose: () => void
  dragHandleProps: React.HTMLAttributes<HTMLDivElement>
  isDragging: boolean
}

function GripIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="5" r="1.2" fill="currentColor"/><circle cx="9" cy="12" r="1.2" fill="currentColor"/><circle cx="9" cy="19" r="1.2" fill="currentColor"/>
      <circle cx="15" cy="5" r="1.2" fill="currentColor"/><circle cx="15" cy="12" r="1.2" fill="currentColor"/><circle cx="15" cy="19" r="1.2" fill="currentColor"/>
    </svg>
  )
}
function CtrlBtn({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button onClick={onClick} title={title} style={{
      width: 22, height: 22, borderRadius: 5,
      border: '1px solid var(--border)', background: 'var(--secondary)',
      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'var(--muted-foreground)', flexShrink: 0,
    }}>
      {children}
    </button>
  )
}

function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
        {label}
      </div>
      {children}
    </div>
  )
}

function ChipGroup<T extends string>({
  options, selected, onToggle,
}: {
  options: { value: T; label: string }[]
  selected: T[]
  onToggle: (v: T) => void
}) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
      {options.map(opt => {
        const active = selected.includes(opt.value)
        return (
          <button
            key={opt.value}
            onClick={() => onToggle(opt.value)}
            style={{
              padding: '4px 10px',
              borderRadius: 99,
              border: `1px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
              background: active ? 'color-mix(in srgb, var(--primary) 12%, transparent)' : 'var(--secondary)',
              color: active ? 'var(--primary)' : 'var(--muted-foreground)',
              fontSize: 11, fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

const STATUS_COLORS: Record<string, string> = {
  moving: '#16a34a', idle: '#9ca3af', offline: '#ef4444',
}

export default function FilterCard({ groups, filter, onFilterChange, minimized, onMinimize, onClose, dragHandleProps, isDragging }: Props) {
  const { t } = useLanguage()

  const [localFilter, setLocalFilter] = useState<FleetFilter>(filter)
  useEffect(() => setLocalFilter(filter), [filter])

  const toggleStatus = (s: string) => {
    setLocalFilter(f => ({
      ...f,
      statuses: f.statuses.includes(s)
        ? f.statuses.filter(x => x !== s)
        : [...f.statuses, s],
    }))
  }

  const toggleType = (tp: VehicleType) => {
    setLocalFilter(f => ({
      ...f,
      types: f.types.includes(tp)
        ? f.types.filter(x => x !== tp)
        : [...f.types, tp],
    }))
  }

  const toggleZone = (z: string) => {
    setLocalFilter(f => ({
      ...f,
      zones: f.zones.includes(z)
        ? f.zones.filter(x => x !== z)
        : [...f.zones, z],
    }))
  }

  const toggleGroup = (groupId: string) => {
    setLocalFilter(f => ({ ...f, groupIds: f.groupIds.includes(groupId) ? f.groupIds.filter(id => id !== groupId) : [...f.groupIds, groupId] }))
  }

  const activeCount = [
    localFilter.statuses.length > 0,
    localFilter.types.length > 0,
    localFilter.zones.length > 0,
    localFilter.groupIds.length > 0,
    localFilter.minFuel > 0,
    localFilter.driversOnly !== 'all',
  ].filter(Boolean).length

  return (
    <div style={{
      background: 'color-mix(in srgb, var(--card) 98%, transparent)',
      backdropFilter: 'blur(18px)',
      border: '1px solid var(--border)',
      borderRadius: 11,
      boxShadow: isDragging ? '0 16px 48px rgba(0,0,0,0.22)' : '0 3px 16px rgba(0,0,0,0.10)',
      overflow: 'hidden',
      opacity: isDragging ? 0.88 : 1,
      transition: 'box-shadow 0.18s, opacity 0.18s',
      animation: 'card-in 0.2s cubic-bezier(0.4,0,0.2,1)',
    }}>
      <style>{`@keyframes card-in { from { opacity: 0; transform: translateX(12px) scale(0.97); } to { opacity: 1; transform: scale(1); } }`}</style>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 5,
        padding: '8px 8px 8px 6px',
        borderBottom: minimized ? 'none' : '1px solid var(--border)',
      }}>
        <div {...dragHandleProps} style={{ cursor: 'grab', color: 'var(--muted-foreground)', display: 'flex', alignItems: 'center', padding: 2, borderRadius: 4, flexShrink: 0, userSelect: 'none', opacity: 0.5, ...dragHandleProps.style }}>
          <GripIcon />
        </div>

        {/* Filter icon */}
        <div style={{ width: 22, height: 22, borderRadius: 6, background: 'color-mix(in srgb, var(--primary) 12%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
          </svg>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--foreground)' }}>{t('filter_title')}</span>
            {activeCount > 0 && (
              <span style={{ fontSize: 9.5, fontWeight: 700, background: 'var(--primary)', color: '#fff', padding: '1px 5px', borderRadius: 99 }}>
                {activeCount}
              </span>
            )}
          </div>
          <div style={{ fontSize: 10, color: 'var(--muted-foreground)' }}>Fleet-wide filters</div>
        </div>

        <div style={{ display: 'flex', gap: 3 }}>
          <CtrlBtn onClick={onMinimize} title={minimized ? t('ctrl_restore') : t('ctrl_minimize')}>
            {minimized
              ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
              : <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
            }
          </CtrlBtn>
          <CtrlBtn onClick={onClose} title={t('ctrl_close')}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </CtrlBtn>
        </div>
      </div>

      {!minimized && (
        <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Status */}
          <FilterSection label={t('filter_status')}>
            <div style={{ display: 'flex', gap: 4 }}>
              {(['moving', 'idle', 'offline'] as const).map(s => {
                const active = localFilter.statuses.includes(s)
                return (
                  <button key={s} onClick={() => toggleStatus(s)} style={{
                    flex: 1, padding: '5px 0',
                    borderRadius: 7,
                    border: `1px solid ${active ? STATUS_COLORS[s] : 'var(--border)'}`,
                    background: active ? `${STATUS_COLORS[s]}18` : 'var(--secondary)',
                    color: active ? STATUS_COLORS[s] : 'var(--muted-foreground)',
                    fontSize: 11, fontWeight: 600, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                    transition: 'all 0.15s',
                  }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: STATUS_COLORS[s] }} />
                    {t(`status_${s}` as any)}
                  </button>
                )
              })}
            </div>
          </FilterSection>

          {/* Vehicle Type */}
          <FilterSection label={t('filter_vehicle_type')}>
            <ChipGroup<VehicleType>
              options={[
                { value: 'truck', label: t('type_truck') },
                { value: 'van', label: t('type_van') },
                { value: 'car', label: t('type_car') },
                { value: 'motorcycle', label: t('type_motorcycle') },
              ]}
              selected={localFilter.types}
              onToggle={toggleType}
            />
          </FilterSection>

          {/* Zone */}
          <FilterSection label={t('filter_group_zone')}>
            <ChipGroup<string>
              options={[
                { value: 'Central Riyadh', label: t('zone_central') },
                { value: 'North Riyadh', label: t('zone_north') },
                { value: 'South Riyadh', label: t('zone_south') },
                { value: 'East Riyadh', label: t('zone_east') },
                { value: 'West Riyadh', label: t('zone_west') },
              ]}
              selected={localFilter.zones}
              onToggle={toggleZone}
            />
          </FilterSection>

          {/* Min Fuel */}
          <FilterSection label={t('filter_fuel_level')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="range" min={0} max={80} step={10}
                value={localFilter.minFuel}
                onChange={e => setLocalFilter(f => ({ ...f, minFuel: Number(e.target.value) }))}
                style={{ flex: 1, accentColor: 'var(--primary)' }}
              />
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--foreground)', fontFamily: 'var(--font-mono)', minWidth: 32 }}>
                {localFilter.minFuel}%+
              </span>
            </div>
          </FilterSection>

          {/* Driver Assignment */}
          <FilterSection label={t('filter_driver')}>
            <div style={{ display: 'flex', gap: 4 }}>
              {(['all', 'assigned', 'unassigned'] as const).map(opt => (
                <button key={opt} onClick={() => setLocalFilter(f => ({ ...f, driversOnly: opt }))}
                  style={{
                    flex: 1, padding: '5px 0',
                    borderRadius: 7,
                    border: `1px solid ${localFilter.driversOnly === opt ? 'var(--primary)' : 'var(--border)'}`,
                    background: localFilter.driversOnly === opt ? 'color-mix(in srgb, var(--primary) 12%, transparent)' : 'var(--secondary)',
                    color: localFilter.driversOnly === opt ? 'var(--primary)' : 'var(--muted-foreground)',
                    fontSize: 11, fontWeight: 600, cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}>
                  {opt === 'all' ? t('filter_any') : opt === 'assigned' ? t('filter_assigned') : t('filter_unassigned')}
                </button>
              ))}
            </div>
          </FilterSection>

          <FilterSection label={t('filter_vehicle_groups')}>
            <GroupTreeFilter groups={groups} selectedIds={localFilter.groupIds} onToggle={toggleGroup} />
          </FilterSection>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 6, paddingTop: 2 }}>
            <button
              onClick={() => { setLocalFilter(defaultFilter) }}
              style={{
                flex: 1, padding: '7px 0',
                borderRadius: 7, border: '1px solid var(--border)',
                background: 'var(--secondary)',
                color: 'var(--muted-foreground)',
                fontSize: 11.5, fontWeight: 600, cursor: 'pointer',
              }}>
              {t('filter_reset')}
            </button>
            <button
              onClick={() => onFilterChange(localFilter)}
              style={{
                flex: 2, padding: '7px 0',
                borderRadius: 7, border: 'none',
                background: 'var(--primary)',
                color: '#fff',
                fontSize: 11.5, fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(22,163,74,0.28)',
              }}>
              {t('filter_apply')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
