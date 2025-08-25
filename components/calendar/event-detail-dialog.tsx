"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  CalendarIcon,
  Clock,
  MapPin,
  Video,
  Users,
  Edit,
  Trash2,
  ExternalLink,
  Check,
  X,
  AlertCircle,
} from "lucide-react"
import { format } from "date-fns"
// Removed Supabase; events API not yet implemented

interface EventDetailDialogProps {
  event: any
  isOpen: boolean
  onClose: () => void
  currentUser: any
}

export default function EventDetailDialog({ event, isOpen, onClose, currentUser }: EventDetailDialogProps) {
  const [attendanceStatus, setAttendanceStatus] = useState<string>("pending")
  const [isUpdating, setIsUpdating] = useState(false)

  const handleAttendanceUpdate = async (status: string) => {
    setIsUpdating(true)

    // TODO: implement attendance update when calendar endpoints exist
    setAttendanceStatus(status)

    setIsUpdating(false)
  }

  const handleDeleteEvent = async () => {
    if (confirm("Are you sure you want to delete this event?")) {
      // TODO: implement calendar delete endpoint
      onClose()
    }
  }

  const canEdit = event.created_by === currentUser.id
  const userAttendance = event.calendar_event_attendees?.find((attendee: any) => attendee.user_id === currentUser.id)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-xl">{event.title}</DialogTitle>
              <DialogDescription className="mt-1">
                Created by {event.created_by_user?.full_name || event.created_by_user?.email}
              </DialogDescription>
            </div>
            <Badge
              className={
                event.event_type === "meeting"
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                  : event.event_type === "deadline"
                    ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                    : "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
              }
            >
              {event.event_type}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Description */}
          {event.description && (
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-slate-600 dark:text-slate-400">{event.description}</p>
            </div>
          )}

          <Separator />

          {/* Event Details */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <CalendarIcon className="h-4 w-4 text-slate-500" />
              <span className="text-sm">{format(new Date(event.start_time), "EEEE, MMMM d, yyyy")}</span>
            </div>

            <div className="flex items-center space-x-3">
              <Clock className="h-4 w-4 text-slate-500" />
              <span className="text-sm">
                {format(new Date(event.start_time), "HH:mm")} - {format(new Date(event.end_time), "HH:mm")}
              </span>
            </div>

            {event.location && (
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-slate-500" />
                <span className="text-sm">{event.location}</span>
              </div>
            )}

            {event.meeting_url && (
              <div className="flex items-center space-x-3">
                <Video className="h-4 w-4 text-slate-500" />
                <a
                  href={event.meeting_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center space-x-1"
                >
                  <span>Join meeting</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}

            <div className="flex items-center space-x-3">
              <Users className="h-4 w-4 text-slate-500" />
              <span className="text-sm">{event.teams?.name}</span>
            </div>
          </div>

          {/* Attendees */}
          {event.calendar_event_attendees && event.calendar_event_attendees.length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="font-medium mb-3">Attendees ({event.calendar_event_attendees.length})</h4>
                <div className="space-y-2">
                  {event.calendar_event_attendees.map((attendee: any) => (
                    <div key={attendee.user_id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={attendee.users?.avatar_url || "/placeholder.svg"} />
                          <AvatarFallback className="text-xs">
                            {attendee.users?.full_name?.charAt(0) || attendee.users?.email?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{attendee.users?.full_name || attendee.users?.email}</span>
                      </div>
                      <Badge
                        variant={
                          attendee.status === "accepted"
                            ? "default"
                            : attendee.status === "declined"
                              ? "destructive"
                              : attendee.status === "tentative"
                                ? "secondary"
                                : "outline"
                        }
                        className="text-xs"
                      >
                        {attendee.status === "accepted" && <Check className="h-3 w-3 mr-1" />}
                        {attendee.status === "declined" && <X className="h-3 w-3 mr-1" />}
                        {attendee.status === "tentative" && <AlertCircle className="h-3 w-3 mr-1" />}
                        {attendee.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Attendance Actions */}
          {userAttendance && (
            <>
              <Separator />
              <div>
                <h4 className="font-medium mb-3">Your Response</h4>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant={userAttendance.status === "accepted" ? "default" : "outline"}
                    onClick={() => handleAttendanceUpdate("accepted")}
                    disabled={isUpdating}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant={userAttendance.status === "tentative" ? "default" : "outline"}
                    onClick={() => handleAttendanceUpdate("tentative")}
                    disabled={isUpdating}
                  >
                    <AlertCircle className="h-4 w-4 mr-1" />
                    Maybe
                  </Button>
                  <Button
                    size="sm"
                    variant={userAttendance.status === "declined" ? "destructive" : "outline"}
                    onClick={() => handleAttendanceUpdate("declined")}
                    disabled={isUpdating}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Decline
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* Actions */}
          {canEdit && (
            <>
              <Separator />
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Event
                </Button>
                <Button variant="outline" size="sm" onClick={handleDeleteEvent}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Event
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
