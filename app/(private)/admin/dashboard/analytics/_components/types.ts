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
