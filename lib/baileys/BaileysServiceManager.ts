import { WhatsAppSession } from "@/model/WhatsAppSession";
import { BaileysSessionHandler } from "./BaileysSessionHandler";

const POLL_INTERVAL = 5000;

export class BaileysServiceManager {
  private handlers: Map<string, BaileysSessionHandler> = new Map();
  private pollTimer: ReturnType<typeof setInterval> | null = null;
  private knownSessionIds: Set<string> = new Set();

  async start() {
    await this.loadExistingSessions();
    this.startPolling();
  }

  async stop() {
    this.stopPolling();
    for (const [id, handler] of this.handlers) {
      await handler.stop();
    }
    this.handlers.clear();
    this.knownSessionIds.clear();
  }

  async restartSession(sessionId: string) {
    const handler = this.handlers.get(sessionId);
    if (handler) {
      await handler.restart();
    }
  }

  async stopSession(sessionId: string) {
    const handler = this.handlers.get(sessionId);
    if (handler) {
      await handler.stop();
      this.handlers.delete(sessionId);
      this.knownSessionIds.delete(sessionId);
    }
  }

  async sendMessage(
    sessionId: string,
    remoteJid: string,
    content: string,
    media?: { type: string; url: string; fileName?: string; caption?: string },
  ) {
    const handler = this.handlers.get(sessionId);
    if (!handler) {
      throw new Error("Session not found or not running");
    }
    return handler.sendMessage(remoteJid, content, media);
  }

  private async loadExistingSessions() {
    const sessions = await WhatsAppSession.find({
      connectionStatus: { $in: ["connected", "reconnecting", "qr", "connecting", "disconnected"] },
    });

    for (const session of sessions) {
      const id = session._id.toString();
      this.knownSessionIds.add(id);
      const handler = new BaileysSessionHandler(id);
      this.handlers.set(id, handler);
      await handler.start();
    }

    if (sessions.length > 0) {
      console.log(`[Baileys] Loaded ${sessions.length} existing session(s)`);
    }
  }

  private async pollForNewSessions() {
    try {
      const sessions = await WhatsAppSession.find(
        {
          _id: { $nin: Array.from(this.knownSessionIds) },
        },
        { _id: 1, name: 1, connectionStatus: 1 }
      );

      console.log(`[Baileys] Polling: found ${sessions.length} new session(s)`);
      for (const session of sessions) {
        const id = session._id.toString();
        console.log(`[Baileys] Starting new session: ${id} (${session.name}, status: ${session.connectionStatus})`);
        this.knownSessionIds.add(id);
        const handler = new BaileysSessionHandler(id);
        this.handlers.set(id, handler);
        await handler.start();
        console.log(`[Baileys] Auto-started new session: ${id}`);
      }

      const deletedIds: string[] = [];
      for (const [id, handler] of this.handlers) {
        const exists = await WhatsAppSession.findById(id).lean();
        if (!exists) {
          deletedIds.push(id);
          await handler.stop();
        }
      }
      for (const id of deletedIds) {
        this.handlers.delete(id);
        this.knownSessionIds.delete(id);
        console.log(`[Baileys] Cleaned up deleted session: ${id}`);
      }
    } catch (error: any) {
      console.error(`[Baileys] Poll error: ${error.message}`);
    }
  }

  private startPolling() {
    this.pollTimer = setInterval(() => {
      this.pollForNewSessions();
    }, POLL_INTERVAL);
  }

  private stopPolling() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }
}
