"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { Building2, LayoutDashboard, Heart, Calendar, MessageSquare, Settings, LogOut, Plus, BarChart, Home, DollarSign } from "lucide-react"
import { useAuthStore } from "@/store/authStore"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated, hydrated, logout } = useAuthStore()

  useEffect(() => {
    // Only redirect after the store has been hydrated from localStorage
    if (hydrated && !isAuthenticated) {
      router.push("/login")
    }
  }, [hydrated, isAuthenticated, router])

  // Show nothing until we've read localStorage — prevents flash redirect
  if (!hydrated) {
    return null
  }

  if (!isAuthenticated) {
    return null
  }

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`
    }
    return "U"
  }

  const getLinkClass = (path: string) => {
    const isActive = pathname === path
    return `flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
      isActive 
        ? "text-primary bg-primary/5 font-medium" 
        : "text-muted-foreground hover:text-primary hover:bg-primary/5 font-medium"
    }`
  }

  return (
    <div className="flex h-screen bg-muted/20 overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-background h-full">
        <div className="flex h-16 items-center px-6 border-b flex-shrink-0">
          <Link href="/" className="flex items-center space-x-2">
            <Building2 className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl tracking-tight">Urbaniq</span>
          </Link>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="grid gap-1 px-4">
            <Link href={`/dashboard/${user?.role?.toLowerCase()}`} className={getLinkClass(`/dashboard/${user?.role?.toLowerCase()}`)}>
              <LayoutDashboard className="h-4 w-4" />
              <span className="text-sm">Dashboard</span>
            </Link>
            
            {user?.role === 'Owner' && (
              <>
                <Link href="/dashboard/owner/properties" className={getLinkClass("/dashboard/owner/properties")}>
                  <Building2 className="h-4 w-4" />
                  <span className="text-sm">My Properties</span>
                </Link>
                <Link href="/dashboard/owner/properties/new" className={getLinkClass("/dashboard/owner/properties/new")}>
                  <Plus className="h-4 w-4" />
                  <span className="text-sm">Add Property</span>
                </Link>
                <Link href="/dashboard/owner/offers" className={getLinkClass("/dashboard/owner/offers")}>
                  <DollarSign className="h-4 w-4" />
                  <span className="text-sm">Offers</span>
                </Link>
                <Link href="/dashboard/owner/inquiries" className={getLinkClass("/dashboard/owner/inquiries")}>
                  <MessageSquare className="h-4 w-4" />
                  <span className="text-sm">Inquiries</span>
                </Link>
                <Link href="/dashboard/owner/visits" className={getLinkClass("/dashboard/owner/visits")}>
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">Visits</span>
                </Link>
                <Link href="/dashboard/owner/analytics" className={getLinkClass("/dashboard/owner/analytics")}>
                  <BarChart className="h-4 w-4" />
                  <span className="text-sm">Analytics</span>
                </Link>
              </>
            )}

            {user?.role === 'Agent' && (
              <>
                <Link href="/dashboard/agent/assignments" className={getLinkClass("/dashboard/agent/assignments")}>
                  <Heart className="h-4 w-4" />
                  <span className="text-sm">Assignments</span>
                </Link>
                <Link href="/dashboard/agent/properties" className={getLinkClass("/dashboard/agent/properties")}>
                  <Building2 className="h-4 w-4" />
                  <span className="text-sm">Assigned Properties</span>
                </Link>
                <Link href="/dashboard/agent/offers" className={getLinkClass("/dashboard/agent/offers")}>
                  <DollarSign className="h-4 w-4" />
                  <span className="text-sm">Offers</span>
                </Link>
                <Link href="/dashboard/agent/inquiries" className={getLinkClass("/dashboard/agent/inquiries")}>
                  <MessageSquare className="h-4 w-4" />
                  <span className="text-sm">Buyer Inquiries</span>
                </Link>
                <Link href="/dashboard/agent/visits" className={getLinkClass("/dashboard/agent/visits")}>
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">Visit Schedule</span>
                </Link>
                <Link href="/dashboard/agent/analytics" className={getLinkClass("/dashboard/agent/analytics")}>
                  <BarChart className="h-4 w-4" />
                  <span className="text-sm">Performance</span>
                </Link>
              </>
            )}

            {user?.role === 'Buyer' && (
              <>
                <Link href="/dashboard/buyer/saved" className={getLinkClass("/dashboard/buyer/saved")}>
                  <Heart className="h-4 w-4" />
                  <span className="text-sm">Saved Properties</span>
                </Link>
                <Link href="/dashboard/buyer/offers" className={getLinkClass("/dashboard/buyer/offers")}>
                  <BarChart className="h-4 w-4" />
                  <span className="text-sm">My Offers</span>
                </Link>
                <Link href="/dashboard/buyer/visits" className={getLinkClass("/dashboard/buyer/visits")}>
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">Scheduled Visits</span>
                </Link>
                <Link href="/dashboard/buyer/inquiries" className={getLinkClass("/dashboard/buyer/inquiries")}>
                  <MessageSquare className="h-4 w-4" />
                  <span className="text-sm">Sent Inquiries</span>
                </Link>
              </>
            )}
          </nav>
        </div>
        
        <div className="border-t p-4 flex-shrink-0">
          <nav className="grid gap-1">
            <Link href="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-primary/5">
              <Home className="h-4 w-4" />
              <span className="text-sm font-medium">Back to Home</span>
            </Link>
            <Link href="#" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-primary/5">
              <Settings className="h-4 w-4" />
              <span className="text-sm font-medium">Settings</span>
            </Link>
            <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-red-500 hover:bg-red-500/10">
              <LogOut className="h-4 w-4" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </nav>
        </div>
      </aside>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b bg-background px-6 flex-shrink-0">
          <div className="font-semibold md:hidden">Urbaniq</div>
          <div className="flex-1" />
          <div className="flex items-center gap-4">
             <div className="h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
               {getInitials()}
             </div>
          </div>
        </header>
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
