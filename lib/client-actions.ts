"use client"

// Re-implemented client actions to call our MongoDB-backed API routes and rely on cookie-based auth

// User Profile Actions
export async function updateUserProfile(userId: string, updates: {
  full_name?: string
  avatar_url?: string
  bio?: string
}) {
  try {
    const res = await fetch("/api/user/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId, updates }) })
    const json = await res.json()
    if (!res.ok) return { error: json.error || "Failed to update profile" }
    return { success: true, data: json.profile }
  } catch (error: any) {
    console.error("Profile update error:", error)
    return { error: error.message }
  }
}

export async function updateUserPassword(currentPassword: string, newPassword: string) {
  try {
    const res = await fetch("/api/user/password", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentPassword, newPassword }) })
    const json = await res.json()
    if (!res.ok) return { error: json.error || "Failed to update password" }
    return { success: true }
  } catch (error: any) {
    console.error("Password update error:", error)
    return { error: error.message }
  }
}

// Notification Settings Actions
export async function updateNotificationSettings(userId: string, settings: {
  email_notifications?: boolean
  push_notifications?: boolean
  task_reminders?: boolean
  team_updates?: boolean
}) {
  try {
    const res = await fetch("/api/user/preferences", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings) })
    const json = await res.json()
    if (!res.ok) return { error: json.error || "Failed to update preferences" }
    return { success: true, data: json.preferences }
  } catch (error: any) {
    console.error("Notification settings update error:", error)
    return { error: error.message }
  }
}

// Team Settings Actions
export async function updateTeamSettings(teamId: string, updates: {
  name?: string
  description?: string
  avatar_url?: string
}) {
  try {
    const res = await fetch("/api/team/update", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ teamId, ...updates }) })
    const json = await res.json()
    if (!res.ok) return { error: json.error || "Failed to update team" }
    return { success: true, data: json.team }
  } catch (error: any) {
    console.error("Team settings update error:", error)
    return { error: error.message }
  }
}

// Team Creation Actions
export async function createTeam(teamData: { name: string; description?: string; avatar_url?: string }) {
  try {
    const res = await fetch("/api/team/create", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(teamData) })
    const json = await res.json()
    if (!res.ok) return { error: json.error || "Failed to create team" }
    return { success: true, message: json.message, team: json.team }
  } catch (error: any) {
    console.error("Team creation error:", error)
    return { error: error.message || "Failed to create team" }
  }
}

// Team Management Actions
export async function updateTeam(teamId: string, nameOrUpdates: any, optional?: any) {
  const payload = optional ? { teamId, ...optional } : { teamId, ...nameOrUpdates }
  try {
    const res = await fetch("/api/team/update", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
    const json = await res.json()
    if (!res.ok) return { error: json.error || "Failed to update team" }
    return { success: true, data: json.team }
  } catch (error: any) {
    console.error("Team update error:", error)
    return { error: error.message || "Failed to update team" }
  }
}

export async function inviteTeamMember(teamId: string, email: string, role: string) {
  try {
    const res = await fetch("/api/team/invite", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ teamId, email, role }) })
    const json = await res.json()
    if (!res.ok) return { error: json.error || "Failed to create invitation" }
    return { success: true, data: json.invitation }
  } catch (error: any) {
    console.error("Team invitation error:", error)
    return { error: error.message || "Failed to invite team member" }
  }
}

export async function updateMemberRole(teamId: string, memberId: string, role: string) {
  try {
    const res = await fetch("/api/team/members", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ teamId, memberId, role }) })
    const json = await res.json()
    if (!res.ok) return { error: json.error || "Failed to update member role" }
    return { success: true }
  } catch (error: any) {
    console.error("Member role update error:", error)
    return { error: error.message || "Failed to update member role" }
  }
}

export async function removeTeamMember(teamId: string, memberId: string) {
  try {
    const url = new URL("/api/team/members", window.location.origin)
    url.searchParams.set("teamId", teamId)
    url.searchParams.set("memberId", memberId)
    const res = await fetch(url.toString(), { method: "DELETE" })
    const json = await res.json()
    if (!res.ok) return { error: json.error || "Failed to remove team member" }
    return { success: true }
  } catch (error: any) {
    console.error("Member removal error:", error)
    return { error: error.message || "Failed to remove team member" }
  }
}

// User Data Fetching
export async function getUserProfile(userId: string) {
  try {
    const res = await fetch("/api/user/profile", { method: "GET" })
    const json = await res.json()
    if (!res.ok) return { error: json.error || "Failed to fetch profile" }
    return { success: true, data: json.profile }
  } catch (error: any) {
    console.error("User profile fetch error:", error)
    return { error: error.message || "Failed to fetch user profile" }
  }
}

export async function getUserPreferences(userId: string) {
  try {
    const res = await fetch("/api/user/preferences")
    const json = await res.json()
    if (!res.ok) return { error: json.error || "Failed to fetch preferences" }
    return { success: true, data: json.preferences || {} }
  } catch (error: any) {
    console.error("User preferences fetch error:", error)
    return { error: error.message || "Failed to fetch user preferences" }
  }
}

export async function getUserTeams(userId: string) {
  try {
    const res = await fetch("/api/teams")
    const json = await res.json()
    if (!res.ok) return { error: json.error || "Failed to fetch teams" }
    // shape like previous consumer expects
    const data = (json.teams || []).map((t: any) => ({ teams: t }))
    return { success: true, data }
  } catch (error: any) {
    console.error("User teams fetch error:", error)
    return { error: error.message || "Failed to fetch user teams" }
  }
}
