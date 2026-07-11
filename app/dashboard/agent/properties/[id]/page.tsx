"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2, MapPin, Bed, Bath, Square, UserPlus, CheckCircle2, ChevronLeft, Calendar, ArrowLeft, BedDouble, FileText, Trash2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import api from "@/lib/api"
import { useSocket } from "@/components/providers/SocketProvider"
import ChatBox from "@/components/ui/ChatBox"

export default function AgentPropertyDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [property, setProperty] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showChat, setShowChat] = useState(false)
  const [isSoldModalOpen, setIsSoldModalOpen] = useState(false)
  const [billingDocument, setBillingDocument] = useState<File | null>(null)
  const [isMarkingSold, setIsMarkingSold] = useState(false)

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

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this property? This action cannot be undone.")) {
      try {
        await api.delete(`/properties/${id}`)
        router.push('/dashboard/agent/properties')
      } catch (error) {
        console.error("Failed to delete property:", error)
        alert("Failed to delete property.")
      }
    }
  }

  const handleUnpublish = async () => {
    if (window.confirm("Are you sure you want to unpublish this property? It will be hidden from buyers.")) {
      try {
        await api.put(`/properties/${id}`, { status: 'Draft' })
        fetchProperty()
      } catch (error) {
        console.error("Failed to unpublish property:", error)
        alert("Failed to unpublish property.")
      }
    }
  }

  const handlePublish = async () => {
    if (window.confirm("Are you sure you want to publish this property? It will be visible to buyers again.")) {
      try {
        await api.put(`/properties/${id}`, { status: 'Published' })
        fetchProperty()
      } catch (error) {
        console.error("Failed to publish property:", error)
        alert("Failed to publish property.")
      }
    }
  }

  const handleMarkAsSold = async () => {
    setIsMarkingSold(true)
    try {
      // In a real app we'd upload the billingDocument to S3/Cloudinary here and get a URL back.
      // For now we pass a dummy string or ignore it since the API expects an array of strings.
      
      const payload: any = { status: 'Sold' }
      
      // If we had a real file upload, we would append the resulting URL to property.documents
      
      await api.put(`/properties/${id}`, payload)
      setIsSoldModalOpen(false)
      fetchProperty()
    } catch (error) {
      console.error("Failed to mark as sold", error)
      alert("Failed to mark as sold")
    } finally {
      setIsMarkingSold(false)
    }
  }

  useEffect(() => {
    if (!socket || !id) return

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    socket.on('assignment_responded', (data: any) => {
      if (data.propertyId === id) {
        fetchProperty()
      }
    })

    const handlePropertyUpdated = (updatedProperty: any) => {
      if (updatedProperty._id === id) {
        setProperty(updatedProperty)
      }
    }
    
    socket.on('property_updated', handlePropertyUpdated)

    return () => {
      socket.off('assignment_responded')
      socket.off('property_updated', handlePropertyUpdated)
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

  const updateStatus = async (propertyId: string, newStatus: string) => {
    try {
      await api.put(`/properties/${propertyId}`, { status: newStatus });
      setProperty({ ...property, status: newStatus });
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  }

  return (
    <div className="space-y-6 pb-20 max-w-6xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.push('/dashboard/agent/properties')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Manage Assigned Property</h1>
          <p className="text-muted-foreground">View details and manage this assigned property.</p>
        </div>
        <div className="flex items-center gap-2">
          {(property.status === 'Available' || property.status === 'Published' || property.status === 'Approved') && (
            <Button variant="outline" onClick={() => updateStatus(property._id, 'Sold')}>
              Mark Sold
            </Button>
          )}
          <Button asChild>
            <Link href={`/dashboard/agent/properties/${property._id}/edit`}>Edit Property</Link>
          </Button>
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
                <div className={`px-3 py-1 rounded-md text-sm font-bold uppercase tracking-wider inline-block mb-3 ${
                  (property.status === 'Published' || property.status === 'Approved' || property.status === 'Available') ? 'bg-green-100 text-green-700' : 
                  property.status === 'Pending Approval' ? 'bg-yellow-100 text-yellow-700' :
                  property.status === 'Draft' ? 'bg-gray-100 text-gray-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {property.status === 'Approved' ? 'Published' : property.status}
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
                <Building2 className="w-5 h-5 text-primary" /> Listing Controls
              </CardTitle>
              <CardDescription>Manage your assigned listing</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
               <div className="space-y-4">
                  <div className="flex items-start gap-3 bg-muted/50 p-3 rounded-lg border">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Assigned to You</p>
                      <p className="text-xs text-muted-foreground mt-1">You are responsible for inquiries and viewings.</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button className="flex-1" onClick={() => router.push(`/dashboard/agent/inquiries`)}>
                      Inquiries
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={() => setShowChat(!showChat)}>
                      {showChat ? 'Hide Chat' : 'Chat with Owner'}
                    </Button>
                  </div>
                </div>
            </CardContent>
          </Card>

          {showChat && property.ownerId && (
            <div className="h-[500px]">
              <ChatBox collaborationPropertyId={property._id} propertyTitle={property.title} />
            </div>
          )}

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
                <Link href="/dashboard/agent/inquiries">
                  View Inquiries
                </Link>
              </Button>
            </CardContent>
          </Card>
          
                    <Card>
             <CardContent className="p-4 flex flex-col gap-3">
               {property.status !== 'Sold' && (
                 <Button variant="default" className="w-full justify-center bg-green-600 hover:bg-green-700 text-white" onClick={() => setIsSoldModalOpen(true)}>
                   <CheckCircle2 className="w-4 h-4 mr-2"/> Mark as Sold
                 </Button>
               )}
               {property.status !== 'Draft' && (
                 <Button variant="outline" className="w-full justify-start text-orange-600 hover:bg-orange-50 hover:text-orange-700 border-orange-200" onClick={handleUnpublish}>
                   <Building2 className="w-4 h-4 mr-2"/> Unpublish Listing
                 </Button>
               )}
               {property.status === 'Draft' && (
                 <Button variant="outline" className="w-full justify-start text-blue-600 hover:bg-blue-50 hover:text-blue-700 border-blue-200" onClick={handlePublish}>
                   <Building2 className="w-4 h-4 mr-2"/> Publish Listing
                 </Button>
               )}
               <Button variant="outline" className="w-full justify-start text-destructive hover:bg-destructive/10" onClick={handleDelete}>
                 <Trash2 className="w-4 h-4 mr-2"/> Delete Property
               </Button>
             </CardContent>
          </Card>
        </div>
      </div>

      {/* Mark as Sold Modal */}
      {isSoldModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background rounded-xl shadow-lg w-full max-w-md overflow-hidden">
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold">Mark Property as Sold</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Congratulations on completing the sale! You can optionally upload a billing document for verification.
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Billing Document (Optional)</label>
                <input 
                  type="file" 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  onChange={(e) => setBillingDocument(e.target.files?.[0] || null)}
                />
              </div>
            </div>
            <div className="p-6 border-t bg-muted/20 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsSoldModalOpen(false)} disabled={isMarkingSold}>
                Cancel
              </Button>
              <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={handleMarkAsSold} disabled={isMarkingSold}>
                {isMarkingSold ? "Processing..." : "Confirm Sold"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
