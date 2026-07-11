"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import api from "@/lib/api"
import { Calendar as CalendarIcon, Clock, MapPin, Phone, CheckCircle2 } from "lucide-react"
import { useSocket } from "@/components/providers/SocketProvider"

interface Visit {
  _id: string;
  propertyId: {
    _id: string;
    title: string;
    location: { city: string; state: string; address: string };
  };
  buyerId: {
    _id: string;
    firstName: string;
    lastName: string;
    phone?: string;
  };
  date: string;
  timeSlot: string;
  status: string;
}

export default function AgentVisitsPage() {
  const [visits, setVisits] = useState<Visit[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const { socket } = useSocket()

  const fetchVisits = async () => {
    try {
      const res = await api.get("/interactions/visits")
      const sorted = res.data.sort((a: Visit, b: Visit) => new Date(a.date).getTime() - new Date(b.date).getTime())
      setVisits(sorted)
    } catch (error) {
      console.error("Failed to fetch visits:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVisits()
  }, [])

  useEffect(() => {
    if (!socket) return

    const handleNewInteraction = (data: any) => {
      if (data.type === 'Visit') {
        fetchVisits()
      }
    }

    const handleVisitUpdated = (updatedVisit: any) => {
      setVisits(prev => prev.map(v => v._id === updatedVisit._id ? { ...v, status: updatedVisit.status } : v))
    }

    socket.on('new_interaction', handleNewInteraction)
    socket.on('visit_updated', handleVisitUpdated)
    return () => {
      socket.off('new_interaction', handleNewInteraction)
      socket.off('visit_updated', handleVisitUpdated)
    }
  }, [socket])

  const updateVisitStatus = async (visitId: string, status: string) => {
    try {
      await api.put(`/interactions/visits/${visitId}`, { status })
      setVisits(prev => prev.map(v => v._id === visitId ? { ...v, status } : v))
    } catch (error) {
      console.error("Failed to update visit status:", error)
    }
  }

  const markedDates = visits.map(v => {
    const d = new Date(v.date)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  })

  // Filter visits for the selected date
  const filteredVisits = visits.filter(visit => {
    const visitDate = new Date(visit.date)
    return visitDate.getDate() === selectedDate.getDate() &&
           visitDate.getMonth() === selectedDate.getMonth() &&
           visitDate.getFullYear() === selectedDate.getFullYear()
  })

  const isUpcoming = (dateStr: string) => {
    return new Date(dateStr).getTime() > new Date().getTime()
  }

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Schedule Dashboard</h1>
        <p className="text-muted-foreground">Manage your upcoming property viewings and client meetings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Calendar Filter */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-6">
            <Calendar 
              selectedDate={selectedDate}
              onSelectDate={(date) => setSelectedDate(date)}
              markedDates={markedDates}
            />

            <Card className="bg-primary text-primary-foreground border-none">
              <CardContent className="p-6">
                 <h3 className="font-bold text-xl mb-1">Today's Overview</h3>
                 <p className="opacity-90 text-sm mb-4">You have {filteredVisits.length} visits scheduled for this date.</p>
                 {filteredVisits.length > 0 && (
                   <div className="space-y-2">
                     {filteredVisits.slice(0, 2).map((v, i) => (
                       <div key={i} className="flex justify-between items-center text-sm border-t border-primary-foreground/20 pt-2">
                         <span>{v.timeSlot}</span>
                         <span className="font-semibold truncate max-w-[120px]">{v.propertyId.title}</span>
                       </div>
                     ))}
                     {filteredVisits.length > 2 && (
                       <p className="text-xs italic opacity-80 pt-1">+{filteredVisits.length - 2} more</p>
                     )}
                   </div>
                 )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Side: Visit Details */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">
              Visits on {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-xl">Loading schedule...</div>
          ) : filteredVisits.length === 0 ? (
            <Card className="border-dashed shadow-none bg-muted/10">
              <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                   <CalendarIcon className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-medium mb-2">No Visits Scheduled</h3>
                <p className="text-muted-foreground max-w-sm">
                  You don't have any viewings or meetings booked for this specific date. Try selecting another date on the calendar.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredVisits.map((visit) => {
                const upcoming = isUpcoming(visit.date)
                return (
                  <Card key={visit._id} className={`overflow-hidden transition-all ${upcoming ? 'border-primary/20 shadow-md' : 'opacity-70'}`}>
                    <div className="flex flex-col sm:flex-row">
                      {/* Left Time Block */}
                      <div className={`${upcoming ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'} p-6 sm:w-48 flex flex-col justify-center items-center text-center sm:border-r border-b sm:border-b-0`}>
                        <Clock className="h-6 w-6 mb-2 opacity-80" />
                        <span className="text-xl font-bold tracking-tight">{visit.timeSlot}</span>
                        <span className="text-xs font-semibold uppercase mt-2 tracking-wider opacity-80">{visit.status || 'Pending'}</span>
                      </div>
                      
                      {/* Right Details Block */}
                      <div className="flex-1 p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-bold mb-1">{visit.propertyId.title}</h3>
                            <div className="flex items-center text-sm text-muted-foreground gap-1.5">
                              <MapPin className="h-3.5 w-3.5" /> 
                              {visit.propertyId.location.address}, {visit.propertyId.location.city}
                            </div>
                          </div>
                        </div>

                        <div className="bg-muted/30 rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold shadow-inner">
                              {visit.buyerId.firstName[0]}{visit.buyerId.lastName[0]}
                            </div>
                            <div>
                              <p className="font-semibold text-sm leading-none mb-1.5">
                                {visit.buyerId.firstName} {visit.buyerId.lastName}
                                <span className="text-xs font-normal text-muted-foreground ml-2">(Buyer)</span>
                              </p>
                              {visit.buyerId.phone ? (
                                <a href={`tel:${visit.buyerId.phone}`} className="text-xs text-muted-foreground flex items-center gap-1 hover:text-primary transition-colors">
                                  <Phone className="h-3 w-3" /> {visit.buyerId.phone}
                                </a>
                              ) : (
                                <span className="text-xs text-muted-foreground italic">No phone provided</span>
                              )}
                            </div>
                          </div>
                          {(!visit.status || visit.status === 'Pending') && (
                            <div className="flex gap-2 shrink-0">
                              <Button variant="outline" size="sm" onClick={() => updateVisitStatus(visit._id, 'Accepted')} className="gap-1.5 border-green-200 hover:bg-green-50 text-green-700">
                                <CheckCircle2 className="h-4 w-4" /> Accept
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => updateVisitStatus(visit._id, 'Rejected')} className="text-red-600 hover:bg-red-50 hover:text-red-700">
                                Reject
                              </Button>
                            </div>
                          )}
                          {visit.status === 'Accepted' && (
                            <div className="flex gap-2 shrink-0">
                               <Button variant="outline" size="sm" onClick={() => updateVisitStatus(visit._id, 'Completed')} className="gap-1.5 border-blue-200 hover:bg-blue-50 text-blue-700">
                                Mark Completed
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
