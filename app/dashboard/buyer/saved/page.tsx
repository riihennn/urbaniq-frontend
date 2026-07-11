"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Bookmark, MapPin, BedDouble, Bath, Square, Trash2 } from "lucide-react"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function BuyerSavedPropertiesPage() {
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSavedProperties()
  }, [])

  const fetchSavedProperties = async () => {
    try {
      const res = await api.get("/users/favorites")
      setProperties(res.data)
    } catch (err) {
      console.error("Failed to fetch saved properties:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (propertyId: string) => {
    try {
      await api.delete(`/users/favorites/${propertyId}`)
      setProperties(prev => prev.filter(p => p._id !== propertyId))
    } catch (err) {
      console.error("Failed to remove property")
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Saved Properties</h1>
        <p className="text-muted-foreground mt-1">Properties you've shortlisted for later.</p>
      </div>

      {properties.length === 0 ? (
        <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed">
          <Bookmark className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-xl font-bold mb-2">No saved properties</h3>
          <p className="text-muted-foreground mb-6">You haven't saved any properties to your wishlist yet.</p>
          <Button asChild>
            <Link href="/properties">Browse Properties</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map(property => (
            <Card key={property._id} className="overflow-hidden group flex flex-col">
              <div className="relative h-48 w-full">
                <Image 
                  src={property.images?.[0] || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"}
                  alt={property.title}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    handleRemove(property._id);
                  }}
                  className="absolute top-3 right-3 p-2 bg-white/80 hover:bg-red-50 text-red-500 rounded-full transition-colors z-10"
                  title="Remove from saved"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <div className="absolute top-3 left-3 bg-primary text-primary-foreground px-2 py-1 text-xs font-bold uppercase rounded shadow">
                  ${property.price.toLocaleString()}
                </div>
              </div>
              <CardContent className="p-4 flex flex-col flex-1">
                <Link href={`/properties/${property._id}`} className="block flex-1">
                  <h3 className="text-lg font-bold line-clamp-1 mb-1 group-hover:text-primary transition-colors">{property.title}</h3>
                  <p className="text-sm text-muted-foreground flex items-center mb-4 line-clamp-1">
                    <MapPin className="h-3.5 w-3.5 mr-1 shrink-0" /> {property.location?.city}, {property.location?.state}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-4 mt-auto">
                    <span className="flex items-center" title="Bedrooms"><BedDouble className="mr-1.5 h-4 w-4" /> {property.features?.bedrooms}</span>
                    <span className="flex items-center" title="Bathrooms"><Bath className="mr-1.5 h-4 w-4" /> {property.features?.bathrooms}</span>
                    <span className="flex items-center" title="Square Feet"><Square className="mr-1.5 h-4 w-4" /> {property.features?.area}</span>
                  </div>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
