export type CampaignStatus = 'active' | 'scheduled' | 'completed' | 'paused'

export type CampaignImageType =
  | 'fleet'
  | 'tracking'
  | 'fuel'
  | 'security'
  | 'free-trial'

export interface Campaign {
  id: string
  name: string
  subtitle: string
  status: CampaignStatus
  imageType: CampaignImageType
  views: number          // raw number
  clicks: number         // raw number
  ctr: number            // percentage, e.g. 7.3
  date: string           // Arabic date string
  sparkline: number[]    // ~14 data points for details area chart
  budget: number         // SAR
  channel: string        // e.g. "جميع المنصات"
  viewsChange: number    // % change vs last period
  clicksChange: number
  ctrChange: number
}

export interface AdsKPI {
  id: string
  label: string
  value: string          // formatted display value
  rawValue: number
  change: string         // e.g. "+20% من الشهر الماضي"
  trendUp: boolean
  sparkline: number[]    // mini chart data
  icon: 'campaigns' | 'views' | 'clicks' | 'ctr'
}
