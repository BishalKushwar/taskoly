"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Loader2, Mail, Lock, User, Eye, EyeOff, CheckCircle, Upload, X, Camera, Sparkles } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function SignUpForm() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const { signUp } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError("Please select a valid image file")
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB")
        return
      }

      setAvatarFile(file)
      setError("")

      // Create preview URL
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeAvatar = () => {
    setAvatarFile(null)
    setAvatarPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile) return null

    try {
      console.log('Starting avatar upload...')
      console.log('File details:', {
        name: avatarFile.name,
        size: avatarFile.size,
        type: avatarFile.type
      })

      // Create FormData for file upload
      const formData = new FormData()
      formData.append('file', avatarFile)
      formData.append('folder', 'avatars')

      console.log('FormData created, making request to /api/upload')

      // Upload to Supabase Storage
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))

      const result = await response.json()
      console.log('Response body:', result)

      if (!response.ok) {
        console.error('Upload failed with status:', response.status)
        console.error('Upload response:', result)
        
        // Fallback: Convert to base64 if storage upload fails
        console.log('Attempting base64 fallback...')
        return await convertToBase64(avatarFile)
      }

      if (result.error) {
        console.error('Upload response contains error:', result.error)
        // Fallback: Convert to base64 if storage upload fails
        console.log('Attempting base64 fallback...')
        return await convertToBase64(avatarFile)
      }

      console.log('Upload successful, URL:', result.url)
      return result.url
    } catch (error: any) {
      console.error('Avatar upload error:', error)
      // Fallback: Convert to base64 if storage upload fails
      console.log('Attempting base64 fallback...')
      try {
        return await convertToBase64(avatarFile)
      } catch (fallbackError) {
        console.error('Base64 fallback also failed:', fallbackError)
        throw new Error('Failed to process avatar image')
      }
    }
  }

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        resolve(reader.result as string)
      }
      reader.onerror = () => {
        reject(new Error('Failed to convert image to base64'))
      }
      reader.readAsDataURL(file)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters")
      setLoading(false)
      return
    }

    try {
      // Upload avatar if selected
      let avatarUrl = null
      if (avatarFile) {
        try {
          avatarUrl = await uploadAvatar()
        } catch (uploadError: any) {
          console.error('Avatar upload failed:', uploadError)
          // Continue with signup even if avatar upload fails
          setError("Avatar upload failed, but account creation will continue")
        }
      }

      const { error } = await signUp(formData.email, formData.password, {
        full_name: formData.fullName,
        avatar_url: avatarUrl || undefined
      })

      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border-white/20 shadow-2xl">
          <CardContent className="pt-8 pb-8">
            <div className="text-center space-y-6">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg"
              >
                <CheckCircle className="w-10 h-10 text-white" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="text-2xl font-bold text-white mb-2">Welcome to Taskoly!</h3>
                <p className="text-slate-300 text-lg">
                  We've sent you a confirmation link at <br />
                  <span className="font-semibold text-blue-300">{formData.email}</span>
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-3"
              >
                <p className="text-slate-400 text-sm">
                  Please check your email and click the link to verify your account.
                </p>
                <Link href="/auth/login">
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 px-8 py-3 text-lg font-medium shadow-lg">
                    Continue to Login
                  </Button>
                </Link>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.6 }}
      className="w-full max-w-md mx-auto"
    >
      <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border-white/20 shadow-2xl">
        <CardHeader className="space-y-1 pb-6">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="flex justify-center mb-6"
          >
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">+</span>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold text-white mb-2">Join Taskoly</h2>
            <p className="text-slate-300">Create your account and start collaborating</p>
          </motion.div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm backdrop-blur-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Avatar Upload Section */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              <label className="text-sm font-medium text-white">Profile Picture (Optional)</label>
              <div className="flex items-center justify-center">
                <div className="relative group">
                  <Avatar className="w-24 h-24 border-4 border-white/20 shadow-lg group-hover:border-blue-400 transition-colors">
                    <AvatarImage src={avatarPreview || undefined} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-2xl font-bold">
                      {formData.fullName ? formData.fullName.charAt(0).toUpperCase() : "U"}
                    </AvatarFallback>
                  </Avatar>
                  
                  {avatarPreview && (
                    <motion.button
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      type="button"
                      onClick={removeAvatar}
                      className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white text-xs shadow-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </motion.button>
                  )}
                </div>
              </div>
              
              <div className="flex justify-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  id="avatar-upload"
                />
                <label
                  htmlFor="avatar-upload"
                  className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 border border-white/20 rounded-xl text-white text-sm transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Camera className="w-4 h-4" />
                  {avatarPreview ? "Change Photo" : "Upload Photo"}
                </label>
              </div>
              
              <p className="text-xs text-slate-400 text-center">
                JPG, PNG or GIF. Max size 5MB.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-2"
            >
              <label className="text-sm font-medium text-white">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-3 h-5 w-5 text-slate-400" />
                <Input
                  type="text"
                  name="fullName"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="pl-12 pr-4 py-3 bg-white/5 border-white/10 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all duration-200"
                  required
                />
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-2"
            >
              <label className="text-sm font-medium text-white">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3 h-5 w-5 text-slate-400" />
                <Input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-12 pr-4 py-3 bg-white/5 border-white/10 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all duration-200"
                  required
                />
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-2"
            >
              <label className="text-sm font-medium text-white">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3 h-5 w-5 text-slate-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-12 pr-12 py-3 bg-white/5 border-white/10 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all duration-200"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="space-y-2"
            >
              <label className="text-sm font-medium text-white">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3 h-5 w-5 text-slate-400" />
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="pl-12 pr-12 py-3 bg-white/5 border-white/10 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all duration-200"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-3 text-slate-400 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="text-center text-sm text-slate-400"
            >
              Already have an account?{" "}
              <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                Sign in
              </Link>
            </motion.div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
