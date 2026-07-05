"use client";

import { getNewsList } from "@/actions/news/newsActions";
import { DataTableWithPagination } from "@/components/custom/data-table/DataTableWithPagination";
import { Card, CardContent } from "@/components/ui/card";
import { useTableState } from "@/store/useTableStore";
import { useEffect, useState } from "react";
import { columns } from "./columns";
import NewsToolbar from "./NewsToolbar";

export default function NewsList() {
  const tableId = "news";
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const { refresh, page, limit, search } = useTableState(tableId);

  const fetchNewsList = async () => {
    try {
      setIsLoading(true);

      const result = await getNewsList(page, limit, search);
      console.log("result", result);

      if (result?.status) {
        setData(result.data.news || []);
        setTotal(result.data.pagination?.total || 0);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNewsList();
  }, [refresh, page, limit, search]);

  return (
    <div className="flex flex-col gap-6">
      <NewsToolbar tableId={tableId} onSuccess={fetchNewsList} />
      <Card>
        <CardContent>
          <DataTableWithPagination
            data={data}
            columns={columns({ onSuccess: fetchNewsList })}
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
