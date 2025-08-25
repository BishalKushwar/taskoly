import { NextResponse } from "next/server"
import { randomUUID } from "crypto"
import { getTokenFromRequest, verifyToken } from "@/lib/auth"
import { TeamMemberModel } from "@/models/TeamMember"
import { TeamInvitationModel } from "@/models/TeamInvitation"
import { UserModel } from "@/models/User"

export async function POST(request: Request) {
  try {
    const { teamId, email, role } = await request.json()

    // Get current user from Authorization header
    const token = getTokenFromRequest(request)
    const user = token ? verifyToken(token) : null
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    if (!teamId || !email || !role) {
      return NextResponse.json({ error: "Team ID, email, and role are required" }, { status: 400 })
    }

    const TeamMember = await TeamMemberModel()
    const member = await TeamMember.findOne({ team_id: teamId, user_id: user.id }).lean()
    if (!member) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }
    if (!["owner", "admin"].includes(member.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }
    const existingMember = await TeamMember.findOne({ team_id: teamId, user_id: user.id }).lean()
    if (existingMember) {
      return NextResponse.json({ error: "User is already a team member" }, { status: 400 })
    }
    const TeamInvitation = await TeamInvitationModel()
    const existingInvite = await TeamInvitation.findOne({ team_id: teamId, email, status: "pending" }).lean()
    if (existingInvite) {
      return NextResponse.json({ error: "Invitation already sent to this email" }, { status: 400 })
    }
    const now = new Date()
    const invitation = {
      _id: randomUUID(),
      team_id: teamId,
      email,
      role,
      invited_by: user.id,
      status: "pending",
      expires_at: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    }
    await TeamInvitation.create(invitation)

    // TODO: Send email notification here
    // You can integrate with your email service (SendGrid, Resend, etc.)

    return NextResponse.json({ 
      success: true, 
      invitation,
      message: "Invitation sent successfully" 
    })

  } catch (error: any) {
    console.error("Invitation creation error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { inviteId, action } = await request.json()

    const token = getTokenFromRequest(request)
    const user = token ? verifyToken(token) : null
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    if (!inviteId || !action) {
      return NextResponse.json({ error: "Invitation ID and action are required" }, { status: 400 })
    }

    const TeamInvitation = await TeamInvitationModel()
    const invite = await TeamInvitation.findOne({ _id: inviteId }).lean()
    if (!invite) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 })
    }

    // Verify the invitation is for the current user
    if (invite.email !== user.email) {
      return NextResponse.json({ error: "This invitation is not for you" }, { status: 403 })
    }

    // Check if invitation is still valid
    if (invite.status !== "pending" || new Date(invite.expires_at) < new Date()) {
      return NextResponse.json({ error: "Invitation has expired or is no longer valid" }, { status: 400 })
    }

    if (action === "accept") {
      const TeamMember = await TeamMemberModel()
      await TeamMember.create({
        _id: randomUUID(),
        team_id: invite.team_id,
        user_id: user.id,
        role: invite.role,
        joined_at: new Date().toISOString(),
      })

      const User = await UserModel()
      await User.updateOne({ id: user.id }, { $set: { team_id: invite.team_id, role: invite.role } })
    }

    await TeamInvitation.updateOne(
      { _id: inviteId },
      { $set: { status: action === "accept" ? "accepted" : "declined", updated_at: new Date().toISOString() } },
    )

    return NextResponse.json({ 
      success: true,
      message: action === "accept" ? "Successfully joined team" : "Invitation declined"
    })

  } catch (error: any) {
    console.error("Invitation action error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}