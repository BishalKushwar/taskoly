"use server"

// Deprecated Supabase server actions; prefer REST endpoints with MongoDB
import { redirect } from "next/navigation"

export async function signUp(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const email = formData.get("email")
  const password = formData.get("password")
  const fullName = formData.get("fullName")

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  try {
    const res = await fetch("/api/auth/signup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password, full_name: fullName }) })
    const json = await res.json()
    if (!res.ok) return { error: json.error || "Signup failed" }
    return { success: true }
  } catch (error) {
    console.error("Sign up error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function signIn(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const email = formData.get("email")
  const password = formData.get("password")

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  try {
    const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) })
    const json = await res.json()
    if (!res.ok) return { error: json.error || "Login failed" }
    return { success: true }
  } catch (error) {
    console.error("Login error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function signOut() {
  await fetch('/api/auth/logout', { method: 'POST' })
  redirect("/auth/login")
}

// Team Actions
export async function createTeam(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const name = formData.get("name")
  const description = formData.get("description")
  const avatar_url = formData.get("avatar_url")

  if (!name) {
    return { error: "Team name is required" }
  }

  const supabase = createServerActionClient({ cookies })

  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { error: "Unauthorized - Please log in again" }
    }

    // Create team (the trigger will handle adding the creator as owner and updating user profile)
    const { data: team, error: teamError } = await supabase
      .from("teams")
      .insert({
        name: name.toString(),
        description: description?.toString() || "",
        avatar_url: avatar_url?.toString() || "",
        created_by: user.id,
        subscription_tier: "free",
        max_members: 5
      })
      .select()
      .single()

    if (teamError) {
      console.error("Team creation error:", teamError)
      return { error: "Failed to create team" }
    }

    return { 
      success: "Team created successfully",
      team
    }

  } catch (error: any) {
    console.error("Team creation error:", error)
    return { error: error.message }
  }
}

export async function updateTeam(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const teamId = formData.get("teamId")
  const name = formData.get("name")
  const description = formData.get("description")
  const avatar_url = formData.get("avatar_url")

  if (!teamId || !name) {
    return { error: "Team ID and name are required" }
  }

  const supabase = createServerActionClient({ cookies })

  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { error: "Unauthorized - Please log in again" }
    }

    // Check if user has permission to update team (owner or admin)
    const { data: member, error: memberError } = await supabase
      .from("team_members")
      .select("role")
      .eq("team_id", teamId)
      .eq("user_id", user.id)
      .single()

    if (memberError || !member) {
      return { error: "Access denied" }
    }

    if (!["owner", "admin"].includes(member.role)) {
      return { error: "Insufficient permissions" }
    }

    // Update team
    const { data: team, error: teamError } = await supabase
      .from("teams")
      .update({
        name: name.toString(),
        description: description?.toString() || "",
        avatar_url: avatar_url?.toString() || "",
        updated_at: new Date().toISOString()
      })
      .eq("id", teamId)
      .select()
      .single()

    if (teamError) {
      console.error("Team update error:", teamError)
      return { error: "Failed to update team" }
    }

    return { 
      success: "Team updated successfully",
      team
    }

  } catch (error: any) {
    console.error("Team update error:", error)
    return { error: error.message }
  }
}

export async function inviteTeamMember(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const teamId = formData.get("teamId")
  const email = formData.get("email")
  const role = formData.get("role")

  if (!teamId || !email || !role) {
    return { error: "Team ID, email, and role are required" }
  }

  const supabase = createServerActionClient({ cookies })

  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { error: "Unauthorized - Please log in again" }
    }

    // Check if user has permission to invite (owner or admin)
    const { data: member, error: memberError } = await supabase
      .from("team_members")
      .select("role")
      .eq("team_id", teamId)
      .eq("user_id", user.id)
      .single()

    if (memberError || !member) {
      return { error: "Access denied" }
    }

    if (!["owner", "admin"].includes(member.role)) {
      return { error: "Insufficient permissions" }
    }

    // Check if invitation already exists
    const { data: existingInvite } = await supabase
      .from("team_invitations")
      .select("id")
      .eq("team_id", teamId)
      .eq("email", email)
      .eq("status", "pending")
      .single()

    if (existingInvite) {
      return { error: "Invitation already sent to this email" }
    }

    // Create invitation
    const { data: invitation, error: inviteError } = await supabase
      .from("team_invitations")
      .insert({
        team_id: teamId,
        email: email.toString(),
        role: role.toString(),
        invited_by: user.id,
        status: "pending",
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      })
      .select()
      .single()

    if (inviteError) {
      console.error("Invitation creation error:", inviteError)
      return { error: "Failed to create invitation" }
    }

    // TODO: Send email notification here
    // You can integrate with your email service (SendGrid, Resend, etc.)

    return { 
      success: "Invitation sent successfully",
      invitation
    }

  } catch (error: any) {
    console.error("Invitation creation error:", error)
    return { error: error.message }
  }
}

