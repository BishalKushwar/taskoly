"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  CreditCard,
  Download,
  Users,
  FolderKanban,
  HardDrive,
  Crown,
  AlertCircle,
  CheckCircle,
  ExternalLink,
} from "lucide-react"
import { format } from "date-fns"
// Removed Supabase

interface BillingSettingsProps {
  user: any
  teams: any[]
  plans: any[]
  billingHistory: any[]
}

export default function BillingSettings({ user, teams, plans, billingHistory }: BillingSettingsProps) {
  const [selectedTeam, setSelectedTeam] = useState(teams[0]?.teams?.id || null)
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const selectedTeamData = teams.find((t) => t.teams.id === selectedTeam)
  const currentSubscription = selectedTeamData?.teams?.subscriptions?.[0]
  const currentPlan = currentSubscription?.subscription_plans

  const handleUpgrade = async (planId: string) => {
    setIsLoading(true)
    // In a real implementation, this would integrate with Stripe
    // For now, we'll simulate the upgrade process

    console.log("Upgrading to plan:", planId)
    // Redirect to Stripe Checkout or handle payment processing

    setIsLoading(false)
    setIsUpgradeDialogOpen(false)
  }

  const handleCancelSubscription = async () => {
    if (!currentSubscription) return

    const confirmed = confirm(
      "Are you sure you want to cancel your subscription? You'll still have access until the end of your billing period.",
    )
    if (!confirmed) return

    setIsLoading(true)

    // TODO: implement subscription cancel endpoint
    window.location.reload()

    setIsLoading(false)
  }

  const getUsageData = () => {
    // In a real implementation, this would fetch actual usage data
    return {
      projects: { current: 8, limit: currentPlan?.name === "Free" ? 3 : 25 },
      members: { current: 12, limit: currentPlan?.name === "Free" ? 5 : 25 },
      storage: { current: 2.4, limit: currentPlan?.name === "Free" ? 1 : 50 },
    }
  }

  const usage = getUsageData()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Billing & Subscription</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">Manage your subscription, billing, and usage</p>
      </div>

      {/* Team Selector */}
      {teams.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Team</CardTitle>
            <CardDescription>Choose which team's billing you want to manage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teams.map((team) => (
                <motion.div key={team.teams.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Card
                    className={`cursor-pointer transition-colors ${
                      selectedTeam === team.teams.id
                        ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                    onClick={() => setSelectedTeam(team.teams.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{team.teams.name}</h3>
                          <p className="text-sm text-slate-500">
                            {team.teams.subscriptions?.[0]?.subscription_plans?.name || "Free"} Plan
                          </p>
                        </div>
                        <Badge variant={team.role === "owner" ? "default" : "secondary"}>{team.role}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedTeamData && (
        <>
          {/* Current Plan */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Crown className="h-5 w-5 text-yellow-500" />
                    <span>Current Plan</span>
                  </CardTitle>
                  <CardDescription>Your current subscription details</CardDescription>
                </div>
                {currentPlan?.name !== "Enterprise" && (
                  <Button onClick={() => setIsUpgradeDialogOpen(true)}>Upgrade Plan</Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    {currentPlan?.name || "Free"} Plan
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    {currentPlan?.name === "Free"
                      ? "Perfect for getting started"
                      : `$${
                          currentSubscription?.billing_cycle === "yearly"
                            ? (currentPlan?.price_yearly / 12).toFixed(0)
                            : currentPlan?.price_monthly
                        }/month`}
                  </p>

                  {currentSubscription && (
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Status</span>
                        <Badge variant={currentSubscription.status === "active" ? "default" : "destructive"}>
                          {currentSubscription.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Billing Cycle</span>
                        <span className="capitalize">{currentSubscription.billing_cycle}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Next Billing</span>
                        <span>{format(new Date(currentSubscription.current_period_end), "MMM d, yyyy")}</span>
                      </div>
                      {currentSubscription.cancel_at_period_end && (
                        <div className="flex items-center space-x-2 text-orange-600 dark:text-orange-400">
                          <AlertCircle className="h-4 w-4" />
                          <span>Subscription will cancel at period end</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-medium mb-3">Plan Features</h4>
                  <div className="space-y-2">
                    {(currentPlan?.features || ["Basic project management", "Task boards", "Team messaging"]).map(
                      (feature: string, index: number) => (
                        <div key={index} className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-slate-600 dark:text-slate-400">{feature}</span>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>

              {currentSubscription && !currentSubscription.cancel_at_period_end && (
                <div className="mt-6 pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={handleCancelSubscription}
                    disabled={isLoading}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
                  >
                    Cancel Subscription
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Usage Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Usage Overview</CardTitle>
              <CardDescription>Monitor your current usage against plan limits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FolderKanban className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">Projects</span>
                    </div>
                    <span className="text-sm text-slate-500">
                      {usage.projects.current}/{usage.projects.limit === null ? "∞" : usage.projects.limit}
                    </span>
                  </div>
                  <Progress
                    value={usage.projects.limit ? (usage.projects.current / usage.projects.limit) * 100 : 0}
                    className="h-2"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">Team Members</span>
                    </div>
                    <span className="text-sm text-slate-500">
                      {usage.members.current}/{usage.members.limit === null ? "∞" : usage.members.limit}
                    </span>
                  </div>
                  <Progress
                    value={usage.members.limit ? (usage.members.current / usage.members.limit) * 100 : 0}
                    className="h-2"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <HardDrive className="h-4 w-4 text-purple-500" />
                      <span className="text-sm font-medium">Storage</span>
                    </div>
                    <span className="text-sm text-slate-500">
                      {usage.storage.current}GB/{usage.storage.limit === null ? "∞" : `${usage.storage.limit}GB`}
                    </span>
                  </div>
                  <Progress
                    value={usage.storage.limit ? (usage.storage.current / usage.storage.limit) * 100 : 0}
                    className="h-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Billing History */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Billing History</CardTitle>
                  <CardDescription>Your recent invoices and payments</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {billingHistory.length > 0 ? (
                <div className="space-y-4">
                  {billingHistory.map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            invoice.status === "paid"
                              ? "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                              : "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                          }`}
                        >
                          {invoice.status === "paid" ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : (
                            <AlertCircle className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">
                            ${invoice.amount} - {invoice.subscriptions?.teams?.name}
                          </p>
                          <p className="text-sm text-slate-500">
                            {format(new Date(invoice.billing_date), "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={invoice.status === "paid" ? "default" : "destructive"}>{invoice.status}</Badge>
                        {invoice.invoice_url && (
                          <Button variant="ghost" size="sm" asChild>
                            <a href={invoice.invoice_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-500">No billing history available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Upgrade Dialog */}
      <Dialog open={isUpgradeDialogOpen} onOpenChange={setIsUpgradeDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Upgrade Your Plan</DialogTitle>
            <DialogDescription>Choose a plan that fits your team's needs</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plans
              .filter((plan) => plan.name !== currentPlan?.name)
              .map((plan) => (
                <Card key={plan.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <CardDescription>
                      <span className="text-2xl font-bold">${plan.price_monthly}</span>/month
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      {plan.features.slice(0, 4).map((feature: string, index: number) => (
                        <div key={index} className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                    <Button className="w-full" onClick={() => handleUpgrade(plan.id)} disabled={isLoading}>
                      Upgrade to {plan.name}
                    </Button>
                  </CardContent>
                </Card>
              ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
