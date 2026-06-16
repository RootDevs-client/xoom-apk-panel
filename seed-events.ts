import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;
if (!MONGODB_URI) throw new Error("MONGODB_URI is not set");

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  const db = mongoose.connection.db!;
  const collection = db.collection("events");

  // Clear existing
  await collection.deleteMany({});
  console.log("Cleared existing events");

  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const deviceIds = ["d-001", "d-002", "d-003", "d-004", "d-005"];

  const docs: Record<string, any>[] = [];

  for (let d = 25; d >= 0; d--) {
    const date = new Date(now - d * day);
    const dayStr = date.toISOString().slice(0, 10);

    for (const deviceId of deviceIds) {
      // firstopen — once per device per day
      docs.push({
        deviceId,
        event: "firstopen",
        sessionId: `sess-${deviceId}-${dayStr}-1`,
        ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        country: ["US", "IN", "GB", "DE", "BR"][Math.floor(Math.random() * 5)],
        city: ["New York", "Mumbai", "London", "Berlin", "São Paulo"][Math.floor(Math.random() * 5)],
        os: ["android", "ios"][Math.floor(Math.random() * 2)],
        osVersion: ["14", "15", "13", "12"][Math.floor(Math.random() * 4)],
        deviceBrand: ["samsung", "apple", "xiaomi", "oneplus", "google"][Math.floor(Math.random() * 5)],
        deviceModel: ["Galaxy S24", "iPhone 16", "Mi 14", "Nord 4", "Pixel 9"][Math.floor(Math.random() * 5)],
        appVersion: "2.1.0",
        eventData: { referrer: "organic" },
        createdAt: date,
      });

      // appopen — 2-4 times per device per day
      const openCount = 2 + Math.floor(Math.random() * 3);
      for (let i = 0; i < openCount; i++) {
        docs.push({
          deviceId,
          event: "appopen",
          sessionId: `sess-${deviceId}-${dayStr}-${i + 2}`,
          ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          country: ["US", "IN", "GB", "DE", "BR"][Math.floor(Math.random() * 5)],
          city: ["New York", "Mumbai", "London", "Berlin", "São Paulo"][Math.floor(Math.random() * 5)],
          os: ["android", "ios"][Math.floor(Math.random() * 2)],
          osVersion: ["14", "15", "13", "12"][Math.floor(Math.random() * 4)],
          deviceBrand: ["samsung", "apple", "xiaomi", "oneplus", "google"][Math.floor(Math.random() * 5)],
          deviceModel: ["Galaxy S24", "iPhone 16", "Mi 14", "Nord 4", "Pixel 9"][Math.floor(Math.random() * 5)],
          appVersion: "2.1.0",
          eventData: { screen: ["home", "live", "scores"][Math.floor(Math.random() * 3)] },
          createdAt: new Date(date.getTime() + i * 60000),
        });
      }

      // appclose — roughly same as appopen count
      const closeCount = openCount - 1 + Math.floor(Math.random() * 2);
      for (let i = 0; i < closeCount; i++) {
        docs.push({
          deviceId,
          event: "appclose",
          sessionId: `sess-${deviceId}-${dayStr}-${i + 2}`,
          ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          country: ["US", "IN", "GB", "DE", "BR"][Math.floor(Math.random() * 5)],
          city: ["New York", "Mumbai", "London", "Berlin", "São Paulo"][Math.floor(Math.random() * 5)],
          os: ["android", "ios"][Math.floor(Math.random() * 2)],
          osVersion: ["14", "15", "13", "12"][Math.floor(Math.random() * 4)],
          deviceBrand: ["samsung", "apple", "xiaomi", "oneplus", "google"][Math.floor(Math.random() * 5)],
          deviceModel: ["Galaxy S24", "iPhone 16", "Mi 14", "Nord 4", "Pixel 9"][Math.floor(Math.random() * 5)],
          appVersion: "2.1.0",
          eventData: { sessionDuration: Math.floor(Math.random() * 300) },
          createdAt: new Date(date.getTime() + i * 60000 + 30000),
        });
      }
    }
  }

  await collection.insertMany(docs);
  console.log(`Inserted ${docs.length} event documents`);

  await mongoose.disconnect();
  console.log("Done — disconnected");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
