"use client";

import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
let currentUrl: string | null = null;

function createSocket(url: string, userId?: string, token?: string): Socket {
  const s = io(url, {
    autoConnect: false,
    transports: ["websocket", "polling"],
    auth: { token },
  });
  console.log("s", s, url);
  if (userId) {
    s.auth = { userId };
  }
  currentUrl = url;
  return s;
}

export function getSocket(urlOverride?: string): Socket {
  const defaultUrl =
    process.env.NEXT_PUBLIC_SOCKET_URL || "http://192.168.66.66:8000";
  const url = urlOverride || defaultUrl;

  if (!socket || currentUrl !== url) {
    if (socket) {
      socket.disconnect();
    }
    socket = createSocket(url);
  }
  return socket;
}

export function connectSocket(userId?: string, token?: string) {
  const s = getSocket();

  console.log("connection-call");
  if (s.connected) return s;
  if (userId) {
    s.auth = { userId, token };
  }
  s.connect();
  return s;
}

export function initSocket(userId?: string, token?: string) {
  const socket = connectSocket(userId, token);

  socket.off("connect");
  socket.off("disconnect");
  socket.off("connect_error");

  socket.on("connect", () => console.log("[Socket] Connected"));
  socket.on("disconnect", () => console.log("[Socket] Disconnected"));
  socket.on("connect_error", (err) =>
    console.error("[Socket] Connection error", err.message),
  );

  return socket;
}

export function reconnectSocketToUrl(
  url: string,
  userId?: string,
  token?: string,
) {
  if (socket) {
    socket.disconnect();
  }
  socket = createSocket(url, userId, token);
  socket.connect();
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
