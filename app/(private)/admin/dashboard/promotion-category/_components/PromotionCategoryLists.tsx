"use client";

import { getPromotionList } from "@/actions/promotion/promotionActions";
import { DataTableWithPagination } from "@/components/custom/data-table/DataTableWithPagination";
import { Card, CardContent } from "@/components/ui/card";
import { useTableState } from "@/store/useTableStore";
import { useEffect, useState } from "react";
import { columns } from "./columns";
import PromotionCategoryToolbar from "./PromotionCategoryToolbar";

export default function PromotionCategoryLists() {
  const tableId = "promotion-category";
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const { refresh, page, limit, search } = useTableState(tableId);

  const fetchList = async () => {
    try {
      setIsLoading(true);

      const result = await getPromotionList(page, limit, search);

      if (result?.status) {
        setData(result.data || []);
        setTotal(result.pagination?.totalDocs || result.pagination?.total || 0);
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
      <PromotionCategoryToolbar tableId={tableId} onSuccess={fetchList} />
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