export async function updateMemberRole(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const teamId = formData.get("teamId")
  const memberId = formData.get("memberId")
  const role = formData.get("role")

  if (!teamId || !memberId || !role) {
    return { error: "Team ID, member ID, and role are required" }
  }

  const supabase = createServerActionClient({ cookies })

  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { error: "Unauthorized - Please log in again" }
    }

    // Check if user has permission to update member (owner or admin)
    const { data: currentMember, error: currentMemberError } = await supabase
      .from("team_members")
      .select("role")
      .eq("team_id", teamId)
      .eq("user_id", user.id)
      .single()

    if (currentMemberError || !currentMember) {
      return { error: "Access denied" }
    }

    if (!["owner", "admin"].includes(currentMember.role)) {
      return { error: "Insufficient permissions" }
    }

    // Update member role
    const { error: updateError } = await supabase
      .from("team_members")
      .update({ role: role.toString() })
      .eq("team_id", teamId)
      .eq("user_id", memberId)

    if (updateError) {
      console.error("Role update error:", updateError)
      return { error: "Failed to update member role" }
    }

    return { 
      success: "Member role updated successfully"
    }

  } catch (error: any) {
    console.error("Role update error:", error)
    return { error: error.message }
  }
}

export async function removeTeamMember(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const teamId = formData.get("teamId")
  const memberId = formData.get("memberId")

  if (!teamId || !memberId) {
    return { error: "Team ID and member ID are required" }
  }

  const supabase = createServerActionClient({ cookies })

  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { error: "Unauthorized - Please log in again" }
    }

    // Check if user has permission to remove member (owner or admin)
    const { data: currentMember, error: currentMemberError } = await supabase
      .from("team_members")
      .select("role")
      .eq("team_id", teamId)
      .eq("user_id", user.id)
      .single()

    if (currentMemberError || !currentMember) {
      return { error: "Access denied" }
    }

    if (!["owner", "admin"].includes(currentMember.role)) {
      return { error: "Insufficient permissions" }
    }

    // Prevent removing owner
    const { data: targetMember, error: targetMemberError } = await supabase
      .from("team_members")
      .select("role")
      .eq("team_id", teamId)
      .eq("user_id", memberId)
      .single()

    if (targetMemberError || !targetMember) {
      return { error: "Member not found" }
    }

    if (targetMember.role === "owner") {
      return { error: "Cannot remove team owner" }
    }

    // Remove member from team
    const { error: removeError } = await supabase
      .from("team_members")
      .delete()
      .eq("team_id", teamId)
      .eq("user_id", memberId)

    if (removeError) {
      console.error("Member removal error:", removeError)
      return { error: "Failed to remove member" }
    }

    // Update user profile to remove team association
    await supabase
      .from("users")
      .update({ 
        team_id: null,
        role: "member"
      })
      .eq("id", memberId)

    return { 
      success: "Member removed successfully"
    }

  } catch (error: any) {
    console.error("Member removal error:", error)
    return { error: error.message }
  }
}

// Project Actions
export async function createProject(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const name = formData.get("name")
  const description = formData.get("description")
  const teamId = formData.get("teamId")

  if (!name) {
    return { error: "Project name is required" }
  }

  const supabase = createServerActionClient({ cookies })

  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { error: "Unauthorized - Please log in again" }
    }

    // Create project
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .insert({
        name: name.toString(),
        description: description?.toString() || "",
        team_id: teamId?.toString() || null,
        created_by: user.id,
        status: "active"
      })
      .select()
      .single()

    if (projectError) {
      console.error("Project creation error:", projectError)
      return { error: "Failed to create project" }
    }

    return { 
      success: "Project created successfully",
      project
    }

  } catch (error: any) {
    console.error("Project creation error:", error)
    return { error: error.message }
  }
}

