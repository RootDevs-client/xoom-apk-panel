import {
  makeWASocket,
  DisconnectReason,
  fetchLatestBaileysVersion,
  Browsers,
  isJidBroadcast,
  isJidStatusBroadcast,
  proto,
} from "@whiskeysockets/baileys";

import QRCode from "qrcode";
import { WhatsAppSession } from "@/model/WhatsAppSession";
import { WhatsAppMessage } from "@/model/WhatsAppMessage";
import { BaileysConversation } from "@/model/BaileysConversation";
import { useMongoDBAuthState } from "./MongoAuthState";
import { emitToSession, broadcast } from "./socket-server";
import pino from "pino";

const logger = pino({
  level: "error",
  transport: {
    target: "pino-pretty",
    options: { colorize: true },
  },
});

export class BaileysSessionHandler {
  private sessionId: string;
  private sock: ReturnType<typeof makeWASocket> | null = null;
  private qrTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private isActive: boolean = false;
  private qrRetries: number = 0;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
  }

  get isConnected(): boolean {
    return this.sock?.user !== undefined;
  }

  async start() {
    this.isActive = true;
    await this.createConnection();
  }

  async stop() {
    this.isActive = false;
    this.clearTimers();
    if (this.sock) {
      this.sock.end(undefined);
      this.sock = null;
    }
    await WhatsAppSession.findByIdAndUpdate(this.sessionId, {
      $set: { connectionStatus: "disconnected" },
    });
    emitToSession(this.sessionId, "baileys:disconnected", {
      sessionId: this.sessionId,
      reason: "manual",
    });
  }

  async restart() {
    await this.stop();
    if (this.isActive) {
      await this.start();
    }
  }

  async sendMessage(remoteJid: string, content: string) {
    if (!this.sock) {
      throw new Error("Socket not connected");
    }
    const result = await this.sock.sendMessage(remoteJid, {
      text: content,
    });
    return result;
  }

  private clearTimers() {
    if (this.qrTimer) {
      clearInterval(this.qrTimer);
      this.qrTimer = null;
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private async createConnection() {
    try {
      this.clearTimers();

      const { state, saveCreds } = await useMongoDBAuthState(this.sessionId);
      const { version } = await fetchLatestBaileysVersion();

      logger.info(`[Baileys] Starting session ${this.sessionId} with version ${version}`);

      console.log(`[Baileys] Creating WA socket for session ${this.sessionId}`);

      this.sock = makeWASocket({
        version,
        browser: Browsers.windows("Chrome"),
        auth: state,
        logger,
        printQRInTerminal: false,
        generateHighQualityLinkPreview: true,
        syncFullHistory: false,
        markOnlineOnConnect: true,
      });

      this.sock.ev.on("creds.update", async () => {
        await saveCreds();
      });

      this.sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect, qr } = update;
        console.log(`[Baileys] Session ${this.sessionId} connection.update:`, { hasQR: !!qr, connection });

        if (qr) {
          this.qrRetries++;
          await WhatsAppSession.findByIdAndUpdate(this.sessionId, {
            $set: {
              connectionStatus: "qr",
              qrCodeRetries: this.qrRetries,
            },
          });

          const qrBase64 = await QRCode.toDataURL(qr);
          console.log(`[Baileys] QR generated for session ${this.sessionId}, emitting via socket`);
          emitToSession(this.sessionId, "baileys:qr", {
            sessionId: this.sessionId,
            qrCode: qrBase64,
          });
          broadcast("baileys:qr", {
            sessionId: this.sessionId,
            qrCode: qrBase64,
          });
        }

        if (connection === "connecting") {
          await WhatsAppSession.findByIdAndUpdate(this.sessionId, {
            $set: { connectionStatus: "connecting" },
          });
          emitToSession(this.sessionId, "baileys:connecting", {
            sessionId: this.sessionId,
          });
        }

        if (connection === "open") {
          this.qrRetries = 0;
          const user = this.sock?.user;
          if (user) {
            const phoneNumber = user.id?.split(":")[0] || "";
            const displayName = user.name || user.verifiedName || phoneNumber;

            let profilePicUrl: string | undefined;
            try {
              const ppUrl = await this.sock?.profilePictureUrl(user.id);
              if (ppUrl) profilePicUrl = ppUrl;
            } catch {}

            await WhatsAppSession.findByIdAndUpdate(this.sessionId, {
              $set: {
                connectionStatus: "connected",
                phoneNumber,
                waDisplayName: displayName,
                profilePicUrl: profilePicUrl || null,
                baileysJid: user.id,
                lastConnectedAt: new Date(),
                errorMessage: null,
              },
            });

            emitToSession(this.sessionId, "baileys:connected", {
              sessionId: this.sessionId,
              phoneNumber,
              displayName,
              profilePicUrl,
            });
          }
        }

        if (connection === "close") {
          const error = lastDisconnect?.error as any;
          const statusCode = error?.output?.statusCode ?? error?.statusCode;
          const reason = DisconnectReason[statusCode] || "unknown";

          if (statusCode === DisconnectReason.loggedOut) {
            await WhatsAppSession.findByIdAndUpdate(this.sessionId, {
              $set: {
                connectionStatus: "loggedOut",
                authCreds: null,
                authKeys: null,
              },
            });
            emitToSession(this.sessionId, "baileys:loggedOut", {
              sessionId: this.sessionId,
            });
            this.isActive = false;
            return;
          }

          if (statusCode === DisconnectReason.restartRequired) {
            await WhatsAppSession.findByIdAndUpdate(this.sessionId, {
              $set: { connectionStatus: "reconnecting" },
            });
            emitToSession(this.sessionId, "baileys:reconnecting", {
              sessionId: this.sessionId,
            });
            if (this.isActive) {
              await this.createConnection();
            }
            return;
          }

          await WhatsAppSession.findByIdAndUpdate(this.sessionId, {
            $set: {
              connectionStatus: "disconnected",
              errorMessage: reason,
            },
          });
          emitToSession(this.sessionId, "baileys:disconnected", {
            sessionId: this.sessionId,
            reason,
          });

          if (this.isActive) {
            const delay = Math.min(5000 * Math.pow(1.5, this.qrRetries), 60000);
            this.reconnectTimer = setTimeout(() => {
              if (this.isActive) {
                this.createConnection();
              }
            }, delay);
          }
        }
      });

      this.sock.ev.on("messages.upsert", async (msgEvent) => {
        for (const msg of msgEvent.messages) {
          await this.handleIncomingMessage(msg);
        }
      });

      this.sock.ev.on("messages.update", async (updates) => {
        for (const update of updates) {
          await this.handleMessageUpdate(update);
        }
      });
    } catch (error: any) {
      logger.error(`[Baileys] Error creating connection: ${error.message}`);
      await WhatsAppSession.findByIdAndUpdate(this.sessionId, {
        $set: {
          connectionStatus: "error",
          errorMessage: error.message,
        },
      });
      emitToSession(this.sessionId, "baileys:error", {
        sessionId: this.sessionId,
        error: error.message,
      });

      if (this.isActive) {
        this.reconnectTimer = setTimeout(() => {
          if (this.isActive) {
            this.createConnection();
          }
        }, 10000);
      }
    }
  }

  private async handleIncomingMessage(msg: proto.IWebMessageInfo) {
    try {
      const key = msg.key;
      if (!key || !key.remoteJid) return;

      if (isJidBroadcast(key.remoteJid)) return;
      if (isJidStatusBroadcast(key.remoteJid)) return;

      const remoteJid = key.remoteJid;
      const keyId = key.id;
      if (!keyId) return;

      const fromMe = key.fromMe || false;
      const pushName = msg.pushName || "";
      const message = msg.message;
      if (!message) return;

      const messageType = Object.keys(message)[0] || "unknown";
      const body = message.conversation ||
        message.extendedTextMessage?.text ||
        "";

      const timestamp = msg.messageTimestamp
        ? new Date(Number(msg.messageTimestamp) * 1000)
        : new Date();

      const existing = await WhatsAppMessage.findOne({
        session: this.sessionId,
        keyId,
      });
      if (existing) return;

      let conversation = await BaileysConversation.findOne({
        session: this.sessionId,
        remoteJid,
      });

      if (!conversation) {
        const contactName = fromMe ? "You" : pushName || remoteJid.split("@")[0];
        conversation = await BaileysConversation.create({
          session: this.sessionId,
          remoteJid,
          contactName,
          contactPhone: remoteJid.split("@")[0],
          lastMessage: {
            body,
            type: messageType,
            timestamp,
            fromMe,
          },
          unreadCount: fromMe ? 0 : 1,
          lastMessageAt: timestamp,
        });
      } else {
        conversation.lastMessage = {
          body,
          type: messageType,
          timestamp,
          fromMe,
        };
        if (!fromMe) {
          conversation.unreadCount += 1;
        }
        conversation.lastMessageAt = timestamp;
        await conversation.save();
      }

      const savedMessage = await WhatsAppMessage.create({
        session: this.sessionId,
        conversation: conversation._id,
        remoteJid,
        keyId,
        fromMe,
        pushName,
        body,
        type: messageType,
        status: fromMe ? "sent" : "delivered",
        timestamp,
      });

      emitToSession(this.sessionId, "baileys:message:new", {
        sessionId: this.sessionId,
        conversationId: conversation._id.toString(),
        message: savedMessage.toObject() as unknown as Record<string, unknown>,
      });

      emitToSession(this.sessionId, "baileys:conversation:update", {
        sessionId: this.sessionId,
        conversation: conversation.toObject() as unknown as Record<string, unknown>,
      });
    } catch (error: any) {
      logger.error(`[Baileys] Error handling message: ${error.message}`);
    }
  }

  private async handleMessageUpdate(update: proto.IWebMessageInfo) {
    try {
      const key = update.key;
      if (!key || !key.id) return;

      const status = update.status;
      if (status !== null && status !== undefined) {
        const statusMap: Record<number, string> = {
          0: "pending",
          1: "sent",
          2: "delivered",
          3: "read",
          4: "failed",
        };
        const statusStr = statusMap[status] || "unknown";

        await WhatsAppMessage.findOneAndUpdate(
          { session: this.sessionId, keyId: key.id },
          { $set: { status: statusStr } }
        );

        emitToSession(this.sessionId, "baileys:message:status", {
          messageId: key.id,
          status: statusStr,
        });
      }
    } catch (error: any) {
      logger.error(`[Baileys] Error updating message status: ${error.message}`);
    }
  }
}
