import { useCallback, useEffect, useState } from 'react'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import MapCanvas from './MapCanvas'
import FABStack from './FABStack'
import RightCardStack from './RightCardStack'
import VehicleListPanel from './VehicleListPanel'
import AddVehicleModal from './AddVehicleModal'
import FloatingVehicleDetails from './FloatingVehicleDetails'
import BottomSheet from './BottomSheet'
import { Vehicle, vehicles as initialVehicles } from '../data/vehicles'
import { RightCard, FABType, FleetFilter, defaultFilter } from '../types'
import { readMapLegendConfig, saveMapLegendConfig, type MapLegendConfig } from '../utils/mapLegend'

interface Props {
  darkMode: boolean
  onToggleDark: () => void
}

function retainLastTelemetryTimes(updated: Vehicle, previous?: Vehicle): Vehicle {
  return {
    ...updated,
    telemetry: {
      ...updated.telemetry,
      waslUpdatedAt: updated.telemetry.waslUpdatedAt ?? previous?.telemetry.waslUpdatedAt ?? null,
      weightUpdatedAt: updated.telemetry.weightUpdatedAt ?? previous?.telemetry.weightUpdatedAt ?? null,
    },
  }
}

export default function MapDashboard({ darkMode, onToggleDark }: Props) {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [showSelectedRoute, setShowSelectedRoute] = useState(false)
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>(initialVehicles)
  const [addVehicleOpen, setAddVehicleOpen] = useState(false)
  const [vehiclesPanelOpen, setVehiclesPanelOpen] = useState(true)
  const [vehiclesPanelCompact, setVehiclesPanelCompact] = useState(false)
  const [mapLegend, setMapLegend] = useState<MapLegendConfig>(readMapLegendConfig)
  const [rightCards, setRightCards] = useState<RightCard[]>([])
  const [filter, setFilter] = useState<FleetFilter>(defaultFilter)
  const [fleetDrawerHeight, setFleetDrawerHeight] = useState(0)

  useEffect(() => saveMapLegendConfig(mapLegend), [mapLegend])

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
    }
  }, [])

  const leftPanelOpen = vehiclesPanelOpen
  const leftPanelOffset = vehiclesPanelOpen ? vehiclesPanelCompact ? 318 : 548 : 0
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
          mapLegend={mapLegend}
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

        <TopBar
          darkMode={darkMode}
          onToggleDark={onToggleDark}
          vehicles={allVehicles}
          onVehicleSelect={handleVehicleSelect}
          onOpenFilter={openFilterCard}
          filterActive={filterCardOpen}
          hideFleetControls={leftPanelOpen}
          hideRightControls={Boolean(selectedVehicle)}
          mapLegend={mapLegend}
          onMapLegendChange={setMapLegend}
        />

        <FABStack
          vehiclesPanelOpen={vehiclesPanelOpen}
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
              const previous = allVehicles.find(vehicle => vehicle.id === updated.id)
              const merged = retainLastTelemetryTimes(updated, previous)
              setAllVehicles(current => current.map(vehicle => vehicle.id === merged.id ? merged : vehicle))
              setSelectedVehicle(merged)
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