export async function updateProject(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const projectId = formData.get("projectId")
  const name = formData.get("name")
  const description = formData.get("description")
  const status = formData.get("status")

  if (!projectId || !name) {
    return { error: "Project ID and name are required" }
  }

  const supabase = createServerActionClient({ cookies })

  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { error: "Unauthorized - Please log in again" }
    }

    // Update project
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .update({
        name: name.toString(),
        description: description?.toString() || "",
        status: status?.toString() || "active",
        updated_at: new Date().toISOString()
      })
      .eq("id", projectId)
      .select()
      .single()

    if (projectError) {
      console.error("Project update error:", projectError)
      return { error: "Failed to update project" }
    }

    return { 
      success: "Project updated successfully",
      project
    }

  } catch (error: any) {
    console.error("Project update error:", error)
    return { error: error.message }
  }
}

// Task Actions
export async function createTask(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const title = formData.get("title")
  const description = formData.get("description")
  const projectId = formData.get("projectId")
  const priority = formData.get("priority")
  const dueDate = formData.get("dueDate")

  if (!title) {
    return { error: "Task title is required" }
  }

  const supabase = createServerActionClient({ cookies })

  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { error: "Unauthorized - Please log in again" }
    }

    // Create task
    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .insert({
        title: title.toString(),
        description: description?.toString() || "",
        project_id: projectId?.toString() || null,
        assigned_to: user.id,
        priority: priority?.toString() || "medium",
        due_date: dueDate?.toString() || null,
        status: "todo"
      })
      .select()
      .single()

    if (taskError) {
      console.error("Task creation error:", taskError)
      return { error: "Failed to create task" }
    }

    return { 
      success: "Task created successfully",
      task
    }

  } catch (error: any) {
    console.error("Task creation error:", error)
    return { error: error.message }
  }
}

export async function updateTaskStatus(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const taskId = formData.get("taskId")
  const status = formData.get("status")

  if (!taskId || !status) {
    return { error: "Task ID and status are required" }
  }

  const supabase = createServerActionClient({ cookies })

  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { error: "Unauthorized - Please log in again" }
    }

    // Update task status
    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .update({
        status: status.toString(),
        updated_at: new Date().toISOString()
      })
      .eq("id", taskId)
      .select()
      .single()

    if (taskError) {
      console.error("Task status update error:", taskError)
      return { error: "Failed to update task status" }
    }

    return { 
      success: "Task status updated successfully",
      task
    }

  } catch (error: any) {
    console.error("Task status update error:", error)
    return { error: error.message }
  }
}

// Message Actions
export async function createMessage(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const content = formData.get("content")
  const teamId = formData.get("teamId")
  const projectId = formData.get("projectId")

  if (!content) {
    return { error: "Message content is required" }
  }

  const supabase = createServerActionClient({ cookies })

  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { error: "Unauthorized - Please log in again" }
    }

    // Create message
    const { data: message, error: messageError } = await supabase
      .from("messages")
      .insert({
        content: content.toString(),
        team_id: teamId?.toString() || null,
        project_id: projectId?.toString() || null,
        sender_id: user.id
      })
      .select()
      .single()

    if (messageError) {
      console.error("Message creation error:", messageError)
      return { error: "Failed to create message" }
    }

    return { 
      success: "Message sent successfully",
      message
    }

  } catch (error: any) {
    console.error("Message creation error:", error)
    return { error: error.message }
  }
}

// File Upload Actions
export async function uploadFile(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const file = formData.get("file") as File
  const teamId = formData.get("teamId")
  const projectId = formData.get("projectId")

  if (!file) {
    return { error: "File is required" }
  }

  const supabase = createServerActionClient({ cookies })

  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { error: "Unauthorized - Please log in again" }
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `uploads/${teamId || 'personal'}/${fileName}`

    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('files')
      .upload(filePath, file)

    if (uploadError) {
      console.error("File upload error:", uploadError)
      return { error: "Failed to upload file" }
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('files')
      .getPublicUrl(filePath)

    // Save file metadata to database
    const { data: fileRecord, error: dbError } = await supabase
      .from("files")
      .insert({
        name: file.name,
        path: filePath,
        url: publicUrl,
        size: file.size,
        type: file.type,
        team_id: teamId?.toString() || null,
        project_id: projectId?.toString() || null,
        uploaded_by: user.id
      })
      .select()
      .single()

    if (dbError) {
      console.error("File metadata save error:", dbError)
      // Clean up uploaded file if metadata save fails
      await supabase.storage.from('files').remove([filePath])
      return { error: "Failed to save file metadata" }
    }

    return { 
      success: "File uploaded successfully",
      file: fileRecord
    }

  } catch (error: any) {
    console.error("File upload error:", error)
    return { error: error.message }
  }
}
