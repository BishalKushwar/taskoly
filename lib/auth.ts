import jwt from "jsonwebtoken"
import { cookies } from "next/headers"

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me"

export interface AuthUser {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
}

export function signToken(payload: AuthUser): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" })
}

export function verifyToken(token: string): AuthUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthUser
  } catch {
    return null
  }
}

export function getTokenFromRequest(req: Request): string | null {
  const authHeader = req.headers.get("authorization")
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1]
  }
  // Try to read from the request's Cookie header first process.env(more explicit)
  const cookieHeader = req.headers.get("cookie")
  if (cookieHeader) {
    const parts = cookieHeader.split(";").map((p) => p.trim())
    for (const part of parts) {
      if (part.startsWith("auth_token=")) {
        return decodeURIComponent(part.substring("auth_token=".length))
      }
    }
  }
  // Fallback to Next's cookies store (Route Handlers/Server Components)
  const cookieStore = cookies()
  const cookieToken = cookieStore.get("auth_token")?.value
  return cookieToken || null
}

export function setAuthCookie(token: string) {
  const cookieStore = cookies()
  cookieStore.set("auth_token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  })
}


