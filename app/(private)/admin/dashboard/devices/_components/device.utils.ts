export type DeviceStatusLog = {
  _id?: string;
  event: string;
  createdAt: string;
};

export type Device = {
  _id: string;
  deviceId: string;
  appVersion: string;
  createdAt: string;
  deviceModel: string;
  deviceName: string;
  lastEvent: string;
  lastHeartbeatCheckAt: string;
  lastSuccessfulHeartbeatAt: string;
  lifecycleStatus: string;
  manufacturer: string;
  mobileNumber: string;
  osName: string;
  osVersion: string;
  platform: string;
  statusLogs?: DeviceStatusLog[];
  updatedAt: string;
};

export const formatEventLabel = (event?: string) =>
  event
    ? event.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "—";
