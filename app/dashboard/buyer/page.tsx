"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building, MapPin, Search, Calendar, MessageSquare, Heart, BarChart } from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import api from "@/lib/api"

export default function BuyerDashboard() {
  const { user } = useAuthStore()
  const [visits, setVisits] = useState<any[]>([])
  const [inquiries, setInquiries] = useState<any[]>([])
  const [favorites, setFavorites] = useState<any[]>([])

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [visitsRes, inquiriesRes, favsRes] = await Promise.all([
          api.get("/interactions/visits"),
          api.get("/interactions/inquiries"),
          api.get("/users/favorites")
        ])
        setVisits(visitsRes.data || [])
        setInquiries(inquiriesRes.data || [])
        setFavorites(favsRes.data || [])
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.firstName}!</h1>
          <p className="text-muted-foreground mt-1">Find and schedule visits for your dream property.</p>
        </div>
        <Button asChild size="lg">
          <Link href="/properties">
            <Search className="h-4 w-4 mr-2" /> Browse Properties
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled Visits</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : visits.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Upcoming property viewings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sent Inquiries</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : inquiries.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Questions sent to agents/owners</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saved Properties</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : favorites.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Properties you've shortlisted</p>
          </CardContent>
        </Card>

      </div>

      {/* CTA Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-primary p-8 md:p-12 text-primary-foreground flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Ready to find your property?</h2>
          <p className="opacity-80 max-w-lg">Browse thousands of verified listings and schedule a visit in just a few clicks using our interactive calendar.</p>
        </div>
        <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 font-bold shrink-0">
          <Link href="/properties">
            <Search className="h-4 w-4 mr-2" /> View All Properties
          </Link>
        </Button>
      </div>
    </div>
  )
}

