"use client"

import { useState, useEffect } from "react"
import { Bell, X, AlertCircle, Info, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
// Removed Supabase; future: integrate with Mongo-backed notifications
import { motion, AnimatePresence } from "framer-motion"

interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  read: boolean
  created_at: string
  user_id: string
}

interface NotificationSystemProps {
  notifications: Notification[]
}

export function NotificationSystem({ notifications: initialNotifications }: NotificationSystemProps) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Realtime notifications removed for now
  }, [])

  const markAsRead = async (notificationId: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)))
  }

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id)
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="relative">
      <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)} className="relative">
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </Badge>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 top-full mt-2 w-80 z-50"
          >
            <Card>
              <CardContent className="p-0">
                <div className="flex items-center justify-between p-4 border-b">
                  <h3 className="font-semibold">Notifications</h3>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs">
                        Mark all read
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">No notifications yet</div>
                  ) : (
                    notifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`p-4 border-b last:border-b-0 hover:bg-muted/50 cursor-pointer ${
                          !notification.read ? "bg-blue-50/50" : ""
                        }`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start gap-3">
                          {getIcon(notification.type)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm truncate">{notification.title}</p>
                              {!notification.read && <div className="h-2 w-2 bg-blue-500 rounded-full" />}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {new Date(notification.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
