import mongoose, { Connection } from "mongoose";

let cached: { conn: Connection | null; promise: Promise<Connection> | null } =
  {
    conn: null,
    promise: null,
  };

export async function dbConnect(): Promise<Connection> {
  const mongoUrl = process.env.MONGODB_URL;

  if (!mongoUrl) {
    throw new Error(
      "Please define the MONGODB_URL environment variable inside .env.local"
    );
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };
    cached.promise = mongoose
      .connect(mongoUrl, opts)
      .then((mongoose) => mongoose.connection);
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
