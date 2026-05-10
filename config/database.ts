import mongoose from "mongoose";
import { ROLE } from "./constant";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  seeded: boolean;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongoose || {
  conn: null,
  promise: null,
  seeded: false,
};

if (!global.mongoose) {
  global.mongoose = cached;
}

async function seedDefaultAdmin() {
  // Dynamically import to avoid circular deps at module load time
  const [{ default: User }, { default: bcrypt }] = await Promise.all([
    import("@/model/User"),
    import("bcrypt"),
  ]);

  const adminExists = await User.exists({ role: ROLE.ADMIN });
  if (adminExists) return;

  const hashedPassword = await bcrypt.hash("ChangeMe123!", 10);

  await User.create({
    name: "Admin",
    email: "admin@example.com",
    password: hashedPassword,
    role: ROLE.ADMIN,
  });
}

async function dbConnect(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongoose) => {
        return mongoose;
      })
      .catch((error) => {
        cached.promise = null;
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  // Run seeding once per process lifetime
  if (!cached.seeded) {
    cached.seeded = true;
    seedDefaultAdmin().catch((err) =>
      console.error("[DB] Admin seeding failed:", err),
    );
  }

  return cached.conn;
}

export default dbConnect;
