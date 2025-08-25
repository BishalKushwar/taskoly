import { Schema, model, models } from "mongoose"
import { connectMongoose } from "@/lib/mongoose"

const TeamSchema = new Schema(
  {
    id: { type: String, index: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    avatar_url: { type: String, default: "" },
    created_by: { type: String, required: true },
    subscription_tier: { type: String, default: "free" },
    max_members: { type: Number, default: 5 },
    created_at: { type: String },
    updated_at: { type: String },
  },
  { versionKey: false },
)

export async function TeamModel() {
  await connectMongoose()
  return models.Team || model("Team", TeamSchema, "teams")
}


