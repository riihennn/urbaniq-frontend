"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, CheckCircle } from "lucide-react"
import api from "@/lib/api"
import Link from "next/link"
import { useSocket } from "@/components/providers/SocketProvider"

export default function AdminApprovalsPage() {
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const { socket } = useSocket()

  const fetchProperties = async () => {
    try {
      // Search is not supported by backend Joi validation for properties currently, so we remove it
      // or we can pass it as 'city' if we want to filter by city: &city=${searchTerm}
      const url = searchTerm 
        ? `/properties?limit=10&page=${page}&city=${searchTerm}&status=Pending%20Approval`
        : `/properties?limit=10&page=${page}&status=Pending%20Approval`
      const res = await api.get(url)
      // The public properties endpoint returns data in res.data.data
      setProperties(res.data.data || [])
      setTotalPages(res.data.meta?.totalPages || 1)
    } catch (error) {
      console.error("Failed to fetch properties:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setPage(1)
  }, [searchTerm])

  useEffect(() => {
    fetchProperties()
  }, [page, searchTerm])

  useEffect(() => {
    if (!socket) return

    const handlePropertyUpdated = (updatedProperty: any) => {
      if (updatedProperty.status !== 'Pending Approval') {
        setProperties(prev => prev.filter(p => p._id !== updatedProperty._id))
      } else {
        setProperties(prev => {
          const exists = prev.find(p => p._id === updatedProperty._id)
          if (exists) {
            return prev.map(p => p._id === updatedProperty._id ? updatedProperty : p)
          }
          return [updatedProperty, ...prev]
        })
      }
    }

    socket.on('property_updated', handlePropertyUpdated)
    return () => {
      socket.off('property_updated', handlePropertyUpdated)
    }
  }, [socket])

  const updateStatus = async (propertyId: string, newStatus: string) => {
    try {
      await api.put(`/properties/${propertyId}/status`, { status: newStatus })
      // Remove from list once approved
      setProperties(properties.filter(p => p._id !== propertyId))
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
        <h1 className="text-3xl font-bold tracking-tight">Property Approvals</h1>
        <p className="text-muted-foreground">Review and approve new property listings before they go live.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search pending properties by title or city..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-4">Property</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Owner</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-muted-foreground">Loading pending properties...</td>
                  </tr>
                ) : properties.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-muted-foreground">
                      <div className="flex flex-col items-center justify-center">
                        <CheckCircle className="h-10 w-10 text-green-500/50 mb-2" />
                        <p>All caught up! No properties pending approval.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  properties.map(property => (
                    <tr key={property._id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 font-medium max-w-[200px] truncate" title={property.title}>
                        <Link href={`/dashboard/admin/approvals/${property._id}`} className="hover:underline text-primary">
                          {property.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{property.location.city}, {property.location.state}</td>
                      <td className="px-6 py-4 font-medium">{formatPrice(property.price)}</td>
                      <td className="px-6 py-4 text-muted-foreground truncate max-w-[150px]">
                        {property.ownerId?.email || 'Unknown'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap bg-yellow-100 text-yellow-700">
                          {property.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => updateStatus(property._id, 'Published')}
                        >
                          Approve
                        </Button>
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
