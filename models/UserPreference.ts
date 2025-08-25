import { Schema, model, models } from "mongoose"
import { connectMongoose } from "@/lib/mongoose"

const UserPreferenceSchema = new Schema(
  {
    user_id: { type: String, index: true, unique: true },
    email_notifications: { type: Boolean, default: true },
    push_notifications: { type: Boolean, default: true },
    task_reminders: { type: Boolean, default: true },
    team_updates: { type: Boolean, default: true },
    theme: { type: String, default: "dark" },
    language: { type: String, default: "en" },
    timezone: { type: String, default: "UTC" },
    created_at: { type: String },
    updated_at: { type: String },
  },
  { versionKey: false },
)

export async function UserPreferenceModel() {
  await connectMongoose()
  return models.UserPreference || model("UserPreference", UserPreferenceSchema, "user_preferences")
}


