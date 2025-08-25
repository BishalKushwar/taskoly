import { Schema, model, models } from "mongoose"
import { connectMongoose } from "@/lib/mongoose"

const TaskSchema = new Schema(
  {
    id: { type: String, index: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    status: { type: String, default: "todo" },
    priority: { type: String, default: "medium" },
    assigned_to: { type: String, default: null },
    due_date: { type: String, default: null },
    project_id: { type: String, index: true },
    created_by: { type: String },
    position: { type: Number, default: 0 },
    completed_at: { type: String, default: null },
    created_at: { type: String },
    updated_at: { type: String },
  },
  { versionKey: false },
)

export async function TaskModel() {
  await connectMongoose()
  return models.Task || model("Task", TaskSchema, "tasks")
}


