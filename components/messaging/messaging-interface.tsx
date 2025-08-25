"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Send,
  Paperclip,
  Search,
  MoreVertical,
  Users,
  Hash,
  Smile,
  File,
  Download,
  Reply,
  Heart,
  MessageCircle,
} from "lucide-react"
// Removed Supabase; use our MongoDB-backed API endpoints (no realtime for now)
import { formatDistanceToNow } from "date-fns"

interface MessagingInterfaceProps {
  user: any
  teams: any[]
  projects: any[]
}

interface Message {
  id: string
  content: string
  message_type: string
  file_url?: string
  file_name?: string
  file_size?: number
  created_at: string
  user_id: string
  project_id: string
  users?: {
    full_name: string
    avatar_url?: string
    email: string
  }
}

export default function MessagingInterface({ user, teams, projects }: MessagingInterfaceProps) {
  const [selectedProject, setSelectedProject] = useState<string | null>(projects[0]?.id || null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [onlineUsers, setOnlineUsers] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch messages for selected project
  useEffect(() => {
    if (!selectedProject) return

    const fetchMessages = async () => {
      const res = await fetch(`/api/messages?projectId=${encodeURIComponent(selectedProject)}`, { cache: "no-store" })
      const json = await res.json()
      if (res.ok) setMessages(json.messages || [])
    }

    fetchMessages()
  }, [selectedProject])

  // Realtime removed for now
  useEffect(() => {}, [selectedProject])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Handle typing indicators (disabled)
  useEffect(() => {}, [selectedProject, user.id])

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedProject) return

    const res = await fetch("/api/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: newMessage, projectId: selectedProject }) })
    if (res.ok) setNewMessage("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleTyping = (typing: boolean) => {
    if (!selectedProject) return

    // Typing indicators removed for now
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !selectedProject) return

    // In a real implementation, you would upload to Vercel Blob here
    // For now, we'll simulate it
    const fileUrl = `/placeholder.svg?height=200&width=300&query=${file.name}`

    const messageData = {
      content: `Shared a file: ${file.name}`,
      message_type: file.type.startsWith("image/") ? "image" : "file",
      file_url: fileUrl,
      file_name: file.name,
      file_size: file.size,
      user_id: user.id,
      project_id: selectedProject,
    }

    await fetch("/api/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(messageData) })
  }

  const filteredMessages = messages.filter(
    (message) =>
      message.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.users?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const selectedProjectData = projects.find((p) => p.id === selectedProject)

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6">
      {/* Sidebar - Projects/Channels */}
      <Card className="w-80 flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Messages</CardTitle>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-1">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Projects</div>
              {projects.map((project) => (
                <motion.button
                  key={project.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedProject(project.id)}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${
                    selectedProject === project.id
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Hash className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{project.name}</p>
                    <p className="text-xs text-slate-500 truncate">{project.teams?.name}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {messages.filter((m) => m.project_id === project.id).length}
                  </Badge>
                </motion.button>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Main Chat Area */}
      <Card className="flex-1 flex flex-col">
        {selectedProject ? (
          <>
            {/* Chat Header */}
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Hash className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{selectedProjectData?.name}</h3>
                    <p className="text-sm text-slate-500">
                      {selectedProjectData?.teams?.name} • {onlineUsers.length} online
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Users className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Search className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View project details</DropdownMenuItem>
                      <DropdownMenuItem>Manage notifications</DropdownMenuItem>
                      <DropdownMenuItem>Export chat</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>

            {/* Messages */}
            <CardContent className="flex-1 p-0">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  <AnimatePresence>
                    {filteredMessages.map((message, index) => {
                      const isOwn = message.user_id === user.id
                      const showAvatar = index === 0 || filteredMessages[index - 1]?.user_id !== message.user_id

                      return (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className={`flex ${isOwn ? "justify-end" : "justify-start"} ${showAvatar ? "mt-4" : "mt-1"}`}
                        >
                          <div className={`flex max-w-[70%] ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
                            {showAvatar && !isOwn && (
                              <Avatar className="w-8 h-8 mr-3">
                                <AvatarImage src={message.users?.avatar_url || "/placeholder.svg"} />
                                <AvatarFallback>
                                  {message.users?.full_name?.charAt(0) || message.users?.email?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                            )}

                            <div className={`${showAvatar && !isOwn ? "" : "ml-11"} ${isOwn ? "mr-0" : ""}`}>
                              {showAvatar && (
                                <div className={`flex items-center mb-1 ${isOwn ? "justify-end" : "justify-start"}`}>
                                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    {isOwn ? "You" : message.users?.full_name || message.users?.email}
                                  </span>
                                  <span className="text-xs text-slate-500 ml-2">
                                    {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                                  </span>
                                </div>
                              )}

                              <div
                                className={`rounded-2xl px-4 py-2 ${
                                  isOwn
                                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
                                }`}
                              >
                                {message.message_type === "image" ? (
                                  <div className="space-y-2">
                                    <img
                                      src={message.file_url || "/placeholder.svg"}
                                      alt={message.file_name}
                                      className="rounded-lg max-w-full h-auto"
                                    />
                                    <p className="text-sm">{message.content}</p>
                                  </div>
                                ) : message.message_type === "file" ? (
                                  <div className="flex items-center space-x-3 p-2 bg-white/10 rounded-lg">
                                    <File className="h-8 w-8" />
                                    <div className="flex-1">
                                      <p className="font-medium">{message.file_name}</p>
                                      <p className="text-xs opacity-75">
                                        {(message.file_size! / 1024 / 1024).toFixed(2)} MB
                                      </p>
                                    </div>
                                    <Button size="sm" variant="ghost">
                                      <Download className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ) : (
                                  <p className="whitespace-pre-wrap">{message.content}</p>
                                )}
                              </div>

                              {/* Message actions */}
                              <div
                                className={`flex items-center mt-1 space-x-2 ${isOwn ? "justify-end" : "justify-start"}`}
                              >
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2 text-xs opacity-0 group-hover:opacity-100"
                                >
                                  <Heart className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2 text-xs opacity-0 group-hover:opacity-100"
                                >
                                  <Reply className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2 text-xs opacity-0 group-hover:opacity-100"
                                >
                                  <MoreVertical className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>

                  {/* Typing indicator */}
                  {typingUsers.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center space-x-2 text-slate-500"
                    >
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                        <div
                          className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        />
                        <div
                          className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        />
                      </div>
                      <span className="text-sm">Someone is typing...</span>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </CardContent>

            {/* Message Input */}
            <div className="border-t p-4">
              <div className="flex items-end space-x-2">
                <div className="flex-1">
                  <div className="relative">
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value)
                        handleTyping(e.target.value.length > 0)
                      }}
                      onKeyPress={handleKeyPress}
                      onBlur={() => handleTyping(false)}
                      className="pr-20 resize-none"
                    />
                    <div className="absolute right-2 top-2 flex items-center space-x-1">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                        accept="image/*,.pdf,.doc,.docx,.txt"
                      />
                      <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()}>
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Smile className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                Select a project to start messaging
              </h3>
              <p className="text-slate-500">Choose a project from the sidebar to view and send messages.</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
