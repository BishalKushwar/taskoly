import mongoose from "mongoose"

declare global {
  // eslint-disable-next-line no-var
  var __mongooseConn: Promise<typeof mongoose> | undefined
}

export async function connectMongoose() {
  if (global.__mongooseConn) return global.__mongooseConn

  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error("MONGODB_URI is not set")

  const dbName = process.env.MONGODB_DB || "taskoly"

  global.__mongooseConn = mongoose.connect(uri, { dbName })
  return global.__mongooseConn
}


