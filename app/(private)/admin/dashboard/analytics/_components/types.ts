export interface AnalyticsOverview {
  total: number;
  active: number;
  inactive: number;
}

export interface DailyTrendItem {
  count: number;
  date: string;
}

export interface PlatformBreakdownItem {
  count: number;
  platform: string;
}

export interface LocationBreakdownItem {
  count: number;
  country: string;
}

export interface AnalyticsData {
  overview: AnalyticsOverview;
  dailyTrend: DailyTrendItem[];
  platformBreakdown: PlatformBreakdownItem[];
  locationBreakdown: LocationBreakdownItem[];
}

export interface EventAnalyticsItem {
  total: number;
  event: string;
}

export interface DeviceModelItem {
  total: number;
  model: string;
}

export interface UninstallAnalyticsData {
  downloads: number;
  deleted: number;
  uninstallRate: number;
}

export interface DashboardAnalyticsData {
  totalDevices: number;
  activeDevices: number;
  inactiveDevices: number;
  deletedDevices: number;
  todayDownloads: number;
  yesterdayDownloads: number;
  last7DaysDownloads: number;
  last30DaysDownloads: number;
  androidDevices: number;
  iosDevices: number;
  liveUsers: number;
  totalPinRequests: number;
  totalPinReceived: number;
  conversionRate: number;
  averageDailyDownloads: number;
}
