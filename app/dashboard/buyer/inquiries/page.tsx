"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { MessageSquare } from "lucide-react"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import ChatBox from "@/components/ui/ChatBox"

export default function BuyerInquiriesPage() {
  const [inquiries, setInquiries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeChat, setActiveChat] = useState<string | null>(null)

  useEffect(() => {
    fetchInquiries()
  }, [])

  const fetchInquiries = async () => {
    try {
      const res = await api.get("/interactions/inquiries")
      setInquiries(res.data)
      if (res.data.length > 0 && !activeChat) {
        setActiveChat(res.data[0]._id)
      }
    } catch (err) {
      console.error("Failed to fetch inquiries:", err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-8">Loading chats...</div>

  if (inquiries.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
          <p className="text-muted-foreground mt-1">Chat with property hosts.</p>
        </div>
        <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed">
          <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-xl font-bold mb-2">No chats yet</h3>
          <p className="text-muted-foreground mb-6">You haven't started any conversations with property hosts.</p>
          <Button asChild>
            <Link href="/properties">Browse Properties</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-4 shrink-0">
        <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
      </div>
      
      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* Chat List (Sidebar) */}
        <div className="w-1/3 bg-card border rounded-xl flex flex-col overflow-hidden shrink-0">
          <div className="p-4 border-b bg-muted/30">
            <h2 className="font-bold text-lg">My Chats</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {inquiries.map((inquiry) => {
              const image = inquiry.propertyId?.images?.[0] || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80";
              return (
              <div 
                key={inquiry._id} 
                className={`p-4 border-b cursor-pointer transition-colors flex items-start gap-3 ${activeChat === inquiry._id ? 'bg-primary/10 border-l-4 border-l-primary' : 'hover:bg-muted/50 border-l-4 border-l-transparent'}`}
                onClick={() => setActiveChat(inquiry._id)}
              >
                <img src={image} alt="Property" className="w-10 h-10 rounded-md object-cover shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{inquiry.propertyId?.title || "Property Chat"}</div>
                  <div className="text-sm truncate text-muted-foreground">
                    {(() => {
                      const partner = inquiry.propertyId?.agentId || inquiry.propertyId?.ownerId;
                      const role = inquiry.propertyId?.agentId ? "Agent" : "Owner";
                      if (partner && typeof partner === 'object' && partner.firstName) {
                        return `${role}: ${partner.firstName} ${partner.lastName}`;
                      }
                      return "Property Host";
                    })()}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 flex justify-end">
                    <span>{new Date(inquiry.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            )})}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-card border rounded-xl overflow-hidden min-w-0">
          {activeChat ? (
            <ChatBox 
              inquiryId={activeChat} 
              propertyTitle={inquiries.find(i => i._id === activeChat)?.propertyId?.title}
              propertyImage={inquiries.find(i => i._id === activeChat)?.propertyId?.images?.[0]}
              chatPartnerName={(() => {
                const activeInq = inquiries.find(i => i._id === activeChat);
                const partner = activeInq?.propertyId?.agentId || activeInq?.propertyId?.ownerId;
                if (partner && typeof partner === 'object' && partner.firstName) {
                  return `${partner.firstName} ${partner.lastName}`;
                }
                return undefined;
              })()}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground flex-col bg-muted/10">
              <MessageSquare className="h-12 w-12 mb-4 opacity-50" />
              <p>Select a chat to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
