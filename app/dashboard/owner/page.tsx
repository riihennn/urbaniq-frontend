"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, LineChart, Eye, TrendingUp, Users, CalendarCheck, Percent } from "lucide-react"
import Link from "next/link"
import api from "@/lib/api"
import { useAuthStore } from "@/store/authStore"

interface Property {
  _id: string;
  title: string;
  location: { city: string; state: string };
  price: number;
  status: string;
  views?: number;
}

export default function OwnerDashboard() {
  const { user } = useAuthStore()
  const [properties, setProperties] = useState<Property[]>([])
  const [stats, setStats] = useState({ inquiries: 0, upcomingVisits: 0, totalVisits: 0, conversion: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!user?._id) return
      try {
        const [propRes, inqRes, visRes] = await Promise.all([
          api.get(`/properties?ownerId=${user._id}`),
          api.get('/interactions/inquiries'),
          api.get('/interactions/visits')
        ])
        setProperties(Array.isArray(propRes.data.data) ? propRes.data.data : [])
        
        const upcomingVisitsCount = visRes.data.filter((v: any) => new Date(v.date).getTime() > new Date().getTime()).length
        const views = Array.isArray(propRes.data.data) ? propRes.data.data.reduce((acc: number, p: any) => acc + (p.views || 0), 0) : 0
        const conversion = views > 0 ? ((inqRes.data.length / views) * 100).toFixed(1) : 0
        
        setStats({ inquiries: inqRes.data.length, upcomingVisits: upcomingVisitsCount, totalVisits: visRes.data.length, conversion: Number(conversion) })
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [user])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price)
  }

  const activeCount = properties.filter(p => p.status === 'Available' || p.status === 'Published').length

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Owner Dashboard</h1>
          <p className="text-muted-foreground">Manage your properties and track performance.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/owner/properties/new">
            <Plus className="h-4 w-4 mr-2" /> List New Property
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : properties.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : activeCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : properties.filter(p => p.status === 'Pending Approval').length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inquiries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.inquiries}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Visits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.upcomingVisits}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Property Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : properties.reduce((acc, p) => acc + (p.views || 0), 0)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              <div className="flex items-center">
                <span className="relative flex h-2 w-2 mr-4 flex-shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">New inquiry on Luxury Villa</p>
                  <p className="text-sm text-muted-foreground">Just now</p>
                </div>
              </div>
              <div className="flex items-center">
                <span className="flex h-2 w-2 mr-4 rounded-full bg-muted-foreground flex-shrink-0"></span>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Agent accepted assignment request</p>
                  <p className="text-sm text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center">
                <span className="flex h-2 w-2 mr-4 rounded-full bg-muted-foreground flex-shrink-0"></span>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Downtown Apartment published</p>
                  <p className="text-sm text-muted-foreground">Yesterday</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <div className="relative z-10 mb-4">
            <h3 className="text-xl font-bold text-primary mb-2">Tired of managing everything yourself?</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              We have certified Urbaniq Agents ready to make your life easier. Let a professional handle your property inquiries, scheduling, and negotiations so you can relax.
            </p>
          </div>
          <Button className="w-fit relative z-10 shadow-md" asChild>
            <Link href="/dashboard/owner/properties/new">
              Assign an Agent
            </Link>
          </Button>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold tracking-tight mb-4">Performance Analytics</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card className="bg-gradient-to-br from-primary/10 via-background to-background border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{loading ? "..." : properties.reduce((acc, p) => acc + (p.views || 0), 0)}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" /> +14% from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Inquiries</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{loading ? "..." : stats.inquiries}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" /> +5% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scheduled Visits</CardTitle>
              <CalendarCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{loading ? "..." : stats.totalVisits}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" /> +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{loading ? "..." : `${stats.conversion}%`}</div>
              <p className="text-xs text-muted-foreground mt-1">Views to Inquiries</p>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Views Over Time</CardTitle>
            <CardDescription>Monthly property view metrics</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center bg-muted/10 rounded-md border border-dashed m-6 mt-0 relative overflow-hidden">
             {/* Mock Chart Area */}
             <div className="absolute inset-0 flex items-end justify-between px-8 pt-12 pb-8">
               {[40, 70, 45, 90, 65, 85, 120].map((h, i) => (
                 <div key={i} className="w-12 bg-primary/20 rounded-t-sm hover:bg-primary/40 transition-colors" style={{ height: `${h}%` }}></div>
               ))}
             </div>
             <LineChart className="h-12 w-12 text-muted-foreground/30 absolute" />
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Inquiry Sources</CardTitle>
            <CardDescription>Where your leads are coming from</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center bg-muted/10 rounded-md border border-dashed m-6 mt-0 relative overflow-hidden">
             {/* Mock Chart Area */}
             <div className="w-48 h-48 rounded-full border-[16px] border-primary/20 border-r-primary border-t-primary/60 border-l-primary/40"></div>
             <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-bold">100%</span>
                <span className="text-xs text-muted-foreground">Organic</span>
             </div>
          </CardContent>
        </Card>
      </div>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>My Properties</CardTitle>
        </CardHeader>
        <CardContent>
           <div className="overflow-x-auto">
             <table className="w-full text-sm text-left">
               <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                 <tr>
                   <th className="px-4 py-3 rounded-tl-lg">Property Name</th>
                   <th className="px-4 py-3">Location</th>
                   <th className="px-4 py-3">Price</th>
                   <th className="px-4 py-3">Status</th>
                   <th className="px-4 py-3 rounded-tr-lg">Actions</th>
                 </tr>
               </thead>
               <tbody>
                 {loading ? (
                   <tr>
                     <td colSpan={5} className="text-center py-8 text-muted-foreground">Loading properties...</td>
                   </tr>
                 ) : properties.length === 0 ? (
                   <tr>
                     <td colSpan={5} className="text-center py-8 text-muted-foreground">You have no properties listed yet.</td>
                   </tr>
                 ) : (
                   properties.map(property => (
                     <tr key={property._id} className="border-b last:border-0">
                       <td className="px-4 py-3 font-medium">{property.title}</td>
                       <td className="px-4 py-3 text-muted-foreground">{property.location.city}, {property.location.state}</td>
                       <td className="px-4 py-3 font-medium">{formatPrice(property.price)}</td>
                       <td className="px-4 py-3">
                         <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            property.status === 'Available' || property.status === 'Published' ? 'bg-green-100 text-green-700' : 
                            property.status === 'Pending Approval' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                         }`}>
                           {property.status}
                         </span>
                       </td>
                       <td className="px-4 py-3">
                         <Button variant="ghost" size="sm" asChild>
                           <Link href={`/dashboard/owner/properties/${property._id}`}>Details</Link>
                         </Button>
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
