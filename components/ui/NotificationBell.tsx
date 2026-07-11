"use client"

import { useState, useEffect, useRef } from 'react'
import { Bell, Check, Trash2, Mail, Info, Calendar, DollarSign, Activity } from 'lucide-react'
import { useSocket } from '@/components/providers/SocketProvider'
import api from '@/lib/api'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { Button } from './button'

interface Notification {
  _id: string
  title: string
  message: string
  type: string
  isRead: boolean
  relatedId?: string
  createdAt: string
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const { socket } = useSocket()
  const { user } = useAuthStore()
  const router = useRouter()
  const dropdownRef = useRef<HTMLDivElement>(null)

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications')
      setNotifications(data)
    } catch (error) {
      console.error('Error fetching notifications', error)
    }
  }

  useEffect(() => {
    if (user) {
      fetchNotifications()
    }
  }, [user])

  useEffect(() => {
    if (!socket || !user) return

    const handleNewNotification = (notification: Notification) => {
      setNotifications(prev => [notification, ...prev])
    }

    socket.on('new_notification', handleNewNotification)

    return () => {
      socket.off('new_notification', handleNewNotification)
    }
  }, [socket, user])

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const markAsRead = async (id: string, relatedId?: string, type?: string) => {
    try {
      await api.put(`/notifications/${id}/read`)
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n))
      
      setIsOpen(false)

      if (type && user) {
        const roleStr = user.role.toLowerCase()
        if (type === 'Message' || type === 'Inquiry') {
          router.push(`/dashboard/${roleStr}/inquiries`)
        } else if (type === 'Offer') {
          router.push(`/dashboard/${roleStr}/offers`)
        } else if (type === 'Visit') {
          router.push(`/dashboard/${roleStr}/visits`)
        } else {
          router.push(`/dashboard/${roleStr}`)
        }
      }
    } catch (error) {
      console.error('Error marking as read', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all')
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    } catch (error) {
      console.error('Error marking all as read', error)
    }
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  const getIcon = (type: string) => {
    switch (type) {
      case 'Message': return <Mail className="h-4 w-4 text-blue-500" />
      case 'Visit': return <Calendar className="h-4 w-4 text-green-500" />
      case 'Offer': return <DollarSign className="h-4 w-4 text-yellow-500" />
      case 'Status': return <Activity className="h-4 w-4 text-purple-500" />
      default: return <Info className="h-4 w-4 text-muted-foreground" />
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-muted transition-colors"
      >
        <Bell className="h-5 w-5 text-muted-foreground" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full ring-2 ring-background"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-background border rounded-xl shadow-xl overflow-hidden z-50 flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/10">
            <h3 className="font-semibold text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="text-xs text-primary hover:underline font-medium">
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm flex flex-col items-center">
                <Bell className="h-8 w-8 mb-3 opacity-20" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map(notification => (
                  <div 
                    key={notification._id} 
                    onClick={() => markAsRead(notification._id, notification.relatedId, notification.type)}
                    className={`p-4 flex gap-3 cursor-pointer transition-colors hover:bg-muted/50 ${!notification.isRead ? 'bg-primary/5' : ''}`}
                  >
                    <div className="shrink-0 mt-0.5 bg-background border rounded-full p-1.5 shadow-sm">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!notification.isRead ? 'font-semibold' : 'text-muted-foreground font-medium'}`}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-[10px] text-muted-foreground/70 mt-1 uppercase tracking-wider font-semibold">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <div className="shrink-0 flex items-center">
                        <div className="h-2 w-2 bg-primary rounded-full"></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
