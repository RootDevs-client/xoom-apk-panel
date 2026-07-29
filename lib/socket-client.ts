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
  if (userId) {
    s.auth = { userId };
  }
  currentUrl = url;
  return s;
}

export function getSocket(urlOverride?: string): Socket {
  const defaultUrl =
    process.env.NEXT_PUBLIC_SOCKET_URL || "http://192.168.66.66:8000/admin";
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

// Named callbacks so we can remove only our own handlers without nuking other components'
let _onConnect: (() => void) | null = null;
let _onDisconnect: (() => void) | null = null;
let _onConnectError: ((err: Error) => void) | null = null;
let _onWhatsAppNewMessage: ((data: any) => void) | null = null;

export function initSocket(userId?: string, token?: string) {
  const socket = connectSocket(userId, token);

  // Remove only our own previously registered handlers
  if (_onConnect) socket.off("connect", _onConnect);
  if (_onDisconnect) socket.off("disconnect", _onDisconnect);
  if (_onConnectError) socket.off("connect_error", _onConnectError);
  if (_onWhatsAppNewMessage)
    socket.off("whatsapp:new-message", _onWhatsAppNewMessage);

  _onConnect = () => console.log("[Socket] Connected");
  _onDisconnect = () => console.log("[Socket] Disconnected");
  _onConnectError = (err: Error) =>
    console.error("[Socket] Connection error", err.message);
  _onWhatsAppNewMessage = (data: any) => {
    console.log("[Socket] whatsapp:new-message", data);
  };

  socket.on("connect", _onConnect);
  socket.on("disconnect", _onDisconnect);
  socket.on("connect_error", _onConnectError);
  socket.on("whatsapp:new-message", _onWhatsAppNewMessage);

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
