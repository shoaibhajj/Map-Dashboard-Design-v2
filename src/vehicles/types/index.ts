export type VehicleStatus = 'moving' | 'stopped' | 'needs_attention'
export type VehicleType   = 'pickup' | 'sedan' | 'van' | 'suv'
export type SignalLevel   = 'قوية' | 'متوسطة' | 'ضعيفة'

export interface Driver {
  name: string
  initials: string
  color: string   // CSS color for avatar background
}

export interface Vehicle {
  id: string
  name: string
  plate: string
  type: VehicleType
  status: VehicleStatus
  driver: Driver
  lastSeen: string   // e.g. "منذ 3 دقائق"
  location: string   // e.g. "الرياض"
  fuel: number       // 0–100 percent
  speed: number      // km/h
  battery: number    // 0–100 percent
  signal: SignalLevel
  distance: number   // km today
  lastTrip: string   // e.g. "طريق الملك فهد"
}
