"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Building2, Save, MapPin, DollarSign, Home, ChevronLeft, Map as MapIcon, LocateFixed } from "lucide-react"
import api from "@/lib/api"
import { useAuthStore } from "@/store/authStore"

const MapSelector = dynamic(() => import("@/components/ui/MapSelector"), { ssr: false, loading: () => <div className="h-[300px] w-full rounded-xl bg-muted animate-pulse flex items-center justify-center">Loading map...</div> })

export default function EditPropertyForm({ propertyId, role }: { propertyId: string, role: 'Owner' | 'Agent' }) {
  const router = useRouter()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [isLocating, setIsLocating] = useState(false)
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    propertyType: "Villa",
    status: "Available",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    bedrooms: "",
    bathrooms: "",
    area: "",
    amenities: "",
  })

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const res = await api.get(`/properties/${propertyId}`)
        const prop = res.data.data
        
        setFormData({
          title: prop.title || "",
          description: prop.description || "",
          price: prop.price?.toString() || "",
          propertyType: prop.propertyType || "Villa",
          status: prop.status || "Available",
          address: prop.location?.address || "",
          city: prop.location?.city || "",
          state: prop.location?.state || "",
          zipCode: prop.location?.zipCode || "",
          bedrooms: prop.features?.bedrooms?.toString() || "",
          bathrooms: prop.features?.bathrooms?.toString() || "",
          area: prop.features?.area?.toString() || "",
          amenities: prop.amenities?.join(", ") || "",
        })
      } catch (err: any) {
        setError("Failed to load property details")
      } finally {
        setLoading(false)
      }
    }
    fetchProperty()
  }, [propertyId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleUseCurrentLocation = () => {
    if ("geolocation" in navigator) {
      setIsLocating(true)
      setError("")
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const { latitude, longitude } = position.coords
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`)
          const data = await res.json()
          if (data && data.address) {
            setFormData((prev) => ({
              ...prev,
              address: data.address.road || data.address.suburb || data.name || "",
              city: data.address.city || data.address.town || data.address.village || data.address.county || "",
              state: data.address.state || "",
              zipCode: data.address.postcode || "",
            }))
          }
        } catch (error) {
          console.error("Failed to get location:", error)
          setError("Failed to fetch address from location.")
        } finally {
          setIsLocating(false)
        }
      }, () => {
        setError("Location access denied.")
        setIsLocating(false)
      })
    } else {
      setError("Geolocation is not supported by your browser.")
    }
  }

  const handleMapLocationSelect = async (lat: number, lon: number) => {
    try {
      setIsLocating(true)
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`)
      const data = await res.json()
      if (data && data.address) {
        setFormData((prev) => ({
          ...prev,
          address: data.address.road || data.address.suburb || data.name || "",
          city: data.address.city || data.address.town || data.address.village || data.address.county || "",
          state: data.address.state || "",
          zipCode: data.address.postcode || "",
        }))
      }
    } catch (error) {
      console.error("Failed to get location from map:", error)
      setError("Failed to fetch address from map pin.")
    } finally {
      setIsLocating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        propertyType: formData.propertyType,
        status: formData.status,
        location: {
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
        },
        features: {
          bedrooms: Number(formData.bedrooms) || 0,
          bathrooms: Number(formData.bathrooms) || 0,
          area: Number(formData.area),
        },
        amenities: formData.amenities.split(',').map(s => s.trim()).filter(Boolean),
      }

      await api.put(`/properties/${propertyId}`, payload)
      router.push(`/dashboard/${role.toLowerCase()}/properties/${propertyId}`)
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update property")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-12 text-center text-muted-foreground">Loading property details...</div>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()} className="text-muted-foreground">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Edit Property</h1>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive text-sm font-medium p-4 rounded-lg border border-destructive/20">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Home className="w-5 h-5 text-primary"/> Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Property Title</label>
              <Input name="title" value={formData.title} onChange={handleChange} required />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Price ($)</label>
                <div className="relative">
                  <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input type="number" name="price" className="pl-9" value={formData.price} onChange={handleChange} required />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Property Type</label>
                <select 
                  name="propertyType" 
                  value={formData.propertyType} 
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Villa">Villa</option>
                  <option value="Apartment">Apartment</option>
                  <option value="Penthouse">Penthouse</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Townhouse">Townhouse</option>
                  <option value="Land">Land</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <select 
                  name="status" 
                  value={formData.status} 
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Pending Approval">Pending Approval</option>
                  <option value="Available">Available</option>
                  <option value="Published">Published</option>
                  <option value="Sold">Sold</option>
                  <option value="Rented">Rented</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea name="description" rows={5} value={formData.description} onChange={handleChange} required />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><MapPin className="w-5 h-5 text-primary"/> Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4 mb-4">
              <Button type="button" variant="outline" className="flex-1" onClick={handleUseCurrentLocation} disabled={isLocating}>
                <LocateFixed className="w-4 h-4 mr-2" />
                {isLocating ? "Locating..." : "Use Current Location"}
              </Button>
            </div>
            
            <div className="mb-6 rounded-xl overflow-hidden border">
              <MapSelector onLocationSelect={handleMapLocationSelect} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Address</label>
              <Input name="address" value={formData.address} onChange={handleChange} required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">City</label>
                <Input name="city" value={formData.city} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">State</label>
                <Input name="state" value={formData.state} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">ZIP Code</label>
                <Input name="zipCode" value={formData.zipCode} onChange={handleChange} required />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Building2 className="w-5 h-5 text-primary"/> Features & Amenities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Area (sqft)</label>
                <Input type="number" name="area" value={formData.area} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Bedrooms</label>
                <Input type="number" name="bedrooms" value={formData.bedrooms} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Bathrooms</label>
                <Input type="number" name="bathrooms" value={formData.bathrooms} onChange={handleChange} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Amenities (comma separated)</label>
              <Input name="amenities" placeholder="Pool, Gym, Parking..." value={formData.amenities} onChange={handleChange} />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4 pt-4">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={saving}>Cancel</Button>
          <Button type="submit" disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  )
}
