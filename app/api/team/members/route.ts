import { NextResponse } from "next/server"
import { TeamMemberModel } from "@/models/TeamMember"
import { UserModel } from "@/models/User"
import { getTokenFromRequest, verifyToken } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const teamId = searchParams.get("teamId")

    // Get current user from Authorization header
    const token = getTokenFromRequest(request)
    const user = token ? verifyToken(token) : null
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    if (!teamId) {
      return NextResponse.json({ error: "Team ID is required" }, { status: 400 })
    }

    // Check user membership
    const TeamMember = await TeamMemberModel()
    const currentMember = await TeamMember.findOne({ team_id: teamId, user_id: user.id }).lean()
    if (!currentMember) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Fetch members and join with users
    const memberships = await TeamMember.find({ team_id: teamId }).sort({ joined_at: -1 }).lean()

    const userIds = memberships.map((m: any) => m.user_id)
    const User = await UserModel()
    const users = await User.find({ id: { $in: userIds } }, { id: 1, email: 1, full_name: 1, avatar_url: 1 }).lean()

    const userMap = new Map(users.map((u: any) => [u.id, u]))
    const members = memberships.map((m: any) => ({
      ...m,
      users: userMap.get(m.user_id) || null,
    }))

    return NextResponse.json({ members })

  } catch (error: any) {
    console.error("Members fetch error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { teamId, memberId, role } = await request.json()

    const token = getTokenFromRequest(request)
    const user = token ? verifyToken(token) : null
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    if (!teamId || !memberId || !role) {
      return NextResponse.json({ error: "Team ID, member ID, and role are required" }, { status: 400 })
    }

    const TeamMember = await TeamMemberModel()
    const currentMember = await TeamMember.findOne({ team_id: teamId, user_id: user.id }).lean()
    if (!currentMember) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    if (!["owner", "admin"].includes(currentMember.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const targetMember = await TeamMember.findOne({ team_id: teamId, user_id: memberId }).lean()
    if (!targetMember) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    if (targetMember.role === "owner" && currentMember.role !== "owner") {
      return NextResponse.json({ error: "Only team owner can change owner role" }, { status: 403 })
    }

    await TeamMember.updateOne({ team_id: teamId, user_id: memberId }, { $set: { role } })

    return NextResponse.json({ 
      success: true,
      message: "Member role updated successfully" 
    })

  } catch (error: any) {
    console.error("Role update error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const teamId = searchParams.get("teamId")
    const memberId = searchParams.get("memberId")

    const token = getTokenFromRequest(request)
    const user = token ? verifyToken(token) : null
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    if (!teamId || !memberId) {
      return NextResponse.json({ error: "Team ID and member ID are required" }, { status: 400 })
    }

    const TeamMember = await TeamMemberModel()
    const currentMember = await TeamMember.findOne({ team_id: teamId, user_id: user.id }).lean()
    if (!currentMember) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }
    if (!["owner", "admin"].includes(currentMember.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const targetMember = await TeamMember.findOne({ team_id: teamId, user_id: memberId }).lean()
    if (!targetMember) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }
    if (targetMember.role === "owner") {
      return NextResponse.json({ error: "Cannot remove team owner" }, { status: 403 })
    }

    await TeamMember.deleteOne({ team_id: teamId, user_id: memberId })
    const User = await UserModel()
    await User.updateOne({ id: memberId }, { $set: { team_id: null, role: "member" } })

    return NextResponse.json({ 
      success: true,
      message: "Member removed successfully" 
    })

  } catch (error: any) {
    console.error("Member removal error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
