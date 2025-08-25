'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { User, Bell, Shield, CreditCard, Users, Save, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import ProtectedRoute from "@/components/auth/protected-route"
import { 
  updateUserProfile, 
  updateUserPassword, 
  updateNotificationSettings, 
  updateTeamSettings,
  getUserProfile,
  getUserPreferences,
  getUserTeams
} from "@/lib/client-actions"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  
  // Profile state
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    bio: ""
  })
  
  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })
  
  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    taskReminders: true,
    teamUpdates: true
  })
  
  // Team settings state
  const [teamData, setTeamData] = useState({
    name: "",
    description: ""
  })
  
  // Loading states
  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [savingNotifications, setSavingNotifications] = useState(false)
  const [savingTeam, setSavingTeam] = useState(false)
  
  // User data
  const [userProfile, setUserProfile] = useState<any>(null)
  const [userPreferences, setUserPreferences] = useState<any>(null)
  const [userTeams, setUserTeams] = useState<any[]>([])

  useEffect(() => {
    if (user) {
      fetchUserData()
    }
  }, [user])

  const fetchUserData = async () => {
    try {
      setLoading(true)
      
      // Fetch user profile
      const profileResult = await getUserProfile(user?.id!)
      if (profileResult.success) {
        setUserProfile(profileResult.data)
        setProfileData({
          firstName: profileResult.data?.full_name?.split(' ')[0] || "",
          lastName: profileResult.data?.full_name?.split(' ').slice(1).join(' ') || "",
          bio: profileResult.data?.bio || ""
        })
      } else {
        console.error('Profile fetch error:', profileResult.error)
      }
      
      // Fetch user preferences
      const preferencesResult = await getUserPreferences(user?.id!)
      if (preferencesResult.success) {
        setUserPreferences(preferencesResult.data)
        setNotificationSettings({
          emailNotifications: preferencesResult.data?.email_notifications ?? true,
          pushNotifications: preferencesResult.data?.push_notifications ?? true,
          taskReminders: preferencesResult.data?.task_reminders ?? true,
          teamUpdates: preferencesResult.data?.team_updates ?? true
        })
      } else {
        console.error('Preferences fetch error:', preferencesResult.error)
      }
      
      // Fetch user teams
      const teamsResult = await getUserTeams(user?.id!)
      if (teamsResult.success) {
        setUserTeams(teamsResult.data || [])
        if (teamsResult.data && teamsResult.data.length > 0) {
          const primaryTeam = teamsResult.data[0].teams
          setTeamData({
            name: primaryTeam.name || "",
            description: primaryTeam.description || ""
          })
        }
      } else {
        console.error('Teams fetch error:', teamsResult.error)
        // Set empty teams array if there's an error
        setUserTeams([])
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      toast({
        title: "Error",
        description: "Failed to load user data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleProfileSave = async () => {
    if (!user) return
    
    setSavingProfile(true)
    try {
      const fullName = `${profileData.firstName} ${profileData.lastName}`.trim()
      const result = await updateUserProfile(user.id, {
        full_name: fullName,
        bio: profileData.bio
      })
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Profile updated successfully",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update profile",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setSavingProfile(false)
    }
  }

  const handlePasswordUpdate = async () => {
    if (!user) return
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      })
      return
    }
    
    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      })
      return
    }
    
    setSavingPassword(true)
    try {
      const result = await updateUserPassword(passwordData.currentPassword, passwordData.newPassword)
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Password updated successfully",
        })
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update password",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update password",
        variant: "destructive",
      })
    } finally {
      setSavingPassword(false)
    }
  }

  const handleNotificationSettingsSave = async () => {
    if (!user) return
    
    setSavingNotifications(true)
    try {
      const result = await updateNotificationSettings(user.id, {
        email_notifications: notificationSettings.emailNotifications,
        push_notifications: notificationSettings.pushNotifications,
        task_reminders: notificationSettings.taskReminders,
        team_updates: notificationSettings.teamUpdates
      })
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Notification settings updated successfully",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update notification settings",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update notification settings",
        variant: "destructive",
      })
    } finally {
      setSavingNotifications(false)
    }
  }

  const handleTeamSettingsSave = async () => {
    if (!userTeams.length) return
    
    setSavingTeam(true)
    try {
      const teamId = userTeams[0].teams.id
      const result = await updateTeamSettings(teamId, {
        name: teamData.name,
        description: teamData.description
      })
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Team settings updated successfully",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update team settings",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update team settings",
        variant: "destructive",
      })
    } finally {
      setSavingTeam(false)
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Settings</h1>
            <p className="text-gray-400 mt-1">Manage your account and team preferences</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Settings */}
              <Card className="glass border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Profile Settings
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Update your personal information and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={userProfile?.avatar_url || user?.user_metadata?.avatar_url || "/placeholder.svg?height=64&width=64"} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                        {user?.email?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent">
                        Change Avatar
                      </Button>
                      <p className="text-sm text-gray-400 mt-1">JPG, PNG or GIF. Max size 2MB.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-white">
                        First Name
                      </Label>
                      <Input
                        id="firstName"
                        placeholder="Enter first name"
                        value={profileData.firstName}
                        onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                        className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-white">
                        Last Name
                      </Label>
                      <Input
                        id="lastName"
                        placeholder="Enter last name"
                        value={profileData.lastName}
                        onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                        className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-white">
                      Bio
                    </Label>
                    <Input
                      id="bio"
                      placeholder="Tell us about yourself"
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                    />
                  </div>

                  <Button 
                    onClick={handleProfileSave}
                    disabled={savingProfile}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {savingProfile ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Notification Settings */}
              <Card className="glass border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Bell className="w-5 h-5 mr-2" />
                    Notifications
                  </CardTitle>
                  <CardDescription className="text-gray-400">Configure how you receive notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-medium">Email Notifications</div>
                      <div className="text-sm text-gray-400">Receive notifications via email</div>
                    </div>
                    <Switch 
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, emailNotifications: checked })}
                    />
                  </div>
                  <Separator className="bg-white/10" />
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-medium">Push Notifications</div>
                      <div className="text-sm text-gray-400">Receive push notifications in browser</div>
                    </div>
                    <Switch 
                      checked={notificationSettings.pushNotifications}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, pushNotifications: checked })}
                    />
                  </div>
                  <Separator className="bg-white/10" />
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-medium">Task Reminders</div>
                      <div className="text-sm text-gray-400">Get reminded about upcoming deadlines</div>
                    </div>
                    <Switch 
                      checked={notificationSettings.taskReminders}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, taskReminders: checked })}
                    />
                  </div>
                  <Separator className="bg-white/10" />
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-medium">Team Updates</div>
                      <div className="text-sm text-gray-400">Receive updates about team activities</div>
                    </div>
                    <Switch 
                      checked={notificationSettings.teamUpdates}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, teamUpdates: checked })}
                    />
                  </div>
                  
                  <Button 
                    onClick={handleNotificationSettingsSave}
                    disabled={savingNotifications}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {savingNotifications ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Notification Settings
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Security Settings */}
              <Card className="glass border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Security
                  </CardTitle>
                  <CardDescription className="text-gray-400">Manage your account security settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword" className="text-white">
                      Current Password
                    </Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      placeholder="Enter current password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-white">
                      New Password
                    </Label>
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="Enter new password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-white">
                      Confirm New Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm new password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                    />
                  </div>
                  <Button 
                    onClick={handlePasswordUpdate}
                    disabled={savingPassword}
                    variant="outline" 
                    className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                  >
                    {savingPassword ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Password"
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {/* Account Info */}
              <Card className="glass border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Account Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-400">Plan</div>
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium">
                        {userTeams.length > 0 ? userTeams[0].teams.subscription_tier : "Free"} Plan
                      </span>
                      <Badge className="bg-gradient-to-r from-blue-600 to-purple-600">Active</Badge>
                    </div>
                  </div>
                  <Separator className="bg-white/10" />
                  <div>
                    <div className="text-sm text-gray-400">Team Members</div>
                    <div className="text-white font-medium">
                      {userTeams.length > 0 ? `${userTeams.length} / ${userTeams[0].teams.max_members || 25}` : "0 / 5"}
                    </div>
                  </div>
                  <Separator className="bg-white/10" />
                  <div>
                    <div className="text-sm text-gray-400">Member Since</div>
                    <div className="text-white font-medium">
                      {userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString() : "N/A"}
                    </div>
                  </div>
                  <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10 bg-transparent">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Manage Billing
                  </Button>
                </CardContent>
              </Card>

              {/* Team Settings */}
              {userTeams.length > 0 ? (
                <Card className="glass border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Users className="w-5 h-5 mr-2" />
                      Team Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="teamName" className="text-white">
                        Team Name
                      </Label>
                      <Input
                        id="teamName"
                        placeholder="Enter team name"
                        value={teamData.name}
                        onChange={(e) => setTeamData({ ...teamData, name: e.target.value })}
                        className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="teamDescription" className="text-white">
                        Team Description
                      </Label>
                      <Input
                        id="teamDescription"
                        placeholder="Enter team description"
                        value={teamData.description}
                        onChange={(e) => setTeamData({ ...teamData, description: e.target.value })}
                        className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                      />
                    </div>
                    <Button 
                      onClick={handleTeamSettingsSave}
                      disabled={savingTeam}
                      variant="outline" 
                      className="w-full border-white/20 text-white hover:bg-white/10 bg-transparent"
                    >
                      {savingTeam ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Team Settings
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card className="glass border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Users className="w-5 h-5 mr-2" />
                      Team Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center py-6">
                      <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-white font-medium mb-2">No Teams Found</h3>
                      <p className="text-gray-400 text-sm mb-4">
                        You're not a member of any teams yet. Create a team or ask to be invited to one.
                      </p>
                      <Button 
                        variant="outline" 
                        className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                        onClick={() => window.location.href = '/dashboard/team'}
                      >
                        Create Team
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
