"use client";

import { getTopicList } from "@/actions/topic/topicActions";
import { DataTableWithPagination } from "@/components/custom/data-table/DataTableWithPagination";
import { Card, CardContent } from "@/components/ui/card";
import { useTableState } from "@/store/useTableStore";
import { useEffect, useState } from "react";
import { columns } from "./columns";
import TopicToolbar from "./TopicToolbar";

export default function TopicLists() {
  const tableId = "topics";
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const { refresh, page, limit, search } = useTableState(tableId);

  const fetchTopicList = async () => {
    try {
      setIsLoading(true);

      const result = await getTopicList(page, limit, search);

      if (result?.status) {
        setData(result.data.topics || []);
        setTotal(result.data.pagination?.total || 0);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTopicList();
  }, [refresh, page, limit, search]);

  return (
    <div className="flex flex-col gap-6">
      <TopicToolbar tableId={tableId} onSuccess={fetchTopicList} />
      <Card>
        <CardContent>
          <DataTableWithPagination
            data={data}
            columns={columns({ onSuccess: fetchTopicList })}
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
