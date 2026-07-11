"use client"

import { useEffect, useState, Suspense, useRef, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams, useRouter } from "next/navigation"
import { Search, MapPin, Building, BedDouble, Bath, Square, Map, LayoutGrid, Check, Bookmark } from "lucide-react"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import useAuthStore from "@/store/authStore"

interface Property {
  _id: string;
  title: string;
  price: number;
  location: { city: string; state: string; address: string };
  features: { bedrooms: number; bathrooms: number; area: number };
  propertyType: string;
  images: string[];
}

const AMENITIES_LIST = [
  "Pool",
  "Garage",
  "Smart Home Tech",
  "Garden/Yard",
  "Gym",
  "Balcony",
  "Security System"
];

function PropertiesList() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuthStore()
  const [savedProperties, setSavedProperties] = useState<string[]>([])
  
  // URL Params parsing
  const cityParam = searchParams.get("city") || ""
  const typeParam = searchParams.get("type") || ""
  const minPriceParam = searchParams.get("minPrice") || ""
  const maxPriceParam = searchParams.get("maxPrice") || ""
  const bedroomsParam = searchParams.get("bedrooms") || ""
  const minAreaParam = searchParams.get("minArea") || ""
  const maxAreaParam = searchParams.get("maxArea") || ""
  const amenitiesParam = searchParams.get("amenities") ? searchParams.get("amenities")!.split(',') : []

  // Local State for Filters
  const [location, setLocation] = useState(cityParam)
  const [propertyType, setPropertyType] = useState(typeParam)
  const [minPrice, setMinPrice] = useState(minPriceParam)
  const [maxPrice, setMaxPrice] = useState(maxPriceParam)
  const [bedrooms, setBedrooms] = useState(bedroomsParam)
  const [minArea, setMinArea] = useState(minAreaParam)
  const [maxArea, setMaxArea] = useState(maxAreaParam)
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(amenitiesParam)

  // Pagination & Data State
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const observer = useRef<IntersectionObserver | null>(null)

  const lastPropertyElementRef = useCallback((node: HTMLAnchorElement | null) => {
    if (loading || loadingMore) return
    if (observer.current) observer.current.disconnect()
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1)
      }
    })
    if (node) observer.current.observe(node)
  }, [loading, loadingMore, hasMore])

  const applyFilters = () => {
    const params = new URLSearchParams()
    if (location) params.append("city", location)
    if (propertyType) params.append("type", propertyType)
    if (minPrice) params.append("minPrice", minPrice)
    if (maxPrice) params.append("maxPrice", maxPrice)
    if (bedrooms) params.append("bedrooms", bedrooms)
    if (minArea) params.append("minArea", minArea)
    if (maxArea) params.append("maxArea", maxArea)
    if (selectedAmenities.length > 0) params.append("amenities", selectedAmenities.join(','))

    router.push(`/properties?${params.toString()}`)
  }

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    )
  }

  useEffect(() => {
    if (user && user.role === 'Buyer') {
      api.get('/users/favorites').then(res => {
        setSavedProperties(res.data.map((p: any) => typeof p === 'object' ? p._id : p))
      }).catch(err => console.error(err))
    }
  }, [user])

  const toggleFavorite = async (e: React.MouseEvent, propertyId: string) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.role !== 'Buyer') {
      alert("Only buyers can save properties.");
      return;
    }
    
    try {
      if (savedProperties.includes(propertyId)) {
        await api.delete(`/users/favorites/${propertyId}`);
        setSavedProperties(prev => prev.filter(id => id !== propertyId));
      } else {
        await api.post(`/users/favorites/${propertyId}`);
        setSavedProperties(prev => [...prev, propertyId]);
      }
    } catch (err) {
      console.error("Failed to toggle favorite", err);
    }
  }

  // Reset when filters change in URL
  useEffect(() => {
    setPage(1)
    setProperties([])
    setHasMore(true)
  }, [cityParam, typeParam, minPriceParam, maxPriceParam, bedroomsParam, minAreaParam, maxAreaParam, searchParams.get("amenities")])

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        if (page === 1) setLoading(true)
        else setLoadingMore(true)

        const params = new URLSearchParams()
        params.append("status", "Published")
        params.append("limit", "12")
        params.append("page", page.toString())
        if (cityParam) params.append("city", cityParam)
        if (typeParam) params.append("type", typeParam)
        if (minPriceParam) params.append("minPrice", minPriceParam)
        if (maxPriceParam) params.append("maxPrice", maxPriceParam)
        if (bedroomsParam) params.append("bedrooms", bedroomsParam)
        if (minAreaParam) params.append("minArea", minAreaParam)
        if (maxAreaParam) params.append("maxArea", maxAreaParam)
        const ams = searchParams.get("amenities")
        if (ams) params.append("amenities", ams)

        const res = await api.get(`/properties?${params.toString()}`)
        const newProperties = res.data?.data || []
        
        setProperties(prev => {
          if (page === 1) return newProperties
          const existingIds = new Set(prev.map(p => p._id))
          return [...prev, ...newProperties.filter((p: any) => !existingIds.has(p._id))]
        })

        if (newProperties.length < 12) {
          setHasMore(false)
        }
      } catch (err) {
        console.error("Failed to fetch properties:", err)
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    }
    fetchProperties()
  }, [page, cityParam, typeParam, minPriceParam, maxPriceParam, bedroomsParam, minAreaParam, maxAreaParam, searchParams.get("amenities")])

  const filteredProperties = properties.filter(p => 
    p.title.toLowerCase().includes(location.toLowerCase()) || 
    p.location.city.toLowerCase().includes(location.toLowerCase())
  )

  return (
    <div className="bg-gray-50/50 min-h-screen pt-8 pb-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* LEFT SIDEBAR: FILTERS */}
          <aside className="w-full lg:w-[280px] shrink-0">
            <div className="sticky top-24 space-y-6">
              
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm overflow-y-auto max-h-[calc(100vh-22rem)] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
                <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg">Filters</h3>
                <Button variant="link" className="text-muted-foreground text-sm p-0 h-auto font-medium" onClick={() => {
                  setLocation(""); setPropertyType(""); setMinPrice(""); setMaxPrice("");
                  setBedrooms(""); setMinArea(""); setMaxArea(""); setSelectedAmenities([]);
                  router.push("/properties")
                }}>Reset All</Button>
              </div>

              <div className="space-y-6">
                {/* Location Search */}
                <div>
                  <label className="text-sm font-semibold mb-3 block text-gray-800">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input 
                      placeholder="Search city..." 
                      className="pl-9 bg-white border-gray-200 focus-visible:ring-black h-10"
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                    />
                  </div>
                </div>

                {/* Property Type */}
                <div>
                  <label className="text-sm font-semibold mb-3 block text-gray-800">Property Type</label>
                  <select 
                    className="w-full border-gray-200 bg-white rounded-lg px-3 py-2 text-sm outline-none border focus:ring-2 focus:ring-black/5 h-10"
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                  >
                    <option value="">Any Type</option>
                    <option value="Penthouse">Penthouse</option>
                    <option value="Villa">Villa</option>
                    <option value="Apartment">Apartment</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Townhouse">Townhouse</option>
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="text-sm font-semibold mb-3 flex justify-between items-end text-gray-800">
                    Price Range
                    <span className="text-gray-500 font-medium text-xs">USD</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <Input type="number" placeholder="Min" className="bg-white border-gray-200 focus-visible:ring-black h-10" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
                    <span className="text-gray-300">-</span>
                    <Input type="number" placeholder="Max" className="bg-white border-gray-200 focus-visible:ring-black h-10" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
                  </div>
                </div>

                {/* Bedrooms */}
                <div>
                  <label className="text-sm font-semibold mb-3 block text-gray-800">Bedrooms</label>
                  <div className="flex flex-wrap gap-2">
                    {['1', '2', '3', '4', '5'].map(num => (
                      <button
                        key={num}
                        onClick={() => setBedrooms(bedrooms === num ? "" : num)}
                        className={`h-10 flex-1 min-w-[2.5rem] rounded-lg flex items-center justify-center text-sm font-semibold transition-all border ${
                          bedrooms === num 
                            ? 'bg-[#1a1b26] text-white border-[#1a1b26] shadow-sm' 
                            : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        {num}+
                      </button>
                    ))}
                  </div>
                </div>

                {/* Square Footage */}
                <div>
                  <label className="text-sm font-semibold mb-3 flex justify-between items-end text-gray-800">
                    Square Footage
                    <span className="text-gray-500 font-medium text-xs">Sq.Ft</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <Input type="number" placeholder="Min" className="bg-white border-gray-200 focus-visible:ring-black h-10" value={minArea} onChange={e => setMinArea(e.target.value)} />
                    <span className="text-gray-300">-</span>
                    <Input type="number" placeholder="Max" className="bg-white border-gray-200 focus-visible:ring-black h-10" value={maxArea} onChange={e => setMaxArea(e.target.value)} />
                  </div>
                </div>

                {/* Amenities */}
                <div>
                  <label className="text-sm font-semibold mb-3 block text-gray-800">Amenities</label>
                  <div className="space-y-3">
                    {AMENITIES_LIST.map(amenity => {
                      const isSelected = selectedAmenities.includes(amenity);
                      return (
                        <button
                          key={amenity}
                          onClick={() => toggleAmenity(amenity)}
                          className="flex items-center gap-3 cursor-pointer group w-full text-left"
                        >
                          <div className={`h-5 w-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-[#1a1b26] border-[#1a1b26] text-white' : 'border-gray-300 bg-white group-hover:border-gray-500'}`}>
                            {isSelected && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                          </div>
                          <span className={`text-sm ${isSelected ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>{amenity}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Apply Button */}
                <div className="pt-2">
                  <Button className="w-full bg-[#1a1b26] hover:bg-[#1a1b26]/90 text-white font-bold h-12 text-base rounded-xl" size="lg" onClick={applyFilters}>
                    Apply Filters
                  </Button>
                </div>
              </div>
              </div>

              {/* SIDEBAR AD */}
              <div className="hidden lg:block rounded-2xl border border-gray-100 overflow-hidden relative h-56 shadow-sm group cursor-pointer bg-black">
                <Image src="https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?auto=format&fit=crop&q=80" alt="Sidebar Ad" fill className="object-cover opacity-60 group-hover:opacity-40 group-hover:scale-105 transition-all duration-700" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80"></div>
                <div className="absolute inset-0 p-5 flex flex-col items-center justify-end text-center pb-6">
                  <h4 className="text-white font-bold text-xl mb-1">Sell Your Property</h4>
                  <p className="text-gray-300 text-xs mb-4">List with Urbaniq and reach premium buyers worldwide.</p>
                  <Button size="sm" className="bg-white text-black hover:bg-gray-100 w-full rounded-lg font-bold">List Now</Button>
                </div>
              </div>

            </div>
          </aside>

          {/* RIGHT MAIN CONTENT: PROPERTIES */}
          <main className="flex-1">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 mb-1">Explore Properties</h1>
                <p className="text-gray-500 text-sm font-medium">
                  {loading ? "Discovering elite properties..." : `Showing ${filteredProperties.length} ${filteredProperties.length === 1 ? 'result' : 'results'}`}
                </p>
              </div>
              <select className="border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-white border shadow-sm outline-none font-medium text-gray-700 focus:ring-2 focus:ring-black/5">
                <option>Sort by: Newest</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
              </select>
            </div>

            {/* HORIZONTAL BANNER AD */}
            <div className="mb-8 w-full h-32 md:h-40 bg-[#1a1b26] rounded-2xl overflow-hidden relative shadow-sm group cursor-pointer border border-gray-200/50">
              <Image src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80" alt="Ad" fill className="object-cover opacity-40 group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
              <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-center">
                <span className="text-white/70 text-[10px] font-bold uppercase tracking-widest mb-1 md:mb-2">Sponsored Content</span>
                <h3 className="text-white text-xl md:text-3xl font-bold mb-1 md:mb-2 leading-tight">Need a Luxury Mortgage?</h3>
                <p className="text-gray-300 text-xs md:text-sm max-w-md hidden md:block">Get pre-approved for up to $10M in 24 hours with our premium banking partners.</p>
                <div className="mt-3 md:mt-4">
                  <span className="text-white text-xs md:text-sm font-bold border-b border-white pb-0.5 group-hover:text-gray-300 group-hover:border-gray-300 transition-colors">Apply Now →</span>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="animate-pulse bg-white border border-gray-100 shadow-sm aspect-[4/3] rounded-2xl"></div>
                ))}
              </div>
            ) : filteredProperties.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-2xl border border-gray-100 shadow-sm">
                 <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                   <Search className="h-8 w-8 text-gray-400" />
                 </div>
                 <h3 className="text-xl font-bold mb-2 text-gray-900">No properties found</h3>
                 <p className="text-gray-500 mb-8 max-w-sm mx-auto">We couldn't find any properties matching your exact criteria. Try adjusting your filters.</p>
                 <Button className="bg-[#1a1b26] hover:bg-[#1a1b26]/90 rounded-xl px-8" onClick={() => { setLocation(""); setPropertyType(""); setMinPrice(""); setMaxPrice(""); setBedrooms(""); setMinArea(""); setMaxArea(""); setSelectedAmenities([]); router.push("/properties") }}>
                   Clear All Filters
                 </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProperties.map((property, index) => {
                  const isLastElement = index === filteredProperties.length - 1;
                  return (
                    <Link 
                      href={`/properties/${property._id}`} 
                      key={property._id} 
                      className="group block"
                      ref={isLastElement ? lastPropertyElementRef : null}
                    >
                      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-gray-100/80 group-hover:-translate-y-1 bg-white rounded-2xl shadow-sm hover:border-gray-200">
                        <div className="relative aspect-[4/3] w-full bg-gray-100 overflow-hidden">
                          <Image 
                            src={property.images?.[0] || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"}
                            alt={property.title}
                            fill
                            unoptimized
                            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg shadow-sm text-gray-900">
                            {property.propertyType}
                          </div>
                          <button 
                            onClick={(e) => toggleFavorite(e, property._id)}
                            className="absolute top-4 right-4 p-2.5 bg-white/90 backdrop-blur hover:bg-white rounded-full shadow-sm transition-all duration-300 group/btn z-10"
                          >
                            <Bookmark 
                              className={`h-4 w-4 transition-colors ${savedProperties.includes(property._id) ? 'fill-black text-black' : 'text-gray-600 group-hover/btn:text-black'}`} 
                            />
                          </button>
                        </div>
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="font-bold text-lg leading-tight group-hover:text-[#1a1b26] transition-colors truncate pr-4 text-gray-900">
                              {property.title}
                            </h3>
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-500 mb-5">
                            <MapPin className="h-4 w-4 mr-1.5 shrink-0 text-gray-400" />
                            <span className="truncate font-medium">{property.location.city}, {property.location.state}</span>
                          </div>

                          <div className="text-2xl font-black text-[#1a1b26] mb-5">
                            ${property.price.toLocaleString()}
                          </div>

                          <div className="flex items-center justify-between pt-5 border-t border-gray-100 text-sm font-semibold text-gray-600">
                            <div className="flex items-center gap-2">
                              <BedDouble className="h-4 w-4 text-gray-400" /> <span>{property.features.bedrooms}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Bath className="h-4 w-4 text-gray-400" /> <span>{property.features.bathrooms}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Square className="h-4 w-4 text-gray-400" /> <span>{property.features.area} sqft</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  )
                })}
              </div>
            )}

            {loadingMore && (
              <div className="mt-12 flex justify-center pb-8">
                <div className="h-8 w-8 rounded-full border-2 border-gray-200 border-t-[#1a1b26] animate-spin"></div>
              </div>
            )}

            {!hasMore && properties.length > 0 && (
              <div className="mt-16 text-center pb-8">
                <div className="inline-flex items-center justify-center px-4 py-2 bg-gray-50 rounded-full border border-gray-100 text-xs font-semibold uppercase tracking-widest text-gray-400">
                  End of Results
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default function PropertiesListingPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center">Loading properties...</div>}>
      <PropertiesList />
    </Suspense>
  )
}
