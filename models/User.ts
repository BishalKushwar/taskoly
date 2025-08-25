import { Schema, model, models } from "mongoose"
import { connectMongoose } from "@/lib/mongoose"

const UserSchema = new Schema(
  {
    id: { type: String, index: true, unique: true },
    email: { type: String, required: true, unique: true, index: true },
    full_name: { type: String, default: "" },
    avatar_url: { type: String, default: "" },
    bio: { type: String, default: "" },
    role: { type: String, enum: ["owner", "admin", "member", "viewer"], default: "member" },
    team_id: { type: String, default: null },
    created_at: { type: String },
    updated_at: { type: String },
  },
  { versionKey: false },
)

export async function UserModel() {
  await connectMongoose()
  return models.User || model("User", UserSchema, "users")
}


