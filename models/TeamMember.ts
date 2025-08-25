import { Schema, model, models } from "mongoose"
import { connectMongoose } from "@/lib/mongoose"

const TeamMemberSchema = new Schema(
  {
    _id: { type: String },
    team_id: { type: String, index: true },
    user_id: { type: String, index: true },
    role: { type: String, enum: ["owner", "admin", "member", "viewer"], default: "member" },
    joined_at: { type: String },
  },
  { versionKey: false },
)
TeamMemberSchema.index({ team_id: 1, user_id: 1 }, { unique: true })

export async function TeamMemberModel() {
  await connectMongoose()
  return models.TeamMember || model("TeamMember", TeamMemberSchema, "team_members")
}


