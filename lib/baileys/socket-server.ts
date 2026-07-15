import { Server as HTTPServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import type { ServerToClientEvents, ClientToServerEvents } from "./types";

let io: SocketIOServer<ClientToServerEvents, ServerToClientEvents> | null = null;

export function getIO(): SocketIOServer<ClientToServerEvents, ServerToClientEvents> | null {
  return io;
}

export function createSocketServer(port: number = 3001) {
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
    socket.on("join:session", ({ sessionId }) => {
      socket.join(`session:${sessionId}`);
    });

    socket.on("leave:session", ({ sessionId }) => {
      socket.leave(`session:${sessionId}`);
    });
  });

  httpServer.listen(port, () => {
    console.log(`[Baileys] Socket.IO server listening on port ${port}`);
  });

  return io;
}

export function emitToSession(
  sessionId: string,
  event: keyof ServerToClientEvents,
  ...args: Parameters<ServerToClientEvents[keyof ServerToClientEvents]>
) {
  if (!io) return;
  io.to(`session:${sessionId}`).emit(event as any, ...(args as any));
}

export function broadcast(
  event: keyof ServerToClientEvents,
  ...args: Parameters<ServerToClientEvents[keyof ServerToClientEvents]>
) {
  if (!io) return;
  io.emit(event as any, ...(args as any));
}
