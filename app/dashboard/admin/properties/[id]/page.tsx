"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { MapPin, ArrowLeft, BedDouble, Bath, Square, FileText, CheckCircle, XCircle } from "lucide-react"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSocket } from "@/components/providers/SocketProvider"

export default function AdminManagePropertyDetailPage() {
  const params = useParams()
  const router = useRouter()
  
  const [property, setProperty] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState("")
  const { socket } = useSocket()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/properties/${params.id}`)
        setProperty(res.data?.data)
      } catch (err: any) {
        console.error("Error fetching data:", err)
        setError(err.response?.data?.message || "Failed to load property details.")
      } finally {
        setLoading(false)
      }
    }
    if (params.id) fetchData()
  }, [params.id])

  useEffect(() => {
    if (!socket || !property?._id) return

    const handlePropertyUpdated = (updatedProperty: any) => {
      if (updatedProperty._id === property._id) {
        setProperty(updatedProperty)
      }
    }

    socket.on('property_updated', handlePropertyUpdated)
    return () => {
      socket.off('property_updated', handlePropertyUpdated)
    }
  }, [socket, property?._id])

  const handleUpdateStatus = async (newStatus: string) => {
    setIsUpdating(true)
    try {
      await api.put(`/properties/${property._id}/status`, { status: newStatus })
      setProperty({ ...property, status: newStatus })
      setIsUpdating(false)
    } catch (err) {
      console.error("Failed to update status")
      alert("Failed to update property status.")
      setIsUpdating(false)
    }
  }

  if (loading) return <div className="h-full flex items-center justify-center p-10">Loading property details...</div>
  if (error) return <div className="h-full flex flex-col items-center justify-center p-10 text-red-500"><p>{error}</p><Button className="mt-4" onClick={() => router.push('/dashboard/admin/properties')}>Back to Properties</Button></div>
  if (!property) return <div className="h-full flex items-center justify-center p-10">Property not found</div>

  return (
    <div className="space-y-6 pb-20 max-w-6xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.push('/dashboard/admin/properties')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Property</h1>
          <p className="text-muted-foreground">View and manage all details for this property.</p>
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
                  (property.status === 'Published' || property.status === 'Approved') ? 'bg-green-100 text-green-700' : 
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

              <div className="flex gap-8 border-y py-4">
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
              <CardTitle>Documents</CardTitle>
            </CardHeader>
            <CardContent>
              {property.documents && property.documents.length > 0 ? (
                <div className="space-y-3">
                  {property.documents.map((doc: string, idx: number) => (
                    <a key={idx} href={doc} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <FileText className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium truncate">Document {idx + 1}</span>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No documents were uploaded by the owner.</p>
              )}
            </CardContent>
          </Card>

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

          <Card className="border-primary bg-primary/5">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-4">Management Actions</h3>
              <div className="space-y-3">
                {property.status === 'Pending Approval' && (
                  <>
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700 h-12 text-base gap-2" 
                      disabled={isUpdating}
                      onClick={() => handleUpdateStatus("Published")}
                    >
                      <CheckCircle className="h-5 w-5" /> Approve Listing
                    </Button>
                    <Button 
                      variant="outline"
                      className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 h-12 text-base gap-2" 
                      disabled={isUpdating}
                      onClick={() => handleUpdateStatus("Draft")}
                    >
                      <XCircle className="h-5 w-5" /> Reject (Return to Draft)
                    </Button>
                  </>
                )}
                {(property.status === 'Published' || property.status === 'Approved') && (
                  <Button 
                    variant="outline"
                    className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 h-12 text-base gap-2" 
                    disabled={isUpdating}
                    onClick={() => handleUpdateStatus("Draft")}
                  >
                    <XCircle className="h-5 w-5" /> Unpublish Listing
                  </Button>
                )}
                {property.status === 'Draft' && (
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base gap-2" 
                    disabled={isUpdating}
                    onClick={() => handleUpdateStatus("Published")}
                  >
                    <CheckCircle className="h-5 w-5" /> Publish Listing
                  </Button>
                )}
                {(property.status === 'Sold' || property.status === 'Rented') && (
                  <p className="text-sm text-muted-foreground text-center">No actions available for closed listings.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
