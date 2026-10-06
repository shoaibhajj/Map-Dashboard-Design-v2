import { useCallback, useState } from 'react'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import MapCanvas from './MapCanvas'
import FABStack from './FABStack'
import RightCardStack from './RightCardStack'
import VehicleListPanel from './VehicleListPanel'
import LegendPanel from './LegendPanel'
import AddVehicleModal from './AddVehicleModal'
import FloatingVehicleDetails from './FloatingVehicleDetails'
import BottomSheet from './BottomSheet'
import { Vehicle, vehicles as initialVehicles } from '../data/vehicles'
import { RightCard, FABType, FleetFilter, defaultFilter } from '../types'

interface Props {
  darkMode: boolean
  onToggleDark: () => void
}

export default function MapDashboard({ darkMode, onToggleDark }: Props) {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [showSelectedRoute, setShowSelectedRoute] = useState(false)
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>(initialVehicles)
  const [addVehicleOpen, setAddVehicleOpen] = useState(false)
  const [vehiclesPanelOpen, setVehiclesPanelOpen] = useState(true)
  const [vehiclesPanelCompact, setVehiclesPanelCompact] = useState(false)
  const [legendPanelOpen, setLegendPanelOpen] = useState(false)
  const [rightCards, setRightCards] = useState<RightCard[]>([])
  const [filter, setFilter] = useState<FleetFilter>(defaultFilter)
  const [fleetDrawerHeight, setFleetDrawerHeight] = useState(0)

  const handleVehicleSelect = useCallback((vehicle: Vehicle) => {
    setSelectedVehicle(vehicle)
    setShowSelectedRoute(false)
    setVehiclesPanelCompact(true)
    setRightCards(current => current.filter(card => card.type !== 'vehicle'))
  }, [])

  const handleMapClick = useCallback(() => {
    setSelectedVehicle(null)
    setShowSelectedRoute(false)
    setVehiclesPanelOpen(false)
    setVehiclesPanelCompact(false)
    setLegendPanelOpen(false)
  }, [])

  const openFilterCard = useCallback(() => {
    setRightCards(current => {
      const existing = current.find(card => card.type === 'filter')
      if (existing) return [{ ...existing, minimized: false }, ...current.filter(card => card.id !== existing.id)]
      return [{ id: `filter-${Date.now()}`, type: 'filter', minimized: false, expanded: false }, ...current]
    })
  }, [])

  const handleFABClick = useCallback((type: FABType) => {
    if (type === 'vehicles') {
      setVehiclesPanelOpen(value => {
        const next = !value
        if (!next) setVehiclesPanelCompact(false)
        return next
      })
      setLegendPanelOpen(false)
      return
    }
    setLegendPanelOpen(value => !value)
    setVehiclesPanelOpen(false)
    setVehiclesPanelCompact(false)
  }, [])

  const leftPanelOpen = vehiclesPanelOpen || legendPanelOpen
  const leftPanelOffset = vehiclesPanelOpen ? vehiclesPanelCompact ? 318 : 548 : legendPanelOpen ? 548 : 0
  const filterCardOpen = rightCards.some(card => card.type === 'filter')

  return (
    <div style={{ display: 'flex', height: '100%', width: '100%', overflow: 'hidden', background: 'var(--background)' }}>
      <Sidebar activeRoute="map" />

      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <MapCanvas
          vehicles={allVehicles}
          selectedVehicle={selectedVehicle}
          showSelectedRoute={showSelectedRoute}
          onVehicleSelect={handleVehicleSelect}
          onMapClick={handleMapClick}
          darkMode={darkMode}
          leftPanelOffset={leftPanelOffset}
        />

        {vehiclesPanelOpen && (
          <div className={`static-fleet-sidebar${vehiclesPanelCompact ? ' is-compact' : ''}`}>
            <VehicleListPanel
              vehicles={allVehicles}
              filter={filter}
              onFilterChange={setFilter}
              onVehicleSelect={handleVehicleSelect}
              onAddVehicle={() => setAddVehicleOpen(true)}
              onClose={() => { setVehiclesPanelOpen(false); setVehiclesPanelCompact(false) }}
              compact={vehiclesPanelCompact}
              onToggleCompact={() => setVehiclesPanelCompact(value => !value)}
            />
          </div>
        )}

        {legendPanelOpen && (
          <div className="static-fleet-sidebar">
            <LegendPanel onClose={() => setLegendPanelOpen(false)} />
          </div>
        )}

        <TopBar
          darkMode={darkMode}
          onToggleDark={onToggleDark}
          vehicles={allVehicles}
          onVehicleSelect={handleVehicleSelect}
          onOpenFilter={openFilterCard}
          filterActive={filterCardOpen}
          hideFleetControls={leftPanelOpen}
          hideRightControls={Boolean(selectedVehicle)}
        />

        <FABStack
          vehiclesPanelOpen={vehiclesPanelOpen}
          legendPanelOpen={legendPanelOpen}
          leftPanelOffset={leftPanelOffset}
          onOpen={handleFABClick}
        />

        {!selectedVehicle && (
          <RightCardStack
            cards={rightCards}
            onCardsChange={setRightCards}
            bottomInset={fleetDrawerHeight > 0 ? fleetDrawerHeight : 58}
            focusedVehicleId={undefined}
            onVehicleActivate={setSelectedVehicle}
            filter={filter}
            onFilterChange={setFilter}
          />
        )}

        {selectedVehicle && (
          <FloatingVehicleDetails
            vehicle={selectedVehicle}
            onClose={() => { setSelectedVehicle(null); setShowSelectedRoute(false) }}
            onShowTrip={() => setShowSelectedRoute(true)}
            onFocus={() => setSelectedVehicle(current => current ? { ...current } : current)}
            onUpdate={updated => {
              setAllVehicles(current => current.map(vehicle => vehicle.id === updated.id ? updated : vehicle))
              setSelectedVehicle(updated)
            }}
          />
        )}

        <BottomSheet vehicles={allVehicles} height={fleetDrawerHeight} onHeightChange={setFleetDrawerHeight} />
      </div>

      {addVehicleOpen && (
        <AddVehicleModal
          onClose={() => setAddVehicleOpen(false)}
          onAdd={vehicle => {
            setAllVehicles(current => [vehicle, ...current])
            setAddVehicleOpen(false)
          }}
        />
      )}
    </div>
  )
}
