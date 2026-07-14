"use client"

import { useState, useEffect, useRef } from "react"
import { Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuthStore } from "@/store/authStore"
import api from "@/lib/api"
import { useSocket } from "@/components/providers/SocketProvider"

interface Message {
  _id: string
  text: string
  senderId: {
    _id: string
    firstName: string
    lastName: string
    profileImage?: string
    role: string
  }
  createdAt: string
}

interface ChatBoxProps {
  inquiryId?: string
  propertyTitle?: string
  propertyImage?: string
  chatPartnerName?: string
  collaborationPropertyId?: string
}

export default function ChatBox({ inquiryId, propertyTitle, propertyImage, chatPartnerName, collaborationPropertyId }: ChatBoxProps) {
  const { socket } = useSocket()
  const { user } = useAuthStore()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!socket) return

    const handleNewMessage = (msg: Message) => {
      // Only append if the message belongs to the current inquiry or collaboration property chat
      const matchesInquiry = inquiryId && (msg as any).inquiryId === inquiryId;
      const matchesCollaboration = collaborationPropertyId && (msg as any).propertyId === collaborationPropertyId;
      
      if (matchesInquiry || matchesCollaboration) {
        setMessages((prev) => {
          if (prev.find(p => p._id === msg._id)) return prev;
          return [...prev, msg]
        })
      }
    }

    socket.on("new_message", handleNewMessage)

    return () => {
      socket.off("new_message", handleNewMessage)
    }
  }, [socket, inquiryId, collaborationPropertyId])

  useEffect(() => {
    const fetchMessages = async () => {
      if (!inquiryId && !collaborationPropertyId) return;
      try {
        const endpoint = collaborationPropertyId 
          ? `/interactions/properties/${collaborationPropertyId}/collaboration-messages`
          : `/interactions/inquiries/${inquiryId}/messages`;
        const res = await api.get(endpoint)
        setMessages(res.data)
      } catch (error) {
        console.error("Failed to load messages", error)
      } finally {
        setLoading(false)
      }
    }
    fetchMessages()
  }, [inquiryId, collaborationPropertyId])

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || sending || (!inquiryId && !collaborationPropertyId)) return

    setSending(true)
    try {
      const endpoint = collaborationPropertyId 
          ? `/interactions/properties/${collaborationPropertyId}/collaboration-messages`
          : `/interactions/inquiries/${inquiryId}/messages`;
      const res = await api.post(endpoint, { text: newMessage })
      setMessages(prev => [...prev, res.data])
      setNewMessage("")
    } catch (error) {
      console.error("Failed to send message", error)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-background rounded-xl border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b bg-muted/30 flex items-center gap-3">
        {(propertyImage || propertyTitle) && (
          <img src={propertyImage || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"} alt={propertyTitle || "Property"} className="w-12 h-12 rounded-md object-cover" />
        )}
        <div>
          <h3 className="font-semibold text-lg">{propertyTitle ? `Chat about: ${propertyTitle}` : 'Chat History'}</h3>
          {chatPartnerName && <p className="text-sm text-muted-foreground mt-0.5">{chatPartnerName}</p>}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/10">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-muted-foreground pt-10">
            No messages yet. Send a message to start the conversation!
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId._id === user?._id
            return (
              <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                  isMe 
                    ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                    : 'bg-muted text-foreground rounded-tl-sm border'
                }`}>
                  <p className="text-sm">{msg.text}</p>
                  <span className={`text-[10px] opacity-70 mt-1 block ${isMe ? 'text-right' : 'text-left'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-background border-t">
        <form onSubmit={handleSend} className="flex gap-2">
          <Input 
            value={newMessage} 
            onChange={(e) => setNewMessage(e.target.value)} 
            placeholder="Type your message..." 
            className="flex-1 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary/50"
            disabled={sending}
          />
          <Button type="submit" size="icon" disabled={!newMessage.trim() || sending} className="rounded-full h-10 w-10 shrink-0">
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </div>
  )
}
