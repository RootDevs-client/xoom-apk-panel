import {
  AnalyticsData,
  DashboardAnalyticsData,
  DeviceModelItem,
  EventAnalyticsItem,
  UninstallAnalyticsData,
} from "./types";

// The backend omits keys it has no data for, so every numeric field can arrive
// as undefined/null even though the types declare it required. Normalising once
// at the container boundary keeps `.toLocaleString()` / `.toFixed()` safe in the
// leaf components.
export const num = (value: unknown): number => Number(value) || 0;

export function normalizeDashboardAnalytics(
  data?: Partial<DashboardAnalyticsData> | null,
): DashboardAnalyticsData {
  return {
    totalDevices: num(data?.totalDevices),
    activeDevices: num(data?.activeDevices),
    inactiveDevices: num(data?.inactiveDevices),
    deletedDevices: num(data?.deletedDevices),
    todayDownloads: num(data?.todayDownloads),
    yesterdayDownloads: num(data?.yesterdayDownloads),
    last7DaysDownloads: num(data?.last7DaysDownloads),
    last30DaysDownloads: num(data?.last30DaysDownloads),
    androidDevices: num(data?.androidDevices),
    iosDevices: num(data?.iosDevices),
    liveUsers: num(data?.liveUsers),
    totalPinRequests: num(data?.totalPinRequests),
    totalPinReceived: num(data?.totalPinReceived),
    conversionRate: num(data?.conversionRate),
    averageDailyDownloads: num(data?.averageDailyDownloads),
  };
}

export function normalizeUninstallAnalytics(
  data?: Partial<UninstallAnalyticsData> | null,
): UninstallAnalyticsData {
  return {
    downloads: num(data?.downloads),
    deleted: num(data?.deleted),
    uninstallRate: num(data?.uninstallRate),
  };
}

export function normalizeDeviceModels(
  items?: Partial<DeviceModelItem>[] | null,
): DeviceModelItem[] {
  return (items ?? []).map((item) => ({
    model: item?.model ?? "Unknown",
    total: num(item?.total),
  }));
}

export function normalizeAnalyticsData(
  data?: Partial<AnalyticsData> | null,
): AnalyticsData {
  return {
    overview: {
      total: num(data?.overview?.total),
      active: num(data?.overview?.active),
      inactive: num(data?.overview?.inactive),
    },
    dailyTrend: (data?.dailyTrend ?? []).map((item) => ({
      date: item?.date ?? "",
      count: num(item?.count),
    })),
    platformBreakdown: (data?.platformBreakdown ?? []).map((item) => ({
      platform: item?.platform ?? "Unknown",
      count: num(item?.count),
    })),
    locationBreakdown: (data?.locationBreakdown ?? []).map((item) => ({
      country: item?.country ?? "Unknown",
      count: num(item?.count),
    })),
  };
}

export function normalizeEventAnalytics(
  items?: Partial<EventAnalyticsItem>[] | null,
): EventAnalyticsItem[] {
  return (items ?? []).map((item) => ({
    event: item?.event ?? "Unknown",
    total: num(item?.total),
  }));
}
