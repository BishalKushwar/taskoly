"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Home,
  FolderKanban,
  MessageSquare,
  Calendar,
  Users,
  BarChart3,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  LogOut,
  Crown,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { IntegrationHub } from "@/components/integrations/integration-hub"

interface DashboardLayoutProps {
  children: React.ReactNode
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Projects", href: "/dashboard/projects", icon: FolderKanban },
  { name: "Messages", href: "/dashboard/messages", icon: MessageSquare },
  { name: "Calendar", href: "/dashboard/calendar", icon: Calendar },
  { name: "Team", href: "/dashboard/team", icon: Users },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    router.push("/auth/login")
  }

  return (
    <div className="min-h-screen">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="fixed left-0 top-0 h-full w-64 bg-black/20 backdrop-blur-xl border-r border-white/10 shadow-xl"
            >
              <div className="flex h-16 items-center justify-between px-4 border-b border-white/10">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/25">
                    <span className="text-white font-bold">T</span>
                  </div>
                  <span className="font-bold text-xl text-white">Taskoly</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(false)}
                  className="text-white hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <nav className="mt-4 px-2">
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg mb-1 transition-all duration-200 ${
                        isActive
                          ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 shadow-lg shadow-blue-500/10"
                          : "text-slate-300 hover:bg-white/10 hover:text-white"
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  )
                })}
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-black/20 backdrop-blur-xl border-r border-white/10">
          <div className="flex h-16 items-center px-4 border-b border-white/10">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/25">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/taskoly.png" alt="Taskoly Logo" />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold">
                    T
                  </AvatarFallback>
                </Avatar>
              </div>
              <span className="font-bold text-xl text-white">Taskoly</span>
            </div>
          </div>
          <nav className="mt-4 flex-1 px-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg mb-1 transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 shadow-lg shadow-blue-500/10"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top navigation */}
        <div className="sticky top-0 z-40 flex h-16 items-center gap-x-4 border-b border-white/10 bg-black/20 backdrop-blur-xl px-4 shadow-lg">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden text-white hover:bg-white/10"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="relative flex flex-1 items-center">
              <Search className="pointer-events-none absolute left-3 h-4 w-4 text-slate-400" />
              <input
                className="block w-full rounded-lg border-0 bg-white/5 backdrop-blur-sm py-2 pl-10 pr-3 text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 border border-white/10 sm:text-sm"
                placeholder="Search projects, tasks, or team members..."
                type="search"
              />
            </div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <IntegrationHub />
              <Button variant="ghost" size="sm" className="relative text-white hover:bg-white/10">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-xs text-white flex items-center justify-center shadow-lg shadow-red-500/25">
                  3
                </span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-white/10">
                    <Avatar className="h-8 w-8 ring-2 ring-white/20">
                      <AvatarImage src={user?.user_metadata?.avatar_url || "/placeholder.svg"} alt={user?.email} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                        {user?.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 bg-black/80 backdrop-blur-xl border-white/10"
                  align="end"
                  forceMount
                >
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none text-white">
                        {user?.user_metadata?.full_name || "User"}
                      </p>
                      <p className="text-xs leading-none text-slate-400">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem className="text-slate-300 hover:bg-white/10 hover:text-white">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-slate-300 hover:bg-white/10 hover:text-white">
                    <Users className="mr-2 h-4 w-4" />
                    <span>Team</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="text-red-300 hover:bg-red-500/10 hover:text-red-200"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
