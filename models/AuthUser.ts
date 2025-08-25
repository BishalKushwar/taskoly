import { Schema, model, models } from "mongoose"
import { connectMongoose } from "@/lib/mongoose"

const AuthUserSchema = new Schema(
  {
    id: { type: String, index: true, unique: true },
    email: { type: String, required: true, unique: true, index: true },
    password_hash: { type: String, required: true },
    created_at: { type: String },
  },
  { versionKey: false },
)

export async function AuthUserModel() {
  await connectMongoose()
  return models.AuthUser || model("AuthUser", AuthUserSchema, "auth_users")
}


