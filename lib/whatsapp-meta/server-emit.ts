import { io, Socket } from "socket.io-client";

let client: Socket | null = null;

function getClient(): Socket {
  if (!client) {
    const url = process.env.META_SOCKET_URL || "http://localhost:3002";
    client = io(url, {
      autoConnect: true,
      transports: ["websocket", "polling"],
    });
    client.on("connect", () => {
      console.log("[Meta-WA] Emitter connected to socket server");
    });
    client.on("connect_error", (err) => {
      console.error("[Meta-WA] Emitter connection error:", err.message);
    });
  }
  return client;
}

export function emitToChannel(
  channelId: string,
  event: string,
  data: any,
) {
  try {
    const c = getClient();
    c.emit("server:emit", { channelId, event, data });
  } catch (err) {
    console.error("[Meta-WA] Failed to emit:", err);
  }
}
