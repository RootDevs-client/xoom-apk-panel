import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import moment from "moment-timezone";
import { PlatformBadge, StatusBadge } from "./columns";
import { formatEventLabel, type Device } from "./device.utils";

const formatDate = (date?: string) => {
  if (!date) return "—";
  return moment(date).tz("Asia/Dhaka").format("DD MMM YYYY, HH:mm:ss");
};

const timeAgo = (date?: string) => {
  if (!date) return "—";
  return moment(date).tz("Asia/Dhaka").fromNow();
};

function Field({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
        {label}
      </span>
      <span className={`text-sm ${mono ? "font-mono" : ""}`}>
        {value ?? "—"}
      </span>
    </div>
  );
}

export default function DeviceInfoCard({ device }: { device: Device }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Device</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <Field label="Device Name" value={device.deviceName || "—"} />
          <Field label="Model" value={device.deviceModel || "—"} />
          <Field label="Manufacturer" value={device.manufacturer || "—"} />
          <Field label="Device ID" value={device.deviceId || "—"} mono />
          <Field
            label="Platform"
            value={<PlatformBadge platform={device.platform} />}
          />
          <Field
            label="OS"
            value={`${device.osName || "—"} ${device.osVersion || ""}`.trim()}
          />
          <Field label="App Version" value={device.appVersion || "—"} />
          <Field
            label="Mobile Number"
            value={device.mobileNumber || "—"}
            mono
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lifecycle</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Status"
            value={<StatusBadge status={device.lifecycleStatus} />}
          />
          <Field
            label="Last Event"
            value={formatEventLabel(device.lastEvent)}
          />
          <Field
            label="Last Heartbeat Check"
            value={
              <span className="flex flex-col">
                <span>{timeAgo(device.lastHeartbeatCheckAt)}</span>
                <span className="text-xs text-muted-foreground/60">
                  {formatDate(device.lastHeartbeatCheckAt)}
                </span>
              </span>
            }
          />
          <Field
            label="Last Successful Heartbeat"
            value={
              <span className="flex flex-col">
                <span>{timeAgo(device.lastSuccessfulHeartbeatAt)}</span>
                <span className="text-xs text-muted-foreground/60">
                  {formatDate(device.lastSuccessfulHeartbeatAt)}
                </span>
              </span>
            }
          />
          <div className="sm:col-span-2">
            <Separator />
          </div>
          <Field label="Registered At" value={formatDate(device.createdAt)} />
          <Field label="Updated At" value={formatDate(device.updatedAt)} />
          <Field label="Total Events" value={device.statusLogs?.length ?? 0} />
        </CardContent>
      </Card>
    </div>
  );
}
