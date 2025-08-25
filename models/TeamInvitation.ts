import { Schema, model, models } from "mongoose"
import { connectMongoose } from "@/lib/mongoose"

const TeamInvitationSchema = new Schema(
  {
    _id: { type: String },
    team_id: { type: String, index: true },
    email: { type: String, index: true },
    role: { type: String, enum: ["owner", "admin", "member", "viewer"], default: "member" },
    invited_by: { type: String },
    status: { type: String, enum: ["pending", "accepted", "declined", "expired"], default: "pending" },
    expires_at: { type: String },
    created_at: { type: String },
    updated_at: { type: String },
  },
  { versionKey: false },
)

export async function TeamInvitationModel() {
  await connectMongoose()
  return models.TeamInvitation || model("TeamInvitation", TeamInvitationSchema, "team_invitations")
}


