export interface FleetGroup {
  id: string
  name: string
  /** Null identifies a top-level group; otherwise this group is nested below its parent. */
  parentId: string | null
}

/** Local demo hierarchy; newly created groups are kept in MapDashboard state. */
export const initialFleetGroups: FleetGroup[] = [
  { id: 'riyadh', name: 'Riyadh', parentId: null },
  { id: 'riyadh-north', name: 'North Riyadh', parentId: 'riyadh' },
  { id: 'riyadh-south', name: 'South Riyadh', parentId: 'riyadh' },
  { id: 'riyadh-east', name: 'East Riyadh', parentId: 'riyadh' },
  { id: 'riyadh-west', name: 'West Riyadh', parentId: 'riyadh' },
  { id: 'riyadh-central', name: 'Central Riyadh', parentId: 'riyadh' },
]

export interface FleetDriver {
  id: string
  name: string
  phone?: string
}
