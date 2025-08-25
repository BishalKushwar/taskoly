"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Label } from "@/components/ui/label"
import { motion } from "framer-motion"
import {
  Plug,
  Github,
  Calendar,
  HardDrive,
  Video,
  Mail,
  Trello,
  Figma,
  Slack,
  Check,
  Plus,
  ExternalLink,
  Zap,
} from "lucide-react"

interface Integration {
  id: string
  name: string
  description: string
  icon: any
  category: "productivity" | "communication" | "development" | "design" | "storage"
  isConnected: boolean
  isPopular: boolean
  features: string[]
  setupUrl?: string
}

interface Automation {
  id: string
  name: string
  description: string
  trigger: string
  action: string
  isActive: boolean
  integrations: string[]
}

export function IntegrationHub() {
  const [isOpen, setIsOpen] = useState(false)
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [automations, setAutomations] = useState<Automation[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  useEffect(() => {
    // Initialize integrations
    const mockIntegrations: Integration[] = [
      {
        id: "github",
        name: "GitHub",
        description: "Sync repositories, issues, and pull requests",
        icon: Github,
        category: "development",
        isConnected: false,
        isPopular: true,
        features: ["Repository sync", "Issue tracking", "PR notifications", "Commit history"],
        setupUrl: "https://github.com/apps/taskoly",
      },
      {
        id: "google-drive",
        name: "Google Drive",
        description: "Access and share files from Google Drive",
        icon: HardDrive,
        category: "storage",
        isConnected: true,
        isPopular: true,
        features: ["File sharing", "Document collaboration", "Auto-sync", "Version control"],
      },
      {
        id: "slack",
        name: "Slack",
        description: "Send notifications and updates to Slack channels",
        icon: Slack,
        category: "communication",
        isConnected: false,
        isPopular: true,
        features: ["Channel notifications", "Direct messages", "Status updates", "Bot commands"],
      },
      {
        id: "zoom",
        name: "Zoom",
        description: "Schedule and join meetings directly from tasks",
        icon: Video,
        category: "communication",
        isConnected: false,
        isPopular: true,
        features: ["Meeting scheduling", "Calendar sync", "Recording access", "Participant management"],
      },
      {
        id: "google-calendar",
        name: "Google Calendar",
        description: "Sync tasks and events with Google Calendar",
        icon: Calendar,
        category: "productivity",
        isConnected: true,
        isPopular: true,
        features: ["Two-way sync", "Event creation", "Reminder notifications", "Availability checking"],
      },
      {
        id: "figma",
        name: "Figma",
        description: "Embed designs and prototypes in your projects",
        icon: Figma,
        category: "design",
        isConnected: false,
        isPopular: false,
        features: ["Design embedding", "Comment sync", "Version tracking", "Prototype sharing"],
      },
      {
        id: "trello",
        name: "Trello",
        description: "Import boards and cards from Trello",
        icon: Trello,
        category: "productivity",
        isConnected: false,
        isPopular: false,
        features: ["Board import", "Card migration", "Label mapping", "Member sync"],
      },
      {
        id: "gmail",
        name: "Gmail",
        description: "Create tasks from emails and send updates",
        icon: Mail,
        category: "productivity",
        isConnected: false,
        isPopular: true,
        features: ["Email to task", "Update notifications", "Attachment sync", "Thread tracking"],
      },
    ]

    const mockAutomations: Automation[] = [
      {
        id: "1",
        name: "GitHub Issue to Task",
        description: "Automatically create tasks when new GitHub issues are opened",
        trigger: "New GitHub issue",
        action: "Create task in project",
        isActive: true,
        integrations: ["github"],
      },
      {
        id: "2",
        name: "Slack Notifications",
        description: "Send Slack messages when tasks are completed",
        trigger: "Task completed",
        action: "Send Slack notification",
        isActive: false,
        integrations: ["slack"],
      },
      {
        id: "3",
        name: "Calendar Sync",
        description: "Create calendar events for tasks with due dates",
        trigger: "Task with due date created",
        action: "Create Google Calendar event",
        isActive: true,
        integrations: ["google-calendar"],
      },
    ]

    setIntegrations(mockIntegrations)
    setAutomations(mockAutomations)
  }, [])

  const toggleIntegration = (id: string) => {
    setIntegrations((prev) =>
      prev.map((integration) =>
        integration.id === id ? { ...integration, isConnected: !integration.isConnected } : integration,
      ),
    )
  }

  const toggleAutomation = (id: string) => {
    setAutomations((prev) =>
      prev.map((automation) => (automation.id === id ? { ...automation, isActive: !automation.isActive } : automation)),
    )
  }

  const filteredIntegrations =
    selectedCategory === "all"
      ? integrations
      : integrations.filter((integration) => integration.category === selectedCategory)

  const categories = [
    { id: "all", name: "All", count: integrations.length },
    {
      id: "productivity",
      name: "Productivity",
      count: integrations.filter((i) => i.category === "productivity").length,
    },
    {
      id: "communication",
      name: "Communication",
      count: integrations.filter((i) => i.category === "communication").length,
    },
    { id: "development", name: "Development", count: integrations.filter((i) => i.category === "development").length },
    { id: "design", name: "Design", count: integrations.filter((i) => i.category === "design").length },
    { id: "storage", name: "Storage", count: integrations.filter((i) => i.category === "storage").length },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10">
          <Plug className="h-4 w-4 mr-2" />
          Integrations
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl h-[85vh] bg-black/40 backdrop-blur-xl border border-white/10">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
              <Plug className="h-5 w-5" />
            </div>
            Integration Hub
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="integrations" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2 bg-white/5 border border-white/10">
            <TabsTrigger value="integrations" className="data-[state=active]:bg-white/10">
              <Plug className="h-4 w-4 mr-2" />
              Integrations
            </TabsTrigger>
            <TabsTrigger value="automations" className="data-[state=active]:bg-white/10">
              <Zap className="h-4 w-4 mr-2" />
              Automations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="integrations" className="flex-1 flex flex-col mt-4">
            <div className="flex gap-2 mb-4 overflow-x-auto">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className={
                    selectedCategory === category.id
                      ? "bg-gradient-to-r from-blue-600 to-purple-600"
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  }
                >
                  {category.name} ({category.count})
                </Button>
              ))}
            </div>

            <ScrollArea className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredIntegrations.map((integration) => {
                  const IconComponent = integration.icon
                  return (
                    <motion.div
                      key={integration.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group"
                    >
                      <Card className="h-full bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
                                <IconComponent className="h-5 w-5" />
                              </div>
                              <div>
                                <CardTitle className="text-white text-sm">{integration.name}</CardTitle>
                                {integration.isPopular && (
                                  <Badge className="mt-1 bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                                    Popular
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {integration.isConnected && <Check className="h-4 w-4 text-green-400" />}
                              <Switch
                                checked={integration.isConnected}
                                onCheckedChange={() => toggleIntegration(integration.id)}
                              />
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-sm text-gray-300 mb-3">{integration.description}</p>
                          <div className="space-y-2">
                            <Label className="text-xs text-gray-400">Features:</Label>
                            <div className="flex flex-wrap gap-1">
                              {integration.features.slice(0, 3).map((feature, index) => (
                                <Badge key={index} variant="outline" className="text-xs bg-white/5 border-white/20">
                                  {feature}
                                </Badge>
                              ))}
                              {integration.features.length > 3 && (
                                <Badge variant="outline" className="text-xs bg-white/5 border-white/20">
                                  +{integration.features.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                          {integration.setupUrl && !integration.isConnected && (
                            <Button
                              size="sm"
                              className="w-full mt-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                              onClick={() => window.open(integration.setupUrl, "_blank")}
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Connect
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="automations" className="flex-1 flex flex-col mt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Smart Automations</h3>
              <Button
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                Create Automation
              </Button>
            </div>

            <ScrollArea className="flex-1">
              <div className="space-y-4">
                {automations.map((automation) => (
                  <motion.div
                    key={automation.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
                          <Zap className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="font-medium text-white">{automation.name}</h4>
                          <p className="text-sm text-gray-300">{automation.description}</p>
                        </div>
                      </div>
                      <Switch checked={automation.isActive} onCheckedChange={() => toggleAutomation(automation.id)} />
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">Trigger:</span>
                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">{automation.trigger}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">Action:</span>
                        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                          {automation.action}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-xs text-gray-400">Integrations:</span>
                      {automation.integrations.map((integrationId) => {
                        const integration = integrations.find((i) => i.id === integrationId)
                        if (!integration) return null
                        const IconComponent = integration.icon
                        return (
                          <div key={integrationId} className="flex items-center gap-1">
                            <IconComponent className="h-3 w-3" />
                            <span className="text-xs text-gray-300">{integration.name}</span>
                          </div>
                        )
                      })}
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
