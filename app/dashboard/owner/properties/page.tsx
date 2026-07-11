"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Filter } from "lucide-react"
import Link from "next/link"
import api from "@/lib/api"
import { useAuthStore } from "@/store/authStore"
import { useSocket } from "@/components/providers/SocketProvider"

interface Property {
  _id: string;
  title: string;
  propertyType: string;
  location: { city: string; state: string };
  price: number;
  status: string;
  createdAt: string;
  images?: string[];
  agentId?: any;
}

export default function OwnerPropertiesPage() {
  const { user } = useAuthStore()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const { socket } = useSocket()

  useEffect(() => {
    const fetchProperties = async () => {
      if (!user?._id) return
      try {
        const res = await api.get(`/properties?ownerId=${user._id}`)
        setProperties(Array.isArray(res.data.data) ? res.data.data : [])
      } catch (error) {
        console.error("Failed to fetch properties:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchProperties()
  }, [user])

  useEffect(() => {
    if (!socket || !user?._id) return

    const handlePropertyUpdated = (updatedProperty: any) => {
      setProperties(prev => {
        const exists = prev.find(p => p._id === updatedProperty._id)
        if (exists) {
          return prev.map(p => p._id === updatedProperty._id ? updatedProperty : p)
        } else if (updatedProperty.ownerId === user._id || updatedProperty.ownerId?._id === user._id) {
          return [updatedProperty, ...prev]
        }
        return prev
      })
    }

    socket.on('property_updated', handlePropertyUpdated)
    return () => {
      socket.off('property_updated', handlePropertyUpdated)
    }
  }, [socket, user?._id])

  const updateStatus = async (propertyId: string, newStatus: string) => {
    try {
      await api.put(`/properties/${propertyId}`, { status: newStatus });
      setProperties(prev => prev.map(p => p._id === propertyId ? { ...p, status: newStatus } : p));
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price)
  }

  const filteredProperties = properties.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.location.city.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'Sold' ? p.status === 'Sold' : p.status !== 'Sold'
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Properties</h1>
          <p className="text-muted-foreground">Manage all your listed properties across Urbaniq.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/owner/properties/new">
            <Plus className="h-4 w-4 mr-2" /> List New Property
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 pb-6 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
            <Button variant="outline" className="shrink-0">
              <Filter className="h-4 w-4 mr-2" /> Filter
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant={statusFilter === null ? "default" : "outline"} 
              size="sm" 
              onClick={() => setStatusFilter(null)}
              className="rounded-full"
            >
              Active Properties
            </Button>
            <Button 
              variant={statusFilter === 'Sold' ? "default" : "outline"} 
              size="sm" 
              onClick={() => setStatusFilter('Sold')}
              className="rounded-full"
            >
              Sold Properties
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-4">Property</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Date Added</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Assigned To</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-muted-foreground">Loading properties...</td>
                  </tr>
                ) : filteredProperties.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-muted-foreground">No properties found.</td>
                  </tr>
                ) : (
                  filteredProperties.map(property => (
                    <tr key={property._id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4">
                        <Link href={`/dashboard/owner/properties/${property._id}`} className="flex items-center gap-4 group">
                          <div className="relative w-24 h-16 rounded-md overflow-hidden shrink-0 bg-muted">
                            <img src={property.images?.[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=200&q=80'} alt={property.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium text-base text-gray-900 group-hover:text-primary transition-colors">{property.title}</span>
                            <span className="text-sm text-muted-foreground">{property.location.city}, {property.location.state}</span>
                          </div>
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{property.propertyType}</td>
                      <td className="px-6 py-4 font-medium">{formatPrice(property.price)}</td>
                      <td className="px-6 py-4 text-muted-foreground">{new Date(property.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                          (property.status === 'Available' || property.status === 'Published' || property.status === 'Approved') ? 'bg-green-100 text-green-700' : 
                          property.status === 'Pending Approval' ? 'bg-yellow-100 text-yellow-700' :
                          property.status === 'Draft' ? 'bg-gray-100 text-gray-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {property.status === 'Approved' ? 'Published' : property.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {property.agentId ? (
                          <div className="flex flex-col items-end">
                            <span className="font-medium text-sm text-gray-900">{property.agentId.firstName} {property.agentId.lastName}</span>
                            <span className="text-xs text-muted-foreground">Agent</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground italic">Self-Managed</span>
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
    </div>
  )
}
