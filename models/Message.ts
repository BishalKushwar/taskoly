import { Schema, model, models } from "mongoose"
import { connectMongoose } from "@/lib/mongoose"

const MessageSchema = new Schema(
  {
    id: { type: String, index: true, unique: true },
    content: { type: String, required: true },
    message_type: { type: String, default: "text" },
    file_url: { type: String, default: null },
    file_name: { type: String, default: null },
    file_size: { type: Number, default: null },
    created_at: { type: String },
    user_id: { type: String, index: true },
    project_id: { type: String, index: true },
  },
  { versionKey: false },
)

export async function MessageModel() {
  await connectMongoose()
  return models.Message || model("Message", MessageSchema, "messages")
}


