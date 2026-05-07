"use client";

import { getSubscribeList } from "@/actions/subscribe/subscribeActions";
import { DataTableWithPagination } from "@/components/custom/data-table/DataTableWithPagination";
import { Card, CardContent } from "@/components/ui/card";
import { useTableState } from "@/store/useTableStore";
import { useEffect, useState } from "react";
import { columns } from "./columns";
import SubscribeToolbar from "./SubscribeToolbar";

export default function SubscribeLists() {
  const tableId = "subscribe";
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const { refresh, handleRefresh, search, filters, page, limit } =
    useTableState(tableId);

  const fetchSubscribeList = async () => {
    try {
      setIsLoading(true);

      const result = await getSubscribeList(page, limit, search);

      if (result?.data) {
        setData(result.data.docs || []);
        setTotal(result.data.totalDocs || 0);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribeList();
  }, [refresh, page, limit, search]);
  return (
    <div className="flex flex-col gap-6">
      <SubscribeToolbar tableId={tableId} />
      <Card>
        <CardContent>
          <DataTableWithPagination
            data={data}
            columns={columns}
            total={total}
            tableId={tableId}
            isLoading={isLoading}
            // onSortEnd={handleDataChange}
            pagination={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}
