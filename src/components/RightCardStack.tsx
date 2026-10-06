import { useState, useRef, useCallback } from 'react'
import { RightCard, FleetFilter } from '../types'
import { Vehicle, vehicles as allVehicles } from '../data/vehicles'
import VehicleFlowCard from './VehicleFlowCard'
import FilterCard from './FilterCard'
import { useLanguage } from '../contexts/LanguageContext'

interface Props {
  cards: RightCard[]
  onCardsChange: (cards: RightCard[]) => void
  bottomInset: number
  focusedVehicleId?: string
  onVehicleActivate: (vehicle: Vehicle) => void
  filter: FleetFilter
  onFilterChange: (f: FleetFilter) => void
}

export default function RightCardStack({ cards, onCardsChange, bottomInset, focusedVehicleId, onVehicleActivate, filter, onFilterChange }: Props) {
  const { isRTL } = useLanguage()
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const dragAllowed = useRef(false)

  const updateCard = useCallback((id: string, patch: Partial<RightCard>) => {
    onCardsChange(cards.map(c => c.id === id ? { ...c, ...patch } : c))
  }, [cards, onCardsChange])

  const removeCard = useCallback((id: string) => {
    onCardsChange(cards.filter(c => c.id !== id))
  }, [cards, onCardsChange])

  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    if (!dragAllowed.current) { e.preventDefault(); return }
    setDraggingId(id)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', id)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, id: string) => {
    e.preventDefault()
    if (!draggingId || draggingId === id) return
    const fromIdx = cards.findIndex(c => c.id === draggingId)
    const toIdx = cards.findIndex(c => c.id === id)
    if (fromIdx === toIdx) return
    const next = [...cards]
    const [item] = next.splice(fromIdx, 1)
    next.splice(toIdx, 0, item)
    onCardsChange(next)
  }, [cards, draggingId, onCardsChange])

  const handleDragEnd = useCallback(() => {
    setDraggingId(null)
    dragAllowed.current = false
  }, [])

  if (!cards.length) return null

  return (
    <div style={{
      position: 'absolute',
      top: 72,
      right: isRTL ? undefined : 10,
      left: isRTL ? 10 : undefined,
      bottom: bottomInset + 4,
      width: 280,
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      zIndex: 25,
      overflowY: 'auto',
      overflowX: 'hidden',
      paddingBottom: 4,
    }}>
      {cards.map(card => {
        const vehicle = card.vehicleId ? allVehicles.find(v => v.id === card.vehicleId) : undefined
        const isDragging = draggingId === card.id

        const dragHandleProps: React.HTMLAttributes<HTMLDivElement> = {
          onMouseDown: () => { dragAllowed.current = true },
          onMouseUp:   () => { dragAllowed.current = false },
          style: {},
        }

        return (
          <div
            key={card.id}
            draggable
            onDragStart={e => handleDragStart(e, card.id)}
            onDragOver={e => handleDragOver(e, card.id)}
            onDragEnd={handleDragEnd}
            style={{ flexShrink: 0, opacity: isDragging ? 0.45 : 1, transition: 'opacity 0.15s' }}
          >
            {card.type === 'vehicle' && vehicle && (
              <VehicleFlowCard
                vehicle={vehicle}
                expanded={card.expanded}
                minimized={card.minimized}
                focused={card.vehicleId === focusedVehicleId}
                onActivate={() => onVehicleActivate(vehicle)}
                onExpand={() => updateCard(card.id, { expanded: !card.expanded })}
                onMinimize={() => updateCard(card.id, { minimized: !card.minimized })}
                onClose={() => removeCard(card.id)}
                dragHandleProps={dragHandleProps}
                isDragging={isDragging}
              />
            )}

            {card.type === 'filter' && (
              <FilterCard
                filter={filter}
                onFilterChange={onFilterChange}
                minimized={card.minimized}
                onMinimize={() => updateCard(card.id, { minimized: !card.minimized })}
                onClose={() => removeCard(card.id)}
                dragHandleProps={dragHandleProps}
                isDragging={isDragging}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
