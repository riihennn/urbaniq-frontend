"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import api from "@/lib/api"
import { useAuthStore } from "@/store/authStore"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LineChart, Eye, TrendingUp, Users, CalendarCheck, Percent, ShieldAlert } from "lucide-react"

export default function AgentDashboard() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState({ properties: 0, pendingAssignments: 0, inquiries: 0, visits: 0, clients: 0, totalVisits: 0, views: 0, conversion: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [propRes, assignRes, inqRes, visRes] = await Promise.all([
          api.get(`/properties?agentId=${user?._id}`),
          api.get('/assignments'),
          api.get('/interactions/inquiries'),
          api.get('/interactions/visits')
        ])
        
        const pending = assignRes.data.filter((a: any) => a.status === 'Pending').length
        const upcomingVisits = visRes.data.filter((v: any) => new Date(v.date).getTime() > new Date().getTime()).length
        
        // Mock unique clients from inquiries and visits
        const uniqueClients = new Set([
          ...inqRes.data.map((i: any) => i.buyerId._id),
          ...visRes.data.map((v: any) => v.buyerId._id)
        ]).size


        const properties = propRes.data.data ? propRes.data.data : propRes.data || []
        const views = Array.isArray(properties) ? properties.reduce((acc: number, p: any) => acc + (p.views || 0), 0) : 0
        const conversion = views > 0 ? ((inqRes.data.length / views) * 100).toFixed(1) : 0

        setStats({ 
          properties: properties.length,
          pendingAssignments: pending,
          inquiries: inqRes.data.length,
          visits: upcomingVisits,
          clients: uniqueClients,

          totalVisits: visRes.data.length,
          views,
          conversion: Number(conversion)
        })
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }
    
    if (user && user.isVerified) fetchData()
  }, [user])



  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agent Dashboard</h1>
          <p className="text-muted-foreground">Manage your portfolio and client interactions.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Managed Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.properties}</div>
          </CardContent>
        </Card>
        <Card className={`${stats.pendingAssignments > 0 ? 'border-primary shadow-sm' : ''}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.pendingAssignments}</div>
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
            <div className="text-2xl font-bold">{loading ? "..." : stats.visits}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.clients}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Assignment Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-muted-foreground mb-4">You have {stats.pendingAssignments} pending requests.</p>
              <Button asChild variant="outline">
                <Link href="/dashboard/agent/assignments">View Requests</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Schedule</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-muted-foreground mb-4">You have {stats.visits} upcoming viewings.</p>
              <Button asChild variant="outline">
                <Link href="/dashboard/agent/visits">View Schedule</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-muted/20 rounded-xl border border-dashed">
              <div className="flex flex-col items-center justify-center p-4">
                <span className="text-4xl font-bold text-primary mb-2">92%</span>
                <span className="text-sm text-muted-foreground">Inquiry Response Rate</span>
              </div>
              <div className="w-px h-16 bg-border hidden md:block"></div>
              <div className="flex flex-col items-center justify-center p-4">
                <span className="text-4xl font-bold text-primary mb-2">15</span>
                <span className="text-sm text-muted-foreground">Deals Closed</span>
              </div>
              <div className="w-px h-16 bg-border hidden md:block"></div>
              <div className="flex flex-col items-center justify-center p-4">
                <span className="text-4xl font-bold text-green-500 mb-2">4.9</span>
                <span className="text-sm text-muted-foreground">Avg. Client Rating</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold tracking-tight mb-4">Performance Analytics</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card className="bg-gradient-to-br from-primary/10 via-background to-background border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Properties Managed</CardTitle>
              <Eye className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{loading ? "..." : stats.views}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" /> +14% from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inquiries Handled</CardTitle>
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
              <CardTitle className="text-sm font-medium">Visits Completed</CardTitle>
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
    </div>
  )
}
