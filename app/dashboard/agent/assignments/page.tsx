"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import api from "@/lib/api"
import { Check, X, MapPin, Building2, FileText, User } from "lucide-react"
import { useSocket } from "@/components/providers/SocketProvider"
import { useRouter } from "next/navigation"

interface Assignment {
  _id: string;
  propertyId: {
    _id: string;
    title: string;
    location: { city: string; state: string };
    price: number;
    status: string;
  };
  ownerId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  status: string;
  commissionInfo: string;
  createdAt: string;
}

export default function AgentAssignmentsPage() {
  const router = useRouter()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAssignments = async () => {
    try {
      const res = await api.get("/assignments")
      setAssignments(res.data)
    } catch (error) {
      console.error("Failed to fetch assignments:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAssignments()
  }, [])

  const { socket } = useSocket()

  useEffect(() => {
    if (!socket) return

    socket.on('new_assignment_request', () => {
      fetchAssignments()
    })

    return () => {
      socket.off('new_assignment_request')
    }
  }, [socket])

  const handleRespond = async (id: string, status: 'Accepted' | 'Rejected') => {
    try {
      await api.put(`/assignments/${id}/respond`, { status })
      // Refresh list
      fetchAssignments()
    } catch (error) {
      console.error("Failed to respond to assignment:", error)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price)
  }

  const pendingAssignments = assignments.filter(a => a.status === 'Pending')
  const historyAssignments = assignments.filter(a => a.status !== 'Pending')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Assignment Requests</h1>
        <p className="text-muted-foreground">Manage property management requests from owners.</p>
      </div>

      <div className="grid gap-6">
        <h2 className="text-xl font-semibold tracking-tight mt-4">Pending Requests ({pendingAssignments.length})</h2>
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading requests...</div>
        ) : pendingAssignments.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium">No Pending Requests</h3>
              <p className="text-muted-foreground mt-1 max-w-sm">You have no new property assignment requests at the moment.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {pendingAssignments.map((assignment) => (
              <Card 
                key={assignment._id} 
                className="overflow-hidden border-primary/20 shadow-md cursor-pointer hover:shadow-lg transition-all"
                onClick={() => router.push(`/dashboard/agent/assignments/${assignment.propertyId._id}`)}
              >
                <div className="bg-primary/5 p-4 border-b flex justify-between items-center">
                  <div className="flex items-center gap-2 text-primary font-medium">
                    <Building2 className="h-4 w-4" /> New Request
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(assignment.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <h3 className="font-bold text-xl mb-1">{assignment.propertyId.title}</h3>
                    <div className="flex items-center text-sm text-muted-foreground gap-1.5 mb-3">
                      <MapPin className="h-4 w-4" /> 
                      {assignment.propertyId.location.city}, {assignment.propertyId.location.state}
                    </div>
                    <div className="font-semibold text-lg text-primary">
                      {formatPrice(assignment.propertyId.price)}
                    </div>
                  </div>

                  <div className="bg-muted/30 p-3 rounded-lg text-sm border space-y-2">
                    <div className="flex items-center gap-2 font-medium">
                      <User className="h-4 w-4" /> Owner: {assignment.ownerId.firstName} {assignment.ownerId.lastName}
                    </div>
                    {assignment.commissionInfo && (
                      <div className="text-muted-foreground">
                        <span className="font-medium text-foreground">Commission:</span> {assignment.commissionInfo}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button 
                      className="flex-1 gap-2 bg-green-600 hover:bg-green-700 text-white" 
                      onClick={(e) => { e.stopPropagation(); handleRespond(assignment._id, 'Accepted') }}
                    >
                      <Check className="h-4 w-4" /> Accept
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1 gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                      onClick={(e) => { e.stopPropagation(); handleRespond(assignment._id, 'Rejected') }}
                    >
                      <X className="h-4 w-4" /> Decline
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {historyAssignments.length > 0 && (
          <>
            <h2 className="text-xl font-semibold tracking-tight mt-8">Past Assignments</h2>
            <div className="bg-card border rounded-lg overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                  <tr>
                    <th className="px-4 py-3">Property</th>
                    <th className="px-4 py-3">Owner</th>
                    <th className="px-4 py-3">Commission</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {historyAssignments.map((assignment) => (
                    <tr key={assignment._id} className="border-b last:border-0">
                      <td className="px-4 py-3 font-medium">{assignment.propertyId.title}</td>
                      <td className="px-4 py-3">{assignment.ownerId.firstName} {assignment.ownerId.lastName}</td>
                      <td className="px-4 py-3 text-muted-foreground">{assignment.commissionInfo || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          assignment.status === 'Accepted' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {assignment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
