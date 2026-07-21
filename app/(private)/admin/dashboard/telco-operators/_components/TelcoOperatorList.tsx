"use client";

import { getTelcoOperatorList } from "@/actions/telco-operator/telcoOperatorActions";
import { DataTableWithPagination } from "@/components/custom/data-table/DataTableWithPagination";
import { Card, CardContent } from "@/components/ui/card";
import { useTableState } from "@/store/useTableStore";
import { useEffect, useState } from "react";
import { columns } from "./columns";
import TelcoOperatorToolbar from "./TelcoOperatorToolbar";

export default function TelcoOperatorList() {
  const tableId = "telco-operators";
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const { refresh, page, limit, search } = useTableState(tableId);

  const fetchList = async () => {
    try {
      setIsLoading(true);

      const result = await getTelcoOperatorList(page, limit, search);

      if (result?.status) {
        setData(result.data.telcoOperators || []);
        setTotal(result.data.pagination?.total || 0);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [refresh, page, limit, search]);

  return (
    <div className="flex flex-col gap-6">
      <TelcoOperatorToolbar tableId={tableId} onSuccess={fetchList} />
      <Card>
        <CardContent>
          <DataTableWithPagination
            data={data}
            columns={columns({ onSuccess: fetchList })}
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
