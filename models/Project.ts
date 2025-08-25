import { Schema, model, models } from "mongoose"
import { connectMongoose } from "@/lib/mongoose"

const ProjectSchema = new Schema(
  {
    id: { type: String, index: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    team_id: { type: String, index: true },
    created_by: { type: String },
    status: { type: String, default: "active" },
    priority: { type: String, default: "medium" },
    start_date: { type: String, default: null },
    due_date: { type: String, default: null },
    created_at: { type: String },
    updated_at: { type: String },
  },
  { versionKey: false },
)

export async function ProjectModel() {
  await connectMongoose()
  return models.Project || model("Project", ProjectSchema, "projects")
}


