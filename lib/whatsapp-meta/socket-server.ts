import { Server as HTTPServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import type { ServerToClientEvents, ClientToServerEvents } from "./types";

let io: SocketIOServer<ClientToServerEvents, ServerToClientEvents> | null = null;

export function getIO(): SocketIOServer<ClientToServerEvents, ServerToClientEvents> | null {
  return io;
}

export function createSocketServer(port: number = 3002) {
  const httpServer = new HTTPServer();

  io = new SocketIOServer<
    ClientToServerEvents,
    ServerToClientEvents
  >(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    socket.on("join:channel", ({ channelId }) => {
      socket.join(`meta:channel:${channelId}`);
    });

    socket.on("leave:channel", ({ channelId }) => {
      socket.leave(`meta:channel:${channelId}`);
    });

    socket.on("server:emit", ({ channelId, event, data }: { channelId: string; event: string; data: any }) => {
      io?.to(`meta:channel:${channelId}`).emit(event as any, data);
    });
  });

  httpServer.listen(port, () => {
    console.log(`[Meta-WA] Socket.IO server listening on port ${port}`);
  });

  return io;
}

export function emitToChannel(
  channelId: string,
  event: keyof ServerToClientEvents,
  ...args: Parameters<ServerToClientEvents[keyof ServerToClientEvents]>
) {
  if (!io) return;
  io.to(`meta:channel:${channelId}`).emit(event as any, ...(args as any));
}

export function broadcast(
  event: keyof ServerToClientEvents,
  ...args: Parameters<ServerToClientEvents[keyof ServerToClientEvents]>
) {
  if (!io) return;
  io.emit(event as any, ...(args as any));
}
