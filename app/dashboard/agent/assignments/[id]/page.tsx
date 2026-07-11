"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2, MapPin, BedDouble, Bath, Square, Check, X, ArrowLeft, User, FileText } from "lucide-react"
import Image from "next/image"
import api from "@/lib/api"
import { useSocket } from "@/components/providers/SocketProvider"

export default function AssignmentDetailsPage() {
  const { id } = useParams() // This is the propertyId
  const router = useRouter()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [property, setProperty] = useState<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [assignment, setAssignment] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const fetchProperty = async () => {
    try {
      const res = await api.get(`/properties/${id}`)
      setProperty(res.data.data)
      setAssignment(res.data.data.latestAssignment)
    } catch (error) {
      console.error("Failed to fetch property details:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) fetchProperty()
  }, [id])

  const { socket } = useSocket()
  
  useEffect(() => {
    if (!socket || !id) return

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    socket.on('assignment_responded', (data: any) => {
      if (data.propertyId === id) {
        fetchProperty()
      }
    })

    return () => {
      socket.off('assignment_responded')
    }
  }, [socket, id])

  const handleRespond = async (status: 'Accepted' | 'Rejected') => {
    if (!assignment) return
    try {
      await api.put(`/assignments/${assignment._id}/respond`, { status })
      router.push('/dashboard/agent/assignments')
    } catch (error) {
      console.error(`Failed to ${status.toLowerCase()} assignment:`, error)
      alert(`Failed to ${status.toLowerCase()} assignment.`)
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading assignment details...</div>
  }

  if (!property || !assignment) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-xl font-semibold">Assignment Request Not Found</h2>
        <Button variant="outline" onClick={() => router.back()}>Go Back</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-20 max-w-6xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.push('/dashboard/agent/assignments')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Assignment Request Details</h1>
          <p className="text-muted-foreground">Review the property details before accepting or declining.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Property Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="px-3 py-1 rounded-md text-sm font-bold uppercase tracking-wider inline-block mb-3 bg-blue-100 text-blue-700">
                  {property.status}
                </div>
                <h2 className="text-3xl font-bold mb-2">{property.title}</h2>
                <div className="flex items-center text-muted-foreground gap-2">
                  <MapPin className="h-5 w-5" />
                  {property.location?.address}, {property.location?.city}, {property.location?.state}
                </div>
              </div>

              <div className="flex gap-8 border-y py-4 flex-wrap">
                <div>
                  <p className="text-muted-foreground text-sm uppercase tracking-wider mb-1">Asking Price</p>
                  <p className="text-2xl font-bold text-primary">${property.price.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <BedDouble className="h-5 w-5 text-muted-foreground" />
                  <span className="font-semibold">{property.features?.bedrooms} Beds</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bath className="h-5 w-5 text-muted-foreground" />
                  <span className="font-semibold">{property.features?.bathrooms} Baths</span>
                </div>
                <div className="flex items-center gap-2">
                  <Square className="h-5 w-5 text-muted-foreground" />
                  <span className="font-semibold">{property.features?.area} sqft</span>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{property.description}</p>
              </div>

              {property.amenities && property.amenities.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {property.amenities.map((amenity: string, idx: number) => (
                      <span key={idx} className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {property.images && property.images.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Images</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {property.images.map((img: string, idx: number) => (
                      <div key={idx} className="relative aspect-video rounded-md overflow-hidden bg-muted">
                        <Image src={img} alt="Property Image" fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="w-full lg:w-[400px] space-y-6 shrink-0">
          <Card>
            <CardHeader>
              <CardTitle>Owner Information</CardTitle>
            </CardHeader>
            <CardContent>
              {property.ownerId ? (
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Name:</span> {property.ownerId.firstName} {property.ownerId.lastName}</p>
                  <p><span className="font-medium">Email:</span> {property.ownerId.email}</p>
                  <p><span className="font-medium">Phone:</span> {property.ownerId.phone || 'N/A'}</p>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">Owner details unavailable.</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-primary/20 shadow-sm">
            <CardHeader className="bg-primary/5 border-b pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="w-5 h-5 text-primary" /> Assignment Request
              </CardTitle>
              <CardDescription>Respond to this property assignment</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
               <div className="space-y-4">
                  {assignment.commissionInfo && (
                    <div className="bg-muted/30 p-3 rounded-lg text-sm border space-y-1 mb-4">
                      <p className="font-semibold text-foreground">Proposed Commission:</p> 
                      <p className="text-muted-foreground">{assignment.commissionInfo}</p>
                    </div>
                  )}

                  {assignment.status === 'Pending' ? (
                    <div className="flex gap-3 pt-2">
                      <Button 
                        className="flex-1 gap-2 bg-green-600 hover:bg-green-700 text-white" 
                        onClick={() => handleRespond('Accepted')}
                      >
                        <Check className="h-4 w-4" /> Accept
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1 gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                        onClick={() => handleRespond('Rejected')}
                      >
                        <X className="h-4 w-4" /> Decline
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-2 text-sm font-medium">
                      Status: <span className={assignment.status === 'Accepted' ? 'text-green-600' : 'text-red-600'}>{assignment.status}</span>
                    </div>
                  )}
                </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
