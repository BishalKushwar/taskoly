import { MongoClient, Db } from "mongodb"

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

export async function getDb(): Promise<Db> {
  if (cachedDb && cachedClient) return cachedDb

  const uri = process.env.MONGODB_URI
  const dbName = process.env.MONGODB_DB || "taskoly"

  if (!uri) {
    throw new Error("MONGODB_URI is not set")
  }

  const client = new MongoClient(uri)
  await client.connect()
  const db = client.db(dbName)

  cachedClient = client
  cachedDb = db

  return db
}


