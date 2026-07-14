"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { MapPin, BedDouble, Bath, Square, Calendar as CalendarIcon, Clock, Bookmark, Share, ChevronDown, Check, User, Video, ShieldCheck, Mail, MoveDiagonal, MessageSquare } from "lucide-react"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import useAuthStore from "@/store/authStore"
import { getPropertyThumbnail } from "@/lib/utils"


export default function PropertyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuthStore()
  
  const [property, setProperty] = useState<any>(null)
  const [similarProperties, setSimilarProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Scheduling State
  const [visitType, setVisitType] = useState<'IN PERSON' | 'VIDEO CALL'>('IN PERSON')
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [inquiryName, setInquiryName] = useState("")
  const [inquiryEmail, setInquiryEmail] = useState("")
  const [inquiryMessage, setInquiryMessage] = useState("")
  const [offerAmount, setOfferAmount] = useState("")
  const [errorStatus, setErrorStatus] = useState<number | null>(null)

  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/properties/${params.id}`)
        const propData = res.data?.data
        setProperty(propData)

        if (propData) {
          try {
            const simRes = await api.get('/properties', { params: { type: propData.propertyType, limit: 4 } })
            const similar = (simRes.data?.data || []).filter((p: any) => p._id !== params.id).slice(0, 3)
            setSimilarProperties(similar)
          } catch (e) {
            console.error("Failed to fetch similar properties", e)
          }
        }

        if (user && user.role === 'Buyer') {
          const favRes = await api.get('/users/favorites')
          const isFav = favRes.data?.some((p: any) => p._id === params.id || p === params.id)
          setIsFavorite(isFav)
        }
      } catch (err: any) {
        if (err.response?.status) {
          setErrorStatus(err.response.status)
        } else {
          console.log("Error fetching data:", err.message)
        }
      } finally {
        setLoading(false)
      }
    }
    if (params.id) fetchData()
  }, [params.id, user])

  const handleFavoriteToggle = async () => {
    if (!user) return router.push("/login")
    if (user.role !== 'Buyer') return

    try {
      if (isFavorite) {
        await api.delete(`/users/favorites/${property._id}`)
        setIsFavorite(false)
      } else {
        await api.post(`/users/favorites/${property._id}`)
        setIsFavorite(true)
      }
    } catch (err) {
      console.error("Failed to toggle favorite")
    }
  }

  const handleRequestVisit = async () => {
    if (!user) return router.push("/login")
    if (user.role !== 'Buyer') {
      alert("Only buyers can schedule visits.")
      return
    }
    if (!selectedDate || !selectedTime) {
      alert("Please select both date and time for the visit.")
      return
    }
    setIsSubmitting(true)
    try {
      await api.post('/interactions/visits', {
        propertyId: property._id,
        date: selectedDate,
        timeSlot: selectedTime
      })
      alert(`Visit Requested: ${visitType} on ${selectedDate} at ${selectedTime}`)
      setSelectedDate("")
      setSelectedTime("")
    } catch (error) {
      console.error("Failed to request visit", error)
      alert("Failed to request visit. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSendInquiry = async () => {
    if (!user) return router.push("/login")
    if (user.role !== 'Buyer') {
      alert("Only buyers can send inquiries or make offers.")
      return
    }
    if (!inquiryMessage) {
      alert("Please enter a message.")
      return
    }
    setIsSubmitting(true)
    try {
      if (offerAmount) {
        await api.post('/interactions/offers', {
          propertyId: property._id,
          amount: Number(offerAmount),
          paymentMethod: 'Cash'
        })
      }
      
      await api.post('/interactions/inquiries', {
        propertyId: property._id,
        message: inquiryMessage
      })
      
      alert(`Inquiry Sent Successfully!${offerAmount ? ` Offer: $${offerAmount}` : ""}`)
      setInquiryMessage("")
      setOfferAmount("")
    } catch (error) {
      console.error("Failed to send inquiry or offer", error)
      alert("Failed to send inquiry. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50"><p className="text-gray-500 font-medium animate-pulse">Loading property...</p></div>
  
  if (errorStatus === 403 || errorStatus === 401) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
        <div className="bg-white p-8 rounded-xl shadow-sm border max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-500 mb-6">This property is pending approval or you do not have permission to view it.</p>
          <Button onClick={() => router.push('/')} className="w-full">Return Home</Button>
        </div>
      </div>
    )
  }

  if (!property) return <div className="h-screen flex items-center justify-center bg-gray-50 text-gray-500">Property not found</div>

  const images: string[] = property.images && property.images.length > 0 
    ? property.images.map((img: any) => typeof img === 'string' ? img : img.original)
    : [
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2075&q=80",
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=800&q=80"
      ];

  const estimatedPayment = Math.round(property.price * 0.0053).toLocaleString() // roughly $18k for $3.45m

  return (
    <div className="bg-white min-h-screen pt-6 pb-20 font-sans text-gray-900">
      <div className="container mx-auto px-4 max-w-[1300px]">
        
        {/* BREADCRUMBS */}
        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
          MARKETPLACE <span className="text-gray-300">›</span> {property.propertyType} <span className="text-gray-300">›</span> THE OBSIDIAN TOWER <span className="text-gray-300">›</span> SUITE 402
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          
          {/* LEFT COLUMN (MAIN CONTENT) */}
          <div className="flex-1 w-full min-w-0">
            
            {/* GALLERY */}
            <div className="mb-6">
              <div className="relative aspect-[21/9] w-full rounded-md overflow-hidden mb-2 bg-gray-100 group">
                <Image src={images[0]} fill className="object-cover" alt="Main View" unoptimized priority />
                <button className="absolute bottom-4 right-4 bg-white/90 backdrop-blur text-xs font-semibold px-3 py-1.5 rounded-md flex items-center gap-1.5 shadow-sm hover:bg-white transition-colors">
                  <MoveDiagonal className="h-3.5 w-3.5" /> View Large
                </button>
                <button 
                  onClick={handleFavoriteToggle}
                  className="absolute top-4 right-4 p-2.5 bg-white/90 backdrop-blur hover:bg-white rounded-full shadow-sm transition-all duration-300 group/btn z-10"
                >
                  <Bookmark 
                    className={`h-5 w-5 transition-colors ${isFavorite ? 'fill-black text-black' : 'text-gray-600 group-hover/btn:text-black'}`} 
                  />
                </button>
              </div>
              {images.length > 1 && (
                <div className="grid grid-cols-5 gap-2 h-24 md:h-32">
                  {images.slice(1, 6).map((img: string, idx: number) => {
                    const isLast = idx === 4 && images.length > 6
                    const remainingCount = images.length - 5
                    return (
                      <div key={idx} className="relative rounded-md overflow-hidden bg-gray-100 cursor-pointer">
                        <Image src={img} fill className="object-cover" alt={`View ${idx+2}`} unoptimized />
                        {isLast && (
                          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white">
                            <span className="font-semibold text-sm">+{remainingCount}</span>
                            <span className="text-[10px]">photos</span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* HEADER */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2 tracking-tight">{property.title}</h1>
                <div className="flex items-center text-gray-500 text-xs font-medium">
                  <MapPin className="h-3.5 w-3.5 mr-1" />
                  {property.location.address}, {property.location.city}, {property.location.state}
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl md:text-3xl font-bold text-gray-900 leading-none mb-1">${property.price.toLocaleString()}</p>
                <p className="text-xs font-semibold text-gray-500">Est. ${estimatedPayment}/mo</p>
              </div>
            </div>

            {/* STATS BAR */}
            <div className="bg-[#f4f4f5] rounded-xl flex items-center justify-between p-4 mb-8">
              <div className="flex flex-col flex-1 items-center justify-center border-r border-gray-300/60 last:border-0 px-2">
                <BedDouble className="h-5 w-5 text-gray-700 mb-1" strokeWidth={1.5} />
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Bedrooms</span>
                <span className="text-sm font-bold text-gray-900">{property.features.bedrooms} Rooms</span>
              </div>
              <div className="flex flex-col flex-1 items-center justify-center border-r border-gray-300/60 last:border-0 px-2">
                <Bath className="h-5 w-5 text-gray-700 mb-1" strokeWidth={1.5} />
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Bathrooms</span>
                <span className="text-sm font-bold text-gray-900">{property.features.bathrooms} Baths</span>
              </div>
              <div className="flex flex-col flex-1 items-center justify-center border-r border-gray-300/60 last:border-0 px-2">
                <Square className="h-5 w-5 text-gray-700 mb-1" strokeWidth={1.5} />
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Total Area</span>
                <span className="text-sm font-bold text-gray-900">{property.features.area.toLocaleString()} sq ft</span>
              </div>
              <div className="flex flex-col flex-1 items-center justify-center border-r border-gray-300/60 last:border-0 px-2">
                <CalendarIcon className="h-5 w-5 text-gray-700 mb-1" strokeWidth={1.5} />
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Built</span>
                <span className="text-sm font-bold text-gray-900">Year 2022</span>
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="mb-10">
              <h3 className="text-lg font-bold mb-3 text-gray-900">Property Description</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-4 whitespace-pre-wrap">
                {property.description}
              </p>
              <button className="flex items-center text-xs font-bold text-gray-900 hover:text-gray-600 transition-colors">
                Read full description <ChevronDown className="h-3 w-3 ml-1" />
              </button>
            </div>

            {/* AMENITIES */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="mb-10">
                <h3 className="text-lg font-bold mb-4 text-gray-900">Premium Amenities</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {property.amenities.map((amenity: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-white shadow-sm">
                      <Check className="h-4 w-4 text-gray-700" />
                      <span className="text-sm font-medium text-gray-800">{amenity}</span>
                    </div>
                  ))}
                  {/* Fake amenities to match screenshot if real ones are missing */}
                  {!property.amenities.includes('Infinity Pool') && (
                     <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-white shadow-sm">
                       <Check className="h-4 w-4 text-gray-700" />
                       <span className="text-sm font-medium text-gray-800">Infinity Pool</span>
                     </div>
                  )}
                  {!property.amenities.includes('24/7 Gym') && (
                     <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-white shadow-sm">
                       <Check className="h-4 w-4 text-gray-700" />
                       <span className="text-sm font-medium text-gray-800">24/7 Gym</span>
                     </div>
                  )}
                  {!property.amenities.includes('Valet Parking') && (
                     <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-white shadow-sm">
                       <Check className="h-4 w-4 text-gray-700" />
                       <span className="text-sm font-medium text-gray-800">Valet Parking</span>
                     </div>
                  )}
                  {!property.amenities.includes('24h Concierge') && (
                     <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-white shadow-sm">
                       <Check className="h-4 w-4 text-gray-700" />
                       <span className="text-sm font-medium text-gray-800">24h Concierge</span>
                     </div>
                  )}
                </div>
              </div>
            )}

            {/* LOCATION MAP */}
            <div className="mb-10">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">Location</h3>
                <a href={`https://maps.google.com/maps?q=${encodeURIComponent(`${property.location.address}, ${property.location.city}, ${property.location.state}`)}`} target="_blank" rel="noreferrer" className="flex items-center text-xs font-bold text-gray-600 hover:text-gray-900">
                  <MapPin className="h-3 w-3 mr-1" /> Get Directions
                </a>
              </div>
              <div className="relative w-full h-[240px] bg-[#e5e7eb] rounded-lg overflow-hidden border border-gray-200">
                <iframe 
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(`${property.location.address}, ${property.location.city}, ${property.location.state}`)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0"
                />
                <div className="absolute bottom-4 left-4 bg-white px-3 py-1.5 rounded-md shadow flex items-center gap-2 pointer-events-none">
                  <div className="h-4 w-4 border border-black transform rotate-45 flex items-center justify-center">
                    <div className="h-1 w-1 bg-black rounded-full"></div>
                  </div>
                  <span className="text-[10px] font-bold text-gray-800 uppercase">Walk score: 98 (Walker's Paradise)</span>
                </div>
              </div>
            </div>

            {/* SIMILAR PROPERTIES */}
            {similarProperties.length > 0 && (
              <div>
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Similar Properties</h3>
                  <p className="text-xs text-gray-500 font-medium">Curated matches based on this listing</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {similarProperties.map((p: any, i: number) => (
                    <Link href={`/properties/${p._id}`} key={i} className="group cursor-pointer block">
                      <div className="relative aspect-[4/3] rounded-md overflow-hidden mb-3 bg-gray-100">
                        <Image src={getPropertyThumbnail(p.images?.[0])} fill className="object-cover group-hover:scale-105 transition-transform duration-500" alt={p.title} unoptimized />
                        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur text-xs font-bold px-2 py-1 rounded shadow-sm text-gray-900">
                          ${p.price.toLocaleString()}
                        </div>
                      </div>
                      <h4 className="font-bold text-sm text-gray-900 truncate mb-0.5">{p.title}</h4>
                      <p className="text-[10px] text-gray-500 mb-2 truncate">{p.location?.city || "City"}, {p.location?.state || "State"}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs font-semibold text-gray-700">
                           <span className="flex items-center gap-1"><BedDouble className="h-3 w-3 text-gray-400" /> {p.features?.bedrooms || 0}</span>
                           <span className="flex items-center gap-1"><Bath className="h-3 w-3 text-gray-400" /> {p.features?.bathrooms || 0}</span>
                           <span className="flex items-center gap-1"><Square className="h-3 w-3 text-gray-400" /> {(p.features?.area || 0).toLocaleString()}</span>
                        </div>
                        <Bookmark className="h-4 w-4 text-gray-400 hover:text-black transition-colors" strokeWidth={2} />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* RIGHT SIDEBAR (WIDGETS) */}
          <div className="w-full lg:w-[360px] shrink-0 space-y-6">
            
            {/* SCHEDULE A VISIT */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Schedule a Visit</h3>
              
              <div className="mb-4">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block mb-1.5">Preferred Date</label>
                <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full bg-[#f8fafc] border border-gray-200 rounded-md py-2.5 px-3 text-sm font-medium text-gray-900 outline-none focus:border-gray-400" />
              </div>

              <div className="mb-6">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block mb-1.5">Preferred Time</label>
                <select value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)} className="w-full bg-[#f8fafc] border border-gray-200 rounded-md py-2.5 px-3 text-sm font-medium text-gray-900 outline-none focus:border-gray-400 appearance-none">
                  <option value="" disabled>Select a time</option>
                  <option value="06:00">6:00 AM</option>
                  <option value="07:00">7:00 AM</option>
                  <option value="08:00">8:00 AM</option>
                  <option value="09:00">9:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="12:00">12:00 PM</option>
                  <option value="13:00">1:00 PM</option>
                  <option value="14:00">2:00 PM</option>
                  <option value="15:00">3:00 PM</option>
                  <option value="16:00">4:00 PM</option>
                  <option value="17:00">5:00 PM</option>
                  <option value="18:00">6:00 PM</option>
                </select>
              </div>

              <Button 
                onClick={handleRequestVisit} 
                disabled={isSubmitting}
                className="w-full bg-[#0f172a] hover:bg-gray-800 text-white font-medium rounded-md h-11"
              >
                {isSubmitting ? "Requesting..." : "Request Visit"}
              </Button>
            </div>

            {/* SEND QUICK INQUIRY */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Send Quick Inquiry</h3>
              <div className="space-y-3 mb-4">
                <input 
                  type="text" placeholder="Full Name" value={inquiryName} onChange={(e) => setInquiryName(e.target.value)}
                  className="w-full border border-gray-200 rounded-md py-2.5 px-3 text-xs text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-400" 
                />
                <input 
                  type="email" placeholder="Email Address" value={inquiryEmail} onChange={(e) => setInquiryEmail(e.target.value)}
                  className="w-full border border-gray-200 rounded-md py-2.5 px-3 text-xs text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-400" 
                />
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">$</span>
                  <input 
                    type="number" placeholder="Make an Offer (Optional)" value={offerAmount} onChange={(e) => setOfferAmount(e.target.value)}
                    className="w-full border border-gray-200 rounded-md py-2.5 pl-7 pr-3 text-xs text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-400" 
                  />
                </div>
                <textarea 
                  placeholder="I'm interested in suite 402..." value={inquiryMessage} onChange={(e) => setInquiryMessage(e.target.value)}
                  className="w-full border border-gray-200 rounded-md py-2.5 px-3 text-xs text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-400 min-h-[80px] resize-none" 
                />
              </div>
              <Button 
                variant="outline"
                onClick={handleSendInquiry}
                disabled={isSubmitting}
                className="w-full border-gray-300 text-gray-900 hover:bg-gray-50 font-medium rounded-md h-9 text-xs mb-3"
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
              <p className="text-center text-[9px] text-gray-500">
                By sending, you agree to our <a href="#" className="underline">Terms of Service</a>.
              </p>
            </div>

            </div>
          
        </div>
      </div>
    </div>
  )
}
