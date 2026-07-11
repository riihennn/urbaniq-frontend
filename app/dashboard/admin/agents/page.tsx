"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MapPin, CheckCircle, Clock } from "lucide-react"
import api from "@/lib/api"
import { useAuthStore } from "@/store/authStore"
import Link from "next/link"
import { format } from "date-fns"

export default function AdminAgentsPage() {
  const { user } = useAuthStore()
  const [agents, setAgents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")

  const fetchAgents = async () => {
    try {
      const res = await api.get(`/admin/users?limit=50&search=${searchTerm}&role=Agent`)
      let fetchedAgents = res.data.users
      
      if (statusFilter === "Verified") {
        fetchedAgents = fetchedAgents.filter((a: any) => a.isVerified)
      } else if (statusFilter === "Pending") {
        fetchedAgents = fetchedAgents.filter((a: any) => !a.isVerified)
      }

      setAgents(fetchedAgents)
    } catch (error) {
      console.error("Failed to fetch agents:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAgents()
  }, [searchTerm, statusFilter])

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Worker Management</h1>
        <p className="text-muted-foreground">Manage registered professionals and verify new applicants.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 pb-6 border-b items-start">
          <div className="flex flex-wrap items-center gap-2">
            <Button 
              variant={statusFilter === "All" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("All")}
            >
              Worker Directory
            </Button>
            <Button 
              variant={statusFilter === "Pending" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("Pending")}
              className={statusFilter === "Pending" ? "bg-amber-500 text-white hover:bg-amber-600" : "text-amber-600 border-amber-200 hover:bg-amber-50"}
            >
              Pending Approvals
              {agents.filter(a => !a.isVerified).length > 0 && statusFilter === "All" && (
                <span className="ml-2 bg-amber-200 text-amber-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  Action Needed
                </span>
              )}
            </Button>
          </div>

          <div className="relative w-full max-w-2xl">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name, email, or category..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading agents...</div>
          ) : agents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-md border border-dashed">
              No agents found matching your criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {agents.map((a) => (
                <Card key={a._id} className="overflow-hidden flex flex-col hover:border-primary/50 transition-colors">
                  <CardContent className="p-5 flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                      <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg overflow-hidden">
                        {a.profileImage ? (
                          <img src={a.profileImage} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <>{a.firstName[0]}{a.lastName[0]}</>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {a.isVerified ? (
                          <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 uppercase tracking-wider">
                            <CheckCircle className="w-3 h-3" /> VERIFIED
                          </span>
                        ) : (
                          <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 uppercase tracking-wider">
                            <Clock className="w-3 h-3" /> PENDING
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground uppercase font-medium">
                          {a.agentProfile?.specialties?.[0] || 'GENERAL'}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-base line-clamp-1 text-foreground">{a.firstName} {a.lastName}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-1">{a.email}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 p-3 bg-muted/50 rounded-md border">
                      <div className="flex flex-col items-center border-r">
                        <span className="font-medium text-sm text-foreground">
                          {a.agentProfile?.experienceYears || 0}
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase font-medium">Years Exp</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="font-medium text-sm text-foreground">
                          0
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase font-medium">Jobs</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-2 border-t text-xs text-muted-foreground">
                      <div className="flex items-center gap-1 line-clamp-1">
                        <MapPin className="w-3 h-3 shrink-0" /> 
                        <span className="truncate">
                          {[
                            a.agentProfile?.location?.address,
                            a.agentProfile?.location?.city,
                            a.agentProfile?.location?.state,
                            a.agentProfile?.location?.country,
                            a.agentProfile?.location?.zipCode
                          ].filter(Boolean).join(', ') || (a.agentProfile?.location?.operatingAreas?.length 
                              ? a.agentProfile.location.operatingAreas[0] 
                              : 'Anywhere')}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-green-600 shrink-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-600" /> Online
                      </div>
                    </div>

                    <Button variant="default" className="w-full mt-2" asChild>
                      <Link href={`/dashboard/admin/agents/${a._id}`}>
                        View Details
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
