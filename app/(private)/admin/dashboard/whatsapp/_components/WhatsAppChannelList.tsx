"use client";

import { getWhatsAppChannelList } from "@/actions/whatsapp/whatsappActions";
import { ToastMessage } from "@/components/custom/ToastMessage";
import { DataTableWithPagination } from "@/components/custom/data-table/DataTableWithPagination";
import { Card, CardContent } from "@/components/ui/card";
import { connectSocket } from "@/lib/socket-client";
import { useTableState } from "@/store/useTableStore";
import { useEffect, useState } from "react";
import { channelColumns, type WhatsAppChannel } from "./channelColumns";

export default function WhatsAppChannelList() {
  const tableId = "whatsapp-channels";
  const [data, setData] = useState<WhatsAppChannel[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const { refresh, page, limit, search } = useTableState(tableId);

  const fetchChannels = async () => {
    try {
      setIsLoading(true);
      const result = await getWhatsAppChannelList(page, limit, search);
      console.log("resulyhhhhh", result);
      if (result?.status) {
        setData(result.data || []);
        setTotal(result.pagination?.totalDocs || result.totalDocs || 0);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChannels();
  }, [refresh, page, limit, search]);

  useEffect(() => {
    const socket = connectSocket();

    const onNewMessage = (data: {
      channelId: string;
      jid: string;
      message: { body: string; from: string; timestamp: string };
    }) => {
      console.log("[SOCKET] whatsapp:new-message", data);
      setData((prev) =>
        prev.map((ch) =>
          ch._id === data.channelId
            ? {
                ...ch,
                lastMessageAt:
                  data.message.timestamp || new Date().toISOString(),
                lastMessageId:
                  data.message.body?.slice(0, 32) || ch.lastMessageId,
              }
            : ch,
        ),
      );
      ToastMessage.info({
        title: `New message on ${data.jid}`,
        description: data.message.body?.slice(0, 80),
      });
    };

    socket.on("whatsapp:new-message", onNewMessage);

    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      socket.off("whatsapp:new-message", onNewMessage);
    };
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent className="pt-6">
          <DataTableWithPagination
            data={data}
            columns={channelColumns}
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
