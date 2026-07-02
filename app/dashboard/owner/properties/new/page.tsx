"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import api from "@/lib/api"
import { Building2, MapPin, ListPlus, Users, UserPlus, CheckCircle2, ChevronRight, ChevronLeft, Map as MapIcon, UploadCloud } from "lucide-react"

interface Agent {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

const STEPS = [
  { id: 1, title: 'Basic Info' },
  { id: 2, title: 'Features & Docs' },
  { id: 3, title: 'Location' },
  { id: 4, title: 'Management' }
]

export default function NewPropertyWizard() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Agent Selection State
  const [managementOption, setManagementOption] = useState<"self" | "agent">("self")
  const [agents, setAgents] = useState<Agent[]>([])
  const [selectedAgentId, setSelectedAgentId] = useState("")
  const [commissionInfo, setCommissionInfo] = useState("")

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
    documentUploaded: false,
    imagesUploaded: 0,
  })

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
        if (managementOption === "agent" && !selectedAgentId) return "Please select an agent to assign."
        break
    }
    return null
  }

  const handleNext = () => {
    const err = validateStep()
    if (err) {
      setError(err)
      return
    }
    if (currentStep < STEPS.length) {
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

  const handleSubmit = async () => {
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
        <p className="text-muted-foreground">List a property in 4 easy steps.</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-10 px-4 md:px-10">
        <div className="flex justify-between items-center relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-muted -z-10" />
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-primary transition-all duration-300 -z-10" 
            style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
          />
          
          {STEPS.map((step) => {
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
              <div>
                <h2 className="text-2xl font-semibold mb-2">Property Location</h2>
                <p className="text-muted-foreground mb-8">Where is your property located?</p>
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

                <div className="mt-6 relative h-[300px] rounded-xl overflow-hidden border">
                  <div className="absolute inset-0 bg-blue-100/50 flex items-center justify-center z-10 pointer-events-none">
                     <div className="bg-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium text-primary">
                        <MapIcon className="w-4 h-4" /> Location Map
                     </div>
                  </div>
                  <Image 
                    src="https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80" 
                    alt="Map placeholder"
                    fill
                    className="object-cover opacity-80"
                  />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-500 z-20">
                     <MapPin className="w-12 h-12 fill-red-500/20" />
                  </div>
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

              {managementOption === 'agent' && (
                <div className="space-y-6 pt-6 border-t animate-in fade-in slide-in-from-bottom-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Verified Agent</label>
                    <select 
                      value={selectedAgentId} 
                      onChange={(e) => setSelectedAgentId(e.target.value)}
                      className="flex h-12 w-full rounded-md border border-input bg-background px-4 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="">-- Choose an Agent --</option>
                      {agents.map(agent => (
                        <option key={agent._id} value={agent._id}>
                          {agent.firstName} {agent.lastName} ({agent.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Commission Structure Note (Optional)</label>
                    <Input 
                      value={commissionInfo} 
                      onChange={(e) => setCommissionInfo(e.target.value)} 
                      placeholder="e.g. 5% of final sale price" 
                      className="h-12"
                    />
                    <p className="text-xs text-muted-foreground">This info will be sent to the agent along with your assignment request.</p>
                  </div>
                </div>
              )}
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
            
            {currentStep < 4 ? (
              <Button type="button" onClick={handleNext} className="px-8">
                Next Step <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button type="button" onClick={handleSubmit} disabled={loading} size="lg" className="px-10 font-semibold shadow-md">
                {loading ? "Submitting..." : "Submit Listing"}
              </Button>
            )}
          </div>
          
        </CardContent>
      </Card>
    </div>
  )
}
