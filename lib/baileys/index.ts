import fs from "fs";
import path from "path";

const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const eqIndex = trimmed.indexOf("=");
      if (eqIndex > 0) {
        const key = trimmed.slice(0, eqIndex).trim();
        let value = trimmed.slice(eqIndex + 1).trim();
        if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  }
}

async function main() {
  const { default: dbConnect } = await import("@/config/database");
  const { BaileysServiceManager } = await import("./BaileysServiceManager");
  const { createSocketServer } = await import("./socket-server");

  const SOCKET_PORT = parseInt(process.env.BAILEYS_SOCKET_PORT || "3001", 10);

  try {
    await dbConnect();
    console.log("[Baileys] Connected to MongoDB");

    createSocketServer(SOCKET_PORT);

    const manager = new BaileysServiceManager();
    await manager.start();

    process.on("SIGINT", async () => {
      console.log("[Baileys] Shutting down...");
      await manager.stop();
      process.exit(0);
    });

    process.on("SIGTERM", async () => {
      console.log("[Baileys] Shutting down...");
      await manager.stop();
      process.exit(0);
    });

    console.log("[Baileys] Service started successfully");
  } catch (error: any) {
    console.error("[Baileys] Failed to start service:", error.message);
    process.exit(1);
  }
}

main();
