"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import dynamic from "next/dynamic"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import api from "@/lib/api"
import { Building2, MapPin, ListPlus, Users, UserPlus, CheckCircle2, ChevronRight, ChevronLeft, Map as MapIcon, UploadCloud, Star, ShieldCheck, User, Search, X, Mail, Phone, Briefcase, TrendingUp, Award, ArrowRight, LocateFixed, DollarSign } from "lucide-react"

const MapSelector = dynamic(() => import("@/components/ui/MapSelector"), { ssr: false, loading: () => <div className="h-[300px] w-full rounded-xl bg-muted animate-pulse flex items-center justify-center">Loading map...</div> })

interface Agent {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

// Deterministic pseudo-random stats per agent so they don't change on re-render
function getAgentStats(id: string) {
  const hash = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return {
    rating: (4.5 + (hash % 5) * 0.1).toFixed(1),
    deals: 18 + (hash % 120),
    reviews: 12 + (hash % 80),
    years: 2 + (hash % 12),
    specialty: ["Residential", "Commercial", "Luxury", "Investment", "Rental"][hash % 5],
    city: ["New York", "Los Angeles", "Chicago", "Miami", "Austin"][hash % 5],
  }
}

export default function NewPropertyWizard() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [isLocating, setIsLocating] = useState(false)

  // Agent Selection State
  const [managementOption, setManagementOption] = useState<"self" | "agent">("self")
  const [agents, setAgents] = useState<Agent[]>([])
  const [selectedAgentId, setSelectedAgentId] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [previewAgent, setPreviewAgent] = useState<Agent | null>(null)
  const [commissionInfo, setCommissionInfo] = useState("")

