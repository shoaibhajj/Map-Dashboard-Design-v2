import React from 'react'
import TopBar from './TopBar'
import VehiclesPage from './VehiclesPage'
import Sidebar from './Sidebar'

function VehiclesLayoutPage() {
  return (
     <div className="flex h-screen overflow-hidden bg-[var(--background)] text-[var(--foreground)]" dir="rtl">
      {/* Sidebar — RTL first = visually on the RIGHT */}
      <Sidebar/>

      {/* Main content column */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopBar/>
        <VehiclesPage/>
      </div>
    </div>
  )
}

export default VehiclesLayoutPage