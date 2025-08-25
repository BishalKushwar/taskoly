"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  CalendarIcon,
  Clock,
  MapPin,
  Video,
  Search,
  Grid3X3,
  List,
} from "lucide-react"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isToday,
} from "date-fns"
// Removed Supabase; realtime removed for now
import CreateEventDialog from "./create-event-dialog"
import EventDetailDialog from "./event-detail-dialog"
import { Input } from "@/components/ui/input"

interface CalendarInterfaceProps {
  user: any
  teams: any[]
  events: any[]
  tasks: any[]
  teamMembers: any[]
}

type ViewType = "month" | "week" | "day" | "list"

export default function CalendarInterface({
  user,
  teams,
  events: initialEvents,
  tasks,
  teamMembers,
}: CalendarInterfaceProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewType, setViewType] = useState<ViewType>("month")
  const [events, setEvents] = useState(initialEvents)
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterTeam, setFilterTeam] = useState<string>("all")
  const [filterType, setFilterType] = useState<string>("all")

  // Real-time event updates removed for now
  useEffect(() => {}, [])

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate(direction === "prev" ? subMonths(currentDate, 1) : addMonths(currentDate, 1))
  }

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.start_time)
      return isSameDay(eventDate, date)
    })
  }

  const getTasksForDate = (date: Date) => {
    return tasks.filter((task) => {
      if (!task.due_date) return false
      const taskDate = new Date(task.due_date)
      return isSameDay(taskDate, date)
    })
  }

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTeam = filterTeam === "all" || event.team_id === filterTeam
    const matchesType = filterType === "all" || event.event_type === filterType

    return matchesSearch && matchesTeam && matchesType
  })

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    setIsCreateDialogOpen(true)
  }

  const handleEventClick = (event: any) => {
    setSelectedEvent(event)
  }

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const calendarStart = startOfWeek(monthStart)
    const calendarEnd = endOfWeek(monthEnd)
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

    return (
      <div className="grid grid-cols-7 gap-1">
        {/* Header */}
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="p-2 text-center text-sm font-medium text-slate-500">
            {day}
          </div>
        ))}

        {/* Days */}
        {days.map((day) => {
          const dayEvents = getEventsForDate(day)
          const dayTasks = getTasksForDate(day)
          const isCurrentMonth = isSameMonth(day, currentDate)
          const isCurrentDay = isToday(day)

          return (
            <motion.div
              key={day.toISOString()}
              whileHover={{ scale: 1.02 }}
              className={`min-h-[120px] p-2 border border-slate-200 dark:border-slate-700 cursor-pointer transition-colors ${
                isCurrentMonth ? "bg-white dark:bg-slate-900" : "bg-slate-50 dark:bg-slate-800/50"
              } ${isCurrentDay ? "ring-2 ring-blue-500" : ""} hover:bg-slate-50 dark:hover:bg-slate-800`}
              onClick={() => handleDateClick(day)}
            >
              <div
                className={`text-sm font-medium mb-1 ${
                  isCurrentMonth ? "text-slate-900 dark:text-white" : "text-slate-400"
                } ${isCurrentDay ? "text-blue-600 dark:text-blue-400" : ""}`}
              >
                {format(day, "d")}
              </div>

              <div className="space-y-1">
                {/* Events */}
                {dayEvents.slice(0, 2).map((event) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`text-xs p-1 rounded truncate cursor-pointer ${
                      event.event_type === "meeting"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                        : event.event_type === "deadline"
                          ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                          : "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEventClick(event)
                    }}
                  >
                    {format(new Date(event.start_time), "HH:mm")} {event.title}
                  </motion.div>
                ))}

                {/* Tasks */}
                {dayTasks.slice(0, 1).map((task) => (
                  <div
                    key={task.id}
                    className={`text-xs p-1 rounded truncate border-l-2 ${
                      task.priority === "urgent"
                        ? "border-red-500 bg-red-50 text-red-700 dark:bg-red-900/10 dark:text-red-400"
                        : task.priority === "high"
                          ? "border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-900/10 dark:text-orange-400"
                          : "border-slate-500 bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                  >
                    📋 {task.title}
                  </div>
                ))}

                {/* More indicator */}
                {dayEvents.length + dayTasks.length > 3 && (
                  <div className="text-xs text-slate-500 font-medium">
                    +{dayEvents.length + dayTasks.length - 3} more
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    )
  }

  const renderListView = () => {
    const upcomingEvents = filteredEvents
      .filter((event) => new Date(event.start_time) >= new Date())
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
      .slice(0, 20)

    return (
      <div className="space-y-4">
        {upcomingEvents.map((event) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
          >
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleEventClick(event)}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
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
                      <span className="text-sm text-slate-500">{event.teams?.name}</span>
                    </div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{event.title}</h3>
                    {event.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{event.description}</p>
                    )}
                    <div className="flex items-center space-x-4 text-sm text-slate-500">
                      <div className="flex items-center space-x-1">
                        <CalendarIcon className="h-4 w-4" />
                        <span>{format(new Date(event.start_time), "MMM d, yyyy")}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>
                          {format(new Date(event.start_time), "HH:mm")} - {format(new Date(event.end_time), "HH:mm")}
                        </span>
                      </div>
                      {event.location && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{event.location}</span>
                        </div>
                      )}
                      {event.meeting_url && (
                        <div className="flex items-center space-x-1">
                          <Video className="h-4 w-4" />
                          <span>Video call</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {event.calendar_event_attendees?.slice(0, 3).map((attendee: any) => (
                      <Avatar key={attendee.user_id} className="w-6 h-6">
                        <AvatarImage src={attendee.users?.avatar_url || "/placeholder.svg"} />
                        <AvatarFallback className="text-xs">
                          {attendee.users?.full_name?.charAt(0) || attendee.users?.email?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {(event.calendar_event_attendees?.length || 0) > 3 && (
                      <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs">
                        +{(event.calendar_event_attendees?.length || 0) - 3}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Calendar</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Manage your schedule and team events</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Event
          </Button>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-xl font-semibold min-w-[200px] text-center">{format(currentDate, "MMMM yyyy")}</h2>
                <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                Today
              </Button>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-48"
                />
              </div>

              <Select value={filterTeam} onValueChange={setFilterTeam}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All teams" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All teams</SelectItem>
                  {teams.map((team) => (
                    <SelectItem key={team.teams.id} value={team.teams.id}>
                      {team.teams.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="meeting">Meetings</SelectItem>
                  <SelectItem value="deadline">Deadlines</SelectItem>
                  <SelectItem value="reminder">Reminders</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center border rounded-lg">
                <Button
                  variant={viewType === "month" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewType("month")}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewType === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewType("list")}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar View */}
      <Card>
        <CardContent className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={viewType}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {viewType === "month" ? renderMonthView() : renderListView()}
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Create Event Dialog */}
      <CreateEventDialog
        isOpen={isCreateDialogOpen}
        onClose={() => {
          setIsCreateDialogOpen(false)
          setSelectedDate(null)
        }}
        teams={teams}
        teamMembers={teamMembers}
        currentUser={user}
        selectedDate={selectedDate}
      />

      {/* Event Detail Dialog */}
      {selectedEvent && (
        <EventDetailDialog
          event={selectedEvent}
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          currentUser={user}
        />
      )}
    </div>
  )
}
