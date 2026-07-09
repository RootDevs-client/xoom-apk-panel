"use client";

import { getCategoryList } from "@/actions/category/categoryActions";
import { DataTableWithPagination } from "@/components/custom/data-table/DataTableWithPagination";
import { Card, CardContent } from "@/components/ui/card";
import { useTableState } from "@/store/useTableStore";
import { useEffect, useState } from "react";
import CategoryToolbar from "./CategoryToolbar";
import { columns } from "./columns";

export default function CategoryLists() {
  const tableId = "categories";
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const { refresh, page, limit, search } = useTableState(tableId);

  const fetchCategoryList = async () => {
    try {
      setIsLoading(true);

      const result = await getCategoryList(page, limit, search);

      if (result?.status) {
        setData(result.data.categories || []);
        setTotal(result.data.pagination?.total || 0);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoryList();
  }, [refresh, page, limit, search]);

  return (
    <div className="flex flex-col gap-6">
      <CategoryToolbar tableId={tableId} onSuccess={fetchCategoryList} />
      <Card>
        <CardContent>
          <DataTableWithPagination
            data={data}
            columns={columns({ onSuccess: fetchCategoryList })}
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
