"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuthStore } from '@/store/authStore'
import { Toaster, toast } from 'sonner'

interface SocketContextType {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({ socket: null })

export const useSocket = () => useContext(SocketContext)

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const { user, isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated && user?._id) {
      // Derive the base server URL by stripping /api from the API URL
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const socketUrl = apiUrl.replace(/\/api$/, '');
      
      // Initialize socket connection
      const socketInstance = io(socketUrl, {
        withCredentials: true,
      })

      socketInstance.on('connect', () => {
        console.log('Connected to socket server')
        // Register the user ID with the socket server
        socketInstance.emit('register', user._id)
      })

      // Generic listeners for global toasts if we want them here
      socketInstance.on('new_assignment_request', (data) => {
        toast.info('New Assignment Request', {
          description: 'A property owner has sent you a new assignment request!',
        })
      })

      socketInstance.on('assignment_responded', (data) => {
        const isAccepted = data.status === 'Accepted'
        if (isAccepted) {
          toast.success('Assignment Accepted', {
            description: 'An agent has accepted your property assignment.',
          })
        } else {
          toast.error('Assignment Rejected', {
            description: 'An agent has declined your property assignment.',
          })
        }
      })

      socketInstance.on('new_interaction', (data) => {
        toast.info(`New ${data.type} Received`, {
          description: `You have received a new ${data.type.toLowerCase()} for ${data.propertyTitle}.`,
        })
      })

      socketInstance.on('offer_updated', (data) => {
        if (data.status === 'Accepted') {
          toast.success('Offer Accepted!', { description: 'Your cash offer has been accepted.' })
        } else if (data.status === 'Rejected') {
          toast.error('Offer Rejected', { description: 'Your cash offer was rejected.' })
        }
      })

      socketInstance.on('visit_updated', (data) => {
        if (data.status === 'Accepted') {
          toast.success('Visit Scheduled!', { description: 'Your property visit request was accepted.' })
        } else if (data.status === 'Rejected') {
          toast.error('Visit Rejected', { description: 'Your property visit request was rejected.' })
        }
      })

      socketInstance.on('inquiry_updated', (data) => {
        toast.success('Inquiry Update', { description: 'You have a new update on your property inquiry.' })
      })

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSocket(socketInstance)

      return () => {
        socketInstance.disconnect()
      }
    } else if (socket) {
      socket.disconnect()
      setSocket(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user])

  return (
    <SocketContext.Provider value={{ socket }}>
      <Toaster richColors position="top-right" />
      {children}
    </SocketContext.Provider>
  )
}
