"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, CheckCircle, Clock, MapPin, Mail, Calendar, Briefcase, IndianRupee, Star, Search, ChevronLeft, ChevronRight, Phone } from "lucide-react"
import api from "@/lib/api"
import { format } from "date-fns"

export default function AgentProfilePage() {
  const { id } = useParams()
  const router = useRouter()
  const [agent, setAgent] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Properties Pagination & Search
  const [properties, setProperties] = useState<any[]>([])
  const [propPage, setPropPage] = useState(1)
  const [propTotalPages, setPropTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [propSearch, setPropSearch] = useState("")

  // Reviews Infinite Scroll
  const [reviews, setReviews] = useState<any[]>([])
  const [reviewPage, setReviewPage] = useState(1)
  const [loadingReviews, setLoadingReviews] = useState(false)
  const [hasMoreReviews, setHasMoreReviews] = useState(true)

  // 1. Fetch Agent Profile
  useEffect(() => {
    const fetchAgent = async () => {
      try {
        const agentRes = await api.get(`/users/agents/${id}`)
        setAgent(agentRes.data)
      } catch (error) {
        console.error("Failed to fetch agent details:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchAgent()
  }, [id])

  // 2. Properties Search Debounce
  useEffect(() => {
    const delay = setTimeout(() => {
      setPropSearch(searchTerm)
      setPropPage(1)
    }, 500)
    return () => clearTimeout(delay)
  }, [searchTerm])

  // 3. Fetch Properties (Pagination + Search)
  useEffect(() => {
    const fetchProps = async () => {
      try {
        const propsRes = await api.get(`/admin/properties?agentId=${id}&limit=5&page=${propPage}&search=${propSearch}`)
        setProperties(propsRes.data.properties || [])
        setPropTotalPages(propsRes.data.meta?.totalPages || 1)
      } catch (error) {
        console.error("Failed to fetch properties:", error)
      }
    }
    if (id) fetchProps()
  }, [id, propPage, propSearch])

  // 4. Real Reviews Infinite Scroll
  useEffect(() => {
    const fetchReviews = async () => {
      if (!id) return
      setLoadingReviews(true)
      try {
        const res = await api.get(`/interactions/reviews/agent/${id}?page=${reviewPage}&limit=5`)
        const fetchedReviews = res.data.reviews || []
        setReviews(prev => {
          const existingIds = new Set(prev.map(r => r._id))
          const newReviews = fetchedReviews.filter((r: any) => !existingIds.has(r._id))
          return [...prev, ...newReviews]
        })
        setHasMoreReviews(reviewPage < (res.data.meta?.totalPages || 1))
      } catch (error) {
        console.error("Failed to fetch reviews:", error)
      } finally {
        setLoadingReviews(false)
      }
    }
    fetchReviews()
  }, [id, reviewPage])

  const observer = useRef<IntersectionObserver | null>(null)
  const lastReviewRef = useCallback((node: any) => {
    if (loadingReviews) return
    if (observer.current) observer.current.disconnect()
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMoreReviews) {
        setReviewPage(prev => prev + 1)
      }
    })
    if (node) observer.current.observe(node)
  }, [loadingReviews, hasMoreReviews])

  const toggleVerification = async () => {
    if (!agent) return
    try {
      await api.put(`/admin/users/${agent._id}`, { isVerified: !agent.isVerified })
      setAgent({ ...agent, isVerified: !agent.isVerified })
    } catch (error) {
      console.error("Failed to update verification status", error)
    }
  }

  const toggleBlock = async () => {
    if (!agent) return
    const newStatus = agent.status === 'Blocked' ? 'Active' : 'Blocked'
    try {
      await api.put(`/admin/users/${agent._id}`, { status: newStatus })
      setAgent({ ...agent, status: newStatus })
    } catch (error) {
      console.error("Failed to update agent status", error)
    }
  }

  const deleteUser = async () => {
    if (!agent) return
    if (window.confirm("Are you sure you want to delete this agent? This action cannot be undone.")) {
      try {
        await api.delete(`/admin/users/${agent._id}`)
        router.push('/dashboard/admin/agents')
      } catch (error) {
        console.error("Failed to delete agent:", error)
        alert("Failed to delete agent.")
      }
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Loading agent profile...</div>
  }

  if (!agent) {
    return <div className="text-center py-12 text-muted-foreground">Agent not found.</div>
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agent Profile</h1>
          <p className="text-muted-foreground">View detailed information and manage this agent's status.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile & Details */}
        <div className="space-y-6 lg:col-span-1">
          {/* Profile Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="h-24 w-24 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-3xl overflow-hidden mb-4 border-4 border-background shadow-sm ring-1 ring-border">
                  {agent.profileImage ? (
                    <img src={agent.profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <>{agent.firstName[0]}{agent.lastName[0]}</>
                  )}
                </div>
                
                <h2 className="text-xl font-bold">{agent.firstName} {agent.lastName}</h2>
                <div className="text-sm text-muted-foreground uppercase font-medium mt-1 mb-4">
                  {agent.agentProfile?.specialties?.[0] || 'GENERAL AGENT'}
                </div>

                <div className="flex flex-wrap gap-2 justify-center mb-6">
                  {agent.isVerified ? (
                    <span className="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-green-200">
                      <CheckCircle className="w-3 h-3" /> Approved
                    </span>
                  ) : (
                    <span className="bg-orange-100 text-orange-700 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-orange-200">
                      <Clock className="w-3 h-3" /> Pending Review
                    </span>
                  )}
                  {agent.status === 'Blocked' && (
                    <span className="bg-red-100 text-red-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-red-200">
                      Blocked
                    </span>
                  )}
                </div>

                <div className="w-full space-y-3 text-sm text-left">
                  <div className="flex items-center gap-3 text-muted-foreground bg-muted/30 p-2 rounded-md">
                    <Mail className="w-4 h-4 text-primary/70" />
                    <span>{agent.email}</span>
                  </div>
                  {agent.phone && (
                    <div className="flex items-center gap-3 text-muted-foreground bg-muted/30 p-2 rounded-md">
                      <Phone className="w-4 h-4 text-primary/70" />
                      <span>{agent.phone}</span>
                    </div>
                  )}
                  {(agent.agentProfile?.location?.address || agent.agentProfile?.location?.city || agent.agentProfile?.location?.state || agent.agentProfile?.location?.country || agent.agentProfile?.location?.operatingAreas?.length > 0) && (
                    <div className="flex flex-col gap-1 text-muted-foreground bg-muted/30 p-3 rounded-md">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-primary/70 shrink-0 mt-0.5" />
                        <span className="text-sm leading-relaxed">
                          {[
                            agent.agentProfile?.location?.address, 
                            agent.agentProfile?.location?.city, 
                            agent.agentProfile?.location?.state, 
                            agent.agentProfile?.location?.country,
                            agent.agentProfile?.location?.zipCode
                          ].filter(Boolean).join(', ') || agent.agentProfile.location?.operatingAreas?.[0]}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-muted-foreground bg-muted/30 p-2 rounded-md">
                    <Calendar className="w-4 h-4 text-primary/70" />
                    <span>Joined {format(new Date(agent.createdAt || Date.now()), 'MMM d, yyyy')}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 w-full gap-4 mt-6 py-4 border-y">
                  <div className="flex flex-col items-center">
                    <span className="font-semibold text-xl">{agent.agentProfile?.experienceYears || 0}</span>
                    <span className="text-xs text-muted-foreground">Years Exp</span>
                  </div>
                  <div className="flex flex-col items-center border-l">
                    <span className="font-semibold text-xl flex items-center gap-1">5.0 <Star className="w-4 h-4 fill-yellow-400 text-yellow-400"/></span>
                    <span className="text-xs text-muted-foreground">Rating</span>
                  </div>
                </div>

                <div className="flex flex-col w-full gap-2 mt-6">
                  {!agent.isVerified && (
                    <Button 
                      onClick={toggleVerification} 
                      variant="default"
                      className="bg-primary text-primary-foreground"
                    >
                      Approve Agent
                    </Button>
                  )}
                  <Button 
                    onClick={toggleBlock} 
                    variant="outline" 
                    className={agent.status === 'Blocked' ? "text-green-600 border-green-200 hover:bg-green-50" : "text-orange-600 border-orange-200 hover:bg-orange-50"}
                  >
                    {agent.status === 'Blocked' ? "Unblock Agent" : "Block Agent"}
                  </Button>
                  <Button 
                    onClick={deleteUser} 
                    variant="outline" 
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    Delete Agent
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Details & ID Proof Card */}
          <Card>
            <CardHeader className="pb-3 border-b mb-3">
              <CardTitle className="text-lg">Professional Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {agent.agentProfile?.bio && (
                <div>
                  <h4 className="text-sm font-medium mb-1 text-muted-foreground">About</h4>
                  <p className="text-sm text-foreground">{agent.agentProfile.bio}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                {agent.agentProfile?.brokerageName && (
                  <div>
                    <h4 className="text-sm font-medium mb-1 text-muted-foreground">Brokerage</h4>
                    <p className="text-sm font-medium text-foreground">{agent.agentProfile.brokerageName}</p>
                  </div>
                )}
                {agent.agentProfile?.licenseNumber && (
                  <div>
                    <h4 className="text-sm font-medium mb-1 text-muted-foreground">License #</h4>
                    <p className="text-sm font-medium text-foreground">{agent.agentProfile.licenseNumber}</p>
                  </div>
                )}
              </div>

              {agent.agentProfile?.languages && agent.agentProfile.languages.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2 text-muted-foreground">Languages</h4>
                  <div className="flex flex-wrap gap-2">
                    {agent.agentProfile.languages.map((l: string, i: number) => (
                      <span key={i} className="px-2.5 py-0.5 bg-muted rounded-md text-xs font-medium">
                        {l}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {agent.agentProfile?.specialties && agent.agentProfile.specialties.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2 text-muted-foreground">Specialties</h4>
                  <div className="flex flex-wrap gap-2">
                    {agent.agentProfile.specialties.map((s: string, i: number) => (
                      <span key={i} className="px-2.5 py-0.5 bg-muted rounded-md text-xs font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-sm font-medium mb-2 text-muted-foreground">ID Proof</h4>
                {agent.agentProfile?.verificationDocument ? (
                  <div className="flex flex-col gap-2">
                    <div className="w-full aspect-[1.6] bg-muted rounded-md overflow-hidden border">
                      <object data={agent.agentProfile.verificationDocument} className="w-full h-full object-cover">
                        <img src={agent.agentProfile.verificationDocument} alt="ID Document" className="w-full h-full object-cover" />
                      </object>
                    </div>
                    <Button variant="outline" size="sm" asChild className="w-full">
                      <a href={agent.agentProfile.verificationDocument} target="_blank" rel="noopener noreferrer">
                        Open Full Size
                      </a>
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-6 text-sm text-muted-foreground bg-muted/30 rounded-md border border-dashed">
                    No ID document uploaded
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Properties & Reviews */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="h-fit flex flex-col max-h-[800px]">
            <CardHeader className="border-b flex flex-col gap-4 pb-4">
              <div className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-primary" />
                    Assigned Properties
                  </CardTitle>
                  <CardDescription>Properties listed or managed by this agent</CardDescription>
                </div>
              </div>
              <div className="relative w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search properties by title or city..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-grow overflow-y-auto">
              {properties.length === 0 ? (
                <div className="text-center py-16 px-4 text-muted-foreground">
                  <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>No properties found matching your search.</p>
                </div>
              ) : (
                <div className="divide-y">
                  {properties.map((p) => (
                    <div key={p._id} className="p-6 hover:bg-muted/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                            p.status === 'Published' ? 'bg-green-100 text-green-700' : 
                            p.status === 'Pending Approval' ? 'bg-orange-100 text-orange-700' : 
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {p.status}
                          </span>
                          <span className="bg-muted text-muted-foreground text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                            {p.propertyType}
                          </span>
                        </div>
                        <h3 className="font-semibold text-lg text-foreground">{p.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5" />
                            {p.location?.city}, {p.location?.state}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {format(new Date(p.createdAt), 'MMM d, yyyy')}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center sm:items-end flex-col gap-2 border-t sm:border-t-0 pt-4 sm:pt-0 mt-2 sm:mt-0">
                        <div className="flex items-center text-primary font-bold text-xl">
                          <IndianRupee className="w-4 h-4 mr-0.5" />
                          {p.price.toLocaleString('en-IN')}
                        </div>
                        <Button variant="outline" size="sm" asChild className="w-full sm:w-auto">
                          <a href={`/dashboard/admin/properties/${p._id}`}>
                            View Property
                          </a>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            {/* Pagination Controls */}
            <div className="flex items-center justify-between p-4 border-t bg-muted/20 mt-auto">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPropPage(p => Math.max(1, p - 1))} 
                disabled={propPage === 1}
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Prev
              </Button>
              <span className="text-sm font-medium text-muted-foreground">Page {propPage} of {Math.max(1, propTotalPages)}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPropPage(p => Math.min(propTotalPages, p + 1))} 
                disabled={propPage >= propTotalPages}
              >
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </Card>

          {/* Reviews Card */}
          <Card>
            <CardHeader className="border-b flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-primary" />
                  Client Reviews
                </CardTitle>
                <CardDescription>What clients are saying about this agent</CardDescription>
              </div>
              <div className="flex items-center gap-1 font-bold text-lg">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                5.0
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[500px] overflow-y-auto divide-y">
                {reviews.map((r, i) => {
                  const isLast = i === reviews.length - 1
                  return (
                    <div 
                      key={r._id} 
                      ref={isLast ? lastReviewRef : null} 
                      className="p-6 flex flex-col gap-2 hover:bg-muted/10 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <div className="font-semibold text-foreground">{r.reviewerId?.firstName} {r.reviewerId?.lastName}</div>
                        <div className="flex gap-0.5">
                          {Array.from({length: 5}).map((_, j) => (
                            <Star key={j} className={`w-3 h-3 ${j < r.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-muted text-muted'}`} />
                          ))}
                        </div>
                      </div>
                      {r.comment && <p className="text-sm text-muted-foreground leading-relaxed">"{r.comment}"</p>}
                      <div className="text-xs text-muted-foreground/70 mt-1">{format(new Date(r.createdAt), 'MMMM d, yyyy')}</div>
                    </div>
                  )
                })}
                {loadingReviews && (
                  <div className="p-6 text-center text-sm font-medium text-muted-foreground animate-pulse">
                    Loading more reviews...
                  </div>
                )}
                {!hasMoreReviews && reviews.length > 0 && (
                  <div className="p-6 text-center text-sm font-medium text-muted-foreground bg-muted/20">
                    You've reached the end of the reviews.
                  </div>
                )}
                {reviews.length === 0 && !loadingReviews && (
                  <div className="text-center py-12 px-4 text-muted-foreground">
                    <Star className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>No reviews have been submitted for this agent yet.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
