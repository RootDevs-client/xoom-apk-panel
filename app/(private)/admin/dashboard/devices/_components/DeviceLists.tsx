"use client";

import { getDeviceList } from "@/actions/device/deviceActions";
import { DataTableWithPagination } from "@/components/custom/data-table/DataTableWithPagination";
import { Card, CardContent } from "@/components/ui/card";
import { useTableState } from "@/store/useTableStore";
import { useEffect, useState } from "react";
import { columns } from "./columns";
import DeviceToolbar from "./DeviceToolbar";

export default function DeviceLists() {
  const tableId = "devices";
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const { refresh, page, limit, search } = useTableState(tableId);

  const fetchDeviceList = async () => {
    try {
      setIsLoading(true);

      const result = await getDeviceList(page, limit, search);

      if (result?.status) {
        setData(result.data || []);
        setTotal(result.pagination?.totalDocs || 0);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeviceList();
  }, [refresh, page, limit, search]);

  return (
    <div className="flex flex-col gap-6">
      <DeviceToolbar tableId={tableId} />
      <Card>
        <CardContent>
          <DataTableWithPagination
            data={data}
            columns={columns}
            total={total}
            tableId={tableId}
            isLoading={isLoading}
            pagination={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}
