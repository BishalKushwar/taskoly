'use client'

import { useEffect, useState } from "react"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import BillingSettings from "@/components/billing/billing-settings"
import { useAuth } from "@/lib/auth-context"
// Removed Supabase
import ProtectedRoute from "@/components/auth/protected-route"

export default function BillingPage() {
  const { user } = useAuth()
  const [teams, setTeams] = useState<any[]>([])
  const [plans, setPlans] = useState<any[]>([])
  const [billingHistory, setBillingHistory] = useState<any[]>([])
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    try {
      setDataLoading(true)
      
      // Fetch user's teams; billing not implemented, so pass placeholders
      const teamsRes = await fetch('/api/teams', { cache: 'no-store' })
      const teamsJson = await teamsRes.json()
      const teamsData = (teamsJson.teams || []).map((t: any) => ({ teams: t, role: t.role }))

      setTeams(teamsData)
      setPlans([
        { id: 'free', name: 'Free', price_monthly: 0, features: ['Basic project management', 'Task boards'] },
      ])
      setBillingHistory([])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setDataLoading(false)
    }
  }

  if (dataLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <BillingSettings user={user} teams={teams} plans={plans} billingHistory={billingHistory} />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
