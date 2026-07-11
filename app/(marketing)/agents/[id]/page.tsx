"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { MapPin, Mail, Phone, Globe, Link2, MessageCircle, Star, Award, Building2, CheckCircle2, Bed, Bath, Square, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { useAuthStore } from "@/store/authStore"
import api from "@/lib/api"

export default function AgentProfileShowcase() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuthStore()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [agent, setAgent] = useState<any>(null)
  const [properties, setProperties] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [reviewStats, setReviewStats] = useState({ totalReviews: 0, averageRating: 0 })
  const [loading, setLoading] = useState(true)
  
  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    const fetchAgentData = async () => {
      try {
        const [agentRes, propertiesRes, reviewsRes] = await Promise.all([
          api.get(`/users/agents/${id}`),
          api.get(`/properties?agentId=${id}`),
          api.get(`/interactions/reviews/agent/${id}`)
        ])
        setAgent(agentRes.data)
        setProperties(propertiesRes.data.data || [])
        setReviews(reviewsRes.data.reviews || [])
        setReviewStats({
          totalReviews: reviewsRes.data.totalReviews || 0,
          averageRating: reviewsRes.data.averageRating || 0
        })
      } catch (error) {
        console.error("Failed to fetch agent profile", error)
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchAgentData()
  }, [id])

  const submitReview = async () => {
    if (!rating) return
    setSubmittingReview(true)
    try {
      const res = await api.post("/interactions/reviews", { agentId: id, rating, comment })
      setReviews([res.data, ...reviews])
      
      const newTotal = reviewStats.totalReviews + 1
      const newAvg = ((reviewStats.averageRating * reviewStats.totalReviews) + rating) / newTotal
      setReviewStats({ totalReviews: newTotal, averageRating: newAvg })
      
      setShowReviewForm(false)
      setComment("")
      setRating(5)
    } catch (error) {
      console.error("Failed to submit review", error)
    } finally {
      setSubmittingReview(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading profile...</div>
  }

  if (!agent) {
    return <div className="min-h-screen flex items-center justify-center">Agent not found.</div>
  }

  const profile = agent.agentProfile || {}

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Hero Banner */}
      <div className="h-64 md:h-80 w-full bg-gradient-to-r from-gray-900 to-gray-800 relative">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center mix-blend-overlay"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-24 sm:-mt-32 mb-12">
          
          <Button 
            variant="outline" 
            size="sm" 
            className="mb-4 bg-white/90 backdrop-blur hover:bg-white text-gray-800 shadow-sm border-gray-200"
            onClick={() => router.back()}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Go Back
          </Button>

          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-10 flex flex-col md:flex-row gap-8 items-center md:items-start">
            
            {/* Profile Image */}
            <div className="relative w-40 h-40 sm:w-48 sm:h-48 shrink-0">
              <div className="absolute inset-0 bg-white rounded-full p-2 shadow-sm">
                <div className="relative w-full h-full rounded-full overflow-hidden bg-gray-200 border-4 border-white">
                  {agent.profileImage ? (
                    <Image src={agent.profileImage} alt={`${agent.firstName} ${agent.lastName}`} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-400">
                      {agent.firstName?.charAt(0)}{agent.lastName?.charAt(0)}
                    </div>
                  )}
                </div>
              </div>
              <div className="absolute bottom-4 right-4 bg-primary text-primary-foreground p-1.5 rounded-full shadow-lg" title="Verified Professional">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            {/* Main Info */}
            <div className="flex-1 text-center md:text-left mt-2 md:mt-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">{agent.firstName} {agent.lastName}</h1>
                  <div className="flex items-center gap-2 mt-2">
                    <p className="text-lg text-primary font-medium">Senior Real Estate Agent</p>
                    {reviewStats.totalReviews > 0 && (
                      <>
                        <span className="text-gray-300">•</span>
                        <div className="flex items-center text-amber-500 font-bold">
                          <Star className="w-4 h-4 fill-amber-500 mr-1" />
                          {reviewStats.averageRating.toFixed(1)} 
                          <span className="text-gray-500 font-normal text-sm ml-1">({reviewStats.totalReviews} reviews)</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex gap-3 justify-center md:justify-start">
                  {profile.socialLinks?.linkedin && (
                    <a href={profile.socialLinks.linkedin} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-[#0077b5] hover:text-white transition-colors">
                      <Link2 className="w-5 h-5" />
                    </a>
                  )}
                  {profile.socialLinks?.twitter && (
                    <a href={profile.socialLinks.twitter} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-[#1DA1F2] hover:text-white transition-colors">
                      <MessageCircle className="w-5 h-5" />
                    </a>
                  )}
                  {profile.socialLinks?.website && (
                    <a href={profile.socialLinks.website} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-800 hover:text-white transition-colors">
                      <Globe className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 sm:gap-6 text-sm text-gray-600">
                {agent.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{agent.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{agent.email}</span>
                </div>
                {profile.experienceYears && (
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    <span>{profile.experienceYears} Years Experience</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Action Card */}
            <div className="w-full md:w-auto md:shrink-0 mt-6 md:mt-4">
              <Button size="lg" className="w-full text-base h-12 shadow-md">Contact {agent.firstName}</Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Details */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-0 shadow-sm rounded-xl">
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Star className="w-5 h-5 text-primary" /> Specialties
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.specialties?.length ? profile.specialties.map((spec: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="bg-gray-100 text-gray-800 hover:bg-gray-200">{spec}</Badge>
                    )) : (
                      <span className="text-gray-500 text-sm">Luxury Homes, Commercial, Urban Living</span>
                    )}
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100">
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-primary" /> Languages
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.languages?.length ? profile.languages.map((lang: string, idx: number) => (
                      <Badge key={idx} variant="outline" className="border-gray-200 text-gray-700">{lang}</Badge>
                    )) : (
                      <span className="text-gray-500 text-sm">English, Spanish</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm rounded-xl overflow-hidden">
              <div className="h-32 bg-gray-100 relative">
                <div className="absolute inset-0 flex items-center justify-center opacity-10">
                  <Building2 className="w-20 h-20" />
                </div>
              </div>
              <CardContent className="p-6 text-center -mt-10 relative z-10">
                <div className="bg-white rounded-lg shadow-sm p-4 inline-block mb-4">
                  <h4 className="text-2xl font-bold text-gray-900">{properties.length}</h4>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Active Listings</p>
                </div>
                <p className="text-sm text-gray-600">Consistently delivering top-tier properties to clients across the region.</p>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Bio & Listings */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-0 shadow-sm rounded-xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About {agent.firstName}</h2>
                <div className="prose text-gray-600 leading-relaxed max-w-none">
                  {profile.bio ? (
                    <p className="whitespace-pre-wrap">{profile.bio}</p>
                  ) : (
                    <p>
                      {agent.firstName} is a dedicated real estate professional with a passion for helping clients find their perfect home. With a strong background in market analysis and negotiation, {agent.firstName} ensures that every transaction is smooth and successful. 
                      <br/><br/>
                      Known for an exceptional work ethic and a client-first approach, {agent.firstName} has built a reputation for excellence in the real estate community. Whether you are buying your first home, upgrading to a luxury property, or looking for commercial investments, {agent.firstName} provides expert guidance every step of the way.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                Active Listings
                <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-0">{properties.length}</Badge>
              </h2>
              
              {properties.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {properties.map((property) => (
                    <Link href={`/properties/${property._id}`} key={property._id} className="group block bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden">
                      <div className="aspect-[4/3] relative bg-gray-100 overflow-hidden">
                        <Image 
                          src={property.images?.[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80'} 
                          alt={property.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
                          {property.status}
                        </div>
                        <div className="absolute bottom-3 right-3 bg-gray-900/80 backdrop-blur text-white px-3 py-1 rounded-md text-sm font-bold shadow-sm">
                          ${property.price.toLocaleString()}
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-gray-900 mb-1 truncate group-hover:text-primary transition-colors">{property.title}</h3>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {property.location?.city}, {property.location?.state}
                        </p>
                        <div className="flex gap-4 mt-4 text-sm text-gray-600 border-t border-gray-50 pt-4">
                          <span className="flex items-center gap-1.5"><Bed className="w-4 h-4 text-gray-400" /> {property.features?.bedrooms}</span>
                          <span className="flex items-center gap-1.5"><Bath className="w-4 h-4 text-gray-400" /> {property.features?.bathrooms}</span>
                          <span className="flex items-center gap-1.5"><Square className="w-4 h-4 text-gray-400" /> {property.features?.area}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                  <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No active listings</h3>
                  <p className="text-gray-500 mt-1">{agent.firstName} currently has no active properties on the market.</p>
                </div>
              )}
            </div>

            {/* Reviews Section */}
            <div className="pt-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  Client Reviews
                  <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200 border-0">{reviewStats.totalReviews}</Badge>
                </h2>
                {user && (user.role === 'Owner' || user.role === 'Buyer') && (
                  <Button variant="outline" size="sm" onClick={() => setShowReviewForm(!showReviewForm)}>
                    {showReviewForm ? "Cancel Review" : "Write a Review"}
                  </Button>
                )}
              </div>

              {showReviewForm && (
                <Card className="border border-primary/20 bg-primary/5 shadow-sm rounded-xl mb-6">
                  <CardContent className="p-6 space-y-4">
                    <h3 className="font-semibold text-gray-900">Rate your experience with {agent.firstName}</h3>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} onClick={() => setRating(star)} className="focus:outline-none">
                          <Star className={`w-8 h-8 ${rating >= star ? 'fill-amber-500 text-amber-500' : 'text-gray-300 hover:text-amber-300'}`} />
                        </button>
                      ))}
                    </div>
                    <Textarea 
                      placeholder="Share details of your experience..." 
                      className="bg-white"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                    <Button onClick={submitReview} disabled={submittingReview}>
                      {submittingReview ? "Submitting..." : "Submit Review"}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <Card key={review._id} className="border-0 shadow-sm rounded-xl">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500">
                              {review.reviewerId.firstName[0]}{review.reviewerId.lastName[0]}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{review.reviewerId.firstName} {review.reviewerId.lastName}</p>
                              <p className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center text-amber-500">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-amber-500' : 'text-gray-300'}`} />
                            ))}
                          </div>
                        </div>
                        {review.comment && <p className="text-gray-600">{review.comment}</p>}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                  <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No reviews yet</h3>
                  <p className="text-gray-500 mt-1">Be the first to leave a review for {agent.firstName}.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