  const steps = [
    { id: 1, title: 'Basic Info' },
    { id: 2, title: 'Features & Docs' },
    { id: 3, title: 'Location' },
    { id: 4, title: 'Management' },
    ...(managementOption === 'agent' ? [{ id: 5, title: 'Assign Agent' }] : []),
    { id: managementOption === 'agent' ? 6 : 5, title: 'Platform Fee' }
  ]

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    propertyType: "Villa",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    bedrooms: "",
    bathrooms: "",
    area: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    documentUploaded: false,
    imagesUploaded: 0,
  })

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

  useEffect(() => {
    if (managementOption === "agent" && agents.length === 0) {
      const fetchAgents = async () => {
        try {
          const res = await api.get("/users/agents")
          setAgents(res.data)
        } catch (err) {
          console.error("Failed to fetch agents")
        }
      }
      fetchAgents()
    }
  }, [managementOption, agents.length])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const validateStep = () => {
    setError("")
    switch (currentStep) {
      case 1:
        if (!formData.title || !formData.description || !formData.price || !formData.propertyType) {
           return "Please fill out all basic property details."
        }
        if (formData.title.length < 5) {
           return "Title must be at least 5 characters long."
        }
        if (formData.title.length > 100) {
           return "Title cannot exceed 100 characters."
        }
        if (formData.description.length < 10) {
           return "Description must be at least 10 characters long."
        }
        if (Number(formData.price) <= 0) {
           return "Price must be a positive number."
        }
        if (!formData.contactName || !formData.contactEmail || !formData.contactPhone) {
           return "Please provide all contact details."
        }
        if (!/^\S+@\S+\.\S+$/.test(formData.contactEmail)) {
           return "Please enter a valid email address."
        }
        break
      case 2:
        {
          const showBedrooms = formData.propertyType !== 'Land' && formData.propertyType !== 'Commercial';
          const showBathrooms = formData.propertyType !== 'Land';
          
          if ((showBedrooms && !formData.bedrooms) || (showBathrooms && !formData.bathrooms) || !formData.area) {
             return "Please fill out all property features."
          }
        }
        // TODO: Make images mandatory after deployment
        // if (formData.imagesUploaded === 0) {
        //    return "Please upload at least 1 property image."
        // }
        // TODO: Make documents mandatory after deployment
        // if (!formData.documentUploaded) {
        //    return "Verification document is required to proceed."
        // }
        break
      case 3:
        if (!formData.address || !formData.city || !formData.state || !formData.zipCode) {
           return "All location fields are required."
        }
        break
      case 4:
        break
      case 5:
        if (managementOption === 'agent' && !selectedAgentId) return "Please select an agent to assign."
        break
      case 6:
        break
    }
    return null
  }

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handlePaymentInitiation = async () => {
    const err = validateStep()
    if (err) {
      setError(err)
      return
    }

    setLoading(true)
    setError("")

    const isLoaded = await loadRazorpay()
    if (!isLoaded) {
      setError("Razorpay SDK failed to load")
      setLoading(false)
      return
    }

    try {
      const orderRes = await api.post("/payments/create-order", { amount: 500000 })
      const order = orderRes.data.order

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_dummy',
        amount: order.amount,
        currency: order.currency,
        name: "Urbaniq",
        description: "Platform Fee for Property Listing",
        order_id: order.id,
        handler: async function (response: any) {
          await handleSubmit(response.razorpay_payment_id)
        },
        prefill: {
          name: formData.contactName,
          email: formData.contactEmail,
          contact: formData.contactPhone
        },
        theme: {
          color: "#1a1b26"
        }
      }
      
      const rzp = new (window as any).Razorpay(options)
      rzp.on('payment.failed', function (response: any) {
        setError(response.error.description || "Payment failed")
        setLoading(false)
      })
      rzp.open()
    } catch (err: any) {
      console.error(err)
      setError("Failed to initiate payment")
      setLoading(false)
    }
  }

  const handleNext = () => {
    const err = validateStep()
    if (err) {
      setError(err)
      return
    }
    if (currentStep < steps.length) {
      setCurrentStep(s => s + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(s => s - 1)
      setError("")
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleSubmit = async (paymentId?: string) => {
    const err = validateStep()
    if (err) {
      setError(err)
      return
    }

    setLoading(true)
    setError("")

    try {
      const features: any = {
        area: Number(formData.area)
      };
      
      if (formData.propertyType !== 'Land' && formData.propertyType !== 'Commercial') {
        features.bedrooms = Number(formData.bedrooms);
      }
      
      if (formData.propertyType !== 'Land') {
        features.bathrooms = Number(formData.bathrooms);
      }

      const payload = {
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        propertyType: formData.propertyType,
        location: {
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode
        },
        features,
        contactDetails: {
          name: formData.contactName,
          email: formData.contactEmail,
          phone: formData.contactPhone
        },
        images: formData.imagesUploaded > 0 ? [
           "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2075&q=80",
           "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
        ] : [],
        documents: formData.documentUploaded ? ["https://example.com/demo-verification-doc.pdf"] : []
      }

      // 1. Create Property
      const res = await api.post("/properties", payload)
      const newPropertyId = res.data.data._id

      // 2. Assign Agent if selected
      if (managementOption === "agent") {
        await api.post("/assignments", {
          propertyId: newPropertyId,
          agentId: selectedAgentId,
          commissionInfo
        })
      }

      router.push("/dashboard/owner")
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.message || "Failed to create property")
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Add New Listing</h1>
        <p className="text-muted-foreground">List a property in {steps.length} easy steps.</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-10 px-4 md:px-10">
        <div className="flex justify-between items-center relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-muted -z-10" />
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-primary transition-all duration-300 -z-10" 
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />
          
          {steps.map((step) => {
            const isCompleted = step.id < currentStep
            const isCurrent = step.id === currentStep
            
            return (
              <div key={step.id} className="flex flex-col items-center gap-2 bg-background p-1">
                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-semibold transition-colors
                  ${isCompleted ? 'bg-primary border-primary text-primary-foreground' : 
                    isCurrent ? 'border-primary text-primary bg-background' : 
                    'border-muted text-muted-foreground bg-background'}`}
                >
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : step.id}
                </div>
                <span className={`text-xs font-medium hidden md:block ${isCurrent ? 'text-primary' : 'text-muted-foreground'}`}>
                  {step.title}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <Card className="border shadow-lg">
        <CardContent className="p-8">
          
          {/* STEP 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Basic Information</h2>
                <p className="text-muted-foreground mb-8">Let's start with the fundamental details of your listing.</p>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Property Title</label>
                    <Input name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Luxury Downtown Penthouse" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Price (USD)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
                      <Input 
                        name="price" 
                        type="number" 
                        min="0" 
                        value={formData.price} 
                        onChange={handleChange} 
                        placeholder="500000" 
                        className="pl-8"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <textarea 
                    name="description" 
                    value={formData.description} 
                    onChange={handleChange} 
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" 
                    placeholder="Describe your property's best features..." 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <select 
                      name="propertyType" 
                      value={formData.propertyType} 
                      onChange={handleChange}
                      className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="Villa">Villa</option>
                      <option value="Apartment">Apartment</option>
                      <option value="Penthouse">Penthouse</option>
                      <option value="Townhouse">Townhouse</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Land">Land</option>
                    </select>
                  </div>
                </div>

                <div className="pt-6 border-t mt-8">
                  <h3 className="text-lg font-semibold mb-4">Contact Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Full Name</label>
                      <Input name="contactName" value={formData.contactName} onChange={handleChange} placeholder="John Doe" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email</label>
                      <Input name="contactEmail" type="email" value={formData.contactEmail} onChange={handleChange} placeholder="johndoe@example.com" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Phone</label>
                      <Input name="contactPhone" type="tel" value={formData.contactPhone} onChange={handleChange} placeholder="+1 (555) 123-4567" />
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* STEP 2: Features & Docs */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Features & Documents</h2>
                <p className="text-muted-foreground mb-8">Detail the property's physical features and upload verification documents.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {formData.propertyType !== 'Land' && formData.propertyType !== 'Commercial' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Bedrooms</label>
                    <Input name="bedrooms" type="number" min="0" value={formData.bedrooms} onChange={handleChange} placeholder="3" />
                  </div>
                )}
                {formData.propertyType !== 'Land' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Bathrooms</label>
                    <Input name="bathrooms" type="number" min="0" step="0.5" value={formData.bathrooms} onChange={handleChange} placeholder="2.5" />
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Area (sqft)</label>
                  <Input name="area" type="number" min="0" value={formData.area} onChange={handleChange} placeholder="2500" />
                </div>
              </div>

              <div className="space-y-2 pt-6 border-t mt-8">
                <label className="text-sm font-medium">Property Photos <span className="text-muted-foreground font-normal">(Optional for now)</span></label>
                <p className="text-xs text-muted-foreground mb-3">Upload high-quality photos of your property.</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.imagesUploaded > 0 && Array.from({ length: formData.imagesUploaded }).map((_, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden border">
                       <Image 
                         src={`https://images.unsplash.com/photo-${1600596542815 + i}?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`} 
                         alt="Property preview" 
                         fill 
                         className="object-cover"
                       />
                       <button 
                         type="button"
                         onClick={() => setFormData({...formData, imagesUploaded: formData.imagesUploaded - 1})}
                         className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-destructive transition-colors"
                       >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                       </button>
                    </div>
                  ))}
                  
                  {formData.imagesUploaded < 4 && (
                    <div 
                      onClick={() => document.getElementById('image-upload')?.click()}
                      className="aspect-square border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center bg-muted/10 hover:bg-muted/30 cursor-pointer transition-colors"
                    >
                      <UploadCloud className="w-8 h-8 text-muted-foreground mb-2" />
                      <span className="text-xs font-medium text-muted-foreground">Add Photo</span>
                      <input 
                        type="file" 
                        accept="image/*"
                        className="hidden" 
                        id="image-upload" 
                        onChange={(e) => {
                           if (e.target.files && e.target.files.length > 0) {
                              setFormData({...formData, imagesUploaded: formData.imagesUploaded + 1})
                           }
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2 pt-6 border-t mt-8">
                <label className="text-sm font-medium">Verification Documents <span className="text-muted-foreground font-normal">(Optional for now)</span></label>
                <p className="text-xs text-muted-foreground mb-3">Please upload property ownership documents (Title Deed, Tax Records, etc.) for verification.</p>
                
                <div className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center bg-muted/10 hover:bg-muted/30 transition-colors">
                  {formData.documentUploaded ? (
                    <>
                      <CheckCircle2 className="w-10 h-10 text-green-500 mb-3" />
                      <p className="font-medium">Document attached successfully!</p>
                      <p className="text-xs text-muted-foreground mt-1">property-deed-verification.pdf</p>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        className="mt-4 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setFormData({...formData, documentUploaded: false})}
                      >
                        Remove
                      </Button>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-10 h-10 text-muted-foreground mb-3" />
                      <p className="font-medium text-sm">Click to upload or drag and drop</p>
                      <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, or JPG (max. 10MB)</p>
                      <input 
                        type="file" 
                        className="hidden" 
                        id="doc-upload" 
                        onChange={(e) => {
                           if (e.target.files && e.target.files.length > 0) {
                              setFormData({...formData, documentUploaded: true})
                           }
                        }}
                      />
                      <Button 
                        type="button" 
                        variant="secondary" 
                        size="sm" 
                        className="mt-4"
                        onClick={() => document.getElementById('doc-upload')?.click()}
                      >
                        Select File
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Location */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-2xl font-semibold mb-2">Property Location</h2>
                  <p className="text-muted-foreground">Where is your property located?</p>
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleUseCurrentLocation}
                  disabled={isLocating}
                  className="shrink-0 bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary"
                >
                  <LocateFixed className={`w-4 h-4 mr-2 ${isLocating ? 'animate-spin' : ''}`} />
                  {isLocating ? 'Locating...' : 'Use Current Location'}
                </Button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Street Address</label>
                  <Input name="address" value={formData.address} onChange={handleChange} placeholder="123 Main St" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">City</label>
                    <Input name="city" value={formData.city} onChange={handleChange} placeholder="New York" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">State</label>
                    <Input name="state" value={formData.state} onChange={handleChange} placeholder="NY" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Zip Code</label>
                    <Input name="zipCode" value={formData.zipCode} onChange={handleChange} placeholder="10001" />
                  </div>
                </div>

                <div className="mt-6">
                  <p className="text-sm font-medium mb-3 flex items-center gap-2">
                    <MapIcon className="w-4 h-4 text-muted-foreground" /> 
                    Or click anywhere on the map to pin the exact location:
                  </p>
                  <MapSelector onLocationSelect={handleMapLocationSelect} />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Management */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Management & Submission</h2>
                <p className="text-muted-foreground mb-8">Choose your management strategy and submit your listing.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div 
                  className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${managementOption === 'self' ? 'border-primary bg-primary/5 shadow-md' : 'border-border hover:border-primary/50'}`}
                  onClick={() => setManagementOption('self')}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${managementOption === 'self' ? 'border-primary' : 'border-muted-foreground'}`}>
                      {managementOption === 'self' && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                    </div>
                    <span className="font-semibold text-lg">Manage Myself</span>
                  </div>
                  <p className="text-sm text-muted-foreground pl-8 leading-relaxed">
                    You will act as the primary contact. All inquiries, viewings, and negotiations will go directly to your inbox.
                  </p>
                </div>

                <div 
                  className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${managementOption === 'agent' ? 'border-primary bg-primary/5 shadow-md' : 'border-border hover:border-primary/50'}`}
                  onClick={() => setManagementOption('agent')}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${managementOption === 'agent' ? 'border-primary' : 'border-muted-foreground'}`}>
                      {managementOption === 'agent' && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                    </div>
                    <span className="font-semibold text-lg flex items-center gap-2"><UserPlus className="h-5 w-5" /> Assign Agent</span>
                  </div>
                  <p className="text-sm text-muted-foreground pl-8 leading-relaxed">
                    A verified real estate agent will handle the listing, field communications, and arrange viewings on your behalf.
                  </p>
                </div>
              </div>

              </div>
          )}
          
          {/* STEP 5: Assign Agent */}
          {currentStep === 5 && managementOption === 'agent' && (() => {
            const filteredAgents = agents.filter(a =>
              `${a.firstName} ${a.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
              a.email.toLowerCase().includes(searchTerm.toLowerCase())
            )
            const activeAgent = previewAgent || agents.find(a => a._id === selectedAgentId)

            return (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight mb-2">Select a Verified Agent</h2>
                  <p className="text-muted-foreground">
                    Choose a certified Urbaniq professional to manage your listing.
                  </p>
                </div>

                <div className="grid lg:grid-cols-5 gap-6 items-start">
                  {/* LEFT PANEL: Agent Grid */}
                  <div className={`space-y-4 ${activeAgent ? "lg:col-span-3" : "lg:col-span-5"}`}>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by name or email..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4 max-h-[450px] overflow-y-auto pr-1">
                      {filteredAgents.length === 0 ? (
                        <div className="col-span-2 text-center py-16 text-muted-foreground border-2 border-dashed rounded-xl">
                          No agents found matching your search.
                        </div>
                      ) : (
                        filteredAgents.map(agent => {
                          const stats = getAgentStats(agent._id)
                          const isSelected = selectedAgentId === agent._id
                          const isPreviewing = previewAgent?._id === agent._id
                          return (
                            <button
                              key={agent._id}
                              type="button"
                              onClick={() => { setPreviewAgent(agent); setError("") }}
                              className={`text-left w-full rounded-xl border-2 p-5 transition-all duration-200 group hover:shadow-md ${
                                isSelected
                                  ? "border-primary bg-primary/5 shadow-md"
                                  : isPreviewing
                                  ? "border-primary/50 bg-primary/[0.03]"
                                  : "border-border hover:border-primary/30 bg-background"
                              }`}
                            >
                              <div className="flex items-start gap-4">
                                <div className="relative shrink-0">
                                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                                    {agent.firstName.charAt(0)}{agent.lastName.charAt(0)}
                                  </div>
                                  {isSelected && (
                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                                      <CheckCircle2 className="w-3 h-3 text-white" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between mb-0.5">
                                    <h3 className="font-semibold truncate text-base">{agent.firstName} {agent.lastName}</h3>
                                    <span className="flex items-center gap-1 text-sm text-yellow-500 shrink-0 ml-2">
                                      <Star className="w-3.5 h-3.5 fill-current" />
                                      <span className="font-medium text-foreground">{stats.rating}</span>
                                    </span>
                                  </div>
                                  <p className="text-xs text-muted-foreground truncate mb-2">{agent.email}</p>
                                  <div className="flex items-center gap-3 flex-wrap">
                                    <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">
                                      <ShieldCheck className="w-3 h-3" /> Verified
                                    </span>
                                    <span className="text-xs text-muted-foreground">{stats.deals} deals</span>
                                  </div>
                                </div>
                              </div>
                            </button>
                          )
                        })
                      )}
                    </div>
                  </div>

                  {/* RIGHT PANEL: Agent Detail */}
                  {activeAgent && (
                    <div className="lg:col-span-2 space-y-4">
                      <div className="overflow-hidden border border-primary/20 shadow-lg rounded-xl bg-card text-card-foreground">
                        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 border-b relative">
                          <button
                            type="button"
                            onClick={() => setPreviewAgent(null)}
                            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-muted text-muted-foreground transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/40 to-primary/15 flex items-center justify-center text-primary font-bold text-2xl shadow-inner">
                              {activeAgent.firstName.charAt(0)}{activeAgent.lastName.charAt(0)}
                            </div>
                            <div>
                              <h2 className="text-xl font-bold">{activeAgent.firstName} {activeAgent.lastName}</h2>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">
                                  <ShieldCheck className="w-3 h-3" /> Verified
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="p-6 space-y-5">
                          <div className="grid grid-cols-3 gap-3 text-center">
                            <div className="bg-muted/50 rounded-lg p-3">
                              <p className="text-xl font-bold text-primary">{getAgentStats(activeAgent._id).deals}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">Deals</p>
                            </div>
                            <div className="bg-muted/50 rounded-lg p-3">
                              <p className="text-xl font-bold text-primary">{getAgentStats(activeAgent._id).years}+</p>
                              <p className="text-xs text-muted-foreground mt-0.5">Yrs Exp</p>
                            </div>
                            <div className="bg-muted/50 rounded-lg p-3">
                              <p className="text-xl font-bold text-primary">{getAgentStats(activeAgent._id).rating}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">Rating</p>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm">
                              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                                <Mail className="w-4 h-4 text-muted-foreground" />
                              </div>
                              <span className="text-muted-foreground truncate">{activeAgent.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                                <Briefcase className="w-4 h-4 text-muted-foreground" />
                              </div>
                              <span className="text-muted-foreground">{getAgentStats(activeAgent._id).specialty} Specialist</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                                <MapPin className="w-4 h-4 text-muted-foreground" />
                              </div>
                              <span className="text-muted-foreground">{getAgentStats(activeAgent._id).city} Market Expert</span>
                            </div>
                          </div>
                          {selectedAgentId === activeAgent._id ? (
                            <Button
                              type="button"
                              variant="outline"
                              className="w-full"
                              onClick={() => setSelectedAgentId("")}
                            >
                              <X className="w-4 h-4 mr-2" /> Deselect Agent
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              className="w-full"
                              onClick={() => { setSelectedAgentId(activeAgent._id); setPreviewAgent(null) }}
                            >
                              <CheckCircle2 className="w-4 h-4 mr-2" /> Select This Agent
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Commission Note */}
                      {selectedAgentId === activeAgent._id && (
                        <div className="space-y-2 mt-4">
                          <label className="text-sm font-medium">Commission Structure Note (Optional)</label>
                          <Input
                            value={commissionInfo}
                            onChange={(e) => setCommissionInfo(e.target.value)}
                            placeholder="e.g. 5% of final sale price"
                            className="bg-background"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })()}

          {/* STEP PAYMENT */}
          {currentStep === (managementOption === 'agent' ? 6 : 5) && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-center py-10">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <DollarSign className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-3xl font-bold mb-2">Platform Fee</h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-8">
                To list your property and reach thousands of verified buyers, a one-time platform fee of <span className="font-bold text-foreground">₹5,000</span> is required.
              </p>
              
              <div className="bg-muted/30 p-6 rounded-xl border max-w-sm mx-auto space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Listing Fee</span>
                  <span className="font-medium">₹4,237.29</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">GST (18%)</span>
                  <span className="font-medium">₹762.71</span>
                </div>
                <div className="h-px bg-border my-2" />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>₹5,000.00</span>
                </div>
              </div>
            </div>
          )}
          {/* Error Message */}
          {error && (
            <div className="mt-6 text-destructive bg-destructive/10 p-4 rounded-lg font-medium text-sm flex items-center gap-2 animate-in fade-in">
              <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
              {error}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-10 pt-6 border-t flex items-center justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={currentStep === 1 ? () => router.push('/dashboard/owner') : handleBack}
            >
              {currentStep === 1 ? 'Cancel' : (
                <><ChevronLeft className="w-4 h-4 mr-2" /> Back</>
              )}
            </Button>
            
            {currentStep < steps.length ? (
              <Button type="button" onClick={handleNext} className="px-8">
                Next Step <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button type="button" onClick={handlePaymentInitiation} disabled={loading} size="lg" className="px-10 font-semibold shadow-md bg-[#1a1b26] hover:bg-[#1a1b26]/90 text-white">
                {loading ? "Processing..." : "Pay ₹5,000 & Submit"}
              </Button>
            )}
          </div>
          
        </CardContent>
      </Card>
    </div>
  )
}
