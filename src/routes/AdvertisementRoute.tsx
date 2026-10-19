import DashboardSidebar from '../dashboard/components/DashboardSidebar'
import DashboardTopBar from '../dashboard/components/DashboardTopBar'
import AdsPage from '../advertisement/components/AdsPage'

export default function AdvertisementRoute() {
  return (
    <div className="flex h-screen overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
      <DashboardSidebar activeRoute="advertisements" />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <DashboardTopBar />
        <AdsPage />
      </div>
    </div>
  )
}
