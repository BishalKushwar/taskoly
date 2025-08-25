import { NextResponse } from "next/server"
import { randomUUID } from "crypto"
import { getTokenFromRequest, verifyToken } from "@/lib/auth"
import { TeamModel } from "@/models/Team"
import { TeamMemberModel } from "@/models/TeamMember"
import { UserModel } from "@/models/User"

export async function POST(request: Request) {
  try {
    const { name, description, avatar_url } = await request.json()

    // Get current user from Authorization header
    const token = getTokenFromRequest(request)
    const user = token ? verifyToken(token) : null
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    if (!name) {
      return NextResponse.json({ error: "Team name is required" }, { status: 400 })
    }

    // Create team document with string UUID as _id for consistency
    const teamId = randomUUID()
    const now = new Date()
    const teamDoc = {
      _id: teamId,
      id: teamId,
      name,
      description: description || "",
      avatar_url: avatar_url || "",
      created_by: user.id,
      subscription_tier: "free",
      max_members: 5,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    }
    const Team = await TeamModel()
    await Team.create(teamDoc)

    // Add creator as team owner
    const memberDoc = {
      _id: randomUUID(),
      team_id: teamId,
      user_id: user.id,
      role: "owner",
      joined_at: now.toISOString(),
    }
    const TeamMember = await TeamMemberModel()
    await TeamMember.create(memberDoc)

    // Upsert user profile with team_id and role
    const User = await UserModel()
    await User.updateOne(
      { id: user.id },
      {
        $set: {
          id: user.id,
          email: user.email,
          full_name: (user as any)?.user_metadata?.full_name || "",
          avatar_url: (user as any)?.user_metadata?.avatar_url || "",
          team_id: teamId,
          role: "owner",
          updated_at: now.toISOString(),
        },
        $setOnInsert: { created_at: now.toISOString() },
      },
      { upsert: true },
    )

    return NextResponse.json({
      success: true,
      team: teamDoc,
      message: "Team created successfully",
    })

  } catch (error: any) {
    console.error("Team creation error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
