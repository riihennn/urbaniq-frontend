"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Building2 } from "lucide-react"
import api from "@/lib/api"
import Link from "next/link"
import { useSocket } from "@/components/providers/SocketProvider"
import { getPropertyThumbnail } from "@/lib/utils"


export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const { socket } = useSocket()

  const fetchProperties = async () => {
    try {
      setLoading(true)
      let url = `/admin/properties?limit=10&page=${page}&search=${searchTerm}`
      if (statusFilter) url += `&status=${statusFilter}`
      const res = await api.get(url)
      setProperties(res.data.properties)
      setTotalPages(res.data.meta?.totalPages || 1)
    } catch (error) {
      console.error("Failed to fetch properties:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setPage(1)
  }, [searchTerm, statusFilter])

  useEffect(() => {
    fetchProperties()
  }, [page, searchTerm, statusFilter])

  useEffect(() => {
    if (!socket) return

    const handlePropertyUpdated = (updatedProperty: any) => {
      setProperties(prev => {
        const exists = prev.find(p => p._id === updatedProperty._id)
        if (exists) {
          // Update status if it matches the current filter or if there's no filter
          if (!statusFilter || statusFilter === updatedProperty.status || (statusFilter === 'Published' && updatedProperty.status === 'Approved')) {
             return prev.map(p => p._id === updatedProperty._id ? updatedProperty : p)
          } else {
             return prev.filter(p => p._id !== updatedProperty._id)
          }
        }
        return prev
      })
    }

    socket.on('property_updated', handlePropertyUpdated)
    return () => {
      socket.off('property_updated', handlePropertyUpdated)
    }
  }, [socket, statusFilter])

  const updateStatus = async (propertyId: string, newStatus: string) => {
    try {
      await api.put(`/properties/${propertyId}`, { status: newStatus })
      setProperties(properties.map(p => p._id === propertyId ? { ...p, status: newStatus } : p))
    } catch (error) {
      console.error("Failed to update status:", error)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price)
  }

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manage Properties</h1>
        <p className="text-muted-foreground">Oversee all property listings across the platform.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search properties by title or city..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="bg-transparent border rounded p-2 text-sm outline-none shrink-0"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Pending Approval">Pending Approval</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
            <option value="Sold">Sold</option>
          </select>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-4">Property</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Owner</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-muted-foreground">Loading properties...</td>
                  </tr>
                ) : properties.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-muted-foreground">
                      <div className="flex flex-col items-center justify-center">
                        <Building2 className="h-10 w-10 text-muted-foreground/30 mb-2" />
                        <p>No properties found.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  properties.map(property => (
                    <tr key={property._id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="relative w-24 h-16 rounded-md overflow-hidden shrink-0 bg-muted">
                            <img src={getPropertyThumbnail(property.images?.[0], 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=200&q=80')} alt={property.title} className="object-cover w-full h-full" />
                          </div>
                          <div className="flex flex-col max-w-[250px] truncate">
                            <Link href={`/dashboard/admin/properties/${property._id}`} className="hover:underline text-primary font-medium text-base text-gray-900 truncate block w-full" title={property.title}>
                              {property.title}
                            </Link>
                            <span className="text-sm text-muted-foreground">{property.location.city}, {property.location.state}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium">{formatPrice(property.price)}</td>
                      <td className="px-6 py-4 text-muted-foreground truncate max-w-[150px]">
                        {property.ownerId?.email || 'Unknown'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                          (property.status === 'Published' || property.status === 'Approved') ? 'bg-green-100 text-green-700' : 
                          property.status === 'Pending Approval' ? 'bg-yellow-100 text-yellow-700' :
                          property.status === 'Draft' ? 'bg-gray-100 text-gray-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {property.status === 'Approved' ? 'Published' : property.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {property.status === 'Pending Approval' && (
                          <Button 
                            variant="default" 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => updateStatus(property._id, 'Published')}
                          >
                            Approve
                          </Button>
                        )}
                        {(property.status === 'Published' || property.status === 'Approved') && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => updateStatus(property._id, 'Draft')}
                          >
                            Unpublish
                          </Button>
                        )}
                        {property.status === 'Draft' && (
                          <Button 
                            variant="default" 
                            size="sm" 
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() => updateStatus(property._id, 'Published')}
                          >
                            Publish
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination Controls */}
      {!loading && properties.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <Button 
            variant="outline" 
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button 
            variant="outline" 
            disabled={page === totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
