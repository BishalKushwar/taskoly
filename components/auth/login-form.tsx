"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Loader2, Mail, Lock, Eye, EyeOff, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { motion } from "framer-motion"

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const { signIn } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      const { error } = await signIn(email, password)

      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)

        setTimeout(() => {
          router.push("/dashboard")
          router.refresh()
        }, 1500)
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card className="bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl">
        <CardHeader className="space-y-1 pb-4">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">T</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm"
              >
                {error}
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-lg text-sm flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Login successful! Redirecting to dashboard...
              </motion.div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-400 focus:border-blue-500"
                  required
                  disabled={success}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-slate-400 focus:border-blue-500"
                  required
                  disabled={success}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-white"
                  disabled={success}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || success}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-2.5"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : success ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Success!
                </>
              ) : (
                "Sign In"
              )}
            </Button>

            <div className="text-center text-sm text-slate-400">
              Don't have an account?{" "}
              <Link href="/auth/signup" className="text-blue-400 hover:text-blue-300 font-medium">
                Sign up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
