import { getDeviceById } from "@/actions/device/deviceActions";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DynamicBreadcrumb } from "../../settings/_components/DynamicBreadcrumb";
import type { Device } from "../_components/device.utils";
import DeviceEventList from "../_components/DeviceEventList";
import DeviceInfoCard from "../_components/DeviceInfoCard";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function DeviceDetailsPage({ params }: Props) {
  const { id } = await params;
  const res = await getDeviceById(id);

  if (!res?.status || !res?.data) {
    notFound();
  }

  const device = res.data as Device;

  const breadcrumbItems = [
    { label: "Dashboard", href: routes.privateRoutes.admin.dashboard },
    { label: "Devices", href: routes.privateRoutes.admin.devices },
    { label: device.deviceName || "Device Details" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-dm-sans font-medium text-lg">
            {device.deviceName || "Device Details"}
          </h2>
          <DynamicBreadcrumb items={breadcrumbItems} />
        </div>
        <Button asChild variant="outline" size="sm" className="w-fit">
          <Link href={routes.privateRoutes.admin.devices}>
            <ArrowLeft className="size-4" />
            Back to devices
          </Link>
        </Button>
      </div>

      <DeviceInfoCard device={device} />
      <DeviceEventList statusLogs={device.statusLogs} />
    </div>
  );
}
