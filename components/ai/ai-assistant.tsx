"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { motion, AnimatePresence } from "framer-motion"
import { Bot, Sparkles, Brain, MessageSquare, Calendar, CheckSquare, Users, Send, Loader2, Zap } from "lucide-react"

interface AIMessage {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
  suggestions?: string[]
}

interface AIInsight {
  id: string
  type: "task" | "project" | "team" | "schedule"
  title: string
  description: string
  action?: string
  priority: "high" | "medium" | "low"
}

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<AIMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [insights, setInsights] = useState<AIInsight[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Generate AI insights on component mount
    generateInsights()
  }, [])

  const generateInsights = async () => {
    const mockInsights: AIInsight[] = [
      {
        id: "1",
        type: "task",
        title: "Overdue Tasks Detected",
        description: "You have 3 tasks that are overdue. Consider reassigning or extending deadlines.",
        action: "Review overdue tasks",
        priority: "high",
      },
      {
        id: "2",
        type: "team",
        title: "Team Productivity Insight",
        description: "Your team is 23% more productive on Tuesdays. Consider scheduling important tasks then.",
        priority: "medium",
      },
      {
        id: "3",
        type: "schedule",
        title: "Meeting Optimization",
        description: "You have 4 back-to-back meetings tomorrow. Consider adding buffer time.",
        action: "Reschedule meetings",
        priority: "medium",
      },
    ]
    setInsights(mockInsights)
  }

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch('/api/createMessage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: input }]
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch response from AI')
      }

      const { data } = await response.json()
      const assistantMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: data.choices[0].message.content,
        timestamp: new Date(),
        suggestions: ["Create automated workflow", "Schedule team meeting", "Set up integration", "Generate report"],
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("AI Assistant error:", error)
      const errorMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: "I apologize, but I encountered an error. Please try again or contact support if the issue persists.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }
  

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "low":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "task":
        return CheckSquare
      case "project":
        return Zap
      case "team":
        return Users
      case "schedule":
        return Calendar
      default:
        return Brain
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 z-50"
          size="icon"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatDelay: 3 }}
          >
            <Bot className="h-6 w-6" />
          </motion.div>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[80vh] bg-black/40 backdrop-blur-xl border border-white/10">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
              <Sparkles className="h-5 w-5" />
            </div>
            Taskoly AI Assistant
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="chat" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2 bg-white/5 border border-white/10">
            <TabsTrigger value="chat" className="data-[state=active]:bg-white/10">
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="insights" className="data-[state=active]:bg-white/10">
              <Brain className="h-4 w-4 mr-2" />
              Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="flex-1 flex flex-col mt-4">
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4">
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] p-4 rounded-2xl ${message.type === "user"
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                            : "bg-white/5 border border-white/10 text-white"
                          }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        {message.suggestions && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {message.suggestions.map((suggestion, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="text-xs bg-white/5 border-white/20 hover:bg-white/10"
                              >
                                {suggestion}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {isLoading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                      <div className="flex items-center gap-2 text-white">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">AI is thinking...</span>
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="flex gap-2 mt-4">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything about your projects..."
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-gray-400"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="flex-1 mt-4">
            <ScrollArea className="h-full">
              <div className="space-y-4">
                {insights.map((insight) => {
                  const IconComponent = getInsightIcon(insight.type)
                  return (
                    <motion.div
                      key={insight.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium text-white">{insight.title}</h4>
                            <Badge className={getPriorityColor(insight.priority)}>{insight.priority}</Badge>
                          </div>
                          <p className="text-sm text-gray-300 mb-3">{insight.description}</p>
                          {insight.action && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-white/5 border-white/20 hover:bg-white/10"
                            >
                              {insight.action}
                            </Button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
