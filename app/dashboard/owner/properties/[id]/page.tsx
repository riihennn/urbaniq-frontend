"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2, MapPin, Bed, Bath, Square, UserPlus, CheckCircle2, ChevronLeft, Calendar } from "lucide-react"
import Link from "next/link"
import api from "@/lib/api"
import { useSocket } from "@/components/providers/SocketProvider"

export default function PropertyDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [property, setProperty] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const fetchProperty = async () => {
    try {
      const res = await api.get(`/properties/${id}`)
      setProperty(res.data.data)
    } catch (error) {
      console.error("Failed to fetch property details:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (id) fetchProperty()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, id])

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading property details...</div>
  }

  if (!property) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-xl font-semibold">Property Not Found</h2>
        <Button variant="outline" onClick={() => router.back()}>Go Back</Button>
      </div>
    )
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price)
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <Button variant="ghost" onClick={() => router.back()} className="mb-2 -ml-4 text-muted-foreground hover:text-foreground">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Properties
      </Button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold tracking-tight">{property.title}</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              property.status === 'Available' || property.status === 'Published' ? 'bg-green-100 text-green-700' : 
              property.status === 'Pending Approval' ? 'bg-yellow-100 text-yellow-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {property.status}
            </span>
          </div>
          <p className="text-muted-foreground flex items-center gap-2">
            <MapPin className="w-4 h-4" /> 
            {property.location.address}, {property.location.city}, {property.location.state} {property.location.zipCode}
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-primary">{formatPrice(property.price)}</div>
          <p className="text-sm text-muted-foreground">{property.propertyType}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {/* Left Column: Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Images Placeholder */}
          {property.images && property.images.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 rounded-xl overflow-hidden">
              {property.images.slice(0, 2).map((img: string, idx: number) => (
                <div key={idx} className="aspect-video bg-muted relative">
                   {/* eslint-disable-next-line @next/next/no-img-element */}
                   <img src={img} alt={`Property image ${idx+1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          ) : (
            <div className="aspect-video bg-muted/50 rounded-xl flex items-center justify-center border-2 border-dashed">
              <span className="text-muted-foreground">No images available</span>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {property.description}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Features & Amenities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-6 mb-6 pb-6 border-b">
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground text-sm flex items-center gap-2"><Bed className="w-4 h-4"/> Bedrooms</span>
                  <span className="font-semibold text-lg">{property.features?.bedrooms || 0}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground text-sm flex items-center gap-2"><Bath className="w-4 h-4"/> Bathrooms</span>
                  <span className="font-semibold text-lg">{property.features?.bathrooms || 0}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground text-sm flex items-center gap-2"><Square className="w-4 h-4"/> Area</span>
                  <span className="font-semibold text-lg">{property.features?.area || 0} sqft</span>
                </div>
              </div>
              
              {property.amenities && property.amenities.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-4">
                  {property.amenities.map((amenity: string, idx: number) => (
                    <span key={idx} className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm">
                      {amenity}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No specific amenities listed.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Management */}
        <div className="space-y-6">
          {/* Agent Management Card */}
          <Card className="border-primary/20 shadow-sm">
            <CardHeader className="bg-primary/5 border-b pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <UserPlus className="w-5 h-5 text-primary" /> Agent Assignment
              </CardTitle>
              <CardDescription>Manage who handles this property</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {property.agentId ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">
                      {property.agentId.firstName?.charAt(0) || 'A'}
                    </div>
                    <div>
                      <p className="font-medium">{property.agentId.firstName} {property.agentId.lastName}</p>
                      <p className="text-xs text-muted-foreground">Managing inquiries and visits</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">View Agent Profile</Button>
                </div>
              ) : property.latestAssignment && property.latestAssignment.status === 'Pending' ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mt-0.5 shrink-0">
                      <span className="text-xs text-blue-600">⏳</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-800">Assignment Pending</p>
                      <p className="text-xs text-blue-600 mt-1">
                        Waiting for {property.latestAssignment.agentId?.firstName} {property.latestAssignment.agentId?.lastName} to accept.
                      </p>
                    </div>
                  </div>
                  <Button className="w-full" variant="outline" disabled>
                    Assignment Request Sent
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 bg-muted/50 p-3 rounded-lg border">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Self-Managed</p>
                      <p className="text-xs text-muted-foreground mt-1">You are currently receiving all inquiries directly.</p>
                    </div>
                  </div>
                  <Button className="w-full" asChild>
                    <Link href={`/dashboard/owner/properties/${property._id}/assign`}>
                      Assign a Real Estate Agent
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground text-sm">Total Views</span>
                <span className="font-semibold">0</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground text-sm">Inquiries</span>
                <span className="font-semibold">0</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground text-sm">Visits</span>
                <span className="font-semibold">0</span>
              </div>
              
              <Button variant="secondary" className="w-full mt-4" asChild>
                <Link href="/dashboard/owner/inquiries">
                  View Inquiries
                </Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card>
             <CardContent className="p-4 flex flex-col gap-3">
               <Button variant="outline" className="w-full justify-start"><Calendar className="w-4 h-4 mr-2"/> Manage Availability</Button>
               <Button variant="outline" className="w-full justify-start text-destructive hover:bg-destructive/10"><Building2 className="w-4 h-4 mr-2"/> Unpublish Listing</Button>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
