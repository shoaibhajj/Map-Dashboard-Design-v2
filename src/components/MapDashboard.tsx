import { useCallback, useEffect, useState } from 'react'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import MapCanvas from './MapCanvas'
import FABStack from './FABStack'
import RightCardStack from './RightCardStack'
import VehicleListPanel from './VehicleListPanel'
import AddVehicleModal from './AddVehicleModal'
import AddGroupModal from './AddGroupModal'
import AddDriverModal from './AddDriverModal'
import FloatingVehicleDetails from './FloatingVehicleDetails'
import BottomSheet from './BottomSheet'
import { Vehicle, vehicles as initialVehicles } from '../data/vehicles'
import { FleetDriver, FleetGroup, initialFleetGroups } from '../data/fleetEntities'
import { RightCard, FABType, FleetFilter, defaultFilter } from '../types'
import { readMapLegendConfig, saveMapLegendConfig, type MapLegendConfig } from '../utils/mapLegend'
import { matchesGroupFilter } from '../utils/fleetGroups'

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
  const [addModal, setAddModal] = useState<'vehicle' | 'group' | 'driver' | null>(null)
  const [fleetGroups, setFleetGroups] = useState<FleetGroup[]>(initialFleetGroups)
  const [, setFleetDrivers] = useState<FleetDriver[]>([])
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

  const panelInlineOffset = vehiclesPanelOpen ? vehiclesPanelCompact ? 318 : 548 : 0
  const filterCardOpen = rightCards.some(card => card.type === 'filter')
  const mapVehicles = allVehicles.filter(vehicle => matchesGroupFilter(vehicle.groupId, filter.groupIds, fleetGroups))

  return (
    <div style={{ display: 'flex', height: '100%', width: '100%', overflow: 'hidden', background: 'var(--background)' }}>
      <Sidebar activeRoute="map" />

      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <MapCanvas
          vehicles={mapVehicles}
          selectedVehicle={selectedVehicle}
          showSelectedRoute={showSelectedRoute}
          onVehicleSelect={handleVehicleSelect}
          onMapClick={handleMapClick}
          darkMode={darkMode}
          panelInlineOffset={panelInlineOffset}
          mapLegend={mapLegend}
        />

        {vehiclesPanelOpen && (
          <div className={`static-fleet-sidebar${vehiclesPanelCompact ? ' is-compact' : ''}`}>
            <VehicleListPanel
              vehicles={allVehicles}
              groups={fleetGroups}
              filter={filter}
              onFilterChange={setFilter}
              onVehicleSelect={handleVehicleSelect}
              onAddVehicle={() => setAddModal('vehicle')}
              onAddGroup={() => setAddModal('group')}
              onAddDriver={() => setAddModal('driver')}
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
          hideFleetControls={vehiclesPanelOpen}
          hideRightControls={Boolean(selectedVehicle)}
          mapLegend={mapLegend}
          onMapLegendChange={setMapLegend}
        />

        <FABStack
          vehiclesPanelOpen={vehiclesPanelOpen}
          panelInlineOffset={panelInlineOffset}
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
            groups={fleetGroups}
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

        <BottomSheet vehicles={allVehicles} selectedVehicle={selectedVehicle} height={fleetDrawerHeight} onHeightChange={setFleetDrawerHeight} onVehicleSelect={handleVehicleSelect} />
      </div>

      {addModal === 'vehicle' && (
        <AddVehicleModal
          groups={fleetGroups}
          onClose={() => setAddModal(null)}
          onAdd={vehicle => {
            setAllVehicles(current => [vehicle, ...current])
            setAddModal(null)
          }}
        />
      )}
      {addModal === 'group' && <AddGroupModal groups={fleetGroups} onClose={() => setAddModal(null)} onAdd={group => {
        setFleetGroups(current => [...current, group])
        setAddModal(null)
      }} />}
      {addModal === 'driver' && <AddDriverModal onClose={() => setAddModal(null)} onAdd={driver => {
        setFleetDrivers(current => [...current, driver])
        setAddModal(null)
      }} />}
    </div>
  )
}
