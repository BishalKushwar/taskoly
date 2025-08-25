"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { CalendarIcon, Loader2, Users, MapPin, Video } from "lucide-react"
import { format } from "date-fns"
// Removed Supabase; events API not yet implemented

interface CreateEventDialogProps {
  isOpen: boolean
  onClose: () => void
  teams: any[]
  teamMembers: any[]
  currentUser: any
  selectedDate?: Date | null
}

export default function CreateEventDialog({
  isOpen,
  onClose,
  teams,
  teamMembers,
  currentUser,
  selectedDate,
}: CreateEventDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    event_type: "meeting",
    team_id: teams[0]?.teams?.id || "",
    project_id: "",
    location: "",
    meeting_url: "",
    start_date: selectedDate || new Date(),
    start_time: "09:00",
    end_time: "10:00",
    attendees: [] as string[],
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.team_id) return

    setIsLoading(true)

    // Combine date and time
    const startDateTime = new Date(formData.start_date)
    const [startHour, startMinute] = formData.start_time.split(":").map(Number)
    startDateTime.setHours(startHour, startMinute, 0, 0)

    const endDateTime = new Date(formData.start_date)
    const [endHour, endMinute] = formData.end_time.split(":").map(Number)
    endDateTime.setHours(endHour, endMinute, 0, 0)

    const eventData = {
      title: formData.title,
      description: formData.description || null,
      event_type: formData.event_type,
      team_id: formData.team_id,
      project_id: formData.project_id || null,
      location: formData.location || null,
      meeting_url: formData.meeting_url || null,
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      created_by: currentUser.id,
    }

    // TODO: implement /api/calendar/events endpoint if needed
    // For now, just close dialog to keep UI functional
    setFormData({
      title: "",
      description: "",
      event_type: "meeting",
      team_id: teams[0]?.teams?.id || "",
      project_id: "",
      location: "",
      meeting_url: "",
      start_date: new Date(),
      start_time: "09:00",
      end_time: "10:00",
      attendees: [],
    })
    onClose()

    setIsLoading(false)
  }

  const handleAttendeeToggle = (userId: string) => {
    setFormData((prev) => ({
      ...prev,
      attendees: prev.attendees.includes(userId)
        ? prev.attendees.filter((id) => id !== userId)
        : [...prev.attendees, userId],
    }))
  }

  const selectedTeamMembers = teamMembers.filter((member) => member.team_id === formData.team_id)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
          <DialogDescription>Schedule a new event for your team.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="title">Event Title</Label>
              <Input
                id="title"
                placeholder="Enter event title..."
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter event description..."
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Event Type</Label>
              <Select
                value={formData.event_type}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, event_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="deadline">Deadline</SelectItem>
                  <SelectItem value="reminder">Reminder</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Team</Label>
              <Select
                value={formData.team_id}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, team_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.teams.id} value={team.teams.id}>
                      {team.teams.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(formData.start_date, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.start_date}
                    onSelect={(date) => date && setFormData((prev) => ({ ...prev, start_date: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Time</Label>
              <div className="flex items-center space-x-2">
                <Input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData((prev) => ({ ...prev, start_time: e.target.value }))}
                  className="flex-1"
                />
                <span className="text-sm text-slate-500">to</span>
                <Input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData((prev) => ({ ...prev, end_time: e.target.value }))}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">
                <MapPin className="h-4 w-4 inline mr-1" />
                Location
              </Label>
              <Input
                id="location"
                placeholder="Enter location..."
                value={formData.location}
                onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="meeting_url">
                <Video className="h-4 w-4 inline mr-1" />
                Meeting URL
              </Label>
              <Input
                id="meeting_url"
                placeholder="https://..."
                value={formData.meeting_url}
                onChange={(e) => setFormData((prev) => ({ ...prev, meeting_url: e.target.value }))}
              />
            </div>
          </div>

          {/* Attendees */}
          <div className="space-y-2">
            <Label>
              <Users className="h-4 w-4 inline mr-1" />
              Attendees
            </Label>
            <div className="max-h-32 overflow-y-auto border rounded-lg p-3 space-y-2">
              {selectedTeamMembers.map((member) => (
                <div key={member.users.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={member.users.id}
                    checked={formData.attendees.includes(member.users.id)}
                    onCheckedChange={() => handleAttendeeToggle(member.users.id)}
                  />
                  <Label htmlFor={member.users.id} className="flex items-center space-x-2 cursor-pointer">
                    <span className="text-sm">{member.users.full_name || member.users.email}</span>
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !formData.title.trim()}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Event"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
